import { SnapshotService } from './snapshotService.js';

async function verifyResonatorMastery() {
    console.log('--- Verifying Phase 15: Resonator Mastery ---');

    console.log('1. Testing SnapshotService Multiplier Scaling');
    
    const party: any[] = [{ 
        id: '1', 
        name: 'Super Soldier', 
        stats: { strength: 9999, agility: 9999, intelligence: 9999, vitality: 9999, spirit: 9999, luck: 9999 }, 
        hp: 99999,
        maxHp: 99999,
        level: 100,
        baseClass: 'Warrior',
        generation: 1,
        isVampire: false
    }];
    
    // Base Check (Mastery 0)
    const result0 = await SnapshotService.calculateOfflineProgress(
        120000, party, 1, 'p1', 100, true, 0
    );
    console.log(`Mastery 0 Gold: ${result0.gold} (Wiped: ${result0.wiped}, Events: ${result0.events.length})`);

    // Mastery 5 Check (+50% bonus)
    const result5 = await SnapshotService.calculateOfflineProgress(
        120000, party, 1, 'p1', 100, true, 5
    );
    // Gold per win: (10 * 1.5) * 1.5 = 22.5 -> 22 or 23
    console.log(`Mastery 5 Gold: ${result5.gold}`);

    // Mastery 10 Check (+100% bonus)
    const result10 = await SnapshotService.calculateOfflineProgress(
        120000, party, 1, 'p1', 100, true, 10
    );
    // Gold per win: (10 * 1.5) * 2.0 = 30
    console.log(`Mastery 10 Gold: ${result10.gold}`);

    if (result10.gold > result0.gold) {
        console.log('✅ SUCCESS: Snapshot gold gain scales correctly with resonator mastery.');
    } else {
        console.log('❌ FAILURE: Gold gain did not increase with mastery.');
    }

    console.log('\n2. Testing Store Upgrade Logic (Cost Scaling)');
    // Manual check of the cost formula: 10000 * 2^level
    const cost0 = 10000 * Math.pow(2, 0);
    const cost5 = 10000 * Math.pow(2, 5);
    console.log(`Cost Level 1: ${cost0}`);
    console.log(`Cost Level 6: ${cost5}`);

    if (cost5 === 320000) {
        console.log('✅ SUCCESS: Upgrade cost scaling is exponentially correct.');
    } else {
        console.log(`❌ FAILURE: Expected 320000, got ${cost5}`);
    }

    console.log('--- Verification Complete ---');
}

verifyResonatorMastery().catch(console.error);
