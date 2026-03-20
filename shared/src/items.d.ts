import type { Stats } from './stats.js';
export declare const Rarity: {
    readonly Common: "Common";
    readonly Uncommon: "Uncommon";
    readonly Rare: "Rare";
    readonly Epic: "Epic";
    readonly Legendary: "Legendary";
    readonly Corrupted: "Corrupted";
    readonly Abyssal: "Abyssal";
};
export type Rarity = (typeof Rarity)[keyof typeof Rarity];
export declare const ItemType: {
    readonly Weapon: "Weapon";
    readonly Armor: "Armor";
    readonly Accessory: "Accessory";
};
export type ItemType = (typeof ItemType)[keyof typeof ItemType];
export interface Item {
    id: string;
    name: string;
    prefix?: string | undefined;
    baseName: string;
    suffix?: string | undefined;
    type: ItemType;
    rarity: Rarity;
    stats: Partial<Stats>;
    durability: number;
    maxDurability: number;
    isCorrupted?: boolean;
    isIndustrial?: boolean;
    isInfused?: boolean;
    isSoulBound?: boolean;
    mutationCost?: string | undefined;
    level: number;
}
export declare class ItemGenerator {
    static generateItem(level: number, isIndustrial?: boolean): Item;
    static infuseItem(item: Item): {
        success: boolean;
        corrupted: boolean;
        result: Item;
    };
    static getRarityValue(rarity: Rarity): number;
    static generateRelic(level: number): Item;
    static shouldAutoSell(item: Item, threshold: Rarity): boolean;
}
//# sourceMappingURL=items.d.ts.map