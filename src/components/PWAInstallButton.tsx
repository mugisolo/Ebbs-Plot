import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-[#FF2D55]/30 hover:brightness-110 active:scale-95 transition cursor-pointer"
        title="Install Kesho as PWA"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/10 active:scale-95 transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#FFCC00]" />
          <span>Install PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-[#16161f] border border-white/10 p-6 shadow-2xl relative text-left">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF2D55] flex items-center justify-center shadow-lg shadow-[#FF2D55]/40 font-black text-xl text-white">
                  K
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Install Kesho on iPhone</h3>
                  <p className="text-xs text-white/50">Add to your home screen for offline access</p>
                </div>
              </div>
              <div className="space-y-3 text-xs text-white/80 border-t border-white/10 pt-4">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-[10px] shrink-0">1</span>
                  <p>Tap the <strong className="text-white">Share</strong> button at the bottom of Safari.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-[10px] shrink-0">2</span>
                  <p>Scroll down and select <strong className="text-[#FF2D55]">Add to Home Screen</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-[10px] shrink-0">3</span>
                  <p>Enjoy instant ticketing, mobile wallet, and gate scanner access!</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
