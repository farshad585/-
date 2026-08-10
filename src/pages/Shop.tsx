/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { 
  Filter, 
  ChevronDown, 
  RotateCcw, 
  Search, 
  Grid, 
  X,
  BookOpen,
  Headphones,
  Tv,
  Wrench,
  Check,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Shop() {
  const { searchQuery, setSearchQuery, setCurrentPage, products } = useApp();

  // Shop filter states
  const MAX_SHOP_PRICE = 50000000;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<number>(MAX_SHOP_PRICE); // Max Toman
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'همه دسته‌ها', icon: Grid },
    { id: 'books', label: 'کتاب‌های آموزشی', icon: BookOpen },
    { id: 'audiobooks', label: 'کتاب‌های صوتی', icon: Headphones },
    { id: 'courses', label: 'دوره‌های جامع', icon: Tv },
    { id: 'tools', label: 'ابزارها و اکسسوری', icon: Wrench },
  ];

  const types = [
    { id: 'all', label: 'همه فرمت‌ها' },
    { id: 'printed', label: 'کتاب چاپی' },
    { id: 'pdf', label: 'کتاب الکترونیکی PDF' },
    { id: 'audio', label: 'کتاب صوتی MP3' },
    { id: 'course', label: 'دوره ویدیویی دانلودی' },
  ];

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedType('all');
    setOnlyInStock(false);
    setPriceRange(MAX_SHOP_PRICE);
    setSearchQuery('');
    setSortBy('featured');
  };

  // Filter and Sort calculation
  const filteredProducts = useMemo(() => {
    let result = [...(products || PRODUCTS)];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter(p => p.type === selectedType);
    }

    // Filter by stock
    if (onlyInStock) {
      result = result.filter(p => p.stock > 0);
    }

    // Filter by price range
    result = result.filter(p => {
      const actualPrice = p.salePrice || p.price;
      return actualPrice <= priceRange;
    });

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.englishTitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort operations
    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'best-seller') {
      result.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
    }

    return result;
  }, [selectedCategory, selectedType, onlyInStock, priceRange, searchQuery, sortBy]);

  const categoryLabelMap: Record<string, string> = {
    all: 'کل فروشگاه',
    books: 'کتاب‌های مرجع و چاپی',
    audiobooks: 'پادکست‌ها و کتاب‌های صوتی',
    courses: 'دوره‌های ویدیویی تخصصی',
    tools: 'کیت‌ها و اکسسوری‌های رویابینی'
  };

  return (
    <>
      <SEO 
        title="فروشگاه محصولات رویابینی شفاف" 
        description="فروشگاه تخصصی آثار و کتب چاپی، پی دی اف و صوتی در حوزه خودشناسی، رویابینی شفاف، برون‌فکنی و یوگای خواب تبتی. ارسال به سراسر ایران."
      />

      {/* Header banner */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-indigo-100 py-12 text-center max-w-7xl mx-auto rounded-b-3xl mb-8 shadow-xs">
        <div className="max-w-xl mx-auto px-4 space-y-3 text-right sm:text-center">
          {/* Breadcrumb */}
          <div className="flex justify-start sm:justify-center items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>صفحه اصلی</span>
            <span>/</span>
            <span className="text-indigo-600 font-bold">فروشگاه</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">فروشگاه آثار آکادمی چهل دروازه</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            مجموعه کاملی از کتب تخصصی فیزیکی، کتابچه‌های دیجیتال PDF، فایل‌های صوتی فرکانسی و دوره‌های ویدیویی عمیق بیداری ذهن.
          </p>
        </div>
      </section>

      {/* Philosophy Quote Section Transferred from Home */}
      <section className="max-w-7xl mx-auto px-4 mb-10">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white border border-indigo-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <Heart className="text-rose-400 fill-rose-400 animate-pulse shrink-0" size={20} />
            <div>
              <h3 className="text-sm md:text-base font-extrabold text-amber-300 font-display">
                شاه‌کلید یادگیری در رویاهای شفاف
              </h3>
            </div>
          </div>

          <div className="space-y-3 text-xs md:text-sm text-slate-200 leading-relaxed font-light text-justify">
            <p>
              من{' '}
              <button 
                onClick={() => setCurrentPage('about')}
                className="font-bold text-slate-200 hover:text-white no-underline transition-colors cursor-pointer"
              >
                فرشاد میرشکاری
              </button>
              ، پس از هزاران سال مکاشفه در رویاهای شفاف، دانستم که شاه‌کلید یادگیری چیزی نیست جز: <strong className="font-bold">«عشق»</strong>. زمانی که با معشوقی صمیمی دیدار می‌کنیم؛ بلااستثنا می‌کوشیم تا از تک‌تک لحظات، نهایت لذت را ببریم و تا آنجا که می‌توانیم، این لحظات عاشقانه را بهتر و طولانی‌تر کنیم.
            </p>
            <p>
              پس وقتی در کنار او می‌نشینیم، با نهایت احساس به طنین خوش‌آهنگ فراز و نشیب نفس‌هایش گوش فرا می‌دهیم؛ با نهایت تمرکز به زیبایی‌های بی‌مثال او خیره می‌شویم؛ با نهایت احساس، او را می‌بوییم؛ با نهایت لطافت، پوست ظریفش را لمس می‌کنیم؛ و برای چیدن بوسه از لب‌هایش، چشم‌ها را می‌بندیم تا نهایت شیرینیِ وجود او را بچشیم.
            </p>
            <p className="pt-2 border-t border-white/10">
              این‌چنین است که عشق میان ما و معشوق، محکم‌تر و عمیق‌تر می‌گردد؛ و خاطرات این لحظات، شفاف و رنگی، به صورت معجونی از هر پنج حس در حافظه به یادگار می‌ماند.
            </p>
            <div className="text-left text-[11px] font-light text-slate-300 italic pt-1">
              از کتاب «چهل دروازه به ماورا»
            </div>
          </div>
        </div>
      </section>

      {/* Search and Quick Filters bar */}
      <section className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Categories Horizontal scrolling */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  id={`cat-filter-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300'
                  }`}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sort & Filter toggles */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Mobile Filter toggle */}
            <button
              id="mobile-filters-trigger"
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 shadow-xs"
            >
              <Filter size={14} className="text-indigo-600" />
              <span>فیلترهای پیشرفته</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:inline">مرتب‌سازی:</span>
              <select
                id="shop-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl text-xs text-slate-800 px-3 py-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
              >
                <option value="featured">برگزیده آکادمی</option>
                <option value="best-seller">پرفروش‌ترین آثار</option>
                <option value="newest">جدیدترین‌ها</option>
                <option value="rating">محبوب‌ترین (امتیاز هنرجو)</option>
                <option value="price-low">قیمت: از ارزان به گران</option>
                <option value="price-high">قیمت: از گران به ارزان</option>
              </select>
            </div>
          </div>

        </div>
      </section>

      {/* Main Grid: Filters Sidebar + Results List */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
        
        {/* Desktop Filters Sidebar */}
        <aside className="hidden md:block space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-indigo-100 shadow-xs space-y-6 sticky top-24">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Filter size={14} className="text-indigo-600" />
                <span>فیلترهای جستجو</span>
              </div>
              <button
                id="reset-filters-desktop"
                onClick={resetFilters}
                className="text-[10px] text-indigo-600 hover:text-purple-700 transition-colors flex items-center gap-1 font-semibold"
                title="پاکسازی فیلترها"
              >
                <RotateCcw size={12} />
                <span>ریست</span>
              </button>
            </div>

            {/* Price Filter slider */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-900">حداکثر قیمت</span>
              <input
                id="desktop-price-slider"
                type="range"
                min={0}
                max={MAX_SHOP_PRICE}
                step={250000}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>رایگان</span>
                <span className="text-indigo-700 font-bold">{priceRange === 0 ? 'رایگان' : priceRange.toLocaleString('fa-IR') + ' تومان'}</span>
              </div>
            </div>

            {/* Format Type Filter */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-900">فرمت محصول</span>
              <div className="flex flex-col gap-1.5">
                {types.map((type) => (
                  <button
                    key={type.id}
                    id={`type-filter-${type.id}`}
                    onClick={() => setSelectedType(type.id)}
                    className={`text-right text-xs py-2 px-3 rounded-lg transition-all ${
                      selectedType === type.id
                        ? 'bg-indigo-50 text-indigo-900 border-r-4 border-indigo-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock toggle switch */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900">فقط کالاهای موجود</span>
              <button
                id="desktop-stock-toggle"
                onClick={() => setOnlyInStock(!onlyInStock)}
                className={`w-5 h-5 border transition-colors flex items-center justify-center rounded-md ${
                  onlyInStock ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white text-transparent'
                }`}
              >
                <Check size={12} className="stroke-[3]" />
              </button>
            </div>

            {/* Quick search tags */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <span className="block text-xs font-bold text-slate-900">کلمات کلیدی محبوب</span>
              <div className="flex flex-wrap gap-1.5">
                {['کتاب فیزیکی', 'پادکست', 'تست واقعیت', 'فلج خواب', 'برون فکنی'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="text-[10px] bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 px-2.5 py-1 rounded-full font-medium"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Results Grid Area */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          
          {/* Active filters display summary */}
          <div className="flex justify-between items-center text-xs text-slate-500 bg-white border border-indigo-100 rounded-xl p-4 shadow-xs">
            <span>
              نمایش <strong className="text-slate-900 font-mono">{filteredProducts.length.toLocaleString('fa-IR')}</strong> محصول در دسته‌بندی <strong className="text-indigo-700">«{categoryLabelMap[selectedCategory] || 'محصولات آگاهی'}»</strong>
            </span>
            {searchQuery && (
              <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-semibold">
                جستجو: {searchQuery}
                <X size={12} className="cursor-pointer text-slate-400 hover:text-slate-700" onClick={() => setSearchQuery('')} />
              </span>
            )}
          </div>

          {/* Catalog grid */}
          {filteredProducts.length === 0 ? (
            <div className="h-[450px] rounded-2xl bg-white border border-indigo-100 flex flex-col items-center justify-center text-center p-8 gap-5 shadow-xs">
              <Search size={48} className="text-slate-300 stroke-1" />
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">هیچ محصولی با این فیلترها یافت نشد!</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  احتمالاً فیلتر قیمت شما خیلی پایین است یا محصولی برای کلمه کلیدی جستجو شده پیدا نشده است.
                </p>
              </div>
              <button
                id="reset-filters-no-results"
                onClick={resetFilters}
                className="geom-button-primary text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all"
              >
                پاکسازی فیلترها و مشاهده همه
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}

        </div>

      </section>

      {/* Slide-out Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl border-t border-indigo-200 p-6 overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Filter size={16} className="text-indigo-600" />
                  <span>فیلترهای پیشرفته</span>
                </div>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>

              {/* Slider inside Mobile filter */}
              <div className="space-y-4 mb-6">
                <span className="block text-xs font-bold text-slate-900">محدوده قیمت</span>
                <input
                  id="mobile-price-slider"
                  type="range"
                  min={0}
                  max={MAX_SHOP_PRICE}
                  step={250000}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>رایگان</span>
                  <span className="text-indigo-700 font-bold">{priceRange === 0 ? 'رایگان' : priceRange.toLocaleString('fa-IR') + ' تومان'}</span>
                </div>
              </div>

              {/* Format selection */}
              <div className="space-y-3 mb-6">
                <span className="block text-xs font-bold text-slate-900">فرمت محصول</span>
                <div className="grid grid-cols-2 gap-2">
                  {types.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`text-center text-xs py-2.5 rounded-xl border ${
                        selectedType === type.id
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-100'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock toggle inside Mobile filter */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 mb-6">
                <span className="text-xs font-bold text-slate-900">فقط کالاهای موجود</span>
                <button
                  onClick={() => setOnlyInStock(!onlyInStock)}
                  className={`w-5 h-5 border transition-colors flex items-center justify-center rounded-md ${
                    onlyInStock ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white text-transparent'
                  }`}
                >
                  <Check size={12} className="stroke-[3]" />
                </button>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 geom-button-primary text-white font-bold text-xs py-3.5 rounded-xl text-center"
                >
                  اعمال فیلترها
                </button>
                <button
                  onClick={() => { resetFilters(); setIsMobileFilterOpen(false); }}
                  className="flex-1 border border-slate-200 text-slate-700 font-semibold text-xs py-3.5 rounded-xl text-center bg-slate-50 hover:bg-slate-100"
                >
                  پاکسازی کل
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
