import React, { useState, useMemo } from 'react';
import { Trophy, Lock, Check, Star, Sword, Shield, Users, Coins, Crown, Heart, Zap, Target, Skull, Castle, Scroll, Droplets, Flame, Snowflake, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    category: string;
    condition: (stats: AchievementStats) => boolean;
    reward?: string;
}

interface AchievementStats {
    floor: number;
    gold: number;
    partySize: number;
    councilSize: number;
    generation: number;
    itemsCollected: number;
    bossesDefeated: number;
    daysPlayed: number;
    npcsRecruited: number;
    soloRuns: number;
    legendaryItems: number;
    maxLevel: number;
    biomesCleared: number;
    totalDamage: number;
    totalHealing: number;
    riddlesSolved: number;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'Combat': <Sword size={14} />,
    'Progression': <Crown size={14} />,
    'Collection': <Star size={14} />,
    'Social': <Users size={14} />,
    'Mastery': <Trophy size={14} />,
    'Secret': <Sparkles size={14} />
};

const ACHIEVEMENTS: Achievement[] = [
    // COMBAT ACHIEVEMENTS (1-15)
    { id: 'first_blood', name: 'First Blood', description: 'Defeat your first enemy in The Pit', icon: <Sword size={16} />, rarity: 'common', category: 'Combat', condition: (s) => s.floor >= 1 },
    { id: 'floor_10', name: 'Descent Initiate', description: 'Reach Floor 10', icon: <Sword size={16} />, rarity: 'common', category: 'Combat', condition: (s) => s.floor >= 10 },
    { id: 'floor_25', name: 'Pit Diver', description: 'Reach Floor 25', icon: <Sword size={16} />, rarity: 'rare', category: 'Combat', condition: (s) => s.floor >= 25 },
    { id: 'floor_50', name: 'Depth Walker', description: 'Reach Floor 50', icon: <Sword size={16} />, rarity: 'epic', category: 'Combat', condition: (s) => s.floor >= 50 },
    { id: 'floor_100', name: 'Abyss Treader', description: 'Reach Floor 100', icon: <Sword size={16} />, rarity: 'legendary', category: 'Combat', condition: (s) => s.floor >= 100 },
    { id: 'boss_slayer', name: 'Guardian Bane', description: 'Defeat your first Boss', icon: <Skull size={16} />, rarity: 'common', category: 'Combat', condition: (s) => s.bossesDefeated >= 1 },
    { id: 'boss_hunter', name: 'Champion of the Deep', description: 'Defeat 10 Bosses', icon: <Skull size={16} />, rarity: 'rare', category: 'Combat', condition: (s) => s.bossesDefeated >= 10 },
    { id: 'boss_legend', name: 'The Undying', description: 'Defeat 25 Bosses', icon: <Skull size={16} />, rarity: 'epic', category: 'Combat', condition: (s) => s.bossesDefeated >= 25 },
    { id: 'solo_warrior', name: 'Lone Wolf', description: 'Complete a floor with no party members', icon: <Sword size={16} />, rarity: 'rare', category: 'Combat', condition: (s) => s.soloRuns >= 1 },
    { id: 'solo_master', name: 'Iron Will', description: 'Complete 10 solo runs', icon: <Sword size={16} />, rarity: 'epic', category: 'Combat', condition: (s) => s.soloRuns >= 10 },
    { id: 'damage_dealer', name: 'Whirlwind of Steel', description: 'Deal 10,000 total damage', icon: <Target size={16} />, rarity: 'rare', category: 'Combat', condition: (s) => s.totalDamage >= 10000 },
    { id: 'damage_god', name: 'Harbinger of Doom', description: 'Deal 100,000 total damage', icon: <Target size={16} />, rarity: 'legendary', category: 'Combat', condition: (s) => s.totalDamage >= 100000 },
    { id: 'tank', name: 'Unbreaking Wall', description: 'Survive 1,000 hits', icon: <Shield size={16} />, rarity: 'rare', category: 'Combat', condition: (s) => s.totalHealing >= 1000 },
    { id: 'healer', name: 'Hands of the Divine', description: 'Heal 5,000 HP total', icon: <Heart size={16} />, rarity: 'rare', category: 'Combat', condition: (s) => s.totalHealing >= 5000 },
    { id: 'riddle_master', name: 'Oracle\'s Favor', description: 'Solve 5 dungeon riddles', icon: <Scroll size={16} />, rarity: 'epic', category: 'Combat', condition: (s) => s.riddlesSolved >= 5 },

    // PROGRESSION ACHIEVEMENTS (16-25)
    { id: 'level_5', name: 'Rising Star', description: 'Reach Level 5 with any character', icon: <Star size={16} />, rarity: 'common', category: 'Progression', condition: (s) => s.maxLevel >= 5 },
    { id: 'level_10', name: 'Seasoned Warrior', description: 'Reach Level 10', icon: <Star size={16} />, rarity: 'rare', category: 'Progression', condition: (s) => s.maxLevel >= 10 },
    { id: 'level_25', name: 'Veteran of Etrio', description: 'Reach Level 25', icon: <Star size={16} />, rarity: 'epic', category: 'Progression', condition: (s) => s.maxLevel >= 25 },
    { id: 'level_50', name: 'Legend Ascendant', description: 'Reach Level 50', icon: <Crown size={16} />, rarity: 'legendary', category: 'Progression', condition: (s) => s.maxLevel >= 50 },
    { id: 'rich_10k', name: 'Coin Collector', description: 'Accumulate 10,000 gold', icon: <Coins size={16} />, rarity: 'common', category: 'Progression', condition: (s) => s.gold >= 10000 },
    { id: 'rich_100k', name: 'Treasure Hoarder', description: 'Accumulate 100,000 gold', icon: <Coins size={16} />, rarity: 'rare', category: 'Progression', condition: (s) => s.gold >= 100000 },
    { id: 'rich_million', name: 'Gold Tyrant', description: 'Accumulate 1,000,000 gold', icon: <Coins size={16} />, rarity: 'epic', category: 'Progression', condition: (s) => s.gold >= 1000000 },
    { id: 'rich_emperor', name: 'Dragon\'s Hoard', description: 'Accumulate 10,000,000 gold', icon: <Coins size={16} />, rarity: 'legendary', category: 'Progression', condition: (s) => s.gold >= 10000000 },
    { id: 'gen_2', name: 'Bloodline Begins', description: 'Reach Generation 2', icon: <Crown size={16} />, rarity: 'rare', category: 'Progression', condition: (s) => s.generation >= 2 },
    { id: 'gen_5', name: 'Dynasty Builder', description: 'Reach Generation 5', icon: <Crown size={16} />, rarity: 'epic', category: 'Progression', condition: (s) => s.generation >= 5 },
    { id: 'gen_10', name: 'Legacy Eternal', description: 'Reach Generation 10', icon: <Crown size={16} />, rarity: 'legendary', category: 'Progression', condition: (s) => s.generation >= 10 },

    // COLLECTION ACHIEVEMENTS (26-35)
    { id: 'first_item', name: 'Armed & Ready', description: 'Equip your first item', icon: <Shield size={16} />, rarity: 'common', category: 'Collection', condition: (s) => s.itemsCollected >= 1 },
    { id: 'collector_10', name: 'Trophy Keeper', description: 'Collect 10 items', icon: <Shield size={16} />, rarity: 'common', category: 'Collection', condition: (s) => s.itemsCollected >= 10 },
    { id: 'collector_50', name: 'Artifact Collector', description: 'Collect 50 items', icon: <Shield size={16} />, rarity: 'rare', category: 'Collection', condition: (s) => s.itemsCollected >= 50 },
    { id: 'collector_100', name: 'Museum Curator', description: 'Collect 100 items', icon: <Shield size={16} />, rarity: 'epic', category: 'Collection', condition: (s) => s.itemsCollected >= 100 },
    { id: 'legendary_1', name: 'Fated Find', description: 'Obtain your first Legendary item', icon: <Star size={16} />, rarity: 'rare', category: 'Collection', condition: (s) => s.legendaryItems >= 1 },
    { id: 'legendary_5', name: 'Fortune\'s Favorite', description: 'Obtain 5 Legendary items', icon: <Star size={16} />, rarity: 'epic', category: 'Collection', condition: (s) => s.legendaryItems >= 5 },
    { id: 'legendary_10', name: 'Legend Among Men', description: 'Obtain 10 Legendary items', icon: <Crown size={16} />, rarity: 'legendary', category: 'Collection', condition: (s) => s.legendaryItems >= 10 },
    { id: 'biome_2', name: 'World Walker', description: 'Visit 2 different biomes', icon: <Snowflake size={16} />, rarity: 'common', category: 'Collection', condition: (s) => s.biomesCleared >= 2 },
    { id: 'biome_4', name: 'Elemental Master', description: 'Visit all 4 biomes', icon: <Flame size={16} />, rarity: 'epic', category: 'Collection', condition: (s) => s.biomesCleared >= 4 },
    { id: 'full_inventory', name: 'Burdened', description: 'Fill your entire inventory (50 slots)', icon: <Shield size={16} />, rarity: 'rare', category: 'Collection', condition: (s) => s.itemsCollected >= 50 },

    // SOCIAL ACHIEVEMENTS (36-42)
    { id: 'first_party', name: 'Vanguard Assembled', description: 'Recruit your first party member', icon: <Users size={16} />, rarity: 'common', category: 'Social', condition: (s) => s.npcsRecruited >= 1 },
    { id: 'full_party', name: 'Full Strength', description: 'Have a full party of 4 members', icon: <Users size={16} />, rarity: 'rare', category: 'Social', condition: (s) => s.partySize >= 4 },
    { id: 'recruiter_5', name: 'Mercenary Lord', description: 'Recruit 5 total NPCs', icon: <Users size={16} />, rarity: 'rare', category: 'Social', condition: (s) => s.npcsRecruited >= 5 },
    { id: 'council_1', name: 'First Council', description: 'Ascend your first party member', icon: <Castle size={16} />, rarity: 'rare', category: 'Social', condition: (s) => s.councilSize >= 1 },
    { id: 'council_3', name: 'Council of Elders', description: 'Have 3 Council members', icon: <Castle size={16} />, rarity: 'epic', category: 'Social', condition: (s) => s.councilSize >= 3 },
    { id: 'council_5', name: 'The Eternal Court', description: 'Have 5 Council members', icon: <Castle size={16} />, rarity: 'legendary', category: 'Social', condition: (s) => s.councilSize >= 5 },
    { id: 'vampire_hunter', name: 'Blood Hunter', description: 'Recruit a vampire party member', icon: <Droplets size={16} />, rarity: 'rare', category: 'Social', condition: (s) => s.npcsRecruited >= 1 },

    // MASTERY ACHIEVEMENTS (43-48)
    { id: 'first_day', name: 'Initiation Complete', description: 'Play for 1 day', icon: <Trophy size={16} />, rarity: 'common', category: 'Mastery', condition: (s) => s.daysPlayed >= 1 },
    { id: 'week_warrior', name: 'Dedicated Adventurer', description: 'Play for 7 days', icon: <Trophy size={16} />, rarity: 'rare', category: 'Mastery', condition: (s) => s.daysPlayed >= 7 },
    { id: 'month_master', name: 'Veteran of Etrio', description: 'Play for 30 days', icon: <Trophy size={16} />, rarity: 'epic', category: 'Mastery', condition: (s) => s.daysPlayed >= 30 },
    { id: 'year_legend', name: 'Ancient One', description: 'Play for 365 days', icon: <Crown size={16} />, rarity: 'legendary', category: 'Mastery', condition: (s) => s.daysPlayed >= 365 },
    { id: 'all_stats_100', name: 'Paragon', description: 'Have all stats above 100 on any character', icon: <Star size={16} />, rarity: 'legendary', category: 'Mastery', condition: (s) => s.maxLevel >= 20 },
    { id: 'perfect_run', name: 'Flawless Victory', description: 'Complete a floor with no deaths', icon: <Shield size={16} />, rarity: 'epic', category: 'Mastery', condition: (s) => s.floor >= 5 },

    // SECRET ACHIEVEMENTS (49-50)
    { id: 'hidden_1', name: '???', description: '???', icon: <Sparkles size={16} />, rarity: 'legendary', category: 'Secret', condition: () => false },
    { id: 'hidden_2', name: '???', description: '???', icon: <Sparkles size={16} />, rarity: 'legendary', category: 'Secret', condition: () => false }
];

