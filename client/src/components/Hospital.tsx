import React, { useState, useEffect } from 'react';
import { HeartPulse, Clock, Activity, ShieldAlert, Sparkles, Heart, Users } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const Hospital: React.FC = () => {
    const { party } = useGameStore();
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Update time every second for recovery countdowns
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Simulated Injury tracking (characters in the store can have an optional 'recoveryUntil' timestamp)
    // For this phase, we mock the UI for characters with injured status

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">Respite Sanitarium</h2>
                    <p className="text-muted">Advanced recovery for survivors of the Pit.</p>
                </div>
                <div className="p-3 bg-danger-color/20 rounded-xl text-danger-color">
                    <HeartPulse size={24} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {party.length > 0 ? (
                    party.map((member: any) => {
                        const isInjured = member.recoveryUntil && member.recoveryUntil > currentTime;
                        const remainingMs = isInjured ? member.recoveryUntil - currentTime : 0;
                        const remainingSecs = Math.ceil(remainingMs / 1000);
                        const hpPercent = (member.hp / member.maxHp) * 100;

                        return (
                            <div key={member.id} className={`glass p-6 rounded-2xl border transition-all ${isInjured ? 'border-danger-color/50 bg-danger-color/5' : 'border-white/10'}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="font-bold text-lg">{member.name}</div>
                                        <div className="text-xs text-muted uppercase tracking-widest">{member.baseClass}</div>
                                    </div>
                                    {isInjured ? (
                                        <div className="p-2 bg-danger-color/20 rounded-lg text-danger-color animate-pulse">
                                            <ShieldAlert size={18} />
                                        </div>
                                    ) : (
                                        <div className={`p-2 rounded-lg ${hpPercent < 50 ? 'bg-warning-color/20 text-warning-color' : 'bg-secondary-color/20 text-secondary-color'}`}>
                                            <Activity size={18} />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase">
                                            <span className="text-muted">Vitality (HP)</span>
                                            <span className={hpPercent < 30 ? 'text-danger-color' : 'text-white'}>{member.hp} / {member.maxHp}</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${hpPercent < 30 ? 'bg-danger-color shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-secondary-color'}`}
                                                style={{ width: `${hpPercent}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {isInjured ? (
                                        <div className="pt-4 border-t border-danger-color/20">
                                            <div className="flex items-center gap-2 text-danger-color text-xs font-bold uppercase mb-2">
                                                <Clock size={14} />
                                                Recovery in Progress
                                            </div>
                                            <div className="text-2xl font-black text-white">
                                                {Math.floor(remainingSecs / 60)}m {remainingSecs % 60}s
                                            </div>
                                            <p className="text-[10px] text-muted mt-2">Currently locked out of exploration.</p>
                                        </div>
                                    ) : (
                                        <div className="pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-secondary-color text-xs font-bold uppercase mb-2">
                                                <Sparkles size={14} />
                                                Ready for Battle
                                            </div>
                                            <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-colors">
                                                Fast Recover (50g)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 text-center glass rounded-2xl border-dashed border-white/10 border-2">
                        <Users size={48} className="mx-auto text-white/5 mb-4" />
                        <h3 className="text-xl font-bold text-muted">No Party Members</h3>
                        <p className="text-sm text-muted mt-2">Recruit adventurers at the Tavern to see their health status.</p>
                    </div>
                )}
            </div>
            
            <div className="glass p-6 rounded-2xl border border-white/10 bg-accent-color/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent-color/20 rounded-xl text-accent-color">
                        <Heart size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold">Respite Blessing</h4>
                        <p className="text-sm text-muted">Town Hub recovers 5% HP per minute passively for all members.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hospital;
