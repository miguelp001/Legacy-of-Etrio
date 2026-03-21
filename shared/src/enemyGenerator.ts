import type { Combatant, NightsdeepTrait } from './combat';
import { BiomeType } from './dungeon';
import { BaseClass, StatCalculator } from './stats';

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

const FROZEN_CAVES_ENEMIES: EnemyTemplate[] = [
    { name: "Frost Wraith", names: ["Mistshroud", "Niflheim", "Frostfang", "Gelid", "Cryonex"], description: "A spirit frozen in eternal ice.", baseHpMultiplier: 0.8, strengthMultiplier: 1.1, vitalityMultiplier: 0.7, defenseMultiplier: 0.9, speedMultiplier: 1.2, luckMultiplier: 0.8, trait: 'Stoic', weaponType: 'magic', spawnWeight: 15 },
    { name: "Ice Ravager", names: ["Glacius", "Shiver", "Rimeclaw", "Frostmaw", "Blizzara"], description: "A hulking brute of living ice.", baseHpMultiplier: 1.5, strengthMultiplier: 1.4, vitalityMultiplier: 1.3, defenseMultiplier: 1.2, speedMultiplier: 0.7, luckMultiplier: 0.6, trait: 'Stoic', weaponType: 'hammer', spawnWeight: 12 },
    { name: "Frost Archer", names: ["Iceweaver", "Sleet", "Arrowflight", "Coldsnap", "Flurry"], description: "A deadly ice marksman.", baseHpMultiplier: 0.7, strengthMultiplier: 0.9, vitalityMultiplier: 0.6, defenseMultiplier: 0.7, speedMultiplier: 1.3, luckMultiplier: 1.0, trait: 'Cheerful', weaponType: 'spear', spawnWeight: 14 },
    { name: "Glacier Knight", names: ["Avalanche", "Iceheart", "Frostborn", "Coldmantle", "Gelidion"], description: "An armored ice sentinel.", baseHpMultiplier: 1.2, strengthMultiplier: 1.2, vitalityMultiplier: 1.1, defenseMultiplier: 1.5, speedMultiplier: 0.8, luckMultiplier: 0.7, trait: 'Stoic', weaponType: 'sword', spawnWeight: 10 },
    { name: "Chillspawn", names: ["Shiverling", "Frostbite", "Icewhelp", "Gelidkin", "Cryon"], description: "Young ice creatures that hunt in packs.", baseHpMultiplier: 0.5, strengthMultiplier: 0.7, vitalityMultiplier: 0.5, defenseMultiplier: 0.5, speedMultiplier: 1.4, luckMultiplier: 0.9, trait: 'Hot-Headed', weaponType: 'claw', spawnWeight: 18 },
    { name: "Permafrost Elemental", names: ["Ancientone", "Tundran", "Glaciara", "Winterborn", "Frostfather"], description: "A primordial force of frozen death.", baseHpMultiplier: 2.0, strengthMultiplier: 1.6, vitalityMultiplier: 1.8, defenseMultiplier: 1.4, speedMultiplier: 0.6, luckMultiplier: 0.5, trait: 'Stoic', weaponType: 'natural', spawnWeight: 6 },
    { name: "Icecult Zealot", names: ["Frostspeaker", "Deepfreeze", "Winterbite", "Coldsoul", "Icevein"], description: "A fanatic of the frozen depths.", baseHpMultiplier: 0.9, strengthMultiplier: 1.0, vitalityMultiplier: 0.8, defenseMultiplier: 0.8, speedMultiplier: 1.1, luckMultiplier: 0.8, trait: 'Hot-Headed', weaponType: 'dagger', spawnWeight: 13 },
    { name: "Frozen Hound", names: ["Icefang", "Snowmaw", "Frostbite", "Gelidwolf", "Blizzard"], description: "A wolf corrupted by eternal winter.", baseHpMultiplier: 1.0, strengthMultiplier: 1.1, vitalityMultiplier: 0.9, defenseMultiplier: 0.8, speedMultiplier: 1.5, luckMultiplier: 0.7, trait: 'Hot-Headed', weaponType: 'claw', spawnWeight: 12 },
];

