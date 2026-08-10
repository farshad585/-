import { Product, Review } from '../types';
import { ALL_REVIEWS } from './reviewsData';

// Printed 40 Gates 1..10
import book40GatesImg1 from '../assets/images/کتاب چاپی چهل دروازه به ماورا1.jpg';
import book40GatesImg2 from '../assets/images/کتاب چاپی چهل دروازه به ماورا2.jpg';
import book40GatesImg3 from '../assets/images/کتاب چاپی چهل دروازه به ماورا3.jpg';
import book40GatesImg4 from '../assets/images/کتاب چاپی چهل دروازه به ماورا4.jpg';
import book40GatesImg5 from '../assets/images/کتاب چاپی چهل دروازه به ماورا5.jpg';
import book40GatesImg6 from '../assets/images/کتاب چاپی چهل دروازه به ماورا6.jpg';
import book40GatesImg7 from '../assets/images/کتاب چاپی چهل دروازه به ماورا7.jpg';
import book40GatesImg8 from '../assets/images/کتاب چاپی چهل دروازه به ماورا8.jpg';
import book40GatesImg9 from '../assets/images/کتاب چاپی چهل دروازه به ماورا9.jpg';
import book40GatesImg10 from '../assets/images/کتاب چاپی چهل دروازه به ماورا10.jpg';

// PDF 01..04
import pdf01 from '../assets/images/01.jpg';
import pdf02 from '../assets/images/02.jpg';
import pdf03 from '../assets/images/03.jpg';
import pdf04 from '../assets/images/04.jpg';

// Daneshkhand
import daneshkhand1 from '../assets/images/دانشخند1.jpg';
import daneshkhand2 from '../assets/images/دانشخند2.jpg';

// Farasou
import farasou1 from '../assets/images/فراسو1.jpg';
import farasou2 from '../assets/images/فراسو2.jpeg';
import farasou3 from '../assets/images/فراسو3.jpg';
import farasou4 from '../assets/images/فراسو4.jpg';

// Aferidegar
import aferidegar1 from '../assets/images/آفریدگار1.jpg';
import aferidegar2 from '../assets/images/آفریدگار2.jpg';

// Asrar
import asrar1 from '../assets/images/اسرار1.jpg';
import asrar2 from '../assets/images/اسرار2.jpg';

// Roman
import roman1 from '../assets/images/رمان1.jpg';
import roman2 from '../assets/images/رمان2.jpg';
import roman3 from '../assets/images/رمان3.png';
import roman4 from '../assets/images/رمان4.jpg';
import roman5 from '../assets/images/رمان5.png';

// Behesht
import behesht1 from '../assets/images/بهشت1.jpg';
import behesht2 from '../assets/images/بهشت2.jpg';

// Cheshm
import cheshm1 from '../assets/images/چشم1.jpeg';
import cheshm2 from '../assets/images/چشم2.jpeg';

// Generated Mystical Images
import audioCourse3Img from '../assets/images/audio_forty_gates_3_1785042999228.jpg';
import audioCourse2Img from '../assets/images/audio_forty_gates_2_1785043012034.jpg';
import audioCourse1Img from '../assets/images/audio_forty_gates_1_1785043024507.jpg';
import audioBeyondRealityImg from '../assets/images/audio_beyond_reality_1785043034665.jpg';
import astral8MinCourseImg from '../assets/images/astral_8min_course_1785043045652.jpg';
import audioPersonalParadiseImg from '../assets/images/audio_personal_paradise_1785043058019.jpg';
import masterGoldenCourseImg from '../assets/images/master_golden_v2_1785053595759.jpg';
import vipInnerMasterImg from '../assets/images/vip_inner_master_1786340058566.jpg';

export const book40GatesRealImages = [
  book40GatesImg1,
  book40GatesImg2,
  book40GatesImg3,
  book40GatesImg4,
  book40GatesImg5,
  book40GatesImg6,
  book40GatesImg7,
  book40GatesImg8,
  book40GatesImg9,
  book40GatesImg10,
];

