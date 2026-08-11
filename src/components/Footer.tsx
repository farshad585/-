/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import logoIcon from '../assets/images/icon40fates.png';
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
  BookOpen,
  MessageCircle
} from 'lucide-react';

export default function Footer() {
  const { setCurrentPage, isAuthenticated } = useApp();

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
                src={logoIcon} 
                alt="لوگو چهل دروازه" 
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-wide">آکادمی چهل دروازه</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600 font-light text-justify">
            شما هر شب موقع خواب به دنیای شخصی خویش قدم می‌گذارید و از این حق انتخاب برخوردار هستید که به شکل آدمی معمولی یا در قامت پادشاهی بی‌همتا ظاهر شوید. آری؛ انتخاب با خود شماست. البته به این شرط که صاحب گوهر خودآگاهی باشید. و من... با ارائه تازه‌ترین آموزش‌های علمی، شما را یاری خواهم کرد.
          </p>
          <div className="flex items-center gap-3">
            <a 
              href="https://www.instagram.com/farshad_g.o.d" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 bg-indigo-50 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white rounded-xl transition-all text-indigo-600 shadow-xs flex items-center gap-1.5"
              title="اینستاگرام فرشاد میرشکاری"
            >
              <Instagram size={18} />
            </a>
            <a 
              href="https://t.me/OMEGA585" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 bg-indigo-50 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white rounded-xl transition-all text-indigo-600 shadow-xs flex items-center gap-1.5"
              title="کانال و پشتیبانی تلگرام"
            >
              <Send size={18} className="-translate-x-0.5" />
            </a>
            <a 
              href="https://ble.ir/40GATES" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 bg-indigo-50 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-600 hover:text-white rounded-xl transition-all text-indigo-600 shadow-xs flex items-center gap-1.5"
              title="کانال و پیام‌رسان بله"
            >
              <MessageCircle size={18} />
            </a>
            <a 
              href="mailto:40gates.main@gmail.com" 
              className="p-2.5 bg-indigo-50 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white rounded-xl transition-all text-indigo-600 shadow-xs flex items-center gap-1.5"
              title="ارسال ایمیل مستقیم"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 border-r-4 border-indigo-600 pr-2">دسترسی سریع</h4>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li>
              <button onClick={() => setCurrentPage('dream-game')} className="hover:text-indigo-600 transition-colors font-bold text-indigo-700">🎮 بازی شبیه‌ساز کنترل رویا</button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('shop')} className="hover:text-indigo-600 transition-colors">فروشگاه</button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('blog')} className="hover:text-indigo-600 transition-colors">مجله آموزشی رویابینی</button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('faq')} className="hover:text-indigo-600 transition-colors">پاسخ به سوالات متداول</button>
            </li>
            <li>
              <button onClick={() => setCurrentPage(isAuthenticated ? 'dashboard' : 'auth')} className="hover:text-indigo-600 transition-colors">پنل کاربری و دانلودها</button>
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
          <h4 className="text-sm font-bold text-slate-900 border-r-4 border-indigo-600 pr-2">ارتباط مستقیم با فرشاد میرشکاری</h4>
          <ul className="space-y-3.5 text-xs text-slate-600">
            <li className="flex items-center gap-2.5">
              <Instagram size={18} className="text-pink-600 shrink-0" />
              <a 
                href="https://www.instagram.com/farshad_g.o.d" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-indigo-600 dir-ltr font-mono font-semibold transition-colors"
              >
                @farshad_g.o.d
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Send size={18} className="text-sky-500 shrink-0" />
              <a 
                href="https://t.me/Farshad_God" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-indigo-600 dir-ltr font-mono font-semibold transition-colors"
              >
                t.me/Farshad_God
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MessageCircle size={18} className="text-emerald-600 shrink-0" />
              <a 
                href="https://ble.ir/40GATES" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-indigo-600 dir-ltr font-mono font-semibold transition-colors"
              >
                ble.ir/40GATES
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={18} className="text-purple-600 shrink-0" />
              <a 
                href="mailto:40gates.main@gmail.com"
                className="hover:text-indigo-600 dir-ltr font-mono font-medium transition-colors"
              >
                40gates.main@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Trust Badges & Guarantees */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 border-r-4 border-indigo-600 pr-2">نمادها و تضمین خرید</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            تمامی محصولات آکادمی چهل دروازه شامل ضمانت کیفیت، پشتیبانی مستقیم و درگاه پرداخت امن الکترونیکی شبکه شتاب می‌باشند.
          </p>

          {/* Secure / Payment Trust icons */}
          <div className="flex gap-2.5 pt-2">
            <div className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center group hover:border-indigo-400 transition-colors shadow-2xs">
              <ShieldCheck size={22} className="text-indigo-600 mb-1" />
              <span className="text-[10px] text-slate-700 font-bold">خرید امن</span>
            </div>
            <div className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center group hover:border-indigo-400 transition-colors shadow-2xs">
              <CreditCard size={22} className="text-purple-600 mb-1" />
              <span className="text-[10px] text-slate-700 font-bold">عضو شتاب</span>
            </div>
            <div className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center group hover:border-indigo-400 transition-colors shadow-2xs">
              <Award size={22} className="text-violet-600 mb-1" />
              <span className="text-[10px] text-slate-700 font-bold">نشان ملی</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-purple-200/80 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white text-[10px] font-bold uppercase tracking-widest relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-right">
          <p>© ۲۰۲۶ آکادمی چهل دروازه (۴۰gates.ir) - استفاده و به اشتراک گذاری مطالب آموزشی رایگان این سایت برای مقاصد غیرتجاری با ذکر منبع باعث افتخار و خوشحالی است.</p>
          <div className="flex gap-8 shrink-0">
            <button onClick={() => setCurrentPage('terms')} className="hover:underline text-white">شرایط خدمات</button>
            <button onClick={() => setCurrentPage('privacy')} className="hover:underline text-white">حریم خصوصی</button>
          </div>
        </div>
      </div>

    </footer>
  );
}
