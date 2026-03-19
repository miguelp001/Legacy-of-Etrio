import { NPCGenerator } from '../../shared/src/party.js';
import { SnapshotService } from './snapshotService.js';
import { StatCalculator } from '../../shared/src/stats.js';

async function verifyPhase7() {
    console.log("--- Phase 7 Verification: The Nine Tribes ---");

    // 1. Verify NPC Generation & Tribal Assignment
    console.log("\n1. Testing NPC Generation...");
    const npcs = Array.from({ length: 50 }, () => NPCGenerator.generateNPC(1, 0));
    const vampires = npcs.filter(n => n.isVampire);
    console.log(`Generated 50 NPCs. Vampires: ${vampires.length}`);
    
    if (vampires.length > 0) {
        const tribeCounts = vampires.reduce((acc, v) => {
            acc[v.tribe!] = (acc[v.tribe!] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        console.log("Tribe Distribution:", tribeCounts);
    } else {
        console.warn("No vampires generated in 50 attempts! (Probability is 30%)");
    }

    // 2. Verify Tribal Stat Bonuses
    console.log("\n2. Testing Tribal Stat Bonuses (Jotunheimr example)...");
    const baseStats = { strength: 10, agility: 10, intelligence: 10, vitality: 10, spirit: 10, luck: 10 };
    const jotunStats = StatCalculator.applyTribalBonuses({ ...baseStats }, 'Jotunheimr');
    console.log("Base Vitality: 10, Jotunheimr Vitality:", jotunStats.vitality);
    if (jotunStats.vitality === 12.5) {
        console.log("✅ Jotunheimr bonus (+25% VIT) applied correctly.");
    } else {
        console.error("❌ Jotunheimr bonus failed. Expected 12.5, got", jotunStats.vitality);
    }

    // 3. Verify Starvation Penalty
    console.log("\n3. Testing Starvation Penalty...");
    const starvingStats = StatCalculator.applyTribalBonuses({ ...baseStats }, 'Logi', true);
    console.log("Base Strength: 10, Starving Strength:", starvingStats.strength);
    if (starvingStats.strength === 5) {
        console.log("✅ Starvation penalty (-50%) applied correctly.");
    } else {
        console.error("❌ Starvation penalty failed. Expected 5, got", starvingStats.strength);
    }

    // 4. Verify Snapshot Blood Consumption
    console.log("\n4. Testing Snapshot Blood Consumption...");
    const party = [
        NPCGenerator.generateNPC(100, 0), 
        NPCGenerator.generateNPC(100, 0)
    ];
    (party[0] as any).isVampire = true; // Ensure at least one vampire
    (party[1] as any).isVampire = false;

    const snapshotResult = await SnapshotService.calculateOfflineProgress(
        60 * 60 * 1000, // 1 hour
        party,
        1,
        'test-player',
        100, // initial rations
        false,
        0
    );

    console.log(`Initial Rations: 100, Remaining: ${snapshotResult.bloodRationsRemaining}`);
    // 1 vampire * 5 rations * 30 ticks (60 mins / 2 mins) = 150 rations needed.
    // So remaining should be 0 and isStarving should be true.
    console.log("Is Starving in result:", (party[0] as any).isStarving);
    
    if (snapshotResult.bloodRationsRemaining === 0 && (party[0] as any).isStarving) {
        console.log("✅ Blood consumption and starvation logic verified.");
    } else {
        console.error("❌ Blood logic failure. Remaining:", snapshotResult.bloodRationsRemaining);
    }

    console.log("\n--- Verification Complete ---");
}

verifyPhase7().catch(console.error);
