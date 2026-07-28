import express from 'express';
import path from 'path';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Configure Nodemailer Transporter
const getTransporter = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }

  // Fallback logger mode if GMAIL_USER or GMAIL_APP_PASSWORD are not set in environment variables
  return {
    sendMail: async (options: nodemailer.SendMailOptions) => {
      console.log('--- [EMAIL DISPATCH LOG (SMTP credentials pending in env)] ---');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('From:', options.from || gmailUser || 'system');
      console.log('Body length:', options.html?.toString().length || 0);
      console.log('---------------------------');
      return { messageId: 'simulated-msg-id-' + Date.now() };
    },
  };
};

// Log of sent emails for debug / UI status
const emailLogs: Array<{
  id: string;
  type: string;
  to: string;
  subject: string;
  timestamp: string;
  status: 'sent' | 'simulated';
}> = [];

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
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.GMAIL_USER || 'fmfarshad585@gmail.com').trim();
  const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();
  return { adminEmail, adminPassword };
}

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

    if (!adminPassword) {
      return res.status(500).json({
        success: false,
        error: 'رمز عبور مدیریت در متغیرهای محیطی (ADMIN_PASSWORD) تنظیم نشده است. لطفاً متغیر ADMIN_PASSWORD را در تنظیمات سیستم تعریف کنید.'
      });
    }

    if (!email || !password || email.trim().toLowerCase() !== adminEmail.toLowerCase() || password.trim() !== adminPassword) {
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
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes validity
      failedOtpCount: 0
    };

    const transporter = getTransporter();
    const gmailUser = process.env.GMAIL_USER;
    const sender = gmailUser ? `آکادمی ۴۰ دروازه <${gmailUser}>` : 'آکادمی ۴۰ دروازه';

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
            ⏳ این کد فقط به مدت <strong>۵ دقیقه</strong> معتبر است. اگر شما این درخواست را نداده‌اید، سریعاً رمز عبور را تغییر دهید.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: sender,
      to: adminEmail,
      subject: `🔑 کد یک‌بار مصرف ورود به پنل مدیریت: ${otpCode}`,
      html: otpHtml,
    });

    emailLogs.unshift({
      id: 'EML-OTP-' + Date.now(),
      type: 'admin-otp',
      to: adminEmail,
      subject: `کد یک‌بار مصرف ورود مدیر`,
      timestamp: new Date().toLocaleTimeString('fa-IR'),
      status: gmailUser && process.env.GMAIL_APP_PASSWORD ? 'sent' : 'simulated'
    });

    return res.json({
      success: true,
      message: `کد ۶ رقمی یک‌بار مصرف به ایمیل مدیر (${adminEmail}) ارسال گردید.`,
      emailSentTo: adminEmail
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

    if (!adminSecurityState.activeOtp || Date.now() > adminSecurityState.activeOtp.expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'کد یک‌بار مصرف منقضی شده است یا درخواستی یافت نشد. لطفا کد جدید دریافت کنید.'
      });
    }

    if (!code || code.trim() !== adminSecurityState.activeOtp.code) {
      adminSecurityState.activeOtp.failedOtpCount += 1;

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

      if (adminSecurityState.activeOtp.failedOtpCount >= 5) {
        adminSecurityState.lockedUntil = Date.now() + 15 * 60 * 1000;
        adminSecurityState.activeOtp = null;
        return res.status(429).json({
          success: false,
          error: 'تعداد ۵ کد اشتباه وارد شد. ورود به پنل مدیریت به مدت ۱۵ دقیقه مسدود گردید.'
        });
      }

      return res.status(401).json({
        success: false,
        error: `کد تایید یک‌بار مصرف اشتباه است. (تلاش ${adminSecurityState.activeOtp.failedOtpCount} از ۵)`
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
  const gmailUser = process.env.GMAIL_USER;
  const isSmtpConfigured = !!(gmailUser && process.env.GMAIL_APP_PASSWORD);

  res.json({
    success: true,
    settings: {
      adminEmail,
      smtpConfigured: isSmtpConfigured,
      smtpUser: gmailUser || 'تنظیم نشده',
      activeSessionsCount: adminSecurityState.activeSessions.size,
      totalLogins: adminSecurityState.loginLogs.length
    }
  });
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

    // Send notification email to admin if SMTP configured
    const { adminEmail } = getAdminConfig();
    if (adminEmail) {
      const transporter = getTransporter();
      const gmailUser = process.env.GMAIL_USER;
      const sender = gmailUser ? `آکادمی ۴۰ دروازه <${gmailUser}>` : 'آکادمی ۴۰ دروازه';

      try {
        await transporter.sendMail({
          from: sender,
          to: adminEmail,
          subject: `💬 پیام جدید از فرم تماس: ${name.trim()}`,
          html: `
            <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 20px;">
              <h3 style="color: #4338ca;">پیام جدید از کاربر</h3>
              <p><strong>نام:</strong> ${name.trim()}</p>
              <p><strong>ایمیل:</strong> ${email.trim()}</p>
              <p><strong>موضوع:</strong> ${subject || 'پشتیبانی'}</p>
              <p><strong>متن پیام:</strong></p>
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px;">
                ${message.trim()}
              </div>
            </div>
          `
        });
      } catch (err) {
        console.warn('Could not send contact message alert email:', err);
      }
    }

    return res.json({ success: true, message: 'پیام شما در سیستم پشتیبانی ثبت شد.' });
  } catch (err: any) {
    console.error('Contact endpoint error:', err);
    return res.status(500).json({ success: false, error: 'خطا در ثبت پیام' });
  }
});

