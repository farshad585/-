/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import SEO from '../components/SEO';
import { sendOrderCreatedEmail } from '../utils/emailApi';
import { 
  CreditCard, 
  MapPin, 
  ChevronRight, 
  ShieldCheck, 
  ArrowLeft,
  Truck,
  Download,
  CheckCircle2,
  Lock,
  Sparkles,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Checkout() {
  const { 
    cart, 
    couponCode, 
    discountPercentage, 
    placeOrder, 
    clearCart, 
    setCurrentPage,
    setTrackOrderId,
    updateUserProfile
  } = useApp();

  // Custom premium notification
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Shipping Form States
  const { userProfile } = useApp();
  const [fullName, setFullName] = useState(userProfile.fullName || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [province, setProvince] = useState(userProfile.province || 'تهران');
  const [city, setCity] = useState(userProfile.city || 'تهران');
  const [postalCode, setPostalCode] = useState(userProfile.postalCode || '');
  const [address, setAddress] = useState(userProfile.address || '');
  const [paymentGateway, setPaymentGateway] = useState<'zarinpal' | 'idpay'>('zarinpal');

  // Gateway screen simulation
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cvv2, setCvv2] = useState('');
  const [expMonth, setExpMonth] = useState('01');
  const [expYear, setExpYear] = useState('05');
  const [pin2, setPin2] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [generatedOrder, setGeneratedOrder] = useState<any>(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Totals calculations
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

  const handleCreateCardOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const targetEmail = (email || userProfile.email || '').trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      showNotification('لطفاً آدرس ایمیل معتبر جهت دریافت فاکتور و اطلاع‌رسانی را وارد کنید.');
      return;
    }

    if (!isOnlyDigital && (!fullName || !phone || !address || !postalCode)) {
      showNotification('لطفاً اطلاعات ارسال و تحویل پستی را به طور کامل پر کنید.');
      return;
    }

    const shippingAddress = isOnlyDigital ? undefined : {
      fullName,
      phone,
      province,
      city,
      postalCode,
      address
    };

    // Save profile
    updateUserProfile({
      fullName: fullName || userProfile.fullName,
      email: targetEmail,
      phone,
      province,
      city,
      postalCode,
      address
    });

    const newOrder = placeOrder('card-to-card', shippingAddress);
    setGeneratedOrder(newOrder);
    setPaymentSuccess(true);
    clearCart();

    // Dispatch Order Emails to Customer and Admin
    sendOrderCreatedEmail({
      order: newOrder,
      customerEmail: targetEmail,
      customerName: fullName || userProfile.fullName
    }).then(res => {
      if (res.success) {
        showNotification('📧 ایمیل تایید سفارش برای شما و مدیریت سایت ارسال گردید.');
      }
    });
  };

  const [copiedCard, setCopiedCard] = useState(false);
  const handleCopyCard = () => {
    navigator.clipboard.writeText('6362141809746812');
    setCopiedCard(true);
    showNotification('شماره کارت بانک ملی با موفقیت کپی شد.');
    setTimeout(() => setCopiedCard(false), 3000);
  };

  // Return to client dashboard
  const handleGoToDashboard = () => {
    if (generatedOrder) {
      setTrackOrderId(generatedOrder.id);
      setCurrentPage('dashboard');
    }
  };

  // ORDER CONFIRMATION / CARD TO CARD PAYMENT INSTRUCTIONS SCREEN
  if (paymentSuccess || generatedOrder) {
    const orderTotal = generatedOrder?.totalAmount || grandTotal;
    const orderSubtotal = generatedOrder?.subtotal || totalBeforeDiscount;
    const orderVat = generatedOrder?.vatAmount || vatAmount;
    const orderShipping = generatedOrder?.shippingFee !== undefined ? generatedOrder.shippingFee : shippingFee;
    const orderDiscount = generatedOrder?.discountAmount || discountAmount;

    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
          <CheckCircle2 size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">سفارش شما با موفقیت ثبت گردید</h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            شماره پیگیری سفارش شما: <strong className="text-indigo-900 font-mono text-sm">{generatedOrder?.id}</strong>
          </p>
        </div>

        {/* Card to card required notice box */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border-2 border-indigo-200 rounded-3xl p-6 text-right space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 border-b border-indigo-100 pb-3">
            <CreditCard size={20} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">روش پرداخت: کارت به کارت</h3>
          </div>

          <p className="text-xs text-slate-800 font-semibold leading-relaxed">
            شما می‌توانید مبلغ سفارش را از طریق کارت‌به‌کارت به حساب چهل دروازه منتقل نمایید.
          </p>

          <div className="bg-white/90 backdrop-blur-sm border border-indigo-200 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">شماره کارت بانک ملی:</span>
              <strong className="text-indigo-950 font-mono text-sm sm:text-base tracking-widest dir-ltr">6362141809746812</strong>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-2">
              <span className="text-slate-500">به نام:</span>
              <strong className="text-slate-900 font-bold">فرشاد میرشکاری سرکره</strong>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-2">
              <span className="text-slate-500">مبلغ واریزی:</span>
              <strong className="text-indigo-700 font-sans font-bold text-sm">{formatPrice(orderTotal)}</strong>
            </div>
          </div>

          <button
            onClick={handleCopyCard}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <CreditCard size={14} />
            <span>{copiedCard ? '✓ شماره کارت کپی شد' : 'کپی شماره کارت (۶۳۶۲۱۴۱۸۰۹۷۴۶۸۱۲)'}</span>
          </button>

          <p className="text-[11px] text-slate-600 bg-white/60 p-3 rounded-xl border border-indigo-100 leading-relaxed text-center">
            💡 لطفاً پس از واریز، تصویر فیش واریزی یا ۴ رقم آخر کارت را به همراه شماره سفارش برای پشتیبانی ارسال فرمایید.
          </p>
        </div>

        {/* Breakdown invoice summary */}
        <div className="bg-white border border-indigo-100 rounded-3xl p-6 text-right text-xs space-y-3 shadow-xs">
          <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">خلاصه حساب فاکتور:</h4>
          <div className="flex justify-between text-slate-600">
            <span>جمع کل خرید شما:</span>
            <span className="font-mono text-slate-900 font-bold">{formatPrice(orderSubtotal + orderDiscount)}</span>
          </div>
          <div className="flex justify-between text-emerald-700 font-bold">
            <span>سود شما از این خرید:</span>
            <span className="font-mono">{orderDiscount > 0 ? `-${formatPrice(orderDiscount)}` : '۰ تومان'}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>مالیات بر ارزش افزوده:</span>
            <span className="font-mono text-slate-900 font-bold">{formatPrice(orderVat)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>هزینه بسته‌بندی و ارسال پستی:</span>
            <span className="font-mono text-slate-900 font-bold">
              {orderShipping === 0 ? 'رایگان' : formatPrice(orderShipping)}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-bold text-slate-900">
            <span>مبلغ قابل پرداخت:</span>
            <span className="text-indigo-700 font-extrabold">{formatPrice(orderTotal)}</span>
          </div>
        </div>

        <button
          id="checkout-success-dashboard-cta"
          onClick={handleGoToDashboard}
          className="geom-button-primary text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-all w-full shadow-md"
        >
          ورود به پنل کاربری و مشاهده وضعیت سفارش
        </button>
      </div>
    );
  }

  // IF USER IS IN THE NORMAL CHECKOUT PAGE
  return (
    <>
      <SEO 
        title="تکمیل اطلاعات و پرداخت سفارش" 
        description="صفحه نهایی پرداخت فاکتور خرید محصولات آکادمی ۴۰ دروازه شامل فیلدهای ارسال پستی و فرم‌های اتصال به درگاه زرین‌پال."
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

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-indigo-100 py-16 text-center max-w-7xl mx-auto rounded-b-3xl mb-12 shadow-xs">
        <div className="max-w-xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span className="cursor-pointer hover:text-slate-900" onClick={() => setCurrentPage('cart')}>سبد خرید</span>
            <span>/</span>
            <span className="text-indigo-600 font-bold">اطلاعات نهایی و پرداخت</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">تکمیل مشخصات تحویل</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            لطفاً آدرس تحویل سفارش‌های فیزیکی را به صورت دقیق پر نمایید تا بسته‌های شما با پست پیشتاز ارسال گردند.
          </p>
        </div>
      </section>

      {/* Main Grid: Shipping Address Form vs Pricing Summary */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
        
        {/* Form panel (Span 8) */}
        <div className="lg:col-span-8">
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-indigo-100 shadow-xs space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin size={16} className="text-indigo-600" />
                <span>اطلاعات پستی و آدرس تحویل گیرنده</span>
              </h3>
              {isOnlyDigital && (
                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold">
                  محصولات تماماً دیجیتالی هستند!
                </span>
              )}
            </div>

            {isOnlyDigital ? (
              <div className="p-6 rounded-2xl border border-indigo-100 bg-slate-50 space-y-3 text-right">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center">
                  <Download size={18} />
                </div>
                <h4 className="text-xs font-bold text-slate-900">نیازی به آدرس پستی نیست! (ارسال دیجیتال و آنلاین)</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  سبد خرید شما فاقد کالاهای فیزیکی است. پس از کلیک بر روی ثبت سفارش، فایل‌ها مستقیماً در پنل کاربری شما برای دانلود فعال و فاکتور به ایمیل شما ارسال خواهد شد.
                </p>
                <div className="space-y-1.5 pt-2">
                  <label className="text-slate-700 block font-semibold text-xs flex items-center gap-1.5">
                    <Mail size={14} className="text-indigo-600" />
                    <span>آدرس ایمیل جهت دریافت فاکتور و اطلاع‌رسانی:</span>
                  </label>
                  <input
                    id="checkout-digital-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-left focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateCardOrder} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600 block font-semibold">نام و نام خانوادگی گیرنده:</label>
                    <input
                      id="checkout-fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="مانند: علیرضا حسینی"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-600 block font-semibold flex items-center gap-1">
                      <Mail size={13} className="text-indigo-600" />
                      <span>ایمیل جهت دریافت فاکتور:</span>
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-left focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-600 block font-semibold">تلفن همراه (پیامک پست):</label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="مانند: 09123456789"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-left focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600 block font-semibold">استان:</label>
                    <select
                      id="checkout-province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
                    >
                      <option value="تهران">تهران</option>
                      <option value="اصفهان">اصفهان</option>
                      <option value="فارس">فارس</option>
                      <option value="خراسان رضوی">خراسان رضوی</option>
                      <option value="آذربایجان شرقی">آذربایجان شرقی</option>
                      <option value="البرز">البرز</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-600 block font-semibold">شهر:</label>
                    <input
                      id="checkout-city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="مانند: ونک"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-600 block font-semibold">کد پستی ۱۰ رقمی:</label>
                    <input
                      id="checkout-postalCode"
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="1234567890"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-left focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 block font-semibold">نشانی کامل پستی:</label>
                  <textarea
                    id="checkout-address"
                    required
                    rows={4}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="خیابان ولیعصر، نرسیده به میدان ونک، کوچه آفتاب، پلاک ۱۲، واحد ۳"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-xs"
                  />
                </div>

              </form>
            )}

            {/* Payment Method Section */}
            <div className="pt-6 border-t border-slate-100 space-y-3 text-right">
              <span className="block text-xs font-bold text-slate-900 flex items-center gap-2">
                <CreditCard size={16} className="text-indigo-600" />
                <span>روش پرداخت سفارش</span>
              </span>
              <div className="p-4 rounded-2xl border border-indigo-600 bg-indigo-50/60 flex items-center justify-between shadow-xs">
                <div className="space-y-1 text-right">
                  <span className="block text-xs font-bold text-slate-900">کارت به کارت (بانک ملی)</span>
                  <span className="block text-[10px] text-slate-600">انتقال مستقیم به حساب چهل دروازه (فرشاد میرشکاری سرکره)</span>
                </div>
                <div className="w-5 h-5 rounded-full border border-indigo-600 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Checkout Invoice summary (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-indigo-100 shadow-xs space-y-6 sticky top-24">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">فاکتور نهایی شما</h3>

            {/* Short items list inside invoice */}
            <div className="max-h-[160px] overflow-y-auto pr-1 space-y-2.5 border-b border-slate-100 pb-4">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-[11px] text-slate-600">
                  <span className="truncate max-w-[200px]">{item.product.title}</span>
                  <span className="font-mono text-slate-900 flex-shrink-0 font-bold">
                    ({item.quantity} عدد)
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-xs border-b border-slate-100 pb-4">
              <div className="flex justify-between text-slate-600">
                <span>جمع کل خرید شما:</span>
                <span className="font-mono text-slate-900 font-bold">{formatPrice(totalOriginalPrice)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>سود شما از این خرید:</span>
                <span className="font-mono">{userSavings > 0 ? `-${formatPrice(userSavings)}` : '۰ تومان'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>مالیات بر ارزش افزوده:</span>
                <span className="font-mono text-slate-900 font-bold">{formatPrice(vatAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>هزینه بسته‌بندی و ارسال پستی:</span>
                <span className="font-mono text-slate-900 font-bold">{shippingFee === 0 ? 'رایگان' : formatPrice(shippingFee)}</span>
              </div>
              {shippingFee > 0 && (
                <p className="text-[10px] text-slate-600 leading-relaxed text-right bg-indigo-50/70 border border-indigo-100 p-2.5 rounded-xl font-medium">
                  💡 با افزودن مابه‌التفاوت خرید به سقف ۲ میلیون تومان، هزینه ارسال را کاملاً رایگان کنید.
                </p>
              )}
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-slate-900">
              <span>مبلغ قابل پرداخت:</span>
              <span className="text-indigo-700 font-sans text-base font-extrabold">{formatPrice(grandTotal)}</span>
            </div>

            {/* Action Payment Trigger */}
            <button
              id="checkout-payment-btn"
              onClick={handleCreateCardOrder}
              className="w-full geom-button-primary text-white font-bold text-xs py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-md"
            >
              <CreditCard size={16} />
              <span>ثبت سفارش و دریافت شماره کارت</span>
            </button>

            <div className="flex gap-2 justify-center pt-2 text-[10px] text-slate-500">
              <ShieldCheck size={14} className="text-indigo-600" />
              <span>پرداخت مستقیم کارت به کارت به حساب بانک ملی</span>
            </div>
          </div>
        </div>

      </section>
    </>
  );
}
