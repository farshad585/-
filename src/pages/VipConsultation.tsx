import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import SEO from '../components/SEO';
import ShimmerButton from '../components/ShimmerButton';
import StarfieldBeams from '../components/StarfieldBeams';
import TextBlurReveal from '../components/TextBlurReveal';
import NumberTicker from '../components/NumberTicker';
import { 
  Sparkles, 
  CheckCircle2, 
  Crown, 
  MessageCircle, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Send, 
  Check, 
  Flame, 
  HelpCircle,
  Headphones,
  Award,
  ChevronLeft,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function VipConsultation() {
  const { setCurrentPage, setSelectedProductId, addToCart, products } = useApp();

  // Find the exact VIP product (ID: 45398)
  const vipProduct = (products || PRODUCTS).find(p => p.id === '45398') || PRODUCTS.find(p => p.id === '45398')!;

  // Plan selection state: '30days' | '60days' | '90days'
  const [selectedPlan, setSelectedPlan] = useState<'30days' | '60days' | '90days'>('30days');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // VIP consultation plans configuration
  const plans = [
    {
      id: '30days' as const,
      days: 30,
      title: 'مشاوره VIP ۳۰ روزه',
      subtitle: 'مناسب برای شروع مسیر و اصلاح تمرینات',
      price: 8900000,
      badge: 'شروع استاندارد',
      features: [
        'ارتباط مستقیم با فرشاد میرشکاری در تلگرام',
        'تحلیل روزانه دفترچه ثبت رویاها و علائم خواب',
        'اصلاح متدهای تمرینی و تکنیک‌های اختصاصی شما',
        'پاسخگویی به سوالات و رفع ابهامات ذهنی',
        'پشتیبانی شنبه تا پنج‌شنبه',
      ],
      highlight: false,
    },
    {
      id: '60days' as const,
      days: 60,
      title: 'مشاوره VIP ۶۰ روزه',
      subtitle: 'مناسب برای همراهی عمیق‌تر و پیگیری مستمر',
      price: 14900000,
      badge: 'محبوب‌ترین پلن',
      features: [
        'تمام امکانات پلن ۳۰ روزه',
        'تمرینات شخصی‌سازی شده برای کنترل و ثبات رویا',
        'بررسی تکنیک‌های پیشرفته ورود مستقیم (WILD / FILD)',
        'تحلیل رویاهای لایه‌ای و گذر از موانع ذهنی ناخودآگاه',
        'اولویت پاسخگویی سریع‌تر توسط استاد',
      ],
      highlight: true,
    },
    {
      id: '90days' as const,
      days: 90,
      title: 'مشاوره VIP ۹۰ روزه',
      subtitle: 'مناسب برای همراهی کامل و بلندمدت',
      price: 19900000,
      badge: 'تسلط کامل و جامع',
      features: [
        'تمام امکانات پلن‌های قبلی',
        'برنامه جامع ۳ ماهه تسلط بر آفرینش ارادی خواب‌ها',
        'تثبیت حافظه بلندمدت رویا و تبدیل به عادت پایدار',
        'راهنمایی ویژه در برون‌فکنی و کشف گنج درون',
        'پشتیبانی VIP تا زمان دستیابی به اولین رویاهای شفاف متوالی',
      ],
      highlight: false,
    },
  ];

  // Active selected plan details
  const activePlanData = plans.find(p => p.id === selectedPlan) || plans[0];

  const handleEnrollInPlan = (planId: '30days' | '60days' | '90days') => {
    setIsEnrolling(true);
    const chosenPlan = plans.find(p => p.id === planId) || activePlanData;

    // Create customized product instance with the selected plan's exact price
    const customVipItem: typeof vipProduct = {
      ...vipProduct,
      price: chosenPlan.price,
      salePrice: chosenPlan.price,
    };

    const durationStr = planId === '60days' ? '۶۰روزه' : planId === '90days' ? '۹۰روزه' : '۳۰روزه';
    const planLabel = `مشاوره VIP با فرشاد میرشکاری (${durationStr} - چت تلگرام)`;

    // Add to cart directly and transfer seamlessly to cart / checkout
    addToCart(customVipItem, 1, planLabel, true);

    setTimeout(() => {
      setIsEnrolling(false);
      setCurrentPage('cart');
    }, 400);
  };

  const vipFaqs = [
    {
      q: 'مشاوره VIP چگونه و در چه بستری انجام می‌شود؟',
      a: 'پس از تکمیل ثبت‌نام، آیدی اختصاصی تلگرام استاد فرشاد میرشکاری برای شما ارسال می‌گردد و ارتباط مستقیم و فردی شما در محیط پیام‌رسان تلگرام آغاز می‌شود.',
    },
    {
      q: 'آیا برای شرکت در مشاوره نیاز به پیش‌نیاز خاصی است؟',
      a: 'خیر، این مشاوره متناسب با سطح شما (از مبتدی مطلق تا سطوح پیشرفته) شخصی‌سازی می‌شود و تمامی متدها از پایه تا تسلط کامل قدم به قدم زیر نظر استاد هدایت می‌گردد.',
    },
    {
      q: 'تحلیل رویاها و تمرینات چگونه انجام می‌شود؟',
      a: 'شما گزارش روزانه خواب‌ها، تجربیات و نتایج تمرینات خود را ارسال می‌کنید. استاد پیام‌ها را به دقت بررسی کرده و با وویس یا پیام متنی، اصلاحات و تکنیک‌های مرحله بعدی را به شما اعلام می‌کنند.',
    },
    {
      q: 'اگر در طول دوره فرصت تمرین نداشته باشم چه می‌شود؟',
      a: 'برنامه به صورت انعطاف‌پذیر و منطبق بر ریتم خواب و سبک زندگی شما تنظیم می‌شود تا بیشترین بازدهی بدون ایجاد استرس برایتان حاصل گردد.',
    },
  ];

  return (
    <>
      <SEO 
        title="مشاوره VIP استاد فرشاد میرشکاری | همراهی اختصاصی رویابینی" 
        description="مشاوره اختصاصی و ارتباط مستقیم با فرشاد میرشکاری برای تحلیل رویاها، اصلاح متدهای تمرینی و پاسخگویی به پرسش‌ها."
        ogType="website"
      />

      <div className="relative min-h-screen text-slate-900 overflow-hidden pb-16">
        
        {/* Hero Section */}
        <section className="relative pt-8 pb-16 md:py-20 max-w-6xl mx-auto px-4">
          <StarfieldBeams />

          <div className="relative z-10 text-center space-y-6 max-w-3xl mx-auto">
            
            {/* VIP Golden Pill Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border border-amber-400/40 rounded-full px-4 py-1.5 text-xs font-bold text-amber-900 shadow-xs"
            >
              <Crown size={15} className="text-amber-600 animate-pulse" />
              <span>خدمت ممتاز و اختصاصی آکادمی چهل دروازه</span>
              <Sparkles size={13} className="text-amber-500" />
            </motion.div>

            {/* Main Headings */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                <TextBlurReveal 
                  text="مشاوره VIP استاد" 
                  delay={0.1}
                  className="block text-slate-900 font-black"
                  wordClassName="font-black"
                />
              </h1>
              <p className="text-base md:text-xl font-bold text-[#5243B2]">
                همراهی اختصاصی با فرشاد میرشکاری در مسیر رویابینی آگاهانه
              </p>
            </div>

            {/* 3 Core Value Props */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#EEEAF9] p-6 md:p-8 shadow-sm text-right space-y-4 max-w-2xl mx-auto"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-extrabold text-slate-900">تحلیل روزانه تمرینات و رویاهای شما توسط استاد</h4>
                  <p className="text-xs text-slate-600 mt-0.5">بررسی تخصصی جزییات خواب‌ها و یافتن نشانه‌های رویا (Dream Signs) اختصاصی ذهن شما.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-3 border-t border-slate-100">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-extrabold text-slate-900">ارائه راهکارهای کلیدی و اصلاح متد تمرینی</h4>
                  <p className="text-xs text-slate-600 mt-0.5">تنظیم تکنیک‌ها متناسب با ریتم خواب شما برای جلوگیری از خستگی ذهنی و افزایش بازدهی.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-3 border-t border-slate-100">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-extrabold text-slate-900">پاسخگویی اختصاصی به تمامی پرسش‌های شما در طول دوره</h4>
                  <p className="text-xs text-slate-600 mt-0.5">ارتباط مستقیم و پیوسته در چت تلگرام بدون واسطه با نویسنده کتاب‌های چهل دروازه.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Plans Grid Section */}
        <section id="vip-plans" className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-[#5243B2] uppercase tracking-widest">CHOOSE YOUR JOURNEY</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">انتخاب پلن مشاوره VIP</h2>
            <p className="text-xs md:text-sm text-slate-600">مدت زمان همراهی متناسب با اهداف خود را انتخاب کنید</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer border-2 ${
                    plan.highlight
                      ? 'bg-gradient-to-b from-purple-50/90 via-white to-white border-[#5243B2] shadow-xl ring-4 ring-[#5243B2]/10 md:-translate-y-2'
                      : isSelected
                      ? 'bg-white border-[#5243B2] shadow-lg ring-2 ring-[#5243B2]/20'
                      : 'bg-white border-[#EEEAF9] hover:border-[#7062C4] shadow-xs'
                  }`}
                >
                  {/* Top Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3.5 right-6">
                      <span className={`text-[11px] font-black px-3.5 py-1 rounded-full shadow-xs ${
                        plan.highlight
                          ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white'
                          : 'bg-[#EEEAF9] text-[#5243B2] border border-[#D1C7F0]'
                      }`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg md:text-xl font-black text-slate-900">{plan.title}</h3>
                      <p className="text-xs text-slate-600">{plan.subtitle}</p>
                    </div>

                    {/* Price Tag */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-right">
                      <span className="text-xs text-slate-500 block mb-1">شهریه پلن {plan.days} روزه:</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl md:text-3xl font-black text-slate-900 font-sans">
                          {plan.price.toLocaleString('fa-IR')}
                        </span>
                        <span className="text-xs font-bold text-slate-600">تومان</span>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2.5 pt-2">
                      <span className="text-xs font-bold text-slate-800 block">شامل خدمات:</span>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 size={15} className="text-[#5243B2] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan CTA Button */}
                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(plan.id);
                        handleEnrollInPlan(plan.id);
                      }}
                      className={`w-full py-3.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        plan.highlight || isSelected
                          ? 'bg-[#5243B2] hover:bg-[#42349A] text-white shadow-md shadow-[#5243B2]/20'
                          : 'bg-slate-100 hover:bg-[#5243B2] hover:text-white text-slate-800'
                      }`}
                    >
                      <span>ثبت‌نام در این پلن</span>
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Fast Enroll Bar for Selected Plan */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#EEEAF9] via-white to-[#EAF2FA] border border-[#D1C7F0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <div className="space-y-1 text-right">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-[#5243B2]" />
                <span className="text-sm md:text-base font-extrabold text-slate-900">
                  پلن انتخابی شما: {activePlanData.title}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                شهریه کل: <strong className="text-[#5243B2] font-black">{activePlanData.price.toLocaleString('fa-IR')} تومان</strong> • شروع بلافاصله پس از تکمیل سفارش
              </p>
            </div>

            <ShimmerButton
              id="vip-direct-checkout-cta"
              disabled={isEnrolling}
              onClick={() => handleEnrollInPlan(selectedPlan)}
              className="w-full sm:w-auto px-8 py-4 text-xs md:text-sm shrink-0"
            >
              {isEnrolling ? 'در حال انتقال به سبد خرید...' : 'تکمیل ثبت‌نام و دریافت آیدی تلگرام'}
            </ShimmerButton>
          </div>
        </section>

        {/* Why VIP Consultation? Distinct value proposition */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl border border-[#EEEAF9] p-8 md:p-12 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="space-y-3 text-right">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5243B2] flex items-center justify-center">
                <UserCheck size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">همراهی مستقیم شخص فرشاد میرشکاری</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                مشاوره توسط هیچ دستیار یا کاربری پاسخ داده نمی‌شود؛ کلیه بررسی‌ها، وویس‌ها و راهنمایی‌ها منحصراً توسط خود استاد انجام می‌شود.
              </p>
            </div>

            <div className="space-y-3 text-right">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Zap size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">کاهش زمان یادگیری از ماه‌ها به چند هفته</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                با اصلاح اشتباهات رایج تمرینی در همان روزهای اول، از سردرگمی و اتلاف وقت جلوگیری شده و سرعت بیداری در خواب چند برابر می‌شود.
              </p>
            </div>

            <div className="space-y-3 text-right">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">حفظ محرمانگی کامل رویاها و اسرار شخصی</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                تمام یادداشت‌های رویا، پرسش‌ها و مکالمات درون چت تلگرام در نهایت امانت‌داری و محرمانگی کامل باقی خواهد ماند.
              </p>
            </div>

          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">سوالات متداول درباره مشاوره VIP</h3>
            <p className="text-xs text-slate-600">پاسخ به سوالات رایج همراهان آکادمی پیش از شروع دوره</p>
          </div>

          <div className="space-y-3">
            {vipFaqs.map((faq, idx) => {
              const isOpen = activeFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-2xl bg-white border border-[#EEEAF9] overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4.5 text-right flex items-center justify-between gap-4 font-bold text-xs md:text-sm text-slate-900 hover:text-[#5243B2] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-[#5243B2] font-black text-lg">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4.5 pb-4.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </>
  );
}
