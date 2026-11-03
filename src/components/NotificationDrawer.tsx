import React from 'react';
import { X, Bell, Flame, Calendar, Ticket, Check } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'urgent' | 'ticket' | 'promo' | 'waitlist';
  eventId?: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm h-full bg-[#16161f] border-l border-white/10 p-5 flex flex-col shadow-2xl text-left animate-slideLeft">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF2D55]/20 text-[#FF2D55] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-[#FF2D55] hover:underline cursor-pointer"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition ${
                item.unread
                  ? 'bg-[#1f1f2e] border-[#FF2D55]/30'
                  : 'bg-[#16161f] border-white/5 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    item.type === 'waitlist'
                      ? 'bg-amber-500/20 text-[#FFCC00] border border-amber-500/30'
                      : item.type === 'urgent'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-white/10 text-white/80'
                  }`}
                >
                  {item.type}
                </span>
                <span className="text-[10px] text-white/40">{item.time}</span>
              </div>
              <h4 className="text-xs font-bold text-white mb-1">{item.title}</h4>
              <p className="text-xs text-white/60 leading-relaxed">{item.message}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/5 text-[11px] text-white/40 text-center">
          Kesho Live Dispatch · Entebbe Peninsula
        </div>
      </div>
    </div>
  );
};
