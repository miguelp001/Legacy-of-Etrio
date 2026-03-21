import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface PitCombatEvent {
    id: string;
    turn: number;
    attackerName: string;
    defenderName: string;
    attackerId: string;
    defenderId: string;
    damage: number;
    isCrit: boolean;
    isMiss: boolean;
    remainingHp: number;
    banter?: string;
    emojiTag?: string;
}

const EVENT_TICK_MS = 600;
const AUTO_PROGRESS_MS = 2000;

const ThePit: React.FC = () => {
    const { currentFloor, biome, party, mainCharacter, processCombatTick, addEvents, setLocation } = useGameStore();

    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [floorReport, setFloorReport] = useState<any>(null);
    const [currentRoomIdx, setCurrentRoomIdx] = useState(0);
    const [displayedEvents, setDisplayedEvents] = useState<PitCombatEvent[]>([]);
    const [turnIndex, setTurnIndex] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const activeRoom = floorReport?.roomResults?.[currentRoomIdx];
    const roomEvents = activeRoom?.combatResult?.events || [];
    const hasCombat = activeRoom?.combatResult != null;
    const totalRooms = floorReport?.roomResults?.length || 0;
    const isLastRoom = currentRoomIdx >= totalRooms - 1;
    const isBossRoom = activeRoom?.type === 'Boss';
    const isVictory = activeRoom?.combatResult?.victory ?? true;
    const combatDone = !isSimulating && turnIndex >= roomEvents.length;

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
        };
    }, []);

    const clearTimers = useCallback(() => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; }
    }, []);

    const startDescent = async () => {
        setLoading(true);
        clearTimers();
        try {
            const res = await processCombatTick();
            if (res?.floorData?.rooms?.length) {
                setFloorReport(res);
                setCurrentRoomIdx(0);
                setDisplayedEvents([]);
                setTurnIndex(0);
                setIsSimulating(false);
                setIsActive(true);
            }
        } catch (err: any) {
            console.error('[PIT] Descent failed:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const nextRoom = useCallback(() => {
        clearTimers();
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
    }, [currentRoomIdx, floorReport, clearTimers]);

    const exitPit = useCallback(() => {
        clearTimers();
        setIsActive(false);
        setFloorReport(null);
        setDisplayedEvents([]);
        setTurnIndex(0);
    }, [clearTimers]);

    useEffect(() => {
        clearTimers();
        setDisplayedEvents([]);
        setTurnIndex(0);

        if (!hasCombat || roomEvents.length === 0) {
            setIsSimulating(false);
            return;
        }

        setIsSimulating(true);

        const tick = () => {
            setTurnIndex(prev => {
                if (prev >= roomEvents.length) {
                    setIsSimulating(false);
                    if (timerRef.current) clearInterval(timerRef.current);
                    return prev;
                }
                const event = roomEvents[prev];
                if (event) {
                    setDisplayedEvents(cur => {
                        if (cur.some(e => e.id === event.id)) return cur;
                        return [...cur.slice(-20), event];
                    });
                    if (prev === roomEvents.length - 1) {
                        addEvents(roomEvents);
                    }
                }
                return prev + 1;
            });
        };

        timerRef.current = setInterval(tick, EVENT_TICK_MS);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [currentRoomIdx, activeRoom?.roomId, clearTimers, addEvents, hasCombat, roomEvents.length]);

    useEffect(() => {
        if (!isActive || isSimulating || !activeRoom || !floorReport) return;

        const shouldProgress = hasCombat 
            ? (roomEvents.length > 0 && turnIndex >= roomEvents.length && isVictory)
            : true;

        if (shouldProgress) {
            if (!isLastRoom) {
                autoTimerRef.current = setTimeout(nextRoom, AUTO_PROGRESS_MS);
            } else {
                autoTimerRef.current = setTimeout(exitPit, AUTO_PROGRESS_MS + 1000);
            }
            return () => {
                if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
            };
        }

        // Handle Defeat
        if (!isSimulating && hasCombat && !isVictory && turnIndex >= roomEvents.length) {
            autoTimerRef.current = setTimeout(() => {
                setLocation('Hospital');
                exitPit();
            }, 3000); 
            return () => {
                if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
            };
        }
    }, [isActive, isSimulating, turnIndex, displayedEvents.length, hasCombat, isVictory, isLastRoom, nextRoom, roomEvents.length, activeRoom, floorReport, setLocation, exitPit]);

    const getHP = useCallback((id: string, maxHp: number) => {
        const lastEvent = [...displayedEvents].reverse().find(e => e.defenderId === id);
        return lastEvent ? Math.max(0, lastEvent.remainingHp) : maxHp;
    }, [displayedEvents]);

    if (!isActive) {
        return (
            <div className="w-full h-full min-h-[60vh] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm overflow-auto rounded-[2rem] border border-white/5">
                <div className="w-full max-w-md space-y-8 text-center animate-fade-in py-10">
                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-primary-color/10 border-2 border-primary-color/30 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-primary-color/20">
                            <Lucide.Skull size={32} className="text-primary-color" />
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-gradient">The Pit</h2>
                        <p className="text-muted text-sm uppercase tracking-widest font-bold opacity-60">Floor {currentFloor} • {biome}</p>
                    </div>

                    <div className="glass p-6 rounded-3xl border-white/5 space-y-6">
                        <div className="flex justify-around">
                            <div className="text-center">
                                <div className="text-[10px] uppercase font-black text-white/30 mb-1">Dread Level</div>
                                <div className="text-2xl font-black">{currentFloor * 10}</div>
                            </div>
                            <div className="w-px bg-white/10" />
                            <div className="text-center">
                                <div className="text-[10px] uppercase font-black text-white/30 mb-1">Party Size</div>
                                <div className="text-2xl font-black">{party.length + (mainCharacter ? 1 : 0)}</div>
                            </div>
                        </div>
                        
                        <button
                            onClick={startDescent}
                            disabled={loading || party.length === 0}
                            className="w-full py-5 bg-primary-color hover:bg-primary-color/80 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                        >
                            {loading ? <Lucide.Loader2 size={20} className="animate-spin" /> : <Lucide.Play size={20} fill="currentColor" />}
                            {party.length === 0 ? "Empty Party" : "Initiate descent"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const partyMembers = [mainCharacter, ...party].filter(Boolean);
    const enemies = activeRoom?.enemies || [];

    return (
        <div className="w-full bg-[#050505] flex flex-col min-h-[85vh] rounded-[2rem] border border-white/5 overflow-hidden animate-fade-in">
            {/* Unified Mobile & Desktop Active Header */}
            <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 shrink-0 bg-black/30 backdrop-blur-xl gap-4">
                {/* Column 1: Identity */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-color flex items-center justify-center font-black italic text-xl shadow-[0_0_15px_rgba(168,85,247,0.4)]">P</div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase text-gradient leading-none">The Pit</h2>
                        <div className="hidden sm:block text-[10px] text-primary-color font-bold uppercase tracking-[0.3em] mt-1 space-x-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-color animate-pulse"/>
                            <span>Active Operation</span>
                        </div>
                    </div>
                </div>

                {/* Column 2: Tactical Info & Controls */}
                <div className="flex flex-1 sm:flex-none items-center justify-end gap-3 sm:gap-6">
                    <div className="text-right flex flex-col items-end">
                        <div className="text-[10px] sm:text-sm font-black uppercase tracking-tighter leading-none">Floor {currentFloor}</div>
                        <div className="text-[8px] sm:text-[9px] text-white/40 font-bold uppercase tracking-widest mt-0.5">{activeRoom?.type}</div>
                    </div>

                    <div className="flex gap-1 justify-center items-center">
                        {(floorReport?.roomResults || []).map((_: any, idx: number) => (
                            <div key={idx} className={`h-1.5 sm:h-2 rounded-full transition-all ${idx === currentRoomIdx ? 'w-4 sm:w-8 bg-primary-color shadow-[0_0_10px_rgba(168,85,247,0.5)]' : idx < currentRoomIdx ? 'w-2 sm:w-3 bg-primary-color/30' : 'w-2 sm:w-3 bg-white/10'}`} />
                        ))}
                    </div>

                    <button onClick={exitPit} className="p-2 sm:p-2.5 bg-white/5 rounded-full border border-white/10 active:scale-90 transition-transform hover:bg-white/10 hover:text-white text-white/50 ml-1 sm:ml-2">
                        <Lucide.X size={16} />
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Visual Encounter Area */}
                <div className="h-24 px-4 flex flex-col justify-center border-b border-white/5 bg-gradient-to-b from-primary-color/5 to-transparent">
                    <p className="text-sm text-muted italic leading-tight line-clamp-2 pr-12 relative font-serif">
                        <Lucide.Quote className="absolute -top-1 -left-2 opacity-10" size={24} />
                        {activeRoom?.description || 'Exploring the void...'}
                    </p>
                </div>

                {/* Combat HUD - Optimized for Thumb Zone */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
                    {/* Enemies Section */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-danger-color/60 px-1 italic">Vile Elements</h4>
                        <div className="grid grid-cols-2 gap-3">
                           {enemies.map((e: any, i: number) => {
                               const hp = getHP(e.id, e.maxHp);
                               const pct = (hp / e.maxHp) * 100;
                               return (
                                   <div key={i} className={`glass p-3 border-white/5 transition-opacity ${hp <= 0 ? 'opacity-30' : ''}`}>
                                       <div className="flex justify-between items-center mb-1.5">
                                          <span className="text-[9px] font-black uppercase tracking-tighter truncate w-16">{e.name.split(' ')[0]}</span>
                                          <span className="text-[10px] font-mono text-danger-color">{Math.floor(hp)}</span>
                                       </div>
                                       <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                          <div className="h-full bg-danger-color transition-all duration-500" style={{ width: `${pct}%` }} />
                                       </div>
                                   </div>
                               );
                           })}
                        </div>
                    </div>

                    {/* Party Section */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-color/60 px-1 italic">Vanguard Echoes</h4>
                        <div className="grid grid-cols-2 gap-3">
                           {partyMembers.map((m: any) => {
                               const hp = getHP(m.id, m.maxHp);
                               const pct = (hp / m.maxHp) * 100;
                               return (
                                   <div key={m.id} className={`glass p-3 border-white/5 transition-opacity ${hp <= 0 ? 'opacity-30' : ''}`}>
                                       <div className="flex justify-between items-center mb-1.5">
                                          <span className="text-[9px] font-black uppercase tracking-tighter truncate w-16">{m.name.split(' ')[0]}</span>
                                          <span className="text-[10px] font-mono text-primary-color">{Math.floor(hp)}</span>
                                       </div>
                                       <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                          <div className="h-full bg-primary-color transition-all duration-500" style={{ width: `${pct}%` }} />
                                       </div>
                                   </div>
                               );
                           })}
                        </div>
                    </div>

                     {/* Combat Log */}
                    <div className="glass p-4 border-white/5 bg-black/40 min-h-[120px] shadow-inner">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Aetheric Resonance</span>
                            {isSimulating && <span className="w-1.5 h-1.5 bg-primary-color rounded-full animate-ping" />}
                        </div>
                        <div className="space-y-2">
                            {displayedEvents.slice(-5).map((ev) => (
                                <div key={ev.id} className="animate-fade-in flex gap-3 text-[11px] leading-tight">
                                    <span className="text-white/20 font-mono text-[9px] mt-0.5">{ev.turn}</span>
                                    <p className="text-white/60">
                                        <span dangerouslySetInnerHTML={{ __html: ev.banter?.replace(/\[\[NAME:[^:]+:([^\]]+)\]\]/g, '<span class="text-white/90 font-bold">$1</span>').replace(/\*\*([^*]+)\*\*/g, '<span class="text-danger-color font-bold tracking-widest">$1</span>') || `${ev.attackerName.split(' ')[0]} acts.` }} />
                                    </p>
                                </div>
                            ))}
                            {displayedEvents.length === 0 && <div className="text-center py-4 text-white/10 text-xs italic tracking-widest">Shadows stir...</div>}
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Primary Controls - Thumb Zone Fixed */}
            {combatDone && (
                <footer className="px-4 py-6 border-t border-white/10 bg-black/60 backdrop-blur-2xl shrink-0">
                    <div className="space-y-4">
                        {!isLastRoom && isVictory && (
                            <button
                                onClick={nextRoom}
                                className="w-full py-5 bg-primary-color text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary-color/30 flex items-center justify-center gap-3 active:scale-95 transition-transform"
                            >
                                Press On <Lucide.ChevronRight size={20} />
                            </button>
                        )}
                        {!isVictory && (
                            <button
                                onClick={exitPit}
                                className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform"
                            >
                                Flee <Lucide.ArrowUp size={20} />
                            </button>
                        )}
                        {!isVictory && !isSimulating && (
                            <p className="text-center text-[10px] text-danger-color font-black uppercase tracking-widest animate-pulse">
                                Defeat Imminent... Relocating to Infirmary
                            </p>
                        )}
                    </div>
                </footer>
            )}
        </div>
    );
};

export default ThePit;