const CRYSTALLINE_PEAKS_ENEMIES: EnemyTemplate[] = [
    { name: "Prismatic Stalker", names: ["Refraction", "Luminant", "Spectrum", "Prismeye", "Shardweaver"], description: "A creature of living crystal.", baseHpMultiplier: 0.9, strengthMultiplier: 1.0, vitalityMultiplier: 0.8, defenseMultiplier: 1.1, speedMultiplier: 1.2, luckMultiplier: 1.1, trait: 'Cheerful', weaponType: 'magic', spawnWeight: 14 },
    { name: "Resonance Knight", names: ["Harmonist", "Vibration", "Oscillate", "Chordborn", "Pitch"], description: "A warrior of crystal harmonics.", baseHpMultiplier: 1.1, strengthMultiplier: 1.3, vitalityMultiplier: 1.0, defenseMultiplier: 1.2, speedMultiplier: 1.0, luckMultiplier: 0.8, trait: 'Stoic', weaponType: 'sword', spawnWeight: 12 },
    { name: "Shard Sentinel", names: ["Crystalline", "Faceted", "Prismguard", "Gemheart", "Quartzite"], description: "Animated crystal constructs.", baseHpMultiplier: 1.3, strengthMultiplier: 1.1, vitalityMultiplier: 1.4, defenseMultiplier: 1.6, speedMultiplier: 0.7, luckMultiplier: 0.5, trait: 'Stoic', weaponType: 'hammer', spawnWeight: 11 },
    { name: "Luminescent Hunter", names: ["Gleamscale", "Sparkwing", "Radiance", "Luminos", "Lustrewing"], description: "A graceful crystal predator.", baseHpMultiplier: 0.8, strengthMultiplier: 0.9, vitalityMultiplier: 0.7, defenseMultiplier: 0.8, speedMultiplier: 1.4, luckMultiplier: 1.0, trait: 'Cheerful', weaponType: 'dagger', spawnWeight: 15 },
    { name: "Crystal Worm", names: ["Tunneler", "Cavernjaw", "Gemgorger", "Stoneburrower", "Quarry"], description: "A massive burrowing crystal horror.", baseHpMultiplier: 1.8, strengthMultiplier: 1.5, vitalityMultiplier: 1.6, defenseMultiplier: 1.3, speedMultiplier: 0.5, luckMultiplier: 0.4, trait: 'Stoic', weaponType: 'natural', spawnWeight: 8 },
    { name: "Prism Mage", names: ["Spectrum Weaver", "Rainbow", "Colorwraith", "Huekeeper", "Chiaroscuro"], description: "A master of light magic.", baseHpMultiplier: 0.7, strengthMultiplier: 0.8, vitalityMultiplier: 0.6, defenseMultiplier: 0.7, speedMultiplier: 1.3, luckMultiplier: 1.2, trait: 'Cheerful', weaponType: 'magic', spawnWeight: 13 },
    { name: "Facet Swarm", names: ["Shardswarm", "Glassling", "Splintercloud", "Microlith", "Crystalline Spawn"], description: "Tiny crystal fragments as one mass.", baseHpMultiplier: 0.4, strengthMultiplier: 0.5, vitalityMultiplier: 0.4, defenseMultiplier: 0.6, speedMultiplier: 1.6, luckMultiplier: 0.8, trait: 'Hot-Headed', weaponType: 'natural', spawnWeight: 16 },
    { name: "Echoing Shade", names: ["Resonator", "Harmonic", "Frequencyshift", "Reverberant", "Pitchbender"], description: "A phantom of crystal harmonics.", baseHpMultiplier: 0.9, strengthMultiplier: 1.0, vitalityMultiplier: 0.7, defenseMultiplier: 0.9, speedMultiplier: 1.1, luckMultiplier: 1.0, trait: 'Hot-Headed', weaponType: 'magic', spawnWeight: 11 },
];

