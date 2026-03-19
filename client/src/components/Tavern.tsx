import React, { useState, useEffect } from 'react';
import { UserPlus, RefreshCw, Loader2, Droplets } from 'lucide-react';
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">The Rusty Chalice Tavern</h2>
                    <p className="text-muted">Hire skilled adventurers to join your party.</p>
                    {pollutionLevel > 50 && (
                        <div className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-1">
                            ΓÜá∩╕Å Industrial Smog: Higher Costs
                        </div>
                    )}
                </div>
                <button 
                    onClick={fetchCandidates} 
                    className="btn-outline" 
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                    Refresh Board
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {candidates.map((npc, idx) => (
                    <div key={idx} className="glass p-6 rounded-xl border border-white/10 hover:border-primary-color/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold">{npc.name}</h3>
                                <div className="flex gap-2 items-center mt-1">
                                    <span className="text-xs px-2 py-0.5 bg-primary-color/20 text-primary-color rounded-full">
                                        {npc.baseClass}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 bg-secondary-color/20 text-secondary-color rounded-full">
                                        {npc.socialClass}
                                    </span>
                                    {npc.isVampire && (
                                        <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-500 rounded-full flex items-center gap-1">
                                            <Droplets size={10} />
                                            {npc.tribe}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted">Cost</div>
                                <div className="text-lg font-bold text-yellow-500">{getHireCost(npc.socialClass)}g</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-6">
                            <div className="flex justify-between">
                                <span className="text-muted">STR</span>
                                <span>{Math.floor(npc.stats.strength)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted">AGI</span>
                                <span>{Math.floor(npc.stats.agility)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted">INT</span>
                                <span>{Math.floor(npc.stats.intelligence)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted">VIT</span>
                                <span>{Math.floor(npc.stats.vitality)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleHire(npc)}
                            className="w-full btn-primary"
                        >
                            <UserPlus size={18} />
                            Hire Adventurer
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tavern;
