/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Local high-resolution assets for prompt projects
import img01 from '../assets/images/01.jpg';
import img02 from '../assets/images/02.jpg';
import img03 from '../assets/images/03.jpg';
import img04 from '../assets/images/04.jpg';

import farasou1 from '../assets/images/farasou_1.jpg';
import farasou2 from '../assets/images/farasou_2.jpg';
import farasou3 from '../assets/images/farasou_3.jpg';
import farasou4 from '../assets/images/farasou_4.jpg';

import asrar1 from '../assets/images/asrar_1_1786777302382.jpg';
import asrar2 from '../assets/images/asrar_2_1786777313072.jpg';

import cheshm1 from '../assets/images/cheshm_1.jpg';
import cheshm2 from '../assets/images/cheshm_2.jpg';

import inseption1 from '../assets/images/inseption1.jpg';

import mat1 from '../assets/images/mat1.jpg';
import mat2 from '../assets/images/mat2.jpg';
import mat3 from '../assets/images/mat3.jpg';

import roman1 from '../assets/images/roman_1.jpg';
import roman2 from '../assets/images/roman_2.jpg';
import roman3 from '../assets/images/roman_3.jpg';

// Project "Man and dog" reference image
import imgManAndDog from '../assets/images/مرد و سگ.jpg';

// Project "One Third of Life" reference images
import imgTshirt from '../assets/images/برش تیشرت.jpg';
import imgMirror from '../assets/images/آینه.jpg';
import imgPencil from '../assets/images/مداد.jpg';
import imgHotdog from '../assets/images/هات داگ.jpg';
import imgIphone from '../assets/images/گوشی آیفون.jpg';
import imgChainsaw from '../assets/images/اره برقی.jpg';

export interface AiPromptImage {
  id: string;
  url: string;
  title: string;
  fileName?: string;
  type: 'output' | 'reference' | 'step'; // خروجی نهایی، تصویر مرجع، مراحل ساخت
  caption?: string;
}

export interface AiPromptParameter {
  label: string;
  value: string;
}

export interface AiPromptProject {
  id: string;
  title: string;
  shortIdea: string;
  category: 'image' | 'video' | 'cinematic' | 'character' | 'surreal';
  categoryLabel: string;
  model: string;
  images: AiPromptImage[];
  prompt: string;
  promptLabel?: string; // e.g. "Video Prompt"
  videoPrompt?: string;
  negativePrompt?: string;
  tips: string[];
  parameters: AiPromptParameter[];
  dateAdded: string;
  tags: string[];
}

/**
 * راهنمای اضافه کردن پروژه جدید:
 * برای افزودن هر پروژه هوش مصنوعی جدید با تصویر و پرامپت، کافی است یک آبجکت جدید
 * به آرایه AI_PROMPTS در زیر اضافه کنید. ساختار کامپوننت و صفحه به صورت خودکار
 * آن را رندر خواهد کرد.
 */
