import { VERB_LIBRARY } from '../../shared/src/descriptionTypes.js';
import type { DescriptorTemplate, EventType, HitQuality } from '../../shared/src/descriptionTypes.js';
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

export class DescriptionService {
    private static templates: DescriptorTemplate[] = descriptionLibrary as DescriptorTemplate[];

    static generateDescriptor(context: DescriptionContext): string {
        const filteredTemplates = this.filterTemplates(context);
        const scoredTemplates = filteredTemplates.map(t => ({
            template: t,
            score: this.calculateScore(t, context)
        }));

        // Sort by score descending and pick the best one
        scoredTemplates.sort((a, b) => b.score - a.score);
        const bestTemplate = scoredTemplates[0]?.template;

        if (!bestTemplate) {
            return `${context.speaker.name} performs ${context.eventType.toLowerCase()}.`;
        }

        return this.interpolate(bestTemplate.text, context);
    }

    private static filterTemplates(context: DescriptionContext): DescriptorTemplate[] {
        return this.templates.filter(t => {
            // Must match event type
            if (t.tags.eventType !== context.eventType) return false;

            // If template specifies ranks, context must match one
            if (t.tags.ranks && (!context.speaker.socialClass || !t.tags.ranks.includes(context.speaker.socialClass))) return false;

            // If template specifies traits, context must match one
            if (t.tags.traits && (!context.speaker.trait || !t.tags.traits.includes(context.speaker.trait))) return false;

            // If template specifies biomes, context must match one
            if (t.tags.biomes && (!context.biome || !t.tags.biomes.includes(context.biome))) return false;

            // If template specifies hit quality, context must match
            if (t.tags.hitQuality && t.tags.hitQuality !== context.hitQuality) return false;

            // If template specifies min affinity, context must be >=
            if (t.tags.minAffinity && (context.affinity ?? 0) < t.tags.minAffinity) return false;

            return true;
        });
    }

    private static calculateScore(template: DescriptorTemplate, context: DescriptionContext): number {
        let score = 1; // Base score for matching eventType

        if (template.tags.ranks?.includes(context.speaker.socialClass!)) score++;
        if (template.tags.traits?.includes(context.speaker.trait!)) score++;
        if (template.tags.biomes?.includes(context.biome!)) score++;
        if (template.tags.hitQuality === context.hitQuality) score++;
        if (template.tags.minAffinity) score++;

        return score;
    }

    private static interpolate(text: string, context: DescriptionContext): string {
        const verb = this.getVerb(context);
        const speakerName = this.formatName(context.speaker.name);
        const targetName = this.formatName(context.target?.name || 'the void');
        
        return text
            .replace(/\${speaker}/g, speakerName)
            .replace(/\${target}/g, targetName)
            .replace(/\${verb}/g, verb)
            .replace(/\${weapon}/g, context.speaker.weapon || 'bare hands')
            .replace(/\${value}/g, context.value?.toString() || '0');
    }

    private static formatName(name: string): string {
        let house = 'none';
        if (name.includes('Eklund')) house = 'Eklund';
        else if (name.includes('Valerius')) house = 'Valerius';
        else if (name.includes('Draden')) house = 'Draden';
        
        return `[[NAME:${house}:${name}]]`;
    }

    private static getVerb(context: DescriptionContext): string {
        const type = context.eventType.includes('ATTACK') ? 'attack' : 'defend';
        const set = VERB_LIBRARY[type] || VERB_LIBRARY['attack'];
        
        let level = 0;
        if (context.dreadLevel >= 10) level = 10;
        else if (context.dreadLevel >= 5) level = 5;

        const verbs = set?.[level] || set?.[0] || ['hits'];
        return verbs[Math.floor(Math.random() * verbs.length)] || 'hits';
    }
}
