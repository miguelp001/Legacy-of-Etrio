import type { CharacterStats } from './stats.js';
export interface Combatant extends CharacterStats {
    id: string;
    name: string;
    isEnemy: boolean;
}
export interface CombatLog {
    turn: number;
    attackerName: string;
    defenderName: string;
    damage: number;
    isCrit: boolean;
    isMiss: boolean;
    remainingHp: number;
}
export interface CombatResult {
    victory: boolean;
    logs: CombatLog[];
    survivingMembers: Combatant[];
    turns: number;
}
export declare class CombatEngine {
    static simulate(party: Combatant[], enemies: Combatant[]): CombatResult;
}
//# sourceMappingURL=combat.d.ts.map