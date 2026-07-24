/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  key?: string | number;
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, wishlist, toggleWishlist, setSelectedProductId } = useApp();

  const isWishlisted = wishlist.includes(product.id);
  const discountPercent = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
    : 0;

  const formatPrice = (price: number) => {
    if (price === 0) return 'رایگان';
    return price.toLocaleString('fa-IR') + ' تومان';
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    // Visual feedback
    alert(`«${product.title}» به سبد خرید اضافه شد.`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleCardClick = () => {
    setSelectedProductId(product.id);
  };

  const getTypeLabel = (type: Product['type']) => {
    switch (type) {
      case 'printed': return 'کتاب چاپی';
      case 'pdf': return 'نسخه PDF';
      case 'audio': return 'کتاب صوتی';
      case 'course': return 'دوره آموزشی';
      default: return 'محصول';
    }
  };

  const getTypeColor = (type: Product['type']) => {
    switch (type) {
      case 'printed': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'pdf': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'audio': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'course': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="relative group h-full">
      {/* Outer offset frame */}
      <div className="absolute -inset-1.5 border border-indigo-200 translate-x-1 translate-y-1 -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-all duration-300 rounded-xl" />
      
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        onClick={handleCardClick}
        className="bg-white rounded-xl overflow-hidden cursor-pointer border border-indigo-100 hover:border-purple-300 transition-all flex flex-col h-full relative shadow-xs hover:shadow-md"
      >
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 right-3 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
            {discountPercent.toLocaleString('fa-IR')}٪ تخفیف
          </span>
        )}

        {/* Stock warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-xs">
            فقط {product.stock.toLocaleString('fa-IR')} عدد باقی مانده!
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 z-10 bg-slate-700 text-slate-200 text-[9px] px-2 py-0.5 rounded-full font-medium">
            ناموجود
          </span>
        )}

        {/* Image Container with Hover zoom */}
        <div className="relative aspect-3/4 overflow-hidden bg-slate-100 border-b border-slate-100">
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          {/* Hover action overlay */}
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-xs">
            <button
              onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
              className="p-2.5 bg-white hover:bg-indigo-600 hover:text-white rounded-full text-slate-800 transition-colors shadow-md"
              title="مشاهده جزئیات"
            >
              <Eye size={16} />
            </button>
            {product.stock > 0 && (
              <button
                onClick={handleQuickAdd}
                className="p-2.5 bg-white hover:bg-indigo-600 hover:text-white rounded-full text-slate-800 transition-colors shadow-md"
                title="افزودن سریع به سبد"
              >
                <ShoppingCart size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 flex flex-col flex-grow justify-between gap-3">
          <div>
            {/* Tag / Category and Badge Type */}
            <div className="flex justify-between items-center mb-2.5">
              <span className={`text-[9px] px-2.5 py-0.5 rounded-full border ${getTypeColor(product.type)} font-bold`}>
                {getTypeLabel(product.type)}
              </span>
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <span className="text-[10px] text-amber-900 font-mono font-bold">{product.rating.toLocaleString('fa-IR')}</span>
                <Star size={10} className="fill-amber-400 text-amber-500" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xs font-bold text-slate-900 leading-relaxed line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1">
              {product.title}
            </h3>

            {/* English Subtitle */}
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider truncate mb-2">
              {product.englishTitle}
            </p>

            {/* Short description */}
            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Pricing & Cart Action Row */}
          <div className="border-t border-slate-100 pt-3 flex justify-between items-center mt-auto">
            {/* Prices */}
            <div className="flex flex-col">
              {product.salePrice ? (
                <>
                  <span className="text-[10px] text-slate-400 line-through font-mono">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs font-bold text-indigo-700 font-sans">
                    {formatPrice(product.salePrice)}
                  </span>
                </>
              ) : (
                <span className="text-xs font-bold text-slate-900 font-sans">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Quick Add and Wishlist */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleWishlistClick}
                className={`p-1.5 rounded-lg transition-colors border ${
                  isWishlisted 
                    ? 'bg-purple-100 text-purple-700 border-purple-300' 
                    : 'bg-slate-100 text-slate-400 hover:text-indigo-600 border-transparent'
                }`}
                title={isWishlisted ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
              >
                <Heart size={13} className={isWishlisted ? 'fill-purple-600 text-purple-600' : ''} />
              </button>
              
              {product.stock > 0 && (
                <button
                  onClick={handleQuickAdd}
                  className="p-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
                  title="خرید"
                >
                  <ShoppingCart size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
