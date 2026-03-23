import { CombatEngine } from '../../shared/src/combat.js';
import type { CombatEvent, Combatant, NightsdeepTrait } from '../../shared/src/combat.js';
import { ItemGenerator, Rarity, DungeonManager } from '../../shared/src/index.js';
import type { Item } from '../../shared/src/items.js';
import { prisma } from './db.js';

const BANTER: Record<NightsdeepTrait, string[]> = {
    Stoic: [
        "...",
        "Hmph.",
        "Steel yourself.",
        "Focus."
    ],
    Cheerful: [
        "We've got this!",
        "Look at that shiny loot!",
        "The Deep isn't so scary with friends.",
        "Great job, everyone!"
    ],
    'Hot-Headed': [
        "Get out of my way!",
        "I'll crush them all!",
        "Is that the best you've got?",
        "More! I need more!"
    ]
};

const EMOJI_TAGS = ['🔥', '❄️', '⚡', '✨'];

const MIRACLE_EFFECTS: Record<string, string> = {
    'See the Truth': 'The party sees through the darkness. Accuracy increased!',
    'Blessing of Blood': 'Saluwan\'s fire burns in their veins. Extra damage dealt!',
    'Saluwan\'s Wrath': 'A righteous fury takes hold. Strength increased!',
    'Cleanse the Mind': 'Fear is purged. The party stands firm.',
    'Walk the Flames': 'The heat of The Deep is ignored. Vitality increased!',
    'Mark the Path': 'Saluwan guides their blades. Crit chance increased!'
};

