import { BaseClass } from './stats';
import { EnemyGenerator } from './enemyGenerator';
import type { GeneratedEnemy } from './enemyGenerator';
import type { Combatant } from './combat';

export const BiomeType = {
    Frozen: 'Frozen Caves',
    Crystalline: 'Crystalline Peaks',
    Fungal: 'Fungal Grotto',
    Volcanic: 'Volcanic Depths',
    Shadow: 'Shadow Realm',
    Abyssal: 'Abyssal Depths',
    Twilight: 'Twilight Hollow',
    Iron: 'Iron Fortress',
    Haunted: 'Haunted Catacombs',
    Blood: 'Blood Marsh',
    Storm: 'Storm Wastes',
    Corrupted: 'Corrupted Grove',
    Library: 'Ancient Library',
    Wasteland: 'Frozen Wasteland',
    Core: 'Magma Core',
    Dream: 'Dream Nexus',
    Void: 'Void Corridor',
    Luminous: 'Luminous Grotto',
    Shattered: 'Shattered Realm',
    Prison: 'Eternal Prison',
    Bio: 'Bioluminescent Deep',
    Foundry: 'Rusty Foundry',
    Ethereal: 'Ethereal Maze',
    Descent: 'The Final Descent',
    Deep: 'The Deep'
} as const;
export type BiomeType = (typeof BiomeType)[keyof typeof BiomeType];

export interface DungeonRoom {
    id: string;
    type: 'Corridor' | 'Encounter' | 'Cache' | 'Boss' | 'Rest' | 'Gate' | 'DeepBoss';
    description: string;
    enemies?: GeneratedEnemy[];
    loot?: any;
    gateRequired?: number;
}

export interface DungeonFloor {
    floorNumber: number;
    biome: BiomeType;
    rooms: DungeonRoom[];
    lootMultiplier: number;
    goldMultiplier: number;
}

const BIOME_LIST: BiomeType[] = [
    BiomeType.Frozen,
    BiomeType.Crystalline,
    BiomeType.Fungal,
    BiomeType.Volcanic,
    BiomeType.Shadow,
    BiomeType.Abyssal,
    BiomeType.Twilight,
    BiomeType.Iron,
    BiomeType.Haunted,
    BiomeType.Blood,
    BiomeType.Storm,
    BiomeType.Corrupted,
    BiomeType.Library,
    BiomeType.Wasteland,
    BiomeType.Core,
    BiomeType.Dream,
    BiomeType.Void,
    BiomeType.Luminous,
    BiomeType.Shattered,
    BiomeType.Prison,
    BiomeType.Bio,
    BiomeType.Foundry,
    BiomeType.Ethereal,
    BiomeType.Descent,
    BiomeType.Deep
];

export class DungeonManager {
    static getBiome(floor: number): BiomeType {
        const index = Math.min(Math.floor((floor - 1) / 40), BIOME_LIST.length - 1);
        return BIOME_LIST[index] ?? BiomeType.Frozen;
    }

