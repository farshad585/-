/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Instagram, 
  Send, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  CreditCard, 
  Award,
  BookOpen
} from 'lucide-react';

export default function Footer() {
  const { setCurrentPage } = useApp();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert('سپاس! ایمیل شما برای دریافت مقالات و کدهای تخفیف ویژه در خبرنامه ثبت شد.');
  };

  return (
    <footer className="bg-white text-slate-600 border-t border-purple-200/80 mt-20 relative overflow-hidden shadow-inner">
      
      {/* Background radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        
        {/* Column 1: Brand Info & Socials */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-indigo-300 overflow-hidden p-0.5 bg-white shadow-xs">
              <img 
                src="/src/assets/images/40gates_logo_1784533471317.jpg" 
                alt="لوگو ۴۰ دروازه" 
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-wide">آکادمی ۴۰ دروازه</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            ما در آکادمی «۴۰ دروازه» بر این باوریم که خواب‌ها، دروازه نهایی شناخت ابعاد ناشناخته روان و بیداری معنوی هستند. با ارائه آموزش‌های علمی، تخصصی و به روز دنیا، شما را برای تسلط کامل بر جهان رویاها یاری می‌کنیم.
          </p>
          <div className="flex items-center gap-3">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 bg-indigo-50 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white rounded-full transition-all text-indigo-600 shadow-xs"
              title="اینستاگرام"
            >
              <Instagram size={16} />
            </a>
            <a 
              href="https://t.me" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 bg-indigo-50 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white rounded-full transition-all text-indigo-600 shadow-xs"
              title="تلگرام"
            >
              <Send size={16} className="-translate-x-0.5" />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 bg-indigo-50 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white rounded-full transition-all text-indigo-600 shadow-xs"
              title="یوتیوب"
            >
              <Youtube size={16} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 border-r-4 border-indigo-600 pr-2">دسترسی سریع</h4>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li>
              <button onClick={() => setCurrentPage('shop')} className="hover:text-indigo-600 transition-colors">فروشگاه کتاب چاپی و PDF</button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('blog')} className="hover:text-indigo-600 transition-colors">مجله آموزشی رویابینی</button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('faq')} className="hover:text-indigo-600 transition-colors">پاسخ به سوالات متداول</button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('dashboard')} className="hover:text-indigo-600 transition-colors">پنل کاربری و دانلودها</button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('privacy')} className="hover:text-indigo-600 transition-colors">حریم خصوصی کاربران</button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('terms')} className="hover:text-indigo-600 transition-colors">قوانین و مقررات آکادمی</button>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 border-r-4 border-indigo-600 pr-2">دفتر مرکزی و پشتیبانی</h4>
          <ul className="space-y-3.5 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <span>ایران، تهران، خیابان ولیعصر، نرسیده به میدان ونک، برج نگار، واحد ۴۰</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="text-purple-600" />
              <span className="font-mono font-medium">۰۲۱-۸۸۸۸۴۰۴۰</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="text-purple-600" />
              <span className="font-mono font-medium">info@40gates.ir</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Newsletter & Trust Badges */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-slate-900 border-r-4 border-indigo-600 pr-2">خبرنامه سالکان خواب</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            برای دریافت آخرین مقالات علمی، ترفندهای هفتگی خواب بیدار و تخفیف‌های طلایی ایمیل خود را ثبت کنید.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input 
              id="newsletter-email"
              type="email" 
              required
              placeholder="ایمیل شما..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button 
              id="newsletter-submit"
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 transition-all text-white font-bold text-xs px-4 rounded-xl shadow-xs"
            >
              عضویت
            </button>
          </form>

          {/* Secure / Payment Trust icons */}
          <div className="flex gap-3 pt-2">
            <div className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center group hover:border-indigo-400 transition-colors">
              <ShieldCheck size={20} className="text-indigo-600 mb-1" />
              <span className="text-[9px] text-slate-600 font-medium">خرید امن</span>
            </div>
            <div className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center group hover:border-indigo-400 transition-colors">
              <CreditCard size={20} className="text-purple-600 mb-1" />
              <span className="text-[9px] text-slate-600 font-medium">عضو شتاب</span>
            </div>
            <div className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center group hover:border-indigo-400 transition-colors">
              <Award size={20} className="text-violet-600 mb-1" />
              <span className="text-[9px] text-slate-600 font-medium">نشان ملی</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-purple-200/80 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white text-[10px] font-bold uppercase tracking-widest relative z-10">
        <div className="max-w-7xl mx-auto px-12 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© ۲۰۲۶ آکادمی ۴۰ دروازه (۴۰gates.ir) - تمامی حقوق این وب‌سایت محفوظ است.</p>
          <div className="flex gap-8">
            <button onClick={() => setCurrentPage('terms')} className="hover:underline text-white">شرایط خدمات</button>
            <button onClick={() => setCurrentPage('privacy')} className="hover:underline text-white">حریم خصوصی</button>
          </div>
        </div>
      </div>

    </footer>
  );
}
