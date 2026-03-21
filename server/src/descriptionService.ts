import type { EventType, HitQuality } from '../../shared/src/descriptionTypes.js';
import type { NightsdeepTrait, SocialClass, DescriptorContext } from '../../shared/src/combat.js';
import { BiomeType } from '../../shared/src/dungeon.js';

const BIOME_ALIASES: Record<string, string[]> = {
    'Frozen Caves': ['The Frozen Wastes', 'Frozen Wastes', 'The Glacial Depths'],
    'Crystalline Peaks': ['The Crystal Spire', 'Crystalline Caverns', 'The Shimmering Depths'],
    'Fungal Grotto': ['The Fungal Maze', 'The Mushroom Labyrinth', 'The Spore Caves'],
    'Volcanic Depths': ['The Molten Core', 'The Ember Pits', 'The Magma Chambers']
};

const WEAPON_VERBS: Record<string, { attack: string[], crit: string[], miss: string[] }> = {
    sword: {
        attack: ['slashes', 'cuts', 'slices', 'parries and thrusts', 'delivers a precise cut', 'shears through'],
        crit: ['bisects', 'cleaves in two', 'delivers a devastating slash', 'cuts clean through', 'finds a critical gap in armor'],
        miss: ['blade whistles past', 'cuts only air', 'swings wide', 'strikes the ground']
    },
    axe: {
        attack: ['hacks', 'chops', 'cleaves', 'delivers a crushing blow', 'smashes', 'tears into'],
        crit: ['splits', 'shatters armor with', 'delivers a bone-crushing', 'cleaves deep', 'hack through'],
        miss: ['axe misses wildly', 'fails to connect', 'swings over', 'chops empty air']
    },
    spear: {
        attack: ['thrusts', 'impales', 'jabs', 'pierces', 'lunges with', 'drives forward'],
        crit: ['runs through', 'transfixes', 'impales on', 'pierces vital', 'thrusts clean through'],
        miss: ['spear thrusts wide', 'fails to find its mark', 'lunges past', 'thrusts into void']
    },
    dagger: {
        attack: ['stabs', 'slashes', 'slices', 'flanks and cuts', 'quick jabs', 'finds gaps'],
        crit: ['finds the throat', 'stabs致命', 'slices artery', 'critical stab', 'finds vital spot'],
        miss: ['knife slips', 'misses by inches', 'cuts nothing', 'fails to connect']
    },
    hammer: {
        attack: ['crushes', 'smashes', 'pounds', 'bludgeons', 'cracks', 'pulverizes'],
        crit: ['crushes bone', 'shatters', 'delivers skull-crushing', 'pulverizes', 'smashes through defense'],
        miss: ['hammer swings wide', 'crashes to ground', 'misses entirely', 'fails to connect']
    },
    fist: {
        attack: ['punches', 'strikes', 'pummels', 'lands a blow', 'fists connect', 'beats'],
        crit: ['knocks out', 'breaks facial bones', 'punches through defense', 'lands devastating blow', 'sends flying'],
        miss: ['punches air', 'swings and misses', 'stumbles', 'fails to land']
    },
    claw: {
        attack: ['claws', 'rakes', 'lacerates', 'tears', 'rips', 'slices with talons'],
        crit: ['rips flesh', 'tears deep gashes', 'lacerates critically', 'finds vital', 'claws through'],
        miss: ['claws miss', 'swipes empty air', 'fails to connect', 'rakes nothing']
    },
    magic: {
        attack: ['blasts', 'channels arcane energy at', 'fires at', 'magical strike hits', 'arcane bolt strikes', 'casts'],
        crit: ['devastates with magic', 'obliterates', 'catastrophic spell hits', 'unleashes arcane fury', 'critical magic'],
        miss: ['spell fizzles', 'magic misses', 'arcane energy dissipates', 'spell goes wide']
    },
    natural: {
        attack: ['strikes', 'attacks', 'bites', 'swarms', 'engulfs', 'stings'],
        crit: ['critical strike', 'finds vital', 'overwhelming force', 'devastating attack', 'fatal blow'],
        miss: ['attack misses', 'fails to connect', 'strikes nothing', 'whiffs']
    }
};

const CLASS_ADJECTIVES: Record<string, string[]> = {
    Warrior: ['battle-hardened', 'fierce', 'combat-trained', 'battle-scarred', 'warrior'],
    Mage: ['arcane', 'spell-wielding', 'mystical', 'channeling power', 'sorcerer'],
    Healer: ['holy', 'divine', 'blessed', 'celestial', 'warding'],
    Thief: ['shadowy', 'stealthy', 'quick', 'agile', 'cunning']
};

