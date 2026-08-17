/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import SEO from '../components/SEO';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

export default function Cart() {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    setCurrentPage, 
    couponCode, 
    discountPercentage, 
    applyCoupon, 
    removeCoupon 
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ isError: boolean; text: string } | null>(null);

  // Subtotal calculations
  const totalOriginalPrice = cart.reduce((acc, item) => {
    const price = item.product.price || item.product.salePrice || 0;
    return acc + price * item.quantity;
  }, 0);

  const totalSalePrice = cart.reduce((acc, item) => {
    const price = item.product.salePrice || item.product.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const directSavings = totalOriginalPrice - totalSalePrice;
  const couponDiscountAmount = Math.round(totalSalePrice * (discountPercentage / 100));
  const userSavings = directSavings + couponDiscountAmount;

  const amountAfterDiscount = totalSalePrice - couponDiscountAmount;

  // 10% VAT (مالیات بر ارزش افزوده)
  const vatAmount = Math.round(amountAfterDiscount * 0.10);

  // Determine if shipping is free (>= 2,000,000 Toman or digital-only)
  const isOnlyDigital = cart.every(
    item => item.product.type === 'pdf' || item.product.type === 'audio' || item.product.type === 'course'
  );

  const shippingFee = (amountAfterDiscount >= 2000000 || isOnlyDigital || cart.length === 0) ? 0 : 290000;

  const grandTotal = amountAfterDiscount + vatAmount + shippingFee;

  const formatPrice = (price: number) => {
    if (price === 0) return 'رایگان';
    return price.toLocaleString('fa-IR') + ' تومان';
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMessage(null);

    const res = applyCoupon(couponInput, totalSalePrice);
    if (res.success) {
      setCouponMessage({ isError: false, text: res.message });
      setCouponInput('');
    } else {
      setCouponMessage({ isError: true, text: res.message });
    }
  };

  return (
    <>
      <SEO 
        title="سبد خرید شما | آکادمی چهل دروازه" 
        description="بازبینی و نهایی‌سازی سبد خرید محصولات آموزشی رویابینی شفاف، پادکست‌ها، دوره‌های جامع و اعمال کدهای تخفیف ویژه."
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-indigo-100 py-16 text-center max-w-7xl mx-auto rounded-b-3xl mb-12 shadow-xs">
        <div className="max-w-xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span className="cursor-pointer hover:text-slate-900" onClick={() => setCurrentPage('home')}>صفحه اصلی</span>
            <span>/</span>
            <span className="text-indigo-600 font-bold">سبد خرید شما</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">سبد خرید آگاهی شما</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            محصولات، کتاب‌ها و فایل‌های انتخابی خود را مدیریت کرده و برای بیداری در رویا آماده شوید.
          </p>
        </div>
      </section>

      {/* Main Cart Grid: Items vs Totals panel */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
        
        {/* Items List (Span 8) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.length === 0 ? (
            <div className="p-16 rounded-3xl border border-indigo-100 bg-white text-center space-y-6 shadow-xs">
              <ShoppingBag size={56} className="text-slate-300 mx-auto stroke-1" />
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">سبد خرید شما در حال حاضر خالی است</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  می‌توانید به کتابخانه و فروشگاه برگشته و کلید بیداری خود را از میان کتب نفیس و فایل‌های صوتی انتخاب کنید.
                </p>
              </div>
              <button
                id="cart-empty-shop-cta"
                onClick={() => setCurrentPage('shop')}
                className="geom-button-primary text-white font-bold text-xs px-8 py-3 rounded-xl transition-all shadow-sm"
              >
                مشاهده فروشگاه
              </button>
            </div>
          ) : (
            cart.map((item, index) => {
              const price = item.product.salePrice || item.product.price;
              return (
                <div 
                  key={`${item.product.id}-${item.selectedFormat}-${index}`}
                  className="p-5 rounded-2xl bg-white border border-indigo-100 hover:border-purple-300 transition-all shadow-xs flex flex-col sm:flex-row gap-5 items-center justify-between"
                >
                  {/* Left segment: image and title details */}
                  <div className="flex gap-4 items-center w-full sm:w-auto">
                    <div className="w-16 h-22 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-1 text-right">
                      <h4 className="text-xs font-bold text-slate-900 leading-relaxed line-clamp-1">{item.product.title}</h4>
                      <p dir="ltr" className="text-[10px] text-indigo-600 font-mono tracking-widest uppercase text-right">{item.product.englishTitle}</p>
                      <span className="inline-block text-[9px] bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full mt-1.5 font-medium">
                        قالب: {item.selectedFormat}
                      </span>
                    </div>
                  </div>

                  {/* Right segment: quantity controller & price calculations */}
                  <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200 px-2.5 py-1">
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedFormat)}
                        className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
                        title="کاهش تعداد"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-900 px-2">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedFormat)}
                        className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
                        title="افزایش تعداد"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price and Trash button */}
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <span className="block text-xs font-bold text-slate-900 font-sans">{formatPrice(price * item.quantity)}</span>
                        {item.quantity > 1 && (
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">هر عدد {formatPrice(price)}</span>
                        )}
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id, item.selectedFormat)}
                        className="p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors border border-slate-200"
                        title="حذف از سبد"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Invoice Summary (Span 4) */}
        {cart.length > 0 && (
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-indigo-100 shadow-xs space-y-6 sticky top-24">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">خلاصه فاکتور خرید</h3>

              <div className="space-y-3.5 text-xs">
                
                {/* 1. جمع کل خرید شما */}
                <div className="flex justify-between text-slate-600">
                  <span>جمع کل خرید شما:</span>
                  <span className="font-mono text-slate-900 font-bold">{formatPrice(totalOriginalPrice)}</span>
                </div>

                {/* 2. سود شما از این خرید */}
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>سود شما از این خرید:</span>
                  <span className="font-mono">
                    {userSavings > 0 ? `-${formatPrice(userSavings)}` : '۰ تومان'}
                  </span>
                </div>

                {/* 3. مالیات بر ارزش افزوده */}
                <div className="flex justify-between text-slate-600">
                  <span>مالیات بر ارزش افزوده:</span>
                  <span className="font-mono text-slate-900 font-bold">{formatPrice(vatAmount)}</span>
                </div>

                {/* 4. هزینه بسته‌بندی و ارسال پستی */}
                <div className="flex justify-between text-slate-600">
                  <span>هزینه بسته‌بندی و ارسال پستی:</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {shippingFee === 0 ? 'رایگان' : formatPrice(shippingFee)}
                  </span>
                </div>

                {shippingFee > 0 && amountAfterDiscount < 2000000 && (
                  <div className="text-[11px] text-amber-950 leading-relaxed text-right bg-amber-50/90 border border-amber-200/90 p-2.5 rounded-xl font-medium flex items-center gap-2 shadow-xs">
                    <span className="animate-blink-lamp text-amber-500 text-sm shrink-0">💡</span>
                    <span>
                      فقط <strong className="text-amber-700 font-extrabold text-xs mx-0.5">{
                        (2000000 - amountAfterDiscount) % 1000 === 0 && (2000000 - amountAfterDiscount) < 1000000
                          ? `${((2000000 - amountAfterDiscount) / 1000).toLocaleString('fa-IR')} هزار تومان`
                          : `${(2000000 - amountAfterDiscount).toLocaleString('fa-IR')} تومان`
                      }</strong> تا رایگان شدن ارسال خرید شما
                    </span>
                  </div>
                )}

                {/* 5. مبلغ قابل پرداخت */}
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-indigo-700 text-base font-extrabold">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleCouponSubmit} className="space-y-2 border-t border-slate-100 pt-4">
                <label className="text-[11px] text-slate-500 block">کد تخفیف دارید؟ وارد نمایید:</label>
                <div className="flex gap-2">
                  <input
                    id="cart-coupon-input"
                    type="text"
                    required
                    placeholder="مانند: DREAM20"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 uppercase font-mono shadow-xs"
                  />
                  <button
                    id="apply-coupon-btn"
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 rounded-xl transition-all shadow-xs"
                  >
                    ثبت کد
                  </button>
                </div>
                
                {couponMessage && (
                  <span className={`text-[10px] block mt-1 font-medium ${couponMessage.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {couponMessage.isError ? `❌ ${couponMessage.text}` : `✅ ${couponMessage.text}`}
                  </span>
                )}
                {couponCode && (
                  <div className="flex justify-between items-center bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl text-[10px] text-indigo-900 mt-2 font-medium">
                    <span>کد فعال: <strong className="font-mono">{couponCode}</strong></span>
                    <button type="button" onClick={removeCoupon} className="text-slate-500 hover:text-slate-800 underline text-[9px]">حذف کد</button>
                  </div>
                )}
              </form>

              {/* Action Buttons */}
              <div className="space-y-3.5 pt-2">
                <button
                  id="checkout-proceed-btn"
                  onClick={() => setCurrentPage('checkout')}
                  className="w-full geom-button-primary text-white font-bold text-xs py-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-98 transition-all"
                >
                  <span>اقدام به پرداخت و تکمیل سفارش</span>
                  <ChevronRight size={14} className="rotate-180" />
                </button>
                
                <button
                  id="continue-shopping-btn"
                  onClick={() => setCurrentPage('shop')}
                  className="w-full border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 transition-colors text-xs py-3 rounded-xl text-center bg-slate-50"
                >
                  ادامه خرید در کتابخانه آثار
                </button>
              </div>

              {/* Trust features */}
              <div className="flex gap-2 justify-center pt-2 text-[10px] text-slate-500">
                <ShieldCheck size={14} className="text-indigo-600" />
                <span>تحویل ایمن و تضمین تایید تراکنش بانکی</span>
              </div>
            </div>
          </div>
        )}

      </section>
    </>
  );
}
