import React, { useState } from 'react';
import { X, ChevronRight, Shield, Sword, Heart, Users, Zap, Castle, Coins, Droplets, Scroll, Info, HelpCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const Help: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const { gold, bloodRations, pollutionLevel } = useGameStore();

  const sections: HelpSection[] = [
    {
      id: 'overview',
      title: 'Game Overview',
      icon: <Scroll size={16} />,
      content: (
        <div className="space-y-6">
          <div className="glass p-5 rounded-2xl border border-white/10">
            <h3 className="text-lg font-cinzel uppercase tracking-wider text-primary-color mb-3">What is Legacy of Etrio?</h3>
            <p className="text-muted text-sm leading-relaxed">
              Legacy of Etrio is a dark fantasy dungeon crawler where you command a vanguard of warriors,
              descending ever deeper into The Pit. Recruit allies, forge powerful equipment, and build
              your lineage across generations to face the horrors below.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white/60">Quick Start</h4>
            <div className="space-y-2 text-sm text-muted">
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <span className="text-primary-color font-black">1.</span>
                <p>Create your main character in the Tavern with a name and class</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <span className="text-primary-color font-black">2.</span>
                <p>Recruit NPC party members from the Mercenary Board</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <span className="text-primary-color font-black">3.</span>
                <p>Descend into The Pit to fight enemies and collect loot</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <span className="text-primary-color font-black">4.</span>
                <p>Forge better equipment at the Blacksmith to grow stronger</p>
              </div>
            </div>
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
          <p className="text-sm text-muted leading-relaxed">
            The Pit is your dungeon descent engine. Your party fights automatically through rooms,
            gaining gold, experience, and loot.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-accent-color">Room Types</h4>
            <div className="grid gap-2">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-sm font-medium">Normal Rooms</span>
                <span className="text-xs text-muted">Standard combat encounters</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent-color/10 rounded-xl border border-accent-color/20">
                <span className="text-sm font-medium">Boss Rooms</span>
                <span className="text-xs text-accent-color">Every 10 floors, face a Guardian</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-sm font-medium">Rest Rooms</span>
                <span className="text-xs text-muted">Recover a small amount of HP</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-sm font-medium">Loot Rooms</span>
                <span className="text-xs text-muted">Bonus gold and items</span>
              </div>
            </div>
          </div>

          <div className="glass p-4 rounded-xl border border-primary-color/20 bg-primary-color/5">
            <h4 className="text-sm font-black uppercase tracking-wider text-primary-color mb-2">Solo Bonus</h4>
            <p className="text-xs text-muted">
              If your main character fights alone (no wounded NPCs), XP gain is increased by 50%!
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-wider text-white/60">Biomes</h4>
            <p className="text-xs text-muted">
              Every 10 floors, the biome shifts: Frozen Caves → Crystalline Depths → Fungal Warrens → Volcanic Forge.
              Each biome has unique enemy types and modifiers.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'stats',
      title: 'Stats Guide',
      icon: <Shield size={16} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            Understanding stats is crucial for building effective party members.
          </p>

          <div className="space-y-3">
            {[
              { name: 'Strength (STR)', desc: 'Increases physical damage. Essential for Berserkers and Warriors.', color: 'text-red-400' },
              { name: 'Agility (AGI)', desc: 'Improves attack speed and dodge chance. Key for Rogues and Rangers.', color: 'text-green-400' },
              { name: 'Vitality (VIT)', desc: 'Boosts maximum HP and defense. Important for tanks and all classes.', color: 'text-yellow-400' },
              { name: 'Intelligence (INT)', desc: 'Enhances magical damage and MP pool. Critical for Mages and Clerics.', color: 'text-blue-400' },
              { name: 'Spirit (SPI)', desc: 'Increases healing power and MP regeneration. Vital for support classes.', color: 'text-purple-400' },
              { name: 'Luck (LCK)', desc: 'Improves loot quality and critical hit chance. Valuable for all builds.', color: 'text-amber-400' }
            ].map(stat => (
              <div key={stat.name} className="p-3 bg-white/5 rounded-xl">
                <h4 className={`text-sm font-black mb-1 ${stat.color}`}>{stat.name}</h4>
                <p className="text-xs text-muted">{stat.desc}</p>
              </div>
            ))}
          </div>

          <div className="glass p-4 rounded-xl border border-accent-color/20">
            <h4 className="text-sm font-black uppercase tracking-wider text-accent-color mb-2">Classes</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-white/60">Berserker:</span> <span className="text-red-400">STR focused</span></div>
              <div><span className="text-white/60">Rogue:</span> <span className="text-green-400">AGI focused</span></div>
              <div><span className="text-white/60">Paladin:</span> <span className="text-yellow-400">VIT focused</span></div>
              <div><span className="text-white/60">Mage:</span> <span className="text-blue-400">INT focused</span></div>
              <div><span className="text-white/60">Cleric:</span> <span className="text-purple-400">SPI focused</span></div>
              <div><span className="text-white/60">Ranger:</span> <span className="text-green-400">AGI/LCK</span></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'equipment',
      title: 'Equipment',
      icon: <Zap size={16} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            Equipment provides stat bonuses that enhance your party members' combat performance.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white/60">Rarity Tiers</h4>
            <div className="space-y-1.5">
              {[
                { tier: 'Common', color: 'text-white/60', bg: 'bg-white/5' },
                { tier: 'Uncommon', color: 'text-green-400', bg: 'bg-green-400/10' },
                { tier: 'Rare', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { tier: 'Epic', color: 'text-purple-400', bg: 'bg-purple-400/10' },
                { tier: 'Legendary', color: 'text-amber-400', bg: 'bg-amber-400/10' },
                { tier: 'Corrupted', color: 'text-red-400', bg: 'bg-red-400/10' },
                { tier: 'Abyssal', color: 'text-[#e0a7ff]', bg: 'bg-[#e0a7ff]/10' }
              ].map(r => (
                <div key={r.tier} className={`flex justify-between items-center p-2 ${r.bg} rounded-lg`}>
                  <span className={`text-xs font-medium ${r.color}`}>{r.tier}</span>
                  <span className="text-[10px] text-muted">{r.tier === 'Common' ? 'Basic' : r.tier === 'Abyssal' ? 'Max Power' : '+stats'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white/60">Forge Costs & Sell Values</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-white/5 rounded-lg">
                <span className="text-muted">Forge Cost:</span>
                <span className="ml-2 text-accent-color font-bold">100g</span>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <span className="text-muted">Common:</span>
                <span className="ml-2 text-accent-color font-bold">25g</span>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <span className="text-muted">Uncommon:</span>
                <span className="ml-2 text-accent-color font-bold">50g</span>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <span className="text-muted">Rare:</span>
                <span className="ml-2 text-accent-color font-bold">150g</span>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <span className="text-muted">Epic:</span>
                <span className="ml-2 text-accent-color font-bold">400g</span>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <span className="text-muted">Legendary:</span>
                <span className="ml-2 text-accent-color font-bold">1000g</span>
              </div>
            </div>
          </div>

          <div className="glass p-4 rounded-xl border border-primary-color/20">
            <h4 className="text-sm font-black uppercase tracking-wider text-primary-color mb-2">Auto-Processor</h4>
            <p className="text-xs text-muted">
              Enable auto-sell to automatically liquefy items at or below your selected rarity threshold.
              Great for keeping inventory clear while adventuring!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'party',
      title: 'Party & Recruitment',
      icon: <Users size={16} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            Your vanguard can have up to 4 members including your main character. Strategic party composition is key!
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white/60">Social Classes</h4>
            <div className="space-y-2">
              {[
                { name: 'Thrall', cost: '50g', desc: 'Common NPCs, good for early game' },
                { name: 'Bondi', cost: '200g', desc: 'Decent stats, moderate cost' },
                { name: 'Vardr', cost: '500g', desc: 'Strong NPCs, worth the investment' },
                { name: 'Scrifadr', cost: '1000g', desc: 'Elite warriors with high stats' },
                { name: 'Drengskapr', cost: '5000g', desc: 'Legendary heroes, extremely rare' }
              ].map(cls => (
                <div key={cls.name} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <div>
                    <span className="text-sm font-medium">{cls.name}</span>
                    <p className="text-[10px] text-muted">{cls.desc}</p>
                  </div>
                  <span className="text-accent-color font-bold text-sm">{cls.cost}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-4 rounded-xl border border-danger-color/20 bg-danger-color/5">
            <h4 className="text-sm font-black uppercase tracking-wider text-danger-color mb-2">Wounded Members</h4>
            <p className="text-xs text-muted">
              Party members below 50% HP are considered <strong className="text-white">Wounded</strong> and cannot
              descend into The Pit. Visit the Hospital to heal them, or wait for passive recovery.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-wider text-white/60">Vampires</h4>
            <p className="text-xs text-muted">
              Some NPCs are vampires with unique tribal bonuses. They cannot receive blessings but gain
              powerful blood-related stat increases.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'hospital',
      title: 'Hospital & Healing',
      icon: <Heart size={16} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            The Hospital provides healing services for your wounded party members.
          </p>

          <div className="space-y-3">
            <div className="p-4 bg-primary-color/10 rounded-xl border border-primary-color/20">
              <h4 className="text-sm font-black uppercase tracking-wider text-primary-color mb-2">Passive Healing</h4>
              <p className="text-xs text-muted">
                Wounded party members recover <strong className="text-white">10% HP every 30 seconds</strong> automatically.
                This continues even while you're offline!
              </p>
            </div>

            <div className="p-4 bg-accent-color/10 rounded-xl border border-accent-color/20">
              <h4 className="text-sm font-black uppercase tracking-wider text-accent-color mb-2">Instant Heal</h4>
              <p className="text-xs text-muted">
                Pay gold to instantly heal a party member to full HP. Cost scales with their maximum HP.
              </p>
            </div>

            <div className="p-4 bg-secondary-color/10 rounded-xl border border-secondary-color/20">
              <h4 className="text-sm font-black uppercase tracking-wider text-secondary-color mb-2">Heal All</h4>
              <p className="text-xs text-muted">
                For a flat fee, restore all party members to full health immediately.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'lineage',
      title: 'Lineage & Succession',
      icon: <Castle size={16} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            Build your legacy across generations! As party members fight together, they develop relationships
            that can lead to heirs.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white/60">Relationship Stages</h4>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['Stranger', 'Acquaintance', 'Companion', 'Ally', 'Friend', 'Close Friend', 'Soulmate'].map((stage, i) => (
                <div key={stage} className="shrink-0 px-3 py-2 bg-white/5 rounded-lg text-center">
                  <span className="text-[10px] text-muted">{i + 1}</span>
                  <p className="text-xs font-medium whitespace-nowrap">{stage}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-4 rounded-xl border border-accent-color/20">
            <h4 className="text-sm font-black uppercase tracking-wider text-accent-color mb-2">Succession Ritual</h4>
            <p className="text-xs text-muted">
              When two party members reach <strong className="text-white">Soulmate</strong> status, you can perform
              a Succession Ritual to birth an Heir. The Heir inherits bonus stats from their parents' combined
              generation level.
            </p>
          </div>

          <div className="p-4 bg-primary-color/10 rounded-xl border border-primary-color/20">
            <h4 className="text-sm font-black uppercase tracking-wider text-primary-color mb-2">Legacy Bonus</h4>
            <p className="text-xs text-muted">
              Each generation gains a cumulative <strong className="text-white">+10% stat growth bonus</strong>.
              Later generations start stronger but cost more to recruit!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'guild',
      title: 'Guild Hall',
      icon: <Castle size={16} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            Contribute to the Guild Hall to unlock permanent upgrades that benefit all players.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white/60">Guild Upgrades</h4>
            <div className="space-y-2">
              <div className="p-3 bg-white/5 rounded-xl">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Tavern</span>
                  <span className="text-xs text-accent-color">+10% NPC tier</span>
                </div>
                <p className="text-[10px] text-muted">Higher tier NPCs appear on the mercenary board</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Hospital</span>
                  <span className="text-xs text-accent-color">-10% heal time</span>
                </div>
                <p className="text-[10px] text-muted">Passive healing works faster</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Blacksmith</span>
                  <span className="text-xs text-accent-color">-15% forge costs</span>
                </div>
                <p className="text-[10px] text-muted">Discount on item forging</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-accent-color/10 rounded-xl border border-accent-color/20">
            <h4 className="text-sm font-black uppercase tracking-wider text-accent-color mb-2">Council Members</h4>
            <p className="text-xs text-muted">
              Ascended party members join your Council, providing <strong className="text-white">+5% gold gain per member</strong>.
              They no longer fight but provide permanent passive bonuses.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'blood',
      title: 'Blood Market',
      icon: <Droplets size={16} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            The Blood Market trades in exotic resources that provide powerful effects.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white/60">Resources</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <div>
                  <span className="text-sm font-medium">Blood Rations</span>
                  <p className="text-[10px] text-muted">Required for dungeon descent</p>
                </div>
                <span className="text-danger-color font-bold">{Math.floor(bloodRations)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <div>
                  <span className="text-sm font-medium">Pollution</span>
                  <p className="text-[10px] text-muted">Reduces NPC hire effectiveness</p>
                </div>
                <span className="text-warning-color font-bold">{pollutionLevel}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary-color/10 rounded-xl border border-primary-color/20">
            <h4 className="text-sm font-black uppercase tracking-wider text-primary-color mb-2">Resonator</h4>
            <p className="text-xs text-muted">
              A powerful artifact that provides <strong className="text-white">+10% resonator mastery bonus</strong> to all gains.
              Its power grows as you collect more shards.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'offline',
      title: 'Offline Progress',
      icon: <Zap size={16} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            Continue progressing even when you're away! The game calculates gains based on time elapsed.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white/60">What's Calculated</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Coins size={14} className="text-accent-color" />
                <span className="text-sm">Gold earned from enemies</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Sword size={14} className="text-danger-color" />
                <span className="text-sm">Floor progression</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Shield size={14} className="text-primary-color" />
                <span className="text-sm">Auto-sold items (if enabled)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Heart size={14} className="text-danger-color" />
                <span className="text-sm">Passive healing</span>
              </div>
            </div>
          </div>

          <div className="glass p-4 rounded-xl border border-accent-color/20">
            <h4 className="text-sm font-black uppercase tracking-wider text-accent-color mb-2">Maximizing Gains</h4>
            <ul className="text-xs text-muted space-y-1">
              <li>• Keep your resonator active</li>
              <li>• Have more council members for bonuses</li>
              <li>• Enable auto-sell for better gold efficiency</li>
              <li>• Higher floors = more gold per minute</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'controls',
      title: 'Controls',
      icon: <HelpCircle size={16} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            Master these controls for the best experience.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white/60">Mobile Navigation</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-sm">Bottom Nav Bar</span>
                <span className="text-xs text-muted">Quick access to all screens</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-sm">Ancient Tech Menu</span>
                <span className="text-xs text-muted">Advanced locations (right arrow)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-sm">Swipe Gestures</span>
                <span className="text-xs text-muted">Navigate between screens</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white/60">Desktop</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-sm">Left Sidebar</span>
                <span className="text-xs text-muted">Full navigation menu</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-sm">Right Panel</span>
                <span className="text-xs text-muted">Vanguard monitor</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const activeContent = sections.find(s => s.id === activeSection);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fade-in">
      <div className="w-full max-w-4xl h-[85vh] bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-color/20 flex items-center justify-center">
              <HelpCircle size={20} className="text-primary-color" />
            </div>
            <div>
              <h2 className="text-xl font-cinzel uppercase tracking-wider">Grimoire of Etrio</h2>
              <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Comprehensive Guide</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-56 border-r border-white/5 overflow-y-auto custom-scrollbar shrink-0 bg-black/20">
            <div className="p-4 space-y-1">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeSection === section.id 
                      ? 'bg-primary-color/20 text-primary-color border border-primary-color/30' 
                      : 'text-muted hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {section.icon}
                  <span className="text-xs font-bold uppercase tracking-wider">{section.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {activeContent?.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
