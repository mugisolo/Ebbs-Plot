import React, { useState } from 'react';
import {
  X,
  Ticket,
  Wallet,
  Check,
  AlertCircle,
  Plus,
  Sparkles,
  ListTodo,
  Bell,
  Clock,
  Flame,
  Users,
  CheckCircle2,
  Zap,
  Share2,
  Copy,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EntebbeEvent, UserProfile, UserTicket } from '../types';

interface TicketPurchaseModalProps {
  event: EntebbeEvent | null;
  user: UserProfile | null;
  onClose: () => void;
  onSuccess: (newTicket: UserTicket, totalPaid: number, syncGoogleTasks: boolean) => void;
  onOpenTopUp: () => void;
  onJoinWaitlist?: (event: EntebbeEvent, tier: string, quantity: number) => void;
  onSimulateTicketRelease?: (event: EntebbeEvent) => void;
}

export const TicketPurchaseModal: React.FC<TicketPurchaseModalProps> = ({
  event,
  user,
  onClose,
  onSuccess,
  onOpenTopUp,
  onJoinWaitlist,
  onSimulateTicketRelease,
}) => {
  const [ticketTier, setTicketTier] = useState<'Regular' | 'VIP' | 'Early Bird'>('Regular');
  const [quantity, setQuantity] = useState(1);
  const [syncToTasks, setSyncToTasks] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Waitlist states
  const [isWaitlisted, setIsWaitlisted] = useState(false);
  const [queuePosition, setQueuePosition] = useState(
    (event?.waitlistCount || 24) + 1
  );
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [notifyViaSMS, setNotifyViaSMS] = useState(true);
  const [notifyViaPush, setNotifyViaPush] = useState(true);

  // Social Share states
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!event) return null;

  const isSoldOut = Boolean(event.isSoldOut && !isProcessing);

  // Helper to compile event details for native share & clipboard
  const getShareData = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://kesho.ug';
    const priceDisplay = event.isFree ? 'Free Admission' : `UGX ${event.priceUGX.toLocaleString()}`;
    const text = `🎟️ Join me at "${event.title}" in Entebbe!\n📍 Venue: ${event.venue.name} (${event.venue.area})\n📅 Date: ${event.dateStr} • ${event.timeStr}\n💵 Admission: ${priceDisplay}\n\nGet tickets and lakeshore guides on Kesho Entebbe:`;

    return {
      title: `${event.title} | Kesho Entebbe`,
      text,
      url: currentUrl,
    };
  };

  // Copy event details and link to clipboard fallback
  const handleCopyLink = async () => {
    const shareData = getShareData();
    try {
      const fullText = `${shareData.text}\n${shareData.url}`;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = fullText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      setShareFeedback('Event link & details copied to clipboard!');
      setTimeout(() => {
        setCopiedLink(false);
        setShareFeedback(null);
      }, 3500);
    } catch {
      setShareFeedback('Failed to copy. Please try again.');
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  // Primary share action using Native Web Share API
  const handleShare = async () => {
    const shareData = getShareData();

    // Check if Native Share API is supported by the browser/device
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        });
        setShareFeedback('Shared successfully!');
        setTimeout(() => setShareFeedback(null), 3500);
      } catch (err: unknown) {
        // If user cancelled the native share sheet (AbortError), don't show an error
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // If native share failed for another reason (e.g. permission or platform constraint), fallback
        await handleCopyLink();
      }
    } else {
      // Browser does not support navigator.share, fallback to clipboard copy
      await handleCopyLink();
    }
  };

  // Calculate tier price
  const basePrice = event.isFree ? 0 : event.priceUGX;
  const unitPrice =
    ticketTier === 'VIP'
      ? basePrice + 50000
      : ticketTier === 'Early Bird'
      ? Math.max(0, basePrice - 5000)
      : basePrice;

  const totalCost = unitPrice * quantity;
  const userBalance = user?.walletBalance ?? 150000;
  const hasSufficientBalance = userBalance >= totalCost;
  const shortfall = totalCost - userBalance;

  const handleCheckout = () => {
    if (!hasSufficientBalance) return;

    setIsProcessing(true);
    setTimeout(() => {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF2D55', '#FFCC00', '#007AFF', '#34C759'],
        });
      } catch (err) {
        // ignore
      }

      const generatedTicket: UserTicket = {
        id: `TKT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        userId: user?.id || 'guest',
        eventId: event.id,
        eventTitle: event.title,
        venueName: event.venue.name,
        area: event.venue.area,
        eventDate: event.dateStr,
        ticketType: ticketTier,
        priceUGX: totalCost,
        qrCode: `KESHO-PASS:${event.id}:${ticketTier}:${Date.now()}`,
        status: 'valid',
        createdAt: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      };

      setIsProcessing(false);
      onSuccess(generatedTicket, totalCost, syncToTasks);
    }, 800);
  };

  const handleJoinWaitlistSubmit = () => {
    setIsJoiningWaitlist(true);

    setTimeout(() => {
      setIsJoiningWaitlist(false);
      setIsWaitlisted(true);

      try {
        confetti({
          particleCount: 60,
          spread: 50,
          colors: ['#FFCC00', '#FF2D55'],
        });
      } catch {
        // ignore
      }

      if (onJoinWaitlist) {
        onJoinWaitlist(event, ticketTier, quantity);
      }
    }, 600);
  };

  const handleTriggerSimulatedRelease = () => {
    if (onSimulateTicketRelease) {
      onSimulateTicketRelease(event);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-[#16161f] border border-white/10 shadow-2xl p-6 relative text-left overflow-hidden">
        {/* Glow ambient */}
        <div
          className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
            isSoldOut ? 'bg-amber-500/20' : 'bg-[#FF2D55]/20'
          }`}
        />

        {/* Top-Right Action Controls: Social Share & Close */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share event details via native share"
            title="Share this Entebbe event"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 hover:text-white border border-white/15 transition cursor-pointer text-xs font-bold shadow-sm backdrop-blur-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-[#FF2D55]" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${
              isSoldOut
                ? 'bg-gradient-to-br from-[#FF9500] to-rose-600 shadow-rose-500/30'
                : 'bg-gradient-to-br from-[#FF2D55] to-[#FF5E3A] shadow-[#FF2D55]/30'
            }`}
          >
            {isSoldOut ? <Flame className="w-6 h-6 fill-current" /> : <Ticket className="w-6 h-6" />}
          </div>
          <div className="pr-24">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-black uppercase tracking-wider ${
                  isSoldOut ? 'text-[#FFCC00]' : 'text-[#FF2D55]'
                }`}
              >
                {isSoldOut ? 'Sold Out · Waitlist Active' : 'Secure Ticketing'}
              </span>
              {isSoldOut && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider border border-rose-500/30">
                  Capacity Reached
                </span>
              )}
            </div>
            <h3 className="text-base md:text-lg font-black text-white line-clamp-1">
              {event.title}
            </h3>
            <p className="text-xs text-white/50">{event.venue.name} · {event.dateStr}</p>
          </div>
        </div>

        {/* Share Feedback Toast / Alert Banner */}
        {shareFeedback && (
          <div className="mb-3.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{shareFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setShareFeedback(null)}
              className="text-emerald-400/60 hover:text-emerald-300 text-xs ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Social Share Callout Bar */}
        <div className="mb-4 flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF2D55]/10 border border-[#FF2D55]/20 flex items-center justify-center text-[#FF2D55] shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-tight truncate">Going with friends?</p>
              <p className="text-[10px] text-white/50 leading-tight">Share event details via your favorite app</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] hover:brightness-110 active:scale-95 text-white text-xs font-bold transition cursor-pointer shadow-sm shadow-[#FF2D55]/20"
              title="Share using device share dialog"
            >
              <Share2 className="w-3 h-3" />
              <span className="hidden sm:inline">Native Share</span>
              <span className="sm:hidden">Share</span>
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Join me at "${event.title}"!\n📍 ${event.venue.name} (${event.venue.area}, Entebbe)\n📅 ${event.dateStr} • ${event.timeStr}\n🎟️ ${event.isFree ? 'Free Admission' : `Tickets: UGX ${event.priceUGX.toLocaleString()}`}\n\nCheck Kesho Entebbe: ${typeof window !== 'undefined' ? window.location.href : 'https://kesho.ug'}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
              title="Share on WhatsApp"
              className="p-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition cursor-pointer flex items-center justify-center"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              aria-label="Copy event link and details"
              title="Copy event details"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/10 transition cursor-pointer flex items-center justify-center"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* SOLD OUT / WAITLIST VIEW */}
        {isSoldOut ? (
          <div>
            {!isWaitlisted ? (
              <div className="space-y-4">
                {/* Waitlist banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#1f1f2e] to-rose-500/10 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#FFCC00] flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Priority Ticket Queue
                    </span>
                    <span className="text-xs font-mono font-bold text-white/80 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#FF2D55]" />
                      {event.waitlistCount || 24} waiting
                    </span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    General allocation for this Entebbe lakeshore event is currently full. Join the waitlist to receive an automated notification the instant returned passes, promoter holds, or VIP sponsor drops open up.
                  </p>
                </div>

                {/* Preference: Desired Ticket Tier */}
                <div>
                  <label className="text-xs font-semibold text-white/70 mb-1.5 block">
                    Preferred Tier if Tickets Open:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Early Bird', 'Regular', 'VIP'] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setTicketTier(tier)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          ticketTier === tier
                            ? 'border-[#FFCC00] bg-[#FFCC00]/10 text-white'
                            : 'border-white/5 bg-[#1f1f2e] text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#1f1f2e] border border-white/5">
                  <span className="text-xs font-semibold text-white">Tickets Desired:</span>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-lg bg-white/10 text-white font-bold flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-sm text-white w-5 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(4, q + 1))}
                      className="w-7 h-7 rounded-lg bg-white/10 text-white font-bold flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Notification preferences */}
                <div className="p-3.5 rounded-2xl bg-[#0d0d12] border border-white/10 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
                    Notification Dispatch Settings
                  </span>

                  <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyViaPush}
                      onChange={(e) => setNotifyViaPush(e.target.checked)}
                      className="accent-[#FF2D55] rounded"
                    />
                    <Bell className="w-3.5 h-3.5 text-[#FFCC00]" />
                    <span>In-App Mock Notification Alert &amp; Banner</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyViaSMS}
                      onChange={(e) => setNotifyViaSMS(e.target.checked)}
                      className="accent-[#FF2D55] rounded"
                    />
                    <span className="font-mono text-[11px] text-white/60">
                      SMS to MTN/Airtel MoMo: {user?.phone || '0772 458 912'}
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-xs transition cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    onClick={handleJoinWaitlistSubmit}
                    disabled={isJoiningWaitlist}
                    className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#FF9500] via-[#FF2D55] to-rose-600 hover:brightness-110 active:scale-95 text-white font-black text-xs md:text-sm shadow-xl shadow-rose-500/20 transition cursor-pointer"
                  >
                    {isJoiningWaitlist ? (
                      <span>Adding to Waitlist...</span>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        <span>Join Waitlist (Queue #{queuePosition})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Already Waitlisted Confirmation Card */
              <div className="py-4 text-center animate-scaleUp space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full bg-[#FFCC00]/20 text-[#FFCC00] text-[10px] font-black uppercase font-mono tracking-wider">
                    Waitlist Confirmed
                  </span>
                  <h4 className="text-lg font-black text-white mt-1.5">
                    You&apos;re #{queuePosition} in Line!
                  </h4>
                  <p className="text-xs text-white/60 max-w-sm mx-auto mt-1 leading-relaxed">
                    We&apos;ve added a priority monitor for <strong>{event.title}</strong>. When tickets are released, you will get an instant push dispatch.
                  </p>
                </div>

                {/* Simulated Trigger Alert Action */}
                <div className="p-4 rounded-2xl bg-[#0d0d12] border border-amber-500/30 text-left">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FFCC00] mb-1">
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Mock Notification Simulation</span>
                  </div>
                  <p className="text-[11px] text-white/60 mb-3">
                    Want to see how the notification alert looks when tickets become available? Click below to simulate an immediate ticket drop.
                  </p>
                  <button
                    onClick={handleTriggerSimulatedRelease}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFCC00] to-[#FF9500] text-black font-black text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Trigger Mock Ticket Drop Alert Now</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsWaitlisted(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs transition cursor-pointer"
                  >
                    Leave Waitlist
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl bg-[#1f1f2e] hover:bg-white/10 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* REGULAR TICKET PURCHASE VIEW */
          <div>
            {/* Tier Selector */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-white/60 mb-2 block">
                Select Ticket Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Early Bird', 'Regular', 'VIP'] as const).map((tier) => {
                  const isSelected = ticketTier === tier;
                  const tierPrice =
                    tier === 'VIP'
                      ? basePrice + 50000
                      : tier === 'Early Bird'
                      ? Math.max(0, basePrice - 5000)
                      : basePrice;

                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setTicketTier(tier)}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#FF2D55] bg-[#FF2D55]/10 text-white'
                          : 'border-white/5 bg-[#1f1f2e] text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xs font-bold">{tier}</span>
                      <span className="font-mono text-xs font-bold text-[#FFCC00] mt-1">
                        {tierPrice === 0 ? 'Free' : `UGX ${tierPrice.toLocaleString()}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1f1f2e] border border-white/5 mb-4">
              <span className="text-xs font-semibold text-white">Tickets Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono font-bold text-white text-sm w-6 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Google Tasks Checkbox */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 mb-4">
              <input
                type="checkbox"
                id="syncTasks"
                checked={syncToTasks}
                onChange={(e) => setSyncToTasks(e.target.checked)}
                className="w-4 h-4 accent-[#FF2D55] rounded cursor-pointer"
              />
              <label htmlFor="syncTasks" className="text-xs text-white/80 cursor-pointer flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-[#FFCC00]" />
                <span>Add event reminder &amp; details to my Google Tasks</span>
              </label>
            </div>

            {/* Wallet Balance Summary */}
            <div className="p-4 rounded-2xl bg-[#0d0d12] border border-white/10 mb-5">
              <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#FF2D55]" />
                  Kesho Wallet Balance
                </span>
                <span className="font-mono font-bold text-white">
                  UGX {userBalance.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm font-bold text-white border-t border-white/10 pt-2">
                <span>Total Amount Due</span>
                <span className="font-mono text-base text-[#FFCC00]">
                  UGX {totalCost.toLocaleString()}
                </span>
              </div>

              {!hasSufficientBalance && (
                <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    Shortfall: UGX {shortfall.toLocaleString()}
                  </span>
                  <button
                    onClick={onOpenTopUp}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#FF2D55] text-white font-bold text-xs cursor-pointer hover:brightness-110"
                  >
                    <Plus className="w-3 h-3" /> Top Up MoMo
                  </button>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleCheckout}
                disabled={!hasSufficientBalance || isProcessing}
                className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs md:text-sm shadow-xl shadow-[#FF2D55]/30 transition cursor-pointer"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deducting Wallet &amp; Generating Pass...
                  </span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Purchase &amp; Claim Pass</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
