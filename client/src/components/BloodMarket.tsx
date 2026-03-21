import React from 'react';
import { Droplets, Coins, TrendingUp, ChevronRight } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const BloodMarket: React.FC = () => {
  const { gold, bloodRations, buyRations } = useGameStore();
  const [loading, setLoading] = React.useState(false);

  const packs = [
    { name: 'Sanguine Vial', amount: 50, cost: 500, icon: '🧪' },
    { name: 'Casket of Echoes', amount: 250, cost: 2000, icon: '🏺' },
    { name: 'Ancestral Reserve', amount: 1000, cost: 7500, icon: '💎' },
  ];

  const handlePurchase = async (amount: number, cost: number) => {
    if (gold >= cost && !loading) {
      setLoading(true);
      try {
        await buyRations(amount, cost);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-32">
      {/* Dynamic Status Header */}
      <div className="mx-4 glass p-6 rounded-[2.5rem] border-red-500/20 bg-red-500/5 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 opacity-5 rotate-12">
          <Droplets size={120} className="text-red-500" />
        </div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
            <Droplets size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic">Blood Registry</h3>
            <span className="text-[10px] text-red-500/60 font-black uppercase tracking-widest leading-none">Market Volatility: Stable</span>
          </div>
        </div>
        
        <div className="bg-black/40 rounded-3xl border border-white/5 p-5 flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-white/20">Current Sanguine Stock</span>
            <div className="text-4xl font-black text-red-500 tracking-tighter italic">{Math.floor(bloodRations).toLocaleString()}</div>
          </div>
          <TrendingUp className="text-white/10 mb-1" size={24} />
        </div>
      </div>

      {/* Packs - Vertical List for One Handed Tap */}
      <div className="space-y-4 px-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Acquisition Protocols</h4>
        {packs.map((pack) => (
          <div key={pack.name} className="glass p-5 rounded-3xl border border-white/5 flex items-center justify-between group active:bg-red-500/5">
            <div className="flex items-center gap-4">
                <div className="text-2xl w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5">
                    {pack.icon}
                </div>
                <div>
                   <div className="text-xs font-black uppercase tracking-tight">{pack.name}</div>
                   <div className="text-lg font-black text-red-500">+{pack.amount} <span className="text-[10px] uppercase text-white/20 ml-1 italic">Rations</span></div>
                </div>
            </div>

            <button 
              onClick={() => handlePurchase(pack.amount, pack.cost)}
              disabled={gold < pack.cost || loading}
              className={`h-14 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all active:scale-90 ${
                gold >= pack.cost 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                : 'bg-white/5 text-white/20 border border-white/10 opacity-50'
              }`}
            >
              <Coins size={14} />
              {pack.cost.toLocaleString()}
            </button>
          </div>
        ))}
      </div>

      {/* Narrative Footer */}
      <div className="mx-4 p-5 glass border-dashed border-red-500/20 bg-red-500/5 rounded-3xl">
        <p className="text-[10px] leading-relaxed italic text-muted opacity-60 font-bold uppercase tracking-tight">
          Blood is the currency of survival. Without it, the Children of the Night fade into starvation, their prowess halved by the creeping void.
        </p>
      </div>
    </div>
  );
};

export default BloodMarket;
