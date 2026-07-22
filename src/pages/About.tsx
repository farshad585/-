/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SEO from '../components/SEO';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Award, 
  BookOpen, 
  Compass, 
  Users, 
  History,
  ArrowLeft,
  Eye, 
  ShieldCheck, 
  Heart 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  const { setCurrentPage } = useApp();

  const timeline = [
    { year: '۱۳۹۷', title: 'آغاز راه و ترجمه مقالات', desc: 'تأسیس گروه مطالعاتی ۴۰ دروازه و ترجمه آزمایشگاهی مقالات استفان لابرگ و یوگای رویای تبتی برای اولین بار در ایران.' },
    { year: '۱۳۹۹', title: 'انتشار کتاب مرجع آگاهی', desc: 'چاپ فیزیکی کتابچه پایه رویابینی شفاف و توزیع آن در بستر وبلاگ که مورد استقبال هزاران علاقه‌مند قرار گرفت.' },
    { year: '۱۴۰۱', title: 'برگزاری اولین دوره جامع ویدیویی', desc: 'تولید و انتشار دوره جامع ویدیویی با مربیگری مستقیم اساتید و شکل‌گیری جامعه کاربری بزرگ هنرجویان فعال.' },
    { year: '۱۴۰۳', title: 'دپارتمان تحقیقات سخت‌افزار', desc: 'راه‌اندازی واحد فنی عینک هوشمند نوری (REM Mask) با شبیه‌سازهای آزمایشگاهی برای تحریک و بیداری آگاهی در خواب.' },
    { year: '۱۴۰۵', title: 'آکادمی نوین ۴۰ دروازه', desc: 'راه‌اندازی پرتال پیشرفته آموزش تعاملی، پادکست‌های فرکانسی جدید و بسته‌بندی نفیس کارت‌های تست واقعیت.' }
  ];

  return (
    <>
      <SEO 
        title="درباره ما | داستان ۴۰ دروازه آگاهی" 
        description="داستان شکل‌گیری آکادمی ۴۰ دروازه، فلسفه نام‌گذاری، اهداف خودشناسی ما و معرفی مربیان و مروجان آموزش علمی رویابینی شفاف در ایران."
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-indigo-100 py-16 text-center max-w-7xl mx-auto rounded-b-3xl mb-12 shadow-xs">
        <div className="max-w-xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>صفحه اصلی</span>
            <span>/</span>
            <span className="text-indigo-600 font-bold">درباره ما</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">داستان آکادمی ۴۰ دروازه</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            تلاش برای پیوند زدن یافته‌های نوین علم اعصاب خواب با آموزه‌های کهن خودشناسی باطنی شرق و غرب.
          </p>
        </div>
      </section>

      {/* Core brand philosophy block */}
      <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1 text-indigo-900 text-xs font-semibold rounded-full">
            <Eye size={12} className="text-indigo-600" />
            <span>چرا «دروازه چهلم»؟</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-normal">
            فلسفه نام‌گذاری و رسالت بیداری ذهن
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed text-justify">
            در مکاتب عرفانی باستانی و معابد خودشناسی مشرق‌زمین، روان انسان برای رسیدن به بیداری مطلق، از دروازه‌ها و مراحل متعددی عبور می‌کند. دروازه چهلم یا همان «۴۰ دروازه» نمادی است از رسیدن به مرکزیت حقیقت ذهن و ضمیر ناخودآگاه؛ جایی که بیداری فیزیکی و رویای شبانه به یک پایداری و یکپارچگی دست پیدا می‌کنند.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed text-justify">
            ما بر این باوریم که خواب‌ها بی‌معنی و عبث نیستند. خواب یک‌سوم کل زندگی ما را تشکیل می‌دهد و بستر بی‌نظیری برای برطرف کردن ترس‌ها، افزایش خلاقیت هنری، خودشناسی عمیق و تمرین پروازهای متافیزیکی روح است. رسالت ما در ۴۰ دروازه، ارائه آموزش‌های علمی، عملی و عاری از هرگونه خرافات به زبان ساده برای فارسی‌زبانان سراسر جهان است.
          </p>
        </div>

        <div className="relative aspect-square rounded-3xl overflow-hidden border border-indigo-100 p-1 bg-white shadow-md">
          {/* Inner Image simulating deep cosmic dream state */}
          <img 
            src="https://images.unsplash.com/photo-1518331647614-7a1f04db3437?auto=format&fit=crop&q=80&w=600" 
            alt="عرفان رویابینی" 
            className="w-full h-full object-cover rounded-2xl"
            referrerPolicy="no-referrer"
          />
          {/* subtle indigo card overlay */}
          <div className="absolute inset-x-6 bottom-6 p-5 bg-white/95 backdrop-blur-md border border-indigo-100 rounded-2xl text-right shadow-lg">
            <span className="block text-xs font-bold text-slate-900 mb-1">«رویای تو، حقیقت توست»</span>
            <span className="block text-[10px] text-indigo-600 font-bold">آموزشگاه علمی رویابینی شفّاف</span>
          </div>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16 bg-slate-50/50 border-y border-slate-100 mb-20">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">سه رکن اساسی فعالیت‌های آکادمی</h2>
          <p className="text-xs text-slate-500">پایبندی به موازین اخلاقی، علمی و تجربی</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 bg-white border border-indigo-100 rounded-3xl text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100">
              <Compass size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">رویکرد علمی و آزمایشگاهی</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              تمامی ترفندها، متدها و تمرینات ارائه شده در کتاب‌ها و دوره‌ها، بر پایه‌یافته‌های مستند دانشگاهی و آزمایشگاه‌های خواب در سراسر جهان تدوین شده‌اند.
            </p>
          </div>

          <div className="p-6 bg-white border border-indigo-100 rounded-3xl text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">حمایت و پشتیبانی سالک</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              خواب بیدار نیاز به تمرین و تحلیل روزانه دارد. به همین دلیل ما هنرجویانمان را رها نکرده و با پشتیبانی اختصاصی در کنارتان هستیم تا موانع ذهنی برطرف شوند.
            </p>
          </div>

          <div className="p-6 bg-white border border-indigo-100 rounded-3xl text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100">
              <Heart size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">بزرگ‌ترین جامعه کاربری</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              با افتخار توانسته‌ایم فضایی صمیمی و امن ایجاد کنیم تا بیش از ۵۰ هزار رویابین فعال بتوانند تجارب پرواز و تحلیل نمادهای خود را به راحتی به اشتراک بگذارند.
            </p>
          </div>

        </div>
      </section>

      {/* Timeline Section */}
      <section className="max-w-3xl mx-auto px-4 mb-20">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">مسیر تاریخچه و توسعه آکادمی</h2>
          <p className="text-xs text-slate-500">برگی از تقویم پیشرفت و ارتقای متدها</p>
        </div>

        <div className="border-r-2 border-indigo-200 pr-6 mr-4 space-y-10 relative">
          {timeline.map((item, index) => (
            <div key={index} className="relative space-y-1.5">
              {/* Point indicator on the right vertical bar */}
              <div className="absolute top-1 -right-[31px] w-4.5 h-4.5 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shadow-xs">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
              </div>
              <span className="inline-block text-xs font-bold text-indigo-700 font-mono bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                سال {item.year}
              </span>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-4xl mx-auto px-4 text-center pb-12">
        <div className="p-8 rounded-3xl bg-white border border-indigo-100 space-y-6 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900">آیا آماده ورود به اولین دروازه آگاهی هستید؟</h3>
          <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
            از کتب مرجع چاپی و پکیج‌های الکترونیکی شروع کنید، خواب‌هایتان را ثبت کنید و به جمع سالکان خواب بیدار بپیوندید.
          </p>
          <button
            onClick={() => setCurrentPage('shop')}
            className="geom-button-primary text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-all shadow-md"
          >
            مشاهده کتابخانه تخصصی ۴۰ دروازه
          </button>
        </div>
      </section>
    </>
  );
}