export const AI_PROMPTS: AiPromptProject[] = [
  {
    id: 'man-and-dog',
    title: 'Man and dog',
    shortIdea: 'یک ویدیوی مفهومی درباره انسانی که بدون اینکه متوجه شود، یکسوم زندگی خود را دور میاندازد.',
    category: 'video',
    categoryLabel: 'تصویر و ویدیو',
    model: 'Kling AI / Runway Gen-3 / Sora',
    promptLabel: 'Video Prompt',
    images: [
      {
        id: 'man-and-dog-1',
        url: imgManAndDog,
        title: 'مرد و سگ.jpg',
        fileName: 'مرد و سگ.jpg',
        type: 'reference',
        caption: 'تصویر رفرنس پروژه: هویت کاراکتر مرد و سگ برای تولید فیلم کوتاه فوتورئال'
      }
    ],
    prompt: `**[هدف تولید]**
با **تصویر رفرنس شروع شود** و همان مرد و همان سگِ موجود در تصویر رفرنس، با حفظ دقیق هویت و ظاهر هر دو، در یک فیلم کوتاه سینمایی فوتورئال ۲۷ ثانیهای، 16:9، حضور داشته باشند.

داستان درباره مردی است که سگش را که آلوده و زامبی شده میبیند و تپانچهای را به سمت او گرفته است. مرد بهشدت گریان و شکسته است و نمیتواند به سگ محبوبش شلیک کند. سگ زامبیشده غرّش و فریاد میکشد و به سمت او حمله میکند. مرد اسلحه را پایین میآورد، هر دو دستش را باز میکند و تسلیم احساساتش میشود. سگ به سمت او حمله میکند و به او ضربه میزند — سپس تصویر با یک **HARD SMASH CUT** به خاطرات طلایی و شاد مرد و سگش میرود.

بدون شلیک. بدون دیالوگ. بدون داستان اضافی.

**[سبک کلی]**
سینمای لایواکشن وایداسکرین 16:9، 24fps، گرین ظریف فیلم 35mm، عمق میدان کم، پوست طبیعی، اشک واقعی و احساسات انسانی و باورپذیر.

**زمان حال (۰–۱۱ ثانیه):** سرد، کمرنگ، خاکستری مایل به سبز و غبارآلود، نور کم، سیاهیهای عمیق، نور ابری از پنجره، دوربین کمی دستی.

**خاطره (۱۱–۲۷ ثانیه):** نور گرم طلاییِ غروب، کهربایی و هلویی، نور حجمی خورشید، فلر ملایم و حرکت نرمتر دوربین.

فقط زمان واقعی. بدون اسلوموشن. بدون عنوان یا نوشته.

**[شخصیتها]**

**مرد:**
همان مرد دقیقاً مطابق تصویر رفرنس. احساسات بسیار شدید، چهره گریان و شکسته، اشک روی گونهها. در زمان حال نمیتواند به سگ خودش شلیک کند و از نظر عاطفی فروپاشیده است. در خاطرات، همان مرد با چهرهای شاد، آرام و عاشقانه در کنار سگش دیده میشود.

**سگ:**
همان سگ دقیقاً مطابق تصویر رفرنس. در زمان حال آلوده و زامبیشده است، اما باید همچنان کاملاً قابل تشخیص باشد که همان سگ محبوب مرد است؛ نه یک موجود زامبی عمومی و متفاوت.

سگ زامبیشده رفتار حیوانی و خشن دارد: غرّش خیس، نفسهای سنگین، دندانهای نمایان و حمله ناگهانی. صدا باید واقعی و حیوانی باشد، نه صدای هیولای فانتزی.

در بخش خاطره، همان سگ سالم، دوستداشتنی و سرحال است و رابطه عاطفی عمیقش با مرد کاملاً قابل احساس باشد.

**[مکانها]**

**آشپزخانه:**
خانه روستایی متروکه؛ گچهای پوستهپوسته، کابینتهای چوبی، قفسههایی با یک قابلمه نقرهای و یک قوطی قرمز، پارچ پلاستیکی سفید، تی زرد کنار پنجره چهارلته که به درختان رنگپریده باز میشود، درِ چوبی تیره در سمت چپ تصویر و هوای غبارآلود.

**مزرعه:**
گندمهای بلند و طلایی روی تپههای نرم و غلتان، کوههای دوردست و خورشید پایین.

**[زمانبندی دقیق نماها — 16:9]**

**۰.۰–۲.۰ ثانیه — نمای A:**
کلوزآپ بسیار نزدیک از مرد در زمان حال. اشکها روی صورتش جاری است و چهرهاش پر از درد و درماندگی است. یک تپانچه مشکی کوچک در پیشزمینه، خارج از فوکوس، به سمت سگ نشانه رفته است. مرد شلیک نمیکند. حرکت بسیار جزئی و دستی دوربین.
<صدای بم و آرام تنش، نفسهای لرزان، صدای دور غرّش سگ>

**۲.۰–۳.۵ ثانیه — نمای B:**
کات سخت. نمای روی شانه از پشت مرد. مرد در سمت چپ تصویر بهصورت محو دیده میشود و تپانچه در مرکز قرار دارد. سگ زامبیشده در آشپزخانه روبهروی او ایستاده و مستقیم نگاهش میکند.
<غرش خیس، نفسهای سنگین، صدای جیرجیر کف زمین>

**۳.۵–۴.۵ ثانیه — نمای C:**
نمای متوسط همسطح چشم. مرد در مرکز قاب، تپانچه را با هر دو دست به سمت سگ نشانه گرفته است. او گریه میکند اما شلیک نمیکند.

**۴.۵–۶.۲ ثانیه — نمای D:**
کلوزآپ بسیار نزدیک از سگ زامبیشده. چشمها، دندانها و حالت خشن صورت واضح هستند. سگ با شدت به سمت دوربین **غرش میکند**؛ دهان کاملاً باز، بزاق طبیعی و حرکت واضح فک و گلوی حیوان.
<غرش خیس و واقعی، نفس سنگین>

**۶.۲–۷.۵ ثانیه — نمای E:**
کلوزآپ بسیار نزدیک از مرد. اشکها روی صورتش جاری هستند. به سگ نگاه میکند و نمیتواند ماشه را بکشد. مکث طولانی و احساسی.

**۷.۵–۸.۵ ثانیه — نمای F:**
همان نمای متوسط نمای C. مرد همچنان اسلحه را گرفته است، اما بهآرامی آن را پایین میآورد. غرّش سگ همچنان شنیده میشود.

**۸.۵–۱۰.۲ ثانیه — نمای G:**
مرد اسلحه را کنار بدنش پایین میآورد و سپس هر دو دستش را کاملاً باز میکند، کف دستها رو به جلو. او چشمهایش را میبندد و اشک روی صورتش جاری است؛ گویی نمیتواند با خاطره و عشقش به سگش مبارزه کند. غرّش سگ در پسزمینه شدیدتر میشود و به فریاد حیوانی تبدیل میشود.

**۱۰.۲–۱۱.۰ ثانیه — نمای H:**
نمای متوسط از کنار. مرد در سمت چپ تصویر ایستاده و بدون دفاع است. سگ زامبیشده با سرعت به سمت او حمله میکند و به بدن/صورت او ضربه میزند. لحظهای شدید و شوکهکننده، اما بدون نمایش خون و گور.

<فریاد حیوانی، برخورد بدن، اوج ناگهانی موسیقی>

**۱۱.۰ ثانیه — HARD SMASH CUT:**
بدون دیزالو. تصویر سرد و خاکستری در یک فریم به تصویر گرم و طلایی تبدیل شود. صدای حمله سگ همزمان با کات تصویر قطع شود.

**۱۱.۰–۱۳.۰ ثانیه — نمای I:**
نمای متوسط از زاویه پایین میان گندمهای بلند و نورخورده. مرد در خاطره کنار سگ سالم و شادش ایستاده و آن را نوازش میکند. سگ با خوشحالی به مرد نگاه میکند. خورشید پشت تپه فلر ایجاد میکند.

**۱۳.۰–۱۶.۰ ثانیه — نمای J:**
کلوزآپ احساسی از سگ سالم که با شادی به مرد نگاه میکند و مرد سر و صورت سگ را نوازش میکند. رابطه عاطفی عمیق میان آن دو کاملاً قابل احساس باشد. بدون دیالوگ.

**۱۶.۰–۱۸.۰ ثانیه — نمای K:**
کلوزآپ از مرد در خاطره، لبخند آرام و واقعی روی صورتش. سگ کنار او روی چمن دراز کشیده و مرد دستش را روی سر سگ گذاشته است. نور لکهلکه خورشید روی چهره و موهای سگ.

**۱۸.۰–۲۱.۰ ثانیه — نمای L:**
نمای باز از پشت. مرد و سگ در میان گندمهای طلایی در حال راه رفتن هستند. سگ کمی جلوتر میدود و دوباره به سمت مرد برمیگردد. دوربین بهآرامی آنها را دنبال میکند.

**۲۱.۰–۲۳.۰ ثانیه — نمای M:**
نمای متوسط از پشت. مرد روی چمن نشسته و سگ در کنار او قرار دارد. مرد سگ را در آغوش میگیرد و سرش را نوازش میکند. نور نارنجی خورشید روی افق دیده میشود.

**۲۳.۰–۲۷.۰ ثانیه — نمای N:**
نمای باز از منظره. مرد و سگ در یکسوم پایینی تپه کوچک دیده میشوند؛ غروب صورتی-نارنجی، کوههای لایهلایه و علفهای بلند در پیشزمینه. نما ثابت میماند.

از حدود ثانیه ۱۰ موسیقی پیانو و سازهای زهی بسیار کمحجم و غمگین وارد شود و هرگز بلند نباشد.

<صدای باد میان گندم، خشخش علفها، صدای بسیار آرام قدمهای سگ و تنفس او — بدون صحبت>

**[صدا — الزامی]**
سگ زامبیشده باید **غرش خیس، نفس سنگین و فریاد حیوانی واقعی** داشته باشد. این صدا در نمای D باید بلند و واضح و کاملاً همزمان با تصویر باشد و در حمله نمای H دوباره به اوج برسد.

هیچ کلمه یا دیالوگی وجود نداشته باشد.
هیچ صدای شلیک وجود نداشته باشد.
مرد فریاد نکشد.
مرد فقط گریه و نفسهای لرزان داشته باشد.
صدای سگ باید واقعی و حیوانی باشد، نه صدای اغراقشده یک هیولای فانتزی.`,
    parameters: [
      { label: 'نسبت تصویر', value: '16:9 (Widescreen)' },
      { label: 'مدت زمان', value: '۲۷ ثانیه' },
      { label: 'فریم‌ریت', value: '24fps' },
      { label: 'تکنیک هوش مصنوعی', value: 'Image to Video (I2V)' },
      { label: 'پلتفرم‌های پیشنهادی', value: 'Kling 1.5 / Runway Gen-3 / Luma' }
    ],
    tips: [
      'تصویر رفرنس مرد و سگ.jpg را به عنوان اولین فریم مرجع در مدل Image-to-Video آپلود نمایید تا چهره، فیزیک و نژاد سگ بدون تغییر حفظ شوند.',
      'توالی نماها به صورت زمان‌بندی دقیق از ۰ تا ۲۷ ثانیه مهندسی شده است تا انسجام حرکتی و کات سخت در ثانیه ۱۱ با بالاترین دقت اجرا شود.'
    ],
    dateAdded: '۱۴۰۳/۱۲/۰۱',
    tags: ['Man and dog', 'Video Prompt', 'ویدیوی مفهومی', 'Image-to-Video', 'سینمایی', '16:9']
  },
  {
    id: 'one-third-of-life',
    title: 'One Third of Life',
    shortIdea: 'یک ویدیوی مفهومی درباره انسانی که بدون اینکه متوجه شود، یکسوم زندگی خود را دور میاندازد.',
    category: 'video',
    categoryLabel: 'ویدیوی مفهومی',
    model: 'Kling AI / Runway Gen-3 / Luma',
    promptLabel: 'Video Prompt',
    images: [
      {
        id: 'otl-tshirt',
        url: imgTshirt,
        title: 'برش تیشرت.jpg',
        fileName: 'برش تیشرت.jpg',
        type: 'reference',
        caption: 'تصویر رفرنس ۱: برش تیشرت با قیچی در امتداد خط‌چین قرمز'
      },
      {
        id: 'otl-mirror',
        url: imgMirror,
        title: 'آینه.jpg',
        fileName: 'آینه.jpg',
        type: 'reference',
        caption: 'تصویر رفرنس ۲: مرد مقابل آینه با حالت چهره جدی و حرکات طبیعی'
      },
      {
        id: 'otl-pencil',
        url: imgPencil,
        title: 'مداد.jpg',
        fileName: 'مداد.jpg',
        type: 'reference',
        caption: 'تصویر رفرنس ۳: بریدن مداد با قیچی'
      },
      {
        id: 'otl-hotdog',
        url: imgHotdog,
        title: 'هات داگ.jpg',
        fileName: 'هات داگ.jpg',
        type: 'reference',
        caption: 'تصویر رفرنس ۴: بریدن هات‌داگ با قیچی و دور انداختن بخش جداشده'
      },
      {
        id: 'otl-iphone',
        url: imgIphone,
        title: 'گوشی آیفون.jpg',
        fileName: 'گوشی آیفون.jpg',
        type: 'reference',
        caption: 'تصویر رفرنس ۵: بریدن گوشی آیفون با قیچی همراه با دود سفید طبیعی'
      },
      {
        id: 'otl-chainsaw',
        url: imgChainsaw,
        title: 'اره برقی.jpg',
        fileName: 'اره برقی.jpg',
        type: 'reference',
        caption: 'تصویر رفرنس ۶: ایستادن مرد با اره‌برقی در اتاق خواب و روشن کردن آن'
      }
    ],
    prompt: `1- پرامپت برش تیشرت با قیچی:

طبق تصویر رفرنس شروع شود. ویدیو عمودی 9:16 باشد و تمام جزئیات تصویر حفظ شود.
شخص با قیچی از ابتدای خطچین قرمز شروع به بریدن تیشرت کند. قیچی دقیقاً مسیر خطچین قرمز را دنبال کند.
بعد از تمام شدن برش، تکه جداشده تیشرت را با دست بردارد و آرام کنار بگذارد.
حرکت دست، قیچی، پارچه و برش کاملاً طبیعی و فوتورئال باشد. هیچ پرش زمانی یا تغییر شکل تصویر وجود نداشته باشد.
------------------------------

2- پرامپت آینه:

طبق تصویر رفرنس شروع شود. ویدیو با نسبت تصویر عمودی 9:16 ساخته شود. 
مرد مقابل آینه ایستاده و با چهرهای جدی و طبیعی به انعکاس خودش در آینه نگاه میکند. حرکات کاملاً واقعی و منطقی باشند؛ تنفس طبیعی، پلکزدن طبیعی، حرکت بسیار جزئی چشمها و سر و جابهجاییهای ظریف و ناخودآگاه بدن. او برای چند لحظه بدون حرکت اضافه به خودش در آینه نگاه کند، سپس کمی سر و نگاهش را تنظیم کند، انگار در حال بررسی ظاهر خودش است. هیچ حرکت ناگهانی، حرکت معکوس، تکرار حرکات، لرزش بدن، تغییر شکل دستها یا صورت و حرکات غیرممکن ایجاد نشود. فیزیک بدن، تعادل، وزن بدن و حرکات دستها کاملاً طبیعی باشد. دوربین ثابت یا با حرکت بسیار نرم و آهسته باشد. ظاهر شخصیت و محیط در تمام ویدیو ثابت بماند. سبک کاملاً واقعگرایانه و سینمایی، بدون اغراق در حرکات.

------------------------------

3- پرامپت بریدن مداد با قیچی:

طبق تصویر رفرنس شروع شود. ویدیو با نسبت تصویر عمودی 9:16 ساخته شود. 
مرد مداد را با قیچی میبرد.

------------------------------

4- پرامپت بریدن هاتداگ با قیچی:

طبق تصویر رفرنس شروع شود. ویدیو با نسبت تصویر عمودی 9:16 ساخته شود. 
مرد هاتداگ را با قیچی میبرد و بخش بریده شده را دور میاندازد.
------------------------------

5- پرامپت بریدن گوشی آیفون با قیچی:

طبق تصویر رفرنس شروع شود. ویدیو با نسبت تصویر عمودی 9:16 ساخته شود. 
مرد گوشی موبایل را در دست گرفته و با قیچی آن را میبرد. فرآیند بریدن باید سخت و مقاوم به نظر برسد.
بعد از کامل شدن برش، قسمت جداشده گوشی واقعاً از بدنه اصلی جدا شود و روی زمین بیفتد.
مقدار کمی دود سفید طبیعی از محل برش بلند شود.
بدون متن، بدون زیرنویس، بدون افکت مصنوعی، بدون تغییر چهره یا لباس، بدون حرکات غیرطبیعی. سبک کاملاً واقعی، سینمایی و فوتورئالیستی.
------------------------------

6- پرامپت روشن کردن ارهبرقی:

ویدیوی عمودی 9:16، کاملاً واقعگرایانه و سینمایی. از تصویر رفرنس استفاده کن و هویت ظاهری مرد را بدون هیچ تغییری حفظ کن.
مرد داخل اتاق خواب ایستاده است. چهرهاش کاملاً جدی و بیاحساس است. او یک ارهبرقی بزرگ را با هر دو دست نگه داشته. حرکت طبیعی بدن: ابتدا کمی به اره نگاه میکند، سپس ارهبرقی را روشن میکند. 
همه چیز کاملاً واقعی باشد: نور طبیعی اتاق، سایههای واقعی، جزئیات پوست و لباس، حرکت طبیعی چشمها و تنفس. هیچ تغییر در ظاهر مرد، لباس، چهره یا محیط ایجاد نشود.`,
    negativePrompt: `بدون متن، بدون زیرنویس، بدون افکت مصنوعی، بدون تغییر چهره یا لباس، بدون حرکات غیرطبیعی، لرزش اضافه، مورف شدن بدن و دست‌ها`,
    tips: [
      'تمام صحنه‌ها با نسبت عمودی 9:16 و وفاداری کامل به فیزیک طبیعی بدن و جزئیات تصاویر رفرنس تنظیم شده‌اند.',
      'در پلتفرم‌های Image-to-Video (مانند Kling AI یا Runway Gen-3) تصویر رفرنس مربوط به هر صحنه را به عنوان فریم آغازین (Start Frame) آپلود کنید.',
      'برای ایجاد حس واقع‌گرایانه و سینمایی بدون لرزش، پارامتر Motion Intensity را روی مقدار کم تا متوسط (۲ تا ۳) تنظیم کنید.'
    ],
    parameters: [
      { label: 'نسبت تصویر ویدیو', value: '9:16 (عمودی)' },
      { label: 'سبک خروجی', value: 'سینمایی و فوتورئال' },
      { label: 'تکنیک هوش مصنوعی', value: 'Image to Video (I2V)' },
      { label: 'پلتفرم‌های پیشنهادی', value: 'Kling 1.5 / Runway Gen-3 / Luma' }
    ],
    dateAdded: '۱۴۰۳/۱۱/۲۰',
    tags: ['One Third of Life', 'ویدیوی مفهومی', 'Image-to-Video', 'پرامپت ویدیویی', 'Kling', 'Runway']
  },
  {
    id: 'crystal-dream-city',
    title: 'کلان‌شهر کریستالی رویاهای شفاف',
    shortIdea: 'طراحی یک سیتی‌اسکیپ معلق بر فراز ابرها با معماری ژئومتریک کریستالی، منشورهای نوری کوانتومی و بازتاب‌های هولوگرافیک نئونی هنگام گرگ‌ومیش کیهانی.',
    category: 'image',
    categoryLabel: 'تولید تصویر',
    model: 'Midjourney v6.1 / Flux.1',
    images: [
      {
        id: 'cdc-output',
        url: farasou1,
        title: 'تصویر خروجی نهایی',
        type: 'output',
        caption: 'رندر نهایی با وضوح ۸K و شیدرهای پیشرفته شکست نور در شیشه‌ها و نور بنفش نئونی'
      },
      {
        id: 'cdc-ref',
        url: inseption1,
        title: 'تصویر مرجع (Reference)',
        type: 'reference',
        caption: 'کانسپت ساختاری پرسپکتیو اعوجاج‌یافته الهام‌گرفته از قوانین رویاهای چندلایه‌ای'
      },
      {
        id: 'cdc-step1',
        url: farasou2,
        title: 'مرحله ۱: پایه‌گذاری حجم‌ها',
        type: 'step',
        caption: 'تولید فرم‌های اولیه و بلوک‌بندی ساختارهای کریستالی در فاز اسکچ پرامپت'
      },
      {
        id: 'cdc-step2',
        url: farasou3,
        title: 'مرحله ۲: نورپردازی و بافت',
        type: 'step',
        caption: 'افزودن پارتیکل‌های معلق اتمسفری، مه رقیق و رنگ‌بندی طلایی-بنفش'
      }
    ],
    prompt: `An ethereal lucid dream crystalline metropolis suspended peacefully above lilac-tinted stratocumulus clouds at cosmic twilight, colossal transparent spires refracting prismatic neon rays, intricate sacred geometric facades inspired by Zaha Hadid and fluid organic architecture, twin glowing violet moons hanging low on the horizon, volumetric golden dusk light cutting through misty spires, floating glass walkways connecting luminous towers, hyper-detailed subsurface scattering on crystalline surfaces, 35mm master cinematography, photorealistic 8k render, octane render style, depth of field, dramatic moody color grading --ar 16:9 --v 6.1 --stylize 350 --quality 2`,
    negativePrompt: `blurry, low resolution, plastic flat textures, harsh oversaturated chromatic aberration, cartoonish, warped perspective artifacts, watermark, logo`,
    tips: [
      'استفاده از عبارت «prismatic neon rays» و «subsurface scattering» باعث انعکاس شیشه‌ای بسیار طبیعی در شیدرهای Midjourney می‌شود.',
      'مقدار stylize را روی ۳۰۰ الی ۴۰۰ نگه دارید تا تعادل میان خطوط ارگانیک معماری و شفافیت حفظ شود.',
      'اگر قصد استفاده در نسبت‌های سینمایی را دارید، پارامتر --ar 21:9 پرسپکتیو فوق‌العاده پانورامیک خلق می‌کند.'
    ],
    parameters: [
      { label: 'نسبت تصویر (Aspect Ratio)', value: '--ar 16:9' },
      { label: 'نسخه مدل', value: 'Midjourney v6.1' },
      { label: 'شاخص Stylize', value: '--stylize 350' },
      { label: 'کیفیت رندر', value: '--quality 2' },
      { label: 'سبک نورپردازی', value: 'Volumetric Dusk & Twilight' }
    ],
    dateAdded: '۱۴۰۳/۱۱/۰۵',
    tags: ['رویابینی', 'معماری کریستالی', 'Midjourney', 'سینمایی', 'نورپردازی حجمی']
  },
  {
    id: 'infinite-consciousness-portal',
    title: 'انعکاس آگاهی در درگاه آینه‌ای بیابان سیاه',
    shortIdea: 'تصویری مفهومی و هایپر-رئالیستی از مسافری در ردای سرمه‌ای در برابر آینه‌ای ابسیدین که جهان‌های متناوب را منعکس می‌سازد؛ مناسب برای تولید عکس و پلان‌های ویدیویی اسلو موشن.',
    category: 'video',
    categoryLabel: 'تصویر و ویدیو',
    model: 'Flux.1 Dev / Runway Gen-3',
    images: [
      {
        id: 'icp-output',
        url: asrar1,
        title: 'تصویر خروجی نهایی',
        type: 'output',
        caption: 'تصویر نهایی با کنتراست عمیق، غبار نورانی و بازتاب بی‌نهایت افق طلایی در دل شب'
      },
      {
        id: 'icp-ref',
        url: roman1,
        title: 'تصویر مرجع (Reference)',
        type: 'reference',
        caption: 'ترکیب‌بندی مینیمالیستی تک‌نقطه‌ای و پالت رنگی شن‌های تیره آتشفشانی'
      },
      {
        id: 'icp-step1',
        url: asrar2,
        title: 'مرحله ۱: تعیین بافت شن و آسمان',
        type: 'step',
        caption: 'تنظیم حس و حال دانه‌بندی فیلم کداک و تیرگی ماسه‌های ریپل‌دار'
      },
      {
        id: 'icp-step2',
        url: roman2,
        title: 'مرحله ۲: اصلاح انعکاس آینه',
        type: 'step',
        caption: 'افزودن امواج ظریف بر سطح شیشه برای ایجاد داینامیک حرکتی ویدیو'
      }
    ],
    prompt: `Cinematic wide shot of a solitary meditative wanderer draped in flowing dark indigo robes, standing motionless before a monolithic obsidian mirror portal planted in an expansive desert of pitch-black volcanic sand at twilight. The mirror reflects infinite diverging dimensions of lucid realities receding into a distant warm amber horizon. Ultra-crisp reflective surfaces, dramatic side-lighting casting long diagonal shadows across rippled dunes, atmospheric low-hanging mist, Kodak Vision3 500T film grain texture, subtle anamorphic streak flares, directed in the visual style of Denis Villeneuve and Roger Deakins, 8k resolution, impeccable symmetry --ar 21:9 --style raw`,
    videoPrompt: `Smooth slow dolly forward tracking towards the obsidian portal, gentle wind blowing the folds of the wanderer's dark robe, delicate liquid rippling across the mirror surface revealing shifting cosmic nebulae, subtle lighting shift from deep indigo to warm golden embers. Cinematic 24fps motion, high temporal coherence, photorealistic camera movement.`,
    negativePrompt: `jittery motion, morphing limbs, cartoonish CGI, flickering artifacts, oversaturated colors, static flat plane`,
    tips: [
      'برای بخش ویدیو در ابزارهای Runway Gen-3 Alpha یا Luma Dream Machine، سرعت حرکت (Motion Index) را روی ۲ یا ۳ بگذارید تا حرکت کاملاً سینمایی و بدون لرزش باشد.',
      'عبارت «Kodak Vision3 500T film grain» حس دیجیتالی خام را حذف کرده و بافت سینمایی ۳۵ میلی‌متری به خروجی می‌دهد.',
      'ذکر سبک فیلم‌برداری «Roger Deakins» عمق سایه‌ها و زاویه نور تابشی لبه‌ها را ارتقا می‌دهد.'
    ],
    parameters: [
      { label: 'نسبت تصویر', value: '--ar 21:9 (Ultrawide)' },
      { label: 'پلتفرم ویدیویی پیشنهادی', value: 'Runway Gen-3 / Luma' },
      { label: 'موشن ایندکس', value: 'Motion: 2.5' },
      { label: 'مدل تصویر', value: 'Flux.1 Dev / Midjourney Raw' },
      { label: 'لنز دوربین', value: 'Anamorphic 35mm' }
    ],
    dateAdded: '۱۴۰۳/۱۰/۲۰',
    tags: ['درگاه آگاهی', 'Runway', 'Flux', 'ویدیوی هوش مصنوعی', 'سینمایی']
  },
  {
    id: 'cyber-spiritual-guardian',
    title: 'نگهبان سایبر-اسپریچوال دروازه ناخودآگاه',
    shortIdea: 'طراحی پرتره کلوزآپ از یک شخصیت اسطوره‌ای-آینده‌نگرانه با چشمان بیولومینسانس، رگه‌های نوری ظریف کوانتومی روی پوست و سربند منبت‌کاری شده تیتانیوم و طلا.',
    category: 'character',
    categoryLabel: 'طراحی کاراکتر',
    model: 'Midjourney v6.1 / Stable Diffusion XL',
    images: [
      {
        id: 'csg-output',
        url: cheshm1,
        title: 'تصویر خروجی نهایی',
        type: 'output',
        caption: 'کلوزآپ استودیویی با بافت طبیعی منافذ پوستی و درخشش ارغوانی مردمک چشم'
      },
      {
        id: 'csg-ref',
        url: mat1,
        title: 'تصویر مرجع (Reference)',
        type: 'reference',
        caption: 'مطالعه کانتور و پرتره متمرکز با نورپردازی متقارن لبه‌ای'
      },
      {
        id: 'csg-step1',
        url: cheshm2,
        title: 'مرحله ۱: تنظیمات چشم و درخشش',
        type: 'step',
        caption: 'تثبیت خطوط نوری و زاویه بازتابش در بافت عنبیه'
      }
    ],
    prompt: `Intimate close-up studio portrait of an enigmatic cyber-spiritual dream guardian, porcelain serene face with delicate glowing micro-circuitry tracing subtle mystical patterns along the temple and cheekbones, mesmerizing dual-tone bioluminescent cyan and amethyst eyes, wearing an ornate polished titanium and gold filigree ceremonial headpiece, soft cinematic rim lighting accentuating contours, extremely shallow depth of field, Hasselblad H6D-100c medium format photography, clean minimalist dark violet backdrop, 8k resolution, authentic skin pores, lifelike peach fuzz and natural microscopic skin imperfections --ar 4:5 --stylize 280`,
    negativePrompt: `plastic doll skin, uncanny valley, over-smoothed airbrushed texture, cross-eyed, deformed iris, extra fingers, cartoonish render`,
    tips: [
      'برای جلوگیری از بافت مصنوعی و پلاستیکی پوست در میدجرنی، قرار دادن عبارات «authentic skin pores» و «natural microscopic skin imperfections» ضروری است.',
      'نسبت تصویر --ar 4:5 بهینه‌ترین ابعاد برای به اشتراک‌گذاری در اینستاگرام و کاور مقالات موبایلی است.',
      'نام دوربین «Hasselblad H6D-100c» عمق میدان کم و شارپنس بی‌نظیری در ناحیه چشم‌ها ایجاد می‌کند.'
    ],
    parameters: [
      { label: 'نسبت تصویر', value: '--ar 4:5 (Portrait)' },
      { label: 'دوربین و لنز', value: 'Hasselblad H6D-100c (100mm f/2.2)' },
      { label: 'شاخص Stylize', value: '--stylize 280' },
      { label: 'استایل نور', value: 'Rim Light & Soft Fill' }
    ],
    dateAdded: '۱۴۰۳/۰۹/۱۴',
    tags: ['پرتره هوش مصنوعی', 'طراحی کاراکتر', 'چشم بیولومینسانس', 'Midjourney']
  },
  {
    id: 'bioluminescent-ocean-gate',
    title: 'دروازه کهن‌الگوها در اقیانوس شب‌تاب',
    shortIdea: 'یک درگاه سنگی یکپارچه و کهن با خطوط هیروگلیف نوری طلایی در میان آب‌های آرام و درخشان بیولومینسانس فیروزه‌ای در نیمه‌شب.',
    category: 'cinematic',
    categoryLabel: 'سبک سینمایی',
    model: 'Midjourney v6.1 / Flux.1 Schnell',
    images: [
      {
        id: 'bog-output',
        url: img01,
        title: 'تصویر خروجی نهایی',
        type: 'output',
        caption: 'ترکیب اعجاب‌انگیز خطوط فیروزه‌ای آب شب‌تاب و دروازه سنگی پوشیده از خزه'
      },
      {
        id: 'bog-ref',
        url: mat2,
        title: 'تصویر مرجع (Reference)',
        type: 'reference',
        caption: 'الهام‌گیری از نمادهای باستانی سنگ‌نگاره‌های تخت جمشید و استون‌هنج'
      },
      {
        id: 'bog-step1',
        url: img02,
        title: 'مرحله ۱: شبیه‌سازی آب و امواج',
        type: 'step',
        caption: 'توسعه فرم شکست نور روی سطح اقیانوس آرام'
      },
      {
        id: 'bog-step2',
        url: img03,
        title: 'مرحله ۲: پرداخت جزئیات دروازه',
        type: 'step',
        caption: 'افزایش کنتراست خطوط درخشان حکاکی‌های باستانی روی سنگ'
      }
    ],
    prompt: `A monumental ancient megalithic stone gateway rising majestically from tranquil bioluminescent cyan ocean waters at midnight, carved with pulsating golden celestial archetypal runes, a tiny lone silhouette standing on a low stone ledge gazing into the swirling starlight vortex inside the archway, ethereal ocean mist illuminated by glowing phytoplankton, IMAX 70mm cinematic wide shot, ultra-realistic water ripple reflections, moody atmospheric volumetric light rays, fine stone moss textures, dark deep navy night sky filled with the Andromeda galaxy --ar 16:9 --v 6.1 --chaos 10`,
    negativePrompt: `daylight, cartoon, 3d render plastic, low resolution, watermark, deformed shoreline`,
    tips: [
      'المان «tiny lone silhouette» حس مقیاس حماسی (Sense of Scale) شگفت‌انگیزی به دروازه می‌بخشد.',
      'دستور «chaos 10» به موتور کمک می‌کند نشانه‌ها و حکاکی‌های روی سنگ را با تنوع نقوش بیشتری تولید کند.',
      'کلمه کلیدی «bioluminescent cyan ocean waters» ترکیب رنگی فیروزه‌ای جادویی ایجاد می‌کند که با طلایی دروازه تضاد خیره‌کننده‌ای دارد.'
    ],
    parameters: [
      { label: 'نسبت تصویر', value: '--ar 16:9' },
      { label: 'پارامتر کائوس', value: '--chaos 10' },
      { label: 'دوربین مجازی', value: 'IMAX 70mm Panoramic' },
      { label: 'مدل', value: 'Midjourney v6.1' }
    ],
    dateAdded: '۱۴۰۳/۰۸/۲۸',
    tags: ['سینمایی', 'اقیانوس بیولومینسانس', 'کهن‌الگو', 'مگالیتیک']
  },
  {
    id: 'zero-gravity-time-chamber',
    title: 'اتاق تعلیق زمانی و خواب بدون وزن',
    shortIdea: 'طراحی فضایی سورئال از کتابخانه و اتاق مطالعه‌ای با جاذبه صفر که ساعت‌های شنی، برگ‌های کاغذ کهن و قطرات معلق آب در هوا شناورند.',
    category: 'surreal',
    categoryLabel: 'سورئال و انتزاعی',
    model: 'Flux.1 Dev / Midjourney v6.1',
    images: [
      {
        id: 'zgt-output',
        url: roman3,
        title: 'تصویر خروجی نهایی',
        type: 'output',
        caption: 'ترکیب خارق‌العاده از زاویه معلق دوربین و پرواز اشیای زمان در فضا'
      },
      {
        id: 'zgt-ref',
        url: farasou4,
        title: 'تصویر مرجع (Reference)',
        type: 'reference',
        caption: 'کانسپت اولیه تعلیق فیزیک و اعوجاج پرسپکتیو اینسپشن'
      },
      {
        id: 'zgt-step1',
        url: mat3,
        title: 'مرحله ۱: استقرار پرسپکتیو اتاق',
        type: 'step',
        caption: 'چیدمان هندسی پنجره‌های بزرگ بارانی و قفسه‌های چوبی'
      }
    ],
    prompt: `Surreal dreamscape interior of a zero-gravity Victorian celestial observatory library, hundreds of antique parchment pages and cracked crystal hourglasses floating weightlessly in mid-air with golden sand frozen in stasis, spheres of shimmering suspended water droplets reflecting giant floor-to-ceiling arched windows overlooking an infinite starfield nebula, a single classical antique velvet armchair drifting tilted, soft sunbeams piercing dust motes, magical realism, cinematic lighting, ultra-high fidelity, photorealistic textures of polished mahogany wood and aged paper, 8k resolution --ar 16:9 --v 6.1 --stylize 400`,
    negativePrompt: `cluttered messy artifacts, modern plastic items, digital artifacts, bad composition, pixelated, washed out`,
    tips: [
      'سبک «magical realism» تعادل فوق‌العاده‌ای میان فیزیک واقع‌گرایانه اشیا و فضاسازی رویایی به تصویر می‌دهد.',
      'افزودن جزئیاتی مثل «golden sand frozen in stasis» و «spheres of shimmering suspended water droplets» دقت ریزبافت‌های رندر را چند برابر می‌کند.',
      'برای فضاسازی گرم‌تر می‌توانید واژه «warm tungsten candlelight» را جایگزین «soft sunbeams» کنید.'
    ],
    parameters: [
      { label: 'نسبت تصویر', value: '--ar 16:9' },
      { label: 'سبک بصری', value: 'Magical Realism / Surreal' },
      { label: 'شاخص Stylize', value: '--stylize 400' },
      { label: 'تکسچر و رندر', value: 'Photorealistic Mahogany & Glass' }
    ],
    dateAdded: '۱۴۰۳/۰۸/۱۰',
    tags: ['جاذبه صفر', 'سورئال', 'اینسپشن', 'رویا', 'Flux.1']
  }
];
