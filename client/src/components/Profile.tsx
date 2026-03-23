import React, { useState, useMemo } from 'react';
import { User, Settings, Trash2, Shield, Coins, Droplets, AlertTriangle, Check, X, LogOut, RefreshCw, Trophy, Lock, Star, Sword, Crown, Skull, Heart, Zap, Castle, Users } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    check: (stats: AchievementStats) => boolean;
}

interface AchievementStats {
    floor: number;
    gold: number;
    partySize: number;
    councilSize: number;
    generation: number;
    itemsCollected: number;
    bossesDefeated: number;
    npcsRecruited: number;
    soloRuns: number;
    legendaryItems: number;
    maxLevel: number;
    biomesCleared: number;
    kills: number;
    deaths: number;
    daysPlayed: number;
}

const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_blood', name: 'First Blood', description: 'Defeat your first enemy', icon: <Sword size={16} />, rarity: 'common', check: (s) => s.kills >= 1 },
    { id: 'floor_5', name: 'Descent Begins', description: 'Reach Floor 5', icon: <Crown size={16} />, rarity: 'common', check: (s) => s.floor >= 5 },
    { id: 'floor_10', name: 'Pit Diver', description: 'Reach Floor 10', icon: <Crown size={16} />, rarity: 'common', check: (s) => s.floor >= 10 },
    { id: 'floor_25', name: 'Depth Walker', description: 'Reach Floor 25', icon: <Crown size={16} />, rarity: 'rare', check: (s) => s.floor >= 25 },
    { id: 'floor_50', name: 'Abyss Treader', description: 'Reach Floor 50', icon: <Crown size={16} />, rarity: 'epic', check: (s) => s.floor >= 50 },
    { id: 'boss_slayer', name: 'Guardian Bane', description: 'Defeat your first Boss', icon: <Skull size={16} />, rarity: 'common', check: (s) => s.bossesDefeated >= 1 },
    { id: 'boss_hunter', name: 'Champion', description: 'Defeat 5 Bosses', icon: <Skull size={16} />, rarity: 'rare', check: (s) => s.bossesDefeated >= 5 },
    { id: 'solo_wolf', name: 'Lone Wolf', description: 'Complete 3 floors solo', icon: <Sword size={16} />, rarity: 'rare', check: (s) => s.soloRuns >= 3 },
    { id: 'rich_1k', name: 'Coin Collector', description: 'Accumulate 1,000 gold', icon: <Coins size={16} />, rarity: 'common', check: (s) => s.gold >= 1000 },
    { id: 'rich_10k', name: 'Treasure Keeper', description: 'Accumulate 10,000 gold', icon: <Coins size={16} />, rarity: 'rare', check: (s) => s.gold >= 10000 },
    { id: 'rich_100k', name: 'Gold Hoarder', description: 'Accumulate 100,000 gold', icon: <Coins size={16} />, rarity: 'epic', check: (s) => s.gold >= 100000 },
    { id: 'full_party', name: 'Full Vanguard', description: 'Have 4 party members', icon: <Users size={16} />, rarity: 'rare', check: (s) => s.partySize >= 4 },
    { id: 'recruiter', name: 'Mercenary Lord', description: 'Recruit 5 NPCs total', icon: <Users size={16} />, rarity: 'rare', check: (s) => s.npcsRecruited >= 5 },
    { id: 'collector', name: 'Armorer', description: 'Collect 20 items', icon: <Shield size={16} />, rarity: 'common', check: (s) => s.itemsCollected >= 20 },
    { id: 'legendary_1', name: 'Fated Find', description: 'Obtain a Legendary item', icon: <Star size={16} />, rarity: 'rare', check: (s) => s.legendaryItems >= 1 },
    { id: 'level_5', name: 'Rising Star', description: 'Reach Level 5', icon: <Star size={16} />, rarity: 'common', check: (s) => s.maxLevel >= 5 },
    { id: 'level_10', name: 'Veteran', description: 'Reach Level 10', icon: <Star size={16} />, rarity: 'rare', check: (s) => s.maxLevel >= 10 },
    { id: 'generation_2', name: 'Bloodline', description: 'Reach Generation 2', icon: <Crown size={16} />, rarity: 'epic', check: (s) => s.generation >= 2 },
    { id: 'council_1', name: 'First Council', description: 'Ascend your first member', icon: <Castle size={16} />, rarity: 'rare', check: (s) => s.councilSize >= 1 },
    { id: 'survivor', name: 'Unbroken', description: 'Survive 100 encounters', icon: <Heart size={16} />, rarity: 'epic', check: (s) => s.kills >= 100 },
];

