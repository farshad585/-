/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PRODUCTS, REVIEWS } from '../data/products';
import { Product, Review } from '../types';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Truck, 
  Clock, 
  BookOpen, 
  Lock, 
  ArrowLeft,
  ChevronRight,
  ZoomIn,
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ProductDetails() {
  const { 
    selectedProductId, 
    setSelectedProductId, 
    addToCart, 
    wishlist, 
    toggleWishlist,
    addToRecentlyViewed
  } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Variations Selector State
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  
  // Shipping calculator
  const [selectedProvince, setSelectedProvince] = useState('tehran');
  const [shippingCost, setShippingCost] = useState<number>(25000);

  // New review form
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [localReviews, setLocalReviews] = useState<Review[]>([]);

  // Find product by selected ID
  useEffect(() => {
    if (selectedProductId) {
      const found = PRODUCTS.find((p) => p.id === selectedProductId);
      if (found) {
        setProduct(found);
        setSelectedImageIndex(0);
        addToRecentlyViewed(found.id);
        // Default format based on type
        const defaultFormatLabel = 
          found.type === 'pdf' ? 'کتاب الکترونیکی PDF' : 
          found.type === 'audio' ? 'کتاب صوتی MP3' : 
          found.type === 'course' ? 'دوره ویدیویی آنلاین' : 'کیفیت معمولی';
        setSelectedFormat(defaultFormatLabel);
      }
    }
  }, [selectedProductId]);

  // Load reviews on product load
  useEffect(() => {
    if (product) {
      const prodReviews = REVIEWS.filter((r) => r.productId === product.id);
      setLocalReviews(prodReviews);
    }
  }, [product]);

  // Handle shipping calc
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prov = e.target.value;
    setSelectedProvince(prov);
    
    const price = product ? (product.salePrice || product.price) : 0;
    if (price >= 500000 || product?.type === 'pdf' || product?.type === 'audio' || product?.type === 'course') {
      setShippingCost(0); // Free delivery for digital or over 500,000 Toman
    } else {
      setShippingCost(prov === 'tehran' ? 25000 : 38000);
    }
  };

  // Submit Review Form
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    const newReview: Review = {
      id: 'rev-local-' + Date.now(),
      productId: product!.id,
      authorName: reviewName,
      rating: reviewRating,
      date: new Date().toLocaleDateString('fa-IR'),
      comment: reviewComment,
      verifiedPurchase: true
    };

    setLocalReviews((prev) => [newReview, ...prev]);
    setReviewName('');
    setReviewComment('');
    setNotification('سپاس از نظر ارزشمند شما! دیدگاه شما پس از تایید مدیر وب‌سایت نمایش داده خواهد شد.');
    setTimeout(() => setNotification(null), 5000);
  };

  if (!product) {
    return (
      <div className="h-96 max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-gray-400">در حال بارگذاری اطلاعات محصول...</p>
        <button onClick={() => setSelectedProductId('45322')} className="text-gold-400 font-bold underline">
          مشاهده محصول نمونه
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);

  // Calculate dynamic price based on print quality or format selection
  const getQualityPricing = () => {
    if (product.id === '45363') { // 4-volume set
      if (selectedFormat.includes('تمام رنگی')) {
        return { originalPrice: 2999000, finalPrice: 2549150, discountPercent: 15 };
      }
      return { originalPrice: 1999000, finalPrice: 1699150, discountPercent: 15 };
    }

    if (product.id === '45322') { // Farasouy Reality
      if (selectedFormat.includes('بالک سبک')) {
        return { originalPrice: 439000, finalPrice: 395100, discountPercent: 10 };
      }
      if (selectedFormat.includes('تمام رنگی')) {
        return { originalPrice: 499000, finalPrice: 449100, discountPercent: 10 };
      }
      return { originalPrice: 399000, finalPrice: 359100, discountPercent: 10 };
    }

    if (product.id === '45329') { // Creator of Dreams
      if (selectedFormat.includes('تمام رنگی')) {
        return { originalPrice: 499000, finalPrice: 449100, discountPercent: 10 };
      }
      return { originalPrice: 399000, finalPrice: 359100, discountPercent: 10 };
    }

    const orig = product.price;
    const finalP = product.salePrice || product.price;
    const disc = orig > finalP ? Math.round(((orig - finalP) / orig) * 100) : 0;
    return { originalPrice: orig, finalPrice: finalP, discountPercent: disc };
  };

  const { originalPrice, finalPrice, discountPercent } = getQualityPricing();
  const finalTomanPrice = finalPrice;

  // Related products
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <>
      <SEO 
        title={product.title} 
        description={product.shortDescription}
        ogType="product"
        ogImage={product.images[0]}
        schema={{
          '@type': 'Product',
          'name': product.title,
          'image': product.images[0],
          'description': product.shortDescription,
          'sku': product.id,
          'offers': {
            '@type': 'Offer',
            'price': finalTomanPrice,
            'priceCurrency': 'IRR',
            'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
          }
        }}
      />

      {/* Premium custom floating notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-indigo-500 p-4 rounded-2xl shadow-xl text-xs text-indigo-950 flex items-center gap-3 max-w-md w-11/12 justify-center font-bold text-center"
          >
            <Sparkles size={16} className="text-indigo-600 shrink-0" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumbs */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span className="cursor-pointer hover:text-slate-900" onClick={() => setSelectedProductId(null)}>خانه</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-slate-900" onClick={() => setSelectedProductId(null)}>فروشگاه آثار</span>
          <span>/</span>
          <span className="text-indigo-600 font-bold">{product.title}</span>
        </div>
      </section>

      {/* Main product structure */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        
        {/* Left Column: Image Gallery (Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div 
            onClick={() => setIsZoomOpen(true)}
            className="aspect-3/4 rounded-3xl overflow-hidden bg-slate-100 border border-indigo-100 shadow-sm relative group cursor-zoom-in"
          >
            <img 
              src={product.images[selectedImageIndex] || product.images[0]} 
              alt={product.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 left-4 p-2.5 bg-slate-900/80 rounded-full text-white flex items-center justify-center backdrop-blur-xs">
              <ZoomIn size={16} />
            </div>
          </div>

          {/* Thumbnail Gallery for Multiple Images */}
          {product.images && product.images.length > 1 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-indigo-600 scale-105 shadow-md'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.title} - تصویر ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-center text-slate-400">
                گالری {product.images.length} تصویر واقعی محصول (کلیک جهت مشاهده)
              </p>
            </div>
          )}

          <p className="text-[10px] text-center text-slate-400">برای بزرگنمایی تصویر روی آن کلیک کنید</p>
        </div>

        {/* Right Column: Title, Short desc, Variations, CTAs (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full w-fit block font-bold">
              {product.type === 'printed' ? 'محصول فیزیکی گرانبها' : 'محصول دیجیتال با دسترسی آنی'}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-normal">{product.title}</h1>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{product.englishTitle}</p>
          </div>

          {/* Rating stars */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={15} 
                  className={i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} 
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {product.rating.toLocaleString('fa-IR')} از ۵ ({localReviews.length.toLocaleString('fa-IR')} نظر ثبت شده)
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-white border border-indigo-100 p-4 rounded-2xl shadow-xs">
            {product.shortDescription}
          </p>

          {/* Pricing Box */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 rounded-2xl p-4 w-fit shadow-xs">
            <div className="flex flex-col">
              {originalPrice > finalPrice ? (
                <>
                  <span className="text-xs text-slate-400 line-through font-mono">
                    {originalPrice === 0 ? 'رایگان' : originalPrice.toLocaleString('fa-IR') + ' تومان'}
                  </span>
                  <span className="text-lg font-black text-indigo-900 font-sans">
                    {finalPrice === 0 ? 'رایگان' : finalPrice.toLocaleString('fa-IR') + ' تومان'}
                  </span>
                </>
              ) : (
                <span className="text-lg font-black text-slate-900 font-sans">
                  {finalPrice === 0 ? 'رایگان' : finalPrice.toLocaleString('fa-IR') + ' تومان'}
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-xs">
                {discountPercent.toLocaleString('fa-IR')}٪ تخفیف
              </span>
            )}
          </div>

          {/* Product variations / Print Quality selector */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-slate-900">
              {product.type === 'printed' ? '«انتخاب کیفیت چاپ:»' : 'فرمت و نوع محصول:'}
            </span>
            <div className="flex flex-wrap gap-3">
              {product.type === 'printed' ? (
                <>
                  {/* Quality 1: معمولی */}
                  <button 
                    type="button"
                    onClick={() => setSelectedFormat('کیفیت معمولی')}
                    className={`px-4 py-3 rounded-2xl border text-xs transition-all text-right flex-1 min-w-[130px] ${
                      selectedFormat.includes('معمولی')
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    <span className="block font-bold">کیفیت معمولی</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">چاپ استاندارد کاغذ سوئدی</span>
                  </button>

                  {/* Quality Bulk for 45322 */}
                  {product.id === '45322' && (
                    <button 
                      type="button"
                      onClick={() => setSelectedFormat('کیفیت بالک سبک')}
                      className={`px-4 py-3 rounded-2xl border text-xs transition-all text-right flex-1 min-w-[130px] ${
                        selectedFormat.includes('بالک سبک')
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
                      }`}
                    >
                      <span className="block font-bold">کیفیت بالک سبک</span>
                      <span className="text-[10px] text-slate-500 mt-1 block">کاغذ بالک سبک درجه یک</span>
                    </button>
                  )}

                  {/* Quality 2: تمام رنگی */}
                  <button 
                    type="button"
                    onClick={() => setSelectedFormat('کیفیت تمام رنگی')}
                    className={`px-4 py-3 rounded-2xl border text-xs transition-all text-right flex-1 min-w-[130px] ${
                      selectedFormat.includes('تمام رنگی')
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    <span className="block font-bold">کیفیت تمام رنگی</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">چاپ گلاسه/رنگی ویژه</span>
                  </button>
                </>
              ) : (
                <button className="px-4 py-3 rounded-2xl border border-indigo-200 bg-indigo-50/50 text-indigo-950 text-xs font-semibold w-full text-right cursor-default">
                  <span className="block font-bold">{selectedFormat}</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">غیرقابل تغییر (دسترسی دیجیتال آنی پس از ثبت)</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
            {product.stock > 0 ? (
              <button
                id="details-add-to-cart-btn"
                onClick={() => {
                  const customProduct: typeof product = {
                    ...product,
                    price: originalPrice,
                    salePrice: finalPrice
                  };
                  addToCart(customProduct, 1, selectedFormat);
                  setNotification(`«${product.title} (${selectedFormat})» با موفقیت به سبد خرید شما اضافه شد.`);
                  setTimeout(() => setNotification(null), 4000);
                }}
                className="flex-1 geom-button-primary hover:opacity-90 active:scale-98 transition-all text-white font-bold text-xs py-4 rounded-xl flex items-center justify-center gap-2 shadow-md"
              >
                <ShoppingCart size={16} />
                <span>افزودن این محصول به سبد خرید</span>
              </button>
            ) : (
              <button className="flex-1 bg-slate-100 text-slate-400 font-bold text-xs py-4 rounded-xl cursor-not-allowed">
                در حال حاضر ناموجود است
              </button>
            )}

            <button
              id="details-wishlist-toggle"
              onClick={() => toggleWishlist(product.id)}
              className={`px-5 py-4 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-medium ${
                isWishlisted
                  ? 'border-purple-300 bg-purple-50 text-purple-700 font-bold'
                  : 'border-slate-200 hover:border-indigo-300 bg-white text-slate-700'
              }`}
            >
              <Heart size={16} className={isWishlisted ? 'fill-purple-600 text-purple-600' : ''} />
              <span>{isWishlisted ? 'در لیست علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}</span>
            </button>
          </div>

        </div>

      </section>

      {/* Product Details Tabs (Description, Specifications, Reviews) */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="border-b border-slate-200 flex gap-6 text-sm font-semibold mb-8">
          <button 
            onClick={() => setActiveTab('desc')}
            className={`pb-3 border-b-2 transition-colors ${activeTab === 'desc' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            توضیحات و سرفصل‌ها
          </button>
          <button 
            onClick={() => setActiveTab('specs')}
            className={`pb-3 border-b-2 transition-colors ${activeTab === 'specs' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            مشخصات فنی و فیزیکی
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            نظرات کاربران ({localReviews.length.toLocaleString('fa-IR')})
          </button>
        </div>

        {/* Tab contents */}
        <div className="bg-white border border-indigo-100 rounded-3xl p-6 md:p-8 shadow-xs">
          
          {/* TAB 1: Description */}
          {activeTab === 'desc' && (
            <div className="space-y-6">
              <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-700">
                <p className="mb-4">{product.description}</p>
              </div>

              {product.tableOfContents && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <BookOpen size={14} className="text-indigo-600" />
                    <span>سرفصل‌های کتاب و آموزش</span>
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 pr-4 list-disc">
                    {product.tableOfContents.map((chapter, i) => (
                      <li key={i}>{chapter}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Specs */}
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500">پدیدآورنده / گوینده:</span>
                <strong className="text-slate-900">{product.author}</strong>
              </div>
              <div className="flex justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500">فرمت ارائه:</span>
                <strong className="text-slate-900">{product.format || 'دیجیتال دانلودی'}</strong>
              </div>
              {product.pages && (
                <div className="flex justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500">تعداد صفحات کتاب:</span>
                  <strong className="text-slate-900 font-mono">{product.pages.toLocaleString('fa-IR')} صفحه</strong>
                </div>
              )}
              {product.duration && (
                <div className="flex justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500">مدت زمان آموزش:</span>
                  <strong className="text-slate-900 font-mono">{product.duration}</strong>
                </div>
              )}
              <div className="flex justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500">ناشر:</span>
                <strong className="text-slate-900">گروه آموزشی و پژوهشی ۴۰ دروازه</strong>
              </div>
              <div className="flex justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500">زبان اثر:</span>
                <strong className="text-slate-900">فارسی دری</strong>
              </div>
            </div>
          )}

          {/* TAB 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Existing Reviews List (Span 7) */}
              <div className="lg:col-span-7 space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {localReviews.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-12">اولین کسی باشید که برای این محصول دیدگاه ثبت می‌کند.</p>
                ) : (
                  localReviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900">{rev.authorName}</strong>
                          {rev.verifiedPurchase && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">خریدار تایید شده</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{rev.date}</span>
                      </div>
                      
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                        ))}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed pt-1">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Leave a review form (Span 5) */}
              <div className="lg:col-span-5 p-5 bg-slate-50 border border-indigo-100 rounded-2xl h-fit space-y-4">
                <span className="block text-xs font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare size={14} className="text-indigo-600" />
                  <span>ثبت تجربه یا نظر در مورد این اثر</span>
                </span>
                
                <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-600 block">نام نمایشی شما:</label>
                    <input 
                      id="review-name"
                      type="text" 
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="مانند: نیما فرهمند"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-600 block">امتیاز شما:</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1"
                        >
                          <Star 
                            size={18} 
                            className={star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-600 block">دیدگاه یا سوال شما:</label>
                    <textarea 
                      id="review-comment"
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="تجربه خود از تمارین این کتاب یا دوره را برای راهنمایی سایرین بنویسید..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>

                  <button
                    id="submit-review-btn"
                    type="submit"
                    className="w-full geom-button-primary text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm"
                  >
                    ثبت دیدگاه نهایی
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* Related Products list */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200 space-y-8">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              <span>محصولات مرتبط پیشنهادی</span>
            </h2>
            <p className="text-xs text-slate-500">سایر آثار آموزشی مکمل در این حوزه آگاهی</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Zoom Image Overlay Modal */}
      <AnimatePresence>
        {isZoomOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsZoomOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs cursor-zoom-out"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-xl max-h-[90vh] rounded-3xl overflow-hidden border border-indigo-200 bg-white relative z-10 p-2 shadow-2xl"
            >
              <img 
                src={product.images[selectedImageIndex] || product.images[0]} 
                alt={product.title} 
                className="w-full h-full object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setIsZoomOpen(false)}
                className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white px-4 py-2 rounded-full border border-white/20 text-xs font-bold backdrop-blur-xs"
              >
                بستن ×
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
