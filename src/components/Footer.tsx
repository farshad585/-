import React from 'react';
import { Compass, Moon } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>چهل دروازه به ماورا | مرجع رویابینی آگاهانه</span>
            </div>
            <p className="text-slate-400 text-xs max-w-md">
              پلتفرم آموزش علمی و تخصصی رویابینی آگاهانه، تثبیت رویا و شبیه‌ساز کنترل رویا با تکنیک‌های استاد فرشاد میرشکاری
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <button onClick={() => setActiveTab('gates')} className="hover:text-cyan-400 transition-colors">
              ۴۰ دروازه
            </button>
            <button onClick={() => setActiveTab('reality-check')} className="hover:text-cyan-400 transition-colors">
              آزمون واقعیت
            </button>
            <button onClick={() => setActiveTab('binaural')} className="hover:text-cyan-400 transition-colors">
              امواج صوتی تتا
            </button>
            <button onClick={() => setActiveTab('journal')} className="hover:text-cyan-400 transition-colors">
              دفتر ثبت رویا
            </button>
            <button onClick={() => setActiveTab('sandbox')} className="hover:text-cyan-400 transition-colors">
              شبیه‌ساز رویا
            </button>
            <button onClick={() => setActiveTab('quiz')} className="hover:text-cyan-400 transition-colors">
              سنجش استعداد
            </button>
            <button onClick={() => setActiveTab('master')} className="hover:text-cyan-400 transition-colors">
              آموزه‌های استاد
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            تمام حقوق محفوظ است © ۱۴۰۳ - بازآفرینی هشیاری در خواب شفاف
          </div>
          <div className="flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-cyan-500" />
            <span>طراحی شده برای پویندگان حقیقت و بیداری ذهن</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