export class SnapshotService {
    static async calculateOfflineProgress(
        timeElapsedMs: number,
        party: Combatant[],
        startFloor: number,
        playerId: string
    ): Promise<{ 
        events: CombatEvent[]; 
        gold: number; 
        items: Item[]; 
        lostGear?: Item[];
        wiped: boolean; 
        finalFloor: number; 
    }> {
        const timeElapsedMin = Math.floor(timeElapsedMs / (1000 * 60));
        const ticks = Math.min(Math.floor(timeElapsedMin / 2), 720); // 1 check every 2 minutes, max 24 hours
        
        // Deep copy party to avoid mutating the original
        const partyCopy = party.map(m => ({
            ...m,
            stats: { ...m.stats }
        }));
        
        let currentGold = 0;
        const foundItems: Item[] = [];
        const allEvents: CombatEvent[] = [];
        let currentFloor = startFloor;
        let wiped = false;
        const lostGear: Item[] = [];

        for (let i = 0; i < ticks; i++) {
            if (wiped) break;

            // Passive Healing: 5% HP per tick (every 2 minutes) for wounded members
            let healedThisTick = false;
            partyCopy.forEach(member => {
                if (member.hp > 0 && member.hp < member.maxHp) {
                    const healAmount = Math.floor(member.maxHp * 0.05);
                    const newHp = Math.min(member.maxHp, member.hp + healAmount);
                    if (newHp !== member.hp) {
                        member.hp = newHp;
                        healedThisTick = true;
                    }
                }
            });


            // Handle Miracles
            partyCopy.forEach(member => {
                if (!member.isVampire && member.piety && member.piety > 0) {
                    const miracleChance = (member.piety / 100) * 0.05;
                    if (Math.random() < miracleChance) {
                        const blessing = member.blessings?.[0] || 'See the Truth';
                        allEvents.push({
                            id: `miracle-${member.id}-${i}`,
                            turn: i,
                            attackerName: member.name,
                            defenderName: 'THE DEEP',
                            attackerId: member.id,
                            defenderId: 'the-deep',
                            damage: 0,
                            isCrit: false,
                            isMiss: false,
                            remainingHp: 0,
                            banter: `MIRACLE: ${MIRACLE_EFFECTS[blessing]}`,
                            emojiTag: '✨'
                        });
                        
                        // Apply temporary buff for this tick simulation if needed
                        if (blessing === 'Saluwan\'s Wrath') {
                            partyCopy.forEach(p => p.stats.strength *= 1.2);
                        } else if (blessing === 'Mark the Path') {
                            partyCopy.forEach(p => p.stats.luck *= 1.5);
                        }
                    }
                }
            });

            // Handle Aether Breach (Rare high-risk event)
            let floorMultiplier = 1.0;
            const isBreach = Math.random() < 0.01; // 1% chance
            
            if (isBreach) {
                floorMultiplier *= 5;
                allEvents.push({
                    id: `breach-${i}`,
                    turn: i,
                    attackerName: 'THE VOID',
                    defenderName: 'Reality',
                    attackerId: 'the-void',
                    defenderId: 'reality',
                    damage: 0,
                    isCrit: false,
                    isMiss: false,
                    remainingHp: 0,
                    banter: "AN AETHER BREACH HAS OPENED! The Deep's riches pour forth, but the shadows grow hungrier...",
                    emojiTag: '🌀',
                    isAetherBreach: true
                });

                // 10% chance for Abyssal Relic during Breach
                if (Math.random() < 0.1) {
                    const relic = ItemGenerator.generateRelic(currentFloor);
                    foundItems.push(relic);
                    allEvents.push({
                        id: `relic-${relic.id}-${i}`,
                        turn: i,
                        attackerName: 'THE VOID',
                        defenderName: 'FOUND',
                        attackerId: 'the-void',
                        defenderId: 'found',
                        damage: 0,
                        isCrit: false,
                        isMiss: false,
                        remainingHp: 0,
                        banter: `A relic of the ancient world has been pulled from the rift: ${relic.name}!`,
                        emojiTag: '🌌'
                    });
                }
            }

            const floorData = DungeonManager.generateFloor(currentFloor);
            floorMultiplier = 1.0;
            
            for (const room of floorData.rooms) {
                if (wiped) break;

                const effectiveLevel = isBreach ? floorData.floorNumber + 10 : floorData.floorNumber;
                const enemies = (room.enemies || []).map(e => ({ ...e, level: effectiveLevel, isEnemy: true } as Combatant));
                
                if (enemies.length > 0) {
                    const result = CombatEngine.simulate(partyCopy, enemies);
                    
                    // Add GDD-compliant metadata to events
                    result.events.forEach(event => {
                        if (Math.random() > 0.8) {
                            const speaker = partyCopy[Math.floor(Math.random() * partyCopy.length)];
                            if (speaker?.trait) {
                                const banterPool = BANTER[speaker.trait];
                                const banter = banterPool[Math.floor(Math.random() * banterPool.length)];
                                if (banter) event.banter = banter;
                            }
                            const tag = EMOJI_TAGS[Math.floor(Math.random() * EMOJI_TAGS.length)];
                            if (tag) event.emojiTag = tag;
                        }
                    });

                    allEvents.push(...result.events);

                    if (!result.victory) {
                        wiped = true;
                        await this.handleWipe(playerId, partyCopy[0]?.name || 'Bondi', currentFloor);

                        // Gear loss logic: Non-soulbound gear on all fallen members is lost
                        partyCopy.forEach(member => {
                            [member.weapon, member.armor, member.accessory].forEach(item => {
                                if (item && !item.isSoulBound) {
                                    lostGear.push(item);
                                }
                            });
                        });

                        // Add Wipe Event
                        allEvents.push({
                            id: `wipe-${i}`,
                            turn: i,
                            attackerName: 'SYSTEM',
                            defenderName: partyCopy[0]?.name || 'Bondi',
                            attackerId: 'system',
                            defenderId: partyCopy[0]?.id || 'unknown',
                            damage: 0,
                            isCrit: false,
                            isMiss: false,
                            remainingHp: 0,
                            banter: "The party has fallen into the darkness of The Deep...",
                            corpseData: { playerId, floor: currentFloor },
                            emojiTag: '💀'
                        });
                        break;
                    }
                }

                // If room cleared (even if no combat)
                if (room.type === 'Cache' || room.type === 'Rest') {
                    // Caches and Rests could have special logic, for now just log exploration
                }
            }

            if (!wiped) {
                currentGold += Math.floor(10 * floorData.goldMultiplier * floorMultiplier);
                currentFloor++;
                
                // Item degradation logic: -1 durability per win
                partyCopy.forEach(member => {
                    this.degradeGear(member, 1);
                });
            }
        }

        return {
            events: allEvents,
            gold: wiped ? Math.round(currentGold * 0.9) : currentGold,
            items: foundItems,
            lostGear,
            wiped,
            finalFloor: currentFloor
        };
    }


    private static degradeGear(member: Combatant, amount: number) {
        [member.weapon, member.armor, member.accessory].forEach(item => {
            if (item) {
                item.durability = Math.max(0, item.durability - amount);
            }
        });
    }

    private static async handleWipe(playerId: string, playerName: string, floor: number) {
        await prisma.corpse.create({
            data: {
                playerId,
                playerName,
                floor
            }
        });
    }

    static async getCorpses() {
        return await prisma.corpse.findMany({
            orderBy: { timestamp: 'desc' }
        });
    }

    static async layToRest(corpseId: string) {
        try {
            await prisma.corpse.delete({
                where: { id: corpseId }
            });
            return true;
        } catch (error) {
            return false;
        }
    }
}
