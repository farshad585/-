/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Rate Limiting & Anti-Abuse Protection Module for 40 Gates Academy Backend
 * 
 * Rules Enforced:
 * 1. Forgot Password: Max 3 requests in 24 hours per email + min 10 min cooldown between successful requests.
 * 2. Order Creation: Max 2 orders in 24 hours per user (by email/phone/userId).
 * 3. Free Orders: If final order total is 0 (or <= 0), skip transactional emails entirely.
 * 4. Anti-Duplicate Emails: Exactly 1 email per order event (idempotency key prevents replay abuse).
 * 5. Contact Form: Max 3 submissions in 24 hours per user / email / IP.
 * 6. Admin Test Email: Rate-limited and strictly authenticated.
 * 
 * Storage: In-memory cache + persistent sync to Supabase (site_settings) across server restarts.
 */

export interface RateLimitBucket {
  timestamps: number[];
  lastSuccess?: number;
}

export interface RateLimiterState {
  forgotPassword: Record<string, RateLimitBucket>;
  orders: Record<string, RateLimitBucket>;
  contact: Record<string, RateLimitBucket>;
  testEmail: Record<string, RateLimitBucket>;
  sentEmailEvents: Record<string, number>;
}

// Time Constants (in milliseconds)
export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
export const TEN_MINUTES_MS = 10 * 60 * 1000;

// Rate Limit Thresholds
export const FORGOT_PASSWORD_MAX_ATTEMPTS = 3;
export const FORGOT_PASSWORD_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
export const ORDER_MAX_PER_24H = 2;
export const CONTACT_MAX_PER_24H = 3;
export const TEST_EMAIL_MAX_PER_10MIN = 5;

// In-Memory State Store
let state: RateLimiterState = {
  forgotPassword: {},
  orders: {},
  contact: {},
  testEmail: {},
  sentEmailEvents: {}
};

let syncTimeout: NodeJS.Timeout | null = null;

/**
 * Filter out timestamps older than the specified time window
 */
export function pruneTimestamps(timestamps: number[] = [], windowMs: number, now: number = Date.now()): number[] {
  const cutoff = now - windowMs;
  return timestamps.filter(t => typeof t === 'number' && t > cutoff);
}

/**
 * Cleans the internal state by removing expired records
 */
export function pruneEntireState(now: number = Date.now()): void {
  // Prune forgot password
  for (const [key, bucket] of Object.entries(state.forgotPassword)) {
    bucket.timestamps = pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now);
    if (bucket.timestamps.length === 0 && (!bucket.lastSuccess || now - bucket.lastSuccess > TWENTY_FOUR_HOURS_MS)) {
      delete state.forgotPassword[key];
    }
  }

  // Prune orders
  for (const [key, bucket] of Object.entries(state.orders)) {
    bucket.timestamps = pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now);
    if (bucket.timestamps.length === 0) {
      delete state.orders[key];
    }
  }

  // Prune contact
  for (const [key, bucket] of Object.entries(state.contact)) {
    bucket.timestamps = pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now);
    if (bucket.timestamps.length === 0) {
      delete state.contact[key];
    }
  }

  // Prune test email
  for (const [key, bucket] of Object.entries(state.testEmail)) {
    bucket.timestamps = pruneTimestamps(bucket.timestamps, TEN_MINUTES_MS, now);
    if (bucket.timestamps.length === 0) {
      delete state.testEmail[key];
    }
  }

  // Prune sent email events (keep for 48 hours for safety)
  const eventCutoff = now - 48 * 60 * 60 * 1000;
  for (const [key, timestamp] of Object.entries(state.sentEmailEvents)) {
    if (timestamp < eventCutoff) {
      delete state.sentEmailEvents[key];
    }
  }
}

/**
 * Get current state (read-only copy)
 */
export function getRateLimiterState(): Readonly<RateLimiterState> {
  return state;
}

/**
 * Reset state to initial empty store (primarily for unit tests)
 */
