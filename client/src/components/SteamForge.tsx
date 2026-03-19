import React, { useState } from 'react';
import { Factory, Zap, AlertTriangle, Package } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const SteamForge: React.FC = () => {
  const { 
    gold, pollutionLevel, massProduceItems, 
    currentFloor, resonatorMastery, upgradeResonator 
  } = useGameStore();
  const [isProducing, setIsProducing] = useState(false);

  const productionBatches = [
    { quantity: 5, cost: 1000, time: 2000, name: 'Small Crate' },
    { quantity: 10, cost: 1800, time: 4000, name: 'Standard Shipment' },
    { quantity: 25, cost: 4000, time: 8000, name: 'Industrial Bulk' },
  ];

  const handleProduce = async (quantity: number, cost: number, time: number) => {
    if (gold < cost) return;
    
    setIsProducing(true);
    // Simulate production time
    setTimeout(() => {
      massProduceItems(currentFloor, quantity, cost);
      setIsProducing(false);
    }, time);
  };

  const getPollutionColor = () => {
    if (pollutionLevel < 30) return 'bg-green-500';
    if (pollutionLevel < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      <div className="glass p-8 rounded-2xl border-l-4 border-slate-500/50 bg-slate-950/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-slate-500/20 rounded-full flex items-center justify-center text-slate-400 shadow-lg shadow-slate-500/20">
            <Factory size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight">The Iron Lung Foundry</h3>
            <p className="text-sm opacity-60">Mass-production forge. Quality is secondary to quantity.</p>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-end">
            <div className="text-[10px] uppercase font-black tracking-widest text-muted">Guild Pollution Level</div>
            <div className={`text-lg font-bold ${pollutionLevel > 50 ? 'text-red-500' : 'text-white'}`}>
              {pollutionLevel}%
            </div>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${getPollutionColor()}`}
              style={{ width: `${pollutionLevel}%` }}
            ></div>
          </div>
          {pollutionLevel > 50 && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold animate-pulse">
              <AlertTriangle size={14} />
              WARNING: High pollution is stifling other guild facilities!
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {productionBatches.map((batch) => (
          <div key={batch.name} className="glass p-6 rounded-2xl border border-white/5 hover:border-slate-500/30 transition-all group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-500/10 rounded-xl text-slate-400">
                <Package size={24} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-black">{batch.quantity}x</div>
                <div className="text-[10px] uppercase text-muted font-bold">Items</div>
              </div>
            </div>
            
            <h4 className="text-lg font-bold mb-1">{batch.name}</h4>
            <p className="text-xs text-muted mb-6 flex-1">
              Industrial grade mass-production at Floor {currentFloor} power level.
            </p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Production Cost</span>
                <span className="font-bold text-accent-color">{batch.cost}g</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Pollution Impact</span>
                <span className="font-bold text-red-500">+{batch.quantity * 2}%</span>
              </div>
              
              <button 
                onClick={() => handleProduce(batch.quantity, batch.cost, batch.time)}
                disabled={gold < batch.cost || isProducing}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
                  gold >= batch.cost && !isProducing
                  ? 'bg-white text-black hover:bg-slate-300 shadow-xl' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
              >
                {isProducing ? 'Forge Running...' : `Start Forging`}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resonator Mastery Section */}
      <section className="glass p-8 rounded-2xl border border-primary-color/30 bg-primary-color/5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-10 rotate-12">
          <Zap size={200} className="text-primary-color" />
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          <div className="basis-1/3 text-center md:text-left">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
              <Zap className="text-primary-color animate-pulse" size={24} />
              Resonator Tuning
            </h3>
            <p className="text-sm text-muted">
              Synchronize the guild's frequencies with the deeper layers of the Aether. 
              Higher mastery provides a permanent multiplier to all extraction runs.
            </p>
          </div>

          <div className="basis-2/3 w-full space-y-6">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted">Current Mastery</span>
                <div className="text-2xl font-black text-primary-color">Level {resonatorMastery}/10</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted">Bonus Multiplier</span>
                <div className="text-2xl font-black text-secondary-color">+{resonatorMastery * 10}%</div>
              </div>
            </div>

            <div className="h-4 bg-white/5 rounded-full p-1 border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-primary-color to-secondary-color rounded-full shadow-[0_0_15px_var(--primary-glow)] transition-all duration-1000"
                style={{ width: `${(resonatorMastery / 10) * 100}%` }}
              ></div>
            </div>

            <button 
              onClick={() => upgradeResonator()}
              disabled={gold < (10000 * Math.pow(2, resonatorMastery)) || resonatorMastery >= 10}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
                gold >= (10000 * Math.pow(2, resonatorMastery)) && resonatorMastery < 10
                ? 'bg-primary-color text-white hover:scale-[1.02] shadow-lg shadow-primary-color/30' 
                : 'bg-white/5 text-muted cursor-not-allowed'
              }`}
            >
              {resonatorMastery >= 10 
                ? 'Maximum Mastery Achieved' 
                : `Upgrade Frequency (Cost: ${10000 * Math.pow(2, resonatorMastery)}g)`}
            </button>
          </div>
        </div>
      </section>

      <div className="glass p-6 rounded-2xl border border-dashed border-white/10 opacity-60 flex gap-4 items-start">
        <AlertTriangle className="text-orange-500 shrink-0" size={20} />
        <div>
          <h5 className="text-sm font-bold mb-2">Technical Bulletin:</h5>
          <p className="text-xs leading-relaxed">
            Steam-Forged items have a **25% chance to be Corrupted**. 
            Massive production runs saturate the local Atmosphere with ash and aether-smoke. 
            Idle guild members (Heal, Recruit) will act slower and demand higher hazard pay 
            until the pollution dissipates (to be implemented via cleanup rituals later).
          </p>
        </div>
      </div>
    </div>
  );
};

export default SteamForge;
