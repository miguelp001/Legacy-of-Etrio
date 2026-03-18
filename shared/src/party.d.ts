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
export declare class NPCGenerator {
    static generateNPC(level: number, generation: number): CharacterStats & {
        name: string;
        traits: Trait[];
    };
    static updateAffinity(relationships: Relationship[], member1Id: string, member2Id: string, amount: number): Relationship[];
}
//# sourceMappingURL=party.d.ts.map