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



export class CombatEngine {
    static simulate(party: Combatant[], enemies: Combatant[]): CombatResult {
        const logs: CombatLog[] = [];
        let turnCount = 1;
        const allCombatants = [...party, ...enemies].sort((a, b) => b.stats.agility - a.stats.agility);

        while (party.some(p => p.hp > 0) && enemies.some(e => e.hp > 0) && turnCount < 100) {
            for (const attacker of allCombatants) {
                if (attacker.hp <= 0) continue;

                const targets = attacker.isEnemy ? party.filter(p => p.hp > 0) : enemies.filter(e => e.hp > 0);
                if (targets.length === 0) break;

                const defender = targets[Math.floor(Math.random() * targets.length)]!;
                
                const isMiss = Math.random() > (0.8 + (attacker.stats.agility - defender.stats.agility) * 0.01);
                let damage = 0;
                let isCrit = false;

                if (!isMiss) {
                    const baseDamage = attacker.stats.strength * 2;
                    const defense = defender.stats.vitality * 0.5;
                    damage = Math.max(1, baseDamage - defense);
                    
                    isCrit = Math.random() < (attacker.stats.luck * 0.01);
                    if (isCrit) damage *= 2;
                    
                    damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
                    
                    defender.hp = Math.max(0, defender.hp - damage);
                }

                logs.push({
                    turn: turnCount,
                    attackerName: attacker.name,
                    defenderName: defender.name,
                    damage,
                    isCrit,
                    isMiss,
                    remainingHp: defender.hp
                });

                if (party.every(p => p.hp <= 0) || enemies.every(e => e.hp <= 0)) break;
            }
            turnCount++;
        }

        return {
            victory: enemies.every(e => e.hp <= 0),
            logs,
            survivingMembers: party.filter(p => p.hp > 0),
            turns: turnCount
        };
    }
}
