import React, { useState } from 'react';
import Tavern from '../Tavern';
import Hospital from '../Hospital';

const TownSquareView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Tavern' | 'Infirmary'>('Tavern');

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-6 border-b border-white/10 shrink-0 px-4 md:px-0">
                <button
                    onClick={() => setActiveTab('Tavern')}
                    className={`px-4 py-2 font-cinzel text-sm uppercase tracking-wider whitespace-nowrap transition-colors ${
                        activeTab === 'Tavern' 
                        ? 'text-primary-color border-b-2 border-primary-color' 
                        : 'text-muted hover:text-white'
                    }`}
                >
                    Tavern
                </button>
                <button
                    onClick={() => setActiveTab('Infirmary')}
                    className={`px-4 py-2 font-cinzel text-sm uppercase tracking-wider whitespace-nowrap transition-colors ${
                        activeTab === 'Infirmary' 
                        ? 'text-primary-color border-b-2 border-primary-color' 
                        : 'text-muted hover:text-white'
                    }`}
                >
                    Infirmary
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-0">
                {activeTab === 'Tavern' && <Tavern />}
                {activeTab === 'Infirmary' && <Hospital />}
            </div>
        </div>
    );
};

export default TownSquareView;
