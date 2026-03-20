import { prisma } from './db.js';
import { CombatEngine } from '../../shared/src/combat.js';
import { DungeonManager } from '../../shared/src/dungeon.js';
import { ItemGenerator } from '../../shared/src/items.js';

export class GameService {
    // Validate and process a building upgrade
    static async upgradeBuilding(playerId: string, buildingId: string) {
        const player = await (prisma as any).playerState.findUnique({ where: { id: playerId } });
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
        const player = await (prisma as any).playerState.findUnique({ where: { id: playerId } });
        if (!player) throw new Error('Player not found');

        const state = JSON.parse(player.state);
        const { party, currentFloor } = state;

        const floorData = DungeonManager.generateFloor(currentFloor);
        const enemies = floorData.enemies.map(e => ({ ...e, isEnemy: true }));
        
        const result = CombatEngine.simulate(party, enemies);
        
        if (result.victory) {
            state.gold += Math.floor(10 * floorData.goldMultiplier);
            state.currentFloor += 1;

            if (state.party.length >= 2) {
                if (!state.relationships) state.relationships = [];
                for (let i = 0; i < state.party.length; i++) {
                    for (let j = i + 1; j < state.party.length; j++) {
                        const p1 = state.party[i].id;
                        const p2 = state.party[j].id;
                        let rel = state.relationships.find((r: any) => 
                            (r.member1Id === p1 && r.member2Id === p2) || (r.member1Id === p2 && r.member2Id === p1)
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
            // Safety: Auto-heal low-level players to prevent softlocks
            if (state.currentFloor <= 5) {
                console.log('Low floor loss: Auto-healing party to 50%');
                state.party = state.party.map((p: any) => ({
                    ...p,
                    hp: Math.max(p.hp, Math.floor(p.maxHp * 0.5))
                }));
                if (state.mainCharacter) {
                    state.mainCharacter.hp = Math.max(state.mainCharacter.hp, Math.floor(state.mainCharacter.maxHp * 0.5));
                }
            }
        }

        await (prisma as any).playerState.update({
            where: { id: playerId },
            data: { state: JSON.stringify(state), updatedAt: new Date() }
        });

        return { result, state };
    }

    static async infuseItem(playerId: string, inventoryIndex: number, cost: number) {
        const player = await (prisma as any).playerState.findUnique({ where: { id: playerId } });
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
        const player = await (prisma as any).playerState.findUnique({ where: { id: playerId } });
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
        const player = await (prisma as any).playerState.findUnique({ where: { id: playerId } });
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
        const player = await (prisma as any).playerState.findUnique({ where: { id: playerId } });
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
        const player = await (prisma as any).playerState.findUnique({ where: { id: playerId } });
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
        const player = await (prisma as any).playerState.findUnique({ where: { id: playerId } });
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
