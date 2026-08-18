import express from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global CORS Middleware for Vercel and Cross-Origin requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-admin-token');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Vercel serverless helper: Ensure request paths start with /api if invoked via Vercel function
app.use((req, res, next) => {
  if (process.env.VERCEL) {
    if (!req.url.startsWith('/api') && !req.url.startsWith('/index.html') && !req.url.startsWith('/assets')) {
      req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
    }
  }
  next();
});

// Runtime Supabase Config Store
const runtimeSupabaseConfig = {
  url: (process.env.VITE_SUPABASE_URL || '').trim(),
  anonKey: (process.env.VITE_SUPABASE_ANON_KEY || '').trim(),
  serviceKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
};

function getSupabaseClient() {
  const url = (process.env.VITE_SUPABASE_URL || runtimeSupabaseConfig.url || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || runtimeSupabaseConfig.serviceKey || process.env.VITE_SUPABASE_ANON_KEY || runtimeSupabaseConfig.anonKey || '').trim();
  if (!url || !key || url.includes('placeholder')) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

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
 * Utility to sanitize sensitive details (passwords, tokens, credentials) from error messages and logs.
 */
export function sanitizeErrorLog(message: string, secrets: string[] = []): string {
  if (!message) return '';
  let sanitized = String(message);

  // Redact known secrets (e.g. gmail pass, app passwords)
  const activeSecrets = [
    runtimeSmtpConfig.pass,
    process.env.GMAIL_APP_PASSWORD,
    process.env.ADMIN_PASSWORD,
    process.env.ADMIN_SECRET,
    ...secrets
  ].filter((s): s is string => Boolean(s && s.length >= 4));

  for (const secret of activeSecrets) {
    const trimmedSecret = secret.trim();
    if (trimmedSecret) {
      // Escape special characters for RegExp
      const escaped = trimmedSecret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      sanitized = sanitized.replace(new RegExp(escaped, 'gi'), '***REDACTED***');
    }
  }

  // Redact generic authorization or password strings in log traces if any
  sanitized = sanitized.replace(/(pass|password|auth|token|secret|key)=["']?[^"'\s&]+["']?/gi, '$1=***REDACTED***');
  return sanitized;
}

/**
 * Universal Fast & Safe Email Sending Helper Function
 * Handles timeouts, network glitches, and auth errors gracefully.
 * Configured with 15s timeouts optimized for Vercel serverless execution limits.
 */
export async function sendMailSafely(
  options: nodemailer.SendMailOptions,
  type: string = 'general'
): Promise<{ success: boolean; status: 'sent' | 'simulated' | 'failed'; error?: string; messageId?: string }> {
  let gmailUser = (runtimeSmtpConfig.user || process.env.GMAIL_USER || '').trim();
  let rawPass = (runtimeSmtpConfig.pass || process.env.GMAIL_APP_PASSWORD || '').trim();
  let gmailPass = rawPass.replace(/\s+/g, ''); // strip any accidental copy-paste spaces

  // On Vercel / Serverless, if memory config is empty, attempt loading from Supabase DB site_settings
  if ((!gmailUser || !gmailPass) && getSupabaseClient()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const { data } = await client.from('site_settings').select('value').eq('id', 'smtp_config').single();
        if (data && data.value) {
          if (!gmailUser && data.value.user) gmailUser = String(data.value.user).trim();
          if (!gmailPass && data.value.pass) gmailPass = String(data.value.pass).trim().replace(/\s+/g, '');
          if (data.value.adminEmail) runtimeSmtpConfig.adminEmail = String(data.value.adminEmail).trim();
          runtimeSmtpConfig.user = gmailUser;
          runtimeSmtpConfig.pass = gmailPass;
        }
      }
    } catch (dbErr: any) {
      console.warn('Could not fetch SMTP config from Supabase:', sanitizeErrorLog(dbErr?.message || String(dbErr)));
    }
  }

  const to = Array.isArray(options.to) ? options.to.join(', ') : String(options.to || '');
  const subject = String(options.subject || '');
  const sender = options.from || (gmailUser ? `آکادمی ۴۰ دروازه <${gmailUser}>` : 'آکادمی ۴۰ دروازه <40gates.main@gmail.com>');

  if (gmailUser && gmailPass) {
    const trySendWithTransporter = async (port: number, secure: boolean) => {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port,
        secure,
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 15000, // 15s connection timeout optimized for Vercel Serverless Function limits
        greetingTimeout: 15000,
        socketTimeout: 15000,
      });

      return await transporter.sendMail({
        ...options,
        from: sender,
      });
    };

    try {
      let info;
      try {
        // Try Port 465 with direct SSL first (most reliable on Vercel cloud serverless)
        info = await trySendWithTransporter(465, true);
      } catch (sslErr: any) {
        const safeSslErrMsg = sanitizeErrorLog(sslErr?.message || String(sslErr), [gmailPass]);
        console.warn(`⚠️ [SMTP 465 SSL failed, trying 587 STARTTLS fallback...]`, safeSslErrMsg);
        info = await trySendWithTransporter(587, false);
      }

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
      const rawErrMsg = err?.message || String(err);
      const safeErrMsg = sanitizeErrorLog(rawErrMsg, [gmailPass]);
      console.error(`❌ [GMAIL SMTP ERROR] To: ${to} | Error:`, safeErrMsg);

      emailLogs.unshift({
        id: 'EML-ERR-' + Date.now(),
        type,
        to,
        subject: `[خطا] ${subject}`,
        timestamp: new Date().toLocaleTimeString('fa-IR'),
        status: 'failed',
        errorDetails: safeErrMsg,
      });

      return {
        success: false,
        status: 'failed',
        error: `خطا در اتصال یا احراز هویت Gmail SMTP: ${safeErrMsg}`,
      };
    }
  }

  console.warn(`⚠️ [EMAIL NOT SENT - SMTP CREDENTIALS MISSING] GMAIL_USER or GMAIL_APP_PASSWORD not set in environment or database. Attempted To: ${to} | Subject: ${subject}`);
  emailLogs.unshift({
    id: 'EML-SIM-' + Date.now(),
    type,
    to,
    subject: `[پیکربندی نشده] ${subject}`,
    timestamp: new Date().toLocaleTimeString('fa-IR'),
    status: 'simulated',
    errorDetails: 'متغیرهای GMAIL_USER و GMAIL_APP_PASSWORD در تنظیمات Vercel یا پنل مدیریت تعریف نشده‌اند.'
  });

  return {
    success: false,
    status: 'simulated',
    error: 'سرویس ایمیل به دلیل عدم تنظیم GMAIL_USER یا GMAIL_APP_PASSWORD در Vercel فعال نیست.',
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

// Server-side TOTP Secret Management and Temp Token Helper Functions
let runtimeTotpSecret = (process.env.ADMIN_TOTP_SECRET || '').trim();

async function getStoredTotpSecret(): Promise<{ secret: string; isSetup: boolean }> {
  if (runtimeTotpSecret) {
    return { secret: runtimeTotpSecret, isSetup: true };
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data } = await client.from('site_settings').select('value').eq('id', 'admin_totp_config').single();
      if (data && data.value && data.value.secret) {
        runtimeTotpSecret = String(data.value.secret).trim();
        return { secret: runtimeTotpSecret, isSetup: data.value.isSetup !== false };
      }
    } catch (e) {
      console.warn('Could not read admin_totp_config from Supabase:', e);
    }
  }

  return { secret: '', isSetup: false };
}

