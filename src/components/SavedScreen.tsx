import React from 'react';
import { Bookmark, Calendar, MapPin, Ticket, Compass, Trash2 } from 'lucide-react';
import { EntebbeEvent } from '../types';

interface SavedScreenProps {
  savedEvents: EntebbeEvent[];
  onGetTickets: (event: EntebbeEvent) => void;
  onRemoveSaved: (event: EntebbeEvent) => void;
  onSelectEvent: (event: EntebbeEvent) => void;
  onGoToDiscover: () => void;
}

export const SavedScreen: React.FC<SavedScreenProps> = ({
  savedEvents,
  onGetTickets,
  onRemoveSaved,
  onSelectEvent,
  onGoToDiscover,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-28 text-left animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Saved Events
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF2D55]/20 text-[#FF2D55] text-xs font-bold font-mono">
              {savedEvents.length}
            </span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Your personalized Entebbe lakeshore nightlife &amp; weekend shortlist
          </p>
        </div>
      </div>

      {savedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-[#16161f] border border-white/5 text-center my-6">
          <div className="w-20 h-20 rounded-full bg-[#1f1f2e] flex items-center justify-center text-white/30 mb-4 shadow-inner">
            <Bookmark className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Saved Events Yet</h3>
          <p className="text-xs md:text-sm text-white/50 max-w-sm mb-6 leading-relaxed">
            Bookmark interesting quiz nights, lakeside jazz sessions, and beach festivals across Entebbe to track ticket availability and dates.
          </p>
          <button
            onClick={onGoToDiscover}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] text-white font-bold text-xs md:text-sm shadow-xl shadow-[#FF2D55]/30 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Entebbe Events</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {savedEvents.map((event) => (
            <div
              key={event.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#16161f] border border-white/10 hover:border-[#FF2D55]/40 transition group"
            >
              <div
                onClick={() => onSelectEvent(event)}
                className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
              >
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-[#FF2D55] uppercase tracking-wider">
                    {event.category}
                  </span>
                  <h4 className="text-sm md:text-base font-bold text-white group-hover:text-[#FFCC00] transition line-clamp-1">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-white/60 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <span className="line-clamp-1">{event.venue.name} ({event.venue.area})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/60 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#FFCC00]" />
                      {event.dateStr}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#FFCC00]">
                      {event.isFree ? 'Free' : `UGX ${event.priceUGX.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                <button
                  onClick={() => onGetTickets(event)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] text-white text-xs font-bold shadow-lg shadow-[#FF2D55]/20 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Get Ticket</span>
                </button>

                <button
                  onClick={() => onRemoveSaved(event)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 border border-white/5 transition cursor-pointer"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
