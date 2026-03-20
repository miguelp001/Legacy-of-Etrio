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
  Zap,
  Cloud,
  X,
  Castle,
  History
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

const App: React.FC = () => {
  const { 
    gold, party, currentFloor, mainCharacter, 
    events, bloodRations, isResonatorActive, setResonatorActive,
    isGameWon, playerId, isAuthenticated, loadProgress, saveProgress, syncGuildSettings,
    addEvents, addGold, setFloor, setLastLogout, setBloodRations, councilMembers, resonatorMastery, removeItems, lastLogout
  } = useGameStore();

  const [location, setLocation] = useState('Respite');
  const [isFeedOpen, setIsFeedOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [lastSnapshotData, setLastSnapshotData] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && playerId) {
      loadProgress(playerId);
      syncGuildSettings();
    }
  }, [isAuthenticated, playerId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => saveProgress(), 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, saveProgress]);

  // Snapshot handling (Background progress)
  useEffect(() => {
    const handleSnapshot = async () => {
      if (!mainCharacter || !isAuthenticated) return;
      
      const now = Date.now();
      const timeDiff = now - lastLogout;
      
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
            if (data.bloodRationsRemaining !== undefined) setBloodRations(data.bloodRationsRemaining);
            setLastSnapshotData(data);
            setShowMap(true);
            setResonatorActive(false);

            if (data.lostGear && data.lostGear.length > 0) {
              removeItems(data.lostGear.map((i: any) => i.id));
            }
          }
        } catch (err) {
          console.error('Snapshot failed:', err);
        }
      }
      setLastLogout(now);
    };

    handleSnapshot();
    const interval = setInterval(() => setLastLogout(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [mainCharacter, isAuthenticated, lastLogout, party, currentFloor, addEvents, addGold, setFloor, setLastLogout, bloodRations, isResonatorActive, setBloodRations, setResonatorActive, councilMembers, resonatorMastery, removeItems]);

  const handleLayToRest = async (playerId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/lay-to-rest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corpseId: playerId })
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

  if (!isAuthenticated) return <LoginScreen />;

  const NavItem = ({ id, icon: Icon, label, mobileOnly = false }: { id: string, icon: any, label: string, mobileOnly?: boolean }) => (
    <button
      onClick={() => setLocation(id)}
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl transition-all group ${
        location === id 
        ? 'text-primary-color md:bg-primary-color md:text-white shadow-lg shadow-primary-color/20' 
        : 'text-muted hover:bg-white/5 hover:text-white'
      } ${mobileOnly ? 'md:hidden' : ''}`}
    >
      <Icon size={20} className={location === id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
      <span className="font-bold text-[10px] md:text-sm tracking-tight uppercase md:capitalize">{label}</span>
    </button>
  );

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-primary-color selection:text-white overflow-hidden relative">
      {/* 1. TOP HEADER (Mobile & Desktop) */}
      <header className="z-50 shrink-0 border-b border-white/10 bg-black/50 backdrop-blur-xl px-4 py-3 md:px-8 md:py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-primary-color to-secondary-color flex items-center justify-center font-black italic shadow-lg shadow-primary-color/20">E</div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-2xl font-black tracking-tighter leading-none uppercase">ETRIO</h1>
            <span className="text-[8px] md:text-[10px] font-bold text-primary-color tracking-[0.3em] uppercase opacity-80">LEADERSHIP</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 glass">
            <Droplets size={14} className="text-red-500" />
            <span className="font-black text-xs text-red-500">{Math.floor(bloodRations)}</span>
          </div>
          
          <button 
            onClick={() => setResonatorActive(!isResonatorActive)}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all glass ${
              isResonatorActive ? 'bg-primary-color/20 border-primary-color text-primary-color shadow-lg' : 'bg-white/5 border-white/10 text-muted'
            }`}
          >
            <Zap size={14} />
            <span className="font-black text-[10px] uppercase tracking-tighter">{isResonatorActive ? 'Resonator On' : 'Resonator'}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 glass">
            <Coins size={14} className="text-accent-color" />
            <span className="font-black text-xs text-accent-color">{gold.toLocaleString()}g</span>
          </div>

          <button 
            onClick={() => setIsFeedOpen(true)}
            className={`lg:hidden p-2 rounded-full hover:bg-white/10 text-muted transition-all relative ${events.length > 0 ? 'text-primary-color' : ''}`}
          >
            <History size={20} />
            {events.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-primary-color rounded-full animate-ping" />}
          </button>
        </div>
      </header>

      {/* 2. SIDEBAR (Desktop Only) */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#0a0a0a] border-r border-white/10 shrink-0">
        <nav className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar space-y-8">
          <div className="space-y-1">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Command</h3>
            <NavItem id="Respite" icon={LayoutDashboard} label="Overview" />
            <NavItem id="The Pit" icon={Sword} label="The Pit" />
          </div>

          <div className="space-y-1">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">The Hub</h3>
            <NavItem id="Tavern" icon={Users} label="Tavern" />
            <NavItem id="Hospital" icon={HeartPulse} label="Infirmary" />
            <NavItem id="Blacksmith" icon={Shield} label="Forge" />
            <NavItem id="Market" icon={Droplets} label="Blood Market" />
          </div>

          <div className="space-y-1">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Legacy</h3>
            <NavItem id="Basilica" icon={Sparkles} label="Basilica" />
            <NavItem id="Guild Hall" icon={Castle} label="Guild Hall" />
            <NavItem id="Lineage" icon={History} label="Lineage Hall" />
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 m-4 glass rounded-2xl bg-primary-color/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Aether Sync</span>
            <Cloud size={12} className="text-primary-color opacity-50" />
          </div>
          <p className="text-[10px] text-muted leading-tight line-clamp-2">Your lineage is preserved in the eternal archives.</p>
        </div>
      </aside>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.05)_0%,transparent_50%)]">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 lg:p-12 pb-32 md:pb-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-5xl font-black italic tracking-tighter uppercase text-glow">{location}</h2>
                <div className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-black text-primary-color/60 mt-1">Operational Module</div>
              </div>
            </header>

            <section className="animate-fade-in">
              {location === 'Respite' && (
                <div className="space-y-6">
                  <div className="glass p-6 md:p-10 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                      <Castle size={200} />
                    </div>
                    <h3 className="text-xl md:text-3xl font-black mb-2 md:mb-4 italic tracking-tighter">VANGUARD STATUS</h3>
                    <p className="text-muted leading-relaxed mb-6 md:mb-8 text-sm md:text-lg max-w-2xl">All systems operational. The Depths hum with ancient resonance. Monitor your party's vitality at the Infirmary or expand the guild's reach through the Guild Hall.</p>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                      <button onClick={() => setLocation('The Pit')} className="btn-primary w-full sm:w-auto px-8 py-3 md:py-4 text-base md:text-lg flex justify-center">Enter The Pit</button>
                      <button onClick={() => setLocation('Tavern')} className="btn-outline w-full sm:w-auto px-8 py-3 md:py-4 text-base md:text-lg flex justify-center">Visit Tavern</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
                    <div className="glass p-4 md:p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-32 md:h-40">
                      <div className="flex items-center gap-2 md:gap-3 text-primary-color">
                        <Users size={18} />
                        <h4 className="font-bold text-[10px] md:text-xs uppercase tracking-widest opacity-50">Active Party</h4>
                      </div>
                      <div>
                        <div className="text-3xl md:text-5xl font-black tracking-tighter italic">{party.length + (mainCharacter ? 1 : 0)}<span className="text-xl md:text-2xl opacity-20 ml-1">/ 4</span></div>
                        <div className="text-[10px] text-muted mt-1 uppercase tracking-tighter font-bold">Vanguard Deployed</div>
                      </div>
                    </div>
                    <div className="glass p-4 md:p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-32 md:h-40">
                      <div className="flex items-center gap-2 md:gap-3 text-secondary-color">
                        <Mountain size={18} />
                        <h4 className="font-bold text-[10px] md:text-xs uppercase tracking-widest opacity-50">Penetration</h4>
                      </div>
                      <div>
                        <div className="text-3xl md:text-5xl font-black tracking-tighter italic">{currentFloor}<span className="text-xl md:text-2xl opacity-20 ml-1">F</span></div>
                        <div className="text-[10px] text-muted mt-1 uppercase tracking-tighter font-bold">Maximum Reached</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {location === 'The Pit' && <ThePit />}
              {location === 'Tavern' && <Tavern />}
              {location === 'Hospital' && <Hospital />}
              {location === 'Blacksmith' && <Blacksmith />}
              {location === 'Market' && <BloodMarket />}
              {location === 'Basilica' && <Basilica />}
              {location === 'Forge' && <SteamForge />}
              {location === 'Guild Hall' && <GuildHall />}
              {location === 'Lineage' && <LineageHall />}
            </section>
          </div>
        </div>
      </main>

      {/* 4. ACTION FEED (Drawer for Mobile, Side Panel for Desktop) */}
      <aside className={`
        fixed inset-y-0 right-0 z-[60] w-full sm:w-[400px] lg:relative lg:flex lg:w-[400px] bg-[#080808] border-l border-white/10 flex-col overflow-hidden transition-transform duration-500
        ${isFeedOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="lg:hidden flex items-center justify-between p-6 border-b border-white/10 bg-black/30 backdrop-blur-xl">
           <h3 className="text-xl font-black italic tracking-tighter uppercase">Tactical Feed</h3>
           <button onClick={() => setIsFeedOpen(false)} className="p-2 text-muted hover:text-white transition-colors">
              <X size={24} />
           </button>
        </div>
        <ActionFeed events={events} onLayToRest={handleLayToRest} />
      </aside>

      {/* 5. BOTTOM NAVIGATION (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-t border-white/10 px-2 py-3 pb-8 flex justify-around items-center">
        <NavItem id="Respite" icon={LayoutDashboard} label="Home" />
        <NavItem id="The Pit" icon={Sword} label="The Pit" />
        <NavItem id="Tavern" icon={Users} label="Tavern" />
        <NavItem id="Guild Hall" icon={Castle} label="Guild" />
        <button 
          onClick={() => {
            const nextLocation = location === 'Market' ? 'Respite' : 'Market';
            setLocation(nextLocation);
          }}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${location === 'Market' ? 'text-primary-color' : 'text-muted'}`}
        >
          <Droplets size={20} />
          <span className="font-bold text-[10px] uppercase tracking-tight">Market</span>
        </button>
      </nav>

      {!mainCharacter && <CharacterCreation />}
      {isGameWon && <VictoryScreen />}

      {/* Depth Map Modal */}
      {showMap && lastSnapshotData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
             <DepthMap 
               events={lastSnapshotData.events} 
               startFloor={currentFloor} 
               finalFloor={lastSnapshotData.finalFloor} 
             />
             <button 
               onClick={() => setShowMap(false)}
               className="w-full mt-6 py-5 bg-primary-color text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-primary-color/20"
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
