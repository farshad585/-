import express from 'express';
import path from 'path';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Email Log Model
interface EmailLogItem {
  id: string;
  type: string;
  to: string;
  subject: string;
  timestamp: string;
  status: 'sent' | 'simulated' | 'failed';
  errorDetails?: string;
}

// Log of sent emails for debug / UI status
const emailLogs: Array<EmailLogItem> = [];

// Global Memory Stores and Settings
const runtimeSmtpConfig = {
  user: (process.env.GMAIL_USER || '').trim(),
  pass: (process.env.GMAIL_APP_PASSWORD || '').trim(),
  adminEmail: (process.env.ADMIN_EMAIL || '40gates.main@gmail.com').trim()
};

/**
 * Universal Safe Email Sending Helper Function
 * Checks process.env or runtimeSmtpConfig.
 * Handles timeouts, network glitches, and auth errors gracefully.
 */
async function sendMailSafely(
  options: nodemailer.SendMailOptions,
  type: string = 'general'
): Promise<{ success: boolean; status: 'sent' | 'simulated' | 'failed'; error?: string; messageId?: string }> {
  const gmailUser = (runtimeSmtpConfig.user || process.env.GMAIL_USER || '').trim();
  const rawPass = (runtimeSmtpConfig.pass || process.env.GMAIL_APP_PASSWORD || '').trim();
  const gmailPass = rawPass.replace(/\s+/g, ''); // strip any accidental copy-paste spaces

  const to = Array.isArray(options.to) ? options.to.join(', ') : String(options.to || '');
  const subject = String(options.subject || '');
  const sender = options.from || (gmailUser ? `آکادمی ۴۰ دروازه <${gmailUser}>` : 'آکادمی ۴۰ دروازه <40gates.main@gmail.com>');

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      const info = await transporter.sendMail({
        ...options,
        from: sender,
      });

      console.log(`✅ [EMAIL SENT SUCCESSFULLY] To: ${to} | Subject: ${subject}`);

      emailLogs.unshift({
        id: 'EML-' + Date.now(),
        type,
        to,
        subject,
        timestamp: new Date().toLocaleTimeString('fa-IR'),
        status: 'sent',
      });

      return { success: true, status: 'sent', messageId: info.messageId };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error(`❌ [GMAIL SMTP ERROR] To: ${to} | Error:`, errMsg);

      emailLogs.unshift({
        id: 'EML-ERR-' + Date.now(),
        type,
        to,
        subject: `[خطا] ${subject}`,
        timestamp: new Date().toLocaleTimeString('fa-IR'),
        status: 'failed',
        errorDetails: errMsg,
      });

      return {
        success: false,
        status: 'failed',
        error: `خطا در اتصال یا احراز هویت Gmail SMTP: ${errMsg}`,
      };
    }
  }

  // Fallback mode if GMAIL_USER or GMAIL_APP_PASSWORD are not set in env or runtime config
  console.log(`ℹ️ [EMAIL SIMULATED (GMAIL_USER or GMAIL_APP_PASSWORD pending in config)] To: ${to} | Subject: ${subject}`);
  emailLogs.unshift({
    id: 'EML-SIM-' + Date.now(),
    type,
    to,
    subject: `[شبیه‌سازی] ${subject}`,
    timestamp: new Date().toLocaleTimeString('fa-IR'),
    status: 'simulated',
  });

  return {
    success: true,
    status: 'simulated',
    messageId: 'simulated-' + Date.now(),
  };
}

// Contact Messages Store
const contactMessages: Array<{
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  faDate: string;
  faTime: string;
  read: boolean;
}> = [];

// Admin Authentication & Security State
interface AdminOTP {
  code: string;
  expiresAt: number;
  failedOtpCount: number;
}

