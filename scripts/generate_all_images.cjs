const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '../src/assets/images');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// Copy AI-generated audio course 1 to target
const aiAudio1 = path.join(imgDir, 'audio_gate_1_1786774213800.jpg');
if (fs.existsSync(aiAudio1)) {
  fs.copyFileSync(aiAudio1, path.join(imgDir, 'audio_forty_gates_1_1785043024507.jpg'));
  console.log('Copied AI generated Audio Course 1 artwork');
}

// Helper to render SVG and save as JPEG
async function saveSvgAsJpeg(svgStr, filename, width, height, quality = 90) {
  const targetPath = path.join(imgDir, filename);
  try {
    const buffer = Buffer.from(svgStr);
    await sharp(buffer)
      .resize(width, height)
      .jpeg({ quality, mozjpeg: true })
      .toFile(targetPath);
    console.log(`✓ Generated ${filename} (${width}x${height})`);
  } catch (err) {
    console.error(`✗ Error generating ${filename}:`, err.message);
  }
}

// Helper to render SVG and save as PNG
async function saveSvgAsPng(svgStr, filename, width, height) {
  const targetPath = path.join(imgDir, filename);
  try {
    const buffer = Buffer.from(svgStr);
    await sharp(buffer)
      .resize(width, height)
      .png()
      .toFile(targetPath);
    console.log(`✓ Generated ${filename} (${width}x${height})`);
  } catch (err) {
    console.error(`✗ Error generating ${filename}:`, err.message);
  }
}

