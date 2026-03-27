import { DungeonManager } from './dungeon';
import { ItemGenerator } from './items';
import type { Item } from './items';

export interface OfflineGains {
    gold: number;
    items: Item[];
    floorsClimbed: number;
    timeElapsedMinutes: number;
}

export class OfflineEngine {
    static readonly MAX_OFFLINE_MINUTES = 24 * 60; // 24 hours

    static calculateGains(startTime: number, endTime: number, startFloor: number): OfflineGains {
        const timeElapsedMs = endTime - startTime;
        let minutes = Math.floor(timeElapsedMs / (1000 * 60));
        
        // Cap offline time at 24 hours
        const cappedMinutes = Math.min(minutes, this.MAX_OFFLINE_MINUTES);
        const wasCapped = minutes > this.MAX_OFFLINE_MINUTES;
        
        // Base rate: 1 minute per 6 floors (1 floor per 6 minutes)
        const floorsClimbed = Math.floor(cappedMinutes / 6);
        const finalFloor = startFloor + floorsClimbed;
        
        let totalGold = 0;
        const items: Item[] = [];

        for (let i = startFloor; i <= finalFloor; i++) {
            const floorData = DungeonManager.generateFloor(i);
            
            // Simulating gold per floor
            totalGold += Math.floor(10 * floorData.goldMultiplier * (1 + Math.random()));
            
            // Simulating loot chance per floor (10%)
            if (Math.random() > 0.9) {
                items.push(ItemGenerator.generateItem(i));
            }
        }

        return {
            gold: totalGold,
            items,
            floorsClimbed,
            timeElapsedMinutes: wasCapped ? this.MAX_OFFLINE_MINUTES : minutes
        };
    }
}