const TRAIT_MODIFIERS: Record<string, { attack: string[], crit: string[], miss: string[], passive: string[] }> = {
    Stoic: {
        attack: ['coldly', 'without expression', 'methodically', 'precisely', 'calculatingly'],
        crit: ['brutally', 'mercilessly', 'without hesitation', 'devastatingly', 'with lethal precision'],
        miss: ['unsurprisingly', 'calmly', 'without concern', 'composedly', 'impassively'],
        passive: ['The air grows cold around them.', 'A stoic silence surrounds their movements.', 'Their face reveals nothing.']
    },
    'Hot-Headed': {
        attack: ['furiously', 'in a rage', 'screaming', 'with primal fury', 'savage'],
        crit: ['with murderous rage', 'in blind fury', 'with berserker strength', 'screaming war cries', 'with overwhelming violence'],
        miss: ['rage-blind', 'overextends wildly', 'flails in fury', 'stumbles forward', 'furious swing misses'],
        passive: ['Veins pulse with fury.', 'A red haze clouds their vision.', 'Their rage is palpable.']
    },
    Cheerful: {
        attack: ['with an unsettling grin', 'cheerfully', 'with manic joy', 'humming darkly', 'smiling'],
        crit: ['with gleeful violence', 'laughing maniacally', 'with horrifying delight', 'with psychotic joy', 'morbidly cheerful'],
        miss: ['chuckles', 'giggles at their failure', 'seems amused', 'smiles despite miss', 'finds it funny'],
        passive: ['Their laughter echoes unnervingly.', 'A manic grin never leaves their face.', 'They seem to enjoy this far too much.']
    }
};

const SOCIAL_CLASS_VOCABULARY: Record<string, { verbs: string[], nouns: string[] }> = {
    Thrall: {
        verbs: ['desperately attacks', 'slavering strike', 'feral assault', 'wildly swings', 'survival-bent attack'],
        nouns: ['desperation', 'feral rage', 'barefooted fury', 'enslaved fury']
    },
    Bondi: {
        verbs: ['farmer-strong blow', 'brutal swing', 'country strength', 'heavy-handed strike', 'sturdy attack'],
        nouns: ['rural might', 'oxen strength', 'harvest power', 'earthy force']
    },
    Vardr: {
        verbs: ['military precision', 'disciplined strike', 'tactical attack', 'trained maneuver', 'professional assault'],
        nouns: ['soldier skill', 'military expertise', 'trained lethality', 'battle doctrine']
    },
    Scrifadr: {
        verbs: ['calculated strike', 'analyzed attack', 'strategic blow', 'intellectual assault', 'scholarly precision'],
        nouns: ['calculated force', 'analytical power', 'scholarly might', 'intellectual violence']
    },
    Drengskapr: {
        verbs: ['elegant strike', 'aristocratic assault', 'noble power', 'dignified attack', 'refined fury'],
        nouns: ['aristocratic might', 'noble strength', 'refined violence', 'dignified power']
    }
};

const TRIBE_MODIFIERS: Record<string, { adjectives: string[], phrases: string[] }> = {
    'Vinrforad': {
        adjectives: ['spirit-touched', 'rune-marked', 'ancestor-blessed'],
        phrases: ['The ancient runes glow briefly.', 'Spirits whisper of battle.']
    },
    'Logi': {
        adjectives: ['ember-forged', 'flame-touched', 'fire-blooded'],
        phrases: ['Flames dance at their heels.', 'Their eyes hold ember-glow.']
    },
    'Jotunheimr': {
        adjectives: ['massive', 'mountain-strong', 'colossal', 'giants-blessed'],
        phrases: ['The ground trembles with each step.', 'A titan\'s strength courses through them.']
    },
    'Fridrbjorn': {
        adjectives: ['lucky-struck', 'fortune-touched', 'destined'],
        phrases: ['Fortune seems to favor them.', 'Lucky stars align.']
    },
    'Grima': {
        adjectives: ['plague-touched', 'death-marked', 'grave-walking'],
        phrases: ['A deathly pallor surrounds them.', 'The grave whispers its secrets.']
    },
    'Iftiqad': {
        adjectives: ['shadow-woven', 'fate-threaded', 'destined'],
        phrases: ['Fate seems written in their eyes.', 'Shadows bend to their will.']
    },
    'The Frozen': {
        adjectives: ['ice-wrapped', 'frost-touched', 'winter-born'],
        phrases: ['Frost crackles with each movement.', 'Winter\'s chill precedes them.']
    },
    'The Drowned': {
        adjectives: ['sea-touched', 'depths-walking', 'tide-born'],
        phrases: ['Salt and brine cling to them.', 'The depths seem to call.']
    },
    'The Beasts': {
        adjectives: ['beast-form', 'feral-touched', 'predator-stance'],
        phrases: ['A predator\'s instinct guides them.', 'Wildness fills their gaze.']
    }
};

