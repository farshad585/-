/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';
import TestimonialsSection from '../components/TestimonialsSection';
import SEO from '../components/SEO';
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
  RotateCcw
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
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight"
              >
                <span className="block mb-2">تبدیل شدن به آفریدگار رویا،</span>
                <span className="block">
                  <span className="text-[#5243B2] font-black">دروازه چهلم</span> خودشناسی
                </span>
              </motion.h1>
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
              حقیقت اینه که ما هر شب رویا می‌بینیم؛ چه دلمون بخواد، چه نخواد... پس چه بهتر که به جای سرگردان بودن در خواب‌های خسته‌کننده، آستین همت رو بالا بزنیم و از دنیای رویاهامون به بهترین شکل استفاده کنیم! 💖
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center items-center gap-4 pt-2"
            >
              <button
                id="hero-shop-cta"
                onClick={() => setCurrentPage('shop')}
                className="bg-[#5243B2] hover:bg-[#42349A] text-white flex items-center justify-center gap-2.5 shadow-md shadow-[#5243B2]/20 text-sm font-bold px-8 py-3.5 rounded-xl transition-all cursor-pointer"
              >
                <span>ورود به فروشگاه محصولات</span>
                <ArrowLeft size={18} />
              </button>
              <button
                id="hero-about-cta"
                onClick={() => setCurrentPage('blog')}
                className="bg-[#EEEAF9] hover:bg-[#E3DDF7] text-[#42349A] border border-[#D1C7F0] flex items-center justify-center gap-2.5 text-sm font-bold px-8 py-3.5 rounded-xl transition-all cursor-pointer"
              >
                <Compass size={18} className="text-[#7062C4]" />
                <span>مطالعه مقالات آموزشی</span>
              </button>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-[#EEEAF9] text-center"
            >
              <div className="space-y-1 p-2 rounded-xl bg-white/70 backdrop-blur-xs">
                <span className="block text-2xl font-bold font-display text-[#5243B2]">+۵۰,۰۰۰</span>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">هنرجوی خواب شفاف</span>
              </div>
              <div className="space-y-1 p-2 rounded-xl bg-white/70 backdrop-blur-xs">
                <span className="block text-2xl font-bold font-display text-[#5243B2]">۲۰+</span>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">کتاب، پادکست و پکیج</span>
              </div>
              <div className="space-y-1 p-2 rounded-xl bg-white/70 backdrop-blur-xs">
                <span className="block text-2xl font-bold font-display text-[#5243B2]">۳ ماه</span>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">پشتیبانی اختصاصی</span>
              </div>
              <div className="space-y-1 p-2 rounded-xl bg-white/70 backdrop-blur-xs">
                <span className="block text-2xl font-bold font-display text-[#5243B2]">۱۰۰٪</span>
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
            <div className="absolute left-3 xs:left-3.5 top-0 bottom-0 w-[52%] sm:w-[48%] max-w-[270px] flex flex-col justify-center text-right space-y-2.5 z-10" dir="rtl">
              {/* Eyebrow - Single Line with dashes on both sides */}
              <div className="flex items-center gap-0.5 justify-start">
                <span className="text-[#5243B2] text-[10px] xs:text-[11px] sm:text-xs font-bold">—</span>
                <span className="text-[#5243B2] text-[10px] xs:text-[11px] sm:text-xs font-extrabold whitespace-nowrap">
                  مرجع تخصصی رویابینی آگاهانه
                </span>
                <span className="text-[#5243B2] text-[10px] xs:text-[11px] sm:text-xs font-bold">—</span>
              </div>

              {/* Main Heading - Larger size, strictly on the left side */}
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xl xs:text-[22px] sm:text-[26px] font-black text-slate-900 leading-[1.25] tracking-tight text-right"
              >
                <span className="block whitespace-nowrap">تبدیل شدن به</span>
                <span className="block whitespace-nowrap">آفریدگار رویا،</span>
                <span className="block text-[#5243B2] font-black whitespace-nowrap">دروازه چهلم</span>
                <span className="block whitespace-nowrap">خودشناسی</span>
              </motion.h1>
            </div>
          </div>

          {/* Friendly Chat Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-10 bg-white/90 backdrop-blur-md rounded-2xl border border-[#EEEAF9] p-4 text-center shadow-xs space-y-2"
          >
            <div className="flex items-center justify-center gap-1.5 text-[#5243B2] font-extrabold text-xs sm:text-sm">
              <span className="text-sm">💬</span>
              <span>گپ دوستانه من،</span>
              <button 
                onClick={() => setCurrentPage('about')}
                className="no-underline text-[#5243B2] font-black underline underline-offset-4 cursor-pointer"
              >
                فرشاد میرشکاری
              </button>
              <span>با شما همراهان عزیز:</span>
            </div>
            
            <p className="text-xs text-slate-700 leading-relaxed space-y-1 font-medium">
              <span className="block">حقیقت اینه که ما هر شب رویا می‌بینیم؛</span>
              <span className="block">چه دلمون بخواد، چه نخواد...</span>
              <span className="block">پس چه بهتر که به جای سرگردان بودن در خواب‌های خسته‌کننده، آستین همت رو بالا بزنیم و از دنیای رویاهامون به بهترین شکل استفاده کنیم! 💖</span>
            </p>
          </motion.div>

          {/* Full Width Buttons Stack */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative z-10 space-y-2.5 pt-1"
          >
            <button
              id="hero-shop-cta-mobile"
              onClick={() => setCurrentPage('shop')}
              className="w-full bg-[#5243B2] active:bg-[#42349A] text-white flex items-center justify-center gap-2 shadow-md shadow-[#5243B2]/20 text-xs sm:text-sm font-bold py-3.5 rounded-xl transition-all cursor-pointer"
            >
              <span>ورود به فروشگاه محصولات</span>
              <ArrowLeft size={16} />
            </button>

            <button
              id="hero-about-cta-mobile"
              onClick={() => setCurrentPage('blog')}
              className="w-full bg-[#F5F3FF] active:bg-[#ECE8FF] text-[#5243B2] border border-[#DDD6FE] flex items-center justify-center gap-2 text-xs sm:text-sm font-bold py-3.5 rounded-xl transition-all cursor-pointer"
            >
              <Compass size={16} className="text-[#7062C4]" />
              <span>مطالعه مقالات آموزشی</span>
            </button>
          </motion.div>

          {/* Mobile Quick Stats Grid */}
          <div className="relative z-10 grid grid-cols-2 gap-2 pt-3 border-t border-[#EEEAF9] text-center">
            <div className="p-2 rounded-xl bg-white/80 backdrop-blur-xs">
              <span className="block text-base font-bold font-display text-[#5243B2]">+۵۰,۰۰۰</span>
              <span className="text-[10px] font-bold text-slate-600">هنرجوی خواب شفاف</span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 backdrop-blur-xs">
              <span className="block text-base font-bold font-display text-[#5243B2]">۲۰+</span>
              <span className="text-[10px] font-bold text-slate-600">کتاب، پادکست و پکیج</span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 backdrop-blur-xs">
              <span className="block text-base font-bold font-display text-[#5243B2]">۳ ماه</span>
              <span className="text-[10px] font-bold text-slate-600">پشتیبانی اختصاصی</span>
            </div>
            <div className="p-2 rounded-xl bg-white/80 backdrop-blur-xs">
              <span className="block text-base font-bold font-display text-[#5243B2]">۱۰۰٪</span>
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
            <button
              id="promo-pack-cta"
              onClick={() => setSelectedProductId('45363')}
              className="w-full md:w-auto bg-[#5243B2] hover:bg-[#42349A] text-white font-extrabold text-xs sm:text-sm px-8 py-4 rounded-xl transition-all shadow-md shadow-[#5243B2]/20 cursor-pointer"
            >
              مشاهده مجموعه چهارجلدی
            </button>
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

