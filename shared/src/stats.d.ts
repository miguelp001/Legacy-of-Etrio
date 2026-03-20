export declare const BaseClass: {
    readonly Warrior: "Warrior";
    readonly Mage: "Mage";
    readonly Healer: "Healer";
    readonly Thief: "Thief";
};
export type BaseClass = (typeof BaseClass)[keyof typeof BaseClass];
export declare const SubClass: {
    readonly Brawler: "Brawler";
    readonly Knight: "Knight";
    readonly Elementalist: "Elementalist";
    readonly Summoner: "Summoner";
    readonly Cleric: "Cleric";
    readonly Paladin: "Paladin";
    readonly Assassin: "Assassin";
    readonly Gunslinger: "Gunslinger";
};
export type SubClass = (typeof SubClass)[keyof typeof SubClass];
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
export declare const TRIBE_BONUSES: Record<string, Partial<Stats>>;
export declare class StatCalculator {
    static calculateStats(level: number, baseClass: BaseClass, generation: number, subClass?: SubClass): Stats;
    static applyTribalBonuses(stats: Stats, tribe?: string, isStarving?: boolean): Stats;
    static calculateHP(stats: Stats): number;
    static calculateMP(stats: Stats): number;
}
//# sourceMappingURL=stats.d.ts.map