    private static getRoomDescription(type: DungeonRoom['type'], biome: BiomeType): string {
        const descMap: Record<BiomeType, Record<DungeonRoom['type'], string[]>> = {
            [BiomeType.Frozen]: {
                Corridor: ["A narrow passage of jagged ice.", "The walls weep frozen tears.", "Icy mist clings to your boots."],
                Encounter: ["A cluster of frozen statues... or are they?", "Shadows flit between frost-laden pillars.", "The air crackles with malevolent cold."],
                Cache: ["A glint of metal beneath a layer of permafrost.", "An ancient crate, preserved in a block of ice.", "A frozen chest waits in the center of the hall."],
                Boss: ["The throne of the Frost King looms ahead.", "An arena of pure, unyielding ice."],
                Rest: ["A rare pocket of warmth near a geothermal vent.", "A sheltered alcove where the wind finally dies."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Crystalline]: {
                Corridor: ["Humming vibrations echo from the crystal walls.", "Refractions of light dance in the silence.", "The ground is slick with crystalline dust."],
                Encounter: ["Prismatic shards shift and stir as you approach.", "Echoes of ancient songs resonate from the walls.", "Light bends unnaturally around the figures ahead."],
                Cache: ["A chest made of hollowed quartz.", "Loot scattered amongst the jagged crystals.", "A pile of discarded gear amidst the gems."],
                Boss: ["The Great Resonator hums with terrifying power.", "The heart of the crystal spire."],
                Rest: ["A quiet space where the crystals glow with a soft amber light.", "The harmonic resonance here is oddly calming."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Fungal]: {
                Corridor: ["Spores hang thick in the damp air.", "Strange fungi pulse with bioluminescent light.", "The walls are alive with creeping moss."],
                Encounter: ["Tentacles of mold reach out from the shadows.", "A swarm of spores coalesces into a familiar shape.", "The ground surges as something moves beneath the rot."],
                Cache: ["A chest covered in thick, sticky lichen.", "Loot hidden within a giant puffball.", "Vines protect a discarded satchel."],
                Boss: ["The Mycelial Heart thumps with a wet sound.", "The Apex Spore awaits its next meal."],
                Rest: ["A circle of mushrooms that seem to filter the air.", "A dry patch of ground away from the dripping slime."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Volcanic]: {
                Corridor: ["Rivers of magma flow beneath the grating.", "The air is scorched and dry.", "The smell of sulfur is overwhelming."],
                Encounter: ["Burning eyes watch you from the vents.", "The heat itself seems to take form.", "Obsidian guards block the path ahead."],
                Cache: ["A chest of tempered steel on a bed of ash.", "Loot salvaged from a lava-scorched room.", "A scorched pile of armor hides a treasure."],
                Boss: ["The Maw of the Inferno opens before you.", "The Lord of Cinders awakens."],
                Rest: ["An obsidian shelf where the heat is somewhat bearable.", "A stone platform away from the lava flows."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Shadow]: {
                Corridor: ["Shadows stretch and twist in the darkness.", "The path is cloaked in absolute black.", "Whispers drift from the void ahead."],
                Encounter: ["Silhouettes of forgotten warriors surround you.", "Dark shapes coalesce from the corner of your eye.", "The shadows themselves seem to breathe."],
                Cache: ["A chest half-consumed by darkness.", "Loot barely visible in the void.", "Something glimmers in the black."],
                Boss: ["The Shadow Sovereign rises from the gloom.", "The Lord of Endless Night awaits."],
                Rest: ["A rare pocket where the darkness fades slightly.", "A moment of respite from the endless night."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Abyssal]: {
                Corridor: ["The weight of the deep presses down on you.", "Only darkness and pressure surround you.", "The walls shimmer with bioluminescent fear."],
                Encounter: ["Things from the deep press against you.", "Ancient horrors stir in the abyss.", "Creatures of impossible shapes dart in the gloom."],
                Cache: ["A chest from a lost ship.", "Treasure from a drowned kingdom.", "Something precious from the ocean floor."],
                Boss: ["The Leviathan of the Depths awakens.", "The Abyssal King rises from the void."],
                Rest: ["A pocket of air in the endless water.", "A shipwreck provides shelter."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Twilight]: {
                Corridor: ["Eternal dusk casts long shadows.", "The sky above is never fully dark, never fully light.", "Fireflies drift in the permanent twilight."],
                Encounter: ["Twilight creatures stalk the edges.", "Things that fear both light and dark.", "The boundary between worlds grows thin."],
                Cache: ["A chest bathed in perpetual dusk.", "Loot from a forgotten twilight kingdom.", "Artifacts of the in-between."],
                Boss: ["The Dusk Queen emerges from the gloom.", "The Twilight Tyrant commands the eternal dusk."],
                Rest: ["A glade where the twilight is gentle.", "A shelter from both day and night."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Iron]: {
                Corridor: ["Metal corridors stretch endlessly.", "The clang of distant forges echoes.", "Rust and blood mark the walls."],
                Encounter: ["Iron constructs awaken.", "War machines of ancient design.", "Soldiers trapped in eternal steel."],
                Cache: ["A chest of polished steel.", "Weapons from the iron age.", "Armament of a lost army."],
                Boss: ["The Iron Warlord commands the fortress.", "The Steel Colossus rises to challenge you."],
                Rest: ["A forge that has gone cold.", "A barracks with empty beds."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Haunted]: {
                Corridor: ["Ghostly figures pass through walls.", "Moaning winds fill the corridors.", "Cold spots mark where the dead linger."],
                Encounter: ["Phantoms of the past attack.", "Spirits wronged in life seek vengeance.", "The restless dead walk again."],
                Cache: ["A chest that phases through reality.", "Haunted treasures of great power.", "Remnants of the departed."],
                Boss: ["The Spectral King commands the dead.", "The Poltergeist Prince manifests."],
                Rest: ["A circle of salt wards off the spirits.", "A shrine to the departed."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Blood]: {
                Corridor: ["The ground squelches with each step.", "Blood-red mist fills the air.", "The smell of copper is overwhelming."],
                Encounter: ["Vampires and blood beasts emerge.", "The cursed hunt the living.", "Blood-fed monstrosities lunge."],
                Cache: ["A chest coated in dried blood.", "Cursed blood-gold.", "Artifacts of the sanguine."],
                Boss: ["The Blood Lord commands the crimson horde.", "The Vampire King rises."],
                Rest: ["A pool of somewhat clear water.", "Shelter from the blood rain."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Storm]: {
                Corridor: ["Lightning cracks through the air.", "Violent winds tear at your clothes.", "Thunder shakes the very stone."],
                Encounter: ["Storm elementals rage.", "Lightning-wraiths strike from clouds.", "Windigos charge through the gale."],
                Cache: ["A chest protected by lightning.", "Storm-touched artifacts.", "Weapons of the tempest."],
                Boss: ["The Storm King commands lightning.", "The Thunder Lord descends."],
                Rest: ["A cave protected from the wind.", "An eye of the storm."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Corrupted]: {
                Corridor: ["The corruption eats at reality itself.", "Grotesque growths cover the walls.", "The air itself feels tainted."],
                Encounter: ["Corrupted creatures attack.", "The tainted hunt the pure.", "Things that should not be manifest."],
                Cache: ["A chest of corrupted crystal.", "Cursed artifacts of old.", "Remnants of a corrupted kingdom."],
                Boss: ["The Corruption Lord spreads the plague.", "The Blighted One commands the foul."],
                Rest: ["Clean water flows here.", "A rare spot of purity."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Library]: {
                Corridor: ["Endless shelves of ancient tomes.", "Knowledge floats in the air.", "Words write themselves on the walls."],
                Encounter: ["Animated books attack.", "Knowledge made manifest.", "Librarians of the arcane."],
                Cache: ["A chest of rare scrolls.", "Lost tomes of power.", "Ancient wisdom preserved."],
                Boss: ["The Archivist commands the library.", "The Keeper of All Knowledge awakens."],
                Rest: ["A reading nook with comfortable chairs.", "A quiet corner between shelves."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Wasteland]: {
                Corridor: ["Barren wastes stretch endlessly.", "Scorched earth crunches underfoot.", "The sun beats down mercilessly."],
                Encounter: ["Scavengers emerge from the wastes.", "Heat spirits shimmer in the distance.", "The desperate and deranged."],
                Cache: ["A chest from a collapsed shelter.", "Remnants of a dead civilization.", "Precious water and supplies."],
                Boss: ["The Wasteland Warlord commands the dunes.", "The Scorched King rises from the ashes."],
                Rest: ["A shaded crevice.", "An oasis in the waste."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Core]: {
                Corridor: ["Molten rivers flow through channels.", "The heat is beyond mortal endurance.", "The planet's heart beats beneath you."],
                Encounter: ["Fire elementals of impossible heat.", "Magma creatures emerge.", "The core itself fights back."],
                Cache: ["A chest of obsidian.", "Gems from the earth's heart.", "Fire-forged weapons."],
                Boss: ["The Core Guardian awakens.", "The Molten Titan rises."],
                Rest: ["A cool vent provides relief.", "Lava tubes offer shelter."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Dream]: {
                Corridor: ["The floor shifts like sand.", "Impossible geometries twist reality.", "You walk through memories."],
                Encounter: ["Nightmares made flesh attack.", "Dreams given form hunt you.", "The subconscious fights back."],
                Cache: ["A chest of dream-stuff.", "Memories of great value.", "Lucid artifacts."],
                Boss: ["The Dreamlord commands the unconscious.", "The Nightmare King awakens."],
                Rest: ["A dream of peace.", "A quiet corner of REM sleep."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Void]: {
                Corridor: ["Absolute nothing surrounds you.", "You float through emptiness.", "Stars are visible in the black."],
                Encounter: ["Void creatures consume all.", "Nothing-made-manifest attacks.", "Entities of pure absence."],
                Cache: ["A chest from beyond reality.", "Artifacts of the cosmos.", "Stardust and dark matter."],
                Boss: ["The Void Emperor commands nothing.", "The Absence awakens."],
                Rest: ["A pocket of reality remains.", "A small bubble in the void."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Luminous]: {
                Corridor: ["Everything glows with soft light.", "Bioluminescence illuminates the way.", "The glow is gentle, but constant."],
                Encounter: ["Radiant creatures emerge.", "Light elementals dance.", "Beings of pure luminescence."],
                Cache: ["A chest of glowing gems.", "Light-infused artifacts.", "Radiant treasures."],
                Boss: ["The Luminous Sovereign commands light.", "The Radiant King blazes forth."],
                Rest: ["A shadow provides darkness.", "A moment away from the glow."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Shattered]: {
                Corridor: ["Fragments of reality drift around you.", "The world is broken into pieces.", "Shards of existence float in space."],
                Encounter: ["Fractured beings attack.", "Shards given purpose hunt you.", "Broken things seek wholeness."],
                Cache: ["A chest of crystallized time.", "Fragments of power.", "Shards of legendary items."],
                Boss: ["The Shattered Lord seeks to rebuild.", "The Fragment King commands pieces."],
                Rest: ["A stable fragment provides safety.", "A moment of wholeness."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Prison]: {
                Corridor: ["Endless cells line the walls.", "Echoes of suffering fill the air.", "The condemned never left."],
                Encounter: ["Prisoners wronged seek release.", "Guards turned monsters hunt.", "The caged rage against you."],
                Cache: ["A chest of confiscated goods.", "Treasures of the condemned.", "Keys to forgotten cells."],
                Boss: ["The Prison Warden commands the caged.", "The Jailer of Souls awakens."],
                Rest: ["An empty cell provides privacy.", "A moment away from the suffering."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Bio]: {
                Corridor: ["Organic tunnels pulse with life.", "The walls breathe.", "Living architecture surrounds you."],
                Encounter: ["Bio-creatures emerge from flesh.", "Genetic horrors hunt.", "Mutated things seek sustenance."],
                Cache: ["A chest of biological treasures.", "DNA of extinct creatures.", "Organic artifacts."],
                Boss: ["The Bio-Titan commands the flesh.", "The Hive Mind awakens."],
                Rest: ["A cocoon of protection.", "A safe pocket of flesh."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Foundry]: {
                Corridor: ["Rusted metal creaks and groans.", "Steam hisses from broken pipes.", "The smell of rust and oil pervades."],
                Encounter: ["Rust monsters and steam constructs.", "Forgotten machines come alive.", "Workers fused with metal."],
                Cache: ["A chest of machine parts.", "Oil-infused treasures.", "Steam-powered artifacts."],
                Boss: ["The Foundry Lord commands rust.", "The Iron Golem awakens."],
                Rest: ["A quiet corner away from the noise.", "A place where the machines rest."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Ethereal]: {
                Corridor: ["You walk between worlds.", "The veil is thin here.", "Spirits pass through your body."],
                Encounter: ["Ethereal beings attack.", "Ghosts of the living.", "Things from the in-between."],
                Cache: ["A chest that phases in and out.", "Spirits' treasures.", "Veil-faded artifacts."],
                Boss: ["The Ethereal Sovereign commands the boundary.", "The Ghost King manifests."],
                Rest: ["A moment of corporeality.", "A solid spot in the ethereal."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Descent]: {
                Corridor: ["The final descent into darkness.", "Only deeper and darker remains.", "The end is near."],
                Encounter: ["The deepest horrors emerge.", "Things that should never see light.", "The void's children hunt."],
                Cache: ["Priceless treasures of the deep.", "Relics of the first descent.", "Ancient artifacts."],
                Boss: ["The Descent Lord commands the fall.", "The Final Guardian stands."],
                Rest: ["The last safe place.", "A moment before the end."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            },
            [BiomeType.Deep]: {
                Corridor: ["You have reached the bottom.", "The weight of existence presses.", "This is the end of all things."],
                Encounter: ["Everything that ever was attacks.", "The Deep itself fights back.", "All your fears manifest."],
                Cache: ["Infinite treasure.", "The sum of all knowledge.", "Power beyond comprehension."],
                Boss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back.", "Nothingness consumes all."],
                Rest: ["The last rest.", "A moment of peace before the end."],
                Gate: ["A massive golden gate blocks your path.", "Ancient runes glow as you approach the barrier.", "The Gate of the Deep looms before you."],
                DeepBoss: ["THE DEEP ITSELF AWAKENS.", "The void between worlds stares back at you.", "Nothingness consumes all."]
            }
        };

        const biomeGroup = descMap[biome] || descMap[BiomeType.Frozen];
        const typeList = biomeGroup[type];
        if (typeList && typeList.length > 0) {
            return typeList[Math.floor(Math.random() * typeList.length)]!;
        }
        return "A dark, silent chamber.";
    }

    static generateFloor(floorNumber: number): DungeonFloor {
        const biome = this.getBiome(floorNumber);
        const roomCount = 5 + Math.floor(Math.random() * 11); // 5 to 15 rooms
        const rooms: DungeonRoom[] = [];

        for (let i = 0; i < roomCount; i++) {
            let type: DungeonRoom['type'] = 'Corridor';
            
            // Gate every 100 levels
            if (floorNumber % 100 === 0 && floorNumber < 1000) {
                if (i === 0) {
                    type = 'Gate';
                } else if (i === roomCount - 1) {
                    type = 'Boss';
                }
            } else if (floorNumber === 1000) {
                // Final battle
                if (i === roomCount - 1) {
                    type = 'DeepBoss';
                }
            } else if (i === roomCount - 1) {
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
            let gateRequired = 0;
            
            if (type === 'Gate') {
                gateRequired = floorNumber * 500; // Gold required to unlock gate
                const room: DungeonRoom = {
                    id: roomId,
                    type: 'Gate',
                    description: this.getRoomDescription(type, biome),
                    gateRequired
                };
                rooms.push(room);
                continue;
            }
            
            if (type === 'DeepBoss') {
                enemies.push(...EnemyGenerator.generateDeepBoss(biome, floorNumber));
            } else if (type === 'Encounter' || type === 'Boss') {
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
