/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ArticleContentRendererProps {
  content: string;
  onSelectArticle?: (id: string) => void;
}

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
      <strong key={`${keyPrefix}-bold-${match.index}`} className="font-extrabold text-slate-900 bg-indigo-50/80 px-1 py-0.5 rounded border-b border-indigo-200">
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

const renderFormattedText = (text: string, onSelectArticle?: (id: string) => void) => {
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
          if (onSelectArticle) {
            onSelectArticle(target);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="inline-flex items-center gap-1 font-bold text-[#5243B2] hover:text-purple-700 underline underline-offset-4 cursor-pointer transition-colors px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 my-0.5 text-right"
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

const renderLinesBlock = (lines: string[], keyPrefix: string, onSelectArticle?: (id: string) => void) => {
  const listPattern = /^(\d+|[۰-۹]+)[\.\-]\s*|^[\-\*\•]\s*/;
  const isListBlock = lines.length > 0 && lines.some(l => listPattern.test(l));

  if (isListBlock) {
    return (
      <div key={keyPrefix} className="space-y-2.5 my-4">
        {lines.map((line, lineIdx) => {
          // Numbered list item
          const numMatch = line.match(/^(\d+|[۰-۹]+)[\.\-]\s*(.*)/);
          if (numMatch) {
            const num = numMatch[1];
            const itemText = numMatch[2];
            return (
              <div key={lineIdx} className="flex items-start gap-3 bg-slate-50/80 hover:bg-indigo-50/40 border border-slate-200/70 rounded-xl p-3.5 transition-colors">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#5243B2] text-white text-[11px] font-bold flex items-center justify-center shadow-2xs mt-0.5">
                  {num}
                </span>
                <div className="flex-1 text-slate-800 leading-relaxed text-xs md:text-sm font-normal">
                  {renderFormattedText(itemText, onSelectArticle)}
                </div>
              </div>
            );
          }

          // Bullet list item
          const bulletMatch = line.match(/^[\-\*\•]\s*(.*)/);
          if (bulletMatch) {
            const itemText = bulletMatch[1];
            return (
              <div key={lineIdx} className="flex items-start gap-3 bg-purple-50/30 hover:bg-purple-50/70 border border-purple-100 rounded-xl p-3.5 transition-colors">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#5243B2] mt-2 shadow-2xs" />
                <div className="flex-1 text-slate-800 leading-relaxed text-xs md:text-sm font-normal">
                  {renderFormattedText(itemText, onSelectArticle)}
                </div>
              </div>
            );
          }

          // Regular line inside list block
          return (
            <p key={lineIdx} className="leading-relaxed text-slate-800 my-1">
              {renderFormattedText(line, onSelectArticle)}
            </p>
          );
        })}
      </div>
    );
  }

  // Standard Paragraph
  return (
    <div key={keyPrefix} className="space-y-3 my-3">
      {lines.map((line, lIdx) => (
        <p key={lIdx} className="leading-relaxed text-slate-800">
          {renderFormattedText(line, onSelectArticle)}
        </p>
      ))}
    </div>
  );
};

export default function ArticleContentRenderer({ content, onSelectArticle }: ArticleContentRendererProps) {
  // 1. Sanitize input string so headings and lists are surrounded by double newlines
  const sanitizedContent = content
    .replace(/(?:\r?\n|^)(#{1,6}\s+[^\r\n]+)/g, '\n\n$1\n\n')
    .replace(/\n{3,}/g, '\n\n');

  // 2. Split into raw blocks by double linebreaks
  const rawBlocks = sanitizedContent.split(/\n\s*\n/);

  return (
    <div className="prose prose-slate max-w-none text-xs md:text-sm leading-relaxed text-slate-800 space-y-5 text-justify">
      {rawBlocks.map((block, blockIdx) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        const lines = trimmedBlock.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) return null;

        // Check first line of block
        const firstLine = lines[0];

        // 1. Check for H3 heading
        if (firstLine.startsWith('###')) {
          const h3Title = firstLine.replace(/^###\s*/, '').trim();
          const restLines = lines.slice(1);

          return (
            <React.Fragment key={blockIdx}>
              <h3 className="text-base md:text-lg font-black text-slate-900 mt-8 mb-4 border-r-4 border-[#5243B2] pr-3.5 flex items-center gap-2 leading-snug">
                {renderFormattedText(h3Title, onSelectArticle)}
              </h3>
              {restLines.length > 0 && renderLinesBlock(restLines, `${blockIdx}-rest`, onSelectArticle)}
            </React.Fragment>
          );
        }

        // 2. Check for H4 heading
        if (firstLine.startsWith('####')) {
          const h4Title = firstLine.replace(/^####\s*/, '').trim();
          const restLines = lines.slice(1);

          return (
            <React.Fragment key={blockIdx}>
              <h4 className="text-sm md:text-base font-extrabold text-slate-800 mt-6 mb-3 pr-3 border-r-2 border-purple-500 leading-snug">
                {renderFormattedText(h4Title, onSelectArticle)}
              </h4>
              {restLines.length > 0 && renderLinesBlock(restLines, `${blockIdx}-rest`, onSelectArticle)}
            </React.Fragment>
          );
        }

        // 3. Check for Callouts / Highlights
        if (
          firstLine.startsWith('**نکته') ||
          firstLine.startsWith('**هشدار') ||
          firstLine.startsWith('**توجه') ||
          firstLine.startsWith('**کلید') ||
          firstLine.startsWith('**پروتکل') ||
          firstLine.startsWith('**موفقیت') ||
          firstLine.startsWith('**منابع') ||
          firstLine.startsWith('**پاسخ')
        ) {
          return (
            <div key={blockIdx} className="bg-gradient-to-r from-amber-50/90 via-indigo-50/70 to-purple-50/70 border-r-4 border-amber-500 rounded-2xl p-4 md:p-5 my-5 shadow-2xs">
              <div className="text-xs md:text-sm leading-relaxed text-slate-900 font-medium space-y-2">
                {lines.map((l, idx) => (
                  <p key={idx}>{renderFormattedText(l, onSelectArticle)}</p>
                ))}
              </div>
            </div>
          );
        }

        // 4. Render lines block (lists or standard paragraphs)
        return renderLinesBlock(lines, blockIdx.toString(), onSelectArticle);
      })}
    </div>
  );
}
