import React, { useState } from 'react';
import { X, MapPin, Navigation, Calendar, Ticket, Compass, Lock, Globe } from 'lucide-react';
import { ENTEBBE_VENUES, calculateDistanceToEntebbeKm } from '../data/entebbeEvents';
import { EntebbeEvent, EntebbeVenue } from '../types';

interface EntebbeMapModalProps {
  events: EntebbeEvent[];
  onClose: () => void;
  onSelectEvent: (event: EntebbeEvent) => void;
  onGetTickets: (event: EntebbeEvent) => void;
}

export const EntebbeMapModal: React.FC<EntebbeMapModalProps> = ({
  events,
  onClose,
  onSelectEvent,
  onGetTickets,
}) => {
  const venuesList = Object.values(ENTEBBE_VENUES);
  const [selectedVenue, setSelectedVenue] = useState<EntebbeVenue>(venuesList[0]);

  const venueEvents = events.filter((e) => e.venue.id === selectedVenue.id);
  const distFromCenter = calculateDistanceToEntebbeKm(selectedVenue.lat, selectedVenue.lng);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6 animate-fadeIn">
      <div className="w-full max-w-4xl h-[90vh] max-h-[820px] rounded-3xl bg-[#16161f] border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white/70 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Interactive Entebbe Peninsula Stylized Map Canvas */}
        <div className="relative flex-1 bg-[#0d0d12] border-b md:border-b-0 md:border-r border-white/10 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-[#16161f]/80 backdrop-blur-md border-b border-white/10 z-10 flex items-center justify-between pr-14">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FF2D55] uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" /> Entebbe Peninsula Venue Radar
              </div>
              <h3 className="text-base font-black text-white">
                Lake Victoria Shoreline &amp; Nightlife Map
              </h3>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
              <Lock className="w-3 h-3" />
              <span>12km Entebbe Geo-Fence</span>
            </div>
          </div>

          {/* Map Graphic Area with Styled SVG Vector Peninsula & Lake Victoria */}
          <div className="relative flex-1 overflow-hidden p-6 flex items-center justify-center select-none bg-[radial-gradient(#1f1f2e_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Ambient Lake Victoria & Peninsula glows */}
            <div className="absolute top-1/4 left-1/3 w-48 h-48 rounded-full bg-[#007AFF]/15 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-[#FF2D55]/10 blur-3xl" />

            {/* Stylized Entebbe Peninsula & Lake Victoria Shoreline Vector */}
            <svg
              className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Entebbe 12km Geo-Fence Perimeter Ring */}
              <circle
                cx="50%"
                cy="50%"
                r="175"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                fill="none"
              />
              {/* Peninsula highway & shoreline paths */}
              <path
                d="M 380 30 Q 340 160 300 240 T 190 410"
                stroke="#FF2D55"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M 110 210 Q 250 230 390 270 T 560 350"
                stroke="#FFCC00"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5 5"
              />
              <path
                d="M 80 340 Q 240 390 440 370 T 660 280"
                stroke="#007AFF"
                strokeWidth="2"
                fill="none"
              />
            </svg>

            {/* Geo-Fence Label */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 border border-white/10 text-[10px] font-mono text-white/70 flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-[#FFCC00]" />
              <span>Guests: Global View · Venues &amp; Providers: Entebbe Only</span>
            </div>

            {/* Venue Hotspot Pins */}
            <div className="relative w-full h-full max-w-lg max-h-[460px]">
              {venuesList.map((venue, index) => {
                const isSelected = selectedVenue.id === venue.id;
                // Distribute pins across stylized Entebbe Peninsula grid
                const positions = [
                  { top: '42%', left: '48%' }, // Riders Kitoro
                  { top: '55%', left: '68%' }, // Goretti Waterfront
                  { top: '76%', left: '34%' }, // Aero Beach
                  { top: '66%', left: '58%' }, // 2 Friends Bugonga
                  { top: '32%', left: '66%' }, // Botanical Gardens
                  { top: '46%', left: '22%' }, // Nakiwogo Pier
                  { top: '48%', left: '62%' }, // UWEC Lugard Ave
                  { top: '60%', left: '50%' }, // Imperial Beach Bugonga
                  { top: '52%', left: '40%' }, // Entebbe Golf Club
                  { top: '16%', left: '72%' }, // Oasis Katabi / Abaita Ababiri
                ];
                const pos = positions[index % positions.length];

                return (
                  <button
                    key={venue.id}
                    onClick={() => setSelectedVenue(venue)}
                    style={{ top: pos.top, left: pos.left }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-transform duration-200 z-10 ${
                      isSelected ? 'scale-125 z-20' : 'hover:scale-110'
                    }`}
                  >
                    <div
                      className={`relative p-2.5 rounded-full shadow-xl transition ${
                        isSelected
                          ? 'bg-[#FF2D55] text-white ring-4 ring-[#FF2D55]/30'
                          : 'bg-[#1f1f2e] text-[#FFCC00] border border-white/20 hover:bg-[#FF2D55] hover:text-white'
                      }`}
                    >
                      <MapPin className="w-4 h-4 fill-current" />
                      {isSelected && (
                        <span className="absolute -inset-1 rounded-full border border-[#FF2D55] animate-ping" />
                      )}
                    </div>
                    <span
                      className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md ${
                        isSelected
                          ? 'bg-[#FF2D55] text-white'
                          : 'bg-black/80 text-white/80 group-hover:text-white'
                      }`}
                    >
                      {venue.area}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Entebbe Venue Details & Live Events */}
        <div className="w-full md:w-[380px] bg-[#16161f] p-5 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#FFCC00]/20 text-[#FFCC00] text-[10px] font-black uppercase tracking-wider">
                {selectedVenue.area} · Entebbe
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">
                {distFromCenter}km from Ctr
              </span>
            </div>

            <h3 className="text-xl font-black text-white leading-tight mb-1">
              {selectedVenue.name}
            </h3>
            <p className="text-xs text-white/60 mb-1">{selectedVenue.address}</p>
            <p className="text-[11px] text-white/40 font-mono mb-3">
              GPS: {selectedVenue.lat.toFixed(4)}° N, {selectedVenue.lng.toFixed(4)}° E (Entebbe Geo-Verified)
            </p>

            <div className="p-3 rounded-xl bg-[#1f1f2e] border border-white/5 mb-4 text-xs text-white/80 leading-relaxed">
              <span className="font-bold text-[#FF2D55]">Lakeshore Vibe:</span> {selectedVenue.vibe}
            </div>

            {/* External Navigation Link */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                selectedVenue.name + ' Entebbe Uganda'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#007AFF] hover:underline mb-5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions in Entebbe on Google Maps →</span>
            </a>

            {/* Events at this Venue */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3 flex items-center justify-between">
                <span>Events at {selectedVenue.name}</span>
                <span className="text-[#FF2D55] font-mono">{venueEvents.length}</span>
              </h4>

              {venueEvents.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/5 text-center text-xs text-white/40">
                  No active public tickets right now. Check back soon!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {venueEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-xl bg-[#1f1f2e] border border-white/5 hover:border-[#FF2D55]/40 transition text-left"
                    >
                      <h5
                        onClick={() => onSelectEvent(evt)}
                        className="text-xs font-bold text-white line-clamp-1 hover:text-[#FFCC00] cursor-pointer"
                      >
                        {evt.title}
                      </h5>
                      <div className="flex items-center justify-between text-[11px] text-white/60 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#FFCC00]" />
                          {evt.dateStr}
                        </span>
                        <span className="font-mono font-bold text-white">
                          {evt.isFree ? 'Free' : `UGX ${evt.priceUGX.toLocaleString()}`}
                        </span>
                      </div>
                      <button
                        onClick={() => onGetTickets(evt)}
                        className="mt-2 w-full py-1.5 rounded-lg bg-[#FF2D55] hover:bg-[#FF2D55]/90 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow cursor-pointer"
                      >
                        <Ticket className="w-3 h-3" />
                        <span>Get Tickets</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[11px] text-white/40 text-center">
            Kesho Entebbe Peninsula Geolocation Directory
          </div>
        </div>
      </div>
    </div>
  );
};
