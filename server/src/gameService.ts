import { prisma } from './db.js';
import { CombatEngine } from '../../shared/src/combat.js';
import { DungeonManager } from '../../shared/src/dungeon.js';
import { EnemyGenerator } from '../../shared/src/enemyGenerator.js';
import type { GeneratedEnemy } from '../../shared/src/enemyGenerator.js';
import { ItemGenerator } from '../../shared/src/items.js';
import { StatCalculator, BaseClass } from '../../shared/src/stats.js';
import { DescriptionService } from './descriptionService.js';
import { NPCGenerator } from '../../shared/src/party.js';

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
        console.log('[TICK] State loaded: mainCharacter:', state.mainCharacter?.name, 'hp:', state.mainCharacter?.hp, 'party:', state.party?.length);
        console.log('[TICK] State loaded: mainCharacter:', !!state.mainCharacter, 'party:', state.party?.length, 'floor:', state.currentFloor);
        
        let totalFloorsCleared = 0;
        let allRoomResults: any[] = [];
        let partyDefeated = false;
        let participants: any[] = [];
        
        const now = Date.now();
        
        // ALWAYS revive mainCharacter if they have 0 HP and not in active recovery
        if (state.mainCharacter) {
            const mc = state.mainCharacter;
            const isInRecovery = mc.recoveryUntil && mc.recoveryUntil > now;
            if (!isInRecovery && mc.hp <= 0) {
                console.log('[BATTLE] FORCING REVIVE mainCharacter');
                mc.hp = mc.maxHp || 150;
                mc.recoveryUntil = 0;
            }
            // Ensure maxHp
            if (!mc.maxHp || mc.maxHp <= 0) {
                mc.maxHp = 150;
                mc.hp = 150;
            }
        }
        
        // ALWAYS revive party members with 0 HP and not in active recovery
        state.party = state.party.map((p: any) => {
            const isInRecovery = p.recoveryUntil && p.recoveryUntil > now;
            if (!isInRecovery && p.hp <= 0) {
                console.log('[BATTLE] FORCING REVIVE party member:', p.name);
                p.hp = p.maxHp || 150;
                p.recoveryUntil = 0;
            }
            if (!p.maxHp || p.maxHp <= 0) {
                p.maxHp = 150;
                p.hp = 150;
            }
            return p;
        });

        do {
            console.log('[TICK] === STARTING FLOOR LOOP ===');
            console.log('[TICK] Starting tick for floor', state.currentFloor, 'with party:', state.party?.length, 'mainChar hp:', state.mainCharacter?.hp);
            const floorData = DungeonManager.generateFloor(state.currentFloor);
            console.log('[TICK] Generated floor with', floorData.rooms.length, 'rooms');
            
            // Ensure at least one combat room
            if (floorData.rooms.length === 0 || !floorData.rooms.some(r => r.type === 'Encounter' || r.type === 'Boss')) {
                console.log('[TICK] WARNING: No combat rooms, forcing one');
                floorData.rooms.push({
                    id: 'forced_combat',
                    type: 'Encounter',
                    description: 'A forced encounter for testing'
                });
            }
            
            const roomResults: any[] = [];
            
        // Ensure floor is valid
        if (!state.currentFloor || state.currentFloor < 1) {
            state.currentFloor = 1;
        }
        
        const now = Date.now();
            
            // Party members who can fight (not in recovery)
            const healableParty = state.party.filter((p: any) => {
                const isInRecovery = p.recoveryUntil && p.recoveryUntil > now;
                return !isInRecovery && p.hp > 0;
            });
            console.log('[BATTLE] healableParty:', healableParty.map(p => ({ name: p.name, hp: p.hp })));
            
            // Main character
            let mainChar = state.mainCharacter;
            const mainInRecovery = mainChar?.recoveryUntil && mainChar.recoveryUntil > now;
            if (mainChar && !mainInRecovery && mainChar.hp <= 0) {
                mainChar = null;
            }
            console.log('[BATTLE] mainChar:', mainChar ? `${mainChar.name} hp:${mainChar.hp}` : 'null', 'inRecovery:', mainInRecovery);
            
            // EMERGENCY FIX: If no participants, force mainChar to fight
            if (!mainChar && state.mainCharacter) {
                console.log('[BATTLE] EMERGENCY: No mainChar, forcing fight');
                mainChar = { ...state.mainCharacter, hp: state.mainCharacter.maxHp || 150 };
            }
            if (healableParty.length === 0 && state.party.length > 0) {
                console.log('[BATTLE] EMERGENCY: No party fighting, forcing first member');
                const firstPartyMember = { ...state.party[0], hp: state.party[0].maxHp || 150 };
                healableParty.push(firstPartyMember);
            }
            
            participants = [mainChar, ...healableParty].filter(p => p !== null).map(p => {
                const member = { ...p };
                console.log('[BATTLE] Participant:', member.name, 'HP:', member.hp, 'maxHp:', member.maxHp);
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
                console.log('[BATTLE] ULTIMATE FALLBACK: Force mainCharacter to fight');
                participants = [{ ...state.mainCharacter, hp: state.mainCharacter.maxHp || 150, recoveryUntil: 0 }];
            } else if (participants.length === 0) {
                console.log('[BATTLE] No fighters available at all!');
                partyDefeated = true;
                break;
            }

            console.log(`[BATTLE] Floor ${state.currentFloor}: ${participants.length} participants.`);

            for (const room of floorData.rooms) {
                // Handle Gate room - require gold to proceed
                if (room.type === 'Gate') {
                    const gateCost = room.gateRequired || state.currentFloor * 500;
                    if (state.gold >= gateCost) {
                        state.gold -= gateCost;
                        console.log('[GATE] Unlocked for', gateCost, 'gold. Remaining:', state.gold);
                        roomResults.push({
                            roomId: room.id,
                            type: 'Gate',
                            description: `The gate opens! You paid ${gateCost} gold to proceed.`,
                            gateUnlocked: true,
                            enemies: [],
                            loot: [],
                            goldEarned: 0,
                            xpEarned: 0
                        });
                    } else {
                        console.log('[GATE] Not enough gold! Need', gateCost);
                        partyDefeated = true;
                        break;
                    }
                    continue;
                }
                
                // Handle Deep Boss (level 1000 - game end)
                if (room.type === 'DeepBoss') {
                    const hpMultiplier = 1 + (state.currentFloor * 0.03);
                    room.enemies?.forEach((e: any) => {
                        e.hp = Math.floor((e.hp || 50000) * hpMultiplier);
                        e.maxHp = e.hp;
                    });
                }

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
                        // Award affinity to player-companion pairs after combat victory
                        if (state.mainCharacter && state.party.length > 0) {
                            for (const companion of state.party) {
                                state.relationships = NPCGenerator.updateAffinity(
                                    state.relationships || [],
                                    state.mainCharacter.id,
                                    companion.id,
                                    2 // +2 affinity per combat victory
                                );
                            }
                        }

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
            console.log('[TICK] Floor result:', { floorVictory, participantsAlive: participants.filter(p => p.hp > 0).length, floor: state.currentFloor });

            // Check for game win at level 1000
            if (floorVictory && state.currentFloor === 1000) {
                console.log('[GAME] VICTORY! The Deep has been vanquished!');
                state.isGameWon = true;
                roomResults.push({
                    roomId: 'victory',
                    type: 'DeepBoss',
                    description: 'THE DEEP HAS BEEN VANQUISHED! Your lineage shall be remembered for eternity.',
                    combatResult: null,
                    enemies: [],
                    loot: [],
                    goldEarned: 0,
                    xpEarned: 0
                });
            } else if (floorVictory) {
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
        
        // Ensure we always return something
        if (allRoomResults.length === 0) {
            console.log('[TICK] WARNING: No room results, creating emergency room');
            allRoomResults.push({
                roomId: 'emergency',
                type: 'Encounter',
                description: 'Emergency encounter',
                combatResult: null,
                enemies: [],
                loot: [],
                goldEarned: 0,
                xpEarned: 0
            });
        }
        
        return { 
            floorsCleared: totalFloorsCleared, 
            roomResults: allRoomResults, 
            state, 
            defeated: partyDefeated,
            floorData: { rooms: allRoomResults }
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