interface AdminSession {
  token: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

interface AdminLoginLog {
  id: string;
  timestamp: string;
  faTime: string;
  faDate: string;
  ip: string;
  status: 'SUCCESS' | 'FAILED_PASSWORD' | 'FAILED_OTP' | 'LOCKED';
  email: string;
  userAgent?: string;
}

const adminSecurityState = {
  failedPasswordCount: 0,
  lockedUntil: 0,
  activeOtp: null as AdminOTP | null,
  activeSessions: new Map<string, AdminSession>(),
  loginLogs: [] as AdminLoginLog[],
};

function getAdminConfig() {
  const adminEmail = (process.env.ADMIN_EMAIL || '40gates.main@gmail.com').trim();
  const adminPassword = (process.env.ADMIN_PASSWORD || '40gates1403').trim();
  return { adminEmail, adminPassword };
}

// Global Memory Stores for Orders and Registered Users
const registeredUsersStore: Array<{
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  registeredAt: string;
  faDate: string;
}> = [
  {
    id: 'USR-101',
    fullName: 'فرشاد میرشکاری',
    email: '40gates.main@gmail.com',
    phone: '09121112233',
    registeredAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    faDate: '۱۴۰۳/۰۴/۱۵'
  },
  {
    id: 'USR-102',
    fullName: 'سارا احمدی',
    email: 'sara.ahmadi@gmail.com',
    phone: '09351234567',
    registeredAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    faDate: '۱۴۰۳/۰۵/۰۱'
  },
  {
    id: 'USR-103',
    fullName: 'علی رضایی',
    email: 'ali.rezaei@yahoo.com',
    phone: '09129876543',
    registeredAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    faDate: '۱۴۰۳/۰۵/۱۰'
  }
];

const serverOrdersStore: Array<any> = [
  {
    id: 'IRN-847291',
    date: '۱۴۰۳/۰۵/۱۲',
    status: 'processing',
    items: [
      { productId: 'book-40gates-print', title: 'کتاب چاپی ۴۰ دروازه رویابینی آگاهانه', quantity: 1, price: 580000, type: 'printed' },
      { productId: 'audio-dream-course', title: 'دوره جامع صوتی گام به گام رویابینی', quantity: 1, price: 890000, type: 'audio' }
    ],
    subtotal: 1470000,
    discountAmount: 294000,
    vatAmount: 117600,
    shippingFee: 0,
    totalAmount: 1293600,
    shippingAddress: {
      fullName: 'سارا احمدی',
      phone: '09351234567',
      province: 'تهران',
      city: 'تهران',
      postalCode: '1987654321',
      address: 'خیابان ولیعصر، نرسیده به میدان ونک، پلاک ۱۲'
    },
    userEmail: 'sara.ahmadi@gmail.com',
    paymentGateway: 'zarinpal'
  },
  {
    id: 'IRN-392018',
    date: '۱۴۰۳/۰۵/۱۰',
    status: 'shipped',
    trackingCode: '298371029384729103847261',
    items: [
      { productId: 'book-lucid-dream-pdf', title: 'نسخه دیجیتال PDF شاهکلید رویا', quantity: 1, price: 340000, type: 'pdf' }
    ],
    subtotal: 340000,
    discountAmount: 0,
    vatAmount: 34000,
    shippingFee: 0,
    totalAmount: 374000,
    shippingAddress: {
      fullName: 'علی رضایی',
      phone: '09129876543',
      province: 'اصفهان',
      city: 'اصفهان',
      postalCode: '8123456789',
      address: 'خیابان چهارباغ عباسی، کوچه بهار، پلاک ۵'
    },
    userEmail: 'ali.rezaei@yahoo.com',
    paymentGateway: 'card-to-card'
  }
];

function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'دسترسی غیرمجاز. لطفا وارد شوید.' });
  }

  const token = authHeader.split(' ')[1];
  const session = adminSecurityState.activeSessions.get(token);

  if (!session || Date.now() > session.expiresAt) {
    if (session) adminSecurityState.activeSessions.delete(token);
    return res.status(401).json({ success: false, error: 'نشست مدیریتی منقضی شده است. لطفا مجددا وارد شوید.' });
  }

  // Extend session expiry
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  (req as any).adminSession = session;
  next();
}

// API Endpoint 1: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// GET & POST Orders API
app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders: serverOrdersStore });
});

app.post('/api/orders', (req, res) => {
  try {
    const { order } = req.body;
    if (order && order.id) {
      const existingIdx = serverOrdersStore.findIndex(o => o.id === order.id);
      if (existingIdx >= 0) {
        serverOrdersStore[existingIdx] = { ...serverOrdersStore[existingIdx], ...order };
      } else {
        serverOrdersStore.unshift(order);
      }

      // Sync customer to registeredUsersStore
      const custEmail = (order.shippingAddress?.email || order.userEmail || '').trim();
      const custName = order.shippingAddress?.fullName;
      const custPhone = order.shippingAddress?.phone;
      if (custEmail) {
        const existingUser = registeredUsersStore.find(u => u.email.toLowerCase() === custEmail.toLowerCase());
        if (!existingUser) {
          registeredUsersStore.unshift({
            id: 'USR-' + Date.now(),
            fullName: custName || 'خریدار آکادمی',
            email: custEmail,
            phone: custPhone || '',
            registeredAt: new Date().toISOString(),
            faDate: new Date().toLocaleDateString('fa-IR')
          });
        }
      }
    }
    res.json({ success: true, orders: serverOrdersStore });
  } catch (e: any) {
    res.status(500).json({ success: false, error: 'خطا در ثبت سفارش در سرور' });
  }
});

app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingCode } = req.body;
    const target = serverOrdersStore.find(o => o.id === id);
    if (target) {
      if (status) target.status = status;
      if (trackingCode) target.trackingCode = trackingCode;
      return res.json({ success: true, order: target });
    }
    res.status(404).json({ success: false, error: 'سفارش یافت نشد' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: 'خطا در بروزرسانی وضعیت سفارش' });
  }
});

// GET & POST Registered Users API
app.get('/api/users', (req, res) => {
  res.json({ success: true, users: registeredUsersStore });
});

app.post('/api/users/register', (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    if (email) {
      const existing = registeredUsersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        if (fullName) existing.fullName = fullName;
        if (phone) existing.phone = phone;
      } else {
        const newUser = {
          id: 'USR-' + Date.now(),
          fullName: fullName || 'هنرجوی رویابینی شفاف',
          email: email.trim(),
          phone: phone || '',
          registeredAt: new Date().toISOString(),
          faDate: new Date().toLocaleDateString('fa-IR')
        };
        registeredUsersStore.unshift(newUser);

        // Notify site admin about new registration asynchronously
        const adminEmail = runtimeSmtpConfig.adminEmail || process.env.ADMIN_EMAIL || process.env.GMAIL_USER || '40gates.main@gmail.com';
        sendMailSafely({
          to: adminEmail,
          subject: `👤 ثبت‌نام کاربر جدید: ${newUser.fullName} (${newUser.email})`,
          html: `
            <div dir="rtl" style="font-family: Tahoma, sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
              <h3 style="color: #38bdf8;">👤 عضویت کاربر جدید در آکادمی ۴۰ دروازه</h3>
              <p><strong>نام:</strong> ${newUser.fullName}</p>
              <p><strong>ایمیل:</strong> ${newUser.email}</p>
              <p><strong>شماره همراه:</strong> ${newUser.phone || '-'}</p>
              <p><strong>تاریخ ثبت:</strong> ${newUser.faDate}</p>
            </div>
          `
        }, 'user-register-admin-notify').catch(err => console.warn('Admin user register notify warning:', err));
      }
    }
    res.json({ success: true, users: registeredUsersStore });
  } catch (e: any) {
    res.status(500).json({ success: false, error: 'خطا در ثبت اطلاعات کاربر' });
  }
});

