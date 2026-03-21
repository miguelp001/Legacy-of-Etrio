import type { EventType, HitQuality, DescriptorTemplate } from '../../shared/src/descriptionTypes.js';
import type { NightsdeepTrait, SocialClass } from '../../shared/src/combat.js';
import { BiomeType } from '../../shared/src/dungeon.js';
import descriptionLibrary from '../../shared/src/descriptionLibrary.json' with { type: 'json' };

export interface DescriptionContext {
    eventType: EventType;
    speaker: {
        name: string;
        trait?: NightsdeepTrait;
        socialClass?: SocialClass;
        weapon?: string;
    };
    target?: {
        name: string;
    };
    biome?: BiomeType;
    hitQuality?: HitQuality;
    affinity?: number;
    dreadLevel: number;
    value?: number;
}

const BIOME_ALIASES: Record<string, string[]> = {
    'Frozen Caves': ['The Frozen Wastes', 'Frozen Wastes'],
    'Crystalline Peaks': ['Crystalline Caverns', 'Crystal Caverns'],
    'Fungal Grotto': ['Fungal Depths', 'Mushroom Caves'],
    'Volcanic Depths': ['Molten Core', 'Volcanic Core']
};

const GENERIC_ATTACK_TEMPLATES = [
    "${speaker} lunges forward, striking ${target} with fierce determination.",
    "${speaker} delivers a crushing blow to ${target}.",
    "${speaker} presses the attack against ${target}.",
    "${speaker} finds an opening and strikes ${target}.",
    "${speaker} swings with brutal efficiency at ${target}.",
    "${speaker} cuts deep into ${target}.",
    "${speaker} drives ${target} back with a vicious strike.",
    "${speaker} lands a solid hit on ${target}.",
    "${speaker} carves through ${target}'s defenses.",
    "${speaker} thrusts toward ${target} with deadly intent.",
    "${speaker} hacks at ${target} with savage force.",
    "${speaker} delivers a punishing blow to ${target}.",
    "${speaker} smashes into ${target} with overwhelming strength.",
    "${speaker} cleaves toward ${target}.",
    "${speaker} unleashes a fury of strikes against ${target}.",
    "${speaker} strikes true, hitting ${target} hard.",
    "${speaker} catches ${target} off-guard with a quick jab.",
    "${speaker} slashes ${target} across the body.",
    "${speaker} hits ${target} with a bone-crushing impact.",
    "${speaker} overwhelms ${target} with relentless assault."
];

const GENERIC_CRIT_TEMPLATES = [
    "${speaker} obliterates ${target} with a devastating critical strike!",
    "${speaker} shatters ${target}'s defense with a CRITICAL HIT!",
    "${speaker} tears through ${target} like paper!",
    "${speaker} delivers a soul-crushing blow to ${target}!",
    "${speaker} annihilates ${target} with a devastating strike!",
    "${speaker} bisects ${target} with a perfectly aimed attack!",
    "${speaker} reduces ${target} to a bleeding ruin!",
    "${speaker} executes a flawless strike that cleaves ${target}!",
    "${speaker}'s blow echoes through the chamber as ${target} reels!",
    "${speaker} unleashes holy fury upon ${target}!"
];

const GENERIC_MISS_TEMPLATES = [
    "${speaker} swings wildly but hits only air.",
    "${speaker} stumbles and misses ${target} entirely.",
    "${speaker}'s attack goes wide, finding nothing.",
    "${speaker} overextends and strikes empty void.",
    "${speaker} fails to connect with ${target}.",
    "${speaker}'s blow whistles past ${target}'s ear.",
    "${speaker} hesitates and misses the mark.",
    "${speaker} loses balance and strikes nothing.",
    "${speaker} lunges at shadow, not ${target}.",
    "${speaker}'s weapon finds only darkness."
];

