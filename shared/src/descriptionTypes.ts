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
        0: ['hits', 'strikes', 'slashes', 'stabs'],
        5: ['reaps', 'severs', 'punctures', 'gashes'],
        10: ['rends', 'withers', 'annihilates', 'extinguishes']
    },
    defend: {
        0: ['blocks', 'parries', 'deflects'],
        5: ['absorbs', 'endures', 'withstands'],
        10: ['shrugs off', 'nullifies', 'ignores']
    }
};
