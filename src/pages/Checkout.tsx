/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import SEO from '../components/SEO';
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
  Sparkles
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
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('تهران');
  const [city, setCity] = useState('تهران');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
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
  const totalBeforeDiscount = cart.reduce((acc, item) => {
    const price = item.product.salePrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const discountAmount = Math.round(totalBeforeDiscount * (discountPercentage / 100));
  const finalAmount = totalBeforeDiscount - discountAmount;

  // Determine if shipping is free
  const isOnlyDigital = cart.every(
    item => item.product.type === 'pdf' || item.product.type === 'audio' || item.product.type === 'course'
  );

  const shippingFee = (totalBeforeDiscount >= 500000 || isOnlyDigital || cart.length === 0) ? 0 : 30000;
  const grandTotal = finalAmount + shippingFee;

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR') + ' تومان';
  };

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnlyDigital && (!fullName || !phone || !address || !postalCode)) {
      showNotification('لطفاً اطلاعات ارسال و تحویل پستی را به طور کامل پر کنید.');
      return;
    }
    // Open Shape-rak Gateway
    setIsSimulatingPayment(true);
  };

  // Simulates OTP Request
  const handleRequestOtp = () => {
    setIsOtpSent(true);
    showNotification('رمز دوم یکبار مصرف (OTP) به شماره همراه شما شبیه‌سازی و ارسال شد. رمز نمونه: ۱۲۳۴۵');
  };

  // Simulates Complete Payment transaction
  const handleCompleteTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cvv2 || !pin2) {
      showNotification('لطفاً اطلاعات کارت شتاب خود را پر کنید.');
      return;
    }

    // Process Order
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
      fullName,
      phone,
      province,
      city,
      postalCode,
      address
    });

    const newOrder = placeOrder(paymentGateway, shippingAddress);
    setGeneratedOrder(newOrder);
    setPaymentSuccess(true);
    clearCart();
  };

  // Return to client dashboard
  const handleGoToDashboard = () => {
    if (generatedOrder) {
      setTrackOrderId(generatedOrder.id);
      setCurrentPage('dashboard');
    }
  };

  // IF USER IS IN THE BANK SIMULATOR (Shaparak Simulation)
  if (isSimulatingPayment) {
    if (paymentSuccess) {
      return (
        <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">تراکنش بانکی با موفقیت تایید شد</h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              سپاسگزاریم! سفارش شما ثبت گردید. شماره سفارش: <strong className="text-indigo-900 font-mono">{generatedOrder?.id}</strong>
            </p>
          </div>

          <div className="bg-white border border-indigo-100 rounded-3xl p-6 text-right text-xs space-y-4 shadow-xs">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">مجموع تراکنش:</span>
              <strong className="text-indigo-700 font-bold">{formatPrice(grandTotal)}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">درگاه پرداخت:</span>
              <strong className="text-slate-900">{paymentGateway === 'zarinpal' ? 'زرین‌پال' : 'آی‌دی‌پای'}</strong>
            </div>
            {isOnlyDigital ? (
              <p className="text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl leading-relaxed font-bold">
                🎉 محصولات دیجیتالی بلافاصله فعال شدند! همین حالا می‌توانید جزوه‌های PDF و پادکست‌های صوتی خود را از داشبورد دریافت و گوش کنید.
              </p>
            ) : (
              <div className="space-y-1.5 text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p>📦 فرآیند بسته‌بندی اقلام فیزیکی شروع شد.</p>
                <p>کد پیگیری پست شما: <strong className="text-slate-900 font-mono">{generatedOrder?.trackingCode}</strong></p>
              </div>
            )}
          </div>

          <button
            id="checkout-success-dashboard-cta"
            onClick={handleGoToDashboard}
            className="geom-button-primary text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-all w-full shadow-md"
          >
            ورود به پنل کاربری و دریافت فایل‌ها
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Floating notification for simulator */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-indigo-500 p-4 rounded-2xl shadow-xl text-xs text-indigo-950 flex items-center gap-3 max-w-md w-11/12 justify-center font-bold text-center"
            >
              <Sparkles size={16} className="text-indigo-600 shrink-0 animate-spin" />
              <span>{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-3xl border border-rose-200 shadow-md p-6 md:p-8 space-y-6 text-right">
          
          {/* Shaparak branding */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">درگاه شبکه شاپرک (شبیه‌ساز زرین‌پال)</span>
            </div>
            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-mono font-bold">تست تراکنش</span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs">
            <span className="text-slate-500">مبلغ تراکنش:</span>
            <strong className="text-indigo-900 font-bold font-sans text-sm">{formatPrice(grandTotal)}</strong>
          </div>

          <form onSubmit={handleCompleteTransaction} className="space-y-4 text-xs">
            {/* Card number */}
            <div className="space-y-1.5">
              <label className="text-slate-600 block font-semibold">شماره کارت ۱۶ رقمی شتاب:</label>
              <input
                id="bank-card-number"
                type="text"
                required
                maxLength={19}
                placeholder="6037-9911-2233-4455"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9-]/g, ''))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-center text-sm tracking-widest focus:outline-none focus:border-indigo-500 shadow-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* CVV2 */}
              <div className="space-y-1.5">
                <label className="text-slate-600 block font-semibold">کد امنیتی CVV2:</label>
                <input
                  id="bank-cvv2"
                  type="password"
                  required
                  maxLength={4}
                  placeholder="•••"
                  value={cvv2}
                  onChange={(e) => setCvv2(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-center text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              {/* Exp date */}
              <div className="space-y-1.5">
                <label className="text-slate-600 block font-semibold">تاریخ انقضا (ماه / سال):</label>
                <div className="flex gap-2">
                  <select 
                    id="bank-exp-month"
                    value={expMonth} 
                    onChange={(e) => setExpMonth(e.target.value)} 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-slate-900 focus:outline-none font-mono text-center text-xs shadow-xs"
                  >
                    {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select 
                    id="bank-exp-year"
                    value={expYear} 
                    onChange={(e) => setExpYear(e.target.value)} 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-slate-900 focus:outline-none font-mono text-center text-xs shadow-xs"
                  >
                    {['05','06','07','08','09','10','11','12','13'].map(y => (
                      <option key={y} value={y}>۱۴{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* OTP Second pin */}
            <div className="space-y-1.5">
              <label className="text-slate-600 block font-semibold">رمز دوم پویا یا ثابت:</label>
              <div className="flex gap-2">
                <input
                  id="bank-pin2"
                  type="password"
                  required
                  maxLength={8}
                  placeholder="••••"
                  value={pin2}
                  onChange={(e) => setPin2(e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-center text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                />
                <button
                  id="request-otp-btn"
                  type="button"
                  onClick={handleRequestOtp}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[11px] font-bold px-3 rounded-xl border border-indigo-200 transition-colors shadow-xs"
                >
                  درخواست رمز پویا
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                id="bank-cancel-btn"
                type="button"
                onClick={() => setIsSimulatingPayment(false)}
                className="flex-1 border border-slate-200 text-slate-700 font-semibold rounded-xl py-3.5 text-center hover:bg-slate-50 transition-colors bg-white shadow-xs"
              >
                انصراف و بازگشت
              </button>
              <button
                id="bank-submit-btn"
                type="submit"
                className="flex-1 bg-emerald-600 text-white font-bold rounded-xl py-3.5 text-center hover:bg-emerald-700 transition-colors shadow-md"
              >
                پرداخت نهایی فاکتور
              </button>
            </div>

          </form>
        </div>
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
                <h4 className="text-xs font-bold text-slate-900">نیازی به آدرس پستی نیست!</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  سبد خرید شما فاقد کالاهای فیزیکی است. پس از کلیک بر روی اقدام به پرداخت، کتب صوتی و نسخه‌های PDF مستقیماً در پنل کاربری شما برای دانلود نامحدود فعال خواهند شد.
                </p>
              </div>
            ) : (
              <form onSubmit={handleStartPayment} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <label className="text-slate-600 block font-semibold">تلفن همراه فعال (برای پیامک پست):</label>
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

            {/* Gateway Selection */}
            <div className="pt-6 border-t border-slate-100 space-y-3 text-right">
              <span className="block text-xs font-bold text-slate-900 flex items-center gap-2">
                <CreditCard size={16} className="text-indigo-600" />
                <span>درگاه پرداخت الکترونیکی شتاب</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* ZarinPal Option */}
                <div 
                  onClick={() => setPaymentGateway('zarinpal')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentGateway === 'zarinpal'
                      ? 'border-indigo-600 bg-indigo-50/60 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200'
                  }`}
                >
                  <div className="space-y-1 text-right">
                    <span className="block text-xs font-bold text-slate-900">درگاه زرین‌پال (ZarinPal)</span>
                    <span className="block text-[10px] text-slate-500">پرداخت آسان با رمز دوم پویا</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border border-indigo-600 flex items-center justify-center">
                    {paymentGateway === 'zarinpal' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                  </div>
                </div>

                {/* IDPay Option */}
                <div 
                  onClick={() => setPaymentGateway('idpay')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentGateway === 'idpay'
                      ? 'border-indigo-600 bg-indigo-50/60 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200'
                  }`}
                >
                  <div className="space-y-1 text-right">
                    <span className="block text-xs font-bold text-slate-900">درگاه آی‌دی‌پای (IDPay)</span>
                    <span className="block text-[10px] text-slate-500">کیف پول شتاب و تسهیل پرداخت</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border border-indigo-600 flex items-center justify-center">
                    {paymentGateway === 'idpay' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                  </div>
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
                <span>جمع اقلام سبد:</span>
                <span className="font-mono text-slate-900 font-bold">{formatPrice(totalBeforeDiscount)}</span>
              </div>
              {couponCode && (
                <div className="flex justify-between text-indigo-700 font-bold">
                  <span>تخفیف کد ({couponCode}):</span>
                  <span className="font-mono">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>هزینه بسته‌بندی و پست:</span>
                <span className="font-mono text-slate-900 font-bold">{shippingFee === 0 ? 'رایگان' : formatPrice(shippingFee)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-slate-900">
              <span>مبلغ نهایی قابل پرداخت:</span>
              <span className="text-indigo-700 font-sans text-base">{formatPrice(grandTotal)}</span>
            </div>

            {/* Action Payment Trigger */}
            <button
              id="checkout-payment-btn"
              onClick={handleStartPayment}
              className="w-full geom-button-primary text-white font-bold text-xs py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-md"
            >
              <ShieldCheck size={16} />
              <span>پرداخت نهایی و انتقال به بانک</span>
            </button>

            <div className="flex gap-2 justify-center pt-2 text-[10px] text-slate-500">
              <ShieldCheck size={14} className="text-indigo-600" />
              <span>پرداخت‌ها تحت نظارت شاپرک مرکزی</span>
            </div>
          </div>
        </div>

      </section>
    </>
  );
}
