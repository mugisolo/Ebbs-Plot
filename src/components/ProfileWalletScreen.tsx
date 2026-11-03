import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Calendar,
  CheckCircle2,
  ListTodo,
  ExternalLink,
  Shield,
  FileText,
  LogOut,
  Sparkles,
  Ticket,
  Building,
  User,
  Plus,
  RefreshCw,
  Camera,
} from 'lucide-react';
import { UserProfile, UserTicket, WalletTransaction } from '../types';

interface ProfileWalletScreenProps {
  user: UserProfile | null;
  tickets: UserTicket[];
  transactions: WalletTransaction[];
  onOpenTopUp: () => void;
  onOpenWithdraw: () => void;
  onOpenQRScanner: () => void;
  onViewTicketPass: (ticket: UserTicket) => void;
  onToggleOrganiserMode: (mode: 'attendee' | 'organiser') => void;
  onOpenOrganiserDashboard: () => void;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  isSigningIn: boolean;
}

export const ProfileWalletScreen: React.FC<ProfileWalletScreenProps> = ({
  user,
  tickets,
  transactions,
  onOpenTopUp,
  onOpenWithdraw,
  onOpenQRScanner,
  onViewTicketPass,
  onToggleOrganiserMode,
  onOpenOrganiserDashboard,
  onGoogleSignIn,
  onSignOut,
  isSigningIn,
}) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'transactions'>('tickets');
  const role = user?.role || 'attendee';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-28 text-left animate-fadeIn">
      {/* User Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6 rounded-3xl bg-[#16161f] border border-white/10 mb-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#FF2D55] to-[#FFCC00] p-0.5 shadow-lg shadow-[#FF2D55]/20">
              <div className="w-full h-full rounded-2xl bg-[#16161f] flex items-center justify-center overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl md:text-2xl font-black text-white">
                    {user?.displayName ? user.displayName.charAt(0) : 'R'}
                  </span>
                )}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#FF2D55] text-[9px] font-black uppercase text-white tracking-wider">
              {role}
            </span>
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-bold text-white leading-tight">
              {user?.displayName || 'Remmy Byakutaaga'}
            </h2>
            <p className="text-xs text-white/50">{user?.email || 'remmy.entebbe@kesho.com'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Kesho Verified Entebbe VIP
              </span>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0d0d12] border border-white/10 w-full sm:w-auto justify-center">
          <button
            onClick={() => onToggleOrganiserMode('attendee')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              role === 'attendee'
                ? 'bg-[#1f1f2e] text-white shadow-md'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Attendee</span>
          </button>
          <button
            onClick={() => onToggleOrganiserMode('organiser')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              role === 'organiser'
                ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] text-white shadow-md'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Organiser</span>
          </button>
        </div>
      </div>

      {/* Organiser Prompt if in Organiser Mode */}
      {role === 'organiser' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF2D55]/20 via-[#1f1f2e] to-[#FFCC00]/10 border border-[#FF2D55]/30 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF2D55] animate-ping" />
              <h4 className="text-sm font-bold text-white">Entebbe Organiser Dashboard (Geo-Locked)</h4>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              Host Entebbe events, list local event services, and validate gate QR codes (Entebbe GPS required).
            </p>
          </div>
          <button
            onClick={onOpenOrganiserDashboard}
            className="px-4 py-2 rounded-xl bg-[#FF2D55] hover:bg-[#FF2D55]/90 text-white text-xs font-bold shadow-md cursor-pointer shrink-0"
          >
            Manage Entebbe Events &amp; Services
          </button>
        </div>
      )}

      {/* Kesho Wallet Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1f1f2e] via-[#16161f] to-[#0d0d12] border border-white/15 p-6 mb-8 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#FF2D55]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#FFCC00]/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
            <Wallet className="w-4 h-4 text-[#FF2D55]" />
            <span>Kesho UGX Digital Wallet</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
            Instant MoMo Rails
          </span>
        </div>

        <div className="mb-6">
          <span className="text-xs text-white/50">Available Balance</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xs font-mono font-bold text-[#FF2D55]">UGX</span>
            <span className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">
              {(user?.walletBalance ?? 150000).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={onOpenTopUp}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] hover:brightness-110 active:scale-95 text-white font-bold text-xs md:text-sm shadow-xl shadow-[#FF2D55]/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Top Up (MoMo/Card)</span>
          </button>

          <button
            onClick={onOpenWithdraw}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white font-semibold text-xs md:text-sm border border-white/10 transition cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 text-[#FFCC00]" />
            <span>Withdraw</span>
          </button>
        </div>

        {/* Scan QR Code for Invites & Entry */}
        <button
          onClick={onOpenQRScanner}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF2D55]/20 via-[#1f1f2e] to-[#FFCC00]/20 hover:from-[#FF2D55]/30 hover:to-[#FFCC00]/30 border border-[#FF2D55]/40 text-white font-bold text-xs md:text-sm shadow-lg transition active:scale-[0.99] cursor-pointer"
        >
          <Camera className="w-4 h-4 text-[#FF2D55]" />
          <span>Scan Event Invitation or Venue Entry QR</span>
          <QrCode className="w-4 h-4 text-[#FFCC00]" />
        </button>
      </div>

      {/* Tabs: My Tickets vs Wallet Transactions */}
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`text-sm font-bold pb-2 transition cursor-pointer relative ${
              activeTab === 'tickets' ? 'text-[#FF2D55]' : 'text-white/50 hover:text-white'
            }`}
          >
            My Digital Passes ({tickets.length})
            {activeTab === 'tickets' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#FF2D55] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`text-sm font-bold pb-2 transition cursor-pointer relative ${
              activeTab === 'transactions' ? 'text-[#FF2D55]' : 'text-white/50 hover:text-white'
            }`}
          >
            Wallet History ({transactions.length})
            {activeTab === 'transactions' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#FF2D55] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'tickets' ? (
        <div className="space-y-3 mb-8">
          {tickets.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#16161f] border border-white/5 text-center">
              <Ticket className="w-10 h-10 text-white/20 mx-auto mb-2" />
              <p className="text-sm font-bold text-white/80">No Tickets Purchased Yet</p>
              <p className="text-xs text-white/40 mt-1">
                Explore Entebbe quiz nights, lakeside jazz festivals, and beach raves to claim your gate pass.
              </p>
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => onViewTicketPass(t)}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#16161f] border border-white/10 hover:border-[#FF2D55]/50 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1f1f2e] border border-white/10 flex items-center justify-center text-[#FF2D55] group-hover:scale-105 transition">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#FFCC00]">
                      {t.ticketType} Pass
                    </span>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{t.eventTitle}</h4>
                    <p className="text-xs text-white/50">
                      {t.venueName} · {t.eventDate}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase font-mono">
                    {t.status}
                  </span>
                  <p className="text-[11px] text-[#FF2D55] font-semibold mt-1">Tap for QR Pass</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2.5 mb-8">
          {transactions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#16161f] border border-white/5 text-center text-xs text-white/40">
              No transactions on record.
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#16161f] border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === 'topup' || tx.type === 'cashback'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-[#FF2D55]/20 text-[#FF2D55]'
                    }`}
                  >
                    {tx.type === 'topup' || tx.type === 'cashback' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{tx.description}</h5>
                    <p className="text-[11px] text-white/40">
                      {tx.method} · {tx.createdAt}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span
                    className={`text-xs font-bold ${
                      tx.type === 'topup' || tx.type === 'cashback'
                        ? 'text-emerald-400'
                        : 'text-white'
                    }`}
                  >
                    {tx.type === 'topup' || tx.type === 'cashback' ? '+' : '-'}UGX{' '}
                    {tx.amountUGX.toLocaleString()}
                  </span>
                  <div className="text-[10px] text-white/30 capitalize">{tx.status}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Google Sign-in / Account Status */}
      <div className="p-5 rounded-2xl bg-[#16161f] border border-white/10 mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
          Account &amp; Security
        </h4>

        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Connected with Google</p>
                <p className="text-[11px] text-white/50">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-400 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs text-white/70 mb-3">
              Sign in with your Google account to sync tickets across devices and enable 1-click Google Tasks reminders.
            </p>
            {/* Official GSI Style button from workspace-integration */}
            <button
              onClick={onGoogleSignIn}
              disabled={isSigningIn}
              className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-xl bg-white text-gray-800 font-medium text-xs hover:bg-gray-100 transition shadow cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Settings list */}
      <div className="rounded-2xl bg-[#16161f] border border-white/5 divide-y divide-white/5">
        <button
          onClick={onOpenQRScanner}
          className="w-full p-3.5 flex items-center justify-between text-xs text-white/70 hover:text-white hover:bg-white/5 transition cursor-pointer text-left"
        >
          <span className="flex items-center gap-2.5">
            <Camera className="w-4 h-4 text-[#FF2D55]" />
            <span>Camera QR Code Scanner</span>
          </span>
          <span className="text-[11px] text-[#FFCC00] font-bold">Open Scanner →</span>
        </button>

        <div className="p-3.5 flex items-center justify-between text-xs text-white/70 hover:text-white transition">
          <span className="flex items-center gap-2.5">
            <ListTodo className="w-4 h-4 text-[#FFCC00]" />
            <span>Google Tasks Auto-Sync</span>
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold">Enabled</span>
        </div>

        <div className="p-3.5 flex items-center justify-between text-xs text-white/70 hover:text-white transition">
          <span className="flex items-center gap-2.5">
            <Building className="w-4 h-4 text-[#FF2D55]" />
            <span>Host Events &amp; Services (Entebbe Organiser Geo-Lock)</span>
          </span>
          <button
            onClick={() => onToggleOrganiserMode('organiser')}
            className="text-[11px] text-[#FF2D55] font-bold hover:underline"
          >
            Verify Entebbe Access →
          </button>
        </div>

        <div className="p-3.5 flex items-center justify-between text-xs text-white/70 hover:text-white transition">
          <span className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-white/40" />
            <span>Privacy Policy &amp; Security</span>
          </span>
          <span className="text-[11px] text-white/40">kesho.com/privacy</span>
        </div>

        <div className="p-3.5 flex items-center justify-between text-xs text-white/70 hover:text-white transition">
          <span className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-white/40" />
            <span>Terms of Service &amp; EULA</span>
          </span>
          <span className="text-[11px] text-white/40">v2.4.0</span>
        </div>
      </div>
    </div>
  );
};
