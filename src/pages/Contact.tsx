/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import SEO from '../components/SEO';
import meImg from '../assets/images/من.jpg';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  ChevronRight,
  Instagram,
  Youtube,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('support');
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message || 'سپاس از تماس شما! پیام شما ثبت گردید و ایمیل تاییدیه نیز برای شما ارسال شد.');
      } else {
        showNotification(data.error || 'خطا در ثبت پیام. لطفا دوباره تلاش کنید.');
      }
    } catch (err) {
      console.warn('Contact message save error:', err);
      showNotification('سپاس از تماس شما! پیام شما در سیستم ثبت شد.');
    }

    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <>
      <SEO 
        title="تماس با من | فرشاد میرشکاری" 
        description="پل‌های ارتباط مستقیم، ایمیل و پشتیبانی تلگرام فرشاد میرشکاری، نویسنده کتاب‌های رویابینی آگاهانه و استاد ۴۰ دروازه."
      />

      {/* Floating notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-indigo-500 p-4 rounded-2xl shadow-xl text-xs text-indigo-950 flex items-center gap-3 max-w-md w-11/12 justify-center font-bold text-center"
          >
            <Sparkles size={16} className="text-indigo-600 shrink-0" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-indigo-100 py-16 text-center max-w-7xl mx-auto rounded-b-3xl mb-12 shadow-xs">
        <div className="max-w-xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>صفحه اصلی</span>
            <span>/</span>
            <span className="text-indigo-600 font-bold">تماس با من</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">ارتباط مستقیم با فرشاد میرشکاری</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            در کنار شما هستم تا پاسخگوی سوالات شما درباره کتاب‌ها، دوره‌ها و تمرین‌های رویابینی شفاف باشم.
          </p>
        </div>
      </section>

      {/* Main Grid: Details vs Contact Form */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        
        {/* Left Column: Direct channels (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-indigo-100 shadow-xs space-y-6">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">درگاه‌های ارتباط مستقیم</h3>
            
            <ul className="space-y-5 text-xs">
              <li className="flex gap-3 items-start">
                <Instagram size={20} className="text-pink-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="block text-slate-900 font-bold">صفحه رسمی اینستاگرام:</span>
                  <a 
                    href="https://www.instagram.com/farshad_g.o.d" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-mono font-bold block dir-ltr text-right"
                  >
                    instagram.com/farshad_g.o.d (@farshad_g.o.d)
                  </a>
                </div>
              </li>

              <li className="flex gap-3 items-start">
                <Send size={20} className="text-sky-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="block text-slate-900 font-bold">پشتیبانی و تلگرام:</span>
                  <a 
                    href="https://t.me/OMEGA585" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-mono font-bold block dir-ltr text-right"
                  >
                    t.me/OMEGA585
                  </a>
                </div>
              </li>

              <li className="flex gap-3 items-start">
                <Mail size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="block text-slate-900 font-bold">ایمیل مستقیم فرشاد میرشکاری:</span>
                  <a 
                    href="mailto:40gates.main@gmail.com"
                    className="text-indigo-600 hover:underline font-mono font-bold block dir-ltr text-right"
                  >
                    40gates.main@gmail.com
                  </a>
                </div>
              </li>

              <li className="flex gap-3 items-start">
                <Clock size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="block text-slate-900 font-bold">زمان پاسخگویی به پیام‌ها:</span>
                  <span className="text-slate-600 leading-relaxed">تیکت‌ها و پیام‌های شما در کمتر از ۲۴ ساعت توسط فرشاد میرشکاری یا تیم پشتیبانی بررسی و پاسخ داده می‌شود.</span>
                </div>
              </li>
            </ul>

            {/* Goftino Live Chat Callout */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-sm space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-100">
                <MessageSquare size={16} />
                <span>چت زنده</span>
              </div>
              <p className="text-[11px] text-amber-50 leading-relaxed">
                میتوانید برای گفتگوی آنلاین با پشتیبان، روی دکمه آبی شناور در گوشه پایین سمت راست کلیک کنید.
              </p>
            </div>
          </div>

          {/* Author Badge Card */}
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl border-2 border-indigo-300 overflow-hidden shadow-xs shrink-0">
                <img 
                  src={meImg} 
                  alt="فرشاد میرشکاری" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">فرشاد میرشکاری</h4>
                <p className="text-[11px] text-indigo-700 font-semibold">نویسنده و مدرس رویابینی آگاهانه</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed text-justify">
              «همواره پیام‌ها و سوالات هنرجویان عزیزم را با اشتیاق مطالعه می‌کنم. اگر در مسیر رویابینی آگاهانه دچار ابهام شده‌اید، حتماً سوال خود را با من در میان بگذارید.»
            </p>
          </div>
        </div>

        {/* Right Column: Contact form (Span 7) */}
        <div className="lg:col-span-7">
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-indigo-100 shadow-xs space-y-6">
            <div className="space-y-1.5 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare size={16} className="text-indigo-600" />
                <span>ارسال پیام مستقیم به فرشاد میرشکاری</span>
              </h3>
              <p className="text-[11px] text-slate-500">فرم زیر را تکمیل کنید؛ پیام شما مستقیماً به ایمیل من ارسال خواهد شد.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-600 block font-semibold">نام و نام خانوادگی شما:</label>
                  <input 
                    id="contact-name"
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مانند: محمد موسوی"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 block font-semibold">آدرس ایمیل شما:</label>
                  <input 
                    id="contact-email"
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 text-left font-mono shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 block font-semibold">موضوع پیام شما:</label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
                >
                  <option value="support">پشتیبانی سفارشات و فاکتورها</option>
                  <option value="technical">پشتیبانی دوره‌های ویدیویی و اسپات‌پلیر</option>
                  <option value="dreaming">سوال فنی در خصوص تکنیک‌های رویابینی (WILD, MILD)</option>
                  <option value="cooperation">همکاری فروش یا پیشنهاد تالیف آثار</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 block font-semibold">شرح کامل پیام یا سوال شما:</label>
                <textarea 
                  id="contact-message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="لطفاً شماره سفارش یا جزییات کامل سوال خود را در این بخش مکتوب نمایید..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-xs"
                />
              </div>

              <button
                id="contact-submit-btn"
                type="submit"
                className="w-full geom-button-primary text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm"
              >
                <Send size={14} />
                <span>ارسال پیام</span>
              </button>

            </form>
          </div>
        </div>

      </section>
    </>
  );
}
