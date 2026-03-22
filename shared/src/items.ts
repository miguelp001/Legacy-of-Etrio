import type { Stats } from './stats';

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

interface WeaponTemplate {
    name: string;
    baseStr: number;
    baseInt: number;
    baseAgi: number;
    baseVit: number;
    baseSpi: number;
    baseLuk: number;
}

interface ArmorTemplate {
    name: string;
    baseVit: number;
    baseSpi: number;
    baseAgi: number;
    baseStr: number;
}

interface AccessoryTemplate {
    name: string;
    primaryStat: keyof Stats;
    secondaryStat?: keyof Stats;
}

const WEAPONS: WeaponTemplate[] = [
    { name: 'Longsword', baseStr: 8, baseInt: 0, baseAgi: 2, baseVit: 0, baseSpi: 0, baseLuk: 0 },
    { name: 'Battleaxe', baseStr: 10, baseInt: 0, baseAgi: 0, baseVit: 2, baseSpi: 0, baseLuk: 0 },
    { name: 'Spear', baseStr: 6, baseInt: 0, baseAgi: 4, baseVit: 0, baseSpi: 0, baseLuk: 0 },
    { name: 'Dagger', baseStr: 4, baseInt: 0, baseAgi: 8, baseVit: 0, baseSpi: 0, baseLuk: 2 },
    { name: 'Warhammer', baseStr: 12, baseInt: 0, baseAgi: 0, baseVit: 4, baseSpi: 0, baseLuk: 0 },
    { name: 'Fist Wraps', baseStr: 6, baseInt: 0, baseAgi: 6, baseVit: 2, baseSpi: 0, baseLuk: 0 },
    { name: 'War Claws', baseStr: 7, baseInt: 0, baseAgi: 7, baseVit: 0, baseSpi: 0, baseLuk: 0 },
    { name: 'Arcane Staff', baseStr: 0, baseInt: 10, baseAgi: 0, baseVit: 0, baseSpi: 4, baseLuk: 0 },
    { name: 'Crystal Wand', baseStr: 0, baseInt: 8, baseAgi: 2, baseVit: 0, baseSpi: 4, baseLuk: 0 },
    { name: 'Totem', baseStr: 0, baseInt: 6, baseAgi: 0, baseVit: 4, baseSpi: 4, baseLuk: 0 },
    { name: 'Greataxe', baseStr: 14, baseInt: 0, baseAgi: 0, baseVit: 3, baseSpi: 0, baseLuk: 0 },
    { name: 'Katana', baseStr: 7, baseInt: 0, baseAgi: 5, baseVit: 0, baseSpi: 0, baseLuk: 2 },
    { name: 'Quarterstaff', baseStr: 4, baseInt: 6, baseAgi: 2, baseVit: 2, baseSpi: 2, baseLuk: 0 },
    { name: 'Kris', baseStr: 3, baseInt: 0, baseAgi: 10, baseVit: 0, baseSpi: 0, baseLuk: 3 },
    { name: 'Flail', baseStr: 9, baseInt: 0, baseAgi: 0, baseVit: 3, baseSpi: 0, baseLuk: 0 },
];

const ARMORS: ArmorTemplate[] = [
    { name: 'Plate Armor', baseVit: 10, baseSpi: 0, baseAgi: 0, baseStr: 2 },
    { name: 'Chainmail', baseVit: 7, baseSpi: 0, baseAgi: 3, baseStr: 0 },
    { name: 'Leather Armor', baseVit: 4, baseSpi: 0, baseAgi: 6, baseStr: 0 },
    { name: 'Mage Robes', baseVit: 2, baseSpi: 8, baseAgi: 2, baseStr: 0 },
    { name: 'Battle Vestments', baseVit: 6, baseSpi: 4, baseAgi: 0, baseStr: 2 },
    { name: 'Assassin Garb', baseVit: 2, baseSpi: 0, baseAgi: 10, baseStr: 0 },
    { name: 'Shamanic Wraps', baseVit: 4, baseSpi: 6, baseAgi: 2, baseStr: 0 },
    { name: 'Crusader Plate', baseVit: 12, baseSpi: 3, baseAgi: 0, baseStr: 3 },
    { name: 'Shadow Cloak', baseVit: 3, baseSpi: 2, baseAgi: 8, baseStr: 0 },
    { name: 'Ritual Vestments', baseVit: 5, baseSpi: 7, baseAgi: 0, baseStr: 0 },
];

