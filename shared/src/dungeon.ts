import { BaseClass } from './stats.js';
import { NPCGenerator } from './party.js';
import type { Combatant } from './combat.js';

export const BiomeType = {
    Frozen: 'Frozen Caves',
    Crystalline: 'Crystalline Peaks',
    Fungal: 'Fungal Grotto',
    Volcanic: 'Volcanic Depths'
} as const;
export type BiomeType = (typeof BiomeType)[keyof typeof BiomeType];

export interface DungeonFloor {
    floorNumber: number;
    biome: BiomeType;
    enemies: Combatant[];
    lootMultiplier: number;
    goldMultiplier: number;
}

export class DungeonManager {
    static getBiome(floor: number): BiomeType {
        if (floor <= 10) return BiomeType.Frozen;
        if (floor <= 20) return BiomeType.Crystalline;
        if (floor <= 30) return BiomeType.Fungal;
        return BiomeType.Volcanic;
    }

    static generateFloor(floorNumber: number): DungeonFloor {
        const biome = this.getBiome(floorNumber);
        const enemyCount = floorNumber === 1 ? 1 : 1 + Math.floor(floorNumber / 20) + Math.floor(Math.random() * 2);
        const enemies: Combatant[] = [];

        for (let i = 0; i < Math.min(4, enemyCount); i++) {
            // Early floor enemies are weaker
            const enemyLevel = floorNumber === 1 ? 1 : floorNumber;
            const npc = NPCGenerator.generateNPC(enemyLevel, 0);
            
            if (floorNumber === 1) {
                // Weaken Floor 1 enemies significantly
                npc.stats.strength *= 0.6;
                npc.stats.vitality *= 0.6;
                npc.hp = Math.floor(npc.hp * 0.6);
                npc.maxHp = npc.hp;
            }

            enemies.push({
                ...npc,
                id: `enemy_${floorNumber}_${i}`,
                isEnemy: true
            } as Combatant);
        }

        // Special logic for every 10th floor (Boss)
        if (floorNumber % 10 === 0) {
            const boss = NPCGenerator.generateNPC(floorNumber + 2, 0);
            boss.name = `Floor ${floorNumber} Guardian`;
            enemies.push({
                ...boss,
                id: `boss_${floorNumber}`,
                isEnemy: true
            } as Combatant);
        }

        return {
            floorNumber,
            biome,
            enemies,
            lootMultiplier: 1 + (floorNumber * 0.05),
            goldMultiplier: 1 + (floorNumber * 0.1)
        };
    }
}
