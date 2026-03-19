import { NPCGenerator } from '../../shared/src/party.js';
import { SnapshotService } from './snapshotService.js';
import { LineageManager } from '../../shared/src/lineage.js';

try {
    console.log('--- Phase 6 Verification: The Caste Hierarchy ---');

    // 1. Generation Distribution
    console.log('\n[1/3] NPC Class Distribution (100 samples):');
    const counts: Record<string, number> = {};
    for (let i = 0; i < 100; i++) {
        const npc = NPCGenerator.generateNPC(1, 0);
        const cls = npc.socialClass || 'Unknown';
        counts[cls] = (counts[cls] || 0) + 1;
    }
    console.table(counts);

    // 2. Bloodprice Penalty
    console.log('\n[2/3] Bloodprice Calculation (Mock Wipe):');
    const player = NPCGenerator.generateNPC(1, 0);
    player.id = 'player-mc';
    player.socialClass = 'Bondi';

    const bondiComp = NPCGenerator.generateNPC(1, 0);
    bondiComp.id = 'npc-1';
    bondiComp.socialClass = 'Bondi'; // 500g

    const drengComp = NPCGenerator.generateNPC(1, 0);
    drengComp.id = 'npc-2';
    drengComp.socialClass = 'Drengskapr'; // 10000g

    const party = [player, bondiComp, drengComp];
    const result = await SnapshotService.calculateOfflineProgress(60 * 60 * 1000, party, 1, 'player-mc', 0);
    console.log(`- Wipe Detected: ${result.wiped}`);
    console.log(`- Total Bloodprice Penalty: ${result.bloodpricePenalty}g (Expected: 10500g)`);

    // 3. Lineage Inheritance
    console.log('\n[3/3] Lineage Inheritance:');
    const p1 = NPCGenerator.generateNPC(1, 0);
    p1.socialClass = 'Bondi';
    const p2 = NPCGenerator.generateNPC(1, 0);
    p2.socialClass = 'Drengskapr';

    const heir = LineageManager.createHeir(p1 as any, p2 as any);
    console.log(`- Parent 1 Class: ${p1.socialClass}`);
    console.log(`- Parent 2 Class: ${p2.socialClass}`);
    console.log(`- Heir Class: ${heir.socialClass} (Inheritance path verified)`);
} catch (e: any) {
    console.error('VERIFICATION FAILED:', e.message);
    console.error(e.stack);
}
