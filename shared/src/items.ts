import type { Stats } from './stats.js';

export const Rarity = {
    Common: "Common",
    Uncommon: "Uncommon",
    Rare: "Rare",
    Epic: "Epic",
    Legendary: "Legendary",
    Corrupted: "Corrupted",
    Abyssal: "Abyssal"
} as const;
export type Rarity = (typeof Rarity)[keyof typeof Rarity];

export const ItemType = {
    Weapon: "Weapon",
    Armor: "Armor",
    Accessory: "Accessory"
} as const;
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

const PREFIXES: { name: string; rarity: Rarity; stats: Partial<Stats>; mutation?: string }[] = [
    { name: 'Burning', rarity: Rarity.Uncommon, stats: { strength: 2, intelligence: 2 } },
    { name: 'Frozen', rarity: Rarity.Uncommon, stats: { vitality: 2, spirit: 2 } },
    { name: 'Swift', rarity: Rarity.Rare, stats: { agility: 5 } },
    { name: 'Wise', rarity: Rarity.Rare, stats: { intelligence: 5 } },
    { name: 'Aetheric', rarity: Rarity.Epic, stats: { luck: 15, spirit: 5 } },
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

const SUFFIXES: { name: string; rarity: Rarity; stats: Partial<Stats>; mutation?: string }[] = [
    { name: 'of Might', rarity: Rarity.Uncommon, stats: { strength: 3 } },
    { name: 'of Shadows', rarity: Rarity.Rare, stats: { agility: 6, luck: 4 } },
    { name: 'of Holy Light', rarity: Rarity.Epic, stats: { spirit: 10, intelligence: 5 } },
    { name: 'of the Void', rarity: Rarity.Corrupted, stats: { strength: 20, agility: 20 }, mutation: '-10% max HP' }
];

export class ItemGenerator {
    static generateItem(level: number, isIndustrial: boolean = false): Item {
        const base = BASE_ITEMS[Math.floor(Math.random() * BASE_ITEMS.length)]!;
        
        // Industrial items have a 25% chance to be forced Corrupted
        const forceCorrupted = isIndustrial && Math.random() < 0.25;

        const hasPrefix = Math.random() > 0.4 || forceCorrupted;
        const hasSuffix = Math.random() > 0.6 || forceCorrupted;
        
        let prefix = hasPrefix ? PREFIXES[Math.floor(Math.random() * PREFIXES.length)] : null;
        let suffix = hasSuffix ? SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)] : null;

        if (forceCorrupted) {
            // Pick at least one corrupted trait if forced
            if (prefix?.rarity !== Rarity.Corrupted && suffix?.rarity !== Rarity.Corrupted) {
                const corruptedPrefixes = PREFIXES.filter(p => p.rarity === Rarity.Corrupted);
                prefix = corruptedPrefixes[Math.floor(Math.random() * corruptedPrefixes.length)] || prefix;
            }
        }

        const nameParts = [];
        if (prefix) nameParts.push(prefix.name);
        nameParts.push(base.name);
        if (suffix) nameParts.push(suffix.name);

        const name = nameParts.join(' ');
        
        let rarity: Rarity = Rarity.Common;
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
            prefix: prefix?.name,
            baseName: base.name,
            suffix: suffix?.name,
            type: base.type,
            rarity,
            stats,
            durability: maxDurability,
            maxDurability,
            isCorrupted: rarity === Rarity.Corrupted,
            isIndustrial,
            mutationCost: prefix?.mutation || suffix?.mutation || undefined,
            level
        };
    }

    static infuseItem(item: Item): { success: boolean, corrupted: boolean, result: Item } {
        const isSuccess = Math.random() < 0.9;
        const result = { ...item, stats: { ...item.stats } }; // Deepish copy stats

        if (isSuccess) {
            result.isInfused = true;
            // Boost all numeric stats by 20%
            Object.keys(result.stats).forEach(key => {
                const k = key as keyof Stats;
                if (result.stats[k] !== undefined) {
                    result.stats[k] = Math.ceil(result.stats[k]! * 1.2);
                }
            });
            return { success: true, corrupted: false, result };
        } else {
            // Failure: Corrupt the item
            result.isCorrupted = true;
            result.rarity = Rarity.Corrupted;
            // Add corruption suffix stats (generalized)
            result.stats.strength = (result.stats.strength || 0) + 20;
            result.stats.intelligence = (result.stats.intelligence || 0) + 20;
            result.mutationCost = '-15% Healing Received';
            return { success: false, corrupted: true, result };
        }
    }

    static getRarityValue(rarity: Rarity): number {
        const values: Record<Rarity, number> = {
            [Rarity.Common]: 0,
            [Rarity.Uncommon]: 1,
            [Rarity.Rare]: 2,
            [Rarity.Epic]: 3,
            [Rarity.Legendary]: 4,
            [Rarity.Corrupted]: 5,
            [Rarity.Abyssal]: 6
        };
        return values[rarity];
    }

    static generateRelic(level: number): Item {
        const item = this.generateItem(level);
        item.rarity = Rarity.Abyssal;
        item.name = `Abyssal ${item.name} of Convergence`; // Unique relic name pattern
        item.isSoulBound = true;
        
        // Relics have 2x stats of Legendary (Legendary is 5x, so Abyssal is effectively 10x base scaling)
        Object.keys(item.stats).forEach(key => {
            const k = key as keyof Stats;
            if (item.stats[k] !== undefined) {
                item.stats[k] = Math.ceil(item.stats[k]! * 2);
            }
        });

        return item;
    }

    static shouldAutoSell(item: Item, threshold: Rarity): boolean {
        return this.getRarityValue(item.rarity) <= this.getRarityValue(threshold);
    }
}
