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
            <div className="space-y-8 animate-fade-in max-w-2xl mx-auto py-10">
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-primary-color/10 border-2 border-primary-color/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-color/20">
                        <Skull size={40} className="text-primary-color animate-pulse" />
                    </div>
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase text-gradient">The Pit</h2>
                    <p className="text-muted text-lg max-w-md mx-auto">The descent is deep, and the darkness is absolute. Only the bravest Bondis dare enter the abyss.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-6 rounded-2xl border border-white/5 text-center">
                        <MapPin className="mx-auto mb-2 text-primary-color" size={20} />
                        <div className="text-[10px] font-black uppercase text-white/30 tracking-widest">Active Biome</div>
                        <div className="text-xl font-black">{biome}</div>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/5 text-center">
                        <Skull className="mx-auto mb-2 text-danger-color" size={20} />
                        <div className="text-[10px] font-black uppercase text-white/30 tracking-widest">Target Floor</div>
                        <div className="text-xl font-black">{currentFloor}</div>
                    </div>
                </div>

                <button 
                  onClick={startDescent} 
                  disabled={loading || party.length === 0}
                  className="w-full py-6 bg-primary-color hover:bg-primary-color/80 text-white rounded-[2rem] font-black uppercase tracking-[.2em] text-xl shadow-2xl shadow-primary-color/40 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-4"
                >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <Play size={24} fill="currentColor" />}
                    {party.length === 0 ? "No Party Assigned" : "COMMENCE DESCENT"}
                </button>

                {party.length === 0 && (
                    <p className="text-center text-xs text-danger-color font-bold uppercase tracking-widest">You cannot descend without followers. Visit the Tavern first.</p>
                )}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col p-4 md:p-10 animate-fade-in overflow-hidden">
            {/* Header / Room Progress */}
            <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
                <header className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-color flex items-center justify-center font-black italic text-xl">E</div>
                        <div>
                           <h2 className="text-2xl font-black tracking-tighter uppercase">Floor {currentFloor}</h2>
                           <span className="text-[10px] font-black text-primary-color uppercase tracking-widest">Depth Penetration Sequence</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        {floorReport.roomResults.map((_: any, i: number) => (
                            <div 
                              key={i} 
                              className={`w-10 h-1.5 rounded-full transition-all ${
                                i === currentRoomIdx ? 'bg-primary-color shadow-[0_0_10px_var(--primary-glow)] w-16' : 
                                i < currentRoomIdx ? 'bg-primary-color/40' : 'bg-white/10'
                              }`}
                            />
                        ))}
                    </div>
                </header>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Scene / Description */}
                    <div className="lg:col-span-12 xl:col-span-12">
                        <div className="glass p-12 rounded-[3rem] border border-white/10 relative overflow-hidden bg-gradient-to-br from-primary-color/5 to-transparent">
                             <div className="absolute top-0 right-0 p-10 opacity-5">
                                 {activeRoom?.type === 'Encounter' ? <Swords size={200} /> : <MapPin size={200} />}
                             </div>
                             
                             <div className="relative z-10 max-w-3xl">
                                <div className="text-[10px] font-black uppercase text-primary-color tracking-[0.4em] mb-4">Location Identified</div>
                                <h3 className="text-5xl font-black italic tracking-tighter mb-6 text-glow">{activeRoom?.type} - Room {currentRoomIdx + 1}</h3>
                                <p className="text-2xl text-muted leading-relaxed font-light italic">"{activeRoom?.description}"</p>
                             </div>

                             {!(activeRoom?.combatResult) && !isSimulating && (
                                <div className="mt-12 flex items-center gap-6">
                                    <button onClick={nextRoom} className="btn-primary px-12 py-5 text-xl flex items-center gap-2 group">
                                        Exploration Complete <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                             )}

                             {activeRoom?.combatResult && !isSimulating && turnIndex >= activeRoom.combatResult.events.length && (
                                <div className="mt-12 flex flex-col items-start gap-6 animate-fade-in">
                                    <div className="flex gap-4">
                                        <div className="px-6 py-3 bg-secondary-color/20 border border-secondary-color/40 rounded-2xl text-secondary-color font-black uppercase text-sm">AREA SECURED</div>
                                        {activeRoom.combatResult.victory && <div className="px-6 py-3 bg-accent-color/20 border border-accent-color/40 rounded-2xl text-accent-color font-black uppercase text-sm">VICTORY</div>}
                                    </div>
                                    <button onClick={nextRoom} className="btn-primary px-12 py-5 text-xl flex items-center gap-2 group">
                                        Press On <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                             )}
                        </div>
                    </div>

                    {/* Battle Visualization (When Active) */}
                    {(activeRoom?.combatResult || isSimulating) && (
                        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
                            {/* Party Status */}
                            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5 pb-2">THE VANGUARD</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {[mainCharacter, ...party].filter(Boolean).map((member: any) => (
                                        <div key={member.id} className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                                                <span>{member.name}</span>
                                                <span className={member.hp <= 0 ? 'text-danger-color' : 'text-primary-color'}>{member.hp} HP</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
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
                            <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col h-[200px]">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-warning-color/50 border-b border-white/5 pb-2 flex items-center gap-2">
                                    <Zap size={10} /> TACTICAL FEED
                                </h4>
                                <div className="flex-1 overflow-y-auto mt-4 space-y-2 custom-scrollbar pr-2">
                                    {displayedEvents.slice(-5).map((ev, i) => (
                                        <div key={i} className="text-[11px] flex gap-2 animate-slide-right">
                                            <span className="text-white/30 font-mono">[{ev.turn}]</span>
                                            <span className="font-bold text-white/90">
                                                {ev.emojiTag} {ev.attackerName} vs {ev.defenderName} :
                                                {ev.damage > 0 ? <span className="text-danger-color ml-1">-{ev.damage}</span> : <span className="text-muted ml-1">MISS</span>}
                                            </span>
                                        </div>
                                    ))}
                                    {isSimulating && (
                                        <div className="flex items-center gap-2 text-xs text-primary-color font-black animate-pulse opacity-50 uppercase tracking-widest">
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
            <div className="absolute inset-0 z-[-1] opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-color/20 rounded-full blur-[200px] animate-pulse"></div>
            </div>
        </div>
    );
};

export default ThePit;
