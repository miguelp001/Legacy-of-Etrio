import React, { useState, useEffect } from 'react';
import { HeartPulse, Activity, Users } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const Hospital: React.FC = () => {
    const { party, mainCharacter, pollutionLevel, gold } = useGameStore();
    const state = useGameStore.getState();
    const pollutionPenalty = pollutionLevel > 50 ? 1.2 : 1.0;
    const fullParty = [mainCharacter, ...party].filter(Boolean);
    
    // Debug: log party state
    useEffect(() => {
        console.log('[HOSPITAL] Mounted. Party:', party.length, 'MC:', mainCharacter?.hp);
    }, []);

    const handleHealAll = () => {
        const currentState = useGameStore.getState();
        console.log('[HEAL] Before:', currentState.party.map((p: any) => ({ name: p.name, hp: p.hp, maxHp: p.maxHp })));
        
        // Create new party with full HP
        const newParty = currentState.party.map((m: any) => ({
            ...m,
            hp: m.maxHp || 100
        }));
        
        // Create new MC with full HP
        let newMc = currentState.mainCharacter;
        if (newMc) {
            newMc = { ...newMc, hp: newMc.maxHp || 100 };
        }
        
        // Update state directly
        useGameStore.setState({ party: newParty, mainCharacter: newMc });
        
        const afterState = useGameStore.getState();
        console.log('[HEAL] After:', afterState.party.map((p: any) => ({ name: p.name, hp: p.hp })));
    };

    const getHealCost = (socialClass: string) => {
        const healCosts: Record<string, number> = {
            'Thrall': 25, 'Bondi': 50, 'Vardr': 100, 'Scrifadr': 250, 'Drengskapr': 1000
        };
        return Math.floor((healCosts[socialClass || 'Bondi'] || 50) * pollutionPenalty);
    };

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

            {/* TEST BUTTON */}
            <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                <button 
                    onClick={handleHealAll}
                    className="w-full py-4 bg-green-600 text-white rounded-xl font-black uppercase"
                >
                    TEST HEAL ALL
                </button>
                <p className="text-[10px] text-green-400 mt-2 text-center">Debug: Click to heal all party members</p>
            </div>

            {/* Party List */}
            <div className="space-y-3">
                {fullParty.map((member: any) => (
                    <div key={member.id} className="glass p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-black">{member.name}</span>
                            <span className="text-sm text-white/60">{member.socialClass} Lv{member.level}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted mb-2">
                            <span>HP</span>
                            <span>{Math.floor(member.hp)} / {member.maxHp}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-secondary-color transition-all"
                                style={{ width: `${(member.hp / member.maxHp) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Info */}
            <div className="p-4 glass rounded-xl border-white/5">
                <div className="flex items-center gap-3">
                    <Activity size={16} className="text-secondary-color" />
                    <span className="text-xs text-muted">Ley-lines restore 10% HP every 30 seconds</span>
                </div>
            </div>
        </div>
    );
};

export default Hospital;
