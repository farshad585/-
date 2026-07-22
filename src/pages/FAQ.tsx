/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import SEO from '../components/SEO';
import { FAQ_ITEMS } from '../data/blog';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  BookOpen, 
  Truck, 
  Download, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1'); // Default first expanded

  const categories = [
    { id: 'all', label: 'همه سوالات', icon: HelpCircle },
    { id: 'dreaming', label: 'تکنیک‌های رویابینی', icon: BookOpen },
    { id: 'orders', label: 'سفارشات و ارسال', icon: Truck },
    { id: 'downloads', label: 'دانلودها و دیجیتال', icon: Download },
  ];

  const filteredFAQs = useMemo(() => {
    let result = [...FAQ_ITEMS];

    if (activeCategory !== 'all') {
      result = result.filter(faq => faq.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(faq => 
        faq.question.toLowerCase().includes(q) || 
        faq.answer.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeCategory, searchQuery]);

  // Construct FAQ JSON-LD Schema
  const faqSchema = useMemo(() => {
    return {
      '@type': 'FAQPage',
      'mainEntity': FAQ_ITEMS.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    };
  }, []);

  return (
    <>
      <SEO 
        title="سوالات متداول | راهنمای هنرجویان" 
        description="پاسخ به متداول‌ترین سوالات کاربران در خصوص رویابینی شفاف، نحوه خرید کتاب فیزیکی و پی دی اف، فرآیند ارسال سفارشات پستی و شرایط پشتیبانی دوره‌ها."
        schema={faqSchema}
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-indigo-100 py-16 text-center max-w-7xl mx-auto rounded-b-3xl mb-12 shadow-xs">
        <div className="max-w-xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>صفحه اصلی</span>
            <span>/</span>
            <span className="text-indigo-600 font-bold">سوالات متداول</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">پاسخ به پرسش‌های متداول</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            کامل‌ترین و جامع‌ترین پایگاه دانش پاسخ به پرسش‌های فنی رویابینی و فرآیندهای خرید کتاب.
          </p>
        </div>
      </section>

      {/* Interactive Search Bar & Filters */}
      <section className="max-w-3xl mx-auto px-4 space-y-6 mb-12">
        
        {/* Search Input */}
        <div className="relative">
          <input
            id="faq-search-input"
            type="text"
            placeholder="کلمه‌ای مثل «بختک»، «پست» یا «پی‌دی‌اف» را جستجو کنید..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
          />
          <Search size={18} className="absolute left-4 top-4.5 text-slate-400" />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none justify-start sm:justify-center">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-indigo-200'
                }`}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

      </section>

      {/* FAQs List Accordion */}
      <section className="max-w-3xl mx-auto px-4 mb-20 space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-slate-200 bg-white space-y-4 shadow-xs">
            <HelpCircle size={40} className="text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">متأسفانه سوالی مطابق با عبارت جستجوی شما پیدا نشد.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
            >
              مشاهده همه سوالات مجدداً
            </button>
          </div>
        ) : (
          filteredFAQs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div 
                key={faq.id}
                className="border border-indigo-100 rounded-2xl bg-white hover:border-indigo-200 transition-colors overflow-hidden shadow-xs"
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full text-right p-5 flex justify-between items-center gap-4 focus:outline-none"
                >
                  <span className="text-xs font-bold text-slate-900 leading-relaxed">{faq.question}</span>
                  <ChevronDown 
                    size={16} 
                    className={`text-indigo-600 transition-transform flex-shrink-0 duration-300 ${
                      isExpanded ? 'rotate-180' : 'rotate-0'
                    }`} 
                  />
                </button>

                {/* Accordion Content Panel */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </section>

      {/* Support box helper */}
      <section className="max-w-3xl mx-auto px-4 text-center pb-12">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-100 space-y-4 shadow-xs">
          <span className="text-indigo-900 text-xs font-bold block">سوال شما در این لیست نبود؟</span>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            هیچ مشکلی نیست! مربیان آکادمی آماده حل ابهامات فنی و سفارشی شما هستند.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 geom-button-primary text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <span>ارسال پیام مستقیم به پشتیبانی</span>
          </a>
        </div>
      </section>
    </>
  );
}
