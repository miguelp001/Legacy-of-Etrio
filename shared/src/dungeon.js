import { BaseClass } from './stats.js';
import { NPCGenerator } from './party.js';
export var BiomeType;
(function (BiomeType) {
    BiomeType["Frozen"] = "Frozen Caves";
    BiomeType["Crystalline"] = "Crystalline Peaks";
    BiomeType["Fungal"] = "Fungal Grotto";
    BiomeType["Volcanic"] = "Volcanic Depths";
})(BiomeType || (BiomeType = {}));
export class DungeonManager {
    static getBiome(floor) {
        if (floor <= 10)
            return BiomeType.Frozen;
        if (floor <= 20)
            return BiomeType.Crystalline;
        if (floor <= 30)
            return BiomeType.Fungal;
        return BiomeType.Volcanic;
    }
    static generateFloor(floorNumber) {
        const biome = this.getBiome(floorNumber);
        const enemyCount = 1 + Math.floor(floorNumber / 20) + Math.floor(Math.random() * 2);
        const enemies = [];
        for (let i = 0; i < Math.min(4, enemyCount); i++) {
            const npc = NPCGenerator.generateNPC(floorNumber, 0);
            enemies.push({
                ...npc,
                id: `enemy_${floorNumber}_${i}`,
                isEnemy: true
            });
        }
        // Special logic for every 10th floor (Boss)
        if (floorNumber % 10 === 0) {
            const boss = NPCGenerator.generateNPC(floorNumber + 2, 0);
            boss.name = `Floor ${floorNumber} Guardian`;
            enemies.push({
                ...boss,
                id: `boss_${floorNumber}`,
                isEnemy: true
            });
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
//# sourceMappingURL=dungeon.js.map