const ACCESSORIES: AccessoryTemplate[] = [
    { name: 'Strength Ring', primaryStat: 'strength', secondaryStat: 'vitality' },
    { name: 'Agility Ring', primaryStat: 'agility', secondaryStat: 'luck' },
    { name: 'Intelligence Amulet', primaryStat: 'intelligence', secondaryStat: 'spirit' },
    { name: 'Spirit Pendant', primaryStat: 'spirit', secondaryStat: 'intelligence' },
    { name: 'Warrior Belt', primaryStat: 'strength', secondaryStat: 'vitality' },
    { name: 'Swift Boots', primaryStat: 'agility', secondaryStat: 'strength' },
    { name: 'Lucky Charm', primaryStat: 'luck', secondaryStat: 'agility' },
    { name: 'Arcane Focus', primaryStat: 'intelligence', secondaryStat: 'spirit' },
    { name: 'Vitality Band', primaryStat: 'vitality', secondaryStat: 'strength' },
    { name: 'Sage Pendant', primaryStat: 'spirit', secondaryStat: 'intelligence' },
    { name: 'Monk Wraps', primaryStat: 'agility', secondaryStat: 'spirit' },
    { name: 'Berserker Skull', primaryStat: 'strength', secondaryStat: 'luck' },
];

const PREFIXES: { name: string; rarity: Rarity; statBonus: Partial<Stats>; mutation?: string }[] = [
    { name: 'Burning', rarity: Rarity.Uncommon, statBonus: { strength: 4, intelligence: 4 } },
    { name: 'Frozen', rarity: Rarity.Uncommon, statBonus: { vitality: 4, spirit: 4 } },
    { name: 'Swift', rarity: Rarity.Rare, statBonus: { agility: 8 } },
    { name: 'Wise', rarity: Rarity.Rare, statBonus: { intelligence: 8 } },
    { name: 'Robust', rarity: Rarity.Uncommon, statBonus: { vitality: 6 } },
    { name: 'Arcane', rarity: Rarity.Rare, statBonus: { spirit: 6, intelligence: 4 } },
    { name: 'Lucky', rarity: Rarity.Rare, statBonus: { luck: 12 } },
    { name: 'Savage', rarity: Rarity.Uncommon, statBonus: { strength: 5, agility: 3 } },
    { name: 'Divine', rarity: Rarity.Epic, statBonus: { spirit: 10, vitality: 5 } },
    { name: 'Shadow', rarity: Rarity.Rare, statBonus: { agility: 6, luck: 4 } },
    { name: 'Aetheric', rarity: Rarity.Epic, statBonus: { luck: 15, spirit: 8 } },
    { name: 'Primordial', rarity: Rarity.Legendary, statBonus: { strength: 12, vitality: 12 } },
    { name: 'Celestial', rarity: Rarity.Legendary, statBonus: { intelligence: 15, spirit: 10 } },
    { name: 'Mythic', rarity: Rarity.Legendary, statBonus: { agility: 15, luck: 10 } },
    { name: 'Godly', rarity: Rarity.Legendary, statBonus: { strength: 10, agility: 10, intelligence: 10, vitality: 10, spirit: 10, luck: 10 } },
    { name: 'Corrupted', rarity: Rarity.Corrupted, statBonus: { strength: 25, intelligence: 25 }, mutation: '-20% healing received' },
    { name: 'Vampiric', rarity: Rarity.Rare, statBonus: { strength: 6, luck: 6 } },
    { name: 'Thundering', rarity: Rarity.Epic, statBonus: { strength: 8, agility: 8 } },
];

