import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { NPCGenerator } from '../../shared/src/party.js';
import { ItemGenerator, Rarity } from '../../shared/src/items.js';
import { CombatEngine } from '../../shared/src/combat.js';
import { OfflineEngine } from '../../shared/src/offline.js';
import { DungeonManager } from '../../shared/src/dungeon.js';

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