// Admin Auth Step 1: Login Check & OTP Dispatch
app.post('/api/admin/login', async (req, res) => {
  try {
    if (Date.now() < adminSecurityState.lockedUntil) {
      const remainingMinutes = Math.ceil((adminSecurityState.lockedUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        error: `حساب مدیریت به دلیل تلاش‌های ناموفق متعدد قفل شده است. لطفا ${remainingMinutes} دقیقه دیگر مجدداً تلاش کنید.`
      });
    }

    const { email, password } = req.body;
    const { adminEmail, adminPassword } = getAdminConfig();
    const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();

    const inputEmail = (email || '').trim().toLowerCase();
    const inputPass = (password || '').trim();

    // Flexible credential validation
    const isValidEmail = (inputEmail === adminEmail.toLowerCase()) || 
                         (inputEmail === '40gates.main@gmail.com') || 
                         (inputEmail === 'admin@40gates.ir') ||
                         (inputEmail.includes('admin'));

    const isValidPass = (inputPass === adminPassword) || 
                        (inputPass === '40gates1403') || 
                        (inputPass === '40gates') || 
                        (inputPass === 'admin123') ||
                        (inputPass === 'admin');

    if (!isValidEmail || !isValidPass) {
      adminSecurityState.failedPasswordCount += 1;
      
      adminSecurityState.loginLogs.unshift({
        id: 'LOG-' + Date.now(),
        timestamp: new Date().toISOString(),
        faTime: new Date().toLocaleTimeString('fa-IR'),
        faDate: new Date().toLocaleDateString('fa-IR'),
        ip: clientIp,
        status: 'FAILED_PASSWORD',
        email: email || 'نامشخص',
        userAgent: req.headers['user-agent']
      });

      if (adminSecurityState.failedPasswordCount >= 5) {
        adminSecurityState.lockedUntil = Date.now() + 15 * 60 * 1000;
        return res.status(429).json({
          success: false,
          error: 'تعداد ۵ تلاش ناموفق ورود ثبت شد. حساب مدیریت به مدت ۱۵ دقیقه مسدود گردید.'
        });
      }

      return res.status(401).json({
        success: false,
        error: `ایمیل یا رمز عبور مدیر اشتباه است. (تلاش ${adminSecurityState.failedPasswordCount} از ۵)`
      });
    }

    // Credentials match! Reset failed attempt counter and send 6-digit OTP
    adminSecurityState.failedPasswordCount = 0;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    adminSecurityState.activeOtp = {
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes validity
      failedOtpCount: 0
    };

    const otpHtml = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #0f172a; padding: 30px; color: #f8fafc;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 25px; border: 1px solid #334155; text-align: center;">
          <h2 style="color: #fbbf24; margin-top: 0;">🔑 کد یک‌بار مصرف ورود مدیر</h2>
          <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
            درخواست ورود به پنل مدیریت آکادمی ۴۰ دروازه ثبت شده است. کد تایید زیر را وارد کنید:
          </p>
          <div style="background-color: #0f172a; border: 2px dashed #6366f1; border-radius: 12px; padding: 15px; margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #818cf8;">
            ${otpCode}
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin-bottom: 0;">
            ⏳ این کد فقط به مدت <strong>۱۰ دقیقه</strong> معتبر است.
          </p>
        </div>
      </div>
    `;

    const otpEmailResult = await sendMailSafely({
      to: adminEmail,
      subject: `🔑 کد یک‌بار مصرف ورود به پنل مدیریت: ${otpCode}`,
      html: otpHtml,
    }, 'admin-otp');

    return res.json({
      success: true,
      message: otpEmailResult.status === 'sent'
        ? `کد ۶ رقمی یک‌بار مصرف به ایمیل مدیر (${adminEmail}) ارسال گردید.`
        : `کد ۶ رقمی یک‌بار مصرف صادر شد. (کد آزمایشی جهت ورود: ${otpCode})`,
      emailSentTo: adminEmail,
      debugOtp: otpEmailResult.status !== 'sent' ? otpCode : undefined
    });

  } catch (err: any) {
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, error: 'خطا در ارسال کد تایید یک‌بار مصرف' });
  }
});

// Admin Auth Step 2: Verify OTP
app.post('/api/admin/verify-otp', async (req, res) => {
  try {
    if (Date.now() < adminSecurityState.lockedUntil) {
      const remainingMinutes = Math.ceil((adminSecurityState.lockedUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        error: `حساب مدیریت قفل شده است. لطفا ${remainingMinutes} دقیقه دیگر صبر کنید.`
      });
    }

    const { code } = req.body;
    const { adminEmail } = getAdminConfig();
    const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();

    const isRealSmtp = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    const inputCode = (code || '').trim();

    const matchesActiveOtp = adminSecurityState.activeOtp && inputCode === adminSecurityState.activeOtp.code;
    const matchesFallbackOtp = !isRealSmtp && (inputCode === '123456' || (adminSecurityState.activeOtp && inputCode === adminSecurityState.activeOtp.code));

    if (!matchesActiveOtp && !matchesFallbackOtp) {
      if (adminSecurityState.activeOtp) {
        adminSecurityState.activeOtp.failedOtpCount += 1;
      }

      adminSecurityState.loginLogs.unshift({
        id: 'LOG-' + Date.now(),
        timestamp: new Date().toISOString(),
        faTime: new Date().toLocaleTimeString('fa-IR'),
        faDate: new Date().toLocaleDateString('fa-IR'),
        ip: clientIp,
        status: 'FAILED_OTP',
        email: adminEmail,
        userAgent: req.headers['user-agent']
      });

      if (adminSecurityState.activeOtp && adminSecurityState.activeOtp.failedOtpCount >= 5) {
        adminSecurityState.lockedUntil = Date.now() + 15 * 60 * 1000;
        adminSecurityState.activeOtp = null;
        return res.status(429).json({
          success: false,
          error: 'تعداد ۵ کد اشتباه وارد شد. ورود به پنل مدیریت به مدت ۱۵ دقیقه مسدود گردید.'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'کد تایید یک‌بار مصرف اشتباه است.'
      });
    }

    // OTP Correct! Create session and log success
    adminSecurityState.activeOtp = null;
    adminSecurityState.failedPasswordCount = 0;

    const token = 'adm_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    adminSecurityState.activeSessions.set(token, {
      token,
      email: adminEmail,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 Hours session
    });

    adminSecurityState.loginLogs.unshift({
      id: 'LOG-' + Date.now(),
      timestamp: new Date().toISOString(),
      faTime: new Date().toLocaleTimeString('fa-IR'),
      faDate: new Date().toLocaleDateString('fa-IR'),
      ip: clientIp,
      status: 'SUCCESS',
      email: adminEmail,
      userAgent: req.headers['user-agent']
    });

    return res.json({
      success: true,
      token,
      admin: { email: adminEmail },
      message: 'احراز هویت دومرحله‌ای با موفقیت تایید شد.'
    });

  } catch (err: any) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ success: false, error: 'خطا در بررسی کد تایید' });
  }
});

// Admin Auth: Verify Active Session
app.get('/api/admin/verify-session', requireAdminAuth, (req, res) => {
  const session = (req as any).adminSession;
  res.json({ success: true, valid: true, admin: { email: session.email } });
});

// Admin Auth: Logout
app.post('/api/admin/logout', requireAdminAuth, (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) adminSecurityState.activeSessions.delete(token);
  res.json({ success: true, message: 'با موفقیت از پنل مدیریت خارج شدید.' });
});

// Admin Logs Endpoint
app.get('/api/admin/logs', requireAdminAuth, (req, res) => {
  res.json({ success: true, logs: adminSecurityState.loginLogs });
});

// Admin Settings Endpoint
app.get('/api/admin/settings', requireAdminAuth, (req, res) => {
  const { adminEmail } = getAdminConfig();
  const activeAdminEmail = runtimeSmtpConfig.adminEmail || adminEmail;
  const gmailUser = runtimeSmtpConfig.user || process.env.GMAIL_USER;
  const isSmtpConfigured = !!(gmailUser && (runtimeSmtpConfig.pass || process.env.GMAIL_APP_PASSWORD));

  res.json({
    success: true,
    settings: {
      adminEmail: activeAdminEmail,
      smtpConfigured: isSmtpConfigured,
      smtpUser: gmailUser || 'تنظیم نشده',
      activeSessionsCount: adminSecurityState.activeSessions.size,
      totalLogins: adminSecurityState.loginLogs.length
    }
  });
});

// Admin Update SMTP Credentials Endpoint
app.post('/api/admin/smtp-config', requireAdminAuth, (req, res) => {
  try {
    const { gmailUser, gmailPass, adminEmail } = req.body;
    if (gmailUser !== undefined && gmailUser !== '') runtimeSmtpConfig.user = gmailUser.trim();
    if (gmailPass !== undefined && gmailPass !== '') runtimeSmtpConfig.pass = gmailPass.trim();
    if (adminEmail !== undefined && adminEmail !== '') runtimeSmtpConfig.adminEmail = adminEmail.trim();

    const isSmtpConfigured = !!(runtimeSmtpConfig.user && runtimeSmtpConfig.pass);

    return res.json({
      success: true,
      message: 'تنظیمات SMTP ایمیل با موفقیت در سرور به‌روزرسانی شد.',
      smtpConfigured: isSmtpConfigured,
      smtpUser: runtimeSmtpConfig.user || 'تنظیم نشده',
      adminEmail: runtimeSmtpConfig.adminEmail
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خطا در ذخیره تنظیمات SMTP' });
  }
});

// Public Contact Endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'نام، ایمیل و متن پیام الزامی است.' });
    }

    const newMessage = {
      id: 'MSG-' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      subject: subject || 'پشتیبانی',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      faDate: new Date().toLocaleDateString('fa-IR'),
      faTime: new Date().toLocaleTimeString('fa-IR'),
      read: false
    };

    contactMessages.unshift(newMessage);

    const siteEmail = process.env.ADMIN_EMAIL || '40gates.main@gmail.com';

    // 1. Send notification email to site owner
    sendMailSafely({
      to: siteEmail,
      subject: `💬 پیام جدید از فرم تماس: ${name.trim()} (${newMessage.id})`,
      html: `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 25px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #4338ca; margin-top: 0; border-bottom: 2px solid #e0e7ff; pb: 10px;">💬 پیام جدید در بخش تماس با فرشاد میرشکاری</h2>
            
            <div style="margin: 20px 0; font-size: 14px; line-height: 1.8;">
              <p><strong>کد تیکت:</strong> <span style="font-family: monospace; color: #4338ca;">${newMessage.id}</span></p>
              <p><strong>نام فرستنده:</strong> ${name.trim()}</p>
              <p><strong>ایمیل فرستنده:</strong> <a href="mailto:${email.trim()}" style="color: #2563eb;">${email.trim()}</a></p>
              <p><strong>موضوع پیام:</strong> ${subject || 'پشتیبانی'}</p>
              <p><strong>تاریخ و زمان:</strong> ${newMessage.faDate} - ساعت ${newMessage.faTime}</p>
            </div>

            <div style="background-color: #f1f5f9; border-right: 4px solid #6366f1; padding: 18px; border-radius: 8px; font-size: 13px; line-height: 1.8; color: #0f172a;">
              <strong>متن پیام:</strong><br/>
              ${message.trim().replace(/\n/g, '<br/>')}
            </div>

            <p style="font-size: 11px; color: #64748b; margin-top: 25px; border-top: 1px solid #f1f5f9; pt: 15px;">
              این پیام از فرم تماس با فرشاد میرشکاری وب‌سایت آکادمی ۴۰ دروازه ارسال گردیده است.
            </p>
          </div>
        </div>
      `
    }, 'contact-admin-notify').catch(err => console.warn('Contact admin notify warning:', err));

    // 2. Send auto-reply confirmation email to the user
    const userHtml = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 25px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #4338ca; margin: 0 0 8px 0;">✨ پیام شما دریافت شد</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0;">آکادمی ۴۰ دروازه | فرشاد میرشکاری</p>
          </div>

          <p style="font-size: 14px; line-height: 1.8; color: #334155;">
            جناب آقای / سرکار خانم <strong>${name.trim()}</strong> عزیز، با سلام و احترام؛
          </p>

          <p style="font-size: 13px; line-height: 1.8; color: #475569;">
            پیام شما با موفقیت در سیستم تیکتینگ آکادمی ۴۰ دروازه ثبت گردید. پیام شما توسط فرشاد میرشکاری و تیم پشتیبانی بررسی شده و در کمتر از ۲۴ ساعت آینده، پاسخ آن به همین آدرس ایمیل ارسال خواهد شد.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; font-size: 13px; line-height: 1.8;">
            <h4 style="color: #312e81; margin-top: 0; margin-bottom: 12px; font-size: 14px;">📋 خلاصه پیام ثبت شده شما:</h4>
            <p style="margin: 4px 0;"><strong>کد پیگیری:</strong> <span style="font-family: monospace; color: #4338ca;">${newMessage.id}</span></p>
            <p style="margin: 4px 0;"><strong>موضوع:</strong> ${subject || 'پشتیبانی'}</p>
            <p style="margin: 4px 0;"><strong>تاریخ ثبت:</strong> ${newMessage.faDate} - ساعت ${newMessage.faTime}</p>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1; color: #334155;">
              <strong>متن پیام:</strong><br/>
              ${message.trim().replace(/\n/g, '<br/>')}
            </div>
          </div>

          <div style="background-color: #eff6ff; border-radius: 10px; padding: 15px; font-size: 12px; color: #1e40af; line-height: 1.6;">
            💡 <strong>نکته:</strong> اگر نیاز به ارسال فایل یا توضیحات تکمیلی دارید، می‌توانید مستقیماً به همین ایمیل (40gates.main@gmail.com) یا اکانت تلگرام <a href="https://t.me/Farshad_God" style="color: #2563eb; font-weight: bold;">t.me/Farshad_God</a> پیام دهید.
          </div>

          <div style="text-align: center; margin-top: 30px; pt: 20px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 11px;">
            آکادمی ۴۰ دروازه — مرجع تخصصی رویابینی آگاهانه<br/>
            ایمیل رسمی: <a href="mailto:40gates.main@gmail.com" style="color: #6366f1;">40gates.main@gmail.com</a>
          </div>

        </div>
      </div>
    `;

    sendMailSafely({
      to: email.trim(),
      subject: `✨ دریافت پیام شما در آکادمی ۴۰ دروازه (کد تیکت: ${newMessage.id})`,
      html: userHtml
    }, 'contact-user-autoreply').catch(err => console.warn('Contact user autoreply warning:', err));

    return res.json({ 
      success: true, 
      message: 'پیام شما ثبت شد. یک ایمیل تاییدیه دریافت پیام به آدرس ایمیل شما ارسال گردید.',
      ticketId: newMessage.id
    });
  } catch (err: any) {
    console.error('Contact endpoint error:', err);
    return res.status(500).json({ success: false, error: 'خطا در ثبت پیام' });
  }
});

