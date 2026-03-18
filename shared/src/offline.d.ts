import type { Item } from './items.js';
export interface OfflineGains {
    gold: number;
    items: Item[];
    floorsClimbed: number;
    timeElapsedMinutes: number;
}
export declare class OfflineEngine {
    static calculateGains(startTime: number, endTime: number, startFloor: number): OfflineGains;
}
//# sourceMappingURL=offline.d.ts.map