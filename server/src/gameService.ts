import { prisma } from './db.js';
import { CombatEngine } from '../../shared/src/combat.js';
import { DungeonManager } from '../../shared/src/dungeon.js';
import { ItemGenerator } from '../../shared/src/items.js';

export class GameService {
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

    static async processCombatTick(playerId: string) {
        if (!playerId || playerId === 'undefined') {
            console.error('[BATTLE] ABORTED: Invalid playerId:', playerId);
            throw new Error('Valid playerId required');
        }

        console.log(`[BATTLE] Tick requested for player: ${playerId}`);

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
        const floorData = DungeonManager.generateFloor(state.currentFloor);
        const roomResults: any[] = [];
        
        // Ensure participants are clean and have enough HP to survive simple hits
        let participants = [state.mainCharacter, ...state.party].filter(p => p !== null).map(p => {
            const member = { ...p };
            if (member.hp === null || isNaN(member.hp) || member.hp <= 5) {
                console.warn(`[BATTLE] HP FIXED: Player ${member.name} had ${member.hp} HP. Resetting to 150.`);
                member.hp = Math.max(member.hp || 0, 150);
                member.maxHp = Math.max(member.maxHp || 0, 150);
            }
            return member;
        });
        let floorVictory = true;

        console.log(`[BATTLE] Floor ${state.currentFloor}: ${participants.length} participants.`);

        for (const room of floorData.rooms) {
            if (room.enemies && room.enemies.length > 0) {
                // Defensive HP check for generated enemies - MAKE THEM TOUGHER
                room.enemies.forEach((e: any, i: number) => {
                    const hpFloor = 250 + Math.floor(Math.random() * 100);
                    if (!e.hp || e.hp < 50) {
                        console.log(`[BATTLE] BUFFING: Enemy ${e.name} HP from ${e.hp} to ${hpFloor}`);
                        e.hp = Math.max(e.hp || 0, hpFloor);
                        e.maxHp = Math.max(e.maxHp || 0, hpFloor);
                        // Also buff defense to avoid 1-turn battles
                        if (!e.stats) e.stats = { vitality: 20 };
                        e.stats.vitality = Math.max(e.stats.vitality || 0, 25);
                    }
                });

                // Only active survivors fight
                const survivors = participants.filter(p => p.hp > 0);
                console.log(`[BATTLE] Room ${room.id} (${room.type}): ${room.enemies.length} enemies vs ${survivors.length} survivors.`);
                
                if (survivors.length === 0) {
                    console.log(`[BATTLE] No survivors! Ending floor.`);
                    floorVictory = false;
                    break;
                }

                const combatResult = CombatEngine.simulate(survivors, room.enemies);
                console.log(`[BATTLE] Sim Done: Victory=${combatResult.victory}, Events=${combatResult.events.length}`);

                roomResults.push({
                    roomId: room.id,
                    type: room.type,
                    description: room.description,
                    combatResult,
                    enemies: room.enemies.map((e: any) => ({ ...e }))
                });

                // Update participants with new HPs
                participants.forEach(p => {
                    const survivor = combatResult.survivingMembers.find(sm => sm.id === p.id);
                    if (survivor) {
                        p.hp = survivor.hp;
                    } else {
                        // Check events to see if they specifically died
                        const deathEvent = combatResult.events.find(ev => ev.defenderName === p.name && ev.remainingHp <= 0);
                        if (deathEvent) {
                            p.hp = 0;
                        }
                    }
                });

                if (!combatResult.victory) {
                    floorVictory = false;
                    break;
                }
            } else {
                // Non-combat room
                roomResults.push({
                    roomId: room.id,
                    type: room.type,
                    description: room.description,
                    combatResult: null,
                    enemies: []
                });
            }
        }

        // Update state with final HP/Survival
        if (floorVictory) {
            state.gold += Math.floor(25 * floorData.goldMultiplier);
            state.currentFloor += 1;
            
            // Sync survival back to state
            if (state.mainCharacter) {
                const mc = participants.find(p => p.id === state.mainCharacter.id);
                if (mc) state.mainCharacter.hp = mc.hp;
            }
            state.party = state.party.map((p: any) => {
                const updated = participants.find((up: any) => up.id === p.id);
                return updated ? { ...p, hp: updated.hp } : { ...p, hp: 0 };
            });

            // Relationships
            if (state.party.length >= 2) {
                if (!state.relationships) state.relationships = [];
                for (let i = 0; i < state.party.length; i++) {
                    for (let j = i + 1; j < state.party.length; j++) {
                        const p1 = state.party[i].id;
                        const p2 = state.party[j].id;
                        let rel = state.relationships.find((r: any) => 
                            (r.memberIds.includes(p1) && r.memberIds.includes(p2))
                        );
                        if (!rel) {
                            rel = { memberIds: [p1, p2].sort(), affinity: 0, stage: 'Stranger' };
                            state.relationships.push(rel);
                        }
                        rel.affinity += 5;
                    }
                }
            }
        } else {
            // Defeated!
            if (state.mainCharacter) state.mainCharacter.hp = 0;
            state.party = state.party.map((p: any) => ({ ...p, hp: 0 }));

            // Safety: Auto-heal low-level players
            if (state.currentFloor <= 5) {
                if (state.mainCharacter) state.mainCharacter.hp = Math.floor(state.mainCharacter.maxHp * 0.5);
                state.party = state.party.map((p: any) => ({ ...p, hp: Math.floor(p.maxHp * 0.5) }));
            }
        }

        await (prisma as any).playerState.update({
            where: { id: playerId },
            data: { state: JSON.stringify(state), updatedAt: new Date() }
        });

        return { floorData, roomResults, state, victory: floorVictory };
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
        if (targetId === 'player-mc' && state.mainCharacter) state.mainCharacter.hp = state.mainCharacter.maxHp;
        else state.party = state.party.map((m: any) => m.id === targetId ? { ...m, hp: m.maxHp } : m);
        await (prisma as any).playerState.update({
            where: { id: playerId },
            data: { state: JSON.stringify(state), updatedAt: new Date() }
        });
        return state;
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
