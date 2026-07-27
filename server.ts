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

// API Endpoint 1: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
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
    const adminEmail = process.env.ADMIN_EMAIL;
    const isRealSmtp = !!(gmailUser && process.env.GMAIL_APP_PASSWORD);
    const sender = gmailUser ? `آکادمی ۴۰ دروازه <${gmailUser}>` : 'آکادمی ۴۰ دروازه';

    const itemsHtml = order.items.map((item: any) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px; font-size: 13px;">${item.title} (${item.quantity} عدد)</td>
        <td style="padding: 10px; font-size: 13px; text-align: left; font-weight: bold; color: #4338ca;">
          ${(item.price * item.quantity).toLocaleString('fa-IR')} تومان
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
                <span>جمع کل اقلام:</span> <strong>${order.subtotal.toLocaleString('fa-IR')} تومان</strong>
              </p>
              ${order.shippingFee > 0 ? `
              <p style="margin: 4px 0; display: flex; justify-content: space-between;">
                <span>هزینه ارسال پستی:</span> <strong>${order.shippingFee.toLocaleString('fa-IR')} تومان</strong>
              </p>` : ''}
              <p style="margin: 8px 0 0 0; font-size: 15px; font-weight: bold; color: #1e1b4b; border-top: 1px border-dashed #cbd5e1; padding-top: 8px;">
                مبلغ نهایی پرداختی: ${order.totalAmount.toLocaleString('fa-IR')} تومان
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

    // Send email to Customer
    await transporter.sendMail({
      from: sender,
      to: customerEmail,
      subject: `تایید سفارش #${order.id} - آکادمی ۴۰ دروازه`,
      html: customerHtml,
    });

    emailLogs.unshift({
      id: 'EML-' + Date.now(),
      type: 'order-customer',
      to: customerEmail,
      subject: `تایید سفارش #${order.id}`,
      timestamp: new Date().toLocaleTimeString('fa-IR'),
      status: isRealSmtp ? 'sent' : 'simulated',
    });

    // Send email notification to Site Owner (Admin) if ADMIN_EMAIL is configured
    if (adminEmail) {
      const ownerHtml = `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 20px; color: #0f172a;">
          <h2 style="color: #047857;">🔔 سفارش جدید در وبسایت ثبت شد!</h2>
          <p><strong>شماره سفارش:</strong> ${order.id}</p>
          <p><strong>نام مشتری:</strong> ${customerName || order.shippingAddress?.fullName || 'ثبت شده'}</p>
          <p><strong>ایمیل مشتری:</strong> ${customerEmail}</p>
          <p><strong>تلفن مشتری:</strong> ${order.shippingAddress?.phone || '-'}</p>
          <p><strong>مبلغ کل:</strong> ${order.totalAmount.toLocaleString('fa-IR')} تومان</p>
          <p><strong>درگاه پرداخت:</strong> ${order.paymentGateway}</p>
          <p><strong>آدرس ارسال:</strong> ${order.shippingAddress?.address || 'ارسال دیجیتال/آنلاین'}</p>
          <hr/>
          <h4>اقلام سفارش:</h4>
          <ul>
            ${order.items.map((i: any) => `<li>${i.title} - ${i.quantity} عدد (${i.price.toLocaleString('fa-IR')} تومان)</li>`).join('')}
          </ul>
        </div>
      `;

      await transporter.sendMail({
        from: sender,
        to: adminEmail,
        subject: `🔔 سفارش جدید ثبت شد #${order.id} - ${order.totalAmount.toLocaleString('fa-IR')} تومان`,
        html: ownerHtml,
      });

      emailLogs.unshift({
        id: 'EML-ADM-' + Date.now(),
        type: 'order-admin',
        to: adminEmail,
        subject: `🔔 سفارش جدید ثبت شد #${order.id}`,
        timestamp: new Date().toLocaleTimeString('fa-IR'),
        status: isRealSmtp ? 'sent' : 'simulated',
      });
    }

    return res.json({ success: true, message: 'ایمیل سفارش با موفقیت ارسال گردید.' });
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
