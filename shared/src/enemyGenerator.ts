import type { Combatant, NightsdeepTrait } from './combat.js';
import { BiomeType } from './dungeon.js';
import { BaseClass, StatCalculator } from './stats.js';

interface EnemyTemplate {
    name: string;
    names: string[];
    description: string;
    baseHpMultiplier: number;
    strengthMultiplier: number;
    vitalityMultiplier: number;
    defenseMultiplier: number;
    speedMultiplier: number;
    luckMultiplier: number;
    trait: NightsdeepTrait;
    weaponType: 'sword' | 'axe' | 'spear' | 'dagger' | 'hammer' | 'fist' | 'claw' | 'magic' | 'natural';
    spawnWeight: number;
}

interface EnemySet {
    name: string;
    minCount: number;
    maxCount: number;
    templates: EnemyTemplate[];
}

const FROZEN_CAVES_ENEMIES: EnemyTemplate[] = [
    { name: "Frost Wraith", names: ["Mistshroud", "Niflheim", "Frostfang", "Gelid", "Cryonex"], description: "A spirit frozen in eternal ice, its touch burns with bitter cold.", baseHpMultiplier: 0.8, strengthMultiplier: 1.1, vitalityMultiplier: 0.7, defenseMultiplier: 0.9, speedMultiplier: 1.2, luckMultiplier: 0.8, trait: 'Stoic', weaponType: 'magic', spawnWeight: 15 },
    { name: "Ice Ravager", names: ["Glacius", "Shiver", "Rimeclaw", "Frostmaw", "Blizzara"], description: "A hulking brute wrapped in living ice, shattering all before it.", baseHpMultiplier: 1.5, strengthMultiplier: 1.4, vitalityMultiplier: 1.3, defenseMultiplier: 1.2, speedMultiplier: 0.7, luckMultiplier: 0.6, trait: 'Stoic', weaponType: 'hammer', spawnWeight: 12 },
    { name: "Frost Archer", names: ["Iceweaver", "Sleet", "Arrowflight", "Coldsnap", "Flurry"], description: "A deadly marksman who fires shafts of pure ice from the shadows.", baseHpMultiplier: 0.7, strengthMultiplier: 0.9, vitalityMultiplier: 0.6, defenseMultiplier: 0.7, speedMultiplier: 1.3, luckMultiplier: 1.0, trait: 'Cheerful', weaponType: 'spear', spawnWeight: 14 },
    { name: "Glacier Knight", names: ["Avalanche", "Iceheart", "Frostborn", "Coldmantle", "Gelidion"], description: "An armored sentinel sworn to protect the frozen depths.", baseHpMultiplier: 1.2, strengthMultiplier: 1.2, vitalityMultiplier: 1.1, defenseMultiplier: 1.5, speedMultiplier: 0.8, luckMultiplier: 0.7, trait: 'Stoic', weaponType: 'sword', spawnWeight: 10 },
    { name: "Chillspawn", names: ["Shiverling", "Frostbite", "Icewhelp", "Gelidkin", "Cryon"], description: "Young ice creatures that hunt in packs, their numbers overwhelming.", baseHpMultiplier: 0.5, strengthMultiplier: 0.7, vitalityMultiplier: 0.5, defenseMultiplier: 0.5, speedMultiplier: 1.4, luckMultiplier: 0.9, trait: 'Hot-Headed', weaponType: 'claw', spawnWeight: 18 },
    { name: "Permafrost Elemental", names: ["Ancientone", "Tundran", "Glaciara", "Winterborn", "Frostfather"], description: "A primordial force of frozen death, ancient and terrible.", baseHpMultiplier: 2.0, strengthMultiplier: 1.6, vitalityMultiplier: 1.8, defenseMultiplier: 1.4, speedMultiplier: 0.6, luckMultiplier: 0.5, trait: 'Stoic', weaponType: 'natural', spawnWeight: 6 },
    { name: "Icecult Zealot", names: ["Frostspeaker", "Deepfreeze", "Winterbite", "Coldsoul", "Icevein"], description: "A fanatic who has embraced the cold, losing flesh for power.", baseHpMultiplier: 0.9, strengthMultiplier: 1.0, vitalityMultiplier: 0.8, defenseMultiplier: 0.8, speedMultiplier: 1.1, luckMultiplier: 0.8, trait: 'Hot-Headed', weaponType: 'dagger', spawnWeight: 13 },
    { name: "Frozen Hound", names: ["Icefang", "Snowmaw", "Frostbite", "Gelidwolf", "Blizzard"], description: "A wolf corrupted by eternal winter, hunting with supernatural cunning.", baseHpMultiplier: 1.0, strengthMultiplier: 1.1, vitalityMultiplier: 0.9, defenseMultiplier: 0.8, speedMultiplier: 1.5, luckMultiplier: 0.7, trait: 'Hot-Headed', weaponType: 'claw', spawnWeight: 12 },
];

