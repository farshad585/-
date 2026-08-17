/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Client-Side API Helper for SMS.ir service through secure backend routes.
 * No API Keys or Secrets are exposed in this file or sent to the browser.
 */

export interface SmsResponse {
  success: boolean;
  status: 'sent' | 'simulated' | 'failed';
  message: string;
  messageId?: string | number;
  error?: string;
  alreadySent?: boolean;
}

export interface SmsStatusResponse {
  configured: boolean;
  hasApiKey: boolean;
  lineNumber: string;
  templates: {
    verify: boolean;
    passwordReset: boolean;
    newOrderAdmin: boolean;
    orderRegistered: boolean;
    orderShipped: boolean;
  };
}

export interface SmsLogItem {
  id: string;
  type: string;
  mobile: string;
  templateId: string | number;
  parameters: Array<{ name: string; value: string }>;
  timestamp: string;
  status: 'sent' | 'simulated' | 'failed';
  messageId?: string | number;
  errorDetails?: string;
}

/**
 * 1. Send User Verification / OTP SMS
 */
export async function sendVerifySms(data: {
  mobile: string;
  code?: string;
  name?: string;
}): Promise<SmsResponse> {
  try {
    const res = await fetch('/api/sms/send-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    console.warn('[SMS] Error sending verify SMS:', err);
    return {
      success: false,
      status: 'failed',
      message: 'خطا در ارتباط با سرور ارسال پیامک',
      error: err?.message,
    };
  }
}

/**
 * 2. Send Password Reset SMS
 */
export async function sendPasswordResetSms(data: {
  mobile: string;
  code?: string;
  newPassword?: string;
  name?: string;
}): Promise<SmsResponse> {
  try {
    const res = await fetch('/api/sms/send-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    console.warn('[SMS] Error sending password reset SMS:', err);
    return {
      success: false,
      status: 'failed',
      message: 'خطا در ارتباط با سرور ارسال پیامک بازیابی رمز',
      error: err?.message,
    };
  }
}

/**
 * 3. Send Order Registered SMS to Customer
 */
export async function sendOrderRegisteredSms(data: {
  mobile: string;
  orderId: string;
  amount?: number;
  customerName?: string;
}): Promise<SmsResponse> {
  try {
    const res = await fetch('/api/sms/send-order-registered', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    console.warn('[SMS] Error sending order registered SMS:', err);
    return {
      success: false,
      status: 'failed',
      message: 'خطا در ارسال پیامک ثبت سفارش',
      error: err?.message,
    };
  }
}

/**
 * 4. Send New Order Notification SMS to Admin / Site Owner
 */
export async function sendNewOrderAdminSms(data: {
  orderId: string;
  amount?: number;
  customerName?: string;
  mobile?: string;
}): Promise<SmsResponse> {
  try {
    const res = await fetch('/api/sms/send-new-order-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    console.warn('[SMS] Error sending admin order notification SMS:', err);
    return {
      success: false,
      status: 'failed',
      message: 'خطا در ارسال پیامک اطلاع‌رسانی به مدیر',
      error: err?.message,
    };
  }
}

/**
 * 5. Send Order Shipped SMS to Customer with Tracking Code
 */
export async function sendOrderShippedSms(data: {
  mobile: string;
  orderId: string;
  trackingCode?: string;
  customerName?: string;
}): Promise<SmsResponse> {
  try {
    const res = await fetch('/api/sms/send-order-shipped', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    console.warn('[SMS] Error sending order shipped SMS:', err);
    return {
      success: false,
      status: 'failed',
      message: 'خطا در ارسال پیامک کد رهگیری پستی',
      error: err?.message,
    };
  }
}

/**
 * Get SMS.ir System Configuration Status (Safe, without revealing keys)
 */
export async function getSmsStatus(): Promise<SmsStatusResponse | null> {
  try {
    const res = await fetch('/api/sms/status');
    const json = await res.json();
    return json?.status || null;
  } catch (err) {
    console.warn('[SMS] Failed to fetch status:', err);
    return null;
  }
}

/**
 * Get SMS Sent Logs for Admin Panel
 */
export async function getSmsLogs(): Promise<SmsLogItem[]> {
  try {
    const res = await fetch('/api/sms/logs');
    const json = await res.json();
    return json?.logs || [];
  } catch (err) {
    console.warn('[SMS] Failed to fetch logs:', err);
    return [];
  }
}

/**
 * Test SMS Template from Admin Panel
 */
export async function testSmsTemplate(data: {
  templateType: 'verify' | 'password_reset' | 'new_order_admin' | 'order_registered' | 'order_shipped';
  mobile: string;
  customParameters?: Array<{ name: string; value: string }>;
}): Promise<SmsResponse> {
  try {
    const res = await fetch('/api/sms/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      status: 'failed',
      message: 'خطا در ارسال پیامک آزمایشی',
      error: err?.message,
    };
  }
}
