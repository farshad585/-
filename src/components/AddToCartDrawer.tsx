import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';
import { 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  Plus, 
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

          {/* Slide-over Drawer Container (Left Side) */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 left-0 z-50 w-full max-w-sm sm:max-w-md bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between text-slate-800"
            dir="rtl"
          >
            {/* Drawer Header (Digikala Style) */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
              {/* Right: Added Indicator */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} className="text-emerald-600" />
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
              {currentItem && (
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
                      <span className="text-[10px] text-slate-500 font-mono">تعداد: {itemQuantity.toLocaleString('fa-IR')}</span>
                      <span className="text-xs font-black text-indigo-900 font-sans">
                        {formatPrice(currentItem.salePrice || currentItem.price)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
                    const isAdded = addedTempIds.includes(rec.id);
                    const price = rec.salePrice || rec.price;

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

                        {/* Plus Add Button */}
                        <button
                          type="button"
                          onClick={(e) => handleQuickAddRecommendation(rec, e)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs ${
                            isAdded
                              ? 'bg-emerald-600 text-white border border-emerald-600'
                              : 'bg-white hover:bg-indigo-600 hover:text-white border border-slate-200 text-indigo-600 hover:border-indigo-600'
                          }`}
                          title="افزودن به سبد خرید"
                        >
                          {isAdded ? <Check size={16} /> : <Plus size={18} />}
                        </button>
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