const FUNGAL_GROTTO_ENEMIES: EnemyTemplate[] = [
    { name: "Spore Terror", names: ["Mushling", "Fungicide", "Mycotyx", "Sporemother", "Moldwalker"], description: "A walking mass of fungi and decay.", baseHpMultiplier: 1.2, strengthMultiplier: 1.0, vitalityMultiplier: 1.3, defenseMultiplier: 1.0, speedMultiplier: 0.8, luckMultiplier: 0.7, trait: 'Stoic', weaponType: 'natural', spawnWeight: 15 },
    { name: "Tendril Horror", names: ["Rootclaw", "Vinewhip", "Grasping One", "Mycelium", "Entanglus"], description: "Animated vines that suffocate.", baseHpMultiplier: 1.0, strengthMultiplier: 1.2, vitalityMultiplier: 1.1, defenseMultiplier: 0.9, speedMultiplier: 0.9, luckMultiplier: 0.6, trait: 'Stoic', weaponType: 'natural', spawnWeight: 14 },
    { name: "Toxic Crawler", names: ["Puffling", "Sporebeetle", "Acidback", "Venomshell", "Corrosion"], description: "A giant insect with corrosive bile.", baseHpMultiplier: 0.8, strengthMultiplier: 1.0, vitalityMultiplier: 0.8, defenseMultiplier: 1.0, speedMultiplier: 1.3, luckMultiplier: 0.8, trait: 'Hot-Headed', weaponType: 'natural', spawnWeight: 16 },
    { name: "Bioluminescent Nightmare", names: ["Glowmaw", "Luminant", "Phosphor", "Glowspawn", "Luminesca"], description: "Beautiful but deadly fungal predator.", baseHpMultiplier: 0.9, strengthMultiplier: 0.8, vitalityMultiplier: 0.7, defenseMultiplier: 0.6, speedMultiplier: 1.2, luckMultiplier: 1.1, trait: 'Cheerful', weaponType: 'natural', spawnWeight: 14 },
    { name: "Mycelial Overlord", names: ["Nexus", "The Weave", "Sporeking", "Fungal Throne", "Mycotyrant"], description: "The heart of the fungal network.", baseHpMultiplier: 2.0, strengthMultiplier: 1.3, vitalityMultiplier: 1.8, defenseMultiplier: 1.2, speedMultiplier: 0.6, luckMultiplier: 0.5, trait: 'Stoic', weaponType: 'natural', spawnWeight: 6 },
    { name: "Slime Mold Beast", names: ["Oozewraith", "Gelatinox", "Amorphus", "Jellicle", "Mucolynx"], description: "A shapeless engulfing predator.", baseHpMultiplier: 1.1, strengthMultiplier: 0.9, vitalityMultiplier: 1.2, defenseMultiplier: 0.8, speedMultiplier: 1.0, luckMultiplier: 0.9, trait: 'Cheerful', weaponType: 'natural', spawnWeight: 13 },
    { name: "Sporeling Assassin", names: ["Toxic Shadow", "Sporewalker", "Deathpuff", "Miststalker", "Venenox"], description: "Silent killers of toxic spores.", baseHpMultiplier: 0.6, strengthMultiplier: 1.1, vitalityMultiplier: 0.5, defenseMultiplier: 0.5, speedMultiplier: 1.5, luckMultiplier: 1.0, trait: 'Hot-Headed', weaponType: 'dagger', spawnWeight: 15 },
    { name: "Giant Centipede", names: ["Carapace", "Skitterfangs", "Moltling", "Chitincrawler", "Segmentus"], description: "A massive segmented horror.", baseHpMultiplier: 0.9, strengthMultiplier: 1.2, vitalityMultiplier: 0.8, defenseMultiplier: 0.9, speedMultiplier: 1.4, luckMultiplier: 0.7, trait: 'Hot-Headed', weaponType: 'natural', spawnWeight: 12 },
];

const VOLCANIC_DEPTHS_ENEMIES: EnemyTemplate[] = [
    { name: "Magma Brute", names: ["Emberjaw", "Lavafist", "Cinderfall", "Moltengore", "Scorchling"], description: "A creature of living flame and rock.", baseHpMultiplier: 1.4, strengthMultiplier: 1.5, vitalityMultiplier: 1.3, defenseMultiplier: 1.3, speedMultiplier: 0.8, luckMultiplier: 0.6, trait: 'Hot-Headed', weaponType: 'hammer', spawnWeight: 14 },
    { name: "Obsidian Guard", names: ["Blackforge", "Volcanite", "Ashwalker", "Cinderborn", "Slagheart"], description: "Armor fused to living flesh.", baseHpMultiplier: 1.3, strengthMultiplier: 1.2, vitalityMultiplier: 1.4, defenseMultiplier: 1.7, speedMultiplier: 0.7, luckMultiplier: 0.5, trait: 'Stoic', weaponType: 'sword', spawnWeight: 12 },
    { name: "Fire Dancer", names: ["Flameweaver", "Sparkwing", "Emberstep", "Pyrelight", "Ignispride"], description: "A nimble fighter of flame.", baseHpMultiplier: 0.8, strengthMultiplier: 1.0, vitalityMultiplier: 0.7, defenseMultiplier: 0.7, speedMultiplier: 1.5, luckMultiplier: 0.9, trait: 'Cheerful', weaponType: 'fist', spawnWeight: 15 },
    { name: "Ash Wraith", names: ["Cinder Specter", "Smoke Form", "Emberwraith", "Sootghost", "Pyrals"], description: "Spirits born of volcanic death.", baseHpMultiplier: 0.9, strengthMultiplier: 1.1, vitalityMultiplier: 0.6, defenseMultiplier: 0.8, speedMultiplier: 1.3, luckMultiplier: 0.8, trait: 'Hot-Headed', weaponType: 'magic', spawnWeight: 13 },
    { name: "Lava Wyrm", names: ["Magmawyrm", "Serpent Tongue", "Cindercoil", "Emberdrake", "Pyrovar"], description: "A serpentine dragon of fire.", baseHpMultiplier: 1.8, strengthMultiplier: 1.6, vitalityMultiplier: 1.5, defenseMultiplier: 1.4, speedMultiplier: 0.9, luckMultiplier: 0.6, trait: 'Hot-Headed', weaponType: 'natural', spawnWeight: 8 },
    { name: "Brimstone Cultist", names: ["Ashspeaker", "Flamekeeper", "Cinder Prophet", "Molten Voice", "Emberguard"], description: "A zealot of volcanic fury.", baseHpMultiplier: 0.9, strengthMultiplier: 1.0, vitalityMultiplier: 0.8, defenseMultiplier: 0.8, speedMultiplier: 1.1, luckMultiplier: 0.9, trait: 'Hot-Headed', weaponType: 'dagger', spawnWeight: 13 },
    { name: "Coal Golem", names: ["Charheart", "Sootwalker", "Cinder construct", "Ashbody", "Slagforge"], description: "An animated coal creature.", baseHpMultiplier: 1.2, strengthMultiplier: 1.3, vitalityMultiplier: 1.2, defenseMultiplier: 1.1, speedMultiplier: 0.8, luckMultiplier: 0.6, trait: 'Stoic', weaponType: 'hammer', spawnWeight: 11 },
    { name: "Flame Sprite", names: ["Sparkling", "Emberkin", "Firikin", "Pyrelit", "Igniculus"], description: "Tiny elemental fire beings.", baseHpMultiplier: 0.4, strengthMultiplier: 0.6, vitalityMultiplier: 0.3, defenseMultiplier: 0.4, speedMultiplier: 1.8, luckMultiplier: 1.0, trait: 'Cheerful', weaponType: 'magic', spawnWeight: 17 },
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
    return items[items.length - 1]!;
}

