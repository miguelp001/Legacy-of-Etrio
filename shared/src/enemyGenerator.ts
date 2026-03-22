import type { Combatant, NightsdeepTrait } from './combat';
import { BaseClass, StatCalculator } from './stats';
import type { ItemType } from './items';
import { ItemGenerator } from './items';

interface LootDrop {
    type: ItemType;
    dropChance: number;
    minLevel: number;
    maxLevel: number;
    goldMin: number;
    goldMax: number;
}

interface EnemyTemplate {
    name: string;
    names: string[];
    description: string;
    baseClass: BaseClass;
    baseHpMultiplier: number;
    statMultipliers: {
        strength: number;
        intelligence: number;
        agility: number;
        vitality: number;
        spirit: number;
        luck: number;
    };
    trait: NightsdeepTrait;
    weaponType: 'sword' | 'axe' | 'spear' | 'dagger' | 'hammer' | 'fist' | 'claw' | 'magic' | 'natural';
    spawnWeight: number;
    loot: LootDrop;
    xpValue: number;
    goldValue: number;
}

const FROZEN_CAVES_ENEMIES: EnemyTemplate[] = [
    { 
        name: "Frost Wraith", names: ["Mistshroud", "Niflheim", "Frostfang", "Gelid", "Cryonex"], 
        description: "A spirit frozen in eternal ice.", baseClass: BaseClass.Mage,
        baseHpMultiplier: 0.8, statMultipliers: { strength: 0.8, intelligence: 1.4, agility: 1.2, vitality: 0.7, spirit: 1.3, luck: 0.8 },
        trait: 'Stoic', weaponType: 'magic', spawnWeight: 15,
        loot: { type: 'Accessory', dropChance: 0.15, minLevel: 1, maxLevel: 5, goldMin: 10, goldMax: 30 },
        xpValue: 40, goldValue: 15
    },
    { 
        name: "Ice Ravager", names: ["Glacius", "Shiver", "Rimeclaw", "Frostmaw", "Blizzara"], 
        description: "A hulking brute of living ice.", baseClass: BaseClass.Warrior,
        baseHpMultiplier: 1.5, statMultipliers: { strength: 1.4, intelligence: 0.5, agility: 0.7, vitality: 1.3, spirit: 0.6, luck: 0.6 },
        trait: 'Stoic', weaponType: 'hammer', spawnWeight: 12,
        loot: { type: 'Armor', dropChance: 0.25, minLevel: 2, maxLevel: 8, goldMin: 20, goldMax: 50 },
        xpValue: 60, goldValue: 25
    },
    { 
        name: "Frost Archer", names: ["Iceweaver", "Sleet", "Arrowflight", "Coldsnap", "Flurry"], 
        description: "A deadly ice marksman.", baseClass: BaseClass.Thief,
        baseHpMultiplier: 0.7, statMultipliers: { strength: 0.9, intelligence: 0.8, agility: 1.3, vitality: 0.6, spirit: 0.7, luck: 1.0 },
        trait: 'Cheerful', weaponType: 'spear', spawnWeight: 14,
        loot: { type: 'Weapon', dropChance: 0.20, minLevel: 1, maxLevel: 6, goldMin: 15, goldMax: 40 },
        xpValue: 35, goldValue: 20
    },
    { 
        name: "Glacier Knight", names: ["Avalanche", "Iceheart", "Frostborn", "Coldmantle", "Gelidion"], 
        description: "An armored ice sentinel.", baseClass: BaseClass.Warrior,
        baseHpMultiplier: 1.2, statMultipliers: { strength: 1.2, intelligence: 0.6, agility: 0.8, vitality: 1.1, spirit: 0.9, luck: 0.7 },
        trait: 'Stoic', weaponType: 'sword', spawnWeight: 10,
        loot: { type: 'Weapon', dropChance: 0.30, minLevel: 3, maxLevel: 10, goldMin: 30, goldMax: 80 },
        xpValue: 70, goldValue: 40
    },
    { 
        name: "Chillspawn", names: ["Shiverling", "Frostbite", "Icewhelp", "Gelidkin", "Cryon"], 
        description: "Young ice creatures that hunt in packs.", baseClass: BaseClass.Thief,
        baseHpMultiplier: 0.5, statMultipliers: { strength: 0.7, intelligence: 0.4, agility: 1.4, vitality: 0.5, spirit: 0.4, luck: 0.9 },
        trait: 'Hot-Headed', weaponType: 'claw', spawnWeight: 18,
        loot: { type: 'Accessory', dropChance: 0.10, minLevel: 1, maxLevel: 3, goldMin: 5, goldMax: 15 },
        xpValue: 20, goldValue: 8
    },
    { 
        name: "Permafrost Elemental", names: ["Ancientone", "Tundran", "Glaciara", "Winterborn", "Frostfather"], 
        description: "A primordial force of frozen death.", baseClass: BaseClass.Mage,
        baseHpMultiplier: 2.0, statMultipliers: { strength: 1.6, intelligence: 1.8, agility: 0.6, vitality: 1.8, spirit: 1.6, luck: 0.5 },
        trait: 'Stoic', weaponType: 'natural', spawnWeight: 6,
        loot: { type: 'Weapon', dropChance: 0.50, minLevel: 5, maxLevel: 15, goldMin: 50, goldMax: 150 },
        xpValue: 150, goldValue: 100
    },
    { 
        name: "Icecult Zealot", names: ["Frostspeaker", "Deepfreeze", "Winterbite", "Coldsoul", "Icevein"], 
        description: "A fanatic of the frozen depths.", baseClass: BaseClass.Thief,
        baseHpMultiplier: 0.9, statMultipliers: { strength: 1.0, intelligence: 0.9, agility: 1.1, vitality: 0.8, spirit: 0.8, luck: 0.8 },
        trait: 'Hot-Headed', weaponType: 'dagger', spawnWeight: 13,
        loot: { type: 'Weapon', dropChance: 0.22, minLevel: 2, maxLevel: 7, goldMin: 18, goldMax: 45 },
        xpValue: 45, goldValue: 22
    },
    { 
        name: "Frozen Hound", names: ["Icefang", "Snowmaw", "Frostbite", "Gelidwolf", "Blizzard"], 
        description: "A wolf corrupted by eternal winter.", baseClass: BaseClass.Thief,
        baseHpMultiplier: 1.0, statMultipliers: { strength: 1.1, intelligence: 0.3, agility: 1.5, vitality: 0.9, spirit: 0.5, luck: 0.7 },
        trait: 'Hot-Headed', weaponType: 'claw', spawnWeight: 12,
        loot: { type: 'Armor', dropChance: 0.18, minLevel: 2, maxLevel: 6, goldMin: 12, goldMax: 35 },
        xpValue: 38, goldValue: 18
    },
];

