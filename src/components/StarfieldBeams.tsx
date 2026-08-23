import React, { useEffect, useRef } from 'react';

interface StarfieldBeamsProps {
  particleCount?: number;
  className?: string;
}

export default function StarfieldBeams({ 
  particleCount = 65, 
  className = '' 
}: StarfieldBeamsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Responsive resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === canvas.parentElement) {
          width = canvas.width = entry.contentRect.width;
          height = canvas.height = entry.contentRect.height;
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Particle model
    interface Particle {
      x: number;
      y: number;
      radius: number;
      baseAlpha: number;
      alpha: number;
      speed: number;
      angle: number;
      pulseSpeed: number;
      pulseAngle: number;
      color: string;
    }

    // Palette tuned for 40 Gates: Indigo, Violet, Soft Cyan & Golden Stardust
    const colors = [
      'rgba(82, 67, 178, ',   // Royal Indigo #5243B2
      'rgba(112, 98, 196, ',  // Soft Violet #7062C4
      'rgba(147, 130, 238, ', // Dream Lavender
      'rgba(56, 189, 248, ',  // Lucid Cyan
      'rgba(245, 158, 11, ',  // Stardust Gold
    ];

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.5 + 0.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.7,
        baseAlpha,
        alpha: baseAlpha,
        speed: Math.random() * 0.25 + 0.08,
        angle: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseAngle: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Mouse interactivity
    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement?.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.01;
      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.1;
      mouseY += (targetMouseY - mouseY) * 0.1;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle cosmic aurora / beam ambient light
      const beamGrad1 = ctx.createRadialGradient(
        width * 0.5 + Math.sin(time * 0.5) * 60,
        height * 0.2,
        10,
        width * 0.5,
        height * 0.4,
        width * 0.6
      );
      beamGrad1.addColorStop(0, 'rgba(112, 98, 196, 0.12)');
      beamGrad1.addColorStop(0.5, 'rgba(82, 67, 178, 0.05)');
      beamGrad1.addColorStop(1, 'rgba(247, 245, 252, 0)');

      ctx.fillStyle = beamGrad1;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Particles & Constellation connections
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Movement
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed - 0.05; // gentle upward dream float

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Twinkle / Pulse
        p.pulseAngle += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.3;
        if (p.alpha < 0.1) p.alpha = 0.1;

        // Mouse repelling / attraction
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
          p.alpha = Math.min(1, p.alpha + 0.4);
        }

        // Draw particle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // 3. Connect nearby particles with delicate dream constellation threads
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pdist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (pdist < 85) {
            const lineAlpha = (1 - pdist / 85) * 0.15 * Math.min(p.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(112, 98, 196, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.parentElement?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-[1] w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
}