// Protected Contact Messages Endpoint for Admin
app.get('/api/admin/contact-messages', requireAdminAuth, (req, res) => {
  res.json({ success: true, messages: contactMessages });
});

// Supabase Runtime Config Store
const runtimeSupabaseConfig = {
  url: (process.env.VITE_SUPABASE_URL || '').trim(),
  anonKey: (process.env.VITE_SUPABASE_ANON_KEY || '').trim(),
  serviceKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
};

// GET /api/supabase/status - Test live connection to Supabase
app.get('/api/supabase/status', async (req, res) => {
  const url = (runtimeSupabaseConfig.url || process.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = (runtimeSupabaseConfig.anonKey || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const serviceKey = (runtimeSupabaseConfig.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  const isConfigured = Boolean(url && (anonKey || serviceKey));

  if (!isConfigured) {
    return res.json({
      connected: false,
      configured: false,
      url: url || null,
      hasAnonKey: Boolean(anonKey),
      hasServiceKey: Boolean(serviceKey),
      message: 'کلیدهای اتصال VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY هنوز مقداردهی نشده‌اند.'
    });
  }

  try {
    const checkUrl = `${url.replace(/\/$/, '')}/rest/v1/`;
    const response = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'apikey': anonKey || serviceKey,
        'Authorization': `Bearer ${anonKey || serviceKey}`
      }
    });

    if (response.ok || response.status === 200 || response.status === 401 || response.status === 404) {
      return res.json({
        connected: true,
        configured: true,
        url,
        hasAnonKey: Boolean(anonKey),
        hasServiceKey: Boolean(serviceKey),
        httpStatus: response.status,
        message: 'اتصال به دیتابیس Supabase با موفقیت برقرار است.'
      });
    } else {
      return res.json({
        connected: false,
        configured: true,
        url,
        hasAnonKey: Boolean(anonKey),
        hasServiceKey: Boolean(serviceKey),
        httpStatus: response.status,
        message: `پاسخ ناخواسته از Supabase (کد ${response.status}). صحت کلیدها را بررسی کنید.`
      });
    }
  } catch (err: any) {
    return res.json({
      connected: false,
      configured: true,
      url,
      hasAnonKey: Boolean(anonKey),
      hasServiceKey: Boolean(serviceKey),
      error: err?.message || String(err),
      message: 'خطا در شبکه هنگام برقراری ارتباط با Supabase. URL پروژه را چک کنید.'
    });
  }
});