async function saveTotpSecret(secret: string, isSetup: boolean = true) {
  runtimeTotpSecret = secret;
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('site_settings').upsert({
        id: 'admin_totp_config',
        value: {
          secret,
          isSetup,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (e) {
      console.warn('Could not save admin_totp_config to Supabase:', e);
    }
  }
}

function createTempTotpToken(email: string, tempSecret: string, requireSetup: boolean): string {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  const payloadStr = JSON.stringify({ email, tempSecret, requireSetup, expiresAt });
  const b64Payload = Buffer.from(payloadStr).toString('base64url');
  const hmac = crypto.createHmac('sha256', ADMIN_SECRET).update(b64Payload).digest('hex');
  return `tmp_${b64Payload}_${hmac}`;
}

function verifyTempTotpToken(token: string): { valid: boolean; payload?: { email: string; tempSecret: string; requireSetup: boolean; expiresAt: number } } {
  if (!token || typeof token !== 'string' || !token.startsWith('tmp_')) return { valid: false };
  try {
    const parts = token.split('_');
    if (parts.length !== 3) return { valid: false };
    const b64Payload = parts[1];
    const signature = parts[2];
    const expectedHmac = crypto.createHmac('sha256', ADMIN_SECRET).update(b64Payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
      return { valid: false };
    }
    const payloadStr = Buffer.from(b64Payload, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadStr);
    if (Date.now() > payload.expiresAt) return { valid: false };
    return { valid: true, payload };
  } catch (e) {
    return { valid: false };
  }
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

const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || '40gates-master-key-2026';

function generateAdminToken(email: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${email}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  const b64Email = Buffer.from(email).toString('base64');
  return `adm_${expiresAt}_${hmac}_${b64Email}`;
}

function verifyAdminToken(token: string): { valid: boolean; email?: string } {
  if (!token || typeof token !== 'string' || !token.startsWith('adm_')) return { valid: false };
  try {
    const parts = token.split('_');
    if (parts.length < 4) return { valid: false };
    const expiresAt = parseInt(parts[1], 10);
    const signature = parts[2];
    const email = Buffer.from(parts[3], 'base64').toString('utf-8');

    if (isNaN(expiresAt) || Date.now() > expiresAt) return { valid: false };

    const payload = `${email}:${expiresAt}`;
    const expectedHmac = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
      return { valid: true, email };
    }
  } catch (e) {
    // fallback
  }
  return { valid: false };
}

function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'دسترسی غیرمجاز. لطفا وارد شوید.' });
  }

  const token = authHeader.split(' ')[1];
  let session = adminSecurityState.activeSessions.get(token);

  if (!session) {
    const verified = verifyAdminToken(token);
    if (verified.valid) {
      session = {
        token,
        email: verified.email || '40gates.main@gmail.com',
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };
      adminSecurityState.activeSessions.set(token, session);
    }
  }

  if (!session || Date.now() > session.expiresAt) {
    if (session) adminSecurityState.activeSessions.delete(token);
    return res.status(401).json({ success: false, error: 'نشست مدیریتی منقضی شده است. لطفا مجددا وارد شوید.' });
  }

  // Extend session expiry
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  (req as any).adminSession = session;
  next();
}

