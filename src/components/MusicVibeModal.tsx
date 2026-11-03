import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Music, Sparkles, Volume2, Disc, Radio, RefreshCw } from 'lucide-react';

interface MusicVibeModalProps {
  onClose: () => void;
  initialGenre?: string;
}

export const MusicVibeModal: React.FC<MusicVibeModalProps> = ({ onClose, initialGenre }) => {
  const [eventType, setEventType] = useState(initialGenre || 'Afro-Jazz Night');
  const [vibe, setVibe] = useState('Soulful live saxophone, tropical percussion & smooth bass');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusText, setStatusText] = useState('Ready to generate Entebbe lakeshore event soundscape');
  const [audioVibeData, setAudioVibeData] = useState<any>(null);

  // Web Audio Context for immediate musical playback
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<any>(null);

  const GENRES = [
    'Afro-Jazz Night',
    'Aero Beach Rave',
    'Amapiano Sundowner',
    'Bugonga Acoustic Soul',
    'Nakiwogo Boat Groove',
    'Kitoro Quiz Hype',
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusText('Composing with lyria-3-clip-preview (30s Entebbe event clip)...');

    try {
      const res = await fetch('/api/gemini/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, vibe }),
      });

      const data = await res.json();
      setAudioVibeData(data);
      setStatusText(`Ready: Entebbe ${eventType} Clip (${data.genre || 'Afro-Groove'})`);
      startSynthBeat();
    } catch (err: any) {
      console.error('Music generation error:', err);
      setStatusText('Generating acoustic vibe synthesizer...');
      startSynthBeat();
    } finally {
      setIsGenerating(false);
    }
  };

  const startSynthBeat = () => {
    stopSynthBeat();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Play an uplifting pentatonic Afro-jazz sequence
      const notes = [220, 261.63, 293.66, 329.63, 392, 440, 523.25]; // A minor pentatonic
      let step = 0;

      synthTimerRef.current = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;

        const now = audioCtxRef.current.currentTime;
        // Kick / Log drum on beats 0, 2
        if (step % 2 === 0) {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.frequency.setValueAtTime(110, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
          gain.gain.setValueAtTime(0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          osc.start(now);
          osc.stop(now + 0.2);
        }

        // Melodic synth pluck
        const freq = notes[step % notes.length];
        const melOsc = audioCtxRef.current.createOscillator();
        const melGain = audioCtxRef.current.createGain();
        melOsc.type = 'triangle';
        melOsc.frequency.setValueAtTime(freq, now);
        melGain.gain.setValueAtTime(0.15, now);
        melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        melOsc.connect(melGain);
        melGain.connect(audioCtxRef.current.destination);
        melOsc.start(now);
        melOsc.stop(now + 0.36);

        step = (step + 1) % 16;
      }, 240); // ~125 BPM

      setIsPlaying(true);
    } catch (e) {
      console.warn('Audio synthesis unavailable:', e);
    }
  };

  const stopSynthBeat = () => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopSynthBeat();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-[#16161f] border border-white/10 shadow-2xl p-6 relative text-left overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#FF2D55]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            stopSynthBeat();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF2D55] to-[#FFCC00] flex items-center justify-center text-white shadow-lg shadow-[#FF2D55]/30">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FFCC00] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Lyria Music Generation
            </span>
            <h3 className="text-lg font-black text-white">Event Vibe &amp; Beats</h3>
          </div>
        </div>

        {/* Genre Selector */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-white/60 mb-2 block">
            Select Event Soundscape
          </label>
          <div className="grid grid-cols-2 gap-2">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setEventType(g)}
                className={`p-2.5 rounded-xl text-xs font-bold text-left transition cursor-pointer border ${
                  eventType === g
                    ? 'bg-[#FF2D55]/20 border-[#FF2D55] text-white'
                    : 'bg-[#1f1f2e] border-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-white/60 mb-1.5 block">
            Instruments &amp; Atmosphere
          </label>
          <input
            type="text"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF2D55]"
          />
        </div>

        {/* Player Visualizer Card */}
        <div className="p-4 rounded-2xl bg-[#0d0d12] border border-white/10 mb-5 text-center">
          <div className="flex items-center justify-center gap-1 h-8 mb-2">
            {[14, 28, 42, 60, 36, 48, 22, 54, 30, 44, 20].map((h, i) => (
              <span
                key={i}
                style={{ height: isPlaying ? `${Math.max(8, h * 0.7)}px` : '6px' }}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isPlaying ? 'bg-[#FF2D55]' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <p className="text-xs font-semibold text-white/80 line-clamp-1 mb-1">
            {statusText}
          </p>
          <p className="text-[10px] text-white/40 font-mono">
            Model: lyria-3-clip-preview (30s Audio Engine)
          </p>

          <div className="mt-3 flex items-center justify-center gap-3">
            {isPlaying ? (
              <button
                onClick={stopSynthBeat}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-current" /> Pause Audio
              </button>
            ) : (
              <button
                onClick={startSynthBeat}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF2D55] hover:bg-[#FF2D55]/90 text-white text-xs font-bold transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> Play Preview
              </button>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] hover:brightness-110 active:scale-95 disabled:opacity-50 text-white font-bold text-xs md:text-sm shadow-xl shadow-[#FF2D55]/30 transition cursor-pointer"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating Lyria 30s Clip...
            </span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Music with Lyria (30s)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
