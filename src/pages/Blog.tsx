/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BLOG_ARTICLES } from '../data/blog';
import { BlogArticle } from '../types';
import SEO from '../components/SEO';
import { 
  BookOpen, 
  Clock, 
  User, 
  ArrowLeft, 
  Share2, 
  Heart, 
  ChevronRight,
  Search,
  MessageCircle,
  Bookmark
} from 'lucide-react';
import { motion } from 'motion/react';

const renderBoldText = (str: string, keyPrefix: string) => {
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={`${keyPrefix}-bold-${match.index}`} className="font-extrabold text-slate-900">
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return parts;
};

const renderFormattedText = (text: string, onSelectArticle: (id: string) => void) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderBoldText(text.substring(lastIndex, match.index), `text-${lastIndex}`));
    }
    const label = match[1];
    const target = match[2];

    parts.push(
      <button
        key={`link-${match.index}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelectArticle(target);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-purple-700 underline underline-offset-4 cursor-pointer transition-colors px-1 py-0.5 rounded bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/50 my-0.5 text-right"
      >
        <span>{label}</span>
      </button>
    );

    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(renderBoldText(text.substring(lastIndex), `text-${lastIndex}`));
  }

  return parts;
};

export default function Blog() {
  const { selectedArticleId, setSelectedArticleId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [likedArticles, setLikedArticles] = useState<string[]>([]);
  const [readProgress, setReadProgress] = useState(0);

  // Manage reading progress bar for details page
  useEffect(() => {
    const handleScroll = () => {
      if (!selectedArticleId) return;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setReadProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedArticleId]);

  // Find active article
  const activeArticle = useMemo(() => {
    return BLOG_ARTICLES.find(a => a.id === selectedArticleId || a.slug === selectedArticleId);
  }, [selectedArticleId]);

  // Reset progress when closing article
  useEffect(() => {
    if (!selectedArticleId) setReadProgress(0);
  }, [selectedArticleId]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    BLOG_ARTICLES.forEach(a => a.tags.forEach(t => tags.add(t)));
    return ['all', ...Array.from(tags)];
  }, []);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return BLOG_ARTICLES.filter(a => {
      const matchTag = selectedTag === 'all' || a.tags.includes(selectedTag);
      const matchSearch = !searchQuery.trim() || 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTag && matchSearch;
    });
  }, [selectedTag, searchQuery]);

  const handleShare = (title: string) => {
    if (navigator.share) {
      navigator.share({
        title,
        url: window.location.href
      }).catch(console.error);
    } else {
      alert(`لینک مقاله «${title}» کپی شد. می‌توانید آن را با دوستان خود به اشتراک بگذارید.`);
    }
  };

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedArticles(prev => 
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  // 1. DETAIL ARTICLE READER VIEW
  if (activeArticle) {
    const isLiked = likedArticles.includes(activeArticle.id);
    const relatedPosts = BLOG_ARTICLES.filter(a => a.id !== activeArticle.id).slice(0, 2);

    return (
      <>
        <SEO 
          title={activeArticle.title} 
          description={activeArticle.excerpt}
          ogType="article"
          ogImage={activeArticle.image}
        />

        {/* Floating reading progress bar */}
        <div className="fixed top-20 left-0 right-0 h-1 bg-indigo-50 z-50">
          <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-75" style={{ width: `${readProgress}%` }} />
        </div>

        {/* Article Container */}
        <article className="max-w-3xl mx-auto px-4 py-8 space-y-8 mb-20 text-right">
          
          {/* Back Trigger */}
          <button
            onClick={() => setSelectedArticleId(null)}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-600 transition-colors pb-4 font-medium"
          >
            <ChevronRight size={14} />
            <span>بازگشت به مقالات مجله آگاهی</span>
          </button>

          {/* Article Image Header */}
          <div className="aspect-video w-full rounded-3xl overflow-hidden border border-indigo-100 bg-slate-100 shadow-sm relative">
            <img 
              src={activeArticle.image} 
              alt={activeArticle.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* overlay badge */}
            <span className="absolute bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[10px] px-3.5 py-1 rounded-full uppercase shadow-md">
              {activeArticle.category}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-indigo-600" />
              <span>نویسنده: {activeArticle.author}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-indigo-600" />
              <span>زمان مطالعه: {activeArticle.readTime}</span>
            </div>
            <span>•</span>
            <span>تاریخ انتشار: {activeArticle.date}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-normal">
            {activeArticle.title}
          </h1>

          {/* Content Body formatted elegantly */}
          <div className="prose prose-slate max-w-none text-xs md:text-sm leading-relaxed text-slate-700 space-y-6 text-justify">
            {activeArticle.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('###')) {
                return (
                  <h3 key={index} className="text-sm font-extrabold text-slate-900 mt-8 mb-4 border-r-4 border-indigo-600 pr-3">
                    {paragraph.replace('###', '').trim()}
                  </h3>
                );
              }
              if (paragraph.startsWith('1.') || paragraph.startsWith('**')) {
                return (
                  <div key={index} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 my-4">
                    <p className="text-xs leading-normal text-indigo-950 font-medium">
                      {renderFormattedText(paragraph, setSelectedArticleId)}
                    </p>
                  </div>
                );
              }
              return (
                <p key={index} className="leading-relaxed">
                  {renderFormattedText(paragraph, setSelectedArticleId)}
                </p>
              );
            })}
          </div>

          {/* Social share & bookmark panel */}
          <div className="flex justify-between items-center pt-8 border-t border-slate-200">
            <div className="flex gap-2 flex-wrap">
              {activeArticle.tags.map(tag => (
                <span key={tag} className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => handleLike(activeArticle.id, e)}
                className={`p-2 rounded-full border transition-all ${
                  isLiked 
                    ? 'bg-purple-100 text-purple-700 border-purple-300' 
                    : 'bg-slate-100 text-slate-500 hover:text-indigo-600 border-slate-200'
                }`}
                title="پسندیدن مقاله"
              >
                <Heart size={16} className={isLiked ? 'fill-purple-600 text-purple-600' : ''} />
              </button>
              <button
                onClick={() => handleShare(activeArticle.title)}
                className="p-2 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-full text-slate-600 transition-colors border border-slate-200"
                title="اشتراک گذاری"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Related Articles Reading Block */}
          <div className="pt-12 border-t border-slate-200 space-y-6">
            <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen size={14} className="text-indigo-600" />
              <span>پیشنهاد برای مطالعه بیشتر</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map(post => (
                <div 
                  key={post.id}
                  onClick={() => setSelectedArticleId(post.id)}
                  className="p-5 rounded-2xl bg-white border border-indigo-100 hover:border-purple-300 transition-all cursor-pointer space-y-3 shadow-xs hover:shadow-md"
                >
                  <span className="text-[9px] text-indigo-600 font-bold uppercase">{post.category}</span>
                  <h5 className="text-xs font-bold text-slate-900 line-clamp-1 leading-normal hover:text-indigo-600 transition-colors">{post.title}</h5>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                </div>
              ))}
            </div>
          </div>

        </article>
      </>
    );
  }

  // 2. CURATED BLOG LISTINGS
  return (
    <>
      <SEO 
        title="مجله علمی رویابینی | مقالات و یافته‌ها" 
        description="وبلاگ تخصصی و مجله آگاهی چهل دروازه شامل ۱۲ مقاله آموزشی، بیولوژی خواب REM، درمان کابوس و روش‌های القای رویابینی شفاف."
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-indigo-100 py-16 text-center max-w-7xl mx-auto rounded-b-3xl mb-12 shadow-xs">
        <div className="max-w-xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>صفحه اصلی</span>
            <span>/</span>
            <span className="text-indigo-600 font-bold">مجله آگاهی ({BLOG_ARTICLES.length} مقاله)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">نشریه و مجله تخصصی خواب شفاف</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            جدیدترین مقالات پژوهشی، ترفندهای تکنیکی و تفاسیر روانشناختی در حوزه بیداری ضمیر ناخودآگاه.
          </p>
        </div>
      </section>

      {/* Blog Search & Filters */}
      <section className="max-w-7xl mx-auto px-4 space-y-6 mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Tags Filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1 scrollbar-none">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedTag === tag
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300'
                }`}
              >
                {tag === 'all' ? 'همه مقالات' : `#${tag}`}
              </button>
            ))}
          </div>

          {/* Search bar inside blog */}
          <div className="relative w-full md:w-64">
            <input
              id="blog-search"
              type="text"
              placeholder="جستجو در متن مقالات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
            />
            <Search size={14} className="absolute left-3 top-3.5 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        {filteredArticles.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 gap-4">
            <BookOpen size={40} className="text-slate-300" />
            <p className="text-xs">هیچ مقاله‌ای با این معیارهای جستجو یافت نشد.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map(article => {
              const isLiked = likedArticles.includes(article.id);
              return (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticleId(article.id)}
                  className="rounded-2xl overflow-hidden bg-white border border-indigo-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer group shadow-xs"
                >
                  {/* Article Card Image */}
                  <div className="aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-100 relative">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      {article.category}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col justify-between flex-grow gap-4 text-right">
                    <div className="space-y-2">
                      {/* Meta reading stats */}
                      <div className="flex gap-3 text-[10px] text-slate-400 font-mono">
                        <span>{article.date}</span>
                        <span>•</span>
                        <span>{article.readTime}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-relaxed line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    {/* Bottom stats row */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-auto">
                      <span className="text-[10px] text-indigo-600 hover:text-purple-700 font-semibold flex items-center gap-1">
                        <span>مطالعه مقاله</span>
                        <ArrowLeft size={10} className="group-hover:-translate-x-1 transition-transform" />
                      </span>

                      {/* Like button overlay */}
                      <button
                        onClick={(e) => handleLike(article.id, e)}
                        className={`p-1.5 rounded-full border transition-colors ${
                          isLiked 
                            ? 'bg-purple-100 text-purple-700 border-purple-300' 
                            : 'bg-slate-100 text-slate-400 hover:text-indigo-600 border-transparent'
                        }`}
                        title="پسندیدن"
                      >
                        <Heart size={12} className={isLiked ? 'fill-purple-600 text-purple-600' : ''} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
