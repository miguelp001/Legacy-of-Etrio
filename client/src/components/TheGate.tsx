import React, { useState } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { GateManager } from '../../../shared/src/gate';

const TheGate: React.FC = () => {
    const { gateProgress, donateToGate, gold, currentFloor } = useGameStore();
    const [donationAmount, setDonationAmount] = useState(100);

    const nextGate = GateManager.getNextGate(currentFloor, gateProgress);
    const progressPercent = nextGate ? (nextGate.currentGold / nextGate.requiredGold) * 100 : 100;

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 md:px-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-danger-color/20 rounded-xl text-danger-color shrink-0">
                        <Lock size={24} className="md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic">The Gate</h2>
                        <p className="text-muted text-[10px] md:text-sm uppercase font-bold tracking-tight opacity-50">Break the seals to delve deeper.</p>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-0 max-w-2xl mx-auto">
                <div className="glass p-6 md:p-8 rounded-3xl border border-danger-color/20 bg-danger-color/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 pointer-events-none">
                        <Lock size={120} />
                    </div>
                    {nextGate ? (
                        <div className="relative z-10">
                            <div className="text-center mb-8">
                                <div className="text-3xl md:text-4xl font-black mb-1 text-white tracking-tighter italic">Phase {nextGate.floor}</div>
                                <div className="text-[10px] text-danger-color uppercase font-black tracking-[0.2em]">Sealed Abyss Boundary</div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                                    <span>Ritual Progress</span>
                                    <span className="text-white">{Math.floor(progressPercent)}%</span>
                                </div>
                                <div className="h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                                    <div 
                                        className="h-full bg-danger-color shadow-[0_0_10px_rgba(239,68,68,0.5)] rounded-full transition-all duration-1000"
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                                <div className="text-[10px] text-center font-bold text-muted uppercase tracking-tighter opacity-50">
                                    {nextGate.currentGold.toLocaleString()} / {nextGate.requiredGold.toLocaleString()} Contributed
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    {[100, 500, 1000].map(amt => (
                                        <button 
                                            key={amt}
                                            onClick={() => setDonationAmount(amt)}
                                            className={`flex-1 py-2 rounded-xl border text-[10px] font-black transition-all ${donationAmount === amt ? 'bg-danger-color border-danger-color text-white' : 'bg-white/5 border-white/10 text-muted hover:bg-white/10'}`}
                                        >
                                            {amt}g
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => donateToGate(donationAmount)}
                                    disabled={gold < donationAmount}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-xl active:scale-95 ${
                                        gold >= donationAmount 
                                        ? 'bg-danger-color text-white shadow-danger-color/30' 
                                        : 'bg-white/10 text-muted cursor-not-allowed opacity-20'
                                    }`}
                                >
                                    Sacrifice to Ritual
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center relative z-10">
                            <CheckCircle2 className="mx-auto text-secondary-color mb-4" size={48} />
                            <h4 className="text-xl font-black uppercase tracking-tighter">All Gates Shattered</h4>
                            <p className="text-[10px] text-muted uppercase font-bold italic">The infinite depths are open to those with courage.</p>
                        </div>
                    )}
                </div>

                <div className="glass mt-6 p-5 md:p-6 rounded-2xl border border-white/5 text-[10px] md:text-xs italic text-muted text-center leading-relaxed">
                    "Only through collective sacrifice can we reveal what lies beneath the bedrock of Etrio."
                </div>
            </div>
        </div>
    );
};

export default TheGate;