async function syncOrdersFromSupabase(): Promise<any[]> {
  const client = getSupabaseClient();
  if (!client) return serverOrdersStore;
  try {
    const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && Array.isArray(data) && data.length > 0) {
      const dbOrders = data.map(item => item.data || item);
      for (const order of dbOrders) {
        if (order && order.id && !serverOrdersStore.some(o => o.id === order.id)) {
          serverOrdersStore.push(order);
        }
      }
    }
  } catch (e) {
    console.warn('Supabase orders sync warn:', e);
  }
  return serverOrdersStore;
}

async function persistOrderToSupabase(order: any) {
  const client = getSupabaseClient();
  if (!client || !order || !order.id) return;
  try {
    await client.from('orders').upsert({
      id: order.id,
      data: order,
      user_email: order.userEmail || order.shippingAddress?.email || '',
      created_at: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Supabase save order warn:', e);
  }
}

// API Endpoint 1: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Dynamic SEO Sitemap XML Endpoint
app.get('/sitemap.xml', (req, res) => {
  const publicSitemap = path.join(process.cwd(), 'public', 'sitemap.xml');
  const distSitemap = path.join(process.cwd(), 'dist', 'sitemap.xml');
  
  if (fs.existsSync(publicSitemap)) {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.sendFile(publicSitemap);
  } else if (fs.existsSync(distSitemap)) {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.sendFile(distSitemap);
  }
  
  res.status(404).send('Sitemap file not found.');
});

// Dynamic Robots.txt Endpoint
app.get('/robots.txt', (req, res) => {
  const publicRobots = path.join(process.cwd(), 'public', 'robots.txt');
  const distRobots = path.join(process.cwd(), 'dist', 'robots.txt');
  
  if (fs.existsSync(publicRobots)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.sendFile(publicRobots);
  } else if (fs.existsSync(distRobots)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.sendFile(distRobots);
  }
  
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://40gates.ir/sitemap.xml\n");
});

// Server Products Store & Supabase Sync
let serverProductsStore: any[] = [];

async function syncProductsFromSupabase(): Promise<any[]> {
  const client = getSupabaseClient();
  if (!client) return serverProductsStore;
  try {
    const { data, error } = await client.from('products').select('*');
    if (!error && Array.isArray(data) && data.length > 0) {
      serverProductsStore = data.map(item => item.data || item);
    }
  } catch (e) {
    console.warn('Supabase products sync warn:', e);
  }
  return serverProductsStore;
}

async function persistProductsToSupabase(productsList: any[]) {
  const client = getSupabaseClient();
  if (!client || !Array.isArray(productsList) || productsList.length === 0) return;
  try {
    const rows = productsList.map(p => ({
      id: p.id,
      data: p,
      stock: p.stock,
      price: p.price,
      updated_at: new Date().toISOString()
    }));
    await client.from('products').upsert(rows);
  } catch (e) {
    console.warn('Supabase save products warn:', e);
  }
}

// GET & POST Products API
app.get('/api/products', async (req, res) => {
  let products = await syncProductsFromSupabase();
  res.json({ success: true, products });
});

app.post('/api/products', async (req, res) => {
  try {
    const { products: newProducts, product: singleProduct } = req.body;
    if (Array.isArray(newProducts) && newProducts.length > 0) {
      serverProductsStore = newProducts;
      persistProductsToSupabase(newProducts).catch(e => console.warn('Products persist warn:', e));
    } else if (singleProduct && singleProduct.id) {
      const idx = serverProductsStore.findIndex(p => p.id === singleProduct.id);
      if (idx >= 0) {
        serverProductsStore[idx] = { ...serverProductsStore[idx], ...singleProduct };
      } else {
        serverProductsStore.unshift(singleProduct);
      }
      persistProductsToSupabase(serverProductsStore).catch(e => console.warn('Product persist warn:', e));
    }
    res.json({ success: true, products: serverProductsStore });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message });
  }
});
app.get('/api/orders', async (req, res) => {
  const orders = await syncOrdersFromSupabase();
  res.json({ success: true, orders });
});

