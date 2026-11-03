import React, { useState } from 'react';
import { X, Smartphone, CreditCard, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TopUpModalProps {
  onClose: () => void;
  onSuccess: (amount: number, method: string) => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({ onClose, onSuccess }) => {
  const [method, setMethod] = useState<'mtn' | 'airtel' | 'card'>('mtn');
  const [amount, setAmount] = useState<number>(50000);
  const [phone, setPhone] = useState<string>('0772 458 912');
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form');

  const PRESETS = [20000, 50000, 100000, 250000];

  const handleStartTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setStep('processing');

    setTimeout(() => {
      setStep('done');
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          colors: ['#FFCC00', '#FF2D55', '#34C759'],
        });
      } catch (err) {
        // ignore
      }

      setTimeout(() => {
        const methodName =
          method === 'mtn' ? 'MTN Mobile Money' : method === 'airtel' ? 'Airtel Money' : 'Card';
        onSuccess(amount, methodName);
      }, 1200);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-[#16161f] border border-white/10 shadow-2xl p-6 relative text-left overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' && (
          <form onSubmit={handleStartTopUp}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFCC00] to-[#FF9500] text-black font-black flex items-center justify-center shadow-lg shadow-[#FFCC00]/20">
                <Zap className="w-6 h-6 fill-black" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#FFCC00] uppercase tracking-wider">
                  Uganda Instant Deposit
                </span>
                <h3 className="text-lg font-black text-white">Top Up Kesho Wallet</h3>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setMethod('mtn');
                  if (!phone.startsWith('077') && !phone.startsWith('078')) setPhone('0772 458 912');
                }}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                  method === 'mtn'
                    ? 'border-[#FFCC00] bg-[#FFCC00]/10 text-white font-bold'
                    : 'border-white/5 bg-[#1f1f2e] text-white/60'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#FFCC00] text-black font-black text-[10px] mx-auto mb-1 flex items-center justify-center">
                  M
                </div>
                <span className="text-xs">MTN MoMo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('airtel');
                  setPhone('0701 823 456');
                }}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                  method === 'airtel'
                    ? 'border-[#FF2D55] bg-[#FF2D55]/10 text-white font-bold'
                    : 'border-white/5 bg-[#1f1f2e] text-white/60'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#FF2D55] text-white font-black text-[10px] mx-auto mb-1 flex items-center justify-center">
                  A
                </div>
                <span className="text-xs">Airtel Money</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                  method === 'card'
                    ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                    : 'border-white/5 bg-[#1f1f2e] text-white/60'
                }`}
              >
                <CreditCard className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <span className="text-xs">Debit Card</span>
              </button>
            </div>

            {/* Phone or Card input */}
            {method !== 'card' ? (
              <div className="mb-4">
                <label className="text-xs font-semibold text-white/60 mb-1.5 block">
                  {method === 'mtn' ? 'MTN' : 'Airtel'} Phone Number (Uganda)
                </label>
                <div className="relative flex items-center">
                  <Smartphone className="absolute left-3.5 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="077X XXX XXX"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0d0d12] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FFCC00]"
                  />
                </div>
              </div>
            ) : (
              <div className="mb-4 space-y-2">
                <label className="text-xs font-semibold text-white/60 mb-1 block">Card Details</label>
                <input
                  type="text"
                  defaultValue="4024 0071 8832 9912"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white font-mono text-xs"
                />
              </div>
            )}

            {/* Quick Amount Chips */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-white/60 mb-1.5 block">
                Deposit Amount (UGX)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {PRESETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                      amount === amt
                        ? 'bg-[#FF2D55] text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-white/40 font-mono">
                  UGX
                </span>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0d0d12] border border-white/10 text-white font-mono text-base font-bold focus:outline-none focus:border-[#FF2D55]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-white/50 mb-5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Simulated sandbox rails. Funds credit instantly to Kesho wallet.</span>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#FFCC00] to-[#FF9500] text-black font-black text-sm shadow-xl shadow-[#FFCC00]/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              <span>Deposit UGX {amount.toLocaleString()}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 'processing' && (
          <div className="py-8 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-[#FFCC00]/20 border-t-[#FFCC00] animate-spin" />
              <Smartphone className="w-6 h-6 text-[#FFCC00] absolute inset-0 m-auto" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              Simulating MoMo USSD Prompt...
            </h4>
            <p className="text-xs text-white/60 max-w-xs mx-auto mb-3">
              Prompt sent to <strong className="text-white">{phone}</strong> for UGX {amount.toLocaleString()}.
            </p>
            <div className="p-3 rounded-xl bg-[#0d0d12] border border-white/5 text-[11px] font-mono text-[#FFCC00] max-w-xs mx-auto">
              [MTN/Airtel USSD]: Authorizing PIN transfer to Kesho Events Ltd...
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-scaleUp">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-black text-white mb-1">Deposit Approved!</h4>
            <p className="text-xs text-white/60 mb-2">
              UGX {amount.toLocaleString()} has been credited to your Kesho Wallet balance.
            </p>
            <span className="font-mono text-[11px] text-emerald-400 font-bold">
              Transaction ID: MOMO-{Math.random().toString(36).substring(2, 9).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
