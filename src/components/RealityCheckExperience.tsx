import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RealityCheckExperienceProps {
  onComplete: () => void;
}

export default function RealityCheckExperience({ onComplete }: RealityCheckExperienceProps) {
  // Stages:
  // 'idle_wait': 0 - 2s (initial normal page view)
  // 'ripple_start': 2s - 4.5s (liquid distortion starts, page blurs)
  // 'mirror_ready': 4.5s+ (mirror, matrix silhouette, question and 3D pills appear)
  // 'dissolving': user chose a pill, pill floats to center, liquid shockwave, dissolve
  // 'finished': unmounted
  const [stage, setStage] = useState<'idle_wait' | 'ripple_start' | 'mirror_ready' | 'dissolving' | 'finished'>('idle_wait');
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
    // Phase 1: Wait 2 seconds before reality distortion starts
    const t1 = setTimeout(() => {
      setStage('ripple_start');
      playAmbientTone();
    }, 2000);

    // Phase 2: Morph completely into mirror & reveal silhouette/pills after 2.5s of rippling
    const t2 = setTimeout(() => {
      setStage('mirror_ready');
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
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
    if (stage === 'idle_wait') return;
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

    // Matrix characters streams setup: strictly using letters from "40 gates to beyond"
    const fontSize = Math.max(12, Math.floor(width / 75));
    const columns = Math.ceil(width / fontSize);
    // Staggered drop positions across the full screen
    const drops: number[] = Array.from({ length: columns }, () => Math.random() * -100);
    const dropSpeeds: number[] = Array.from({ length: columns }, () => 0.9 + Math.random() * 1.1);
    
    // Exact characters from "40 gates to beyond" (uppercase & lowercase)
    const chars = '40GATESTOBEYOND40gatestobeyond40GATES40';

    let time = 0;

    const draw = () => {
      time += 0.03;

      // Dark obsidian mirror base with subtle fading trails (creates the classic Matrix code stream effect)
      ctx.fillStyle = 'rgba(2, 5, 8, 0.22)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.42;

      // Head Silhouette Definition (Proportions matching reference image: Head, Ears, Jawline, Neck, Shoulders)
      const silHeight = Math.min(height * 0.58, 440);
      const silWidth = silHeight * 0.72;
      const headRadiusX = silWidth * 0.42;
      const headRadiusY = silHeight * 0.32;
      const headCenterY = centerY - silHeight * 0.12;

      // Function to calculate exact distance / inclusion in the human silhouette
      // Returns:
      // 'edge': close to the boundary (where bright green code forms the face/ear outline)
      // 'inside': inside the head/face void (darker, dim streams)
      // 'outside': background rain
      const getSilhouetteIntensity = (x: number, y: number): { isEdge: boolean; isInside: boolean; edgeGlow: number } => {
        const dx = (x - centerX) / headRadiusX;
        const dy = (y - headCenterY) / headRadiusY;

        // Ear protrusions on the sides
        const earY = headCenterY + headRadiusY * 0.15;
        const isLeftEar = Math.abs(x - (centerX - headRadiusX * 1.08)) < 16 && Math.abs(y - earY) < 32;
        const isRightEar = Math.abs(x - (centerX + headRadiusX * 1.08)) < 16 && Math.abs(y - earY) < 32;
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
          // Precise boundary edge: calculate peak glow
          const edgeDist = Math.abs(effectiveDist - 0.98) / 0.16;
          const edgeGlow = Math.max(0, 1 - edgeDist);
          return { isEdge: true, isInside: false, edgeGlow };
        } else if (effectiveDist < 0.82) {
          return { isEdge: false, isInside: true, edgeGlow: 0 };
        }

        return { isEdge: false, isInside: false, edgeGlow: 0 };
      };

      // 1. RENDER FULL SCREEN MATRIX RAIN & DYNAMIC SILHOUETTE
      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < columns; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        const char = chars[Math.floor(Math.random() * chars.length)];
        const sil = getSilhouetteIntensity(x, y);

        if (sil.isEdge) {
          // 🔥 Silhouette Outline: Intense glowing emerald & bright neon green codes forming the human face/ears contour
          ctx.fillStyle = sil.edgeGlow > 0.6 ? '#ffffff' : '#86efac';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 14 + sil.edgeGlow * 12;
          ctx.fillText(char, x, y);

          // Sub-char trailing glow
          ctx.fillStyle = 'rgba(74, 222, 128, 0.95)';
          ctx.shadowBlur = 8;
          const prevChar = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(prevChar, x, y - fontSize);

        } else if (sil.isInside) {
          // 👤 Inside the Silhouette: Hollow / Dark Void with very faint, shadowy green streams (like the reference)
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(20, 83, 45, 0.18)';
          ctx.fillText(char, x, y);

          const prevChar = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillStyle = 'rgba(5, 46, 22, 0.08)';
          ctx.fillText(prevChar, x, y - fontSize);

        } else {
          // 🌌 Background Streams: Classic cascading Matrix code rain
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#16a34a';

          // Leading drop char
          ctx.fillStyle = '#bbf7d0';
          ctx.fillText(char, x, y);

          // Trail
          ctx.fillStyle = 'rgba(34, 197, 94, 0.65)';
          const prevChar = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(prevChar, x, y - fontSize);

          ctx.fillStyle = 'rgba(21, 128, 61, 0.35)';
          ctx.shadowBlur = 0;
          ctx.fillText(char, x, y - fontSize * 2);
        }

        // Reset drop when off screen
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += dropSpeeds[i];
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
      className={`fixed inset-0 z-50 overflow-hidden pointer-events-auto transition-all duration-1000 select-none ${
        stage === 'idle_wait' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: stage === 'ripple_start' ? 'rgba(7, 10, 19, 0.75)' : 'rgba(5, 7, 14, 0.98)',
        backdropFilter: stage === 'ripple_start' ? 'blur(12px)' : 'blur(28px)'
      }}
    >
      {/* Dynamic Matrix Silhouette Mirror Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          stage === 'ripple_start' ? 'opacity-40' : stage === 'dissolving' ? 'opacity-20' : 'opacity-100'
        }`}
      />

      {/* Mirror Outer Bevel Frame & Ambient Liquid Sheen */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />

      {/* Center Cinematic Contents */}
      <AnimatePresence>
        {(stage === 'mirror_ready' || stage === 'dissolving') && (
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-12 md:py-20 px-6">
            
            {/* Top Atmospheric Empty Spacer */}
            <div className="h-6 md:h-12" />

            {/* Step 3: The Reality Question */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{
                opacity: stage === 'dissolving' ? 0 : 1,
                y: stage === 'dissolving' ? -40 : 0,
                scale: stage === 'dissolving' ? 1.08 : 1
              }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-2xl px-4 mt-8 md:mt-16"
            >
              <h2
                className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-relaxed drop-shadow-[0_0_35px_rgba(74,222,128,0.45)]"
                style={{
                  fontFamily: 'inherit',
                  textShadow: '0 0 20px rgba(74, 222, 128, 0.5), 0 0 45px rgba(16, 185, 129, 0.3)'
                }}
              >
                «چقدر مطمئنی الان خواب نیستی؟»
              </h2>
            </motion.div>

            {/* Step 4: Two 3D Floating Minimalist Pills (Red & Blue) */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center gap-12 sm:gap-20 md:gap-32 my-auto pt-8 pb-12"
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

            {/* Bottom Subtle Atmospheric Glow */}
            <div
              dir="ltr"
              className="text-center opacity-40 text-emerald-400 text-xs font-mono tracking-widest pointer-events-none select-none"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
            >
              40 GATES TO BEYOND
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