app.post('/api/orders', async (req, res) => {
  try {
    const { order } = req.body;
    if (order && order.id) {
      const existingIdx = serverOrdersStore.findIndex(o => o.id === order.id);
      if (existingIdx >= 0) {
        serverOrdersStore[existingIdx] = { ...serverOrdersStore[existingIdx], ...order };
      } else {
        serverOrdersStore.unshift(order);
      }

      // Persist to Supabase asynchronously
      persistOrderToSupabase(order).catch(e => console.warn('Order persist warn:', e));

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

      // Send order notification emails (Separately to Customer & Admin)
      const adminEmail = runtimeSmtpConfig.adminEmail || process.env.ADMIN_EMAIL || '40gates.main@gmail.com';
      const items = order.items || [];
      const totalAmount = order.totalAmount || 0;
      const subtotal = order.subtotal || 0;
      const shippingFee = order.shippingFee || 0;

      const itemsHtml = items.map((item: any) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px; font-size: 13px;">${item.title || 'محصول'} (${item.quantity || 1} عدد)</td>
          <td style="padding: 10px; font-size: 13px; text-align: left; font-weight: bold; color: #4338ca;">
            ${((item.price || 0) * (item.quantity || 1)).toLocaleString('fa-IR')} تومان
          </td>
        </tr>
      `).join('');

      // 1. Send confirmation email to Customer (if email is provided)
      if (custEmail) {
        sendMailSafely({
          to: custEmail,
          subject: `🛒 تایید ثبت سفارش #${order.id} - آکادمی ۴۰ دروازه`,
          html: `
            <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 25px; color: #1e293b;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <div style="background: linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95); padding: 25px 20px; text-align: center; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 20px; color: #fbbf24;">تایید ثبت سفارش - آکادمی ۴۰ دروازه</h1>
                  <p style="margin: 6px 0 0 0; font-size: 12px; color: #e0e7ff;">شماره سفارش: ${order.id}</p>
                </div>
                <div style="padding: 25px; font-size: 13px; line-height: 1.8;">
                  <p>سلام <strong>${custName || 'هنرجوی گرامی'}</strong> عزیز،</p>
                  <p>سفارش شما با شماره <strong>#${order.id}</strong> با موفقیت ثبت شد و در مرحله پردازش قرار گرفت.</p>
                  <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                    <thead>
                      <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <th style="padding: 8px; text-align: right; font-size: 12px; color: #64748b;">محصول</th>
                        <th style="padding: 8px; text-align: left; font-size: 12px; color: #64748b;">مبلغ</th>
                      </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                  </table>
                  <div style="background-color: #f8fafc; border-radius: 12px; padding: 15px; margin: 15px 0;">
                    <p style="margin: 4px 0;">جمع کل: <strong>${subtotal.toLocaleString('fa-IR')} تومان</strong></p>
                    ${shippingFee > 0 ? `<p style="margin: 4px 0;">هزینه ارسال: <strong>${shippingFee.toLocaleString('fa-IR')} تومان</strong></p>` : ''}
                    <p style="margin: 8px 0 0 0; font-size: 15px; font-weight: bold; color: #1e1b4b; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
                      مبلغ نهایی پرداختی: ${totalAmount.toLocaleString('fa-IR')} تومان
                    </p>
                  </div>
                  <p style="font-size: 12px; color: #64748b;">وضعیت سفارش از طریق همین ایمیل و پیامک به شما اطلاع‌رسانی خواهد شد.</p>
                </div>
                <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                  پشتیبانی آکادمی ۴۰ دروازه
                </div>
              </div>
            </div>
          `
        }, 'order-customer').catch(e => console.warn('Customer order email err:', e));
      }

      // 2. Send distinct notification email to Admin
      sendMailSafely({
        to: adminEmail,
        subject: `🔔 سفارش جدید ثبت شد #${order.id} - ${totalAmount.toLocaleString('fa-IR')} تومان`,
        html: `
          <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 25px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
            <h2 style="color: #38bdf8; margin-top: 0;">🛒 سفارش جدید در وب‌سایت ثبت شد!</h2>
            <p><strong>شماره سفارش:</strong> ${order.id}</p>
            <p><strong>نام خریدار:</strong> ${custName || 'نامشخص'}</p>
            <p><strong>ایمیل خریدار:</strong> ${custEmail || 'ثبت نشده'}</p>
            <p><strong>تلفن خریدار:</strong> ${custPhone || '-'}</p>
            <p><strong>مبلغ کل:</strong> ${totalAmount.toLocaleString('fa-IR')} تومان</p>
            <p><strong>آدرس:</strong> ${order.shippingAddress?.address || 'دیجیتال / آنلاین'}</p>
            <hr style="border-color: #334155; margin: 15px 0;"/>
            <h4 style="color: #fbbf24; margin: 0 0 10px 0;">اقلام سفارش:</h4>
            <ul>
              ${items.map((i: any) => `<li>${i.title || 'محصول'} - ${i.quantity || 1} عدد (${((i.price || 0) * (i.quantity || 1)).toLocaleString('fa-IR')} تومان)</li>`).join('')}
            </ul>
          </div>
        `
      }, 'order-admin-notify').catch(e => console.warn('Admin order email err:', e));
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

app.post('/api/users/register', async (req, res) => {
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

        // Notify site admin about new registration
        const adminEmail = runtimeSmtpConfig.adminEmail || process.env.ADMIN_EMAIL || process.env.GMAIL_USER || '40gates.main@gmail.com';
        await sendMailSafely({
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
        }, 'user-register-admin-notify');
      }
    }
    res.json({ success: true, users: registeredUsersStore });
  } catch (e: any) {
    res.status(500).json({ success: false, error: 'خطا در ثبت اطلاعات کاربر' });
  }
});