const TRAIT_BANTER: Record<string, string[]> = {
    'Stoic': [
        "${speaker} remains impassive, coldly striking ${target}.",
        "${speaker} shows no emotion as they hit ${target}.",
        "${speaker} acts with mechanical precision against ${target}."
    ],
    'Hot-Headed': [
        "${speaker} SCREAMS with rage, savage strikes raining on ${target}!",
        "${speaker} flies into a frenzy, battering ${target}!",
        "${speaker}'s fury manifests as brutal force against ${target}!"
    ],
    'Cheerful': [
        "${speaker} giggles maniacally while striking ${target}.",
        "${speaker} hums a dark tune, hitting ${target} with joy.",
        "${speaker} grins wickedly, relishing the violence against ${target}."
    ]
};

const CLASS_BANTER: Record<string, string[]> = {
    'Thrall': [
        "${speaker} fights with desperate, feral intensity against ${target}.",
        "${speaker} bites and claws at ${target} in wild abandon.",
        "${speaker} attacks with nothing but survival instinct against ${target}."
    ],
    'Bondi': [
        "${speaker} swings a heavy blow at ${target} with farming strength.",
        "${speaker} brings brute force to bear against ${target}.",
        "${speaker} overwhelms ${target} with sheer, stubborn might."
    ],
    'Vardr': [
        "${speaker} executes a textbook maneuver against ${target}.",
        "${speaker} strikes with military precision at ${target}.",
        "${speaker} channels discipline into a decisive blow against ${target}."
    ],
    'Scrifadr': [
        "${speaker} calculates the perfect angle to strike ${target}.",
        "${speaker} analyzes ${target}'s weakness and exploits it.",
        "${speaker} strikes with intellectual fury at ${target}."
    ],
    'Drengskapr': [
        "${speaker} delivers an elegant, aristocratic strike against ${target}.",
        "${speaker} moves with noble grace, cutting ${target}.",
        "${speaker} strikes ${target} with dignified savagery."
    ]
};

export class DescriptionService {
    private static templates: DescriptorTemplate[] = descriptionLibrary as DescriptorTemplate[];

    private static pickRandom<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)]!;
    }

    private static formatSpeaker(name: string): string {
        if (!name) return 'The warrior';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return parts[0]!;
        }
        return name.length > 12 ? name.substring(0, 12) : name;
    }

    private static formatTarget(name: string): string {
        if (!name) return 'the enemy';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return parts[0]!;
        }
        return name.length > 12 ? name.substring(0, 12) : name;
    }

    private static interpolate(text: string, speaker: string, target: string): string {
        return text
            .replace(/\${speaker}/g, speaker)
            .replace(/\${target}/g, target)
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\[\[NAME:[^:]+:([^\]]+)\]\]/g, '$1');
    }

    static generateDescriptor(context: DescriptionContext): string {
        const speaker = this.formatSpeaker(context.speaker.name);
        const target = this.formatTarget(context.target?.name || 'enemy');
        const { hitQuality } = context;
        const trait = context.speaker.trait;
        const socialClass = context.speaker.socialClass;

        if (hitQuality === 'MISS') {
            const classBanter = socialClass && CLASS_BANTER[socialClass] 
                ? CLASS_BANTER[socialClass] 
                : [];
            const templates = [...GENERIC_MISS_TEMPLATES, ...classBanter];
            return this.interpolate(this.pickRandom(templates), speaker, target);
        }

        if (hitQuality === 'CRIT') {
            const traitBanter = trait && TRAIT_BANTER[trait] 
                ? TRAIT_BANTER[trait] 
                : [];
            const classBanter = socialClass && CLASS_BANTER[socialClass] 
                ? CLASS_BANTER[socialClass] 
                : [];
            const templates = [...GENERIC_CRIT_TEMPLATES, ...traitBanter, ...classBanter];
            return this.interpolate(this.pickRandom(templates), speaker, target);
        }

        const traitBanter = trait && TRAIT_BANTER[trait] 
            ? TRAIT_BANTER[trait] 
            : [];
        const classBanter = socialClass && CLASS_BANTER[socialClass] 
            ? CLASS_BANTER[socialClass] 
            : [];
        const templates = [...GENERIC_ATTACK_TEMPLATES, ...traitBanter, ...classBanter];
        return this.interpolate(this.pickRandom(templates), speaker, target);
    }
}
