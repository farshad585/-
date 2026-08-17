import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RealityCheckExperienceProps {
  onComplete: () => void;
}

export default function RealityCheckExperience({ onComplete }: RealityCheckExperienceProps) {
  // Stages:
  // 'mirror_ready': Matrix digital rain full-screen immediately, question and 3D pills active
  // 'dissolving': user chose a pill, pill floats to center, liquid shockwave, dissolve
  // 'finished': unmounted
  const [stage, setStage] = useState<'mirror_ready' | 'dissolving' | 'finished'>('mirror_ready');
  const [selectedPill, setSelectedPill] = useState<'red' | 'blue' | null>(null);
  const [hoveredPill, setHoveredPill] = useState<'red' | 'blue' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const shockwaveOriginRef = useRef<{ x: number; y: number; progress: number } | null>(null);

  // Synthesize subtle, cinematic sound effects safely with Web Audio API
  const playAmbientTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Soft sub-bass drone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 4);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, ctx.currentTime); // A1 note
      osc.frequency.linearRampToValueAtTime(45, ctx.currentTime + 3);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.5);
      gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 4);

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
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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

  // Timeline Controller
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

  // Digital Matrix Silhouette Canvas Rendering
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

    // Authentic Matrix 1 Digital Rain Engine (Pure single-column stream lines)
    const fontSize = Math.max(13, Math.floor(width / 65));
    const columnSpacing = fontSize;
    const columns = Math.ceil(width / columnSpacing);

    // Characters pool and full word tokens
    const WORD = '40GATES';
    const glyphs = ['4', '0', 'G', 'A', 'T', 'E', 'S'];

    interface RainStream {
      x: number;
      y: number;
      speed: number;
      length: number;
      chars: string[];
      changeInterval: number[];
      isWordStream: boolean;
    }

    // Initialize authentic single-column Matrix streams (with rare ~6% voluminous 40GATES cascades)
    const streams: RainStream[] = [];
    for (let i = 0; i < columns; i++) {
      const isWordStream = Math.random() < 0.06; // Rare occasional voluminous word cascade between single lines
      const len = isWordStream ? Math.floor(5 + Math.random() * 8) : Math.floor(10 + Math.random() * 22);
      const streamChars: string[] = [];
      const intervals: number[] = [];
      const offset = Math.floor(Math.random() * WORD.length);

      for (let j = 0; j < len; j++) {
        if (isWordStream) {
          streamChars.push(WORD);
        } else {
          // Strictly single glyphs per line
          streamChars.push(WORD[(j + offset) % WORD.length]);
        }
        intervals.push(Math.floor(4 + Math.random() * 12));
      }

      streams.push({
        x: i * columnSpacing,
        y: Math.random() * -height * 1.5, // Natural staggered vertical start
        speed: 0.22 + Math.random() * 0.35, // Varied individual fall speeds (calm ~30% pace)
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

      // Phosphor decay trail fade (creates organic Matrix 1 CRT trail persistence)
      ctx.fillStyle = 'rgba(1, 4, 3, 0.16)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.46;

      // Head Silhouette Definition (2x Larger: Head, Ears, Jawline, Neck, Shoulders)
      const silHeight = Math.min(height * 0.92, 880);
      const silWidth = silHeight * 0.74;
      const headRadiusX = silWidth * 0.44;
      const headRadiusY = silHeight * 0.34;
      const headCenterY = centerY - silHeight * 0.08;

      const getSilhouetteIntensity = (x: number, y: number): { isEdge: boolean; isInside: boolean; edgeGlow: number } => {
        const dx = (x - centerX) / headRadiusX;
        const dy = (y - headCenterY) / headRadiusY;

        // Ear protrusions on the sides (2x scaled)
        const earY = headCenterY + headRadiusY * 0.15;
        const isLeftEar = Math.abs(x - (centerX - headRadiusX * 1.06)) < 30 && Math.abs(y - earY) < 55;
        const isRightEar = Math.abs(x - (centerX + headRadiusX * 1.06)) < 30 && Math.abs(y - earY) < 55;
        const hasEar = isLeftEar || isRightEar;

        // Elliptical head equation
        const headDist = Math.sqrt(dx * dx + dy * dy);

        // Jaw and Chin tapering
        const isJawArea = y > headCenterY && y < headCenterY + headRadiusY * 1.4;
        let jawDist = 999;
        if (isJawArea) {
          const jawFactor = 1 - (y - headCenterY) / (headRadiusY * 1.8);
          const jawDx = (x - centerX) / (headRadiusX * Math.max(0.4, jawFactor));
          const jawDy = (y - (headCenterY + headRadiusY * 0.3)) / (headRadiusY * 1.0);
          jawDist = Math.sqrt(jawDx * jawDx + jawDy * jawDy);
        }

        // Neck and Shoulders
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

      ctx.font = `bold ${fontSize}px "Courier New", monospace`;

      // Draw all cascading streams
      for (let i = 0; i < streams.length; i++) {
        const stream = streams[i];
        const streamHeadY = stream.y * fontSize;

        for (let j = 0; j < stream.length; j++) {
          const charY = streamHeadY - j * fontSize;

          // Skip if off-screen vertically
          if (charY < -fontSize || charY > height + fontSize) continue;

          // Occasional organic character mutation / glitch
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
            // 🔥 Silhouette Outline: High-intensity neon & white glyphs with emerald corona
            ctx.shadowBlur = 14 + sil.edgeGlow * 12;
            ctx.shadowColor = '#22c55e';
            ctx.fillStyle = sil.edgeGlow > 0.5 || j === 0 ? '#ffffff' : '#86efac';
            ctx.fillText(char, stream.x, charY);

          } else if (sil.isInside) {
            // 👤 Hollow Silhouette Void: Faint ghostly green streams inside the face reflection
            ctx.shadowBlur = 0;
            const insideAlpha = Math.max(0.04, 0.22 * (1 - j / stream.length));
            ctx.fillStyle = `rgba(34, 197, 94, ${insideAlpha})`;
            ctx.fillText(char, stream.x, charY);

          } else {
            // 🌌 Classic Matrix 1 Code Stream Cascades:
            if (j === 0) {
              // ⚡ Leading Head Drop (White hot with intense green bloom)
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = '#4ade80';
              ctx.shadowBlur = 8;
              ctx.fillText(char, stream.x, charY);
            } else if (j < 3) {
              // High-luminescence emerald green near the head
              ctx.fillStyle = '#86efac';
              ctx.shadowColor = '#22c55e';
              ctx.shadowBlur = 4;
              ctx.fillText(char, stream.x, charY);
            } else if (j < 8) {
              // Classic vibrant phosphor matrix green
              ctx.fillStyle = '#22c55e';
              ctx.shadowBlur = 0;
              ctx.fillText(char, stream.x, charY);
            } else {
              // Deep tail fade towards black
              const tailProgress = (j - 8) / Math.max(1, stream.length - 8);
              const alpha = Math.max(0.08, 0.75 * (1 - tailProgress));
              ctx.fillStyle = `rgba(22, 163, 74, ${alpha})`;
              ctx.shadowBlur = 0;
              ctx.fillText(char, stream.x, charY);
            }
          }
        }

        // Advance stream
        stream.y += stream.speed;

        // Reset stream when it passes the bottom
        if (stream.y * fontSize - stream.length * fontSize > height) {
          stream.y = -Math.random() * 25 - 5;
          stream.speed = 0.22 + Math.random() * 0.35;
          stream.isWordStream = Math.random() < 0.06; // Rare occasional voluminous word cascade
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

      // 2. Liquid ripples spreading on the mirror surface
      ctx.save();
      const rippleCount = 3;
      for (let r = 0; r < rippleCount; r++) {
        const radius = ((time * 35 + r * 80) % 420) + 50;
        const opacity = Math.max(0, 0.18 - radius / 420);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(74, 222, 128, ${opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();

      // 3. If shockwave active (on pill selection)
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

    // Smooth exit timing
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
      className="fixed inset-0 z-[99999] w-screen h-screen overflow-hidden bg-[#010403] select-none pointer-events-auto flex flex-col justify-between"
    >
      {/* Dynamic Matrix Silhouette Mirror Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          stage === 'dissolving' ? 'opacity-30' : 'opacity-100'
        }`}
      />

      {/* Mirror Outer Bevel Frame & Ambient Liquid Sheen */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />

      {/* Center Cinematic Contents - Pure Rain, Main Question centered in 1 line, and 3D Pills below */}
      <AnimatePresence>
        {(stage === 'mirror_ready' || stage === 'dissolving') && (
          <div className="relative z-10 w-full h-full min-h-screen flex flex-col items-center justify-center py-6 px-3 select-none">
            
            {/* The Main Reality Question (Centered on screen, strictly 1 single line on all screen sizes) */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.94 }}
              animate={{
                opacity: stage === 'dissolving' ? 0 : 1,
                y: stage === 'dissolving' ? -40 : 0,
                scale: stage === 'dissolving' ? 1.08 : 1
              }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-center w-full max-w-5xl px-2 flex justify-center items-center"
            >
              <h2
                className="text-[17px] min-[360px]:text-[19px] min-[400px]:text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white whitespace-nowrap leading-none drop-shadow-[0_0_35px_rgba(74,222,128,0.6)]"
                style={{
                  fontFamily: 'inherit',
                  textShadow: '0 0 20px rgba(74, 222, 128, 0.7), 0 0 45px rgba(16, 185, 129, 0.5), 0 4px 14px rgba(0,0,0,0.95)'
                }}
              >
                چقدر مطمئنی الان خواب نیستی؟
              </h2>
            </motion.div>

            {/* Two 3D Floating Minimalist Pills (Red & Blue) - Placed below question */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center gap-12 sm:gap-20 md:gap-28 mt-8 sm:mt-12 md:mt-16"
            >
              {/* 🔴 Red Pill Capsule */}
              <motion.button
                id="matrix-pill-red"
                onClick={(e) => handleSelect('red', e)}
                onTouchStart={(e) => handleSelect('red', e)}
                onMouseEnter={() => setHoveredPill('red')}
                onMouseLeave={() => setHoveredPill(null)}
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
                {/* 3D Capsule Pill Body (50% smaller size for refined aesthetics) */}
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
                  {/* Glossy Specular Sheen 1 (Curved highlight) */}
                  <div className="absolute top-1 left-1 right-1 h-1/2 rounded-full bg-gradient-to-b from-white/85 via-white/25 to-transparent opacity-90 pointer-events-none" />
                  
                  {/* Glossy Specular Sheen 2 (Edge reflection) */}
                  <div className="absolute top-2 left-1.5 w-1 sm:w-1.5 h-8 sm:h-10 rounded-full bg-white/75 blur-[0.5px] pointer-events-none" />

                  {/* Deep Core Shadow & Inner Horizon Glow */}
                  <div className="absolute bottom-1 inset-x-1 h-5 rounded-b-full bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>

                {/* Delicate Pulsing Ambient Aura */}
                <div className="absolute -inset-2 rounded-full bg-red-500/20 blur-lg group-hover:bg-red-500/40 transition-colors pointer-events-none -z-10" />
              </motion.button>

              {/* 🔵 Blue Pill Capsule */}
              <motion.button
                id="matrix-pill-blue"
                onClick={(e) => handleSelect('blue', e)}
                onTouchStart={(e) => handleSelect('blue', e)}
                onMouseEnter={() => setHoveredPill('blue')}
                onMouseLeave={() => setHoveredPill(null)}
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
                {/* 3D Capsule Pill Body (50% smaller size for refined aesthetics) */}
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
                  {/* Glossy Specular Sheen 1 (Curved highlight) */}
                  <div className="absolute top-1 left-1 right-1 h-1/2 rounded-full bg-gradient-to-b from-white/85 via-white/25 to-transparent opacity-90 pointer-events-none" />
                  
                  {/* Glossy Specular Sheen 2 (Edge reflection) */}
                  <div className="absolute top-2 left-1.5 w-1 sm:w-1.5 h-8 sm:h-10 rounded-full bg-white/75 blur-[0.5px] pointer-events-none" />

                  {/* Deep Core Shadow & Inner Horizon Glow */}
                  <div className="absolute bottom-1 inset-x-1 h-5 rounded-b-full bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>

                {/* Delicate Pulsing Ambient Aura */}
                <div className="absolute -inset-2 rounded-full bg-blue-500/20 blur-lg group-hover:bg-blue-500/40 transition-colors pointer-events-none -z-10" />
              </motion.button>
            </motion.div>

            {/* Bottom Atmospheric Empty Spacer */}
            <div className="h-6 md:h-12" />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