const CRYSTALLINE_PEAKS_ENEMIES: EnemyTemplate[] = [
    { name: "Prismatic Stalker", names: ["Refraction", "Luminant", "Spectrum", "Prismeye", "Shardweaver"], description: "A creature of living crystal that refracts light into deadly beams.", baseHpMultiplier: 0.9, strengthMultiplier: 1.0, vitalityMultiplier: 0.8, defenseMultiplier: 1.1, speedMultiplier: 1.2, luckMultiplier: 1.1, trait: 'Cheerful', weaponType: 'magic', spawnWeight: 14 },
    { name: "Resonance Knight", names: ["Harmonist", "Vibration", "Oscillate", "Chordborn", "Pitch"], description: "A warrior who channels harmonic frequencies through their crystal blade.", baseHpMultiplier: 1.1, strengthMultiplier: 1.3, vitalityMultiplier: 1.0, defenseMultiplier: 1.2, speedMultiplier: 1.0, luckMultiplier: 0.8, trait: 'Stoic', weaponType: 'sword', spawnWeight: 12 },
    { name: "Shard Sentinel", names: ["Crystalline", "Faceted", "Prismguard", "Gemheart", "Quartzite"], description: "Animated crystal constructs, unfeeling guardians of ancient power.", baseHpMultiplier: 1.3, strengthMultiplier: 1.1, vitalityMultiplier: 1.4, defenseMultiplier: 1.6, speedMultiplier: 0.7, luckMultiplier: 0.5, trait: 'Stoic', weaponType: 'hammer', spawnWeight: 11 },
    { name: "Luminescent Hunter", names: ["Gleamscale", "Sparkwing", "Radiance", "Luminos", "Lustrewing"], description: "A graceful predator with bioluminescent scales that blind their prey.", baseHpMultiplier: 0.8, strengthMultiplier: 0.9, vitalityMultiplier: 0.7, defenseMultiplier: 0.8, speedMultiplier: 1.4, luckMultiplier: 1.0, trait: 'Cheerful', weaponType: 'dagger', spawnWeight: 15 },
    { name: "Crystal Worm", names: ["Tunneler", "Cavernjaw", "Gemgorger", "Stoneburrower", "Quarry"], description: "A massive burrowing horror that devours crystals and grows stronger.", baseHpMultiplier: 1.8, strengthMultiplier: 1.5, vitalityMultiplier: 1.6, defenseMultiplier: 1.3, speedMultiplier: 0.5, luckMultiplier: 0.4, trait: 'Stoic', weaponType: 'natural', spawnWeight: 8 },
    { name: "Prism Mage", names: ["Spectrum Weaver", "Rainbow", "Colorwraith", "Huekeeper", "Chiaroscuro"], description: "A spellcaster who manipulates light itself to devastating effect.", baseHpMultiplier: 0.7, strengthMultiplier: 0.8, vitalityMultiplier: 0.6, defenseMultiplier: 0.7, speedMultiplier: 1.3, luckMultiplier: 1.2, trait: 'Analytical', weaponType: 'magic', spawnWeight: 13 },
    { name: "Facet Swarm", names: ["Shardswarm", "Glassling", "Splintercloud", "Microlith", "Crystalline Spawn"], description: "Countless tiny crystal fragments that move as one deadly mass.", baseHpMultiplier: 0.4, strengthMultiplier: 0.5, vitalityMultiplier: 0.4, defenseMultiplier: 0.6, speedMultiplier: 1.6, luckMultiplier: 0.8, trait: 'Hot-Headed', weaponType: 'natural', spawnWeight: 16 },
    { name: "Echoing Shade", names: ["Resonator", "Harmonic", "Frequencyshift", "Reverberant", "Pitchbender"], description: "A phantom bound to the crystal harmonics, deadly and unpredictable.", baseHpMultiplier: 0.9, strengthMultiplier: 1.0, vitalityMultiplier: 0.7, defenseMultiplier: 0.9, speedMultiplier: 1.1, luckMultiplier: 1.0, trait: 'Hot-Headed', weaponType: 'magic', spawnWeight: 11 },
];

