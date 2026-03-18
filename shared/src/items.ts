import type { Stats } from './stats.js';

export enum Rarity {
    Common = "Common",
    Uncommon = "Uncommon",
    Rare = "Rare",
    Epic = "Epic",
    Legendary = "Legendary",
    Corrupted = "Corrupted"
}

export enum ItemType {
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

const PREFIXES = [
    { name: 'Burning', rarity: Rarity.Uncommon, stats: { strength: 2, intelligence: 2 } },
    { name: 'Frozen', rarity: Rarity.Uncommon, stats: { vitality: 2, spirit: 2 } },
    { name: 'Swift', rarity: Rarity.Rare, stats: { agility: 5 } },
    { name: 'Wise', rarity: Rarity.Rare, stats: { intelligence: 5 } },
    { name: 'Godly', rarity: Rarity.Legendary, stats: { strength: 10, agility: 10, intelligence: 10, vitality: 10, spirit: 10, luck: 10 } },
    { name: 'Corrupted', rarity: Rarity.Corrupted, stats: { strength: 25, intelligence: 25 }, mutation: '-20% healing received' }
];

const BASE_ITEMS = [
    { name: 'Sword', type: ItemType.Weapon, stats: { strength: 5 } },
    { name: 'Staff', type: ItemType.Weapon, stats: { intelligence: 5 } },
    { name: 'Dagger', type: ItemType.Weapon, stats: { agility: 5 } },
    { name: 'Plate Mail', type: ItemType.Armor, stats: { vitality: 8 } },
    { name: 'Robe', type: ItemType.Armor, stats: { spirit: 8 } },
    { name: 'Leather Vest', type: ItemType.Armor, stats: { agility: 4, vitality: 4 } }
];

const SUFFIXES = [
    { name: 'of Might', rarity: Rarity.Uncommon, stats: { strength: 3 } },
    { name: 'of Shadows', rarity: Rarity.Rare, stats: { agility: 6, luck: 4 } },
    { name: 'of Holy Light', rarity: Rarity.Epic, stats: { spirit: 10, intelligence: 5 } },
    { name: 'of the Void', rarity: Rarity.Corrupted, stats: { strength: 20, agility: 20 }, mutation: '-10% max HP' }
];

export class ItemGenerator {
    static generateItem(level: number): Item {
        const base = BASE_ITEMS[Math.floor(Math.random() * BASE_ITEMS.length)]!;
        
        const hasPrefix = Math.random() > 0.4;
        const hasSuffix = Math.random() > 0.6;
        
        const prefix = hasPrefix ? PREFIXES[Math.floor(Math.random() * PREFIXES.length)] : null;
        const suffix = hasSuffix ? SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)] : null;

        const nameParts = [];
        if (prefix) nameParts.push(prefix.name);
        nameParts.push(base.name);
        if (suffix) nameParts.push(suffix.name);

        const name = nameParts.join(' ');
        
        let rarity = Rarity.Common;
        if (prefix && suffix) rarity = Rarity.Rare;
        if (prefix?.rarity === Rarity.Legendary || suffix?.rarity === Rarity.Legendary) rarity = Rarity.Legendary;
        if (prefix?.rarity === Rarity.Corrupted || suffix?.rarity === Rarity.Corrupted) rarity = Rarity.Corrupted;

        const stats: Partial<Stats> = { ...base.stats };
        if (prefix) {
            for (const [key, value] of Object.entries(prefix.stats)) {
                const k = key as keyof Stats;
                stats[k] = (stats[k] || 0) + (value as number * (1 + level * 0.1));
            }
        }
        if (suffix) {
            for (const [key, value] of Object.entries(suffix.stats)) {
                const k = key as keyof Stats;
                stats[k] = (stats[k] || 0) + (value as number * (1 + level * 0.1));
            }
        }

        const maxDurability = 50 + Math.floor(Math.random() * 50) + (level * 2);
        
        return {
            id: Math.random().toString(36).substring(2, 11),
            name,
            type: base.type,
            rarity,
            stats,
            durability: maxDurability,
            maxDurability,
            mutationCost: prefix?.mutation || suffix?.mutation || undefined,
            level
        };
    }

    static getRarityValue(rarity: Rarity): number {
        const values: Record<Rarity, number> = {
            [Rarity.Common]: 0,
            [Rarity.Uncommon]: 1,
            [Rarity.Rare]: 2,
            [Rarity.Epic]: 3,
            [Rarity.Legendary]: 4,
            [Rarity.Corrupted]: 5
        };
        return values[rarity];
    }

    static shouldAutoSell(item: Item, threshold: Rarity): boolean {
        return this.getRarityValue(item.rarity) <= this.getRarityValue(threshold);
    }
}
