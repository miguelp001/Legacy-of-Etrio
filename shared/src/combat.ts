import type { CharacterStats } from './stats.js';
import type { Item } from './items.js';

export type NightsdeepTrait = 'Stoic' | 'Cheerful' | 'Hot-Headed';
export type SocialClass = 'Thrall' | 'Bondi' | 'Vardr' | 'Scrifadr' | 'Drengskapr';
export type Tribe = 'Vinrforad' | 'Logi' | 'Fridrbjorn' | 'Iftiqad' | 'Grima' | 'Jotunheimr' | 'The Frozen' | 'The Drowned' | 'The Beasts';
export type SaluwanBlessing = 'See the Truth' | 'Blessing of Blood' | 'Saluwan\'s Wrath' | 'Cleanse the Mind' | 'Walk the Flames' | 'Mark the Path';

export interface Combatant extends CharacterStats {
    id: string;
    name: string;
    isEnemy: boolean;
    trait?: NightsdeepTrait | undefined;
    socialClass?: SocialClass | undefined;
    tribe?: Tribe | undefined;
    isVampire?: boolean | undefined;
    isStarving?: boolean | undefined; // Tracks resource depletion for vampires
    piety?: number | undefined;
    blessings?: SaluwanBlessing[] | undefined;
    affinityLevel?: number | undefined;
    weapon: Item | null;
    armor: Item | null;
    accessory: Item | null;
    isAscended?: boolean | undefined;
}

export interface CombatEvent {
    turn: number;
    attackerName: string;
    defenderName: string;
    damage: number;
    isCrit: boolean;
    isMiss: boolean;
    remainingHp: number;
    banter?: string;
    emojiTag?: string;
    isAetherBreach?: boolean | undefined;
    corpseData?: { playerId: string; floor: number };
}

export interface CombatResult {
    victory: boolean;
    events: CombatEvent[];
    survivingMembers: Combatant[];
    turns: number;
}



export class CombatEngine {
    static simulate(party: Combatant[], enemies: Combatant[]): CombatResult {
        const events: CombatEvent[] = [];
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

                events.push({
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
            events,
            survivingMembers: party.filter(p => p.hp > 0),
            turns: turnCount
        };
    }
}