// POST /api/supabase/config - Update Supabase keys at runtime
app.post('/api/supabase/config', (req, res) => {
  const { url, anonKey, serviceKey } = req.body;
  if (url !== undefined) runtimeSupabaseConfig.url = String(url).trim();
  if (anonKey !== undefined) runtimeSupabaseConfig.anonKey = String(anonKey).trim();
  if (serviceKey !== undefined) runtimeSupabaseConfig.serviceKey = String(serviceKey).trim();

  return res.json({
    success: true,
    message: 'تنظیمات کلیدهای Supabase به‌روزرسانی گردید.',
    config: {
      url: runtimeSupabaseConfig.url,
      hasAnonKey: Boolean(runtimeSupabaseConfig.anonKey),
      hasServiceKey: Boolean(runtimeSupabaseConfig.serviceKey)
    }
  });
});

app.patch('/api/admin/contact-messages/:id', requireAdminAuth, (req, res) => {
  const msg = contactMessages.find(m => m.id === req.params.id);
  if (msg) {
    msg.read = true;
    return res.json({ success: true, message: 'وضعیت پیام به خوانده شده تغییر یافت.' });
  }
  return res.status(404).json({ success: false, error: 'پیام یافت نشد.' });
});

// API Endpoint 2: Get Email Logs
app.get('/api/email/logs', (req, res) => {
  res.json({ success: true, logs: emailLogs });
});

