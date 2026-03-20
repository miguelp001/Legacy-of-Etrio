import React from 'react';
import { Sparkles, Crown, Shield, Users, ArrowUpCircle, Info } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const Basilica: React.FC = () => {
    const { 
        mainCharacter, party, councilMembers, 
        ascendCharacter 
    } = useGameStore();

    const candidates = [mainCharacter, ...party].filter(m => m && !m.isAscended);

    const handleAscend = (id: string, name: string) => {
        if (confirm(`Transcendance Ritual: Are you sure you want ${name} to ascend to the Blood Throne? They will leave active duty to join the Eternal Council, granting +50% stats and guild-wide passive bonuses.`)) {
            ascendCharacter(id);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 md:px-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-color/20 rounded-xl text-primary-color shrink-0">
                        <Crown size={24} className="md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic">The Basilica</h2>
                        <p className="text-muted text-[10px] md:text-sm uppercase font-bold tracking-tight opacity-50">The spiritual heart of the guild, where mortality is transcended.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
                {/* Ritual Section */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="glass p-6 md:p-8 rounded-3xl border border-primary-color/20 bg-primary-color/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 pointer-events-none">
                            <Crown size={200} />
                        </div>
                        
                        <div className="relative z-10">
                            <h3 className="text-sm md:text-lg font-black uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Sparkles className="text-primary-color" size={18} />
                                The Blood Throne
                            </h3>
                            <p className="text-[10px] md:text-sm text-muted mb-8 max-w-xl italic leading-relaxed">
                                Only those who have attained the rank of <span className="text-primary-color font-black">Drengskapr</span> and mastered 
                                the depth through <span className="text-white font-black">Level 20</span> may ascend. 
                                Ascension is permanent.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {candidates.map((member: any, idx: number) => {
                                    const isEligible = member.level >= 20 && member.socialClass === 'Drengskapr';
                                    return (
                                        <div key={member.id || idx} className={`p-5 rounded-2xl border transition-all flex flex-col ${
                                            isEligible ? 'bg-white/5 border-primary-color/30 hover:border-primary-color' : 'bg-black/20 border-white/5 opacity-40'
                                        }`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="font-black text-base md:text-lg tracking-tight leading-none mb-1">{member.name}</div>
                                                    <div className="text-[8px] md:text-[10px] text-muted uppercase font-black tracking-widest">Lvl {member.level} {member.socialClass}</div>
                                                </div>
                                                {isEligible && <ArrowUpCircle className="text-primary-color animate-bounce" size={18} />}
                                            </div>
                                            
                                            <div className="space-y-3 mb-6 flex-1">
                                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                                    <span className="opacity-50">Level Requirement (20)</span>
                                                    <span className={member.level >= 20 ? 'text-green-500' : 'text-red-500'}>{member.level}/20</span>
                                                </div>
                                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                                    <span className="opacity-50">Rank Requirement</span>
                                                    <span className={member.socialClass === 'Drengskapr' ? 'text-green-500' : 'text-danger-color'}>
                                                        {member.socialClass === 'Drengskapr' ? 'MET' : 'NOT MET'}
                                                    </span>
                                                </div>
                                            </div>

                                            <button 
                                                disabled={!isEligible}
                                                onClick={() => handleAscend(member.id, member.name)}
                                                className={`w-full py-3 md:py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                                                    isEligible 
                                                    ? 'bg-primary-color text-white shadow-xl shadow-primary-color/20' 
                                                    : 'bg-white/5 text-muted cursor-not-allowed'
                                                }`}
                                            >
                                                {isEligible ? 'Ascend to Throne' : 'Ineligible'}
                                            </button>
                                        </div>
                                    );
                                })}
                                {candidates.length === 0 && (
                                    <div className="col-span-full py-16 text-center text-muted glass rounded-3xl border-dashed border-white/10 border-2">
                                        <p className="text-[10px] uppercase font-black tracking-widest opacity-30">No candidates for ascension currently in the party.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="glass p-6 md:p-8 rounded-3xl border border-white/5">
                        <h3 className="text-sm md:text-lg font-black uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-white/5 pb-2">
                            <Users size={18} className="text-primary-color" />
                            Active Guild Council <span className="text-white/30 ml-auto">({councilMembers.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {councilMembers.map((member, idx) => (
                                <div key={member.id || idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 transition-all hover:bg-white/10">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-color/20 rounded-full flex items-center justify-center text-primary-color font-black text-lg">
                                        {member.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-xs md:text-sm font-black tracking-tight uppercase leading-none mb-1">{member.name}</div>
                                        <div className="text-[8px] md:text-[10px] text-primary-color uppercase font-black tracking-widest opacity-60">Councillor</div>
                                    </div>
                                </div>
                            ))}
                            {councilMembers.length === 0 && (
                                <div className="col-span-full py-12 text-center text-muted italic text-[10px] uppercase font-black tracking-widest opacity-20">
                                    The Council Table stands empty...
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="glass p-6 md:p-8 rounded-3xl border border-accent-color/20 bg-accent-color/5 relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Shield size={60} />
                        </div>
                        <h4 className="text-sm md:text-lg font-black uppercase tracking-widest flex items-center gap-2 mb-6 text-accent-color border-b border-accent-color/20 pb-2">
                            <Shield size={18} />
                            Council Passives
                        </h4>
                        <div className="space-y-4">
                            {[
                                { label: 'Building Discount', value: `-${councilMembers.length * 5}%` },
                                { label: 'Gold Efficiency', value: `+${councilMembers.length * 5}%` },
                                { label: 'Snapshot Damage', value: `+${councilMembers.length * 2}%` }
                            ].map((passive, idx) => (
                                <div key={idx} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-tight text-white/50">{passive.label}</span>
                                    <span className="text-sm font-black text-accent-color tracking-tighter italic">{passive.value}</span>
                                </div>
                            ))}
                            <div className="mt-6 p-4 bg-accent-color/10 rounded-2xl border border-accent-color/10 text-[10px] text-accent-color leading-relaxed italic flex items-start gap-3">
                                <Info size={16} className="shrink-0 opacity-50" />
                                <span>Council bonuses are stackable and permanent across all future lineages.</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 md:p-8 rounded-3xl border border-white/5">
                        <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-4 text-white/30">Transcendence Lore</h4>
                        <p className="text-[10px] md:text-xs text-muted leading-relaxed italic opacity-70">
                            Ascension is not just a promotion; it is a spiritual merging with the guild's legacy. 
                            Councillors no longer bleed in The Deep, but their wisdom guides those who still do.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Basilica;
