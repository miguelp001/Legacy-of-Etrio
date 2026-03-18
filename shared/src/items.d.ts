import type { Stats } from './stats.js';
export declare enum Rarity {
    Common = "Common",
    Uncommon = "Uncommon",
    Rare = "Rare",
    Epic = "Epic",
    Legendary = "Legendary",
    Corrupted = "Corrupted"
}
export declare enum ItemType {
    Weapon = "Weapon",
    Armor = "Armor",
    Accessory = "Accessory"
}
export interface Item {
    id: string;
    name: string;
    type: ItemType;
    rarity: Rarity;
    stats: Partial<Stats>;
    durability: number;
    maxDurability: number;
    mutationCost?: string | undefined;
    level: number;
}
export declare class ItemGenerator {
    static generateItem(level: number): Item;
    static getRarityValue(rarity: Rarity): number;
    static shouldAutoSell(item: Item, threshold: Rarity): boolean;
}
//# sourceMappingURL=items.d.ts.map