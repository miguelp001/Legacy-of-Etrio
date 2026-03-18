import React, { useState } from 'react';
import { Hammer, Trash2, ShieldCheck, ShoppingCart, Loader2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const Blacksmith: React.FC = () => {
    const { inventory, mainCharacter, party, addGold, removeFromInventory, isAutoSellEnabled, toggleAutoSell, autoSellRarityThreshold, setAutoSellThreshold, equipItem } = useGameStore();
    const fullParty = mainCharacter ? [mainCharacter, ...party] : party;
    const [newItemLoading, setNewItemLoading] = useState(false);

    const generateTestItem = async () => {
        setNewItemLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/generate-item?level=1');
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

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Iron & Ember Forge</h2>
                    <p className="text-muted">Upgrade gear and manage your spoils.</p>
                </div>
                <button onClick={generateTestItem} className="btn-primary" disabled={newItemLoading}>
                    {newItemLoading ? <Loader2 className="animate-spin" size={20} /> : <Hammer size={20} />}
                    Forge Random Item (Dev)
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inventory List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ShoppingCart size={20} className="text-primary-color" />
                        Inventory ({inventory.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {inventory.map((item) => (
                            <div key={item.id} className="glass p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                            item.rarity === 'Legendary' ? 'bg-accent-color/20 text-accent-color' :
                                            item.rarity === 'Rare' ? 'bg-primary-color/20 text-primary-color' :
                                            'bg-white/10 text-muted'
                                        }`}>
                                            {item.rarity}
                                        </span>
                                        <span className="text-xs text-muted">Dur: {item.durability}/{item.maxDurability}</span>
                                    </div>
                                    <h4 className="font-bold text-lg mb-2">{item.name}</h4>
                                    <div className="space-y-1 text-sm">
                                        {Object.entries(item.stats).map(([stat, val]) => (
                                            <div key={stat} className="flex justify-between">
                                                <span className="text-muted capitalize">{stat}</span>
                                                <span className="text-secondary-color">+{Math.floor(val as number)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <button onClick={() => handleSell(item)} className="btn-outline text-danger-color border-danger-color/20 hover:bg-danger-color/10 w-full py-2">
                                        <Trash2 size={16} /> Sell for 50g
                                    </button>
                                    
                                    <div className="flex gap-2">
                                        {fullParty.map(member => (
                                            <button 
                                                key={member.id}
                                                onClick={() => equipItem(member.id, item, item.type.toLowerCase() as any)}
                                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold uppercase truncate"
                                            >
                                                Equip: {member.name.split(' ')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Settings Column */}
                <div className="space-y-6">
                    <div className="glass p-6 rounded-2xl border border-white/10">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck size={20} className="text-secondary-color" />
                            Auto-Sell Settings
                        </h3>
                        <p className="text-sm text-muted mb-6">Automatically convert low-tier loot into gold during passive play.</p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Enable Auto-Sell</span>
                                <button 
                                    onClick={toggleAutoSell}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${isAutoSellEnabled ? 'bg-secondary-color' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAutoSellEnabled ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-muted">Rarity Threshold</label>
                                <select 
                                    value={autoSellRarityThreshold}
                                    onChange={(e) => setAutoSellThreshold(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary-color"
                                >
                                    <option value="Common">Common & Below</option>
                                    <option value="Uncommon">Uncommon & Below</option>
                                    <option value="Rare">Rare & Below</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blacksmith;
