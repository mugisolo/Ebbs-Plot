import React from 'react';
import { Compass, Search, Bookmark, User, Wallet } from 'lucide-react';

export type TabType = 'discover' | 'search' | 'saved' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  savedCount: number;
  walletBalance: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  savedCount,
  walletBalance,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#16161f]/90 backdrop-blur-2xl border-t border-white/10 px-4 py-2 select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Discover */}
        <button
          onClick={() => onChangeTab('discover')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            currentTab === 'discover'
              ? 'text-[#FF2D55] font-bold'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <div className="relative">
            <Compass className={`w-5 h-5 ${currentTab === 'discover' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {currentTab === 'discover' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF2D55]" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Discover</span>
        </button>

        {/* Search */}
        <button
          onClick={() => onChangeTab('search')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            currentTab === 'search'
              ? 'text-[#FF2D55] font-bold'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <div className="relative">
            <Search className={`w-5 h-5 ${currentTab === 'search' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {currentTab === 'search' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF2D55]" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Search</span>
        </button>

        {/* Saved */}
        <button
          onClick={() => onChangeTab('saved')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            currentTab === 'saved'
              ? 'text-[#FF2D55] font-bold'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <div className="relative">
            <Bookmark className={`w-5 h-5 ${currentTab === 'saved' ? 'fill-[#FF2D55] stroke-[#FF2D55]' : 'stroke-2'}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-[#FF2D55] text-white text-[9px] font-bold flex items-center justify-center">
                {savedCount}
              </span>
            )}
            {currentTab === 'saved' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF2D55]" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Saved</span>
        </button>

        {/* Profile & Wallet */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            currentTab === 'profile'
              ? 'text-[#FF2D55] font-bold'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <div className="relative">
            <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {currentTab === 'profile' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF2D55]" />
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] tracking-tight">
            <span>Profile</span>
            <span className="text-[9px] text-[#FFCC00] font-mono">
              UGX {(walletBalance / 1000).toFixed(0)}k
            </span>
          </div>
        </button>
      </div>
    </nav>
  );
};