const FUNGAL_GROTTO_ENEMIES: EnemyTemplate[] = [
    { name: "Spore Terror", names: ["Mushling", "Fungicide", "Mycotyx", "Sporemother", "Moldwalker"], description: "A walking mass of fungi and decay, releasing toxic spores with every step.", baseHpMultiplier: 1.2, strengthMultiplier: 1.0, vitalityMultiplier: 1.3, defenseMultiplier: 1.0, speedMultiplier: 0.8, luckMultiplier: 0.7, trait: 'Stoic', weaponType: 'natural', spawnWeight: 15 },
    { name: "Tendril Horror", names: ["Rootclaw", "Vinewhip", "Grasping One", "Mycelium", "Entanglus"], description: "Animated plant matter that wraps prey in suffocating vines.", baseHpMultiplier: 1.0, strengthMultiplier: 1.2, vitalityMultiplier: 1.1, defenseMultiplier: 0.9, speedMultiplier: 0.9, luckMultiplier: 0.6, trait: 'Stoic', weaponType: 'natural', spawnWeight: 14 },
    { name: "Toxic Crawler", names: ["Puffling", "Sporebeetle", "Acidback", "Venomshell", "Corrosion"], description: "A giant insect whose carapace secretes corrosive bile.", baseHpMultiplier: 0.8, strengthMultiplier: 1.0, vitalityMultiplier: 0.8, defenseMultiplier: 1.0, speedMultiplier: 1.3, luckMultiplier: 0.8, trait: 'Hot-Headed', weaponType: 'natural', spawnWeight: 16 },
    { name: "Bioluminescent Nightmare", names: ["Glowmaw", "Luminant", "Phosphor", "Glowspawn", "Luminesca"], description: "Beautiful but deadly, its glow hypnotizes before its toxic embrace.", baseHpMultiplier: 0.9, strengthMultiplier: 0.8, vitalityMultiplier: 0.7, defenseMultiplier: 0.6, speedMultiplier: 1.2, luckMultiplier: 1.1, trait: 'Cheerful', weaponType: 'natural', spawnWeight: 14 },
    { name: "Mycelial Overlord", names: ["Nexus", "The Weave", "Sporeking", "Fungal Throne", "Mycotyrant"], description: "The ancient heart of the fungal network, controlling all lesser spores.", baseHpMultiplier: 2.0, strengthMultiplier: 1.3, vitalityMultiplier: 1.8, defenseMultiplier: 1.2, speedMultiplier: 0.6, luckMultiplier: 0.5, trait: 'Stoic', weaponType: 'natural', spawnWeight: 6 },
    { name: "Slime Mold Beast", names: ["Oozewraith", "Gelatinox", "Amorphus", "Jellicle", "Mucolynx"], description: "A shapeless predator that flows around defenses and engulfs prey.", baseHpMultiplier: 1.1, strengthMultiplier: 0.9, vitalityMultiplier: 1.2, defenseMultiplier: 0.8, speedMultiplier: 1.0, luckMultiplier: 0.9, trait: 'Cheerful', weaponType: 'natural', spawnWeight: 13 },
    { name: "Sporeling Assassin", names: ["Toxic Shadow", "Sporewalker", "Deathpuff", "Miststalker", "Venenox"], description: "Silent killers that release clouds of deadly spores when close.", baseHpMultiplier: 0.6, strengthMultiplier: 1.1, vitalityMultiplier: 0.5, defenseMultiplier: 0.5, speedMultiplier: 1.5, luckMultiplier: 1.0, trait: 'Hot-Headed', weaponType: 'dagger', spawnWeight: 15 },
    { name: "Giant Centipede", names: ["Carapace", "Skitterfangs", "Moltling", "Chitincrawler", "Segmentus"], description: "A massive segmented horror that moves with terrifying speed.", baseHpMultiplier: 0.9, strengthMultiplier: 1.2, vitalityMultiplier: 0.8, defenseMultiplier: 0.9, speedMultiplier: 1.4, luckMultiplier: 0.7, trait: 'Hot-Headed', weaponType: 'natural', spawnWeight: 12 },
    { name: "Corpse Flower", names: ["Deathbloom", "Carrion Blossom", "Rotpetal", "Witherbloom", "Necropuff"], description: "A carnivorous plant that smells of death and hungers for flesh.", baseHpMultiplier: 1.0, strengthMultiplier: 0.9, vitalityMultiplier: 1.0, defenseMultiplier: 0.8, speedMultiplier: 0.7, luckMultiplier: 0.8, trait: 'Stoic', weaponType: 'natural', spawnWeight: 10 },
];

