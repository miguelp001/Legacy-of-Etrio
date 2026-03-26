import { prisma } from './db.js';
import { CombatEngine } from '../../shared/src/combat.js';
import { DungeonManager } from '../../shared/src/dungeon.js';
import { EnemyGenerator } from '../../shared/src/enemyGenerator.js';
import type { GeneratedEnemy } from '../../shared/src/enemyGenerator.js';
import { ItemGenerator } from '../../shared/src/items.js';
import { StatCalculator, BaseClass } from '../../shared/src/stats.js';
import { DescriptionService } from './descriptionService.js';

export class GameService {
    private static handleLevelUp(character: any): { leveled: boolean; newLevel: number; xpGained: number } {
        const result = StatCalculator.calculateLevelFromXP(character.xp || 0);
        const leveled = result.level > character.level;
        
        if (leveled) {
            const oldStats = { ...character.stats };
            const newStats = StatCalculator.calculateStats(result.level, character.baseClass as BaseClass, character.generation || 0, character.subClass);
            
            character.level = result.level;
            character.stats = newStats;
            character.maxHp = StatCalculator.calculateHP(newStats);
            character.hp = character.maxHp;
            character.maxMp = StatCalculator.calculateMP(newStats);
            character.mp = character.maxMp;
            
            console.log(`[LEVEL UP] ${character.name} reached level ${result.level}!`);
        }
        
        return { leveled, newLevel: result.level, xpGained: 0 };
    }

    private static awardXP(character: any, xpAmount: number): { leveled: boolean; newLevel: number } {
        character.xp = (character.xp || 0) + xpAmount;
        const result = this.handleLevelUp(character);
        return { leveled: result.leveled, newLevel: result.newLevel };
    }

    // Validate and process a building upgrade
    static async upgradeBuilding(playerId: string, buildingId: string) {
        const player = await (prisma as any).playerState.findFirst({ where: { id: playerId } });
        if (!player) throw new Error('Player not found');

        const state = JSON.parse(player.state);
        const upgrade = state.guildUpgrades.find((u: any) => u.id === buildingId);
        
        if (!upgrade) throw new Error('Upgrade not found');

        const councilDiscount = 1 - (state.councilMembers.length * 0.05);
        const effectiveCost = Math.floor(upgrade.cost * Math.max(0.5, councilDiscount));

        if (state.gold < effectiveCost) throw new Error('Insufficient gold');

        state.gold -= effectiveCost;
        upgrade.level += 1;
        upgrade.cost = Math.floor(upgrade.cost * 2.5);

        await (prisma as any).playerState.update({
            where: { id: playerId },
            data: { state: JSON.stringify(state), updatedAt: new Date() }
        });

        return state;
    }

