import React, { useState, useEffect, useRef } from 'react';
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
  History,
  ChevronUp,
  Plus
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
    addEvents, addGold, setFloor, setLastLogout, setBloodRations, councilMembers, resonatorMastery, removeItems, lastLogout,
    location, setLocation
  } = useGameStore();

  const [isFeedOpen, setIsFeedOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [lastSnapshotData, setLastSnapshotData] = useState<any>(null);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const hasHandledSnapshot = useRef(false);

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

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => setLastLogout(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, setLastLogout]);

  // Snapshot handling
  useEffect(() => {
    if (!isAuthenticated || !mainCharacter || hasHandledSnapshot.current) return;

    const handleSnapshot = async () => {
      hasHandledSnapshot.current = true;
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
              playerId: playerId,
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
  }, [isAuthenticated, mainCharacter, lastLogout, party, currentFloor, addEvents, addGold, setFloor, setLastLogout, bloodRations, isResonatorActive, setBloodRations, setResonatorActive, councilMembers, resonatorMastery, removeItems]);

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
          id: `lay-to-rest-${Date.now()}`,
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
      className={`flex flex-col items-center justify-center gap-1 px-1 py-2 h-full transition-all group relative ${
        location === id 
        ? 'text-primary-color' 
        : 'text-muted hover:text-white'
      } ${mobileOnly ? 'md:hidden' : ''} flex-1`}
    >
      <Icon size={24} className={location === id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
      <span className="font-black text-[8px] uppercase tracking-tighter">{label}</span>
      {location === id && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary-color rounded-full shadow-[0_0_8px_var(--primary-glow)]" />
      )}
    </button>
  );

  // Master Action Button Logic
  const getMABAction = () => {
    switch(location) {
      case 'The Pit': return { label: 'Descend', icon: Sword, action: () => null /* Handled by Pit state */ };
      case 'Hospital': return { label: 'Heal All', icon: HeartPulse, action: () => null /* Inject via ref or state */ };
      case 'Tavern': return { label: 'Recruit', icon: Users, action: () => null };
      default: return null;
    }
  };

  const mab = getMABAction();

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-primary-color selection:text-white overflow-hidden relative">
      
      {/* 1. TOP HEADER (Mobile Compact / Desktop Full) */}
      <header className={`
        z-50 shrink-0 border-b border-white/10 bg-black/50 backdrop-blur-xl px-4 transition-all duration-300
        ${isHeaderExpanded ? 'h-32' : 'h-14 md:h-16'}
      `}>
        <div className="h-14 md:h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-color to-secondary-color flex items-center justify-center font-black italic shadow-lg">E</div>
            <h1 className="text-sm font-black tracking-tighter uppercase sm:text-lg">Legacy</h1>
          </div>

          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 md:px-4">
                <Coins size={14} className="text-accent-color" />
                <span className="font-black text-[10px] md:text-sm text-accent-color">{gold.toLocaleString()}</span>
             </div>
             
             <button 
                onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                className="p-1.5 rounded-full bg-white/5 border border-white/10 text-muted active:scale-95 transition-transform"
             >
                <ChevronUp size={16} className={`transition-transform duration-300 ${isHeaderExpanded ? '' : 'rotate-180'}`} />
             </button>
          </div>
        </div>

        {/* Expanded Header Stats */}
        <div className={`flex gap-4 overflow-hidden transition-all duration-300 ${isHeaderExpanded ? 'h-16 opacity-100' : 'h-0 opacity-0'}`}>
           <div className="flex-1 glass p-2 flex flex-col justify-center items-center border-red-500/20">
              <Droplets size={12} className="text-red-500 mb-1" />
              <span className="font-black text-xs">{Math.floor(bloodRations)}</span>
           </div>
           <button 
             onClick={() => setResonatorActive(!isResonatorActive)}
             className={`flex-1 glass p-2 flex flex-col justify-center items-center transition-colors ${isResonatorActive ? 'border-primary-color bg-primary-color/10' : 'border-white/5'}`}
           >
              <Zap size={12} className={isResonatorActive ? 'text-primary-color' : 'text-muted'} />
              <span className="font-black text-[8px] uppercase mt-1">Resonator</span>
           </button>
           <button 
             onClick={() => setIsFeedOpen(true)}
             className="flex-1 glass p-2 flex flex-col justify-center items-center border-white/5"
           >
              <History size={12} className="text-muted" />
              <span className="font-black text-[8px] uppercase mt-1">Logs</span>
           </button>
        </div>
      </header>

      {/* 2. SIDEBAR (Desktop Only) */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#0a0a0a] border-r border-white/10 shrink-0">
        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-8">
            <div className="space-y-1">
              <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Command</h3>
              <NavItem id="Respite" icon={LayoutDashboard} label="Overview" />
              <NavItem id="The Pit" icon={Sword} label="The Pit" />
            </div>
            <div className="space-y-1">
              <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Hub</h3>
              <NavItem id="Tavern" icon={Users} label="Tavern" />
              <NavItem id="Hospital" icon={HeartPulse} label="Infirmary" />
              <NavItem id="Blacksmith" icon={Shield} label="Forge" />
              <NavItem id="Market" icon={Droplets} label="Market" />
            </div>
        </nav>
      </aside>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar thumb-scroll">
          <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <header className="md:mb-8">
              <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-glow">{location}</h2>
              <div className="text-[9px] uppercase tracking-[0.4em] font-black text-primary-color/60 mt-1">Operational Module</div>
            </header>

            <section className="animate-fade-in">
              {location === 'Respite' && (
                <div className="space-y-6">
                  <div className="glass p-6 md:p-10 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                    <h3 className="text-xl md:text-3xl font-black mb-2 italic tracking-tighter">VANGUARD STATUS</h3>
                    <p className="text-muted leading-relaxed mb-6 text-sm md:text-lg">The Depths hum with ancient resonance. Monitor your party's vitality or expand your reach.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setLocation('The Pit')} className="btn-primary flex-1 py-4 justify-center">Enter The Pit</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-4 rounded-2xl border border-white/5 flex flex-col justify-between h-32">
                      <Users size={18} className="text-primary-color" />
                      <div>
                        <div className="text-3xl font-black italic">{party.length + (mainCharacter ? 1 : 0)}<span className="text-lg opacity-20 ml-1">/4</span></div>
                        <div className="text-[9px] text-muted uppercase font-bold tracking-tighter">Vanguard</div>
                      </div>
                    </div>
                    <div className="glass p-4 rounded-2xl border border-white/5 flex flex-col justify-between h-32">
                      <Mountain size={18} className="text-secondary-color" />
                      <div>
                        <div className="text-3xl font-black italic">{currentFloor}F</div>
                        <div className="text-[9px] text-muted uppercase font-bold tracking-tighter">Penetration</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
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

        {/* Master Action Button (MAB) - Only on Mobile */}
        {mab && (
          <div className="md:hidden mab-container">
            <button 
              onClick={mab.action}
              className="mab-primary flex items-center justify-center p-0 transition-transform active:rotate-12"
            >
              <mab.icon size={28} />
            </button>
            <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest shadow-xl">
              {mab.label}
            </div>
          </div>
        )}
      </main>

      {/* 4. ACTION FEED DRAWER */}
       <aside className={`
        fixed inset-y-0 right-0 z-[100] w-full sm:w-[400px] bg-[#080808]/95 backdrop-blur-2xl border-l border-white/10 flex flex-col transition-transform duration-500
        ${isFeedOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/30">
           <h3 className="text-xl font-black italic tracking-tighter uppercase">Tactical Feed</h3>
           <button onClick={() => setIsFeedOpen(false)} className="p-2 text-muted hover:text-white transition-colors">
              <X size={24} />
           </button>
        </div>
        <ActionFeed events={events} onLayToRest={handleLayToRest} floor={currentFloor} />
      </aside>

      {/* 5. BOTTOM NAVIGATION (Mobile Only - Thumb Zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[110] bg-black/60 backdrop-blur-3xl border-t border-white/10 px-2 h-20 flex justify-around items-center pb-safe-bottom">
        <NavItem id="Respite" icon={LayoutDashboard} label="Home" />
        <NavItem id="The Pit" icon={Sword} label="The Pit" />
        <NavItem id="Tavern" icon={Users} label="Tavern" />
        <NavItem id="Hospital" icon={HeartPulse} label="Med" />
        <NavItem id="Blacksmith" icon={Shield} label="Forge" />
        <NavItem id="Market" icon={Droplets} label="Blood" />
      </nav>

      {!mainCharacter && <CharacterCreation />}
      {isGameWon && <VictoryScreen />}

      {/* Depth Map Modal */}
      {showMap && lastSnapshotData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fade-in">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-6 glass border-primary-color/20">
             <DepthMap 
               events={lastSnapshotData.events} 
               startFloor={currentFloor} 
               finalFloor={lastSnapshotData.finalFloor} 
             />
             <button 
               onClick={() => setShowMap(false)}
               className="w-full mt-6 py-4 bg-primary-color text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-color/30"
             >
               Return to Hub
             </button>
          </div>
        </div>
      )}

      {location === 'The Pit' && <ThePit />}
    </div>
  );
};

export default App;