// Protected Contact Messages Endpoint for Admin
app.get('/api/admin/contact-messages', requireAdminAuth, (req, res) => {
  res.json({ success: true, messages: contactMessages });
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

// API Endpoint 3: Register / Welcome Email
app.post('/api/email/welcome', async (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'آدرس ایمیل الزامی است' });
    }

    const transporter = getTransporter();
    const gmailUser = process.env.GMAIL_USER;
    const isRealSmtp = !!(gmailUser && process.env.GMAIL_APP_PASSWORD);
    const sender = gmailUser ? `آکادمی ۴۰ دروازه <${gmailUser}>` : 'آکادمی ۴۰ دروازه';

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

    await transporter.sendMail({
      from: sender,
      to: email,
      subject: 'خوش آمدید به آکادمی ۴۰ دروازه | بیداری در قلمرو رویاها',
      html: htmlContent,
    });

    emailLogs.unshift({
      id: 'EML-' + Date.now(),
      type: 'welcome',
      to: email,
      subject: 'خوش آمدید به آکادمی ۴۰ دروازه',
      timestamp: new Date().toLocaleTimeString('fa-IR'),
      status: isRealSmtp ? 'sent' : 'simulated',
    });

    return res.json({ success: true, message: 'ایمیل خوش‌آمدگویی ارسال شد.' });
  } catch (err: any) {
    console.error('Email error:', err);
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

    const transporter = getTransporter();
    const gmailUser = process.env.GMAIL_USER;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
    const isRealSmtp = !!(gmailUser && process.env.GMAIL_APP_PASSWORD);
    const sender = gmailUser ? `آکادمی ۴۰ دروازه <${gmailUser}>` : 'آکادمی ۴۰ دروازه';

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

    let customerSent = false;
    let adminSent = false;

    // 1. Send email to Customer
    if (customerEmail && !customerEmail.includes('@40gates.ir')) {
      try {
        await transporter.sendMail({
          from: sender,
          to: customerEmail,
          subject: `تایید سفارش #${order.id} - آکادمی ۴۰ دروازه`,
          html: customerHtml,
        });
        customerSent = true;
        emailLogs.unshift({
          id: 'EML-' + Date.now(),
          type: 'order-customer',
          to: customerEmail,
          subject: `تایید سفارش #${order.id}`,
          timestamp: new Date().toLocaleTimeString('fa-IR'),
          status: isRealSmtp ? 'sent' : 'simulated',
        });
      } catch (custErr) {
        console.error('Failed to send customer order email:', custErr);
      }
    }

    // 2. Send email notification to Site Owner / Admin
    if (adminEmail) {
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

      try {
        await transporter.sendMail({
          from: sender,
          to: adminEmail,
          subject: `🔔 سفارش جدید ثبت شد #${order.id} - ${totalAmount.toLocaleString('fa-IR')} تومان`,
          html: ownerHtml,
        });
        adminSent = true;
        emailLogs.unshift({
          id: 'EML-ADM-' + Date.now(),
          type: 'order-admin',
          to: adminEmail,
          subject: `🔔 سفارش جدید ثبت شد #${order.id}`,
          timestamp: new Date().toLocaleTimeString('fa-IR'),
          status: isRealSmtp ? 'sent' : 'simulated',
        });
      } catch (adminErr) {
        console.error('Failed to send admin order email:', adminErr);
      }
    }

    return res.json({ 
      success: true, 
      message: 'ایمیل سفارش پردازش گردید.',
      customerSent,
      adminSent
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

    const transporter = getTransporter();
    const gmailUser = process.env.GMAIL_USER;
    const isRealSmtp = !!(gmailUser && process.env.GMAIL_APP_PASSWORD);
    const sender = gmailUser ? `آکادمی ۴۰ دروازه <${gmailUser}>` : 'آکادمی ۴۰ دروازه';

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

    await transporter.sendMail({
      from: sender,
      to: customerEmail,
      subject: `تغییر وضعیت سفارش #${orderId}: ${label} - آکادمی ۴۰ دروازه`,
      html: htmlContent,
    });

    emailLogs.unshift({
      id: 'EML-ST-' + Date.now(),
      type: 'order-status',
      to: customerEmail,
      subject: `بروزرسانی وضعیت سفارش #${orderId}`,
      timestamp: new Date().toLocaleTimeString('fa-IR'),
      status: isRealSmtp ? 'sent' : 'simulated',
    });

    return res.json({ success: true, message: 'ایمیل بروزرسانی وضعیت سفارش با موفقیت ارسال شد.' });
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
