import React, { useState } from 'react';
import Blacksmith from '../Blacksmith';
import Alchemist from '../Alchemist';

const ShopsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Smith' | 'Alchemist'>('Smith');

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* Sub-Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-6 border-b border-white/10 shrink-0 px-4 md:px-0">
                <button
                    onClick={() => setActiveTab('Smith')}
                    className={`px-4 py-2 font-cinzel text-sm uppercase tracking-wider whitespace-nowrap transition-colors ${
                        activeTab === 'Smith' 
                        ? 'text-primary-color border-b-2 border-primary-color' 
                        : 'text-muted hover:text-white'
                    }`}
                >
                    Smith
                </button>
                <button
                    onClick={() => setActiveTab('Alchemist')}
                    className={`px-4 py-2 font-cinzel text-sm uppercase tracking-wider whitespace-nowrap transition-colors ${
                        activeTab === 'Alchemist' 
                        ? 'text-primary-color border-b-2 border-primary-color' 
                        : 'text-muted hover:text-white'
                    }`}
                >
                    Alchemist
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-0">
                {activeTab === 'Smith' && <Blacksmith />}
                {activeTab === 'Alchemist' && <Alchemist />}
            </div>
        </div>
    );
};

export default ShopsView;
