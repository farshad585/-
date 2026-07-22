/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import SEO from '../components/SEO';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    showNotification('سپاس از تماس شما! پیام شما در سیستم تیکتینگ آکادمی ثبت شد. مربیان ما تا حداکثر ۲۴ ساعت آینده به ایمیل شما پاسخ خواهند داد.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <>
      <SEO 
        title="تماس با ما | پشتیبانی آکادمی" 
        description="پل‌های ارتباطی، شماره تماس، آدرس دفتر مرکزی تهران و فرم ارسال پیام مستقیم به مربیان و مدیران آکادمی ۴۰ دروازه."
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
            <span className="text-indigo-600 font-bold">تماس با ما</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">درگاه ارتباط و پشتیبانی</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            در کنار شما هستیم تا هیچ سوال یا ابهامی در روند سفارشات و تمرین‌های بیداری رویا باقی نماند.
          </p>
        </div>
      </section>

      {/* Main Grid: Details vs Contact Form */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        
        {/* Left Column: Coordinates & Map (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-indigo-100 shadow-xs space-y-6">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">اطلاعات تماس</h3>
            
            <ul className="space-y-4 text-xs">
              <li className="flex gap-3">
                <MapPin size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="block text-slate-900 font-bold">آدرس دفتر مرکزی:</span>
                  <span className="text-slate-600 leading-relaxed">ایران، تهران، خیابان ولیعصر، نرسیده به میدان ونک، برج نگار، طبقه ۱۵، واحد ۴۰</span>
                </div>
              </li>

              <li className="flex gap-3">
                <Phone size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="block text-slate-900 font-bold">تلفن پشتیبانی:</span>
                  <span className="text-slate-600 font-mono tracking-wider font-bold">۰۲۱-۸۸۸۸۴۰۴۰ (شنبه تا چهارشنبه ۹ الی ۱۷)</span>
                </div>
              </li>

              <li className="flex gap-3">
                <Mail size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="block text-slate-900 font-bold">ایمیل رسمی:</span>
                  <span className="text-indigo-600 font-mono font-bold">info@40gates.ir</span>
                </div>
              </li>

              <li className="flex gap-3">
                <Clock size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="block text-slate-900 font-bold">ساعات کار اداری:</span>
                  <span className="text-slate-600">همه روزه به غیر از ایام تعطیل از ۹:۰۰ صبح الی ۱۷:۰۰ عصر</span>
                </div>
              </li>
            </ul>

            {/* Social icons */}
            <div className="pt-4 border-t border-slate-100 flex gap-4 items-center">
              <span className="text-[10px] text-slate-500">پشتیبانی تلگرام و اینستاگرام:</span>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-600">
                <Instagram size={16} />
              </a>
              <a href="https://t.me" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-600">
                <Send size={16} className="-translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Artistic Custom Map representation */}
          <div className="aspect-video rounded-3xl overflow-hidden border border-indigo-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-1 relative flex items-center justify-center shadow-xs">
            {/* Subtle graphic layout resembling a circuit or grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
            
            {/* Elegant visual badge showing location pin */}
            <div className="relative text-center p-6 space-y-3 z-10">
              <MapPin size={32} className="text-indigo-600 mx-auto animate-bounce" />
              <div>
                <span className="block text-xs font-bold text-slate-900">مکان‌نمای آکادمی (ونک - برج نگار)</span>
                <span className="block text-[10px] text-slate-500 mt-1 font-mono">35.7584° N, 51.4099° E</span>
              </div>
              <a 
                href="https://neshan.org" 
                target="_blank" 
                rel="noreferrer"
                className="inline-block text-[10px] text-indigo-700 font-bold border border-indigo-200 rounded-full bg-white px-3.5 py-1 hover:bg-indigo-600 hover:text-white transition-colors shadow-xs"
              >
                مسیریابی در نقشه نشان / بلد
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Contact form (Span 7) */}
        <div className="lg:col-span-7">
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-indigo-100 shadow-xs space-y-6">
            <div className="space-y-1.5 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare size={16} className="text-indigo-600" />
                <span>ارسال پیام مستقیم به مربیان آکادمی</span>
              </h3>
              <p className="text-[11px] text-slate-500">تمامی تیکت‌ها با دقت بررسی شده و پاسخ آن به ایمیل شما ارسال می‌شود.</p>
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
                <span>ثبت نهایی پیام و ارسال به تیکتینگ</span>
              </button>

            </form>
          </div>
        </div>

      </section>
    </>
  );
}
