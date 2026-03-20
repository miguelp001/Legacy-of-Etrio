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
        <div className="fixed inset-0 bg-[#0a0505] backdrop-blur-3xl z-[100] flex items-center justify-center p-4 md:p-10 scale-in overflow-y-auto">
            <div className="glass w-full max-w-2xl p-6 md:p-10 rounded-[2.5rem] border border-white/5 shadow-[0_0_50px_rgba(139,92,246,0.1)] my-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-color/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

                <div className="text-center mb-8 relative z-10">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none mb-4">Who are you?</h2>
                    <p className="text-[10px] md:text-xs uppercase font-black tracking-widest text-white/30 italic">Your legacy in Etrio begins with a single choice.</p>
                </div>

                <div className="space-y-8 relative z-10">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-[8px] md:text-[10px] uppercase font-black tracking-[0.3em] text-primary-color ml-1">Identity Tag</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter Name..."
                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-lg md:text-2xl font-black italic focus:border-primary-color/50 outline-none transition-all placeholder:text-white/5"
                        />
                    </div>

                    {/* Class Selection */}
                    <div className="space-y-3">
                        <label className="text-[8px] md:text-[10px] uppercase font-black tracking-[0.3em] text-primary-color ml-1">Inherited Path</label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {CLASSES.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setSelectedClass(c)}
                                    className={`py-4 md:py-5 rounded-2xl border font-black uppercase tracking-widest text-[10px] md:text-xs transition-all active:scale-95 ${
                                        selectedClass === c ? 'bg-primary-color border-primary-color text-white shadow-xl shadow-primary-color/20' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/10'
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Personality Selection */}
                    <div className="space-y-3">
                        <label className="text-[8px] md:text-[10px] uppercase font-black tracking-[0.3em] text-primary-color ml-1">Dominant Soul Aspect</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {PERSONALITIES.map((p) => (
                                <button
                                    key={p.name}
                                    onClick={() => setPersonality(p.name)}
                                    className={`p-4 md:p-5 rounded-2xl border transition-all flex items-start gap-4 text-left group active:scale-95 ${
                                        personality === p.name ? 'bg-secondary-color/10 border-secondary-color shadow-xl shadow-secondary-color/10' : 'bg-white/5 border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <div className={`p-3 rounded-xl shrink-0 transition-colors ${personality === p.name ? 'bg-secondary-color text-white' : 'bg-white/5 text-white/20 group-hover:text-white/40'}`}>
                                        <p.icon size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${personality === p.name ? 'text-white' : 'text-white/50'}`}>{p.name}</span>
                                            <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded-lg text-accent-color font-black italic">{p.bonus}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-white/30 leading-tight italic line-clamp-2">{p.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleCreate}
                        disabled={!name.trim()}
                        className="w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs md:text-sm transition-all shadow-2xl active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed group overflow-hidden relative bg-primary-color text-white shadow-primary-color/30"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            Embark into Respite <Sparkles size={18} className="animate-pulse" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CharacterCreation;