export const PRODUCTS: Product[] = [
  // 1. دوره صوتی چهل دروازه به ماورا 3
  {
    id: '45377',
    title: 'دوره صوتی چهل دروازه به ماورا 3',
    englishTitle: '40 Gates to Beyond - Audio Course 3',
    description: 'کتاب سوم: راهنمای اکتشاف گنج درون. ده‌ها ساعت آموزش کامل صوتی، ۸ تکنیک دروازه‌های رویایی برای ورود آگاهانه به خواب دلخواه، هنر یادآوری شفاف رؤیاها و ملاقات با استاد درون.',
    shortDescription: 'دوره پیشرفته صوتی کتاب سوم چهل دروازه به ماورا همراه ۱۰٪ تخفیف ویژه.',
    price: 9900000,
    salePrice: 8910000,
    type: 'course',
    category: 'courses',
    images: [audioCourse3Img],
    stock: 999,
    rating: 5.0,
    reviewsCount: 29,
    featured: true,
    tags: ['دوره صوتی', 'چهل دروازه به ماورا', 'کتاب سوم', 'گنج درون', 'فرشاد میرشکاری'],
    duration: '۵۰ ساعت آموزش تخصصی (۱۰ فصل)',
    format: 'فایل صوتی MP3 + پشتیبانی',
    author: 'فرشاد میرشکاری'
  },

  // 2. دوره صوتی چهل دروازه به ماورا 2
  {
    id: '45374',
    title: 'دوره صوتی چهل دروازه به ماورا 2',
    englishTitle: '40 Gates to Beyond - Audio Course 2',
    description: 'کتاب دوم: راهنمای لمس بهشت درون. ۴۰ ساعت آموزش کامل صوتی هماهنگ شده با موسیقی آرامش‌بخش، ۴ تکنیک برای تجربه رویای آگاهانه، تقویت هویت و عزت‌نفس، آموزش کامل تثبیت فضای رویا و فرمول تجزیه‌وتحلیل حرفه‌ای رویاها.',
    shortDescription: 'دوره تخصصی صوتی کتاب دوم چهل دروازه به ماورا به همراه فایل‌های تمرینی.',
    price: 5000000,
    salePrice: 4500000,
    type: 'course',
    category: 'courses',
    images: [audioCourse2Img],
    stock: 999,
    rating: 4.9,
    reviewsCount: 41,
    featured: true,
    tags: ['دوره صوتی', 'چهل دروازه به ماورا', 'کتاب دوم', 'بهشت درون', 'فرشاد میرشکاری'],
    duration: '۴۰ ساعت آموزش تخصصی (۱۰ فصل)',
    format: 'فایل صوتی MP3 + دانلودهای هدیه',
    author: 'فرشاد میرشکاری'
  },

  // 3. دوره صوتی چهل دروازه به ماورا 1
  {
    id: '45359',
    title: 'دوره صوتی چهل دروازه به ماورا 1',
    englishTitle: '40 Gates to Beyond - Audio Course 1',
    description: 'کتاب اول: راهنمای سفر به دنیای درون. ۴۰ ساعت آموزش کامل هماهنگ شده با موسیقی آرامش‌بخش، جهت تاثیر مستقیم بر ذهن ناخودآگاه، درمان قطعی بی‌خوابی، تنظیم خواب عمیق، افزایش شفافیت رویاها و پشتیبانی رایگان در طول دوره.',
    shortDescription: '۴۰ ساعت آموزش جامع صوتی برون‌فکنی و رویابینی آگاهانه همراه پشتیبانی.',
    price: 3200000,
    salePrice: 2880000,
    type: 'course',
    category: 'courses',
    images: [audioCourse1Img],
    stock: 999,
    rating: 5.0,
    reviewsCount: 62,
    featured: true,
    bestSeller: true,
    tags: ['دوره صوتی', 'چهل دروازه به ماورا', 'دوره حرفه‌ای', 'سفر به دنیای درون', 'فرشاد میرشکاری'],
    duration: '۴۰ ساعت آموزش کامل (۱۰ فصل)',
    format: 'فایل صوتی MP3 + پشتیبانی رایگان',
    author: 'فرشاد میرشکاری'
  },

  // 4. مجموعه چهارجلدی چهل دروازه به ماورا
  {
    id: '45363',
    title: 'مجموعه چهارجلدی چهل دروازه به ماورا',
    englishTitle: '40 Gates Complete 4-Volume Book Set',
    description: 'این دوره‌ی آموزشی چهارجلدی حاصل بیست سال تجربه، آموزش و پژوهش بر موضوع برنامه‌ریزی ذهن و رویابینی آگاهانه است. برای شما که در جست‌وجوی شادی، هیجان و تجربه‌ی اوج لذت در بهشت شخصی رویاهایتان هستید؛ و نمی‌خواهید همانند افراد ناآگاه، هر شب در خواب‌های پوچ و کابوس‌های دلهره‌آور سرگردان باشید.\n\nآنچه پیش روی شماست، معجونی از ایده‌های طلایی و ترفندهای منحصربه‌فرد برای تسلط بر ذهن و خواب شفاف است؛ که طی سال‌ها کاوش و بررسی هزاران روش متفاوت برای کنترل آگاهانه‌ی رویاها حاصل گردیده است. این آموزش‌های ساده و روان به‌نحوی تنظیم شده‌اند که می‌توانید به‌راحتی و در کمترین زمان ممکن، آن‌ها را یاد بگیرید و به کار ببندید.\n\nاگر آماده‌اید که به‌سوی موفقیت و شادکامی در خواب و بیداری گام بردارید و به نتایج حیرت‌انگیز برسید؛ بدانید که نقشه‌ی راهنمای مناسبی را در دست دارید. نبوغ ذاتی نیست. شعور ذاتی نیست. خودباوری ذاتی نیست. شما صاحب یک مغز تکامل‌یافته هستید؛ و این کتاب حاوی دستورالعمل‌هایی ویژه برای برنامه‌ریزی و کنترل این ابرکامپیوتر بیولوژیک است. همین حالا تصمیم بگیرید که چگونه می‌خواهید از زندگی خود استفاده کنید. اگر مصمم به یادگیری مهارت آفرینش رویاهای آگاهانه و تسلط بر دنیای خواب‌های شفاف هستید؛ از آموزش‌های تنظیم‌شده در این کتاب استفاده کنید؛ و آرزوی دیرینه‌ی دستیابی به بهشت شخصی خویش را تحقق بخشید.',
    shortDescription: 'دوره آموزشی چهارجلدی و آموزش برنامه‌ریزی ذهن و رویابینی آگاهانه.',
    price: 3599000,
    salePrice: 3059150,
    type: 'printed',
    category: 'courses',
    images: book40GatesRealImages,
    stock: 10,
    rating: 5.0,
    reviewsCount: 31,
    featured: true,
    bestSeller: true,
    tags: ['چهل دروازه به ماورا', 'کتاب چاپی', 'چهارجلدی', 'فرشاد میرشکاری', 'رویابینی آگاهانه'],
    pages: 1250,
    format: '۴ جلد چاپی نفیس',
    author: 'فرشاد میرشکاری'
  },

  // 4.5 مشاوره VIP
  {
    id: '45398',
    title: 'مشاوره VIP استاد',
    englishTitle: 'VIP Consultation',
    description: 'ثبت‌نام مستقیم در خدمات مشاوره VIP اختصاصی و ارتباط مستقیم با فرشاد میرشکاری در چت تلگرام.\n\n✅ تحلیل روزانه تمرینات و رویاهای شما توسط استاد\n✅ ارائه راهکارهای کلیدی و اصلاح متد تمرینی\n✅ پاسخگویی اختصاصی به تمامی پرسش‌های ماورایی و رویابینی در طول دوره',
    shortDescription: 'ارتباط مستقیم، پشتیبانی اختصاصی تلگرام و تحلیل روزانه رویاها با استاد فرشاد میرشکاری.',
    price: 8900000,
    salePrice: 8900000,
    type: 'course',
    category: 'courses',
    images: [vipInnerMasterImg],
    stock: 999,
    rating: 5.0,
    reviewsCount: 22,
    featured: true,
    bestSeller: true,
    tags: ['مشاوره VIP', 'مشاوره اختصاصی', 'رویاهای شفاف', 'فرشاد میرشکاری', 'پشتیبانی تلگرام'],
    duration: 'مشاوره اختصاصی ۳۰ روزه / ۶۰ روزه / ۹۰ روزه',
    format: 'ارتباط مستقیم چت تلگرام + تحلیل روزانه رویاها',
    author: 'فرشاد میرشکاری'
  },

  // 5. کتاب دانشخند
  {
    id: '45376',
    title: 'کتاب دانشخند',
    englishTitle: 'Danesh Khand (Wisdom & Wit)',
    description: 'کتاب طنز و فلسفی نوشته فرشاد میرشکاری درباره تناقض‌های انسانی، ذهن، احساسات و آگاهی. نگاهی تازه و لطیف به معماها و ناگفته‌های ذهن انسان با نگارشی جالب و خواندنی.',
    shortDescription: 'نگاهی طنزآمیز و لطیف به معماها و تناقض‌های پیچیده ذهن انسان.',
    price: 499000,
    salePrice: 399200,
    type: 'printed',
    category: 'books',
    images: [daneshkhand1, daneshkhand2],
    stock: 998,
    rating: 4.8,
    reviewsCount: 36,
    newArrival: true,
    tags: ['دانشخند', 'طنز فلسفی', 'کتاب چاپی', 'فرشاد میرشکاری'],
    pages: 182,
    format: 'قطع رقعی - ۱۸۲ صفحه',
    author: 'فرشاد میرشکاری'
  },

  // 6. کتاب چهل دروازه به ماورا - جلد اول
  {
    id: '45375',
    title: 'کتاب چهل دروازه به ماورا - جلد اول',
    englishTitle: '40 Gates to Beyond - Volume 1 (Printed Book)',
    description: 'چاپ فیزیکی کتاب چهل دروازه به ماورا: راهنمای سفر به دنیای درون (جلد اول). مرجع ۳۵۲ صفحه‌ای با کیفیت عالی برای علاقه‌مندان به خودشناسی، خودآگاهی و رویابینی آگاهانه.',
    shortDescription: 'نسخه چاپی نفیس جلد اول مرجع رویابینی آگاهانه و برنامه‌ریزی ذهن.',
    price: 899000,
    salePrice: 809100,
    type: 'printed',
    category: 'books',
    images: [book40GatesImg6, book40GatesImg5],
    stock: 69,
    rating: 4.9,
    reviewsCount: 88,
    bestSeller: true,
    tags: ['چهل دروازه به ماورا', 'کتاب فیزیکی', 'جلد اول', 'فرشاد میرشکاری'],
    pages: 352,
    format: 'قطع رقعی - ۳۵۲ صفحه',
    author: 'فرشاد میرشکاری'
  },

  // 7. کتاب صوتی فراسوی واقعیت (خواب راحت)
  {
    id: '45361',
    title: 'کتاب صوتی فراسوی واقعیت (خواب راحت)',
    englishTitle: 'Beyond the Reality (Relaxing Sleep Audio)',
    description: '۱۸ ساعت آموزش کامل در ۱۰۰ درس، هماهنگ شده با موسیقی آرامش‌بخش جهت تاثیر مستقیم بر ذهن ناخودآگاه. درمان کامل بی‌خوابی و اختلالات خواب، تنظیم خواب عمیق، افزایش شفافیت رویاها و تقویت حافظه. لطفاً در رختخواب با صدای آهسته گوش کنید؛ کمتر از ۱۵ دقیقه بعد وارد خوابی عمیق خواهید شد.',
    shortDescription: '۱۸ ساعت فایل صوتی آرامش‌بخش برای ورود آسان به خواب عمیق و رویاهای شفاف.',
    price: 1988000,
    salePrice: 1570000,
    type: 'audio',
    category: 'audiobooks',
    images: [audioBeyondRealityImg],
    stock: 9999,
    rating: 4.8,
    reviewsCount: 73,
    featured: true,
    tags: ['کتاب صوتی', 'فراسوی واقعیت', 'خواب راحت', 'درمان بی خوابی', 'فرشاد میرشکاری'],
    duration: '۱۸ ساعت آموزش کامل (۱۰۰ درس)',
    format: 'MP3 با کیفیت عالی + پشتیبانی',
    author: 'فرشاد میرشکاری'
  },

  // 8. آموزش برونفکنی کامل (در 8 دقیقه)
  {
    id: '45371',
    title: 'آموزش برونفکنی کامل (در 8 دقیقه)',
    englishTitle: 'Full Astral Projection Subliminal (8 Mins)',
    description: 'آموزش برون‌فکنی و ارتباط با ابرآگاه! این تکنیک راه میان‌بری برای دسترسی سریع و آسان به اوج نیروی تخیل و اطلاعات ارزشمند حافظه‌ی بلندمدت (ابرآگاه) در رویاهای آگاهانه است. سابلیمینال کامل برون‌فکنی و رویابینی شفاف در بیداری.',
    shortDescription: 'تکنیک میان‌بر و فایل صوتی سابلیمینال دسترسی سریع به ابرآگاه.',
    price: 699000,
    salePrice: 559200,
    type: 'audio',
    category: 'audiobooks',
    images: [astral8MinCourseImg],
    stock: 9999,
    rating: 4.8,
    reviewsCount: 51,
    tags: ['برونفکنی', 'سابلیمینال', 'پرواز روح', 'رویابینی بیداری', 'فرشاد میرشکاری'],
    duration: '۸ دقیقه سابلیمینال صوتی',
    format: 'فایل صوتی MP3 کیفیت عالی',
    author: 'فرشاد میرشکاری'
  },

  // 9. کتاب فراسوی واقعیت
  {
    id: '45322',
    title: 'کتاب فراسوی واقعیت',
    englishTitle: 'Beyond The Reality',
    description: 'کتاب «فراسوی واقعیت» نوشته فرشاد میرشکاری، به موضوع رویابینی آگاهانه و تلقین روانی می‌پردازد و به شما می‌آموزد چگونه با کنترل ضمیر ناخودآگاه، خواب‌های خود را نیز کنترل کنید و کابوس‌هایتان را از بین ببرید. این کتاب به شما کمک می‌کند تا شادی، هیجان و لذت فراوان را با دستیابی به رویاهایتان تجربه کنید.',
    shortDescription: 'راهنمای جامع رویابینی آگاهانه، تلقین روانی و کنترل ضمیر ناخودآگاه با انتخاب کیفیت چاپ دلخواه.',
    price: 599000,
    salePrice: 539100,
    type: 'printed',
    category: 'books',
    images: [farasou1, farasou2, farasou3, farasou4],
    stock: 34,
    rating: 4.9,
    reviewsCount: 42,
    featured: true,
    bestSeller: true,
    tags: ['رویابینی آگاهانه', 'تلقین روانی', 'کتاب فیزیکی', 'کنترل رویا', 'فرشاد میرشکاری'],
    pages: 240,
    format: 'معمولی / بالک سبک / تمام رنگی',
    author: 'فرشاد میرشکاری'
  },

  // 10. کتاب صوتی بهشت شخصی من
  {
    id: '45345',
    title: 'کتاب صوتی بهشت شخصی من',
    englishTitle: 'My Personal Paradise (Audiobook)',
    description: 'نسخه صوتی کتاب «بهشت شخصی من»، تنظیم شده در ۱۸ فصل همراه با گویندگی شنیدنی و آرامش‌بخش خانم زهرا سن‌شناس. مناسب جهت گوش دادن در رختخواب برای تجربه خواب راحت، عمیق و پر از آگاهی.',
    shortDescription: 'نسخه صوتی ۱۸ فصلی با صدای خانم زهرا سن‌شناس جهت خواب راحت و آرامش ذهن.',
    price: 268000,
    salePrice: 241200,
    type: 'audio',
    category: 'audiobooks',
    images: [audioPersonalParadiseImg],
    stock: 9999,
    rating: 4.9,
    reviewsCount: 45,
    featured: true,
    tags: ['کتاب صوتی', 'بهشت شخصی من', 'زهرا سن شناس', 'خواب راحت', 'فرشاد میرشکاری'],
    duration: '۴ ساعت و ۳۰ دقیقه (۱۸ فصل)',
    format: 'فایل صوتی MP3 - کیفیت استودیویی',
    author: 'فرشاد میرشکاری (گوینده: زهرا سن شناس)'
  },

  // 11. کتاب آفریدگار رویاها
  {
    id: '45329',
    title: 'کتاب آفریدگار رویاها',
    englishTitle: 'The Creator of Dreams',
    description: 'ثمره‌ی سال‌ها تجربه و آموزش و پژوهش بر موضوع برنامه‌ریزی ذهن و رویابینی آگاهانه. حاوی بهترین و مؤثرترین روش‌های غلبه بر کابوس‌ها و کنترل دنیای بی‌انتهای رویاها.',
    shortDescription: 'دستورالعمل‌های ویژه برنامه‌ریزی و کنترل ابرکامپیوتر بیولوژیک ذهن در دو کیفیت چاپ.',
    price: 559000,
    salePrice: 503100,
    type: 'printed',
    category: 'books',
    images: [aferidegar1, aferidegar2],
    stock: 95,
    rating: 4.9,
    reviewsCount: 56,
    featured: true,
    bestSeller: true,
    tags: ['آفریدگار رویاها', 'برنامه‌ریزی ذهن', 'آموزش جادو', 'فرشاد میرشکاری'],
    pages: 288,
    format: 'معمولی / تمام رنگی',
    author: 'فرشاد میرشکاری'
  },

  // 12. کتاب اسرار رویا و کابوس
  {
    id: '45328',
    title: 'کتاب اسرار رویا و کابوس',
    englishTitle: 'Secrets of Dreams and Nightmares',
    description: 'کتاب «اسرار رویا و کابوس» یا روش کنترل رویای شفاف (Advanced Lucid Dreaming)، روشی عملی برای از بین بردن کابوس‌ها و لذت بردن از خواب است. این کتاب حاصل بیش از ده سال تجربیات شخصی نویسنده در رویابینی آگاهانه است.',
    shortDescription: 'روشی عملی و تجربی برای درمان کابوس‌ها و بیداری در رویا.',
    price: 299000,
    salePrice: 269100,
    type: 'printed',
    category: 'books',
    images: [asrar1, asrar2],
    stock: 87,
    rating: 4.9,
    reviewsCount: 31,
    bestSeller: true,
    tags: ['اسرار رویا و کابوس', 'شروع رویابینی', 'کنترل کابوس', 'فرشاد میرشکاری'],
    pages: 80,
    format: 'قطع رقعی - ۸۰ صفحه',
    author: 'فرشاد میرشکاری'
  },

  // 13. رمان سه‌جلدی بوسه خداوند
  {
    id: '45324',
    title: 'رمان سه‌جلدی بوسه خداوند',
    englishTitle: 'Kiss of God (3-Volume Novel Trilogy)',
    description: 'آموزش حرفه‌ای رویابینی شفاف در قالب رمان! این مجموعه‌ی داستانی سه‌جلدی شامل کتاب‌های «بوسه‌ی خداوند»، «شب‌شکن» و «شکارچی کابوس‌ها» است. داستان وقوع دهشتناک‌ترین فاجعه‌ی جهانی در طول تاریخ بشر را پیشگویی می‌کند و سرنوشت اسرارآمیز دنیا در دو قرن آینده را در قالب معجونی از عشق، هیجان و ترس به تصویر می‌کشد.',
    shortDescription: 'رمان علمی-تخیلی ۳ جلدی و آموزش حرفه‌ای رویابینی شفاف در قالب داستان.',
    price: 1999000,
    salePrice: 1799100,
    type: 'printed',
    category: 'books',
    images: [roman1, roman2, roman3, roman4, roman5],
    stock: 93,
    rating: 5.0,
    reviewsCount: 38,
    featured: true,
    bestSeller: true,
    tags: ['رمان آموزشی', 'بوسه خداوند', 'رویابینی شفاف', 'علمی تخیلی', 'فرشاد میرشکاری'],
    pages: 680,
    format: 'مجموعه سه‌جلدی چاپی',
    author: 'فرشاد میرشکاری'
  },

  // 14. کتاب بهشت شخصی من
  {
    id: '45325',
    title: 'کتاب بهشت شخصی من',
    englishTitle: 'My Personal Paradise',
    description: 'این کتاب حاوی گوشه‌ای از مکاشفات معنوی فرشاد میرشکاری در دنیای رویاهای شفاف است؛ که با تجربه‌ی لذت‌هایی ورای تصورات مادی بشر همراه بوده است. دنیایی سراسر لذت و شادی و عاری از دغدغه‌های مادی؛ که نویسنده آن را «بهشت شخصی» می‌نامد. موهبتی بی‌نهایت ارزشمند که خداوند عزوجل به ما انسان‌ها عطا فرموده است.',
    shortDescription: 'گوشه‌ای از مکاشفات معنوی در دنیای رویاهای شفاف و سفر به درون.',
    price: 299000,
    salePrice: 239200,
    type: 'printed',
    category: 'books',
    images: [behesht1, behesht2],
    stock: 94,
    rating: 4.8,
    reviewsCount: 27,
    newArrival: true,
    tags: ['بهشت شخصی من', 'مکاشفات معنوی', 'رویابینی شفاف', 'کتاب جیبی', 'فرشاد میرشکاری'],
    pages: 154,
    format: 'قطع جیبی - ۱۵۴ صفحه',
    author: 'فرشاد میرشکاری'
  },

  // 15. دوره طلایی استاد
  {
    id: '45399',
    title: 'دوره طلایی استاد',
    englishTitle: 'Golden Master Bundle (Video Course + Subliminals + All Physical Books)',
    description: 'اگر مصمم هستید تا مهارت رویابینی آگاهانه را به صورت ریشه‌ای و کامل یاد بگیرید، پیشنهاد می‌کنم از باندل کامل استاد استفاده کنید.\n\n🔑 دوره حرفه‌ای رویابینی آگاهانه (آنلاین - ۹۰ روز آموزش ویدیویی)\n\n➕ کتاب‌های رنگی 《چهل دروازه به ماورا》:\n📗 جلد ۱: راهنمای سفر به دنیای درون\n📘 جلد ۲: راهنمای لمس بهشت درون\n📙 جلد ۳: راهنمای اکتشاف گنج درون\n📕 جلد ۴: راهنمای اکتشاف ماورا\n\n➕ ۹ کتاب چاپی نفیس:\n📗 اسرار رویا و کابوس\n📘 آفریدگار رویاها (رنگی)\n📒 فراسوی واقعیت (رنگی)\n📗 بوسه خداوند\n📘 شب شکن\n📒 شکارچی کابوس‌ها\n📗 بهشت شخصی من\n📕 دانشخند\n📔 چشم‌هایم هنوز روشن است\n\n➕ 💎 سابلیمینال خواب راحت\n➕ 💎 سابلیمینال رویای شفاف در بیداری (برون‌فکنی)\n➕ 🎧 پکیج صوتی فراسوی واقعیت\n➕ ✅ پشتیبانی کامل به مدت ۲ سال مستقیم با فرشاد میرشکاری\n➕ ✅ تضمین تجربه رویاهای شفاف\n➕ ✅ تضمین برگشت وجه (در صورت انجام منظم تمرینات در طول دوره، ارسال روزانه نتایج تمرین و عدم تجربه رویای شفاف، فقط مبلغ ۷,۹۹۰,۰۰۰ تومان بابت هزینه کتاب‌های چاپی و فایل‌های صوتی کسر می‌گردد).',
    shortDescription: 'اگر مصمم هستید تا این مهارت را به صورت ریشه‌ای یاد بگیرید، پیشنهاد می‌کنم از باندل کامل استفاده کنید.',
    price: 48000000,
    salePrice: 38000000,
    type: 'course',
    category: 'courses',
    images: [masterGoldenCourseImg, book40GatesImg1, book40GatesImg6],
    stock: 25,
    rating: 5.0,
    reviewsCount: 112,
    featured: true,
    bestSeller: true,
    newArrival: true,
    tags: ['دوره طلایی استاد', 'باندل کامل', 'دوره آنلاین ویدیویی', '۱۳ جلد کتاب چاپی', 'فرشاد میرشکاری', 'پشتیبانی ۲ ساله'],
    duration: 'دوره آنلاین ۹۰ روزه + ۲ سال پشتیبانی اختصاصی',
    format: 'آموزش ویدیویی آنلاین + ۱۳ جلد کتاب چاپی + پکیج‌های صوتی و سابلیمینال',
    author: 'فرشاد میرشکاری'
  },

  // 16. کتاب چشمهایم هنوز روشن است
  {
    id: '45378',
    title: 'کتاب چشمهایم هنوز روشن است',
    englishTitle: 'My Eyes Are Still Bright',
    description: `عشق، زبان من است. ترس، خشم، امید و انساندوستی نیز. احساسات همچون نتهای یک سمفونی، درونمان به ارتعاش درمیآیند و ما را به بازی در صحنهی زندگی دعوت میکنند. من به زبان جهانیِ احساس سخن میگویم. زبانی که محدود به مرزها و فرهنگها نیست. زبانی که هر قلبی آن را میفهمد. این زبان، پلی است میان دلهای ما و جهان. پلی که افکار را به کلمات تبدیل میکند و کلمات را به خاطرات.

احساسات همان نویسندگان پنهان سرنوشت من و شما هستند. آنها با قلم نامرئی خود، داستانهای زندگیمان را خط میزنند. ترس، خشم، عشق، امید، شادی و درد، هرکدام فصلهایی از این کتاب بیپایان هستند. احساسات بهمانند آب روانی هستند که در جویبارهای درونمان جریان دارند. میتوانند ما را بهسوی دریاهای وسیع ببرند یا در گردابهای بیپایان فروکِشند. میتوانیم به آنها اجازه دهیم که همچون اسبهای وحشی، ما را به ناکجاآباد ببرند؛ یا با افسار آگاهی، این نیروی ناپیدا را رام کنیم و آن را در مسیر اهدافمان هدایت نماییم.

درنهایت، همهچیز به انتخاب ما بستگی دارد؛ به اینکه چگونه با احساساتمان برخورد میکنیم و چگونه از آنها در زندگی بهره میبریم. انتخابهایمان تعیینکنندهی سرنوشتمان هستند. هر تصمیمی که میگیریم؛ هر احساسی که انتخاب میکنیم؛ به آن اجازه میدهیم درونمان ریشه کند و آیندهی ما را شکل دهد.

اراده و آگاهی، همان کلیدهای طلایی هستند که قفلهای مسیر زندگی را میگشایند. میتوانیم آنها را بهکار گیریم تا آنچه را که در این جهان میخواهیم، بهدست آوریم؛ یا اینکه به جریان زندگی دل بسپاریم و بگذاریم تندبادِ سرنوشت ما را به هر سویی که میخواهد ببرد.

و حال، این انتخاب همیشه با شماست: رامکنندهی سرنوشت خود باشید یا مسافری سرگردان در گردابهای زمان؟

✨ نمونه‌ای از اشعار و دل‌نوشته‌های این کتاب:

زندگی
رشته‌ای از خنده‌های بلند
چرخیدن بر مدارِ شادی
و پرواز بر بادِ بی‌خیالیست
نه تکلیفی در کار است
نه نمره‌ای بر صفحه
این بازیست
و ما همه بازیگرانی آزاد
در میانِ آسمان و خاک`,
    shortDescription: 'کتابی اثرگذار و دل‌نشین در باب احساسات، عشق، آگاهی و انتخاب‌های سرنوشت‌ساز در زندگی.',
    price: 499000,
    salePrice: 399200,
    type: 'printed',
    category: 'books',
    images: [cheshm1, cheshm2],
    stock: 99,
    rating: 5.0,
    reviewsCount: 38,
    featured: true,
    bestSeller: true,
    newArrival: true,
    tags: ['چشم‌هایم هنوز روشن است', 'کتاب چاپی', 'احساسات و آگاهی', 'اشعار و دلنوشته', 'فرشاد میرشکاری'],
    pages: 160,
    format: 'قطع رقعی - ۱۶۰ صفحه',
    author: 'فرشاد میرشکاری'
  },

  // 17. کتاب pdf چهل دروازه به ماورا - جلد1
  {
    id: '45360',
    title: 'کتاب pdf چهل دروازه به ماورا - جلد1',
    englishTitle: '40 Gates to Beyond - Vol 1 (PDF)',
    description: 'نسخه الکترونیکی و رایگان جلد اول کتاب چهل دروازه به ماورا: راهنمای سفر به دنیای درون. دوره‌ی آموزشی حاصل بیست سال تجربه، آموزش و پژوهش بر موضوع برنامه‌ریزی ذهن و رویابینی آگاهانه. شامل معجونی از ایده‌های طلایی و ترفندهای منحصربه‌فرد برای تسلط بر ذهن.',
    shortDescription: 'دانلود رایگان نسخه دیجیتالی جلد اول کتاب چهل دروازه به ماورا.',
    price: 0,
    type: 'pdf',
    category: 'books',
    images: [pdf01, book40GatesImg7],
    stock: 9999,
    rating: 4.9,
    reviewsCount: 189,
    newArrival: true,
    tags: ['PDF رایگان', 'چهل دروازه به ماورا', 'کتاب الکترونیکی', 'فرشاد میرشکاری'],
    pages: 352,
    format: 'PDF وکتور دیجیتال',
    author: 'فرشاد میرشکاری',
    downloadUrl: '/40-gates-vol1.pdf'
  },

  // 17. کتاب pdf چهل دروازه به ماورا - جلد2
  {
    id: '45364',
    title: 'کتاب pdf چهل دروازه به ماورا - جلد2',
    englishTitle: '40 Gates to Beyond - Vol 2 (PDF)',
    description: 'بخش دوم از دوره‌ی آموزشی «هنر آفرینش رؤیاهای شفاف» (جلد دوم PDF). آموزش جدایی کامل از دنیای پرهرج‌ومرج بیرون و قدم نهادن به دنیای جادویی رؤیاهای شفاف.',
    shortDescription: 'دانلود رایگان نسخه دیجیتالی جلد دوم کتاب چهل دروازه به ماورا.',
    price: 0,
    type: 'pdf',
    category: 'books',
    images: [pdf02, book40GatesImg8],
    stock: 9999,
    rating: 4.9,
    reviewsCount: 142,
    tags: ['PDF رایگان', 'چهل دروازه به ماورا', 'جلد دوم', 'فرشاد میرشکاری'],
    pages: 320,
    format: 'PDF وکتور دیجیتال',
    author: 'فرشاد میرشکاری',
    downloadUrl: '/40-gates-vol2.pdf'
  },

  // 18. کتاب pdf چهل دروازه به ماورا - جلد3
  {
    id: '45372',
    title: 'کتاب pdf چهل دروازه به ماورا - جلد3',
    englishTitle: '40 Gates to Beyond - Vol 3 (PDF)',
    description: 'بخش سوم از دوره‌ی آموزشی «هنر آفرینش رؤیاهای شفاف» (جلد سوم PDF). مهارت‌های حرفه‌ای ورود آگاهانه به رؤیای شفاف، کشف و آفرینش تضادهای ماتریکس، کنترل آگاهانه‌ی عمق رؤیاها، حذف کابوس‌ها و بنا نهادن بهشت شخصی.',
    shortDescription: 'دانلود رایگان نسخه دیجیتالی جلد سوم چهل دروازه به ماورا.',
    price: 0,
    type: 'pdf',
    category: 'books',
    images: [pdf03, book40GatesImg9],
    stock: 9999,
    rating: 4.9,
    reviewsCount: 118,
    tags: ['PDF رایگان', 'چهل دروازه به ماورا', 'جلد سوم', 'فرشاد میرشکاری'],
    pages: 310,
    format: 'PDF وکتور دیجیتال',
    author: 'فرشاد میرشکاری',
    downloadUrl: '/40-gates-vol3.pdf'
  },

  // 19. کتاب pdf چهل دروازه به ماورا - جلد4
  {
    id: '45373',
    title: 'کتاب pdf چهل دروازه به ماورا - جلد4',
    englishTitle: '40 Gates to Beyond - Vol 4 (PDF)',
    description: 'کتاب نهایی و بخش چهارم دوره‌ی حرفه‌ای «هنر آفرینش رؤیاهای شفاف» (جلد چهارم PDF). تکنیک‌های رهایی از کلیه‌ی محدودیت‌های ذهنی و کسب ثروت حقیقی، بازآرایی واقعیت دنیاهای درون و بیرون، لمس زندگی جاودانه و لذت‌های ماورایی.',
    shortDescription: 'نسخه نهایی و رایگان جلد چهارم کتاب چهل دروازه به ماورا.',
    price: 0,
    type: 'pdf',
    category: 'books',
    images: [pdf04, book40GatesImg10],
    stock: 9999,
    rating: 5.0,
    reviewsCount: 135,
    tags: ['PDF رایگان', 'چهل دروازه به ماورا', 'جلد چهارم', 'بازنویسی واقعیت', 'فرشاد میرشکاری'],
    pages: 290,
    format: 'PDF وکتور دیجیتال',
    author: 'فرشاد میرشکاری',
    downloadUrl: '/40-gates-vol4.pdf'
  }
];

export const REVIEWS: Review[] = ALL_REVIEWS;
