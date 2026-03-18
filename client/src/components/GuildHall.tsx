import React, { useState } from 'react';
import { Landmark, ArrowUpCircle, Coins, Lock, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { GateManager } from '../../../shared/src/gate';

const GuildHall: React.FC = () => {
    const { guildUpgrades, upgradeBuilding, gateProgress, donateToGate, gold, currentFloor } = useGameStore();
    const [donationAmount, setDonationAmount] = useState(100);

    const nextGate = GateManager.getNextGate(currentFloor, gateProgress);
    const progressPercent = nextGate ? (nextGate.currentGold / nextGate.requiredGold) * 100 : 100;

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">Etrio Guild Hall</h2>
                    <p className="text-muted">Collective efforts to conquer the infinite Pit.</p>
                </div>
                <div className="p-3 bg-secondary-color/20 rounded-xl text-secondary-color">
                    <Landmark size={24} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* Guild Upgrades */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <ArrowUpCircle size={20} className="text-primary-color" />
                        Town Infrastructure
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {guildUpgrades.map((upgrade) => (
                            <div key={upgrade.id} className="glass p-6 rounded-xl border border-white/10 hover:border-primary-color/30 transition-colors group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="font-bold text-lg">{upgrade.id}</div>
                                        <div className="text-xs text-primary-color uppercase font-bold tracking-widest">Level {upgrade.level}</div>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-lg group-hover:bg-primary-color/20 transition-colors text-primary-color">
                                        <ArrowUpCircle size={18} />
                                    </div>
                                </div>
                                <p className="text-sm text-muted mb-6">{upgrade.perk}</p>
                                <button 
                                    onClick={() => upgradeBuilding(upgrade.id)}
                                    disabled={gold < upgrade.cost}
                                    className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                                        gold >= upgrade.cost 
                                        ? 'bg-primary-color/20 border border-primary-color/50 text-primary-color hover:bg-primary-color hover:text-white' 
                                        : 'bg-white/5 border border-white/10 text-muted cursor-not-allowed'
                                    }`}
                                >
                                    <Coins size={14} />
                                    Upgrade ({upgrade.cost}g)
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* The Gate System */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Lock size={20} className="text-danger-color" />
                        The Gate
                    </h3>
                    
                    <div className="glass p-8 rounded-2xl border border-danger-color/20 bg-danger-color/5 relative overflow-hidden">
                        {nextGate ? (
                            <>
                                <div className="text-center mb-8">
                                    <div className="text-4xl font-black mb-2 text-white">Floor {nextGate.floor}</div>
                                    <div className="text-sm text-danger-color uppercase font-bold tracking-[0.2em]">Sealed Abyss</div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-xs font-bold uppercase text-muted">
                                        <span>Contribution Progress</span>
                                        <span className="text-white">{Math.floor(progressPercent)}%</span>
                                    </div>
                                    <div className="h-4 bg-black/40 rounded-full overflow-hidden p-1 border border-white/5">
                                        <div 
                                            className="h-full bg-danger-color shadow-[0_0_15px_rgba(239,68,68,0.5)] rounded-full transition-all duration-1000"
                                            style={{ width: `${progressPercent}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-[10px] text-center text-muted">
                                        {nextGate.currentGold.toLocaleString()} / {nextGate.requiredGold.toLocaleString()} Gold Contributed
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        {[100, 500, 1000].map(amt => (
                                            <button 
                                                key={amt}
                                                onClick={() => setDonationAmount(amt)}
                                                className={`flex-1 py-1 rounded border text-xs font-bold ${donationAmount === amt ? 'bg-danger-color border-danger-color text-white' : 'bg-white/5 border-white/10 text-muted'}`}
                                            >
                                                {amt}g
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => donateToGate(donationAmount)}
                                        disabled={gold < donationAmount}
                                        className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${
                                            gold >= donationAmount 
                                            ? 'bg-danger-color text-white shadow-danger-color/20 active:scale-95' 
                                            : 'bg-white/10 text-muted cursor-not-allowed'
                                        }`}
                                    >
                                        Sacrifice Gold to The Gate
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-12 text-center">
                                <CheckCircle2 className="mx-auto text-secondary-color mb-4" size={48} />
                                <h4 className="text-xl font-bold mb-2">All Gates Shattered</h4>
                                <p className="text-sm text-muted">The infinite depths are theoretically open.</p>
                            </div>
                        )}
                    </div>

                    <div className="glass p-6 rounded-xl border border-white/10 text-sm italic text-muted text-center">
                        "Only through collective sacrifice can we reveal what lies beneath the bedrock of Etrio."
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuildHall;