// Admin Auth Step 1: Login Check & TOTP Initialization
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

    // Strict credential validation against ADMIN_EMAIL and ADMIN_PASSWORD
    const isValidEmail = inputEmail === adminEmail.toLowerCase();
    const isValidPass = inputPass === adminPassword;

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

    // Credentials match! Reset failed password attempt counter
    adminSecurityState.failedPasswordCount = 0;

    const { secret, isSetup } = await getStoredTotpSecret();

    if (isSetup && secret) {
      // 2FA is already configured! Generate short-lived temporary token for step 2
      const tempToken = createTempTotpToken(adminEmail, '', false);
      return res.json({
        success: true,
        require2faSetup: false,
        tempToken,
        message: 'کد ۶ رقمی نرم‌افزار Google Authenticator یا Microsoft Authenticator خود را وارد نمایید.'
      });
    } else {
      // First-time 2FA Setup Flow: Generate a unique secret and QR code
      const newSecret = generateSecret();
      const otpauthUrl = generateURI({ issuer: '40Gates Academy', label: adminEmail, secret: newSecret });
      const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);
      const tempToken = createTempTotpToken(adminEmail, newSecret, true);

      return res.json({
        success: true,
        require2faSetup: true,
        tempToken,
        qrCodeUrl,
        secretKey: newSecret,
        message: 'برای اولین ورود، تصویر QR کد زیر را با نرم‌افزار Google Authenticator یا Microsoft Authenticator اسکن کنید.'
      });
    }

  } catch (err: any) {
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, error: 'خطا در فرآیند احراز هویت اولیه مدیر' });
  }
});

