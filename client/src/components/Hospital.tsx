import React, { useState, useEffect } from 'react';
import { HeartPulse, Clock, Activity, ShieldAlert, Sparkles, Heart, Users, Zap, Plus } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const Hospital: React.FC = () => {
    const { party, mainCharacter, healCharacter, pollutionLevel, gold, addGold } = useGameStore();
    const pollutionPenalty = pollutionLevel > 50 ? 1.2 : 1.0;
    const fullParty = [mainCharacter, ...party].filter(Boolean);
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getHealCost = (socialClass: string) => {
        const healCosts: Record<string, number> = {
            'Thrall': 25,
            'Bondi': 50,
            'Vardr': 100,
            'Scrifadr': 250,
            'Drengskapr': 1000
        };
        return Math.floor((healCosts[socialClass || 'Bondi'] || 50) * pollutionPenalty);
    };

    const handleHealAll = () => {
        let totalCost = 0;
        fullParty.forEach((m: any) => {
            if (m.hp < m.maxHp && !(m.recoveryUntil && m.recoveryUntil > currentTime)) {
                totalCost += getHealCost(m.socialClass);
            }
        });

        if (totalCost === 0) return;
        if (gold < totalCost) {
            alert('Insufficient gold for group recovery!');
            return;
        }

        addGold(-totalCost);
        fullParty.forEach((m: any) => {
            if (m.hp < m.maxHp && !(m.recoveryUntil && m.recoveryUntil > currentTime)) {
                healCharacter(m.id, m.maxHp);
            }
        });
    };

    return (
        <div className="space-y-6 animate-fade-in pb-32">
            {/* Header Area */}
            <div className="px-4 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-danger-color/20 rounded-xl text-danger-color">
                        <HeartPulse size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tighter uppercase italic">Respite Sanitarium</h2>
                        <div className="flex items-center gap-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-secondary-color animate-pulse" />
                             <span className="text-[10px] text-muted font-bold uppercase tracking-widest leading-none">Operational • {pollutionLevel}% Pollution</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pollution Warning */}
            {pollutionLevel > 50 && (
                <div className="mx-4 glass p-3 border-orange-500/20 bg-orange-500/5 flex items-center gap-3">
                    <Zap size={14} className="text-orange-500" />
                    <p className="text-[9px] font-black uppercase tracking-tight text-orange-500/80">
                        Sanitation standards compromised. Healing costs increased by 20%.
                    </p>
                </div>
            )}

            {/* Character List - Vertical Stack for Thumb Reach */}
            <div className="space-y-4 px-4">
                {fullParty.length > 0 ? (
                    fullParty.map((member: any, idx: number) => {
                        const isInjured = member.recoveryUntil && member.recoveryUntil > currentTime;
                        const remainingMs = isInjured ? member.recoveryUntil - currentTime : 0;
                        const remainingSecs = Math.ceil(remainingMs / 1000);
                        const hpPercent = (member.hp / member.maxHp) * 100;
                        const cost = getHealCost(member.socialClass);

                        return (
                            <div key={member.id || idx} className={`glass p-4 rounded-3xl border transition-all ${isInjured ? 'border-danger-color/30 bg-danger-color/5' : 'border-white/5'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs ${isInjured ? 'text-danger-color' : 'text-primary-color'}`}>
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-black text-sm tracking-tight">{member.name}</div>
                                            <span className="text-[9px] text-muted font-bold uppercase tracking-widest">{member.socialClass} • Lvl {member.level}</span>
                                        </div>
                                    </div>
                                    {isInjured ? (
                                        <div className="badge bg-danger-color/20 text-danger-color">Injured</div>
                                    ) : (
                                        <div className={`badge ${hpPercent < 40 ? 'bg-warning-color/20 text-warning-color' : 'bg-secondary-color/20 text-secondary-color'}`}>
                                            {hpPercent < 40 ? 'Critical' : 'Stable'}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                                        <span className="text-white/20">Vitality Map</span>
                                        <span className={hpPercent < 30 ? 'text-danger-color' : 'text-white/60'}>{Math.floor(member.hp)} / {member.maxHp}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-700 ${hpPercent < 30 ? 'bg-danger-color' : 'bg-secondary-color'}`}
                                            style={{ width: `${hpPercent}%` }}
                                        />
                                    </div>

                                    {isInjured ? (
                                        <div className="flex items-center justify-between p-3 bg-black/40 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-2">
                                                <Clock size={12} className="text-danger-color" />
                                                <span className="text-[9px] font-black uppercase text-danger-color/80">Healing Lockdown</span>
                                            </div>
                                            <span className="font-black text-lg text-white font-mono">{Math.floor(remainingSecs / 60)}:{(remainingSecs % 60).toString().padStart(2, '0')}</span>
                                        </div>
                                    ) : (
                                        <button 
                                            disabled={hpPercent >= 100 || gold < cost}
                                            onClick={() => {
                                                addGold(-cost);
                                                healCharacter(member.id, member.maxHp);
                                            }}
                                            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            {hpPercent >= 100 ? 'Peak Form' : `Apply Balms (${cost}g)`}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-20 text-center glass rounded-3xl border-dashed border-white/10 border-2">
                        <Users size={32} className="mx-auto text-white/5 mb-3" />
                        <h3 className="text-sm font-black text-muted uppercase tracking-tighter">No Echoes Found</h3>
                    </div>
                )}
            </div>

            {/* Mobile Sticky Action Bar */}
            <div className="fixed bottom-24 left-4 right-4 z-50 pointer-events-none">
                <button 
                    onClick={handleHealAll}
                    disabled={fullParty.every((m: any) => m.hp >= m.maxHp || (m.recoveryUntil && m.recoveryUntil > currentTime))}
                    className="pointer-events-auto ml-auto w-16 h-16 bg-secondary-color rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-transform disabled:opacity-50 disabled:grayscale"
                >
                    <div className="relative">
                        <HeartPulse size={28} />
                        <Plus size={14} className="absolute -top-1 -right-1 bg-black rounded-full" />
                    </div>
                </button>
            </div>

            {/* Info Panel */}
            <div className="mx-4 p-5 glass border-white/5 rounded-3xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-secondary-color/10 text-secondary-color flex items-center justify-center shrink-0">
                    <Activity size={20} />
                </div>
                <div className="space-y-0.5">
                    <h4 className="font-black text-xs uppercase tracking-tight">Passive Convalescence</h4>
                    <p className="text-[9px] text-muted leading-relaxed uppercase font-bold tracking-tighter">Nearby ley-lines provide 5% HP recovery per solar minute.</p>
                </div>
            </div>
        </div>
    );
};

export default Hospital;
