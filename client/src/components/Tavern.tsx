import React, { useState, useEffect } from 'react';
import { UserPlus, RefreshCw, Loader2, Droplets, Zap, ChevronRight, Users, Shield, Sword, Heart, UserMinus } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Tavern: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Mercenaries' | 'Personnel'>('Mercenaries');
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { addToParty, removeFromParty, party, mainCharacter, gold, addGold, pollutionLevel } = useGameStore();

    const pollutionPenalty = pollutionLevel > 50 ? 1.2 : 1.0;

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const fetchNPC = async () => {
                const res = await fetch(`${API_BASE}/api/generate-npc?level=1`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            };
            const results = await Promise.all([fetchNPC(), fetchNPC(), fetchNPC()]);
            setCandidates(results);
        } catch (error) {
            console.error('Failed to fetch candidates:', error);
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const getHireCost = (socialClass: string) => {
        const costs: Record<string, number> = {
            'Thrall': 50,
            'Bondi': 200,
            'Vardr': 500,
            'Scrifadr': 1000,
            'Drengskapr': 5000
        };
        return Math.floor((costs[socialClass] || 100) * pollutionPenalty);
    };

    const handleHire = (npc: any) => {
        if (party.length >= 4) {
            alert('Party is full!');
            return;
        }
        const cost = getHireCost(npc.socialClass);
        if (gold < cost) {
            alert(`Not enough gold!`);
            return;
        }
        addGold(-cost);
        addToParty(npc);
        setCandidates(prev => prev.filter(c => c.id !== npc.id));
    };

    const handleDismiss = (id: string) => {
        if (window.confirm('Dismiss this member from the vanguard? All equipped gear will be returned to inventory.')) {
            removeFromParty(id);
        }
    };

    const fullParty = [mainCharacter, ...party].filter(Boolean);

    return (
        <div className="space-y-6 animate-fade-in pb-32">
            {/* Header / Tab Switcher */}
            <div className="px-4 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-accent-color/20 rounded-xl text-accent-color">
                        <Users size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tighter uppercase italic text-glow">
                            {activeTab === 'Mercenaries' ? 'The Rusty Chalice' : 'Vanguard Roster'}
                        </h2>
                        <span className="text-[10px] text-muted font-bold uppercase tracking-widest leading-none">
                            {activeTab === 'Mercenaries' ? 'Recruitment Hub' : 'Personnel Management'}
                        </span>
                    </div>
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-2xl gap-2 border border-white/5">
                    {['Mercenaries', 'Personnel'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary-color text-white shadow-lg' : 'text-muted'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'Mercenaries' ? (
                <>
                    {/* Refresh Board Action */}
                    <div className="px-4">
                        <button 
                            onClick={fetchCandidates} 
                            className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-transform" 
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} className="text-primary-color" />}
                            Refresh Board (50g)
                        </button>
                    </div>

                    <div className="space-y-4 px-4">
                        {candidates.length > 0 ? (
                            candidates.map((npc, idx) => {
                                const cost = getHireCost(npc.socialClass);
                                const canAfford = gold >= cost;
                                return (
                                    <div key={idx} className="glass p-5 rounded-3xl border border-white/5 space-y-5 transition-all group relative overflow-hidden">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="badge bg-primary-color/10 text-primary-color border border-primary-color/20">{npc.baseClass}</span>
                                                    <span className="badge bg-white/5 text-muted border border-white/10">{npc.socialClass}</span>
                                                    {npc.isVampire && <span className="badge bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1"><Droplets size={10} /> {npc.tribe}</span>}
                                                </div>
                                                <h3 className="text-lg font-black tracking-tight">{npc.name}</h3>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-1">Fee</div>
                                                <div className={`text-lg font-black ${canAfford ? 'text-accent-color' : 'text-danger-color'}`}>{cost.toLocaleString()}g</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                                            <div className="flex justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                                                <span className="text-white/20 font-black uppercase tracking-tighter">Str/Agi</span>
                                                <span className="font-bold">{Math.floor(npc.stats.strength)}/{Math.floor(npc.stats.agility)}</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                                                <span className="text-white/20 font-black uppercase tracking-tighter">Vit/Int</span>
                                                <span className="font-bold">{Math.floor(npc.stats.vitality)}/{Math.floor(npc.stats.intelligence)}</span>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleHire(npc)}
                                            disabled={!canAfford || party.length >= 4}
                                            className="w-full py-5 bg-primary-color text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary-color/20 active:scale-95 transition-transform disabled:opacity-30 flex items-center justify-center gap-3"
                                        >
                                            <UserPlus size={18} />
                                            Recruit Vanguard
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-20 text-center glass rounded-[3rem] border-dashed border-white/5 border-2">
                                <Users size={32} className="mx-auto text-white/10 mb-3" />
                                <p className="text-[10px] text-muted font-black uppercase tracking-widest leading-none">The board is vacant...</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="space-y-4 px-4">
                    {fullParty.map((member, idx) => (
                        <div key={member.id} className="glass p-5 rounded-3xl border border-white/5 space-y-4 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex gap-2 items-center">
                                        <span className="badge bg-primary-color/10 text-primary-color border border-primary-color/20">{member.baseClass}</span>
                                        <span className="text-[10px] text-muted font-bold uppercase tracking-tight">LVL {member.level}</span>
                                    </div>
                                    <h3 className="text-lg font-black tracking-tight">{member.name} {member.id === 'player-mc' && '(MC)'}</h3>
                                </div>
                                {member.id !== 'player-mc' && (
                                    <button 
                                        onClick={() => handleDismiss(member.id)}
                                        className="p-2.5 bg-danger-color/10 border border-danger-color/20 rounded-xl text-danger-color active:scale-90 transition-transform"
                                    >
                                        <UserMinus size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Stats & Equipment Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Condition</div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-mono">
                                            <span className="text-white/40 uppercase">Health</span>
                                            <span>{Math.floor(member.hp)}/{Math.floor(member.maxHp)}</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary-color" style={{ width: `${(member.hp / member.maxHp) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Arsenal</div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-white/60">
                                            <Sword size={12} className={member.weapon ? 'text-accent-color' : 'text-white/10'} />
                                            <span className="truncate">{member.weapon?.name || 'Empty'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-white/60">
                                            <Shield size={12} className={member.armor ? 'text-secondary-color' : 'text-white/10'} />
                                            <span className="truncate">{member.armor?.name || 'Empty'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-white/60">
                                          <Zap size={12} className={member.accessory ? 'text-primary-color' : 'text-white/10'} />
                                          <span className="truncate">{member.accessory?.name || 'Empty'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Tavern;