    static async processCombatTick(playerId: string, keepDelving: boolean = false) {
        if (!playerId || playerId === 'undefined') {
            console.error('[BATTLE] ABORTED: Invalid playerId:', playerId);
            throw new Error('Valid playerId required');
        }

        console.log(`[BATTLE] Tick requested for player: ${playerId}, keepDelving: ${keepDelving}`);

        let player;
        try {
            player = await (prisma as any).playerState.findUnique({ where: { id: playerId } });
        } catch (err: any) {
            console.error('[BATTLE] Prisma Error:', err.message);
            throw new Error(`Database Error: ${err.message}`);
        }
        
        if (!player) {
            console.log(`[BATTLE] No state for ${playerId}, creating initial...`);
            const initialState = JSON.stringify({
                gold: 5000,
                inventory: [],
                party: [],
                relationships: [],
                guildUpgrades: [
                    { id: 'Tavern', level: 0, cost: 1000, perk: 'Attract +10% higher level NPCs' },
                    { id: 'Hospital', level: 0, cost: 1000, perk: 'Reduce recovery time by 10%' },
                    { id: 'Blacksmith', level: 0, cost: 2000, perk: 'Lower auto-repair costs by 15%' }
                ],
                currentFloor: 1,
                biome: 'Frozen Caves',
                isAutoSellEnabled: false,
                autoSellRarityThreshold: 'Common',
                mainCharacter: null,
                events: [],
                lastLogout: Date.now(),
                bloodRations: 100,
                pollutionLevel: 0,
                isResonatorActive: false,
                councilMembers: [],
                resonatorMastery: 0,
                isGameWon: false
            });
            player = await (prisma as any).playerState.create({
                data: { id: playerId, state: initialState }
            });
        }

        const state = JSON.parse(player.state);
        console.log('[TICK] State loaded: mainCharacter:', !!state.mainCharacter, 'party:', state.party?.length, 'floor:', state.currentFloor);
        
        let totalFloorsCleared = 0;
        let allRoomResults: any[] = [];
        let partyDefeated = false;
        let participants: any[] = [];

        do {
            console.log('[TICK] Starting tick for floor', state.currentFloor, 'with', state.party.length, 'party members');
            const floorData = DungeonManager.generateFloor(state.currentFloor);
            const roomResults: any[] = [];
            
            const now = Date.now();
            const healableParty = state.party.filter((p: any) => {
                if (p.hp <= 0 && p.recoveryUntil && p.recoveryUntil <= now) {
                    p.hp = p.maxHp;
                    p.recoveryUntil = 0;
                }
                if (p.hp <= 0) return false;
                if (p.recoveryUntil && p.recoveryUntil > now) return false;
                if (p.hp < p.maxHp * 0.5) return false;
                return true;
            });
            
            let mainChar = state.mainCharacter;
            if (mainChar) {
                if (mainChar.hp <= 0 && mainChar.recoveryUntil && mainChar.recoveryUntil <= now) {
                    mainChar = { ...mainChar, hp: mainChar.maxHp, recoveryUntil: 0 };
                    state.mainCharacter = mainChar;
                }
                if (mainChar.hp <= 0) {
                    mainChar = null;
                } else if (mainChar.recoveryUntil && mainChar.recoveryUntil > now) {
                    mainChar = null;
                }
            }
            
            participants = [mainChar, ...healableParty].filter(p => p !== null).map(p => {
                const member = { ...p };
                if (member.hp === null || isNaN(member.hp)) {
                    member.hp = Math.max(member.hp || 0, 150);
                    member.maxHp = Math.max(member.maxHp || 0, 150);
                }
                if (member.xp === undefined || member.xp === null) {
                    member.xp = 0;
                }
                return member;
            });

            if (participants.length === 0 && state.mainCharacter) {
                console.log('[BATTLE] No fighters but mainCharacter exists - reviving them');
                participants = [{ ...state.mainCharacter, hp: state.mainCharacter.maxHp, recoveryUntil: 0 }];
            } else if (participants.length === 0) {
                console.log('[BATTLE] No fighters available at all!');
                partyDefeated = true;
                break;
            }

            console.log(`[BATTLE] Floor ${state.currentFloor}: ${participants.length} participants.`);

            for (const room of floorData.rooms) {
                if (room.enemies && room.enemies.length > 0) {
                    const hpMultiplier = 1 + (state.currentFloor * 0.03);
                    room.enemies.forEach((e: any) => {
                        const baseHp = Math.max(e.hp || 100, 30);
                        e.hp = Math.floor(baseHp * hpMultiplier);
                        e.maxHp = Math.floor((e.maxHp || baseHp) * hpMultiplier);
                        if (e.stats) {
                            e.stats.vitality = Math.max(5, 5 + Math.floor(state.currentFloor * 0.2));
                        }
                    });

                    const survivors = participants.filter(p => p.hp > 0);
                    if (survivors.length === 0) {
                        console.log('[BATTLE] All participants died in combat');
                        partyDefeated = true;
                        break;
                    }

                    const combatResult = CombatEngine.simulate(survivors, room.enemies, {
                        biome: state.biome,
                        dreadLevel: state.currentFloor,
                        generator: (ctx) => DescriptionService.generateDescriptor(ctx as any)
                    });
                    console.log('[BATTLE] Combat result:', { 
                        victory: combatResult.victory, 
                        survivingMembers: combatResult.survivingMembers?.length,
                        events: combatResult.events?.length 
                    });

                    let roomLoot: { enemy: any; loot: any }[] = [];
                    let totalGold = 0;
                    let totalXp = 0;
                    if (combatResult.victory) {
                        for (const enemy of room.enemies as GeneratedEnemy[]) {
                            const mc = participants.find(p => p.id === state.mainCharacter?.id);
                            const playerLuck = mc?.stats.luck || 0;
                            const loot = EnemyGenerator.rollLootDrop(enemy, playerLuck);
                            totalGold += loot.gold;
                            totalXp += (enemy as any).xpValue || 25;
                            
                            if (!loot.item) {
                                loot.item = ItemGenerator.generateItem(state.currentFloor);
                            }
                            
                            if (loot.item) {
                                roomLoot.push({ enemy: enemy.name, loot: loot.item });
                            }
                            
                            if (loot.gold > 0) {
                                console.log(`[LOOT] ${enemy.name} dropped: ${loot.gold} gold`);
                            }
                        }
                    }

                    roomResults.push({
                        roomId: room.id,
                        type: room.type,
                        description: room.description,
                        combatResult,
                        enemies: room.enemies.map((e: any) => ({ ...e })),
                        loot: roomLoot,
                        goldEarned: totalGold,
                        xpEarned: totalXp
                    });

                    participants.forEach(p => {
                        const survivor = combatResult.survivingMembers.find(sm => sm.id === p.id);
                        if (survivor) {
                            p.hp = survivor.hp;
                        } else {
                            const deathEvent = combatResult.events.find(ev => ev.defenderName === p.name && ev.remainingHp <= 0);
                            if (deathEvent) {
                                p.hp = 0;
                            }
                        }
                    });

                    if (!combatResult.victory) {
                        break;
                    }

                    const isSolo = participants.length === 1 && mainChar !== null;
                    const soloMultiplier = isSolo ? 1.5 : 1;
                    const xpPerEnemy = Math.floor(totalXp * soloMultiplier);
                    
                    for (const survivor of survivors) {
                        const levelResult = this.awardXP(survivor, xpPerEnemy);
                        if (levelResult.leveled) {
                            console.log(`[XP] ${survivor.name} gained ${xpPerEnemy} XP and leveled up to ${levelResult.newLevel}!`);
                        }
                    }
                    
                    if (state.mainCharacter) {
                        state.gold = (state.gold || 0) + totalGold;
                    }
                } else {
                    roomResults.push({
                        roomId: room.id,
                        type: room.type,
                        description: room.description,
                        combatResult: null,
                        enemies: []
                    });
                }
            }

            const floorVictory = participants.filter(p => p.hp > 0).length > 0;
            console.log('[TICK] Floor result:', { floorVictory, participantsAlive: participants.filter(p => p.hp > 0).length });

            if (floorVictory) {
                state.gold += Math.floor(25 * floorData.goldMultiplier);
                totalFloorsCleared++;
                
                if (state.mainCharacter) {
                    const mc = participants.find(p => p.id === state.mainCharacter.id);
                    if (mc) {
                        state.mainCharacter.hp = mc.hp;
                        state.mainCharacter.xp = mc.xp;
                        state.mainCharacter.level = mc.level;
                        state.mainCharacter.stats = mc.stats;
                        state.mainCharacter.maxHp = mc.maxHp;
                        state.mainCharacter.maxMp = mc.maxMp;
                    }
                }
                state.party = state.party.map((p: any) => {
                    const updated = participants.find((up: any) => up.id === p.id);
                    if (updated) {
                        return { 
                            ...p, 
                            hp: updated.hp, 
                            xp: updated.xp, 
                            level: updated.level,
                            stats: updated.stats,
                            maxHp: updated.maxHp,
                            maxMp: updated.maxMp
                        };
                    }
                    // Keep existing HP for party members not in this combat
                    return p;
                });

                state.currentFloor += 1;
                allRoomResults.push(...roomResults);
            } else {
                const recoveryTime = Date.now() + (5 * 60 * 1000);
                if (state.mainCharacter) {
                    state.mainCharacter.hp = 0;
                    state.mainCharacter.recoveryUntil = recoveryTime;
                }
                state.party = state.party.map((p: any) => ({ 
                    ...p, 
                    hp: 0,
                    recoveryUntil: recoveryTime
                }));
                partyDefeated = true;
            }
        } while (keepDelving && !partyDefeated && participants.filter((p: any) => p.hp > 0).length > 0);

        await (prisma as any).playerState.update({
            where: { id: playerId },
            data: { state: JSON.stringify(state), updatedAt: new Date() }
        });

        console.log('[TICK] Done. Floors cleared:', totalFloorsCleared, 'Defeated:', partyDefeated, 'roomResults:', allRoomResults.length);
        console.log('[TICK] Returning:', { 
            floorsCleared: totalFloorsCleared, 
            roomResultsLength: allRoomResults.length, 
            defeated: partyDefeated,
            currentFloor: state.currentFloor 
        });
        
        return { 
            floorsCleared: totalFloorsCleared, 
            roomResults: allRoomResults, 
            state, 
            defeated: partyDefeated,
            floorData: allRoomResults.length > 0 ? { rooms: allRoomResults } : { rooms: [] }
        };
    }

