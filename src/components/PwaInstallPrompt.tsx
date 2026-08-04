import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, Sparkles } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosInstructions, setShowIosInstructions] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if already installed / running in standalone mode
    const inStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (inStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Check if user dismissed prompt previously in this session
    const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (isDismissed) return;

    if (isIosDevice) {
      // Show iOS prompt after 3 seconds if not in standalone
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Listen for beforeinstallprompt on Android / Desktop Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Delay prompt showing by 2.5s for smoother UX
      setTimeout(() => {
        setShowPrompt(true);
      }, 2500);
    };

    // Listen for manual trigger from top header / menu button
    const handleManualOpen = () => {
      setShowPrompt(true);
      sessionStorage.removeItem('pwa_prompt_dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('open-pwa-prompt', handleManualOpen);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-prompt', handleManualOpen);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIos) {
        setShowIosInstructions(true);
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted PWA installation');
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-fade-in-up">
      <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/30 text-white rounded-2xl p-4 shadow-2xl shadow-indigo-950/50 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 p-1.5 shadow-md shadow-indigo-500/20">
              <img src="/icon40fates.png" alt="40 Gates Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white">اپلیکیشن آکادمی ۴۰ دروازه</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-0.5">
                  <Sparkles size={10} />
                  <span>PWA</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">نصب مستقیم روی گوشی بدون نیاز به دانلود از بازار</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="بستن"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Button / iOS Instructions */}
        {showIosInstructions ? (
          <div className="bg-slate-800/80 rounded-xl p-3 text-xs text-slate-300 space-y-2 border border-slate-700">
            <p className="font-bold text-amber-400 flex items-center gap-1">
              <Smartphone size={14} />
              <span>راهنمای نصب در آیفون (iOS Safari):</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-slate-300">
              <li>در پایین مرورگر Safari روی آیکون اشتراک‌گذاری (<Share size={12} className="inline text-sky-400 mx-0.5" />) بزنید.</li>
              <li>صفحه را پایین بکشید و گزینه <strong>Add to Home Screen</strong> (<PlusSquare size={12} className="inline text-emerald-400 mx-0.5" />) را انتخاب کنید.</li>
              <li>در بالای صفحه روی <strong>Add</strong> بزنید.</li>
            </ol>
            <button
              onClick={() => setShowIosInstructions(false)}
              className="w-full mt-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer"
            >
              متوجه شدم
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-grow bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-98"
            >
              <Download size={15} className="animate-bounce" />
              <span>افزودن به صفحه اصلی (نصب وب‌اپ)</span>
            </button>
            <button
              onClick={handleDismiss}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer shrink-0"
            >
              بعداً
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