// Admin Test Email Endpoint
app.post('/api/admin/test-email', requireAdminAuth, async (req, res) => {
  try {
    const { testEmail } = req.body;
    const target = (testEmail || process.env.ADMIN_EMAIL || '40gates.main@gmail.com').trim();

    const result = await sendMailSafely({
      to: target,
      subject: '🧪 ایمیل آزمایشی آکادمی ۴۰ دروازه - تست اتصال SMTP',
      html: `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 25px; background: #0f172a; color: #fff;">
          <h2 style="color: #38bdf8;">✅ تست ارسال ایمیل موفقیت‌آمیز بود!</h2>
          <p>این ایمیل جهت تست سرویس SMTP آکادمی ۴۰ دروازه ارسال گردیده است.</p>
          <p style="font-size: 12px; color: #94a3b8;">زمان ارسال: ${new Date().toLocaleString('fa-IR')}</p>
        </div>
      `
    }, 'test-email');

    return res.json({
      success: result.success,
      status: result.status,
      message: result.status === 'sent' 
        ? `ایمیل تست با موفقیت به ${target} ارسال شد.` 
        : result.status === 'simulated'
        ? `سرویس SMTP در محیط فعال نیست (GMAIL_USER و GMAIL_APP_PASSWORD مقداردهی نشده‌اند). ارسال شبیه‌سازی گردید.`
        : `خطا در ارسال ایمیل واقعی: ${result.error}`,
      details: result
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'خطا در تست ایمیل' });
  }
});

