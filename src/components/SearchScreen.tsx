import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Clock,
  Sparkles,
  Music,
  HelpCircle,
  Mic,
  Moon,
  Users,
  BookOpen,
  Utensils,
  Palette,
  Trophy,
  Calendar,
  MapPin,
  Ticket,
} from 'lucide-react';
import { CategoryType, EntebbeEvent } from '../types';

interface SearchScreenProps {
  events: EntebbeEvent[];
  onSelectCategory: (category: CategoryType) => void;
  onGetTickets: (event: EntebbeEvent) => void;
  onSelectEvent: (event: EntebbeEvent) => void;
}

const CATEGORY_TILES: { name: CategoryType; icon: any; color: string; bg: string }[] = [
  { name: 'Jazz', icon: Music, color: '#FF2D55', bg: 'rgba(255, 45, 85, 0.15)' },
  { name: 'Quiz Night', icon: HelpCircle, color: '#FFCC00', bg: 'rgba(255, 204, 0, 0.15)' },
  { name: 'Open Mic', icon: Mic, color: '#007AFF', bg: 'rgba(0, 122, 255, 0.15)' },
  { name: 'Nightlife', icon: Moon, color: '#AF52DE', bg: 'rgba(175, 82, 222, 0.15)' },
  { name: 'Meetups', icon: Users, color: '#34C759', bg: 'rgba(52, 199, 89, 0.15)' },
  { name: 'Seminars', icon: BookOpen, color: '#5856D6', bg: 'rgba(88, 86, 214, 0.15)' },
  { name: 'Food', icon: Utensils, color: '#FF9500', bg: 'rgba(255, 149, 0, 0.15)' },
  { name: 'Arts', icon: Palette, color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.15)' },
  { name: 'Sports', icon: Trophy, color: '#30B0C7', bg: 'rgba(48, 176, 199, 0.15)' },
];

export const SearchScreen: React.FC<SearchScreenProps> = ({
  events,
  onSelectCategory,
  onGetTickets,
  onSelectEvent,
}) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Aero Beach Amapiano',
    'Lake Victoria Jazz',
    'Kitoro Pub Quiz',
    'Nakiwogo Boat Cruise',
  ]);

  const clearRecent = () => setRecentSearches([]);

  const addRecent = (text: string) => {
    if (!text.trim()) return;
    setRecentSearches((prev) => [text, ...prev.filter((item) => item !== text)].slice(0, 5));
  };

  // Filter events by query
  const filteredEvents = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.venue.name.toLowerCase().includes(q) ||
        e.venue.area.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [events, query]);

  // Happening Today feed
  const happeningToday = useMemo(() => {
    return events.filter(
      (e) =>
        e.dateStr.toLowerCase().includes('today') ||
        e.dateStr.toLowerCase().includes('tonight') ||
        e.liveStatus === 'LIVE' ||
        e.liveStatus === 'SOON'
    );
  }, [events]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-28 text-left animate-fadeIn">
      {/* Search Input Bar */}
      <div className="relative mb-5">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-white/40 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addRecent(query);
            }}
            placeholder="Search Entebbe events, beaches, DJs, or areas (Kitoro, Bugonga, Nakiwogo)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#16161f] border border-white/10 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[#FF2D55] transition shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 p-1 rounded-full text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* When Query is Active */}
      {query.trim() ? (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white/80">
              Found {filteredEvents.length} result{filteredEvents.length === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
            </h3>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#16161f] border border-white/5 text-center">
              <Search className="w-10 h-10 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/70 font-semibold">No Entebbe events found matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-white/40 mt-1">Try searching for &quot;Jazz&quot;, &quot;Aero Beach&quot;, or &quot;Kitoro&quot;</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#16161f] border border-white/10 hover:border-[#FF2D55]/50 transition cursor-pointer"
                >
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#FF2D55] uppercase">{evt.category}</span>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{evt.title}</h4>
                    <p className="text-[11px] text-white/50 line-clamp-1">{evt.venue.name} · {evt.venue.area}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] font-mono text-[#FFCC00]">
                        {evt.isFree ? 'Free' : `UGX ${evt.priceUGX.toLocaleString()}`}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onGetTickets(evt);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#FF2D55] text-white text-[11px] font-bold"
                      >
                        Tickets
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white/50 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Recent searches
                </span>
                <button
                  onClick={clearRecent}
                  className="text-[11px] text-[#FF2D55] hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-xl bg-[#16161f] hover:bg-white/10 text-xs text-white/80 border border-white/5 transition cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Browse Categories (3x3 Grid) */}
          <div className="mb-8">
            <h3 className="text-base font-black text-white tracking-tight mb-3">
              Browse Categories
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORY_TILES.map((tile) => {
                const IconComponent = tile.icon;
                return (
                  <button
                    key={tile.name}
                    onClick={() => onSelectCategory(tile.name)}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#16161f] border border-white/5 hover:border-[#FF2D55]/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer group"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition duration-300"
                      style={{ backgroundColor: tile.bg, color: tile.color }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-[#FFCC00] transition text-center line-clamp-1">
                      {tile.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Happening Today Vertical Feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                Happening Today in Entebbe
                <span className="w-2 h-2 rounded-full bg-[#FF2D55] animate-ping" />
              </h3>
            </div>

            <div className="space-y-3">
              {happeningToday.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#16161f] border border-white/5 hover:border-[#FF2D55]/40 transition cursor-pointer"
                >
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[#FF2D55] uppercase">
                        {evt.category}
                      </span>
                      <span className="text-white/30">·</span>
                      <span className="text-xs text-white/50 line-clamp-1">{evt.venue.name}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">
                      {evt.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-white/60">
                      <span className="text-[#FFCC00] font-medium">{evt.timeStr}</span>
                      <span className="font-mono font-bold text-white/90">
                        {evt.isFree ? 'Free' : `UGX ${evt.priceUGX.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGetTickets(evt);
                    }}
                    className="shrink-0 px-3 py-2 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    Tickets
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
