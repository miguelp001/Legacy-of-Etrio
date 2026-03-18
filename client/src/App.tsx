import React, { useState } from 'react';
import { 
  Users, 
  Sword, 
  HeartPulse, 
  Shield, 
  Mountain, 
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import { useGameStore } from './store/gameStore';
import Tavern from './components/Tavern';
import Blacksmith from './components/Blacksmith';
import Hospital from './components/Hospital';
import GuildHall from './components/GuildHall';
import ThePit from './components/ThePit';
import LineageHall from './components/LineageHall';

type Location = 'Tavern' | 'Blacksmith' | 'Hospital' | 'GuildHall' | 'ThePit' | 'LineageHall';

const App: React.FC = () => {
  const [location, setLocation] = useState<Location>('Tavern');
  const { gold, party, currentFloor } = useGameStore();

  const navItems = [
    { id: 'Tavern', name: 'Tavern', icon: Users },
    { id: 'Blacksmith', name: 'Blacksmith', icon: Sword },
    { id: 'Hospital', name: 'Hospital', icon: HeartPulse },
    { id: 'GuildHall', name: 'Guild Hall', icon: Shield },
    { id: 'LineageHall', name: 'Lineage Hall', icon: Users },
    { id: 'ThePit', name: 'The Pit', icon: Mountain },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-white bg-black/95 transition-all duration-500">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass border-r border-white/5 p-6 flex flex-col gap-8 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-color rounded-lg flex items-center justify-center shadow-lg shadow-primary-glow">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-gradient">ETRIO</h1>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setLocation(item.id as Location)}
              className={`w-full justify-start transition-all hover:pl-6 ${
                location === item.id ? 'btn-primary' : 'btn-outline border-transparent hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              {item.name}
              {location === item.id && <ChevronRight className="ml-auto" size={16} />}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="glass p-4 rounded-xl border-l-4 border-l-accent-color relative overflow-hidden group">
            <div className="absolute inset-0 bg-accent-color/5 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="text-[10px] text-muted uppercase font-black tracking-widest mb-1">Treasury</div>
              <div className="text-2xl font-bold text-accent-color drop-shadow-sm">{gold.toLocaleString()}g</div>
            </div>
          </div>
          <div className="glass p-4 rounded-xl border-l-4 border-l-primary-color relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary-color/5 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="text-[10px] text-muted uppercase font-black tracking-widest mb-1">Vanguard</div>
              <div className="text-xl font-semibold">{party.length} / 4 Members</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">{location.replace(/([A-Z])/g, ' $1').trim()}</h2>
            <div className="text-muted text-sm uppercase tracking-[0.2em] font-bold">Respite Town Hub</div>
          </div>
          
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="glass px-4 py-2 flex items-center gap-2 flex-1 justify-center sm:justify-start">
              <div className={`w-2 h-2 rounded-full ${party.length > 0 ? 'bg-secondary-color animate-pulse' : 'bg-danger-color'}`}></div>
              <span className="text-sm font-bold uppercase tracking-widest">{party.length > 0 ? 'Active' : 'Empty'}</span>
            </div>
          </div>
        </header>

        <section className="min-h-[60vh]">
          {location === 'Tavern' && <Tavern />}
          {location === 'Blacksmith' && <Blacksmith />}
          {location === 'Hospital' && <Hospital />}
          {location === 'GuildHall' && <GuildHall />}
          {location === 'LineageHall' && <LineageHall />}
          {location === 'ThePit' && <ThePit />}
        </section>
      </main>

      {/* Right Column: Dynamic Status/Feed (Visible on XL) */}
      <aside className="hidden xl:flex w-80 glass border-l border-white/5 p-6 flex-col gap-8 animate-fade-in">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted mb-4">World Events</h3>
          <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary-color/5 border border-primary-color/10 text-xs">
                  <div className="text-primary-color font-bold mb-1">The Blood Moon</div>
                  <div className="text-muted leading-relaxed">Monster power increased by 20%. Drop rates shifted toward Corrupted items.</div>
              </div>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted mb-4">Global Feed</h3>
          <div className="space-y-3 font-mono text-[10px] leading-tight text-muted">
            <div className="flex gap-2"><span className="text-secondary-color">[INFO]</span> New Heir born in Generation 4.</div>
            <div className="flex gap-2"><span className="text-primary-color">[RAID]</span> The Gate floor 100 is 45% shattered.</div>
            <div className="flex gap-2"><span className="text-accent-color">[ITEM]</span> Legendary 'Void Edge' found by Hunter K.</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
          <div className="text-[10px] text-muted uppercase mb-1">Current Expedition</div>
          <div className="text-lg font-bold">The Pit Floor {currentFloor}</div>
        </div>
      </aside>
    </div>
  );
};

export default App;