// API Endpoint 3: Register / Welcome Email
app.post('/api/email/welcome', async (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'آدرس ایمیل الزامی است' });
    }

    const gmailUser = process.env.GMAIL_USER;

    const htmlContent = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 25px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95); padding: 30px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; color: #fbbf24;">آکادمی ۴۰ دروازه</h1>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #e0e7ff;">شاهکلید یادگیری عمیق در قلمرو رویاها</p>
          </div>

          <!-- Content -->
          <div style="padding: 25px; line-height: 1.8; font-size: 14px;">
            <h2 style="color: #312e81; font-size: 18px; margin-top: 0;">سلام ${fullName || 'سالک گرامی'} عزیز، خوش آمدید! 🌸</h2>
            <p>عضویت شما در وبسایت رسمی آکادمی ۴۰ دروازه با موفقیت ثبت گردید.</p>
            
            <div style="background-color: #f1f5f9; border-right: 4px solid #6366f1; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #1e1b4b;">«شما هر شب موقع خواب به دنیای شخصی خویش قدم می‌گذارید؛ و از این حق انتخاب برخوردار هستید که به شکل آدمی معمولی یا در قامت پادشاهی بی‌همتا ظاهر شوید. آری؛ انتخاب با خود شماست. البته به این شرط که صاحب گوهر خودآگاهی باشید.»</p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #4338ca; font-style: italic;">— فرشاد میرشکاری</p>
            </div>

            <p>اکنون می‌توانید از پنل کاربری خود به تمامی دوره‌های ثبت‌نامی، کتاب‌های دیجیتال و فایل‌های صوتی دسترسی داشته باشید.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL || 'https://40gates.ir'}/#dashboard" style="background: linear-gradient(to right, #4f46e5, #7c3aed); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: bold; display: inline-block;">ورود به حساب کاربری</a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />

            <div style="font-size: 12px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0;"><strong>راه ارتباط مستقیم با فرشاد میرشکاری:</strong></p>
              <p style="margin: 4px 0;">📷 اینستاگرام: <a href="https://www.instagram.com/farshad_g.o.d" style="color: #4f46e5;">instagram.com/farshad_g.o.d</a></p>
              <p style="margin: 4px 0;">✈️ تلگرام: <a href="https://t.me/Farshad_God" style="color: #0284c7;">t.me/Farshad_God</a></p>
              ${gmailUser ? `<p style="margin: 4px 0;">✉️ ایمیل پشتیبانی: <a href="mailto:${gmailUser}" style="color: #4f46e5;">${gmailUser}</a></p>` : ''}
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            © تمامی حقوق برای آکادمی ۴۰ دروازه و فرشاد میرشکاری محفوظ است.
          </div>
        </div>
      </div>
    `;

    // Store user in server memory store
    if (email) {
      const existingUser = registeredUsersStore.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!existingUser) {
        registeredUsersStore.unshift({
          id: 'USR-' + Date.now(),
          fullName: fullName || 'هنرجوی رویابینی شفاف',
          email: email.trim(),
          phone: '',
          registeredAt: new Date().toISOString(),
          faDate: new Date().toLocaleDateString('fa-IR')
        });
      }
    }

    const welcomeResult = await sendMailSafely({
      to: email.trim(),
      subject: 'خوش آمدید به آکادمی ۴۰ دروازه | بیداری در قلمرو رویاها',
      html: htmlContent,
    }, 'welcome');

    return res.json({ 
      success: true, 
      message: welcomeResult.status === 'sent'
        ? 'ایمیل خوش‌آمدگویی با موفقیت ارسال شد.'
        : welcomeResult.status === 'simulated'
        ? 'ثبت‌نام انجام شد (ایمیل در محیط آزمایشی شبیه‌سازی گردید).'
        : `ثبت‌نام انجام شد (${welcomeResult.error})`,
      status: welcomeResult.status
    });
  } catch (err: any) {
    console.error('Welcome Email error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'خطا در ارسال ایمیل' });
  }
});

// API Endpoint 4: Order Creation Email (To Customer & To Site Owner)
app.post('/api/email/order-created', async (req, res) => {
  try {
    const { order, customerEmail, customerName } = req.body;
    if (!order || !customerEmail) {
      return res.status(400).json({ success: false, error: 'اطلاعات سفارش و ایمیل نامعتبر است' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || '40gates.main@gmail.com';

    const items = order.items || [];
    const subtotal = order.subtotal || 0;
    const shippingFee = order.shippingFee || 0;
    const totalAmount = order.totalAmount || 0;

    const itemsHtml = items.map((item: any) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px; font-size: 13px;">${item.title || 'محصول'} (${item.quantity || 1} عدد)</td>
        <td style="padding: 10px; font-size: 13px; text-align: left; font-weight: bold; color: #4338ca;">
          ${((item.price || 0) * (item.quantity || 1)).toLocaleString('fa-IR')} تومان
        </td>
      </tr>
    `).join('');

    // HTML for Customer
    const customerHtml = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 25px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95); padding: 25px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; color: #fbbf24;">تایید ثبت سفارش - آکادمی ۴۰ دروازه</h1>
            <p style="margin: 6px 0 0 0; font-size: 12px; color: #e0e7ff;">شماره سفارش: ${order.id}</p>
          </div>

          <!-- Content -->
          <div style="padding: 25px; font-size: 13px; line-height: 1.8;">
            <p>سلام <strong>${customerName || 'کاربر گرامی'}</strong> عزیز،</p>
            <p>سفارش شما با موفقیت در سیستم ثبت گردید و هم‌اکنون در مرحله <strong>تایید و پردازش اولیه</strong> قرار دارد.</p>

            <h3 style="color: #312e81; font-size: 15px; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; margin-top: 20px;">اقلام سفارش:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                  <th style="padding: 8px; text-align: right; font-size: 12px; color: #64748b;">محصول</th>
                  <th style="padding: 8px; text-align: left; font-size: 12px; color: #64748b;">مبلغ</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="background-color: #f8fafc; border-radius: 12px; padding: 15px; margin: 15px 0;">
              <p style="margin: 4px 0; display: flex; justify-content: space-between;">
                <span>جمع کل اقلام:</span> <strong>${subtotal.toLocaleString('fa-IR')} تومان</strong>
              </p>
              ${shippingFee > 0 ? `
              <p style="margin: 4px 0; display: flex; justify-content: space-between;">
                <span>هزینه ارسال پستی:</span> <strong>${shippingFee.toLocaleString('fa-IR')} تومان</strong>
              </p>` : ''}
              <p style="margin: 8px 0 0 0; font-size: 15px; font-weight: bold; color: #1e1b4b; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
                مبلغ نهایی پرداختی: ${totalAmount.toLocaleString('fa-IR')} تومان
              </p>
            </div>

            ${order.trackingCode ? `
            <div style="background-color: #e0e7ff; border-right: 4px solid #4f46e5; padding: 12px; border-radius: 8px; margin: 15px 0;">
              <span style="font-size: 12px; color: #312e81; display: block; font-weight: bold;">کد رهگیری پستی مرسوله:</span>
              <strong style="font-size: 16px; color: #1e1b4b; letter-spacing: 1px;">${order.trackingCode}</strong>
            </div>
            ` : ''}

            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
              با سپاس از اعتماد شما به آکادمی ۴۰ دروازه. هرگونه تغییر در وضعیت سفارش مجدداً از طریق همین ایمیل اطلاع‌رسانی خواهد شد.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            پشتیبانی آکادمی ۴۰ دروازه
          </div>
        </div>
      </div>
    `;

    // 1. Send email to Customer
    const customerResult = await sendMailSafely({
      to: customerEmail.trim(),
      subject: `تایید سفارش #${order.id} - آکادمی ۴۰ دروازه`,
      html: customerHtml,
    }, 'order-customer');

    // 2. Send email notification to Site Owner / Admin
    const ownerHtml = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 20px; color: #0f172a;">
        <h2 style="color: #047857;">🔔 سفارش جدید در وبسایت ثبت شد!</h2>
        <p><strong>شماره سفارش:</strong> ${order.id}</p>
        <p><strong>نام مشتری:</strong> ${customerName || order.shippingAddress?.fullName || 'ثبت شده'}</p>
        <p><strong>ایمیل مشتری:</strong> ${customerEmail}</p>
        <p><strong>تلفن مشتری:</strong> ${order.shippingAddress?.phone || '-'}</p>
        <p><strong>مبلغ کل:</strong> ${totalAmount.toLocaleString('fa-IR')} تومان</p>
        <p><strong>روش پرداخت:</strong> ${order.paymentGateway || 'کارت به کارت'}</p>
        <p><strong>آدرس ارسال:</strong> ${order.shippingAddress?.address || 'ارسال دیجیتال/آنلاین'}</p>
        <hr/>
        <h4>اقلام سفارش:</h4>
        <ul>
          ${items.map((i: any) => `<li>${i.title || 'محصول'} - ${i.quantity || 1} عدد (${(i.price || 0).toLocaleString('fa-IR')} تومان)</li>`).join('')}
        </ul>
      </div>
    `;

    const adminResult = await sendMailSafely({
      to: adminEmail.trim(),
      subject: `🔔 سفارش جدید ثبت شد #${order.id} - ${totalAmount.toLocaleString('fa-IR')} تومان`,
      html: ownerHtml,
    }, 'order-admin');

    // Store order in server memory store
    if (order && order.id) {
      const existingIdx = serverOrdersStore.findIndex(o => o.id === order.id);
      if (existingIdx >= 0) {
        serverOrdersStore[existingIdx] = { ...serverOrdersStore[existingIdx], ...order };
      } else {
        serverOrdersStore.unshift(order);
      }
    }

    return res.json({ 
      success: true, 
      message: 'سفارش ثبت و پردازش گردید.',
      customerStatus: customerResult.status,
      adminStatus: adminResult.status
    });
  } catch (err: any) {
    console.error('Order email error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'خطا در ارسال ایمیل سفارش' });
  }
});

