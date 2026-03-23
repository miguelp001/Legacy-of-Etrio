import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Sword, 
  HeartPulse, 
  Shield, 
  LayoutDashboard,
  Coins,
  Sparkles,
  Castle,
  User,
  HelpCircle
} from 'lucide-react';
import { useGameStore } from './store/gameStore';

const API_BASE = import.meta.env.VITE_API_URL || '';
import Tavern from './components/Tavern';
import Blacksmith from './components/Blacksmith';
import Hospital from './components/Hospital';
import GuildHall from './components/GuildHall';
import ThePit from './components/ThePit';
import LineageHall from './components/LineageHall';
import Basilica from './components/Basilica';
import CharacterCreation from './components/CharacterCreation';
import DepthMap from './components/DepthMap';
import VictoryScreen from './components/VictoryScreen';
import LoginScreen from './components/LoginScreen';
import VanguardMonitor from './components/VanguardMonitor';
import Help from './components/Help';
import Tooltip from './components/Tooltip';
import Profile from './components/Profile';

const App: React.FC = () => {
  const { 
    gold, party, currentFloor, mainCharacter,
    isGameWon, playerId, isAuthenticated, loadProgress, saveProgress,
    addEvents, addGold, setFloor, setLastLogout, councilMembers, removeItems, lastLogout,
    location, setLocation, logout
  } = useGameStore();

  const [showMap, setShowMap] = useState(false);
  const [lastSnapshotData, setLastSnapshotData] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);
  const hasHandledSnapshot = useRef(false);
  
  const woundedCount = party.filter((m: any) => m.hp < m.maxHp * 0.5).length;
  const isDead = mainCharacter && mainCharacter.hp <= 0;
  const canEnter = mainCharacter && mainCharacter.hp > 0;

  useEffect(() => {
    if (isAuthenticated && playerId) {
      loadProgress(playerId);
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
              playerId: playerId
            })
          });
          const data = await response.json();
            if (data.events) {
            addEvents(data.events || []);
            const councilBonus = 1 + (councilMembers.length * 0.05);
            const effectiveGold = Math.floor(data.gold * councilBonus);
            addGold(effectiveGold);
            setFloor(data.finalFloor);
            setLastSnapshotData(data);
            setShowMap(true);

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
  }, [isAuthenticated, mainCharacter, lastLogout, party, currentFloor, addEvents, addGold, setFloor, setLastLogout, councilMembers, removeItems]);

  if (!isAuthenticated) return <LoginScreen />;

  const NavItem = ({ id, icon: Icon, label, mobileOnly = false, tooltip }: { id: string, icon: any, label: string, mobileOnly?: boolean, tooltip?: string }) => {
    const navButton = (
      <button
        onClick={() => setLocation(id)}
        className={`flex flex-col items-center justify-center gap-1 px-2 py-2 h-full transition-all group relative ${
          location === id 
          ? 'text-primary-color' 
          : 'text-muted hover:text-primary-light'
        } ${mobileOnly ? 'md:hidden' : ''} xl:flex-row xl:justify-start xl:px-4 xl:gap-4 xl:w-full`}
      >
        <Icon size={18} className={location === id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
        <span className="font-cinzel text-[9px] uppercase tracking-wider">{label}</span>
        {location === id && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-crimson rounded-full shadow-[0_0_8px_var(--primary-glow)] xl:left-0 xl:translate-x-0 xl:w-1 xl:h-6 xl:top-1/2 xl:-translate-y-1/2" />
        )}
      </button>
    );
    return tooltip ? <Tooltip content={tooltip} position="top">{navButton}</Tooltip> : navButton;
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-primary-color selection:text-white overflow-hidden relative">
      
      {/* MOBILE HEADER - Minimal */}
      <header className="xl:hidden z-50 shrink-0 border-b border-white/10 bg-black/50 backdrop-blur-xl px-4 h-14 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-color to-secondary-color flex items-center justify-center font-black italic shadow-lg">E</div>
          <h1 className="text-sm font-black tracking-tighter uppercase">Legacy</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
            <Coins size={14} className="text-accent-color" />
            <span className="font-black text-[10px] text-accent-color">{gold.toLocaleString()}</span>
          </div>
          <Tooltip content="Help guide" position="bottom">
            <button onClick={() => setShowHelp(true)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted active:scale-95">
              <HelpCircle size={16} />
            </button>
          </Tooltip>
        </div>
      </header>

      {/* THREE-COLUMN GRID CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 1. LEFT COLUMN: Command Sidebar (Persistent on Desktop) */}
        <aside className="hidden xl:flex flex-col w-64 bg-[#080808] border-r border-white/10 shrink-0 overflow-hidden">
          {/* Guild Brand */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-color to-secondary-color flex items-center justify-center font-black italic text-xl shadow-2xl">E</div>
              <div>
                <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Etrio</h1>
                <span className="text-[10px] text-primary-color font-bold uppercase tracking-[0.3em]">Guild</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar">
            <NavItem id="Respite" icon={LayoutDashboard} label="Overview" tooltip="Return to the Respite hub" />
            <NavItem id="The Pit" icon={Sword} label="The Pit" tooltip="Enter the dungeon" />
            <NavItem id="Tavern" icon={Users} label="Tavern" tooltip="Recruit mercenaries" />
            <NavItem id="Hospital" icon={HeartPulse} label="Infirmary" tooltip="Heal wounded" />
            <NavItem id="Blacksmith" icon={Shield} label="Smith" tooltip="Forge equipment" />
            <NavItem id="Guild Hall" icon={Castle} label="Guild" tooltip="Upgrades & donations" />
            <NavItem id="Lineage" icon={Users} label="Lineage" tooltip="Relationships" />
            <NavItem id="Basilica" icon={Sparkles} label="Basilica" tooltip="Rituals" />
            <NavItem id="Profile" icon={User} label="Profile" tooltip="Settings & account" />
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/5 space-y-2">
            <Tooltip content="Help guide" position="right">
              <button onClick={() => setShowHelp(true)} className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-muted hover:bg-white/10 transition-all">
                <span className="text-xs font-black uppercase tracking-wide">Help</span>
              </button>
            </Tooltip>
          </div>
        </aside>

        {/* 2. CENTER COLUMN: Active Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-[var(--bg-color)] relative overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar thumb-scroll scroll-smooth">
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
              {location !== 'The Pit' && (
                <header className="flex items-end justify-between border-b border-crimson/20 pb-4">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-cinzel uppercase tracking-wider text-bone leading-none">{location}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
                      <span className="text-[10px] uppercase font-cinzel tracking-[0.2em] text-muted">Active</span>
                    </div>
                  </div>
                  <div className="hidden md:block text-right pb-1">
                    <div className="text-[10px] font-cinzel uppercase tracking-widest text-muted">Floor</div>
                    <div className="text-2xl font-cinzel text-gold">{currentFloor}F</div>
                  </div>
                </header>
              )}

              <section className="animate-fade-in relative">
                {location === 'Respite' && (
                  <div className="space-y-6">
                    <div className="glass p-8 md:p-12 rounded-2xl border border-crimson/20 relative overflow-hidden" style={{background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-color) 100%)'}}>
                      <div className="max-w-lg">
                        <h3 className="text-2xl md:text-4xl font-cinzel mb-4 uppercase tracking-wide text-bone leading-tight">The Depths<br/>Await Your Will</h3>
                        <p className="text-muted leading-relaxed mb-6 font-crimson">The ancient runes whisper of peril below.</p>
                        {!canEnter ? (
                            <div className="space-y-3">
                              <span className="inline-flex items-center gap-2 text-danger-color text-sm font-cinzel uppercase tracking-tight px-4 py-2 rounded border border-danger-color/30 bg-danger-color/10">
                                {isDead ? 'Character Fallen' : 'Cannot Descend'}
                              </span>
                              {isDead && (
                                <button 
                                  onClick={() => {
                                    const newMc = { ...mainCharacter, hp: mainCharacter.maxHp, recoveryUntil: 0 };
                                    useGameStore.setState({ mainCharacter: newMc });
                                  }}
                                  className="block w-full py-3 bg-secondary-color text-white rounded-xl font-black uppercase text-sm"
                                >
                                  Rise From Death
                                </button>
                              )}
                            </div>
                          ) : woundedCount > 0 ? (
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button onClick={() => setLocation('The Pit')} className="btn-primary py-4 px-8 text-sm">
                                Descend Solo ({woundedCount} wounded)
                              </button>
                              <span className="inline-flex items-center gap-2 text-warning-color text-sm font-cinzel uppercase tracking-tight px-4 py-2 rounded border border-warning-color/30 bg-warning-color/10">
                                {woundedCount} {woundedCount === 1 ? 'Member' : 'Members'} Wounded
                              </span>
                            </div>
                          ) : (
                            <button onClick={() => setLocation('The Pit')} className="btn-primary py-4 px-8 text-sm">
                              Descend Into The Deep
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                )}
                {location === 'The Pit' && <ThePit />}
                {location === 'Tavern' && <Tavern />}
                {location === 'Hospital' && <Hospital />}
                {location === 'Blacksmith' && <Blacksmith />}
                {location === 'Basilica' && <Basilica />}
                {location === 'Guild Hall' && <GuildHall />}
                {location === 'Lineage' && <LineageHall />}
                {location === 'Profile' && <Profile />}
              </section>
            </div>
          </div>
        </main>

        {/* 3. RIGHT COLUMN: Tactical Intel (Persistent on Widescreen) */}
        <aside className="hidden xl:flex flex-col xl:w-72 2xl:w-80 lg:w-96 border-l border-white/10 bg-[#080808] shrink-0 overflow-hidden">
             <VanguardMonitor />
        </aside>
      </div>

      {/* BOTTOM NAVIGATION (Mobile Only) */}
      <nav className="xl:hidden mobile-nav">
        <div className="flex px-2 gap-1 items-center justify-between mx-auto w-full">
          <NavItem id="Respite" icon={LayoutDashboard} label="Home" tooltip="Return to Respite hub" />
          <NavItem id="The Pit" icon={Sword} label="Pit" tooltip="Enter the dungeon" />
          <NavItem id="Tavern" icon={Users} label="Tavern" tooltip="Recruit party members" />
          <NavItem id="Blacksmith" icon={Shield} label="Smith" tooltip="Forge equipment" />
          <NavItem id="Guild Hall" icon={Castle} label="Guild" tooltip="Guild upgrades" />
          <NavItem id="Profile" icon={User} label="Profile" tooltip="Profile and settings" />
        </div>
      </nav>

      {/* Overlays / Modals */}
      {!mainCharacter && <CharacterCreation />}
      {isGameWon && <VictoryScreen />}
      {showHelp && <Help onClose={() => setShowHelp(false)} />}
      
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
    </div>
  );
};

export default App;
