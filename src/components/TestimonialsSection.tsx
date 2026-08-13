/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Star, CheckCircle, ShieldCheck, Award, MessageSquare, ThumbsUp, Sparkles, Heart, Search } from 'lucide-react';
import { ALL_REVIEWS } from '../data/reviewsData';
import { TESTIMONIALS } from '../data/testimonials';
import { PRODUCTS } from '../data/products';

const sanitizeText = (str: string) => {
  return str
    .replace(/۴۰\s*دروازه|40\s*دروازه/g, 'چهل دروازه')
    .replace(/اساتید/g, 'استاد فرشاد میرشکاری');
};

const CATEGORY_TABS = [
  { id: 'all', label: 'همه نظرات' },
  { id: 'books', label: 'کتاب‌های چهل دروازه' },
  { id: 'audio', label: 'پکیج‌های صوتی' },
  { id: 'vip', label: 'مشاوره VIP و تحلیل رویا' },
  { id: 'novels', label: 'رمان‌ها و اشعار' },
];

export default function TestimonialsSection() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});

  // Map product names
  const productTitleMap = useMemo(() => {
    const map: Record<string, string> = {};
    PRODUCTS.forEach(p => {
      map[p.id] = sanitizeText(p.title);
    });
    return map;
  }, []);

  // Filtered reviews from TESTIMONIALS and ALL_REVIEWS
  const filteredReviews = useMemo(() => {
    // Convert 23 core TESTIMONIALS to review structure
    const mappedTestimonials = TESTIMONIALS.map((t) => {
      let productId = '45363'; // Default: کتاب چهل دروازه به ماورا
      if (t.text.includes('فراسوى') || t.text.includes('فراسو')) {
        productId = '45375';
      } else if (t.text.includes('فرکانس') || t.text.includes('صوتی')) {
        productId = '45388';
      } else if (t.text.includes('بوسه خداوند')) {
        productId = '45380';
      } else if (t.text.includes('آفريدگار روياها') || t.text.includes('آفریدگار')) {
        productId = '45377';
      }

      return {
        id: `t-${t.id}`,
        authorName: 'هنرجوی رویابینی',
        comment: t.text,
        productId,
        rating: 5,
        date: '۱۴۰۴/۱۲/۲۸',
        verifiedPurchase: true
      };
    });

    let list = [...mappedTestimonials, ...ALL_REVIEWS.filter(r => r.comment && r.comment.length > 15)];

    if (selectedCategory === 'books') {
      list = list.filter(r => ['45375', '45363', '45377', '45378', '45379', '45391', '45392', '45393', '45394'].includes(r.productId));
    } else if (selectedCategory === 'audio') {
      list = list.filter(r => ['45388', '45390', '45389'].includes(r.productId));
    } else if (selectedCategory === 'vip') {
      list = list.filter(r => r.productId === '45399' || r.comment.includes('مشاوره') || r.comment.includes('تلگرام'));
    } else if (selectedCategory === 'novels') {
      list = list.filter(r => ['45380', '45382', '45384'].includes(r.productId));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(r => 
        r.authorName.toLowerCase().includes(q) || 
        r.comment.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  const displayedReviews = filteredReviews.slice(0, visibleCount);

  const handleLike = (id: string) => {
    setLikesMap(prev => {
      const current = prev[id] || Math.floor(Math.random() * 15) + 5;
      const isLiked = userLiked[id];
      return {
        ...prev,
        [id]: isLiked ? current - 1 : current + 1
      };
    });
    setUserLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white via-[#F7F5FC] to-white border-y border-indigo-100/60 my-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-[#5243B2] text-xs sm:text-sm font-extrabold shadow-2xs">
            <Sparkles size={15} className="text-amber-500 fill-amber-500" />
            <span>نظرات و تجربیات هنرجویان چهل دروازه</span>
          </h2>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0">
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedCategory(tab.id);
                  setVisibleCount(12);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#5243B2] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search size={15} className="absolute right-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در نظرات..."
              className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#5243B2]"
            />
          </div>
        </div>

        {/* Count Indicator */}
        <div className="text-xs text-slate-500 mb-4 font-medium flex items-center justify-between">
          <span>نمایش {displayedReviews.length} از {filteredReviews.length} نظر ثبت‌شده</span>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedReviews.map((rev) => {
            const prodTitle = productTitleMap[rev.productId] || 'کتاب چهل دروازه به ماورا';
            const likes = likesMap[rev.id] ?? Math.floor(Math.random() * 12) + 4;
            const isLiked = !!userLiked[rev.id];

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-5 border border-indigo-100/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Author Header */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#5243B2] font-bold text-xs flex items-center justify-center border border-indigo-200">
                        {rev.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="font-bold text-slate-900 text-xs">{rev.authorName}</h3>
                          {rev.verifiedPurchase && (
                            <CheckCircle size={13} className="text-emerald-600 fill-emerald-100" title="خریدار تاییدشده" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{rev.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stars & Product Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} size={12} className="fill-amber-400" />
                      ))}
                    </div>
                    <span className="bg-indigo-50 text-[#5243B2] font-bold text-[10px] px-2 py-0.5 rounded-md border border-indigo-100/80 truncate max-w-[140px]" title={prodTitle}>
                      {prodTitle}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-slate-700 leading-relaxed font-normal mb-4 text-justify">
                    «{sanitizeText(rev.comment)}»
                  </p>
                </div>

                {/* Footer Like */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    خریدار تاییدشده
                  </span>
                  <button
                    onClick={() => handleLike(rev.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                      isLiked
                        ? 'bg-rose-50 text-rose-600 font-bold'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                    aria-label="پسندیدن نظر"
                  >
                    <Heart size={12} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
                    <span>{likes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {visibleCount < filteredReviews.length && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="bg-white hover:bg-indigo-50 border border-indigo-200 text-[#5243B2] font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            >
              مشاهده نظرات بیشتر ({filteredReviews.length - visibleCount} نظر دیگر)
            </button>
          </div>
        )}

        {/* Clean Trust Badges */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-indigo-100">
          <div className="bg-white/80 p-4 rounded-xl border border-indigo-100/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-[#5243B2] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">تضمین اصالت محتوا</h4>
              <p className="text-[11px] text-slate-500">متدهای کاملاً علمی و اثبات‌شده</p>
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-indigo-100/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">پشتیبانی اختصاصی</h4>
              <p className="text-[11px] text-slate-500">پاسخگویی مستقیم استاد فرشاد میرشکاری</p>
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-indigo-100/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <MessageSquare size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">تحلیل خواب‌های شما</h4>
              <p className="text-[11px] text-slate-500">مشاوره تخصصی و عصب‌شناختی</p>
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-indigo-100/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ThumbsUp size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">ارسال سریع پستی</h4>
              <p className="text-[11px] text-slate-500">پست پیشتاز به سراسر کشور</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