const DAMAGE_DESCRIPTORS: Record<string, { light: string[], medium: string[], heavy: string[], massive: string[] }> = {
    sword: {
        light: ['a shallow cut', 'a light slice', 'a grazing blow', 'a minor wound'],
        medium: ['a deep cut', 'a solid slash', 'a serious wound', 'a painful strike'],
        heavy: ['a grievous wound', 'a deep slash', 'a devastating cut', 'a nearly fatal strike'],
        massive: ['a mortal wound', 'a killing blow', 'a body-splitting slash', 'complete devastation']
    },
    axe: {
        light: ['a glancing chop', 'a light hack', 'a superficial wound', 'a minor gash'],
        medium: ['a solid chop', 'a deep hack', 'a serious wound', 'a splintering strike'],
        heavy: ['a crushing blow', 'a devastating hack', 'a near-splitting strike', 'a grievous wound'],
        massive: ['a killing stroke', 'complete destruction', 'a devastating cleave', 'total ruin']
    },
    spear: {
        light: ['a shallow thrust', 'a light jab', 'a grazing pierce', 'a minor wound'],
        medium: ['a solid thrust', 'a deep pierce', 'a serious impalement', 'a painful stab'],
        heavy: ['a grievous thrust', 'a near-fatal pierce', 'a devastating stab', 'a critical wound'],
        massive: ['a mortal thrust', 'a killing impalement', 'a complete skewering', 'total perforation']
    },
    dagger: {
        light: ['a scratch', 'a light cut', 'a shallow stab', 'a minor nick'],
        medium: ['a solid cut', 'a deep slice', 'a painful stab', 'a serious wound'],
        heavy: ['a grievous wound', 'a critical stab', 'a devastating cut', 'a near-fatal slice'],
        massive: ['a killing thrust', 'a mortal wound', 'a fatal cut', 'complete devastation']
    },
    hammer: {
        light: ['a glancing blow', 'a light smash', 'a minor impact', 'a light crack'],
        medium: ['a solid smash', 'a crushing blow', 'a serious impact', 'a painful strike'],
        heavy: ['a devastating blow', 'a bone-crushing strike', 'a crushing impact', 'a grievous wound'],
        massive: ['a skull-crushing blow', 'complete destruction', 'total obliteration', 'a killing stroke']
    },
    fist: {
        light: ['a light punch', 'a glancing blow', 'a minor impact', 'a light jab'],
        medium: ['a solid punch', 'a strong blow', 'a serious impact', 'a painful strike'],
        heavy: ['a devastating punch', 'a bone-breaking blow', 'a knock-out strike', 'a grievous impact'],
        massive: ['a killing blow', 'a skull-crushing impact', 'complete destruction', 'total devastation']
    },
    claw: {
        light: ['a scratch', 'a light rake', 'a shallow gash', 'a minor laceration'],
        medium: ['a deep scratch', 'a solid rake', 'a serious laceration', 'a painful tear'],
        heavy: ['a grievous gash', 'a deep laceration', 'a devastating tear', 'a critical wound'],
        massive: ['a fatal laceration', 'a killing tear', 'a mortal wound', 'complete ruin']
    },
    magic: {
        light: ['a spark', 'minor arcane energy', 'a weak blast', 'a light shimmer'],
        medium: ['a solid magical blast', 'arcane energy', 'a serious spell', 'painful magic'],
        heavy: ['devastating magic', 'arcane fury', 'a powerful spell', 'grievous arcane wound'],
        massive: ['obliteration', 'catastrophic magic', 'total arcane devastation', 'unleashed apocalypse']
    },
    natural: {
        light: ['a light strike', 'a minor blow', 'a grazing hit', 'a small wound'],
        medium: ['a solid hit', 'a serious strike', 'a painful attack', 'a meaningful blow'],
        heavy: ['a devastating strike', 'a grievous attack', 'a critical blow', 'a near-fatal hit'],
        massive: ['a killing blow', 'total destruction', 'a mortal wound', 'complete devastation']
    }
};

