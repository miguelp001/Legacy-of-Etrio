import { ItemGenerator, Rarity } from '../../shared/src/items.js';

async function verifyPhase9() {
    console.log("--- Phase 9 Verification: Nightsdeep Industrialism ---");

    // 1. Verify Industrial Item Generation & Corruption
    console.log("\n1. Testing Industrial Item Generation...");
    const items = Array.from({ length: 100 }, () => ItemGenerator.generateItem(1, true));
    const corrupted = items.filter(i => i.isCorrupted);
    const industrialCount = items.filter(i => i.isIndustrial).length;
    
    console.log(`Generated 100 industrial items.`);
    console.log(`Industrial flag set: ${industrialCount}/100`);
    console.log(`Corrupted count: ${corrupted.length}/100 (Expected ~25)`);
    
    if (corrupted.length > 5 && corrupted.length < 45) {
        console.log("✅ Industrial corruption probability verified.");
    } else {
        console.error("❌ Corruption probability outlier! Check logic.", corrupted.length);
    }

    // 2. Verify Item Structure
    const sample = items[0]!;
    if (sample.isIndustrial === true) {
        console.log("✅ Item structure includes isIndustrial flag.");
    } else {
        console.error("❌ isIndustrial flag missing from generated item!");
    }

    console.log("\n--- Verification Complete ---");
}

verifyPhase9().catch(console.error);
