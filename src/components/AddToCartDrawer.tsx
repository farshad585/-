import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';
import { 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  Plus, 
  Minus,
  Trash2,
  Check, 
  ShoppingBag, 
  Sparkles, 
  Star,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AddToCartDrawer: React.FC = () => {
  const { 
    isCartDrawerOpen, 
    closeCartDrawer, 
    lastAddedItem, 
    cart, 
    addToCart, 
    removeFromCart,
    updateCartQuantity,
    setCurrentPage,
    setSelectedProductId
  } = useApp();

  const [addedTempIds, setAddedTempIds] = useState<string[]>([]);

  if (!isCartDrawerOpen) return null;

  const currentItem = lastAddedItem?.product;
  const itemFormat = lastAddedItem?.selectedFormat;
  const itemQuantity = lastAddedItem?.quantity || 1;

  // Filter recommendations (other items in catalog)
  const recommendations = PRODUCTS.filter(p => p.id !== currentItem?.id).slice(0, 4);

  // Total cart calculation
  const totalCartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartSubtotal = cart.reduce((acc, i) => {
    const price = i.product?.salePrice || i.product?.price || 0;
    return acc + price * i.quantity;
  }, 0);

  const handleGoToCart = () => {
    closeCartDrawer();
    setCurrentPage('cart');
  };

  const handleQuickAddRecommendation = (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(prod, 1);
    setAddedTempIds(prev => [...prev, prod.id]);
    setTimeout(() => {
      setAddedTempIds(prev => prev.filter(id => id !== prod.id));
    }, 2000);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'رایگان';
    return price.toLocaleString('fa-IR') + ' تومان';
  };

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <>
          {/* Dark Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCartDrawer}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Slide-up Bottom Sheet Drawer Container (Digikala Style) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 inset-x-0 sm:left-4 sm:right-auto sm:bottom-4 z-50 w-full max-w-lg sm:max-w-md mx-auto bg-white rounded-t-[28px] sm:rounded-3xl border-t sm:border border-slate-200/90 shadow-2xl flex flex-col justify-between text-slate-800 max-h-[78vh] sm:max-h-[85vh] overflow-hidden"
            dir="rtl"
          >
            {/* Top Drag Pill Handle (Digikala Mobile Style) */}
            <div className="w-10 h-1 bg-slate-300/80 rounded-full mx-auto mt-2.5 mb-0.5 shrink-0" />

            {/* Drawer Header (Digikala Style) */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
              {/* Right: Added Indicator with animated checkmark (20% smaller) */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center">
                  {/* Expanding Ring Ripple upon completion */}
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.4, 1.5], opacity: [0, 0.7, 0] }}
                    transition={{ duration: 0.65, delay: 0.85, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full bg-emerald-400/50 border border-emerald-300 pointer-events-none"
                  />

                  {/* Creative Sparkle Burst Dots on checkmark completion */}
                  {[0, 90, 180, 270].map((angle, idx) => (
                    <motion.span
                      key={angle}
                      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                      animate={{ 
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        x: [0, Math.cos((angle * Math.PI) / 180) * 13],
                        y: [0, Math.sin((angle * Math.PI) / 180) * 13],
                      }}
                      transition={{ duration: 0.55, delay: 0.82 + idx * 0.03, ease: "easeOut" }}
                      className="absolute w-1 h-1 rounded-full bg-amber-300 shadow-xs shadow-amber-300 pointer-events-none z-20"
                    />
                  ))}

                  {/* Main Emerald Badge Circle (20% smaller: w-6.5 h-6.5 / 26px) */}
                  <motion.div 
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ 
                      scale: [0.85, 1, 1.12, 1], 
                      opacity: 1 
                    }}
                    transition={{ 
                      scale: { times: [0, 0.2, 0.85, 1], duration: 0.95, delay: 0.15, ease: "easeInOut" },
                      opacity: { duration: 0.2, delay: 0.15 }
                    }}
                    className="relative w-6.5 h-6.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xs shadow-emerald-500/35 flex items-center justify-center shrink-0 border-2 border-white overflow-hidden"
                  >
                    {/* Light Shimmer sheen effect across badge */}
                    <motion.div
                      initial={{ x: "-100%", opacity: 0 }}
                      animate={{ x: "180%", opacity: [0, 0.8, 0] }}
                      transition={{ duration: 0.5, delay: 0.82, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/70 to-transparent -skew-x-12 pointer-events-none"
                    />

                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3.4" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-3.5 h-3.5 text-white drop-shadow-xs relative z-10"
                    >
                      <motion.path 
                        d="M4 12l5 5L19 6"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ 
                          pathLength: { duration: 0.68, ease: [0.25, 1, 0.5, 1], delay: 0.25 },
                          opacity: { duration: 0.08, delay: 0.25 }
                        }}
                      />
                    </svg>
                  </motion.div>
                </div>
                <span className="font-extrabold text-sm text-emerald-800">کالا اضافه شد!</span>
              </div>

              {/* Left: Go To Cart Button + Close Icon */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoToCart}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>برو به سبد خرید</span>
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={closeCartDrawer}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="بستن"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Drawer Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
              
              {/* Recently Added Product Box */}
              {currentItem && (() => {
                const mainCartItem = cart.find(i => i.product.id === currentItem.id && (!itemFormat || i.selectedFormat === itemFormat));
                const mainQty = mainCartItem ? mainCartItem.quantity : itemQuantity;
                const isCurrentDigital = currentItem.type === 'pdf' || currentItem.type === 'audio' || currentItem.type === 'course' || (itemFormat ? (itemFormat.includes('PDF') || itemFormat.includes('MP3') || itemFormat.includes('صوتی') || itemFormat.includes('الکترونیکی') || itemFormat.includes('دوره')) : false);

                return (
                  <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/40 border border-indigo-100 rounded-2xl p-3.5 flex gap-3 shadow-2xs">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 border border-indigo-100 shrink-0 shadow-2xs">
                      <img 
                        src={currentItem.images[0]} 
                        alt={currentItem.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-grow py-0.5">
                      <div>
                        <h3 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                          {currentItem.title}
                        </h3>
                        {itemFormat && (
                          <p className="text-[10px] text-indigo-700 font-medium mt-1 bg-white/80 border border-indigo-100 px-2 py-0.5 rounded-md w-fit">
                            {itemFormat}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-indigo-100/60 pt-2 mt-2">
                        <span className="text-xs font-black text-indigo-900 font-sans">
                          {formatPrice((currentItem.salePrice || currentItem.price) * mainQty)}
                        </span>

                        {/* Digikala/Snapp style quantity control pill widget */}
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white border border-rose-200/90 shadow-2xs rounded-xl px-2 py-0.5 flex items-center justify-between gap-2 text-rose-600 shrink-0 select-none"
                        >
                          <button
                            type="button"
                            disabled={isCurrentDigital && mainQty >= 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isCurrentDigital && mainQty >= 1) return;
                              addToCart(currentItem, 1, itemFormat, false);
                            }}
                            className={`p-1 rounded-md transition-colors cursor-pointer active:scale-90 ${
                              isCurrentDigital && mainQty >= 1 
                                ? 'opacity-35 cursor-not-allowed text-slate-300' 
                                : 'hover:bg-rose-50 text-rose-500 hover:text-rose-700'
                            }`}
                            title={isCurrentDigital && mainQty >= 1 ? "محصولات دیجیتال فقط ۱ نسخه قابل سفارش است" : "افزایش تعداد"}
                          >
                            <Plus size={13} />
                          </button>

                          <span className="font-extrabold text-xs text-rose-600 min-w-[12px] text-center font-sans">
                            {mainQty.toLocaleString('fa-IR')}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (mainQty <= 1) {
                                removeFromCart(currentItem.id, itemFormat);
                              } else {
                                updateCartQuantity(currentItem.id, mainQty - 1, itemFormat);
                              }
                            }}
                            className="p-1 rounded-md hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer active:scale-90"
                            title={mainQty === 1 ? "حذف از سبد" : "کاهش تعداد"}
                          >
                            {mainQty === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* "خریدت رو کامل‌تر کن" Section Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                    <Sparkles size={16} className="text-amber-500" />
                    <span>خریدت رو کامل‌تر کن</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">پیشنهادهای ویژه</span>
                </div>

                {/* Recommended Products List */}
                <div className="space-y-3">
                  {recommendations.map((rec) => {
                    const price = rec.salePrice || rec.price;
                    const cartItem = cart.find(item => item.product.id === rec.id);
                    const qtyInCart = cartItem ? cartItem.quantity : 0;
                    const isRecDigital = rec.type === 'pdf' || rec.type === 'audio' || rec.type === 'course' || (cartItem?.selectedFormat ? (cartItem.selectedFormat.includes('PDF') || cartItem.selectedFormat.includes('MP3') || cartItem.selectedFormat.includes('صوتی') || cartItem.selectedFormat.includes('الکترونیکی') || cartItem.selectedFormat.includes('دوره')) : false);

                    return (
                      <div 
                        key={rec.id}
                        onClick={() => {
                          closeCartDrawer();
                          setSelectedProductId(rec.id);
                        }}
                        className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                      >
                        {/* Image & Title */}
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-14 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                            <img 
                              src={rec.images[0]} 
                              alt={rec.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="overflow-hidden space-y-1">
                            <h5 className="font-bold text-xs text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                              {rec.title}
                            </h5>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5 text-[10px] font-mono text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                <span>{rec.rating.toLocaleString('fa-IR')}</span>
                                <Star size={9} className="fill-amber-400 text-amber-500" />
                              </div>
                            </div>

                            <p className="font-extrabold text-xs text-slate-800 font-sans pt-0.5">
                              {formatPrice(price)}
                            </p>
                          </div>
                        </div>

                        {/* Plus Add Button or Digikala Quantity Control Widget */}
                        {qtyInCart === 0 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(rec, 1, undefined, false);
                            }}
                            className="w-8 h-8 rounded-full bg-white hover:bg-rose-600 hover:text-white border border-rose-200/90 text-rose-600 flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-2xs hover:border-rose-600 active:scale-95"
                            title="افزودن به سبد خرید"
                          >
                            <Plus size={16} />
                          </button>
                        ) : (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white border border-rose-200/90 shadow-2xs rounded-xl px-2.5 py-1 flex items-center justify-between gap-2.5 text-rose-600 shrink-0 select-none"
                          >
                            <button
                              type="button"
                              disabled={isRecDigital && qtyInCart >= 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isRecDigital && qtyInCart >= 1) return;
                                const format = cartItem?.selectedFormat;
                                addToCart(rec, 1, format, false);
                              }}
                              className={`p-1 rounded-md transition-colors cursor-pointer active:scale-90 ${
                                isRecDigital && qtyInCart >= 1 
                                  ? 'opacity-35 cursor-not-allowed text-slate-300' 
                                  : 'hover:bg-rose-50 text-rose-500 hover:text-rose-700'
                              }`}
                              title={isRecDigital && qtyInCart >= 1 ? "محصولات دیجیتال فقط ۱ نسخه قابل سفارش است" : "افزایش تعداد"}
                            >
                              <Plus size={14} />
                            </button>

                            <span className="font-extrabold text-xs text-rose-600 min-w-[14px] text-center font-sans">
                              {qtyInCart.toLocaleString('fa-IR')}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!cartItem) return;
                                if (cartItem.quantity <= 1) {
                                  removeFromCart(rec.id, cartItem.selectedFormat);
                                } else {
                                  updateCartQuantity(rec.id, cartItem.quantity - 1, cartItem.selectedFormat);
                                }
                              }}
                              className="p-1 rounded-md hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer active:scale-90"
                              title={qtyInCart === 1 ? "حذف از سبد" : "کاهش تعداد"}
                            >
                              {qtyInCart === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Drawer Footer CTA Bar */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/90 space-y-3 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">مجموع اقلام ({totalCartCount.toLocaleString('fa-IR')} عدد):</span>
                <span className="font-extrabold text-sm text-slate-900 font-sans">{formatPrice(totalCartSubtotal)}</span>
              </div>

              <button
                onClick={handleGoToCart}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 active:scale-98 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag size={16} />
                <span>مشاهده سبد خرید و تکمیل سفارش</span>
                <ArrowLeft size={15} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