// Admin Auth Step 2: Verify TOTP Code (supports /api/admin/verify-totp and /api/admin/verify-otp)
const handleVerifyTotpHandler = async (req: express.Request, res: express.Response) => {
  try {
    if (Date.now() < adminSecurityState.lockedUntil) {
      const remainingMinutes = Math.ceil((adminSecurityState.lockedUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        error: `حساب مدیریت قفل شده است. لطفا ${remainingMinutes} دقیقه دیگر صبر کنید.`
      });
    }

    const { tempToken, code } = req.body;
    const { adminEmail } = getAdminConfig();
    const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();

    const verifiedTemp = verifyTempTotpToken(tempToken);
    if (!verifiedTemp.valid || !verifiedTemp.payload) {
      return res.status(401).json({
        success: false,
        error: 'نشست زمان‌دار ورود منقضی شده یا معتبر نیست. لطفاً مجدداً ایمیل و رمز عبور را وارد نمایید.'
      });
    }

    const { tempSecret, requireSetup } = verifiedTemp.payload;
    const inputCode = (code || '').toString().trim().replace(/\s+/g, '');

    if (!inputCode || inputCode.length !== 6 || !/^\d{6}$/.test(inputCode)) {
      return res.status(400).json({
        success: false,
        error: 'لطفاً کد ۶ رقمی را به طور کامل وارد کنید.'
      });
    }

    let secretToVerify = tempSecret;
    if (!requireSetup) {
      const stored = await getStoredTotpSecret();
      secretToVerify = stored.secret;
    }

    if (!secretToVerify) {
      return res.status(400).json({
        success: false,
        error: 'کلید احراز هویت یافت نشد. لطفاً مجدداً تلاش کنید.'
      });
    }

    const checkResult = verifySync({ token: inputCode, secret: secretToVerify, epochTolerance: 30 });
    const isValidCode = checkResult && checkResult.valid === true;

    if (!isValidCode) {
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

      return res.status(401).json({
        success: false,
        error: 'کد ۶ رقمی نرم‌افزار Authenticator اشتباه است. لطفاً کد جدید نمایش داده شده در اپلیکیشن را وارد کنید.'
      });
    }

    // Code is VALID!
    if (requireSetup) {
      // Save secret permanently
      await saveTotpSecret(tempSecret, true);
    }

    adminSecurityState.failedPasswordCount = 0;

    const token = generateAdminToken(adminEmail);
    adminSecurityState.activeSessions.set(token, {
      token,
      email: adminEmail,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 Days session
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
      message: requireSetup 
        ? 'احراز هویت دو عاملی با موفقیت راه‌اندازی و وارد شدید.' 
        : 'ورود به پنل مدیریت با موفقیت انجام شد.'
    });

  } catch (err: any) {
    console.error('Verify TOTP error:', err);
    return res.status(500).json({ success: false, error: 'خطا در بررسی کد احراز هویت دو عاملی' });
  }
};

