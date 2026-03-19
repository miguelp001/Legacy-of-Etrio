import { NPCGenerator } from '../../shared/src/party.js';
import { SnapshotService } from './snapshotService.js';

async function verifyPhase8() {
    console.log("--- Phase 8 Verification: Faith and Miracles ---");

    // 1. Verify NPC Piety Generation
    console.log("\n1. Testing Piety & Blessing Generation...");
    const npcs = Array.from({ length: 50 }, () => NPCGenerator.generateNPC(1, 0));
    const humans = npcs.filter(n => !n.isVampire);
    const andBlessed = humans.filter(h => h.blessings && h.blessings.length > 0);
    
    console.log(`Generated 50 NPCs. Humans: ${humans.length}, Blessed: ${andBlessed.length}`);
    
    if (humans.length > 0) {
        const avgPiety = humans.reduce((acc, h) => acc + (h.piety || 0), 0) / humans.length;
        console.log(`Average Human Piety: ${avgPiety.toFixed(2)}`);
        
        const vampireWithPiety = npcs.filter(n => n.isVampire && (n.piety || 0) > 0);
        if (vampireWithPiety.length === 0) {
            console.log("✅ Verified: Vampires have 0 piety.");
        } else {
            console.error("❌ Bug: Vampires found with piety!", vampireWithPiety);
        }
    }

    // 2. Verify Miracle Triggers in Snapshot
    console.log("\n2. Testing Miracle Triggers in Snapshot...");
    const piousPaladin = NPCGenerator.generateNPC(100, 0);
    piousPaladin.isVampire = false;
    piousPaladin.piety = 100;
    piousPaladin.blessings = ['Saluwan\'s Wrath'];

    const snapshotResult = await SnapshotService.calculateOfflineProgress(
        1000 * 2 * 60 * 1000, // 1000 ticks
        [piousPaladin],
        1,
        'test-player',
        100,
        false,
        0
    );

    const miracleEvents = snapshotResult.events.filter(e => e.banter?.startsWith('MIRACLE:'));
    console.log(`In 60 ticks, triggered ${miracleEvents.length} miracles.`);
    
    if (miracleEvents.length > 0) {
        console.log("✅ Miracles triggered correctly.");
        console.log("Sample Miracle:", miracleEvents[0]?.banter);
    } else {
        console.warn("⚠️ No miracles triggered in 60 ticks (Probability per tick: 5%). This might be bad luck or a bug.");
    }

    console.log("\n--- Verification Complete ---");
}

verifyPhase8().catch(console.error);
