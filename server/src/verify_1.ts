import { NPCGenerator } from '../../shared/src/party.js';

console.log('--- Phase 6 Verification: [1/3] Distribution ---');
const counts: Record<string, number> = {};
for (let i = 0; i < 100; i++) {
    const npc = NPCGenerator.generateNPC(1, 0);
    const cls = npc.socialClass || 'Unknown';
    counts[cls] = (counts[cls] || 0) + 1;
}
console.table(counts);
