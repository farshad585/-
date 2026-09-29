import React, { useEffect, useRef, useState } from 'react';

interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export default function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  className = '',
  prefix = '',
  suffix = '',
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(direction === 'down' ? value : 0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          setTimeout(() => {
            let startTimestamp: number | null = null;
            const duration = 1800; // 1.8s smooth easing
            const startVal = direction === 'down' ? value : 0;
            const endVal = direction === 'down' ? 0 : value;

            const step = (timestamp: number) => {
              if (!startTimestamp) startTimestamp = timestamp;
              const progress = Math.min((timestamp - startTimestamp) / duration, 1);
              
              // Ease out cubic
              const easeOut = 1 - Math.pow(1 - progress, 3);
              const current = Math.floor(startVal + (endVal - startVal) * easeOut);
              
              setDisplayValue(current);

              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                setDisplayValue(endVal);
              }
            };

            requestAnimationFrame(step);
          }, delay * 1000);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [value, direction, delay]);

  return (
    <span ref={ref} className={`inline-block tabular-nums font-bold ${className}`}>
      {prefix}
      {displayValue.toLocaleString('fa-IR')}
      {suffix}
    </span>
  );
}
