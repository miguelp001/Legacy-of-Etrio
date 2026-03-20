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
  Zap,
  Cloud,
  Menu,
  X,
  Castle,
  History,
  Info
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const NavGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-1 mb-6">
      <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">{title}</h3>
      {children}
    </div>
  );

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        setLocation(id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
        location === id 
        ? 'bg-primary-color text-white shadow-lg shadow-primary-color/20' 
        : 'text-muted hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={18} className={location === id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-primary-color selection:text-white overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-color flex items-center justify-center font-black italic">E</div>
          <span className="font-black tracking-tighter text-xl text-gradient">ETRIO</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-muted hover:text-white">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar / Mobile Menu */}
      <aside className={`
        fixed inset-0 z-40 md:relative md:flex flex-col w-full md:w-72 bg-[#0a0a0a] border-r border-white/10 transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 hidden md:block">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-color to-secondary-color flex items-center justify-center font-black italic text-xl shadow-lg shadow-primary-color/20">E</div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none">LEGACY</h1>
              <span className="text-[10px] font-bold text-primary-color tracking-[0.3em] uppercase opacity-80">OF ETRIO</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 md:py-0 custom-scrollbar">
          <NavGroup title="Command">
            <NavItem id="Respite" icon={LayoutDashboard} label="State Overview" />
            <NavItem id="The Pit" icon={Sword} label="The Descent" />
          </NavGroup>

          <NavGroup title="The Hub">
            <NavItem id="Tavern" icon={Users} label="Tavern" />
            <NavItem id="Hospital" icon={HeartPulse} label="Infirmary" />
            <NavItem id="Blacksmith" icon={Shield} label="Blacksmith" />
            <NavItem id="Market" icon={Droplets} label="Blood Market" />
          </NavGroup>

          <NavGroup title="Sanctified Wing">
            <NavItem id="Basilica" icon={Sparkles} label="Basilica" />
            <NavItem id="Forge" icon={Factory} label="Steam Forge" />
          </NavGroup>

          <NavGroup title="Legacy Archive">
            <NavItem id="Guild Hall" icon={Castle} label="Guild Hall" />
            <NavItem id="Lineage" icon={History} label="Lineage Hall" />
          </NavGroup>
        </nav>

        <div className="p-4 border-t border-white/5 m-4 glass rounded-2xl bg-primary-color/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Aether Sync</span>
              <span className="text-xs font-bold text-primary-color uppercase">Verified</span>
            </div>
            <button onClick={() => saveProgress()} className="p-2 rounded-lg bg-white/5 text-muted hover:text-white transition-colors" title="Manual Sync">
              <Cloud size={16} />
            </button>
          </div>
          <p className="text-[10px] text-muted leading-tight">Your lineage is preserved in the eternal archives.</p>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar bg-black/20">
          <div className="max-w-4xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
              <div>
                <h2 className="text-4xl font-black tracking-tight uppercase text-glow">{location}</h2>
                <div className="text-[10px] uppercase tracking-[0.4em] font-black text-primary-color/60 mt-1">Vanguard Authorized</div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 glass">
                  <Droplets size={16} className="text-red-500" />
                  <span className="font-black text-sm text-red-500">{Math.floor(bloodRations)}</span>
                </div>
                
                <button 
                  onClick={() => setResonatorActive(!isResonatorActive)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all glass ${
                    isResonatorActive ? 'bg-primary-color/20 border-primary-color text-primary-color shadow-lg' : 'bg-white/5 border-white/10 text-muted'
                  }`}
                >
                  <Zap size={16} />
                  <span className="font-black text-[10px] uppercase tracking-tighter">{isResonatorActive ? 'Resonator On' : 'Resonator'}</span>
                </button>

                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 glass">
                  <Coins size={16} className="text-accent-color" />
                  <span className="font-black text-sm text-accent-color">{gold.toLocaleString()}g</span>
                </div>
              </div>
            </header>

            <section className="animate-fade-in pb-20">
              {location === 'Respite' && (
                <div className="space-y-8">
                  <div className="glass p-10 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Castle size={200} />
                    </div>
                    <h3 className="text-3xl font-black mb-4 italic tracking-tighter">THE COMMAND HUB</h3>
                    <p className="text-muted leading-relaxed mb-8 text-lg">The Depths are quiet for now. Manage your guild, restore your party at the Infirmary, or forge new destiny in the Sanctified Wing. When ready, the Pit awaits.</p>
                    <div className="flex gap-4">
                      <button onClick={() => setLocation('The Pit')} className="btn-primary px-10 py-4 text-lg">Enter the Pit</button>
                      <button onClick={() => setLocation('Tavern')} className="btn-outline px-10 py-4 text-lg">Visit Tavern</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass p-6 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3 mb-4">
                        <Info className="text-primary-color" size={20} />
                        <h4 className="font-bold text-sm uppercase tracking-widest">Active Party</h4>
                      </div>
                      <div className="text-2xl font-black">{party.length + (mainCharacter ? 1 : 0)} / 4</div>
                      <div className="text-xs text-muted mt-1 uppercase tracking-tighter font-bold">Vanguard Members</div>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3 mb-4">
                        <Mountain className="text-secondary-color" size={20} />
                        <h4 className="font-bold text-sm uppercase tracking-widest">Current Depth</h4>
                      </div>
                      <div className="text-2xl font-black">Floor {currentFloor}</div>
                      <div className="text-xs text-muted mt-1 uppercase tracking-tighter font-bold">Maximum Pentration</div>
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
        </main>

        {/* Action Feed Side-Pane */}
        <aside className="hidden lg:flex w-[400px] bg-[#080808] border-l border-white/10 flex-col overflow-hidden">
          <ActionFeed events={events} onLayToRest={handleLayToRest} />
        </aside>
      </div>

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
