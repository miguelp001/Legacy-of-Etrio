import React, { useState } from 'react';
import { Heart, Users, Sparkles, UserPlus, ShieldAlert, History } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { LineageManager } from '../../../shared/src/lineage';

const LineageHall: React.FC = () => {
    const { party, relationships, addToParty, removeFromParty } = useGameStore();
    const [selectedParents, setSelectedParents] = useState<string[]>([]);

    const getRelationship = (m1: string, m2: string) => {
        const sorted = [m1, m2].sort();
        return relationships.find(r => r.memberIds[0] === sorted[0] && r.memberIds[1] === sorted[1]);
    };

    const handleParentToggle = (id: string) => {
        if (selectedParents.includes(id)) {
            setSelectedParents(selectedParents.filter(p => p !== id));
        } else if (selectedParents.length < 2) {
            setSelectedParents([...selectedParents, id]);
        }
    };

    const performRitual = () => {
        if (selectedParents.length !== 2) return;
        
        const parent1 = party.find(m => m.id === selectedParents[0]);
        const parent2 = party.find(m => m.id === selectedParents[1]);
        
        if (!parent1 || !parent2) return;

        const rel = getRelationship(parent1.id, parent2.id);
        if (!rel || rel.stage !== 'Soulmate') {
            alert("Parents must be Soulmates (100 Affinity) to produce an Heir.");
            return;
        }

        // Create Heir
        // The cast is needed because useGameStore party has Combatant type which is slightly different but compatible
        const heir = LineageManager.createHeir(parent1 as any, parent2 as any);
        
        // Add to party (if space)
        addToParty(heir as any);
        
        alert(`Success! ${heir.name} (Generation ${heir.generation}) has been born with a +${heir.generation * 10}% Legacy Bonus.`);
        setSelectedParents([]);
    };

    const handleRetire = (id: string, name: string) => {
        if (confirm(`Are you sure you want to retire ${name}? They will leave the party and pass their equipment to the vault.`)) {
            removeFromParty(id);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">Lineage Hall</h2>
                    <p className="text-muted">Where bonds ignite and legends are inherited.</p>
                </div>
                <div className="p-3 bg-secondary-color/20 rounded-xl text-secondary-color">
                    <History size={24} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* Active Party & Affinity */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Users size={20} className="text-primary-color" />
                        Current Party Bonds
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {party.map((member, idx) => (
                            <div key={member.id} className="glass p-4 rounded-xl border border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <div className="font-bold">{member.name}</div>
                                        <div className="text-[10px] text-muted uppercase">Lvl {member.level} {member.baseClass}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-muted">Gen {member.generation}</div>
                                        <button 
                                            onClick={() => handleRetire(member.id, member.name)}
                                            className="text-[10px] text-danger-color hover:underline"
                                        >
                                            Retire
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {party.slice(idx + 1).map(other => {
                                        const rel = getRelationship(member.id, other.id);
                                        return (
                                            <div key={other.id} className="flex items-center justify-between text-sm">
                                                <div className="text-muted flex items-center gap-2">
                                                    with <span className="text-white">{other.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-secondary-color transition-all duration-500" 
                                                            style={{ width: `${rel?.affinity || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`font-bold ${rel?.stage === 'Soulmate' ? 'text-secondary-color' : 'text-muted'}`}>
                                                        {rel?.stage || 'Stranger'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {party.length < 2 && (
                            <div className="col-span-full py-12 text-center text-muted glass rounded-xl border-dashed border-white/10 border-2">
                                Recruit at least 2 members to begin tracking Affinity.
                            </div>
                        )}
                    </div>
                </div>

                {/* Succession Ritual */}
                <div className="glass p-8 rounded-2xl border border-white/10 bg-secondary-color/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles size={120} />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                        <Heart size={20} className="text-secondary-color" />
                        Succession Ritual
                    </h3>
                    <p className="text-sm text-muted mb-8 relative z-10">
                        Select two Soulmate parents to produce an Heir. The Heir will inherit base stats plus a cumulative +10% stackable bonus.
                    </p>

                    <div className="space-y-4 mb-8 relative z-10">
                        {party.map(member => (
                            <button 
                                key={member.id}
                                onClick={() => handleParentToggle(member.id)}
                                className={`w-full p-4 rounded-xl border transition-all flex justify-between items-center ${
                                    selectedParents.includes(member.id) 
                                    ? 'bg-secondary-color/20 border-secondary-color shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                            >
                                <span className="font-bold">{member.name}</span>
                                {selectedParents.includes(member.id) && <Sparkles size={16} className="text-secondary-color" />}
                            </button>
                        ))}
                    </div>

                    <button 
                        disabled={selectedParents.length !== 2}
                        onClick={performRitual}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            selectedParents.length === 2 
                            ? 'bg-secondary-color text-white shadow-lg shadow-secondary-color/20' 
                            : 'bg-white/10 text-muted cursor-not-allowed'
                        }`}
                    >
                        <UserPlus size={20} />
                        Produce Legacy Heir
                    </button>
                    
                    <div className="mt-6 flex items-start gap-2 text-xs text-muted leading-relaxed">
                        <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
                        <span>Performing the ritual consumes significant spiritual energy and requires Soulmate status (100 Affinity).</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LineageHall;
