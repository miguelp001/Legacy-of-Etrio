import { prisma } from './db.js';
import { GateManager } from '../../shared/src/gate.js';

export class StateService {
    // Player State
    static async getPlayerState(playerId: string) {
        if (!playerId || playerId === 'undefined' || playerId === 'null') {
            console.error('StateService.getPlayerState: Invalid playerId:', playerId);
            return null;
        }
        return await (prisma as any).playerState.findFirst({
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
            isGameWon: false,
            guildVault: []
        });
    }

    static async savePlayerState(playerId: string, state: string) {
        if (!playerId || playerId === 'undefined' || playerId === 'null') {
            throw new Error(`Invalid playerId for savePlayerState: ${playerId}`);
        }
        return await (prisma as any).playerState.upsert({
            where: { id: playerId },
            update: { state, updatedAt: new Date() },
            create: { id: playerId, state }
        });
    }

    // Guild Settings
    static async getGuildSettings() {
        try {
            return await (prisma as any).guildSettings.upsert({
                where: { id: 'global' },
                update: {}, // No update needed, just ensure it exists
                create: { id: 'global', pollutionLevel: 0, masteryLevel: 0 }
            });
        } catch (error: any) {
            console.error('StateService.getGuildSettings failed:', error.message);
            throw error;
        }
    }

    static async updateGuildSettings(pollutionLevel: number, masteryLevel: number) {
        return await prisma.guildSettings.upsert({
            where: { id: 'global' },
            update: { pollutionLevel, masteryLevel },
            create: { id: 'global', pollutionLevel, masteryLevel, vaultItems: '[]' }
        });
    }

    static async getGuildVault(): Promise<any[]> {
        try {
            const settings = await (prisma as any).guildSettings.findUnique({
                where: { id: 'global' }
            });
            if (!settings) return [];
            return JSON.parse(settings.vaultItems || '[]');
        } catch (error: any) {
            console.error('StateService.getGuildVault failed:', error.message);
            return [];
        }
    }

    static async addToGuildVault(item: any): Promise<any[]> {
        try {
            const settings = await (prisma as any).guildSettings.findUnique({
                where: { id: 'global' }
            });
            const currentVault = settings ? JSON.parse(settings.vaultItems || '[]') : [];
            const newItem = { ...item, donatedAt: Date.now() };
            const newVault = [...currentVault, newItem];
            
            await (prisma as any).guildSettings.upsert({
                where: { id: 'global' },
                update: { vaultItems: JSON.stringify(newVault) },
                create: { id: 'global', pollutionLevel: 0, masteryLevel: 0, vaultItems: JSON.stringify(newVault) }
            });
            
            return newVault;
        } catch (error: any) {
            console.error('StateService.addToGuildVault failed:', error.message);
            throw error;
        }
    }

    static async takeFromGuildVault(itemId: string): Promise<{ item: any; vault: any[] } | null> {
        try {
            const settings = await (prisma as any).guildSettings.findUnique({
                where: { id: 'global' }
            });
            if (!settings) return null;
            
            const currentVault = JSON.parse(settings.vaultItems || '[]');
            const itemIndex = currentVault.findIndex((i: any) => i.id === itemId);
            if (itemIndex === -1) return null;
            
            const item = currentVault[itemIndex];
            const newVault = currentVault.filter((_: any, idx: number) => idx !== itemIndex);
            
            await (prisma as any).guildSettings.upsert({
                where: { id: 'global' },
                update: { vaultItems: JSON.stringify(newVault) },
                create: { id: 'global', pollutionLevel: 0, masteryLevel: 0, vaultItems: JSON.stringify(newVault) }
            });
            
            return { item, vault: newVault };
        } catch (error: any) {
            console.error('StateService.takeFromGuildVault failed:', error.message);
            throw error;
        }
    }
}