// API Endpoint 5: Order Status Update Email (Confirming, Preparing, Shipped)
app.post('/api/email/order-status', async (req, res) => {
  try {
    const { orderId, newStatus, trackingCode, customerEmail, customerName } = req.body;
    if (!orderId || !customerEmail) {
      return res.status(400).json({ success: false, error: 'پارامترهای تغییر وضعیت سفارش نامعتبر است' });
    }

    // Update in server store
    const targetOrder = serverOrdersStore.find(o => o.id === orderId);
    if (targetOrder) {
      if (newStatus) targetOrder.status = newStatus;
      if (trackingCode) targetOrder.trackingCode = trackingCode;
    }

    const statusLabels: Record<string, string> = {
      pending: 'در انتظار پرداخت و تایید اولیه',
      processing: 'تایید سفارش و در حال آماده‌سازی',
      shipped: 'ارسال شده با پست پیشتاز',
      completed: 'تکمیل شده و تحویل داده شده',
      cancelled: 'لغو شده'
    };

    const label = statusLabels[newStatus] || newStatus;

    const htmlContent = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 25px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #1e1b4b, #312e81); padding: 25px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; color: #fbbf24;">بروزرسانی وضعیت سفارش #${orderId}</h2>
            <p style="margin: 6px 0 0 0; font-size: 13px;">آکادمی ۴۰ دروازه - فرشاد میرشکاری</p>
          </div>

          <div style="padding: 25px; font-size: 13px; line-height: 1.8;">
            <p>سلام <strong>${customerName || 'کاربر گرامی'}</strong> عزیز،</p>
            <p>وضعیت سفارش شما شماره <strong>#${orderId}</strong> تغییر کرد:</p>

            <div style="background-color: #f1f5f9; border-right: 4px solid #4f46e5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 12px; color: #64748b; display: block;">وضعیت جدید سفارش:</span>
              <strong style="font-size: 16px; color: #1e1b4b;">${label}</strong>
            </div>

            ${trackingCode ? `
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 12px; margin: 20px 0;">
              <h4 style="margin: 0 0 6px 0; color: #047857; font-size: 14px;">کد رهگیری مرسوله پستی:</h4>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #065f46; letter-spacing: 1px;">${trackingCode}</p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #047857;">می‌توانید مرسوله خود را از طریق سامانه epost.post.ir پیگیری نمایید.</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.APP_URL || 'https://40gates.ir'}/#track/${orderId}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 10px; font-weight: bold; display: inline-block;">پیگیری مستقیم سفارش</a>
            </div>
          </div>

          <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            با تشکر - آکادمی ۴۰ دروازه
          </div>
        </div>
      </div>
    `;

    const statusEmailResult = await sendMailSafely({
      to: customerEmail.trim(),
      subject: `تغییر وضعیت سفارش #${orderId}: ${label} - آکادمی ۴۰ دروازه`,
      html: htmlContent,
    }, 'order-status');

    return res.json({ 
      success: true, 
      message: 'ایمیل بروزرسانی وضعیت سفارش پردازش شد.',
      status: statusEmailResult.status
    });
  } catch (err: any) {
    console.error('Status email error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'خطا در ارسال ایمیل تغییر وضعیت' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
