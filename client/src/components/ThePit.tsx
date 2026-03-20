import React, { useState, useEffect, useCallback } from 'react';
import { 
  Skull, Swords, MapPin, Loader2, Play, ChevronRight, 
  Zap
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { CombatEvent } from '../../../shared/src/combat';

const ThePit: React.FC = () => {
    const { 
        currentFloor, biome, party, mainCharacter,
        processCombatTick, addEvents
    } = useGameStore();

    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [floorReport, setFloorReport] = useState<any>(null);
    const [currentRoomIdx, setCurrentRoomIdx] = useState(0);
    const [displayedEvents, setDisplayedEvents] = useState<CombatEvent[]>([]);
    const [turnIndex, setTurnIndex] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);

    const activeRoom = floorReport?.roomResults?.[currentRoomIdx];

    const startDescent = async () => {
        setLoading(true);
        try {
            const res = await processCombatTick();
            if (res && res.floorData) {
                setFloorReport(res);
                setCurrentRoomIdx(0);
                setIsActive(true);
            }
        } catch (error) {
            console.error('Descent failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextRoom = useCallback(() => {
        if (!floorReport) return;
        if (currentRoomIdx < floorReport.roomResults.length - 1) {
            setCurrentRoomIdx(prev => prev + 1);
            setDisplayedEvents([]);
            setTurnIndex(0);
        } else {
            // Floor Cleared!
            setIsActive(false);
            setFloorReport(null);
        }
    }, [currentRoomIdx, floorReport]);

    useEffect(() => {
        if (!activeRoom || !activeRoom.combatResult) {
            setIsSimulating(false);
            return;
        }

        setIsSimulating(true);
        const events = activeRoom.combatResult.events;
        if (turnIndex < events.length) {
            const timer = setTimeout(() => {
                const newEvent = events[turnIndex];
                setDisplayedEvents(prev => [...prev, newEvent]);
                addEvents([newEvent]); // Sync to global feed
                setTurnIndex(prev => prev + 1);
            }, 800); // Batched/Interval feel
            return () => clearTimeout(timer);
        } else {
            setIsSimulating(false);
        }
    }, [activeRoom, turnIndex, addEvents]);

    if (!isActive) {
        return (
            <div className="space-y-6 md:space-y-8 animate-fade-in max-w-2xl mx-auto py-6 md:py-10">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-primary-color/10 border-2 border-primary-color/30 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-2xl shadow-primary-color/20">
                        <Skull size={32} className="text-primary-color animate-pulse md:hidden" />
                        <Skull size={40} className="text-primary-color animate-pulse hidden md:block" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-gradient">The Pit</h2>
                    <p className="text-muted text-sm md:text-lg max-w-md mx-auto px-4">The descent is deep, and the darkness is absolute. Only the bravest Bondis dare enter the abyss.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 px-4">
                    <div className="glass p-4 md:p-6 rounded-2xl border border-white/5 text-center">
                        <MapPin className="mx-auto mb-1 md:mb-2 text-primary-color" size={16} />
                        <div className="text-[8px] md:text-[10px] font-black uppercase text-white/30 tracking-widest">Active Biome</div>
                        <div className="text-sm md:text-xl font-black">{biome}</div>
                    </div>
                    <div className="glass p-4 md:p-6 rounded-2xl border border-white/5 text-center">
                        <Skull className="mx-auto mb-1 md:mb-2 text-danger-color" size={16} />
                        <div className="text-[8px] md:text-[10px] font-black uppercase text-white/30 tracking-widest">Target Floor</div>
                        <div className="text-sm md:text-xl font-black">{currentFloor}</div>
                    </div>
                </div>

                <div className="px-4">
                    <button 
                      onClick={startDescent} 
                      disabled={loading || party.length === 0}
                      className="w-full py-4 md:py-6 bg-primary-color hover:bg-primary-color/80 text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[.1em] md:tracking-[.2em] text-lg md:text-xl shadow-2xl shadow-primary-color/40 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 md:gap-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                        {party.length === 0 ? "No Party Assigned" : "COMMENCE DESCENT"}
                    </button>
                </div>

                {party.length === 0 && (
                    <p className="text-center text-[10px] text-danger-color font-bold uppercase tracking-widest px-4">You cannot descend without followers. Visit the Tavern first.</p>
                )}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col p-4 md:p-10 animate-fade-in overflow-hidden">
            {/* Header / Room Progress */}
            <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col min-h-0">
                <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 md:mb-10 pb-4 md:pb-6 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary-color flex items-center justify-center font-black italic text-lg md:text-xl">E</div>
                        <div>
                           <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase">Floor {currentFloor}</h2>
                           <span className="text-[8px] md:text-[10px] font-black text-primary-color uppercase tracking-widest">Descent Sequence</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-1 md:gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {floorReport.roomResults.map((_: any, i: number) => (
                            <div 
                              key={i} 
                              className={`h-1 md:h-1.5 min-w-[12px] md:min-w-[40px] rounded-full transition-all flex-1 md:flex-none ${
                                i === currentRoomIdx ? 'bg-primary-color shadow-[0_0_10px_var(--primary-glow)]' : 
                                i < currentRoomIdx ? 'bg-primary-color/40' : 'bg-white/10'
                              }`}
                            />
                        ))}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-10 space-y-6">
                    {/* Scene / Description */}
                    <div className="shrink-0">
                        <div className="glass p-6 md:p-12 rounded-3xl md:rounded-[3rem] border border-white/10 relative overflow-hidden bg-gradient-to-br from-primary-color/5 to-transparent">
                             <div className="absolute top-0 right-0 p-6 md:p-10 opacity-5">
                                 {activeRoom?.type === 'Encounter' ? <Swords size={120} className="md:w-[200px] md:h-[200px]" /> : <MapPin size={120} className="md:w-[200px] md:h-[200px]" />}
                             </div>
                             
                             <div className="relative z-10 max-w-3xl">
                                <div className="text-[8px] md:text-[10px] font-black uppercase text-primary-color tracking-[0.4em] mb-2 md:mb-4">Location Identified</div>
                                <h3 className="text-2xl md:text-5xl font-black italic tracking-tighter mb-4 md:mb-6 text-glow">{activeRoom?.type} <span className="text-white/30 ml-2">#{currentRoomIdx + 1}</span></h3>
                                <p className="text-base md:text-2xl text-muted leading-relaxed font-light italic">"{activeRoom?.description}"</p>
                             </div>

                             {!(activeRoom?.combatResult) && !isSimulating && (
                                <div className="mt-8 md:mt-12">
                                    <button onClick={nextRoom} className="btn-primary w-full md:w-auto px-12 py-4 md:py-5 text-lg md:text-xl flex items-center justify-center gap-2 group">
                                        Exploration Complete <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                             )}

                             {activeRoom?.combatResult && !isSimulating && turnIndex >= activeRoom.combatResult.events.length && (
                                <div className="mt-8 md:mt-12 flex flex-col items-start gap-4 md:gap-6 animate-fade-in">
                                    <div className="flex gap-2">
                                        <div className="px-3 md:px-6 py-1.5 md:py-3 bg-secondary-color/20 border border-secondary-color/40 rounded-xl md:rounded-2xl text-secondary-color font-black uppercase text-[10px] md:text-sm tracking-widest">AREA SECURED</div>
                                        {activeRoom.combatResult.victory && <div className="px-3 md:px-6 py-1.5 md:py-3 bg-accent-color/20 border border-accent-color/40 rounded-xl md:rounded-2xl text-accent-color font-black uppercase text-[10px] md:text-sm tracking-widest">VICTORY</div>}
                                    </div>
                                    <button onClick={nextRoom} className="btn-primary w-full md:w-auto px-12 py-4 md:py-5 text-lg md:text-xl flex items-center justify-center gap-2 group">
                                        Press On <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                             )}
                        </div>
                    </div>

                    {/* Battle Visualization (When Active) */}
                    {(activeRoom?.combatResult || isSimulating) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-slide-up">
                            {/* Party Status */}
                            <div className="glass p-4 md:p-6 rounded-2xl border border-white/5 space-y-4">
                                <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5 pb-2">THE VANGUARD</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                    {[mainCharacter, ...party].filter(Boolean).map((member: any) => (
                                        <div key={member.id} className="space-y-1 md:space-y-2">
                                            <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-tighter">
                                                <span>{member.name}</span>
                                                <span className={member.hp <= 0 ? 'text-danger-color' : 'text-primary-color'}>{member.hp} HP</span>
                                            </div>
                                            <div className="h-1 md:h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                  className={`h-full transition-all duration-500 ${member.hp <= 0 ? 'bg-danger-color' : 'bg-primary-color'}`}
                                                  style={{ width: `${(member.hp / member.maxHp) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Combat Log Mini */}
                            <div className="glass p-4 md:p-6 rounded-2xl border border-white/5 flex flex-col h-[180px] md:h-[220px]">
                                <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-warning-color/50 border-b border-white/5 pb-2 flex items-center gap-2">
                                    <Zap size={10} /> TACTICAL FEED
                                </h4>
                                <div className="flex-1 overflow-y-auto mt-3 md:mt-4 space-y-2 custom-scrollbar pr-2">
                                    {displayedEvents.slice(-5).map((ev, i) => (
                                        <div key={i} className="text-[10px] md:text-[11px] flex gap-2 animate-slide-right">
                                            <span className="text-white/30 font-mono">[{ev.turn}]</span>
                                            <span className="font-bold text-white/90">
                                                {ev.attackerName} vs {ev.defenderName}:
                                                {ev.damage > 0 ? <span className="text-danger-color ml-1">-{ev.damage}</span> : <span className="text-muted ml-1">MISS</span>}
                                            </span>
                                        </div>
                                    ))}
                                    {isSimulating && (
                                        <div className="flex items-center gap-2 text-[10px] text-primary-color font-black animate-pulse opacity-50 uppercase tracking-widest">
                                            <Loader2 size={12} className="animate-spin" /> Battle Raging...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-[-1] opacity-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-primary-color/20 rounded-full blur-[100px] md:blur-[200px] animate-pulse"></div>
            </div>
        </div>
    );
};

export default ThePit;
