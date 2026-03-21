import { BaseClass } from './stats';
import { EnemyGenerator } from './enemyGenerator';
import type { GeneratedEnemy } from './enemyGenerator';
import type { Combatant } from './combat';

export const BiomeType = {
    Frozen: 'Frozen Caves',
    Crystalline: 'Crystalline Peaks',
    Fungal: 'Fungal Grotto',
    Volcanic: 'Volcanic Depths'
} as const;
export type BiomeType = (typeof BiomeType)[keyof typeof BiomeType];

export interface DungeonRoom {
    id: string;
    type: 'Corridor' | 'Encounter' | 'Cache' | 'Boss' | 'Rest';
    description: string;
    enemies?: GeneratedEnemy[];
    loot?: any;
}

export interface DungeonFloor {
    floorNumber: number;
    biome: BiomeType;
    rooms: DungeonRoom[];
    lootMultiplier: number;
    goldMultiplier: number;
}

export class DungeonManager {
    static getBiome(floor: number): BiomeType {
        if (floor <= 10) return BiomeType.Frozen;
        if (floor <= 20) return BiomeType.Crystalline;
        if (floor <= 30) return BiomeType.Fungal;
        return BiomeType.Volcanic;
    }

    private static getRoomDescription(type: DungeonRoom['type'], biome: BiomeType): string {
        const descMap: Record<BiomeType, Record<DungeonRoom['type'], string[]>> = {
            [BiomeType.Frozen]: {
                Corridor: ["A narrow passage of jagged ice.", "The walls weep frozen tears.", "Icy mist clings to your boots."],
                Encounter: ["A cluster of frozen statues... or are they?", "Shadows flit between frost-laden pillars.", "The air crackles with malevolent cold."],
                Cache: ["A glint of metal beneath a layer of permafrost.", "An ancient crate, preserved in a block of ice.", "A frozen chest waits in the center of the hall."],
                Boss: ["The throne of the Frost King looms ahead.", "An arena of pure, unyielding ice."],
                Rest: ["A rare pocket of warmth near a geothermal vent.", "A sheltered alcove where the wind finally dies."]
            },
            [BiomeType.Crystalline]: {
                Corridor: ["Humming vibrations echo from the crystal walls.", "Refractions of light dance in the silence.", "The ground is slick with crystalline dust."],
                Encounter: ["Prismatic shards shift and stir as you approach.", "Echoes of ancient songs resonate from the walls.", "Light bends unnaturally around the figures ahead."],
                Cache: ["A chest made of hollowed quartz.", "Loot scattered amongst the jagged crystals.", "A pile of discarded gear amidst the gems."],
                Boss: ["The Great Resonator hums with terrifying power.", "The heart of the crystal spire."],
                Rest: ["A quiet space where the crystals glow with a soft amber light.", "The harmonic resonance here is oddly calming."]
            },
            [BiomeType.Fungal]: {
                Corridor: ["Spores hang thick in the damp air.", "Strange fungi pulse with bioluminescent light.", "The walls are alive with creeping moss."],
                Encounter: ["Tentacles of mold reach out from the shadows.", "A swarm of spores coalesces into a familiar shape.", "The ground surges as something moves beneath the rot."],
                Cache: ["A chest covered in thick, sticky lichen.", "Loot hidden within a giant puffball.", "Vines protect a discarded satchel."],
                Boss: ["The Mycelial Heart thumps with a wet sound.", "The Apex Spore awaits its next meal."],
                Rest: ["A circle of mushrooms that seem to filter the air.", "A dry patch of ground away from the dripping slime."]
            },
            [BiomeType.Volcanic]: {
                Corridor: ["Rivers of magma flow beneath the grating.", "The air is scorched and dry.", "The smell of sulfur is overwhelming."],
                Encounter: ["Burning eyes watch you from the vents.", "The heat itself seems to take form.", "Obsidian guards block the path ahead."],
                Cache: ["A chest of tempered steel on a bed of ash.", "Loot salvaged from a lava-scorched room.", "A scorched pile of armor hides a treasure."],
                Boss: ["The Maw of the Inferno opens before you.", "The Lord of Cinders awakens."],
                Rest: ["An obsidian shelf where the heat is somewhat bearable.", "A stone platform away from the lava flows."]
            }
        };

        const biomeGroup = descMap[biome] || descMap[BiomeType.Frozen];
        const list = biomeGroup[type] || biomeGroup['Corridor'];
        return list[Math.floor(Math.random() * list.length)]! || "A dark, silent chamber.";
    }

    static generateFloor(floorNumber: number): DungeonFloor {
        const biome = this.getBiome(floorNumber);
        const roomCount = 5 + Math.floor(Math.random() * 11); // 5 to 15 rooms
        const rooms: DungeonRoom[] = [];

        for (let i = 0; i < roomCount; i++) {
            let type: DungeonRoom['type'] = 'Corridor';
            if (i === roomCount - 1) {
                type = floorNumber % 10 === 0 ? 'Boss' : 'Encounter'; // Boss on 10th floor
            } else {
                const roll = Math.random();
                if (roll < 0.2) type = 'Corridor';
                else if (roll < 0.8) type = 'Encounter';
                else if (roll < 0.95) type = 'Cache';
                else type = 'Rest';
            }

            const enemies: GeneratedEnemy[] = [];
            const roomId = `room_${floorNumber}_${i}`;
            
            if (type === 'Encounter' || type === 'Boss') {
                const isBoss = type === 'Boss';

                if (isBoss) {
                    enemies.push(...EnemyGenerator.generateBossSet(biome, floorNumber, i));
                } else {
                    const enemyCount = EnemyGenerator.generateEncounterCount(floorNumber);
                    enemies.push(...EnemyGenerator.generateEnemySet(biome, floorNumber, enemyCount, roomId));
                    
                    if (floorNumber === 1) {
                        enemies.forEach(enemy => {
                            enemy.stats.strength = Math.floor(enemy.stats.strength * 0.6);
                            enemy.stats.intelligence = Math.floor(enemy.stats.intelligence * 0.6);
                            enemy.stats.agility = Math.floor(enemy.stats.agility * 0.6);
                            enemy.stats.vitality = Math.floor(enemy.stats.vitality * 0.6);
                            enemy.stats.spirit = Math.floor(enemy.stats.spirit * 0.6);
                            enemy.stats.luck = Math.floor(enemy.stats.luck * 0.6);
                            enemy.hp = Math.floor(enemy.hp * 0.6);
                            enemy.maxHp = enemy.hp;
                        });
                    }
                }
            }

            const enemyDescription = enemies.length > 0 ? EnemyGenerator.getEnemyDescription(enemies) : '';
            const baseDescription = this.getRoomDescription(type, biome);
            const fullDescription = enemyDescription ? `${baseDescription} (${enemyDescription})` : baseDescription;

            rooms.push({
                id: roomId,
                type,
                description: fullDescription,
                ...(enemies.length > 0 ? { enemies } : {})
            } as DungeonRoom);
        }

        return {
            floorNumber,
            biome,
            rooms,
            lootMultiplier: 1 + (floorNumber * 0.05),
            goldMultiplier: 1 + (floorNumber * 0.1)
        };
    }
}