const KILL_PHRASES = [
    '${speaker} delivers a finishing blow to ${target}!',
    '${target} falls before ${speaker}!',
    '${speaker} claims victory over ${target}!',
    '${target} collapses, defeated by ${speaker}!',
    '${speaker}\'s strike proves fatal to ${target}!',
    '${target} crumples under ${speaker}\'s assault!',
    'A final blow from ${speaker} ends ${target}!',
    '${target} breathes their last as ${speaker} strikes true!'
];

const BIOME_AMBIENCE: Record<string, string[]> = {
    'Frozen Caves': [
        'Ice cracks beneath the combatants.',
        'Frozen mist swirls around them.',
        'The cold intensifies with each strike.',
        'Frost forms where blood falls.'
    ],
    'Crystalline Peaks': [
        'Crystals chime with each impact.',
        'Shards of light scatter with every blow.',
        'The cavern resonates with combat.',
        'Crystal dust fills the air.'
    ],
    'Fungal Grotto': [
        'Spores burst with each movement.',
        'The fungi pulse with life and death.',
        'Bioluminescent light flickers with combat.',
        'The air thickens with fungal spores.'
    ],
    'Volcanic Depths': [
        'Embers scatter with each blow.',
        'The heat intensifies with combat.',
        'Magma glows in the distance.',
        'Smoke rises from the fray.'
    ]
};

