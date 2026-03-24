import React, { useState } from 'react';
import { X, Sword, Shield, Users, Heart, Castle, Sparkles, User, Scroll, Droplets, Coins, Trophy } from 'lucide-react';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const Help: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections: HelpSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <Scroll size={16} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            Legacy of Etrio is a dark fantasy dungeon crawler. Command your vanguard, descend into The Pit, 
            collect loot, and build your legacy across generations.
          </p>
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-white/60">Quick Start</h4>
            <div className="space-y-2 text-xs text-muted">
              <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg"><span className="text-primary-color font-bold">1</span> Create character in Town Square → Tavern</div>
              <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg"><span className="text-primary-color font-bold">2</span> Recruit NPCs to your party</div>
              <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg"><span className="text-primary-color font-bold">3</span> Enter The Pit and fight enemies</div>
              <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg"><span className="text-primary-color font-bold">4</span> Forge gear at Shops → Blacksmith</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'navigation',
      title: 'Navigation',
      icon: <Castle size={16} />,
      content: (
        <div className="space-y-4">
          <div className="grid gap-2">
            {[
              { name: 'Respite', desc: 'Main hub' },
              { name: 'The Pit', desc: 'Combat & dungeon' },
              { name: 'Shops', desc: 'Blacksmith & Alchemist' },
              { name: 'Town Square', desc: 'Tavern & Infirmary' },
              { name: 'The Guildhall', desc: 'Guild, Gate, Basilica' },
              { name: 'Lineage Hall', desc: 'Relationships & Trophies' },
              { name: 'Profile', desc: 'Stats, Achievements, Settings' }
            ].map(item => (
              <div key={item.name} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-xs text-muted">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'pit',
      title: 'The Pit',
      icon: <Sword size={16} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted">Your party fights automatically through rooms. Enemies drop gold and items.</p>
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-white/60">Room Types</h4>
            <div className="p-3 bg-white/5 rounded-xl text-xs"><span className="font-bold">Normal</span> - Combat encounter</div>
            <div className="p-3 bg-accent-color/10 rounded-xl text-xs border border-accent-color/20"><span className="font-bold">Boss</span> - Every 10 floors</div>
            <div className="p-3 bg-white/5 rounded-xl text-xs"><span className="font-bold">Rest</span> - Recover HP</div>
            <div className="p-3 bg-white/5 rounded-xl text-xs"><span className="font-bold">Loot</span> - Bonus rewards</div>
          </div>
          <div className="p-3 bg-primary-color/10 rounded-xl border border-primary-color/20">
            <span className="text-xs font-bold text-primary-color">Solo Bonus:</span>
            <span className="text-xs text-muted ml-2">+50% XP when fighting alone</span>
          </div>
        </div>
      )
    },
    {
      id: 'combat',
      title: 'Combat',
      icon: <Shield size={16} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted">Combat is automatic. Watch as your party battles enemies room by room.</p>
          <div className="space-y-2">
            <div className="p-3 bg-white/5 rounded-xl">
              <span className="text-xs font-bold">Stats:</span>
              <div className="text-[10px] text-muted mt-1">STR = Physical Damage | AGI = Speed | VIT = HP | INT = Magic | SPI = Healing | LCK = Loot/Crit</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
              <span className="text-xs font-bold">Solo Entry:</span>
              <div className="text-[10px] text-muted mt-1">Enter The Pit alone for 50% XP bonus. NPCs with &lt;50% HP stay behind.</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'shops',
      title: 'Shops',
      icon: <Shield size={16} />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-white/60">Blacksmith</h4>
            <p className="text-xs text-muted">Forge random gear, manage inventory, auto-sell items below rarity threshold.</p>
            <div className="p-2 bg-white/5 rounded-lg text-[10px]"><span className="font-bold">Forge:</span> 100g per item</div>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-white/60">Alchemist</h4>
            <p className="text-xs text-muted">Craft potions and consumables.</p>
          </div>
        </div>
      )
    },
    {
      id: 'town',
      title: 'Town Square',
      icon: <Users size={16} />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-white/60">Tavern</h4>
            <p className="text-xs text-muted">Recruit NPCs to your party (max 3). Hire from Thrall to Drengskapr tiers.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-white/60">Infirmary</h4>
            <p className="text-xs text-muted">Heal party members. Passive: 10% HP recovery every 30 seconds.</p>
            <div className="p-2 bg-secondary-color/10 rounded-lg border border-secondary-color/20">
              <span className="text-[10px] text-secondary-color font-bold">Rise From Death:</span>
              <span className="text-[10px] text-muted ml-1">Click to revive dead characters on Respite</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'guild',
      title: 'The Guildhall',
      icon: <Castle size={16} />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-white/60">Infrastructure</h4>
            <p className="text-xs text-muted">Upgrade Tavern, Hospital, Blacksmith with gold donations.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-white/60">The Gate</h4>
            <p className="text-xs text-muted">Community milestone. Players donate to unlock deeper floors for everyone.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-white/60">Basilica</h4>
            <p className="text-xs text-muted">Ascend party members to Council for passive bonuses.</p>
          </div>
        </div>
      )
    },
    {
      id: 'lineage',
      title: 'Lineage Hall',
      icon: <Sparkles size={16} />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-white/60">Greathall</h4>
            <p className="text-xs text-muted">Track party relationships. Partners gain affinity surviving floors together.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-white/60">Trophy Room</h4>
            <p className="text-xs text-muted">View achievements. Unlock trophies for floors, gold, bosses, and more.</p>
          </div>
        </div>
      )
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: <User size={16} />,
      content: (
        <div className="space-y-4">
          <p className="text-xs text-muted">View character stats, account info, and manage your account.</p>
          <div className="space-y-2">
            <div className="p-2 bg-white/5 rounded-lg text-[10px]"><span className="font-bold">Profile:</span> Character stats & level</div>
            <div className="p-2 bg-white/5 rounded-lg text-[10px]"><span className="font-bold">Trophies:</span> 20 achievements to unlock</div>
            <div className="p-2 bg-white/5 rounded-lg text-[10px]"><span className="font-bold">Settings:</span> Notifications, auto-save</div>
            <div className="p-2 bg-danger-color/10 rounded-lg text-[10px] border border-danger-color/20"><span className="font-bold text-danger-color">Danger Zone:</span> Delete account</div>
          </div>
        </div>
      )
    },
    {
      id: 'tips',
      title: 'Tips',
      icon: <Trophy size={16} />,
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-white/5 rounded-xl">
            <span className="text-xs font-bold">Resonator</span>
            <p className="text-[10px] text-muted mt-1">Activate for +10% bonus on all gains. Check header.</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl">
            <span className="text-xs font-bold">Passive Healing</span>
            <p className="text-[10px] text-muted mt-1">Visit Infirmary - HP restores 10% every 30s automatically.</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl">
            <span className="text-xs font-bold">Solo XP</span>
            <p className="text-[10px] text-muted mt-1">Fight alone for 50% XP bonus. Keep NPCs above 50% HP.</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl">
            <span className="text-xs font-bold">Auto-Sell</span>
            <p className="text-[10px] text-muted mt-1">Enable at Blacksmith to auto-sell low rarity items.</p>
          </div>
        </div>
      )
    }
  ];

  const activeContent = sections.find(s => s.id === activeSection);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fade-in">
      <div className="w-full max-w-4xl h-[85vh] bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-color/20 flex items-center justify-center">
              <Scroll size={20} className="text-primary-color" />
            </div>
            <div>
              <h2 className="text-xl font-cinzel uppercase tracking-wider">Grimoire of Etrio</h2>
              <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Game Guide</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-48 border-r border-white/5 overflow-y-auto custom-scrollbar shrink-0 bg-black/20">
            <div className="p-4 space-y-1">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    activeSection === section.id 
                      ? 'bg-primary-color/20 text-primary-color border border-primary-color/30' 
                      : 'text-muted hover:bg-white/5 hover:text-white text-xs font-bold uppercase tracking-wider'
                  }`}
                >
                  {section.icon}
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {activeContent?.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
