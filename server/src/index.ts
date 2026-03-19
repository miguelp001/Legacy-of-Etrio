import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { NPCGenerator } from '../../shared/src/party.js';
import { ItemGenerator, Rarity } from '../../shared/src/items.js';
import { CombatEngine } from '../../shared/src/combat.js';
import { OfflineEngine } from '../../shared/src/offline.js';
import { SnapshotService } from './snapshotService.js';
import { StateService } from './stateService.js';
import { GameService } from './gameService.js';
import { AuthService } from './authService.js';
import { initPrisma } from './db.js';

console.log('--- WORKER BOOTING UP: ' + new Date().toISOString() + ' ---');

const app = new Hono<{ Bindings: { DB: any, JWT_SECRET: string } }>();

// 0. Manual OPTIONS handler (Foolproof CORS)
app.options('*', (c) => {
    console.log('[OPTIONS-PREFLIGHT] ' + c.req.url);
    return c.body(null, 204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
});

// 1. CORS MUST be at the very top to handle OPTIONS and error headers
app.use('*', cors());

// 2. Request Logger (Low level)
app.use('*', async (c, next) => {
    console.log(`[REQUEST] ${c.req.method} ${c.req.url}`);
    await next();
});

// 3. Global Error Handler
app.onError((err, c) => {
    console.error('GLOBAL ERROR CAUGHT:', err.message, err.stack);
    return c.json({ 
        error: 'Internal Server Error', 
        message: err.message,
        path: c.req.path 
    }, 500);
});

app.notFound((c) => {
    console.warn(`[404] Route not found: ${c.req.method} ${c.req.path}`);
    return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// 4. Persistence Init
app.use('*', async (c, next) => {
    initPrisma(c.env.DB);
    await next();
});

app.get('/api/health', (c) => {
    return c.json({ status: 'ok', message: 'Legacy of Etrio Backend Running on Hono' });
});

app.get('/api/generate-npc', (c) => {
    const level = parseInt(c.req.query('level') || '1');
    const generation = parseInt(c.req.query('generation') || '0');
    const npc = NPCGenerator.generateNPC(level, generation);
    return c.json(npc);
});

app.get('/api/generate-item', (c) => {
    const level = parseInt(c.req.query('level') || '1');
    const item = ItemGenerator.generateItem(level);
    return c.json(item);
});

app.post('/api/simulate-combat', async (c) => {
    const { party, enemies } = await c.req.json();
    if (!party || !enemies) {
        return c.json({ error: 'Party and enemies are required' }, 400);
    }
    const result = CombatEngine.simulate(party, enemies);
    return c.json(result);
});

app.post('/api/calculate-snapshot', async (c) => {
    const { lastLogout, currentTime, party, startFloor, playerId, bloodRations, isResonatorActive, resonatorMastery } = await c.req.json();
    
    if (!lastLogout || !currentTime || !party || startFloor === undefined || !playerId) {
        return c.json({ error: 'Missing required fields for snapshot calculation.' }, 400);
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

    return c.json(result);
});

app.get('/api/corpses', async (c) => {
    return c.json(await SnapshotService.getCorpses());
});

app.post('/api/lay-to-rest', async (c) => {
    const { corpseId } = await c.req.json();
    if (!corpseId) return c.json({ error: 'corpseId is required' }, 400);
    
    const success = await SnapshotService.layToRest(corpseId);
    return c.json({ success, message: success ? 'Corpse laid to rest. Luck buff granted!' : 'Corpse not found' });
});

app.get('/api/state/:playerId', async (c) => {
    const playerId = c.req.param('playerId');
    const state = await StateService.getPlayerState(playerId);
    return c.json(state);
});

app.post('/api/state', async (c) => {
    const { playerId, state } = await c.req.json();
    if (!playerId || !state) return c.json({ error: 'playerId and state are required' }, 400);
    
    await StateService.savePlayerState(playerId, state);
    return c.json({ success: true });
});

app.get('/api/guild-settings', async (c) => {
    return c.json(await StateService.getGuildSettings());
});

app.post('/api/guild-settings', async (c) => {
    const { pollutionLevel, masteryLevel } = await c.req.json();
    await StateService.updateGuildSettings(pollutionLevel, masteryLevel);
    return c.json({ success: true });
});

// Authoritative Actions
app.post('/api/game/upgrade', async (c) => {
    const { playerId, buildingId } = await c.req.json();
    try {
        const state = await GameService.upgradeBuilding(playerId, buildingId);
        return c.json(state);
    } catch (e: any) {
        return c.json({ error: e.message }, 400);
    }
});

app.post('/api/game/tick', async (c) => {
    const { playerId } = await c.req.json();
    try {
        const result = await GameService.processCombatTick(playerId);
        return c.json(result);
    } catch (e: any) {
        return c.json({ error: e.message }, 400);
    }
});

app.post('/api/game/infuse', async (c) => {
    const { playerId, inventoryIndex, cost } = await c.req.json();
    try {
        const result = await GameService.infuseItem(playerId, inventoryIndex, cost);
        return c.json(result);
    } catch (e: any) {
        return c.json({ error: e.message }, 400);
    }
});

app.post('/api/game/bind', async (c) => {
    const { playerId, itemId, cost } = await c.req.json();
    try {
        const state = await GameService.bindItem(playerId, itemId, cost);
        return c.json(state);
    } catch (e: any) {
        return c.json({ error: e.message }, 400);
    }
});

app.post('/api/game/donate', async (c) => {
    const { playerId, amount } = await c.req.json();
    try {
        const state = await GameService.donateToGate(playerId, amount);
        return c.json(state);
    } catch (e: any) {
        return c.json({ error: e.message }, 400);
    }
});

app.post('/api/game/heal', async (c) => {
    const { playerId, targetId, cost } = await c.req.json();
    try {
        const state = await GameService.healCharacter(playerId, targetId, cost);
        return c.json(state);
    } catch (e: any) {
        return c.json({ error: e.message }, 400);
    }
});

app.post('/api/game/ascend', async (c) => {
    const { playerId, characterId } = await c.req.json();
    try {
        const state = await GameService.ascendCharacter(playerId, characterId);
        return c.json(state);
    } catch (e: any) {
        return c.json({ error: e.message }, 400);
    }
});

app.post('/api/auth/register', async (c) => {
    try {
        const body = await c.req.json();
        console.log('Registration request received for:', body.username);
        
        const result = await AuthService.register(body.username, body.password, c.env.JWT_SECRET);
        console.log('Registration successful for:', body.username);
        return c.json(result);
    } catch (e: any) {
        console.error('Registration route error:', e.message, e.stack);
        return c.json({ error: e.message || 'Internal Server Error' }, 400);
    }
});

app.post('/api/auth/login', async (c) => {
    const { username, password } = await c.req.json();
    try {
        const result = await AuthService.login(username, password, c.env.JWT_SECRET);
        return c.json(result);
    } catch (e: any) {
        return c.json({ error: e.message }, 400);
    }
});

app.post('/api/calculate-offline-gains', async (c) => {
    const { startTime, endTime, startFloor, autoSellRarity } = await c.req.json();
    
    if (!startTime || !endTime || startFloor === undefined) {
        return c.json({ error: 'startTime, endTime, and startFloor are required' }, 400);
    }

    const rawGains = OfflineEngine.calculateGains(startTime, endTime, startFloor);
    
    let extraGold = 0;
    const keptItems = rawGains.items.filter(item => {
        if (autoSellRarity && ItemGenerator.shouldAutoSell(item, autoSellRarity as Rarity)) {
            extraGold += 50; 
            return false;
        }
        return true;
    });

    return c.json({
        ...rawGains,
        items: keptItems,
        gold: rawGains.gold + extraGold,
        autoSoldItemCount: rawGains.items.length - keptItems.length
    });
});

export default app;
