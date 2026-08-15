/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import SEO from '../components/SEO';
import { useApp } from '../context/AppContext';
import farshadImg from '../assets/images/farshad_author.jpg';
import { 
  Sparkles, 
  Award, 
  BookOpen, 
  Compass, 
  User, 
  ArrowLeft,
  ShieldCheck, 
  Heart,
  Lightbulb,
  Zap,
  Play,
  ListFilter
} from 'lucide-react';

export default function About() {
  const { setCurrentPage } = useApp();
  const [activeTab, setActiveTab] = useState('all');

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <SEO 
        title="درباره من | فرشاد میرشکاری - مخترع، نویسنده و مدرس رویابینی آگاهانه" 
        description="زندگینامه، دوران کودکی، معجزه شفای دست راست با اولین رویای شفاف، اختراعات و مسیر ۲۰ ساله پژوهش فرشاد میرشکاری در مجموعه چهل دروازه."
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-blue-50/80 border-b border-indigo-100 py-12 md:py-16 text-center max-w-7xl mx-auto rounded-b-3xl mb-8 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <div className="flex justify-center items-center gap-2 text-xs text-slate-500 font-mono">
            <span>صفحه اصلی</span>
            <span>/</span>
            <span className="text-[#5243B2] font-bold">درباره من</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">من فرشاد میرشکاری هستم</h1>
          <p className="text-sm md:text-base text-[#5243B2] font-extrabold leading-relaxed">
            مخترع، شاعر، نویسنده، پژوهشگر و مدرس دانش رویابینی آگاهانه
          </p>
          <div className="pt-2 max-w-xl mx-auto">
            <blockquote className="bg-white/90 backdrop-blur-xs border border-indigo-200 px-6 py-3 rounded-2xl text-xs md:text-sm text-slate-700 italic font-semibold shadow-2xs">
              «به خودتان ایمان داشته باشید. چون تنها کسی که در دنیای بی‌انتهای رویا همیشه کنار شماست، فقط خودتان هستید.»
            </blockquote>
          </div>
        </div>
      </section>

      {/* Quick Navigation / Table of Contents Bar */}
      <nav aria-label="فهرست بخش‌های درباره من" className="sticky top-20 z-20 max-w-5xl mx-auto px-4 mb-10">
        <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-[#5243B2] rounded-xl text-xs font-bold shrink-0">
            <ListFilter size={15} />
            <span>فهرست مطالب:</span>
          </div>
          
          <button
            onClick={() => scrollToSection('sec-intro')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'sec-intro' ? 'bg-[#5243B2] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            پیام خوش‌آمد
          </button>
          
          <button
            onClick={() => scrollToSection('sec-miracle')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'sec-miracle' ? 'bg-[#5243B2] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            معجزه رویای شفاف
          </button>

          <button
            onClick={() => scrollToSection('sec-identity')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'sec-identity' ? 'bg-[#5243B2] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            کودکی تا هویت
          </button>

          <button
            onClick={() => scrollToSection('sec-20years')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'sec-20years' ? 'bg-[#5243B2] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ۲۰ سال پژوهش
          </button>

          <button
            onClick={() => scrollToSection('sec-video')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'sec-video' ? 'bg-[#5243B2] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ویدیو اختراع
          </button>
        </div>
      </nav>

      {/* Main Intro & Welcome */}
      <section id="sec-intro" className="max-w-5xl mx-auto px-4 mb-12 scroll-mt-28">
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-indigo-100 shadow-2xs space-y-4 text-justify">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-1 text-[#5243B2] text-xs font-bold rounded-full">
            <Sparkles size={14} className="text-[#5243B2]" />
            <span>خوش آمدید به پایگاه چهل دروازه</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">سلام به شما عزیزان همراه</h2>
          <p className="text-sm md:text-base text-slate-700 leading-relaxed">
            در وبسایت چهل دروازه به آموزش مهارت‌های کنترل ذهن، دوستی با خویشتن، رویابینی شفاف و هر آن چیزی می‌پردازیم که برای یک زندگی سالم و آگاهانه نیاز است. با این آموزش‌ها، هر کسی می‌تواند صاحب بهترین‌ها باشد: بهترین زندگی، بهترین شغل، بهترین تفریحات و سالم‌ترین بدن.
          </p>
        </div>
      </section>

      {/* Author Biography Grid: Miracle of Childhood */}
      <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start mb-16">
        
        {/* Author Image / Portrait */}
        <div className="md:col-span-5 relative md:sticky md:top-36">
          <div className="aspect-[4/5] max-w-sm mx-auto md:max-w-none rounded-3xl overflow-hidden border-2 border-indigo-200 bg-white shadow-md p-1.5 relative">
            <img 
              src={farshadImg} 
              alt="فرشاد میرشکاری - نویسنده چهل دروازه" 
              className="w-full h-full object-cover rounded-2xl"
              loading="lazy"
            />
            <div className="absolute inset-x-6 bottom-6 p-4 bg-white/95 backdrop-blur-md border border-indigo-100 rounded-2xl text-right shadow-md">
              <span className="block text-sm font-bold text-slate-900 mb-0.5">فرشاد میرشکاری</span>
              <span className="block text-xs text-[#5243B2] font-bold">بنیان‌گذار چهل دروازه و نویسنده کتب رویابینی</span>
            </div>
          </div>
        </div>

        {/* Story Content Column */}
        <div className="md:col-span-7 space-y-8">
          
          {/* Story Part 1: Birth & The Miracle Dream */}
          <div id="sec-miracle" className="p-6 md:p-8 bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-white border border-indigo-100 rounded-3xl space-y-4 scroll-mt-28 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base md:text-lg border-b border-indigo-100 pb-3">
              <Zap size={20} className="text-amber-500 fill-amber-500" />
              <h2>تولد و معجزه اولین رویای شفاف</h2>
            </div>
            
            <div className="space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed text-justify">
              <p>
                من با <strong className="text-rose-700 font-black">دست راست فلج</strong> متولد شدم! و تا چهارسالگی با این مشکل کلنجار می‌رفتم. ظاهراً به دلایلی نامعلوم که پزشکان آن دوره از تشخیصش عاجز بودند، مغزم دوست نداشت پالس‌های حرکتی را به عضلات دست راست بفرستد و سیگنال‌های حسی را دریافت کند. گویا دستم به خوابی عمیق فرو رفته بود.
              </p>
              <p>
                تا اینکه اولین رویای شفافم اتفاق افتاد. رویایی که تنها حدود پنج دقیقه طول کشید. در آن رویای شفاف می‌توانستم برای اولین بار، هر دو دستم را حرکت دهم. نکته‌ی جالب این بود که هر دو دستم عیناً شبیه هم حرکت می‌کردند؛ انگار داشتم به تصویر دست چپم درون آینه نگاه می‌کردم. بااین‌حال، حس‌وحال فوق‌العاده‌ای داشت.
              </p>
              <p>
                من در آن رویای خاص همچنین پرواز را تجربه کردم. وقتی به پایین نگاه کردم، دیدم پاهایم روی سطح زمین قرار ندارند. در فاصله‌ی نزدیک به زمین، به حالت معلق در هوا ایستاده بودم. جالب‌تر اینکه کمترین مشکلی برای حفظ تعادل خود نداشتم و شبیه فردی که روی طناب راه می‌رود، ناخواسته به چپ و راست و عقب و جلو متمایل نمی‌شدم.
              </p>
              <div className="p-4 bg-white border border-indigo-200 rounded-2xl font-bold text-slate-900 text-xs md:text-sm shadow-2xs">
                ✨ <strong className="text-[#5243B2]">فردای آن روز:</strong> دستم خودبه‌خود روشن شد و حرکت کرد! در آن زمان، نه از ساختار و عملکرد پیچیده‌ی ذهن چیزی می‌دانستم و نه حتی اسم معجزه را شنیده بودم. در حال حاضر، من راست‌دست هستم.
              </div>
            </div>
          </div>

          {/* Story Part 2: Childhood to Youth & Finding Self */}
          <div id="sec-identity" className="p-6 md:p-8 bg-white border border-indigo-100 rounded-3xl space-y-4 shadow-2xs scroll-mt-28">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base md:text-lg border-b border-indigo-100 pb-3">
              <Compass size={20} className="text-[#5243B2]" />
              <h2>کودکی تا نوجوانی: سفر در میان هویت‌ها</h2>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed text-justify">
              <p className="font-extrabold text-[#5243B2] text-sm md:text-base">
                «آگاه شدن و آگاه ماندن در زندگی، یک انتخاب است، نه شانس!»
              </p>
              <p>
                نخستین اختراعم تنها از قطعه‌ای نِی، یک چوب بستنی و تکه‌ای کِش ساخته شده بود. بااین‌حال، می‌توانست به‌راحتی و با سرعتی معقول در مسیرهای ناهموار حرکت کند. همین اختراع ساده بود که جرقه اختراعات بعدی ازجمله <strong className="text-slate-900">ربات کروی دوزیست</strong> را در ذهن من روشن کرد.
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-medium">
                <li className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  🎨 <strong>در نه سالگی:</strong> شیفته نقاشی شدم و دوستانم مرا <span className="text-[#5243B2] font-bold">پیکاسو</span> صدا می‌زدند.
                </li>
                <li className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  ⚡ <strong>در ده سالگی:</strong> سراغ مدارات الکترونیک رفتم و اسمم شد <span className="text-[#5243B2] font-bold">انیشتین</span>.
                </li>
                <li className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  ♟️ <strong>ابتدای دانشگاه:</strong> عضو تیم شطرنج بودم و <span className="text-[#5243B2] font-bold">کاسپارف</span> نامیده می‌شدم.
                </li>
                <li className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  ☀️ <strong>سال آخر دانشگاه:</strong> موتور خورشیدی ساختم و نامم <span className="text-[#5243B2] font-bold">استرلینگ</span> شد.
                </li>
              </ul>

              <p className="pt-2">
                من با نام‌های بسیاری زندگی کرده‌ام و هر بار تصورم این بود که این همان نهایت است، ولی نبود! تلاش برای تصاحب اسم و شهرت دیگران، کاری پوچ و کودکانه است؛ نتیجه سردرگمی در میان هویت‌های بی‌شمار انسان.
              </p>
              <div className="font-extrabold text-slate-900 bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center text-xs md:text-sm">
                پس از سال‌ها، بالاخره توانستم خودم را پیدا کنم و تبدیل به «فرشاد» شوم.
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* 20 Years & 20,000 Subjective Years */}
      <section id="sec-20years" className="max-w-5xl mx-auto px-4 py-12 md:py-16 bg-slate-900 text-white rounded-3xl mb-16 relative overflow-hidden scroll-mt-28 shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs text-indigo-300 font-mono tracking-widest uppercase font-bold">20,000 SUBJECTIVE YEARS IN DREAMS</span>
          <h2 className="text-2xl md:text-3xl font-extrabold">بیست سال پژوهش و زیست در دنیای درون</h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed text-justify max-w-3xl mx-auto">
            سرعت انتقال پالس‌های الکتریکی درون مغز هزاران مرتبه بیشتر از اندام فیزیکی است. در طول دو دهه رویابینی حرفه‌ای، اگرچه در دنیای فیزیکی ۲۰ سال گذشته است، اما به لطف بسط زمان در لایه‌های عمیق ناخودآگاه، معادل با <strong className="text-amber-400 font-extrabold">بیست هزار سال زمان احساس‌شده</strong> را در دنیای رویاها تجربه کرده‌ام. تمام کتب چهل دروازه حاصل همین تجربیات واقعی و عمیق است.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-right">
            <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
              <BookOpen size={24} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-white">کتاب‌های مرجع چهل دروازه</h3>
              <p className="text-xs text-slate-300 leading-relaxed">تالیف دوره چهارجلدی کتب آموزشی کنترل خواب و بیداری ذهن.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
              <Lightbulb size={24} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-white">رمان‌های مفهومی</h3>
              <p className="text-xs text-slate-300 leading-relaxed">سه گانه «بوسه خداوند»، «شب‌شکن» و «شکارچی کابوس‌ها».</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
              <Heart size={24} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-white">همراهی مستقیم هنرجویان</h3>
              <p className="text-xs text-slate-300 leading-relaxed">ارائه خدمات مشاوره VIP و تحلیل روزانه رویاهای سالکان.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Presentation Section */}
      <section id="sec-video" className="max-w-4xl mx-auto px-4 mb-16 scroll-mt-28">
        <div className="bg-white border border-indigo-100 rounded-3xl p-5 md:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base md:text-lg border-b border-indigo-100 pb-3">
            <Play className="text-[#5243B2] fill-[#5243B2]" size={20} />
            <h2>ویدیو اختراعم «ربات کروی دوزیست»</h2>
          </div>
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
            <iframe
              src="https://www.aparat.com/video/video/embed/videohash/CDvKM/vt/frame"
              allowFullScreen={true}
              title="ویدیو اختراعم ربات کروی دوزیست"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Direct CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center pb-12">
        <div className="p-8 rounded-3xl bg-white border border-indigo-100 space-y-6 shadow-2xs">
          <h2 className="text-base md:text-lg font-extrabold text-slate-900">آیا آماده‌اید با من سفر به دنیای درون را آغاز کنید؟</h2>
          <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            می‌توانید مطالعه کتاب‌های مرا با نسخه PDF یا کتاب‌های چاپی نفیس همراه با پشتیبانی مستقیم آغاز کنید.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setCurrentPage('shop')}
              className="geom-button-primary text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              مشاهده فروشگاه
            </button>
            <button
              onClick={() => setCurrentPage('contact')}
              className="border border-indigo-200 hover:border-indigo-400 text-slate-800 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all bg-slate-50 cursor-pointer"
            >
              تماس و ارتباط مستقیم با من
            </button>
          </div>
        </div>
      </section>
    </>
  );
}


