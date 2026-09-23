/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AI_PROMPTS, AiPromptProject, AiPromptImage } from '../data/aiPrompts';
import AiPromptCard from '../components/AiPromptCard';
import SEO from '../components/SEO';
import { 
  Sparkles, 
  Search, 
  X, 
  SlidersHorizontal, 
  Layers, 
  HelpCircle, 
  ArrowLeft, 
  ChevronRight,
  Maximize2,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  Code2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AIPrompts() {
  const { setCurrentPage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLightbox, setActiveLightbox] = useState<{
    image: AiPromptImage;
    projectTitle: string;
  } | null>(null);

  // Keyboard escape for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightbox(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter categories
  const categories = [
    { id: 'all', label: 'همه پرامپت‌ها' },
    { id: 'image', label: 'تولید تصویر' },
    { id: 'video', label: 'تصویر و ویدیو' },
    { id: 'cinematic', label: 'سبک سینمایی' },
    { id: 'character', label: 'طراحی کاراکتر' },
    { id: 'surreal', label: 'سورئال و انتزاعی' },
  ];

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return AI_PROMPTS.filter((proj) => {
      const matchesCategory = selectedCategory === 'all' || proj.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesSearch = 
        proj.title.toLowerCase().includes(q) ||
        proj.shortIdea.toLowerCase().includes(q) ||
        proj.prompt.toLowerCase().includes(q) ||
        (proj.videoPrompt && proj.videoPrompt.toLowerCase().includes(q)) ||
        proj.model.toLowerCase().includes(q) ||
        (proj.tags && proj.tags.some(t => t.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <>
      <SEO 
        title="AI Prompts"
        description="پرامپتهای آماده برای ساخت تصاویر و ویدیوهای هوش مصنوعی - پرامپت‌های مهندسی‌شده با تصاویر مرجع، خروجی نهایی و مراحل ساخت"
        ogType="website"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-16">
        
        {/* 1. Header Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 text-white p-8 sm:p-12 shadow-xl border border-purple-800/40">
          
          {/* Subtle cosmic background glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
            
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-xs text-indigo-200/90 font-medium">
              <button 
                onClick={() => setCurrentPage('home')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                صفحه اصلی
              </button>
              <ChevronRight size={12} />
              <span className="text-amber-300 font-bold">AI Prompts</span>
            </div>

            {/* Main Title Required: "AI Prompts" */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-3">
              <Sparkles className="text-amber-400 w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
              <span>AI Prompts</span>
            </h1>

            {/* Subtitle Required: "پرامپتهای آماده برای ساخت تصاویر و ویدیوهای هوش مصنوعی" */}
            <p className="text-base sm:text-lg text-indigo-100/90 font-light leading-relaxed max-w-2xl mx-auto">
              پرامپتهای آماده برای ساخت تصاویر و ویدیوهای هوش مصنوعی
            </p>

            {/* Feature Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                کپی با ۱ کلیک
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 flex items-center gap-1.5">
                <Layers size={14} className="text-purple-300" />
                دارای تصاویر مرجع، خروجی و مراحل ساخت
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 flex items-center gap-1.5">
                <Code2 size={14} className="text-amber-300" />
                سازگار با Midjourney v6.1, Flux.1, Runway & Luma
              </span>
            </div>

          </div>
        </section>

        {/* 2. Search & Categories Filter Toolbar */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1.5 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-105'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative w-full md:w-80">
              <input
                id="ai-prompt-search"
                type="text"
                placeholder="جستجو در پرامپت‌ها، مدل‌ها یا موضوعات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-xs"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              ) : (
                <Search size={14} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
              )}
            </div>

          </div>

          {/* Results count & active search summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              نمایش <strong className="text-indigo-600 font-bold">{filteredProjects.length}</strong> پرامپت هوش مصنوعی
              {selectedCategory !== 'all' && ` در دسته‌بندی «${categories.find(c => c.id === selectedCategory)?.label}»`}
            </span>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-indigo-600 hover:underline font-semibold"
              >
                پاک کردن فیلتر جستجو
              </button>
            )}
          </div>
        </section>

        {/* 3. AI Prompts Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">هیچ پرامپتی با این مشخصات یافت نشد</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              عبارت دیگری را جستجو کنید یا فیلتر دسته‌بندی را به «همه پرامپت‌ها» تغییر دهید.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-xl"
            >
              نمایش همه پرامپت‌ها
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
            {filteredProjects.map((project) => (
              <AiPromptCard 
                key={project.id} 
                project={project}
                onOpenLightbox={(img, title) => setActiveLightbox({ image: img, projectTitle: title })}
              />
            ))}
          </div>
        )}

        {/* 4. Educational Guide & Tips Footer Callout */}
        <section className="bg-white rounded-3xl border border-indigo-100 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <HelpCircle size={22} />
            </div>
            <div className="text-right">
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                راهنمای سریع استفاده از پرامپت‌های آماده
              </h3>
              <p className="text-xs text-slate-500 font-light">
                چگونه پرامپت‌های بالا را در Midjourney، Flux، Runway و سایر هوش‌های مصنوعی اجرا کنیم؟
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center">۱</span>
              <h4 className="text-xs font-bold text-slate-800">کپی متن پرامپت با یک کلیک</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                روی دکمه «کپی پرامپت» در هر کارت کلیک کنید. متن کامل شامل تمام جزئیات فنی فوراً در حافظه شما ذخیره می‌شود.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center">۲</span>
              <h4 className="text-xs font-bold text-slate-800">جای‌گذاری در هوش مصنوعی</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                در دیسکورد میدجرنی از دستور <code className="font-mono text-indigo-600">/imagine</code> استفاده کنید یا متن را در رابط کاربری Flux و Stable Diffusion جای‌گذاری نمایید.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center">۳</span>
              <h4 className="text-xs font-bold text-slate-800">تطبیق پارامترها و خلاقیت</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                پارامترهایی مانند نسبت ابعاد (<span className="font-mono text-indigo-600 dir-ltr">--ar 16:9</span>) و میزان استایلایز را بر اساس نکات تکمیلی پایین هر کارت تنظیم فرمایید.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* 5. Image Lightbox Modal for High-Resolution View */}
      <AnimatePresence>
        {activeLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightbox(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
          >
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="relative max-w-5xl max-h-[90vh] flex flex-col bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl cursor-default"
            >
              {/* Lightbox Header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 text-white">
                <div className="text-right">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{activeLightbox.projectTitle}</h4>
                  <p className="text-xs text-indigo-400 font-medium">{activeLightbox.image.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLightbox(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="بستن پنجره بزرگ‌نمایی"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Lightbox Image Container */}
              <div className="relative overflow-auto flex items-center justify-center bg-black p-2">
                <img 
                  src={activeLightbox.image.url} 
                  alt={activeLightbox.image.title}
                  className="max-h-[75vh] w-auto object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Lightbox Caption */}
              {activeLightbox.image.caption && (
                <div className="p-4 bg-slate-950 text-right border-t border-slate-800">
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {activeLightbox.image.caption}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
