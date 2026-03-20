import type { CharacterStats } from './stats.js';
import type { Trait } from './party.js';
import type { SocialClass } from './combat.js';
export declare class LineageManager {
    static createHeir(parent1: CharacterStats & {
        name: string;
        traits: Trait[];
        socialClass: SocialClass;
    }, parent2: CharacterStats & {
        name: string;
        traits: Trait[];
        socialClass: SocialClass;
    }): CharacterStats & {
        id: string;
        name: string;
        traits: Trait[];
        socialClass: SocialClass;
    };
}
//# sourceMappingURL=lineage.d.ts.map