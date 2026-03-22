import React from 'react';
import { Sword, Shield, Zap, User } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const VanguardMonitor: React.FC = () => {
    const { party, mainCharacter } = useGameStore();
    
    const fullParty = [mainCharacter, ...party].filter((m): m is NonNullable<typeof m> => m !== null);

    return (
        <div className="flex flex-col h-full bg-black/20 backdrop-blur-md border-l border-white/5 p-3 space-y-3 overflow-y-auto custom-scrollbar">
            {fullParty.map((member) => (
                <div key={member.id} className="glass p-2.5 border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded flex items-center justify-center ${member.id === 'player-mc' ? 'bg-accent-color/20' : 'bg-white/5'}`}>
                                <User size={10} className={member.id === 'player-mc' ? 'text-accent-color' : 'text-white/40'} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tight truncate w-20">{member.name}</span>
                        </div>
                        <span className="text-[9px] text-white/30">L{member.level}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary-color transition-all duration-500" 
                                style={{ width: `${Math.min(100, (member.hp / member.maxHp) * 100)}%` }} 
                            />
                        </div>
                        <span className="text-[8px] text-white/40 w-12 text-right">{Math.floor(member.hp)}/{Math.floor(member.maxHp)}</span>
                    </div>

                    <div className="flex gap-1">
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${member.weapon ? 'text-accent-color' : 'text-white/10'}`}>
                            <Sword size={8} />
                        </div>
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${member.armor ? 'text-secondary-color' : 'text-white/10'}`}>
                            <Shield size={8} />
                        </div>
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${member.accessory ? 'text-primary-color' : 'text-white/10'}`}>
                            <Zap size={8} />
                        </div>
                    </div>
                </div>
            ))}

            {fullParty.length === 0 && (
                <div className="py-6 text-center text-white/10">
                    <User size={20} className="mx-auto mb-1 opacity-20" />
                    <p className="text-[9px] font-black uppercase">No Vanguard</p>
                </div>
            )}
        </div>
    );
};

export default VanguardMonitor;