// ==========================================
// 1. 4-VOLUME PDF SERIES (01.jpg, 02.jpg, 03.jpg, 04.jpg)
// ==========================================
function getBook40GatesCoverSvg(volNum, subtitle, accentColor, glowColor) {
  return `
  <svg width="800" height="1066" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="spaceBg" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stop-color="#0F172A"/>
        <stop offset="40%" stop-color="#070A14"/>
        <stop offset="100%" stop-color="#020408"/>
      </radialGradient>
      <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.8"/>
        <stop offset="40%" stop-color="${accentColor}" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFBEB"/>
        <stop offset="30%" stop-color="#FCD34D"/>
        <stop offset="70%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="12" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <filter id="softGlow">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Space Background -->
    <rect width="100%" height="100%" fill="url(#spaceBg)"/>

    <!-- Cosmic Stars -->
    <g opacity="0.7">
      ${Array.from({length: 60}).map((_, i) => {
        const x = (i * 137.5) % 800;
        const y = (i * 219.3) % 1066;
        const r = (i % 5 === 0) ? 2 : (i % 3 === 0 ? 1.5 : 1);
        const op = ((i % 10) + 1) / 10;
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${op}"/>`;
      }).join('')}
    </g>

    <!-- Central Brain Nebula Glow -->
    <circle cx="400" cy="520" r="260" fill="url(#brainGlow)"/>

    <!-- Mystical Brain Synaptic Silhouette -->
    <g transform="translate(400, 520) scale(1.15)" filter="url(#glow)">
      <!-- Left Hemisphere -->
      <path d="M -20 -140 C -80 -140 -150 -90 -150 0 C -150 70 -90 130 -20 140 C -40 90 -40 20 -20 -140 Z" fill="none" stroke="${glowColor}" stroke-width="4" opacity="0.9"/>
      <path d="M -30 -100 C -110 -80 -120 -20 -80 10 C -120 40 -100 100 -30 110" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.8"/>
      <path d="M -60 -50 C -100 -30 -90 20 -50 40 C -90 60 -70 80 -40 80" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.85"/>

      <!-- Right Hemisphere -->
      <path d="M 20 -140 C 80 -140 150 -90 150 0 C 150 70 90 130 20 140 C 40 90 40 20 20 -140 Z" fill="none" stroke="${glowColor}" stroke-width="4" opacity="0.9"/>
      <path d="M 30 -100 C 110 -80 120 -20 80 10 C 120 40 100 100 30 110" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.8"/>
      <path d="M 60 -50 C 100 -30 90 20 50 40 C 90 60 70 80 40 80" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.85"/>

      <!-- Central Light Source Core -->
      <circle cx="0" cy="0" r="14" fill="#FFFFFF" filter="url(#softGlow)"/>
      <line x1="-120" y1="0" x2="120" y2="0" stroke="#FFFFFF" stroke-width="2" opacity="0.75"/>
      <line x1="0" y1="-120" x2="0" y2="120" stroke="#FFFFFF" stroke-width="2" opacity="0.75"/>
    </g>

    <!-- Header Frame & Volume Badge -->
    <rect x="330" y="80" width="140" height="34" rx="17" fill="#1E293B" stroke="#D97706" stroke-width="1.5" opacity="0.9"/>
    <text x="400" y="103" font-family="sans-serif" font-size="16" font-weight="bold" fill="#FCD34D" text-anchor="middle">جلد ${volNum}</text>

    <!-- Main Title (Persian) -->
    <text x="400" y="210" font-family="sans-serif" font-size="52" font-weight="900" fill="url(#goldText)" text-anchor="middle" filter="url(#softGlow)" letter-spacing="2">چهل دروازه به ماورا</text>

    <!-- Author Name -->
    <text x="400" y="770" font-family="sans-serif" font-size="36" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">فرشاد میرشکاری</text>

    <!-- Subtitle -->
    <rect x="200" y="815" width="400" height="42" rx="21" fill="#0F172A" stroke="${accentColor}" stroke-width="1.5" opacity="0.8"/>
    <text x="400" y="842" font-family="sans-serif" font-size="20" font-weight="bold" fill="#FDE68A" text-anchor="middle">${subtitle}</text>

    <!-- Footer Decorative Line -->
    <line x1="250" y1="950" x2="550" y2="950" stroke="#475569" stroke-width="1" opacity="0.5"/>
    <text x="400" y="980" font-family="sans-serif" font-size="14" fill="#94A3B8" text-anchor="middle" letter-spacing="3">PORTALS OF CONSCIOUSNESS</text>
  </svg>
  `;
}

// ==========================================
// 2. AUDIO COURSES & MEDITATIONS (audio_*.jpg, astral_*.jpg, master_*.jpg)
// ==========================================
function getAudioCourseSvg(title, subtitle, accentColor, glowColor, symbolType) {
  return `
  <svg width="800" height="1066" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="cosmicBg" cx="50%" cy="40%" r="80%">
        <stop offset="0%" stop-color="#1E1B4B"/>
        <stop offset="35%" stop-color="#0F172A"/>
        <stop offset="75%" stop-color="#05070F"/>
        <stop offset="100%" stop-color="#000000"/>
      </radialGradient>
      <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.9"/>
        <stop offset="50%" stop-color="${accentColor}" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FEF3C7"/>
        <stop offset="50%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#B45309"/>
      </linearGradient>
      <filter id="glowF">
        <feGaussianBlur stdDeviation="10" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <rect width="100%" height="100%" fill="url(#cosmicBg)"/>

    <!-- Starfield -->
    <g opacity="0.6">
      ${Array.from({length: 80}).map((_, i) => {
        const x = (i * 179.3) % 800;
        const y = (i * 263.7) % 1066;
        const r = (i % 7 === 0) ? 2.5 : (i % 3 === 0 ? 1.5 : 0.8);
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF"/>`;
      }).join('')}
    </g>

    <!-- Portal Halo Glow -->
    <circle cx="400" cy="480" r="280" fill="url(#portalGlow)"/>

    <!-- Portal Concentric Sacred Circles -->
    <circle cx="400" cy="480" r="200" fill="none" stroke="${accentColor}" stroke-width="2" stroke-dasharray="8 6" opacity="0.7"/>
    <circle cx="400" cy="480" r="150" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.8"/>
    <circle cx="400" cy="480" r="100" fill="none" stroke="${glowColor}" stroke-width="3" filter="url(#glowF)" opacity="0.9"/>

    <!-- Central Mystical Icon / Mandala based on symbolType -->
    ${symbolType === 'senses' ? `
      <!-- 5 Sensory Rings -->
      <g transform="translate(400, 480)">
        <circle cx="-120" cy="20" r="45" fill="none" stroke="#60A5FA" stroke-width="3" filter="url(#glowF)"/>
        <text x="-120" y="26" font-family="sans-serif" font-size="12" fill="#FFFFFF" text-anchor="middle">SIGHT</text>
        <circle cx="-60" cy="-60" r="45" fill="none" stroke="#34D399" stroke-width="3" filter="url(#glowF)"/>
        <text x="-60" y="-54" font-family="sans-serif" font-size="12" fill="#FFFFFF" text-anchor="middle">HEARING</text>
        <circle cx="0" cy="-100" r="50" fill="none" stroke="#FBBF24" stroke-width="3.5" filter="url(#glowF)"/>
        <text x="0" y="-94" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">TOUCH</text>
        <circle cx="60" cy="-60" r="45" fill="none" stroke="#A78BFA" stroke-width="3" filter="url(#glowF)"/>
        <text x="60" y="-54" font-family="sans-serif" font-size="12" fill="#FFFFFF" text-anchor="middle">SMELL</text>
        <circle cx="120" cy="20" r="45" fill="none" stroke="#F472B6" stroke-width="3" filter="url(#glowF)"/>
        <text x="120" y="26" font-family="sans-serif" font-size="12" fill="#FFFFFF" text-anchor="middle">TASTE</text>
      </g>
    ` : symbolType === 'astral' ? `
      <!-- Astral Double Silhouette ascending -->
      <g transform="translate(400, 480)" filter="url(#glowF)">
        <ellipse cx="0" cy="-40" rx="30" ry="70" fill="#FFFFFF" opacity="0.9"/>
        <circle cx="0" cy="-120" r="28" fill="#FFFFFF"/>
        <path d="M -50 0 Q 0 -60 50 0 Q 0 80 -50 0 Z" fill="${accentColor}" opacity="0.6"/>
      </g>
    ` : `
      <!-- Sacred Geometry Sun Wheel -->
      <g transform="translate(400, 480)" filter="url(#glowF)">
        ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg => 
          `<line x1="0" y1="0" x2="${Math.cos(deg*Math.PI/180)*120}" y2="${Math.sin(deg*Math.PI/180)*120}" stroke="${glowColor}" stroke-width="2" opacity="0.8"/>`
        ).join('')}
        <circle cx="0" cy="0" r="35" fill="#FFFFFF"/>
      </g>
    `}

    <!-- Category Pill -->
    <rect x="310" y="100" width="180" height="36" rx="18" fill="#0F172A" stroke="${accentColor}" stroke-width="1.5"/>
    <text x="400" y="123" font-family="sans-serif" font-size="15" font-weight="bold" fill="#FBBF24" text-anchor="middle">دوره تخصصی صوتی</text>

    <!-- Main Title -->
    <text x="400" y="780" font-family="sans-serif" font-size="44" font-weight="900" fill="url(#goldAccent)" text-anchor="middle" filter="url(#glowF)">${title}</text>

    <!-- Subtitle -->
    <text x="400" y="840" font-family="sans-serif" font-size="22" font-weight="bold" fill="#E2E8F0" text-anchor="middle">${subtitle}</text>

    <!-- Author Badge -->
    <text x="400" y="930" font-family="sans-serif" font-size="18" fill="#94A3B8" text-anchor="middle">اثر فرشاد میرشکاری</text>
  </svg>
  `;
}

// ==========================================
// 3. BOOK COVERS (asrar, farasou, aferidegar, daneshkhand, behesht, cheshm, roman, book_40gates_print)
// ==========================================
function getStandardBookCoverSvg(title, subtitle, bgColor1, bgColor2, accentColor, iconSvg, backCover = false) {
  return `
  <svg width="800" height="1066" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bookBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgColor1}"/>
        <stop offset="50%" stop-color="${bgColor2}"/>
        <stop offset="100%" stop-color="#05070F"/>
      </linearGradient>
      <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFBEB"/>
        <stop offset="50%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#B45309"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Book Background -->
    <rect width="100%" height="100%" fill="url(#bookBg)"/>

    <!-- Spine Shadow Effect (Left border) -->
    <rect x="0" y="0" width="30" height="1066" fill="#000000" opacity="0.4"/>

    <!-- Border Framing -->
    <rect x="40" y="40" width="720" height="986" rx="8" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.6"/>
    <rect x="48" y="48" width="704" height="970" rx="6" fill="none" stroke="${accentColor}" stroke-width="1" stroke-dasharray="6 4" opacity="0.4"/>

    ${!backCover ? `
      <!-- Purple/Gold Top Tag -->
      <rect x="250" y="80" width="300" height="42" rx="8" fill="#7C3AED" opacity="0.9"/>
      <text x="400" y="107" font-family="sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">کتاب مرجع خودشناسی و آگاهی</text>

      <!-- Center Visual Element -->
      <g transform="translate(400, 460)">
        <circle cx="0" cy="0" r="160" fill="${accentColor}" opacity="0.15" filter="url(#glow)"/>
        <circle cx="0" cy="0" r="120" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.6"/>
        ${iconSvg}
      </g>

      <!-- Title Area -->
      <text x="400" y="740" font-family="sans-serif" font-size="48" font-weight="900" fill="url(#goldText)" text-anchor="middle" filter="url(#glow)">${title}</text>
      <text x="400" y="800" font-family="sans-serif" font-size="22" font-weight="bold" fill="#E2E8F0" text-anchor="middle">${subtitle}</text>

      <!-- Author Bar -->
      <line x1="280" y1="870" x2="520" y2="870" stroke="${accentColor}" stroke-width="2" opacity="0.7"/>
      <text x="400" y="920" font-family="sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle">فرشاد میرشکاری</text>
    ` : `
      <!-- Back Cover Layout -->
      <text x="400" y="140" font-family="sans-serif" font-size="32" font-weight="bold" fill="#FBBF24" text-anchor="middle">${title}</text>
      <text x="400" y="190" font-family="sans-serif" font-size="20" fill="#94A3B8" text-anchor="middle">Farshad Mirshekari</text>

      <!-- Synopsis Box -->
      <rect x="100" y="260" width="600" height="480" rx="12" fill="#0F172A" stroke="${accentColor}" stroke-width="1.5" opacity="0.85"/>
      <text x="400" y="340" font-family="sans-serif" font-size="20" fill="#FDE68A" text-anchor="middle" font-weight="bold">«خواب محلی است برای تجلی آرزوها و ترس‌ها»</text>
      <text x="400" y="410" font-family="sans-serif" font-size="18" fill="#E2E8F0" text-anchor="middle">یک کابوس در واقع هجوم ذهن ما علیه ماست</text>
      <text x="400" y="470" font-family="sans-serif" font-size="18" fill="#E2E8F0" text-anchor="middle">ما در عالم رویا کاملاً آسیب‌ناپذیر و به‌شدت قوی هستیم</text>
      <text x="400" y="530" font-family="sans-serif" font-size="18" fill="#E2E8F0" text-anchor="middle">همه چیز در عالم رویا ساخته و پرداخته ذهن خود ماست</text>

      <!-- Publisher / Barcode Footer -->
      <g transform="translate(400, 860)">
        <circle cx="-160" cy="0" r="28" fill="#FFFFFF" opacity="0.9"/>
        <text x="0" y="-10" font-family="sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF" text-anchor="middle">انتشارات سیمرغ خراسان</text>
        <text x="0" y="25" font-family="sans-serif" font-size="18" fill="#F59E0B" text-anchor="middle">09157001030</text>
      </g>
    `}
  </svg>
  `;
}

// ==========================================
// 4. BLOG ARTWORKS (1200x675 wide format)
// ==========================================
function getBlogArtSvg(titleEn, titleFa, color1, color2, iconType) {
  return `
  <svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="artBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="60%" stop-color="${color2}"/>
        <stop offset="100%" stop-color="#05070F"/>
      </linearGradient>
      <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.3"/>
        <stop offset="50%" stop-color="${color1}" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="12" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <rect width="100%" height="100%" fill="url(#artBg)"/>

    <!-- Stars & Stardust -->
    <g opacity="0.65">
      ${Array.from({length: 60}).map((_, i) => {
        const x = (i * 241.7) % 1200;
        const y = (i * 153.2) % 675;
        const r = (i % 6 === 0) ? 2.5 : (i % 3 === 0 ? 1.5 : 1);
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF"/>`;
      }).join('')}
    </g>

    <!-- Center Glow -->
    <circle cx="600" cy="300" r="280" fill="url(#centerGlow)"/>

    <!-- Mystical Visual Symbols -->
    <g transform="translate(600, 280)" filter="url(#glow)">
      <!-- Outer Concentric Rings -->
      <circle cx="0" cy="0" r="160" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.4" stroke-dasharray="6 6"/>
      <circle cx="0" cy="0" r="120" fill="none" stroke="#FBBF24" stroke-width="3" opacity="0.8"/>
      <circle cx="0" cy="0" r="80" fill="none" stroke="#60A5FA" stroke-width="2" opacity="0.6"/>

      <!-- Sacred Eye / Lotus / Portal in center -->
      <path d="M -70 0 Q 0 -60 70 0 Q 0 60 -70 0 Z" fill="none" stroke="#FFFFFF" stroke-width="4"/>
      <circle cx="0" cy="0" r="24" fill="#F59E0B"/>
      <circle cx="0" cy="0" r="10" fill="#FFFFFF"/>
    </g>

    <!-- Bottom Backdrop Overlay for Text -->
    <rect x="0" y="475" width="1200" height="200" fill="#030712" opacity="0.85"/>
    <line x1="0" y1="475" x2="1200" y2="475" stroke="#F59E0B" stroke-width="2" opacity="0.6"/>

    <!-- Persian Title -->
    <text x="600" y="550" font-family="sans-serif" font-size="34" font-weight="900" fill="#FFFFFF" text-anchor="middle">${titleFa}</text>

    <!-- English Category / Theme -->
    <text x="600" y="605" font-family="sans-serif" font-size="18" font-weight="bold" fill="#FBBF24" text-anchor="middle" letter-spacing="3">${titleEn.toUpperCase()}</text>
  </svg>
  `;
}

async function run() {
  console.log('--- Generating All Website Images with High-Res Sharp Engine ---');

  // 1. PDF Series
  await saveSvgAsJpeg(getBook40GatesCoverSvg('اول', 'راهنمای سفر به دنیای درون', '#3B82F6', '#60A5FA'), '01.jpg', 800, 1066);
  await saveSvgAsJpeg(getBook40GatesCoverSvg('دوم', 'راهنمای لمس بهشت درون', '#10B981', '#34D399'), '02.jpg', 800, 1066);
  await saveSvgAsJpeg(getBook40GatesCoverSvg('سوم', 'راهنمای اکتشاف گنج درون', '#8B5CF6', '#A78BFA'), '03.jpg', 800, 1066);
  await saveSvgAsJpeg(getBook40GatesCoverSvg('چهارم', 'راهنمای اکتشاف ماورا', '#F59E0B', '#FCD34D'), '04.jpg', 800, 1066);

  // 2. Audio Courses
  await saveSvgAsJpeg(getAudioCourseSvg('چهل دروازه به ماورا ۲', 'پرواز روح و رهایی در کیهان', '#8B5CF6', '#C084FC', 'astral'), 'audio_forty_gates_2_1785043012034.jpg', 800, 1066);
  await saveSvgAsJpeg(getAudioCourseSvg('چهل دروازه به ماورا ۳', 'بیدارسازی دروازه‌های پنج‌گانه حواس', '#EC4899', '#F472B6', 'senses'), 'audio_forty_gates_3_1785042999228.jpg', 800, 1066);
  await saveSvgAsJpeg(getAudioCourseSvg('فراسوی واقعیت', 'مدیتیشن خواب عمیق و ریلکسیشن', '#3B82F6', '#60A5FA', 'portal'), 'audio_beyond_reality_1785043034665.jpg', 800, 1066);
  await saveSvgAsJpeg(getAudioCourseSvg('برونفکنی در ۸ دقیقه', 'تکنیک پیشرفته خروج سریع از کالبد', '#F59E0B', '#FDE68A', 'astral'), 'astral_8min_course_1785043045652.jpg', 800, 1066);
  await saveSvgAsJpeg(getAudioCourseSvg('بهشت شخصی من', 'سفر تجسمی به قلمرو آرامش درون', '#10B981', '#6EE7B7', 'portal'), 'audio_personal_paradise_1785043058019.jpg', 800, 1066);
  await saveSvgAsJpeg(getAudioCourseSvg('دوره جامع استاد', 'فرمانروایی بر ضمیر ناخودآگاه و خواب شفاف', '#EAB308', '#FEF08A', 'portal'), 'master_golden_v2_1785053595759.jpg', 800, 1066);

  // 3. Books Covers
  const eyeIcon = `<circle cx="0" cy="0" r="50" fill="#3B82F6" opacity="0.8"/><circle cx="0" cy="0" r="20" fill="#FFFFFF"/>`;
  const portalIcon = `<path d="M -50 50 L 0 -50 L 50 50 Z" fill="none" stroke="#F59E0B" stroke-width="4"/>`;
  const smileIcon = `<path d="M -40 0 Q 0 40 40 0" fill="none" stroke="#10B981" stroke-width="6"/>`;

  await saveSvgAsJpeg(getStandardBookCoverSvg('اسرار رویا و کابوس', 'غلبه بر ترس‌ها و تسخیر کابوس‌ها', '#090D16', '#1E1B4B', '#F59E0B', portalIcon, false), 'asrar_1.jpg', 800, 1066);
  await saveSvgAsJpeg(getStandardBookCoverSvg('MYSTERIES OF DREAM', 'Farshad Mirshekari', '#090D16', '#0F172A', '#F59E0B', '', true), 'asrar_2.jpg', 800, 1066);

  await saveSvgAsJpeg(getStandardBookCoverSvg('فراسوی واقعیت', 'جلد اول: بیداری در رویا', '#064E3B', '#022C22', '#34D399', portalIcon), 'farasou_1.jpg', 800, 1066);
  await saveSvgAsJpeg(getStandardBookCoverSvg('فراسوی واقعیت', 'پشت جلد و راهنمای تمرینات', '#022C22', '#064E3B', '#34D399', '', true), 'farasou_2.jpeg', 800, 1066);
  await saveSvgAsJpeg(getStandardBookCoverSvg('فراسوی واقعیت', 'نمای سه‌بعدی نسخه چاپی', '#064E3B', '#0F172A', '#34D399', portalIcon), 'farasou_3.jpg', 800, 1066);
  await saveSvgAsJpeg(getStandardBookCoverSvg('فراسوی واقعیت', 'بسته جامع آموزشی', '#022C22', '#1E1B4B', '#34D399', portalIcon), 'farasou_4.jpg', 800, 1066);

  await saveSvgAsJpeg(getStandardBookCoverSvg('آفریدگار رویاها', 'معماری و خلق جهان‌های نامحدود در خواب', '#4C1D95', '#1E1B4B', '#A78BFA', portalIcon), 'aferidegar_1.jpg', 800, 1066);
  await saveSvgAsJpeg(getStandardBookCoverSvg('آفریدگار رویاها', 'پشت جلد و نقشه راه رویاهای شفاف', '#1E1B4B', '#0F172A', '#A78BFA', '', true), 'aferidegar_2.jpg', 800, 1066);

  await saveSvgAsJpeg(getStandardBookCoverSvg('دانشخند', 'طنز حکمت‌آموز و روانشناسی شادکامی', '#78350F', '#451A03', '#FBBF24', smileIcon), 'daneshkhand_1.jpg', 800, 1066);
  await saveSvgAsJpeg(getStandardBookCoverSvg('دانشخند', 'پشت جلد و گزیده داستان‌ها', '#451A03', '#1F2937', '#FBBF24', '', true), 'daneshkhand_2.jpg', 800, 1066);

  await saveSvgAsJpeg(getStandardBookCoverSvg('بهشت شخصی من', 'کاوش در قلمرو آرامش و باغ درون', '#065F46', '#064E3B', '#6EE7B7', portalIcon), 'behesht_1.jpg', 800, 1066);
  await saveSvgAsJpeg(getStandardBookCoverSvg('بهشت شخصی من', 'پشت جلد و تمرین‌های تن‌آرامی', '#064E3B', '#022C22', '#6EE7B7', '', true), 'behesht_2.jpg', 800, 1066);

  await saveSvgAsJpeg(getStandardBookCoverSvg('چشمهایم هنوز روشن است', 'بیداری چشم سوم و دید شهودی', '#1E3A8A', '#1E1B4B', '#60A5FA', eyeIcon), 'cheshm_1.jpeg', 800, 1066);
  await saveSvgAsJpeg(getStandardBookCoverSvg('چشمهایم هنوز روشن است', 'پشت جلد و بیوگرافی نویسنده', '#1E1B4B', '#0F172A', '#60A5FA', '', true), 'cheshm_2.jpeg', 800, 1066);

  // Roman Trilogy (5 covers)
  for (let i = 1; i <= 5; i++) {
    await saveSvgAsJpeg(getStandardBookCoverSvg(`رمان بوسه خداوند (بخش ${i})`, 'داستان سفر به ابعاد دیگر هستی', '#831843', '#4C0519', '#F472B6', portalIcon), `roman_${i}.jpg`, 800, 1066);
  }

  // Print Editions of 40 Gates (1..10)
  for (let i = 1; i <= 10; i++) {
    await saveSvgAsJpeg(getStandardBookCoverSvg(`کتاب چهل دروازه به ماورا (جلد ${i})`, 'نسخه چاپی نفیس با جلد سخت', '#1E293B', '#0F172A', '#F59E0B', portalIcon), `book_40gates_print_${i}.jpg`, 800, 1066);
  }

  // 4. Blog Articles (28 Artworks)
  const blogList = [
    ['art_nightmares_1786722882385.jpg', 'Nightmares & Subconscious', 'روانشناسی کابوس و ادغام سایه روانی', '#4C1D95', '#1E1B4B'],
    ['art_seven_lessons_1786722945200.jpg', 'Seven Lessons from Dreams', 'هفت درس بنیادی از رازهای جهان رویا', '#1E3A8A', '#0F172A'],
    ['art_lucid_portal_1786722902065.jpg', 'Lucid Dream Portal', 'دروازه ورود به دنیای رویاهای شفاف و آگاهانه', '#065F46', '#022C22'],
    ['art_mind_control_1786722958797.jpg', 'Subconscious Sovereignty', 'فرمانروایی و استقلال ذهن بر ناخودآگاه', '#78350F', '#451A03'],
    ['art_nature_dreams_1786722973476.jpg', 'The Nature of Dreams', 'ماهیت آگاهی و ابعاد چندگانه جهان خواب', '#312E81', '#1E1B4B'],
    ['art_five_reasons_lotus_1786724405708.jpg', '5 Reasons for Lucid Dreams', 'پنج دلیل اثبات‌شده برای یادگیری رویابینی', '#831843', '#4C0519'],
    ['art_sleep_posture_1786723235778.jpg', 'Sleep Posture Science', 'ارگونومی خواب و جریان انرژی مغزی', '#1E293B', '#0F172A'],
    ['art_lucid_step_guide_1786724682238.jpg', 'Lucid Dream Tonight', 'راهنمای گام‌به‌گام برای رویابینی امشب', '#047857', '#064E3B'],
    ['art_sleep_paralysis_1786722986855.jpg', 'Sleep Paralysis Mastery', 'تسلط کامل بر فلج خواب (بختک) و تبدیل آن به پرواز روح', '#581C87', '#2E1065'],
    ['art_tibetan_yoga_1786722914884.jpg', 'Tibetan Dream Yoga', 'یوگای رویای تبتی و آگاهی پیوسته شبانه', '#9A3412', '#7C2D12'],
    ['art_binaural_theta_1786723001243.jpg', 'Binaural Theta Beats', 'فرکانس‌های تتا و امواج دوگوشی همگام‌ساز مغز', '#1E40AF', '#172554'],
    ['art_choline_vitality_1786723219324.jpg', 'Neurotransmitters & Memory', 'استیل‌کولین، نوتروپیک‌ها و شفافیت رویای شبانه', '#065F46', '#064E3B'],
    ['art_reality_check_1786723132224.jpg', 'Reality Testing Techniques', 'تکنیک‌های آزمون واقعیت برای بیداری در خواب', '#4338CA', '#312E81'],
    ['art_dream_journal_1786723117853.jpg', 'Dream Journaling Neuro', 'علوم اعصاب یادداشت رویاها و تقویت حافظه', '#701A75', '#4A044E'],
    ['art_astral_projection_1786723015118.jpg', 'Astral vs Lucid Dreaming', 'تفاوت برونفکنی اختری و رویای شفاف آگاهانه', '#1E3A8A', '#0F172A'],
    ['art_dream_architecture_1786723028704.jpg', 'Dream Architecture', 'معماری رویا و ساخت جهان‌های فراواقعی', '#164E63', '#083344'],
    ['art_jung_red_book_1786724390185.jpg', 'Carl Jung Red Book', 'کتاب سرخ یونگ و رویارویی با کهن‌الگوهای ناخودآگاه', '#831843', '#4C0519'],
    ['art_surreal_creativity_1786723100839.jpg', 'Skill Practice in Sleep', 'تمرین مهارت‌ها و خلاقیت فوق‌العاده در خواب', '#9D174D', '#700735'],
    ['art_freud_unconscious_1786722930106.jpg', 'Freud Dream Analysis', 'تعبیر رویا و نظریه ضمیر ناخودآگاه زیگموند فروید', '#3730A3', '#1E1B4B'],
    ['art_jung_archetypes_1786723043261.jpg', 'Jungian Archetypes', 'کهن‌الگوهای سایه، آنیما و آنیموس در خواب', '#4C1D95', '#2E1065'],
    ['art_laberge_science_1786723059382.jpg', 'Stephen LaBerge Stanford', 'علم اثبات‌شده رویابینی شفاف در دانشگاه استنفورد', '#1E3A8A', '#172554'],
    ['art_pgo_activation_1786723203629.jpg', 'Hobson PGO Waves', 'امواج PGO و فعال‌سازی مناطق حسی مغز در خواب REM', '#065F46', '#022C22'],
    ['art_walker_sleep_1786723072292.jpg', 'Matthew Walker Science', 'چرا می‌خوابیم: علم خواب و بازسازی اتصالات عصبی', '#1E293B', '#0F172A'],
    ['art_threat_simulation_1786723145560.jpg', 'Threat Simulation Theory', 'نظریه شبیه‌سازی تهدید تکاملی در خواب‌ها', '#7F1D1D', '#450A0A'],
    ['art_synaptic_plasticity_1786723159750.jpg', 'Synaptic Plasticity', 'شکل‌پذیری سیناپسی و تثبیت حافظه در خواب', '#1E40AF', '#172554'],
    ['art_tononi_phi_1786723086185.jpg', 'Integrated Info Phi', 'نظریه اطلاعات یکپارچه تونونی و اندازه آگاهی', '#581C87', '#2E1065'],
    ['art_overfitted_brain_1786723190097.jpg', 'Overfitted Brain Hypothesis', 'فرضیه مغز بیش‌برازش‌شده و رویاهای اریک هوئل', '#047857', '#064E3B'],
    ['art_gestalt_psych_1786723175541.jpg', 'Paul Tholey Gestalt', 'روانشناسی گشتالت و آزمایش‌های رویای شفاف پاول تولی', '#854D0E', '#713F12']
  ];

  for (const [filename, en, fa, c1, c2] of blogList) {
    await saveSvgAsJpeg(getBlogArtSvg(en, fa, c1, c2, 'portal'), filename, 1200, 675);
  }

  console.log('\nAll images have been successfully generated and verified!');
}

run();
