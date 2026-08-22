import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkForgotPasswordRateLimit,
  recordForgotPasswordSuccess,
  checkOrderCreationRateLimit,
  recordOrderCreation,
  isFreeOrder,
  hasEmailBeenSent,
  markEmailAsSent,
  checkContactRateLimit,
  recordContactMessage,
  checkAdminTestEmailRateLimit,
  recordAdminTestEmail,
  resetRateLimiterState,
  initRateLimiterFromSupabase,
  syncRateLimiterToSupabase,
  getRateLimiterState,
  FORGOT_PASSWORD_MAX_ATTEMPTS,
  FORGOT_PASSWORD_COOLDOWN_MS,
  ORDER_MAX_PER_24H,
  CONTACT_MAX_PER_24H,
  TEST_EMAIL_MAX_PER_10MIN,
  TWENTY_FOUR_HOURS_MS,
  TEN_MINUTES_MS
} from '../src/lib/rateLimiter.ts';

test.beforeEach(() => {
  resetRateLimiterState();
});

// ---------------------------------------------------------------------------
// 1. Forgot Password Rate Limiting Tests
// ---------------------------------------------------------------------------
test('Forgot Password - allows up to 3 requests in 24h with 10min cooldown', () => {
  const email = 'user@example.com';
  const baseTime = Date.now();

  // Request 1: Allowed
  const r1 = checkForgotPasswordRateLimit(email, baseTime);
  assert.equal(r1.allowed, true);
  recordForgotPasswordSuccess(email, baseTime);

  // Immediate Request 2: Rejected by 10-minute cooldown
  const r2Immediate = checkForgotPasswordRateLimit(email, baseTime + 2 * 60 * 1000);
  assert.equal(r2Immediate.allowed, false);
  assert.equal(r2Immediate.reason, 'cooldown');
  assert.equal(r2Immediate.waitMinutes, 8);

  // Request 2 after 10m 1s: Allowed
  const time2 = baseTime + 10 * 60 * 1000 + 1000;
  const r2 = checkForgotPasswordRateLimit(email, time2);
  assert.equal(r2.allowed, true);
  recordForgotPasswordSuccess(email, time2);

  // Request 3 after another 10m 1s: Allowed
  const time3 = time2 + 10 * 60 * 1000 + 1000;
  const r3 = checkForgotPasswordRateLimit(email, time3);
  assert.equal(r3.allowed, true);
  recordForgotPasswordSuccess(email, time3);

  // Request 4 after 10m 1s: Rejected by 24-hour limit (max 3)
  const time4 = time3 + 10 * 60 * 1000 + 1000;
  const r4 = checkForgotPasswordRateLimit(email, time4);
  assert.equal(r4.allowed, false);
  assert.equal(r4.reason, 'daily_limit');

  // Request 5 after 24h from baseTime: Allowed again
  const time5 = baseTime + TWENTY_FOUR_HOURS_MS + 1000;
  const r5 = checkForgotPasswordRateLimit(email, time5);
  assert.equal(r5.allowed, true);
});

test('Forgot Password - rejects invalid or empty email addresses', () => {
  const r1 = checkForgotPasswordRateLimit('');
  assert.equal(r1.allowed, false);
  assert.equal(r1.reason, 'invalid_email');

  const r2 = checkForgotPasswordRateLimit('invalid-email-string');
  assert.equal(r2.allowed, false);
  assert.equal(r2.reason, 'invalid_email');
});

// ---------------------------------------------------------------------------
// 2. Order Creation Rate Limiting Tests
// ---------------------------------------------------------------------------
test('Order Creation - enforces maximum 2 orders per 24 hours per user', () => {
  const user = 'customer@test.com';
  const baseTime = Date.now();

  // Order 1: Allowed
  const check1 = checkOrderCreationRateLimit(user, baseTime);
  assert.equal(check1.allowed, true);
  recordOrderCreation(user, 'ORD-001', baseTime);

  // Order 2: Allowed
  const check2 = checkOrderCreationRateLimit(user, baseTime + 1000);
  assert.equal(check2.allowed, true);
  recordOrderCreation(user, 'ORD-002', baseTime + 1000);

  // Order 3 within 24h: Rejected
  const check3 = checkOrderCreationRateLimit(user, baseTime + 2000);
  assert.equal(check3.allowed, false);
  assert.equal(check3.reason, 'order_limit_exceeded');

  // Order 3 after 24h: Allowed
  const checkAfter24h = checkOrderCreationRateLimit(user, baseTime + TWENTY_FOUR_HOURS_MS + 1000);
  assert.equal(checkAfter24h.allowed, true);
});

// ---------------------------------------------------------------------------
// 3. Free Order Detection Tests
// ---------------------------------------------------------------------------
test('Free Orders - identifies 0 totalAmount orders correctly', () => {
  assert.equal(isFreeOrder({ id: 'ORD-1', totalAmount: 0 }), true);
  assert.equal(isFreeOrder({ id: 'ORD-2', amount: 0 }), true);
  assert.equal(isFreeOrder({ id: 'ORD-3', totalAmount: -100 }), true);
  assert.equal(isFreeOrder({ id: 'ORD-4', subtotal: 0, shippingFee: 0 }), true);

  // Paid orders
  assert.equal(isFreeOrder({ id: 'ORD-5', totalAmount: 150000 }), false);
  assert.equal(isFreeOrder({ id: 'ORD-6', subtotal: 100000, shippingFee: 29000 }), false);
  assert.equal(isFreeOrder(null), false);
});

