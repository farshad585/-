/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import BreathingWidget from './BreathingWidget';
import logoIcon from '../assets/images/40gates_logo_1784533471317.png';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  User, 
  Menu, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  ChevronRight,
  Info,
  BookOpen,
  HelpCircle,
  PhoneCall,
  Home as HomeIcon,
  ShoppingBag as ShopIcon,
  Gamepad2,
  Smartphone,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { 
    currentPage, 
    setCurrentPage, 
    cart, 
    wishlist, 
    updateCartQuantity, 
    removeFromCart,
    searchQuery,
    setSearchQuery,
    isAuthenticated
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const totalBeforeDiscount = cart.reduce((acc, item) => {
    const price = item.product.salePrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR') + ' تومان';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage('shop');
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { id: 'home', label: 'صفحه اصلی', icon: HomeIcon },
    { id: 'shop', label: 'فروشگاه', icon: ShopIcon },
    { id: 'dream-game', label: 'بازی کنترل رویا 🎮', icon: Gamepad2 },
    { id: 'blog', label: 'مجله آگاهی', icon: BookOpen },
    { id: 'faq', label: 'سوالات متداول', icon: HelpCircle },
    { id: 'about', label: 'درباره من', icon: Info },
    { id: 'contact', label: 'تماس با من', icon: PhoneCall },
  ];

  return (
    <>
      {/* Top micro bar */}
      <div className="bg-indigo-50/90 border-b border-indigo-200/80 py-1.5 px-4 text-center text-[11px] text-indigo-900 font-medium tracking-wide flex justify-center items-center max-w-7xl mx-auto rounded-b-md z-50 relative">
        {/* Desktop View: Centered title without discount */}
        <span className="hidden sm:inline">بزرگترین آکادمی تخصصی رویابینی شفاف در ایران</span>

        {/* Mobile View: First purchase discount code */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 mx-auto">
          <span>کد تخفیف برای اولین خرید شما (۲۰٪): <strong className="font-mono text-xs border border-dashed border-indigo-400 px-1.5 py-0.5 rounded text-indigo-800 bg-white shadow-xs">DREAM20</strong></span>
        </div>
      </div>

      {/* Main Glassmorphic Header */}
      <header className="sticky top-0 z-40 w-full bg-white/85 border-b border-purple-200/70 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          
          {/* Right Section: Mobile Menu Trigger + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 text-indigo-600 hover:text-purple-700 transition-colors"
              aria-label="منوی موبایل"
            >
              <Menu size={24} />
            </button>

            {/* Brand Logo & Name */}
            <div 
              onClick={() => setCurrentPage('home')} 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-indigo-300 overflow-hidden bg-white p-0.5 transition-transform group-hover:scale-105 flex items-center justify-center shadow-xs shrink-0">
                <img 
                  src={logoIcon} 
                  alt="لوگو چهل دروازه" 
                  className="w-full h-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col text-right min-w-0">
                <span className="text-base sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">چهل دروازه</span>
                <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-indigo-600 uppercase font-semibold whitespace-nowrap">Forty Gates</span>
              </div>
            </div>
          </div>

          {/* Center Section: Main Desktop Navigation links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => setCurrentPage(link.id)}
                className={`relative py-2 px-1 transition-all ${
                  currentPage === link.id 
                    ? 'text-indigo-600 font-bold' 
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                {link.label}
                {currentPage === link.id && (
                  <motion.div 
                    layoutId="activeNavTab"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Left Section: Search, Wishlist, Cart, Profile */}
          <div className="flex items-center gap-1 sm:gap-2.5">

            {/* Elegant Search bar (expandable) */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
              <input
                id="desktop-search-input"
                type="text"
                placeholder="جستجوی کتاب، پادکست..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className={`pl-10 pr-4 py-1.5 text-xs rounded-full bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all ${
                  isSearchFocused ? 'w-56' : 'w-44'
                }`}
              />
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            </form>

            {/* Wishlist Button */}
            <button
              id="wishlist-toggle-btn"
              onClick={() => setCurrentPage(isAuthenticated ? 'dashboard' : 'auth')}
              className="p-2.5 text-slate-600 hover:text-indigo-600 transition-colors relative rounded-full hover:bg-indigo-50"
              title="لیست علاقه‌مندی‌ها"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              id="cart-overlay-trigger"
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 text-slate-600 hover:text-indigo-600 transition-colors relative rounded-full hover:bg-indigo-50"
              title="سبد خرید"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Dashboard */}
            <button
              id="dashboard-route-btn"
              onClick={() => setCurrentPage(isAuthenticated ? 'dashboard' : 'auth')}
              className={`p-2.5 rounded-full hover:bg-indigo-50 transition-colors ${
                currentPage === 'dashboard' || currentPage === 'auth' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
              }`}
              title="پنل کاربری"
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Deep Breathing Live Wave Guidance Widget */}
      <BreathingWidget />

      {/* Slide-out Mobile Menu (Overlay) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Menu Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white border-l border-purple-200 p-6 flex flex-col justify-between shadow-2xl text-slate-900"
            >
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl border border-indigo-300 overflow-hidden bg-white p-0.5 flex items-center justify-center shadow-xs">
                      <img 
                        src={logoIcon} 
                        alt="لوگو چهل دروازه" 
                        className="w-full h-full object-cover rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-sm font-black text-slate-900">آکادمی چهل دروازه</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Mobile Search Form */}
                <form onSubmit={handleSearchSubmit} className="relative mb-8">
                  <input
                    id="mobile-search-input"
                    type="text"
                    placeholder="جستجو در مقالات و کتاب‌ها..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  <Search size={14} className="absolute left-3 top-3.5 text-slate-400" />
                </form>

                {/* Mobile Nav Links */}
                <div className="flex flex-col gap-3">
                  {navLinks.map((link) => {
                    const IconComp = link.icon;
                    return (
                      <button
                        key={link.id}
                        onClick={() => {
                          setCurrentPage(link.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-4 py-2.5 px-3 rounded-lg text-sm text-right transition-all ${
                          currentPage === link.id 
                            ? 'bg-indigo-50 text-indigo-700 font-bold border-r-4 border-indigo-600' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                      >
                        <IconComp size={18} className="text-indigo-500" />
                        <span>{link.label}</span>
                      </button>
                    );
                  })}

                  {/* PWA Install Mobile Action */}
                  <button
                    type="button"
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      const promptEvent = (window as any).deferredPwaPrompt;
                      if (promptEvent) {
                        try {
                          await promptEvent.prompt();
                          const choice = await promptEvent.userChoice;
                          if (choice?.outcome === 'accepted') {
                            (window as any).deferredPwaPrompt = null;
                            return;
                          }
                        } catch (err) {
                          console.warn('Direct PWA prompt error:', err);
                        }
                      }
                      window.dispatchEvent(new CustomEvent('open-pwa-prompt'));
                    }}
                    className="flex items-center gap-3 py-3 px-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 shadow-md shadow-amber-500/10 mt-2 transition-all cursor-pointer"
                  >
                    <Smartphone size={18} className="text-amber-200" />
                    <span>📲 نصب مستقیم اپلیکیشن</span>
                  </button>
                </div>
              </div>

              {/* Mobile Footer branding */}
              <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
                <span className="block font-mono text-[10px] tracking-widest text-indigo-600 mb-1">FORTY GATES ACADEMY</span>
                <span>© ۲۰۲۶ - تمامی حقوق محفوظ است</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Cart Panel */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-96 max-w-[90vw] bg-white border-r border-purple-200 p-6 flex flex-col justify-between shadow-2xl text-slate-900"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={20} className="text-indigo-600" />
                    <span className="text-lg font-bold text-slate-900">سبد خرید شما</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full font-mono">{cartCount}</span>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
                  {cart.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 gap-4">
                      <ShoppingBag size={48} className="text-slate-300 stroke-1" />
                      <p className="text-sm">سبد خرید شما خالی است.</p>
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          setCurrentPage('shop');
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                      >
                        مشاهده کتاب‌ها و دوره‌ها
                      </button>
                    </div>
                  ) : (
                    cart.map((item, index) => {
                      const price = item.product.salePrice || item.product.price;
                      return (
                        <div 
                          key={`${item.product.id}-${item.selectedFormat}-${index}`}
                          className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                        >
                          {/* Image */}
                          <div className="w-16 h-20 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-300">
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.product.title}</h4>
                              <p className="text-[10px] text-purple-600 font-medium mt-1">{item.selectedFormat}</p>
                            </div>
                            
                            <div className="flex justify-between items-center mt-2">
                              {/* Quantity Control */}
                              <div className="flex items-center gap-1.5 bg-white rounded-lg border border-slate-300 px-1 py-0.5 shadow-xs">
                                <button 
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedFormat)}
                                  className="p-1 text-slate-500 hover:text-slate-900"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="text-[11px] font-mono font-bold text-slate-900 px-1.5">{item.quantity}</span>
                                <button 
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedFormat)}
                                  className="p-1 text-slate-500 hover:text-slate-900"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>

                              {/* Price */}
                              <span className="text-xs font-bold text-indigo-700">{formatPrice(price * item.quantity)}</span>
                            </div>
                          </div>

                          {/* Trash button */}
                          <button 
                            onClick={() => removeFromCart(item.product.id, item.selectedFormat)}
                            className="p-1 text-slate-400 hover:text-red-500 self-start mt-1 transition-colors"
                            title="حذف از سبد"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Subtotal and Action Button */}
                {cart.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
                    {totalBeforeDiscount < 2000000 && (
                      <div className="text-[10px] text-amber-950 bg-amber-50/90 border border-amber-200 p-2 rounded-xl font-medium flex items-center gap-1.5 shadow-xs">
                        <span className="animate-blink-lamp text-amber-500 text-xs shrink-0">💡</span>
                        <span>
                          فقط <strong className="text-amber-700 font-extrabold mx-0.5">{
                            (2000000 - totalBeforeDiscount) % 1000 === 0 && (2000000 - totalBeforeDiscount) < 1000000
                              ? `${((2000000 - totalBeforeDiscount) / 1000).toLocaleString('fa-IR')} هزار تومان`
                              : `${(2000000 - totalBeforeDiscount).toLocaleString('fa-IR')} تومان`
                          }</strong> تا رایگان شدن ارسال خرید شما
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">جمع کل سبد خرید:</span>
                      <span className="text-indigo-700 font-bold text-base">{formatPrice(totalBeforeDiscount)}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        id="navbar-checkout-btn"
                        onClick={() => {
                          setIsCartOpen(false);
                          setCurrentPage('checkout');
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 transition-all text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
                      >
                        <span>ثبت سفارش و پرداخت نهایی</span>
                        <ChevronRight size={14} className="rotate-180" />
                      </button>
                      <button
                        id="view-cart-link"
                        onClick={() => {
                          setIsCartOpen(false);
                          setCurrentPage('cart');
                        }}
                        className="w-full border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 transition-all text-[11px] py-2.5 rounded-xl text-center font-medium bg-slate-50"
                      >
                        مشاهده کامل سبد خرید
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