const RARITY_STYLES = {
    common: { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white/60', glow: '' },
    rare: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-[0_0_10px_rgba(59,130,246,0.2)]' },
    epic: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]' },
    legendary: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]' }
};

const Profile: React.FC = () => {
    const { 
        user, mainCharacter, party, gold, bloodRations, currentFloor, biome, inventory,
        isResonatorActive, resonatorMastery, councilMembers, logout, saveProgress
    } = useGameStore();

    const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'achievements'>('profile');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [settings, setSettings] = useState({
        notifications: true,
        autoSave: true,
        soundEffects: true,
        compactMode: false
    });

    const fullParty = [mainCharacter, ...party].filter(Boolean);
    const totalStats = mainCharacter ? Object.values(mainCharacter.stats).reduce((a, b) => a + b, 0) : 0;

    const stats: AchievementStats = useMemo(() => ({
        floor: currentFloor,
        gold: gold,
        partySize: fullParty.length,
        councilSize: councilMembers.length,
        generation: mainCharacter?.generation || 1,
        itemsCollected: inventory.length,
        bossesDefeated: Math.floor(currentFloor / 10),
        npcsRecruited: party.length,
        soloRuns: 0,
        legendaryItems: inventory.filter((i: any) => i.rarity === 'Legendary' || i.rarity === 'Abyssal').length,
        maxLevel: mainCharacter?.level || 1,
        biomesCleared: Math.floor(currentFloor / 10),
        kills: currentFloor * 5,
        deaths: 0,
        daysPlayed: 1
    }), [currentFloor, gold, fullParty.length, councilMembers.length, mainCharacter, inventory, party.length]);

    const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check(stats));
    const completionPercent = Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100);

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        setDeleting(true);
        try {
            const response = await fetch(`${API_BASE}/api/auth/delete`, {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${useGameStore.getState().token}`
                },
                body: JSON.stringify({ playerId: useGameStore.getState().playerId })
            });
            if (response.ok) {
                logout();
            } else {
                alert('Failed to delete account.');
            }
        } catch (error) {
            alert('Failed to delete account.');
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
            setDeleteConfirmText('');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-color to-secondary-color flex items-center justify-center shadow-xl shadow-primary-color/20">
                    <User size={28} className="text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-cinzel uppercase tracking-wider text-bone">{user?.username || 'Adventurer'}</h2>
                    <p className="text-xs text-muted font-bold uppercase tracking-widest">
                        {mainCharacter ? `${mainCharacter.baseClass} • Generation ${mainCharacter.generation}` : 'Unbound'}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/5 p-1.5 rounded-xl gap-2 border border-white/5">
                <button onClick={() => setActiveTab('profile')} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-primary-color text-white' : 'text-muted hover:text-white'}`}>Profile</button>
                <button onClick={() => setActiveTab('achievements')} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'achievements' ? 'bg-amber-500 text-black' : 'text-muted hover:text-white'}`}>Trophies</button>
                <button onClick={() => setActiveTab('settings')} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-primary-color text-white' : 'text-muted hover:text-white'}`}>Settings</button>
            </div>

            {activeTab === 'profile' && (
                <div className="space-y-6">
                    {mainCharacter && (
                        <div className="glass p-6 rounded-3xl border border-crimson/20 space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-wider text-white/60">Character</h3>
                                <span className="badge bg-primary-color/10 text-primary-color border-primary-color/20">Level {mainCharacter.level}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-color/30 to-primary-color/30 flex items-center justify-center border border-white/10">
                                    <User size={24} className="text-accent-color" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black tracking-tight">{mainCharacter.name}</h4>
                                    <p className="text-xs text-muted uppercase">{mainCharacter.baseClass}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-center">
                                    <div className="text-lg font-black text-accent-color">{totalStats}</div>
                                    <div className="text-[8px] text-muted uppercase tracking-wider">Total Stats</div>
                                </div>
                                <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-center">
                                    <div className="text-lg font-black text-primary-color">{mainCharacter.level}</div>
                                    <div className="text-[8px] text-muted uppercase tracking-wider">Level</div>
                                </div>
                                <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-center">
                                    <div className="text-lg font-black text-gold">{currentFloor}</div>
                                    <div className="text-[8px] text-muted uppercase tracking-wider">Floor</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="flex justify-between p-2 bg-black/30 rounded-lg border border-white/5">
                                    <span className="text-[8px] text-white/40 font-black uppercase">STR</span>
                                    <span className="text-[10px] text-danger-color font-bold">{mainCharacter.stats.strength}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-black/30 rounded-lg border border-white/5">
                                    <span className="text-[8px] text-white/40 font-black uppercase">AGI</span>
                                    <span className="text-[10px] text-green-400 font-bold">{mainCharacter.stats.agility}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-black/30 rounded-lg border border-white/5">
                                    <span className="text-[8px] text-white/40 font-black uppercase">VIT</span>
                                    <span className="text-[10px] text-yellow-400 font-bold">{mainCharacter.stats.vitality}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-black/30 rounded-lg border border-white/5">
                                    <span className="text-[8px] text-white/40 font-black uppercase">INT</span>
                                    <span className="text-[10px] text-blue-400 font-bold">{mainCharacter.stats.intelligence}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-black/30 rounded-lg border border-white/5">
                                    <span className="text-[8px] text-white/40 font-black uppercase">SPI</span>
                                    <span className="text-[10px] text-purple-400 font-bold">{mainCharacter.stats.spirit}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-black/30 rounded-lg border border-white/5">
                                    <span className="text-[8px] text-white/40 font-black uppercase">LCK</span>
                                    <span className="text-[10px] text-amber-400 font-bold">{mainCharacter.stats.luck}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-wider text-white/60">Account Statistics</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-white/5">
                                <Coins size={18} className="text-gold" />
                                <div><div className="text-lg font-black">{gold.toLocaleString()}</div><div className="text-[8px] text-muted uppercase">Gold</div></div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-white/5">
                                <Droplets size={18} className="text-red-500" />
                                <div><div className="text-lg font-black">{Math.floor(bloodRations)}</div><div className="text-[8px] text-muted uppercase">Blood Rations</div></div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-white/5">
                                <Shield size={18} className="text-primary-color" />
                                <div><div className="text-lg font-black">{fullParty.length}/4</div><div className="text-[8px] text-muted uppercase">Party</div></div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-white/5">
                                <Castle size={18} className="text-secondary-color" />
                                <div><div className="text-lg font-black">{councilMembers.length}</div><div className="text-[8px] text-muted uppercase">Council</div></div>
                            </div>
                        </div>
                    </div>

                    <button onClick={saveProgress} className="w-full py-4 bg-primary-color/10 border border-primary-color/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary-color flex items-center justify-center gap-3">
                        <RefreshCw size={16} /> Force Save Progress
                    </button>

                    <button onClick={logout} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted flex items-center justify-center gap-3">
                        <LogOut size={16} /> Logout
                    </button>

                    <div className="glass p-6 rounded-3xl border border-danger-color/20 space-y-4">
                        <div className="flex items-center gap-3 text-danger-color">
                            <AlertTriangle size={18} />
                            <h3 className="text-sm font-black uppercase tracking-wider">Danger Zone</h3>
                        </div>
                        {!showDeleteConfirm ? (
                            <button onClick={() => setShowDeleteConfirm(true)} className="w-full py-4 bg-danger-color/10 border border-danger-color/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-danger-color flex items-center justify-center gap-3">
                                <Trash2 size={16} /> Delete Account
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-xs text-danger-color font-bold">Type DELETE to confirm:</p>
                                <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())} placeholder="DELETE" className="w-full px-4 py-3 bg-black/40 border border-danger-color/30 rounded-xl text-sm text-white" />
                                <div className="flex gap-3">
                                    <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase">Cancel</button>
                                    <button onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE' || deleting} className="flex-1 py-3 bg-danger-color text-white rounded-xl text-[10px] font-black uppercase disabled:opacity-50">{deleting ? 'Deleting...' : 'Confirm'}</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'achievements' && (
                <div className="space-y-4">
                    <div className="glass p-4 rounded-xl border border-amber-500/20">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-white/40">Trophy Progress</span>
                            <span className="text-sm font-black text-amber-400">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all" style={{ width: `${completionPercent}%` }} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ACHIEVEMENTS.map(achievement => {
                            const isUnlocked = unlockedAchievements.find(u => u.id === achievement.id);
                            const style = RARITY_STYLES[achievement.rarity];
                            return (
                                <div key={achievement.id} className={`glass p-4 rounded-2xl border transition-all ${isUnlocked ? `${style.bg} ${style.border} ${style.glow}` : 'border-white/5 opacity-50'}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUnlocked ? style.bg : 'bg-white/5'}`}>
                                            {isUnlocked ? <div className={style.text}>{achievement.icon}</div> : <Lock size={16} className="text-white/20" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`text-sm font-black ${isUnlocked ? style.text : 'text-white/40'}`}>{achievement.name}</h4>
                                                {isUnlocked && <Check size={12} className="text-green-400" />}
                                            </div>
                                            <p className="text-[10px] text-muted">{achievement.description}</p>
                                            <span className={`inline-block mt-2 text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${isUnlocked ? style.bg : 'bg-white/5'} ${isUnlocked ? style.text : 'text-white/30'}`}>{achievement.rarity}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-4">
                    <div className="glass p-6 rounded-3xl border border-white/5 space-y-5">
                        <h3 className="text-sm font-black uppercase tracking-wider text-white/60">Preferences</h3>
                        {[
                            { key: 'notifications', label: 'Push Notifications', desc: 'Receive alerts when offline gains are ready' },
                            { key: 'autoSave', label: 'Auto-Save', desc: 'Automatically save progress every minute' },
                            { key: 'soundEffects', label: 'Sound Effects', desc: 'Play sounds for combat events' }
                        ].map(setting => (
                            <div key={setting.key} className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">{setting.label}</div>
                                    <div className="text-[10px] text-muted">{setting.desc}</div>
                                </div>
                                <button
                                    onClick={() => setSettings(prev => ({ ...prev, [setting.key]: !prev[setting.key as keyof typeof prev] }))}
                                    className={`w-14 h-7 rounded-full transition-all relative ${settings[setting.key as keyof typeof settings] ? 'bg-primary-color' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all ${settings[setting.key as keyof typeof settings] ? 'left-8' : 'left-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-wider text-white/60">Game Info</h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between p-3 bg-black/30 rounded-xl"><span className="text-muted">Version</span><span className="text-white font-medium">1.0.0</span></div>
                            <div className="flex justify-between p-3 bg-black/30 rounded-xl"><span className="text-muted">Biome</span><span className="text-white font-medium">{biome}</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
