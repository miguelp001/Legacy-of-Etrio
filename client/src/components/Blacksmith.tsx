import React, { useState, useEffect } from 'react';
import { Hammer, Trash2, ShieldCheck, ShoppingCart, Loader2, Zap, AlertTriangle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const API_BASE = import.meta.env.VITE_API_URL || '';

const RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Corrupted', 'Abyssal'];
const FORGE_COST = 100;
const SELL_VALUES: Record<string, number> = {
    'Common': 25,
    'Uncommon': 50,
    'Rare': 150,
    'Epic': 400,
    'Legendary': 1000,
    'Corrupted': 300,
    'Abyssal': 2500
};

const Blacksmith: React.FC = () => {
    const { 
        inventory, mainCharacter, party, addGold, 
        removeFromInventory, isAutoSellEnabled, toggleAutoSell, 
        autoSellRarityThreshold, setAutoSellThreshold, equipItem,
        gold, infuseItem, addToInventory
    } = useGameStore();
    const fullParty = [mainCharacter, ...party].filter(Boolean);
    const [newItemLoading, setNewItemLoading] = useState(false);

    useEffect(() => {
        if (!isAutoSellEnabled || inventory.length === 0) return;
        
        const thresholdIndex = RARITY_ORDER.indexOf(autoSellRarityThreshold);
        if (thresholdIndex < 0) return;
        
        const toSell = inventory.filter((item: any) => {
            const itemIndex = RARITY_ORDER.indexOf(item.rarity);
            return itemIndex >= 0 && itemIndex <= thresholdIndex;
        });
        
        toSell.forEach((item: any) => {
            const sellValue = SELL_VALUES[item.rarity] || 25;
            addGold(sellValue);
            removeFromInventory(item.id);
        });
    }, [inventory, isAutoSellEnabled, autoSellRarityThreshold]);

    const generateTestItem = async () => {
        if (gold < FORGE_COST) {
            alert('Not enough gold to forge! Need ' + FORGE_COST + 'g');
            return;
        }
        
        setNewItemLoading(true);
        addGold(-FORGE_COST);
        
        try {
            const res = await fetch(`${API_BASE}/api/generate-item?level=1`);
            const item = await res.json();
            if (item) {
                addToInventory(item);
            }
        } catch (error) {
            console.error(error);
            addGold(FORGE_COST);
        } finally {
            setNewItemLoading(false);
        }
    };

    const handleSell = (item: any) => {
        const sellValue = SELL_VALUES[item.rarity] || 25;
        addGold(sellValue);
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
                        <h2 className="text-xl font-cinzel uppercase">Iron & Ember Forge</h2>
                        <span className="text-[10px] text-muted font-cinzel uppercase leading-none">Status: Searing Hot</span>
                    </div>
                </div>

                <button 
                  onClick={generateTestItem} 
                  className="btn-primary w-full py-4 flex justify-center items-center gap-3 rounded-xl" 
                  disabled={newItemLoading || gold < FORGE_COST}
                >
                    {newItemLoading ? <Loader2 className="animate-spin" size={18} /> : <Hammer size={18} />}
                    <span className="font-cinzel text-xs uppercase tracking-wider">Forge ({FORGE_COST}g)</span>
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
                                    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">
                                        {(item.type || 'Weapon').toUpperCase()} → Tap character to equip
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                                        {fullParty.map(member => {
                                            const isMain = member.id === mainCharacter?.id;
                                            const currentEquip = isMain 
                                                ? member.weapon || member.armor || member.accessory
                                                : (member as any).weapon || (member as any).armor || (member as any).accessory;
                                            return (
                                                <button 
                                                    key={member.id}
                                                    onClick={() => equipItem(member.id, item, (item.type || 'Weapon').toLowerCase() as any)}
                                                    className={`shrink-0 w-24 h-14 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-90 border relative ${
                                                        isMain 
                                                            ? 'bg-primary-color/20 border-primary-color/40' 
                                                            : 'bg-white/5 border-white/10'
                                                    }`}
                                                >
                                                    <span className="text-[9px] font-black uppercase tracking-tighter truncate w-20 text-center">{member.name.split(' ')[0]}</span>
                                                    <span className="text-[7px] text-muted font-bold">{(member.baseClass || '???').toString().substring(0,3)}</span>
                                                    {isMain && <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary-color rounded-full" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Desktop-style buttons refined for touch */}
                                <div className="flex gap-3 pt-2">
                                    <button 
                                        onClick={() => handleSell(item)} 
                                        className="flex-1 py-4 bg-danger-color/10 border border-danger-color/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-danger-color flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <Trash2 size={16} /> Liquefy ({SELL_VALUES[item.rarity] || 25}g)
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