const CRYSTALLINE_PEAKS_ENEMIES: EnemyTemplate[] = [
    { 
        name: "Prismatic Stalker", names: ["Refraction", "Luminant", "Spectrum", "Prismeye", "Shardweaver"], 
        description: "A creature of living crystal.", baseClass: BaseClass.Mage,
        baseHpMultiplier: 0.9, statMultipliers: { strength: 1.0, intelligence: 1.2, agility: 1.2, vitality: 0.8, spirit: 1.1, luck: 1.1 },
        trait: 'Cheerful', weaponType: 'magic', spawnWeight: 14,
        loot: { type: 'Accessory', dropChance: 0.20, minLevel: 3, maxLevel: 10, goldMin: 25, goldMax: 60 },
        xpValue: 50, goldValue: 30
    },
    { 
        name: "Resonance Knight", names: ["Harmonist", "Vibration", "Oscillate", "Chordborn", "Pitch"], 
        description: "A warrior of crystal harmonics.", baseClass: BaseClass.Warrior,
        baseHpMultiplier: 1.1, statMultipliers: { strength: 1.3, intelligence: 0.7, agility: 1.0, vitality: 1.0, spirit: 0.8, luck: 0.8 },
        trait: 'Stoic', weaponType: 'sword', spawnWeight: 12,
        loot: { type: 'Weapon', dropChance: 0.28, minLevel: 4, maxLevel: 12, goldMin: 35, goldMax: 90 },
        xpValue: 65, goldValue: 45
    },
    { 
        name: "Shard Sentinel", names: ["Crystalline", "Faceted", "Prismguard", "Gemheart", "Quartzite"], 
        description: "Animated crystal constructs.", baseClass: BaseClass.Warrior,
        baseHpMultiplier: 1.3, statMultipliers: { strength: 1.1, intelligence: 0.4, agility: 0.7, vitality: 1.4, spirit: 1.0, luck: 0.5 },
        trait: 'Stoic', weaponType: 'hammer', spawnWeight: 11,
        loot: { type: 'Armor', dropChance: 0.35, minLevel: 5, maxLevel: 14, goldMin: 45, goldMax: 120 },
        xpValue: 80, goldValue: 55
    },
    { 
        name: "Luminescent Hunter", names: ["Gleamscale", "Sparkwing", "Radiance", "Luminos", "Lustrewing"], 
        description: "A graceful crystal predator.", baseClass: BaseClass.Thief,
        baseHpMultiplier: 0.8, statMultipliers: { strength: 0.9, intelligence: 0.8, agility: 1.4, vitality: 0.7, spirit: 0.6, luck: 1.0 },
        trait: 'Cheerful', weaponType: 'dagger', spawnWeight: 15,
        loot: { type: 'Weapon', dropChance: 0.22, minLevel: 3, maxLevel: 9, goldMin: 28, goldMax: 65 },
        xpValue: 42, goldValue: 32
    },
    { 
        name: "Crystal Worm", names: ["Tunneler", "Cavernjaw", "Gemgorger", "Stoneburrower", "Quarry"], 
        description: "A massive burrowing crystal horror.", baseClass: BaseClass.Warrior,
        baseHpMultiplier: 1.8, statMultipliers: { strength: 1.5, intelligence: 0.3, agility: 0.5, vitality: 1.6, spirit: 0.8, luck: 0.4 },
        trait: 'Stoic', weaponType: 'natural', spawnWeight: 8,
        loot: { type: 'Armor', dropChance: 0.45, minLevel: 8, maxLevel: 18, goldMin: 80, goldMax: 200 },
        xpValue: 140, goldValue: 90
    },
    { 
        name: "Prism Mage", names: ["Spectrum Weaver", "Rainbow", "Colorwraith", "Huekeeper", "Chiaroscuro"], 
        description: "A master of light magic.", baseClass: BaseClass.Mage,
        baseHpMultiplier: 0.7, statMultipliers: { strength: 0.6, intelligence: 1.6, agility: 1.1, vitality: 0.6, spirit: 1.3, luck: 1.2 },
        trait: 'Cheerful', weaponType: 'magic', spawnWeight: 13,
        loot: { type: 'Weapon', dropChance: 0.32, minLevel: 6, maxLevel: 15, goldMin: 55, goldMax: 140 },
        xpValue: 55, goldValue: 48
    },
    { 
        name: "Facet Swarm", names: ["Shardswarm", "Glassling", "Splintercloud", "Microlith", "Crystalline Spawn"], 
        description: "Tiny crystal fragments as one mass.", baseClass: BaseClass.Thief,
        baseHpMultiplier: 0.4, statMultipliers: { strength: 0.5, intelligence: 0.4, agility: 1.6, vitality: 0.4, spirit: 0.3, luck: 0.8 },
        trait: 'Hot-Headed', weaponType: 'natural', spawnWeight: 16,
        loot: { type: 'Accessory', dropChance: 0.08, minLevel: 2, maxLevel: 5, goldMin: 8, goldMax: 22 },
        xpValue: 18, goldValue: 10
    },
    { 
        name: "Echoing Shade", names: ["Resonator", "Harmonic", "Frequencyshift", "Reverberant", "Pitchbender"], 
        description: "A phantom of crystal harmonics.", baseClass: BaseClass.Mage,
        baseHpMultiplier: 0.9, statMultipliers: { strength: 0.8, intelligence: 1.3, agility: 1.1, vitality: 0.7, spirit: 1.2, luck: 1.0 },
        trait: 'Hot-Headed', weaponType: 'magic', spawnWeight: 11,
        loot: { type: 'Weapon', dropChance: 0.25, minLevel: 4, maxLevel: 11, goldMin: 32, goldMax: 75 },
        xpValue: 48, goldValue: 35
    },
];