const SUFFIXES: { name: string; rarity: Rarity; statBonus: Partial<Stats>; mutation?: string }[] = [
    { name: 'of Might', rarity: Rarity.Uncommon, statBonus: { strength: 5 } },
    { name: 'of Precision', rarity: Rarity.Rare, statBonus: { agility: 8 } },
    { name: 'of Shadows', rarity: Rarity.Rare, statBonus: { agility: 6, luck: 4 } },
    { name: 'of Wisdom', rarity: Rarity.Uncommon, statBonus: { intelligence: 5 } },
    { name: 'of Fortitude', rarity: Rarity.Uncommon, statBonus: { vitality: 5 } },
    { name: 'of the Soul', rarity: Rarity.Rare, statBonus: { spirit: 8 } },
    { name: 'of Fortune', rarity: Rarity.Rare, statBonus: { luck: 10 } },
    { name: 'of Holy Light', rarity: Rarity.Epic, statBonus: { spirit: 12, intelligence: 6 } },
    { name: 'of the Berserker', rarity: Rarity.Epic, statBonus: { strength: 12, vitality: 6 } },
    { name: 'of the Assassin', rarity: Rarity.Epic, statBonus: { agility: 14, luck: 4 } },
    { name: 'of the Void', rarity: Rarity.Corrupted, statBonus: { strength: 20, agility: 20 }, mutation: '-10% max HP' },
    { name: 'of the Phoenix', rarity: Rarity.Legendary, statBonus: { vitality: 15, spirit: 10 } },
    { name: 'of the Dragon', rarity: Rarity.Legendary, statBonus: { strength: 15, intelligence: 10 } },
    { name: 'of the Wind', rarity: Rarity.Legendary, statBonus: { agility: 18, luck: 8 } },
];

