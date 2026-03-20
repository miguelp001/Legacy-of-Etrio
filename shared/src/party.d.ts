import type { Combatant } from './combat.js';
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
    static generateNPC(level: number, generation: number): Combatant;
    static updateAffinity(relationships: Relationship[], member1Id: string, member2Id: string, amount: number): Relationship[];
}
//# sourceMappingURL=party.d.ts.map