const FUNGAL_GROTTO_ENEMIES: EnemyTemplate[] = [
    { 
        name: "Spore Terror", names: ["Mushling", "Fungicide", "Mycotyx", "Sporemother", "Moldwalker"], 
        description: "A walking mass of fungi and decay.", baseClass: BaseClass.Warrior,
        baseHpMultiplier: 1.2, statMultipliers: { strength: 1.0, intelligence: 0.6, agility: 0.8, vitality: 1.3, spirit: 0.9, luck: 0.7 },
        trait: 'Stoic', weaponType: 'natural', spawnWeight: 15,
        loot: { type: 'Armor', dropChance: 0.22, minLevel: 6, maxLevel: 14, goldMin: 40, goldMax: 95 },
        xpValue: 55, goldValue: 38
    },
    { 
        name: "Tendril Horror", names: ["Rootclaw", "Vinewhip", "Grasping One", "Mycelium", "Entanglus"], 
        description: "Animated vines that suffocate.", baseClass: BaseClass.Warrior,
        baseHpMultiplier: 1.0, statMultipliers: { strength: 1.2, intelligence: 0.4, agility: 0.9, vitality: 1.1, spirit: 0.7, luck: 0.6 },
        trait: 'Stoic', weaponType: 'natural', spawnWeight: 14,
        loot: { type: 'Weapon', dropChance: 0.20, minLevel: 5, maxLevel: 12, goldMin: 35, goldMax: 85 },
        xpValue: 50, goldValue: 35
    },
    { 
        name: "Toxic Crawler", names: ["Puffling", "Sporebeetle", "Acidback", "Venomshell", "Corrosion"], 
        description: "A giant insect with corrosive bile.", baseClass: BaseClass.Thief,
        baseHpMultiplier: 0.8, statMultipliers: { strength: 1.0, intelligence: 0.7, agility: 1.3, vitality: 0.8, spirit: 0.6, luck: 0.8 },
        trait: 'Hot-Headed', weaponType: 'natural', spawnWeight: 16,
        loot: { type: 'Accessory', dropChance: 0.18, minLevel: 4, maxLevel: 10, goldMin: 22, goldMax: 55 },
        xpValue: 38, goldValue: 25
    },
    { 
        name: "Bioluminescent Nightmare", names: ["Glowmaw", "Luminant", "Phosphor", "Glowspawn", "Luminesca"], 
        description: "Beautiful but deadly fungal predator.", baseClass: BaseClass.Mage,
        baseHpMultiplier: 0.9, statMultipliers: { strength: 0.8, intelligence: 1.2, agility: 1.2, vitality: 0.7, spirit: 1.0, luck: 1.1 },
        trait: 'Cheerful', weaponType: 'natural', spawnWeight: 14,
        loot: { type: 'Weapon', dropChance: 0.25, minLevel: 7, maxLevel: 16, goldMin: 50, goldMax: 120 },
        xpValue: 52, goldValue: 42
    },
    { 
        name: "Mycelial Overlord", names: ["Nexus", "The Weave", "Sporeking", "Fungal Throne", "Mycotyrant"], 
        description: "The heart of the fungal network.", baseClass: BaseClass.Warrior,
        baseHpMultiplier: 2.0, statMultipliers: { strength: 1.3, intelligence: 1.0, agility: 0.6, vitality: 1.8, spirit: 1.2, luck: 0.5 },
        trait: 'Stoic', weaponType: 'natural', spawnWeight: 6,
        loot: { type: 'Armor', dropChance: 0.60, minLevel: 10, maxLevel: 20, goldMin: 100, goldMax: 300 },
        xpValue: 180, goldValue: 150
    },
    { 
        name: "Slime Mold Beast", names: ["Oozewraith", "Gelatinox", "Amorphus", "Jellicle", "Mucolynx"], 
        description: "A shapeless engulfing predator.", baseClass: BaseClass.Warrior,
        baseHpMultiplier: 1.1, statMultipliers: { strength: 0.9, intelligence: 0.5, agility: 1.0, vitality: 1.2, spirit: 0.8, luck: 0.9 },
        trait: 'Cheerful', weaponType: 'natural', spawnWeight: 13,
        loot: { type: 'Accessory', dropChance: 0.20, minLevel: 5, maxLevel: 12, goldMin: 30, goldMax: 70 },
        xpValue: 45, goldValue: 32
    },
    { 
        name: "Sporeling Assassin", names: ["Toxic Shadow", "Sporewalker", "Deathpuff", "Miststalker", "Venenox"], 
        description: "Silent killers of toxic spores.", baseClass: BaseClass.Thief,
        baseHpMultiplier: 0.6, statMultipliers: { strength: 1.1, intelligence: 0.8, agility: 1.5, vitality: 0.5, spirit: 0.6, luck: 1.0 },
        trait: 'Hot-Headed', weaponType: 'dagger', spawnWeight: 15,
        loot: { type: 'Weapon', dropChance: 0.28, minLevel: 6, maxLevel: 14, goldMin: 45, goldMax: 110 },
        xpValue: 42, goldValue: 38
    },
    { 
        name: "Giant Centipede", names: ["Carapace", "Skitterfangs", "Moltling", "Chitincrawler", "Segmentus"], 
        description: "A massive segmented horror.", baseClass: BaseClass.Thief,
        baseHpMultiplier: 0.9, statMultipliers: { strength: 1.2, intelligence: 0.4, agility: 1.4, vitality: 0.8, spirit: 0.5, luck: 0.7 },
        trait: 'Hot-Headed', weaponType: 'natural', spawnWeight: 12,
        loot: { type: 'Armor', dropChance: 0.22, minLevel: 4, maxLevel: 11, goldMin: 28, goldMax: 65 },
        xpValue: 40, goldValue: 28
    },
];

