import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users } from 'lucide-react';

const STORAGE_KEY = 'forty_gates_online_visitors';
const MIN_VISITORS = 100;
const MAX_VISITORS = 400;

function toPersianDigits(num: number): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
}

function getInitialCount(): number {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= MIN_VISITORS && parsed <= MAX_VISITORS) {
        return parsed;
      }
    }
  } catch (err) {
    // sessionStorage access error fallback
  }

  // Generate random integer between MIN_VISITORS and MAX_VISITORS
  const initial = Math.floor(Math.random() * (MAX_VISITORS - MIN_VISITORS + 1)) + MIN_VISITORS;
  try {
    sessionStorage.setItem(STORAGE_KEY, initial.toString());
  } catch (err) {
    // Ignore storage errors
  }
  return initial;
}

export default function OnlineVisitorsIndicator() {
  const [visitorCount, setVisitorCount] = useState<number>(getInitialCount);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleNextUpdate = () => {
      // Random interval between 1 and 3 minutes (60,000 ms to 180,000 ms)
      const randomInterval = Math.floor(Math.random() * (180000 - 60000 + 1)) + 60000;

      timeoutId = setTimeout(() => {
        setVisitorCount((prev) => {
          // Small natural variation between -4 and +5 (excluding 0)
          const possibleDeltas = [-4, -3, -2, -1, 1, 2, 3, 4, 5];
          const delta = possibleDeltas[Math.floor(Math.random() * possibleDeltas.length)];
          const nextCount = Math.max(MIN_VISITORS, Math.min(MAX_VISITORS, prev + delta));

          try {
            sessionStorage.setItem(STORAGE_KEY, nextCount.toString());
          } catch (e) {}

          return nextCount;
        });

        // Briefly trigger pulse animation when count updates
        setIsUpdating(true);
        setTimeout(() => setIsUpdating(false), 1000);

        // Schedule next natural update
        scheduleNextUpdate();
      }, randomInterval);
    };

    scheduleNextUpdate();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-30 select-none">
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        title="تعداد بازدیدکنندگان آنلاین"
        className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-800/60 shadow-md text-xs font-medium text-slate-700 dark:text-slate-200 transition-all hover:bg-white/80 dark:hover:bg-slate-900/80 hover:shadow-lg"
      >
        {/* Pulsing live indicator */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>

        <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />

        <div className="flex items-center gap-1 dir-rtl">
          <AnimatePresence mode="wait">
            <motion.span
              key={visitorCount}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
              className={`font-bold font-mono text-slate-900 dark:text-white ${isUpdating ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
            >
              {toPersianDigits(visitorCount)}
            </motion.span>
          </AnimatePresence>
          <span>آنلاین</span>
        </div>
      </motion.div>
    </div>
  );
}
