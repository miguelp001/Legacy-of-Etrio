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
  Castle,
  ChevronUp,
  Activity,
  LogOut,
  User,
  HelpCircle
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
import DepthMap from './components/DepthMap';
import VictoryScreen from './components/VictoryScreen';
import LoginScreen from './components/LoginScreen';
import VanguardMonitor from './components/VanguardMonitor';

const App: React.FC = () => {
  const { 
    gold, party, currentFloor, mainCharacter, 
    bloodRations, isResonatorActive, setResonatorActive, biome,
    isGameWon, playerId, isAuthenticated, user, loadProgress, saveProgress, syncGuildSettings,
    addEvents, addGold, setFloor, setLastLogout, setBloodRations, councilMembers, resonatorMastery, removeItems, lastLogout,
    location, setLocation, logout
  } = useGameStore();

  const [showMap, setShowMap] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const hasHandledSnapshot = useRef(false);
  
  const canDelve = party.every((m: any) => m.hp >= m.maxHp * 0.5) && 
    (!mainCharacter || mainCharacter.hp >= mainCharacter.maxHp * 0.5);
  const woundedCount = party.filter((m: any) => m.hp < m.maxHp * 0.5).length + 
    (mainCharacter && mainCharacter.hp < mainCharacter.maxHp * 0.5 ? 1 : 0);

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

  if (!isAuthenticated) return <LoginScreen />;

  const NavItem = ({ id, icon: Icon, label, mobileOnly = false }: { id: string, icon: any, label: string, mobileOnly?: boolean }) => (
    <button
      onClick={() => setLocation(id)}
      className={`flex flex-col items-center justify-center gap-1 px-1 py-2 h-full transition-all group relative ${
        location === id 
        ? 'text-primary-color' 
        : 'text-muted hover:text-white'
      } ${mobileOnly ? 'md:hidden' : ''} xl:flex-row xl:justify-start xl:px-4 xl:gap-4 xl:w-full`}
    >
      <Icon size={20} className={location === id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
      <span className="font-black text-[8px] uppercase tracking-tighter xl:text-[10px] xl:tracking-[0.1em]">{label}</span>
      {location === id && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary-color rounded-full shadow-[0_0_8px_var(--primary-glow)] xl:left-0 xl:translate-x-0 xl:w-1 xl:h-6 xl:top-1/2 xl:-translate-y-1/2" />
      )}
    </button>
  );

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-primary-color selection:text-white overflow-hidden relative">
      
      {/* MOBILE HEADER (Visible only on mobile/md) */}
      <header className={`
        xl:hidden z-50 shrink-0 border-b border-white/10 bg-black/50 backdrop-blur-xl px-4 transition-all duration-300
        ${isHeaderExpanded ? 'h-32' : 'h-14'}
      `}>
        <div className="h-14 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-color to-secondary-color flex items-center justify-center font-black italic shadow-lg">E</div>
            <h1 className="text-sm font-black tracking-tighter uppercase sm:text-lg">Legacy</h1>
          </div>

          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                <Coins size={14} className="text-accent-color" />
                <span className="font-black text-[10px] text-accent-color">{gold.toLocaleString()}</span>
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
           <div className="flex-1 flex gap-2">
             <button className="flex-1 glass p-2 flex flex-col justify-center items-center border-white/5 active:bg-white/10" title="Help">
               <HelpCircle size={12} className="text-muted" />
               <span className="font-black text-[8px] uppercase mt-1 text-muted">Help</span>
             </button>
             <button className="flex-1 glass p-2 flex flex-col justify-center items-center border-white/5 active:bg-white/10" title="Profile">
               <User size={12} className="text-muted" />
               <span className="font-black text-[8px] uppercase mt-1 text-muted">User</span>
             </button>
             <button onClick={() => logout()} className="flex-1 glass p-2 flex flex-col justify-center items-center border-red-500/20 active:bg-red-500/10" title="Logout">
               <LogOut size={12} className="text-red-500" />
               <span className="font-black text-[8px] uppercase mt-1 text-red-500">Exit</span>
             </button>
           </div>
        </div>
      </header>

      {/* THREE-COLUMN GRID CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 1. LEFT COLUMN: Command Sidebar (Persistent on Desktop) */}
        <aside className="hidden xl:flex flex-col w-72 bg-[#080808] border-r border-white/10 shrink-0 overflow-hidden">
          {/* Guild Brand */}
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-color to-secondary-color flex items-center justify-center font-black italic text-xl shadow-2xl">E</div>
              <div>
                <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Etrio</h1>
                <span className="text-[10px] text-primary-color font-bold uppercase tracking-[0.3em]">Guild Prime</span>
              </div>
            </div>

            {/* Core Stats Overview */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 glass border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Coins size={14} className="text-accent-color" />
                  <span className="text-[10px] font-black uppercase text-white/40">Gold</span>
                </div>
                <span className="font-black text-accent-color">{gold.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 glass border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Droplets size={14} className="text-red-500" />
                  <span className="text-[10px] font-black uppercase text-white/40">Rations</span>
                </div>
                <span className="font-black text-red-500">{Math.floor(bloodRations)}</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 space-y-8 custom-scrollbar">
              <div className="space-y-1">
                <h3 className="px-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">Expedition</h3>
                <NavItem id="Respite" icon={LayoutDashboard} label="Overview" />
                <NavItem id="The Pit" icon={Sword} label="The Pit" />
              </div>
              <div className="space-y-1">
                <h3 className="px-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">Operational Hubs</h3>
                <NavItem id="Tavern" icon={Users} label="Tavern" />
                <NavItem id="Hospital" icon={HeartPulse} label="Infirmary" />
                <NavItem id="Blacksmith" icon={Shield} label="Forge" />
                <NavItem id="Market" icon={Droplets} label="Blood Market" />
              </div>
              <div className="space-y-1">
                <h3 className="px-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">Ancient Tech</h3>
                <NavItem id="Forge" icon={Zap} label="Steam Forge" />
                <NavItem id="Basilica" icon={Sparkles} label="Basilica" />
              </div>

              <div className="space-y-1">
                <h3 className="px-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">System</h3>
                <button className="w-full flex items-center gap-4 px-8 py-3.5 text-muted hover:text-white hover:bg-white/5 transition-all group">
                  <HelpCircle size={18} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xs font-black uppercase tracking-widest">Help Center</span>
                </button>
                <button className="w-full flex items-center gap-4 px-8 py-3.5 text-muted hover:text-white hover:bg-white/5 transition-all group">
                  <User size={18} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xs font-black uppercase tracking-widest">{user?.username || 'Profile'}</span>
                </button>
                <button onClick={() => logout()} className="w-full flex items-center gap-4 px-8 py-3.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all group">
                  <LogOut size={18} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xs font-black uppercase tracking-widest">Terminate Session</span>
                </button>
              </div>
          </nav>

          {/* Resonator Desktop Toggle */}
          <div className="p-6 mt-auto border-t border-white/5">
            <button 
              onClick={() => setResonatorActive(!isResonatorActive)}
              className={`w-full p-4 glass rounded-2xl flex items-center justify-between transition-all group ${isResonatorActive ? 'border-primary-color/50 bg-primary-color/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-white/5 hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isResonatorActive ? 'bg-primary-color' : 'bg-white/5'}`}>
                  <Zap size={16} className={isResonatorActive ? 'text-white' : 'text-muted'} />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Resonator</div>
                  <div className="text-[8px] text-muted font-bold uppercase tracking-tighter">Level {resonatorMastery + 1}</div>
                </div>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${isResonatorActive ? 'bg-primary-color' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${isResonatorActive ? 'left-5' : 'left-1'}`} />
              </div>
            </button>
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
                    <div className="glass p-8 md:p-12 rounded-2xl border border-crimson/20 relative overflow-hidden group" style={{background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-color) 100%)'}}>
                      <div className="relative z-10 max-w-lg">
                        <h3 className="text-2xl md:text-4xl font-cinzel mb-4 uppercase tracking-wide text-bone leading-tight">The Depths<br/>Await Your Will</h3>
                        <p className="text-muted leading-relaxed mb-8 font-crimson">The ancient runes whisper of peril below. Your vanguard stands ready.</p>
                        <div className="flex flex-wrap gap-4">
                          {!canDelve && woundedCount > 0 ? (
                            <div className="text-warning-color text-sm font-cinzel uppercase tracking-tight px-4 py-2 rounded border border-warning-color/30 bg-warning-color/10">
                              {woundedCount} {woundedCount === 1 ? 'Member' : 'Members'} Wounded
                            </div>
                          ) : (
                            <button onClick={() => setLocation('The Pit')} className="btn-primary py-4 px-8 text-sm justify-center flex-1 sm:flex-none">Descend Into The Deep</button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                      <div className="glass p-4 rounded-xl border border-crimson/10 flex flex-col justify-between min-h-[100px]">
                        <div className="w-8 h-8 rounded bg-crimson/10 flex items-center justify-center text-crimson">
                          <Users size={16} />
                          <Users size={16} className="md:w-5 md:h-5" />
                        </div>
                        <div>
                          <div className="text-2xl font-cinzel tracking-tight">{party.length + (mainCharacter ? 1 : 0)}<span className="text-xs text-muted ml-1">/4</span></div>
                          <div className="text-[8px] text-muted uppercase font-cinzel tracking-wider">Vanguard</div>
                        </div>
                      </div>
                      <div className="glass p-4 rounded-xl border border-crimson/10 flex flex-col justify-between min-h-[100px]">
                        <div className="w-8 h-8 rounded bg-blood/30 flex items-center justify-center text-primary-light">
                          <Activity size={16} />
                        </div>
                        <div>
                          <div className="text-2xl font-cinzel tracking-tight truncate">{biome.split(' ')[0]}</div>
                          <div className="text-[8px] text-muted uppercase font-cinzel tracking-wider">Biome</div>
                        </div>
                      </div>
                      <div className="glass p-4 rounded-xl border border-gold/20 flex flex-col justify-between min-h-[100px]">
                        <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center text-gold">
                          <Castle size={16} />
                        </div>
                        <div>
                          <div className="text-2xl font-cinzel tracking-tight">{councilMembers.length}</div>
                          <div className="text-[8px] text-muted uppercase font-cinzel tracking-wider">Council</div>
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

        {/* 3. RIGHT COLUMN: Tactical Intel (Persistent on Widescreen) */}
        <aside className="hidden xl:flex flex-col xl:w-72 2xl:w-80 lg:w-96 border-l border-white/10 bg-[#080808] shrink-0 overflow-hidden">
             <VanguardMonitor />
        </aside>
      </div>

      {/* BOTTOM NAVIGATION (Mobile Only) */}
      <nav className="xl:hidden mobile-nav">
        <div className="flex px-2 gap-1 min-w-max items-center justify-between mx-auto w-full">
          <NavItem id="Respite" icon={LayoutDashboard} label="Home" />
          <NavItem id="The Pit" icon={Sword} label="The Pit" />
          <NavItem id="Tavern" icon={Users} label="Tavern" />
          <NavItem id="Hospital" icon={HeartPulse} label="Med" />
          <NavItem id="Blacksmith" icon={Shield} label="Smith" />
          <NavItem id="Market" icon={Droplets} label="Blood" />
        </div>
      </nav>

      {/* Overlays / Modals */}
      {!mainCharacter && <CharacterCreation />}
      {isGameWon && <VictoryScreen />}
      
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
