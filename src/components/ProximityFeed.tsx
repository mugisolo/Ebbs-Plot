import React from 'react';
import { MapPin, Calendar, Bookmark, Ticket, Music, Navigation, Bell } from 'lucide-react';
import { EntebbeEvent } from '../types';

interface ProximityFeedProps {
  events: EntebbeEvent[];
  onGetTickets: (event: EntebbeEvent) => void;
  onToggleSave: (event: EntebbeEvent) => void;
  savedEventIds: Set<string>;
  onSelectEvent: (event: EntebbeEvent) => void;
  onOpenMap: () => void;
}

export const ProximityFeed: React.FC<ProximityFeedProps> = ({
  events,
  onGetTickets,
  onToggleSave,
  savedEventIds,
  onSelectEvent,
  onOpenMap,
}) => {
  return (
    <section className="w-full mb-12 px-4 text-left">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
            Lakeshore Radar · Entebbe
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              12km Geo-Fence
            </span>
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Geo-locked events across Kitoro, Bugonga, Nakiwogo, Botanical Beach, and Aero Beach
          </p>
        </div>

        <button
          onClick={onOpenMap}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1f1f2e] hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold border border-white/5 transition cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5 text-[#FFCC00]" />
          <span>View Map</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {events.map((event) => {
          const isSaved = savedEventIds.has(event.id);

          return (
            <div
              key={event.id}
              className="group relative flex items-center gap-3.5 p-3 rounded-2xl bg-[#16161f] border border-white/5 hover:border-[#FF2D55]/40 transition-all duration-300 hover:bg-[#1f1f2e]/80"
            >
              {/* Thumbnail with Music/Category badge */}
              <div
                onClick={() => onSelectEvent(event)}
                className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl overflow-hidden cursor-pointer"
              >
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-1 right-1 p-1 rounded-full bg-black/70 backdrop-blur-sm text-[#FF2D55]">
                  <Music className="w-3 h-3" />
                </div>
              </div>

              {/* Event Info */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF2D55]">
                    {event.category}
                  </span>
                  <span className="text-white/30 text-[10px]">·</span>
                  <span className="text-[11px] text-white/60 line-clamp-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-white/40 shrink-0" />
                    {event.venue.name} ({event.venue.area})
                  </span>
                </div>

                <h4
                  onClick={() => onSelectEvent(event)}
                  className="text-sm font-bold text-white group-hover:text-[#FFCC00] transition line-clamp-1 cursor-pointer mb-1"
                >
                  {event.title}
                </h4>

                <div className="flex items-center gap-3 text-xs text-white/60 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#FFCC00] shrink-0" />
                    {event.dateStr}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#FFCC00]">
                    {event.isFree ? 'Free' : `UGX ${event.priceUGX.toLocaleString()}`}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onGetTickets(event)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      event.isSoldOut
                        ? 'bg-amber-500/20 hover:bg-amber-500 text-[#FFCC00] hover:text-black border border-amber-500/30'
                        : 'bg-[#FF2D55]/20 hover:bg-[#FF2D55] text-[#FF2D55] hover:text-white'
                    }`}
                  >
                    {event.isSoldOut ? (
                      <>
                        <Bell className="w-3 h-3" />
                        <span>Waitlist</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-3 h-3" />
                        <span>Get Ticket</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onToggleSave(event)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      isSaved
                        ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    }`}
                    title={isSaved ? 'Saved' : 'Save'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
