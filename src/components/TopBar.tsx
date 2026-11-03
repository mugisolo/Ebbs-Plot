import React from 'react';
import { Search, Bell, Sparkles, MapPin, Music2 } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { UserProfile } from '../types';

interface TopBarProps {
  user: UserProfile | null;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenMap: () => void;
  onOpenChat: () => void;
  onOpenMusic: () => void;
  unreadNotificationsCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onOpenSearch,
  onOpenNotifications,
  onOpenMap,
  onOpenChat,
  onOpenMusic,
  unreadNotificationsCount,
}) => {
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Remmy';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0d12]/90 backdrop-blur-md border-b border-white/5 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Greeting */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF2D55] to-[#FF9500] flex items-center justify-center font-black text-white text-base shadow-md shadow-[#FF2D55]/30">
              K
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white/50 tracking-wide uppercase">Kesho · Entebbe Only</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h1 className="text-sm md:text-base font-bold text-white tracking-tight leading-tight line-clamp-1">
                Hey {firstName} 👋, what&apos;s happening in Entebbe
              </h1>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* AI Concierge Chatbot Button */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#1f1f2e] border border-white/10 hover:border-[#FF2D55]/50 text-white/80 hover:text-white text-xs font-semibold transition cursor-pointer"
            title="Ask Kesho Entebbe AI Concierge"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFCC00]" />
            <span className="hidden sm:inline">Kesho AI</span>
          </button>

          {/* Music Vibe Generator */}
          <button
            onClick={onOpenMusic}
            className="p-2 rounded-full bg-[#1f1f2e] border border-white/10 hover:bg-white/10 text-white/80 hover:text-[#FF2D55] transition cursor-pointer"
            title="Entebbe Event Vibes &amp; Music Player"
          >
            <Music2 className="w-4 h-4 text-[#FF2D55]" />
          </button>

          {/* Map Modal Button */}
          <button
            onClick={onOpenMap}
            className="p-2 rounded-full bg-[#1f1f2e] border border-white/10 hover:bg-white/10 text-white/80 hover:text-[#FFCC00] transition cursor-pointer"
            title="Entebbe Peninsula Venue Map"
          >
            <MapPin className="w-4 h-4 text-[#FFCC00]" />
          </button>

          {/* Search Icon */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-full bg-[#1f1f2e] border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            title="Search Events &amp; Categories"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full bg-[#1f1f2e] border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#FF2D55] ring-2 ring-[#0d0d12]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
