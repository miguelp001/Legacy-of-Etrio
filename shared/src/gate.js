export class GateManager {
    static getNextGate(currentFloor, gateProgress) {
        return gateProgress.find(g => !g.isUnlocked && g.floor >= currentFloor) || null;
    }
    static calculateContribution(amount, milestone) {
        const nextGold = Math.min(milestone.requiredGold, milestone.currentGold + amount);
        return {
            ...milestone,
            currentGold: nextGold,
            isUnlocked: nextGold >= milestone.requiredGold
        };
    }
    static generateInitialGates() {
        return [
            { floor: 10, requiredGold: 1000, currentGold: 0, isUnlocked: false },
            { floor: 50, requiredGold: 25000, currentGold: 0, isUnlocked: false },
            { floor: 100, requiredGold: 100000, currentGold: 0, isUnlocked: false },
            { floor: 500, requiredGold: 1000000, currentGold: 0, isUnlocked: false }
        ];
    }
}
//# sourceMappingURL=gate.js.map