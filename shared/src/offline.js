import { DungeonManager } from './dungeon.js';
import { ItemGenerator } from './items.js';
export class OfflineEngine {
    static calculateGains(startTime, endTime, startFloor) {
        const timeElapsedMs = endTime - startTime;
        const minutes = Math.floor(timeElapsedMs / (1000 * 60));
        // Base rate: 1 minute per floor climb (simplified)
        const floorsClimbed = Math.floor(minutes / 2);
        const finalFloor = startFloor + floorsClimbed;
        let totalGold = 0;
        const items = [];
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
            timeElapsedMinutes: minutes
        };
    }
}
//# sourceMappingURL=offline.js.map