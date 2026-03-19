import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { NPCGenerator } from '../../shared/src/party.js';
import { ItemGenerator, Rarity } from '../../shared/src/items.js';
import { CombatEngine } from '../../shared/src/combat.js';
import { OfflineEngine } from '../../shared/src/offline.js';
import { DungeonManager } from '../../shared/src/dungeon.js';
import { SnapshotService } from './snapshotService.js';
import { StateService } from './stateService.js';
import { GameService } from './gameService.js';
import { AuthService } from './authService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Legacy of Etrio Backend Running' });
});

app.get('/api/generate-npc', (req, res) => {
    const level = parseInt(req.query.level as string) || 1;
    const generation = parseInt(req.query.generation as string) || 0;
    const npc = NPCGenerator.generateNPC(level, generation);
    res.json(npc);
});

app.get('/api/generate-item', (req, res) => {
    const level = parseInt(req.query.level as string) || 1;
    const item = ItemGenerator.generateItem(level);
    res.json(item);
});

app.post('/api/simulate-combat', (req, res) => {
    const { party, enemies } = req.body;
    if (!party || !enemies) {
        return res.status(400).json({ error: 'Party and enemies are required' });
    }
    const result = CombatEngine.simulate(party, enemies);
    res.json(result);
});

app.post('/api/calculate-snapshot', async (req, res) => {
    const { lastLogout, currentTime, party, startFloor, playerId, bloodRations, isResonatorActive, resonatorMastery } = req.body;
    
    if (!lastLogout || !currentTime || !party || startFloor === undefined || !playerId) {
        return res.status(400).json({ error: 'Missing required fields for snapshot calculation.' });
    }

    const result = await SnapshotService.calculateOfflineProgress(
        currentTime - lastLogout,
        party,
        startFloor,
        playerId,
        bloodRations || 0,
        isResonatorActive || false,
        resonatorMastery || 0
    );

    res.json(result);
});

app.get('/api/corpses', async (req, res) => {
    res.json(await SnapshotService.getCorpses());
});

app.post('/api/lay-to-rest', async (req, res) => {
    const { corpseId } = req.body;
    if (!corpseId) return res.status(400).json({ error: 'corpseId is required' });
    
    const success = await SnapshotService.layToRest(corpseId);
    res.json({ success, message: success ? 'Corpse laid to rest. Luck buff granted!' : 'Corpse not found' });
});

app.get('/api/state/:playerId', async (req, res) => {
    const state = await StateService.getPlayerState(req.params.playerId);
    res.json(state);
});

app.post('/api/state', async (req, res) => {
    const { playerId, state } = req.body;
    if (!playerId || !state) return res.status(400).json({ error: 'playerId and state are required' });
    
    await StateService.savePlayerState(playerId, state);
    res.json({ success: true });
});

app.get('/api/guild-settings', async (req, res) => {
    res.json(await StateService.getGuildSettings());
});

app.post('/api/guild-settings', async (req, res) => {
    const { pollutionLevel, masteryLevel } = req.body;
    await StateService.updateGuildSettings(pollutionLevel, masteryLevel);
    res.json({ success: true });
});

// Authoritative Actions
app.post('/api/game/upgrade', async (req, res) => {
    const { playerId, buildingId } = req.body;
    try {
        const state = await GameService.upgradeBuilding(playerId, buildingId);
        res.json(state);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/game/tick', async (req, res) => {
    const { playerId } = req.body;
    try {
        const result = await GameService.processCombatTick(playerId);
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/game/infuse', async (req, res) => {
    const { playerId, inventoryIndex, cost } = req.body;
    try {
        const result = await GameService.infuseItem(playerId, inventoryIndex, cost);
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/game/bind', async (req, res) => {
    const { playerId, itemId, cost } = req.body;
    try {
        const state = await GameService.bindItem(playerId, itemId, cost);
        res.json(state);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/game/donate', async (req, res) => {
    const { playerId, amount } = req.body;
    try {
        const state = await GameService.donateToGate(playerId, amount);
        res.json(state);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/game/heal', async (req, res) => {
    const { playerId, targetId, cost } = req.body;
    try {
        const state = await GameService.healCharacter(playerId, targetId, cost);
        res.json(state);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/game/ascend', async (req, res) => {
    const { playerId, characterId } = req.body;
    try {
        const state = await GameService.ascendCharacter(playerId, characterId);
        res.json(state);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await AuthService.register(username, password);
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await AuthService.login(username, password);
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/calculate-offline-gains', (req, res) => {
    const { startTime, endTime, startFloor, autoSellRarity } = req.body;
    
    // Validate inputs
    if (!startTime || !endTime || startFloor === undefined) {
        return res.status(400).json({ error: 'startTime, endTime, and startFloor are required' });
    }

    const rawGains = OfflineEngine.calculateGains(startTime, endTime, startFloor);
    
    // Apply Auto-Sell
    let extraGold = 0;
    const keptItems = rawGains.items.filter(item => {
        if (autoSellRarity && ItemGenerator.shouldAutoSell(item, autoSellRarity as Rarity)) {
            extraGold += 50; // Standard auto-sell value
            return false;
        }
        return true;
    });

    res.json({
        ...rawGains,
        items: keptItems,
        gold: rawGains.gold + extraGold,
        autoSoldItemCount: rawGains.items.length - keptItems.length
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
