import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RealityCheckExperienceProps {
  onComplete: () => void;
}

export default function RealityCheckExperience({ onComplete }: RealityCheckExperienceProps) {
  // Stages:
  // 'mirror_ready': Matrix digital rain full-screen, typing question, and 3D pills
  // 'dissolving': user chose a pill, liquid shockwave, dissolve
  // 'finished': unmounted
  const [stage, setStage] = useState<'mirror_ready' | 'dissolving' | 'finished'>('mirror_ready');
  const [selectedPill, setSelectedPill] = useState<'red' | 'blue' | null>(null);
  const [hoveredPill, setHoveredPill] = useState<'red' | 'blue' | null>(null);

  // Human-like typing state
  const FULL_TEXT = 'چقدر مطمئنی الان خواب نیستی؟';
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(false);
  const [isTypingStarted, setIsTypingStarted] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const shockwaveOriginRef = useRef<{ x: number; y: number; progress: number } | null>(null);

  // Get or init audio context safely
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      } catch {
        // Fallback
      }
    }
    return audioCtxRef.current;
  };

  // Synthesize realistic subtle mechanical terminal keyboard click
  const playKeyClickSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const t = ctx.currentTime;

      // Crisp mechanical key click + resonant tap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Pitch variation for human-like typing feel
      const baseFreq = 1600 + Math.random() * 900;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.028);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400 + (Math.random() * 600 - 300), t);
      filter.Q.setValueAtTime(3.5, t);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.032);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.035);
    } catch {
      // Safe fallback if user hasn't interacted
    }
  };

  // Synthesize subtle, cinematic sub-bass drone safely with Web Audio API
  const playAmbientTone = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 4);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(45, ctx.currentTime + 3);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.5);
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
    } catch {
      // Ignored if browser blocks autoplay
    }
  };

  const playLiquidDissolveSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(60, ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.4);
    } catch {
      // Safe fallback
    }
  };

  // Human-like typing timeline with 1-second delay and realistic intervals
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let charIndex = 0;

    // Start after exactly 1 second (1000ms)
    const startDelay = setTimeout(() => {
      setIsTypingStarted(true);

      const typeNextChar = () => {
        if (charIndex <= FULL_TEXT.length) {
          const currentSub = FULL_TEXT.slice(0, charIndex);
          setDisplayedText(currentSub);

          if (charIndex > 0) {
            playKeyClickSound();
          }

          if (charIndex === FULL_TEXT.length) {
            setIsTypingComplete(true);
            return;
          }

          // Realistic human timing:
          const nextChar = FULL_TEXT[charIndex];
          let nextDelay = 85 + Math.random() * 65; // standard letter speed (~85-150ms)

          // Extra pause between words (spaces) so it feels authentically typed
          if (nextChar === ' ') {
            nextDelay = 260 + Math.random() * 140; // 260-400ms pause between words
          } else if (nextChar === '؟') {
            nextDelay = 220;
          }

          charIndex++;
          timer = setTimeout(typeNextChar, nextDelay);
        }
      };

      charIndex = 1;
      typeNextChar();
    }, 1000);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timer);
    };
  }, []);

  // Ambient Drone & Audio lifecycle
  useEffect(() => {
    playAmbientTone();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Digital Matrix Silhouette Canvas Rendering (Authentic Vintage CRT Matrix Phosphor Green)
  useEffect(() => {
    if (stage === 'finished') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Authentic Vintage Matrix Digital Rain Engine
    const fontSize = Math.max(13, Math.floor(width / 65));
    const columnSpacing = fontSize;
    const columns = Math.ceil(width / columnSpacing);

    const WORD = '40GATES';
    const glyphs = ['4', '0', 'G', 'A', 'T', 'E', 'S', '0', '1', '2', '8', '9'];

    interface RainStream {
      x: number;
      y: number;
      speed: number;
      length: number;
      chars: string[];
      changeInterval: number[];
      isWordStream: boolean;
    }

    const streams: RainStream[] = [];
    for (let i = 0; i < columns; i++) {
      const isWordStream = Math.random() < 0.05;
      const len = isWordStream ? Math.floor(5 + Math.random() * 8) : Math.floor(10 + Math.random() * 22);
      const streamChars: string[] = [];
      const intervals: number[] = [];
      const offset = Math.floor(Math.random() * WORD.length);

      for (let j = 0; j < len; j++) {
        if (isWordStream) {
          streamChars.push(WORD);
        } else {
          streamChars.push(WORD[(j + offset) % WORD.length]);
        }
        intervals.push(Math.floor(4 + Math.random() * 12));
      }

      streams.push({
        x: i * columnSpacing,
        y: Math.random() * -height * 1.5,
        speed: 0.20 + Math.random() * 0.32,
        length: len,
        chars: streamChars,
        changeInterval: intervals,
        isWordStream,
      });
    }

    let frameCount = 0;
    let time = 0;

    const draw = () => {
      frameCount++;
      time += 0.03;

      // Phosphor decay trail fade with deep CRT phosphor dark-green/black tint
      ctx.fillStyle = 'rgba(1, 7, 4, 0.17)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.42;

      // Head Silhouette Definition
      const silHeight = Math.min(height * 0.90, 840);
      const silWidth = silHeight * 0.74;
      const headRadiusX = silWidth * 0.44;
      const headRadiusY = silHeight * 0.34;
      const headCenterY = centerY - silHeight * 0.08;

      const getSilhouetteIntensity = (x: number, y: number): { isEdge: boolean; isInside: boolean; edgeGlow: number } => {
        const dx = (x - centerX) / headRadiusX;
        const dy = (y - headCenterY) / headRadiusY;

        const earY = headCenterY + headRadiusY * 0.15;
        const isLeftEar = Math.abs(x - (centerX - headRadiusX * 1.06)) < 30 && Math.abs(y - earY) < 55;
        const isRightEar = Math.abs(x - (centerX + headRadiusX * 1.06)) < 30 && Math.abs(y - earY) < 55;
        const hasEar = isLeftEar || isRightEar;

        const headDist = Math.sqrt(dx * dx + dy * dy);

        const isJawArea = y > headCenterY && y < headCenterY + headRadiusY * 1.4;
        let jawDist = 999;
        if (isJawArea) {
          const jawFactor = 1 - (y - headCenterY) / (headRadiusY * 1.8);
          const jawDx = (x - centerX) / (headRadiusX * Math.max(0.4, jawFactor));
          const jawDy = (y - (headCenterY + headRadiusY * 0.3)) / (headRadiusY * 1.0);
          jawDist = Math.sqrt(jawDx * jawDx + jawDy * jawDy);
        }

        const isNeckShoulders = y >= headCenterY + headRadiusY * 1.0 && y <= centerY + silHeight * 0.6;
        let neckDist = 999;
        if (isNeckShoulders) {
          const neckProgress = (y - (headCenterY + headRadiusY * 1.0)) / (silHeight * 0.4);
          const expectedWidth = headRadiusX * (0.45 + neckProgress * 1.2);
          const currentWidth = Math.abs(x - centerX);
          neckDist = currentWidth / expectedWidth;
        }

        const effectiveDist = Math.min(headDist, jawDist, isNeckShoulders ? neckDist : 999);

        if (hasEar) {
          return { isEdge: true, isInside: false, edgeGlow: 1.0 };
        }

        if (effectiveDist >= 0.82 && effectiveDist <= 1.15) {
          const edgeDist = Math.abs(effectiveDist - 0.98) / 0.16;
          const edgeGlow = Math.max(0, 1 - edgeDist);
          return { isEdge: true, isInside: false, edgeGlow };
        } else if (effectiveDist < 0.82) {
          return { isEdge: false, isInside: true, edgeGlow: 0 };
        }

        return { isEdge: false, isInside: false, edgeGlow: 0 };
      };

      ctx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;

      // Draw all cascading streams
      for (let i = 0; i < streams.length; i++) {
        const stream = streams[i];
        const streamHeadY = stream.y * fontSize;

        for (let j = 0; j < stream.length; j++) {
          const charY = streamHeadY - j * fontSize;

          if (charY < -fontSize || charY > height + fontSize) continue;

          if (stream.chars[j] && frameCount % (stream.changeInterval[j] || 6) === 0 && Math.random() > 0.7) {
            if (stream.isWordStream) {
              stream.chars[j] = WORD;
            } else {
              stream.chars[j] = glyphs[Math.floor(Math.random() * glyphs.length)];
            }
          }

          const char = stream.chars[j] || (stream.isWordStream ? WORD : glyphs[j % glyphs.length]);
          const sil = getSilhouetteIntensity(stream.x, charY);

          if (sil.isEdge) {
            ctx.shadowBlur = 14 + sil.edgeGlow * 12;
            ctx.shadowColor = '#34d399';
            ctx.fillStyle = sil.edgeGlow > 0.5 || j === 0 ? '#ffffff' : '#5dfc92';
            ctx.fillText(char, stream.x, charY);

          } else if (sil.isInside) {
            ctx.shadowBlur = 0;
            const insideAlpha = Math.max(0.04, 0.20 * (1 - j / stream.length));
            ctx.fillStyle = `rgba(52, 211, 153, ${insideAlpha})`;
            ctx.fillText(char, stream.x, charY);

          } else {
            // Authentic CRT Phosphor Green code stream colors
            if (j === 0) {
              // Leading drop (White hot with CRT green corona)
              ctx.fillStyle = '#f0fdf4';
              ctx.shadowColor = '#5dfc92';
              ctx.shadowBlur = 9;
              ctx.fillText(char, stream.x, charY);
            } else if (j < 3) {
              // Vibrant phosphor green near head
              ctx.fillStyle = '#6ee7b7';
              ctx.shadowColor = '#22c55e';
              ctx.shadowBlur = 5;
              ctx.fillText(char, stream.x, charY);
            } else if (j < 8) {
              // Classic phosphor green
              ctx.fillStyle = '#22c55e';
              ctx.shadowBlur = 0;
              ctx.fillText(char, stream.x, charY);
            } else {
              // Deep tail fade towards CRT scanline black
              const tailProgress = (j - 8) / Math.max(1, stream.length - 8);
              const alpha = Math.max(0.08, 0.70 * (1 - tailProgress));
              ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
              ctx.shadowBlur = 0;
              ctx.fillText(char, stream.x, charY);
            }
          }
        }

        stream.y += stream.speed;

        if (stream.y * fontSize - stream.length * fontSize > height) {
          stream.y = -Math.random() * 25 - 5;
          stream.speed = 0.20 + Math.random() * 0.32;
          stream.isWordStream = Math.random() < 0.05;
          stream.length = stream.isWordStream ? Math.floor(5 + Math.random() * 8) : Math.floor(10 + Math.random() * 22);
          stream.chars = [];
          stream.changeInterval = [];
          const offset = Math.floor(Math.random() * WORD.length);
          for (let j = 0; j < stream.length; j++) {
            if (stream.isWordStream) {
              stream.chars.push(WORD);
            } else {
              stream.chars.push(WORD[(j + offset) % WORD.length]);
            }
            stream.changeInterval.push(Math.floor(4 + Math.random() * 12));
          }
        }
      }

      // Liquid ripples
      ctx.save();
      const rippleCount = 3;
      for (let r = 0; r < rippleCount; r++) {
        const radius = ((time * 35 + r * 80) % 420) + 50;
        const opacity = Math.max(0, 0.16 - radius / 420);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(93, 252, 146, ${opacity})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.restore();

      // Shockwave on pill select
      if (shockwaveOriginRef.current) {
        const sw = shockwaveOriginRef.current;
        sw.progress += 0.02;

        const maxDist = Math.max(width, height) * 1.2;
        const currentRadius = sw.progress * maxDist;
        const alpha = Math.max(0, 1 - sw.progress);

        ctx.save();
        const shockGrad = ctx.createRadialGradient(sw.x, sw.y, Math.max(0, currentRadius - 60), sw.x, sw.y, currentRadius + 30);
        shockGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shockGrad.addColorStop(0.5, selectedPill === 'red' ? `rgba(239, 68, 68, ${alpha * 0.7})` : `rgba(59, 130, 246, ${alpha * 0.7})`);
        shockGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = shockGrad;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, currentRadius + 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [stage, selectedPill]);

  // Handle Pill Choice
  const handleSelect = (pill: 'red' | 'blue', e: React.MouseEvent | React.TouchEvent) => {
    if (selectedPill || stage === 'dissolving' || stage === 'finished') return;

    setSelectedPill(pill);
    setStage('dissolving');
    playLiquidDissolveSound();

    let clickX = window.innerWidth / 2;
    let clickY = window.innerHeight * 0.75;
    if ('clientX' in e) {
      clickX = e.clientX;
      clickY = e.clientY;
    } else if (e.touches && e.touches[0]) {
      clickX = e.touches[0].clientX;
      clickY = e.touches[0].clientY;
    }

    shockwaveOriginRef.current = {
      x: clickX,
      y: clickY,
      progress: 0
    };

    setTimeout(() => {
      setStage('finished');
      onComplete();
    }, 1900);
  };

  if (stage === 'finished') {
    return null;
  }

  return (
    <div
      id="reality-check-experience"
      className="fixed inset-0 z-[99999] w-screen h-screen overflow-hidden bg-[#010905] select-none pointer-events-auto flex flex-col justify-between"
    >
      {/* Dynamic Matrix Silhouette Mirror Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          stage === 'dissolving' ? 'opacity-30' : 'opacity-100'
        }`}
      />

      {/* Vintage CRT Scanlines Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 z-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%)',
          backgroundSize: '100% 4px'
        }}
      />

      {/* CRT Vignette & Curvature Glow (Phosphor Dark Green Border) */}
      <div 
        className="absolute inset-0 pointer-events-none z-10" 
        style={{
          background: 'radial-gradient(circle at center, transparent 45%, rgba(0, 8, 3, 0.65) 80%, rgba(0, 4, 1, 0.95) 100%)',
          boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.9)'
        }}
      />

      {/* Center Cinematic Contents - Question and 3D Pills positioned slightly below center */}
      <AnimatePresence>
        {(stage === 'mirror_ready' || stage === 'dissolving') && (
          <div className="relative z-20 w-full h-full min-h-screen flex flex-col items-center justify-center pt-16 sm:pt-20 md:pt-24 px-3 select-none">
            
            {/* The Main Reality Question - Cyberpunk Heavy Display Styling + Human Typewriter */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: stage === 'dissolving' ? 0 : 1,
                y: stage === 'dissolving' ? -40 : 0,
                scale: stage === 'dissolving' ? 1.06 : 1
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center w-full max-w-5xl px-2 flex justify-center items-center min-h-[56px] sm:min-h-[64px]"
            >
              {isTypingStarted && (
                <h2
                  className="text-[20px] min-[360px]:text-[22px] min-[400px]:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight whitespace-nowrap leading-none flex items-center justify-center select-none"
                  style={{
                    fontFamily: '"Vazirmatn", "JetBrains Mono", system-ui, sans-serif',
                    fontWeight: 900,
                    color: '#5dfc92',
                    letterSpacing: '-0.01em',
                    textShadow: '0 0 6px rgba(93, 252, 146, 0.55), 0 0 14px rgba(51, 255, 119, 0.3), 0 2px 8px rgba(0,0,0,0.95)'
                  }}
                >
                  <span>{displayedText}</span>
                  
                  {/* Blinking CRT Phosphor Terminal Cursor */}
                  <span
                    className={`inline-block w-2.5 sm:w-3.5 h-6 sm:h-9 mr-1.5 align-middle bg-[#5dfc92] shadow-[0_0_8px_#5dfc92] ${
                      isTypingComplete ? 'animate-pulse' : 'animate-ping'
                    }`}
                    style={{
                      opacity: isTypingComplete ? 0.75 : 1
                    }}
                  />
                </h2>
              )}
            </motion.div>

            {/* Two 3D Floating Minimalist Pills (Red & Blue) - Placed below question */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.9 }}
              animate={{
                opacity: isTypingComplete ? 1 : 0,
                y: isTypingComplete ? 0 : 20,
                scale: isTypingComplete ? 1 : 0.9
              }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center gap-12 sm:gap-20 md:gap-28 mt-6 sm:mt-8 md:mt-10"
            >
              {/* 🔴 Red Pill Capsule */}
              <motion.button
                id="matrix-pill-red"
                onClick={(e) => handleSelect('red', e)}
                onTouchStart={(e) => handleSelect('red', e)}
                onMouseEnter={() => setHoveredPill('red')}
                onMouseLeave={() => setHoveredPill(null)}
                disabled={!isTypingComplete}
                animate={
                  selectedPill === 'red'
                    ? {
                        scale: [1, 1.4, 0],
                        y: [0, -140, -220],
                        opacity: [1, 1, 0],
                        rotate: [0, 15, 45]
                      }
                    : selectedPill === 'blue'
                    ? {
                        opacity: 0,
                        scale: 0.7,
                        transition: { duration: 0.6 }
                      }
                    : {
                        y: hoveredPill === 'red' ? -12 : [0, -10, 0],
                        scale: hoveredPill === 'red' ? 1.18 : 1,
                        rotate: hoveredPill === 'red' ? -8 : -14
                      }
                }
                transition={
                  selectedPill
                    ? { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
                    : {
                        y: { repeat: Infinity, duration: 3.2, ease: 'easeInOut' },
                        scale: { duration: 0.25 },
                        rotate: { duration: 0.3 }
                      }
                }
                className="group relative cursor-pointer outline-none bg-transparent border-none p-4 touch-manipulation"
                aria-label="Red Pill"
              >
                {/* 3D Capsule Pill Body */}
                <div
                  className={`w-7 h-14 sm:w-8 sm:h-16 md:w-10 md:h-20 rounded-full transition-shadow duration-300 relative shadow-2xl ${
                    hoveredPill === 'red'
                      ? 'shadow-[0_0_35px_rgba(239,68,68,0.9),0_0_60px_rgba(220,38,38,0.5)]'
                      : 'shadow-[0_8px_20px_rgba(0,0,0,0.9),0_0_20px_rgba(239,68,68,0.4)]'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ef4444 35%, #b91c1c 70%, #7f1d1d 100%)',
                    transform: 'perspective(600px) rotateX(15deg)'
                  }}
                >
                  {/* Glossy Specular Sheen */}
                  <div className="absolute top-1 left-1 right-1 h-1/2 rounded-full bg-gradient-to-b from-white/85 via-white/25 to-transparent opacity-90 pointer-events-none" />
                  <div className="absolute top-2 left-1.5 w-1 sm:w-1.5 h-8 sm:h-10 rounded-full bg-white/75 blur-[0.5px] pointer-events-none" />
                  <div className="absolute bottom-1 inset-x-1 h-5 rounded-b-full bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>

                <div className="absolute -inset-2 rounded-full bg-red-500/20 blur-lg group-hover:bg-red-500/40 transition-colors pointer-events-none -z-10" />
              </motion.button>

              {/* 🔵 Blue Pill Capsule */}
              <motion.button
                id="matrix-pill-blue"
                onClick={(e) => handleSelect('blue', e)}
                onTouchStart={(e) => handleSelect('blue', e)}
                onMouseEnter={() => setHoveredPill('blue')}
                onMouseLeave={() => setHoveredPill(null)}
                disabled={!isTypingComplete}
                animate={
                  selectedPill === 'blue'
                    ? {
                        scale: [1, 1.4, 0],
                        y: [0, -140, -220],
                        opacity: [1, 1, 0],
                        rotate: [0, -15, -45]
                      }
                    : selectedPill === 'red'
                    ? {
                        opacity: 0,
                        scale: 0.7,
                        transition: { duration: 0.6 }
                      }
                    : {
                        y: hoveredPill === 'blue' ? -8 : [0, -6, 0],
                        scale: hoveredPill === 'blue' ? 1.18 : 1,
                        rotate: hoveredPill === 'blue' ? 8 : 14
                      }
                }
                transition={
                  selectedPill
                    ? { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
                    : {
                        y: { repeat: Infinity, duration: 3.2, delay: 0.6, ease: 'easeInOut' },
                        scale: { duration: 0.25 },
                        rotate: { duration: 0.3 }
                      }
                }
                className="group relative cursor-pointer outline-none bg-transparent border-none p-4 touch-manipulation"
                aria-label="Blue Pill"
              >
                {/* 3D Capsule Pill Body */}
                <div
                  className={`w-7 h-14 sm:w-8 sm:h-16 md:w-10 md:h-20 rounded-full transition-shadow duration-300 relative shadow-2xl ${
                    hoveredPill === 'blue'
                      ? 'shadow-[0_0_35px_rgba(59,130,246,0.9),0_0_60px_rgba(37,99,235,0.5)]'
                      : 'shadow-[0_8px_20px_rgba(0,0,0,0.9),0_0_20px_rgba(59,130,246,0.4)]'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 35%, #1d4ed8 70%, #172554 100%)',
                    transform: 'perspective(600px) rotateX(15deg)'
                  }}
                >
                  {/* Glossy Specular Sheen */}
                  <div className="absolute top-1 left-1 right-1 h-1/2 rounded-full bg-gradient-to-b from-white/85 via-white/25 to-transparent opacity-90 pointer-events-none" />
                  <div className="absolute top-2 left-1.5 w-1 sm:w-1.5 h-8 sm:h-10 rounded-full bg-white/75 blur-[0.5px] pointer-events-none" />
                  <div className="absolute bottom-1 inset-x-1 h-5 rounded-b-full bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>

                <div className="absolute -inset-2 rounded-full bg-blue-500/20 blur-lg group-hover:bg-blue-500/40 transition-colors pointer-events-none -z-10" />
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

