import React, { useState, useEffect } from 'react';
import { HeartPulse, Activity } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const Hospital: React.FC = () => {
    const party = useGameStore((s) => s.party);
    const mainCharacter = useGameStore((s) => s.mainCharacter);
    const pollutionLevel = useGameStore((s) => s.pollutionLevel);
    const gold = useGameStore((s) => s.gold);
    const addGold = useGameStore((s) => s.addGold);
    const pollutionPenalty = pollutionLevel > 50 ? 1.2 : 1.0;
    const fullParty = [mainCharacter, ...party].filter(Boolean);
    
    const [tick, setTick] = useState(0);

    // Passive heal every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setTick((t) => t + 1);
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);

    // Check if we should heal
    useEffect(() => {
        const state = useGameStore.getState();
        const now = Date.now();
        
        let didChange = false;
        let newParty = state.party;
        let newMc = state.mainCharacter;
        
        // Check for revival (recovery expired)
        // Main character
        if (newMc && newMc.hp <= 0 && newMc.recoveryUntil && newMc.recoveryUntil <= now) {
            console.log('[PASSIVE] Reviving MC:', newMc.name);
            newMc = { ...newMc, hp: newMc.maxHp, recoveryUntil: 0 };
            didChange = true;
        } else if (newMc && newMc.hp > 0 && newMc.hp < newMc.maxHp) {
            // 10% heal if wounded
            const heal = Math.floor(newMc.maxHp * 0.1);
            newMc = { ...newMc, hp: Math.min(newMc.maxHp, newMc.hp + heal) };
            didChange = true;
        }
        
        // Party members
        const updatedParty = state.party.map((m: any) => {
            if (m.hp <= 0 && m.recoveryUntil && m.recoveryUntil <= now) {
                console.log('[PASSIVE] Reviving:', m.name);
                didChange = true;
                return { ...m, hp: m.maxHp, recoveryUntil: 0 };
            } else if (m.hp > 0 && m.hp < m.maxHp) {
                const heal = Math.floor(m.maxHp * 0.1);
                didChange = true;
                return { ...m, hp: Math.min(m.maxHp, m.hp + heal) };
            }
            return m;
        });
        
        if (didChange) {
            useGameStore.setState({ party: updatedParty, mainCharacter: newMc });
        }
    }, [tick]);

    const handleHealAll = () => {
        const state = useGameStore.getState();
        const newParty = state.party.map((m: any) => ({ ...m, hp: m.maxHp || 100 }));
        let newMc = state.mainCharacter;
        if (newMc) newMc = { ...newMc, hp: newMc.maxHp || 100 };
        useGameStore.setState({ party: newParty, mainCharacter: newMc });
    };

    const getHealCost = (socialClass: string) => {
        const healCosts: Record<string, number> = {
            'Thrall': 25, 'Bondi': 50, 'Vardr': 100, 'Scrifadr': 250, 'Drengskapr': 1000
        };
        return Math.floor((healCosts[socialClass || 'Bondi'] || 50) * pollutionPenalty);
    };

    const handleInstantHeal = (member: any) => {
        const cost = getHealCost(member.socialClass);
        if (gold < cost) return;
        addGold(-cost);
        
        const state = useGameStore.getState();
        if (member.id === 'player-mc') {
            useGameStore.setState({ mainCharacter: { ...state.mainCharacter!, hp: state.mainCharacter!.maxHp } });
        } else {
            const newParty = state.party.map((m: any) => 
                m.id === member.id ? { ...m, hp: m.maxHp } : m
            );
            useGameStore.setState({ party: newParty });
        }
    };

    const secondsUntilHeal = 30 - (tick % 30);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-danger-color/20 rounded-xl text-danger-color">
                    <HeartPulse size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-black tracking-tighter uppercase italic">Infirmary</h2>
                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest">{pollutionLevel}% Pollution</span>
                </div>
            </div>

            {/* Party List */}
            <div className="space-y-3">
                {fullParty.map((member: any) => {
                    const cost = getHealCost(member.socialClass);
                    const needsHealing = member.hp < member.maxHp;
                    
                    return (
                        <div key={member.id} className="glass p-4 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                                        member.id === 'player-mc' ? 'bg-accent-color/20 text-accent-color' : 'bg-white/10 text-white/60'
                                    }`}>
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <span className="font-black text-sm">{member.name}</span>
                                        <span className="text-[10px] text-muted ml-2">{member.socialClass} Lv{member.level}</span>
                                    </div>
                                </div>
                                {needsHealing ? (
                                    <button
                                        onClick={() => handleInstantHeal(member)}
                                        disabled={gold < cost}
                                        className="px-3 py-1.5 bg-secondary-color/20 text-secondary-color text-[10px] font-black uppercase rounded-lg disabled:opacity-30"
                                    >
                                        Heal {cost}g
                                    </button>
                                ) : (
                                    <span className="text-[10px] text-secondary-color font-black uppercase">Full HP</span>
                                )}
                            </div>
                            <div className="flex justify-between text-[10px] text-muted mb-1.5">
                                <span>HP</span>
                                <span>{Math.floor(member.hp)} / {member.maxHp}</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-secondary-color transition-all"
                                    style={{ width: `${Math.min(100, (member.hp / member.maxHp) * 100)}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Heal All Button */}
            <button 
                onClick={handleHealAll}
                className="w-full py-4 bg-secondary-color text-white rounded-xl font-black uppercase tracking-widest shadow-lg"
            >
                Heal All ({fullParty.length} members)
            </button>

            {/* Info */}
            <div className="p-4 glass rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Activity size={16} className="text-secondary-color" />
                    <span className="text-xs text-muted">Ley-lines restore 10% HP every 30 seconds</span>
                </div>
                <div className="text-right">
                    <div className="text-lg font-black text-secondary-color">{secondsUntilHeal}s</div>
                    <div className="text-[8px] text-muted uppercase">Next</div>
                </div>
            </div>
        </div>
    );
};

export default Hospital;
