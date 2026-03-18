export declare enum BaseClass {
    Warrior = "Warrior",
    Mage = "Mage",
    Healer = "Healer",
    Thief = "Thief"
}
export declare enum SubClass {
    Brawler = "Brawler",
    Knight = "Knight",
    Elementalist = "Elementalist",
    Summoner = "Summoner",
    Cleric = "Cleric",
    Paladin = "Paladin",
    Assassin = "Assassin",
    Gunslinger = "Gunslinger"
}
export interface Stats {
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
    spirit: number;
    luck: number;
}
export interface CharacterStats {
    level: number;
    baseClass: BaseClass;
    subClass?: SubClass;
    generation: number;
    stats: Stats;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
}
export declare class StatCalculator {
    static calculateStats(level: number, baseClass: BaseClass, generation: number, subClass?: SubClass): Stats;
    static calculateHP(stats: Stats): number;
    static calculateMP(stats: Stats): number;
}
//# sourceMappingURL=stats.d.ts.map