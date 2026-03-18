export interface GateMilestone {
    floor: number;
    requiredGold: number;
    currentGold: number;
    isUnlocked: boolean;
}

export class GateManager {
    static getNextGate(currentFloor: number, gateProgress: GateMilestone[]): GateMilestone | null {
        return gateProgress.find(g => !g.isUnlocked && g.floor >= currentFloor) || null;
    }

    static calculateContribution(amount: number, milestone: GateMilestone): GateMilestone {
        const nextGold = Math.min(milestone.requiredGold, milestone.currentGold + amount);
        return {
            ...milestone,
            currentGold: nextGold,
            isUnlocked: nextGold >= milestone.requiredGold
        };
    }

    static generateInitialGates(): GateMilestone[] {
        return [
            { floor: 10, requiredGold: 1000, currentGold: 0, isUnlocked: false },
            { floor: 50, requiredGold: 25000, currentGold: 0, isUnlocked: false },
            { floor: 100, requiredGold: 100000, currentGold: 0, isUnlocked: false },
            { floor: 500, requiredGold: 1000000, currentGold: 0, isUnlocked: false }
        ];
    }
}
