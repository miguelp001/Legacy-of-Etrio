export var BaseClass;
(function (BaseClass) {
    BaseClass["Warrior"] = "Warrior";
    BaseClass["Mage"] = "Mage";
    BaseClass["Healer"] = "Healer";
    BaseClass["Thief"] = "Thief";
})(BaseClass || (BaseClass = {}));
export var SubClass;
(function (SubClass) {
    SubClass["Brawler"] = "Brawler";
    SubClass["Knight"] = "Knight";
    SubClass["Elementalist"] = "Elementalist";
    SubClass["Summoner"] = "Summoner";
    SubClass["Cleric"] = "Cleric";
    SubClass["Paladin"] = "Paladin";
    SubClass["Assassin"] = "Assassin";
    SubClass["Gunslinger"] = "Gunslinger";
})(SubClass || (SubClass = {}));
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
        // Round to 2 decimal places or integers? Let's keep decimals for math, but round for display later.
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