import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewDream: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenNewDream }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text wordmark with subtle iconography */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('gates')}
            className="flex items-center gap-2.5 text-right group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-950 to-indigo-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/60 transition-colors">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap">
              چهل دروازه به ماورا
            </span>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('gates')}
            className={`transition-colors hover:text-white py-1 ${activeTab === 'gates' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''} whitespace-nowrap`}
          >
            ۴۰ دروازه
          </button>
          <button
            onClick={() => setActiveTab('reality-check')}
            className={`transition-colors hover:text-white py-1 ${activeTab === 'reality-check' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''} whitespace-nowrap`}
          >
            آزمون واقعیت
          </button>
          <button
            onClick={() => setActiveTab('binaural')}
            className={`transition-colors hover:text-white py-1 ${activeTab === 'binaural' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''} whitespace-nowrap`}
          >
            امواج صوتی تتا
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`transition-colors hover:text-white py-1 ${activeTab === 'journal' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''} whitespace-nowrap`}
          >
            دفتر رویا
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`transition-colors hover:text-white py-1 ${activeTab === 'sandbox' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''} whitespace-nowrap`}
          >
            شبیه‌ساز پرواز رویا
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`transition-colors hover:text-white py-1 ${activeTab === 'quiz' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''} whitespace-nowrap`}
          >
            سنجش استعداد
          </button>
          <button
            onClick={() => setActiveTab('master')}
            className={`transition-colors hover:text-white py-1 ${activeTab === 'master' ? 'text-cyan-400 border-b-2 border-cyan-400' : ''} whitespace-nowrap`}
          >
            آموزه‌های استاد
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewDream}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-cyan-950"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ثبت رویای شفاف</span>
          </button>
        </div>

      </div>

      {/* Mobile nav bar row for small screens */}
      <div className="md:hidden flex items-center justify-around py-2 px-2 bg-slate-900/90 border-t border-slate-800 text-xs overflow-x-auto whitespace-nowrap gap-4">
        <button
          onClick={() => setActiveTab('gates')}
          className={`px-2 py-1 ${activeTab === 'gates' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          دروازه‌ها
        </button>
        <button
          onClick={() => setActiveTab('reality-check')}
          className={`px-2 py-1 ${activeTab === 'reality-check' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          چک واقعیت
        </button>
        <button
          onClick={() => setActiveTab('binaural')}
          className={`px-2 py-1 ${activeTab === 'binaural' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          امواج تتا
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`px-2 py-1 ${activeTab === 'journal' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          دفتر رویا
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-2 py-1 ${activeTab === 'sandbox' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          شبیه‌ساز
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-2 py-1 ${activeTab === 'quiz' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          سنجش
        </button>
      </div>
    </header>
  );
};