export class ItemGenerator {
    static generateItem(level: number, isIndustrial: boolean = false): Item {
        const levelScale = 1 + (level - 1) * 0.15;
        const forceCorrupted = isIndustrial && Math.random() < 0.25;
        
        const typeRoll = Math.random();
        let baseItem: any;
        let itemType: ItemType;
        
        if (typeRoll < 0.4) {
            baseItem = WEAPONS[Math.floor(Math.random() * WEAPONS.length)]!;
            itemType = ItemType.Weapon;
        } else if (typeRoll < 0.75) {
            baseItem = ARMORS[Math.floor(Math.random() * ARMORS.length)]!;
            itemType = ItemType.Armor;
        } else {
            const acc = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)]!;
            baseItem = {
                name: acc.name,
                baseStr: 0, baseInt: 0, baseAgi: 0, baseVit: 0, baseSpi: 0, baseLuk: 0
            };
            itemType = ItemType.Accessory;
        }
        
        const hasPrefix = Math.random() > 0.35 || forceCorrupted;
        const hasSuffix = Math.random() > 0.55 || forceCorrupted;
        
        let prefix = hasPrefix ? PREFIXES[Math.floor(Math.random() * PREFIXES.length)] : null;
        let suffix = hasSuffix ? SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)] : null;
        
        if (forceCorrupted) {
            const corruptedOnes = PREFIXES.filter(p => p.rarity === Rarity.Corrupted);
            if (!prefix || prefix.rarity !== Rarity.Corrupted) {
                prefix = corruptedOnes[Math.floor(Math.random() * corruptedOnes.length)] || prefix;
            }
        }
        
        const nameParts: string[] = [];
        if (prefix) nameParts.push(prefix.name);
        nameParts.push(baseItem.name);
        if (suffix) nameParts.push(suffix.name);
        
        let rarity: Rarity = Rarity.Common;
        if (prefix && suffix) rarity = Rarity.Rare;
        if (prefix?.rarity === Rarity.Epic || suffix?.rarity === Rarity.Epic) rarity = Rarity.Epic;
        if (prefix?.rarity === Rarity.Legendary || suffix?.rarity === Rarity.Legendary) rarity = Rarity.Legendary;
        if (prefix?.rarity === Rarity.Corrupted || suffix?.rarity === Rarity.Corrupted) rarity = Rarity.Corrupted;
        if (forceCorrupted && rarity !== Rarity.Corrupted) rarity = Rarity.Corrupted;
        
        const stats: Partial<Stats> = {};
        
        if (itemType === ItemType.Weapon) {
            stats.strength = Math.floor((baseItem.baseStr || 0) * levelScale);
            stats.intelligence = Math.floor((baseItem.baseInt || 0) * levelScale);
            stats.agility = Math.floor((baseItem.baseAgi || 0) * levelScale);
            stats.vitality = Math.floor((baseItem.baseVit || 0) * levelScale);
            stats.spirit = Math.floor((baseItem.baseSpi || 0) * levelScale);
            stats.luck = Math.floor((baseItem.baseLuk || 0) * levelScale);
        } else if (itemType === ItemType.Armor) {
            stats.vitality = Math.floor((baseItem.baseVit || 0) * levelScale);
            stats.spirit = Math.floor((baseItem.baseSpi || 0) * levelScale);
            stats.agility = Math.floor((baseItem.baseAgi || 0) * levelScale);
            stats.strength = Math.floor((baseItem.baseStr || 0) * levelScale);
        } else {
            const acc = ACCESSORIES.find(a => a.name === baseItem.name);
            if (acc) {
                stats[acc.primaryStat] = Math.floor(6 * levelScale);
                if (acc.secondaryStat) {
                    stats[acc.secondaryStat] = Math.floor(3 * levelScale);
                }
            }
        }
        
        const addStats = (bonus: Partial<Stats>) => {
            for (const [key, value] of Object.entries(bonus)) {
                const k = key as keyof Stats;
                stats[k] = (stats[k] || 0) + Math.floor(value * levelScale);
            }
        };
        
        if (prefix) addStats(prefix.statBonus);
        if (suffix) addStats(suffix.statBonus);
        
        const rarityMultiplier: Record<Rarity, number> = {
            [Rarity.Common]: 1,
            [Rarity.Uncommon]: 1.2,
            [Rarity.Rare]: 1.5,
            [Rarity.Epic]: 2,
            [Rarity.Legendary]: 3,
            [Rarity.Corrupted]: 1.8,
            [Rarity.Abyssal]: 4
        };
        
        for (const key of Object.keys(stats) as (keyof Stats)[]) {
            if (stats[key]) {
                stats[key] = Math.floor(stats[key]! * rarityMultiplier[rarity]);
            }
        }
        
        const maxDurability = Math.floor((50 + level * 5) * (rarity === Rarity.Legendary ? 1.5 : 1));
        
        return {
            id: Math.random().toString(36).substring(2, 11),
            name: nameParts.join(' '),
            prefix: prefix?.name,
            baseName: baseItem.name,
            suffix: suffix?.name,
            type: itemType,
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
        const result: Item = { 
            ...item, 
            stats: { ...item.stats },
            isInfused: false,
            isCorrupted: item.isCorrupted || false
        };

        if (isSuccess) {
            result.isInfused = true;
            Object.keys(result.stats).forEach(key => {
                const k = key as keyof Stats;
                if (result.stats[k] !== undefined) {
                    result.stats[k] = Math.ceil(result.stats[k]! * 1.25);
                }
            });
            return { success: true, corrupted: false, result };
        } else {
            result.isCorrupted = true;
            result.rarity = Rarity.Corrupted;
            result.stats.strength = (result.stats.strength || 0) + Math.floor(item.level * 2);
            result.stats.intelligence = (result.stats.intelligence || 0) + Math.floor(item.level * 2);
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

    static generateRelic(floorLevel: number): Item {
        const baseStats: Partial<Stats> = {
            strength: 20 + floorLevel * 3,
            intelligence: 20 + floorLevel * 3,
            agility: 20 + floorLevel * 3,
            vitality: 20 + floorLevel * 3,
            spirit: 20 + floorLevel * 3,
            luck: 15 + floorLevel * 2
        };

        return {
            id: `relic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: 'Abyssal Relic',
            baseName: 'Relic',
            type: ItemType.Accessory,
            rarity: Rarity.Abyssal,
            stats: baseStats,
            durability: 999,
            maxDurability: 999,
            isSoulBound: true,
            level: floorLevel
        };
    }

    static shouldAutoSell(item: Item, threshold: Rarity): boolean {
        return this.getRarityValue(item.rarity) <= this.getRarityValue(threshold);
    }
}
