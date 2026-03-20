import { BaseClass } from './stats.js';
import { NPCGenerator } from './party.js';
export const BiomeType = {
    Frozen: 'Frozen Caves',
    Crystalline: 'Crystalline Peaks',
    Fungal: 'Fungal Grotto',
    Volcanic: 'Volcanic Depths'
};
export class DungeonManager {
    static getBiome(floor) {
        if (floor <= 10)
            return BiomeType.Frozen;
        if (floor <= 20)
            return BiomeType.Crystalline;
        if (floor <= 30)
            return BiomeType.Fungal;
        return BiomeType.Volcanic;
    }
    static getRoomDescription(type, biome) {
        const descMap = {
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
        return list[Math.floor(Math.random() * list.length)] || "A dark, silent chamber.";
    }
    static generateFloor(floorNumber) {
        const biome = this.getBiome(floorNumber);
        const roomCount = 5 + Math.floor(Math.random() * 11); // 5 to 15 rooms
        const rooms = [];
        for (let i = 0; i < roomCount; i++) {
            let type = 'Corridor';
            if (i === roomCount - 1) {
                type = floorNumber % 10 === 0 ? 'Boss' : 'Encounter'; // Boss on 10th floor
            }
            else {
                const roll = Math.random();
                if (roll < 0.2)
                    type = 'Corridor';
                else if (roll < 0.8)
                    type = 'Encounter';
                else if (roll < 0.95)
                    type = 'Cache';
                else
                    type = 'Rest';
            }
            const enemies = [];
            if (type === 'Encounter' || type === 'Boss') {
                const isBoss = type === 'Boss';
                const baseCount = floorNumber === 1 ? 1 : 1 + Math.floor(floorNumber / 20);
                const enemyCount = isBoss ? baseCount + 1 : baseCount + Math.floor(Math.random() * 2);
                for (let j = 0; j < Math.min(4, enemyCount); j++) {
                    const level = isBoss ? floorNumber + 2 : (floorNumber === 1 ? 1 : floorNumber);
                    const npc = NPCGenerator.generateNPC(level, 0);
                    if (floorNumber === 1) {
                        npc.stats.strength *= 0.6;
                        npc.stats.vitality *= 0.6;
                        npc.hp = Math.floor(npc.hp * 0.6);
                        npc.maxHp = npc.hp;
                    }
                    enemies.push({
                        ...npc,
                        id: `${type}_${floorNumber}_${i}_${j}`,
                        isEnemy: true,
                        name: isBoss ? `Guard of the Deep` : npc.name
                    });
                }
            }
            rooms.push({
                id: `room_${floorNumber}_${i}`,
                type,
                description: this.getRoomDescription(type, biome),
                ...(enemies.length > 0 ? { enemies } : {})
            });
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
//# sourceMappingURL=dungeon.js.map