import React, { useState, useEffect } from 'react';
import { HeartPulse, Clock, Activity, ShieldAlert, Sparkles, Heart, Users, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const Hospital: React.FC = () => {
    const { party, mainCharacter, healCharacter, pollutionLevel } = useGameStore();
    const pollutionPenalty = pollutionLevel > 50 ? 1.2 : 1.0;
    const fullParty = mainCharacter ? [mainCharacter, ...party] : party;
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Update time every second for recovery countdowns
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Simulated Injury tracking (characters in the store can have an optional 'recoveryUntil' timestamp)
    // For this phase, we mock the UI for characters with injured status

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 md:px-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-danger-color/20 rounded-xl text-danger-color shrink-0">
                        <HeartPulse size={24} className="md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic">Respite Sanitarium</h2>
                        <p className="text-muted text-[10px] md:text-sm">Advanced recovery for survivors of the Pit.</p>
                        {pollutionLevel > 50 && (
                            <div className="text-[8px] md:text-[10px] text-orange-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1">
                                <Zap size={10} className="animate-pulse" /> Industrial Grime: Slower/Costly Healing
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 md:px-0">
                {fullParty.length > 0 ? (
                    fullParty.map((member: any, idx: number) => {
                        const isInjured = member.recoveryUntil && member.recoveryUntil > currentTime;
                        const remainingMs = isInjured ? member.recoveryUntil - currentTime : 0;
                        const remainingSecs = Math.ceil(remainingMs / 1000);
                        const hpPercent = (member.hp / member.maxHp) * 100;

                        return (
                            <div key={member.id || idx} className={`glass p-5 md:p-6 rounded-2xl border transition-all flex flex-col ${isInjured ? 'border-danger-color/50 bg-danger-color/5' : 'border-white/5'}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="font-black text-lg md:text-xl tracking-tight leading-none mb-1">{member.name}</div>
                                        <div className="flex flex-wrap gap-1.5 items-center">
                                            <span className="text-[8px] md:text-[10px] text-muted font-black uppercase tracking-widest">{member.baseClass}</span>
                                            <span className="text-[8px] md:text-[10px] text-secondary-color font-black uppercase tracking-widest">{member.socialClass}</span>
                                        </div>
                                    </div>
                                    {isInjured ? (
                                        <div className="p-2 bg-danger-color/20 rounded-xl text-danger-color animate-pulse shrink-0">
                                            <ShieldAlert size={18} />
                                        </div>
                                    ) : (
                                        <div className={`p-2 rounded-xl shrink-0 ${hpPercent < 50 ? 'bg-warning-color/20 text-warning-color' : 'bg-secondary-color/20 text-secondary-color'}`}>
                                            <Activity size={18} />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6 flex-1 flex flex-col justify-end">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] md:text-xs font-black uppercase tracking-tighter">
                                            <span className="text-white/30">Vitality (HP)</span>
                                            <span className={hpPercent < 30 ? 'text-danger-color' : 'text-white/80'}>{member.hp} / {member.maxHp}</span>
                                        </div>
                                        <div className="h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${hpPercent < 30 ? 'bg-danger-color shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-secondary-color'}`}
                                                style={{ width: `${hpPercent}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {isInjured ? (
                                        <div className="pt-4 border-t border-danger-color/20">
                                            <div className="flex items-center gap-2 text-danger-color text-[10px] font-black uppercase tracking-widest mb-2">
                                                <Clock size={12} />
                                                Recovery in Progress
                                            </div>
                                            <div className="text-xl md:text-2xl font-black text-white italic tracking-tighter">
                                                {Math.floor(remainingSecs / 60)}m {remainingSecs % 60}s
                                            </div>
                                            <p className="text-[8px] md:text-[10px] text-muted mt-2 uppercase font-bold tracking-tight">Currently locked out of exploration.</p>
                                        </div>
                                    ) : (
                                        <div className="pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-secondary-color text-[10px] font-black uppercase tracking-widest mb-2">
                                                <Sparkles size={12} />
                                                Ready for Battle
                                            </div>
                                            {(() => {
                                                const healCosts: Record<string, number> = {
                                                    'Thrall': 25,
                                                    'Bondi': 50,
                                                    'Vardr': 100,
                                                    'Scrifadr': 250,
                                                    'Drengskapr': 1000
                                                };
                                                const cost = Math.floor((healCosts[member.socialClass || 'Bondi'] || 50) * pollutionPenalty);
                                                return (
                                                    <button 
                                                        disabled={hpPercent >= 100}
                                                        onClick={() => {
                                                            const { gold, addGold } = useGameStore.getState();
                                                            if (gold < cost) {
                                                                alert('Not enough gold!');
                                                                return;
                                                            }
                                                            addGold(-cost);
                                                            healCharacter(member.id, member.maxHp);
                                                        }}
                                                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all disabled:opacity-20"
                                                    >
                                                        {hpPercent >= 100 ? 'Fully Rested' : `Fast Recover (${cost}g)`}
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed border-white/10 border-2">
                        <Users size={48} className="mx-auto text-white/5 mb-4" />
                        <h3 className="text-xl font-bold text-muted uppercase tracking-tighter">No Party Members</h3>
                        <p className="text-xs text-muted mt-2 px-4 italic">Recruit adventurers at the Tavern to see their health status.</p>
                    </div>
                )}
            </div>
            
            <div className="glass p-5 md:p-6 rounded-3xl border border-white/5 bg-accent-color/5 flex items-center justify-between mx-4 md:mx-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent-color/20 rounded-xl text-accent-color shrink-0">
                        <Heart size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-sm md:text-base uppercase tracking-tight">Respite Blessing</h4>
                        <p className="text-[10px] md:text-sm text-muted">Town Hub recovers 5% HP per minute passively for all members.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hospital;