const RARITY_COLORS: Record<string, { bg: string, border: string, text: string, glow: string }> = {
    common: { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white/60', glow: '' },
    rare: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]' },
    epic: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]' },
    legendary: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]' }
};

const Achievements: React.FC = () => {
    const { mainCharacter, party, gold, currentFloor, councilMembers, inventory } = useGameStore();
    
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterRarity, setFilterRarity] = useState<string>('all');
    const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

    const achievementStats: AchievementStats = useMemo(() => ({
        floor: currentFloor,
        gold: gold,
        partySize: party.length + (mainCharacter ? 1 : 0),
        councilSize: councilMembers.length,
        generation: mainCharacter?.generation || 0,
        itemsCollected: inventory.length,
        bossesDefeated: Math.floor(currentFloor / 10),
        daysPlayed: Math.floor((Date.now() - (mainCharacter ? 1577836800000 : Date.now())) / (1000 * 60 * 60 * 24)),
        npcsRecruited: party.length,
        soloRuns: 0,
        legendaryItems: inventory.filter(i => i.rarity === 'Legendary' || i.rarity === 'Abyssal').length,
        maxLevel: mainCharacter?.level || 0,
        biomesCleared: Math.floor(currentFloor / 10),
        totalDamage: currentFloor * 100,
        totalHealing: currentFloor * 50,
        riddlesSolved: 0
    }), [currentFloor, gold, party, mainCharacter, councilMembers, inventory]);

    const unlockedAchievements = useMemo(() => {
        return ACHIEVEMENTS.filter(a => a.condition(achievementStats));
    }, [achievementStats]);

    const filteredAchievements = useMemo(() => {
        return ACHIEVEMENTS.filter(a => {
            if (showOnlyUnlocked && !unlockedAchievements.find(u => u.id === a.id)) return false;
            if (filterCategory !== 'all' && a.category !== filterCategory) return false;
            if (filterRarity !== 'all' && a.rarity !== filterRarity) return false;
            return true;
        });
    }, [filterCategory, filterRarity, showOnlyUnlocked, unlockedAchievements]);

    const categories = ['all', ...new Set(ACHIEVEMENTS.map(a => a.category))];
    const rarities = ['all', 'common', 'rare', 'epic', 'legendary'];

    const completionPercent = Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100);

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/20 flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10">
                    <Trophy size={24} className="text-amber-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-cinzel uppercase tracking-wider text-bone">Achievements</h2>
                    <p className="text-xs text-muted font-bold uppercase tracking-widest">
                        {unlockedAchievements.length} / {ACHIEVEMENTS.length} Unlocked ({completionPercent}%)
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="glass p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/40">Total Progress</span>
                    <span className="text-sm font-black text-amber-400">{completionPercent}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                filterCategory === cat ? 'bg-primary-color text-white' : 'bg-white/5 text-muted hover:bg-white/10'
                            }`}
                        >
                            {cat === 'all' ? 'All' : CATEGORY_ICONS[cat]}
                            {cat !== 'all' && <span className="ml-1">{cat}</span>}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    {rarities.map(rar => (
                        <button
                            key={rar}
                            onClick={() => setFilterRarity(rar)}
                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
                                filterRarity === rar 
                                    ? rar === 'legendary' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : rar === 'epic' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : rar === 'rare' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-primary-color text-white'
                                    : 'bg-white/5 text-muted hover:bg-white/10'
                            }`}
                        >
                            {rar === 'all' ? 'All Rarity' : rar}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
                        className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
                            showOnlyUnlocked ? 'bg-secondary-color/20 text-secondary-color border border-secondary-color/30' : 'bg-white/5 text-muted hover:bg-white/10'
                        }`}
                    >
                        Unlocked Only
                    </button>
                </div>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredAchievements.map(achievement => {
                    const isUnlocked = unlockedAchievements.find(u => u.id === achievement.id);
                    const rarityStyle = RARITY_COLORS[achievement.rarity];
                    
                    return (
                        <div 
                            key={achievement.id}
                            className={`glass p-4 rounded-2xl border transition-all ${
                                isUnlocked 
                                    ? `${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.glow}` 
                                    : 'border-white/5 opacity-50'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    isUnlocked 
                                        ? rarityStyle.bg 
                                        : 'bg-white/5'
                                }`}>
                                    {isUnlocked ? (
                                        <div className={rarityStyle.text}>{achievement.icon}</div>
                                    ) : (
                                        <Lock size={16} className="text-white/20" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`text-sm font-black truncate ${isUnlocked ? rarityStyle.text : 'text-white/40'}`}>
                                            {achievement.name}
                                        </h4>
                                        {isUnlocked && <Check size={12} className="text-green-400 shrink-0" />}
                                    </div>
                                    <p className="text-[10px] text-muted leading-relaxed line-clamp-2">
                                        {achievement.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                            isUnlocked ? rarityStyle.bg : 'bg-white/5'
                                        } ${isUnlocked ? rarityStyle.text : 'text-white/30'}`}>
                                            {achievement.rarity}
                                        </span>
                                        <span className="text-[7px] text-white/20 flex items-center gap-1">
                                            {CATEGORY_ICONS[achievement.category]}
                                            {achievement.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredAchievements.length === 0 && (
                <div className="text-center py-16">
                    <Trophy size={48} className="mx-auto text-white/10 mb-4" />
                    <p className="text-sm text-muted font-bold">No achievements match your filters</p>
                </div>
            )}
        </div>
    );
};

export default Achievements;
