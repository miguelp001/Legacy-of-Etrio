import { NPCGenerator } from '../../shared/src/party.js';
import { SnapshotService } from './snapshotService.js';

console.log('--- Phase 6 Verification: [2/3] Bloodprice ---');
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
// Mock last logout to be 1 hour ago
const result = SnapshotService.calculateOfflineProgress(60 * 60 * 1000, party, 1, 'player-mc');
console.log(`- Wipe Detected: ${result.wiped}`);
console.log(`- Total Bloodprice Penalty: ${result.bloodpricePenalty}g (Expected: 10500g if wiped naturally)`);
// Note: SnapshotService might not always wipe in 1 hour if level 1 is too easy.
// But it should calculate correctly IF a wipe happens.
