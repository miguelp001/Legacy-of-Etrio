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
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">The Basilica</h2>
                    <p className="text-muted">The spiritual heart of the guild, where mortality is transcended.</p>
                </div>
                <div className="p-3 bg-primary-color/20 rounded-xl text-primary-color">
                    <Crown size={24} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ritual Section */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="glass p-8 rounded-2xl border border-primary-color/20 bg-primary-color/5 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 opacity-5 rotate-12">
                            <Crown size={200} />
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <Sparkles className="text-primary-color" size={20} />
                            The Blood Throne
                        </h3>
                        <p className="text-sm text-muted mb-8 max-w-xl">
                            Only those who have attained the rank of <span className="text-primary-color font-bold">Drengskapr</span> and mastered 
                            the depth through <span className="text-white font-bold">Level 20</span> may ascend. 
                            Ascension is permanent and removes the hero from the active party.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {candidates.map((member: any) => {
                                const isEligible = member.level >= 20 && member.socialClass === 'Drengskapr';
                                return (
                                    <div key={member.id} className={`p-4 rounded-xl border transition-all ${
                                        isEligible ? 'bg-white/5 border-primary-color/30 hover:border-primary-color' : 'bg-black/20 border-white/5 opacity-60'
                                    }`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="font-bold">{member.name}</div>
                                                <div className="text-[10px] text-muted uppercase">Lvl {member.level} {member.socialClass}</div>
                                            </div>
                                            {isEligible && <ArrowUpCircle className="text-primary-color animate-bounce" size={16} />}
                                        </div>
                                        
                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-[10px] uppercase tracking-widest">
                                                <span>Level Requirement (20)</span>
                                                <span className={member.level >= 20 ? 'text-green-500' : 'text-red-500'}>{member.level}/20</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] uppercase tracking-widest">
                                                <span>Rank Requirement</span>
                                                <span className={member.socialClass === 'Drengskapr' ? 'text-green-500' : 'text-red-500'}>
                                                    {member.socialClass === 'Drengskapr' ? 'MET' : 'NOT MET'}
                                                </span>
                                            </div>
                                        </div>

                                        <button 
                                            disabled={!isEligible}
                                            onClick={() => handleAscend(member.id, member.name)}
                                            className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                                isEligible 
                                                ? 'bg-primary-color text-white shadow-lg shadow-primary-color/20 hover:scale-[1.02]' 
                                                : 'bg-white/5 text-muted cursor-not-allowed'
                                            }`}
                                        >
                                            {isEligible ? 'Ascend to Throne' : 'Ineligible'}
                                        </button>
                                    </div>
                                );
                            })}
                            {candidates.length === 0 && (
                                <div className="col-span-full py-12 text-center text-muted glass rounded-xl border-dashed border-white/10 border-2">
                                    No candidates for ascension currently in the party.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="glass p-6 rounded-2xl border border-white/10">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Users size={20} className="text-primary-color" />
                            Active Guild Council
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {councilMembers.map(member => (
                                <div key={member.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-color/20 rounded-full flex items-center justify-center text-primary-color font-black">
                                        {member.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">{member.name}</div>
                                        <div className="text-[10px] text-primary-color uppercase font-black tracking-tighter">Ascended Councillor</div>
                                    </div>
                                </div>
                            ))}
                            {councilMembers.length === 0 && (
                                <div className="col-span-full py-8 text-center text-muted italic text-sm">
                                    The Council Table stands empty...
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="glass p-6 rounded-2xl border border-accent-color/20 bg-accent-color/5">
                        <h4 className="font-bold flex items-center gap-2 mb-4 text-accent-color">
                            <Shield size={18} />
                            Council Passives
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                                <span className="text-xs text-muted">Building Discount</span>
                                <span className="text-sm font-bold text-accent-color">-{councilMembers.length * 5}%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                                <span className="text-xs text-muted">Gold Efficiency</span>
                                <span className="text-sm font-bold text-accent-color">+{councilMembers.length * 5}%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                                <span className="text-xs text-muted">Snapshot Damage</span>
                                <span className="text-sm font-bold text-accent-color">+{councilMembers.length * 2}%</span>
                            </div>
                            <div className="mt-4 p-3 bg-accent-color/10 rounded-lg border border-accent-color/20 text-[10px] text-accent-color flex items-start gap-2">
                                <Info size={14} className="shrink-0" />
                                <span>Council bonuses are stackable and permanent across all lineages.</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold mb-4 text-sm">Transcendence Lore</h4>
                        <p className="text-[11px] text-muted leading-relaxed">
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
