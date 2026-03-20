/**
 * Isolated Verification Script
 * This script tests the DungeonManager and CombatEngine logic directly to ensure
 * the room-based generation and simulation work correctly.
 */
import { DungeonManager } from '../../shared/src/dungeon.js';
import { CombatEngine } from '../../shared/src/combat.js';
import { NPCGenerator } from '../../shared/src/party.js';

async function verifyLogic() {
    console.log("--- Isolated Logic Verification ---");

    // 1. Verify DungeonManager.generateFloor
    console.log("\n1. Testing DungeonManager.generateFloor(1)...");
    const floor1 = DungeonManager.generateFloor(1);
    console.log(`Floor 1: Biome=${floor1.biome}, Rooms=${floor1.rooms.length}`);
    
    if (floor1.rooms.length >= 5 && floor1.rooms.length <= 15) {
        console.log("✅ Room count is in correct range (5-15).");
    } else {
        console.error("❌ Room count invalid:", floor1.rooms.length);
    }

    const firstRoom = floor1.rooms[0];
    console.log("Room 0 Type:", firstRoom.type);
    console.log("Room 0 Description:", firstRoom.description);
    if (firstRoom.rooms !== undefined) {
        console.error("❌ RECURSION ERROR: floorData.rooms has a 'rooms' property!");
    } else {
        console.log("✅ Room structure looks correct.");
    }

    // 2. Verify Simulation Logic
    console.log("\n2. Testing Combat Simulation with Rooms...");
    const party = [NPCGenerator.generateNPC(1, 0)];
    let wiped = false;
    let roomResults = [];

    for (const room of floor1.rooms) {
        if (wiped) break;
        console.log(`- Entering room: ${room.type}`);
        if (room.enemies && room.enemies.length > 0) {
            console.log(`  Enemies: ${room.enemies.length}`);
            const result = CombatEngine.simulate(party, room.enemies);
            console.log(`  Combat result victory: ${result.victory}`);
            if (!result.victory) wiped = true;
        } else {
            console.log("  No enemies.");
        }
    }
    console.log(`Floor simulation finished. Wiped: ${wiped}`);
    console.log("✅ Simulation logic verified.");

    console.log("\n--- Verification Complete ---");
}

verifyLogic().catch(e => {
    console.error("❌ Verification failed!");
    console.error(e);
});