    static async infuseItem(playerId: string, inventoryIndex: number, cost: number) {
        const player = await (prisma as any).playerState.findFirst({ where: { id: playerId } });
        const state = JSON.parse(player.state);
        const item = state.inventory[inventoryIndex];
        if (!item || state.gold < cost) throw new Error('Invalid item or gold');

        const result = ItemGenerator.infuseItem(item);
        state.inventory[inventoryIndex] = result.result;
        state.gold -= cost;

        await (prisma as any).playerState.update({
            where: { id: playerId },
            data: { state: JSON.stringify(state), updatedAt: new Date() }
        });

        return { result, state };
    }

    static async bindItem(playerId: string, itemId: string, cost: number) {
        const player = await (prisma as any).playerState.findFirst({ where: { id: playerId } });
        const state = JSON.parse(player.state);
        if (state.gold < cost) throw new Error('Insufficient gold');

        let found = false;
        state.inventory = state.inventory.map((i: any) => {
            if (i.id === itemId) { i.isSoulBound = true; found = true; }
            return i;
        });
        if (!found) {
            if (state.mainCharacter?.weapon?.id === itemId) { state.mainCharacter.weapon.isSoulBound = true; found = true; }
            if (state.mainCharacter?.armor?.id === itemId) { state.mainCharacter.armor.isSoulBound = true; found = true; }
            if (state.mainCharacter?.accessory?.id === itemId) { state.mainCharacter.accessory.isSoulBound = true; found = true; }
        }
        if (!found) {
            state.party = state.party.map((m: any) => {
                if (m.weapon?.id === itemId) { m.weapon.isSoulBound = true; found = true; }
                if (m.armor?.id === itemId) { m.armor.isSoulBound = true; found = true; }
                if (m.accessory?.id === itemId) { m.accessory.isSoulBound = true; found = true; }
                return m;
            });
        }

        if (!found) throw new Error('Item not found');
        state.gold -= cost;

        await (prisma as any).playerState.update({
            where: { id: playerId },
            data: { state: JSON.stringify(state), updatedAt: new Date() }
        });
        return state;
    }