// ---------------------------------------------------------------------------
// 4. Anti-Duplicate / Idempotent Order Email Tracker Tests
// ---------------------------------------------------------------------------
test('Anti-Duplicate - prevents duplicate email sending for the same order event', () => {
  const eventKey = 'order-created:IRN-884920';

  // First check: Not sent yet
  assert.equal(hasEmailBeenSent(eventKey), false);

  // Mark as sent
  markEmailAsSent(eventKey);

  // Second check: Already sent
  assert.equal(hasEmailBeenSent(eventKey), true);

  // Different event key remains unflagged
  assert.equal(hasEmailBeenSent('order-created:IRN-999999'), false);
});

// ---------------------------------------------------------------------------
// 5. Contact Form Rate Limiting Tests
// ---------------------------------------------------------------------------
test('Contact Form - enforces maximum 3 messages per 24 hours per email & IP', () => {
  const email = 'sender@domain.com';
  const ip = '192.168.1.50';
  const baseTime = Date.now();

  // Message 1, 2, 3: Allowed
  for (let i = 1; i <= 3; i++) {
    const check = checkContactRateLimit({ email, ip }, baseTime + i * 1000);
    assert.equal(check.allowed, true, `Message ${i} should be allowed`);
    recordContactMessage({ email, ip }, baseTime + i * 1000);
  }

  // Message 4: Rejected
  const check4 = checkContactRateLimit({ email, ip }, baseTime + 4000);
  assert.equal(check4.allowed, false);

  // Message 4 from another email but same IP: Still rejected by IP limit
  const checkOtherEmailSameIp = checkContactRateLimit({ email: 'other@domain.com', ip }, baseTime + 5000);
  assert.equal(checkOtherEmailSameIp.allowed, false);
  assert.equal(checkOtherEmailSameIp.reason, 'ip_limit_exceeded');

  // Message 4 from same email but different IP: Still rejected by Email limit
  const checkSameEmailOtherIp = checkContactRateLimit({ email, ip: '10.0.0.1' }, baseTime + 6000);
  assert.equal(checkSameEmailOtherIp.allowed, false);
  assert.equal(checkSameEmailOtherIp.reason, 'email_limit_exceeded');

  // Message 4 after 24h: Allowed
  const checkAfter24h = checkContactRateLimit({ email, ip }, baseTime + TWENTY_FOUR_HOURS_MS + 1000);
  assert.equal(checkAfter24h.allowed, true);
});

// ---------------------------------------------------------------------------
// 6. Admin Test Email Rate Limiting Tests
// ---------------------------------------------------------------------------
test('Admin Test Email - enforces maximum 5 test emails per 10 minutes', () => {
  const adminId = 'admin-session-1';
  const baseTime = Date.now();

  for (let i = 1; i <= 5; i++) {
    const check = checkAdminTestEmailRateLimit(adminId, baseTime + i * 1000);
    assert.equal(check.allowed, true);
    recordAdminTestEmail(adminId, baseTime + i * 1000);
  }

  // 6th test email: Rejected
  const check6 = checkAdminTestEmailRateLimit(adminId, baseTime + 6000);
  assert.equal(check6.allowed, false);
  assert.equal(check6.reason, 'test_email_limit_exceeded');

  // Allowed after 10 minutes
  const checkAfter10m = checkAdminTestEmailRateLimit(adminId, baseTime + TEN_MINUTES_MS + 1000);
  assert.equal(checkAfter10m.allowed, true);
});

// ---------------------------------------------------------------------------
// 7. Supabase Sync and State Restoration Tests
// ---------------------------------------------------------------------------
test('Supabase State Restoration - correctly loads and prunes state', async () => {
  const mockSupabase = {
    storedData: null as any,
    from(table: string) {
      return {
        select(cols: string) {
          return {
            eq: (col: string, val: string) => ({
              single: async () => ({
                data: mockSupabase.storedData,
                error: null
              })
            })
          };
        },
        upsert: async (payload: any) => {
          mockSupabase.storedData = payload;
          return { data: payload, error: null };
        }
      };
    }
  };

  const now = Date.now();
  recordForgotPasswordSuccess('restored@example.com', now);
  recordOrderCreation('restored-user', 'ORD-RESTORED', now);

  await syncRateLimiterToSupabase(mockSupabase, true);
  assert.ok(mockSupabase.storedData);

  // Clear memory
  resetRateLimiterState();
  assert.equal(getRateLimiterState().forgotPassword['restored@example.com'], undefined);

  // Restore from mock Supabase
  const loaded = await initRateLimiterFromSupabase(mockSupabase);
  assert.equal(loaded, true);
  assert.ok(getRateLimiterState().forgotPassword['restored@example.com']);
  assert.ok(getRateLimiterState().orders['restored-user']);
});