export function resetRateLimiterState(): void {
  state = {
    forgotPassword: {},
    orders: {},
    contact: {},
    testEmail: {},
    sentEmailEvents: {}
  };
}

/**
 * Load state from Supabase `site_settings` table (row id: 'rate_limiter_state')
 */
export async function initRateLimiterFromSupabase(supabaseClient: any): Promise<boolean> {
  if (!supabaseClient) return false;
  try {
    const { data, error } = await supabaseClient
      .from('site_settings')
      .select('value')
      .eq('id', 'rate_limiter_state')
      .single();

    if (!error && data && data.value && typeof data.value === 'object') {
      const loaded = data.value;
      state = {
        forgotPassword: loaded.forgotPassword || {},
        orders: loaded.orders || {},
        contact: loaded.contact || {},
        testEmail: loaded.testEmail || {},
        sentEmailEvents: loaded.sentEmailEvents || {}
      };
      pruneEntireState();
      return true;
    }
  } catch (err) {
    console.warn('Failed to load rate limiter state from Supabase:', err);
  }
  return false;
}

/**
 * Persist current state to Supabase `site_settings`
 */
export async function syncRateLimiterToSupabase(supabaseClient: any, immediate = false): Promise<void> {
  if (!supabaseClient) return;

  const doSync = async () => {
    try {
      pruneEntireState();
      await supabaseClient.from('site_settings').upsert({
        id: 'rate_limiter_state',
        value: state,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Failed to sync rate limiter state to Supabase:', err);
    }
  };

  if (immediate) {
    if (syncTimeout) {
      clearTimeout(syncTimeout);
      syncTimeout = null;
    }
    await doSync();
  } else {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      doSync().catch(() => {});
    }, 1000);
  }
}

/* ==========================================================================
   1. FORGOT PASSWORD RATE LIMITER
   Rule: Max 3 requests in 24 hours per email + min 10 min cooldown.
   ========================================================================== */

export interface ForgotPasswordCheckResult {
  allowed: boolean;
  reason?: 'invalid_email' | 'daily_limit' | 'cooldown';
  waitMinutes?: number;
  message?: string;
}

export function checkForgotPasswordRateLimit(
  email: string,
  now: number = Date.now()
): ForgotPasswordCheckResult {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return {
      allowed: false,
      reason: 'invalid_email',
      message: 'آدرس ایمیل وارد شده نامعتبر است.'
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  const bucket = state.forgotPassword[cleanEmail] || { timestamps: [] };

  // 1. Check 10-minute cooldown since last successful request
  if (bucket.lastSuccess) {
    const elapsed = now - bucket.lastSuccess;
    if (elapsed < FORGOT_PASSWORD_COOLDOWN_MS) {
      const waitRemainingMs = FORGOT_PASSWORD_COOLDOWN_MS - elapsed;
      const waitMinutes = Math.max(1, Math.ceil(waitRemainingMs / 60000));
      return {
        allowed: false,
        reason: 'cooldown',
        waitMinutes,
        message: `شما به تازگی یک درخواست ثبت کرده‌اید. لطفاً ${waitMinutes} دقیقه دیگر مجدداً تلاش فرمایید.`
      };
    }
  }

  // 2. Check 24-hour limit (max 3 requests)
  const activeTimestamps = pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now);
  if (activeTimestamps.length >= FORGOT_PASSWORD_MAX_ATTEMPTS) {
    return {
      allowed: false,
      reason: 'daily_limit',
      message: 'حداکثر تعداد مجاز درخواست بازیابی رمز عبور (۳ درخواست در ۲۴ ساعت) برای این ایمیل تکمیل شده است. لطفاً ۲۴ ساعت پس از اولین درخواست مجدداً اقدام نمایید یا با پشتیبانی تماس بگیرید.'
    };
  }

  return { allowed: true };
}

