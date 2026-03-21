import { SnapshotService } from './snapshotService.js';
import { ItemGenerator, Rarity } from '../../shared/src/items.js';
import type { Combatant } from '../../shared/src/combat.js';

async function verifySoulBinding() {
    console.log('--- Verifying Phase 12: Soul-Binding (Heirloom Gear) ---');

    const weapon = ItemGenerator.generateItem(1);
    const armor = ItemGenerator.generateItem(1);
    const accessory = ItemGenerator.generateItem(1);
    
    // Mark weapon as Soul-Bound
    weapon.isSoulBound = true;
    console.log(`Began ritual: Bound ${weapon.name} to the lineage soul.`);

    const party: Combatant[] = [{
        id: 'player-mc',
        name: 'Soul-Bound Hero',
        level: 1,
        xp: 0,
        hp: 1,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        stats: { strength: 1, agility: 1, intelligence: 1, vitality: 1, spirit: 1, luck: 1 },
        isEnemy: false,
        weapon,
        armor,
        accessory,
        baseClass: 'Warrior',
        generation: 1
    }];

    // Simulate snapshot where party wipes immediately
    // 60000ms = 1 min = 0 ticks? 
    // Let's use 120000ms = 2 mins = 1 tick.
    const result = await SnapshotService.calculateOfflineProgress(
        120000, 
        party, 
        1, 
        'player-mc', 
        100,
        false,
        0
    );

    console.log(`Snapshot Result: Wiped = ${result.wiped}`);
    
    if (result.lostGear) {
        const lostNames = result.lostGear.map(i => i.name);
        console.log(`Lost Gear: ${lostNames.join(', ')}`);
        
        const isWeaponLost = result.lostGear.some(i => i.id === weapon.id);
        const isArmorLost = result.lostGear.some(i => i.id === armor.id);
        const isAccessoryLost = result.lostGear.some(i => i.id === accessory.id);

        if (!isWeaponLost && isArmorLost && isAccessoryLost) {
            console.log('✅ SUCCESS: Soul-bound weapon was preserved, while other gear was lost.');
        } else {
            console.log('❌ FAILURE: Soul-binding logic error.');
            if (isWeaponLost) console.log('   - Item marked as soul-bound was lost!');
            if (!isArmorLost) console.log('   - Non-soul-bound armor was NOT lost!');
        }
    } else {
        console.log('❌ FAILURE: No lost gear reported despite wipe.');
    }

    console.log('--- Verification Complete ---');
}

verifySoulBinding().catch(console.error);
