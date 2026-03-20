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
import { initPrisma, prisma } from './db.js';

console.log('--- WORKER BOOTING UP: ' + new Date().toISOString() + ' ---');
// RE-BUNDLE FORCE: 2026-03-20-13-00

const app = new Hono<{ Bindings: { DB: any, JWT_SECRET: string } }>();

// ROOT check
app.get('/', (c) => c.html(`
    <body style="background: #1a1a1a; color: #4ade80; font-family: monospace; padding: 2rem;">
        <h1>🟢 Hono is Alive!</h1>
        <p>Worker Boot Time: ${new Date().toISOString()}</p>
        <p>Environment: Production (Cloudflare Worker)</p>
    </body>
`));

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
    
    // Explicitly add CORS headers because they might be missed in error responses
    c.header('Access-Control-Allow-Origin', '*');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return c.json({ 
        error: 'Internal Server Error', 
        message: err.message,
        stack: err.stack, // Optional: useful for debugging 500s directly in the browser
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

app.get('/api/debug', async (c) => {
    const status = {
        prismaInitialized: !!prisma,
        d1Binding: !!c.env.DB,
        time: new Date().toISOString(),
        env: 'production'
    };
    
    try {
        if (prisma) {
            const userCount = await (prisma as any).user.count();
            return c.json({ ...status, database: 'connected', userCount });
        } else {
            return c.json({ ...status, database: 'not_initialized' }, 500);
        }
    } catch (e: any) {
        return c.json({ ...status, database: 'error', error: e.message }, 500);
    }
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
    try {
        const settings = await StateService.getGuildSettings();
        return c.json(settings);
    } catch (e: any) {
        console.error('GUILD SETTINGS ERROR:', e.message);
        c.header('Access-Control-Allow-Origin', '*');
        return c.json({ error: e.message || 'Failed to fetch guild settings' }, 500);
    }
});

app.post('/api/guild-settings', async (c) => {
    try {
        const { pollutionLevel, masteryLevel } = await c.req.json();
        await StateService.updateGuildSettings(pollutionLevel, masteryLevel);
        return c.json({ success: true });
    } catch (e: any) {
        c.header('Access-Control-Allow-Origin', '*');
        return c.json({ error: e.message || 'Failed to update guild settings' }, 500);
    }
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

app.get('/api/health', async (c) => {
    try {
        const userCount = await (prisma as any).user.count();
        return c.json({ status: 'ok', database: 'connected', userCount });
    } catch (e: any) {
        return c.json({ status: 'error', error: e.message }, 500);
    }
});

app.post('/api/auth/register', async (c) => {
    try {
       // Force re-bundle for auto-progression and unique IDs v3
console.log('[SERVER] Booting Hono application...');
        const body = await c.req.json();
        console.log('[AUTH] Registration request for:', body.username);
        
        const result = await AuthService.register(body.username, body.password, c.env.JWT_SECRET);
        console.log('[AUTH] Registration successful for:', body.username);
        return c.json(result);
    } catch (e: any) {
        console.error('[AUTH] Registration error:', e.message);
        return c.json({ 
            error: e.message || 'Registration failed',
            details: e.toString()
        }, 400);
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

export default {
    fetch: app.fetch
};
