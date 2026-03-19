import React, { useMemo } from 'react';
import { Zap, TrendingUp } from 'lucide-react';
import type { CombatEvent } from '../../../shared/src/combat';

interface DepthMapProps {
  events: CombatEvent[];
  startFloor: number;
  finalFloor: number;
}

const DepthMap: React.FC<DepthMapProps> = ({ events, startFloor, finalFloor }) => {
  // Group floors based on progress
  const floors = useMemo(() => {
    const floorList = [];
    for (let i = startFloor; i <= finalFloor; i++) {
      const floorEvents = events.filter(e => e.banter?.includes(`Floor ${i}`) || (i === startFloor && e.turn === 0));
      const hasBreach = events.some(e => e.isAetherBreach && (e.turn >= (i - startFloor) * 10 && e.turn < (i - startFloor + 1) * 10)); // Heuristic
      
      floorList.push({
        number: i,
        type: i % 10 === 0 ? 'Boss' : 'Regular',
        hasBreach,
        events: floorEvents
      });
    }
    return floorList;
  }, [events, startFloor, finalFloor]);

  return (
    <div className="flex flex-col gap-4 p-6 bg-black/60 rounded-2xl border border-white/5 backdrop-blur-xl">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary-color flex items-center gap-2">
          <TrendingUp size={16} />
          Expedition Depth Map
        </h4>
        <div className="text-[10px] text-muted font-bold">
          {startFloor} → {finalFloor}
        </div>
      </div>

      <div className="relative flex flex-col gap-6 pl-4 border-l border-white/10 ml-2">
        {floors.map((floor) => (
          <div key={floor.number} className="relative group">
            {/* Floor Marker */}
            <div className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 border-[#0d0d0f] z-10 transition-all ${
              floor.type === 'Boss' ? 'bg-red-500 scale-125' : 'bg-primary-color'
            } group-hover:scale-150 shadow-lg shadow-primary-color/20`} />
            
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-black tracking-tighter ${floor.type === 'Boss' ? 'text-red-400' : 'text-white'}`}>
                    FLOOR {floor.number}
                  </span>
                  {floor.hasBreach && (
                    <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-black animate-pulse">
                      <Zap size={10} /> AETHER BREACH
                    </span>
                  )}
                  {floor.type === 'Boss' && (
                    <span className="text-[10px] bg-white/5 text-muted px-2 py-0.5 rounded-full font-bold">
                      BOSS ENCOUNTER
                    </span>
                  )}
                </div>
                
                <div className="mt-1 flex gap-2">
                   {/* Mini icons for what happened there */}
                   {floor.events.length > 0 && (
                     <div className="flex -space-x-1">
                        {floor.events.slice(0, 5).map((e, index) => (
                          <div key={index} className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] hover:z-20 hover:scale-125 transition-all cursor-help" title={e.banter}>
                            {e.emojiTag || '⚔️'}
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              </div>
              
              <div className="text-[9px] text-muted font-black opacity-0 group-hover:opacity-100 transition-opacity">
                 {floor.events.length} LOGS
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex gap-4 text-[10px] font-bold text-muted uppercase">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary-color" /> Regular
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" /> Boss
        </div>
        <div className="flex items-center gap-1">
          <Zap size={10} className="text-red-500" /> Breach
        </div>
      </div>
    </div>
  );
};

export default DepthMap;