    static async donateToGate(playerId: string, amount: number) {
        const player = await (prisma as any).playerState.findFirst({ where: { id: playerId } });
        const state = JSON.parse(player.state);
        if (state.gold < amount) throw new Error('Insufficient gold');
        state.gold -= amount;
        // In a real app we'd also update the gate progress array here
        await (prisma as any).playerState.update({
            where: { id: playerId },
            data: { state: JSON.stringify(state), updatedAt: new Date() }
        });
        return state;
    }

    static async healCharacter(playerId: string, targetId: string, cost: number) {
        const player = await (prisma as any).playerState.findFirst({ where: { id: playerId } });
        const state = JSON.parse(player.state);
        if (state.gold < cost) throw new Error('Insufficient gold');
        state.gold -= cost;
        if (targetId === 'player-mc' && state.mainCharacter) {
            state.mainCharacter.hp = state.mainCharacter.maxHp;
            state.mainCharacter.recoveryUntil = 0;
        }
        else {
            state.party = state.party.map((m: any) => {
                if (m.id === targetId) {
                    return { ...m, hp: m.maxHp, recoveryUntil: 0 };
                }
                return m;
            });
        }
        await (prisma as any).playerState.update({
            where: { id: playerId },
            data: { state: JSON.stringify(state), updatedAt: new Date() }
        });
        return state;
    }
    
