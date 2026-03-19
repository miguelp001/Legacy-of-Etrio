import React from 'react';
import { Trophy, Shield, Users, MapPin, RefreshCw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const VictoryScreen: React.FC = () => {
    const { councilMembers, isGameWon } = useGameStore();

    if (!isGameWon) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
            <div className="max-w-4xl w-full glass p-12 rounded-[3rem] border-2 border-primary-color/50 shadow-[0_0_100px_rgba(139,92,246,0.3)] relative overflow-hidden text-center">
                {/* Visual Flair */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-color/20 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary-color/20 rounded-full blur-[100px]"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-primary-color rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_var(--primary-glow)] animate-pulse">
                        <Trophy size={48} className="text-white" />
                    </div>

                    <h1 className="text-6xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-color via-white to-secondary-color">
                        Eternal Blood
                    </h1>
                    <p className="text-xl text-muted mb-12 max-w-2xl mx-auto">
                        The Heart of Etrio has been pierced. Your lineage has transcended the mortal coil, 
                        achieving a singularity of blood and aether that will resonate through the ages.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12 text-left">
                        <div className="glass p-6 rounded-2xl border border-white/10">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-4 flex items-center gap-2">
                                <Users size={16} className="text-primary-color" />
                                The Immortal Council
                            </h3>
                            <div className="space-y-4">
                                {councilMembers.map(member => (
                                    <div key={member.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="font-bold">{member.name}</div>
                                        <div className="text-xs px-2 py-0.5 bg-primary-color/20 text-primary-color rounded font-black uppercase">
                                            {member.baseClass}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-4 flex items-center gap-2">
                                    <Shield size={16} className="text-secondary-color" />
                                    Lineage Achievements
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span>Ultimate Floor Reached</span>
                                        <span className="font-bold text-secondary-color">1,000</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span>Council Hierarchy</span>
                                        <span className="font-bold text-primary-color">Established</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span>Aetheric Resonator</span>
                                        <span className="font-bold">Mastered</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-2 text-xs text-muted italic">
                                <MapPin size={14} />
                                Located at the Center of The Pit
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => window.location.reload()}
                        className="btn-primary px-12 py-5 text-xl font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                    >
                        <RefreshCw size={24} />
                        Found New Lineage
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VictoryScreen;
