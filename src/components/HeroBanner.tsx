import React from 'react';
import { Calendar, MapPin, Ticket, Bookmark, Music, Users, Sparkles } from 'lucide-react';
import { EntebbeEvent } from '../types';

interface HeroBannerProps {
  event: EntebbeEvent;
  onGetTickets: (event: EntebbeEvent) => void;
  onToggleSave: (event: EntebbeEvent) => void;
  isSaved: boolean;
  onPlayVibe: (event: EntebbeEvent) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  event,
  onGetTickets,
  onToggleSave,
  isSaved,
  onPlayVibe,
}) => {
  return (
    <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 group mb-6">
      {/* Background Image with Netflix-style Gradient Overlay */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden bg-[#16161f]">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Deep Multi-stop Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d12]/90 via-[#0d0d12]/50 to-transparent" />
        <div className="absolute top-0 right-0 p-4 md:p-6 flex items-center gap-2">
          {/* Promoted / Sponsored Badge */}
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#FFCC00] to-[#FF9500] text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-[#FFCC00]/20 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Promoted
          </span>
          {/* Save / Bookmark Button */}
          <button
            onClick={() => onToggleSave(event)}
            className={`p-2.5 rounded-full backdrop-blur-md border transition cursor-pointer ${
              isSaved
                ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                : 'bg-black/50 border-white/20 text-white/80 hover:text-white hover:bg-black/70'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save event'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Content Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-4 md:p-8 flex flex-col justify-end text-left">
        {/* Tag Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-md bg-[#FF2D55]/20 border border-[#FF2D55]/40 text-[#FF2D55] text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
          <span className="text-white/60 text-xs font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#FFCC00]" />
            {event.attendeesCount}+ attending
          </span>
        </div>

        {/* Event Title */}
        <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow-md">
          {event.title}
        </h2>

        {/* Venue, Date, and Meta Row */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs md:text-sm text-white/80 mb-4">
          <div className="flex items-center gap-1.5 font-medium text-white">
            <MapPin className="w-4 h-4 text-[#FF2D55] shrink-0" />
            <span>{event.venue.name} · <span className="text-white/60">{event.venue.area}</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90">
            <Calendar className="w-4 h-4 text-[#FFCC00] shrink-0" />
            <span>{event.dateStr}</span>
          </div>
          <div className="font-mono font-black text-xs md:text-sm px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {event.isFree ? 'FREE ENTRY' : `UGX ${event.priceUGX.toLocaleString()}`}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onGetTickets(event)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] hover:brightness-110 active:scale-95 text-white font-bold text-sm shadow-xl shadow-[#FF2D55]/30 transition cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            <span>Get tickets</span>
          </button>

          {event.musicVibe && (
            <button
              onClick={() => onPlayVibe(event)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-sm backdrop-blur-md border border-white/15 transition cursor-pointer"
            >
              <Music className="w-4 h-4 text-[#FFCC00]" />
              <span>Preview Vibe</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
