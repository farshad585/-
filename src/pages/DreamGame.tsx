import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Info, 
  Feather, 
  Zap, 
  Trophy, 
  ArrowLeft,
  Hand,
  Compass,
  Eye,
  Moon,
  Sun,
  Layers,
  Flame,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Scenario {
  id: number;
  title: string;
  situation: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
    stabilityChange: number;
  }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: 'مرحله ۱: آگاهی اولیه و تشخیص رویا',
    situation: 'ناگهان متوجه می‌شوی در اتومبیل یا اتاقی هستی که چیدمان آن عجیب است و در رویا قرار داری. چه واکنشی نشان می‌دهی؟',
    options: [
      {
        text: 'دستپاچه می‌شوم، تندتند دست‌هایم را به هم می‌مالم و دور خودم می‌چرخم تا بیدار نشوم.',
        isCorrect: false,
        explanation: '❌ اشتباه! مالیدن دست‌ها و چرخیدن دور خود طبق قوانین علمی استاد میرشکاری هیجان کاذب ایجاد کرده و باعث فروپاشی رویا می‌شود.',
        stabilityChange: -35
      },
      {
        text: 'با آرامش کامل، بدون عجله به سمت نزدیک‌ترین دیوار می‌روم و آهسته دستم را درون آن فشار می‌دهم.',
        isCorrect: true,
        explanation: '✅ عالی! جادوی ساده (عبور آهسته دست از دیوار خمیری) با حفظ خونسردی، رویا را بدون مصرف انرژی تثبیت می‌کند.',
        stabilityChange: +35
      },
      {
        text: 'شروع به دویدن می‌کنم و از محیط فاصله می‌گیرم.',
        isCorrect: false,
        explanation: '❌ اشتباه! عجله و رفتار هیجانی در رویا، استرس بیداری را فعال می‌کند.',
        stabilityChange: -25
      }
    ]
  },
  {
    id: 2,
    title: 'مرحله ۲: تثبیت تصویر و کنترل هیجان',
    situation: 'تصویر رویا کمی دچار نوسان و تاری شده است. احساس می‌کنی بدن فیزیکی‌ات در حال هوشیار شدن روی تخت است. روش صحیح تثبیت چیست؟',
    options: [
      {
        text: 'سعی می‌کنم انگشتانم را بشمارم یا تندتند به ساعتم نگاه کنم.',
        isCorrect: false,
        explanation: '❌ اشتباه! چک‌های سنتی واقعیت و نگاه کردن تندتند به دست‌ها، ذهن تحلیلی را سردرگم کرده و رویا را می‌شکند.',
        stabilityChange: -30
      },
      {
        text: 'توقف می‌کنم، ذهن را آرام نگه می‌دارم و حرکت آهسته دست در دیوار را شبیه خمیر نرم ادامه می‌دهم.',
        isCorrect: true,
        explanation: '✅ آفرین! ادامه جادوی ساده همراه با آرامش عمیق، وضوح تصویر را به ۱۰۰٪ بازمی‌گرداند.',
        stabilityChange: +35
      },
      {
        text: 'تلاش می‌کنم چشم‌هایم را در رویا محکم ببندم و باز کنم.',
        isCorrect: false,
        explanation: '❌ اشتباه! بستن چشم‌ها در رویا اغلب باعث باز شدن چشم‌های فیزیکی و بیداری کامل می‌شود.',
        stabilityChange: -40
      }
    ]
  },
  {
    id: 3,
    title: 'مرحله ۳: پرواز و خلق در رویا (اصل انرژی صفر)',
    situation: 'می‌خواهی از زمین فاصله بگیری و پرواز بر فراز شهر رویایی را تجربه کنی. چگونه پرواز می‌کنی؟',
    options: [
      {
        text: 'دست‌هایم را تندتند شبیه بال پرنده تکان می‌دهم تا اوج بگیرم.',
        isCorrect: false,
        explanation: '❌ اشتباه! تکان دادن دست‌ها مثل بال، تصور اشتباه انتقال قوانین دنیای بیداری به رویاست و انرژی شما را هدر می‌دهد.',
        stabilityChange: -30
      },
      {
        text: 'بدون هیچ حرکت اضافه دست، فقط با اراده ذهنی و خونسردی کامل به صورت بی‌وزنی شناور می‌شوم.',
        isCorrect: true,
        explanation: '✅ فوق‌العاده! این اصل انرژی صفر است. در دنیای رویا، اراده آرام و خونسرد جایگزین تلاش فیزیکی است.',
        stabilityChange: +30
      }
    ]
  }
];

