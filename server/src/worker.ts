import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { NPCGenerator } from '../../shared/src/party.js';
import { ItemGenerator } from '../../shared/src/items.js';
import { OfflineEngine } from '../../shared/src/offline.js';

const app = new Hono();

// Enable CORS for all routes
app.use('/*', cors());

// NPC Generation
app.get('/api/generate-npc', (c) => {
    const level = parseInt(c.req.query('level') || '1');
    const generation = parseInt(c.req.query('generation') || '0');
    const npc = NPCGenerator.generateNPC(level, generation);
    return c.json(npc);
});

// Item Generation
app.get('/api/generate-item', (c) => {
    const level = parseInt(c.req.query('level') || '1');
    const item = ItemGenerator.generateItem(level);
    return c.json(item);
});

// Offline Gains Calculation
app.post('/api/calculate-offline-gains', async (c) => {
    const { startTime, endTime, startFloor, autoSellRarity } = await c.req.json();
    const gains = OfflineEngine.calculateGains(startTime, endTime, startFloor);
    
    // Filter items based on auto-sell threshold
    let finalGold = gains.gold;
    const finalItems = gains.items.filter(item => {
        if (ItemGenerator.shouldAutoSell(item, autoSellRarity)) {
            finalGold += 50; // Simple flat sell value
            return false;
        }
        return true;
    });

    return c.json({
        ...gains,
        gold: finalGold,
        items: finalItems
    });
});

export default app;