const VOLCANIC_DEPTHS_ENEMIES: EnemyTemplate[] = [
    { 
        name: "Magma Brute", names: ["Emberjaw", "Lavafist", "Cinderfall", "Moltengore", "Scorchling"], 
        description: "A creature of living flame and rock.", baseClass: BaseClass.Warrior,
        baseHpMultiplier: 1.4, statMultipliers: { strength: 1.5, intelligence: 0.5, agility: 0.8, vitality: 1.3, spirit: 0.7, luck: 0.6 },
        trait: 'Hot-Headed', weaponType: 'hammer', spawnWeight: 14,
        loot: { type: 'Weapon', dropChance: 0.30, minLevel: 8, maxLevel: 16, goldMin: 55, goldMax: 130 },
        xpValue: 75, goldValue: 55
    },
    { 
        name: "Obsidian Guard", names: ["Blackforge", "Volcanite", "Ashwalker", "Cinderborn", "Slagheart"], 
        description: "Armor fused to living flesh.", baseClass: BaseClass.Warrior,
        baseHpMultiplier: 1.3, statMultipliers: { strength: 1.2, intelligence: 0.4, agility: 0.7, vitality: 1.4, spirit: 0.9, luck: 0.5 },
        trait: 'Stoic', weaponType: 'sword', spawnWeight: 12,
        loot: { type: 'Armor', dropChance: 0.35, minLevel: 9, maxLevel: 18, goldMin: 65, goldMax: 150 },
        xpValue: 85, goldValue: 65
    },
    { 
        name: "Fire Dancer", names: ["Flameweaver", "Sparkwing", "Emberstep", "Pyrelight", "Ignispride"], 
        description: "A nimble fighter of flame.", baseClass: BaseClass.Thief,
        baseHpMultiplier: 0.8, statMultipliers: { strength: 1.0, intelligence: 0.8, agility: 1.5, vitality: 0.7, spirit: 0.6, luck: 0.9 },
        trait: 'Cheerful', weaponType: 'fist', spawnWeight: 15,
        loot: { type: 'Accessory', dropChance: 0.22, minLevel: 6, maxLevel: 14, goldMin: 40, goldMax: 95 },
        xpValue: 48, goldValue: 40
    },
    { 
        name: "Ash Wraith", names: ["Cinder Specter", "Smoke Form", "Emberwraith", "Sootghost", "Pyrals"], 
        description: "Spirits born of volcanic death.", baseClass: BaseClass.Mage,
        baseHpMultiplier: 0.9, statMultipliers: { strength: 1.0, intelligence: 1.4, agility: 1.1, vitality: 0.6, spirit: 1.2, luck: 0.8 },
        trait: 'Hot-Headed', weaponType: 'magic', spawnWeight: 13,
        loot: { type: 'Weapon', dropChance: 0.28, minLevel: 7, maxLevel: 15, goldMin: 50, goldMax: 120 },
        xpValue: 55, goldValue: 45
    },
    { 
        name: "Lava Wyrm", names: ["Magmawyrm", "Serpent Tongue", "Cindercoil", "Emberdrake", "Pyrovar"], 
        description: "A serpentine dragon of fire.", baseClass: BaseClass.Warrior,
        baseHpMultiplier: 1.8, statMultipliers: { strength: 1.6, intelligence: 0.6, agility: 0.9, vitality: 1.5, spirit: 0.8, luck: 0.6 },
        trait: 'Hot-Headed', weaponType: 'natural', spawnWeight: 8,
        loot: { type: 'Weapon', dropChance: 0.55, minLevel: 12, maxLevel: 22, goldMin: 120, goldMax: 350 },
        xpValue: 160, goldValue: 130
    },
    { 
        name: "Brimstone Cultist", names: ["Ashspeaker", "Flamekeeper", "Cinder Prophet", "Molten Voice", "Emberguard"], 
        description: "A zealot of volcanic fury.", baseClass: BaseClass.Thief,
        baseHpMultiplier: 0.9, statMultipliers: { strength: 1.0, intelligence: 1.0, agility: 1.1, vitality: 0.8, spirit: 0.9, luck: 0.9 },
        trait: 'Hot-Headed', weaponType: 'dagger', spawnWeight: 13,
        loot: { type: 'Weapon', dropChance: 0.25, minLevel: 6, maxLevel: 14, goldMin: 42, goldMax: 100 },
        xpValue: 50, goldValue: 42
    },
    { 
        name: "Coal Golem", names: ["Charheart", "Sootwalker", "Cinder construct", "Ashbody", "Slagforge"], 
        description: "An animated coal creature.", baseClass: BaseClass.Warrior,
        baseHpMultiplier: 1.2, statMultipliers: { strength: 1.3, intelligence: 0.3, agility: 0.8, vitality: 1.2, spirit: 0.7, luck: 0.6 },
        trait: 'Stoic', weaponType: 'hammer', spawnWeight: 11,
        loot: { type: 'Armor', dropChance: 0.30, minLevel: 7, maxLevel: 16, goldMin: 48, goldMax: 115 },
        xpValue: 60, goldValue: 48
    },
    { 
        name: "Flame Sprite", names: ["Sparkling", "Emberkin", "Firikin", "Pyrelit", "Igniculus"], 
        description: "Tiny elemental fire beings.", baseClass: BaseClass.Mage,
        baseHpMultiplier: 0.4, statMultipliers: { strength: 0.4, intelligence: 1.2, agility: 1.6, vitality: 0.3, spirit: 1.0, luck: 1.0 },
        trait: 'Cheerful', weaponType: 'magic', spawnWeight: 17,
        loot: { type: 'Accessory', dropChance: 0.12, minLevel: 3, maxLevel: 8, goldMin: 15, goldMax: 40 },
        xpValue: 22, goldValue: 15
    },
];

