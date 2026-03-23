import React, { useState } from 'react';
import { User, Settings, Trash2, Shield, Coins, Droplets, AlertTriangle, LogOut, RefreshCw, Castle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Profile: React.FC = () => {
    const { 
        user, mainCharacter, party, gold, bloodRations, currentFloor, biome, inventory,
        isResonatorActive, resonatorMastery, councilMembers, logout, saveProgress
    } = useGameStore();

    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
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
