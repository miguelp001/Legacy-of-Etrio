import React, { useState } from 'react';
import { Shield, Sparkles, Sword, Crosshair } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const PERSONALITIES = [
    { name: 'Stoic', icon: Shield, bonus: '+5 Vitality', description: 'Unyielding in the face of despair.' },
    { name: 'Aggressive', icon: Sword, bonus: '+5 Strength', description: 'The best defense is an overwhelming offense.' },
    { name: 'Optimistic', icon: Sparkles, bonus: '+5 Spirit', description: 'Faith guides their hand through the darkness.' },
    { name: 'Cynical', icon: Crosshair, bonus: '+5 Agility', description: 'Trust only in your own speed and steel.' }
];

const CLASSES = ['Warrior', 'Mage', 'Healer', 'Thief'];

const CharacterCreation: React.FC = () => {
    const { createMainCharacter } = useGameStore();
    const [name, setName] = useState('');
    const [selectedClass, setSelectedClass] = useState('Warrior');
    const [personality, setPersonality] = useState('Stoic');

    const handleCreate = () => {
        if (!name.trim()) return;
        createMainCharacter(name, selectedClass, personality);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 scale-in">
            <div className="glass w-full max-w-2xl p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.2)]">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black tracking-tighter text-gradient mb-2">WHO ARE YOU?</h2>
                    <p className="text-muted">Your legacy in Etrio begins with a single choice.</p>
                </div>

                <div className="space-y-8">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-black text-muted">Character Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-xl focus:border-primary-color outline-none transition-all"
                        />
                    </div>

                    {/* Class Selection */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-black text-muted">Choose your Path</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {CLASSES.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setSelectedClass(c)}
                                    className={`py-4 rounded-xl border transition-all ${
                                        selectedClass === c ? 'bg-primary-color border-primary-color text-white shadow-lg' : 'bg-white/5 border-white/10 text-muted hover:border-white/20'
                                    }`}
                                >
                                    <span className="font-bold">{c}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Personality Selection */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-black text-muted">Dominant Personality</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {PERSONALITIES.map((p) => (
                                <button
                                    key={p.name}
                                    onClick={() => setPersonality(p.name)}
                                    className={`p-4 rounded-xl border transition-all flex items-start gap-4 text-left ${
                                        personality === p.name ? 'bg-secondary-color/20 border-secondary-color shadow-lg' : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg ${personality === p.name ? 'bg-secondary-color text-white' : 'bg-white/5 text-muted'}`}>
                                        <p.icon size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold flex justify-between items-center">
                                            {p.name}
                                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-accent-color">{p.bonus}</span>
                                        </div>
                                        <div className="text-xs text-muted mt-1 leading-relaxed">{p.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleCreate}
                        disabled={!name.trim()}
                        className="w-full btn-primary py-6 text-xl shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Embark into Respite <Sparkles size={20} className="animate-pulse" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CharacterCreation;