const BIOME_ENEMIES: Record<string, EnemyTemplate[]> = {
    'Frozen Caves': FROZEN_CAVES_ENEMIES,
    'Crystalline Peaks': CRYSTALLINE_PEAKS_ENEMIES,
    'Fungal Grotto': FUNGAL_GROTTO_ENEMIES,
    'Volcanic Depths': VOLCANIC_DEPTHS_ENEMIES,
};

function selectWeightedRandom<T extends { spawnWeight: number }>(items: T[]): T {
    const totalWeight = items.reduce((sum, item) => sum + item.spawnWeight, 0);
    let roll = Math.random() * totalWeight;
    for (const item of items) {
        roll -= item.spawnWeight;
        if (roll <= 0) return item;
    }
    return items[items.length - 1]!;
}

export interface LootResult {
    item: any | null;
    gold: number;
}

export interface GeneratedEnemy extends Combatant {
    templateName: string;
    lootTable: LootDrop;
    xpValue: number;
}

function createEnemyFromTemplate(template: EnemyTemplate, level: number, id: string): GeneratedEnemy {
    const baseClass = template.baseClass;
    
    const calculatedStats = StatCalculator.calculateStats(level, baseClass, 0);
    const name = template.names[Math.floor(Math.random() * template.names.length)]!;
    const baseHp = StatCalculator.calculateHP(calculatedStats);
    const baseMp = StatCalculator.calculateMP(calculatedStats);
    const hp = Math.floor(baseHp * template.baseHpMultiplier);
    
    const multiplier = template.statMultipliers;
    
    return {
        id,
        name: `${name} the ${template.name}`,
        level,
        xp: 0,
        baseClass,
        generation: 0,
        isEnemy: true,
        trait: template.trait,
        hp,
        maxHp: hp,
        mp: baseMp,
        maxMp: baseMp,
        stats: {
            strength: Math.max(1, Math.floor(calculatedStats.strength * multiplier.strength)),
            intelligence: Math.max(1, Math.floor(calculatedStats.intelligence * multiplier.intelligence)),
            agility: Math.max(1, Math.floor(calculatedStats.agility * multiplier.agility)),
            vitality: Math.max(1, Math.floor(calculatedStats.vitality * multiplier.vitality)),
            spirit: Math.max(1, Math.floor(calculatedStats.spirit * multiplier.spirit)),
            luck: Math.max(1, Math.floor(calculatedStats.luck * multiplier.luck)),
        },
        weapon: null,
        armor: null,
        accessory: null,
        templateName: template.name,
        lootTable: template.loot,
        xpValue: template.xpValue
    };
}

