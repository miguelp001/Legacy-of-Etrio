import type { CharacterStats } from './stats';
import type { Item } from './items';

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
    recoveryUntil?: number | undefined;
}

export interface CombatEvent {
    id: string;
    turn: number;
    attackerName: string;
    defenderName: string;
    attackerId: string;
    defenderId: string;
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



import type { EventType } from './descriptionTypes';

export interface DescriptorContext {
    eventType: EventType;
    speaker: {
        name: string;
        trait?: NightsdeepTrait | undefined;
        socialClass?: SocialClass | undefined;
        weapon?: string | undefined;
    };
    target?: {
        name: string;
    } | undefined;
    biome?: any | undefined;
    hitQuality?: 'CRIT' | 'NORMAL' | 'MISS' | undefined;
    affinity?: number | undefined;
    dreadLevel: number;
    value?: number | undefined;
}

export type DescriptorGenerator = (context: DescriptorContext) => string;

export class CombatEngine {
    static simulate(
        party: Combatant[], 
        enemies: Combatant[], 
        options: { 
            biome?: any; 
            dreadLevel?: number; 
            generator?: DescriptorGenerator 
        } = {}
    ): CombatResult {
        const events: CombatEvent[] = [];
        let turnCount = 1;
        const dreadLevel = options.dreadLevel || 0;
        
        const simulatedParty = party.map(p => ({ ...p, stats: { ...p.stats } }));
        const simulatedEnemies = enemies.map(e => ({ ...e, stats: { ...e.stats } }));
        
        const allCombatants = [...simulatedParty, ...simulatedEnemies].sort((a, b) => b.stats.agility - a.stats.agility);

        while (simulatedParty.some(p => p.hp > 0) && simulatedEnemies.some(e => e.hp > 0) && turnCount < 200) {
            for (const attacker of allCombatants) {
                if (attacker.hp <= 0) continue;

                const targets = attacker.isEnemy ? simulatedParty.filter(p => p.hp > 0) : simulatedEnemies.filter(e => e.hp > 0);
                if (targets.length === 0) break;

                const defender = targets[Math.floor(Math.random() * targets.length)]!;
                
                const atkStr = attacker.stats.strength || 10;
                const defVit = defender.stats.vitality || 10;
                const atkAgil = attacker.stats.agility || 10;
                const defAgil = defender.stats.agility || 10;
                const atkLuck = attacker.stats.luck || 10;

                const isMissValue = Math.random() > (0.8 + (atkAgil - defAgil) * 0.01);
                let damage = 0;
                let isCrit = false;

                if (!isMissValue) {
                    const baseDamage = atkStr * 2;
                    const defense = defVit * 0.5;
                    damage = Math.max(1, baseDamage - defense);
                    
                    isCrit = Math.random() < (atkLuck * 0.01);
                    if (isCrit) damage *= 2;
                    
                    damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
                    defender.hp = Math.max(0, (defender.hp || 0) - damage);
                }

                const hitQuality = isMissValue ? 'MISS' : (isCrit ? 'CRIT' : 'NORMAL');
                let banter: string | undefined = "";

                if (options.generator) {
                    banter = options.generator({
                        eventType: 'COMBAT_ATTACK',
                        speaker: {
                            name: attacker.name,
                            trait: attacker.trait,
                            socialClass: attacker.socialClass,
                            weapon: attacker.weapon?.name
                        },
                        target: {
                            name: defender.name
                        },
                        biome: options.biome,
                        hitQuality,
                        affinity: attacker.affinityLevel || 0,
                        dreadLevel,
                        value: damage
                    });
                } else {
                    const fallbacks = isMissValue 
                        ? ["A clumsy swing!", "The blade slices only air.", "Momentum carries the strike wide."] 
                        : (isCrit ? ["A devastating critical blow!", "An unstoppable strike!", "The hit resonates with force!"] : ["A solid strike connects.", "Finding purchase in the target.", "The exchange favors the attacker."]);
                    banter = fallbacks[Math.floor(Math.random() * fallbacks.length)];
                }

                events.push({
                    id: `ev-${Date.now()}-${turnCount}-${events.length}-${Math.random().toString(36).substring(2, 7)}`,
                    turn: turnCount,
                    attackerName: attacker.name,
                    defenderName: defender.name,
                    attackerId: attacker.id,
                    defenderId: defender.id,
                    damage,
                    isCrit,
                    isMiss: isMissValue,
                    remainingHp: defender.hp,
                    banter: banter || "",
                    emojiTag: isMissValue ? "💨" : (isCrit ? "🔥" : "⚔️")
                });

                if (simulatedParty.every(p => p.hp <= 0) || simulatedEnemies.every(e => e.hp <= 0)) break;
            }
            turnCount++;
        }

        return {
            victory: simulatedEnemies.every(e => e.hp <= 0),
            events,
            survivingMembers: simulatedParty.filter(p => p.hp > 0),
            turns: turnCount
        };
    }
}
