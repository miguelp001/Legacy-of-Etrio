import React from 'react';
import { Landmark, ArrowUpCircle, Coins } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const GuildHall: React.FC = () => {
    const { guildUpgrades, upgradeBuilding, gold } = useGameStore();

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

            <div className="px-4 md:px-0 max-w-4xl mx-auto">
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
            </div>
        </div>
    );
};

export default GuildHall;
