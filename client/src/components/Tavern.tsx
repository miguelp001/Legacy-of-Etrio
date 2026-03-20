import React, { useState, useEffect } from 'react';
import { UserPlus, RefreshCw, Loader2, Droplets, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Tavern: React.FC = () => {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { addToParty, party, gold, addGold, pollutionLevel } = useGameStore();

    const pollutionPenalty = pollutionLevel > 50 ? 1.2 : 1.0;

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const results = await Promise.all([
                fetch(`${API_BASE}/api/generate-npc?level=1`).then(res => res.json()),
                fetch(`${API_BASE}/api/generate-npc?level=1`).then(res => res.json()),
                fetch(`${API_BASE}/api/generate-npc?level=1`).then(res => res.json()),
            ]);
            setCandidates(results);
        } catch (error) {
            console.error('Failed to fetch candidates', error);
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
            alert(`Not enough gold! Hiring a ${npc.socialClass} costs ${cost}g.`);
            return;
        }
        addGold(-cost);
        addToParty(npc);
        setCandidates(prev => prev.filter(c => c.name !== npc.name));
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 md:px-0">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">The Rusty Chalice</h2>
                    <p className="text-muted text-xs md:text-sm">Hire skilled adventurers to join your party.</p>
                    {pollutionLevel > 50 && (
                        <div className="text-[8px] md:text-[10px] text-orange-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1">
                            <Zap size={10} className="animate-pulse" /> Industrial Smog: Higher Costs
                        </div>
                    )}
                </div>
                <button 
                    onClick={fetchCandidates} 
                    className="btn-outline w-full md:w-auto flex justify-center py-3 md:py-2 text-[10px] md:text-xs font-black uppercase tracking-widest" 
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                    Refresh Board
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
                {candidates.map((npc, idx) => {
                    const cost = getHireCost(npc.socialClass);
                    const canAfford = gold >= cost;
                    return (
                        <div key={idx} className="glass p-5 md:p-6 rounded-2xl border border-white/5 hover:border-primary-color/30 transition-all group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg md:text-xl font-black tracking-tight group-hover:text-primary-color transition-colors">{npc.name}</h3>
                                    <div className="flex flex-wrap gap-1.5 items-center">
                                        <span className="text-[8px] md:text-[10px] px-2 py-0.5 bg-primary-color/10 text-primary-color border border-primary-color/20 font-black uppercase rounded-lg">
                                            {npc.baseClass}
                                        </span>
                                        <span className="text-[8px] md:text-[10px] px-2 py-0.5 bg-white/5 text-muted border border-white/10 font-black uppercase rounded-lg">
                                            {npc.socialClass}
                                        </span>
                                        {npc.isVampire && (
                                            <span className="text-[8px] md:text-[10px] px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase rounded-lg flex items-center gap-1">
                                                <Droplets size={8} /> {npc.tribe}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">Contract</div>
                                    <div className={`text-sm md:text-lg font-black ${canAfford ? 'text-accent-color' : 'text-danger-color'}`}>{cost.toLocaleString()}g</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] md:text-xs mb-6 flex-1">
                                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                    <span className="text-white/30 font-black uppercase tracking-tighter">Strength</span>
                                    <span className="font-bold text-white/80">{Math.floor(npc.stats.strength)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                    <span className="text-white/30 font-black uppercase tracking-tighter">Agility</span>
                                    <span className="font-bold text-white/80">{Math.floor(npc.stats.agility)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                    <span className="text-white/30 font-black uppercase tracking-tighter">Intel</span>
                                    <span className="font-bold text-white/80">{Math.floor(npc.stats.intelligence)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                    <span className="text-white/30 font-black uppercase tracking-tighter">Vitality</span>
                                    <span className="font-bold text-white/80">{Math.floor(npc.stats.vitality)}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleHire(npc)}
                                disabled={!canAfford || party.length >= 4}
                                className="w-full py-4 bg-primary-color hover:bg-primary-color/80 text-white rounded-xl font-black uppercase tracking-[.1em] text-xs shadow-xl shadow-primary-color/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 mt-auto"
                            >
                                <UserPlus size={16} />
                                Hire Bondi
                            </button>
                        </div>
                    );
                })}
            </div>
            {party.length >= 4 && (
                <p className="text-center text-[10px] text-danger-color font-bold uppercase tracking-widest px-4">Your party is currently at maximum capacity (4/4).</p>
            )}
        </div>
    );
};

export default Tavern;
