import type { Combatant } from './combat.js';
export declare enum BiomeType {
    Frozen = "Frozen Caves",
    Crystalline = "Crystalline Peaks",
    Fungal = "Fungal Grotto",
    Volcanic = "Volcanic Depths"
}
export interface DungeonFloor {
    floorNumber: number;
    biome: BiomeType;
    enemies: Combatant[];
    lootMultiplier: number;
    goldMultiplier: number;
}
export declare class DungeonManager {
    static getBiome(floor: number): BiomeType;
    static generateFloor(floorNumber: number): DungeonFloor;
}
//# sourceMappingURL=dungeon.d.ts.map