    static async healAllCharacters(playerId: string, cost: number) {
        const player = await (prisma as any).playerState.findFirst({ where: { id: playerId } });
        const state = JSON.parse(player.state);
        if (state.gold < cost) throw new Error('Insufficient gold');
        state.gold -= cost;
        
        const now = Date.now();
        
        // Heal main character
        if (state.mainCharacter && state.mainCharacter.hp < state.mainCharacter.maxHp) {
            if (!state.mainCharacter.recoveryUntil || state.mainCharacter.recoveryUntil <= now) {
                state.mainCharacter.hp = state.mainCharacter.maxHp;
                state.mainCharacter.recoveryUntil = 0;
            }
        }
        
        // Heal all party members
        state.party = state.party.map((m: any) => {
            if (m.hp < m.maxHp) {
                if (!m.recoveryUntil || m.recoveryUntil <= now) {
                    return { ...m, hp: m.maxHp, recoveryUntil: 0 };
                }
            }
            return m;
        });
        
        await (prisma as any).playerState.update({
            where: { id: playerId },
            data: { state: JSON.stringify(state), updatedAt: new Date() }
        });
        return state;
    }

    static async processPassiveHealing(playerId: string) {
        const player = await (prisma as any).playerState.findFirst({ where: { id: playerId } });
        const state = JSON.parse(player.state);
        const now = Date.now();
        
        let totalHealed = 0;
        
        // Heal main character
        if (state.mainCharacter) {
            if (state.mainCharacter.hp > 0 && state.mainCharacter.hp < state.mainCharacter.maxHp) {
                const healAmount = Math.floor(state.mainCharacter.maxHp * 0.1); // 10% per rest
                const newHp = Math.min(state.mainCharacter.maxHp, state.mainCharacter.hp + healAmount);
                totalHealed += newHp - state.mainCharacter.hp;
                state.mainCharacter.hp = newHp;
            }
            // Clear recovery if expired
            if (state.mainCharacter.recoveryUntil && state.mainCharacter.recoveryUntil <= now) {
                state.mainCharacter.recoveryUntil = 0;
            }
        }
        
        // Heal party members
        state.party = state.party.map((m: any) => {
            // Clear recovery if expired
            if (m.recoveryUntil && m.recoveryUntil <= now) {
                m.recoveryUntil = 0;
            }
            // Passive healing for wounded
            if (m.hp > 0 && m.hp < m.maxHp) {
                const healAmount = Math.floor(m.maxHp * 0.1);
                const newHp = Math.min(m.maxHp, m.hp + healAmount);
                totalHealed += newHp - m.hp;
                return { ...m, hp: newHp };
            }
            return m;
        });
        
        if (totalHealed > 0) {
            console.log(`[HEAL] Restored ${totalHealed} HP total`);
        }
        
        await (prisma as any).playerState.update({
            where: { id: playerId },
            data: { state: JSON.stringify(state), updatedAt: new Date() }
        });
        
        return { state, healed: totalHealed };
    }

    static async ascendCharacter(playerId: string, memberId: string) {
        const player = await (prisma as any).playerState.findFirst({ where: { id: playerId } });
        const state = JSON.parse(player.state);
        let member = state.mainCharacter?.id === memberId ? state.mainCharacter : state.party.find((m: any) => m.id === memberId);
        if (!member || member.level < 20) throw new Error('Requirements not met');
        member.isAscended = true;
        state.councilMembers.push(member);
        if (state.mainCharacter?.id === memberId) state.mainCharacter = null;
        else state.party = state.party.filter((m: any) => m.id !== memberId);
        await (prisma as any).playerState.update({
            where: { id: playerId },
            data: { state: JSON.stringify(state), updatedAt: new Date() }
        });
        return state;
    }

    static async buyRations(playerId: string, amount: number, cost: number) {
        const player = await (prisma as any).playerState.findFirst({ where: { id: playerId } });
        const state = JSON.parse(player.state);
        if (state.gold < cost) throw new Error('Insufficient gold');
        state.gold -= cost;
        state.bloodRations = (state.bloodRations || 0) + amount;
        await (prisma as any).playerState.update({
            where: { id: playerId },
            data: { state: JSON.stringify(state), updatedAt: new Date() }
        });
        return state;
    }
}
