import React, { useState, useEffect, useRef } from 'react';
import { Mountain, Skull, Swords, Trophy, MapPin, Loader2, Play, Pause, ChevronDown } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const ThePit: React.FC = () => {
    const { 
        currentFloor, biome, setBiome, party, councilMembers, 
        confrontHeart, processCombatTick, isAutoSellEnabled, autoSellRarityThreshold
    } = useGameStore();
    const [isDescentActive, setIsDescentActive] = useState(false);
    const [combatLogs, setCombatLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const intervalRef = useRef<any>(null);

    const simulateFloor = async () => {
        if (party.length === 0) {
            setCombatLogs(prev => ["You descend alone into the depths...", ...prev]);
        }

        setLoading(true);
        try {
            const res = await processCombatTick();
            
            if (res && res.result && res.result.victory) {
                // Biome Shift logic
                const nextFloor = currentFloor + 1;
                if (nextFloor % 10 === 1) {
                    const biomes = ['Frozen Caves', 'Crystalline Peaks', 'Fungal Grotto', 'Volcanic Depths'];
                    const nextBiome = biomes[Math.floor(nextFloor / 10) % biomes.length] || 'The Void';
                    setBiome(nextBiome);
                    setCombatLogs(prev => [`--- BIOME SHIFT: ${nextBiome} ---`, ...prev]);
                }

                setCombatLogs(prev => [
                    `Floor ${currentFloor} Cleared! Verified on server.`,
                    ...prev.slice(0, 19)
                ]);
            } else if (res && res.result) {
                setCombatLogs(prev => ["Battle in progress...", ...prev]);
            } else {
                // Handle cases where res exists but result is missing or res is undefined
                setCombatLogs(prev => ["Authoritative engine returned invalid data. Check console.", ...prev]);
            }
        } catch (error: any) {
            console.error('SIMULATION ERROR:', error);
            setCombatLogs(prev => [`Error: ${error.message || 'Failed to contact engine'}`, ...prev]);
        } finally {
            setLoading(false);
        }
    };

    const toggleDescent = () => {
        setIsDescentActive(!isDescentActive);
    };

    useEffect(() => {
        if (isDescentActive) {
            intervalRef.current = setInterval(() => {
                simulateFloor();
            }, 5000); // Simulate a floor every 5 seconds for visual feedback
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isDescentActive, currentFloor]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">The Pit</h2>
                    <p className="text-muted">Descending into the dark fantasy depths of Etrio.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 glass rounded-lg border border-primary-color/30 flex items-center gap-2">
                        <MapPin className="text-primary-color" size={18} />
                        <span className="font-bold">{biome}</span>
                    </div>
                    <div className="px-4 py-2 glass rounded-lg border border-danger-color/30 flex items-center gap-2">
                        <Skull className="text-danger-color" size={18} />
                        <span className="font-bold">Floor {currentFloor}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* Progression Info / Final Boss */}
                <div className="glass p-8 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden h-[400px]">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-0"></div>
                    
                    {currentFloor >= 1000 ? (
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-32 h-32 bg-primary-color/20 rounded-full flex items-center justify-center mb-8 border-4 border-primary-color animate-pulse shadow-[0_0_50px_var(--primary-glow)]">
                                <MapPin size={48} className="text-primary-color" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">The Void Singularity</h3>
                            <p className="text-sm text-muted mb-8 max-w-xs">
                                The Heart of Etrio beats here. Only a complete Council of Ascended Heroes can pierce the veil.
                            </p>
                            
                            <div className="mb-6 flex gap-2">
                                {[...Array(4)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-3 h-3 rounded-full ${i < councilMembers.length ? 'bg-primary-color shadow-[0_0_5px_var(--primary-glow)]' : 'bg-white/10'}`}
                                    ></div>
                                ))}
                            </div>

                            <button 
                                onClick={() => confrontHeart()}
                                disabled={councilMembers.length < 4}
                                className={`px-12 py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
                                    councilMembers.length >= 4
                                    ? 'bg-primary-color text-white hover:scale-105 shadow-[0_0_30px_#9333ea]' 
                                    : 'bg-white/5 text-muted cursor-not-allowed'
                                }`}
                            >
                                {councilMembers.length >= 4 ? 'Confront The Heart' : 'Council Incomplete'}
                            </button>
                        </div>
                    ) : isDescentActive ? (
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-32 h-32 border-4 border-primary-color border-t-transparent rounded-full animate-spin mb-8 flex items-center justify-center">
                                <ChevronDown size={48} className="text-primary-color animate-bounce" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Descent in Progress...</h3>
                            <p className="text-muted mb-8">Your party is currently battling through Floor {currentFloor}.</p>
                            <button onClick={toggleDescent} className="btn-outline border-danger-color/50 text-danger-color hover:bg-danger-color/10 px-8 py-3">
                                <Pause size={18} /> Halt Descent
                            </button>
                        </div>
                    ) : (
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-32 h-32 border-4 border-dashed border-white/10 rounded-full flex items-center justify-center mb-8">
                                <Mountain size={48} className="text-white/20" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Ready to Descent</h3>
                            <p className="text-muted mb-8 italic">The air here is thick with ancient magic and the smell of ozone.</p>
                            <button onClick={toggleDescent} className="btn-primary px-12 py-4 text-lg shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                                {loading ? <Loader2 className="animate-spin" /> : <Play size={20} />}
                                Begin The Descent
                            </button>
                        </div>
                    )}
                </div>

                {/* Combat Logs */}
                <div className="flex flex-col h-[400px] glass rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
                        <Swords size={18} className="text-secondary-color" />
                        <span className="font-bold">Exploration Logs</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm custom-scrollbar">
                        {combatLogs.length === 0 ? (
                            <div className="text-muted text-center py-12">Waiting for descent...</div>
                        ) : (
                            combatLogs.map((log, idx) => (
                                <div key={idx} className={`p-2 rounded ${log.includes('Cleared') ? 'bg-secondary-color/10 text-secondary-color' : 'bg-white/5'}`}>
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Offline Progress Card */}
            <div className="glass p-6 rounded-2xl border border-white/10 bg-accent-color/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent-color/20 rounded-xl text-accent-color">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold">Passive Gains Enabled</h3>
                        <p className="text-sm text-muted">You will continue to climb floors and earn gold even while away from Respite.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-xs text-muted">Auto-Sell</div>
                        <div className="text-sm font-bold text-secondary-color">{isAutoSellEnabled ? `On (${autoSellRarityThreshold})` : 'Off'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThePit;
