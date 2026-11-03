import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, Calendar, MapPin, Ticket, Bell } from 'lucide-react';
import { EntebbeEvent } from '../types';

interface NetflixCarouselProps {
  title: string;
  subtitle?: string;
  events: EntebbeEvent[];
  onGetTickets: (event: EntebbeEvent) => void;
  onToggleSave: (event: EntebbeEvent) => void;
  savedEventIds: Set<string>;
  onSelectEvent: (event: EntebbeEvent) => void;
}

export const NetflixCarousel: React.FC<NetflixCarouselProps> = ({
  title,
  subtitle,
  events,
  onGetTickets,
  onToggleSave,
  savedEventIds,
  onSelectEvent,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  if (events.length === 0) return null;

  return (
    <section className="relative w-full mb-8 text-left">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-3 px-4">
        <div>
          <h3 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
            {title}
            <span className="w-2 h-2 rounded-full bg-[#FF2D55]" />
          </h3>
          {subtitle && <p className="text-xs text-white/50 mt-0.5">{subtitle}</p>}
        </div>

        {/* Carousel arrows */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full bg-[#1f1f2e] hover:bg-white/10 text-white/70 hover:text-white border border-white/5 transition cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full bg-[#1f1f2e] hover:bg-white/10 text-white/70 hover:text-white border border-white/5 transition cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-2 scroll-smooth"
      >
        {events.map((event) => {
          const isSaved = savedEventIds.has(event.id);

          return (
            <div
              key={event.id}
              className="relative w-[240px] md:w-[280px] shrink-0 rounded-2xl bg-[#16161f] border border-white/10 overflow-hidden group hover:border-[#FF2D55]/50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-[#FF2D55]/10 flex flex-col justify-between"
            >
              {/* Event Card Image */}
              <div
                onClick={() => onSelectEvent(event)}
                className="relative aspect-[16/10] w-full overflow-hidden cursor-pointer"
              >
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16161f] via-transparent to-black/30" />

                {/* Price Badge / Sold Out Badge */}
                <div className="absolute top-2.5 left-2.5">
                  {event.isSoldOut ? (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                      Sold Out
                    </span>
                  ) : event.isFree ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow-md">
                      Free
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[#FFCC00] font-mono text-[11px] font-bold shadow-md">
                      UGX {event.priceUGX.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Bookmark Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(event);
                  }}
                  className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition cursor-pointer ${
                    isSaved
                      ? 'bg-[#FF2D55] text-white'
                      : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/80'
                  }`}
                  title={isSaved ? 'Remove from saved' : 'Save event'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                </button>
              </div>

              {/* Event Card Body */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/50 mb-1">
                    <span className="uppercase tracking-wider font-semibold text-[#FF2D55]">
                      {event.category}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 line-clamp-1">
                      <MapPin className="w-3 h-3 text-white/40 shrink-0" />
                      {event.venue.area}
                    </span>
                  </div>

                  <h4
                    onClick={() => onSelectEvent(event)}
                    className="text-sm font-bold text-white group-hover:text-[#FFCC00] transition line-clamp-2 cursor-pointer leading-snug mb-2"
                  >
                    {event.title}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-white/60 mb-3">
                    <Calendar className="w-3.5 h-3.5 text-[#FFCC00] shrink-0" />
                    <span className="line-clamp-1">{event.dateStr}</span>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  onClick={() => onGetTickets(event)}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition group-hover:shadow-md cursor-pointer ${
                    event.isSoldOut
                      ? 'bg-amber-500/20 hover:bg-amber-500 text-[#FFCC00] hover:text-black border border-amber-500/30'
                      : 'bg-[#1f1f2e] hover:bg-[#FF2D55] text-white'
                  }`}
                >
                  {event.isSoldOut ? (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>Join Waitlist</span>
                    </>
                  ) : (
                    <>
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Get tickets</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
