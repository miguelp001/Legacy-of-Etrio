import { GameService } from './gameService.js';
import { SnapshotService } from './snapshotService.js';
import { NPCGenerator } from '../../shared/src/party.js';
import { prisma, initPrisma } from './db.js';

async function verifyFix() {
    console.log("--- Verifying Dungeon Generation Fix ---");

    // 1. Mock Database
    // We assume the DB binding is available or we mock the prisma calls.
    // In this test environment, we might need to mock the prisma instance.
    (prisma as any).playerState = {
        findUnique: async () => ({
            id: 'test-player',
            state: JSON.stringify({
                currentFloor: 1,
                mainCharacter: NPCGenerator.generateNPC(1, 0),
                party: [NPCGenerator.generateNPC(1, 0)],
                guildUpgrades: [],
                councilMembers: [],
                gold: 100,
                bloodRations: 100,
                inventory: [],
                relationships: []
            })
        }),
        update: async (args: any) => {
            console.log("DB Update called with state size:", args.data.state.length);
            return args.data;
        }
    };
    (prisma as any).corpse = {
        create: async () => ({})
    };

    // 2. Test GameService.processCombatTick
    console.log("\nTesting GameService.processCombatTick...");
    try {
        const result = await GameService.processCombatTick('test-player');
        console.log("✅ processCombatTick successful!");
        console.log(`- Biome: ${result.floorData.biome}`);
        console.log(`- Rooms: ${result.floorData.rooms.length}`);
        console.log(`- Results: ${result.roomResults.length}`);
    } catch (e: any) {
        console.error("❌ processCombatTick failed:", e.message);
        console.error(e.stack);
    }

    // 3. Test SnapshotService.calculateOfflineProgress
    console.log("\nTesting SnapshotService.calculateOfflineProgress...");
    try {
        const party = [NPCGenerator.generateNPC(1, 0)];
        const result = await SnapshotService.calculateOfflineProgress(
            10 * 60 * 1000, // 10 minutes
            party,
            1,
            'test-player',
            100
        );
        console.log("✅ calculateOfflineProgress successful!");
        console.log(`- Events: ${result.events.length}`);
        console.log(`- Gold: ${result.gold}`);
        console.log(`- Final Floor: ${result.finalFloor}`);
    } catch (e: any) {
        console.error("❌ calculateOfflineProgress failed:", e.message);
        console.error(e.stack);
    }

    console.log("\n--- Verification Complete ---");
}

verifyFix().catch(console.error);
