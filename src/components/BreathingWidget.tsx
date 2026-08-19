import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Wind, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Phase = 'inhale' | 'hold' | 'exhale';

interface PhaseInfo {
  name: Phase;
  label: string;
  duration: number; // in seconds
  color: string;
  bgGradient: string;
}

const PHASES: PhaseInfo[] = [
  {
    name: 'inhale',
    label: 'دم عمیق (شهیق)',
    duration: 4,
    color: '#818cf8', // indigo-400
    bgGradient: 'from-indigo-950/80 via-slate-900/90 to-purple-950/80',
  },
  {
    name: 'hold',
    label: 'حبس نفس',
    duration: 4,
    color: '#c084fc', // purple-400
    bgGradient: 'from-purple-950/80 via-slate-900/90 to-indigo-950/80',
  },
  {
    name: 'exhale',
    label: 'بازدم آرام (زفیر)',
    duration: 4,
    color: '#22d3ee', // cyan-400
    bgGradient: 'from-cyan-950/80 via-slate-900/90 to-teal-950/80',
  },
];

export default function BreathingWidget() {
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(PHASES[0].duration);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  // Web Audio Synth references for ocean waves
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseGainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  const currentPhase = PHASES[phaseIndex];

  // Web Audio initialization
  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Pink noise buffer for realistic ocean sound
      const bufferSize = ctx.sampleRate * 10;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.153852;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoiseSource = ctx.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;
      whiteNoiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filterNodeRef.current = filter;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      noiseGainNodeRef.current = gainNode;

      whiteNoiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      whiteNoiseSource.start();
    } catch (e) {
      console.warn('Web Audio API issue:', e);
    }
  };

  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setIsAudioMuted(!isAudioMuted);
    setHasUserInteracted(true);
  };

  useEffect(() => {
    const handleFirstTouch = () => {
      if (!hasUserInteracted) {
        initAudio();
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        setHasUserInteracted(true);
      }
    };
    window.addEventListener('click', handleFirstTouch, { once: true });
    window.addEventListener('touchstart', handleFirstTouch, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    };
  }, [hasUserInteracted]);

  // Audio modulation matching breathing cycle
  useEffect(() => {
    if (!audioCtxRef.current || !noiseGainNodeRef.current || !filterNodeRef.current) return;
    const ctx = audioCtxRef.current;
    const gain = noiseGainNodeRef.current.gain;
    const freq = filterNodeRef.current.frequency;
    const now = ctx.currentTime;

    if (isAudioMuted) {
      gain.setTargetAtTime(0, now, 0.2);
      return;
    }

    if (currentPhase.name === 'inhale') {
      gain.setTargetAtTime(0.18, now, 1.2);
      freq.setTargetAtTime(800, now, 1.2);
    } else if (currentPhase.name === 'hold') {
      gain.setTargetAtTime(0.12, now, 0.8);
      freq.setTargetAtTime(550, now, 0.8);
    } else if (currentPhase.name === 'exhale') {
      gain.setTargetAtTime(0.04, now, 1.5);
      freq.setTargetAtTime(220, now, 1.5);
    } else {
      gain.setTargetAtTime(0.02, now, 0.5);
      freq.setTargetAtTime(180, now, 0.5);
    }
  }, [currentPhase, isAudioMuted]);

  // Phase countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const nextIndex = (phaseIndex + 1) % PHASES.length;
          setPhaseIndex(nextIndex);
          return PHASES[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phaseIndex]);

  return (
    <div className="w-full bg-[#EEEAF9] border-b border-[#DCD5F3] text-[#25243A] relative overflow-hidden shadow-2xs dir-rtl z-20">
      {/* Background Gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#EEEAF9] via-[#EAF2FA] to-[#F7F5FC] transition-all duration-1000 ease-in-out opacity-90"
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 relative z-10 flex items-center justify-between gap-2">
        
        {/* Right Side: Collapse / Expand Toggle */}
        <div className="flex items-center justify-center shrink-0 z-20">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 sm:p-2 rounded-lg bg-white hover:bg-[#E3DDF7] border border-[#DCD5F3] text-[#6557B8] transition-all text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
            title={isCollapsed ? 'نمایش تمرین' : 'بستن تمرین'}
          >
            <Wind className="w-4 h-4 text-[#6557B8]" />
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Center Area: Water Ripple Concentric Rings & Smooth Fade Breathing Text */}
        {!isCollapsed ? (
          <div className="flex-1 flex items-center justify-center relative min-h-[58px] sm:min-h-[68px] w-full py-0.5 overflow-hidden">
            
            {/* Concentric Water Ripple Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              {[0, 1, 2, 3].map((ringIndex) => (
                <motion.div
                  key={ringIndex}
                  className="absolute rounded-full border border-[#8175CC]/30 bg-[#8175CC]/5"
                  animate={{
                    scale: [0.5 + ringIndex * 0.3, 1.5 + ringIndex * 0.4],
                    opacity: [0.8, 0],
                  }}
                  transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    delay: ringIndex * 0.9,
                    ease: 'easeOut',
                  }}
                  style={{
                    width: `${90 + ringIndex * 30}px`,
                    height: `${90 + ringIndex * 30}px`,
                  }}
                />
              ))}
            </div>

            {/* Center Text overlay inside ripples with smooth fade transitions */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center gap-0.5 sm:gap-1">
              
              {/* Pulsing & Fading Text: آهسته و عمیق نفس بکشید */}
              <motion.p
                className="text-[10px] sm:text-xs font-semibold tracking-wide text-[#6557B8] font-mono"
                animate={{
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                آهسته و عمیق نفس بکشید
              </motion.p>

              {/* Current Phase Title with Fade Effect */}
              <div className="flex items-center gap-1.5 sm:gap-2 min-h-[24px]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentPhase.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="font-extrabold text-xs sm:text-sm md:text-base text-[#25243A] whitespace-nowrap"
                  >
                    {currentPhase.label}
                  </motion.span>
                </AnimatePresence>

                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#DCD5F3] text-[#6557B8] whitespace-nowrap">
                  {timeLeft} ثانیه
                </span>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 text-center text-xs font-medium text-[#6557B8]">
            تمرین تنفس عمیق و امواج صوتی آرامش
          </div>
        )}

        {/* Left Side: Speaker Audio Toggle Button */}
        <div className="flex items-center justify-center shrink-0 z-20">
          <button
            onClick={toggleAudio}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer ${
              !isAudioMuted
                ? 'bg-[#6557B8] border-[#6557B8] text-white shadow-xs'
                : 'bg-white border-[#DCD5F3] text-[#6D6A7C] hover:text-[#25243A]'
            }`}
            title={!isAudioMuted ? 'قطع صدای دریا' : 'پخش صدای دریا'}
          >
            {!isAudioMuted ? (
              <Volume2 className="w-4 h-4 text-white animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