export function recordForgotPasswordSuccess(
  email: string,
  now: number = Date.now(),
  supabaseClient?: any
): void {
  const cleanEmail = email.trim().toLowerCase();
  if (!state.forgotPassword[cleanEmail]) {
    state.forgotPassword[cleanEmail] = { timestamps: [] };
  }

  const bucket = state.forgotPassword[cleanEmail];
  bucket.timestamps = [...pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now), now];
  bucket.lastSuccess = now;

  if (supabaseClient) {
    syncRateLimiterToSupabase(supabaseClient);
  }
}

/* ==========================================================================
   2. ORDER CREATION RATE LIMITER
   Rule: Max 2 orders in 24 hours per user.
   ========================================================================== */

export interface OrderCreationCheckResult {
  allowed: boolean;
  reason?: 'order_limit_exceeded' | 'invalid_user';
  message?: string;
  orderCount?: number;
}

export function checkOrderCreationRateLimit(
  identifier: string,
  now: number = Date.now()
): OrderCreationCheckResult {
  const cleanKey = String(identifier || '').trim().toLowerCase();
  if (!cleanKey) {
    return { allowed: true };
  }

  const bucket = state.orders[cleanKey] || { timestamps: [] };
  const activeTimestamps = pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now);

  if (activeTimestamps.length >= ORDER_MAX_PER_24H) {
    return {
      allowed: false,
      reason: 'order_limit_exceeded',
      orderCount: activeTimestamps.length,
      message: 'سقف مجاز ثبت سفارش (حداکثر ۲ سفارش در ۲۴ ساعت) برای حساب یا اطلاعات شما تکمیل شده است. در صورت نیاز با پشتیبانی تماس حاصل فرمایید.'
    };
  }

  return { allowed: true, orderCount: activeTimestamps.length };
}

export function recordOrderCreation(
  identifier: string,
  orderId?: string,
  now: number = Date.now(),
  supabaseClient?: any
): void {
  const cleanKey = String(identifier || '').trim().toLowerCase();
  if (!cleanKey) return;

  if (!state.orders[cleanKey]) {
    state.orders[cleanKey] = { timestamps: [] };
  }

  const bucket = state.orders[cleanKey];
  bucket.timestamps = [...pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now), now];
  bucket.lastSuccess = now;

  if (supabaseClient) {
    syncRateLimiterToSupabase(supabaseClient);
  }
}

/* ==========================================================================
   3. FREE ORDER CHECKER
   Rule: If final order total is 0 (or <= 0), no transactional email sent.
   ========================================================================== */

export function isFreeOrder(order: any): boolean {
  if (!order) return false;

  const totalAmount = Number(order.totalAmount ?? order.amount ?? order.finalAmount);
  if (!isNaN(totalAmount) && totalAmount <= 0) {
    return true;
  }

  // Also check subtotal + shippingFee if totalAmount is missing
  if (order.totalAmount === undefined && order.amount === undefined) {
    const subtotal = Number(order.subtotal || 0);
    const shipping = Number(order.shippingFee || 0);
    if (subtotal + shipping <= 0) {
      return true;
    }
  }

  return false;
}

/* ==========================================================================
   4. ANTI-DUPLICATE / IDEMPOTENT EMAIL TRACKER
   Rule: For each order event, at most 1 email sent. Prevent replay/double-click.
   ========================================================================== */

export function hasEmailBeenSent(eventKey: string): boolean {
  if (!eventKey) return false;
  return Boolean(state.sentEmailEvents[eventKey]);
}

export function markEmailAsSent(
  eventKey: string,
  now: number = Date.now(),
  supabaseClient?: any
): void {
  if (!eventKey) return;
  state.sentEmailEvents[eventKey] = now;

  if (supabaseClient) {
    syncRateLimiterToSupabase(supabaseClient);
  }
}

/* ==========================================================================
   5. CONTACT FORM RATE LIMITER
   Rule: Max 3 submissions in 24 hours per user / IP / email.
   ========================================================================== */

export interface ContactRateLimitCheckResult {
  allowed: boolean;
  reason?: 'email_limit_exceeded' | 'ip_limit_exceeded';
  message?: string;
}

