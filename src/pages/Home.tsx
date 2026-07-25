/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { 
  BookOpen, 
  Headphones, 
  Tv, 
  Sparkles, 
  Compass, 
  ArrowLeft,
  Star,
  Quote,
  ShieldCheck,
  Zap,
  RotateCcw,
  Heart
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const { setCurrentPage, setSelectedProductId } = useApp();

  const featuredProducts = PRODUCTS.filter(p => p.featured).slice(0, 4);
  const bestSellers = PRODUCTS.filter(p => p.bestSeller).slice(0, 4);
  const newArrivals = PRODUCTS.filter(p => p.newArrival).slice(0, 4);

  const categories = [
    {
      id: 'books',
      title: 'کتاب‌های چاپی و PDF',
      description: 'کتب مرجع و چاپی بر روی کاغذ سبک سوئدی.',
      icon: BookOpen,
      count: '۱۳ محصول',
      color: 'from-amber-600/20 to-amber-900/40 border-amber-500/20'
    },
    {
      id: 'audiobooks',
      title: 'کتاب‌های صوتی استودیویی',
      description: 'فایل‌های صوتی عمیق با صدای استاد و امواج آلفا.',
      icon: Headphones,
      count: '۵ محصول',
      color: 'from-purple-600/20 to-purple-900/40 border-purple-500/20'
    },
    {
      id: 'courses',
      title: 'دوره‌های صوتی و پکیج‌های VIP',
      description: 'برنامه‌های آموزشی جامع با پشتیبانی اختصاصی استاد.',
      icon: Tv,
      count: '۵ محصول',
      color: 'from-emerald-600/20 to-emerald-900/40 border-emerald-500/20'
    },
  ];

  return (
    <>
      <SEO 
        title="صفحه اصلی | ۴۰ دروازه آگاهی" 
        description="مرجع تخصصی آموزش علمی و معنوی رویابینی شفاف، کنترل رویا، غلبه بر فلج خواب و بیداری ناخودآگاه. خرید کتاب، فایل صوتی و دوره‌های تخصصی خواب شفاف."
      />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center py-20 px-4 overflow-hidden max-w-7xl mx-auto rounded-3xl border border-indigo-200/80 mt-6 bg-slate-900 shadow-xl text-white">
        {/* Geometric Corner Lines inside Hero */}
        <div className="absolute inset-0 opacity-30 pointer-events-none z-10">
          <div className="absolute top-0 right-0 w-48 h-48 border-r-2 border-t-2 border-indigo-400"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 border-l-2 border-b-2 border-purple-400"></div>
        </div>
        
        {/* Background Image with darken gradient */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/lucid_dream_hero_1784533457822.jpg" 
            alt="رویابینی شفاف" 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-indigo-950/80 to-slate-900/60" />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-950/80 via-transparent to-purple-950/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl text-center px-4 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-slate-900/80 border border-indigo-400/40 px-4 py-2 rounded-full text-indigo-200 text-xs font-semibold tracking-wider backdrop-blur-md shadow-md"
          >
            <Sparkles size={14} className="text-purple-300 animate-pulse" />
            <span>بزرگترین آکادمی تخصصی رویابینی شفاف ایران</span>
          </motion.div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="h-[1px] w-8 bg-indigo-400"></span>
              <span className="text-indigo-300 text-xs uppercase tracking-[0.25em] font-medium font-mono">مرجع تخصصی رویابینی آگاهانه</span>
              <span className="h-[1px] w-8 bg-indigo-400"></span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-4xl md:text-6xl font-extrabold text-white leading-[1.3] md:leading-[1.25] tracking-tight"
            >
              بیدار شدن در رویا، <br />
              <span className="text-gold-gradient font-display italic">دروازه چهلم</span> خودشناسی
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs md:text-sm text-indigo-100 leading-relaxed max-w-2xl mx-auto bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-indigo-400/30 shadow-inner"
          >
            <span className="font-bold text-amber-300 block mb-1">💬 گپ دوستانه با شما:</span>
            ما هرشب رویا می‌بینیم؛ چه دلمون بخواد، چه نخواد... پس چه بهتر که به جای سرگردان بودن در خواب‌های خسته کننده، آستین همت رو بالا بزنیم و از دنیای رویاهامون یه بهشت شخصی بسازیم! 💖
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
          >
            <button
              id="hero-shop-cta"
              onClick={() => setCurrentPage('shop')}
              className="w-full sm:w-auto geom-button-primary flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/30 text-xs font-bold rounded-xl"
            >
              <span>ورود به فروشگاه آگاهی</span>
              <ArrowLeft size={16} />
            </button>
            <button
              id="hero-about-cta"
              onClick={() => setCurrentPage('blog')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center gap-2.5 text-xs font-bold px-6 py-3 rounded-xl backdrop-blur-md transition-all"
            >
              <Compass size={16} className="text-purple-300" />
              <span>مطالعه مقالات آموزشی</span>
            </button>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-12 border-t border-white/15 text-right md:text-center"
          >
            <div className="space-y-1">
              <span className="block text-xl md:text-2xl font-bold font-display text-indigo-300">+۵۰,۰۰۰</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider">هنرجوی خواب شفاف</span>
            </div>
            <div className="space-y-1">
              <span className="block text-xl md:text-2xl font-bold font-display text-indigo-300">۲۰+</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider">کتاب، پادکست و پکیج</span>
            </div>
            <div className="space-y-1">
              <span className="block text-xl md:text-2xl font-bold font-display text-indigo-300">۳</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider">ماه پشتیبانی اختصاصی</span>
            </div>
            <div className="space-y-1">
              <span className="block text-xl md:text-2xl font-bold font-display text-indigo-300">۱۰۰٪</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider">تضمین کارایی تکنیک‌ها</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Trust Badges Bar */}
      <section className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-indigo-300 transition-all duration-300">
          <ShieldCheck size={28} className="text-indigo-600 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900">پرداخت امن و گواهی SSL</h4>
            <p className="text-[10px] text-slate-500">پرداخت مطمئن بانکی با تمامی کارت‌های شتاب ایران.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-indigo-300 transition-all duration-300">
          <Zap size={28} className="text-purple-600 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900">دانلود آنی و ارسال پستی پیشتاز</h4>
            <p className="text-[10px] text-slate-500">تحویل دیجیتالی بلافاصله پس از پرداخت و ارسال سریع فیزیکی.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-indigo-300 transition-all duration-300">
          <RotateCcw size={28} className="text-violet-600 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900">ضمانت رضایت هنرجویان</h4>
            <p className="text-[10px] text-slate-500">پشتیبانی کامل در تلگرام برای پاسخگویی به روند تمرینات.</p>
          </div>
        </div>
      </section>

      {/* Love Key Philosophy Message Section */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white border border-indigo-500/30 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <Heart className="text-rose-400 fill-rose-400 animate-pulse shrink-0" size={22} />
            <div>
              <h3 className="text-base md:text-lg font-extrabold text-amber-300 font-display">
                وبسایت چهل دروازه: آموزش + کتاب + مشاوره + عشق
              </h3>
              <span className="text-[11px] text-indigo-200">شاهکلید یادگیری عمیق در قلمرو رویاها</span>
            </div>
          </div>

          <div className="space-y-3 text-xs md:text-sm text-slate-200 leading-relaxed font-light text-justify">
            <p>
              پس از هزاران سال مکاشفه در رویاهای شفاف، دانستم که شاه‌کلید یادگیری فقط یک چیز است: <strong className="text-amber-300 font-bold">«عشق»</strong>. زمانی که با معشوقی صمیمی دیدار می‌کنیم؛ بلااستثنا می‌کوشیم تا از تک‌تک لحظات، نهایت لذت را ببریم و تا آنجا که می‌توانیم، این لحظات عاشقانه را بهتر و طولانی‌تر کنیم.
            </p>
            <p>
              پس وقتی در کنار او می‌نشینیم، با نهایت احساس به طنین خوش‌آهنگ فرازونشیب نفس‌هایش گوش فرا می‌دهیم؛ با نهایت تمرکز به زیبایی‌های بی‌مثال او خیره می‌شویم؛ با نهایت احساس، او را می‌بوییم؛ با نهایت لطافت، پوست ظریفش را لمس می‌کنیم؛ و برای چیدن بوسه از لب‌هایش، چشم‌ها را می‌بندیم تا نهایت شیرینیِ وجود او را بچشیم.
            </p>
            <p className="text-amber-200 font-medium pt-2 border-t border-white/10">
              این‌چنین است که عشق میان ما و معشوق، محکم‌تر و عمیق‌تر می‌گردد؛ و خاطرات این لحظات، شفاف و رنگی، به صورت معجونی از هر پنج حس در حافظه به یادگار می‌ماند.
            </p>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-10">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="h-[1px] w-8 bg-indigo-500"></span>
            <span className="text-indigo-600 text-xs font-bold tracking-wider font-mono">PRODUCTS</span>
            <span className="h-[1px] w-8 bg-indigo-500"></span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">دسته‌بندی‌های اصلی محصولات آگاهی</h2>
          <p className="text-xs text-slate-500">کلید مورد نیاز خود را برای بیداری ناخودآگاه انتخاب کنید</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => setCurrentPage('shop')}
                className="p-8 rounded-2xl border border-indigo-100 bg-white group cursor-pointer hover:border-purple-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[220px] relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 w-fit text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{cat.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 tracking-wider uppercase">{cat.count}</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 group-hover:text-indigo-600 transition-colors font-medium">
                    <span>ورود به بخش</span>
                    <ArrowLeft size={12} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured / Best Sellers Showcase */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-12 bg-white border-y border-purple-100 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2 text-right">
            <span className="text-[10px] text-indigo-600 font-mono tracking-widest uppercase font-bold">EXPLORE BEST SELLERS</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">پرفروش‌ترین آثار آکادمی</h2>
            <p className="text-xs text-slate-500">محصولاتی که بیشترین اثربخشی را در رویابینی سریع هنرجویان داشته‌اند.</p>
          </div>
          <button
            onClick={() => setCurrentPage('shop')}
            className="text-xs text-indigo-600 hover:text-purple-700 transition-colors flex items-center gap-1.5 border-b border-indigo-300 pb-1 font-semibold"
          >
            <span>مشاهده همه محصولات</span>
            <ArrowLeft size={12} />
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
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-purple-200 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="space-y-5 text-right max-w-xl relative z-10">
            <span className="text-[10px] text-indigo-700 border border-indigo-300 rounded-full px-3 py-1 font-mono font-bold uppercase bg-white w-fit block shadow-xs">LIMITED PACKAGE</span>
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-normal">
              مجموعه چهارجلدی چهل دروازه به ماورا: <br />
              <span className="text-gold-gradient font-display italic">به همراه مشاوره تخصصی VIP تلگرام</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              اگر مصمم هستید تا مهارت رویابینی آگاهانه را زیر نظر مستقیم استاد فرا بگیرید، مجموعه کامل چهارجلدی چهل دروازه به ماورا همراه با مشاوره اختصاصی تلگرام بهترین گزینه است. رویاها و تمرینات روزانه شما تحلیل شده و نکات کلیدی به شما آموزش داده می‌شود.
            </p>
            <div className="flex gap-4 items-center pt-2">
              <span className="text-sm text-slate-400 line-through">۱,۹۹۹,۰۰۰ تومان</span>
              <span className="text-lg font-bold text-indigo-700">۱,۶۹۹,۰۰۰ تومان</span>
            </div>
          </div>

          <div className="flex-shrink-0 relative z-10 w-full md:w-auto">
            <button
              id="promo-pack-cta"
              onClick={() => setSelectedProductId('45363')}
              className="w-full md:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs px-8 py-4 rounded-xl transition-all shadow-md shadow-indigo-500/20"
            >
              مشاهده پکیج چهارجلدی + مشاوره VIP
            </button>
          </div>
        </div>
      </section>

      {/* New Arrivals Showcase */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-2 text-right">
            <span className="text-[10px] text-purple-600 font-mono tracking-widest uppercase font-bold">DISCOVER NEW ARRIVALS</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">جدیدترین محصولات آموزشی</h2>
            <p className="text-xs text-slate-500">تازه‌ترین انتشارات، کتاب‌های صوتی و ابزارهای تکنولوژیک بیداری ذهن.</p>
          </div>
          <button
            onClick={() => setCurrentPage('shop')}
            className="text-xs text-indigo-600 hover:text-purple-700 transition-colors flex items-center gap-1.5 border-b border-indigo-300 pb-1 font-semibold"
          >
            <span>مشاهده همه تازه ها</span>
            <ArrowLeft size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {newArrivals.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Quote Section / Jung philosophical background */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center bg-white border-y border-purple-100 rounded-3xl relative shadow-xs">
        <Quote size={40} className="text-purple-200 mx-auto mb-6" />
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-lg md:text-xl font-display font-bold text-slate-800 leading-relaxed italic">
            «کسی که به بیرون نگاه می‌کند، خواب می‌بیند؛ کسی که به درون نگاه می‌کند، بیدار می‌شود.»
          </p>
          <span className="block text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest">کارل گوستاو یونگ</span>
        </div>
      </section>

      {/* Testimonials / Real user feedback */}
      <section className="max-w-7xl mx-auto px-4 py-20 space-y-12">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="h-[1px] w-8 bg-purple-500"></span>
            <span className="text-purple-600 text-xs font-bold tracking-wider font-mono">TESTIMONIALS</span>
            <span className="h-[1px] w-8 bg-purple-500"></span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">نظرات و نتایج هنرجویان ۴۰ دروازه</h2>
          <p className="text-xs text-slate-500">کسانی که توانستند دنیای رویاهایشان را فتح کنند</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Testimonial 1 */}
          <div className="p-6 rounded-2xl bg-white border border-purple-100 hover:border-indigo-300 transition-all duration-300 space-y-4 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                «من بیش از دو سال بود که سعی می‌کردم پرواز رویا رو کامل کنترل کنم ولی هیجان‌زده می‌شدم و سریع بیدار می‌شدم. با استفاده از کتاب ۴۰ دروازه و تکنیک اسپینینگ (چرخش آگاهی) یاد گرفتم خواب رو تثبیت کنم. دیشب فوق‌العاده‌ترین تجربه پرواز رویا رو داشتم.»
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center">ر</div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">رضا شهبازی</h4>
                <span className="text-[10px] text-slate-400">خریدار کتاب ۴۰ دروازه</span>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="p-6 rounded-2xl bg-white border border-purple-100 hover:border-indigo-300 transition-all duration-300 space-y-4 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                «بزرگترین وحشت زندگی من بختک یا فلج خواب بود. هر بار که میافتادم حس خفگی عجیبی داشتم. بعد از خواندن راهنمای فلج خواب فهمیدم چطور ترس رو کنار بذارم. دیشب که فلج شدم، کاملاً ریلکس موندم و با تکنیک غوطه‌وری خودم رو جدا کردم و وارد یک خواب شفاف فوق‌العاده با وضوح رنگی بی‌نظیر شدم!»
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-bold text-xs flex items-center justify-center">م</div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">مریم یزدانی</h4>
                <span className="text-[10px] text-slate-400">خریدار پکیج PDF</span>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="p-6 rounded-2xl bg-white border border-purple-100 hover:border-indigo-300 transition-all duration-300 space-y-4 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                «پخش صوتی فرکانس‌های تتا فوق‌العاده روی من جواب داد. دو هفته بود که کتاب صوتی سفر به درون رویاها رو مرتب قبل خواب گوش می‌کردم و دیشب تونستم توی خواب، متوجه ساعت بشم که عقربه‌هاش به عقب برمی‌گشتن و همونجا کارهای هیجان‌انگیزی کردم. تجربه‌ای بود که زندگی آدم رو تغییر میده.»
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-violet-50 border border-violet-200 text-violet-700 font-bold text-xs flex items-center justify-center">س</div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">سینا محبی</h4>
                <span className="text-[10px] text-slate-400">هنرجوی دوره جامع ویدیویی</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
