import React, { useEffect, useRef } from 'react';
import { Ghost, Heart } from 'lucide-react';
import type { CombatEvent } from '../../../shared/src/combat';

interface ActionFeedProps {
  events: CombatEvent[];
  onLayToRest: (corpseId: string) => void;
}

const ActionFeed: React.FC<ActionFeedProps> = ({ events, onLayToRest }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="action-feed flex-1 flex flex-col h-full p-4 overflow-hidden">
      <h3 className="text-sm font-black uppercase tracking-widest text-muted mb-4 px-2">The Deep - Action Feed</h3>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2"
      >
        {events.filter(ev => ev && ev.id).map((event) => (
          <div key={event.id} className="feed-item text-[13px] leading-relaxed py-1 border-b border-white/5 last:border-0">
            <div className="flex items-start gap-2">
              <span className="text-muted opacity-50 font-mono">[{event.turn}]</span>
              
              <div className="flex-1">
                <span className="font-bold text-white/90">
                  {event.emojiTag} {event.attackerName} 
                </span>
                <span className="text-muted"> ⚔️ </span>
                <span className="font-bold text-white/90">{event.defenderName}</span>
                
                {event.damage > 0 && (
                  <span className="ml-2 font-black text-danger-color">
                    -{event.damage} {event.isCrit && "💥"}
                  </span>
                )}
                
                {event.banter && (
                  <div className="mt-1 pl-4 border-l border-white/10 italic text-accent-color/80">
                    "{event.banter}"
                  </div>
                )}

                {event.corpseData && (
                  <div className="mt-2 p-3 rounded-lg bg-primary-color/10 border border-primary-color/20 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2">
                      <Ghost size={16} className="text-primary-color" />
                      <span className="font-bold text-primary-color uppercase tracking-wider">Ghost Corpse Detected</span>
                    </div>
                    <button 
                      onClick={() => onLayToRest(event.corpseData!.playerId)} 
                      className="bg-primary-color hover:bg-primary-color/80 text-white px-3 py-1 rounded-md text-[10px] font-black flex items-center gap-1 transition-all"
                    >
                      <Heart size={10} />
                      LAY TO REST
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-center py-20 text-muted italic opacity-50">
            Waiting for expedition data...
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionFeed;
