import { StateService } from './stateService.js';

async function verifyFullPersistence() {
    console.log('--- Verifying Comprehensive Backend Persistence ---');

    console.log('\n1. Testing Guild Settings Persistence');
    await StateService.updateGuildSettings(42, 7);
    const settings = await StateService.getGuildSettings();
    console.log(`Saved Settings: Pollution=42, Mastery=7`);
    console.log(`Fetched Settings: Pollution=${settings.pollutionLevel}, Mastery=${settings.masteryLevel}`);
    
    if (settings.pollutionLevel === 42 && settings.masteryLevel === 7) {
        console.log('✅ SUCCESS: Guild settings persisted correctly.');
    } else {
        console.log('❌ FAILURE: Guild settings mismatch.');
    }

    console.log('\n2. Testing Player State Blob Persistence');
    const mockPlayerId = 'test-player-' + Math.random().toString(36).substring(7);
    const mockState = JSON.stringify({ gold: 99999, inventory: ['Legendary Sword'], councilCount: 4 });
    
    await StateService.savePlayerState(mockPlayerId, mockState);
    const fetched = await StateService.getPlayerState(mockPlayerId);
    
    if (fetched && fetched.state === mockState) {
        console.log(`✅ SUCCESS: Full player state blob persisted for ${mockPlayerId}.`);
    } else {
        console.log('❌ FAILURE: Player state mismatch or not found.');
    }

    console.log('\n3. Testing Idempotency & Upsert');
    await StateService.updateGuildSettings(50, 8);
    const updated = await StateService.getGuildSettings();
    if (updated.pollutionLevel === 50) {
        console.log('✅ SUCCESS: Upsert logic confirmed for guild settings.');
    }

    console.log('\n--- Verification Complete ---');
}

verifyFullPersistence().catch(console.error);
