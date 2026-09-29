/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import { ALL_REVIEWS } from '../data/reviewsData';
import { Review } from '../types';
import SEO from '../components/SEO';
import ShimmerButton from '../components/ShimmerButton';
import StarfieldBeams from '../components/StarfieldBeams';
import TextBlurReveal from '../components/TextBlurReveal';
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
  UserCheck,
  Star,
  MessageSquare,
  Users,
  AlertCircle,
  ThumbsUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function VipConsultation() {
  const { 
    setCurrentPage, 
    addToCart, 
    products, 
    vipCapacity = 40, 
    vipEnrolledCount = 1 
  } = useApp();

  // Find the exact VIP product (ID: 45398)
  const vipProduct = (products || PRODUCTS).find(p => p.id === '45398') || PRODUCTS.find(p => p.id === '45398')!;

  // Plan selection state: '30days' | '60days' | '90days'
  const [selectedPlan, setSelectedPlan] = useState<'30days' | '60days' | '90days'>('30days');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Reviews State
  const initialVipReviews = useMemo(() => {
    return ALL_REVIEWS.filter(r => r.productId === '45398');
  }, []);
  
  const [reviewsList, setReviewsList] = useState<Review[]>(initialVipReviews);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);

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
        'بررسی تکنیک‌های پیشرفته ورود مستقیم (دروازه‌های رویایی)',
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

  // Capacity calculations
  const remainingSeats = Math.max(0, vipCapacity - vipEnrolledCount);
  const percentFilled = Math.min(100, Math.round((vipEnrolledCount / vipCapacity) * 100));

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

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    setIsSubmittingReview(true);
    setTimeout(() => {
      const newRev: Review = {
        id: `rev-vip-${Date.now()}`,
        productId: '45398',
        authorName: newReviewAuthor.trim(),
        rating: newReviewRating,
        date: new Intl.DateTimeFormat('fa-IR').format(new Date()),
        comment: newReviewComment.trim(),
        verifiedPurchase: true
      };

      setReviewsList(prev => [newRev, ...prev]);
      setNewReviewAuthor('');
      setNewReviewComment('');
      setNewReviewRating(5);
      setIsSubmittingReview(false);
      setReviewSuccessMessage('دیدگاه و تجربه شما با موفقیت ثبت شد و نمایش داده می‌شود.');

      setTimeout(() => {
        setReviewSuccessMessage(null);
      }, 5000);
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
        <section className="relative pt-8 pb-12 md:py-16 max-w-6xl mx-auto px-4">
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

            {/* Main Headings with Half-Speed Reveal */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                <TextBlurReveal 
                  text="مشاوره VIP استاد" 
                  delay={0.2}
                  duration={2.2}
                  stagger={0.32}
                  className="block text-slate-900 font-black justify-center"
                  wordClassName="font-black"
                />
              </h1>
              <p className="text-base md:text-xl font-bold text-[#5243B2]">
                همراهی اختصاصی با فرشاد میرشکاری در مسیر رویابینی آگاهانه
              </p>
            </div>

            {/* Modern & Minimal 40-Cell Segmented Capacity Lifebar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white/85 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 md:p-5 shadow-xs max-w-xl mx-auto text-right space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs md:text-sm font-black text-slate-900">
                    موجودی ظرفیت این ماه:
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs md:text-sm font-black font-sans">
                  <span className="text-emerald-600 font-extrabold text-sm md:text-base">
                    {remainingSeats.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-slate-700 font-bold text-xs">نفر باقی‌مانده</span>
                  <span className="text-slate-400 text-xs font-normal">
                    (از {vipCapacity.toLocaleString('fa-IR')} جایگاه)
                  </span>
                </div>
              </div>

              {/* 40 Modern Minimal Segment Cells */}
              <div className="flex gap-1 items-center w-full h-3 md:h-3.5" dir="ltr">
                {Array.from({ length: vipCapacity }).map((_, idx) => {
                  const isFilled = idx < vipEnrolledCount;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 h-full rounded-[3px] transition-all duration-300 ${
                        isFilled
                          ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.35)]'
                          : 'bg-slate-100 border border-slate-200/70'
                      }`}
                      title={`جایگاه ${idx + 1} (${isFilled ? 'تکمیل شده' : 'موجود'})`}
                    />
                  );
                })}
              </div>
            </motion.div>

            {/* 3 Core Value Props */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
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
                      <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-1.5 justify-start">
                        <span>مشاوره</span>
                        <span className="font-sans font-black text-[#5243B2]">VIP</span>
                        <span>{plan.days === 30 ? '۳۰' : plan.days === 60 ? '۶۰' : '۹۰'} روزه</span>
                      </h3>
                      <p className="text-xs text-slate-600">{plan.subtitle}</p>
                    </div>

                    {/* Price Tag */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-right">
                      <span className="text-xs text-slate-500 block mb-1">شهریه پلن {plan.days === 30 ? '۳۰' : plan.days === 60 ? '۶۰' : '۹۰'} روزه:</span>
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

          {/* Fast Enroll Action Bar for Selected Plan */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#EEEAF9] via-white to-[#EAF2FA] border border-[#D1C7F0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <div className="space-y-1 text-right">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-[#5243B2]" />
                <span className="text-sm md:text-base font-extrabold text-slate-900 inline-flex items-center gap-1.5">
                  <span>پلن انتخابی شما: مشاوره</span>
                  <span className="font-sans font-black text-[#5243B2]">VIP</span>
                  <span>{activePlanData.days === 30 ? '۳۰' : activePlanData.days === 60 ? '۶۰' : '۹۰'} روزه</span>
                </span>
              </div>
              <p className="text-xs text-slate-600">
                شهریه کل: <strong className="text-[#5243B2] font-black">{activePlanData.price.toLocaleString('fa-IR')} تومان</strong> • شروع بلافاصله پس از تکمیل سفارش در چت تلگرام
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

        {/* 22 Authentic Reviews Section */}
        <section id="vip-reviews" className="max-w-6xl mx-auto px-4 py-12 space-y-8">
          
          {/* Reviews Header */}
          <div className="bg-white rounded-3xl border border-[#EEEAF9] p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 text-right">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300/80">
                  رضایت ۱۰۰٪ شرکت‌کنندگان
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  {reviewsList.length.toLocaleString('fa-IR')} تجربه ثبت شده
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                نظرات و تجربیات همراهان دوره VIP
              </h2>
              <p className="text-xs md:text-sm text-slate-600">
                گزارش‌های واقعی و بی‌واسطه هنرجویان از ارتباط تلگرامی و تحلیل رویا با استاد فرشاد میرشکاری
              </p>
            </div>

            {/* Score box */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl shrink-0">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-amber-500 font-sans">۵.۰</div>
                <div className="flex items-center justify-center gap-0.5 text-amber-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
              </div>
              <div className="border-r border-slate-300 pr-4 text-xs text-slate-600 space-y-0.5">
                <div className="font-extrabold text-slate-900">کیفیت پاسخگویی: عالی</div>
                <div>سرعت پاسخ در تلگرام: ۲۴ ساعته</div>
                <div>اثربخشی تکنیک‌ها: ۱۰۰٪</div>
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewsList.map((rev) => (
              <div 
                key={rev.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-2xs hover:shadow-md transition-shadow text-right space-y-3 relative flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-[#5243B2] font-black text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                        {rev.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs md:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>{rev.authorName}</span>
                          {rev.verifiedPurchase && (
                            <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                              <Check size={10} />
                              <span>دانشجوی تاییدشده VIP</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{rev.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed pt-1">
                    {rev.comment}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="text-[#5243B2] font-bold">پشتیبانی تلگرام با استاد میرشکاری</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <ThumbsUp size={11} className="text-indigo-400" />
                    <span>تجربه تایید شده</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Review Form */}
          <div className="bg-white rounded-3xl border border-[#EEEAF9] p-6 md:p-8 shadow-xs text-right space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageSquare size={18} className="text-[#5243B2]" />
                <span>ثبت نظر و تجربه شما از مشاوره VIP استاد</span>
              </h3>
              <p className="text-xs text-slate-500">
                اگر تجربه شرکت در دوره مشاوره VIP را دارید، دیدگاه ارزشمند خود را با سایر همراهان به اشتراک بگذارید.
              </p>
            </div>

            {reviewSuccessMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>{reviewSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">نام و نام‌خانوادگی شما *</label>
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="مثلاً: علی رضایی"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#5243B2] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">امتیاز شما به مشاوره VIP *</label>
                  <div className="flex items-center gap-2 pt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="text-amber-400 focus:outline-none cursor-pointer"
                      >
                        <Star 
                          size={22} 
                          fill={star <= newReviewRating ? "currentColor" : "none"} 
                          stroke="currentColor" 
                        />
                      </button>
                    ))}
                    <span className="text-xs font-black text-slate-700 mr-2">
                      {newReviewRating} ستاره
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">متن تجربه و دیدگاه شما *</label>
                <textarea
                  required
                  rows={3}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="از تجربه همراهی و ارتباط مستقیم با استاد فرشاد میرشکاری و نتایج خود بنویسید..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#5243B2] focus:bg-white leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="bg-[#5243B2] hover:bg-[#42349A] text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#5243B2]/20"
                >
                  <Send size={14} />
                  <span>{isSubmittingReview ? 'در حال ثبت...' : 'ارسال و ثبت دیدگاه'}</span>
                </button>
              </div>
            </form>
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
