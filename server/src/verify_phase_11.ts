import { ItemGenerator, Rarity } from '../../shared/src/items.js';

async function verifyInfusion() {
    console.log('--- Verifying Phase 11: Aether Infusion ---');
    
    // Test base item
    const baseItem = ItemGenerator.generateItem(10);
    console.log(`Original Item: ${baseItem.name} (${baseItem.rarity})`);
    
    // Simulate multiple infusions to check success/failure
    let successes = 0;
    let failures = 0;
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
        const item = ItemGenerator.generateItem(10);
        const result = ItemGenerator.infuseItem(item);
        if (result.success) successes++;
        else failures++;
    }

    console.log(`Results from ${iterations} infusions:`);
    console.log(`- Successes: ${successes} (Expected ~90)`);
    console.log(`- Failures: ${failures} (Expected ~10)`);

    // Test stat boost accuracy
    let itemToInfuse = ItemGenerator.generateItem(1);
    // Ensure it has some stats
    while (!(itemToInfuse.stats.strength || itemToInfuse.stats.intelligence)) {
        itemToInfuse = ItemGenerator.generateItem(1);
    }

    const statKey = itemToInfuse.stats.strength ? 'strength' : 'intelligence';
    const originalVal = itemToInfuse.stats[statKey] || 0;
    const infusionResult = ItemGenerator.infuseItem(itemToInfuse);
    
    if (infusionResult.success) {
        const newVal = infusionResult.result.stats[statKey] || 0;
        const expectedVal = Math.ceil(originalVal * 1.2);
        console.log(`Stat Check (${statKey}): ${originalVal} -> ${newVal} (Expected ${expectedVal})`);
        if (newVal === expectedVal) console.log('✅ Stat boost calculated correctly.');
        else console.log('❌ Stat boost calculation error.');
    }

    if (failures > 0) {
        console.log('✅ Corruption logic triggered during testing.');
    } else {
        console.log('⚠️ No corruption failures occurred in this test run (random chance).');
    }

    console.log('--- Verification Complete ---');
}

verifyInfusion().catch(console.error);
