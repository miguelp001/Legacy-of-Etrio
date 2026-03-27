import { StatCalculator } from './stats';
import type { CharacterStats, Stats } from './stats';
import type { Trait } from './party';
import type { SocialClass } from './combat';
import type { Item } from './items';

export interface HeirData {
    character: CharacterStats & { id: string; name: string; traits: Trait[]; socialClass: SocialClass };
    heirloomItem: Item | null;
    inheritedGold: number;
}

export class LineageManager {
    static createHeir(
        parent1: CharacterStats & { name: string; traits: Trait[]; socialClass: SocialClass }, 
        parent2: CharacterStats & { name: string; traits: Trait[]; socialClass: SocialClass },
        heirloomItem: Item | null = null,
        goldToInherit: number = 0
    ): HeirData {
        const id = Math.random().toString(36).substring(2, 11);
        const generation = Math.max(parent1.generation, parent2.generation) + 1;
        const level = 1;

        const baseClass = Math.random() > 0.5 ? parent1.baseClass : parent2.baseClass;
        
        const p1Traits = parent1.traits || [];
        const p2Traits = parent2.traits || [];
        const combinedTraits = [...p1Traits, ...p2Traits];
        const uniqueTraits = Array.from(new Set(combinedTraits.map(t => t.name)))
            .map(name => combinedTraits.find(t => t.name === name)!);
        
        const heirTraits: Trait[] = uniqueTraits.filter(() => Math.random() > 0.4);

        const classLevels: SocialClass[] = ['Thrall', 'Bondi', 'Vardr', 'Scrifadr', 'Drengskapr'];
        const p1Level = classLevels.indexOf(parent1.socialClass);
        const p2Level = classLevels.indexOf(parent2.socialClass);
        const maxLevel = Math.max(p1Level, p2Level);
        
        let heirLevel = maxLevel;
        const roll = Math.random();
        if (roll < 0.1) heirLevel = Math.max(0, heirLevel - 1);
        else if (roll > 0.9) heirLevel = Math.min(classLevels.length - 1, heirLevel + 1);
        
        const heirClass = classLevels[heirLevel]!;

        const p1Stats = parent1.stats;
        const p2Stats = parent2.stats;
        const inheritedStats: Stats = {
            strength: Math.max(p1Stats.strength, p2Stats.strength) * 0.2,
            agility: Math.max(p1Stats.agility, p2Stats.agility) * 0.2,
            intelligence: Math.max(p1Stats.intelligence, p2Stats.intelligence) * 0.2,
            vitality: Math.max(p1Stats.vitality, p2Stats.vitality) * 0.2,
            spirit: Math.max(p1Stats.spirit, p2Stats.spirit) * 0.2,
            luck: Math.max(p1Stats.luck, p2Stats.luck) * 0.2
        };
        
        const baseStats = StatCalculator.calculateStats(level, baseClass, generation);
        
        let heirloomStatsBonus: Stats = { strength: 0, agility: 0, intelligence: 0, vitality: 0, spirit: 0, luck: 0 };
        if (heirloomItem && heirloomItem.stats) {
            heirloomStatsBonus = {
                strength: heirloomItem.stats.strength || 0,
                agility: heirloomItem.stats.agility || 0,
                intelligence: heirloomItem.stats.intelligence || 0,
                vitality: heirloomItem.stats.vitality || 0,
                spirit: heirloomItem.stats.spirit || 0,
                luck: heirloomItem.stats.luck || 0
            };
        }
        
        const combinedStats: Stats = {
            strength: Math.floor(baseStats.strength + inheritedStats.strength + heirloomStatsBonus.strength),
            agility: Math.floor(baseStats.agility + inheritedStats.agility + heirloomStatsBonus.agility),
            intelligence: Math.floor(baseStats.intelligence + inheritedStats.intelligence + heirloomStatsBonus.intelligence),
            vitality: Math.floor(baseStats.vitality + inheritedStats.vitality + heirloomStatsBonus.vitality),
            spirit: Math.floor(baseStats.spirit + inheritedStats.spirit + heirloomStatsBonus.spirit),
            luck: Math.floor(baseStats.luck + inheritedStats.luck + heirloomStatsBonus.luck)
        };
        
        const name = `${parent1.name.split(' ')[0]}'s Heir`;

        return {
            character: {
                id,
                name,
                level,
                xp: 0,
                baseClass,
                generation,
                traits: heirTraits,
                socialClass: heirClass,
                stats: combinedStats,
                hp: StatCalculator.calculateHP(combinedStats),
                maxHp: StatCalculator.calculateHP(combinedStats),
                mp: StatCalculator.calculateMP(combinedStats),
                maxMp: StatCalculator.calculateMP(combinedStats)
            },
            heirloomItem,
            inheritedGold: goldToInherit
        };
    }
}