app.post('/api/admin/verify-totp', handleVerifyTotpHandler);
app.post('/api/admin/verify-otp', handleVerifyTotpHandler);

// Admin Auth: Reset TOTP 2FA secret
app.post('/api/admin/reset-totp', requireAdminAuth, async (req, res) => {
  try {
    await saveTotpSecret('', false);
    return res.json({
      success: true,
      message: 'تنظیمات احراز هویت دو عاملی (TOTP) بازنشانی گردید. در ورود بعدی می‌توانید QR کد جدیدی را اسکن کنید.'
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: 'خطا در بازنشانی تنظیمات 2FA' });
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
app.post('/api/admin/smtp-config', requireAdminAuth, async (req, res) => {
  try {
    const { gmailUser, gmailPass, adminEmail } = req.body;
    if (gmailUser !== undefined && gmailUser !== '') runtimeSmtpConfig.user = gmailUser.trim();
    if (gmailPass !== undefined && gmailPass !== '') runtimeSmtpConfig.pass = gmailPass.trim();
    if (adminEmail !== undefined && adminEmail !== '') runtimeSmtpConfig.adminEmail = adminEmail.trim();

    const isSmtpConfigured = !!(runtimeSmtpConfig.user && runtimeSmtpConfig.pass);

    // Save to Supabase DB so Vercel Serverless Functions can read it across stateless requests
    if (getSupabaseClient()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          await client.from('site_settings').upsert({
            id: 'smtp_config',
            value: {
              user: runtimeSmtpConfig.user,
              pass: runtimeSmtpConfig.pass,
              adminEmail: runtimeSmtpConfig.adminEmail,
              updatedAt: new Date().toISOString()
            }
          });
        }
      } catch (dbErr) {
        console.warn('Could not persist SMTP config to Supabase:', dbErr);
      }
    }

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
const handleContactMessage = async (req: express.Request, res: express.Response) => {
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
    await sendMailSafely({
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
    }, 'contact-admin-notify');

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

    await sendMailSafely({
      to: email.trim(),
      subject: `✨ دریافت پیام شما در آکادمی ۴۰ دروازه (کد تیکت: ${newMessage.id})`,
      html: userHtml
    }, 'contact-user-autoreply');

    return res.json({ 
      success: true, 
      message: 'پیام شما ثبت شد. یک ایمیل تاییدیه دریافت پیام به آدرس ایمیل شما ارسال گردید.',
      ticketId: newMessage.id
    });
  } catch (err: any) {
    console.error('Contact endpoint error:', err);
    return res.status(500).json({ success: false, error: 'خطا در ثبت پیام' });
  }
};

app.post('/api/contact', handleContactMessage);
app.post('/api/email/contact', handleContactMessage);

// Protected Contact Messages Endpoint for Admin
app.get('/api/admin/contact-messages', requireAdminAuth, (req, res) => {
  res.json({ success: true, messages: contactMessages });
});

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

// API Endpoint: Password Reset Email
app.post('/api/email/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'آدرس ایمیل معتبر الزامی است.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const adminEmail = runtimeSmtpConfig.adminEmail || process.env.ADMIN_EMAIL || '40gates.main@gmail.com';

    // 1. Send instruction email to the requesting user
    const userResetHtml = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 25px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #4338ca; margin: 0 0 8px 0;">🔑 بازیابی کلمه عبور - آکادمی ۴۰ دروازه</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0;">راهنمای تنظیم مجدد گذرواژه حساب کاربری</p>
          </div>

          <p style="font-size: 14px; line-height: 1.8; color: #334155;">
            سلام دوست گرامی؛<br/>
            درخواست بازیابی کلمه عبور برای حساب کاربری متصل به ایمیل <strong>${cleanEmail}</strong> ثبت شده است.
          </p>

          <div style="background-color: #f1f5f9; border-right: 4px solid #6366f1; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px; line-height: 1.8;">
            جهت تسریع در بازیابی کلمه عبور و حفظ امنیت حساب، لطفاً با ایمیل پشتیبانی به آدرس <a href="mailto:${adminEmail}" style="color: #2563eb; font-weight: bold;">${adminEmail}</a> یا پشتیبانی تلگرام <a href="https://t.me/Farshad_God" style="color: #2563eb; font-weight: bold;">t.me/Farshad_God</a> در ارتباط باشید.
          </div>

          <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 20px;">
            اگر این درخواست توسط شما ثبت نشده است، می‌توانید این ایمیل را نادیده بگیرید.
          </p>
        </div>
      </div>
    `;

    const userEmailResult = await sendMailSafely({
      to: cleanEmail,
      subject: '🔑 درخواست بازیابی کلمه عبور در آکادمی ۴۰ دروازه',
      html: userResetHtml,
    }, 'forgot-password');

    // 2. Notify site admin about password reset request
    sendMailSafely({
      to: adminEmail,
      subject: `🔑 درخواست بازیابی کلمه عبور: ${cleanEmail}`,
      html: `
        <div dir="rtl" style="font-family: Tahoma, sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
          <h3 style="color: #fbbf24;">🔑 درخواست بازیابی رمز عبور جدید ثبت شد</h3>
          <p><strong>ایمیل کاربر:</strong> ${cleanEmail}</p>
          <p><strong>تاریخ و زمان:</strong> ${new Date().toLocaleDateString('fa-IR')} - ساعت ${new Date().toLocaleTimeString('fa-IR')}</p>
        </div>
      `
    }, 'forgot-password-admin-notify').catch(e => console.warn('Admin password reset notify err:', e));

    return res.json({
      success: true,
      message: 'دستورالعمل بازیابی کلمه عبور به ایمیل شما ارسال شد.',
      status: userEmailResult.status
    });
  } catch (err: any) {
    console.error('Forgot password endpoint error:', err);
    return res.status(500).json({ success: false, error: 'خطا در فرآیند بازیابی کلمه عبور' });
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
      message: 'بروزرسانی وضعیت سفارش پردازش شد.',
      status: statusEmailResult.status
    });
  } catch (err: any) {
    console.error('Status email error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'خطا در بروزرسانی وضعیت' });
  }
});


async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