export class DescriptionService {
    private static pickRandom<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)]!;
    }

    private static pickWeighted<T>(arr: T[], weights: number[]): T {
        const total = weights.reduce((a, b) => a + b, 0);
        let roll = Math.random() * total;
        for (let i = 0; i < arr.length; i++) {
            roll -= weights[i]!;
            if (roll <= 0) return arr[i]!;
        }
        return arr[arr.length - 1]!;
    }

    private static formatName(name: string): string {
        if (!name) return 'Unknown';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return parts[0]!;
        }
        return name.length > 15 ? name.substring(0, 15) : name;
    }

    private static getDamageTier(damage: number, defenderMaxHp: number): 'light' | 'medium' | 'heavy' | 'massive' {
        const ratio = damage / defenderMaxHp;
        if (ratio < 0.1) return 'light';
        if (ratio < 0.25) return 'medium';
        if (ratio < 0.4) return 'heavy';
        return 'massive';
    }

    private static getLevelAdjective(speakerLevel: number, targetLevel: number): string {
        const diff = speakerLevel - targetLevel;
        if (diff >= 5) return 'veteran';
        if (diff >= 2) return 'experienced';
        if (diff <= -5) return 'green';
        if (diff <= -2) return 'inexperienced';
        return '';
    }

    private static buildAttackPhrase(ctx: DescriptorContext): string {
        const { speaker, target, hitQuality, damage } = ctx;
        const speakerName = this.formatName(speaker.name);
        const targetName = this.formatName(target.name);
        const weaponType = speaker.weaponType || 'natural';
        const weaponData = WEAPON_VERBS[weaponType] ?? WEAPON_VERBS.natural!;
        const damageTier = this.getDamageTier(damage, target.maxHp);
        
        let phrase = '';
        
        // Build subject phrase
        let subject = speakerName;
        
        // Add class adjective for enemies or named characters
        if (speaker.isEnemy) {
            const classAdj = CLASS_ADJECTIVES[speaker.baseClass] || ['fierce'];
            subject = `${this.pickRandom(classAdj)} ${speakerName}`;
        }
        
        // Add tribe modifier if applicable
        if (speaker.tribe && TRIBE_MODIFIERS[speaker.tribe]) {
            const tribeAdj = this.pickRandom(TRIBE_MODIFIERS[speaker.tribe]!.adjectives);
            subject = `${tribeAdj} ${subject}`;
        }
        
        // Add vampire/ascended modifiers
        if (speaker.isVampire) {
            subject = `vampiric ${subject}`;
        }
        if (speaker.isAscended) {
            subject = `ascended ${subject}`;
        }
        
        // Build verb phrase based on hit quality
        let verb: string;
        let verbList: string[];
        
        if (hitQuality === 'MISS') {
            verbList = weaponData.miss;
        } else if (hitQuality === 'CRIT') {
            verbList = weaponData.crit;
        } else {
            verbList = weaponData.attack;
        }
        
        // Add trait modifier to verb
        if (hitQuality === 'MISS' && speaker.trait && TRAIT_MODIFIERS[speaker.trait]) {
            const traitMiss = TRAIT_MODIFIERS[speaker.trait]!.miss;
            phrase = `${subject} ${this.pickRandom(traitMiss)}. `;
            phrase += `${this.pickRandom(verbList)} ${targetName}.`;
        } else if (hitQuality === 'CRIT' && speaker.trait && TRAIT_MODIFIERS[speaker.trait]) {
            const traitCrit = TRAIT_MODIFIERS[speaker.trait]!.crit;
            phrase = `${subject} ${this.pickRandom(traitCrit)}, `;
            phrase += `${this.pickRandom(verbList)} ${targetName}!`;
        } else if (speaker.trait && TRAIT_MODIFIERS[speaker.trait] && Math.random() > 0.5) {
            const traitAttack = TRAIT_MODIFIERS[speaker.trait]!.attack;
            phrase = `${subject} ${this.pickRandom(traitAttack)}, `;
            phrase += `${this.pickRandom(verbList)} ${targetName}.`;
        } else {
            verb = this.pickRandom(verbList);
            phrase = `${subject} ${verb} ${targetName}`;
            
            // Add damage descriptor for non-miss hits
            if (hitQuality !== 'MISS') {
                const damageDescs = DAMAGE_DESCRIPTORS[weaponType] ?? DAMAGE_DESCRIPTORS.natural!;
                const damageDesc = this.pickRandom(damageDescs[damageTier]);
                phrase += ` with ${damageDesc}`;
                
                // Add damage number
                phrase += ` (${damage} dmg)`;
            }
            phrase += '.';
        }
        
        // Add social class flavor for human NPCs
        if (!speaker.isEnemy && speaker.socialClass && SOCIAL_CLASS_VOCABULARY[speaker.socialClass] && Math.random() > 0.6) {
            const classVocab = SOCIAL_CLASS_VOCABULARY[speaker.socialClass]!;
            phrase += ` ${this.pickRandom(classVocab.verbs)}!`;
        }
        
        // Add biome ambience
        if (ctx.biome && BIOME_AMBIENCE[ctx.biome] && Math.random() > 0.7) {
            phrase += ` ${this.pickRandom(BIOME_AMBIENCE[ctx.biome]!)}`;
        }
        
        // Add trait passive (rare)
        if (speaker.trait && TRAIT_MODIFIERS[speaker.trait] && Math.random() > 0.9) {
            const traitPassives = TRAIT_MODIFIERS[speaker.trait]!.passive;
            phrase += ` ${this.pickRandom(traitPassives)}`;
        }
        
        return phrase;
    }

    private static buildKillPhrase(ctx: DescriptorContext): string {
        const speakerName = this.formatName(ctx.speaker.name);
        const targetName = this.formatName(ctx.target.name);
        
        let phrase = this.pickRandom(KILL_PHRASES);
        phrase = phrase.replace('${speaker}', speakerName);
        phrase = phrase.replace('${target}', targetName);
        
        // Add flavor based on how they killed
        const weaponType = ctx.speaker.weaponType || 'natural';
        const weaponData = WEAPON_VERBS[weaponType] || WEAPON_VERBS.natural;
        
        if (ctx.speaker.trait === 'Hot-Headed') {
            phrase += ' Their rage is sated... for now.';
        } else if (ctx.speaker.trait === 'Stoic') {
            phrase += ' They show no emotion.';
        } else if (ctx.speaker.isVampire) {
            phrase += ' Blood feeds their unholy thirst.';
        } else if (ctx.speaker.isAscended) {
            phrase += ' Their power grows.';
        }
        
        return phrase;
    }

    static generateDescriptor(context: DescriptorContext): string {
        // Handle kill
        if (context.isKill && context.hitQuality !== 'MISS') {
            return this.buildKillPhrase(context);
        }
        
        // Handle miss
        if (context.hitQuality === 'MISS') {
            const { speaker, target } = context;
            const speakerName = this.formatName(speaker.name);
            const targetName = this.formatName(target.name);
            const weaponType = speaker.weaponType || 'natural';
            const weaponData = WEAPON_VERBS[weaponType] ?? WEAPON_VERBS.natural!;
            
            let phrase = `${speakerName} `;
            
            // Add trait-specific miss
            if (speaker.trait && TRAIT_MODIFIERS[speaker.trait]) {
                const traitMiss = TRAIT_MODIFIERS[speaker.trait]!.miss;
                phrase += `${this.pickRandom(traitMiss)}, `;
            }
            
            phrase += `${this.pickRandom(weaponData.miss)} ${targetName}.`;
            
            return phrase;
        }
        
        // Handle normal hit or crit
        return this.buildAttackPhrase(context);
    }
}
