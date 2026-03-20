import React from 'react';
import { Droplets, Coins, TrendingUp } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const BloodMarket: React.FC = () => {
  const { gold, bloodRations, buyRations } = useGameStore();
  const [loading, setLoading] = React.useState(false);

  const packs = [
    { name: 'Small Vial', amount: 50, cost: 500, description: 'A modest offering for a single night.' },
    { name: 'Large Cask', amount: 250, cost: 2000, description: 'Sourced from the finest Bondi donors.' },
    { name: 'Noble Reserve', amount: 1000, cost: 7500, description: 'Vintage blood from the high castes.' },
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
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
      <div className="glass p-6 md:p-8 rounded-3xl border-l-4 border-red-500/50 bg-red-950/20 relative overflow-hidden px-4 md:px-8">
        <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 pointer-events-none">
          <Droplets size={120} />
        </div>
        
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 shadow-xl shadow-red-500/20 shrink-0">
            <Droplets size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter italic">The Vein & Vesper</h3>
            <p className="text-[10px] md:text-sm uppercase font-bold tracking-tight opacity-50">Nightsdeep's premier Blood Market.</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 p-4 md:p-6 bg-black/40 rounded-2xl border border-white/5 relative z-10">
          <div>
            <div className="text-[8px] md:text-[10px] uppercase font-black tracking-[0.2em] text-white/30 mb-1">Current Rations</div>
            <div className="text-2xl md:text-4xl font-black text-red-500 tracking-tighter italic">{bloodRations.toLocaleString()}</div>
          </div>
          <TrendingUp className="text-white/10" size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0">
        {packs.map((pack) => (
          <div key={pack.name} className="glass p-6 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-red-500/10 transition-all"></div>
            
            <h4 className="text-sm md:text-base font-black uppercase tracking-widest mb-1 group-hover:text-red-500 transition-colors">{pack.name}</h4>
            <p className="text-[10px] md:text-xs text-muted mb-6 italic leading-relaxed opacity-60 flex-1">{pack.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <div className="text-[8px] uppercase font-black tracking-widest opacity-30">Amount</div>
                <div className="text-xl font-black text-red-500 tracking-tighter italic">+{pack.amount}</div>
              </div>
              <button 
                onClick={() => handlePurchase(pack.amount, pack.cost)}
                disabled={gold < pack.cost}
                className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 active:scale-95 ${
                  gold >= pack.cost 
                  ? 'bg-white text-black hover:bg-red-500 hover:text-white shadow-lg shadow-white/10' 
                  : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'
                }`}
              >
                <Coins size={14} />
                {pack.cost.toLocaleString()}g
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-6 md:p-8 rounded-3xl border border-dashed border-red-500/20 bg-red-500/5 px-4 md:px-8 mx-4 md:mx-0">
        <h5 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-3 text-red-500/50">Market Notice:</h5>
        <p className="text-[10px] md:text-xs leading-relaxed italic text-muted opacity-80">
          The Consumption of blood is a necessity for the Children of the Night. 
          Without regular rations, your vampires will enter a state of <span className="text-red-500 font-bold">Starvation</span>, 
          halving their physical and spiritual prowess.
        </p>
      </div>
    </div>
  );
};

export default BloodMarket;
