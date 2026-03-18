import { StatCalculator } from './stats.js';
import type { CharacterStats } from './stats.js';
import type { Trait } from './party.js';

export class LineageManager {
    static createHeir(parent1: CharacterStats & { name: string; traits: Trait[] }, parent2: CharacterStats & { name: string; traits: Trait[] }): CharacterStats & { name: string; traits: Trait[] } {
        const generation = Math.max(parent1.generation, parent2.generation) + 1;
        const level = 1;

        // Heir inherits a random base class from parents
        const baseClass = Math.random() > 0.5 ? parent1.baseClass : parent2.baseClass;
        
        // Inherit traits (chance to keep or gain new ones)
        const combinedTraits = [...parent1.traits, ...parent2.traits];
        const uniqueTraits = Array.from(new Set(combinedTraits.map(t => t.name)))
            .map(name => combinedTraits.find(t => t.name === name)!);
        
        const heirTraits: Trait[] = uniqueTraits.filter(() => Math.random() > 0.4);

        // Calculate stats with new generation bonus
        const stats = StatCalculator.calculateStats(level, baseClass, generation);
        
        // Name inheritance (Surname logic or just a new name)
        const name = `${parent1.name.split(' ')[0]}'s Heir`;

        return {
            name,
            level,
            baseClass,
            generation,
            traits: heirTraits,
            stats,
            hp: StatCalculator.calculateHP(stats),
            maxHp: StatCalculator.calculateHP(stats),
            mp: StatCalculator.calculateMP(stats),
            maxMp: StatCalculator.calculateMP(stats)
        };
    }
}
