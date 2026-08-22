import React, { useEffect, useRef } from 'react';

interface AtariDreamOverProps {
  onRestart: () => void;
}

export default function AtariDreamOverOverlay({ onRestart }: AtariDreamOverProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play Authentic 8-bit Atari arcade descending tone
  useEffect(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const now = ctx.currentTime;
      
      // Atari-style 8-bit descending arpeggio
      const notes = [440, 370, 311, 261, 220, 185, 146, 110];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.12, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + (idx + 1) * 0.12);
      });
    } catch (e) {
      // Audio not permitted without interaction
    }

    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black overflow-hidden font-mono select-none">
      {/* Retro CRT Scanline Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.75) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 4px, 6px 100%'
        }}
      />

      {/* CRT Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.95)_100%)] shadow-inner" />

      {/* Main Container */}
      <div 
        onClick={onRestart}
        className="relative z-10 w-full max-w-lg mx-auto px-4 flex flex-col items-center justify-center text-center cursor-pointer select-none"
      >
        {/* Main "DREAM OVER" Atari Title */}
        <h2 
          className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black tracking-wider sm:tracking-widest text-[#ff0055] drop-shadow-[0_0_20px_#ff0055] animate-pulse max-w-full break-words leading-tight"
          style={{
            textShadow: '3px 3px 0px #ffe600, -2px -2px 0px #00ffff, 0 0 25px #ff0055',
            fontFamily: '"Courier New", Courier, monospace',
            letterSpacing: '0.12em'
          }}
        >
          DREAM OVER
        </h2>
      </div>
    </div>
  );
}