const VOLCANIC_DEPTHS_ENEMIES: EnemyTemplate[] = [
    { name: "Magma Brute", names: ["Emberjaw", "Lavafist", "Cinderfall", "Moltengore", "Scorchling"], description: "A creature of living flame and molten rock, burning all it touches.", baseHpMultiplier: 1.4, strengthMultiplier: 1.5, vitalityMultiplier: 1.3, defenseMultiplier: 1.3, speedMultiplier: 0.8, luckMultiplier: 0.6, trait: 'Hot-Headed', weaponType: 'hammer', spawnWeight: 14 },
    { name: "Obsidian Guard", names: ["Blackforge", "Volcanite", "Ashwalker", "Cinderborn", "Slagheart"], description: "Armor fused to living flesh, impervious and relentless.", baseHpMultiplier: 1.3, strengthMultiplier: 1.2, vitalityMultiplier: 1.4, defenseMultiplier: 1.7, speedMultiplier: 0.7, luckMultiplier: 0.5, trait: 'Stoic', weaponType: 'sword', spawnWeight: 12 },
    { name: "Fire Dancer", names: ["Flameweaver", "Sparkwing", "Emberstep", "Pyrelight", "Ignispride"], description: "A nimble fighter who twists through flames with inhuman grace.", baseHpMultiplier: 0.8, strengthMultiplier: 1.0, vitalityMultiplier: 0.7, defenseMultiplier: 0.7, speedMultiplier: 1.5, luckMultiplier: 0.9, trait: 'Cheerful', weaponType: 'fist', spawnWeight: 15 },
    { name: "Ash Wraith", names: ["Cinder Specter", "Smoke Form", "Emberwraith", "Sootghost", "Pyrals"], description: "Spirits of the consumed, born from volcanic death, seeking vengeance.", baseHpMultiplier: 0.9, strengthMultiplier: 1.1, vitalityMultiplier: 0.6, defenseMultiplier: 0.8, speedMultiplier: 1.3, luckMultiplier: 0.8, trait: 'Hot-Headed', weaponType: 'magic', spawnWeight: 13 },
    { name: "Lava Wyrm", names: ["Magmawyrm", "Serpent Tongue", "Cindercoil", "Emberdrake", "Pyrovar"], description: "A serpentine dragon of pure fire and molten stone.", baseHpMultiplier: 1.8, strengthMultiplier: 1.6, vitalityMultiplier: 1.5, defenseMultiplier: 1.4, speedMultiplier: 0.9, luckMultiplier: 0.6, trait: 'Hot-Headed', weaponType: 'natural', spawnWeight: 8 },
    { name: "Brimstone Cultist", names: ["Ashspeaker", "Flamekeeper", "Cinder Prophet", "Molten Voice", "Emberguard"], description: "A zealot of the volcanic depths, blessed with fire's fury.", baseHpMultiplier: 0.9, strengthMultiplier: 1.0, vitalityMultiplier: 0.8, defenseMultiplier: 0.8, speedMultiplier: 1.1, luckMultiplier: 0.9, trait: 'Hot-Headed', weaponType: 'dagger', spawnWeight: 13 },
    { name: "Coal Golem", names: ["Charheart", "Sootwalker", "Cinder construct", "Ashbody", "Slagforge"], description: "A animated coal creature, exploding into flames when struck.", baseHpMultiplier: 1.2, strengthMultiplier: 1.3, vitalityMultiplier: 1.2, defenseMultiplier: 1.1, speedMultiplier: 0.8, luckMultiplier: 0.6, trait: 'Stoic', weaponType: 'hammer', spawnWeight: 11 },
    { name: "Flame Sprite", names: ["Sparkling", "Emberkin", "Firikin", "Pyrelit", "Igniculus"], description: "Tiny elemental fire beings that swarm and burn.", baseHpMultiplier: 0.4, strengthMultiplier: 0.6, vitalityMultiplier: 0.3, defenseMultiplier: 0.4, speedMultiplier: 1.8, luckMultiplier: 1.0, trait: 'Cheerful', weaponType: 'magic', spawnWeight: 17 },
    { name: "Forge Knight", names: ["Ironforged", "Anvilborn", "Steelheart", "Hammerfall", "Ingotian"], description: "Knights who serve the volcanic forges, their weapons never cooling.", baseHpMultiplier: 1.1, strengthMultiplier: 1.4, vitalityMultiplier: 1.0, defenseMultiplier: 1.3, speedMultiplier: 0.9, luckMultiplier: 0.7, trait: 'Stoic', weaponType: 'axe', spawnWeight: 10 },
    { name: "Sulfur Demon", names: ["Stinkfiend", "Mephitix", "Toxicus", "Gassprawler", "Venomborn"], description: "Lesser demons born from volcanic gases, toxic and vicious.", baseHpMultiplier: 0.7, strengthMultiplier: 0.9, vitalityMultiplier: 0.7, defenseMultiplier: 0.6, speedMultiplier: 1.4, luckMultiplier: 0.8, trait: 'Hot-Headed', weaponType: 'claw', spawnWeight: 14 },
];

