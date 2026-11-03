import React from 'react';
import { Flame, Sparkles } from 'lucide-react';
import { EntebbeEvent } from '../types';

interface LiveMarqueeProps {
  events: EntebbeEvent[];
  onSelectEvent: (event: EntebbeEvent) => void;
}

export const LiveMarquee: React.FC<LiveMarqueeProps> = ({ events, onSelectEvent }) => {
  // Build marquee items
  const tickerItems = events
    .filter((e) => e.liveStatus === 'LIVE' || e.liveStatus === 'SOON' || e.featured)
    .slice(0, 6);

  const defaultItems = tickerItems.length > 0 ? tickerItems : events.slice(0, 4);

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#16161f] via-[#1f1f2e] to-[#16161f] border-b border-white/5 py-2">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Urgent Live Pill */}
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-[#FF2D55]/20 border-r border-white/10 z-10 backdrop-blur-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2D55] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF2D55]" />
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#FF2D55] flex items-center gap-1">
            <Flame className="w-3 h-3" /> LIVE / SOON
          </span>
        </div>

        {/* Marquee Ticker */}
        <div className="relative flex-1 overflow-hidden select-none">
          <div className="animate-marquee flex items-center gap-8 text-xs text-white/80 cursor-pointer">
            {defaultItems.concat(defaultItems).map((evt, idx) => (
              <button
                key={`${evt.id}-${idx}`}
                onClick={() => onSelectEvent(evt)}
                className="flex items-center gap-2 hover:text-[#FFCC00] transition shrink-0 group text-left cursor-pointer"
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  evt.liveStatus === 'LIVE' ? 'bg-[#FF2D55] text-white' : 'bg-[#FFCC00]/20 text-[#FFCC00]'
                }`}>
                  {evt.liveStatus || 'SOON'}
                </span>
                <span className="font-semibold text-white group-hover:text-[#FFCC00]">
                  {evt.title}
                </span>
                <span className="text-white/40">·</span>
                <span className="text-white/60">{evt.dateStr}</span>
                <span className="text-white/40">·</span>
                <span className="text-white/70 font-medium">{evt.venue.name}</span>
                <span className="text-white/40">·</span>
                <span className="font-mono text-[11px] text-[#FF2D55] font-bold">
                  {evt.isFree ? 'FREE' : `UGX ${evt.priceUGX.toLocaleString()}`}
                </span>
                <span className="text-white/20">|</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
