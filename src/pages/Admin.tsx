/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
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
  FileText,
  FileSpreadsheet,
  Trash2,
  Save,
  X,
  Check
} from 'lucide-react';
import SEO from '../components/SEO';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';
import { BLOG_ARTICLES } from '../data/blog';
import { Product, Order } from '../types';
import { sendOrderStatusEmail } from '../utils/emailApi';

import defaultProductImg from '../assets/images/book_40gates_print_1.jpg';

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
  const { 
    orders, 
    updateOrderStatus, 
    setCurrentPage, 
    refreshOrdersAndUsers, 
    products, 
    updateProduct, 
    addProduct, 
    deleteProduct, 
    resetProducts 
  } = useApp();

  const productsList = products || PRODUCTS;

  // Authentication State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('40gates_admin_token');
  });
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(true);

  // Login Form States (TOTP 2FA)
  const [loginStep, setLoginStep] = useState<'credentials' | 'otp'>('credentials');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');
  const [tempToken, setTempToken] = useState<string>('');
  const [require2faSetup, setRequire2faSetup] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [secretCopied, setSecretCopied] = useState<boolean>(false);
  
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<
    'orders' | 'products' | 'inventory' | 'customers' | 'articles' | 'messages' | 'discounts' | 'settings'
  >('orders');

  // Product Management & Modal States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    title: '',
    englishTitle: '',
    price: 490000,
    salePrice: 390000,
    stock: 50,
    type: 'printed',
    category: 'books',
    author: 'فرشاد میرشکاری',
    format: 'قطع رقعی - کاغذ سوئدی',
    shortDescription: '',
    description: '',
    featured: false,
    bestSeller: false,
    newArrival: true,
    tags: ['کتاب', 'چهل دروازه به ماورا', 'فرشاد میرشکاری']
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  
  // Tracking Code Input state per order
  const [trackingInputs, setTrackingInputs] = useState<{ [orderId: string]: string }>({});

  // Backend fetched data
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [contactMsgs, setContactMsgs] = useState<ContactMessage[]>([]);
  const [settingsInfo, setSettingsInfo] = useState<any>(null);
  const [serverUsers, setServerUsers] = useState<Array<{ id: string; fullName: string; email: string; phone?: string; registeredAt?: string; faDate?: string }>>([]);
  const [emailSystemLogs, setEmailSystemLogs] = useState<Array<{ id: string; type: string; to: string; subject: string; timestamp: string; status: string; errorDetails?: string }>>([]);
  const [testEmailAddress, setTestEmailAddress] = useState<string>('fmfarshad585@gmail.com');
  const [testEmailLoading, setTestEmailLoading] = useState<boolean>(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // SMTP Settings inputs
  const [smtpUserInput, setSmtpUserInput] = useState<string>('');
  const [smtpPassInput, setSmtpPassInput] = useState<string>('');
  const [adminEmailConfigInput, setAdminEmailConfigInput] = useState<string>('fmfarshad585@gmail.com');
  const [smtpSaving, setSmtpSaving] = useState<boolean>(false);
  const [smtpSaveResult, setSmtpSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  // Supabase Connection State
  const [supabaseStatus, setSupabaseStatus] = useState<{
    loading: boolean;
    connected: boolean;
    configured: boolean;
    url: string | null;
    hasAnonKey: boolean;
    hasServiceKey: boolean;
    message: string;
  }>({
    loading: false,
    connected: false,
    configured: false,
    url: null,
    hasAnonKey: false,
    hasServiceKey: false,
    message: ''
  });

  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>('');
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState<string>('');
  const [supabaseServiceKeyInput, setSupabaseServiceKeyInput] = useState<string>('');
  const [supabaseSaving, setSupabaseSaving] = useState<boolean>(false);
  const [supabaseSaveMsg, setSupabaseSaveMsg] = useState<{ success: boolean; message: string } | null>(null);

  const checkSupabaseStatus = async () => {
    setSupabaseStatus(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setSupabaseStatus({
        loading: false,
        connected: Boolean(data.connected),
        configured: Boolean(data.configured),
        url: data.url || null,
        hasAnonKey: Boolean(data.hasAnonKey),
        hasServiceKey: Boolean(data.hasServiceKey),
        message: data.message || ''
      });
      if (data.url && !supabaseUrlInput) {
        setSupabaseUrlInput(data.url);
      }
    } catch (err) {
      setSupabaseStatus({
        loading: false,
        connected: false,
        configured: false,
        url: null,
        hasAnonKey: false,
        hasServiceKey: false,
        message: 'خطا در ارتباط با سرور هنگام بررسی وضعیت Supabase'
      });
    }
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseSaving(true);
    setSupabaseSaveMsg(null);
    try {
      const res = await fetch('/api/supabase/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: supabaseUrlInput,
          anonKey: supabaseAnonKeyInput,
          serviceKey: supabaseServiceKeyInput
        })
      });
      const data = await res.json();
      if (data.success) {
        setSupabaseSaveMsg({ success: true, message: 'تنظیمات کلیدهای Supabase با موفقیت ثبت شدند.' });
        await checkSupabaseStatus();
      } else {
        setSupabaseSaveMsg({ success: false, message: data.error || 'خطا در ذخیره کلیدها' });
      }
    } catch (err) {
      setSupabaseSaveMsg({ success: false, message: 'خطا در شبکه هنگام ذخیره تنظیمات Supabase' });
    } finally {
      setSupabaseSaving(false);
    }
  };

  // Custom Discount Coupons state
  const [coupons, setCoupons] = useState([
    { code: 'DREAM20', discount: '۲۰٪', minSpend: '۱,۰۰۰,۰۰۰ تومان', description: 'تخفیف ویژه اولین خرید', active: true },
    { code: 'BEDAR40', discount: '۴۰٪', minSpend: 'بدون حداقل خرید', description: 'تخفیف طلایی کمپین رویا', active: true },
    { code: 'VIPGATES', discount: '۱۵٪', minSpend: '۵۰۰,۰۰۰ تومان', description: 'کد تخفیف اعضای VIP', active: true },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('10');

  // Refresh data loading and toast state
  const [isDataRefreshing, setIsDataRefreshing] = useState<boolean>(false);
  const [refreshNotification, setRefreshNotification] = useState<string | null>(null);

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

  // Fetch admin logs, settings, contact messages, users, and orders
  const fetchAdminData = async () => {
    setIsDataRefreshing(true);
    setRefreshNotification(null);
    try {
      // 1. Sync orders
      await refreshOrdersAndUsers();

      // 2. Users (Public/Admin sync)
      const usersPromise = fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.users)) setServerUsers(data.users);
        })
        .catch(err => console.warn('Users error:', err));

      if (adminToken) {
        // 3. Logs
        const logsPromise = fetch('/api/admin/logs', {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) setLoginLogs(data.logs || []);
          })
          .catch(err => console.warn('Logs error:', err));

        // 4. Settings
        const settingsPromise = fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.settings) {
              setSettingsInfo(data.settings);
              if (data.settings.smtpUser && data.settings.smtpUser !== 'تنظیم نشده') {
                setSmtpUserInput(prev => prev || data.settings.smtpUser);
              }
              if (data.settings.adminEmail) {
                setAdminEmailConfigInput(prev => prev || data.settings.adminEmail);
              }
            }
          })
          .catch(err => console.warn('Settings error:', err));

        // 5. Messages
        const msgsPromise = fetch('/api/admin/contact-messages', {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) setContactMsgs(data.messages || []);
          })
          .catch(err => console.warn('Messages error:', err));

        // 6. Email logs
        const emailLogsPromise = fetch('/api/email/logs')
          .then(res => res.json())
          .then(data => {
            if (data.success && Array.isArray(data.logs)) setEmailSystemLogs(data.logs);
          })
          .catch(err => console.warn('Email logs error:', err));

        // 7. Supabase status
        checkSupabaseStatus().catch(() => {});

        await Promise.all([usersPromise, logsPromise, settingsPromise, msgsPromise, emailLogsPromise]);
      } else {
        await usersPromise;
      }

      setRefreshNotification('داده‌های پنل مدیریت (سفارش‌ها، کاربران، پیام‌ها و لاگ‌ها) با موفقیت بروزرسانی شدند.');
      setTimeout(() => setRefreshNotification(null), 4000);
    } catch (err) {
      console.warn('Error refreshing admin data:', err);
      setRefreshNotification('خطایی در بروزرسانی اطلاعات رخ داد.');
      setTimeout(() => setRefreshNotification(null), 4000);
    } finally {
      setIsDataRefreshing(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setSmtpSaving(true);
    setSmtpSaveResult(null);

    try {
      const res = await fetch('/api/admin/smtp-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          gmailUser: smtpUserInput,
          gmailPass: smtpPassInput,
          adminEmail: adminEmailConfigInput
        })
      });
      const data = await res.json();
      if (data.success) {
        setSmtpSaveResult({ success: true, message: data.message });
        setSmtpPassInput('');
        fetchAdminData();
      } else {
        setSmtpSaveResult({ success: false, message: data.error || 'خطا در ذخیره تنظیمات SMTP' });
      }
    } catch (err) {
      setSmtpSaveResult({ success: false, message: 'خطا در ارتباط با سرور' });
    } finally {
      setSmtpSaving(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setTestEmailLoading(true);
    setTestEmailResult(null);

    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ testEmail: testEmailAddress })
      });
      const data = await res.json();
      setTestEmailResult({
        success: !!data.success,
        message: data.message || (data.success ? 'ایمیل تست ارسال شد.' : 'خطا در ارسال ایمیل')
      });
      fetchAdminData();
    } catch (err) {
      setTestEmailResult({ success: false, message: 'خطا در ارتباط با سرور' });
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleReset2FA = async () => {
    if (!adminToken) return;
    if (!window.confirm('آیا از بازنشانی کلید ۲FA اطمینان دارید؟ پس از این کار، در ورود بعدی QR کد جدیدی نمایش داده می‌شود.')) return;
    try {
      const res = await fetch('/api/admin/reset-totp', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      alert(data.message || 'تنظیمات ۲FA با موفقیت بازنشانی شد.');
    } catch (err) {
      alert('خطا در ارتباط با سرور.');
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchAdminData();
    }
  }, [adminToken, activeTab]);

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
        setTempToken(data.tempToken || '');
        setRequire2faSetup(!!data.require2faSetup);
        setQrCodeUrl(data.qrCodeUrl || '');
        setSecretKey(data.secretKey || '');
        setLoginStep('otp');
        setOtpInput('');
        setAuthMessage(data.message || 'لطفاً کد ۶ رقمی را وارد نمایید.');
      } else {
        setAuthError(data.error || 'اطلاعات ورود مدیر نادرست است.');
      }
    } catch (err: any) {
      setAuthError('خطای ارتباط با سرور. لطفاً مجددا تلاش کنید.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Step 2: Submit TOTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);

    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setAuthError('لطفاً کد ۶ رقمی نرم‌افزار Authenticator را به‌طور کامل وارد نمایید.');
      return;
    }

    setAuthLoading(true);

    try {
      const res = await fetch('/api/admin/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: otpInput.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        localStorage.setItem('40gates_admin_token', data.token);
        setAdminToken(data.token);
        setAdminEmail(data.admin?.email || emailInput.trim());
      } else {
        setAuthError(data.error || 'کد ورود ۲FA اشتباه است.');
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

  // --- Excel Exporters ---
  const exportOrdersToExcel = () => {
    const data = orders.map((o) => ({
      'شناسه سفارش': o.id,
      'تاریخ ثبت': o.date,
      'وضعیت سفارش':
        o.status === 'completed' ? 'تکمیل / ارسال شده' :
        o.status === 'processing' ? 'در حال پردازش' :
        o.status === 'cancelled' ? 'لغو شده' : 'در انتظار',
      'نام خریدار': o.shippingAddress?.fullName || 'کاربر ثبت‌نامی',
      'شماره تماس': o.shippingAddress?.phone || '-',
      'ایمیل خریدار': o.shippingAddress?.email || o.userEmail || '-',
      'استان': o.shippingAddress?.province || '-',
      'شهر': o.shippingAddress?.city || '-',
      'آدرس پستی': o.shippingAddress?.address || 'تحویل فایل دیجیتال',
      'کد پستی': o.shippingAddress?.postalCode || '-',
      'مبلغ کل (تومان)': o.totalAmount || 0,
      'درگاه پرداخت': o.paymentGateway || 'کارت به کارت',
      'کد رهگیری پستی': o.trackingCode || 'ثبت نشده',
      'کد تخفیف استفاده شده': o.couponUsed || 'ندارد',
      'اقلام سفارش': o.items?.map(i => `${i.title} (${i.quantity} عدد)`).join(' | ') || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'سفارشات');
    XLSX.writeFile(wb, `Orders_List_40Gates_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setRefreshNotification('خروجی اکسل لیست سفارشات با موفقیت دانلود شد.');
    setTimeout(() => setRefreshNotification(null), 3000);
  };

  const exportProductsToExcel = () => {
    const data = productsList.map((p) => ({
      'شناسه محصول': p.id,
      'عنوان محصول': p.title,
      'عنوان انگلیسی': p.englishTitle || '',
      'قیمت اصلی (تومان)': p.price,
      'قیمت با تخفیف (تومان)': p.salePrice || p.price,
      'میزان تخفیف (تومان)': p.salePrice ? (p.price - p.salePrice) : 0,
      'درصد تخفیف': p.salePrice ? `${Math.round(((p.price - p.salePrice) / p.price) * 100)}٪` : '۰٪',
      'موجودی انبار (تعداد)': p.stock,
      'وضعیت موجودی': p.stock > 0 ? 'موجود' : 'ناموجود',
      'دسته بندی': p.category === 'books' ? 'کتاب چاپی / PDF' : p.category === 'audiobooks' ? 'کتاب صوتی' : p.category === 'courses' ? 'دوره آموزشی' : 'ابزار',
      'نوع اثر': p.type === 'printed' ? 'چاپی' : p.type === 'pdf' ? 'فایل PDF' : p.type === 'audio' ? 'صوتی MP3' : 'دوره ویدیویی',
      'فرمت / صفحات': p.format || (p.pages ? `${p.pages} صفحه` : ''),
      'مدت زمان': p.duration || '-',
      'نویسنده / مدرس': p.author || 'فرشاد میرشکاری',
      'امتیاز': p.rating || 5,
      'تعداد دیدگاه‌ها': p.reviewsCount || 0,
      'تگ‌ها': p.tags ? p.tags.join('، ') : '',
      'توضیح کوتاه': p.shortDescription || '',
      'لینک مستقیم دانلود': p.downloadUrl || '-'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'کاتالوگ_محصولات');
    XLSX.writeFile(wb, `Products_Catalog_40Gates_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setRefreshNotification('خروجی اکسل کاتالوگ محصولات با موفقیت دانلود شد.');
    setTimeout(() => setRefreshNotification(null), 3000);
  };

  const exportInventoryToExcel = () => {
    const data = productsList.map((p) => ({
      'شناسه': p.id,
      'عنوان محصول': p.title,
      'نوع محصول': p.type === 'printed' ? 'کتاب چاپی' : p.type === 'pdf' ? 'فایل PDF' : p.type === 'audio' ? 'کتاب صوتی' : 'دوره آموزشی',
      'فرمت / مشخصات': p.format || '-',
      'موجودی فعلی (تعداد)': p.stock,
      'وضعیت انبار': p.stock === 0 ? 'پایان موجودی (ناموجود)' : p.stock <= 10 ? 'موجودی محدود (هشدار انبار)' : 'موجود / انبار پر',
      'قیمت عرضه (تومان)': p.salePrice || p.price,
      'نویسنده / ناشر': p.author || 'فرشاد میرشکاری'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'موجودی_انبار');
    XLSX.writeFile(wb, `Inventory_Report_40Gates_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setRefreshNotification('خروجی اکسل موجودی انبار با موفقیت دانلود شد.');
    setTimeout(() => setRefreshNotification(null), 3000);
  };

  const exportCustomersToExcel = () => {
    const combinedEmails = Array.from(new Set([
      ...serverUsers.map(u => u.email),
      ...orders.map(o => o.shippingAddress?.email || o.userEmail).filter(Boolean) as string[]
    ]));

    const data = combinedEmails.map((custEmail) => {
      const registeredUser = serverUsers.find(u => u.email?.toLowerCase() === custEmail.toLowerCase());
      const userOrders = orders.filter(o => (o.shippingAddress?.email || o.userEmail)?.toLowerCase() === custEmail.toLowerCase());
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const name = registeredUser?.fullName || userOrders[0]?.shippingAddress?.fullName || 'هنرجوی رویابینی شفاف';
      const phone = registeredUser?.phone || userOrders[0]?.shippingAddress?.phone || '-';
      const regDate = registeredUser?.faDate || 'عضو آکادمی';

      return {
        'نام و نام خانوادگی': name,
        'آدرس ایمیل': custEmail,
        'شماره تلفن': phone,
        'تاریخ عضویت / ثبت': regDate,
        'تعداد سفارشات': userOrders.length,
        'مجموع خریدهای پرداختی (تومان)': totalSpent,
        'استان': userOrders[0]?.shippingAddress?.province || '-',
        'شهر': userOrders[0]?.shippingAddress?.city || '-'
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'مشتریان_و_کاربران');
    XLSX.writeFile(wb, `Customers_List_40Gates_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setRefreshNotification('خروجی اکسل مخاطبان و خریداران با موفقیت دانلود شد.');
    setTimeout(() => setRefreshNotification(null), 3000);
  };

  const exportMessagesToExcel = () => {
    const data = contactMsgs.map((m) => ({
      'شناسه پیام': m.id,
      'نام فرستنده': m.name,
      'ایمیل فرستنده': m.email,
      'موضوع': m.subject || 'پیام تماس با ما',
      'تاریخ ارسال': m.faDate,
      'زمان ارسال': m.faTime,
      'متن کامل پیام': m.message,
      'وضعیت بررسی': m.read ? 'پاسخ داده شده / خوانده شده' : 'جدید / خوانده نشده'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'پیام‌های_دریافتی');
    XLSX.writeFile(wb, `Contact_Messages_40Gates_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setRefreshNotification('خروجی اکسل پیام‌های دریافت شده با موفقیت دانلود شد.');
    setTimeout(() => setRefreshNotification(null), 3000);
  };

  // --- Product CRUD Operations ---
  const handleToggleStock = (productId: string) => {
    const target = productsList.find(p => p.id === productId);
    if (target) {
      const newStock = target.stock > 0 ? 0 : 99;
      updateProduct(productId, { stock: newStock });
    }
  };

  const handleUpdatePrice = (productId: string, newPrice: number) => {
    updateProduct(productId, { price: newPrice });
  };

  const handleUpdateSalePrice = (productId: string, newSalePrice: number | undefined) => {
    updateProduct(productId, { salePrice: newSalePrice && newSalePrice > 0 ? newSalePrice : undefined });
  };

  const handleUpdateStockCount = (productId: string, newStock: number) => {
    updateProduct(productId, { stock: newStock });
  };

  const handleSaveEditedProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      ...editingProduct,
      price: Number(editingProduct.price) || 0,
      salePrice: editingProduct.salePrice ? Number(editingProduct.salePrice) : undefined,
      stock: Number(editingProduct.stock) || 0
    });

    setRefreshNotification(`محصول «${editingProduct.title}» با موفقیت بروزرسانی شد.`);
    setEditingProduct(null);
    setTimeout(() => setRefreshNotification(null), 3500);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.title) return;

    const newProd: Product = {
      id: `prod-${Date.now().toString().slice(-6)}`,
      title: newProductForm.title || 'محصول جدید',
      englishTitle: newProductForm.englishTitle || '',
      price: Number(newProductForm.price) || 0,
      salePrice: newProductForm.salePrice ? Number(newProductForm.salePrice) : undefined,
      stock: Number(newProductForm.stock) || 0,
      type: (newProductForm.type as any) || 'printed',
      category: (newProductForm.category as any) || 'books',
      description: newProductForm.description || newProductForm.shortDescription || 'توضیحات اثر جدید آکادمی چهل دروازه.',
      shortDescription: newProductForm.shortDescription || '',
      author: newProductForm.author || 'فرشاد میرشکاری',
      format: newProductForm.format || 'نسخه اختصاصی',
      rating: 5.0,
      reviewsCount: 0,
      images: [defaultProductImg],
      tags: typeof newProductForm.tags === 'string'
        ? (newProductForm.tags as string).split('،').map((t: string) => t.trim())
        : (newProductForm.tags || []),
      downloadUrl: newProductForm.downloadUrl,
      featured: !!newProductForm.featured,
      bestSeller: !!newProductForm.bestSeller,
      newArrival: !!newProductForm.newArrival
    };

    addProduct(newProd);
    setIsAddingProduct(false);
    setRefreshNotification(`محصول جدید «${newProd.title}» با موفقیت به کاتالوگ افزوده شد.`);
    setTimeout(() => setRefreshNotification(null), 3500);
  };

  const handleDeleteProduct = (id: string, title: string) => {
    if (window.confirm(`آیا از حذف محصول «${title}» اطمینان دارید؟`)) {
      deleteProduct(id);
      setRefreshNotification(`محصول «${title}» با موفقیت حذف گردید.`);
      setTimeout(() => setRefreshNotification(null), 3500);
    }
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
        <SEO title="ورود مدیر آکادمی | چهل دروازه" description="درگاه امن ورود مدیریت آکادمی چهل دروازه به همراه احراز هویت دو مرحله‌ای" />

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
              <h1 className="text-lg font-extrabold text-white">درگاه مدیریت آکادمی چهل دروازه</h1>
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
                    <span>احراز هویت دو عاملی (TOTP 2FA)</span>
                  </div>
                  <p>پس از بررسی رمز عبور، ورود با کد ۶ رقمی اپلیکیشن Google Authenticator انجام می‌شود.</p>
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
                      <span>ورود و بررسی کد دو عاملی (2FA)</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: TOTP 2FA VERIFICATION & SETUP FORM */}
            {loginStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                {require2faSetup ? (
                  <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-2xl border border-indigo-500/30">
                    <div className="text-amber-400 font-extrabold flex items-center gap-1.5 text-xs pb-1 border-b border-slate-800">
                      <Sparkles size={15} />
                      <span>راه‌اندازی احراز هویت دو عاملی (Google/Microsoft Authenticator)</span>
                    </div>
                    
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      ۱. اپلیکیشن Google Authenticator یا Microsoft Authenticator را در گوشی همراه خود باز کنید.<br />
                      ۲. گزینه افزودن (+) را زده و تصویر QR کد زیر را اسکن نمایید:
                    </p>

                    {qrCodeUrl && (
                      <div className="bg-white p-3 rounded-2xl w-fit mx-auto shadow-xl border border-slate-700 my-2">
                        <img src={qrCodeUrl} alt="2FA QR Code" className="w-44 h-44 mx-auto" />
                      </div>
                    )}

                    {secretKey && (
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 block">کلید متنی جهت افزودن دستی در اپلیکیشن:</span>
                        <div className="flex items-center justify-between text-xs font-mono text-indigo-300 dir-ltr bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                          <span className="select-all tracking-wider">{secretKey}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(secretKey);
                              setSecretCopied(true);
                              setTimeout(() => setSecretCopied(false), 2000);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shrink-0 cursor-pointer dir-rtl transition-colors"
                          >
                            {secretCopied ? 'کپی شد! ✓' : 'کپی کلید'}
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="text-slate-300 text-[11px] font-bold pt-1">
                      ۳. کد ۶ رقمی تولیدشده در نرم‌افزار را در کادر زیر وارد نمایید:
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      کد ۶ رقمی نرم‌افزار Authenticator (Google / Microsoft):
                    </label>
                  </div>
                )}

                <div>
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
                        <span>تایید کد و ورود به پنل</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginStep('credentials')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-xl transition-colors cursor-pointer text-xs"
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
      <SEO title="پنل مدیریت | چهل دروازه" description="مدیریت سفارش‌ها، محصولات، موجودی، کاربران و تنظیمات آکادمی چهل دروازه" />

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
                  <span>پنل مدیریت آکادمی چهل دروازه</span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    ADMIN
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-mono">ورود فعال: {adminEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchAdminData()}
                disabled={isDataRefreshing}
                className="bg-indigo-600/20 hover:bg-indigo-600/30 disabled:opacity-50 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
                title="بروزرسانی لیست سفارش‌ها، کاربران و پیام‌ها"
              >
                <RefreshCw size={14} className={isDataRefreshing ? "animate-spin text-amber-400" : ""} />
                <span className="hidden sm:inline">{isDataRefreshing ? "در حال بروزرسانی..." : "بروزرسانی داده‌ها"}</span>
              </button>

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

          {/* Toast Refresh Notification Banner */}
          <AnimatePresence>
            {refreshNotification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 max-w-7xl mx-auto bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs flex items-center justify-between font-medium shadow-md"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{refreshNotification}</span>
                </div>
                <button
                  onClick={() => setRefreshNotification(null)}
                  className="text-emerald-400 hover:text-emerald-200 text-xs font-bold px-2 py-0.5"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
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
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <ShoppingBag className="text-indigo-400" size={18} />
                      <span>مدیریت سفارش‌ها ({orders.length} سفارش)</span>
                    </h2>

                    <button
                      onClick={exportOrdersToExcel}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <FileSpreadsheet size={15} />
                      <span>خروجی اکسل</span>
                    </button>
                  </div>

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
                                value={trackingInputs[order.id] !== undefined ? trackingInputs[order.id] : (order.trackingCode && !order.trackingCode.startsWith('PST-') ? order.trackingCode : '')}
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
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-5 text-right">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-4 border-b border-slate-700">
                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Package className="text-indigo-400" size={20} />
                      <span>مدیریت کاتالوگ محصولات ({productsList.length} اثر و دوره)</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      تنظیم قیمت اصلی، قیمت تخفیف‌دار، موجودی انبار، عنوان و ویرایش کامل ویژگی‌ها
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={exportProductsToExcel}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <FileSpreadsheet size={16} />
                      <span>خروجی اکسل محصولات</span>
                    </button>

                    <button
                      onClick={() => setIsAddingProduct(true)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>افزودن محصول جدید</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('آیا می‌خواهید کاتالوگ محصولات به حالت اولیه بازگردد؟')) {
                          resetProducts();
                          setRefreshNotification('کاتالوگ محصولات بازنشانی شد.');
                          setTimeout(() => setRefreshNotification(null), 3000);
                        }
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                      title="بازنشانی به کاتالوگ اولیه"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative md:col-span-2">
                    <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="جستجو در عنوان، نویسنده، تگ‌ها..."
                      value={productSearchQuery}
                      onChange={e => setProductSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={e => setProductCategoryFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">همه دسته‌بندی‌ها</option>
                    <option value="books">کتاب‌های چاپی و PDF</option>
                    <option value="audiobooks">کتاب‌های صوتی</option>
                    <option value="courses">دوره‌های جامع و ویدیویی</option>
                  </select>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productsList
                    .filter(p => {
                      if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
                      if (productSearchQuery.trim()) {
                        const q = productSearchQuery.toLowerCase();
                        return p.title.toLowerCase().includes(q) || (p.englishTitle && p.englishTitle.toLowerCase().includes(q));
                      }
                      return true;
                    })
                    .map(product => {
                      const isStockAvailable = product.stock > 0;
                      const discountPercent = product.salePrice && product.salePrice < product.price
                        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
                        : 0;

                      return (
                        <div key={product.id} className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-indigo-500/50 transition-colors">
                          <div className="flex gap-3">
                            <img
                              src={product.images?.[0] || product.image || defaultProductImg}
                              alt={product.title}
                              className="w-20 h-24 object-cover rounded-xl border border-slate-700/80 shrink-0 shadow-sm"
                            />
                            <div className="space-y-1.5 text-xs flex-grow">
                              <div className="flex justify-between items-start gap-1">
                                <h3 className="font-bold text-white text-xs leading-snug">{product.title}</h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] shrink-0 font-bold ${
                                  isStockAvailable ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}>
                                  {isStockAvailable ? `${product.stock} موجود` : 'ناموجود'}
                                </span>
                              </div>

                              <p className="text-[10px] text-indigo-300">{product.englishTitle || product.author}</p>

                              <div className="flex flex-wrap gap-1 text-[9px] pt-1">
                                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                                  {product.type === 'printed' ? 'کتاب چاپی' : product.type === 'pdf' ? 'فایل PDF' : product.type === 'audio' ? 'کتاب صوتی' : 'دوره آنلاین'}
                                </span>
                                {discountPercent > 0 && (
                                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                                    {discountPercent}٪ تخفیف
                                  </span>
                                )}
                                {product.featured && <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">ویژه</span>}
                                {product.bestSeller && <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">پرفروش</span>}
                              </div>
                            </div>
                          </div>

                          {/* Quick Price & Stock Controls */}
                          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2 text-[11px]">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">قیمت اصلی (تومان):</label>
                                <input
                                  type="number"
                                  value={product.price}
                                  onChange={e => handleUpdatePrice(product.id, Number(e.target.value))}
                                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">قیمت با تخفیف (تومان):</label>
                                <input
                                  type="number"
                                  placeholder="بدون تخفیف"
                                  value={product.salePrice || ''}
                                  onChange={e => handleUpdateSalePrice(product.id, Number(e.target.value))}
                                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-amber-300 text-xs font-mono focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400">موجودی انبار:</span>
                                <input
                                  type="number"
                                  value={product.stock}
                                  onChange={e => handleUpdateStockCount(product.id, Number(e.target.value))}
                                  className="w-16 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-0.5 text-center text-white text-xs font-mono"
                                />
                              </div>

                              <button
                                onClick={() => handleToggleStock(product.id)}
                                className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer transition-colors ${
                                  isStockAvailable
                                    ? 'border-rose-500/40 text-rose-300 hover:bg-rose-500/10'
                                    : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'
                                }`}
                              >
                                {isStockAvailable ? 'تغییر به ناموجود' : 'تغییر به موجود'}
                              </button>
                            </div>
                          </div>

                          {/* Buttons */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit3 size={13} />
                              <span>ویرایش کامل و توضیحات</span>
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(product.id, product.title)}
                              className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="حذف محصول"
                            >
                              <Trash2 size={13} />
                              <span>حذف</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* TAB 3: INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 text-right">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Server className="text-indigo-400" size={18} />
                    <span>مدیریت موجودی انبار کتب چاپی و فایل‌های دیجیتال</span>
                  </h2>

                  <button
                    onClick={exportInventoryToExcel}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet size={15} />
                    <span>خروجی اکسل انبار</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-300 text-right">
                    <thead className="bg-slate-900 text-slate-400 text-[11px] border-b border-slate-700">
                      <tr>
                        <th className="p-3">عنوان محصول</th>
                        <th className="p-3">فرمت / نوع</th>
                        <th className="p-3">تعداد موجودی انبار</th>
                        <th className="p-3">وضعیت هشدار</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {productsList.map(p => (
                        <tr key={p.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-white">{p.title}</td>
                          <td className="p-3">
                            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px]">
                              {p.type === 'printed' ? 'کتاب چاپی' : p.type === 'pdf' ? 'فایل PDF' : p.type === 'audio' ? 'کتاب صوتی' : 'دوره آنلاین'}
                            </span>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={p.stock}
                              onChange={e => handleUpdateStockCount(p.id, Number(e.target.value))}
                              className="w-20 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-center text-white text-xs font-mono"
                            />
                          </td>
                          <td className="p-3">
                            {p.stock === 0 ? (
                              <span className="text-rose-400 font-bold">پایان موجودی انبار</span>
                            ) : p.stock <= 10 ? (
                              <span className="text-amber-400 font-bold">موجودی محدود (هشدار)</span>
                            ) : (
                              <span className="text-emerald-400 font-bold">انبار پر / آماده ارسال</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: CUSTOMERS */}
            {activeTab === 'customers' && (() => {
              const combinedEmails = Array.from(new Set([
                ...serverUsers.map(u => u.email),
                ...orders.map(o => o.shippingAddress?.email || o.userEmail).filter(Boolean) as string[]
              ]));

              return (
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 text-right">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Users className="text-indigo-400" size={18} />
                      <span>لیست کاربران ثبت‌نامی و خریداران آکادمی ({combinedEmails.length} کاربر)</span>
                    </h2>

                    <button
                      onClick={exportCustomersToExcel}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet size={15} />
                      <span>خروجی اکسل مخاطبان</span>
                    </button>
                  </div>

                  {combinedEmails.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">هنوز کاربر ثبت شده‌ای در سیستم وجود ندارد.</p>
                  ) : (
                    <div className="space-y-3">
                      {combinedEmails.map((custEmail, i) => {
                        const registeredUser = serverUsers.find(u => u.email.toLowerCase() === custEmail.toLowerCase());
                        const userOrders = orders.filter(o => (o.shippingAddress?.email || o.userEmail)?.toLowerCase() === custEmail.toLowerCase());
                        const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                        const name = registeredUser?.fullName || userOrders[0]?.shippingAddress?.fullName || 'هنرجوی رویابینی شفاف';
                        const phone = registeredUser?.phone || userOrders[0]?.shippingAddress?.phone || '-';
                        const regDate = registeredUser?.faDate || 'عضو آکادمی';

                        return (
                          <div key={i} className="bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:border-indigo-500/40 transition-colors">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{name}</span>
                                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-0.5 rounded font-mono">
                                  {custEmail}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                <span>تلفن: {phone}</span>
                                <span>•</span>
                                <span className="text-indigo-300">تاریخ ثبت: {regDate}</span>
                              </div>
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
              );
            })()}

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
                    <span>پیام‌های دریافتی از فرم تماس ({contactMsgs.length} پیام)</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportMessagesToExcel}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet size={14} />
                      <span>خروجی اکسل</span>
                    </button>
                    <button
                      onClick={fetchAdminData}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} />
                      <span>بروزرسانی پیام‌ها</span>
                    </button>
                  </div>
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

                {/* Supabase Database Connection Diagnostics & Configuration */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-700">
                    <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Server className="text-indigo-400" size={18} />
                      <span>وضعیت اتصال به دیتابیس Supabase (Supabase Integration Status)</span>
                    </h2>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        supabaseStatus.connected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : supabaseStatus.configured
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {supabaseStatus.connected
                          ? '🟢 اتصال به Supabase فعال است'
                          : supabaseStatus.configured
                          ? '🟡 کلیدها موجود است اما ارتباط متصل نشد'
                          : '🔴 کلیدهای Supabase تنظیم نشده‌اند'}
                      </span>

                      <button
                        type="button"
                        onClick={checkSupabaseStatus}
                        disabled={supabaseStatus.loading}
                        className="bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={supabaseStatus.loading ? 'animate-spin' : ''} size={13} />
                        <span>تست مجدد اتصال</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
                      <div>
                        <span className="text-slate-400 block text-[11px]">آدرس URL پروژه:</span>
                        <span className="font-mono text-white dir-ltr block truncate">
                          {supabaseStatus.url || 'تنظیم نشده (مثلاً: https://xyz.supabase.co)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">کلید عمومی (Anon Key):</span>
                        <span className="font-bold">
                          {supabaseStatus.hasAnonKey ? '✅ ثبت شده (VITE_SUPABASE_ANON_KEY)' : '❌ ست نشده'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">کلید مدیر (Service Role Key):</span>
                        <span className="font-bold">
                          {supabaseStatus.hasServiceKey ? '✅ ثبت شده (SUPABASE_SERVICE_ROLE_KEY)' : '❌ ست نشده'}
                        </span>
                      </div>
                    </div>

                    {supabaseStatus.message && (
                      <div className={`p-3 rounded-xl border text-xs font-semibold ${
                        supabaseStatus.connected
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                          : 'bg-amber-950/60 text-amber-300 border-amber-800'
                      }`}>
                        {supabaseStatus.message}
                      </div>
                    )}

                    {/* Quick Config Form for Supabase Keys */}
                    <form onSubmit={handleSaveSupabaseConfig} className="pt-3 border-t border-slate-800 space-y-3">
                      <span className="block font-bold text-white text-xs">ویرایش یا وارد کردن کلیدهای Supabase به‌صورت زنده:</span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1 md:col-span-2">
                          <label className="block text-slate-300 text-[11px] font-bold">آدرس URL پروژه Supabase (VITE_SUPABASE_URL):</label>
                          <input
                            type="text"
                            placeholder="https://your-project-id.supabase.co"
                            value={supabaseUrlInput}
                            onChange={e => setSupabaseUrlInput(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-indigo-500 dir-ltr text-left"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-slate-300 text-[11px] font-bold">کلید ناشناس/عمومی (VITE_SUPABASE_ANON_KEY):</label>
                          <input
                            type="password"
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                            value={supabaseAnonKeyInput}
                            onChange={e => setSupabaseAnonKeyInput(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-indigo-500 dir-ltr text-left"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-slate-300 text-[11px] font-bold">کلید سرویس مدیر (SUPABASE_SERVICE_ROLE_KEY):</label>
                          <input
                            type="password"
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                            value={supabaseServiceKeyInput}
                            onChange={e => setSupabaseServiceKeyInput(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-indigo-500 dir-ltr text-left"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="submit"
                          disabled={supabaseSaving}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          {supabaseSaving ? <RefreshCw className="animate-spin" size={13} /> : <CheckCircle2 size={13} />}
                          <span>ذخیره کلیدهای Supabase</span>
                        </button>

                        {supabaseSaveMsg && (
                          <span className={`text-xs font-bold ${supabaseSaveMsg.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {supabaseSaveMsg.message}
                          </span>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
                {/* 2FA Security Configuration Card */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <ShieldCheck className="text-indigo-400" size={18} />
                      <span>امنیت ورود و احراز هویت دو عاملی (TOTP Two-Factor Auth)</span>
                    </h2>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                      🟢 2FA فعال است (Google Authenticator)
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3 text-xs">
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      ورود به پنل مدیریت با الگوریتم استاندارد TOTP (RFC 6238) محافظت می‌شود. در صورت تغییر گوشی همراه یا نیاز به اسکن مجدد QR کد، می‌توانید کلید ۲FA را بازنشانی نمایید.
                    </p>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handleReset2FA}
                        className="bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw size={14} />
                        <span>بازنشانی و ساخت QR کد جدید ۲FA</span>
                      </button>
                      <span className="text-[10px] text-slate-400">
                        * با این کار کلید فعلی حذف شده و در ورود بعدی QR کد جدیدی ایجاد می‌گردد.
                      </span>
                    </div>
                  </div>
                </div>

                {/* SMTP Credentials Configuration Card */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Settings className="text-amber-400" size={18} />
                      <span>تنظیمات سرور ارسال ایمیل واقعی (Gmail SMTP Configuration)</span>
                    </h2>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      settingsInfo?.smtpConfigured 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {settingsInfo?.smtpConfigured ? '🟢 SMTP فعال است' : '🟡 غیرفعال (شبیه‌سازی)'}
                    </span>
                  </div>

                  <form onSubmit={handleSaveSmtp} className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-4 text-xs">
                    <p className="text-[11px] text-slate-300 leading-relaxed bg-indigo-950/40 p-3 rounded-lg border border-indigo-800/50">
                      💡 برای فعال‌سازی ارسال ایمیل واقعی برای خریداران و مدیریت، آدرس جی‌میل و <strong>App Password (کلمه عبور اختصاصی برنامه)</strong> خود را وارد نمایید.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-slate-300 font-bold">آدرس ایمیل ارسال‌کننده (Gmail User):</label>
                        <input
                          type="email"
                          placeholder="مثلاً: 40gates.main@gmail.com"
                          value={smtpUserInput}
                          onChange={e => setSmtpUserInput(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500 dir-ltr text-left"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-300 font-bold">ایمیل دریافت‌کننده مدیریت (Admin Email):</label>
                        <input
                          type="email"
                          placeholder="مثلاً: fmfarshad585@gmail.com"
                          value={adminEmailConfigInput}
                          onChange={e => setAdminEmailConfigInput(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500 dir-ltr text-left"
                          required
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="block text-slate-300 font-bold">کلمه عبور برنامه (Gmail App Password - ۱۶ کاراکتر):</label>
                        <input
                          type="password"
                          placeholder="مثلاً: abcd efgh ijkl mnop"
                          value={smtpPassInput}
                          onChange={e => setSmtpPassInput(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500 dir-ltr text-left"
                        />
                        <p className="text-[10px] text-slate-400 leading-normal">
                          نکته: جهت دریافت App Password، وارد حساب گوگل خود شوید -&gt; امنیت (Security) -&gt; تایید دو مرحله‌ای -&gt; کلمه‌های عبور برنامه (App Passwords) و یک کد ۱۶ رقمی دریافت کنید.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="submit"
                        disabled={smtpSaving}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                      >
                        {smtpSaving ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                        <span>ذخیره و فعال‌سازی سرویس ایمیل</span>
                      </button>

                      {smtpSaveResult && (
                        <span className={`text-xs font-bold ${smtpSaveResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {smtpSaveResult.message}
                        </span>
                      )}
                    </div>
                  </form>
                </div>

                {/* Email System Test & Logs Section */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-700">
                    <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Mail className="text-indigo-400" size={18} />
                      <span>تست و عیب‌یابی سرویس ارسال ایمیل (Email Dispatch Diagnostics)</span>
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        settingsInfo?.smtpConfigured 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {settingsInfo?.smtpConfigured ? '🟢 سرویس SMTP فعال است' : '🟡 حالت شبیه‌ساز (GMAIL_USER ست نشده)'}
                      </span>
                      <button
                        onClick={fetchAdminData}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={12} />
                        <span>بروزرسانی</span>
                      </button>
                    </div>
                  </div>

                  {/* Test Email Form */}
                  <form onSubmit={handleSendTestEmail} className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 space-y-3 text-xs">
                    <span className="block font-bold text-slate-200">تست لحظه‌ای ارسال ایمیل به آدرس دلخواه:</span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        placeholder="آدرس ایمیل گیرنده"
                        value={testEmailAddress}
                        onChange={e => setTestEmailAddress(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500 flex-grow"
                        required
                      />
                      <button
                        type="submit"
                        disabled={testEmailLoading}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                      >
                        {testEmailLoading ? <RefreshCw className="animate-spin" size={14} /> : <Send size={14} />}
                        <span>ارسال ایمیل آزمایشی</span>
                      </button>
                    </div>

                    {testEmailResult && (
                      <div className={`p-2.5 rounded-lg text-xs font-semibold ${
                        testEmailResult.success 
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' 
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                      }`}>
                        {testEmailResult.message}
                      </div>
                    )}
                  </form>

                  {/* Email System Logs Table */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-300">آخرین لاگ‌های ارسال ایمیل توسط سرور:</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-slate-300 text-right">
                        <thead className="bg-slate-900 text-slate-400 text-[11px] border-b border-slate-700">
                          <tr>
                            <th className="p-2.5">زمان ارسال</th>
                            <th className="p-2.5">نوع ایمیل</th>
                            <th className="p-2.5">گیرنده</th>
                            <th className="p-2.5">موضوع</th>
                            <th className="p-2.5">وضعیت</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                          {emailSystemLogs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-slate-500 font-sans">
                                هنوز ایمیلی در این جلسه ثبت نشده است.
                              </td>
                            </tr>
                          ) : (
                            emailSystemLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-800/40">
                                <td className="p-2.5 text-slate-300">{log.timestamp}</td>
                                <td className="p-2.5 font-sans text-indigo-300">{log.type}</td>
                                <td className="p-2.5 text-slate-400">{log.to}</td>
                                <td className="p-2.5 font-sans text-slate-200">{log.subject}</td>
                                <td className="p-2.5 font-sans">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    log.status === 'sent' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                    log.status === 'simulated' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                    'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  }`}>
                                    {log.status === 'sent' && '✅ ارسال شد'}
                                    {log.status === 'simulated' && '🟡 شبیه‌سازی'}
                                    {log.status === 'failed' && '❌ ناموفق'}
                                  </span>
                                  {log.errorDetails && (
                                    <span className="block text-[9px] text-rose-400 mt-0.5 font-sans dir-ltr text-left">
                                      {log.errorDetails}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

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
                      <p>ADMIN_EMAIL=your-email@example.com</p>
                      <p>ADMIN_PASSWORD=••••••••••••••••</p>
                      <p>GMAIL_USER=your-email@gmail.com</p>
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

        {/* MODAL: EDIT PRODUCT */}
        <AnimatePresence>
          {editingProduct && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto dir-rtl text-right">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl text-xs"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Edit3 className="text-indigo-400" size={18} />
                    <span>ویرایش کامل محصول: {editingProduct.title}</span>
                  </h3>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">عنوان فارسی محصول:</label>
                    <input
                      type="text"
                      value={editingProduct.title}
                      onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">عنوان انگلیسی:</label>
                    <input
                      type="text"
                      value={editingProduct.englishTitle || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, englishTitle: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 dir-ltr text-left font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">قیمت اصلی (تومان):</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">قیمت فروش با تخفیف (تومان):</label>
                    <input
                      type="number"
                      placeholder="اگر تخفیف ندارد خالی بگذارید"
                      value={editingProduct.salePrice || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">تعداد موجودی انبار:</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={e => {
                        const stockVal = Number(e.target.value);
                        setEditingProduct({
                          ...editingProduct,
                          stock: stockVal,
                          inStock: stockVal > 0
                        });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">دسته‌بندی اصلی:</label>
                    <select
                      value={editingProduct.category}
                      onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="books">کتاب‌ها (چاپی و PDF)</option>
                      <option value="audiobooks">کتاب‌های صوتی</option>
                      <option value="courses">دوره‌های آموزشی</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">نوع محصول / فرمت:</label>
                    <select
                      value={editingProduct.type}
                      onChange={e => setEditingProduct({ ...editingProduct, type: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="printed">کتاب چاپی</option>
                      <option value="pdf">نسخه الکترونیکی PDF</option>
                      <option value="audio">فایل صوتی MP3</option>
                      <option value="course">دوره ویدیویی/آنلاین</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">نویسنده / استاد:</label>
                    <input
                      type="text"
                      value={editingProduct.author}
                      onChange={e => setEditingProduct({ ...editingProduct, author: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-slate-300 font-bold">آدرس تصویر محصول (Image URL):</label>
                    <input
                      type="text"
                      value={editingProduct.image}
                      onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value, images: [e.target.value] })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500 dir-ltr text-left"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-slate-300 font-bold">توضیحات و خلاصه اثر:</label>
                    <textarea
                      rows={4}
                      value={editingProduct.description}
                      onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center gap-6 md:col-span-2 pt-2 border-t border-slate-800">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.featured || false}
                        onChange={e => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>نمایش در محصولات ویژه</span>
                    </label>

                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.bestSeller || false}
                        onChange={e => setEditingProduct({ ...editingProduct, bestSeller: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>برچسب پرفروش‌ترین</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditedProduct}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <CheckCircle2 size={16} />
                    <span>ذخیره تغییرات</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: ADD NEW PRODUCT */}
        <AnimatePresence>
          {isAddingProduct && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto dir-rtl text-right">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl text-xs"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Plus className="text-indigo-400" size={18} />
                    <span>افزودن محصول / کتاب جدید به آکادمی</span>
                  </h3>
                  <button
                    onClick={() => setIsAddingProduct(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">عنوان فارسی محصول *:</label>
                      <input
                        type="text"
                        required
                        value={newProductForm.title}
                        onChange={e => setNewProductForm({ ...newProductForm, title: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        placeholder="مثلاً: جلد دوم کتاب رویابینی شفاف"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">عنوان انگلیسی:</label>
                      <input
                        type="text"
                        value={newProductForm.englishTitle}
                        onChange={e => setNewProductForm({ ...newProductForm, englishTitle: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 dir-ltr text-left font-mono"
                        placeholder="e.g., Lucid Dreaming Vol 2"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">قیمت اصلی (تومان) *:</label>
                      <input
                        type="number"
                        required
                        value={newProductForm.price || ''}
                        onChange={e => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                        placeholder="۳۵۰۰۰۰"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">قیمت با تخفیف (تومان):</label>
                      <input
                        type="number"
                        value={newProductForm.salePrice || ''}
                        onChange={e => setNewProductForm({ ...newProductForm, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                        placeholder="۲۹۰۰۰۰"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">موجودی انبار *:</label>
                      <input
                        type="number"
                        required
                        value={newProductForm.stock}
                        onChange={e => setNewProductForm({ ...newProductForm, stock: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">دسته‌بندی اصلی:</label>
                      <select
                        value={newProductForm.category}
                        onChange={e => setNewProductForm({ ...newProductForm, category: e.target.value as any })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="books">کتاب‌ها (چاپی و PDF)</option>
                        <option value="audiobooks">کتاب‌های صوتی</option>
                        <option value="courses">دوره‌های آموزشی</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">نوع / فرمت محصول:</label>
                      <select
                        value={newProductForm.type}
                        onChange={e => setNewProductForm({ ...newProductForm, type: e.target.value as any })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="printed">کتاب چاپی</option>
                        <option value="pdf">نسخه الکترونیکی PDF</option>
                        <option value="audio">فایل صوتی MP3</option>
                        <option value="course">دوره ویدیویی/آنلاین</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">نویسنده / مدرس:</label>
                      <input
                        type="text"
                        value={newProductForm.author}
                        onChange={e => setNewProductForm({ ...newProductForm, author: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-slate-300 font-bold">آدرس تصویر کاور محصول (Image URL):</label>
                      <input
                        type="text"
                        value={newProductForm.image}
                        onChange={e => setNewProductForm({ ...newProductForm, image: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500 dir-ltr text-left"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-slate-300 font-bold">توضیحات معرفی محصول:</label>
                      <textarea
                        rows={3}
                        value={newProductForm.description}
                        onChange={e => setNewProductForm({ ...newProductForm, description: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        placeholder="توضیحات کوتاه یا کامل در مورد این اثر..."
                      />
                    </div>

                    <div className="flex items-center gap-6 md:col-span-2 pt-2 border-t border-slate-800">
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProductForm.featured}
                          onChange={e => setNewProductForm({ ...newProductForm, featured: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>محصول ویژه (نمایش در هدر/صفحه اصلی)</span>
                      </label>

                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProductForm.bestSeller}
                          onChange={e => setNewProductForm({ ...newProductForm, bestSeller: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>پرفروش‌ترین</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Plus size={16} />
                      <span>ثبت و انتشار محصول</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