// Realistic Anatomical 3D Hand Graphic with Soft Dough Deformation
function Realistic3DHandGraphic({ depth, isPressing }: { depth: number; isPressing: boolean }) {
  // depth ranges 0 to 100 (penetration depth into dough wall)
  // 0% = hand floating in front of 3D wall (translateZ: 80px)
  // 100% = fingers and palm fully submerged inside the 3D dough wall (translateZ: -70px)
  const translateZ = 80 - (depth / 100) * 150; 
  const handScale = 0.5 * (1 - (depth / 100) * 0.18); // 50% reduced scale as requested
  const blurAmount = (depth / 100) * 2.2;
  const fingerFlex = (depth / 100) * 15; // fingers bending inside clay

  return (
    <div 
      className="relative w-60 h-72 flex items-center justify-center pointer-events-none select-none transition-transform duration-150 ease-out"
      style={{
        transformStyle: 'preserve-3d',
        transform: `translateZ(${translateZ}px) scale(${handScale})`
      }}
    >
      {/* 3D Dough Indentation Crater Layer */}
      <div 
        className="absolute w-56 h-56 rounded-full border-2 border-amber-400/50 bg-amber-400/20 transition-all duration-200"
        style={{
          transform: `translateZ(-20px) scale(${1 + (depth / 100) * 0.4})`,
          opacity: depth > 0 ? 0.95 : 0.1,
          boxShadow: depth > 0 ? `inset 0 0 45px rgba(251, 191, 36, ${depth / 70})` : 'none',
          filter: 'blur(2px)'
        }}
      />
      
      {/* 3D Ripple Rings inside Dough Wall */}
      {depth > 0 && (
        <svg className="absolute w-64 h-64 pointer-events-none" viewBox="0 0 200 200">
          <circle 
            cx="100" 
            cy="100" 
            r={20 + depth * 0.6} 
            fill="none" 
            stroke="rgba(251, 191, 36, 0.7)" 
            strokeWidth="3" 
            strokeDasharray="10 5"
            className="animate-spin"
            style={{ animationDuration: '12s' }}
          />
          <circle 
            cx="100" 
            cy="100" 
            r={12 + depth * 0.4} 
            fill="none" 
            stroke="rgba(167, 139, 250, 0.8)" 
            strokeWidth="2.5"
          />
        </svg>
      )}

      {/* Realistic Human Hand 3D Graphic */}
      <svg
        viewBox="0 0 160 200"
        className="w-48 h-60 drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] transition-all duration-300"
        style={{
          filter: `blur(${blurAmount}px)`
        }}
      >
        <defs>
          <linearGradient id="dream3DHandSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#f87171" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#818cf8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#3730a3" stopOpacity="1" />
          </linearGradient>

          <filter id="hand3DGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g filter="url(#hand3DGlow)">
          {/* Wrist Base */}
          <path
            d="M 52 190 Q 80 184 108 190 L 114 160 Q 80 154 46 160 Z"
            fill="url(#dream3DHandSkin)"
          />

          {/* Palm Core */}
          <path
            d="M 36 155 Q 24 110 38 85 Q 80 74 122 85 Q 136 110 124 155 Q 80 166 36 155 Z"
            fill="url(#dream3DHandSkin)"
          />

          {/* Palm Crease Lines */}
          <path
            d="M 46 138 Q 76 110 114 116"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 52 114 Q 80 98 108 100"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Thumb */}
          <path
            d={`M 36 135 Q 10 110 16 ${84 + fingerFlex * 0.5} Q 28 78 38 94 Z`}
            fill="url(#dream3DHandSkin)"
          />

          {/* Index Finger penetrating into clay */}
          <path
            d={`M 40 85 Q 40 38 45 ${12 + fingerFlex} Q 56 12 57 82 Z`}
            fill="url(#dream3DHandSkin)"
          />

          {/* Middle Finger penetrating deep into clay */}
          <path
            d={`M 60 80 Q 62 28 68 ${3 + fingerFlex * 1.2} Q 79 3 80 78 Z`}
            fill="url(#dream3DHandSkin)"
          />

          {/* Ring Finger penetrating into clay */}
          <path
            d={`M 83 80 Q 86 34 91 ${10 + fingerFlex} Q 101 10 101 82 Z`}
            fill="url(#dream3DHandSkin)"
          />

          {/* Pinky Finger */}
          <path
            d={`M 104 88 Q 110 48 113 ${30 + fingerFlex * 0.8} Q 122 30 121 92 Z`}
            fill="url(#dream3DHandSkin)"
          />

          {/* Fingertip Submerged Glow Effect */}
          <circle cx="48" cy={15 + fingerFlex} r="4.5" fill="#ffffff" className={isPressing ? 'animate-ping' : ''} />
          <circle cx="71" cy={6 + fingerFlex * 1.2} r="5" fill="#ffffff" className={isPressing ? 'animate-ping' : ''} />
          <circle cx="94" cy={12 + fingerFlex} r="4.5" fill="#ffffff" className={isPressing ? 'animate-ping' : ''} />
          <circle cx="116" cy={32 + fingerFlex * 0.8} r="4" fill="#ffffff" />
          <circle cx="21" cy={86 + fingerFlex * 0.5} r="4" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}

// 3D Apple Tree Telekinesis Graphic (Zero Distance Principle)
function TelekinesisAppleTreeGraphic({ progress, isHolding }: { progress: number; isHolding: boolean }) {
  // progress is 0 to 100 (% of 10 seconds hold)
  // 0% = Apple on tree branch in distance
  // 100% = Apple in hand palm
  const appleY = 60 + (progress / 100) * 115;
  const appleX = 130 - (progress / 100) * 20; // floats towards center palm
  const appleScale = 0.85 + (progress / 100) * 0.55;
  const auraGlow = (progress / 100) * 20;

  return (
    <div className="relative w-64 h-72 flex items-center justify-center pointer-events-none select-none">
      <svg viewBox="0 0 260 260" className="w-full h-full drop-shadow-2xl">
        <defs>
          <radialGradient id="appleAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#ef4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="treeTrunk" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <radialGradient id="treeFoliage" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="80%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064e3b" />
          </radialGradient>
          <linearGradient id="appleSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="60%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>

        {/* Tree in Background */}
        <g opacity="0.9">
          {/* Trunk */}
          <path d="M 120 180 Q 125 100 135 60 Q 145 100 150 180 Z" fill="url(#treeTrunk)" />
          {/* Branch extending towards palm */}
          <path d="M 132 85 Q 110 70 85 75" fill="none" stroke="#581c87" strokeWidth="6" strokeLinecap="round" />
          {/* Foliage Canopy */}
          <circle cx="135" cy="50" r="42" fill="url(#treeFoliage)" />
          <circle cx="110" cy="62" r="32" fill="url(#treeFoliage)" />
          <circle cx="160" cy="62" r="30" fill="url(#treeFoliage)" />
        </g>

        {/* Floating Telekinesis Path Particles */}
        {isHolding && progress > 5 && (
          <g>
            <line 
              x1="85" y1="75" 
              x2="110" y2="185" 
              stroke="rgba(251, 191, 36, 0.6)" 
              strokeWidth="2" 
              strokeDasharray="6 4"
              className="animate-pulse"
            />
            <circle cx="92" cy="110" r="3" fill="#f59e0b" className="animate-ping" />
            <circle cx="102" cy="140" r="4" fill="#a855f7" className="animate-ping" />
          </g>
        )}

        {/* Apple Telekinesis Object */}
        <g 
          style={{
            transform: `translate(${appleX - 85}px, ${appleY - 75}px) scale(${appleScale})`,
            transformOrigin: '85px 75px',
            transition: 'transform 0.1s linear'
          }}
        >
          {/* Glowing Telekinesis Aura */}
          {progress > 0 && (
            <circle 
              cx="85" 
              cy="75" 
              r={18 + auraGlow} 
              fill="url(#appleAura)" 
              className={isHolding ? 'animate-pulse' : ''}
            />
          )}

          {/* Apple Body */}
          <path 
            d="M 85 66 Q 72 66 72 78 Q 72 90 85 90 Q 98 90 98 78 Q 98 66 85 66 Z" 
            fill="url(#appleSkin)" 
            stroke="#fef08a"
            strokeWidth="0.8"
          />
          {/* Leaf */}
          <path d="M 85 66 Q 90 60 92 62 Q 88 68 85 66 Z" fill="#34d399" />
          {/* Stem */}
          <path d="M 85 66 L 85 62" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          {/* Shine highlight */}
          <circle cx="80" cy="72" r="2.5" fill="#ffffff" opacity="0.7" />
        </g>

        {/* Open Telekinesis Receiving Hand in Foreground (50% scale, positioned lower for perfect palm reception) */}
        <g transform="translate(62, 152) scale(0.5)">
          {/* Small Hand Base & Palm */}
          <path 
            d="M 60 120 Q 50 80 70 65 Q 100 55 130 65 Q 150 80 140 120 Z" 
            fill="url(#dream3DHandSkin)" 
            stroke="#fef08a"
            strokeWidth="1.2"
            opacity="0.95"
          />
          {/* Small Open Fingers waiting to receive apple */}
          <path d="M 70 65 Q 65 30 72 10" fill="none" stroke="url(#dream3DHandSkin)" strokeWidth="11" strokeLinecap="round" />
          <path d="M 90 58 Q 88 20 96 2" fill="none" stroke="url(#dream3DHandSkin)" strokeWidth="12" strokeLinecap="round" />
          <path d="M 112 58 Q 114 22 120 6" fill="none" stroke="url(#dream3DHandSkin)" strokeWidth="11" strokeLinecap="round" />
          <path d="M 130 65 Q 138 35 142 20" fill="none" stroke="url(#dream3DHandSkin)" strokeWidth="10" strokeLinecap="round" />
          <path d="M 60 90 Q 35 80 28 65" fill="none" stroke="url(#dream3DHandSkin)" strokeWidth="11" strokeLinecap="round" />

          {/* Fingertip lights */}
          <circle cx="72" cy="10" r="3" fill="#ffffff" className={isHolding ? 'animate-ping' : ''} />
          <circle cx="96" cy="2" r="3.5" fill="#ffffff" className={isHolding ? 'animate-ping' : ''} />
          <circle cx="120" cy="6" r="3" fill="#ffffff" className={isHolding ? 'animate-ping' : ''} />
        </g>
      </svg>
    </div>
  );
}

// ----------------------------------------------------
// GAME 1: Wall Dough Practice Card (Zero Energy)
// ----------------------------------------------------
function DoughWallPracticeGame() {
  const REQUIRED_HOLD_TIME = 10.0;
  const [holdTime, setHoldTime] = useState<number>(0);
  const [dreamStability, setDreamStability] = useState<number>(0);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [wallDepth, setWallDepth] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('دست خود را با آرامش، آهسته درون دیوار خمیری فرو ببرید (۱۰ ثانیه برای نفوذ کامل)...');
  const [feedbackType, setFeedbackType] = useState<'neutral' | 'success' | 'warning' | 'error'>('neutral');

  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<any>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      rx: -(y / rect.height) * 20,
      ry: (x / rect.width) * 20
    });
  };

  const handleMouseLeaveCanvas = () => {
    setTilt({ rx: 0, ry: 0 });
    setIsPressing(false);
  };

  useEffect(() => {
    if (isPressing) {
      intervalRef.current = setInterval(() => {
        setHoldTime(prev => {
          const next = Math.min(REQUIRED_HOLD_TIME, prev + 0.1);
          const newStability = Math.round((next / REQUIRED_HOLD_TIME) * 100);
          setDreamStability(newStability);
          setWallDepth(newStability);

          if (next >= REQUIRED_HOLD_TIME) {
            setFeedbackMessage('✨ آفرین! تمام دست در ۱۰ ثانیه درون دیوار خمیری فرو رفت و رویا به تثبیت ۱۰۰٪ رسید!');
            setFeedbackType('success');
          } else {
            setFeedbackMessage(`انگشتان کم‌کم درون دیوار خمیری فرو می‌روند... (${next.toFixed(1)} از ۱۰ ثانیه)`);
            setFeedbackType('success');
          }
          return next;
        });
      }, 100);
    } else {
      clearInterval(intervalRef.current);
      if (holdTime < REQUIRED_HOLD_TIME && holdTime > 0) {
        setFeedbackMessage(`دست از دیوار بیرون آمد. برای نفوذ کامل، باید دست ۱۰ ثانیه پیوسته درون دیوار خمیری فرو برود. (${holdTime.toFixed(1)}s)`);
        setFeedbackType('warning');
        const retractInterval = setInterval(() => {
          setWallDepth(prev => {
            if (prev <= 0) {
              clearInterval(retractInterval);
              return 0;
            }
            return prev - 5;
          });
        }, 50);
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [isPressing, holdTime]);

  const handlePanicClick = () => {
    setHoldTime(0);
    setDreamStability(0);
    setWallDepth(0);
    setFeedbackMessage('🚨 کلیک‌های شتابزده و بی‌صبری! رویا به دلیل رفتار هیجانی متلاشی شد. دوباره با فرو بردن تدریجی دست (۱۰ ثانیه) شروع کنید.');
    setFeedbackType('error');
  };

  const resetGame = () => {
    setHoldTime(0);
    setDreamStability(0);
    setWallDepth(0);
    setFeedbackMessage('دست خود را با آرامش، آهسته درون دیوار خمیری فرو ببرید (۱۰ ثانیه برای نفوذ کامل)...');
    setFeedbackType('neutral');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[460px]">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/80 to-slate-900 pointer-events-none">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </div>

      {/* Title & Header */}
      <div className="relative z-10 flex flex-wrap justify-between items-center gap-3 bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-indigo-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 font-bold">
            <Hand size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">تمرین ۱: خمیر شدن دیوار (اصل انرژی صفر)</h3>
            <p className="text-xs text-indigo-200/80 mt-0.5">دست خود را ۱۰ ثانیه نگه دارید تا انگشتان درون دیوار خمیری فرو بروند</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">ثبات رویا</span>
            <span className="text-sm font-bold text-indigo-300 font-mono">{dreamStability}٪</span>
          </div>
          <button
            onClick={resetGame}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
            title="بازنشانی"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* 3D Interactive Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeaveCanvas}
        className="relative z-10 my-4 flex flex-col items-center justify-center perspective-[1200px]"
      >
        <div 
          className="relative flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
          }}
        >
          {/* Progress Ring */}
          <svg className="absolute -inset-6 w-[280px] h-[280px] md:w-[340px] md:h-[340px] pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(51, 65, 85, 0.5)" strokeWidth="2.5" />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke={dreamStability >= 100 ? '#10b981' : '#6366f1'}
              strokeWidth="4"
              strokeDasharray="289"
              strokeDashoffset={289 - (289 * (holdTime / REQUIRED_HOLD_TIME))}
              strokeLinecap="round"
              className="transition-all duration-100 -rotate-90 origin-center"
            />
          </svg>

          {/* Wall Dough Box */}
          <div 
            onMouseDown={() => setIsPressing(true)}
            onMouseUp={() => setIsPressing(false)}
            onTouchStart={() => setIsPressing(true)}
            onTouchEnd={() => setIsPressing(false)}
            className={`w-60 h-60 md:w-72 md:h-72 rounded-3xl cursor-pointer relative flex flex-col items-center justify-center select-none transition-all duration-300 shadow-2xl overflow-hidden bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-slate-900 border-4 border-indigo-500/50 ${
              isPressing ? 'scale-98 ring-8 ring-indigo-500/40' : 'hover:scale-102'
            }`}
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            <Realistic3DHandGraphic depth={wallDepth} isPressing={isPressing} />

            <div className="text-white font-bold text-xs mt-1 text-center bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 shadow-lg">
              {isPressing ? `در حال ورود به دیوار خمیری (${holdTime.toFixed(1)}s / ۱۰s)` : 'دست را ۱۰ ثانیه روی دیوار نگه دارید'}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Footer */}
      <div className={`relative z-10 p-3.5 rounded-2xl border backdrop-blur-md transition-all ${
        feedbackType === 'success'
          ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
          : feedbackType === 'warning'
          ? 'bg-amber-950/70 border-amber-500/50 text-amber-200'
          : feedbackType === 'error'
          ? 'bg-rose-950/70 border-rose-500/50 text-rose-200'
          : 'bg-slate-950/70 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center gap-2.5 text-xs">
          <Info size={18} className="shrink-0" />
          <p className="leading-relaxed">{feedbackMessage}</p>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// GAME 2: Apple Telekinesis Practice Card (Zero Distance)
// ----------------------------------------------------
function AppleTelekinesisPracticeGame() {
  const REQUIRED_HOLD_TIME = 10.0;
  const [holdTime, setHoldTime] = useState<number>(0);
  const [dreamStability, setDreamStability] = useState<number>(0);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [appleProgress, setAppleProgress] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('دست را باز و ثابت نگه دارید... بدون دویدن به سمت درخت، سیب را جذب کنید (۱۰ ثانیه)...');
  const [feedbackType, setFeedbackType] = useState<'neutral' | 'success' | 'warning' | 'error'>('neutral');

  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<any>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      rx: -(y / rect.height) * 20,
      ry: (x / rect.width) * 20
    });
  };

  const handleMouseLeaveCanvas = () => {
    setTilt({ rx: 0, ry: 0 });
    setIsPressing(false);
  };

  useEffect(() => {
    if (isPressing) {
      intervalRef.current = setInterval(() => {
        setHoldTime(prev => {
          const next = Math.min(REQUIRED_HOLD_TIME, prev + 0.1);
          const newStability = Math.round((next / REQUIRED_HOLD_TIME) * 100);
          setDreamStability(newStability);
          setAppleProgress(newStability);

          if (next >= REQUIRED_HOLD_TIME) {
            setFeedbackMessage('✨ آفرین! سیب بدون حرکت دادن پاها یا دویدن، طی اصل فاصله‌ی صفر در دست شما قرار گرفت! جادوی تله‌کنسیس رویا تکمیل شد.');
            setFeedbackType('success');
          } else {
            setFeedbackMessage(`با سکون کامل، سیب در حال جدا شدن از درخت و طی کردن فاصله‌ی صفر است... (${next.toFixed(1)} از ۱۰ ثانیه)`);
            setFeedbackType('success');
          }
          return next;
        });
      }, 100);
    } else {
      clearInterval(intervalRef.current);
      if (holdTime < REQUIRED_HOLD_TIME && holdTime > 0) {
        setFeedbackMessage(`تمرکز قطع شد! سیب متوقف شد. برای طی شدن مسافت، باید دست خود را ۱۰ ثانیه در سکون مطلق نگه دارید. (${holdTime.toFixed(1)}s)`);
        setFeedbackType('warning');
        const retractInterval = setInterval(() => {
          setAppleProgress(prev => {
            if (prev <= 0) {
              clearInterval(retractInterval);
              return 0;
            }
            return prev - 5;
          });
        }, 50);
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [isPressing, holdTime]);

  const handlePanicClick = () => {
    setHoldTime(0);
    setDreamStability(0);
    setAppleProgress(0);
    setFeedbackMessage('🚨 به سمت درخت دویدید! در دنیای رویا، طی کردن مسافت فیزیکی و عجله کردن باعث سقوط سیب و متلاشی شدن رویا می‌شود.');
    setFeedbackType('error');
  };

  const resetGame = () => {
    setHoldTime(0);
    setDreamStability(0);
    setAppleProgress(0);
    setFeedbackMessage('دست را باز و ثابت نگه دارید... بدون دویدن به سمت درخت، سیب را جذب کنید (۱۰ ثانیه)...');
    setFeedbackType('neutral');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[460px]">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-amber-950/40 to-slate-900 pointer-events-none">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </div>

      {/* Title & Header */}
      <div className="relative z-10 flex flex-wrap justify-between items-center gap-3 bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-amber-400/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">تمرین ۲: جذب سیب از درخت به دست (اصل فاصله‌ی صفر)</h3>
            <p className="text-xs text-amber-200/80 mt-0.5">بدون دویدن به سمت درخت، دست را ۱۰ ثانیه ثابت نگه دارید تا سیب جذب دستتان شود</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">ثبات رویا</span>
            <span className="text-sm font-bold text-amber-300 font-mono">{dreamStability}٪</span>
          </div>
          <button
            onClick={resetGame}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
            title="بازنشانی"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* 3D Interactive Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeaveCanvas}
        className="relative z-10 my-4 flex flex-col items-center justify-center perspective-[1200px]"
      >
        <div 
          className="relative flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
          }}
        >
          {/* Progress Ring */}
          <svg className="absolute -inset-6 w-[280px] h-[280px] md:w-[340px] md:h-[340px] pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(51, 65, 85, 0.5)" strokeWidth="2.5" />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke={dreamStability >= 100 ? '#10b981' : '#f59e0b'}
              strokeWidth="4"
              strokeDasharray="289"
              strokeDashoffset={289 - (289 * (holdTime / REQUIRED_HOLD_TIME))}
              strokeLinecap="round"
              className="transition-all duration-100 -rotate-90 origin-center"
            />
          </svg>

          {/* Tree Telekinesis Box */}
          <div 
            onMouseDown={() => setIsPressing(true)}
            onMouseUp={() => setIsPressing(false)}
            onTouchStart={() => setIsPressing(true)}
            onTouchEnd={() => setIsPressing(false)}
            className={`w-60 h-60 md:w-72 md:h-72 rounded-3xl cursor-pointer relative flex flex-col items-center justify-center select-none transition-all duration-300 shadow-2xl overflow-hidden bg-gradient-to-br from-emerald-950/90 via-amber-950/80 to-slate-900 border-4 border-amber-400/60 ${
              isPressing ? 'scale-98 ring-8 ring-amber-500/30' : 'hover:scale-102'
            }`}
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            <TelekinesisAppleTreeGraphic progress={appleProgress} isHolding={isPressing} />

            <div className="text-white font-bold text-xs mt-1 text-center bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30 shadow-lg">
              {isPressing ? `طی کردن فاصله‌ی صفر و جذب سیب (${holdTime.toFixed(1)}s / ۱۰s)` : 'دست را باز نگه دارید تا سیب جذب دستتان شود'}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Footer */}
      <div className={`relative z-10 p-3.5 rounded-2xl border backdrop-blur-md transition-all ${
        feedbackType === 'success'
          ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
          : feedbackType === 'warning'
          ? 'bg-amber-950/70 border-amber-500/50 text-amber-200'
          : feedbackType === 'error'
          ? 'bg-rose-950/70 border-rose-500/50 text-rose-200'
          : 'bg-slate-950/70 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center gap-2.5 text-xs">
          <Info size={18} className="shrink-0" />
          <p className="leading-relaxed">{feedbackMessage}</p>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// GAME 3: Nightmare Disregard Practice Card (Principle of Disregard)
// ----------------------------------------------------
function NightmareDisregardGraphic({
  nightmareType,
  progress,
  playerPosition,
  veerDirection,
  isFailed,
  isHolding
}: {
  nightmareType: number;
  progress: number;
  playerPosition: 'center' | 'left' | 'right';
  veerDirection: number; // -1 for left curve, +1 for right curve
  isFailed: boolean;
  isHolding: boolean;
}) {
  const nightmareY = 35 + (progress / 100) * 185;
  const nightmareScale = 0.25 + (progress / 100) * 1.05;

  // Calculate nightmare X trajectory
  let nightmareX = 150;
  if (playerPosition === 'center') {
    // Player stayed still in center: Nightmare approaches VERY close (progress > 68) before veering away sharply!
    if (progress > 68) {
      const veerFactor = (progress - 68) / 32;
      nightmareX = 150 + veerDirection * veerFactor * 135;
    }
  } else if (playerPosition === 'left') {
    // Player fled to left: Nightmare homes in on left position (65)
    const homeInFactor = Math.min(1, Math.max(0, progress / 60));
    nightmareX = 150 + (65 - 150) * homeInFactor;
  } else if (playerPosition === 'right') {
    // Player fled to right: Nightmare homes in on right position (235)
    const homeInFactor = Math.min(1, Math.max(0, progress / 60));
    nightmareX = 150 + (235 - 150) * homeInFactor;
  }

  const isDissolving = playerPosition === 'center' && progress > 80;
  const nightmareOpacity = isDissolving ? Math.max(0, (100 - progress) / 20) : 1;
  const playerX = playerPosition === 'center' ? 150 : playerPosition === 'left' ? 65 : 235;

  const playerColor = isFailed ? '#ef4444' : isHolding ? '#10b981' : '#f59e0b';

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      <svg className="w-full h-full max-w-[320px] max-h-[320px]" viewBox="0 0 300 300">
        <defs>
          <radialGradient id="nightmareRealmBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#020617" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="shadowGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b0764" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vortexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#083344" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="playerAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={playerColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={playerColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 3D Floor Grid Lines */}
        <path d="M 150 40 L 20 280 M 150 40 L 80 280 M 150 40 L 150 280 M 150 40 L 220 280 M 150 40 L 280 280" stroke="rgba(99, 102, 241, 0.25)" strokeWidth="1.5" />
        <line x1="110" y1="90" x2="190" y2="90" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" />
        <line x1="80" y1="140" x2="220" y2="140" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" />
        <line x1="50" y1="190" x2="250" y2="190" stroke="rgba(99, 102, 241, 0.25)" strokeWidth="1.5" />
        <line x1="20" y1="240" x2="280" y2="240" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" />

        {/* 3 Lane Target Rings */}
        <ellipse
          cx="65"
          cy="245"
          rx="28"
          ry="11"
          fill={playerPosition === 'left' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(30, 41, 59, 0.5)'}
          stroke={playerPosition === 'left' ? '#f59e0b' : 'rgba(148, 163, 184, 0.3)'}
          strokeWidth="2"
        />

        <ellipse
          cx="235"
          cy="245"
          rx="28"
          ry="11"
          fill={playerPosition === 'right' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(30, 41, 59, 0.5)'}
          stroke={playerPosition === 'right' ? '#f59e0b' : 'rgba(148, 163, 184, 0.3)'}
          strokeWidth="2"
        />

        <ellipse
          cx="150"
          cy="245"
          rx="36"
          ry="15"
          fill={playerPosition === 'center' ? (isHolding ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)') : 'rgba(30, 41, 59, 0.5)'}
          stroke={playerPosition === 'center' ? (isHolding ? '#10b981' : '#f59e0b') : '#64748b'}
          strokeWidth="3"
        />

        {/* Player Figure */}
        <g transform={`translate(${playerX - 150}, 0)`} className="transition-transform duration-200">
          <ellipse cx="150" cy="245" rx="35" ry="15" fill="url(#playerAura)" />
          <circle cx="150" cy="205" r="11" fill={playerColor} />
          <path d="M 150 216 L 150 236 M 138 226 L 162 226 M 142 245 L 150 236 L 158 245" stroke={playerColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          
          {isHolding && (
            <circle cx="150" cy="222" r="4" fill="#ffffff" className="animate-pulse" />
          )}

          {isHolding && (
            <g transform="translate(142, 180) scale(0.65)">
              <path d="M 2 12 Q 12 2 22 12 Q 12 22 2 12 Z" fill="none" stroke="#34d399" strokeWidth="3" />
              <circle cx="12" cy="12" r="4" fill="#34d399" />
            </g>
          )}

          {!isHolding && !isFailed && (
            <g transform="translate(142, 180) scale(0.65)">
              <circle cx="12" cy="12" r="8" fill="none" stroke="#f59e0b" strokeWidth="2.5" className="animate-ping" />
            </g>
          )}
        </g>

        {/* Approaching Nightmare Entity */}
        <g 
          transform={`translate(${nightmareX}, ${nightmareY}) scale(${nightmareScale})`} 
          opacity={nightmareOpacity}
          className="transition-transform duration-75"
        >
          {nightmareType === 1 && (
            <g transform="translate(-40, -40)">
              <circle cx="40" cy="40" r="38" fill="url(#shadowGlow)" />
              <path d="M 15 50 Q 10 20 40 10 Q 70 20 65 50 Q 55 75 40 70 Q 25 75 15 50 Z" fill="#2e1065" stroke="#a855f7" strokeWidth="2.5" />
              <ellipse cx="28" cy="35" rx="6" ry="8" fill="#facc15" />
              <ellipse cx="52" cy="35" rx="6" ry="8" fill="#facc15" />
              <circle cx="29" cy="35" r="2.5" fill="#000000" />
              <circle cx="51" cy="35" r="2.5" fill="#000000" />
              <path d="M 24 52 Q 40 68 56 52 Q 40 58 24 52 Z" fill="#000000" stroke="#facc15" strokeWidth="1" />
              <path d="M 28 52 L 32 58 L 36 53 L 40 60 L 44 53 L 48 58 L 52 52" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          )}

          {nightmareType === 2 && (
            <g transform="translate(-40, -40)">
              <circle cx="40" cy="40" r="40" fill="url(#fireGlow)" />
              <path d="M 20 60 Q 15 25 25 10 Q 40 25 55 10 Q 65 25 60 60 Q 40 78 20 60 Z" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2.5" />
              <path d="M 20 22 Q 5 10 12 0 Q 22 10 25 20 Z" fill="#ef4444" />
              <path d="M 60 22 Q 75 10 68 0 Q 58 10 55 20 Z" fill="#ef4444" />
              <path d="M 22 34 L 34 38 L 22 42 Z" fill="#fef08a" />
              <path d="M 58 34 L 46 38 L 58 42 Z" fill="#fef08a" />
              <ellipse cx="40" cy="54" rx="12" ry="7" fill="#000000" stroke="#ef4444" strokeWidth="1.5" />
            </g>
          )}

          {nightmareType === 3 && (
            <g transform="translate(-40, -40)">
              <circle cx="40" cy="40" r="40" fill="url(#vortexGlow)" />
              <ellipse cx="40" cy="40" rx="35" ry="18" fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray="8 4" className="animate-spin origin-center" />
              <path d="M 22 35 Q 22 15 40 15 Q 58 15 58 35 Q 58 48 48 52 L 48 60 Q 40 64 32 60 L 32 52 Q 22 48 22 35 Z" fill="#083344" stroke="#22d3ee" strokeWidth="2" />
              <circle cx="32" cy="32" r="5.5" fill="#000000" />
              <circle cx="48" cy="32" r="5.5" fill="#000000" />
              <circle cx="32" cy="32" r="2" fill="#22d3ee" />
              <circle cx="48" cy="32" r="2" fill="#22d3ee" />
              <line x1="36" y1="52" x2="36" y2="60" stroke="#22d3ee" strokeWidth="2" />
              <line x1="40" y1="52" x2="40" y2="60" stroke="#22d3ee" strokeWidth="2" />
              <line x1="44" y1="52" x2="44" y2="60" stroke="#22d3ee" strokeWidth="2" />
            </g>
          )}

          {nightmareType === 4 && (
            <g transform="translate(-40, -40)">
              <circle cx="40" cy="40" r="38" fill="url(#fireGlow)" />
              <rect x="18" y="18" width="44" height="48" rx="10" fill="#312e81" stroke="#818cf8" strokeWidth="2.5" />
              <rect x="25" y="28" width="10" height="8" rx="2" fill="#f59e0b" />
              <rect x="45" y="28" width="10" height="8" rx="2" fill="#f59e0b" />
              <path d="M 22 46 L 27 58 L 32 46 L 37 58 L 42 46 L 47 58 L 52 46 L 58 46" fill="#000000" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          )}

          {nightmareType === 5 && (
            <g transform="translate(-40, -40)">
              <circle cx="40" cy="40" r="40" fill="url(#shadowGlow)" />
              <path d="M 20 20 Q 40 5 60 20 Q 75 50 60 70 Q 40 80 20 70 Q 5 50 20 20 Z" fill="#18181b" stroke="#e879f9" strokeWidth="2" />
              <circle cx="32" cy="35" r="4" fill="#f43f5e" />
              <circle cx="48" cy="35" r="4" fill="#f43f5e" />
              <circle cx="32" cy="35" r="1.5" fill="#ffffff" />
              <circle cx="48" cy="35" r="1.5" fill="#ffffff" />
            </g>
          )}
        </g>

        {isDissolving && (
          <g transform={`translate(${150 + veerDirection * 90}, 210)`}>
            <circle cx="-18" cy="-12" r="3.5" fill="#34d399" className="animate-ping" />
            <circle cx="22" cy="-18" r="3" fill="#fbbf24" className="animate-ping" />
            <circle cx="-10" cy="-25" r="4" fill="#a7f3d0" className="animate-pulse" />
            <circle cx="15" cy="-8" r="3" fill="#67e8f9" className="animate-pulse" />
            <circle cx="0" cy="-20" r="4" fill="#ffffff" className="animate-ping" />
          </g>
        )}

        {isFailed && (
          <g transform={`translate(${playerX}, 225)`}>
            <circle cx="0" cy="0" r="32" fill="rgba(239, 68, 68, 0.45)" stroke="#ef4444" strokeWidth="2.5" className="animate-ping" />
          </g>
        )}
      </svg>
    </div>
  );
}

function NightmareDisregardPracticeGame() {
  const TOTAL_GAME_TIME = 45.0;
  const [gameState, setGameState] = useState<'idle' | 'running' | 'gameover' | 'victory'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_GAME_TIME);
  const [score, setScore] = useState<number>(0);
  const [passedNightmares, setPassedNightmares] = useState<number>(0);
  const [currentNightmareType, setCurrentNightmareType] = useState<number>(1);
  const [veerDirection, setVeerDirection] = useState<number>(1); // -1 or 1
  const [nightmareProgress, setNightmareProgress] = useState<number>(0);
  const [playerPosition, setPlayerPosition] = useState<'center' | 'left' | 'right'>('center');
  const [isHolding, setIsHolding] = useState<boolean>(false);

  const [feedbackMessage, setFeedbackMessage] = useState<string>(
    'دستتان را روی کاراکتر نگه دارید تا رنگ آن سبز و ثابت بماند؛ کابوس بدون برخورد منحرف شده و غیب می‌شود!'
  );
  const [feedbackType, setFeedbackType] = useState<'neutral' | 'success' | 'warning' | 'error'>('neutral');

  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });

  const nightmareNames = [
    'سایه‌ی تاریک و سوزان',
    'شبح آتشین خشم',
    'طوفان سرگردانی و اضطراب',
    'غول دندان‌دار رویا',
    'شبح تاریک خلأ'
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      rx: -(y / rect.height) * 15,
      ry: (x / rect.width) * 15
    });
  };

  const handleMouseLeaveCanvas = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  const startGame = () => {
    setGameState('running');
    setTimeLeft(TOTAL_GAME_TIME);
    setScore(0);
    setPassedNightmares(0);
    setNightmareProgress(0);
    setPlayerPosition('center');
    setIsHolding(true);
    setVeerDirection(Math.random() < 0.5 ? -1 : 1);
    setCurrentNightmareType(Math.floor(Math.random() * 5) + 1);
    setFeedbackMessage('تمرین فعال شد! دستتان را روی کاراکتر نگه دارید (رنگ سبز).');
    setFeedbackType('success');
  };

  const handleHoldStart = () => {
    if (gameState === 'idle') {
      startGame();
      return;
    }
    if (gameState === 'running') {
      setIsHolding(true);
      setPlayerPosition('center');
      setFeedbackMessage('کاراکتر به مرکز بازگشت و سبز شد! بی‌توجهی فعال است.');
      setFeedbackType('success');
    }
  };

  const handleHoldEnd = () => {
    if (gameState === 'running') {
      setIsHolding(false);
    }
  };

  // Keyboard support (holding space or down key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleHoldStart();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleHoldEnd();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'running') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const nextTime = Math.max(0, prev - 0.05);
        if (nextTime <= 0) {
          setGameState('victory');
          setFeedbackType('success');
          setFeedbackMessage(
            `🎉 پیروزی کامل! شما ۴۵ ثانیه با سکون و بی‌توجهی کامل ماندید و ${passedNightmares} کابوس بدون برخورد منحرف و غیب شدند!`
          );
        }
        return nextTime;
      });

      if (isHolding) {
        // User holding down -> Player green at center
        setPlayerPosition('center');
        setNightmareProgress(prev => {
          const nextProgress = prev + 0.7; // Halved nightmare speed
          if (nextProgress >= 100) {
            setPassedNightmares(p => p + 1);
            setScore(s => s + 100);
            setVeerDirection(Math.random() < 0.5 ? -1 : 1);
            setCurrentNightmareType(Math.floor(Math.random() * 5) + 1);
            setFeedbackMessage(
              `✨ عالی! کابوس به علت بی‌توجهی شما منحرف و غیب گردید! (+100 امتیاز)`
            );
            setFeedbackType('success');
            return 0;
          }
          return nextProgress;
        });
      } else {
        // User NOT holding -> Player turns yellow and panics / flees automatically
        const fleePos = veerDirection === 1 ? 'left' : 'right';
        setPlayerPosition(fleePos);
        setNightmareProgress(prev => {
          const nextProgress = prev + 1.2; // Halved nightmare speed
          if (nextProgress >= 85) {
            setGameState('gameover');
            setFeedbackType('error');
            setFeedbackMessage(
              '🚨 شکست! کاراکتر زردرنگ فرار کرد و به کابوس برخورد نمود! با دست زدن دوباره می‌توانید آن را قبل از برخورد به مرکز برگردانید.'
            );
          }
          return nextProgress;
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, isHolding, veerDirection, passedNightmares]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[480px]">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/60 via-slate-950 to-indigo-950/80 pointer-events-none">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </div>

      <div className="relative z-10 flex flex-wrap justify-between items-center gap-3 bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold">
            <Flame size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">تمرین ۳: خنثی‌سازی کابوس با «اصل بی‌توجهی»</h3>
            <p className="text-xs text-purple-200/80 mt-0.5">دستتان را روی کاراکتر نگه دارید (سبز). در صورت فرار زردرنگ، تا قبل از برخورد فرصت دارید آن را به مرکز برگردانید.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">کابوس‌های غیب‌شده</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{passedNightmares} عدد</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">امتیاز بی‌توجهی</span>
            <span className="text-sm font-bold text-amber-300 font-mono">{score}</span>
          </div>
          {gameState === 'running' && (
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">زمان باقی‌مانده</span>
              <span className="text-sm font-bold text-indigo-300 font-mono">{timeLeft.toFixed(1)}s</span>
            </div>
          )}
          <button
            onClick={startGame}
            className="p-2 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-xl border border-purple-500/40 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="شروع / بازنشانی"
          >
            <RotateCcw size={16} />
            {gameState === 'idle' ? 'شروع' : 'مجدد'}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeaveCanvas}
        className="relative z-10 my-4 flex flex-col items-center justify-center perspective-[1200px]"
      >
        <div 
          className="relative flex items-center justify-center transition-transform duration-200 ease-out cursor-pointer select-none touch-none"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
          }}
          onMouseDown={handleHoldStart}
          onMouseUp={handleHoldEnd}
          onMouseLeave={handleHoldEnd}
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
          onTouchCancel={handleHoldEnd}
        >
          <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl relative flex flex-col items-center justify-center select-none shadow-2xl overflow-hidden bg-slate-950 border-4 border-purple-500/40">
            <NightmareDisregardGraphic
              nightmareType={currentNightmareType}
              progress={nightmareProgress}
              playerPosition={playerPosition}
              veerDirection={veerDirection}
              isFailed={gameState === 'gameover'}
              isHolding={isHolding}
            />

            {gameState === 'idle' && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                <Flame size={36} className="text-purple-400 mb-3 animate-bounce" />
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg transition-all border border-purple-400/40"
                >
                  شروع تمرین 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`relative z-10 p-3.5 rounded-2xl border backdrop-blur-md transition-all ${
        feedbackType === 'success'
          ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
          : feedbackType === 'warning'
          ? 'bg-amber-950/70 border-amber-500/50 text-amber-200'
          : feedbackType === 'error'
          ? 'bg-rose-950/70 border-rose-500/50 text-rose-200'
          : 'bg-slate-950/70 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center gap-2.5 text-xs">
          <Info size={18} className="shrink-0" />
          <p className="leading-relaxed">{feedbackMessage}</p>
        </div>
      </div>
    </div>
  );
}

export default function DreamGame() {
  const { setCurrentPage } = useApp();

  // Game States
  const [activeTab, setActiveTab] = useState<'interactive' | 'scenarios' | 'guide'>('interactive');
  
  // Scenario Game States
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [scenarioScore, setScenarioScore] = useState<number>(0);
  const [scenarioStability, setScenarioStability] = useState<number>(50);
  const [scenarioFinished, setScenarioFinished] = useState<boolean>(false);

  // Scenario Choice Selection
  const handleSelectOption = (scenario: Scenario, optionIndex: number) => {
    if (selectedOptionIndex !== null) return;
    setSelectedOptionIndex(optionIndex);
    const option = scenario.options[optionIndex];

    const newStability = Math.min(100, Math.max(0, scenarioStability + option.stabilityChange));
    setScenarioStability(newStability);

    if (option.isCorrect) {
      setScenarioScore(prev => prev + 100);
    }
  };

  const handleNextScenario = () => {
    setSelectedOptionIndex(null);
    if (currentScenarioIndex < SCENARIOS.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
    } else {
      setScenarioFinished(true);
    }
  };

  const resetScenarios = () => {
    setCurrentScenarioIndex(0);
    setSelectedOptionIndex(null);
    setScenarioScore(0);
    setScenarioStability(50);
    setScenarioFinished(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 md:p-10 text-white shadow-2xl relative overflow-hidden mb-8 border border-indigo-800/50">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1.5 rounded-full text-indigo-300 text-xs font-semibold mb-3 backdrop-blur-md">
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
              بازی شبیه‌ساز تثبیت و کنترل رویا
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              آزمایشگاه جادوی ساده و اصل انرژی صفر
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              آموزش عملی تکنیک‌های استاد فرشاد میرشکاری. یاد بگیرید چگونه بدون عجله، فقط با خونسردی و جادوی خمیر شدن دیوار به تثبیت ۱۰۰٪ رویا برسید.
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-2xl text-xs font-medium backdrop-blur-md border border-white/20 transition-all shadow-md self-start md:self-auto"
          >
            <ArrowLeft size={16} />
            بازگشت به سایت
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-indigo-800/60">
          <button
            onClick={() => setActiveTab('interactive')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'interactive'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 scale-105'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Hand size={16} />
            شبیه‌ساز ۳ تمرین عملی (دیوار خمیری & تله‌کنسیس & اصل بی‌توجهی)
          </button>

          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'scenarios'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 scale-105'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Compass size={16} />
            آزمون سناریوهای رویابینی (۳ مرحله)
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'guide'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 scale-105'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Info size={16} />
            قوانین طلایی و روش‌های ممنوعه
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE WALL STABILIZER & TELEKINESIS & DISREGARD */}
      {activeTab === 'interactive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Games Column (Stacked Practice 1, Practice 2 & Practice 3) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Game 1: Soft Dough Wall */}
            <DoughWallPracticeGame />

            {/* Game 2: Apple Telekinesis from Tree */}
            <AppleTelekinesisPracticeGame />

            {/* Game 3: Nightmare Disregard Practice */}
            <NightmareDisregardPracticeGame />
          </div>

          {/* Right Column: Educational Principles */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Zero Energy Principle */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2">
                <Sparkles size={16} />
                قانون اصلی ۱: اصل انرژی صفر
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                در رویابینی آگاهانه، نیازی به مصرف انرژی نیست. با آرامش کامل دست خود را درون دیوار خمیری فرو ببرید.
              </p>
            </div>

            {/* Zero Distance Principle */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2">
                <Zap size={16} />
                قانون اصلی ۲: اصل فاصله‌ی صفر
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                در آگاهی رویا، فاصله یک خطای ذهنی است. برای رسیدن به اشیاء نیازی به دویدن یا تلاش فیزیکی نیست؛ با سکون و جلب تمرکز، شیء به سمت شما جذب می‌شود.
              </p>
            </div>

            {/* Principle of Disregard */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2">
                <Flame size={16} />
                قانون اصلی ۳: اصل بی‌توجهی
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                کابوس‌ها در رویا از توجه و فرار شما تغذیه می‌کنند. با بی‌توجهی و ایستادن در مرکز، کابوس‌ها به محض رسیدن مانند دود بی‌ضرر محو می‌شوند.
              </p>
            </div>
          </div>

        </div>
      )}
      {/* TAB 2: SCENARIOS GAME */}
      {activeTab === 'scenarios' && (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
          {!scenarioFinished ? (
            <div>
              {/* Scenario Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs text-indigo-400 font-bold block mb-1">
                    مرحله {currentScenarioIndex + 1} از {SCENARIOS.length}
                  </span>
                  <h2 className="text-lg md:text-xl font-bold text-white">
                    {SCENARIOS[currentScenarioIndex].title}
                  </h2>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">ثبات رویا:</span>
                  <span className={`text-sm font-bold ${scenarioStability > 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {scenarioStability}٪
                  </span>
                </div>
              </div>

              {/* Scenario Situation Description */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-6">
                <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                  {SCENARIOS[currentScenarioIndex].situation}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {SCENARIOS[currentScenarioIndex].options.map((option, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  return (
                    <button
                      key={idx}
                      disabled={selectedOptionIndex !== null}
                      onClick={() => handleSelectOption(SCENARIOS[currentScenarioIndex], idx)}
                      className={`w-full text-right p-4 rounded-2xl border transition-all text-xs md:text-sm leading-relaxed flex items-start gap-3 ${
                        selectedOptionIndex === null
                          ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200 hover:border-indigo-500'
                          : isSelected
                          ? option.isCorrect
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/20'
                            : 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/20'
                          : 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-50'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-slate-700/60 border border-slate-600 flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{option.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation display after choosing */}
              {selectedOptionIndex !== null && (
                <div className={`p-4 rounded-2xl border mb-6 text-xs md:text-sm leading-relaxed ${
                  SCENARIOS[currentScenarioIndex].options[selectedOptionIndex].isCorrect
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                }`}>
                  <p>{SCENARIOS[currentScenarioIndex].options[selectedOptionIndex].explanation}</p>
                </div>
              )}

              {/* Next Button */}
              {selectedOptionIndex !== null && (
                <button
                  onClick={handleNextScenario}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl text-xs md:text-sm transition-all shadow-lg shadow-indigo-600/20"
                >
                  {currentScenarioIndex < SCENARIOS.length - 1 ? 'مرحله بعدی' : 'مشاهده کارنامه نهایی'}
                </button>
              )}
            </div>
          ) : (
            /* Final Score Card */
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-amber-400/20 border-2 border-amber-400 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={40} />
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-2">نتیجه آزمون کنترل و تثبیت رویا</h2>
              <p className="text-xs text-slate-400 mb-6">بر اساس قوانین علمی استاد فرشاد میرشکاری</p>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-6 max-w-sm mx-auto">
                <div className="text-xs text-slate-400 mb-1">امتیاز کسب‌شده:</div>
                <div className="text-3xl font-extrabold text-amber-400 mb-3">{scenarioScore} از ۳۰۰</div>
                
                <div className="text-xs text-slate-300 border-t border-slate-800 pt-3">
                  {scenarioScore >= 200 ? (
                    <span className="text-emerald-400 font-bold">✨ عالی! شما قوانین جادوی ساده و اصل انرژی صفر را کاملاً درک کرده‌اید.</span>
                  ) : (
                    <span className="text-amber-300 font-bold">⚠️ نیاز به تمرین بیشتر. حتماً از رفتارهای هیجانی (چرخیدن و مالیدن دست) خودداری کنید.</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={resetScenarios}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-md"
                >
                  تکرار مجدد آزمون
                </button>
                <button
                  onClick={() => setActiveTab('interactive')}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all border border-slate-700"
                >
                  بازگشت به شبیه‌ساز دیوار خمیری
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GOLDEN RULES & BANNED METHODS */}
      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* BANNED METHODS */}
          <div className="bg-rose-950/30 border border-rose-900/50 rounded-3xl p-6 text-white">
            <h3 className="text-base font-extrabold text-rose-400 flex items-center gap-2 mb-4 border-b border-rose-900/50 pb-3">
              <XCircle size={20} />
              روش‌های نادرست و غیرعلمی (ممنوعه)
            </h3>
            
            <ul className="space-y-4 text-xs md:text-sm text-slate-300 leading-relaxed">
              <li className="flex items-start gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-rose-900/30">
                <span className="text-rose-400 font-bold shrink-0">❌</span>
                <div>
                  <strong className="text-rose-200 block mb-1">دست به هم مالیدن و نگاه دقیق به دست‌ها:</strong>
                  این کار طبق تصورات غلط گذشته مطرح می‌شد اما در واقع هیجان کاذب ایجاد کرده و باعث خروج سریع از رویا می‌شود.
                </div>
              </li>

              <li className="flex items-start gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-rose-900/30">
                <span className="text-rose-400 font-bold shrink-0">❌</span>
                <div>
                  <strong className="text-rose-200 block mb-1">چرخیدن دور خود:</strong>
                  چرخش ناگهانی صحنه رویا را درهم می‌شکند و ذهن را دچار سردرگمی فیزیکی می‌کند.
                </div>
              </li>

              <li className="flex items-start gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-rose-900/30">
                <span className="text-rose-400 font-bold shrink-0">❌</span>
                <div>
                  <strong className="text-rose-200 block mb-1">تکان دادن دست‌ها برای پرواز (بال زدن):</strong>
                  در دنیای رویا قوانین بیداری برقرار نیست. بال زدن انرژی شما را هدر داده و رویا را می‌شکند.
                </div>
              </li>
            </ul>
          </div>

          {/* APPROVED SCIENTIFIC METHODS */}
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-3xl p-6 text-white">
            <h3 className="text-base font-extrabold text-emerald-400 flex items-center gap-2 mb-4 border-b border-emerald-900/50 pb-3">
              <CheckCircle2 size={20} />
              روش درست تثبیت رویا (تایید شده)
            </h3>

            <ul className="space-y-4 text-xs md:text-sm text-slate-300 leading-relaxed">
              <li className="flex items-start gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-900/30">
                <span className="text-emerald-400 font-bold shrink-0">✅</span>
                <div>
                  <strong className="text-emerald-200 block mb-1">جادوی ساده (عبور آهسته دست از دیوار):</strong>
                  کافی است با خونسردی کامل دست خود را به سمت دیوار برده و احساس کنید دیوار مانند خمیر نرم است. دست آهسته نفوذ می‌کند.
                </div>
              </li>

              <li className="flex items-start gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-900/30">
                <span className="text-emerald-400 font-bold shrink-0">✅</span>
                <div>
                  <strong className="text-emerald-200 block mb-1">اصل انرژی صفر:</strong>
                  برای هر اقدامی در رویا (پرواز، تغییر محیط) فقط اراده قلبی و سکون لازم است، نه تلاش و شتاب فیزیکی.
                </div>
              </li>

              <li className="flex items-start gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-900/30">
                <span className="text-emerald-400 font-bold shrink-0">✅</span>
                <div>
                  <strong className="text-emerald-200 block mb-1">آرامش و عدم عجله:</strong>
                  عجله امتیاز منفی داشته و رویا را فرو می‌ریزد. سکوت ذهنی و صبر، شفافیت رویا را به ۱۰۰٪ می‌رساند.
                </div>
              </li>
            </ul>
          </div>

        </div>
      )}

    </div>
  );
}
