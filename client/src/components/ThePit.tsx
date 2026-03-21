import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { useGameStore } from '../store/gameStore';

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
            : displayedEvents.length > 0;

        if (shouldProgress && !isLastRoom) {
            autoTimerRef.current = setTimeout(nextRoom, AUTO_PROGRESS_MS);
            return () => {
                if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
            };
        }

        // Handle Defeat
        if (!isSimulating && hasCombat && !isVictory && turnIndex >= roomEvents.length) {
            autoTimerRef.current = setTimeout(() => {
                setLocation('Hospital');
                exitPit();
            }, 3000); // Wait 3s so they see the defeat
            return () => {
                if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
            };
        }
    }, [isActive, isSimulating, turnIndex, displayedEvents.length, hasCombat, isVictory, isLastRoom, nextRoom, roomEvents.length, activeRoom, floorReport, setLocation, exitPit]);

    const getHP = useCallback((name: string, maxHp: number) => {
        const lastEvent = [...displayedEvents].reverse().find(e => e.defenderName === name);
        return lastEvent ? Math.max(0, lastEvent.remainingHp) : maxHp;
    }, [displayedEvents]);

    if (!isActive) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl overflow-auto">
                <div className="min-h-full min-h-screen flex items-center justify-center p-4 sm:p-6">
                    <div className="w-full max-w-md space-y-6 text-center">
                        <div className="space-y-3">
                            <div className="w-16 h-16 bg-primary-color/10 border-2 border-primary-color/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary-color/10">
                                <Lucide.Skull size={28} className="text-primary-color" />
                            </div>
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-gradient">The Pit</h2>
                            <p className="text-muted text-sm">Abyssal depths await.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="glass p-3 rounded-xl border border-white/5 text-center">
                                <Lucide.MapPin className="mx-auto mb-1 text-primary-color" size={14} />
                                <div className="text-[10px] font-black uppercase text-white/30 tracking-wider">Biome</div>
                                <div className="text-sm font-bold truncate">{biome}</div>
                            </div>
                            <div className="glass p-3 rounded-xl border border-white/5 text-center">
                                <Lucide.Layers className="mx-auto mb-1 text-danger-color" size={14} />
                                <div className="text-[10px] font-black uppercase text-white/30 tracking-wider">Floor</div>
                                <div className="text-sm font-bold">{currentFloor}</div>
                            </div>
                        </div>

                        <button
                            onClick={startDescent}
                            disabled={loading || party.length === 0}
                            className="w-full py-4 bg-primary-color hover:bg-primary-color/80 text-white rounded-2xl font-black uppercase tracking-wider shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                        >
                            {loading ? (
                                <Lucide.Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Lucide.Play size={18} fill="currentColor" />
                            )}
                            {party.length === 0 ? "No Party" : "Descend"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const partyMembers = [mainCharacter, ...party].filter(Boolean);
    const enemies = activeRoom?.enemies || [];
    const showCombat = hasCombat || isSimulating;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col">
            <header className="flex items-center justify-between px-3 py-2 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-color flex items-center justify-center font-black text-sm">E</div>
                    <div>
                        <div className="text-sm font-bold">Floor {currentFloor}</div>
                        <div className="text-[9px] text-primary-color font-black uppercase tracking-widest">Descent</div>
                    </div>
                </div>

                <div className="flex-1 mx-3 flex gap-1.5 justify-center">
                    {(floorReport?.roomResults || []).map((_: any, idx: number) => (
                        <div
                            key={idx}
                            className={`h-1 rounded-full transition-all ${
                                idx === currentRoomIdx 
                                    ? 'w-8 bg-primary-color' 
                                    : idx < currentRoomIdx 
                                        ? 'w-3 bg-primary-color/40' 
                                        : 'w-3 bg-white/10'
                            }`}
                        />
                    ))}
                </div>

                <button onClick={exitPit} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Lucide.X size={18} className="text-white/50" />
                </button>
            </header>

            <main className="flex-1 overflow-hidden flex flex-col">
                <div className="px-3 py-3 shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            activeRoom?.type === 'Boss' ? 'bg-danger-color/20 text-danger-color' :
                            activeRoom?.type === 'Encounter' ? 'bg-warning-color/20 text-warning-color' :
                            'bg-primary-color/20 text-primary-color'
                        }`}>
                            {activeRoom?.type}
                        </span>
                        <span className="text-[10px] text-white/30 font-mono">
                            Room {currentRoomIdx + 1}/{totalRooms}
                        </span>
                        {isBossRoom && <Lucide.Skull size={12} className="text-danger-color" />}
                    </div>
                    <p className="text-sm text-muted italic leading-snug line-clamp-2">
                        "{activeRoom?.description || '...'}"
                    </p>
                </div>

                {showCombat && (
                    <div className="px-3 shrink-0 space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-white/30 mb-1">
                            <span>Party</span>
                            <span>Enemies</span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
                            {partyMembers.map((m: any) => {
                                const hp = getHP(m.name, m.maxHp);
                                const pct = Math.max(0, (hp / m.maxHp) * 100);
                                return (
                                    <div key={m.id} className="shrink-0 w-24 snap-start">
                                        <div className="flex justify-between text-[10px] font-bold mb-0.5">
                                            <span className="text-white/50 truncate">{m.name.split(' ')[0]}</span>
                                            <span className={hp <= 0 ? 'text-danger-color' : 'text-primary-color'}>
                                                {Math.floor(hp)}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${hp <= 0 ? 'bg-danger-color' : 'bg-primary-color'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="w-px bg-white/10 shrink-0" />

                            {enemies.map((e: any, i: number) => {
                                const hp = getHP(e.name, e.maxHp);
                                const pct = Math.max(0, (hp / e.maxHp) * 100);
                                return (
                                    <div key={i} className="shrink-0 w-24 snap-start">
                                        <div className="flex justify-between text-[10px] font-bold mb-0.5">
                                            <span className="text-white/50 truncate">{e.name.split(' ')[0]}</span>
                                            <span className={hp <= 0 ? 'text-white/30' : 'text-danger-color'}>
                                                {Math.floor(hp)}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${hp <= 0 ? 'bg-white/20' : 'bg-danger-color/80'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-hidden flex flex-col px-3 pb-3">
                    <div className="flex items-center justify-between shrink-0 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white/30">Combat Log</span>
                        {isSimulating && (
                            <span className="text-[9px] text-primary-color font-black animate-pulse uppercase tracking-wider flex items-center gap-1">
                                <Lucide.Loader2 size={10} className="animate-spin" /> Live
                            </span>
                        )}
                        {!isSimulating && combatDone && (
                            <span className="text-[9px] text-white/30 font-black uppercase tracking-wider">
                                {isVictory ? 'Victory' : 'Defeat'}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar">
                        {displayedEvents.length === 0 && !isSimulating && (
                            <div className="text-center py-8 text-white/30 text-sm">
                                {hasCombat ? 'Awaiting combat...' : 'Exploring...'}
                            </div>
                        )}
                        {displayedEvents.map((ev) => (
                            <div key={ev.id} className="text-[11px] animate-fade-in">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-white/20 font-mono text-[9px] w-5">{ev.turn}</span>
                                    <span className="text-white/60 truncate flex-1">{ev.attackerName}</span>
                                    {ev.damage > 0 && (
                                        <span className="text-danger-color font-bold shrink-0">
                                            -{ev.damage}{ev.isCrit && ' 💥'}
                                        </span>
                                    )}
                                    {ev.isMiss && (
                                        <span className="text-white/30 font-mono text-[9px] shrink-0">MISS</span>
                                    )}
                                </div>
                                {ev.banter && (
                                    <p className="text-white/40 text-[10px] leading-snug mt-0.5 pl-7 line-clamp-2">
                                        {ev.banter.replace(/\[\[NAME:[^:]+:([^\]]+)\]\]/g, '$1')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {combatDone && !isLastRoom && (
                    <div className="px-3 pb-3 shrink-0">
                        <div className="text-[10px] text-center text-white/30 mb-2 animate-pulse">
                            Next room in {AUTO_PROGRESS_MS / 1000}s...
                        </div>
                        <button
                            onClick={nextRoom}
                            className="w-full py-3 bg-primary-color hover:bg-primary-color/80 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all active:scale-98 flex items-center justify-center gap-2"
                        >
                            Press On <Lucide.ChevronRight size={16} />
                        </button>
                    </div>
                )}

                {combatDone && isLastRoom && (
                    <div className="px-3 pb-3 shrink-0">
                        <button
                            onClick={exitPit}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all active:scale-98 flex items-center justify-center gap-2"
                        >
                            Surface <Lucide.ArrowUp size={16} />
                        </button>
                    </div>
                )}
            </main>

            <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-color/10 rounded-full blur-[150px]" />
            </div>
        </div>
    );
};

export default ThePit;
