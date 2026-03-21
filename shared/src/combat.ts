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
import type { BaseClass } from './stats';

export interface DescriptorContext {
    eventType: EventType;
    speaker: {
        name: string;
        level: number;
        baseClass: BaseClass;
        trait?: NightsdeepTrait | undefined;
        socialClass?: SocialClass | undefined;
        tribe?: string | undefined;
        weapon?: string | undefined;
        weaponType?: string | undefined;
        stats: {
            strength: number;
            agility: number;
            vitality: number;
            spirit: number;
            luck: number;
        };
        isEnemy: boolean;
        isVampire?: boolean | undefined;
        isAscended?: boolean | undefined;
        blessings?: string[] | undefined;
    };
    target: {
        name: string;
        level: number;
        baseClass: BaseClass;
        trait?: NightsdeepTrait | undefined;
        stats: {
            strength: number;
            agility: number;
            vitality: number;
            spirit: number;
            luck: number;
        };
        hp: number;
        maxHp: number;
        isEnemy: boolean;
    };
    biome?: any | undefined;
    hitQuality: 'CRIT' | 'NORMAL' | 'MISS';
    dreadLevel: number;
    damage: number;
    isKill: boolean;
}

export type DescriptorGenerator = (context: DescriptorContext) => string;

const WEAPON_TYPE_MAP: Record<string, string> = {
    'sword': 'sword', 'longsword': 'sword', 'saber': 'sword',
    'axe': 'axe', 'battleaxe': 'axe', 'hatchet': 'axe',
    'spear': 'spear', 'lance': 'spear', 'pike': 'spear',
    'dagger': 'dagger', 'knife': 'dagger',
    'hammer': 'hammer', 'mace': 'hammer', 'club': 'hammer',
    'staff': 'magic', 'wand': 'magic', 'orb': 'magic', 'grimoire': 'magic',
    'fist': 'fist', 'gauntlets': 'fist', 'claws': 'claw'
};

export class CombatEngine {
    static getWeaponType(weaponName?: string): string {
        if (!weaponName) return 'natural';
        const lower = weaponName.toLowerCase();
        for (const [key, value] of Object.entries(WEAPON_TYPE_MAP)) {
            if (lower.includes(key)) return value;
        }
        return 'natural';
    }

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
                
                const getTotalStats = (c: typeof attacker) => {
                    const base = c.stats;
                    let bonus = { strength: 0, intelligence: 0, agility: 0, vitality: 0, spirit: 0, luck: 0 };
                    
                    [c.weapon, c.armor, c.accessory].forEach(item => {
                        if (item) {
                            bonus.strength += item.stats.strength || 0;
                            bonus.intelligence += item.stats.intelligence || 0;
                            bonus.agility += item.stats.agility || 0;
                            bonus.vitality += item.stats.vitality || 0;
                            bonus.spirit += item.stats.spirit || 0;
                            bonus.luck += item.stats.luck || 0;
                        }
                    });
                    
                    return {
                        strength: base.strength + bonus.strength,
                        intelligence: base.intelligence + bonus.intelligence,
                        agility: base.agility + bonus.agility,
                        vitality: base.vitality + bonus.vitality,
                        spirit: base.spirit + bonus.spirit,
                        luck: base.luck + bonus.luck
                    };
                };
                
                const atkStats = getTotalStats(attacker);
                const defStats = getTotalStats(defender);
                
                const atkStr = atkStats.strength || 10;
                const atkInt = atkStats.intelligence || 10;
                const atkAgil = atkStats.agility || 10;
                const atkSpirit = atkStats.spirit || 10;
                const defVit = defStats.vitality || 10;
                const defSpirit = defStats.spirit || 10;
                const defAgil = defStats.agility || 10;
                const atkLuck = atkStats.luck || 10;

                const isMissValue = Math.random() > (0.7 + (atkAgil - defAgil) * 0.02);
                let damage = 0;
                let isCrit = false;
                let attackType: 'physical' | 'magic' = 'physical';

                if (!isMissValue) {
                    let baseDamage: number;
                    let defense: number;
                    
                    const weaponType = CombatEngine.getWeaponType(attacker.weapon?.name);
                    
                    if (weaponType === 'magic' || attacker.baseClass === 'Mage') {
                        attackType = 'magic';
                        baseDamage = atkInt * 2.2 + atkSpirit * 0.5;
                        defense = defSpirit * 0.6;
                    } else {
                        attackType = 'physical';
                        baseDamage = atkStr * 2 + atkAgil * 0.3;
                        defense = defVit * 0.5 + defAgil * 0.2;
                    }
                    
                    damage = Math.max(1, baseDamage - defense);
                    
                    isCrit = Math.random() < (atkLuck * 0.015);
                    if (isCrit) {
                        damage *= 2;
                    }
                    
                    damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
                    defender.hp = Math.max(0, (defender.hp || 0) - damage);
                }

                const hitQuality = isMissValue ? 'MISS' : (isCrit ? 'CRIT' : 'NORMAL');
                let banter: string | undefined = "";
                const isKill = defender.hp <= 0;

                if (options.generator) {
                    banter = options.generator({
                        eventType: 'COMBAT_ATTACK',
                        speaker: {
                            name: attacker.name,
                            level: attacker.level,
                            baseClass: attacker.baseClass,
                            trait: attacker.trait,
                            socialClass: attacker.socialClass,
                            tribe: attacker.tribe,
                            weapon: attacker.weapon?.name,
                            weaponType: this.getWeaponType(attacker.weapon?.name),
                            stats: attacker.stats,
                            isEnemy: attacker.isEnemy,
                            isVampire: attacker.isVampire || undefined,
                            isAscended: attacker.isAscended || undefined,
                            blessings: attacker.blessings?.map(b => b.toString())
                        },
                        target: {
                            name: defender.name,
                            level: defender.level,
                            baseClass: defender.baseClass,
                            trait: defender.trait,
                            stats: defender.stats,
                            hp: defender.hp,
                            maxHp: defender.maxHp,
                            isEnemy: defender.isEnemy
                        },
                        biome: options.biome,
                        hitQuality,
                        dreadLevel,
                        damage,
                        isKill
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
