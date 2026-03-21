import React from 'react';
import { Shield, Sword, Zap, User } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const VanguardMonitor: React.FC = () => {
    const { party, mainCharacter } = useGameStore();
    
    // Type-safe filter for the party including the main character
    const fullParty = [mainCharacter, ...party].filter((m): m is NonNullable<typeof m> => m !== null);

    return (
        <div className="flex flex-col h-full bg-black/20 backdrop-blur-md border-l border-white/5 p-4 space-y-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Vanguard Monitor</h3>
                <span className="badge bg-primary-color/10 text-primary-color border-primary-color/20">{fullParty.length}/4</span>
            </div>

            <div className="space-y-4">
                {fullParty.map((member) => (
                    <div key={member.id} className="glass p-3 border-white/5 space-y-3 group hover:border-primary-color/30 transition-colors">
                        <div className="flex justify-between items-center pr-1">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center">
                                    <User size={12} className={member.id === 'player-mc' ? 'text-accent-color' : 'text-primary-color'} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight truncate w-24">{member.name}</span>
                            </div>
                            <span className="text-[9px] font-bold text-white/30 italic">L{member.level}</span>
                        </div>

                        {/* HP / MP Mini bars */}
                        <div className="space-y-1.5 px-0.5">
                            <div className="flex justify-between text-[8px] font-black uppercase text-white/20">
                                <span>Health</span>
                                <span className="text-white/60">{Math.floor(member.hp)}/{Math.floor(member.maxHp)}</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary-color transition-all duration-500" 
                                    style={{ width: `${Math.min(100, (member.hp / member.maxHp) * 100)}%` }} 
                                />
                            </div>
                        </div>

                        {/* Equipment Icons */}
                        <div className="flex gap-2 px-1">
                            <div className={`p-1 rounded-md border ${member.weapon ? 'border-accent-color/40 bg-accent-color/5 text-accent-color' : 'border-white/5 text-white/10'}`} title={member.weapon?.name || 'No Weapon'}>
                                <Sword size={10} />
                            </div>
                            <div className={`p-1 rounded-md border ${member.armor ? 'border-secondary-color/40 bg-secondary-color/5 text-secondary-color' : 'border-white/5 text-white/10'}`} title={member.armor?.name || 'No Armor'}>
                                <Shield size={10} />
                            </div>
                            <div className={`p-1 rounded-md border ${member.accessory ? 'border-primary-color/40 bg-primary-color/5 text-primary-color' : 'border-white/5 text-white/10'}`} title={member.accessory?.name || 'No Accessory'}>
                                <Zap size={10} />
                            </div>
                        </div>
                    </div>
                ))}

                {fullParty.length === 0 && (
                    <div className="py-10 text-center text-white/10">
                        <User size={24} className="mx-auto mb-2 opacity-20" />
                        <p className="text-[9px] font-black uppercase tracking-widest">No Vanguard Assigned</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VanguardMonitor;
