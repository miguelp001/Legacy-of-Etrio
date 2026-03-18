export interface GateMilestone {
    floor: number;
    requiredGold: number;
    currentGold: number;
    isUnlocked: boolean;
}
export declare class GateManager {
    static getNextGate(currentFloor: number, gateProgress: GateMilestone[]): GateMilestone | null;
    static calculateContribution(amount: number, milestone: GateMilestone): GateMilestone;
    static generateInitialGates(): GateMilestone[];
}
//# sourceMappingURL=gate.d.ts.map