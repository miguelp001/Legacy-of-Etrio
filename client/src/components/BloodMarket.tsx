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
    <div className="space-y-8">
      <div className="glass p-8 rounded-2xl border-l-4 border-red-500/50 bg-red-950/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 shadow-lg shadow-red-500/20">
            <Droplets size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight">The Vein & Vesper</h3>
            <p className="text-sm opacity-60">Nightsdeep's premier Blood Market. Discretion guaranteed.</p>
          </div>
        </div>
        
        <div className="flex gap-8 items-center mt-6 p-4 bg-black/20 rounded-xl border border-white/5">
          <div>
            <div className="text-[10px] uppercase font-black tracking-widest text-muted mb-1">Current Rations</div>
            <div className="text-3xl font-bold text-red-500">{bloodRations.toLocaleString()}</div>
          </div>
          <TrendingUp className="text-white/10" size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packs.map((pack) => (
          <div key={pack.name} className="glass p-6 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-red-500/10 transition-all"></div>
            
            <h4 className="text-lg font-bold mb-1">{pack.name}</h4>
            <p className="text-xs text-muted mb-4 h-8">{pack.description}</p>
            
            <div className="flex items-end justify-between mt-auto">
              <div>
                <div className="text-[10px] uppercase font-bold opacity-40">Amount</div>
                <div className="text-xl font-black text-red-500">+{pack.amount}</div>
              </div>
              <button 
                onClick={() => handlePurchase(pack.amount, pack.cost)}
                disabled={gold < pack.cost}
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                  gold >= pack.cost 
                  ? 'bg-white text-black hover:bg-red-500 hover:text-white' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
              >
                <Coins size={14} />
                {pack.cost}g
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-6 rounded-2xl border border-dashed border-white/10 opacity-60">
        <h5 className="text-sm font-bold mb-2">Market Notice:</h5>
        <p className="text-xs leading-relaxed">
          The Consumption of blood is a necessity for the Children of the Night. 
          Without regular rations, your vampires will enter a state of **Starvation**, 
          halving their physical and spiritual prowess. Ensure your coffers are full 
          before the Hunger takes hold.
        </p>
      </div>
    </div>
  );
};

export default BloodMarket;
