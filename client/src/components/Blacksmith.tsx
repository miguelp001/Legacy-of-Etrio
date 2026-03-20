import React, { useState } from 'react';
import { Hammer, Trash2, ShieldCheck, ShoppingCart, Loader2, Zap, AlertTriangle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Blacksmith: React.FC = () => {
    const { 
        inventory, mainCharacter, party, addGold, 
        removeFromInventory, isAutoSellEnabled, toggleAutoSell, 
        autoSellRarityThreshold, setAutoSellThreshold, equipItem,
        gold, infuseItem
    } = useGameStore();
    const fullParty = mainCharacter ? [mainCharacter, ...party] : party;
    const [newItemLoading, setNewItemLoading] = useState(false);

    const generateTestItem = async () => {
        setNewItemLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/generate-item?level=1`);
            const item = await res.json();
            useGameStore.getState().addToInventory(item);
        } catch (error) {
            console.error(error);
        } finally {
            setNewItemLoading(false);
        }
    };

    const handleSell = (item: any) => {
        addGold(50); // Simplified sell value
        removeFromInventory(item.id);
    };

    const handleInfuse = (index: number) => {
        infuseItem(index, 500);
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 md:px-0">
                <div>
                    <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic">Iron & Ember Forge</h2>
                    <p className="text-muted text-[10px] md:text-sm">Upgrade gear and manage your spoils.</p>
                </div>
                <button 
                  onClick={generateTestItem} 
                  className="btn-primary w-full md:w-auto flex justify-center py-3 md:py-2 text-[10px] md:text-xs font-black uppercase tracking-widest gap-2" 
                  disabled={newItemLoading}
                >
                    {newItemLoading ? <Loader2 className="animate-spin" size={16} /> : <Hammer size={16} />}
                    Forge Random Item
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
                {/* Inventory List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-sm md:text-lg font-black uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                        <ShoppingCart size={18} className="text-primary-color" />
                        Inventory <span className="text-white/30 ml-auto">({inventory.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                        {inventory.map((item) => (
                            <div 
                                key={item.id} 
                                className={`glass p-5 md:p-6 rounded-2xl border border-white/5 flex flex-col justify-between transition-all group ${
                                    item.rarity === 'Abyssal' ? 'rarity-abyssal' : ''
                                }`}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${
                                            item.rarity === 'Abyssal' ? 'bg-[#e0a7ff]/10 text-[#e0a7ff] border-[#e0a7ff]/20 shadow-[0_0_10px_#9333ea20]' :
                                            item.rarity === 'Legendary' ? 'bg-accent-color/10 text-accent-color border-accent-color/20' :
                                            item.rarity === 'Rare' ? 'bg-primary-color/10 text-primary-color border-primary-color/20' :
                                            'bg-white/5 text-muted border-white/10'
                                        }`}>
                                            {item.rarity}
                                        </span>
                                        <div className="flex gap-2 items-center">
                                            {item.isInfused && <Zap size={14} className="text-primary-color animate-pulse" />}
                                            <span className="text-[10px] font-mono text-white/30">{item.durability}/{item.maxDurability}</span>
                                        </div>
                                    </div>
                                    <h4 className="font-black text-lg md:text-xl tracking-tight mb-4 group-hover:text-primary-color transition-colors">{item.name}</h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] md:text-xs mb-6">
                                        {Object.entries(item.stats).map(([stat, val]) => (
                                            <div key={stat} className="flex justify-between border-b border-white/5 pb-1">
                                                <span className="text-white/30 font-black uppercase tracking-tighter">{stat}</span>
                                                <span className="text-secondary-color font-bold">+{Math.floor(val as number)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-auto space-y-3">
                                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                        {fullParty.map(member => (
                                            <button 
                                                key={member.id}
                                                onClick={() => equipItem(member.id, item, item.type.toLowerCase() as any)}
                                                className="flex-1 min-w-[80px] py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-tighter truncate transition-all active:scale-95"
                                            >
                                                {member.name.split(' ')[0]}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button onClick={() => handleSell(item)} className="flex-1 py-3 bg-danger-color/10 hover:bg-danger-color/20 border border-danger-color/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-danger-color flex items-center justify-center gap-2 transition-all">
                                            <Trash2 size={14} /> 50g
                                        </button>
                                        
                                        {!item.isInfused && !item.isCorrupted && (
                                            <button 
                                                onClick={() => handleInfuse(inventory.indexOf(item))}
                                                disabled={gold < 500}
                                                className="flex-1 py-3 bg-primary-color/10 hover:bg-primary-color/20 border border-primary-color/20 rounded-xl text-[10px] font-black text-primary-color flex items-center justify-center gap-2 transition-all disabled:opacity-20"
                                            >
                                                <Zap size={14} /> Infuse
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Settings Column */}
                <div className="space-y-6">
                    <div className="glass p-6 rounded-3xl border border-white/5">
                        <h3 className="text-sm md:text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-secondary-color" />
                            Auto-Sell Sequence
                        </h3>
                        <p className="text-[10px] md:text-sm text-muted mb-6 uppercase font-bold tracking-tight opacity-50">Efficient loot processing protocols.</p>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest">Protocol Active</span>
                                <button 
                                    onClick={toggleAutoSell}
                                    className={`w-12 h-6 rounded-full transition-all relative ${isAutoSellEnabled ? 'bg-secondary-color shadow-[0_0_10px_var(--secondary-glow)]' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAutoSellEnabled ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Rarity Threshold</label>
                                <select 
                                    value={autoSellRarityThreshold}
                                    onChange={(e) => setAutoSellThreshold(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-white outline-none focus:border-primary-color transition-all"
                                >
                                    <option value="Common">Common & Below</option>
                                    <option value="Uncommon">Uncommon & Below</option>
                                    <option value="Rare">Rare & Below</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-3xl border border-primary-color/20 bg-primary-color/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Zap size={80} />
                        </div>
                        <h3 className="text-sm md:text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-primary-color">
                            <Zap size={18} />
                            Aether Infusion
                        </h3>
                        <p className="text-[10px] md:text-sm text-muted mb-6 italic leading-relaxed">"Overload your gear with raw aetheric energy. Power comes at a price..."</p>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-accent-color">
                                <ShieldCheck size={14} /> 90% Win: +20% Stats
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-danger-color">
                                <AlertTriangle size={14} /> 10% Fail: Corruption
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blacksmith;
