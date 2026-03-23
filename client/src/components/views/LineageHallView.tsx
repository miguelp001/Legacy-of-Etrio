import React, { useState } from 'react';
import LineageHall from '../LineageHall';
import Achievements from '../Achievements';

const LineageHallView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Greathall' | 'Trophy Room'>('Greathall');

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-6 border-b border-white/10 shrink-0 px-4 md:px-0">
                <button
                    onClick={() => setActiveTab('Greathall')}
                    className={`px-4 py-2 font-cinzel text-sm uppercase tracking-wider whitespace-nowrap transition-colors ${
                        activeTab === 'Greathall' 
                        ? 'text-primary-color border-b-2 border-primary-color' 
                        : 'text-muted hover:text-white'
                    }`}
                >
                    Greathall
                </button>
                <button
                    onClick={() => setActiveTab('Trophy Room')}
                    className={`px-4 py-2 font-cinzel text-sm uppercase tracking-wider whitespace-nowrap transition-colors ${
                        activeTab === 'Trophy Room' 
                        ? 'text-primary-color border-b-2 border-primary-color' 
                        : 'text-muted hover:text-white'
                    }`}
                >
                    Trophy Room
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-0">
                {activeTab === 'Greathall' && <LineageHall />}
                {activeTab === 'Trophy Room' && <Achievements />}
            </div>
        </div>
    );
};

export default LineageHallView;
