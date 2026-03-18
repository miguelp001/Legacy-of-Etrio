import { BaseClass, StatCalculator } from './stats.js';
import type { CharacterStats } from './stats.js';

export interface Trait {
    name: string;
    description: string;
    modifiers: {
        stat?: string;
        multiplier: number;
    };
}

export interface Relationship {
    memberIds: [string, string];
    affinity: number;
    stage: 'Stranger' | 'Partner' | 'Soulmate';
}

const TRAITS: Trait[] = [
    { name: 'Brave', description: '+10% Strength', modifiers: { stat: 'strength', multiplier: 1.1 } },
    { name: 'Nimble', description: '+10% Agility', modifiers: { stat: 'agility', multiplier: 1.1 } },
    { name: 'Intelligent', description: '+10% Intelligence', modifiers: { stat: 'intelligence', multiplier: 1.1 } },
    { name: 'Tough', description: '+10% Vitality', modifiers: { stat: 'vitality', multiplier: 1.1 } },
    { name: 'Lucky', description: '+20% Luck', modifiers: { stat: 'luck', multiplier: 1.2 } },
    { name: 'Glass Cannon', description: '+20% Strength, -10% Vitality', modifiers: { stat: 'strength', multiplier: 1.2 } }
];

const NAMES = ['Alaric', 'Bryn', 'Caelum', 'Dara', 'Elowen', 'Faelan', 'Gwyneth', 'Harkin', 'Iona', 'Jace'];

export class NPCGenerator {
    static generateNPC(level: number, generation: number): CharacterStats & { name: string; traits: Trait[] } {
        const name = NAMES[Math.floor(Math.random() * NAMES.length)]!;
        const baseClasses = Object.values(BaseClass);
        const baseClass = baseClasses[Math.floor(Math.random() * baseClasses.length)] as BaseClass;
        
        const traits: Trait[] = [];
        if (Math.random() > 0.7) {
            traits.push(TRAITS[Math.floor(Math.random() * TRAITS.length)]!);
        }

        const stats = StatCalculator.calculateStats(level, baseClass, generation);
        
        traits.forEach(trait => {
            if (trait.modifiers.stat) {
                const key = trait.modifiers.stat as keyof typeof stats;
                if (typeof stats[key] === 'number') {
                    (stats[key] as any) *= trait.modifiers.multiplier;
                }
            }
        });

        return {
            name,
            level,
            baseClass,
            generation,
            traits,
            stats,
            hp: StatCalculator.calculateHP(stats),
            maxHp: StatCalculator.calculateHP(stats),
            mp: StatCalculator.calculateMP(stats),
            maxMp: StatCalculator.calculateMP(stats)
        };
    }

    static updateAffinity(relationships: Relationship[], member1Id: string, member2Id: string, amount: number): Relationship[] {
        const sortedIds = [member1Id, member2Id].sort();
        let rel = relationships.find(r => r.memberIds[0] === sortedIds[0] && r.memberIds[1] === sortedIds[1]);
        
        if (!rel) {
            rel = { memberIds: [sortedIds[0]!, sortedIds[1]!], affinity: 0, stage: 'Stranger' };
            relationships.push(rel);
        }

        rel.affinity = Math.min(100, rel.affinity + amount);
        
        if (rel.affinity >= 100) rel.stage = 'Soulmate';
        else if (rel.affinity >= 50) rel.stage = 'Partner';
        
        return [...relationships];
    }
}
