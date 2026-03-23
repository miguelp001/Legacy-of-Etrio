import React from 'react';
import { Beaker } from 'lucide-react';

const Alchemist: React.FC = () => {
    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 md:px-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-color/20 rounded-xl text-primary-color shrink-0">
                        <Beaker size={24} className="md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic">The Alchemist</h2>
                        <p className="text-muted text-[10px] md:text-sm uppercase font-bold tracking-tight opacity-50">Transmutation and forgotten knowledge.</p>
                    </div>
                </div>
            </div>
            
            <div className="glass p-6 md:p-12 text-center space-y-4">
                <Beaker size={48} className="mx-auto text-primary-color/30 mb-4" />
                <h3 className="text-2xl font-cinzel text-white">Coming Soon</h3>
                <p className="text-muted text-sm max-w-md mx-auto">
                    The Alchemist is currently out gathering rare herbs in The Deep. Return later to brew potent elixirs.
                </p>
            </div>
        </div>
    );
};

export default Alchemist;
