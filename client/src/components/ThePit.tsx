import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as Lucide from 'lucide-react';
import { useGameStore } from '../store/gameStore';

// Defensive interface for local type safety
interface PitCombatEvent {
    id: string;
    turn: number;
    attackerName: string;
    defenderName: string;
    damage: number;
    isCrit: boolean;
    isMiss: boolean;
    remainingHp: number;
    banter?: string;
    emojiTag?: string;
}

const ThePit: React.FC = () => {
    const { 
        currentFloor, biome, party, mainCharacter,
        processCombatTick, addEvents
    } = useGameStore();

    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [floorReport, setFloorReport] = useState<any>(null);
    const [currentRoomIdx, setCurrentRoomIdx] = useState(0);
    const [displayedEvents, setDisplayedEvents] = useState<PitCombatEvent[]>([]);
    const [turnIndex, setTurnIndex] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);
    const [localPartyHP, setLocalPartyHP] = useState<Record<string, number>>({});

    const activeRoom = useMemo(() => {
        const room = floorReport?.roomResults?.[currentRoomIdx];
        if (room) {
            console.log('[PIT] Room Data:', room);
            // If room has combat and we haven't started simulating or showing events,
            // we should technically refresh localPartyHP if it's the START of the floor.
            // But let's handle initialization when floorReport is first set.
        }
        return room;
    }, [floorReport, currentRoomIdx]);

    const startDescent = async () => {
        setLoading(true);
        // Pre-capture current HP states for visual simulation
        const initialHPs: Record<string, number> = {};
        if (mainCharacter) initialHPs[mainCharacter.id] = mainCharacter.hp;
        party.forEach(m => { initialHPs[m.id] = m.hp; });
        setLocalPartyHP(initialHPs);

        try {
            const res = await processCombatTick();
            if (res && res.floorData && Array.isArray(res.roomResults)) {
                console.log('[PIT] Raw Floor Report:', res);
                setFloorReport(res);
                setCurrentRoomIdx(0);
                setTurnIndex(0);
                setDisplayedEvents([]);
                setIsSimulating(false);
                setIsActive(true);
            } else {
                console.error('Invalid response from server:', res);
                alert('Descent calculation failed: Invalid response from server.');
            }
        } catch (error: any) {
            console.error('Descent failed:', error);
            alert(`Descent failed: ${error.message || 'Unknown error'}`);
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
            setIsSimulating(false);
        } else {
            setIsActive(false);
            setFloorReport(null);
        }
    }, [currentRoomIdx, floorReport]);

    // Combat Simulation Effect
    useEffect(() => {
        if (!activeRoom || !activeRoom.combatResult) {
            setIsSimulating(false);
            return;
        }

        const events = activeRoom.combatResult.events || [];
        if (events.length === 0) {
            setIsSimulating(false);
            if (displayedEvents.length === 0) {
                setDisplayedEvents([{
                    id: `system-${currentRoomIdx}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    turn: 0,
                    attackerName: 'SYSTEM',
                    defenderName: 'AREA',
                    damage: 0,
                    isCrit: false,
                    isMiss: true,
                    remainingHp: 0,
                    banter: activeRoom?.description || 'EXPLORATION IN PROGRESS.',
                    emojiTag: '🔍'
                } as any]);
            }
            return;
        }

        if (turnIndex < events.length) {
            // Only set once to avoid re-triggering effect
            setIsSimulating(true);
            
            const timer = setTimeout(() => {
                const newEvent = events[turnIndex];
                if (!newEvent) {
                    setTurnIndex(prev => prev + 1);
                    return;
                }

                setDisplayedEvents(prev => {
                    if (prev.some(e => e.id === newEvent.id)) return prev;
                    return [...prev, newEvent];
                });

                // Update local party HP if they are the defender
                if (turnIndex === events.length - 1) {
                    console.log(`[PIT-SIM] Room ${currentRoomIdx} - Adding all ${events.length} events to global store`);
                    addEvents(events);
                }

                setTurnIndex(prev => prev + 1);
            }, 800);
            return () => clearTimeout(timer);
        } else {
            setIsSimulating(false);
        }
    }, [activeRoom, turnIndex, currentRoomIdx, mainCharacter?.id, party.length, addEvents]);

    // Auto-Progression Effect
    useEffect(() => {
        if (!isActive || isSimulating || !floorReport || !activeRoom) return;

        const events = activeRoom.combatResult?.events || [];
        const isCombatRoom = activeRoom.type === 'Encounter';
        const combatFinished = isCombatRoom && events.length > 0 && turnIndex >= events.length;
        const noCombatEvents = events.length === 0 && displayedEvents.length > 0;
        const victory = activeRoom.combatResult?.victory ?? true;

        if ((combatFinished && victory) || noCombatEvents) {
            if (currentRoomIdx < floorReport.roomResults.length - 1) {
                console.log(`[PIT-AUTO] Advancing from room ${currentRoomIdx + 1}`);
                const timer = setTimeout(() => {
                    nextRoom();
                }, isCombatRoom ? 3000 : 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [isActive, isSimulating, activeRoom, currentRoomIdx, floorReport, nextRoom, turnIndex, displayedEvents.length]);

    if (!isActive) {
        return (
            <div className="space-y-6 md:space-y-8 animate-fade-in max-w-2xl mx-auto py-6 md:py-10">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-primary-color/10 border-2 border-primary-color/30 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-2xl shadow-primary-color/20">
                        <Lucide.Skull size={32} className="text-primary-color animate-pulse md:hidden" />
                        <Lucide.Skull size={40} className="text-primary-color animate-pulse hidden md:block" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-gradient">The Pit</h2>
                    <p className="text-muted text-sm md:text-lg max-w-md mx-auto px-4">Abyssal depths await. Secure every sector.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 px-4">
                    <div className="glass p-4 md:p-6 rounded-2xl border border-white/5 text-center">
                        <Lucide.MapPin className="mx-auto mb-1 md:mb-2 text-primary-color" size={16} />
                        <div className="text-xs font-black uppercase text-white/30 tracking-widest">Active Biome</div>
                        <div className="text-sm md:text-xl font-black">{biome}</div>
                    </div>
                    <div className="glass p-4 md:p-6 rounded-2xl border border-white/5 text-center">
                        <Lucide.Skull className="mx-auto mb-1 md:mb-2 text-danger-color" size={16} />
                        <div className="text-xs font-black uppercase text-white/30 tracking-widest">Target Floor</div>
                        <div className="text-sm md:text-xl font-black">{currentFloor}</div>
                    </div>
                </div>

                <div className="px-4">
                    <button 
                      onClick={startDescent} 
                      disabled={loading || party.length === 0}
                      className="w-full py-4 md:py-6 bg-primary-color hover:bg-primary-color/80 text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                    >
                        {loading ? <Lucide.Loader2 className="animate-spin" /> : <Lucide.Play fill="currentColor" />}
                        {party.length === 0 ? "No Party Assigned" : "COMMENCE DESCENT"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl pt-4 md:pt-10 px-4 md:px-10 animate-fade-in overflow-hidden flex flex-col">
            <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-color flex items-center justify-center font-black italic text-xl">E</div>
                        <div>
                           <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase">Floor {currentFloor}</h2>
                           <span className="text-[8px] md:text-[10px] font-black text-primary-color uppercase tracking-widest">Descent Sequence</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 flex-1 mx-8 overflow-x-auto justify-center">
                        {(floorReport?.roomResults || []).map((room: any, idx: number) => (
                            <div 
                              key={room.roomId || `room-${idx}`} 
                              className={`h-1.5 min-w-[30px] rounded-full transition-all ${
                                idx === currentRoomIdx ? 'bg-primary-color shadow-[0_0_10px_var(--primary-glow)] w-[60px]' : 
                                idx < currentRoomIdx ? 'bg-primary-color/40' : 'bg-white/10'
                              }`}
                            />
                        ))}
                    </div>

                    <button 
                        onClick={() => { setIsActive(false); setFloorReport(null); }}
                        className="p-2 md:p-3 hover:bg-white/10 rounded-xl text-muted hover:text-white transition-all flex items-center gap-2"
                    >
                        <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-primary-color">Retreat</span>
                        <Lucide.X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 space-y-6">
                    {/* Scene / Description */}
                    <div className="glass p-6 md:p-10 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-primary-color/5 to-transparent shrink-0">
                         <div className="absolute top-0 right-0 p-8 opacity-5">
                             {activeRoom?.type === 'Encounter' ? <Lucide.Swords size={150} /> : <Lucide.MapPin size={150} />}
                         </div>
                         <div className="relative z-10 max-w-3xl">
                            <h3 className="text-2xl md:text-4xl font-black italic tracking-tighter mb-4 text-glow">{activeRoom?.type} <span className="text-white/30 ml-2">#{currentRoomIdx + 1}</span></h3>
                            <p className="text-base md:text-xl text-muted leading-relaxed font-light italic">"{activeRoom?.description}"</p>
                            
                            {!isSimulating && (
                                <div className="mt-8 flex flex-col items-start gap-4">
                                    {( !activeRoom?.combatResult || turnIndex >= (activeRoom.combatResult.events?.length ?? 0)) && (
                                        <button 
                                            onClick={nextRoom} 
                                            className="btn-primary px-10 py-4 text-lg flex items-center gap-2 group shadow-xl shadow-primary-color/20"
                                        >
                                            {currentRoomIdx < (floorReport?.roomResults?.length || 0) - 1 ? 'Press On' : 'Surface / Return'} 
                                            <Lucide.ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            )}
                         </div>
                    </div>

                    {/* Battle Visualization */}
                    {(activeRoom?.combatResult || isSimulating) && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
                            {/* Party Status */}
                            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-color border-b border-white/5 pb-2 flex items-center gap-2">
                                    <Lucide.Zap size={10} /> THE VANGUARD
                                </h4>
                                <div className="space-y-4">
                                    {[mainCharacter, ...party].filter(Boolean).map((member: any, i: number) => {
                                        const currentHP = localPartyHP[member.id] ?? member.hp;
                                        return (
                                            <div key={member.id || `member-${i}`} className="space-y-1">
                                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                                    <span className="text-white/40">{member.name}</span>
                                                    <span className={currentHP <= 0 ? 'text-danger-color' : 'text-primary-color'}>{Math.max(0, Math.floor(currentHP || 0))} HP</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                    className={`h-full transition-all duration-500 ${currentHP <= 0 ? 'bg-danger-color' : 'bg-primary-color'}`}
                                                    style={{ width: `${(Math.max(0, currentHP || 0) / (member.maxHp || 100)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Hostiles Status */}
                            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-danger-color border-b border-white/5 pb-2 flex items-center gap-2">
                                    <Lucide.Skull size={10} /> HOSTILES DETECTED
                                </h4>
                                <div className="space-y-4">
                                    {(activeRoom?.enemies || activeRoom?.combatResult?.enemies || []).map((enemy: any, i: number) => {
                                        const lastEvent = [...displayedEvents].reverse().find(ev => ev.defenderName === enemy.name);
                                        const currentHP = lastEvent ? lastEvent.remainingHp : (enemy.hp || 0);

                                        return (
                                            <div key={enemy.id || `enemy-${i}`} className="space-y-1">
                                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                                    <span className="text-white/40">{enemy.name}</span>
                                                    <span className={currentHP <= 0 ? 'text-danger-color/50' : 'text-danger-color'}>{Math.max(0, Math.floor(currentHP || 0))} HP</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                      className={`h-full transition-all duration-500 ${currentHP <= 0 ? 'bg-white/10' : 'bg-danger-color/60'}`}
                                                      style={{ width: `${(Math.max(0, currentHP || 0) / (enemy.maxHp || 100)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tactical Feed */}
                            <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col h-[250px] lg:h-full min-h-[250px]">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-warning-color/50 border-b border-white/5 pb-2 flex items-center gap-2">
                                    <Lucide.Zap size={10} /> TACTICAL LOG
                                </h4>
                                <div className="flex-1 overflow-y-auto mt-4 space-y-2 custom-scrollbar pr-2">
                                    {(displayedEvents || []).slice(-8).map((ev, i) => (
                                        <div key={ev.id || `ev-${i}`} className="text-[11px] flex gap-2 animate-slide-right items-start">
                                            <span className="text-white/20 font-mono shrink-0">[{ev.turn}]</span>
                                            <span className="font-bold text-white/90">
                                                {ev.attackerName} vs {ev.defenderName}:
                                                {ev.damage > 0 ? <span className="text-danger-color ml-1">-{ev.damage}</span> : <span className="text-muted ml-1"> MISS</span>}
                                            </span>
                                        </div>
                                    ))}
                                    {isSimulating && (
                                        <div className="flex items-center gap-2 text-[10px] text-primary-color font-black animate-pulse opacity-50 mt-4 uppercase tracking-widest">
                                            <Lucide.Loader2 size={12} className="animate-spin" /> Battle Raging...
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-color/20 rounded-full blur-[200px] animate-pulse"></div>
            </div>
        </div>
    );
};

export default ThePit;
