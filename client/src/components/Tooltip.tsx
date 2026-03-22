import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current?.getBoundingClientRect() || { width: 150, height: 40 };
      
      let x = rect.left + rect.width / 2;
      let y = rect.top;

      switch (position) {
        case 'bottom':
          y = rect.bottom + 8;
          break;
        case 'left':
          x = rect.left - tooltipRect.width - 8;
          y = rect.top + rect.height / 2 - tooltipRect.height / 2;
          break;
        case 'right':
          x = rect.right + 8;
          y = rect.top + rect.height / 2 - tooltipRect.height / 2;
          break;
        default: // top
          y = rect.top - tooltipRect.height - 8;
      }

      setCoords({ x, y });
      setIsVisible(true);
    }
  };

  if (!content) return <>{children}</>;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={showTooltip}
        onBlur={() => setIsVisible(false)}
        className={className}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] pointer-events-none animate-fade-in"
          style={{
            left: coords.x,
            top: coords.y,
            transform: position === 'top' ? 'translateX(-50%) translateY(-100%)' :
                      position === 'bottom' ? 'translateX(-50%)' :
                      position === 'left' ? 'translateX(-100%) translateY(-50%)' :
                      'translateY(-50%)'
          }}
        >
          <div className="bg-black/95 border border-white/20 rounded-xl px-3 py-2 shadow-2xl backdrop-blur-sm max-w-[200px]">
            <p className="text-[10px] text-white/90 font-medium leading-relaxed whitespace-normal">
              {content}
            </p>
          </div>
          <div className={`absolute w-0 h-0 ${
            position === 'top' ? 'border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/20 bottom-[-8px] left-1/2 -translate-x-1/2' :
            position === 'bottom' ? 'border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-transparent top-[-8px] left-1/2 -translate-x-1/2' :
            position === 'left' ? 'border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white/20 right-[-8px] top-1/2 -translate-y-1/2' :
            'border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-transparent border-l-transparent left-[-8px] top-1/2 -translate-y-1/2'
          }`} />
        </div>
      )}
    </>
  );
};

export default Tooltip;
