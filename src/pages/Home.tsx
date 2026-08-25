/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';
import TestimonialsSection from '../components/TestimonialsSection';
import SEO from '../components/SEO';
import StarfieldBeams from '../components/StarfieldBeams';
import ShimmerButton from '../components/ShimmerButton';
import NumberTicker from '../components/NumberTicker';
import TextBlurReveal from '../components/TextBlurReveal';
import { 
  BookOpen, 
  Headphones, 
  Tv, 
  Sparkles, 
  Compass, 
  ArrowLeft,
  Quote,
  ShieldCheck,
  Zap,
  RotateCcw,
  Crown,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

import desktopHeroImg from '../assets/images/desktop.jpg';
import phoneHeroImg from '../assets/images/phone1.jpg';

export default function Home() {
  const { setCurrentPage, setSelectedProductId, products } = useApp();

  const allProds = products || PRODUCTS;
  const bestSellers = allProds.filter(p => p.bestSeller).slice(0, 4);
  const newArrivals = allProds.filter(p => p.newArrival).slice(0, 4);

  const categories = [
    {
      id: 'books',
      title: 'کتاب‌های چاپی و PDF',
      description: 'کتب مرجع و چاپی بر روی کاغذ سبک سوئدی با کیفیت چاپ ممتاز.',
      icon: BookOpen,
      count: '۱۳ محصول',
      color: 'from-amber-600/20 to-amber-900/40 border-amber-500/20'
    },
    {
      id: 'audiobooks',
      title: 'کتاب‌های صوتی استودیویی',
      description: 'فایل‌های صوتی عمیق با صدای استاد و امواج فرکانسی آلفا.',
      icon: Headphones,
      count: '۵ محصول',
      color: 'from-purple-600/20 to-purple-900/40 border-purple-500/20'
    },
    {
      id: 'courses',
      title: 'دوره‌های صوتی و پکیج‌های VIP',
      description: 'برنامه‌های آموزشی جامع با پشتیبانی اختصاصی مستقیم استاد فرشاد میرشکاری.',
      icon: Tv,
      count: '۵ محصول',
      color: 'from-emerald-600/20 to-emerald-900/40 border-emerald-500/20'
    },
  ];

  return (
    <>
      <SEO 
        title="صفحه اصلی | چهل دروازه آگاهی" 
        description="مرجع تخصصی آموزش علمی و معنوی رویابینی شفاف، کنترل رویا، غلبه بر فلج خواب و بیداری ناخودآگاه. خرید کتاب، فایل صوتی و دوره‌های تخصصی خواب شفاف."
      />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-[75vh] flex flex-col justify-center py-6 md:py-16 px-3 sm:px-4 overflow-hidden max-w-7xl mx-auto rounded-3xl border border-[#EEEAF9] mt-3 bg-gradient-to-b from-white via-[#EEEAF9]/30 to-[#F7F5FC] shadow-sm text-slate-900">
        {/* Interactive Starfield & Cosmic Beams Effect */}
        <StarfieldBeams particleCount={70} />

        {/* Soft Ambient Radial Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#EEEAF9] rounded-full blur-3xl opacity-70" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#EAF2FA] rounded-full blur-3xl opacity-80" />
        </div>
        
        {/* ==================== DESKTOP HERO LAYOUT ==================== */}
        <div className="hidden md:block relative z-10">
          {/* Desktop Raw Hero Layer (Gates on Left and Right, Bright Center) */}
          <div className="absolute inset-0 -m-16 z-0 overflow-hidden pointer-events-none">
            <img 
              src={desktopHeroImg} 
              alt="چهل دروازه آگاهی - نسخه دسکتاپ" 
              className="w-full h-full object-cover object-center opacity-90"
              loading="eager"
              width={1672}
              height={941}
            />
            {/* Gentle soft gradient overlays for center light contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#F7F5FC]/90 via-white/30 to-white/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/50 to-white/30" />
          </div>

          {/* Hero Content Desktop */}
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-7 my-4">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="h-[1px] w-8 bg-[#7062C4]/40"></span>
                <span className="text-[#5243B2] text-xs uppercase tracking-[0.2em] font-semibold font-mono">مرجع تخصصی رویابینی آگاهانه</span>
                <span className="h-[1px] w-8 bg-[#7062C4]/40"></span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                <TextBlurReveal 
                  text="تبدیل شدن به آفریدگار رویاها،" 
                  delay={0.1}
                  className="block mb-2 text-slate-900 font-extrabold"
                  wordClassName="text-slate-900 font-extrabold"
                />
                <span className="inline-flex items-center justify-center gap-2 mt-1">
                  <TextBlurReveal 
                    text="دروازه چهلم" 
                    delay={0.9}
                    className="inline-flex"
                    wordClassName="text-[#5243B2] font-black"
                  />
                  <TextBlurReveal 
                    text="خودشناسی" 
                    delay={1.3}
                    className="inline-flex"
                    wordClassName="text-slate-900 font-extrabold"
                  />
                </span>
              </h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base text-slate-700 leading-relaxed max-w-2xl mx-auto bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#EEEAF9] shadow-xs text-center"
            >
              <span className="font-bold text-[#5243B2] block mb-1 text-sm">
                💬 گپ دوستانه من،{' '}
                <button 
                  onClick={() => setCurrentPage('about')}
                  className="no-underline text-[#5243B2] hover:text-[#42349A] transition-colors font-extrabold cursor-pointer underline underline-offset-4"
                >
                  فرشاد میرشکاری
                </button>
                {' '}با شما همراهان عزیز:
              </span>
              حقیقت اینه که ما هر شب رویا می‌بینیم؛ چه دلمون بخواد، چه نخواد... پس چه بهتر که به‌جای سرگردان بودن در خواب‌های خسته‌کننده، آستین همت رو بالا بزنیم و از دنیای رویامون یه بهشت شخصی بسازیم! 💖
            </motion.p>

            {/* Desktop Hero Action Buttons Stack */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center gap-3.5 pt-3 max-w-2xl mx-auto w-full"
            >
              {/* Primary VIP Consultation Prestige Hero Bar */}
              <button
                id="hero-vip-cta-desktop"
                onClick={() => setCurrentPage('vip')}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-[#1B1145] via-[#2F1F73] to-[#4A38A5] hover:from-[#150D38] hover:via-[#281966] hover:to-[#3E2E91] text-white font-black text-sm px-5 py-3.5 rounded-2xl transition-all duration-300 shadow-md shadow-[#1B1145]/25 hover:shadow-xl hover:shadow-amber-500/15 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between cursor-pointer border border-amber-400/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 shadow-2xs">
                    <Crown size={17} className="animate-pulse" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">مشاوره VIP استاد</span>
                      <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/30">
                        همراهی اختصاصی
                      </span>
                    </div>
                    <span className="block text-[11px] font-medium text-slate-300 mt-0.5">
                      ارتباط مستقیم با فرشاد میرشکاری در تلگرام و تحلیل اختصاصی رویاها
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-400/10 px-3.5 py-2 rounded-xl border border-amber-400/25 group-hover:bg-amber-400/20 transition-colors shrink-0">
                  <span>مشاهده پلن‌ها</span>
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Bottom Twin Action Buttons */}
              <div className="grid grid-cols-2 gap-3.5 w-full">
                <button
                  id="hero-shop-cta"
                  onClick={() => setCurrentPage('shop')}
                  className="group bg-[#5243B2] hover:bg-[#43359E] active:bg-[#382B8A] text-white font-extrabold text-xs sm:text-sm py-3.5 px-5 rounded-2xl transition-all duration-300 shadow-md shadow-[#5243B2]/20 hover:shadow-lg hover:shadow-[#5243B2]/30 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer border border-[#6F60CE]"
                >
                  <Sparkles size={17} className="text-amber-200 group-hover:rotate-12 transition-transform" />
                  <span>ورود به فروشگاه محصولات</span>
                  <ArrowLeft size={16} className="text-purple-200 group-hover:-translate-x-1 transition-transform" />
                </button>

                <button
                  id="hero-about-cta"
                  onClick={() => setCurrentPage('blog')}
                  className="group bg-white hover:bg-[#FAF8FF] text-[#5243B2] border-2 border-[#DDD6FE] hover:border-[#5243B2] font-extrabold text-xs sm:text-sm py-3.5 px-5 rounded-2xl transition-all duration-300 shadow-2xs hover:shadow-md hover:shadow-[#5243B2]/10 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <BookOpen size={17} className="text-[#5243B2] group-hover:scale-110 transition-transform" />
                  <span>مطالعه مقالات آموزشی</span>
                  <ArrowLeft size={16} className="text-[#7062C4] group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Quick Stats Grid with Interactive Dynamic Number Ticker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-[#EEEAF9] text-center"
            >
              <div className="space-y-1 p-2 rounded-xl bg-white/70 backdrop-blur-xs">
                <span className="block text-2xl font-bold font-display text-[#5243B2]">
                  +<NumberTicker value={50000} delay={0.2} />
                </span>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">هنرجوی خواب شفاف</span>
              </div>
              <div className="space-y-1 p-2 rounded-xl bg-white/70 backdrop-blur-xs">
                <span className="block text-2xl font-bold font-display text-[#5243B2]">
                  +<NumberTicker value={20} delay={0.3} />
                </span>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">کتاب، پادکست و پکیج</span>
              </div>
              <div className="space-y-1 p-2 rounded-xl bg-white/70 backdrop-blur-xs">
                <span className="block text-2xl font-bold font-display text-[#5243B2]">
                  <NumberTicker value={3} delay={0.4} /> ماه
                </span>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">پشتیبانی اختصاصی</span>
              </div>
              <div className="space-y-1 p-2 rounded-xl bg-white/70 backdrop-blur-xs">
                <span className="block text-2xl font-bold font-display text-[#5243B2]">
                  <NumberTicker value={100} delay={0.5} />٪
                </span>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">تضمین کارایی تکنیک‌ها</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ==================== MOBILE HERO LAYOUT ==================== */}
        <div className="block md:hidden relative z-10 space-y-4">
          {/* Top Hero Artwork + Left Title Area */}
          <div className="relative min-h-[320px] sm:min-h-[360px] rounded-2xl overflow-hidden shadow-2xs border border-[#EEEAF9]">
            {/* Background phone image (Girl & Gate on Right) */}
            <img 
              src={phoneHeroImg} 
              alt="چهل دروازه آگاهی - نسخه موبایل" 
              className="absolute inset-0 w-full h-full object-cover object-right opacity-95"
              loading="eager"
              width={941}
              height={1672}
            />
            {/* Gradient overlay for contrast on left side */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/50 to-white/95" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F7F5FC]/80 via-transparent to-transparent" />

            {/* Text Content strictly placed on the LEFT side of the screen (Left half) */}
            <div className="absolute left-3 xs:left-3.5 top-0 bottom-0 w-[39%] sm:w-[36%] max-w-[200px] flex flex-col justify-center text-right space-y-2.5 z-10" dir="rtl">
              {/* Eyebrow - Single Line with dashes on both sides */}
              <div className="flex items-center gap-0.5 justify-start">
                <span className="text-[#5243B2] text-[10px] xs:text-[11px] sm:text-xs font-bold">—</span>
                <span className="text-[#5243B2] text-[10px] xs:text-[11px] sm:text-xs font-extrabold whitespace-nowrap">
                  مرجع تخصصی رویابینی آگاهانه
                </span>
                <span className="text-[#5243B2] text-[10px] xs:text-[11px] sm:text-xs font-bold">—</span>
              </div>

              {/* Main Heading - Larger original size, strictly on the left side, 4 lines */}
              <h1 className="text-xl xs:text-[22px] sm:text-[26px] font-black text-slate-900 leading-[1.25] tracking-tight text-right flex flex-col items-start">
                <span className="block whitespace-nowrap">
                  <TextBlurReveal 
                    text="تبدیل شدن به" 
                    delay={0.1}
                    className="justify-start whitespace-nowrap"
                    wordClassName="font-black text-slate-900"
                  />
                </span>
                <span className="block whitespace-nowrap">
                  <TextBlurReveal 
                    text="آفریدگار رویاها،" 
                    delay={0.4}
                    className="justify-start whitespace-nowrap"
                    wordClassName="font-black text-slate-900"
                  />
                </span>
                <span className="block whitespace-nowrap">
                  <TextBlurReveal 
                    text="دروازه چهلم" 
                    delay={0.7}
                    className="justify-start whitespace-nowrap"
                    wordClassName="text-[#5243B2] font-black"
                  />
                </span>
                <span className="block whitespace-nowrap">
                  <TextBlurReveal 
                    text="خودشناسی" 
                    delay={1.0}
                    className="justify-start whitespace-nowrap"
                    wordClassName="font-black text-slate-900"
                  />
                </span>
              </h1>
            </div>
          </div>

          {/* Friendly Chat Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-10 bg-white/90 backdrop-blur-md rounded-2xl border border-[#EEEAF9] px-2.5 py-3 sm:p-4 text-center shadow-xs space-y-2"
          >
            <div className="flex items-center justify-center gap-1.5 text-[#5243B2] font-extrabold text-[11px] xs:text-xs sm:text-sm">
              <span className="text-xs sm:text-sm">💬</span>
              <span>گپ دوستانه من،</span>
              <button 
                onClick={() => setCurrentPage('about')}
                className="no-underline text-[#5243B2] font-black underline underline-offset-4 cursor-pointer"
              >
                فرشاد میرشکاری
              </button>
              <span>با شما همراهان عزیز:</span>
            </div>
            
            <p className="text-[clamp(9.5px,2.65vw,12px)] tracking-tight text-slate-700 leading-[1.7] font-medium text-center">
              <span className="block whitespace-nowrap">حقیقت اینه که ما هر شب رویا می‌بینیم؛ چه دلمون بخواد، چه نخواد...</span>
              <span className="block whitespace-nowrap">پس چه بهتر که به‌جای سرگردان بودن در خواب‌های خسته‌کننده،</span>
              <span className="block whitespace-nowrap">آستین همت رو بالا بزنیم و از دنیای رویامون یه بهشت شخصی بسازیم! 💖</span>
            </p>
          </motion.div>

          {/* Full Width Buttons Stack with Unified Modern Aesthetic */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative z-10 space-y-2.5 pt-1"
          >
            {/* 1. VIP Consultation Prestige Hero Bar */}
            <button
              id="hero-vip-cta-mobile"
              onClick={() => setCurrentPage('vip')}
              className="group w-full bg-gradient-to-r from-[#1B1145] via-[#2F1F73] to-[#4A38A5] text-white font-black text-xs sm:text-sm py-3 px-3.5 rounded-2xl flex items-center justify-between shadow-md shadow-[#1B1145]/20 active:scale-[0.98] transition-all cursor-pointer border border-amber-400/40"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Crown size={15} className="animate-pulse" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-white text-xs sm:text-sm">مشاوره VIP استاد</span>
                    <span className="bg-amber-400/20 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-amber-400/30">
                      اختصاصی
                    </span>
                  </div>
                  <span className="block text-[10px] text-slate-300 font-normal mt-0.5">همراهی مستقیم فرشاد میرشکاری</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2.5 py-1.5 rounded-xl border border-amber-400/25">
                <span>پلن‌ها</span>
                <ArrowLeft size={13} />
              </div>
            </button>

            {/* 2. Shop Primary Button */}
            <button
              id="hero-shop-cta-mobile"
              onClick={() => setCurrentPage('shop')}
              className="group w-full bg-[#5243B2] active:bg-[#43359E] text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#5243B2]/20 active:scale-[0.98] transition-all cursor-pointer border border-[#6F60CE]"
            >
              <Sparkles size={16} className="text-amber-200" />
              <span>ورود به فروشگاه محصولات</span>
              <ArrowLeft size={15} className="text-purple-200" />
            </button>

            {/* 3. Blog Secondary Button */}
            <button
              id="hero-about-cta-mobile"
              onClick={() => setCurrentPage('blog')}
              className="group w-full bg-white active:bg-[#FAF8FF] text-[#5243B2] border-2 border-[#DDD6FE] active:border-[#5243B2] flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold py-3 px-4 rounded-2xl shadow-2xs transition-all cursor-pointer"
            >
              <BookOpen size={16} className="text-[#5243B2]" />
              <span>مطالعه مقالات آموزشی</span>
              <ArrowLeft size={15} className="text-[#7062C4]" />
            </button>
          </motion.div>

          {/* Mobile Quick Stats Grid with Interactive Dynamic Number Ticker */}
          <div className="relative z-10 grid grid-cols-2 gap-2 pt-3 border-t border-[#EEEAF9] text-center">
            <div className="p-2 rounded-xl bg-white/80 backdrop-blur-xs">
              <span className="block text-base font-bold font-display text-[#5243B2]">
                +<NumberTicker value={50000} delay={0.2} />
              </span>
              <span className="text-[10px] font-bold text-slate-600">هنرجوی خواب شفاف</span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 backdrop-blur-xs">
              <span className="block text-base font-bold font-display text-[#5243B2]">
                +<NumberTicker value={20} delay={0.3} />
              </span>
              <span className="text-[10px] font-bold text-slate-600">کتاب، پادکست و پکیج</span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 backdrop-blur-xs">
              <span className="block text-base font-bold font-display text-[#5243B2]">
                <NumberTicker value={3} delay={0.4} /> ماه
              </span>
              <span className="text-[10px] font-bold text-slate-600">پشتیبانی اختصاصی</span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 backdrop-blur-xs">
              <span className="block text-base font-bold font-display text-[#5243B2]">
                <NumberTicker value={100} delay={0.5} />٪
              </span>
              <span className="text-[10px] font-bold text-slate-600">تضمین کارایی تکنیک‌ها</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Bar */}
      <section className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#EEEAF9] shadow-xs hover:border-[#7062C4] transition-all duration-300">
          <ShieldCheck size={28} className="text-[#5243B2] flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">پرداخت امن و گواهی SSL</h4>
            <p className="text-xs text-slate-600">پرداخت مطمئن بانکی با تمامی کارت‌های شتاب ایران.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#EEEAF9] shadow-xs hover:border-[#7062C4] transition-all duration-300">
          <Zap size={28} className="text-[#7062C4] flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">دانلود آنی و ارسال پستی پیشتاز</h4>
            <p className="text-xs text-slate-600">تحویل دیجیتالی بلافاصله پس از پرداخت و ارسال سریع فیزیکی.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#EEEAF9] shadow-xs hover:border-[#7062C4] transition-all duration-300">
          <RotateCcw size={28} className="text-[#5243B2] flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">ضمانت رضایت هنرجویان</h4>
            <p className="text-xs text-slate-600">پشتیبانی کامل در تلگرام برای پاسخگویی به روند تمرینات.</p>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="h-[1px] w-8 bg-[#7062C4]"></span>
            <span className="text-[#5243B2] text-xs font-bold tracking-wider font-mono">CATEGORIES</span>
            <span className="h-[1px] w-8 bg-[#7062C4]"></span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">دسته‌بندی‌های اصلی محصولات آگاهی</h2>
          <p className="text-xs md:text-sm text-slate-600">کلید مورد نیاز خود را برای بیداری ناخودآگاه و رویابینی آگاهانه انتخاب کنید</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => setCurrentPage('shop')}
                className="p-8 rounded-2xl border border-[#EEEAF9] bg-white group cursor-pointer hover:border-[#7062C4] hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[220px] relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="p-3 bg-[#EEEAF9] rounded-xl border border-[#D1C7F0] w-fit text-[#5243B2] group-hover:bg-[#5243B2] group-hover:text-white transition-colors">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{cat.title}</h3>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{cat.description}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#EEEAF9] mt-4">
                  <span className="text-[11px] font-mono font-bold text-[#5243B2] tracking-wider uppercase">{cat.count}</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-900 group-hover:text-[#5243B2] transition-colors font-bold">
                    <span>ورود به بخش</span>
                    <ArrowLeft size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured / Best Sellers Showcase */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-12 bg-white border-y border-[#EEEAF9] rounded-3xl shadow-2xs">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-[#EEEAF9] pb-6">
          <div className="space-y-2 text-right">
            <span className="text-xs text-[#5243B2] font-mono tracking-widest uppercase font-bold">EXPLORE BEST SELLERS</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">پرفروش‌ترین آثار آکادمی</h2>
            <p className="text-xs md:text-sm text-slate-600">محصولاتی که بیشترین اثربخشی را در رویابینی سریع هنرجویان داشته‌اند.</p>
          </div>
          <button
            onClick={() => setCurrentPage('shop')}
            className="text-xs md:text-sm text-[#5243B2] hover:text-[#42349A] transition-colors flex items-center gap-1.5 border-b border-[#D1C7F0] pb-1 font-bold cursor-pointer"
          >
            <span>مشاهده همه محصولات</span>
            <ArrowLeft size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {bestSellers.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* VIP Consultation Exclusive Service Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-8 md:p-14 overflow-hidden shadow-xl border border-indigo-500/30">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#5243B2]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5 text-right">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400/20 to-purple-400/20 border border-amber-400/40 rounded-full px-4 py-1.5 text-xs font-bold text-amber-300 shadow-xs">
                <Crown size={15} className="text-amber-400 animate-pulse" />
                <span>خدمت اختصاصی و ممتاز</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
                  مشاوره VIP استاد فرشاد میرشکاری
                </h2>
                <p className="text-sm md:text-base font-medium text-purple-200">
                  همراهی اختصاصی با فرشاد میرشکاری در مسیر رویابینی آگاهانه
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>تحلیل روزانه تمرینات و رویاهای شما</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>ارائه راهکارهای کلیدی و اصلاح متد تمرینی</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>پاسخگویی اختصاصی به تمامی پرسش‌ها در تلگرام</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>پلن‌های ۳۰، ۶۰ و ۹۰ روزه اختصاصی</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center gap-4">
              <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center space-y-2">
                <span className="text-xs text-purple-200 block">شروع پلن‌ها از:</span>
                <div className="text-2xl md:text-3xl font-black text-amber-300">
                  ۸,۹۰۰,۰۰۰ <span className="text-xs text-white">تومان</span>
                </div>
                <span className="text-[11px] text-slate-300 block">ظرفیت محدود ماه جاری</span>
              </div>

              <ShimmerButton
                id="home-vip-section-cta"
                onClick={() => setCurrentPage('vip')}
                className="w-full py-4 text-xs md:text-sm font-black"
              >
                مشاهده و ثبت‌نام مشاوره VIP
              </ShimmerButton>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-[#EAF2FA] via-[#EEEAF9] to-[#F7F5FC] border border-[#D1C7F0] rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
          <div className="space-y-4 text-right max-w-xl relative z-10">
            <span className="text-[11px] text-[#5243B2] border border-[#7062C4]/30 rounded-full px-3 py-1 font-mono font-bold uppercase bg-white w-fit block shadow-2xs">LIMITED PACKAGE</span>
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-normal">
              مجموعه چهارجلدی چهل دروازه به ماورا
            </h3>
            <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
              اگر مصمم هستید تا مهارت رویابینی آگاهانه را زیر نظر مستقیم استاد فرا بگیرید، مجموعه کامل چهارجلدی چهل دروازه به ماورا همراه با مشاوره اختصاصی تلگرام بهترین گزینه است. رویاها و تمرینات روزانه شما تحلیل شده و نکات کلیدی به شما آموزش داده می‌شود.
            </p>
            <div className="flex gap-4 items-center pt-2">
              <span className="text-sm text-slate-500 line-through">۱,۹۹۹,۰۰۰ تومان</span>
              <span className="text-lg font-bold text-[#5243B2]">۱,۶۹۹,۰۰۰ تومان</span>
            </div>
          </div>

          <div className="flex-shrink-0 relative z-10 w-full md:w-auto">
            <ShimmerButton
              id="promo-pack-cta"
              onClick={() => setSelectedProductId('45363')}
              className="w-full md:w-auto px-8 py-4 text-xs sm:text-sm"
            >
              مشاهده مجموعه چهارجلدی
            </ShimmerButton>
          </div>
        </div>
      </section>

      {/* New Arrivals Showcase */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-[#EEEAF9] pb-6">
          <div className="space-y-2 text-right">
            <span className="text-xs text-[#5243B2] font-mono tracking-widest uppercase font-bold">DISCOVER NEW ARRIVALS</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">جدیدترین محصولات آموزشی</h2>
            <p className="text-xs md:text-sm text-slate-600">تازه‌ترین انتشارات، کتاب‌های صوتی و ابزارهای تکنولوژیک بیداری ذهن.</p>
          </div>
          <button
            onClick={() => setCurrentPage('shop')}
            className="text-xs md:text-sm text-[#5243B2] hover:text-[#42349A] transition-colors flex items-center gap-1.5 border-b border-[#D1C7F0] pb-1 font-bold cursor-pointer"
          >
            <span>مشاهده همه تازه‌ها</span>
            <ArrowLeft size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {newArrivals.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Quote Section / Jung philosophical background */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center bg-white border border-[#EEEAF9] rounded-3xl relative shadow-2xs">
        <Quote size={36} className="text-[#7062C4] mx-auto mb-5 opacity-80" />
        <div className="max-w-3xl mx-auto space-y-5">
          <p className="text-lg md:text-xl font-display font-bold text-slate-900 leading-relaxed italic">
            «کسی که به بیرون نگاه می‌کند، خواب می‌بیند؛ کسی که به درون نگاه می‌کند، بیدار می‌شود.»
          </p>
          <span className="block text-xs font-mono font-bold text-[#5243B2] uppercase tracking-widest">کارل گوستاو یونگ</span>
        </div>
      </section>

      {/* Testimonials / Real user feedback */}
      <TestimonialsSection />
    </>
  );
}

