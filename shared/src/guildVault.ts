import type { Item } from './items';

export interface GuildVaultItem extends Item {
    donatedBy: string;
    donatedAt: number;
}

export class GuildVaultManager {
    static addItem(vault: GuildVaultItem[], item: Item, donorName: string): GuildVaultItem[] {
        const vaultItem: GuildVaultItem = {
            ...item,
            donatedBy: donorName,
            donatedAt: Date.now()
        };
        return [...vault, vaultItem];
    }

    static removeItem(vault: GuildVaultItem[], itemId: string): { vault: GuildVaultItem[]; item: Item | null } {
        const itemIndex = vault.findIndex(i => i.id === itemId);
        if (itemIndex === -1) {
            return { vault, item: null };
        }
        const item = vault[itemIndex]!;
        const newVault = vault.filter(i => i.id !== itemId);
        return { vault: newVault, item };
    }

    static sortByDonationTime(vault: GuildVaultItem[]): GuildVaultItem[] {
        return [...vault].sort((a, b) => b.donatedAt - a.donatedAt);
    }
}
