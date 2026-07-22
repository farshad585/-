/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import SEO from '../components/SEO';

export default function Legal() {
  return (
    <>
      <SEO 
        title="قوانین و حریم خصوصی سالک" 
        description="شرایط استفاده از بسته‌ها و کتاب‌های صوتی و چاپی آکادمی ۴۰ دروازه، ضوابط خرید آنلاین، مرجوعی کتب فیزیکی و اصول صیانت از اطلاعات هنرجویان."
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-indigo-100 py-16 text-center max-w-7xl mx-auto rounded-b-3xl mb-12 shadow-xs">
        <div className="max-w-xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>صفحه اصلی</span>
            <span>/</span>
            <span className="text-indigo-600 font-bold">قوانین و ضوابط</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">حقوق معنوی و حریم خصوصی</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            لطفاً پیش از تهیه دوره‌ها و یا کتب نفیس، آیین‌نامه انضباطی و حقوقی آکادمی ۴۰ دروازه را مطالعه فرمایید.
          </p>
        </div>
      </section>

      {/* Legal Text Layout */}
      <section className="max-w-4xl mx-auto px-4 pb-20 space-y-12 text-right">
        
        {/* Section 1 */}
        <div className="space-y-4 bg-white p-6 md:p-8 rounded-3xl border border-indigo-100 shadow-xs">
          <h2 className="text-base font-extrabold text-slate-900 border-r-4 border-indigo-600 pr-3">
            ۱. قوانین مالکیت فکری و حق تالیف آثار
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed text-justify">
            کلیه کتب چاپی، کتاب‌های الکترونیکی PDF، دوره‌های آموزشی ویدیویی و فایل‌های صوتی فرکانسی ارائه شده در وب‌سایت ۴۰ دروازه (40gates.ir) تحت حمایت مستقیم قانون حمایت از حقوق مؤلفان و مصنفان جمهوری اسلامی ایران است. تکثیر، توزیع، فروش مجدد یا اشتراک‌گذاری عمومی این فایل‌ها در سایر وب‌سایت‌ها، کانال‌های تلگرامی و گروه‌ها بدون اجازه کتبی مربی ارشد و مدیریت آکادمی، شرعاً و قانوناً ممنوع بوده و متخلفان تحت پیگرد حقوقی قرار خواهند گرفت.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-4 bg-white p-6 md:p-8 rounded-3xl border border-indigo-100 shadow-xs">
          <h2 className="text-base font-extrabold text-slate-900 border-r-4 border-indigo-600 pr-3">
            ۲. ضوابط بازگشت وجه و انصراف از خرید
          </h2>
          <ul className="text-xs text-slate-600 leading-relaxed space-y-3 list-disc pr-5">
            <li>
              <strong>محصولات دیجیتالی (فایل‌های PDF و کتاب‌های صوتی):</strong> به علت قابلیت دسترسی آنی و کپی راحت محصولات دیجیتالی پس از تراکنش بانکی، امکان انصراف از خرید یا بازگشت وجه به هیچ عنوان مقدور نمی‌باشد. لطفاً قبل از نهایی کردن سفارش نمونه فایل یا فهرست محصول را به دقت بررسی فرمایید.
            </li>
            <li>
              <strong>محصولات فیزیکی (کتاب چاپی و کارت‌ها):</strong> در صورتی که کتاب فیزیکی خریداری شده دارای نقایصی مانند کثیفی صفحات، برگ‌خوردگی، شکستگی جلد یا ایراد چاپ باشد، خریدار گرامی تا ۷ روز فرصت دارد موضوع را به پشتیبانی گزارش دهد تا نسخه جایگزین به صورت رایگان مجدداً ارسال گردد.
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-4 bg-white p-6 md:p-8 rounded-3xl border border-indigo-100 shadow-xs">
          <h2 className="text-base font-extrabold text-slate-900 border-r-4 border-indigo-600 pr-3">
            ۳. سیاست صیانت از اطلاعات و حریم خصوصی هنرجویان
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed text-justify">
            ما متعهد می‌شویم که اطلاعات خصوصی و هویتی شما (از جمله نام، شماره تلفن همراه، آدرس دقیق پستی، کد ملی و ایمیل کاربری) را کاملاً محرمانه تلقی کرده و تحت هیچ شرایطی در اختیار شرکت‌های تبلیغاتی یا اشخاص ثالث قرار ندهیم. این داده‌ها صرفاً جهت احراز هویت سفارش، ارسال پیامک‌های رهگیری پست پیشتاز و آگاهی‌رسانی درباره سرفصل‌های جدید استفاده خواهد شد.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-4 bg-white p-6 md:p-8 rounded-3xl border border-indigo-100 shadow-xs">
          <h2 className="text-base font-extrabold text-slate-900 border-r-4 border-indigo-600 pr-3">
            ۴. ضوابط ارسال و تحویل بسته‌های پستی
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed text-justify">
            بسته‌های فیزیکی به طور روزانه بسته‌بندی شده و تحویل باجه‌های مرکزی شرکت پست ملی ایران می‌گردند. زمان تحویل مرسولات به استان تهران ۱ الی ۳ روز کاری و برای سایر استان‌های ایران بین ۳ الی ۵ روز کاری متغیر خواهد بود. تاخیر احتمالی ناشی از توزیع اداره پست از عهده آکادمی ۴۰ دروازه خارج است اما تیم پشتیبانی همواره آماده پیگیری کد رهگیری مرسوله شماست.
          </p>
        </div>

      </section>
    </>
  );
}
