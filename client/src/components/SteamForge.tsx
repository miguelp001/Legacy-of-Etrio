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
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
      <div className="glass p-6 md:p-8 rounded-3xl border border-white/5 bg-slate-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
            <Factory size={100} className="md:w-[150px] md:h-[150px]" />
        </div>
        
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-500/20 rounded-xl flex items-center justify-center text-slate-400 shadow-lg shadow-slate-500/20 shrink-0">
            <Factory size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">The Iron Lung Foundry</h3>
            <p className="text-[10px] md:text-sm text-muted uppercase font-bold tracking-tight opacity-50">Industrial Mass-Production Forge</p>
          </div>
        </div>
        
        <div className="mt-8 space-y-4 relative z-10">
          <div className="flex justify-between items-end">
            <div className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-white/30">Guild Pollution Level</div>
            <div className={`text-base md:text-lg font-black ${pollutionLevel > 50 ? 'text-danger-color' : 'text-white'}`}>
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
            <div className="flex items-center gap-2 text-danger-color text-[10px] md:text-xs font-black uppercase tracking-widest animate-pulse">
              <AlertTriangle size={14} />
              High pollution is stifling other facilities!
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
        {productionBatches.map((batch) => (
          <div key={batch.name} className="glass p-5 md:p-6 rounded-2xl border border-white/5 hover:border-slate-500/30 transition-all group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-500/10 rounded-xl text-slate-400 shrink-0">
                <Package size={20} className="md:w-6 md:h-6" />
              </div>
              <div className="text-right">
                <div className="text-xl md:text-2xl font-black tracking-tighter">{batch.quantity}x</div>
                <div className="text-[8px] md:text-[10px] uppercase text-white/30 font-black tracking-widest">Units</div>
              </div>
            </div>
            
            <h4 className="text-base md:text-lg font-black uppercase tracking-tight mb-1 group-hover:text-primary-color transition-colors">{batch.name}</h4>
            <p className="text-[10px] md:text-xs text-muted mb-6 flex-1 italic leading-relaxed">
              Industrial grade mass-production at Floor {currentFloor} power level.
            </p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] md:text-xs border-b border-white/5 pb-1">
                <span className="text-white/30 font-black uppercase tracking-tighter">Cost</span>
                <span className="font-bold text-accent-color">{batch.cost.toLocaleString()}g</span>
              </div>
              <div className="flex justify-between items-center text-[10px] md:text-xs border-b border-white/5 pb-1">
                <span className="text-white/30 font-black uppercase tracking-tighter">Pollution</span>
                <span className="font-bold text-danger-color">+{batch.quantity * 2}%</span>
              </div>
              
              <button 
                onClick={() => handleProduce(batch.quantity, batch.cost, batch.time)}
                disabled={gold < batch.cost || isProducing}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all mt-4 ${
                  gold >= batch.cost && !isProducing
                  ? 'bg-white text-black hover:bg-slate-300 shadow-xl active:scale-95' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
              >
                {isProducing ? 'Forge Running...' : `Initiate Protocol`}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resonator Mastery Section */}
      <section className="glass p-6 md:p-8 rounded-3xl border border-primary-color/20 bg-primary-color/5 relative overflow-hidden mx-4 md:mx-0">
        <div className="absolute -top-10 -right-10 opacity-10 rotate-12 pointer-events-none">
          <Zap size={200} className="text-primary-color" />
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center relative z-10">
          <div className="md:basis-1/3 text-center md:text-left">
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter italic flex items-center justify-center md:justify-start gap-2 mb-2">
              <Zap className="text-primary-color animate-pulse" size={20} />
              Aetheric Resonator
            </h3>
            <p className="text-[10px] md:text-sm text-muted italic leading-relaxed">
              Synchronize frequencies with the deeper Aether. 
              Higher mastery provides a permanent bonus to all extraction runs.
            </p>
          </div>

          <div className="md:basis-2/3 w-full space-y-6">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-white/30">Mastery Phase</span>
                <div className="text-xl md:text-2xl font-black text-primary-color leading-none">Phase {resonatorMastery}/10</div>
              </div>
              <div className="text-right">
                <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-white/30">Bonus Yield</span>
                <div className="text-xl md:text-2xl font-black text-secondary-color leading-none">+{resonatorMastery * 10}%</div>
              </div>
            </div>

            <div className="h-3 bg-white/5 rounded-full p-0.5 border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-primary-color to-secondary-color rounded-full shadow-[0_0_10px_var(--primary-glow)] transition-all duration-1000"
                style={{ width: `${(resonatorMastery / 10) * 100}%` }}
              ></div>
            </div>

            <button 
              onClick={() => upgradeResonator()}
              disabled={gold < (10000 * Math.pow(2, resonatorMastery)) || resonatorMastery >= 10}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all ${
                gold >= (10000 * Math.pow(2, resonatorMastery)) && resonatorMastery < 10
                ? 'bg-primary-color text-white hover:scale-[1.02] shadow-lg shadow-primary-color/40 active:scale-95' 
                : 'bg-white/5 text-muted cursor-not-allowed opacity-20'
              }`}
            >
              {resonatorMastery >= 10 
                ? 'Maximum Resonance Achieved' 
                : `Upgrade Frequency (${(10000 * Math.pow(2, resonatorMastery)).toLocaleString()}g)`}
            </button>
          </div>
        </div>
      </section>

      <div className="glass p-5 md:p-6 rounded-2xl border border-dashed border-white/10 opacity-60 flex gap-4 items-start mx-4 md:mx-0">
        <AlertTriangle className="text-orange-500 shrink-0" size={18} />
        <div>
          <h5 className="text-[10px] md:text-sm font-black uppercase tracking-widest mb-2">Technical Bulletin</h5>
          <p className="text-[10px] md:text-xs leading-relaxed opacity-80">
            Forged units have a <span className="text-white font-black">25% chance of Corruption</span>. 
            Production saturates the local atmosphere with ash. 
            Hazard pay for specialists (Sanitarium, Tavern) increases until toxins dissipate.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SteamForge;