export class EnemyGenerator {
    static generateEnemySet(biome: string, level: number, count: number, setId: string): GeneratedEnemy[] {
        const enemies: GeneratedEnemy[] = [];
        const biomeEnemyList = BIOME_ENEMIES[biome] ?? BIOME_ENEMIES['Frozen Caves']!;
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
            enemies.push(createEnemyFromTemplate(template, level, id));
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
    
    static generateBossSet(biome: string, floorNumber: number, bossIndex: number): GeneratedEnemy[] {
        const level = floorNumber + 2;
        const id = `boss_${floorNumber}_${bossIndex}_${Math.random().toString(36).substring(2, 8)}`;
        
        const biomeEnemies = BIOME_ENEMIES[biome] ?? BIOME_ENEMIES['Frozen Caves']!;
        const bossTemplates = biomeEnemies.filter(e => 
            e.name.includes('Elemental') || 
            e.name.includes('Overlord') || 
            e.name.includes('Wyrm') ||
            e.name.includes('Knight') ||
            e.name.includes('Sentinel') ||
            e.name.includes('Wraith')
        );
        
        const template = bossTemplates.length > 0 
            ? bossTemplates[Math.floor(Math.random() * bossTemplates.length)]!
            : selectWeightedRandom(biomeEnemies);
        
        const bossName = template.names[Math.floor(Math.random() * template.names.length)]!;
        const boss = createEnemyFromTemplate(template, level, id);
        boss.name = `${bossName}, ${template.name} of the Depths`;
        boss.xpValue = Math.floor(boss.xpValue * 3);
        return [boss];
    }
    
    static getEnemyDescription(enemies: Combatant[]): string {
        if (enemies.length === 0) return '';
        if (enemies.length === 1) return enemies[0]!.name;
        if (enemies.length === 2) return `${enemies[0]!.name} and ${enemies[1]!.name}`;
        const lastEnemy = enemies[enemies.length - 1]!;
        const others = enemies.slice(0, -1).map(e => e.name).join(', ');
        return `${others}, and ${lastEnemy.name}`;
    }
    
    static rollLootDrop(enemy: GeneratedEnemy, playerLuck: number = 0): LootResult {
        const loot = enemy.lootTable;
        const goldDrop = Math.floor(loot.goldMin + Math.random() * (loot.goldMax - loot.goldMin));
        
        const result: LootResult = {
            item: null,
            gold: Math.floor(goldDrop * (1 + (enemy.level - 1) * 0.15))
        };
        
        // Increased drop chance: base + luck bonus, minimum 15%
        const dropChance = Math.max(0.15, loot.dropChance * (1 + playerLuck * 0.015));
        
        if (Math.random() < dropChance) {
            const itemLevel = Math.floor(loot.minLevel + Math.random() * (loot.maxLevel - loot.minLevel + 1));
            result.item = ItemGenerator.generateItem(itemLevel);
            result.item.type = loot.type;
            result.item.level = itemLevel;
        }
        
        return result;
    }
}
