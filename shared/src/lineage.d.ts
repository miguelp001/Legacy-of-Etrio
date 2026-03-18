import type { CharacterStats } from './stats.js';
import type { Trait } from './party.js';
export declare class LineageManager {
    static createHeir(parent1: CharacterStats & {
        name: string;
        traits: Trait[];
    }, parent2: CharacterStats & {
        name: string;
        traits: Trait[];
    }): CharacterStats & {
        name: string;
        traits: Trait[];
    };
}
//# sourceMappingURL=lineage.d.ts.map