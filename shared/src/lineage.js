import { StatCalculator } from './stats.js';
export class LineageManager {
    static createHeir(parent1, parent2) {
        const id = Math.random().toString(36).substring(2, 11);
        const generation = Math.max(parent1.generation, parent2.generation) + 1;
        const level = 1;
        // Heir inherits a random base class from parents
        const baseClass = Math.random() > 0.5 ? parent1.baseClass : parent2.baseClass;
        // Inherit traits (chance to keep or gain new ones)
        const p1Traits = parent1.traits || [];
        const p2Traits = parent2.traits || [];
        const combinedTraits = [...p1Traits, ...p2Traits];
        const uniqueTraits = Array.from(new Set(combinedTraits.map(t => t.name)))
            .map(name => combinedTraits.find(t => t.name === name));
        const heirTraits = uniqueTraits.filter(() => Math.random() > 0.4);
        // Social Class inheritance
        const classLevels = ['Thrall', 'Bondi', 'Vardr', 'Scrifadr', 'Drengskapr'];
        const p1Level = classLevels.indexOf(parent1.socialClass);
        const p2Level = classLevels.indexOf(parent2.socialClass);
        const maxLevel = Math.max(p1Level, p2Level);
        let heirLevel = maxLevel;
        const roll = Math.random();
        if (roll < 0.1)
            heirLevel = Math.max(0, heirLevel - 1); // Disgrace
        else if (roll > 0.9)
            heirLevel = Math.min(classLevels.length - 1, heirLevel + 1); // Merit
        const heirClass = classLevels[heirLevel];
        // Calculate stats with new generation bonus
        const stats = StatCalculator.calculateStats(level, baseClass, generation);
        // Name inheritance (Surname logic or just a new name)
        const name = `${parent1.name.split(' ')[0]}'s Heir`;
        return {
            id,
            name,
            level,
            baseClass,
            generation,
            traits: heirTraits,
            socialClass: heirClass,
            stats,
            hp: StatCalculator.calculateHP(stats),
            maxHp: StatCalculator.calculateHP(stats),
            mp: StatCalculator.calculateMP(stats),
            maxMp: StatCalculator.calculateMP(stats)
        };
    }
}
//# sourceMappingURL=lineage.js.map