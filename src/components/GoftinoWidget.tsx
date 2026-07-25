import React, { useEffect, useState } from 'react';
import { MessageSquare, Sparkles, X, Check, Copy } from 'lucide-react';

interface GoftinoWidgetProps {
  defaultKey?: string;
}

export default function GoftinoWidget({ defaultKey = '' }: GoftinoWidgetProps) {
  const [goftinoKey, setGoftinoKey] = useState<string>(() => {
    return localStorage.getItem('goftino_key') || (import.meta as any).env?.VITE_GOFTINO_KEY || defaultKey || '';
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);

  useEffect(() => {
    if (!goftinoKey || goftinoKey.trim() === '') return;

    const trimmedKey = goftinoKey.trim();

    // Check if script already injected
    if (document.getElementById('goftino-script-' + trimmedKey)) {
      setIsLoaded(true);
      return;
    }

    try {
      // Goftino official script loader
      const script = document.createElement('script');
      script.id = 'goftino-script-' + trimmedKey;
      script.type = 'text/javascript';
      script.async = true;
      script.src = `https://www.goftino.com/widget/${trimmedKey}`;
      
      script.onload = () => {
        setIsLoaded(true);
        console.log('Goftino live chat initialized successfully.');
      };

      document.head.appendChild(script);

      // Trigger Goftino initialization function if available
      if ((window as any).Goftino) {
        (window as any).Goftino.Init();
      }
    } catch (err) {
      console.warn('Goftino script load error:', err);
    }
  }, [goftinoKey]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = tempKey.trim();
    localStorage.setItem('goftino_key', cleanKey);
    setGoftinoKey(cleanKey);
    setShowConfigModal(false);
    if (cleanKey) {
      window.location.reload(); // Reload to initialize Goftino script cleanly
    }
  };

  return (
    <>
      {/* Floating Goftino Setup helper badge if key is not configured */}
      {!goftinoKey && (
        <div className="fixed bottom-6 left-6 z-50">
          <button
            onClick={() => {
              setTempKey(goftinoKey);
              setShowConfigModal(true);
            }}
            className="group flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-amber-300/40"
            title="تنظیم کلید گفتینو جهت فعال‌سازی چت زنده"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <MessageSquare size={14} />
            </div>
            <span>اتصال چت زنده گفتینو</span>
            <Sparkles size={14} className="text-amber-200" />
          </button>
        </div>
      )}

      {/* Goftino Modal Configuration Dialog */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-right space-y-4 font-sans animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  💬
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">اتصال چت زنده گفتینو (Goftino)</h3>
                  <p className="text-[11px] text-slate-500">پشتیبانی آنلاین و پاسخگویی به مشتریان سایت</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                برای فعال‌سازی آیکون گفتینو در گوشه سایت، کلید ویجت اختصاصی خود را از پنل گفتینو وارد کنید:
              </p>

              <ol className="list-decimal list-inside space-y-1 bg-amber-50/60 border border-amber-200/60 p-3 rounded-2xl text-[11px] text-amber-900 font-medium">
                <li>وارد پنل مدیریت گفتینو در <a href="https://goftino.com" target="_blank" rel="noreferrer" className="text-amber-800 underline font-bold">goftino.com</a> شوید.</li>
                <li>از منوی مدیریت، به بخش <strong>«تنظیمات ویجت» → «کد گفتینو»</strong> بروید.</li>
                <li>کد اختصاصی یا کلید ۵ تا ۸ کاراکتری ویجت خود را کپی کنید.</li>
              </ol>

              <form onSubmit={handleSaveKey} className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-slate-800 font-bold text-xs">
                    کلید ویجت گفتینو (Goftino Widget Key):
                  </label>
                  <input
                    type="text"
                    required
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="مثال: abc123xyz..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-left focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                  <p className="text-[10px] text-slate-400">
                    نکته: با ذخیره کلید، ویجت گفتینو فوراً در تمامی صفحات سایت بارگذاری خواهد شد.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Check size={16} />
                    <span>ذخیره و فعال‌سازی چت زنده</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
