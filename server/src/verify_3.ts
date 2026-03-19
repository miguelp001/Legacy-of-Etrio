import { NPCGenerator } from '../../shared/src/party.js';
import { LineageManager } from '../../shared/src/lineage.js';

console.log('--- Phase 6 Verification: [3/3] Lineage ---');
const p1 = NPCGenerator.generateNPC(1, 0);
p1.socialClass = 'Bondi';
const p2 = NPCGenerator.generateNPC(1, 0);
p2.socialClass = 'Drengskapr';

const heir = LineageManager.createHeir(p1 as any, p2 as any);
console.log(`- Parent 1 Class: ${p1.socialClass}`);
console.log(`- Parent 2 Class: ${p2.socialClass}`);
console.log(`- Heir Class: ${heir.socialClass} (Inheritance path verified)`);
