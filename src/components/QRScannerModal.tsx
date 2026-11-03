import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Flashlight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  QrCode,
  Ticket,
  MapPin,
  ArrowRight,
  Keyboard,
} from 'lucide-react';
import jsQR from 'jsqr';
import confetti from 'canvas-confetti';
import { EntebbeEvent, UserTicket } from '../types';

interface QRScannerModalProps {
  onClose: () => void;
  events: EntebbeEvent[];
  onClaimInvitation: (newTicket: UserTicket, bonusUGX?: number) => void;
  onVenueCheckIn: (venueName: string, perkDescription: string, rewardUGX: number) => void;
}

export type ScanResultType = {
  type: 'invitation' | 'checkin' | 'ticket' | 'general';
  title: string;
  subtitle: string;
  details: string;
  rewardUGX?: number;
  event?: EntebbeEvent;
  code: string;
};

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  onClose,
  events,
  onClaimInvitation,
  onVenueCheckIn,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultType | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Sample quick test codes for user testing
  const SAMPLE_CODES = [
    {
      label: 'VIP Invitation · Lake Victoria Jazz Safari (Waterfront)',
      code: 'KESHO-INVITE:event-lakeside-jazz:VIP:FREE-COMP:UGX15000',
    },
    {
      label: 'Venue Gate Entry · Riders Lounge Kitoro, Entebbe',
      code: 'KESHO-VENUE:ridersKitoro:ENTRY-PERK:UGX10000',
    },
    {
      label: 'Aero Beach Tropical Amapiano Guestlist Pass',
      code: 'KESHO-INVITE:event-aero-beach-splash:VIP:GUESTLIST:UGX0',
    },
  ];

  // Start camera stream
  const startCamera = async (mode: 'environment' | 'user') => {
    setCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setHasCameraPermission(true);

      // Check torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities: any = track.getCapabilities?.() || {};
      if (capabilities.torch) {
        setTorchSupported(true);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setHasCameraPermission(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. You can still test codes manually below.'
          : 'Unable to start camera feed. Please enter code manually or use sample invitations.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.warn('Torch toggle failed:', err);
    }
  };

  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Continuous frame analysis
  useEffect(() => {
    let animId: number;

    const scanFrame = () => {
      if (
        isScanning &&
        videoRef.current &&
        canvasRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (qrCode && qrCode.data) {
            handleCodeDecoded(qrCode.data);
            return;
          }
        }
      }

      if (isScanning) {
        animId = requestAnimationFrame(scanFrame);
      }
    };

    if (!isManualMode) {
      startCamera(facingMode).then(() => {
        animId = requestAnimationFrame(scanFrame);
      });
    }

    return () => {
      cancelAnimationFrame(animId);
      stopCamera();
    };
  }, [isScanning, isManualMode]);

  // Handle scanned/entered code
  const handleCodeDecoded = (rawCode: string) => {
    setIsScanning(false);
    stopCamera();

    // Haptic feedback if available
    try {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } catch {
      // ignore
    }

    // Parse code
    // Pattern 1: KESHO-INVITE:eventId:tier:type:reward
    if (rawCode.startsWith('KESHO-INVITE:')) {
      const parts = rawCode.split(':');
      const eventId = parts[1];
      const tier = (parts[2] as any) || 'VIP';
      const matchedEvent = events.find((e) => e.id === eventId) || events[0];
      const rewardUGX = parts[4]?.includes('UGX')
        ? parseInt(parts[4].replace('UGX', ''), 10)
        : 15000;

      setScanResult({
        type: 'invitation',
        title: `VIP Invitation: ${matchedEvent.title}`,
        subtitle: `Complimentary ${tier} Pass · ${matchedEvent.venue.name}`,
        details: `This verified promotional code grants you instant admission and UGX ${rewardUGX.toLocaleString()} Kesho Wallet credit for drinks!`,
        rewardUGX,
        event: matchedEvent,
        code: rawCode,
      });

      triggerConfetti();
      return;
    }

    // Pattern 2: KESHO-VENUE:venueId:ENTRY-PERK:reward
    if (rawCode.startsWith('KESHO-VENUE:')) {
      const parts = rawCode.split(':');
      const venueKey = parts[1];
      const rewardUGX = parts[3]?.includes('UGX')
        ? parseInt(parts[3].replace('UGX', ''), 10)
        : 10000;
      const venueName =
        venueKey === 'ridersKitoro'
          ? 'Riders Lounge & Victoria Rooftop (Kitoro)'
          : venueKey === 'aeroBeach'
          ? 'Aero Beach Entebbe'
          : 'Entebbe Lakeshore Venue';

      setScanResult({
        type: 'checkin',
        title: `Venue Check-In: ${venueName}`,
        subtitle: 'Gate Pass Verified & Welcome Perk Unlocked',
        details: `Welcome to ${venueName}! Your presence has been registered. Enjoy UGX ${rewardUGX.toLocaleString()} welcome beverage cashback in your Kesho wallet.`,
        rewardUGX,
        code: rawCode,
      });

      triggerConfetti();
      return;
    }

    // Pattern 3: Existing Ticket Pass KESHO-PASS:
    if (rawCode.startsWith('KESHO-PASS:')) {
      const parts = rawCode.split(':');
      const eventId = parts[1];
      const matchedEvent = events.find((e) => e.id === eventId) || events[0];

      setScanResult({
        type: 'ticket',
        title: 'Gate Ticket Pass Validated',
        subtitle: `${matchedEvent.title} · ${matchedEvent.venue.name}`,
        details: 'Admittance status: VALID. User authorized for venue entrance.',
        code: rawCode,
      });

      triggerConfetti();
      return;
    }

    // General code or external link
    setScanResult({
      type: 'general',
      title: 'Scanned Code Content',
      subtitle: 'External QR Code / Token',
      details: rawCode,
      code: rawCode,
    });
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ['#FF2D55', '#FFCC00', '#34C759', '#007AFF'],
      });
    } catch {
      // ignore
    }
  };

  const handleClaimReward = () => {
    if (!scanResult) return;

    if (scanResult.type === 'invitation' && scanResult.event) {
      const evt = scanResult.event;
      const newTicket: UserTicket = {
        id: `INV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        userId: 'current-user',
        eventId: evt.id,
        eventTitle: evt.title,
        venueName: evt.venue.name,
        area: evt.venue.area,
        eventDate: evt.dateStr,
        ticketType: 'VIP',
        priceUGX: 0,
        qrCode: scanResult.code,
        status: 'valid',
        createdAt: 'Just now (Claimed via QR Scanner)',
      };
      onClaimInvitation(newTicket, scanResult.rewardUGX);
      onClose();
    } else if (scanResult.type === 'checkin') {
      onVenueCheckIn(
        scanResult.title.replace('Venue Check-In: ', ''),
        scanResult.details,
        scanResult.rewardUGX || 10000
      );
      onClose();
    } else {
      onClose();
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setIsScanning(true);
    if (!isManualMode) {
      startCamera(facingMode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6 animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-[#16161f] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative text-left">
        {/* Header */}
        <div className="p-4 bg-[#1f1f2e] border-b border-white/10 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF2D55] to-[#FFCC00] flex items-center justify-center text-white shadow-lg shadow-[#FF2D55]/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">QR Code Scanner</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#FF2D55]/20 text-[#FF2D55] text-[10px] font-bold">
                  Camera Active
                </span>
              </div>
              <p className="text-xs text-white/50">Scan event invites, tickets &amp; venue check-in codes</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {torchSupported && !isManualMode && (
              <button
                onClick={toggleTorch}
                className={`p-2 rounded-full border transition cursor-pointer ${
                  torchOn
                    ? 'bg-[#FFCC00] text-black border-[#FFCC00]'
                    : 'bg-white/5 text-white/70 border-white/10 hover:text-white'
                }`}
                title="Toggle Torch/Flash"
              >
                <Flashlight className="w-4 h-4" />
              </button>
            )}

            {!isManualMode && hasCameraPermission && (
              <button
                onClick={flipCamera}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition cursor-pointer"
                title="Flip Camera (Front/Back)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Toggle (Camera vs Manual Input) */}
        <div className="flex items-center p-2 bg-[#0d0d12] border-b border-white/5 text-xs font-semibold">
          <button
            onClick={() => {
              setIsManualMode(false);
              resetScan();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition cursor-pointer ${
              !isManualMode
                ? 'bg-[#1f1f2e] text-white shadow'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Viewfinder</span>
          </button>
          <button
            onClick={() => {
              setIsManualMode(true);
              stopCamera();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition cursor-pointer ${
              isManualMode
                ? 'bg-[#1f1f2e] text-white shadow'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Enter Code Manually</span>
          </button>
        </div>

        {/* Main Body */}
        {!scanResult ? (
          <div className="p-4 md:p-6 flex flex-col items-center">
            {!isManualMode ? (
              <div className="relative w-full aspect-square max-w-[340px] rounded-3xl overflow-hidden bg-black border-2 border-white/15 flex items-center justify-center shadow-inner">
                {/* Video element */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Reticle / Targeting Frame Overlay */}
                <div className="absolute inset-8 border-2 border-white/30 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-6 h-6 border-t-4 border-l-4 border-[#FF2D55] rounded-tl-lg" />
                    <span className="w-6 h-6 border-t-4 border-r-4 border-[#FF2D55] rounded-tr-lg" />
                  </div>
                  {/* Laser scan line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#FF2D55] to-transparent animate-bounce shadow-lg shadow-[#FF2D55]" />
                  <div className="flex justify-between">
                    <span className="w-6 h-6 border-b-4 border-l-4 border-[#FF2D55] rounded-bl-lg" />
                    <span className="w-6 h-6 border-b-4 border-r-4 border-[#FF2D55] rounded-tr-lg" />
                  </div>
                </div>

                {/* Subtitle instructions */}
                <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none px-4">
                  <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-medium text-white/90">
                    Align QR code within the frame
                  </span>
                </div>

                {/* Camera error or fallback notice */}
                {cameraError && (
                  <div className="absolute inset-0 bg-black/90 p-6 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-10 h-10 text-[#FFCC00] mb-2" />
                    <p className="text-xs text-white/80 mb-4">{cameraError}</p>
                    <button
                      onClick={() => setIsManualMode(true)}
                      className="px-4 py-2 rounded-xl bg-[#FF2D55] text-white text-xs font-bold"
                    >
                      Use Manual Input
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full max-w-[340px] py-4">
                <label className="text-xs font-semibold text-white/70 mb-1.5 block">
                  Paste or Type Invitation / Entry Code
                </label>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. KESHO-INVITE:..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#FF2D55]"
                  />
                  <button
                    onClick={() => manualCode && handleCodeDecoded(manualCode.trim())}
                    disabled={!manualCode.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#FF2D55] text-white text-xs font-bold disabled:opacity-40"
                  >
                    Validate
                  </button>
                </div>
              </div>
            )}

            {/* Test Sample Invitations */}
            <div className="w-full mt-5 pt-4 border-t border-white/10">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block mb-2">
                Simulate Scanning Demo Codes:
              </span>
              <div className="space-y-1.5">
                {SAMPLE_CODES.map((sample) => (
                  <button
                    key={sample.code}
                    onClick={() => handleCodeDecoded(sample.code)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0d0d12] hover:bg-[#1f1f2e] border border-white/5 text-xs text-white/80 hover:text-white transition cursor-pointer text-left group"
                  >
                    <span className="font-medium group-hover:text-[#FFCC00]">
                      {sample.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-[#FF2D55]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Scanned Result Card */
          <div className="p-6 text-center animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="px-3 py-1 rounded-full bg-[#FF2D55]/20 text-[#FF2D55] text-[10px] font-black uppercase tracking-wider font-mono">
              {scanResult.type === 'invitation'
                ? 'VIP Invite Decoded'
                : scanResult.type === 'checkin'
                ? 'Venue Check-In Detected'
                : 'QR Token Verified'}
            </span>

            <h3 className="text-lg font-black text-white mt-2 mb-1">
              {scanResult.title}
            </h3>
            <p className="text-xs font-semibold text-[#FFCC00] mb-3">
              {scanResult.subtitle}
            </p>

            <div className="p-4 rounded-2xl bg-[#0d0d12] border border-white/10 text-xs text-white/70 leading-relaxed mb-5 max-w-sm mx-auto text-left">
              {scanResult.details}
              {scanResult.rewardUGX && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between font-mono font-bold">
                  <span className="text-white/60">Wallet Reward:</span>
                  <span className="text-emerald-400 text-sm">
                    +UGX {scanResult.rewardUGX.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={resetScan}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-xs transition cursor-pointer"
              >
                Scan Another Code
              </button>

              <button
                onClick={handleClaimReward}
                className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] hover:brightness-110 active:scale-95 text-white font-bold text-xs md:text-sm shadow-xl shadow-[#FF2D55]/30 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {scanResult.type === 'invitation'
                    ? 'Claim Pass &amp; Credit Wallet'
                    : scanResult.type === 'checkin'
                    ? 'Complete Check-In &amp; Claim Perk'
                    : 'Done'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
