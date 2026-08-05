import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, Sparkles, Monitor, MoreVertical } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone / app mode
    const inStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (inStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Check if user dismissed prompt in this session
    const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');

    if (isIosDevice) {
      if (!isDismissed) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 2000);
      }
    };

    // Listen for manual trigger button from top header or mobile menu
    const handleManualOpen = () => {
      setShowPrompt(true);
      setShowInstructions(false);
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
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
        return;
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    }
    // If native prompt is not available, show clear instructions
    setShowInstructions(true);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowInstructions(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700/80 text-white rounded-3xl p-5 sm:p-6 shadow-2xl max-w-sm w-full flex flex-col gap-4 relative text-right dir-rtl"
        dir="rtl"
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center shrink-0 p-1.5 shadow-md shadow-amber-500/10">
              <img src="/icon40fates.png" alt="40 Gates Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">نصب اپلیکیشن</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">آکادمی ۴۰ دروازه روی گوشی و کامپیوتر</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="بستن"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Content / Manual Instructions */}
        {showInstructions ? (
          <div className="bg-slate-800/90 rounded-2xl p-4 text-xs text-slate-300 space-y-3 border border-slate-700/80">
            {isIos ? (
              <>
                <p className="font-extrabold text-amber-400 flex items-center gap-1.5 text-xs">
                  <Smartphone size={16} />
                  <span>راهنمای نصب در آیفون (iOS Safari):</span>
                </p>
                <ol className="list-decimal list-inside space-y-2 text-[11px] leading-relaxed text-slate-200">
                  <li>در پایین مرورگر Safari روی آیکون اشتراک‌گذاری (<Share size={12} className="inline text-sky-400 mx-0.5" />) بزنید.</li>
                  <li>صفحه را پایین بکشید و گزینه <strong>Add to Home Screen (افزودن به صفحه اصلی)</strong> را انتخاب کنید.</li>
                  <li>در بالای صفحه روی <strong>Add</strong> بزنید.</li>
                </ol>
              </>
            ) : (
              <>
                <p className="font-extrabold text-amber-400 flex items-center gap-1.5 text-xs">
                  <Monitor size={16} />
                  <span>راهنمای نصب در کامپیوتر و اندروید:</span>
                </p>
                <ul className="space-y-2.5 text-[11px] leading-relaxed text-slate-200">
                  <li className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                    <strong className="text-amber-300 block mb-1">🖥️ در مرورگر کامپیوتر (Chrome / Edge):</strong>
                    مطابق تصویر بالا، دقیقاً در <strong>سمت راست نوار آدرس مرورگر</strong> (در بالاترین بخش مرورگر) روی آیکون نصب <span className="inline-flex items-center gap-1 bg-slate-800 text-amber-400 font-mono px-1.5 py-0.5 rounded border border-amber-500/30 text-[10px]"><Monitor size={11} /><Download size={11} /></span> کلیک نمایید.
                  </li>
                  <li className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                    <strong className="text-sky-300 block mb-1">📱 در گوشی اندروید:</strong>
                    روی منوی ۳ نقطه (<MoreVertical size={12} className="inline text-amber-400 mx-0.5" />) مرورگر زده و گزینه <strong>«افزودن به صفحه اصلی»</strong> یا <strong>«Install app»</strong> را انتخاب کنید.
                  </li>
                </ul>
              </>
            )}
            <button
              onClick={() => setShowInstructions(false)}
              className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              متوجه شدم
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              با نصب اپلیکیشن می‌توانید بدون نیاز به مرورگر و با سرعت بالا به دوره‌ها، فایل‌ها و حساب کاربری خود دسترسی داشته باشید.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleInstallClick}
                className="flex-grow bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-98"
              >
                <Download size={16} className="animate-bounce" />
                <span>نصب اپلیکیشن</span>
              </button>
              <button
                onClick={handleDismiss}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 px-4 rounded-2xl text-xs transition-colors cursor-pointer shrink-0"
              >
                بعداً
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

