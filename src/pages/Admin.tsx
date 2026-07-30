/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Mail, 
  LogOut, 
  RefreshCw, 
  ShoppingBag, 
  BookOpen, 
  Users, 
  Package, 
  MessageSquare, 
  Tag, 
  Settings, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Eye, 
  Edit3, 
  Plus, 
  Send, 
  Truck, 
  Sparkles,
  ArrowRight,
  Shield,
  Server,
  FileText
} from 'lucide-react';
import SEO from '../components/SEO';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import { BLOG_ARTICLES } from '../data/blog';
import { Product, Order } from '../types';
import { sendOrderStatusEmail } from '../utils/emailApi';

interface LoginLog {
  id: string;
  timestamp: string;
  faTime: string;
  faDate: string;
  ip: string;
  status: 'SUCCESS' | 'FAILED_PASSWORD' | 'FAILED_OTP' | 'LOCKED';
  email: string;
  userAgent?: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  faDate: string;
  faTime: string;
  read: boolean;
}

export default function Admin() {
  const { orders, updateOrderStatus, setCurrentPage } = useApp();

  // Authentication State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('40gates_admin_token');
  });
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(true);

  // Login Form States
  const [loginStep, setLoginStep] = useState<'credentials' | 'otp'>('credentials');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpTimer, setOtpTimer] = useState<number>(300); // 5 minutes in seconds
  
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<
    'orders' | 'products' | 'inventory' | 'customers' | 'articles' | 'messages' | 'discounts' | 'settings'
  >('orders');

  // Real-time editable states
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  
  // Tracking Code Input state per order
  const [trackingInputs, setTrackingInputs] = useState<{ [orderId: string]: string }>({});

  // Backend fetched data
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [contactMsgs, setContactMsgs] = useState<ContactMessage[]>([]);
  const [settingsInfo, setSettingsInfo] = useState<any>(null);

  // Custom Discount Coupons state
  const [coupons, setCoupons] = useState([
    { code: 'DREAM20', discount: '۲۰٪', minSpend: '۱,۰۰۰,۰۰۰ تومان', description: 'تخفیف ویژه اولین خرید', active: true },
    { code: 'BEDAR40', discount: '۴۰٪', minSpend: 'بدون حداقل خرید', description: 'تخفیف طلایی کمپین رویا', active: true },
    { code: 'VIPGATES', discount: '۱۵٪', minSpend: '۵۰۰,۰۰۰ تومان', description: 'کد تخفیف اعضای VIP', active: true },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('10');

  // Verify Session on mount
  useEffect(() => {
    if (adminToken) {
      fetch('/api/admin/verify-session', {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.valid) {
            setAdminEmail(data.admin?.email || 'مدیر سیستم');
            setIsVerifyingSession(false);
          } else {
            localStorage.removeItem('40gates_admin_token');
            setAdminToken(null);
            setIsVerifyingSession(false);
          }
        })
        .catch(() => {
          setIsVerifyingSession(false);
        });
    } else {
      setIsVerifyingSession(false);
    }
  }, [adminToken]);

  // Fetch admin logs, settings, and contact messages
  const fetchAdminData = () => {
    if (!adminToken) return;

    // Logs
    fetch('/api/admin/logs', {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setLoginLogs(data.logs || []);
      })
      .catch(err => console.warn('Logs error:', err));

    // Settings
    fetch('/api/admin/settings', {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setSettingsInfo(data.settings);
      })
      .catch(err => console.warn('Settings error:', err));

    // Messages
    fetch('/api/admin/contact-messages', {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setContactMsgs(data.messages || []);
      })
      .catch(err => console.warn('Messages error:', err));
  };

  useEffect(() => {
    if (adminToken) {
      fetchAdminData();
    }
  }, [adminToken, activeTab]);

  // Timer countdown for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loginStep === 'otp' && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loginStep, otpTimer]);

  // Step 1: Submit Credentials
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);

    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError('لطفاً پست الکترونیکی و رمز عبور مدیر را وارد نمایید.');
      return;
    }

    setAuthLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), password: passwordInput.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLoginStep('otp');
        setOtpTimer(300);
        setAuthMessage(data.message || 'کد ۶ رقمی یک‌بار مصرف به ایمیل مدیر ارسال شد.');
      } else {
        setAuthError(data.error || 'اطلاعات ورود مدیر نادرست است.');
      }
    } catch (err: any) {
      setAuthError('خطای ارتباط با سرور. لطفاً مجددا تلاش کنید.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Step 2: Submit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);

    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setAuthError('لطفاً کد ۶ رقمی دریافت شده را به‌طور کامل وارد نمایید.');
      return;
    }

    setAuthLoading(true);

    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), code: otpInput.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        localStorage.setItem('40gates_admin_token', data.token);
        setAdminToken(data.token);
        setAdminEmail(data.admin?.email || emailInput.trim());
      } else {
        setAuthError(data.error || 'کد ورود یک‌بار مصرف اشتباه است.');
      }
    } catch (err: any) {
      setAuthError('خطای ارتباط با سرور.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    if (adminToken) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      } catch (err) {
        console.warn('Logout error', err);
      }
    }
    localStorage.removeItem('40gates_admin_token');
    setAdminToken(null);
    setLoginStep('credentials');
    setEmailInput('');
    setPasswordInput('');
    setOtpInput('');
  };

  // Mark contact message as read
  const handleMarkMessageRead = async (id: string) => {
    try {
      await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setContactMsgs(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    } catch (err) {
      console.warn('Mark read error:', err);
    }
  };

  // Toggle product in-stock state
  const handleToggleStock = (productId: string) => {
    setProductsList(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, inStock: !p.inStock };
      }
      return p;
    }));
  };

  // Quick price change
  const handleUpdatePrice = (productId: string, newPrice: number) => {
    setProductsList(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, price: newPrice };
      }
      return p;
    }));
  };

  // Handle Order status update
  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    const trackingCode = trackingInputs[orderId];
    updateOrderStatus(orderId, newStatus, trackingCode);
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      sendOrderStatusEmail({
        orderId,
        newStatus,
        trackingCode,
        customerEmail: targetOrder.customerInfo?.email || 'customer@40gates.ir',
        customerName: targetOrder.customerInfo?.fullName || 'خریدار محترم'
      });
    }
  };

  // Add coupon
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    setCoupons(prev => [
      {
        code: newCouponCode.trim().toUpperCase(),
        discount: `${newCouponDiscount}%`,
        minSpend: 'بدون محدودیت',
        description: 'کد تخفیف اختصاصی جدید',
        active: true
      },
      ...prev
    ]);
    setNewCouponCode('');
  };

  // Loading Splash
  if (isVerifyingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-mono">در حال بررسی اعتبار نشست مدیریتی...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 1: PROTECTED LOGIN / OTP VERIFICATION FORM
  // -------------------------------------------------------------
  if (!adminToken) {
    return (
      <>
        <SEO title="ورود مدیر آکادمی | ۴۰ دروازه" description="درگاه امن ورود مدیریت آکادمی ۴۰ دروازه به همراه احراز هویت دو مرحله‌ای" />

        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
          {/* Subtle geometric glowing background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 text-right"
          >
            {/* Header branding */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg border border-amber-400/30">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-lg font-extrabold text-white">درگاه مدیریت آکادمی ۴۰ دروازه</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                ورود ایمن با احراز هویت دو مرحله‌ای (OTP) و ثبت لاگ‌های امنیتی سرور
              </p>
            </div>

            {/* Error / Alert notification */}
            {authError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 leading-relaxed">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Message notification */}
            {authMessage && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 leading-relaxed">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span>{authMessage}</span>
              </div>
            )}

            {/* STEP 1: CREDENTIALS FORM */}
            {loginStep === 'credentials' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">ایمیل مدیر (ADMIN_EMAIL):</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="admin@40gates.ir"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 dir-ltr text-left transition-colors"
                      required
                    />
                    <Mail size={16} className="absolute left-3 top-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">رمز عبور مدیر:</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 dir-ltr text-left transition-colors"
                      required
                    />
                    <Lock size={16} className="absolute left-3 top-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Sparkles size={13} />
                    <span>امنیتی: رمز عبور در سرور بررسی می‌شود</span>
                  </div>
                  <p>پس از بررسی رمز عبور، یک کد ۶ رقمی یک‌بار مصرف به ایمیل مدیر صادر می‌گردد.</p>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      <KeyRound size={16} />
                      <span>دریافت کد یک‌بار مصرف ورود (OTP)</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: OTP VERIFICATION FORM */}
            {loginStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-slate-300 font-bold">کد ۶ رقمی یک‌بار مصرف:</label>
                    <span className="text-[11px] font-mono text-indigo-400">
                      ⏱️ {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-800/80 border border-indigo-500 rounded-xl px-4 py-3.5 text-center text-2xl font-mono tracking-widest text-indigo-300 focus:outline-none dir-ltr shadow-inner"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={authLoading || otpInput.length !== 6}
                    className="flex-grow bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>تایید و ورود به پنل مدیریت</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginStep('credentials')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    بازگشت
                  </button>
                </div>
              </form>
            )}

            {/* Back to main store */}
            <div className="pt-4 border-t border-slate-800 text-center">
              <button
                onClick={() => setCurrentPage('home')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
              >
                <span>بازگشت به وب‌سایت اصلی آکادمی</span>
                <ArrowRight size={14} className="rotate-180" />
              </button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'processing' || o.status === 'pending').length;

  return (
    <>
      <SEO title="پنل مدیریت | ۴۰ دروازه" description="مدیریت سفارش‌ها، محصولات، موجودی، کاربران و تنظیمات آکادمی ۴۰ دروازه" />

      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
        {/* Top Admin Header Bar */}
        <header className="bg-slate-950 border-b border-slate-800 px-4 py-3.5 sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm border border-amber-400/40">
                <Shield size={20} />
              </div>
              <div>
                <h1 className="text-sm font-black text-white flex items-center gap-2">
                  <span>پنل مدیریت آکادمی ۴۰ دروازه</span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    ADMIN
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-mono">ورود فعال: {adminEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage('home')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight size={14} className="rotate-180" />
                <span>مشاهده وب‌سایت</span>
              </button>

              <button
                onClick={handleLogout}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <LogOut size={14} />
                <span>خروج امن</span>
              </button>
            </div>
          </div>
        </header>

        {/* Overview Stats Bar */}
        <section className="bg-slate-900/80 border-b border-slate-800 px-4 py-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                <DollarSign size={18} />
              </div>
              <div>
                <span className="block text-[11px] text-slate-400">فروش کل:</span>
                <span className="font-extrabold text-white text-sm">
                  {totalRevenue.toLocaleString('fa-IR')} <span className="text-[10px] font-normal text-slate-400">تومان</span>
                </span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                <ShoppingBag size={18} />
              </div>
              <div>
                <span className="block text-[11px] text-slate-400">کل سفارش‌ها:</span>
                <span className="font-extrabold text-white text-sm">{orders.length.toLocaleString('fa-IR')} سفارش</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <span className="block text-[11px] text-slate-400">در انتظار پردازش:</span>
                <span className="font-extrabold text-amber-300 text-sm">{pendingOrdersCount.toLocaleString('fa-IR')} سفارش</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center shrink-0">
                <Package size={18} />
              </div>
              <div>
                <span className="block text-[11px] text-slate-400">محصولات فعال:</span>
                <span className="font-extrabold text-white text-sm">{productsList.length.toLocaleString('fa-IR')} محصول</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Admin Area */}
        <div className="max-w-7xl mx-auto w-full flex-grow p-4 md:p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-1 space-y-2">
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-2 space-y-1 text-xs font-bold">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-right px-3.5 py-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} />
                  <span>سفارش‌ها</span>
                </div>
                {pendingOrdersCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 font-mono text-[10px] px-2 py-0.5 rounded-full font-black">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full text-right px-3.5 py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'products' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Package size={16} />
                <span>مدیریت محصولات</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full text-right px-3.5 py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Server size={16} />
                <span>موجودی انبار</span>
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`w-full text-right px-3.5 py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'customers' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Users size={16} />
                <span>مشتریان</span>
              </button>

              <button
                onClick={() => setActiveTab('articles')}
                className={`w-full text-right px-3.5 py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'articles' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <BookOpen size={16} />
                <span>مقالات و وبلاگ</span>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full text-right px-3.5 py-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'messages' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  <span>پیام‌های تماس</span>
                </div>
                {contactMsgs.filter(m => !m.read).length > 0 && (
                  <span className="bg-emerald-400 text-slate-950 font-mono text-[10px] px-2 py-0.5 rounded-full font-black">
                    {contactMsgs.filter(m => !m.read).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('discounts')}
                className={`w-full text-right px-3.5 py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'discounts' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Tag size={16} />
                <span>کدهای تخفیف</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-right px-3.5 py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Settings size={16} />
                <span>تنظیمات و لاگ‌های امنیتی</span>
              </button>
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <main className="lg:col-span-4 space-y-6">

            {/* TAB 1: ORDERS */}
            {activeTab === 'orders' && (
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 text-right">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-700">
                  <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <ShoppingBag className="text-indigo-400" size={18} />
                    <span>مدیریت سفارش‌ها</span>
                  </h2>

                  {/* Filter tabs */}
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    {['all', 'processing', 'completed', 'cancelled'].map(status => (
                      <button
                        key={status}
                        onClick={() => setOrderStatusFilter(status)}
                        className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                          orderStatusFilter === status ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {status === 'all' && 'همه'}
                        {status === 'processing' && 'در حال پردازش'}
                        {status === 'completed' && 'ارسال شده/تکمیل'}
                        {status === 'cancelled' && 'لغو شده'}
                      </button>
                    ))}
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-700 rounded-xl space-y-2">
                    <ShoppingBag size={28} className="mx-auto text-slate-600" />
                    <p>هنوز هیچ سفارشی در سیستم ثبت نشده است.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders
                      .filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter)
                      .map(order => (
                        <div key={order.id} className="bg-slate-900 border border-slate-700/90 rounded-2xl p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-indigo-400 font-extrabold text-sm">#{order.id}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                order.status === 'processing' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {order.status === 'completed' && 'تکمیل / ارسال شده'}
                                {order.status === 'processing' && 'در حال پردازش / آماده ارسال'}
                                {order.status === 'cancelled' && 'لغو شده'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">{order.date}</span>
                          </div>

                          {/* Customer & Shipping info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                            <div>
                              <p><strong>تحویل گیرنده:</strong> {order.shippingAddress?.fullName || 'ثبت شده'}</p>
                              <p><strong>ایمیل:</strong> {order.shippingAddress?.email || order.userEmail || '-'}</p>
                              <p><strong>شماره تماس:</strong> {order.shippingAddress?.phone || '-'}</p>
                            </div>
                            <div>
                              <p><strong>استان / شهر:</strong> {order.shippingAddress?.province} - {order.shippingAddress?.city}</p>
                              <p><strong>کد پستی:</strong> {order.shippingAddress?.postalCode || '-'}</p>
                              <p><strong>آدرس:</strong> {order.shippingAddress?.address || 'تحویل دیجیتال'}</p>
                            </div>
                          </div>

                          {/* Order items */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-400">اقلام سفارش:</span>
                            <ul className="text-xs space-y-1 pr-2">
                              {order.items?.map((item, idx) => (
                                <li key={idx} className="flex justify-between text-slate-300 border-b border-slate-800/50 pb-1">
                                  <span>• {item.title} ({item.quantity} عدد)</span>
                                  <span className="font-mono text-indigo-300">{(item.price * item.quantity).toLocaleString('fa-IR')} تومان</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Action controls */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-slate-800">
                            <div className="text-xs">
                              <span className="text-slate-400">مبلغ کل پرداختی: </span>
                              <span className="font-bold text-emerald-400 text-sm">{(order.totalAmount || 0).toLocaleString('fa-IR')} تومان</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                              <input
                                type="text"
                                placeholder="کد رهگیری پستی ۲۴ رقمی..."
                                value={trackingInputs[order.id] || order.trackingCode || ''}
                                onChange={e => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500 dir-ltr text-left"
                              />

                              <button
                                onClick={() => handleUpdateStatus(order.id, 'completed')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Truck size={12} />
                                <span>تکمیل و ثبت کد رهگیری</span>
                              </button>

                              <button
                                onClick={() => handleUpdateStatus(order.id, 'processing')}
                                className="bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                در حال پردازش
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PRODUCTS */}
            {activeTab === 'products' && (
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 text-right">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Package className="text-indigo-400" size={18} />
                    <span>مدیریت کاتالوگ محصولات (۶ دوره و کتاب)</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productsList.map(product => (
                    <div key={product.id} className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex gap-3">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-20 h-24 object-cover rounded-xl border border-slate-700 shrink-0"
                      />
                      <div className="space-y-2 text-xs flex-grow">
                        <div className="flex justify-between items-start gap-1">
                          <h3 className="font-bold text-white text-xs leading-snug">{product.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] shrink-0 font-bold ${
                            product.inStock ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {product.inStock ? 'موجود' : 'ناموجود'}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 space-y-1">
                          <p>قیمت اصلی: {product.price.toLocaleString('fa-IR')} تومان</p>
                          {product.salePrice && (
                            <p className="text-amber-400 font-bold">قیمت با تخفیف: {product.salePrice.toLocaleString('fa-IR')} تومان</p>
                          )}
                        </div>

                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStock(product.id)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                              product.inStock
                                ? 'border-rose-500/40 text-rose-300 hover:bg-rose-500/10'
                                : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'
                            }`}
                          >
                            {product.inStock ? 'تغییر به ناموجود' : 'تغییر به موجود'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 text-right">
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2 pb-3 border-b border-slate-700">
                  <Server className="text-indigo-400" size={18} />
                  <span>مدیریت موجودی انبار کتب چاپی و فایل‌های دیجیتال</span>
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-300 text-right">
                    <thead className="bg-slate-900 text-slate-400 text-[11px] border-b border-slate-700">
                      <tr>
                        <th className="p-3">عنوان محصول</th>
                        <th className="p-3">فرمت</th>
                        <th className="p-3">وضعیت انبار</th>
                        <th className="p-3">حداقل آستانه هشدار</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {productsList.map(p => (
                        <tr key={p.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-white">{p.title}</td>
                          <td className="p-3">
                            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px]">
                              {p.type === 'printed' ? 'کتاب چاپی' : p.type === 'pdf' ? 'فایل PDF' : 'دوره صوتی'}
                            </span>
                          </td>
                          <td className="p-3">
                            {p.inStock ? (
                              <span className="text-emerald-400 font-bold">آماده تحویل / انبار پر</span>
                            ) : (
                              <span className="text-rose-400 font-bold">پایان موجودی انبار</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-400">۱۰ نسخه چاپی</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: CUSTOMERS */}
            {activeTab === 'customers' && (
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 text-right">
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2 pb-3 border-b border-slate-700">
                  <Users className="text-indigo-400" size={18} />
                  <span>لیست مشتریان و خریداران آکادمی</span>
                </h2>

                {orders.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">هنوز مشتری ثبت شده‌ای در سیستم وجود ندارد.</p>
                ) : (
                  <div className="space-y-3">
                    {Array.from(new Set(orders.map(o => o.shippingAddress?.email || o.userEmail || 'کاربر مهمان'))).map((custEmail, i) => {
                      const userOrders = orders.filter(o => (o.shippingAddress?.email || o.userEmail) === custEmail);
                      const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                      const name = userOrders[0]?.shippingAddress?.fullName || 'هنرجوی رویابینی شفاف';
                      const phone = userOrders[0]?.shippingAddress?.phone || '-';

                      return (
                        <div key={i} className="bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{name}</span>
                              <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded font-mono">
                                {custEmail}
                              </span>
                            </div>
                            <span className="block text-[11px] text-slate-400">تلفن: {phone}</span>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="block text-slate-400 text-[11px]">{userOrders.length} سفارش ثبت شده</span>
                            <span className="font-extrabold text-emerald-400">{totalSpent.toLocaleString('fa-IR')} تومان</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: ARTICLES / BLOG */}
            {activeTab === 'articles' && (
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 text-right">
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2 pb-3 border-b border-slate-700">
                  <BookOpen className="text-indigo-400" size={18} />
                  <span>مدیریت مقالات و وبلاگ آکادمی ({BLOG_ARTICLES.length} مقاله)</span>
                </h2>

                <div className="space-y-3">
                  {BLOG_ARTICLES.map(post => (
                    <div key={post.id} className="bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 flex gap-3 text-xs">
                      <img src={post.image} alt={post.title} className="w-16 h-16 object-cover rounded-lg shrink-0" />
                      <div className="space-y-1 flex-grow">
                        <h3 className="font-bold text-white">{post.title}</h3>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{post.excerpt}</p>
                        <div className="flex gap-4 text-[10px] text-indigo-300 pt-1">
                          <span>تاریخ: {post.date}</span>
                          <span>نویسنده: {post.author}</span>
                          <span>زمان مطالعه: {post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: CONTACT MESSAGES */}
            {activeTab === 'messages' && (
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 text-right">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <MessageSquare className="text-indigo-400" size={18} />
                    <span>پیام‌های دریافتی از فرم تماس</span>
                  </h2>
                  <button
                    onClick={fetchAdminData}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>بروزرسانی پیام‌ها</span>
                  </button>
                </div>

                {contactMsgs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">هیچ پیامی در صندوق دریافت ثبت نشده است.</p>
                ) : (
                  <div className="space-y-3">
                    {contactMsgs.map(msg => (
                      <div key={msg.id} className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        msg.read ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-900 border-emerald-500/40 text-white'
                      }`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{msg.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">({msg.email})</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{msg.faDate} - {msg.faTime}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                          {msg.message}
                        </p>
                        {!msg.read && (
                          <button
                            onClick={() => handleMarkMessageRead(msg.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            علامت‌گذاری به عنوان خوانده شده
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: DISCOUNT CODES */}
            {activeTab === 'discounts' && (
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-5 text-right">
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2 pb-3 border-b border-slate-700">
                  <Tag className="text-indigo-400" size={18} />
                  <span>مدیریت کدهای تخفیف</span>
                </h2>

                {/* Add new coupon form */}
                <form onSubmit={handleAddCoupon} className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 space-y-3 text-xs">
                  <span className="block font-bold text-slate-200">تعریف کد تخفیف جدید:</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="کد تخفیف (مثلا: NOROOZ1405)"
                      value={newCouponCode}
                      onChange={e => setNewCouponCode(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-indigo-500 flex-grow"
                      required
                    />
                    <select
                      value={newCouponDiscount}
                      onChange={e => setNewCouponDiscount(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                    >
                      <option value="10">۱۰٪ تخفیف</option>
                      <option value="15">۱۵٪ تخفیف</option>
                      <option value="20">۲۰٪ تخفیف</option>
                      <option value="30">۳۰٪ تخفیف</option>
                      <option value="50">۵۰٪ تخفیف</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      افزودن کد تخفیف
                    </button>
                  </div>
                </form>

                {/* Coupons list */}
                <div className="space-y-2">
                  {coupons.map((coupon, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 flex justify-between items-center text-xs">
                      <div className="space-y-1">
                        <span className="font-mono font-extrabold text-amber-300 text-sm">{coupon.code}</span>
                        <p className="text-[11px] text-slate-400">{coupon.description} - حداقل خرید: {coupon.minSpend}</p>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg font-bold">
                        {coupon.discount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: SETTINGS & SECURITY LOGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 text-right">
                {/* Admin Login Audit Logs */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Shield className="text-indigo-400" size={18} />
                      <span>لاگ‌های امنیتی ورود مدیر (Login Security Audit Logs)</span>
                    </h2>
                    <button
                      onClick={fetchAdminData}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} />
                      <span>بروزرسانی لاگ‌ها</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-slate-300 text-right">
                      <thead className="bg-slate-900 text-slate-400 text-[11px] border-b border-slate-700">
                        <tr>
                          <th className="p-2.5">تاریخ و زمان</th>
                          <th className="p-2.5">آدرس آی‌پوش (IP)</th>
                          <th className="p-2.5">ایمیل</th>
                          <th className="p-2.5">وضعیت</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                        {loginLogs.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-slate-500 font-sans">
                              هنوز لاگی ثبت نشده است.
                            </td>
                          </tr>
                        ) : (
                          loginLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-800/40">
                              <td className="p-2.5 text-slate-300">{log.faDate} - {log.faTime}</td>
                              <td className="p-2.5 text-indigo-300">{log.ip}</td>
                              <td className="p-2.5 text-slate-400">{log.email}</td>
                              <td className="p-2.5 font-sans">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300' :
                                  log.status === 'LOCKED' ? 'bg-rose-500/20 text-rose-300' :
                                  'bg-amber-500/20 text-amber-300'
                                }`}>
                                  {log.status === 'SUCCESS' && 'ورود موفق'}
                                  {log.status === 'FAILED_PASSWORD' && 'رمز اشتباه'}
                                  {log.status === 'FAILED_OTP' && 'کد OTP اشتباه'}
                                  {log.status === 'LOCKED' && 'حساب مسدود شد'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Vercel Environment Variables Guide & SMTP Info */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 text-xs leading-relaxed">
                  <h3 className="text-sm font-extrabold text-amber-400 flex items-center gap-2 pb-2 border-b border-slate-700">
                    <Sparkles size={16} />
                    <span>راهنمای مدیریت و تغییر ایمیل/رمز مدیر در Vercel</span>
                  </h3>

                  <div className="space-y-3 text-slate-300">
                    <p>
                      تمام مشخصات حساس و اطلاعات ورود مدیر از <strong>متغیرهای محیطی Vercel (Environment Variables)</strong> خوانده می‌شود.
                    </p>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-indigo-300 space-y-1 dir-ltr text-left">
                      <p>ADMIN_EMAIL=fmfarshad585@gmail.com</p>
                      <p>ADMIN_PASSWORD=Admin40Gates!2026</p>
                      <p>GMAIL_USER=fmfarshad585@gmail.com</p>
                      <p>GMAIL_APP_PASSWORD=••••••••••••••••</p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="font-bold text-white">نحوه تغییر ایمیل مدیر:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-slate-400">
                        <li>وارد پنل Vercel خود شوید و به بخش <strong>Settings &gt; Environment Variables</strong> بروید.</li>
                        <li>مقدار <code className="text-amber-300 font-mono">ADMIN_EMAIL</code> را ویرایش کنید.</li>
                        <li>پروژه را دپلوی مجدد (Redeploy) کنید تا تغییرات اعمال گردد.</li>
                      </ol>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}
