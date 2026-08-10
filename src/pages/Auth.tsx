/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import SEO from '../components/SEO';
import { User, Mail, Lock, Phone, ArrowLeft, ShieldCheck, Sparkles, CheckCircle2, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Auth() {
  const { login, register, setCurrentPage } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign In Form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form state
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signInEmail.trim()) {
      setError('لطفاً آدرس ایمیل یا شماره همراه خود را وارد کنید.');
      return;
    }
    if (!signInPassword) {
      setError('لطفاً کلمه عبور را وارد کنید.');
      return;
    }

    setLoading(true);
    try {
      login(signInEmail.trim(), signInPassword);
    } catch (err) {
      setError('خطا در ورود به حساب کاربری. لطفاً اطلاعات را بررسی نمایید.');
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signUpFullName.trim()) {
      setError('لطفاً نام و نام خانوادگی را وارد نمایید.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setError('لطفاً یک آدرس ایمیل معتبر وارد کنید.');
      return;
    }
    if (!signUpPassword) {
      setError('لطفاً کلمه عبور را تعیین نمایید.');
      return;
    }
    if (signUpPassword.length < 6) {
      setError('کلمه عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setError('تکرار کلمه عبور با کلمه عبور اصلی مطابقت ندارد.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create user account
      // 2. Send welcome email via server route
      // 3. Sign user in automatically
      // 4. Redirect to dashboard
      await register({
        fullName: signUpFullName.trim(),
        email: signUpEmail.trim(),
        phone: signUpPhone.trim(),
        password: signUpPassword
      });
      setSuccessMsg('ثبت‌نام با موفقیت انجام شد! در حال انتقال به پنل کاربری...');
    } catch (err) {
      setError('خطایی در هنگام ثبت‌نام رخ داد. لطفاً مجدداً تلاش کنید.');
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="ورود و عضویت در آکادمی چهل دروازه" 
        description="صفحه ورود و ثبت‌نام سالکان و دانشجویان دوره رویابینی شفاف و ذهن‌آگاهی."
      />

      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl border border-indigo-100 p-6 md:p-8 shadow-xl text-right relative overflow-hidden"
        >
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -z-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -z-10" />

          {/* Top Logo / Icon */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600 shadow-xs">
              <User size={28} />
            </div>
            <h1 className="text-lg font-extrabold text-slate-900">ورود و عضویت در چهل دروازه</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              جهت دسترسی به پنل کاربری، فایل‌های خریداری شده و ویرایش اطلاعات
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 text-xs font-bold border border-slate-200">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-indigo-950 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn size={14} />
              <span>ورود به حساب</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-indigo-950 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus size={14} />
              <span>ثبت‌نام جدید</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-center">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">آدرس ایمیل یا شماره همراه:</label>
                <div className="relative">
                  <input
                    id="signin-email-input"
                    type="text"
                    required
                    placeholder="example@gmail.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-xs"
                  />
                  <Mail size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">کلمه عبور:</label>
                <div className="relative">
                  <input
                    id="signin-password-input"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-xs"
                  />
                  <Lock size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              <button
                id="signin-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full geom-button-primary py-3.5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>در حال ورود...</span>
                ) : (
                  <>
                    <span>ورود به حساب کاربری</span>
                    <ArrowLeft size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">نام و نام خانوادگی:</label>
                <div className="relative">
                  <input
                    id="signup-fullname-input"
                    type="text"
                    required
                    placeholder="فرشاد میرشکاری"
                    value={signUpFullName}
                    onChange={(e) => setSignUpFullName(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-xs"
                  />
                  <User size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">آدرس ایمیل:</label>
                <div className="relative">
                  <input
                    id="signup-email-input"
                    type="email"
                    required
                    placeholder="your-email@gmail.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-xs"
                  />
                  <Mail size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
                </div>
                <span className="text-[10px] text-indigo-600 block">
                  💡 ایمیل خوش‌آمدگویی و تایید حساب کاربری به این آدرس ارسال خواهد شد.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold block">شماره همراه (اختیاری):</label>
                <div className="relative">
                  <input
                    id="signup-phone-input"
                    type="tel"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-xs"
                  />
                  <Phone size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-semibold block">کلمه عبور:</label>
                  <div className="relative">
                    <input
                      id="signup-password-input"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="w-full pl-3 pr-9 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-xs"
                    />
                    <Lock size={15} className="absolute right-3 top-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-semibold block">تکرار کلمه عبور:</label>
                  <div className="relative">
                    <input
                      id="signup-confirmpassword-input"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      className="w-full pl-3 pr-9 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-xs"
                    />
                    <ShieldCheck size={15} className="absolute right-3 top-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              <button
                id="signup-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 py-3.5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} className="animate-spin" />
                    <span>در حال ساخت حساب و ارسال ایمیل خوش‌آمدگویی...</span>
                  </span>
                ) : (
                  <>
                    <span>ثبت‌نام و ایجاد حساب کاربری</span>
                    <ArrowLeft size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Back link */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-xs text-slate-500 hover:text-indigo-600 font-semibold transition-colors cursor-pointer bg-transparent"
            >
              بازگشت به صفحه اصلی سایت
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
