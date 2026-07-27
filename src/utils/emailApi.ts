/**
 * Client-side utility functions to send automated email notifications
 * via the backend server (/api/email/*).
 */

export interface SendWelcomeEmailParams {
  email: string;
  fullName?: string;
}

export interface SendOrderEmailParams {
  order: any;
  customerEmail: string;
  customerName?: string;
}

export interface SendOrderStatusEmailParams {
  orderId: string;
  newStatus: string;
  trackingCode?: string;
  customerEmail: string;
  customerName?: string;
}

/**
 * Send Welcome Email upon user registration or profile update
 */
export async function sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Failed to dispatch welcome email:', err);
    return { success: false, message: 'ارسال ایمیل با خطا مواجه شد' };
  }
}

/**
 * Send Order Creation Email to Customer and Admin via server endpoint
 */
export async function sendOrderCreatedEmail(params: SendOrderEmailParams): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/email/order-created', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Failed to dispatch order email:', err);
    return { success: false, message: 'ارسال ایمیل سفارش با خطا مواجه شد' };
  }
}

/**
 * Send Order Status Change Email (Confirmation, Preparing, Shipped with Post Code)
 */
export async function sendOrderStatusEmail(params: SendOrderStatusEmailParams): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/email/order-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Failed to dispatch status email:', err);
    return { success: false, message: 'ارسال ایمیل تغییر وضعیت با خطا مواجه شد' };
  }
}