function createEnemyFromTemplate(template: EnemyTemplate, level: number, id: string): Combatant {
    const baseClass = template.weaponType === 'magic' ? BaseClass.Mage :
                       template.weaponType === 'natural' ? BaseClass.Thief :
                       template.weaponType === 'fist' ? BaseClass.Warrior :
                       template.baseHpMultiplier > 1.2 ? BaseClass.Warrior :
                       BaseClass.Thief;
    
    const calculatedStats = StatCalculator.calculateStats(level, baseClass, 0);
    const name = template.names[Math.floor(Math.random() * template.names.length)]!;
    const baseHp = StatCalculator.calculateHP(calculatedStats);
    const baseMp = StatCalculator.calculateMP(calculatedStats);
    const hp = Math.floor(baseHp * template.baseHpMultiplier);
    
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
            strength: Math.floor(calculatedStats.strength * template.strengthMultiplier),
            vitality: Math.floor(calculatedStats.vitality * template.vitalityMultiplier),
            agility: Math.floor(calculatedStats.agility * template.speedMultiplier),
            spirit: Math.floor(calculatedStats.spirit * template.defenseMultiplier),
            luck: Math.floor(calculatedStats.luck * template.luckMultiplier),
            intelligence: calculatedStats.intelligence
        },
        weapon: null,
        armor: null,
        accessory: null
    };
}

export class EnemyGenerator {
    static generateEnemySet(biome: string, level: number, count: number, setId: string): Combatant[] {
        const enemies: Combatant[] = [];
        const biomeEnemyList = BIOME_ENEMIES[biome] ?? BIOME_ENEMIES[BiomeType.Frozen]!;
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
    
    static generateBossSet(biome: string, floorNumber: number, bossIndex: number): Combatant[] {
        const level = floorNumber + 2;
        const id = `boss_${floorNumber}_${bossIndex}_${Math.random().toString(36).substring(2, 8)}`;
        
        const biomeEnemies = BIOME_ENEMIES[biome] ?? BIOME_ENEMIES[BiomeType.Frozen]!;
        const bossTemplates = biomeEnemies.filter(e => 
            e.name.includes('Elemental') || 
            e.name.includes('Overlord') || 
            e.name.includes('Wyrm') ||
            e.name.includes('Knight')
        );
        
        const template = bossTemplates.length > 0 
            ? bossTemplates[Math.floor(Math.random() * bossTemplates.length)]!
            : selectWeightedRandom(biomeEnemies);
        
        const bossName = template.names[Math.floor(Math.random() * template.names.length)]!;
        const boss = createEnemyFromTemplate(template, level, id);
        boss.name = `${bossName}, ${template.name} of the Depths`;
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
}