export function checkContactRateLimit(
  params: { email?: string; ip?: string },
  now: number = Date.now()
): ContactRateLimitCheckResult {
  const emailKey = params.email ? `email:${params.email.trim().toLowerCase()}` : '';
  const ipKey = params.ip ? `ip:${params.ip.trim().toLowerCase()}` : '';

  if (emailKey) {
    const bucket = state.contact[emailKey] || { timestamps: [] };
    const active = pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now);
    if (active.length >= CONTACT_MAX_PER_24H) {
      return {
        allowed: false,
        reason: 'email_limit_exceeded',
        message: 'سقف مجاز ارسال پیام از طریق فرم تماس (حداکثر ۳ پیام در ۲۴ ساعت) برای این آدرس ایمیل تکمیل شده است.'
      };
    }
  }

  if (ipKey) {
    const bucket = state.contact[ipKey] || { timestamps: [] };
    const active = pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now);
    if (active.length >= CONTACT_MAX_PER_24H) {
      return {
        allowed: false,
        reason: 'ip_limit_exceeded',
        message: 'سقف مجاز ارسال پیام از طریق فرم تماس (حداکثر ۳ پیام در ۲۴ ساعت) برای این شبکه یا سیستم تکمیل شده است.'
      };
    }
  }

  return { allowed: true };
}

export function recordContactMessage(
  params: { email?: string; ip?: string },
  now: number = Date.now(),
  supabaseClient?: any
): void {
  const emailKey = params.email ? `email:${params.email.trim().toLowerCase()}` : '';
  const ipKey = params.ip ? `ip:${params.ip.trim().toLowerCase()}` : '';

  if (emailKey) {
    if (!state.contact[emailKey]) state.contact[emailKey] = { timestamps: [] };
    const bucket = state.contact[emailKey];
    bucket.timestamps = [...pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now), now];
    bucket.lastSuccess = now;
  }

  if (ipKey) {
    if (!state.contact[ipKey]) state.contact[ipKey] = { timestamps: [] };
    const bucket = state.contact[ipKey];
    bucket.timestamps = [...pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now), now];
    bucket.lastSuccess = now;
  }

  if (supabaseClient) {
    syncRateLimiterToSupabase(supabaseClient);
  }
}

/* ==========================================================================
   6. ADMIN TEST EMAIL RATE LIMITER
   Rule: Max 5 test emails per 10 minutes per admin session.
   ========================================================================== */

export interface TestEmailRateLimitCheckResult {
  allowed: boolean;
  reason?: 'test_email_limit_exceeded';
  message?: string;
}

export function checkAdminTestEmailRateLimit(
  adminIdentifier: string = 'admin',
  now: number = Date.now()
): TestEmailRateLimitCheckResult {
  const key = (adminIdentifier || 'admin').trim().toLowerCase();
  const bucket = state.testEmail[key] || { timestamps: [] };
  const active = pruneTimestamps(bucket.timestamps, TEN_MINUTES_MS, now);

  if (active.length >= TEST_EMAIL_MAX_PER_10MIN) {
    return {
      allowed: false,
      reason: 'test_email_limit_exceeded',
      message: 'سقف مجاز ارسال ایمیل تست (۵ ایمیل در ۱۰ دقیقه) تکمیل شده است. لطفاً چند دقیقه بعد مجدداً تلاش نمایید.'
    };
  }

  return { allowed: true };
}

export function recordAdminTestEmail(
  adminIdentifier: string = 'admin',
  now: number = Date.now(),
  supabaseClient?: any
): void {
  const key = (adminIdentifier || 'admin').trim().toLowerCase();
  if (!state.testEmail[key]) state.testEmail[key] = { timestamps: [] };
  const bucket = state.testEmail[key];
  bucket.timestamps = [...pruneTimestamps(bucket.timestamps, TEN_MINUTES_MS, now), now];
  bucket.lastSuccess = now;

  if (supabaseClient) {
    syncRateLimiterToSupabase(supabaseClient);
  }
}
