import React, { useState } from 'react';
import { Heart, Users, Sparkles, UserPlus, ShieldAlert, History, ShieldCheck, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { LineageManager } from '../../../shared/src/lineage';

const LineageHall: React.FC = () => {
    const { 
        party, relationships, addToParty, removeFromParty, 
        mainCharacter, bindItemToSoul, gold 
    } = useGameStore();
    const [selectedParents, setSelectedParents] = useState<string[]>([]);

    const getRelationship = (m1: string, m2: string) => {
        const sorted = [m1, m2].sort();
        return relationships.find(r => r.memberIds[0] === sorted[0] && r.memberIds[1] === sorted[1]);
    };

    const handleParentToggle = (id: string) => {
        if (selectedParents.includes(id)) {
            setSelectedParents(selectedParents.filter(p => p !== id));
        } else if (selectedParents.length < 2) {
            setSelectedParents([...selectedParents, id]);
        }
    };

    const getRitualCost = () => {
        // Average class cost or based on parents? Let's use the highest parent class.
        const p1 = party.find(m => m.id === selectedParents[0]);
        const p2 = party.find(m => m.id === selectedParents[1]);
        if (!p1 || !p2) return 0;

        const costs: Record<string, number> = {
            'Thrall': 2000,
            'Bondi': 1000,
            'Vardr': 500,
            'Scrifadr': 250,
            'Drengskapr': 0
        };
        // The higher the class, the lower the ritual cost (as they own the hall).
        const c1 = costs[p1.socialClass || 'Bondi'] ?? 1000;
        const c2 = costs[p2.socialClass || 'Bondi'] ?? 1000;
        return Math.min(c1, c2);
    };

    const performRitual = () => {
        if (selectedParents.length !== 2) return;
        
        const parent1 = party.find(m => m.id === selectedParents[0]);
        const parent2 = party.find(m => m.id === selectedParents[1]);
        
        if (!parent1 || !parent2) return;

        const rel = getRelationship(parent1.id, parent2.id);
        if (!rel || rel.stage !== 'Soulmate') {
            alert("Parents must be Soulmates (100 Affinity) to produce an Heir.");
            return;
        }

        const { gold, addGold } = useGameStore.getState();
        const cost = getRitualCost();
        if (gold < cost) {
            alert(`Not enough gold! Ritual costs ${cost}g.`);
            return;
        }

        // Create Heir
        const heir = LineageManager.createHeir(parent1 as any, parent2 as any);
        
        // Subtract gold and add to party
        addGold(-cost);
        addToParty(heir as any);
        
        alert(`Success! ${heir.name} (Generation ${heir.generation}) has been born with a +${heir.generation * 10}% Legacy Bonus.`);
        setSelectedParents([]);
    };

    const handleRetire = (id: string, name: string) => {
        if (confirm(`Are you sure you want to retire ${name}? They will leave the party and pass their equipment to the vault.`)) {
            removeFromParty(id);
        }
    };

    const handleBind = (itemId: string) => {
        if (confirm("Perform the Soul Ritual? This item will never be lost in the depths of The Deep.")) {
            bindItemToSoul(itemId, 2500);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 md:px-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary-color/20 rounded-xl text-secondary-color shrink-0">
                        <History size={24} className="md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic">Lineage Hall</h2>
                        <p className="text-muted text-[10px] md:text-sm uppercase font-bold tracking-tight opacity-50">Where bonds ignite and legends are inherited.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
                {/* Active Party & Affinity */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-sm md:text-lg font-black uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                            <Users size={18} className="text-primary-color" />
                            Current Party Bonds
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {party.map((member, idx) => (
                                <div key={member.id || idx} className="glass p-5 md:p-6 rounded-2xl border border-white/5 flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="font-black text-base md:text-lg tracking-tight leading-none mb-1">{member.name}</div>
                                            <div className="text-[8px] md:text-[10px] text-muted uppercase font-black tracking-widest">Lvl {member.level} {member.baseClass}</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-[8px] px-2 py-0.5 bg-white/5 rounded-lg text-white/30 font-black uppercase tracking-widest">Gen {member.generation}</div>
                                            <button 
                                                onClick={() => handleRetire(member.id, member.name)}
                                                className="text-[10px] text-danger-color font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
                                            >
                                                Retire
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 flex-1">
                                        {party.slice(idx + 1).map((other, otherIdx) => {
                                            const rel = getRelationship(member.id, other.id);
                                            return (
                                                <div key={other.id || (idx + '-' + otherIdx)} className="space-y-2 border-t border-white/5 pt-4">
                                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                                                        <span className="text-white/30">With {other.name.split(' ')[0]}</span>
                                                        <span className={rel?.stage === 'Soulmate' ? 'text-secondary-color' : 'text-white/50'}>
                                                            {rel?.stage || 'Stranger'}
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-1000 ${rel?.stage === 'Soulmate' ? 'bg-secondary-color shadow-[0_0_10px_var(--secondary-glow)]' : 'bg-white/20'}`} 
                                                            style={{ width: `${rel?.affinity || 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {idx === party.length - 1 && party.length > 1 && (
                                            <div className="text-[10px] text-muted text-center italic opacity-30 py-2">End of Bonds</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {party.length < 2 && (
                                <div className="col-span-full py-20 text-center text-muted glass rounded-3xl border-dashed border-white/10 border-2">
                                    <p className="text-[10px] uppercase font-black tracking-widest">Recruit at least 2 members to begin tracking Affinity.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm md:text-lg font-black uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                            <Zap size={18} className="text-primary-color" />
                            Soul-Binding Ritual
                        </h3>
                        <p className="text-[10px] md:text-sm text-muted italic leading-relaxed opacity-50">Anchor an item's essence to the lineage. Soul-bound items are returned to the vault even if the bearer falls.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[mainCharacter, ...party].filter((m): m is any => m !== null).map((member, idx) => (
                                <div key={(member.id || idx) + '-bind'} className="glass p-5 md:p-6 rounded-2xl border border-primary-color/10 bg-primary-color/5">
                                    <div className="text-[8px] md:text-[10px] font-black text-primary-color mb-4 uppercase tracking-[0.2em]">{member.name}'s Gear</div>
                                    <div className="space-y-3">
                                        {[member.weapon, member.armor, member.accessory].map((item, i) => item && (
                                            <div key={item.id || i} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-mono opacity-30">[{['W', 'A', 'X'][i]}]</span>
                                                    <div className="flex flex-col">
                                                        <span className={`text-[10px] font-black uppercase tracking-tight ${item.isSoulBound ? 'text-primary-color' : 'text-white/80'}`}>{item.name}</span>
                                                        {item.isSoulBound && <span className="text-[8px] text-primary-color uppercase font-black tracking-widest">Soul Bound</span>}
                                                    </div>
                                                </div>
                                                {!item.isSoulBound && (
                                                    <button 
                                                        onClick={() => handleBind(item.id)}
                                                        disabled={gold < 2500}
                                                        className="px-4 py-2 bg-primary-color/10 hover:bg-primary-color/20 border border-primary-color/30 rounded-lg text-[8px] font-black uppercase tracking-widest text-primary-color transition-all active:scale-95 disabled:opacity-20"
                                                    >
                                                        BIND (2.5k)
                                                    </button>
                                                )}
                                                {item.isSoulBound && <ShieldCheck size={16} className="text-primary-color" />}
                                            </div>
                                        ))}
                                        {![member.weapon, member.armor, member.accessory].some(Boolean) && (
                                            <div className="text-[10px] text-muted text-center py-4 border border-dashed border-white/5 rounded-xl uppercase font-bold tracking-tighter opacity-30 italic">No gear equipped to bind.</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Succession Ritual */}
                <div className="space-y-4">
                    <h3 className="text-sm md:text-lg font-black uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                        <Heart size={18} className="text-secondary-color" />
                        Succession
                    </h3>
                    <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-secondary-color/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 pointer-events-none">
                            <Sparkles size={120} />
                        </div>
                        
                        <p className="text-[10px] md:text-sm text-muted mb-8 relative z-10 italic leading-relaxed">
                            Select two <span className="text-secondary-color font-black">Soulmate</span> parents to produce an Heir. The Heir inherits base stats plus a cumulative +10% stackable legacy bonus.
                        </p>

                        <div className="space-y-3 mb-8 relative z-10">
                            {party.map((member, idx) => (
                                <button 
                                    key={member.id || idx}
                                    onClick={() => handleParentToggle(member.id)}
                                    className={`w-full p-4 rounded-xl border transition-all flex justify-between items-center group active:scale-95 ${
                                        selectedParents.includes(member.id) 
                                        ? 'bg-secondary-color/20 border-secondary-color shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${selectedParents.includes(member.id) ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>{member.name}</span>
                                    {selectedParents.includes(member.id) && <Sparkles size={16} className="text-secondary-color animate-pulse" />}
                                </button>
                            ))}
                        </div>

                        <button 
                            disabled={selectedParents.length !== 2}
                            onClick={performRitual}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${
                                selectedParents.length === 2 
                                ? 'bg-secondary-color text-white shadow-secondary-color/30' 
                                : 'bg-white/5 text-muted cursor-not-allowed opacity-20'
                            }`}
                        >
                            <UserPlus size={18} />
                            Produce Legacy Heir ({getRitualCost().toLocaleString()}g)
                        </button>
                        
                        <div className="mt-8 flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 opacity-60">
                            <ShieldAlert size={14} className="flex-shrink-0 mt-0.5 text-secondary-color" />
                            <p className="text-[10px] leading-relaxed italic">The ritual consumes significant spiritual energy and requires Soulmate status (100 Affinity).</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LineageHall;
