import type { NightsdeepTrait, SocialClass } from './combat.js';
import type { BiomeType } from './dungeon.js';

export type EventType = 'COMBAT_ATTACK' | 'COMBAT_DEFEND' | 'BANTER_IDLE' | 'WORLD_EVENT';
export type HitQuality = 'CRIT' | 'NORMAL' | 'MISS';

export interface DescriptorTags {
    eventType: EventType;
    traits?: NightsdeepTrait[];
    ranks?: SocialClass[];
    biomes?: BiomeType[];
    hitQuality?: HitQuality;
    minAffinity?: number;
}

export interface DescriptorTemplate {
    id: string;
    text: string;
    tags: DescriptorTags;
}

export interface VerbSet {
    [dreadLevel: number]: string[];
}

export const VERB_LIBRARY: Record<string, VerbSet> = {
    attack: {
        0: ['hits', 'strikes', 'slashes', 'stabs', 'lunges at', 'chops toward', 'swings at', 'lashes out at', 'presses against'],
        5: ['reaps', 'severs', 'punctures', 'gashes', 'cleaves through', 'lacerates', 'skewers', 'impales', 'mauls'],
        10: ['rends', 'withers', 'annihilates', 'extinguishes', 'obliterates', 'disintegrates', 'eviscerates', 'shatters', 'exterminates']
    },
    defend: {
        0: ['blocks', 'parries', 'deflects', 'evades', 'dodges', 'sidesteps', 'retreats from', 'ducks'],
        5: ['absorbs', 'endures', 'withstands', 'negates', 'braces against', 'weathers', 'stands firm against'],
        10: ['shrugs off', 'nullifies', 'ignores', 'defies', 'transpired through', 'dissipates', 'scorns']
    }
};