const BIOME_ENEMIES: Record<string, EnemyTemplate[]> = {
    [BiomeType.Frozen]: FROZEN_CAVES_ENEMIES,
    [BiomeType.Crystalline]: CRYSTALLINE_PEAKS_ENEMIES,
    [BiomeType.Fungal]: FUNGAL_GROTTO_ENEMIES,
    [BiomeType.Volcanic]: VOLCANIC_DEPTHS_ENEMIES,
};

function selectWeightedRandom<T extends { spawnWeight: number }>(items: T[]): T {
    const totalWeight = items.reduce((sum, item) => sum + item.spawnWeight, 0);
    let roll = Math.random() * totalWeight;
    
    for (const item of items) {
        roll -= item.spawnWeight;
        if (roll <= 0) return item;
    }
    return items[items.length - 1];
}

function createEnemyFromTemplate(template: EnemyTemplate, level: number, id: string): Combatant {
    const baseClass = template.weaponType === 'magic' ? BaseClass.Mage :
                       template.weaponType === 'natural' ? BaseClass.Thief :
                       template.weaponType === 'fist' ? BaseClass.Warrior :
                       template.baseHpMultiplier > 1.2 ? BaseClass.Warrior :
                       BaseClass.Thief;
    
    const stats = StatCalculator.calculateStats(level, baseClass, 0);
    
    const name = template.names[Math.floor(Math.random() * template.names.length)];
    
    const hp = Math.floor(stats.hp * template.baseHpMultiplier);
    const strength = Math.floor(stats.strength * template.strengthMultiplier);
    const vitality = Math.floor(stats.vitality * template.vitalityMultiplier);
    const agility = Math.floor((stats.agility || 5) * template.speedMultiplier);
    const spirit = Math.floor((stats.spirit || 5) * template.defenseMultiplier);
    const luck = Math.floor(stats.luck * template.luckMultiplier);
    
    return {
        id,
        name: `${name} the ${template.name}`,
        level,
        baseClass,
        generation: 0,
        isEnemy: true,
        trait: template.trait,
        hp,
        maxHp: hp,
        mp: stats.mp,
        maxMp: stats.maxMp,
        stats: {
            strength,
            vitality,
            agility,
            spirit,
            luck
        },
        weapon: null,
        armor: null,
        accessory: null
    };
}

