import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sword, 
  HeartPulse, 
  Shield, 
  Mountain, 
  LayoutDashboard,
  Coins,
  Droplets,
  Sparkles,
  Factory,
  Zap
} from 'lucide-react';
import { useGameStore } from './store/gameStore';
import Tavern from './components/Tavern';
import Blacksmith from './components/Blacksmith';
import Hospital from './components/Hospital';
import GuildHall from './components/GuildHall';
import ThePit from './components/ThePit';
import LineageHall from './components/LineageHall';
import BloodMarket from './components/BloodMarket';
import Basilica from './components/Basilica';
import SteamForge from './components/SteamForge';
import CharacterCreation from './components/CharacterCreation';
import ActionFeed from './components/ActionFeed';
import DepthMap from './components/DepthMap';
import VictoryScreen from './components/VictoryScreen';
import LoginScreen from './components/LoginScreen';

const API_BASE = import.meta.env.VITE_API_URL || '';

type Location = 'Tavern' | 'Blacksmith' | 'Hospital' | 'GuildHall' | 'ThePit' | 'LineageHall' | 'BloodMarket' | 'Basilica' | 'SteamForge';

const App: React.FC = () => {
  const [location, setLocation] = useState<Location>('Tavern');
  const { 
    gold, party, currentFloor, mainCharacter, 
    events, addEvents, addGold, setFloor, 
    lastLogout, setLastLogout, bloodRations, setBloodRations,
    isResonatorActive, setResonatorActive, removeItems, councilMembers,
    resonatorMastery, isGameWon, playerId, isAuthenticated, loadProgress, saveProgress, syncGuildSettings
  } = useGameStore();

  const [showMap, setShowMap] = useState(false);
  const [lastSnapshotData, setLastSnapshotData] = useState<any>(null);

  useEffect(() => {
    // Initial sync
    syncGuildSettings();
    if (isAuthenticated && playerId) {
      loadProgress(playerId);
    }
  }, [isAuthenticated, playerId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Periodic auto-save every 60 seconds
    const interval = setInterval(() => {
      saveProgress();
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, saveProgress]);

  useEffect(() => {
    const handleSnapshot = async () => {
      if (!mainCharacter) return;
      
      const now = Date.now();
      const timeDiff = now - lastLogout;
      
      // Only trigger if more than 5 minutes have passed
      if (timeDiff > 5 * 60 * 1000) {
        try {
          const response = await fetch(`${API_BASE}/api/calculate-snapshot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lastLogout,
              currentTime: now,
              party: [mainCharacter, ...party],
              startFloor: currentFloor,
              playerId: mainCharacter.id,
              bloodRations,
              isResonatorActive
            })
          });
          const data = await response.json();
          if (data.events) {
            addEvents(data.events || []);
            
            const councilBonus = 1 + (councilMembers.length * 0.05);
            const resonatorBonus = 1 + (resonatorMastery * 0.1);
            const effectiveGold = Math.floor(data.gold * councilBonus * resonatorBonus);
            
            addGold(effectiveGold - (data.bloodpricePenalty || 0));
            setFloor(data.finalFloor);
            if (data.bloodRationsRemaining !== undefined) {
              setBloodRations(data.bloodRationsRemaining);
            }
            
            setLastSnapshotData(data);
            setShowMap(true);
            setResonatorActive(false); // Consume resonator
            
            if (data.bloodpricePenalty > 0) {
              addEvents([{
                turn: 0,
                attackerName: 'SYSTEM',
                defenderName: 'TREASURY',
                damage: 0,
                isCrit: false,
                isMiss: false,
                remainingHp: 0,
                banter: `Paid ${data.bloodpricePenalty}g in Bloodprices to the families of the fallen.`,
                emojiTag: '🩸'
              }]);
            }

            if (data.lostGear && data.lostGear.length > 0) {
              removeItems(data.lostGear.map((i: any) => i.id));
              addEvents([{
                turn: 0,
                attackerName: 'THE DEEP',
                defenderName: 'EQUIPMENT',
                damage: 0,
                isCrit: false,
                isMiss: false,
                remainingHp: 0,
                banter: `Permanent Loss: ${data.lostGear.map((i: any) => i.name).join(', ')} were lost to the shadows.`,
                emojiTag: '💔'
              }]);
            }
          }
        } catch (err) {
          console.error('Snapshot failed:', err);
        }
      }
      setLastLogout(now);
    };

    handleSnapshot();
    
    // Update logout timestamp periodically
    const interval = setInterval(() => setLastLogout(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [mainCharacter, lastLogout, party, currentFloor, addEvents, addGold, setFloor, setLastLogout, bloodRations, isResonatorActive, setBloodRations, setResonatorActive]);

  const handleLayToRest = async (playerId: string) => {
      try {
          const response = await fetch(`${API_BASE}/api/lay-to-rest`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ corpseId: playerId }) // Simplified
          });
          const data = await response.json();
          if (data.success) {
              addEvents([{
                  turn: 0,
                  attackerName: 'SYSTEM',
                  defenderName: 'YOU',
                  damage: 0,
                  isCrit: false,
                  isMiss: false,
                  remainingHp: 0,
                  banter: "You laid the fallen Bondi to rest. A warm light fills your heart (+5% Luck buff).",
                  emojiTag: '✨'
              }]);
          }
      } catch (err) {
          console.error('Lay to Rest failed:', err);
      }
  };

  const navItems = [
    { id: 'Tavern', name: 'Tavern', icon: Users },
    { id: 'Blacksmith', name: 'Blacksmith', icon: Sword },
    { id: 'Hospital', name: 'Hospital', icon: HeartPulse },
    { id: 'SteamForge', name: 'Steam Forge', icon: Factory },
    { id: 'Basilica', name: 'Basilica', icon: Sparkles },
    { id: 'BloodMarket', name: 'Blood Market', icon: Droplets },
    { id: 'GuildHall', name: 'Guild Hall', icon: Shield },
    { id: 'LineageHall', name: 'Lineage Hall', icon: Users },
    { id: 'ThePit', name: 'The Pit', icon: Mountain },
  ];

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="h-screen flex text-white bg-[#0d0d0f] overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-16 md:w-64 glass border-r border-white/5 p-4 md:p-6 flex flex-col gap-8 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-color rounded-lg flex items-center justify-center shadow-lg shadow-primary-glow">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <h1 className="hidden md:block text-2xl font-black tracking-tighter text-gradient">ETRIO</h1>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setLocation(item.id as Location)}
              className={`w-full justify-center md:justify-start transition-all ${
                location === item.id ? 'btn-primary' : 'btn-outline border-transparent hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              <span className="hidden md:block">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4 hidden md:block">
          <div className="glass p-4 rounded-xl border-l-4 border-l-accent-color">
            <div className="text-[10px] text-muted uppercase font-black tracking-widest mb-1">Treasury</div>
            <div className="text-2xl font-bold text-accent-color">{gold.toLocaleString()}g</div>
          </div>
        </div>
      </aside>

      {/* DUAL PANE CONTAINER */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT PANE: RESPITE HUB */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar bg-black/40">
          <div className="dark-moody-panel p-6 md:p-12 min-h-full shadow-2xl">
            <header className="mb-10 flex justify-between items-center relative z-10">
              <div>
                <h2 className="text-4xl font-black tracking-tight uppercase text-glow">{location}</h2>
                <div className="text-xs uppercase tracking-[0.4em] font-black text-primary-color/60">Respite Hub</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <Droplets size={16} className="text-red-500" />
                  <span className="font-bold text-red-500">{Math.floor(bloodRations)}</span>
                </div>
                <button 
                  onClick={() => setResonatorActive(!isResonatorActive)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                    isResonatorActive 
                    ? 'bg-primary-color/20 border-primary-color text-primary-color shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                    : 'bg-white/5 border-white/10 text-muted hover:border-white/20'
                  }`}
                  title="Aetheric Resonator: +50% Resources on next return"
                >
                  <Zap size={16} />
                  <span className="font-bold text-xs">{isResonatorActive ? 'RESONATOR ACTIVE' : 'RESONATOR'}</span>
                </button>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <Coins size={16} className="text-accent-color" />
                  <span className="font-bold text-accent-color">{gold.toLocaleString()}g</span>
                </div>
              </div>
            </header>

            <section className="animate-fade-in">
              {location === 'Tavern' && <Tavern />}
              {location === 'Blacksmith' && <Blacksmith />}
              {location === 'Hospital' && <Hospital />}
              {location === 'BloodMarket' && <BloodMarket />}
              {location === 'Basilica' && <Basilica />}
              {location === 'SteamForge' && <SteamForge />}
              {location === 'GuildHall' && <GuildHall />}
              {location === 'LineageHall' && <LineageHall />}
              {location === 'ThePit' && <ThePit />}
            </section>
          </div>
        </main>

        {/* RIGHT PANE: ACTION FEED */}
        <aside className="w-full md:w-[400px] xl:w-[500px] glass border-l border-white/5 flex flex-col">
          <ActionFeed events={events} onLayToRest={handleLayToRest} />
          
          <div className="p-4 bg-black/40 border-t border-white/5">
             <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-muted">
               <span>Current Depth</span>
               <span className="text-primary-color font-bold">Floor {currentFloor}</span>
             </div>
             <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-primary-color" style={{ width: `${(currentFloor % 100)}%` }}></div>
             </div>
          </div>
        </aside>
      </div>

      {!mainCharacter && <CharacterCreation />}
      {isGameWon && <VictoryScreen />}

      {/* Depth Map Overlay */}
      {showMap && lastSnapshotData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
             <DepthMap 
               events={lastSnapshotData.events} 
               startFloor={currentFloor - (lastSnapshotData.finalFloor - currentFloor)} // Simplified
               finalFloor={lastSnapshotData.finalFloor} 
             />
             <button 
               onClick={() => setShowMap(false)}
               className="w-full mt-4 py-4 bg-primary-color text-white rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary-color/20"
             >
               Return to Hub
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
