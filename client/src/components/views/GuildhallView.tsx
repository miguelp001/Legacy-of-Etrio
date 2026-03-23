import React, { useState } from 'react';
import GuildHall from '../GuildHall';
import TheGate from '../TheGate';
import Basilica from '../Basilica';

const GuildhallView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Infrastructure' | 'The Gate' | 'Basilica'>('Infrastructure');

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-6 border-b border-white/10 shrink-0 px-4 md:px-0">
                <button
                    onClick={() => setActiveTab('Infrastructure')}
                    className={`px-4 py-2 font-cinzel text-sm uppercase tracking-wider whitespace-nowrap transition-colors ${
                        activeTab === 'Infrastructure' 
                        ? 'text-primary-color border-b-2 border-primary-color' 
                        : 'text-muted hover:text-white'
                    }`}
                >
                    Infrastructure
                </button>
                <button
                    onClick={() => setActiveTab('The Gate')}
                    className={`px-4 py-2 font-cinzel text-sm uppercase tracking-wider whitespace-nowrap transition-colors ${
                        activeTab === 'The Gate' 
                        ? 'text-primary-color border-b-2 border-primary-color' 
                        : 'text-muted hover:text-white'
                    }`}
                >
                    The Gate
                </button>
                <button
                    onClick={() => setActiveTab('Basilica')}
                    className={`px-4 py-2 font-cinzel text-sm uppercase tracking-wider whitespace-nowrap transition-colors ${
                        activeTab === 'Basilica' 
                        ? 'text-primary-color border-b-2 border-primary-color' 
                        : 'text-muted hover:text-white'
                    }`}
                >
                    Basilica
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-0">
                {activeTab === 'Infrastructure' && <GuildHall />}
                {activeTab === 'The Gate' && <TheGate />}
                {activeTab === 'Basilica' && <Basilica />}
            </div>
        </div>
    );
};

export default GuildhallView;
