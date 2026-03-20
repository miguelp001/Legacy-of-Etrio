import { prisma } from './db.js';
import { GateManager } from '../../shared/src/gate.js';

export class StateService {
    // Player State
    static async getPlayerState(playerId: string) {
        return await (prisma as any).playerState.findUnique({
            where: { id: playerId }
        });
    }

    static getInitialState() {
        return JSON.stringify({
            gold: 5000,
            inventory: [],
            party: [],
            relationships: [],
            guildUpgrades: [
                { id: 'Tavern', level: 0, cost: 1000, perk: 'Attract +10% higher level NPCs' },
                { id: 'Hospital', level: 0, cost: 1000, perk: 'Reduce recovery time by 10%' },
                { id: 'Blacksmith', level: 0, cost: 2000, perk: 'Lower auto-repair costs by 15%' }
            ],
            gateProgress: GateManager.generateInitialGates(),
            currentFloor: 1,
            biome: 'Frozen Caves',
            isAutoSellEnabled: false,
            autoSellRarityThreshold: 'Common',
            mainCharacter: null,
            mainCharacterPersonality: null,
            events: [],
            lastLogout: Date.now(),
            bloodRations: 100,
            pollutionLevel: 0,
            isResonatorActive: false,
            councilMembers: [],
            resonatorMastery: 0,
            isGameWon: false
        });
    }

    static async savePlayerState(playerId: string, state: string) {
        return await (prisma as any).playerState.upsert({
            where: { id: playerId },
            update: { state, updatedAt: new Date() },
            create: { id: playerId, state }
        });
    }

    // Guild Settings
    static async getGuildSettings() {
        let settings = await prisma.guildSettings.findUnique({
            where: { id: 'global' }
        });

        if (!settings) {
            settings = await prisma.guildSettings.create({
                data: { id: 'global', pollutionLevel: 0, masteryLevel: 0 }
            });
        }
        return settings;
    }

    static async updateGuildSettings(pollutionLevel: number, masteryLevel: number) {
        return await prisma.guildSettings.upsert({
            where: { id: 'global' },
            update: { pollutionLevel, masteryLevel },
            create: { id: 'global', pollutionLevel, masteryLevel }
        });
    }
}
