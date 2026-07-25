/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import SEO from '../components/SEO';
import { sendWelcomeEmail, sendOrderStatusEmail } from '../utils/emailApi';
import { 
  User, 
  ShoppingBag, 
  Download, 
  Heart, 
  Compass, 
  Play, 
  Pause, 
  ChevronRight, 
  Truck, 
  ShieldCheck, 
  Edit3, 
  Volume2,
  FileText,
  VolumeX,
  FastForward,
  Rewind,
  Sparkles,
  Mail,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const { 
    orders, 
    wishlist, 
    recentlyViewed, 
    userProfile, 
    updateUserProfile, 
    updateOrderStatus,
    setSelectedProductId,
    trackOrderId,
    setTrackOrderId,
    setCurrentPage
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'downloads' | 'wishlist' | 'profile' | 'emails'>('orders');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };
  
  // Email logs state
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  const fetchEmailLogs = () => {
    fetch('/api/email/logs')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEmailLogs(data.logs || []);
        }
      })
      .catch(err => console.warn('Email logs error:', err));
  };

  useEffect(() => {
    fetchEmailLogs();
  }, [activeTab]);

  // Status update handler with email trigger
  const handleTriggerStatusChange = (order: any, newStatus: string) => {
    const trackingCode = order.trackingCode || ('PST-' + Math.floor(10000000 + Math.random() * 90000000));
    updateOrderStatus(order.id, newStatus as any, trackingCode);

    const updatedOrder = { ...order, status: newStatus, trackingCode };
    if (activeTrackOrder && activeTrackOrder.id === order.id) {
      setActiveTrackOrder(updatedOrder);
    }

    const statusMap: Record<string, string> = {
      pending: 'در انتظار پرداخت و تایید اولیه',
      processing: 'تایید سفارش و در حال آماده‌سازی',
      shipped: 'ارسال شده با کد پستی پیشتاز',
      completed: 'تحویل داده شده'
    };

    const targetEmail = userProfile.email || 'customer@40gates.ir';

    sendOrderStatusEmail({
      orderId: order.id,
      newStatus,
      trackingCode,
      customerEmail: targetEmail,
      customerName: userProfile.fullName
    }).then(res => {
      if (res.success) {
        showNotification(`📧 ایمیل «${statusMap[newStatus] || newStatus}» برای خریدار ارسال گردید.`);
        fetchEmailLogs();
      }
    });
  };
  
  // Profile Form States
  const [fullName, setFullName] = useState(userProfile.fullName || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [address, setAddress] = useState(userProfile.address || '');
  const [postalCode, setPostalCode] = useState(userProfile.postalCode || '');

  // Track order state
  const [trackingSearchCode, setTrackingSearchCode] = useState('');
  const [activeTrackOrder, setActiveTrackOrder] = useState<any>(null);

  // Audio Player State
  const [playingAudio, setPlayingAudio] = useState<{title: string, duration: string} | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35); // simulated percent
  const [audioCurrentTime, setAudioCurrentTime] = useState('01:58');

  // Sync profile form states
  useEffect(() => {
    setFullName(userProfile.fullName || '');
    setEmail(userProfile.email || '');
    setPhone(userProfile.phone || '');
    setAddress(userProfile.address || '');
    setPostalCode(userProfile.postalCode || '');
  }, [userProfile]);

  // Handle URL track order request on startup
  useEffect(() => {
    if (trackOrderId) {
      const ord = orders.find(o => o.id === trackOrderId);
      if (ord) {
        setActiveTrackOrder(ord);
        setActiveTab('orders');
      }
    }
  }, [trackOrderId, orders]);

  // Filter completed or processing digital downloads from orders
  const digitalDownloads = useMemo(() => {
    const downloads: {id: string, title: string, type: string, format: string, image: string}[] = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.type === 'pdf' || item.type === 'audio' || item.type === 'course') {
          // Find original product for image
          const prod = PRODUCTS.find(p => p.id === item.productId);
          downloads.push({
            id: item.productId,
            title: item.title,
            type: item.type,
            format: item.type === 'pdf' ? 'پی دی اف کتاب' : item.type === 'audio' ? 'کتاب صوتی (MP3)' : 'دوره ویدیویی دانلودی',
            image: prod?.images[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'
          });
        }
      });
    });
    return downloads;
  }, [orders]);

  // Filter wishlist items
  const wishlistProducts = useMemo(() => {
    return PRODUCTS.filter(p => wishlist.includes(p.id));
  }, [wishlist]);

  // Handle profile update & trigger welcome email
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedEmail = email.trim() || 'user@40gates.ir';

    updateUserProfile({
      fullName,
      email: updatedEmail,
      phone,
      address,
      postalCode
    });

    showNotification('اطلاعات کاربری با موفقیت ویرایش و در سیستم ذخیره گردید.');

    // Dispatch Welcome Email from 40gates.main@gmail.com
    sendWelcomeEmail({
      email: updatedEmail,
      fullName
    }).then((res) => {
      if (res.success) {
        showNotification('📧 ایمیل خوش‌آمدگویی و عضویت از آدرس 40gates.main@gmail.com برای شما ارسال گردید.');
      }
    });
  };

  // Find order for manual tracking search
  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingSearchCode.trim()) return;
    const foundOrder = orders.find(
      o => o.id === trackingSearchCode.trim() || o.id.includes(trackingSearchCode.trim())
    );
    if (foundOrder) {
      setActiveTrackOrder(foundOrder);
      setTrackOrderId(foundOrder.id);
    } else {
      showNotification('سفارشی با این شماره در سیستم پیدا نشد. لطفاً از صحت شناسه وارد شده اطمینان حاصل کنید.');
    }
  };

  // Simulates playing an audiobook
  const startAudioPlayer = (title: string, duration: string) => {
    setPlayingAudio({ title, duration });
    setIsPlaying(true);
    setAudioProgress(10);
    setAudioCurrentTime('00:00');
  };

  // Simulated streaming timer
  useEffect(() => {
    let interval: any;
    if (isPlaying && playingAudio) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
        setAudioCurrentTime(prev => {
          const parts = prev.split(':');
          let m = parseInt(parts[0]);
          let s = parseInt(parts[1]) + 5; // skip 5 seconds per tick for simulation fast feel
          if (s >= 60) {
            m += 1;
            s = 0;
          }
          const mStr = m < 10 ? '0' + m : m;
          const sStr = s < 10 ? '0' + s : s;
          return `${mStr}:${sStr}`;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playingAudio]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR') + ' تومان';
  };

  return (
    <>
      <SEO 
        title="پنل کاربری و پشتیبانی سالک" 
        description="ناحیه کاربری مربیان و سالکان آکادمی ۴۰ دروازه شامل دسترسی به خریدهای صوتی و متنی، دانلودهای الکترونیکی، ثبت درخواست و رهگیری پستی سفارشات."
      />

      {/* Floating notification */}
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

      {/* Main Container */}
      <section className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        
        {/* Left Column: Sidebar Navigator (Span 3) */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* Profile Quickcard */}
          <div className="p-6 rounded-3xl bg-white border border-indigo-100 text-center space-y-3 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center mx-auto text-indigo-700 font-extrabold text-lg">
              {fullName ? fullName.charAt(0) : <User size={24} />}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">{fullName || 'هنرجوی رویابینی شفاف'}</h3>
              <span className="text-[10px] text-slate-500 font-mono">{phone || 'بدون شماره همراه'}</span>
            </div>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-2.5 py-0.5 inline-block font-bold">سالک آگاهی</span>
          </div>

          {/* Nav Links */}
          <div className="p-3 rounded-3xl bg-white border border-indigo-100 flex flex-col gap-1.5 text-xs shadow-xs">
            <button
              onClick={() => { setActiveTab('orders'); setTrackOrderId(null); setActiveTrackOrder(null); }}
              className={`text-right py-3 px-4 rounded-2xl flex items-center gap-3 transition-colors ${
                activeTab === 'orders' && !activeTrackOrder
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag size={14} />
              <span>سفارشات من {orders.length > 0 && <strong className="font-mono">({orders.length})</strong>}</span>
            </button>

            <button
              onClick={() => { setActiveTab('downloads'); }}
              className={`text-right py-3 px-4 rounded-2xl flex items-center gap-3 transition-colors ${
                activeTab === 'downloads'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Download size={14} />
              <span>کتابخانه دانلودهای من</span>
            </button>

            <button
              onClick={() => { setActiveTab('wishlist'); }}
              className={`text-right py-3 px-4 rounded-2xl flex items-center gap-3 transition-colors ${
                activeTab === 'wishlist'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Heart size={14} />
              <span>لیست علاقه‌مندی‌ها</span>
            </button>

            <button
              onClick={() => { setActiveTab('profile'); }}
              className={`text-right py-3 px-4 rounded-2xl flex items-center gap-3 transition-colors ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Edit3 size={14} />
              <span>ویرایش مشخصات پستی</span>
            </button>

            <button
              onClick={() => { setActiveTab('emails'); fetchEmailLogs(); }}
              className={`text-right py-3 px-4 rounded-2xl flex items-center gap-3 transition-colors ${
                activeTab === 'emails'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Mail size={14} />
              <span>تاریخچه ایمیل‌ها و اطلاع‌رسانی</span>
            </button>
          </div>

          {/* Quick Tracking Search Bar */}
          <div className="p-5 rounded-3xl bg-white border border-indigo-100 space-y-3 text-right shadow-xs">
            <span className="block text-[11px] font-bold text-slate-900 flex items-center gap-2">
              <Truck size={14} className="text-indigo-600" />
              <span>رهگیری سریع مرسولات پستی</span>
            </span>
            <form onSubmit={handleTrackSearch} className="flex gap-1.5">
              <input
                id="track-code-search"
                type="text"
                required
                placeholder="شناسه سفارش..."
                value={trackingSearchCode}
                onChange={(e) => setTrackingSearchCode(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-[10px] text-slate-900 focus:outline-none focus:border-indigo-500 text-center font-mono shadow-xs"
              />
              <button
                id="dashboard-track-submit"
                type="submit"
                className="geom-button-primary text-white font-bold text-[10px] px-3.5 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                رهگیری
              </button>
            </form>
          </div>

        </aside>

        {/* Right Column: Tab Content Area (Span 9) */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* 1. ACTIVE ORDER TRACKING PROGRESS CARD VIEW */}
          {activeTrackOrder && (
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-indigo-100 shadow-xs space-y-6 text-right">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <button
                  onClick={() => setActiveTrackOrder(null)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer bg-transparent"
                >
                  <ChevronRight size={14} />
                  <span>بازگشت به سفارشات</span>
                </button>
                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full font-mono font-bold">
                  شناسه سفارش: {activeTrackOrder.id}
                </span>
              </div>

              {/* Delivery timeline tracker visual */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] md:text-xs pt-4 relative">
                
                {/* Horizontal line */}
                <div className="absolute top-[17px] left-[12%] right-[12%] h-0.5 bg-slate-100 z-0" />
                <div className="absolute top-[17px] right-[12%] h-0.5 bg-indigo-600 z-0 transition-all duration-500" style={{
                  width: activeTrackOrder.status === 'pending' ? '0%' : 
                         activeTrackOrder.status === 'processing' ? '33%' : 
                         activeTrackOrder.status === 'shipped' ? '66%' : '100%'
                }} />

                {/* Step 1: Pending */}
                <div className="space-y-2 z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                    ['pending', 'processing', 'shipped', 'completed'].includes(activeTrackOrder.status)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    ۱
                  </div>
                  <span className="font-bold text-slate-900">ثبت سفارش</span>
                </div>

                {/* Step 2: Processing */}
                <div className="space-y-2 z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                    ['processing', 'shipped', 'completed'].includes(activeTrackOrder.status)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    ۲
                  </div>
                  <span className="font-bold text-slate-900">آماده‌سازی پستی</span>
                </div>

                {/* Step 3: Shipped */}
                <div className="space-y-2 z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                    ['shipped', 'completed'].includes(activeTrackOrder.status)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    ۳
                  </div>
                  <span className="font-bold text-slate-900">ارسال مرسوله</span>
                </div>

                {/* Step 4: Completed */}
                <div className="space-y-2 z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                    ['completed'].includes(activeTrackOrder.status)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    ۴
                  </div>
                  <span className="font-bold text-slate-900">تحویل نهایی</span>
                </div>

              </div>

              {/* Tracking detail list box */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-3.5 pt-6">
                <h4 className="text-slate-900 font-bold">مشخصات تحویل و بارکد پستی:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block mb-0.5">تحویل گیرنده:</span>
                    <strong className="text-slate-900">{activeTrackOrder.shippingAddress?.fullName || 'ثبت نشده'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">تلفن همراه:</span>
                    <strong className="text-slate-900 font-mono">{activeTrackOrder.shippingAddress?.phone || 'ثبت نشده'}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block mb-0.5">آدرس ارسال:</span>
                    <p className="text-slate-900 leading-relaxed">{activeTrackOrder.shippingAddress?.address || 'ثبت نشده'}</p>
                  </div>
                  {activeTrackOrder.trackingCode && (
                    <div className="sm:col-span-2 border-t border-slate-200 pb-1 pt-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div>
                        <span className="text-slate-500 block mb-0.5">کد رهگیری پست پیشتاز (سامانه پست):</span>
                        <strong className="text-indigo-700 font-mono tracking-widest text-sm">{activeTrackOrder.trackingCode}</strong>
                      </div>
                      <a 
                        href="https://tracking.post.ir" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-3 py-1 hover:bg-indigo-600 hover:text-white font-bold transition-colors"
                      >
                        رهگیری در سامانه ملی پست
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. AUDIOBOOK FLOAT/DRAWER STEAMING CONTROLS */}
          {playingAudio && (
            <div className="p-6 rounded-3xl border border-indigo-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 text-right shadow-md">
              
              <div className="flex gap-4 items-center relative z-10 w-full md:w-auto">
                <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 animate-pulse flex-shrink-0 shadow-xs">
                  <Volume2 size={24} />
                </div>
                <div>
                  <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-widest block">NOW STREAMING</span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{playingAudio.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">طول کل فایل: {playingAudio.duration}</span>
                </div>
              </div>

              {/* Streaming player Controls */}
              <div className="flex flex-col items-center gap-2 w-full md:w-72 relative z-10">
                <div className="flex gap-4 items-center">
                  <button className="text-slate-500 hover:text-slate-900 cursor-pointer bg-transparent"><Rewind size={14} /></button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
                  </button>
                  <button className="text-slate-500 hover:text-slate-900 cursor-pointer bg-transparent"><FastForward size={14} /></button>
                </div>
                
                {/* Scrub bar */}
                <div className="w-full flex justify-between items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span>{audioCurrentTime}</span>
                  <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${audioProgress}%` }} />
                  </div>
                  <span>{playingAudio.duration.replace('ساعت و', ':')}</span>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => { setPlayingAudio(null); setIsPlaying(false); }}
                className="text-xs text-slate-500 hover:text-slate-900 relative z-10 self-end md:self-center cursor-pointer bg-transparent"
              >
                بستن پلیر
              </button>
            </div>
          )}

          {/* TAB 1: Orders list */}
          {activeTab === 'orders' && !activeTrackOrder && (
            <div className="space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 text-right">تاریخچه سفارشات من</h2>
              
              {orders.length === 0 ? (
                <div className="p-16 rounded-3xl border border-slate-200 bg-white text-center space-y-4 shadow-xs">
                  <ShoppingBag size={40} className="text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">شما هنوز هیچ سفارشی ثبت نکرده‌اید.</p>
                  <button
                    onClick={() => setCurrentPage('shop')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer bg-transparent"
                  >
                    مشاهده فروشگاه کتاب‌ها
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="p-5 rounded-3xl bg-white border border-indigo-100 space-y-4 text-right shadow-xs"
                    >
                      <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-3.5">
                        <div className="space-y-1">
                          <span className="block font-bold text-slate-900">سفارش شماره {order.id}</span>
                          <span className="block text-[10px] text-slate-500 font-mono">تاریخ ثبت: {order.date}</span>
                        </div>
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          {order.status === 'pending' ? 'در انتظار پرداخت' : 
                           order.status === 'processing' ? 'آماده‌سازی ارسال' : 
                           order.status === 'shipped' ? 'ارسال شده پستی' : 'تحویل نهایی'}
                        </span>
                      </div>

                      {/* Items row */}
                      <div className="space-y-2 text-xs text-slate-600">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span>• {item.title}</span>
                            <span className="font-mono font-bold text-slate-900">({item.quantity} عدد)</span>
                          </div>
                        ))}
                      </div>

                      {/* Quick Status Email Trigger Actions */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-2 text-xs">
                        <div className="flex justify-between items-center text-[10px] text-slate-600">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <Mail size={12} className="text-indigo-600" />
                            <span>تغییر وضعیت سفارش و ارسال ایمیل به خریدار:</span>
                          </span>
                          {order.trackingCode && (
                            <span className="font-mono text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              کد پست: {order.trackingCode}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleTriggerStatusChange(order, 'processing')}
                            className="text-[10px] bg-white border border-slate-200 hover:border-indigo-400 text-slate-800 hover:text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                          >
                            ✓ تایید سفارش و آماده‌سازی
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTriggerStatusChange(order, 'shipped')}
                            className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <Truck size={10} />
                            <span>ارسال پست + ارسال کد رهگیری</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTriggerStatusChange(order, 'completed')}
                            className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <CheckCircle size={10} />
                            <span>تحویل شد</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-3.5 mt-2">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">جمع پرداختی فاکتور:</span>
                          <strong className="text-indigo-700 text-xs font-bold font-sans">{formatPrice(order.totalAmount)}</strong>
                        </div>
                        <button
                          onClick={() => { setActiveTrackOrder(order); setTrackOrderId(order.id); }}
                          className="geom-button-primary text-white font-bold text-[10px] px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                          رهگیری و جزییات پستی
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Downloads digital Shelf */}
          {activeTab === 'downloads' && (
            <div className="space-y-4 text-right">
              <h2 className="text-sm font-extrabold text-slate-900">قفسه دانلودهای کتاب و پادکست</h2>
              
              {digitalDownloads.length === 0 ? (
                <div className="p-16 rounded-3xl border border-slate-200 bg-white text-center space-y-4 shadow-xs">
                  <Download size={40} className="text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">هیچ فایل صوتی یا پی دی اف خریداری شده‌ای یافت نشد.</p>
                  <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">با خرید نسخه الکترونیکی کتاب‌ها یا بسته‌های فرکانسی، قفسه دانلودی خود را فعال کنید.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {digitalDownloads.map((down, index) => (
                    <div 
                      key={`${down.id}-${index}`}
                      className="p-4 rounded-3xl bg-white border border-indigo-100 flex gap-4 items-center hover:border-indigo-300 transition-colors shadow-xs"
                    >
                      <div className="w-12 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                        <img src={down.image} alt={down.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-[11px] font-bold text-slate-900 line-clamp-1">{down.title}</h4>
                        <span className="text-[9px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 inline-block font-bold">{down.format}</span>
                        
                        <div className="flex gap-2 pt-2">
                          <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); showNotification(`کتاب دیجیتالی «${down.title}» با فرمت بالا در حال دانلود شبیه‌سازی شده است.`); }}
                            className="text-[9px] geom-button-primary text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
                          >
                            <FileText size={10} />
                            <span>دانلود فایل</span>
                          </a>
                          {down.type === 'audio' && (
                            <button
                              onClick={() => startAudioPlayer(down.title, '۵ ساعت و ۴۰ دقیقه')}
                              className="text-[9px] border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer bg-white shadow-xs"
                            >
                              <Play size={10} />
                              <span>پخش آنلاین</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Wishlist items list */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4 text-right">
              <h2 className="text-sm font-extrabold text-slate-900">لیست علاقه‌مندی‌های من</h2>
              
              {wishlistProducts.length === 0 ? (
                <div className="p-16 rounded-3xl border border-slate-200 bg-white text-center space-y-4 shadow-xs">
                  <Heart size={40} className="text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">هنوز هیچ محصولی را به لیست موردعلاقه خود اضافه نکرده‌اید.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((prod) => (
                    <div 
                      key={prod.id}
                      className="p-4 rounded-3xl bg-white border border-indigo-100 flex gap-4 items-center hover:border-indigo-300 transition-colors cursor-pointer shadow-xs"
                      onClick={() => setSelectedProductId(prod.id)}
                    >
                      <div className="w-12 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                        <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1 text-right">
                        <h4 className="text-[11px] font-bold text-slate-900 line-clamp-1 leading-normal hover:text-indigo-600">{prod.title}</h4>
                        <span className="text-[10px] font-sans font-bold text-indigo-700 block">{formatPrice(prod.salePrice || prod.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Profile & shipping addresses editor */}
          {activeTab === 'profile' && (
            <div className="p-6 rounded-3xl bg-white border border-indigo-100 space-y-6 text-right shadow-xs">
              <h2 className="text-sm font-extrabold text-slate-900">ویرایش جزئیات پستی گیرنده</h2>
              
              <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600 block font-semibold">نام و نام خانوادگی:</label>
                    <input
                      id="profile-fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="علیرضا حسینی"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-600 block font-semibold">آدرس ایمیل:</label>
                    <input
                      id="profile-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-left font-mono focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600 block font-semibold">تلفن همراه فعال:</label>
                    <input
                      id="profile-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09123456789"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-left font-mono focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-600 block font-semibold">کد پستی گیرنده:</label>
                    <input
                      id="profile-postalCode"
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="1234567890"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-left font-mono focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 block font-semibold">آدرس تحویل فیزیکی:</label>
                  <textarea
                    id="profile-address"
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="خیابان ولیعصر، نرسیده به میدان ونک، برج نگار، طبقه ۱۵..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-xs"
                  />
                </div>

                <button
                  id="profile-submit-btn"
                  type="submit"
                  className="geom-button-primary text-white font-bold text-xs px-8 py-3 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  ذخیره ویرایش‌ها و ارسال ایمیل خوش‌آمدگویی
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: Email Notification Center & Logs */}
          {activeTab === 'emails' && (
            <div className="p-6 rounded-3xl bg-white border border-indigo-100 space-y-6 text-right shadow-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Mail className="text-indigo-600" size={18} />
                    <span>مرکز اطلاع‌رسانی و ایمیل‌های ارسال شده</span>
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    فرستنده اصلی تمامی ایمیل‌های سیستم: <strong className="text-indigo-900 font-mono">40gates.main@gmail.com</strong> | دریافت‌کننده مدیریت: <strong className="text-indigo-900 font-mono">fmfarshad585@gmail.com</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchEmailLogs}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>بروزرسانی لیست</span>
                </button>
              </div>

              {/* Status info box */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Sparkles size={16} />
                  <span>تنظیمات سرور ارسال ایمیل (SMTP / Gmail Transporter)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  سیستم ارسال ایمیل به صورت خودکار بر روی پورت اختصاصی سرور فعال است. ایمیل‌های ثبت‌نام، تایید سفارش، تغییر وضعیت به «در حال آماده‌سازی» و ارسال «کد رهگیری پستی» همزمان به ایمیل مشتری و مدیر سایت (fmfarshad585@gmail.com) صادر می‌گردد.
                </p>
              </div>

              {/* Email Logs Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900">آخرین ایمیل‌های صادر شده از سیستم:</h3>

                {emailLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                    <p>هنوز ایمیلی ثبت نشده است. می‌توانید با ویرایش مشخصات یا ثبت سفارش جدید، ارسال ایمیل را تست کنید.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {emailLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.type === 'welcome' ? 'bg-purple-100 text-purple-700' :
                              log.type === 'order-admin' ? 'bg-amber-100 text-amber-800' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              {log.type === 'welcome' ? 'خوش‌آمدگویی' : log.type === 'order-admin' ? 'اعلام به مدیریت' : 'اطلاع‌رسانی خریدار'}
                            </span>
                            <span className="font-bold text-slate-900">{log.subject}</span>
                          </div>
                          <span className="block text-[10px] text-slate-500 font-mono">گیرنده: {log.to}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="text-slate-400 font-mono">{log.timestamp}</span>
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            log.status === 'sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {log.status === 'sent' ? 'ارسال شده (SMTP)' : 'ثبت شده در سرور'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </main>

      </section>
    </>
  );
}
