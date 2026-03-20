import type { Combatant } from './combat.js';
export declare const BiomeType: {
    readonly Frozen: "Frozen Caves";
    readonly Crystalline: "Crystalline Peaks";
    readonly Fungal: "Fungal Grotto";
    readonly Volcanic: "Volcanic Depths";
};
export type BiomeType = (typeof BiomeType)[keyof typeof BiomeType];
export interface DungeonRoom {
    id: string;
    type: 'Corridor' | 'Encounter' | 'Cache' | 'Boss' | 'Rest';
    description: string;
    enemies?: Combatant[];
    loot?: any;
}
export interface DungeonFloor {
    floorNumber: number;
    biome: BiomeType;
    rooms: DungeonRoom[];
    lootMultiplier: number;
    goldMultiplier: number;
}
export declare class DungeonManager {
    static getBiome(floor: number): BiomeType;
    private static getRoomDescription;
    static generateFloor(floorNumber: number): DungeonFloor;
}
//# sourceMappingURL=dungeon.d.ts.map