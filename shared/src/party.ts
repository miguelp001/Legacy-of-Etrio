import { BaseClass, StatCalculator } from './stats.js';
import type { Combatant, NightsdeepTrait, SaluwanBlessing, SocialClass, Tribe } from './combat.js';

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

const TRAITS: Record<NightsdeepTrait, Trait> = {
    'Stoic': { name: 'Stoic', description: 'Reduced damage taken, rarely speaks.', modifiers: { stat: 'vitality', multiplier: 1.1 } },
    'Cheerful': { name: 'Cheerful', description: 'Boosts party morale and luck.', modifiers: { stat: 'luck', multiplier: 1.2 } },
    'Hot-Headed': { name: 'Hot-Headed', description: 'Increased attack, but lower defense.', modifiers: { stat: 'strength', multiplier: 1.2 } }
};

const NAMES = ['Alaric', 'Bryn', 'Caelum', 'Dara', 'Elowen', 'Faelan', 'Gwyneth', 'Harkin', 'Iona', 'Jace'];
const TRIBES: Tribe[] = ['Vinrforad', 'Logi', 'Fridrbjorn', 'Iftiqad', 'Grima', 'Jotunheimr', 'The Frozen', 'The Drowned', 'The Beasts'];
const BLESSINGS: SaluwanBlessing[] = ['See the Truth', 'Blessing of Blood', 'Saluwan\'s Wrath', 'Cleanse the Mind', 'Walk the Flames', 'Mark the Path'];

export class NPCGenerator {
    static generateNPC(level: number, generation: number): Combatant {
        const name = NAMES[Math.floor(Math.random() * NAMES.length)]!;
        const baseClasses = Object.values(BaseClass);
        const baseClass = baseClasses[Math.floor(Math.random() * baseClasses.length)] as BaseClass;
        
        const classes: { name: SocialClass; weight: number }[] = [
            { name: 'Thrall', weight: 40 },
            { name: 'Bondi', weight: 30 },
            { name: 'Vardr', weight: 15 },
            { name: 'Scrifadr', weight: 10 },
            { name: 'Drengskapr', weight: 5 }
        ];

        const roll = Math.random() * 100;
        let cumulative = 0;
        let chosenClass: SocialClass = 'Thrall';
        for (const c of classes) {
            cumulative += c.weight;
            if (roll <= cumulative) {
                chosenClass = c.name;
                break;
            }
        }

        const traitNames: NightsdeepTrait[] = ['Stoic', 'Cheerful', 'Hot-Headed'];
        const chosenTraitName = traitNames[Math.floor(Math.random() * traitNames.length)]!;
        const traitObj = TRAITS[chosenTraitName];

        const stats = StatCalculator.calculateStats(level, baseClass, generation);
        
        if (traitObj.modifiers.stat) {
            const key = traitObj.modifiers.stat as keyof typeof stats;
            if (typeof stats[key] === 'number') {
                (stats[key] as any) *= traitObj.modifiers.multiplier;
            }
        }

        const isVampire = Math.random() < 0.3;
        const tribe = isVampire ? TRIBES[Math.floor(Math.random() * TRIBES.length)] : undefined;
        
        if (tribe) {
            StatCalculator.applyTribalBonuses(stats, tribe);
        }

        let piety = 0;
        let blessings: SaluwanBlessing[] = [];

        if (!isVampire) {
            const pietyRanges: Record<SocialClass, [number, number]> = {
                'Thrall': [0, 40],
                'Bondi': [20, 60],
                'Vardr': [40, 80],
                'Scrifadr': [60, 90],
                'Drengskapr': [70, 100]
            };
            const range = pietyRanges[chosenClass];
            piety = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
            
            if (piety > 80) {
                blessings.push(BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)]!);
            }
        }

        return {
            id: Math.random().toString(36).substring(2, 11),
            name,
            level,
            xp: 0,
            baseClass,
            generation,
            trait: chosenTraitName,
            socialClass: chosenClass,
            tribe,
            isVampire,
            piety,
            blessings,
            affinityLevel: 0,
            stats,
            hp: StatCalculator.calculateHP(stats),
            maxHp: StatCalculator.calculateHP(stats),
            mp: StatCalculator.calculateMP(stats),
            maxMp: StatCalculator.calculateMP(stats),
            isEnemy: false,
            weapon: null,
            armor: null,
            accessory: null
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
