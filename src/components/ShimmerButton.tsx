import React, { ButtonHTMLAttributes, ReactNode, MouseEventHandler } from 'react';

export interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerDuration?: string;
  background?: string;
  glow?: boolean;
  id?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function ShimmerButton({
  children,
  className = '',
  shimmerColor = 'rgba(255, 255, 255, 0.45)',
  shimmerDuration = '2.5s',
  background = 'linear-gradient(135deg, #5243B2 0%, #7062C4 50%, #5243B2 100%)',
  glow = true,
  onClick,
  disabled = false,
  type = 'button',
  id,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        background,
      }}
      className={`group relative overflow-hidden rounded-2xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100 cursor-pointer ${
        glow ? 'shadow-[#5243B2]/25 hover:shadow-xl hover:shadow-[#5243B2]/40' : ''
      } ${className}`}
      {...props}
    >
      {/* Animated Shimmer sweep light */}
      <span
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${shimmerColor} 50%, transparent 100%)`,
          animationDuration: shimmerDuration,
        }}
        className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer-sweep_2.5s_infinite] group-hover:animate-[shimmer-sweep_1.5s_infinite]"
      />

      {/* Pulsing subtle border glow */}
      {glow && (
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
