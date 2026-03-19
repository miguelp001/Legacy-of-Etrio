import { prisma } from './db.js';

export class StateService {
    // Player State
    static async getPlayerState(playerId: string) {
        return await (prisma as any).playerState.findUnique({
            where: { id: playerId }
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
