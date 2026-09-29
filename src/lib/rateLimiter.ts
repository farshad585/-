// @ts-nocheck
// Rate limiter
// src/lib/rateLimiter.ts
var TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1e3;
var TEN_MINUTES_MS = 10 * 60 * 1e3;
var FORGOT_PASSWORD_MAX_ATTEMPTS = 3;
var FORGOT_PASSWORD_COOLDOWN_MS = 10 * 60 * 1e3;
var ORDER_MAX_PER_24H = 2;
var CONTACT_MAX_PER_24H = 3;
var TEST_EMAIL_MAX_PER_10MIN = 5;
var state = {
  forgotPassword: {},
  orders: {},
  contact: {},
  testEmail: {},
  sentEmailEvents: {}
};
var syncTimeout = null;
export function pruneTimestamps(timestamps = [], windowMs, now = Date.now()) {
  const cutoff = now - windowMs;
  return timestamps.filter((t) => typeof t === "number" && t > cutoff);
}
export function pruneEntireState(now = Date.now()) {
  for (const [key, bucket] of Object.entries(state.forgotPassword)) {
    bucket.timestamps = pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now);
    if (bucket.timestamps.length === 0 && (!bucket.lastSuccess || now - bucket.lastSuccess > TWENTY_FOUR_HOURS_MS)) {
      delete state.forgotPassword[key];
    }
  }
  for (const [key, bucket] of Object.entries(state.orders)) {
    bucket.timestamps = pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now);
    if (bucket.timestamps.length === 0) {
      delete state.orders[key];
    }
  }
  for (const [key, bucket] of Object.entries(state.contact)) {
    bucket.timestamps = pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now);
    if (bucket.timestamps.length === 0) {
      delete state.contact[key];
    }
  }
  for (const [key, bucket] of Object.entries(state.testEmail)) {
    bucket.timestamps = pruneTimestamps(bucket.timestamps, TEN_MINUTES_MS, now);
    if (bucket.timestamps.length === 0) {
      delete state.testEmail[key];
    }
  }
  const eventCutoff = now - 48 * 60 * 60 * 1e3;
  for (const [key, timestamp] of Object.entries(state.sentEmailEvents)) {
    if (timestamp < eventCutoff) {
      delete state.sentEmailEvents[key];
    }
  }
}
export async function initRateLimiterFromSupabase(supabaseClient) {
  if (!supabaseClient) return false;
  try {
    const { data, error } = await supabaseClient.from("site_settings").select("value").eq("id", "rate_limiter_state").single();
    if (!error && data && data.value && typeof data.value === "object") {
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
    console.warn("Failed to load rate limiter state from Supabase:", err);
  }
  return false;
}
export async function syncRateLimiterToSupabase(supabaseClient, immediate = false) {
  if (!supabaseClient) return;
  const doSync = async () => {
    try {
      pruneEntireState();
      await supabaseClient.from("site_settings").upsert({
        id: "rate_limiter_state",
        value: state,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      console.warn("Failed to sync rate limiter state to Supabase:", err);
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
      doSync().catch(() => {
      });
    }, 1e3);
  }
}
export function checkForgotPasswordRateLimit(email, now = Date.now()) {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return {
      allowed: false,
      reason: "invalid_email",
      message: "\u0622\u062F\u0631\u0633 \u0627\u06CC\u0645\u06CC\u0644 \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A."
    };
  }
  const cleanEmail = email.trim().toLowerCase();
  const bucket = state.forgotPassword[cleanEmail] || { timestamps: [] };
  if (bucket.lastSuccess) {
    const elapsed = now - bucket.lastSuccess;
    if (elapsed < FORGOT_PASSWORD_COOLDOWN_MS) {
      const waitRemainingMs = FORGOT_PASSWORD_COOLDOWN_MS - elapsed;
      const waitMinutes = Math.max(1, Math.ceil(waitRemainingMs / 6e4));
      return {
        allowed: false,
        reason: "cooldown",
        waitMinutes,
        message: `\u0634\u0645\u0627 \u0628\u0647 \u062A\u0627\u0632\u06AF\u06CC \u06CC\u06A9 \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u062B\u0628\u062A \u06A9\u0631\u062F\u0647\u200C\u0627\u06CC\u062F. \u0644\u0637\u0641\u0627\u064B ${waitMinutes} \u062F\u0642\u06CC\u0642\u0647 \u062F\u06CC\u06AF\u0631 \u0645\u062C\u062F\u062F\u0627\u064B \u062A\u0644\u0627\u0634 \u0641\u0631\u0645\u0627\u06CC\u06CC\u062F.`
      };
    }
  }
  const activeTimestamps = pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now);
  if (activeTimestamps.length >= FORGOT_PASSWORD_MAX_ATTEMPTS) {
    return {
      allowed: false,
      reason: "daily_limit",
      message: "\u062D\u062F\u0627\u06A9\u062B\u0631 \u062A\u0639\u062F\u0627\u062F \u0645\u062C\u0627\u0632 \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0628\u0627\u0632\u06CC\u0627\u0628\u06CC \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 (\u06F3 \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u062F\u0631 \u06F2\u06F4 \u0633\u0627\u0639\u062A) \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0627\u06CC\u0645\u06CC\u0644 \u062A\u06A9\u0645\u06CC\u0644 \u0634\u062F\u0647 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u06F2\u06F4 \u0633\u0627\u0639\u062A \u067E\u0633 \u0627\u0632 \u0627\u0648\u0644\u06CC\u0646 \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0645\u062C\u062F\u062F\u0627\u064B \u0627\u0642\u062F\u0627\u0645 \u0646\u0645\u0627\u06CC\u06CC\u062F \u06CC\u0627 \u0628\u0627 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u062A\u0645\u0627\u0633 \u0628\u06AF\u06CC\u0631\u06CC\u062F."
    };
  }
  return { allowed: true };
}
export function recordForgotPasswordSuccess(email, now = Date.now(), supabaseClient) {
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
export function checkOrderCreationRateLimit(identifier, now = Date.now()) {
  const cleanKey = String(identifier || "").trim().toLowerCase();
  if (!cleanKey) {
    return { allowed: true };
  }
  const bucket = state.orders[cleanKey] || { timestamps: [] };
  const activeTimestamps = pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now);
  if (activeTimestamps.length >= ORDER_MAX_PER_24H) {
    return {
      allowed: false,
      reason: "order_limit_exceeded",
      orderCount: activeTimestamps.length,
      message: "\u0633\u0642\u0641 \u0645\u062C\u0627\u0632 \u062B\u0628\u062A \u0633\u0641\u0627\u0631\u0634 (\u062D\u062F\u0627\u06A9\u062B\u0631 \u06F2 \u0633\u0641\u0627\u0631\u0634 \u062F\u0631 \u06F2\u06F4 \u0633\u0627\u0639\u062A) \u0628\u0631\u0627\u06CC \u062D\u0633\u0627\u0628 \u06CC\u0627 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0634\u0645\u0627 \u062A\u06A9\u0645\u06CC\u0644 \u0634\u062F\u0647 \u0627\u0633\u062A. \u062F\u0631 \u0635\u0648\u0631\u062A \u0646\u06CC\u0627\u0632 \u0628\u0627 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u062A\u0645\u0627\u0633 \u062D\u0627\u0635\u0644 \u0641\u0631\u0645\u0627\u06CC\u06CC\u062F."
    };
  }
  return { allowed: true, orderCount: activeTimestamps.length };
}
export function recordOrderCreation(identifier, orderId, now = Date.now(), supabaseClient) {
  const cleanKey = String(identifier || "").trim().toLowerCase();
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
export function isFreeOrder(order) {
  if (!order) return false;
  const totalAmount = Number(order.totalAmount ?? order.amount ?? order.finalAmount);
  if (!isNaN(totalAmount) && totalAmount <= 0) {
    return true;
  }
  if (order.totalAmount === void 0 && order.amount === void 0) {
    const subtotal = Number(order.subtotal || 0);
    const shipping = Number(order.shippingFee || 0);
    if (subtotal + shipping <= 0) {
      return true;
    }
  }
  return false;
}
export function hasEmailBeenSent(eventKey) {
  if (!eventKey) return false;
  return Boolean(state.sentEmailEvents[eventKey]);
}
export function markEmailAsSent(eventKey, now = Date.now(), supabaseClient) {
  if (!eventKey) return;
  state.sentEmailEvents[eventKey] = now;
  if (supabaseClient) {
    syncRateLimiterToSupabase(supabaseClient);
  }
}
export function checkContactRateLimit(params, now = Date.now()) {
  const emailKey = params.email ? `email:${params.email.trim().toLowerCase()}` : "";
  const ipKey = params.ip ? `ip:${params.ip.trim().toLowerCase()}` : "";
  if (emailKey) {
    const bucket = state.contact[emailKey] || { timestamps: [] };
    const active = pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now);
    if (active.length >= CONTACT_MAX_PER_24H) {
      return {
        allowed: false,
        reason: "email_limit_exceeded",
        message: "\u0633\u0642\u0641 \u0645\u062C\u0627\u0632 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0641\u0631\u0645 \u062A\u0645\u0627\u0633 (\u062D\u062F\u0627\u06A9\u062B\u0631 \u06F3 \u067E\u06CC\u0627\u0645 \u062F\u0631 \u06F2\u06F4 \u0633\u0627\u0639\u062A) \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0622\u062F\u0631\u0633 \u0627\u06CC\u0645\u06CC\u0644 \u062A\u06A9\u0645\u06CC\u0644 \u0634\u062F\u0647 \u0627\u0633\u062A."
      };
    }
  }
  if (ipKey) {
    const bucket = state.contact[ipKey] || { timestamps: [] };
    const active = pruneTimestamps(bucket.timestamps, TWENTY_FOUR_HOURS_MS, now);
    if (active.length >= CONTACT_MAX_PER_24H) {
      return {
        allowed: false,
        reason: "ip_limit_exceeded",
        message: "\u0633\u0642\u0641 \u0645\u062C\u0627\u0632 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0641\u0631\u0645 \u062A\u0645\u0627\u0633 (\u062D\u062F\u0627\u06A9\u062B\u0631 \u06F3 \u067E\u06CC\u0627\u0645 \u062F\u0631 \u06F2\u06F4 \u0633\u0627\u0639\u062A) \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0634\u0628\u06A9\u0647 \u06CC\u0627 \u0633\u06CC\u0633\u062A\u0645 \u062A\u06A9\u0645\u06CC\u0644 \u0634\u062F\u0647 \u0627\u0633\u062A."
      };
    }
  }
  return { allowed: true };
}
export function recordContactMessage(params, now = Date.now(), supabaseClient) {
  const emailKey = params.email ? `email:${params.email.trim().toLowerCase()}` : "";
  const ipKey = params.ip ? `ip:${params.ip.trim().toLowerCase()}` : "";
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
export function checkAdminTestEmailRateLimit(adminIdentifier = "admin", now = Date.now()) {
  const key = (adminIdentifier || "admin").trim().toLowerCase();
  const bucket = state.testEmail[key] || { timestamps: [] };
  const active = pruneTimestamps(bucket.timestamps, TEN_MINUTES_MS, now);
  if (active.length >= TEST_EMAIL_MAX_PER_10MIN) {
    return {
      allowed: false,
      reason: "test_email_limit_exceeded",
      message: "\u0633\u0642\u0641 \u0645\u062C\u0627\u0632 \u0627\u0631\u0633\u0627\u0644 \u0627\u06CC\u0645\u06CC\u0644 \u062A\u0633\u062A (\u06F5 \u0627\u06CC\u0645\u06CC\u0644 \u062F\u0631 \u06F1\u06F0 \u062F\u0642\u06CC\u0642\u0647) \u062A\u06A9\u0645\u06CC\u0644 \u0634\u062F\u0647 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0686\u0646\u062F \u062F\u0642\u06CC\u0642\u0647 \u0628\u0639\u062F \u0645\u062C\u062F\u062F\u0627\u064B \u062A\u0644\u0627\u0634 \u0646\u0645\u0627\u06CC\u06CC\u062F."
    };
  }
  return { allowed: true };
}
export function recordAdminTestEmail(adminIdentifier = "admin", now = Date.now(), supabaseClient) {
  const key = (adminIdentifier || "admin").trim().toLowerCase();
  if (!state.testEmail[key]) state.testEmail[key] = { timestamps: [] };
  const bucket = state.testEmail[key];
  bucket.timestamps = [...pruneTimestamps(bucket.timestamps, TEN_MINUTES_MS, now), now];
  bucket.lastSuccess = now;
  if (supabaseClient) {
    syncRateLimiterToSupabase(supabaseClient);
  }
}
