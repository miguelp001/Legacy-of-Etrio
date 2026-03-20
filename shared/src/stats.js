export const BaseClass = {
    Warrior: 'Warrior',
    Mage: 'Mage',
    Healer: 'Healer',
    Thief: 'Thief'
};
export const SubClass = {
    Brawler: 'Brawler',
    Knight: 'Knight',
    Elementalist: 'Elementalist',
    Summoner: 'Summoner',
    Cleric: 'Cleric',
    Paladin: 'Paladin',
    Assassin: 'Assassin',
    Gunslinger: 'Gunslinger'
};
const BASE_STATS = {
    [BaseClass.Warrior]: { strength: 10, agility: 5, intelligence: 3, vitality: 12, spirit: 4, luck: 5 },
    [BaseClass.Mage]: { strength: 3, agility: 5, intelligence: 12, vitality: 6, spirit: 10, luck: 6 },
    [BaseClass.Healer]: { strength: 4, agility: 4, intelligence: 8, vitality: 10, spirit: 12, luck: 7 },
    [BaseClass.Thief]: { strength: 5, agility: 12, intelligence: 5, vitality: 7, spirit: 5, luck: 10 }
};
const GROWTH_RATES = {
    [BaseClass.Warrior]: { strength: 2.5, agility: 1.0, intelligence: 0.5, vitality: 2.5, spirit: 0.8, luck: 1.0 },
    [BaseClass.Mage]: { strength: 0.5, agility: 1.0, intelligence: 2.5, vitality: 1.2, spirit: 2.5, luck: 1.2 },
    [BaseClass.Healer]: { strength: 0.8, agility: 0.8, intelligence: 1.8, vitality: 2.0, spirit: 2.5, luck: 1.5 },
    [BaseClass.Thief]: { strength: 1.2, agility: 2.5, intelligence: 1.0, vitality: 1.5, spirit: 1.0, luck: 2.2 }
};
const SUBCLASS_GROWTH_MODIFIERS = {
    [SubClass.Brawler]: { strength: 1.5, agility: 0.5 },
    [SubClass.Knight]: { vitality: 1.5, strength: 0.3 },
    [SubClass.Elementalist]: { intelligence: 1.5, spirit: 0.5 },
    [SubClass.Summoner]: { spirit: 1.5, intelligence: 0.5 },
    [SubClass.Cleric]: { spirit: 1.5, luck: 0.5 },
    [SubClass.Paladin]: { vitality: 1.3, strength: 0.7 },
    [SubClass.Assassin]: { agility: 1.5, luck: 0.5 },
    [SubClass.Gunslinger]: { luck: 1.5, agility: 0.5 }
};
export const TRIBE_BONUSES = {
    'Vinrforad': { spirit: 1.2, luck: 1.1 },
    'Logi': { agility: 1.15, strength: 1.1 },
    'Jotunheimr': { vitality: 1.25, strength: 1.15, agility: 0.9 },
    'Fridrbjorn': { luck: 1.2, spirit: 1.1 },
    'Grima': { spirit: 1.15, vitality: 1.1 },
    'Iftiqad': { spirit: 1.15, luck: 1.15 },
    'The Frozen': { vitality: 1.15, spirit: 1.1 },
    'The Drowned': { spirit: 1.15, strength: 1.1 },
    'The Beasts': { agility: 1.15, luck: 1.1 }
};
export class StatCalculator {
    static calculateStats(level, baseClass, generation, subClass) {
        const base = BASE_STATS[baseClass];
        const growth = GROWTH_RATES[baseClass];
        const heirMult = 1 + (generation * 0.1);
        const stats = {
            strength: base.strength + (growth.strength * (level - 1)),
            agility: base.agility + (growth.agility * (level - 1)),
            intelligence: base.intelligence + (growth.intelligence * (level - 1)),
            vitality: base.vitality + (growth.vitality * (level - 1)),
            spirit: base.spirit + (growth.spirit * (level - 1)),
            luck: base.luck + (growth.luck * (level - 1))
        };
        // Apply Subclass modifiers if applicable (Level 20+)
        if (level >= 20 && subClass) {
            const mod = SUBCLASS_GROWTH_MODIFIERS[subClass];
            const subLevel = level - 19;
            if (mod.strength)
                stats.strength += (growth.strength * mod.strength * subLevel);
            if (mod.agility)
                stats.agility += (growth.agility * mod.agility * subLevel);
            if (mod.intelligence)
                stats.intelligence += (growth.intelligence * mod.intelligence * subLevel);
            if (mod.vitality)
                stats.vitality += (growth.vitality * mod.vitality * subLevel);
            if (mod.spirit)
                stats.spirit += (growth.spirit * mod.spirit * subLevel);
            if (mod.luck)
                stats.luck += (growth.luck * mod.luck * subLevel);
        }
        // Apply Heir Bonus
        stats.strength *= heirMult;
        stats.agility *= heirMult;
        stats.intelligence *= heirMult;
        stats.vitality *= heirMult;
        stats.spirit *= heirMult;
        stats.luck *= heirMult;
        // Apply Tribal Bonuses
        return stats;
    }
    static applyTribalBonuses(stats, tribe, isStarving) {
        if (isStarving) {
            return {
                strength: stats.strength * 0.5,
                agility: stats.agility * 0.5,
                intelligence: stats.intelligence * 0.5,
                vitality: stats.vitality * 0.5,
                spirit: stats.spirit * 0.5,
                luck: stats.luck * 0.5
            };
        }
        if (tribe && TRIBE_BONUSES[tribe]) {
            const bonuses = TRIBE_BONUSES[tribe];
            if (bonuses.strength)
                stats.strength *= bonuses.strength;
            if (bonuses.agility)
                stats.agility *= bonuses.agility;
            if (bonuses.intelligence)
                stats.intelligence *= bonuses.intelligence;
            if (bonuses.vitality)
                stats.vitality *= bonuses.vitality;
            if (bonuses.spirit)
                stats.spirit *= bonuses.spirit;
            if (bonuses.luck)
                stats.luck *= bonuses.luck;
        }
        return stats;
    }
    static calculateHP(stats) {
        return Math.floor(stats.vitality * 10);
    }
    static calculateMP(stats) {
        return Math.floor(stats.spirit * 8);
    }
}
//# sourceMappingURL=stats.js.map