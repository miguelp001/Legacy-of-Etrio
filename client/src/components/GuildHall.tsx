import React, { useEffect } from 'react';
import { Landmark, ArrowUpCircle, Coins, Package, Gift, Loader2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const GuildHall: React.FC = () => {
    const { guildUpgrades, upgradeBuilding, gold, guildVault, donateItemToGuild, claimItemFromGuild, loadGuildVault, inventory } = useGameStore();
    const [activeTab, setActiveTab] = React.useState<'Infrastructure' | 'Vault'>('Infrastructure');
    const [donatingItem, setDonatingItem] = React.useState<string | null>(null);
    const [claimingItem, setClaimingItem] = React.useState<string | null>(null);

    useEffect(() => {
        loadGuildVault();
    }, []);

    const handleDonate = async (itemId: string) => {
        setDonatingItem(itemId);
        await donateItemToGuild(itemId);
        setDonatingItem(null);
    };

    const handleClaim = async (itemId: string) => {
        setClaimingItem(itemId);
        await claimItemFromGuild(itemId);
        setClaimingItem(null);
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 md:px-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary-color/20 rounded-xl text-secondary-color shrink-0">
                        <Landmark size={24} className="md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic">Etrio Infrastructure</h2>
                        <p className="text-muted text-[10px] md:text-sm uppercase font-bold tracking-tight opacity-50">Collective efforts to conquer the infinite Pit.</p>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-0">
                <div className="flex bg-white/5 p-1.5 rounded-2xl gap-2 border border-white/5 max-w-md">
                    {['Infrastructure', 'Vault'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'bg-primary-color text-white shadow-lg' : 'text-muted'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 md:px-0 max-w-4xl mx-auto">
                {activeTab === 'Infrastructure' ? (
                    <div className="space-y-4">
                        <h3 className="text-sm md:text-lg font-black uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                            <ArrowUpCircle size={18} className="text-primary-color" />
                            Infrastructure <span className="text-white/30 ml-auto">({guildUpgrades.length})</span>
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {guildUpgrades.map((upgrade) => (
                                <div key={upgrade.id} className="glass p-5 md:p-6 rounded-2xl border border-white/5 hover:border-primary-color/30 transition-all group flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="font-black text-lg md:text-xl tracking-tight leading-none mb-1 group-hover:text-primary-color transition-colors">{upgrade.id}</div>
                                            <div className="text-[10px] text-primary-color uppercase font-black tracking-widest leading-none">Level {upgrade.level}</div>
                                        </div>
                                        <div className="bg-white/5 p-2 rounded-xl group-hover:bg-primary-color/20 transition-colors text-primary-color shrink-0">
                                            <ArrowUpCircle size={18} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] md:text-xs text-muted mb-6 italic leading-relaxed flex-1">{upgrade.perk}</p>
                                    <button 
                                        onClick={() => upgradeBuilding(upgrade.id)}
                                        disabled={gold < upgrade.cost}
                                        className={`w-full py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                            gold >= upgrade.cost 
                                            ? 'bg-primary-color/10 border border-primary-color/50 text-primary-color hover:bg-primary-color hover:text-white shadow-lg shadow-primary-color/20' 
                                            : 'bg-white/5 border border-white/10 text-muted cursor-not-allowed opacity-20'
                                        }`}
                                    >
                                        <Coins size={14} />
                                        Upgrade ({upgrade.cost.toLocaleString()}g)
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm md:text-lg font-black uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                                <Gift size={18} className="text-secondary-color" />
                                Guild Vault <span className="text-white/30 ml-auto">({guildVault.length})</span>
                            </h3>
                            <p className="text-[10px] md:text-xs text-muted italic leading-relaxed opacity-60">
                                Donate items to help your fellow adventurers. Claim items others have donated.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {guildVault.length > 0 ? guildVault.map((item: any) => (
                                    <div key={item.id} className="glass p-4 rounded-2xl border border-white/5 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${
                                                    item.rarity === 'Legendary' ? 'bg-accent-color/10 text-accent-color border-accent-color/20' :
                                                    item.rarity === 'Rare' ? 'bg-primary-color/10 text-primary-color border-primary-color/20' :
                                                    'bg-white/5 text-muted border-white/10'
                                                }`}>
                                                    {item.rarity}
                                                </span>
                                                <h4 className="font-black text-sm tracking-tight mt-1">{item.name}</h4>
                                            </div>
                                        </div>
                                        <div className="text-[8px] text-white/40">
                                            Donated by {item.donatedBy || 'Unknown'} • {item.donatedAt ? new Date(item.donatedAt).toLocaleDateString() : 'Recently'}
                                        </div>
                                        <button 
                                            onClick={() => handleClaim(item.id)}
                                            disabled={claimingItem === item.id}
                                            className="w-full py-2 bg-secondary-color/10 border border-secondary-color/30 rounded-xl text-[10px] font-black uppercase tracking-wider text-secondary-color active:scale-95 disabled:opacity-50"
                                        >
                                            {claimingItem === item.id ? <Loader2 className="animate-spin mx-auto" size={14} /> : 'Claim'}
                                        </button>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-12 text-center glass rounded-3xl border-dashed border-white/10 border-2">
                                        <Package size={32} className="mx-auto text-white/10 mb-3" />
                                        <p className="text-[10px] uppercase font-black tracking-widest text-muted">The vault is empty</p>
                                        <p className="text-[8px] text-white/30 mt-1">Be the first to donate!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm md:text-lg font-black uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                                <Package size={18} className="text-primary-color" />
                                Your Inventory <span className="text-white/30 ml-auto">({inventory.length})</span>
                            </h3>
                            <p className="text-[10px] md:text-xs text-muted italic leading-relaxed opacity-60">
                                Select an item to donate to the guild vault.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {inventory.map((item: any) => (
                                    <div key={item.id} className="glass p-4 rounded-2xl border border-white/5 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${
                                                    item.rarity === 'Legendary' ? 'bg-accent-color/10 text-accent-color border-accent-color/20' :
                                                    item.rarity === 'Rare' ? 'bg-primary-color/10 text-primary-color border-primary-color/20' :
                                                    'bg-white/5 text-muted border-white/10'
                                                }`}>
                                                    {item.rarity}
                                                </span>
                                                <h4 className="font-black text-sm tracking-tight mt-1">{item.name}</h4>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDonate(item.id)}
                                            disabled={donatingItem === item.id}
                                            className="w-full py-2 bg-primary-color/10 border border-primary-color/30 rounded-xl text-[10px] font-black uppercase tracking-wider text-primary-color active:scale-95 disabled:opacity-50"
                                        >
                                            {donatingItem === item.id ? <Loader2 className="animate-spin mx-auto" size={14} /> : 'Donate to Guild'}
                                        </button>
                                    </div>
                                ))}
                                {inventory.length === 0 && (
                                    <div className="col-span-full py-12 text-center glass rounded-3xl border-dashed border-white/10 border-2">
                                        <Package size={32} className="mx-auto text-white/10 mb-3" />
                                        <p className="text-[10px] uppercase font-black tracking-widest text-muted">No items to donate</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuildHall;
