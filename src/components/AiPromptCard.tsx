/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AiPromptProject, AiPromptImage } from '../data/aiPrompts';
import { 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Maximize2, 
  Lightbulb, 
  Sliders, 
  Video, 
  Image as ImageIcon,
  Compass,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AiPromptCardProps {
  key?: React.Key;
  project: AiPromptProject;
  onOpenLightbox?: (image: AiPromptImage, projectTitle: string) => void;
}

export default function AiPromptCard({ project, onOpenLightbox }: AiPromptCardProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isVideoPromptCopied, setIsVideoPromptCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'video' | 'negative'>('prompt');

  const currentImage = project.images[selectedImageIndex] || project.images[0];

  const handleCopyPrompt = async (textToCopy: string, isVideo = false) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      if (isVideo) {
        setIsVideoPromptCopied(true);
        setTimeout(() => setIsVideoPromptCopied(false), 2200);
      } else {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2200);
      }
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (isVideo) {
        setIsVideoPromptCopied(true);
        setTimeout(() => setIsVideoPromptCopied(false), 2200);
      } else {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2200);
      }
    }
  };

  const getImageTypeBadge = (type: AiPromptImage['type']) => {
    switch (type) {
      case 'output':
        return {
          label: 'خروجی نهایی',
          bg: 'bg-emerald-500/90 text-white',
          icon: Sparkles
        };
      case 'reference':
        return {
          label: 'تصویر مرجع',
          bg: 'bg-indigo-600/90 text-white',
          icon: Compass
        };
      case 'step':
        return {
          label: 'مراحل ساخت',
          bg: 'bg-purple-600/90 text-white',
          icon: Layers
        };
      default:
        return {
          label: 'تصویر پروژه',
          bg: 'bg-slate-700/90 text-white',
          icon: ImageIcon
        };
    }
  };

  const badgeInfo = getImageTypeBadge(currentImage?.type);
  const BadgeIcon = badgeInfo.icon;

  return (
    <article className="bg-white rounded-3xl border border-indigo-100/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      
      {/* 1. Multi-Image Showcase Section (Top) */}
      <div className="relative bg-slate-950 overflow-hidden">
        
        {/* Main Display Image */}
        <div className="relative aspect-video sm:aspect-[16/10] w-full overflow-hidden flex items-center justify-center bg-slate-900">
          <img 
            src={currentImage?.url} 
            alt={`${project.title} - ${currentImage?.title}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            referrerPolicy="no-referrer"
            loading="lazy"
          />

          {/* Gradient Overlay for Top Badges */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none" />

          {/* Top Badges Bar */}
          <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10 gap-2">
            {/* Active Image Stage Badge with File Name */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-md backdrop-blur-md max-w-[70%] truncate ${badgeInfo.bg}`}>
              <BadgeIcon size={13} className="animate-pulse shrink-0" />
              <span className="truncate font-mono" dir="auto">
                {currentImage?.fileName ? currentImage.fileName : `${badgeInfo.label}: ${currentImage?.title}`}
              </span>
            </div>

            {/* Slider Counter & Lightbox / Zoom Action */}
            <div className="flex items-center gap-1.5 shrink-0">
              {project.images.length > 1 && (
                <span className="px-2.5 py-1 rounded-xl bg-black/65 text-white/95 text-[11px] font-mono backdrop-blur-md shadow-xs border border-white/10">
                  {selectedImageIndex + 1} / {project.images.length}
                </span>
              )}
              {onOpenLightbox && (
                <button
                  type="button"
                  onClick={() => onOpenLightbox(currentImage, project.title)}
                  aria-label="مشاهده تصویر در ابعاد بزرگ"
                  className="p-2 rounded-xl bg-black/55 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-md"
                  title="بزرگ‌نمایی تصویر"
                >
                  <Maximize2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Slider Arrow Controls (Left & Right) */}
          {project.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
                }}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/55 hover:bg-indigo-600 text-white/90 hover:text-white backdrop-blur-md transition-all z-20 shadow-xl cursor-pointer hover:scale-110 active:scale-95"
                title="تصویر قبلی در گالری"
                aria-label="تصویر قبلی"
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev + 1) % project.images.length);
                }}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/55 hover:bg-indigo-600 text-white/90 hover:text-white backdrop-blur-md transition-all z-20 shadow-xl cursor-pointer hover:scale-110 active:scale-95"
                title="تصویر بعدی در گالری"
                aria-label="تصویر بعدی"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          )}

          {/* Bottom Caption on the Image */}
          {currentImage?.caption && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-right">
              <p className="text-[11px] text-slate-200 line-clamp-1 leading-normal font-light">
                {currentImage.caption}
              </p>
            </div>
          )}
        </div>

        {/* Multi-Image Switcher Tabs & Thumbnails */}
        {project.images.length > 1 && (
          <div className="bg-slate-900/95 border-t border-slate-800/80 px-3 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] text-slate-400 font-bold ml-1 shrink-0 flex items-center gap-1">
              <Layers size={12} className="text-indigo-400" />
              نماها ({project.images.length}):
            </span>
            
            <div className="flex items-center gap-2">
              {project.images.map((img, idx) => {
                const isSelected = selectedImageIndex === idx;
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/40 shadow-sm' 
                        : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {/* Tiny thumbnail preview */}
                    <img 
                      src={img.url} 
                      alt="" 
                      className="w-4 h-4 rounded-md object-cover inline-block"
                      referrerPolicy="no-referrer"
                    />
                    <span>{img.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Project Details Content */}
      <div className="p-5 sm:p-7 flex flex-col flex-grow space-y-5 text-right">
        
        {/* Header Tags & Title */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                {project.categoryLabel}
              </span>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                {project.model}
              </span>
            </div>
            
            <span className="text-[11px] text-slate-400 font-mono">
              {project.dateAdded}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
            {project.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
            {project.shortIdea}
          </p>
        </div>

        {/* Parameters Chips */}
        {project.parameters && project.parameters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 py-1">
            {project.parameters.map((param, pIdx) => (
              <div 
                key={pIdx} 
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-[11px] text-slate-700"
              >
                <Sliders size={11} className="text-indigo-500 shrink-0" />
                <span className="text-slate-500">{param.label}:</span>
                <span className="font-mono font-bold text-slate-800 dir-ltr">{param.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* 3. Prompt Showcase Box (Optimized for Long Text & Instant Copy) */}
        {(() => {
          const currentText = activeTab === 'prompt' 
            ? project.prompt 
            : activeTab === 'video' 
            ? (project.videoPrompt || '') 
            : (project.negativePrompt || '');
          const isPersian = /[\u0600-\u06FF]/.test(currentText);
          const mainPromptLabel = project.promptLabel || (project.category === 'video' ? 'Video Prompt' : 'پرامپت اصلی (Prompt)');

          return (
            <div className="space-y-2">
              {/* Tabs if there's also videoPrompt */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('prompt')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'prompt' 
                        ? 'bg-indigo-600 text-white shadow-xs font-bold' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {project.category === 'video' ? <Video size={13} /> : <Sparkles size={13} />}
                    <span>{mainPromptLabel}</span>
                  </button>

                  {project.videoPrompt && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('video')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'video' 
                          ? 'bg-purple-600 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Video size={13} />
                      <span>پرامپت حرکت ویدیو</span>
                    </button>
                  )}

                  {project.negativePrompt && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('negative')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'negative' 
                          ? 'bg-rose-600 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>Negative Prompt</span>
                    </button>
                  )}
                </div>

                {/* Quick Character info */}
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  {currentText.length} کاراکتر
                </span>
              </div>

              {/* The Prompt Container */}
              <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 shadow-inner overflow-hidden text-left">
                
                {/* Prompt Box Header Bar with Copy Button */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-indigo-800/40 bg-black/40">
                  <div className="flex items-center gap-2 text-[11px] text-indigo-300 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="uppercase tracking-wider font-bold">
                      {project.promptLabel && activeTab === 'prompt'
                        ? project.promptLabel.toUpperCase()
                        : activeTab === 'prompt' 
                        ? (project.category === 'video' ? 'VIDEO PROMPT' : 'AI PROMPT') 
                        : activeTab === 'video' 
                        ? 'VIDEO MOTION PROMPT' 
                        : 'NEGATIVE PROMPT'}
                    </span>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'prompt') handleCopyPrompt(project.prompt);
                      else if (activeTab === 'video' && project.videoPrompt) handleCopyPrompt(project.videoPrompt, true);
                      else if (activeTab === 'negative' && project.negativePrompt) handleCopyPrompt(project.negativePrompt);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-md cursor-pointer ${
                      (activeTab === 'prompt' && isCopied) || (activeTab === 'video' && isVideoPromptCopied)
                        ? 'bg-emerald-500 text-white scale-105 ring-2 ring-emerald-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-[1.02]'
                    }`}
                    title="کپی کردن پرامپت در کلیپ‌بورد"
                  >
                    {(activeTab === 'prompt' && isCopied) || (activeTab === 'video' && isVideoPromptCopied) ? (
                      <>
                        <Check size={14} className="stroke-[3]" />
                        <span>کپی شد! ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>کپی پرامپت (Copy)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Scrollable Prompt Text Box (High Readability) */}
                <div 
                  dir={isPersian ? 'rtl' : 'ltr'} 
                  className={`p-4 text-xs sm:text-sm text-indigo-50 leading-relaxed select-all overflow-y-auto ${
                    isPersian ? 'text-right font-sans' : 'text-left font-mono'
                  } ${
                    isExpanded ? 'max-h-[520px]' : 'max-h-52 sm:max-h-60'
                  }`}
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#4f46e5 #0f172a'
                  }}
                >
                  {activeTab === 'prompt' && (
                    <p className="whitespace-pre-wrap break-words selection:bg-indigo-600 selection:text-white">
                      {project.prompt}
                    </p>
                  )}

                  {activeTab === 'video' && project.videoPrompt && (
                    <p className="whitespace-pre-wrap break-words selection:bg-purple-600 selection:text-white text-purple-100">
                      {project.videoPrompt}
                    </p>
                  )}

                  {activeTab === 'negative' && project.negativePrompt && (
                    <p className="whitespace-pre-wrap break-words selection:bg-rose-600 selection:text-white text-rose-100">
                      {project.negativePrompt}
                    </p>
                  )}
                </div>

                {/* Expand / Collapse Button if Prompt is long */}
                <div className="border-t border-indigo-900/40 bg-black/30 px-3 py-1.5 flex justify-between items-center text-[11px] text-slate-400">
                  <span className="text-[10px] text-indigo-300/80">
                    {project.promptLabel ? 'آماده برای کپی و اجرا در مدل‌های هوش مصنوعی' : activeTab === 'prompt' ? 'آماده برای Midjourney / Flux / SD' : 'آماده برای Runway / Luma / Kling'}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-indigo-300 hover:text-white transition-colors cursor-pointer font-medium"
                  >
                    <span>{isExpanded ? 'مشاهده کمتر' : 'مشاهده تمام متن'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 4. Notes and Complementary Tips Section (بخش نکات و توضیحات تکمیلی) */}
        {project.tips && project.tips.length > 0 && (
          <div className="rounded-2xl bg-amber-50/70 border border-amber-200/90 p-4 space-y-2 text-right">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Lightbulb size={16} className="text-amber-600 fill-amber-500/20 shrink-0" />
              <span>نکات و توضیحات تکمیلی برای نتیجه بهتر:</span>
            </div>
            
            <ul className="space-y-1.5 pr-5 list-disc text-xs text-amber-950/90 leading-relaxed font-normal">
              {project.tips.map((tip, tIdx) => (
                <li key={tIdx} className="marker:text-amber-600">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags footer */}
        {project.tags && project.tags.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            <Tag size={12} className="text-slate-400 ml-1" />
            {project.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="text-[10px] text-slate-500 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-2 py-0.5 rounded-md transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

      </div>
    </article>
  );
}