export class EnemyGenerator {
    static generateEnemySet(
        biome: BiomeType,
        level: number,
        count: number,
        setId: string
    ): Combatant[] {
        const enemies: Combatant[] = [];
        const biomeEnemyList = BIOME_ENEMIES[biome] || BIOME_ENEMIES[BiomeType.Frozen];
        
        const usedTemplates = new Set<string>();
        
        for (let i = 0; i < count; i++) {
            let template = selectWeightedRandom(biomeEnemyList);
            
            let attempts = 0;
            while (usedTemplates.has(template.name) && attempts < 10) {
                template = selectWeightedRandom(biomeEnemyList);
                attempts++;
            }
            
            usedTemplates.add(template.name);
            
            const id = `${setId}_${i}_${Math.random().toString(36).substring(2, 8)}`;
            const enemy = createEnemyFromTemplate(template, level, id);
            enemies.push(enemy);
        }
        
        return enemies;
    }
    
    static generateEncounterCount(floorNumber: number): number {
        if (floorNumber <= 3) return 1;
        if (floorNumber <= 10) return Math.random() < 0.7 ? 1 : 2;
        if (floorNumber <= 20) {
            const roll = Math.random();
            if (roll < 0.4) return 1;
            if (roll < 0.85) return 2;
            return 3;
        }
        const roll = Math.random();
        if (roll < 0.3) return 1;
        if (roll < 0.7) return 2;
        return 3;
    }
    
    static generateBossSet(biome: BiomeType, floorNumber: number, bossIndex: number): Combatant[] {
        const level = floorNumber + 2;
        const id = `boss_${floorNumber}_${bossIndex}_${Math.random().toString(36).substring(2, 8)}`;
        
        const bossTemplates = BIOME_ENEMIES[biome].filter(e => 
            e.name.includes('Elemental') || 
            e.name.includes('Overlord') || 
            e.name.includes('Wyrm') ||
            e.name.includes('Knight') ||
            e.name.includes('Guardian') ||
            e.name.includes('Lord') ||
            e.name.includes('King') ||
            e.name.includes('Ancient')
        );
        
        const template = bossTemplates.length > 0 
            ? bossTemplates[Math.floor(Math.random() * bossTemplates.length)]
            : selectWeightedRandom(BIOME_ENEMIES[biome]);
        
        const bossName = template.names[Math.floor(Math.random() * template.names.length)];
        const boss = createEnemyFromTemplate(template, level, id);
        boss.name = `${bossName}, ${template.name} of the Depths`;
        
        const companions: Combatant[] = [boss];
        
        const companionCount = floorNumber > 15 ? 1 : 0;
        for (let i = 0; i < companionCount; i++) {
            const companionId = `${id}_minion_${i}`;
            const minionTemplate = selectWeightedRandom(BIOME_ENEMIES[biome]);
            const minion = createEnemyFromTemplate(minionTemplate, level - 1, companionId);
            minion.name = `${minion.name} (Minion)`;
            companions.push(minion);
        }
        
        return companions;
    }
    
    static getEnemyDescription(enemies: Combatant[]): string {
        if (enemies.length === 1) {
            return enemies[0].name;
        }
        
        if (enemies.length === 2) {
            return `${enemies[0].name} and ${enemies[1].name}`;
        }
        
        const lastEnemy = enemies[enemies.length - 1];
        const others = enemies.slice(0, -1).map(e => e.name).join(', ');
        return `${others}, and ${lastEnemy.name}`;
    }
}
