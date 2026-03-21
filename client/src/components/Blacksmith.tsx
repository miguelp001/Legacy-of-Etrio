import React, { useState } from 'react';
import { Hammer, Trash2, ShieldCheck, ShoppingCart, Loader2, Zap, AlertTriangle, ChevronRight } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Blacksmith: React.FC = () => {
    const { 
        inventory, mainCharacter, party, addGold, 
        removeFromInventory, isAutoSellEnabled, toggleAutoSell, 
        autoSellRarityThreshold, setAutoSellThreshold, equipItem,
        gold, infuseItem
    } = useGameStore();
    const fullParty = [mainCharacter, ...party].filter(Boolean);
    const [newItemLoading, setNewItemLoading] = useState(false);

    const generateTestItem = async () => {
        setNewItemLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/generate-item?level=1`);
            const item = await res.json();
            if (item) {
                useGameStore.getState().addToInventory(item);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setNewItemLoading(false);
        }
    };

    const handleSell = (item: any) => {
        addGold(50);
        removeFromInventory(item.id);
    };

    const handleInfuse = (index: number) => {
        if (index < 0) return;
        infuseItem(index, 500);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-32">
            {/* Header / Primary Action */}
            <div className="px-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-color/20 rounded-xl text-primary-color">
                        <Hammer size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tighter uppercase italic">Iron & Ember Forge</h2>
                        <span className="text-[10px] text-muted font-bold uppercase tracking-widest leading-none">Status: Searing Hot</span>
                    </div>
                </div>

                <button 
                  onClick={generateTestItem} 
                  className="btn-primary w-full py-5 flex justify-center text-[10px] font-black uppercase tracking-[0.2em] gap-3 rounded-2xl shadow-xl shadow-primary-color/20 active:scale-95 transition-transform" 
                  disabled={newItemLoading}
                >
                    {newItemLoading ? <Loader2 className="animate-spin" size={20} /> : <Hammer size={20} />}
                    Forge Experimental Gear
                </button>
            </div>

            {/* Inventory Section */}
            <div className="space-y-4">
                <div className="px-4 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Loot Stash</h3>
                    <span className="text-[10px] font-black text-primary-color/60">{inventory.length} / 50 Slots</span>
                </div>

                <div className="space-y-4 px-4">
                    {inventory.length > 0 ? (
                        inventory.map((item, idx) => (
                            <div 
                                key={item.id} 
                                className={`glass p-5 rounded-3xl border border-white/5 space-y-5 transition-all active:bg-white/5 ${
                                    item.rarity === 'Abyssal' ? 'rarity-abyssal' : ''
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex gap-2 items-center">
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${
                                                item.rarity === 'Abyssal' ? 'bg-[#e0a7ff]/10 text-[#e0a7ff] border-[#e0a7ff]/20' :
                                                item.rarity === 'Legendary' ? 'bg-accent-color/10 text-accent-color border-accent-color/20' :
                                                item.rarity === 'Rare' ? 'bg-primary-color/10 text-primary-color border-primary-color/20' :
                                                'bg-white/5 text-muted border-white/10'
                                            }`}>
                                                {item.rarity}
                                            </span>
                                            <span className="text-[9px] text-muted font-bold uppercase tracking-tight">{item.type}</span>
                                        </div>
                                        <h4 className="font-black text-lg tracking-tight">{item.name}</h4>
                                    </div>
                                    {item.isInfused && <Zap size={16} className="text-primary-color animate-pulse" />}
                                </div>

                                {/* Stats Grid - HARDENED */}
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    {Object.entries(item.stats || {}).map(([stat, val]) => (
                                        <div key={stat} className="flex justify-between p-2 bg-black/30 rounded-xl border border-white/5">
                                            <span className="text-white/20 font-black uppercase tracking-tighter">{stat.substring(0,3)}</span>
                                            <span className="text-secondary-color font-bold">+{Math.floor(val as number || 0)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Equip Carousel - One Handed Reach */}
                                <div className="space-y-2">
                                    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Transfer Control</div>
                                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                                        {fullParty.map(member => (
                                            <button 
                                                key={member.id}
                                                onClick={() => equipItem(member.id, item, (item.type || 'Weapon').toLowerCase() as any)}
                                                className="shrink-0 w-24 h-12 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-90 active:bg-primary-color/20 active:border-primary-color/40"
                                            >
                                                <span className="text-[9px] font-black uppercase tracking-tighter truncate w-20 text-center">{member.name.split(' ')[0]}</span>
                                                <span className="text-[7px] text-muted font-bold">{(member.baseClass || '???').toString().substring(0,3)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Desktop-style buttons refined for touch */}
                                <div className="flex gap-3 pt-2">
                                    <button 
                                        onClick={() => handleSell(item)} 
                                        className="flex-1 py-4 bg-danger-color/10 border border-danger-color/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-danger-color flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <Trash2 size={16} /> Liquefy (50g)
                                    </button>
                                    
                                    {!item.isInfused && (
                                        <button 
                                            onClick={() => handleInfuse(inventory.findIndex(i => i.id === item.id))}
                                            disabled={gold < 500}
                                            className="flex-1 py-4 bg-primary-color text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30"
                                        >
                                            <Zap size={16} /> Infuse
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 text-center glass rounded-[2.5rem] border-dashed border-white/5 border-2">
                            <ShoppingCart size={32} className="mx-auto text-white/5 mb-3" />
                            <p className="text-[10px] text-muted font-black uppercase tracking-widest">Inventory Void</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Auto-Sell Sequence */}
            <div className="px-4">
                <div className="glass p-6 rounded-[2.5rem] border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-secondary-color/10 text-secondary-color flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-tight">Auto-Processor</h3>
                        </div>
                        <button 
                            onClick={toggleAutoSell}
                            className={`w-14 h-7 rounded-full transition-all relative ${isAutoSellEnabled ? 'bg-secondary-color' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all ${isAutoSellEnabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Extraction Threshold</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Common', 'Uncommon', 'Rare'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setAutoSellThreshold(r)}
                                    className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${autoSellRarityThreshold === r ? 'bg-primary-color border-primary-color text-white' : 'bg-white/5 border-white/10 text-muted'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blacksmith;
