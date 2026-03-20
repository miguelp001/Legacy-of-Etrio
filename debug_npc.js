import { NPCGenerator } from './shared/src/party.js';

function debug() {
    console.log("Debugging NPC Generation...");
    try {
        const npc = NPCGenerator.generateNPC(1, 0);
        console.log("Generated NPC:", JSON.stringify(npc, null, 2));
        
        if (npc.hp === null || isNaN(npc.hp)) {
            console.error("BUG DETECTED: HP is invalid!");
        } else {
            console.log("HP is valid:", npc.hp);
        }
    } catch (e) {
        console.error("Exception during NPC generation:", e);
    }
}

debug();
