import React, { useState } from 'react';
import { X, QrCode, CheckCircle, Calendar, MapPin, Shield, Copy, Check } from 'lucide-react';
import { UserTicket } from '../types';

interface DigitalTicketPassModalProps {
  ticket: UserTicket | null;
  onClose: () => void;
}

export const DigitalTicketPassModal: React.FC<DigitalTicketPassModalProps> = ({
  ticket,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!ticket) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ticket.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1f1f2e] via-[#16161f] to-[#0d0d12] border border-white/15 shadow-2xl p-6 relative text-center overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FF2D55] via-[#FFCC00] to-[#007AFF]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" /> Gate Scanner Valid
          </span>
          <h3 className="text-lg font-black text-white mt-2 leading-tight">
            {ticket.eventTitle}
          </h3>
          <p className="text-xs text-white/50">{ticket.venueName} · {ticket.area}</p>
        </div>

        {/* Dynamic Holographic QR Pass Container */}
        <div className="relative mx-auto w-56 h-56 p-3 rounded-2xl bg-white shadow-2xl flex flex-col items-center justify-center mb-4 border-4 border-[#FF2D55]/30">
          {/* Simulated QR Code Graphic using SVG */}
          <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="currentColor">
            {/* Corner Markers */}
            <rect x="5" y="5" width="25" height="25" rx="3" fill="#000" />
            <rect x="9" y="9" width="17" height="17" fill="#fff" />
            <rect x="13" y="13" width="9" height="9" fill="#FF2D55" />

            <rect x="70" y="5" width="25" height="25" rx="3" fill="#000" />
            <rect x="74" y="9" width="17" height="17" fill="#fff" />
            <rect x="78" y="13" width="9" height="9" fill="#FF2D55" />

            <rect x="5" y="70" width="25" height="25" rx="3" fill="#000" />
            <rect x="9" y="74" width="17" height="17" fill="#fff" />
            <rect x="13" y="78" width="9" height="9" fill="#FF2D55" />

            {/* Matrix Data Blocks */}
            <rect x="35" y="10" width="6" height="6" fill="#000" />
            <rect x="45" y="15" width="6" height="6" fill="#000" />
            <rect x="55" y="10" width="6" height="6" fill="#000" />
            <rect x="35" y="25" width="6" height="6" fill="#000" />
            <rect x="50" y="25" width="8" height="8" fill="#000" />
            <rect x="10" y="40" width="6" height="6" fill="#000" />
            <rect x="25" y="45" width="8" height="6" fill="#000" />
            <rect x="40" y="40" width="20" height="20" rx="3" fill="#FF2D55" />
            <circle cx="50" cy="50" r="5" fill="#fff" />
            <rect x="70" y="45" width="8" height="6" fill="#000" />
            <rect x="85" y="40" width="6" height="6" fill="#000" />
            <rect x="35" y="65" width="6" height="6" fill="#000" />
            <rect x="50" y="75" width="8" height="8" fill="#000" />
            <rect x="65" y="70" width="12" height="6" fill="#000" />
            <rect x="80" y="80" width="8" height="8" fill="#000" />
          </svg>

          {/* Animated Verification Scanline */}
          <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-[#FF2D55] to-transparent animate-pulse" />
        </div>

        {/* Ticket Details Box */}
        <div className="p-3.5 rounded-2xl bg-[#0d0d12] border border-white/10 text-left text-xs space-y-2 mb-4">
          <div className="flex items-center justify-between text-white/60">
            <span>Pass Type</span>
            <span className="font-bold text-[#FFCC00] uppercase font-mono">{ticket.ticketType} Pass</span>
          </div>
          <div className="flex items-center justify-between text-white/60">
            <span>Ticket Pass ID</span>
            <span className="font-mono text-white font-bold">{ticket.id}</span>
          </div>
          <div className="flex items-center justify-between text-white/60">
            <span>Gate Access</span>
            <span className="text-emerald-400 font-semibold">Priority Fast-Track Lane</span>
          </div>
        </div>

        {/* Copy String Button */}
        <button
          onClick={handleCopyCode}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer mb-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Token Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#FFCC00]" />
              <span>Copy Gate Scanner Token</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-white/40">
          Present this screen to the venue bouncer or door attendant at {ticket.venueName}.
        </p>
      </div>
    </div>
  );
};
