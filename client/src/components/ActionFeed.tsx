import React, { useEffect, useRef } from 'react';
import { Ghost, Heart } from 'lucide-react';
import type { CombatEvent } from '../../../shared/src/combat';

interface ActionFeedProps {
  events: CombatEvent[];
  onLayToRest: (corpseId: string) => void;
  floor?: number;
}

const ActionFeed: React.FC<ActionFeedProps> = ({ events, onLayToRest, floor = 1 }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const renderRichText = (text: string, isCombat: boolean, isCrit: boolean) => {
    // 1. Parse Noble Names: [[NAME:house:name]]
    const parts = text.split(/(\[\[NAME:[^:]+:[^\]]+\]\])/g);
    
    let rendered = parts.map((part, i) => {
      const match = part.match(/\[\[NAME:([^:]+):([^\]]+)\]\]/);
      if (match) {
        const house = match[1]?.toLowerCase();
        const name = match[2];
        const houseClass = house === 'none' ? 'noble-default' : `house-${house}`;
        return <span key={i} className={`noble-name ${houseClass}`}>{name}</span>;
      }
      return part;
    });

    // 2. Emoji Injection for combat
    if (isCombat) {
      const emoji = isCrit ? '🔥' : '⚔️';
      rendered.push(<span key="emoji" className="ml-1">{emoji}</span>);
    }

    return rendered;
  };

  const renderNameBadge = (marker: string) => {
    const match = marker.match(/\[\[NAME:([^:]+):([^\]]+)\]\]/);
    if (!match) {
      // Direct name fallback
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border border-white/10 mr-2 noble-default bg-white/5">
          {marker}
        </span>
      );
    }
    
    const house = match[1]?.toLowerCase();
    const name = match[2];
    const houseClass = house === 'none' ? 'noble-default' : `house-${house}`;
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border border-white/10 mr-2 ${houseClass} bg-white/5`}>
        {name}
      </span>
    );
  };

  const getVibeClass = () => {
    if (floor > 20) return 'deep-pulse';
    if (floor > 10) return 'deep-glitch';
    return '';
  };

  return (
    <div className={`action-feed flex-1 flex flex-col h-full p-4 overflow-hidden ${getVibeClass()}`}>
      <h3 className="text-sm font-black uppercase tracking-widest text-muted mb-4 px-2">The Deep - Action Feed</h3>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2"
      >
        {events.filter(ev => ev && ev.id).map((event) => {
            const attackerName = event.attackerName.includes('[[NAME:') ? event.attackerName : `[[NAME:none:${event.attackerName}]]`;
            const defenderName = event.defenderName.includes('[[NAME:') ? event.defenderName : `[[NAME:none:${event.defenderName}]]`;
            
            const actionFallbacks = event.damage > 0 
                ? [
                    `presses the advantage against ${defenderName}`,
                    `finds an opening in ${defenderName}'s guard`,
                    `executes a calculated strike upon ${defenderName}`,
                    `drives their weapon toward ${defenderName}`
                  ]
                : [
                    `misses the mark against ${defenderName}`,
                    `overextends the strike against ${defenderName}`,
                    `swings blindly at ${defenderName}`,
                    `fails to connect with ${defenderName}`
                  ];
            const fallback = actionFallbacks[Math.floor(Math.random() * actionFallbacks.length)];

            return (
              <div key={event.id} className="feed-item text-[13px] leading-relaxed py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors px-2 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-muted opacity-30 font-mono text-[10px] mt-1">[{event.turn}]</span>
                  
                  <div className="flex-1">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center">
                        {renderNameBadge(attackerName)}
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-50">
                          {event.banter ? "Narrative" : "Action"}
                        </span>
                      </div>
                      <div className="text-white/90 italic pl-1 border-l-2 border-white/5 mt-1">
                        {renderRichText(
                          event.banter || `${renderNameBadge(attackerName)} ${fallback}.`,
                          event.damage > 0,
                          event.isCrit
                        )}
                      </div>
                    </div>
                    
                    {event.damage > 0 && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-danger-color uppercase">Casualty</span>
                        <span className="font-black text-danger-color">
                          -{event.damage} {event.isCrit && "💥"}
                        </span>
                      </div>
                    )}
                    
                    {event.corpseData && (
                      <div className="mt-2 p-3 rounded-lg bg-primary-color/10 border border-primary-color/20 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-2">
                          <Ghost size={16} className="text-primary-color" />
                          <span className="font-bold text-primary-color uppercase tracking-wider">Ghost Corpse Detected</span>
                        </div>
                        <button 
                          onClick={() => onLayToRest(event.corpseData!!.playerId)} 
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
            );
        })}
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
