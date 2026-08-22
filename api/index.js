// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { Resend } from "resend";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { generateSecret, verifySync } from "otplib";
var app = express();
var PORT = 3e3;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, x-admin-token");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
app.use((req, res, next) => {
  if (process.env.VERCEL) {
    if (!req.url.startsWith("/api") && !req.url.startsWith("/index.html") && !req.url.startsWith("/assets")) {
      req.url = "/api" + (req.url.startsWith("/") ? "" : "/") + req.url;
    }
  }
  next();
});
var runtimeSupabaseConfig = {
  url: (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim(),
  anonKey: (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim(),
  serviceKey: (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
};
function getSupabaseClient() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || runtimeSupabaseConfig.url || "").trim();
  const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || runtimeSupabaseConfig.serviceKey || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || runtimeSupabaseConfig.anonKey || "").trim();
  if (!url || !key || url.includes("placeholder")) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}
var emailLogs = [];
var runtimeResendConfig = {
  apiKey: (process.env.RESEND_API_KEY || "").trim(),
  fromEmail: (process.env.RESEND_FROM_EMAIL || "\u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 <onboarding@resend.dev>").trim(),
  adminEmail: (process.env.ADMIN_EMAIL || "40gates.main@gmail.com").trim()
};
function sanitizeErrorLog(message, secrets = []) {
  if (!message) return "";
  let sanitized = String(message);
  const activeSecrets = [
    runtimeResendConfig.apiKey,
    process.env.RESEND_API_KEY,
    process.env.ADMIN_PASSWORD,
    process.env.ADMIN_SECRET,
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.GEMINI_API_KEY,
    ...secrets
  ].filter((s) => Boolean(s && s.length >= 4));
  for (const secret of activeSecrets) {
    const trimmedSecret = secret.trim();
    if (trimmedSecret) {
      const escaped = trimmedSecret.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      sanitized = sanitized.replace(new RegExp(escaped, "gi"), "***REDACTED***");
    }
  }
  sanitized = sanitized.replace(/(pass|password|auth|token|secret|key|re_)[="']?[^"'\s&]+["']?/gi, "$1=***REDACTED***");
  return sanitized;
}
async function sendMailSafely(options, type = "general") {
  let apiKey = (runtimeResendConfig.apiKey || process.env.RESEND_API_KEY || "").trim();
  let fromEmail = (runtimeResendConfig.fromEmail || process.env.RESEND_FROM_EMAIL || "\u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 <onboarding@resend.dev>").trim();
  let adminEmail = (runtimeResendConfig.adminEmail || process.env.ADMIN_EMAIL || "40gates.main@gmail.com").trim();
  if (!apiKey && getSupabaseClient()) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const { data } = await client.from("site_settings").select("value").eq("id", "email_config").single();
        if (data && data.value) {
          if (!apiKey && data.value.apiKey) apiKey = String(data.value.apiKey).trim();
          if (data.value.fromEmail) fromEmail = String(data.value.fromEmail).trim();
          if (data.value.adminEmail) adminEmail = String(data.value.adminEmail).trim();
          runtimeResendConfig.apiKey = apiKey;
          runtimeResendConfig.fromEmail = fromEmail;
          runtimeResendConfig.adminEmail = adminEmail;
        }
      }
    } catch (dbErr) {
      console.warn("Could not fetch Resend config from Supabase:", sanitizeErrorLog(dbErr?.message || String(dbErr)));
    }
  }
  const toList = Array.isArray(options.to) ? options.to : [options.to];
  const cleanTo = toList.map((t) => String(t || "").trim()).filter(Boolean);
  const toDisplay = cleanTo.join(", ");
  const subject = String(options.subject || "");
  const sender = options.from || fromEmail || "\u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 <onboarding@resend.dev>";
  const replyTo = options.replyTo || adminEmail;
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: sender,
        to: cleanTo,
        subject,
        html: options.html || `<div dir="rtl">${options.text || ""}</div>`,
        text: options.text,
        replyTo
      });
      if (error) {
        const rawErrMsg = error.message || JSON.stringify(error);
        const safeErrMsg = sanitizeErrorLog(rawErrMsg, [apiKey]);
        console.error(`\u274C [RESEND API ERROR] To: ${toDisplay} | Error:`, safeErrMsg);
        emailLogs.unshift({
          id: "EML-ERR-" + Date.now(),
          type,
          to: toDisplay,
          subject: `[\u062E\u0637\u0627] ${subject}`,
          timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("fa-IR"),
          status: "failed",
          errorDetails: safeErrMsg
        });
        return {
          success: false,
          status: "failed",
          error: `\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u0628\u0627 Resend API: ${safeErrMsg}`
        };
      }
      console.log(`\u2705 [RESEND EMAIL SENT] ID: ${data?.id} | To: ${toDisplay} | Subject: ${subject}`);
      emailLogs.unshift({
        id: "EML-" + Date.now(),
        type,
        to: toDisplay,
        subject,
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("fa-IR"),
        status: "sent"
      });
      return { success: true, status: "sent", messageId: data?.id };
    } catch (err) {
      const rawErrMsg = err?.message || String(err);
      const safeErrMsg = sanitizeErrorLog(rawErrMsg, [apiKey]);
      console.error(`\u274C [RESEND EXCEPTION] To: ${toDisplay} | Error:`, safeErrMsg);
      emailLogs.unshift({
        id: "EML-ERR-" + Date.now(),
        type,
        to: toDisplay,
        subject: `[\u062E\u0637\u0627] ${subject}`,
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("fa-IR"),
        status: "failed",
        errorDetails: safeErrMsg
      });
      return {
        success: false,
        status: "failed",
        error: `\u0627\u0633\u062A\u062B\u0646\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u0627\u06CC\u0645\u06CC\u0644 \u0628\u0627 Resend: ${safeErrMsg}`
      };
    }
  }
  console.warn(`\u26A0\uFE0F [EMAIL NOT SENT - RESEND_API_KEY MISSING] Attempted To: ${toDisplay} | Subject: ${subject}`);
  emailLogs.unshift({
    id: "EML-SIM-" + Date.now(),
    type,
    to: toDisplay,
    subject: `[\u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0646\u0634\u062F\u0647] ${subject}`,
    timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("fa-IR"),
    status: "simulated",
    errorDetails: "\u0645\u062A\u063A\u06CC\u0631 RESEND_API_KEY \u062F\u0631 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A Vercel \u06CC\u0627 \u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A \u062A\u0639\u0631\u06CC\u0641 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A."
  });
  return {
    success: false,
    status: "simulated",
    error: "\u0633\u0631\u0648\u06CC\u0633 \u0627\u06CC\u0645\u06CC\u0644 \u0628\u0647 \u062F\u0644\u06CC\u0644 \u0639\u062F\u0645 \u062A\u0646\u0638\u06CC\u0645 RESEND_API_KEY \u062F\u0631 Vercel \u0641\u0639\u0627\u0644 \u0646\u06CC\u0633\u062A.",
    messageId: "simulated-" + Date.now()
  };
}
var contactMessages = [];
var adminSecurityState = {
  failedPasswordCount: 0,
  lockedUntil: 0,
  activeOtp: null,
  activeSessions: /* @__PURE__ */ new Map(),
  loginLogs: []
};
function getAdminConfig() {
  const adminEmail = (process.env.ADMIN_EMAIL || "40gates.main@gmail.com").trim();
  const adminPassword = (process.env.ADMIN_PASSWORD || "40gates1403").trim();
  return { adminEmail, adminPassword };
}
var runtimeTotpSecret = (process.env.ADMIN_TOTP_SECRET || "").trim();
async function getStoredTotpSecret() {
  if (runtimeTotpSecret) {
    return { secret: runtimeTotpSecret, isSetup: true };
  }
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data } = await client.from("site_settings").select("value").eq("id", "admin_totp_config").single();
      if (data && data.value && data.value.secret) {
        runtimeTotpSecret = String(data.value.secret).trim();
        return { secret: runtimeTotpSecret, isSetup: data.value.isSetup !== false };
      }
    } catch (e) {
      console.warn("Could not read admin_totp_config from Supabase:", e);
    }
  }
  return { secret: "", isSetup: false };
}
async function saveTotpSecret(secret, isSetup = true) {
  runtimeTotpSecret = secret;
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from("site_settings").upsert({
        id: "admin_totp_config",
        value: {
          secret,
          isSetup,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    } catch (e) {
      console.warn("Could not save admin_totp_config to Supabase:", e);
    }
  }
}
function createTempTotpToken(email, tempSecret, requireSetup) {
  const expiresAt = Date.now() + 10 * 60 * 1e3;
  const payloadStr = JSON.stringify({ email, tempSecret, requireSetup, expiresAt });
  const b64Payload = Buffer.from(payloadStr).toString("base64url");
  const hmac = crypto.createHmac("sha256", ADMIN_SECRET).update(b64Payload).digest("hex");
  return `tmp_${b64Payload}_${hmac}`;
}
function verifyTempTotpToken(token) {
  if (!token || typeof token !== "string" || !token.startsWith("tmp_")) return { valid: false };
  try {
    const parts = token.split("_");
    if (parts.length !== 3) return { valid: false };
    const b64Payload = parts[1];
    const signature = parts[2];
    const expectedHmac = crypto.createHmac("sha256", ADMIN_SECRET).update(b64Payload).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
      return { valid: false };
    }
    const payloadStr = Buffer.from(b64Payload, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadStr);
    if (Date.now() > payload.expiresAt) return { valid: false };
    return { valid: true, payload };
  } catch (e) {
    return { valid: false };
  }
}
var registeredUsersStore = [
  {
    id: "USR-101",
    fullName: "\u0641\u0631\u0634\u0627\u062F \u0645\u06CC\u0631\u0634\u06A9\u0627\u0631\u06CC",
    email: "40gates.main@gmail.com",
    phone: "09121112233",
    registeredAt: new Date(Date.now() - 30 * 24 * 3600 * 1e3).toISOString(),
    faDate: "\u06F1\u06F4\u06F0\u06F3/\u06F0\u06F4/\u06F1\u06F5"
  },
  {
    id: "USR-102",
    fullName: "\u0633\u0627\u0631\u0627 \u0627\u062D\u0645\u062F\u06CC",
    email: "sara.ahmadi@gmail.com",
    phone: "09351234567",
    registeredAt: new Date(Date.now() - 12 * 24 * 3600 * 1e3).toISOString(),
    faDate: "\u06F1\u06F4\u06F0\u06F3/\u06F0\u06F5/\u06F0\u06F1"
  },
  {
    id: "USR-103",
    fullName: "\u0639\u0644\u06CC \u0631\u0636\u0627\u06CC\u06CC",
    email: "ali.rezaei@yahoo.com",
    phone: "09129876543",
    registeredAt: new Date(Date.now() - 3 * 24 * 3600 * 1e3).toISOString(),
    faDate: "\u06F1\u06F4\u06F0\u06F3/\u06F0\u06F5/\u06F1\u06F0"
  }
];
var serverOrdersStore = [
  {
    id: "IRN-847291",
    date: "\u06F1\u06F4\u06F0\u06F3/\u06F0\u06F5/\u06F1\u06F2",
    status: "processing",
    items: [
      { productId: "book-40gates-print", title: "\u06A9\u062A\u0627\u0628 \u0686\u0627\u067E\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 \u0631\u0648\u06CC\u0627\u0628\u06CC\u0646\u06CC \u0622\u06AF\u0627\u0647\u0627\u0646\u0647", quantity: 1, price: 58e4, type: "printed" },
      { productId: "audio-dream-course", title: "\u062F\u0648\u0631\u0647 \u062C\u0627\u0645\u0639 \u0635\u0648\u062A\u06CC \u06AF\u0627\u0645 \u0628\u0647 \u06AF\u0627\u0645 \u0631\u0648\u06CC\u0627\u0628\u06CC\u0646\u06CC", quantity: 1, price: 89e4, type: "audio" }
    ],
    subtotal: 147e4,
    discountAmount: 294e3,
    vatAmount: 117600,
    shippingFee: 0,
    totalAmount: 1293600,
    shippingAddress: {
      fullName: "\u0633\u0627\u0631\u0627 \u0627\u062D\u0645\u062F\u06CC",
      phone: "09351234567",
      province: "\u062A\u0647\u0631\u0627\u0646",
      city: "\u062A\u0647\u0631\u0627\u0646",
      postalCode: "1987654321",
      address: "\u062E\u06CC\u0627\u0628\u0627\u0646 \u0648\u0644\u06CC\u0639\u0635\u0631\u060C \u0646\u0631\u0633\u06CC\u062F\u0647 \u0628\u0647 \u0645\u06CC\u062F\u0627\u0646 \u0648\u0646\u06A9\u060C \u067E\u0644\u0627\u06A9 \u06F1\u06F2"
    },
    userEmail: "sara.ahmadi@gmail.com",
    paymentGateway: "zarinpal"
  },
  {
    id: "IRN-392018",
    date: "\u06F1\u06F4\u06F0\u06F3/\u06F0\u06F5/\u06F1\u06F0",
    status: "shipped",
    trackingCode: "298371029384729103847261",
    items: [
      { productId: "book-lucid-dream-pdf", title: "\u0646\u0633\u062E\u0647 \u062F\u06CC\u062C\u06CC\u062A\u0627\u0644 PDF \u0634\u0627\u0647\u06A9\u0644\u06CC\u062F \u0631\u0648\u06CC\u0627", quantity: 1, price: 34e4, type: "pdf" }
    ],
    subtotal: 34e4,
    discountAmount: 0,
    vatAmount: 34e3,
    shippingFee: 0,
    totalAmount: 374e3,
    shippingAddress: {
      fullName: "\u0639\u0644\u06CC \u0631\u0636\u0627\u06CC\u06CC",
      phone: "09129876543",
      province: "\u0627\u0635\u0641\u0647\u0627\u0646",
      city: "\u0627\u0635\u0641\u0647\u0627\u0646",
      postalCode: "8123456789",
      address: "\u062E\u06CC\u0627\u0628\u0627\u0646 \u0686\u0647\u0627\u0631\u0628\u0627\u063A \u0639\u0628\u0627\u0633\u06CC\u060C \u06A9\u0648\u0686\u0647 \u0628\u0647\u0627\u0631\u060C \u067E\u0644\u0627\u06A9 \u06F5"
    },
    userEmail: "ali.rezaei@yahoo.com",
    paymentGateway: "card-to-card"
  }
];
var ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "40gates-master-key-2026";
function generateAdminToken(email) {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1e3;
  const payload = `${email}:${expiresAt}`;
  const hmac = crypto.createHmac("sha256", ADMIN_SECRET).update(payload).digest("hex");
  const b64Email = Buffer.from(email).toString("base64");
  return `adm_${expiresAt}_${hmac}_${b64Email}`;
}
function verifyAdminToken(token) {
  if (!token || typeof token !== "string" || !token.startsWith("adm_")) return { valid: false };
  try {
    const parts = token.split("_");
    if (parts.length < 4) return { valid: false };
    const expiresAt = parseInt(parts[1], 10);
    const signature = parts[2];
    const email = Buffer.from(parts[3], "base64").toString("utf-8");
    if (isNaN(expiresAt) || Date.now() > expiresAt) return { valid: false };
    const payload = `${email}:${expiresAt}`;
    const expectedHmac = crypto.createHmac("sha256", ADMIN_SECRET).update(payload).digest("hex");
    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
      return { valid: true, email };
    }
  } catch (e) {
  }
  return { valid: false };
}
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "\u062F\u0633\u062A\u0631\u0633\u06CC \u063A\u06CC\u0631\u0645\u062C\u0627\u0632. \u0644\u0637\u0641\u0627 \u0648\u0627\u0631\u062F \u0634\u0648\u06CC\u062F." });
  }
  const token = authHeader.split(" ")[1];
  let session = adminSecurityState.activeSessions.get(token);
  if (!session) {
    const verified = verifyAdminToken(token);
    if (verified.valid) {
      session = {
        token,
        email: verified.email || "40gates.main@gmail.com",
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1e3
      };
      adminSecurityState.activeSessions.set(token, session);
    }
  }
  if (!session || Date.now() > session.expiresAt) {
    if (session) adminSecurityState.activeSessions.delete(token);
    return res.status(401).json({ success: false, error: "\u0646\u0634\u0633\u062A \u0645\u062F\u06CC\u0631\u06CC\u062A\u06CC \u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627 \u0645\u062C\u062F\u062F\u0627 \u0648\u0627\u0631\u062F \u0634\u0648\u06CC\u062F." });
  }
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1e3;
  req.adminSession = session;
  next();
}
async function syncOrdersFromSupabase() {
  const client = getSupabaseClient();
  if (!client) return serverOrdersStore;
  try {
    const { data, error } = await client.from("orders").select("*").order("created_at", { ascending: false });
    if (!error && Array.isArray(data) && data.length > 0) {
      const dbOrders = data.map((item) => item.data || item);
      for (const order of dbOrders) {
        if (order && order.id && !serverOrdersStore.some((o) => o.id === order.id)) {
          serverOrdersStore.push(order);
        }
      }
    }
  } catch (e) {
    console.warn("Supabase orders sync warn:", e);
  }
  return serverOrdersStore;
}
async function persistOrderToSupabase(order) {
  const client = getSupabaseClient();
  if (!client || !order || !order.id) return;
  try {
    await client.from("orders").upsert({
      id: order.id,
      data: order,
      user_email: order.userEmail || order.shippingAddress?.email || "",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (e) {
    console.warn("Supabase save order warn:", e);
  }
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", serverTime: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/sitemap.xml", (req, res) => {
  const publicSitemap = path.join(process.cwd(), "public", "sitemap.xml");
  const distSitemap = path.join(process.cwd(), "dist", "sitemap.xml");
  if (fs.existsSync(publicSitemap)) {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.sendFile(publicSitemap);
  } else if (fs.existsSync(distSitemap)) {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.sendFile(distSitemap);
  }
  res.status(404).send("Sitemap file not found.");
});
app.get("/robots.txt", (req, res) => {
  const publicRobots = path.join(process.cwd(), "public", "robots.txt");
  const distRobots = path.join(process.cwd(), "dist", "robots.txt");
  if (fs.existsSync(publicRobots)) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.sendFile(publicRobots);
  } else if (fs.existsSync(distRobots)) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.sendFile(distRobots);
  }
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://40gates.ir/sitemap.xml\n");
});
var serverProductsStore = [];
async function syncProductsFromSupabase() {
  const client = getSupabaseClient();
  if (!client) return serverProductsStore;
  try {
    const { data, error } = await client.from("products").select("*");
    if (!error && Array.isArray(data) && data.length > 0) {
      serverProductsStore = data.map((item) => item.data || item);
    }
  } catch (e) {
    console.warn("Supabase products sync warn:", e);
  }
  return serverProductsStore;
}
async function persistProductsToSupabase(productsList) {
  const client = getSupabaseClient();
  if (!client || !Array.isArray(productsList) || productsList.length === 0) return;
  try {
    const rows = productsList.map((p) => ({
      id: p.id,
      data: p,
      stock: p.stock,
      price: p.price,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }));
    await client.from("products").upsert(rows);
  } catch (e) {
    console.warn("Supabase save products warn:", e);
  }
}
app.get("/api/products", async (req, res) => {
  let products = await syncProductsFromSupabase();
  res.json({ success: true, products });
});
app.post("/api/products", async (req, res) => {
  try {
    const { products: newProducts, product: singleProduct } = req.body;
    if (Array.isArray(newProducts) && newProducts.length > 0) {
      serverProductsStore = newProducts;
      persistProductsToSupabase(newProducts).catch((e) => console.warn("Products persist warn:", e));
    } else if (singleProduct && singleProduct.id) {
      const idx = serverProductsStore.findIndex((p) => p.id === singleProduct.id);
      if (idx >= 0) {
        serverProductsStore[idx] = { ...serverProductsStore[idx], ...singleProduct };
      } else {
        serverProductsStore.unshift(singleProduct);
      }
      persistProductsToSupabase(serverProductsStore).catch((e) => console.warn("Product persist warn:", e));
    }
    res.json({ success: true, products: serverProductsStore });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message });
  }
});
app.get("/api/orders", async (req, res) => {
  const orders = await syncOrdersFromSupabase();
  res.json({ success: true, orders });
});
app.post("/api/orders", async (req, res) => {
  try {
    const { order } = req.body;
    if (order && order.id) {
      const existingIdx = serverOrdersStore.findIndex((o) => o.id === order.id);
      if (existingIdx >= 0) {
        serverOrdersStore[existingIdx] = { ...serverOrdersStore[existingIdx], ...order };
      } else {
        serverOrdersStore.unshift(order);
      }
      persistOrderToSupabase(order).catch((e) => console.warn("Order persist warn:", e));
      const custEmail = (order.shippingAddress?.email || order.userEmail || "").trim();
      const custName = order.shippingAddress?.fullName;
      const custPhone = order.shippingAddress?.phone;
      if (custEmail) {
        const existingUser = registeredUsersStore.find((u) => u.email.toLowerCase() === custEmail.toLowerCase());
        if (!existingUser) {
          registeredUsersStore.unshift({
            id: "USR-" + Date.now(),
            fullName: custName || "\u062E\u0631\u06CC\u062F\u0627\u0631 \u0622\u06A9\u0627\u062F\u0645\u06CC",
            email: custEmail,
            phone: custPhone || "",
            registeredAt: (/* @__PURE__ */ new Date()).toISOString(),
            faDate: (/* @__PURE__ */ new Date()).toLocaleDateString("fa-IR")
          });
        }
      }
      const adminEmail = runtimeResendConfig.adminEmail || process.env.ADMIN_EMAIL || "40gates.main@gmail.com";
      const items = order.items || [];
      const totalAmount = order.totalAmount || 0;
      const subtotal = order.subtotal || 0;
      const shippingFee = order.shippingFee || 0;
      const itemsHtml = items.map((item) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px; font-size: 13px;">${item.title || "\u0645\u062D\u0635\u0648\u0644"} (${item.quantity || 1} \u0639\u062F\u062F)</td>
          <td style="padding: 10px; font-size: 13px; text-align: left; font-weight: bold; color: #4338ca;">
            ${((item.price || 0) * (item.quantity || 1)).toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646
          </td>
        </tr>
      `).join("");
      if (custEmail) {
        try {
          await sendMailSafely({
            to: custEmail,
            subject: `\u{1F6D2} \u062A\u0627\u06CC\u06CC\u062F \u062B\u0628\u062A \u0633\u0641\u0627\u0631\u0634 #${order.id} - \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647`,
            html: `
              <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 25px; color: #1e293b;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                  <div style="background: linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95); padding: 25px 20px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 20px; color: #fbbf24;">\u062A\u0627\u06CC\u06CC\u062F \u062B\u0628\u062A \u0633\u0641\u0627\u0631\u0634 - \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647</h1>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #e0e7ff;">\u0634\u0645\u0627\u0631\u0647 \u0633\u0641\u0627\u0631\u0634: ${order.id}</p>
                  </div>
                  <div style="padding: 25px; font-size: 13px; line-height: 1.8;">
                    <p>\u0633\u0644\u0627\u0645 <strong>${custName || "\u0647\u0646\u0631\u062C\u0648\u06CC \u06AF\u0631\u0627\u0645\u06CC"}</strong> \u0639\u0632\u06CC\u0632\u060C</p>
                    <p>\u0633\u0641\u0627\u0631\u0634 \u0634\u0645\u0627 \u0628\u0627 \u0634\u0645\u0627\u0631\u0647 <strong>#${order.id}</strong> \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062B\u0628\u062A \u0634\u062F \u0648 \u062F\u0631 \u0645\u0631\u062D\u0644\u0647 \u067E\u0631\u062F\u0627\u0632\u0634 \u0642\u0631\u0627\u0631 \u06AF\u0631\u0641\u062A.</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                      <thead>
                        <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                          <th style="padding: 8px; text-align: right; font-size: 12px; color: #64748b;">\u0645\u062D\u0635\u0648\u0644</th>
                          <th style="padding: 8px; text-align: left; font-size: 12px; color: #64748b;">\u0645\u0628\u0644\u063A</th>
                        </tr>
                      </thead>
                      <tbody>${itemsHtml}</tbody>
                    </table>
                    <div style="background-color: #f8fafc; border-radius: 12px; padding: 15px; margin: 15px 0;">
                      <p style="margin: 4px 0;">\u062C\u0645\u0639 \u06A9\u0644: <strong>${subtotal.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646</strong></p>
                      ${shippingFee > 0 ? `<p style="margin: 4px 0;">\u0647\u0632\u06CC\u0646\u0647 \u0627\u0631\u0633\u0627\u0644: <strong>${shippingFee.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646</strong></p>` : ""}
                      <p style="margin: 8px 0 0 0; font-size: 15px; font-weight: bold; color: #1e1b4b; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
                        \u0645\u0628\u0644\u063A \u0646\u0647\u0627\u06CC\u06CC \u067E\u0631\u062F\u0627\u062E\u062A\u06CC: ${totalAmount.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646
                      </p>
                    </div>
                    <p style="font-size: 12px; color: #64748b;">\u0648\u0636\u0639\u06CC\u062A \u0633\u0641\u0627\u0631\u0634 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0647\u0645\u06CC\u0646 \u0627\u06CC\u0645\u06CC\u0644 \u0648 \u067E\u06CC\u0627\u0645\u06A9 \u0628\u0647 \u0634\u0645\u0627 \u0627\u0637\u0644\u0627\u0639\u200C\u0631\u0633\u0627\u0646\u06CC \u062E\u0648\u0627\u0647\u062F \u0634\u062F.</p>
                  </div>
                  <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                    \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647
                  </div>
                </div>
              </div>
            `
          }, "order-customer");
        } catch (e) {
          console.warn("Customer order email err:", e);
        }
      }
      try {
        await sendMailSafely({
          to: adminEmail,
          subject: `\u{1F514} \u0633\u0641\u0627\u0631\u0634 \u062C\u062F\u06CC\u062F \u062B\u0628\u062A \u0634\u062F #${order.id} - ${totalAmount.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646`,
          html: `
            <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 25px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
              <h2 style="color: #38bdf8; margin-top: 0;">\u{1F6D2} \u0633\u0641\u0627\u0631\u0634 \u062C\u062F\u06CC\u062F \u062F\u0631 \u0648\u0628\u200C\u0633\u0627\u06CC\u062A \u062B\u0628\u062A \u0634\u062F!</h2>
              <p><strong>\u0634\u0645\u0627\u0631\u0647 \u0633\u0641\u0627\u0631\u0634:</strong> ${order.id}</p>
              <p><strong>\u0646\u0627\u0645 \u062E\u0631\u06CC\u062F\u0627\u0631:</strong> ${custName || "\u0646\u0627\u0645\u0634\u062E\u0635"}</p>
              <p><strong>\u0627\u06CC\u0645\u06CC\u0644 \u062E\u0631\u06CC\u062F\u0627\u0631:</strong> ${custEmail || "\u062B\u0628\u062A \u0646\u0634\u062F\u0647"}</p>
              <p><strong>\u062A\u0644\u0641\u0646 \u062E\u0631\u06CC\u062F\u0627\u0631:</strong> ${custPhone || "-"}</p>
              <p><strong>\u0645\u0628\u0644\u063A \u06A9\u0644:</strong> ${totalAmount.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646</p>
              <p><strong>\u0622\u062F\u0631\u0633:</strong> ${order.shippingAddress?.address || "\u062F\u06CC\u062C\u06CC\u062A\u0627\u0644 / \u0622\u0646\u0644\u0627\u06CC\u0646"}</p>
              <hr style="border-color: #334155; margin: 15px 0;"/>
              <h4 style="color: #fbbf24; margin: 0 0 10px 0;">\u0627\u0642\u0644\u0627\u0645 \u0633\u0641\u0627\u0631\u0634:</h4>
              <ul>
                ${items.map((i) => `<li>${i.title || "\u0645\u062D\u0635\u0648\u0644"} - ${i.quantity || 1} \u0639\u062F\u062F (${((i.price || 0) * (i.quantity || 1)).toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646)</li>`).join("")}
              </ul>
            </div>
          `
        }, "order-admin-notify");
      } catch (e) {
        console.warn("Admin order email err:", e);
      }
    }
    res.json({ success: true, orders: serverOrdersStore });
  } catch (e) {
    res.status(500).json({ success: false, error: "\u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u0633\u0641\u0627\u0631\u0634 \u062F\u0631 \u0633\u0631\u0648\u0631" });
  }
});
app.patch("/api/orders/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingCode } = req.body;
    const target = serverOrdersStore.find((o) => o.id === id);
    if (target) {
      if (status) target.status = status;
      if (trackingCode) target.trackingCode = trackingCode;
      return res.json({ success: true, order: target });
    }
    res.status(404).json({ success: false, error: "\u0633\u0641\u0627\u0631\u0634 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
  } catch (e) {
    res.status(500).json({ success: false, error: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0648\u0636\u0639\u06CC\u062A \u0633\u0641\u0627\u0631\u0634" });
  }
});
app.get("/api/users", (req, res) => {
  res.json({ success: true, users: registeredUsersStore });
});
app.post("/api/users/register", async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    if (email) {
      const existing = registeredUsersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        if (fullName) existing.fullName = fullName;
        if (phone) existing.phone = phone;
      } else {
        const newUser = {
          id: "USR-" + Date.now(),
          fullName: fullName || "\u0647\u0646\u0631\u062C\u0648\u06CC \u0631\u0648\u06CC\u0627\u0628\u06CC\u0646\u06CC \u0634\u0641\u0627\u0641",
          email: email.trim(),
          phone: phone || "",
          registeredAt: (/* @__PURE__ */ new Date()).toISOString(),
          faDate: (/* @__PURE__ */ new Date()).toLocaleDateString("fa-IR")
        };
        registeredUsersStore.unshift(newUser);
        const adminEmail = runtimeResendConfig.adminEmail || process.env.ADMIN_EMAIL || "40gates.main@gmail.com";
        await sendMailSafely({
          to: adminEmail,
          subject: `\u{1F464} \u062B\u0628\u062A\u200C\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F: ${newUser.fullName} (${newUser.email})`,
          html: `
            <div dir="rtl" style="font-family: Tahoma, sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
              <h3 style="color: #38bdf8;">\u{1F464} \u0639\u0636\u0648\u06CC\u062A \u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F \u062F\u0631 \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647</h3>
              <p><strong>\u0646\u0627\u0645:</strong> ${newUser.fullName}</p>
              <p><strong>\u0627\u06CC\u0645\u06CC\u0644:</strong> ${newUser.email}</p>
              <p><strong>\u0634\u0645\u0627\u0631\u0647 \u0647\u0645\u0631\u0627\u0647:</strong> ${newUser.phone || "-"}</p>
              <p><strong>\u062A\u0627\u0631\u06CC\u062E \u062B\u0628\u062A:</strong> ${newUser.faDate}</p>
            </div>
          `
        }, "user-register-admin-notify");
      }
    }
    res.json({ success: true, users: registeredUsersStore });
  } catch (e) {
    res.status(500).json({ success: false, error: "\u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06A9\u0627\u0631\u0628\u0631" });
  }
});
app.post("/api/admin/login", async (req, res) => {
  try {
    if (Date.now() < adminSecurityState.lockedUntil) {
      const remainingMinutes = Math.ceil((adminSecurityState.lockedUntil - Date.now()) / 6e4);
      return res.status(429).json({
        success: false,
        error: `\u062D\u0633\u0627\u0628 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0628\u0647 \u062F\u0644\u06CC\u0644 \u062A\u0644\u0627\u0634\u200C\u0647\u0627\u06CC \u0646\u0627\u0645\u0648\u0641\u0642 \u0645\u062A\u0639\u062F\u062F \u0642\u0641\u0644 \u0634\u062F\u0647 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627 ${remainingMinutes} \u062F\u0642\u06CC\u0642\u0647 \u062F\u06CC\u06AF\u0631 \u0645\u062C\u062F\u062F\u0627\u064B \u062A\u0644\u0627\u0634 \u06A9\u0646\u06CC\u062F.`
      });
    }
    const { email, password } = req.body;
    const { adminEmail, adminPassword } = getAdminConfig();
    const clientIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();
    const inputEmail = (email || "").trim().toLowerCase();
    const inputPass = (password || "").trim();
    const isValidEmail = inputEmail === adminEmail.toLowerCase();
    const isValidPass = inputPass === adminPassword;
    if (!isValidEmail || !isValidPass) {
      adminSecurityState.failedPasswordCount += 1;
      adminSecurityState.loginLogs.unshift({
        id: "LOG-" + Date.now(),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        faTime: (/* @__PURE__ */ new Date()).toLocaleTimeString("fa-IR"),
        faDate: (/* @__PURE__ */ new Date()).toLocaleDateString("fa-IR"),
        ip: clientIp,
        status: "FAILED_PASSWORD",
        email: email || "\u0646\u0627\u0645\u0634\u062E\u0635",
        userAgent: req.headers["user-agent"]
      });
      if (adminSecurityState.failedPasswordCount >= 5) {
        adminSecurityState.lockedUntil = Date.now() + 15 * 60 * 1e3;
        return res.status(429).json({
          success: false,
          error: "\u062A\u0639\u062F\u0627\u062F \u06F5 \u062A\u0644\u0627\u0634 \u0646\u0627\u0645\u0648\u0641\u0642 \u0648\u0631\u0648\u062F \u062B\u0628\u062A \u0634\u062F. \u062D\u0633\u0627\u0628 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0628\u0647 \u0645\u062F\u062A \u06F1\u06F5 \u062F\u0642\u06CC\u0642\u0647 \u0645\u0633\u062F\u0648\u062F \u06AF\u0631\u062F\u06CC\u062F."
        });
      }
      return res.status(401).json({
        success: false,
        error: `\u0627\u06CC\u0645\u06CC\u0644 \u06CC\u0627 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0645\u062F\u06CC\u0631 \u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0633\u062A. (\u062A\u0644\u0627\u0634 ${adminSecurityState.failedPasswordCount} \u0627\u0632 \u06F5)`
      });
    }
    adminSecurityState.failedPasswordCount = 0;
    let { secret } = await getStoredTotpSecret();
    if (!secret) {
      secret = generateSecret();
      await saveTotpSecret(secret, true);
    }
    const tempToken = createTempTotpToken(adminEmail, secret, false);
    return res.json({
      success: true,
      tempToken,
      message: "\u06A9\u062F \u06F6 \u0631\u0642\u0645\u06CC \u0646\u0631\u0645\u200C\u0627\u0641\u0632\u0627\u0631 Google Authenticator \u06CC\u0627 Microsoft Authenticator \u062E\u0648\u062F \u0631\u0627 \u0648\u0627\u0631\u062F \u0646\u0645\u0627\u06CC\u06CC\u062F."
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ success: false, error: "\u062E\u0637\u0627 \u062F\u0631 \u0641\u0631\u0622\u06CC\u0646\u062F \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A \u0627\u0648\u0644\u06CC\u0647 \u0645\u062F\u06CC\u0631" });
  }
});
var handleVerifyTotpHandler = async (req, res) => {
  try {
    if (Date.now() < adminSecurityState.lockedUntil) {
      const remainingMinutes = Math.ceil((adminSecurityState.lockedUntil - Date.now()) / 6e4);
      return res.status(429).json({
        success: false,
        error: `\u062D\u0633\u0627\u0628 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0642\u0641\u0644 \u0634\u062F\u0647 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627 ${remainingMinutes} \u062F\u0642\u06CC\u0642\u0647 \u062F\u06CC\u06AF\u0631 \u0635\u0628\u0631 \u06A9\u0646\u06CC\u062F.`
      });
    }
    const { tempToken, code } = req.body;
    const { adminEmail } = getAdminConfig();
    const clientIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();
    const verifiedTemp = verifyTempTotpToken(tempToken);
    if (!verifiedTemp.valid || !verifiedTemp.payload) {
      return res.status(401).json({
        success: false,
        error: "\u0646\u0634\u0633\u062A \u0632\u0645\u0627\u0646\u200C\u062F\u0627\u0631 \u0648\u0631\u0648\u062F \u0645\u0646\u0642\u0636\u06CC \u0634\u062F\u0647 \u06CC\u0627 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0645\u062C\u062F\u062F\u0627\u064B \u0627\u06CC\u0645\u06CC\u0644 \u0648 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0631\u0627 \u0648\u0627\u0631\u062F \u0646\u0645\u0627\u06CC\u06CC\u062F."
      });
    }
    const { tempSecret, requireSetup } = verifiedTemp.payload;
    const inputCode = (code || "").toString().trim().replace(/\s+/g, "");
    if (!inputCode || inputCode.length !== 6 || !/^\d{6}$/.test(inputCode)) {
      return res.status(400).json({
        success: false,
        error: "\u0644\u0637\u0641\u0627\u064B \u06A9\u062F \u06F6 \u0631\u0642\u0645\u06CC \u0631\u0627 \u0628\u0647 \u0637\u0648\u0631 \u06A9\u0627\u0645\u0644 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F."
      });
    }
    let secretToVerify = tempSecret;
    if (!secretToVerify) {
      const stored = await getStoredTotpSecret();
      secretToVerify = stored.secret;
    }
    if (!secretToVerify) {
      return res.status(400).json({
        success: false,
        error: "\u06A9\u0644\u06CC\u062F \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F. \u0644\u0637\u0641\u0627\u064B \u0645\u062C\u062F\u062F\u0627\u064B \u062A\u0644\u0627\u0634 \u06A9\u0646\u06CC\u062F."
      });
    }
    const checkResult = verifySync({ token: inputCode, secret: secretToVerify, epochTolerance: 30 });
    const isValidCode = checkResult && checkResult.valid === true;
    if (!isValidCode) {
      adminSecurityState.loginLogs.unshift({
        id: "LOG-" + Date.now(),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        faTime: (/* @__PURE__ */ new Date()).toLocaleTimeString("fa-IR"),
        faDate: (/* @__PURE__ */ new Date()).toLocaleDateString("fa-IR"),
        ip: clientIp,
        status: "FAILED_OTP",
        email: adminEmail,
        userAgent: req.headers["user-agent"]
      });
      return res.status(401).json({
        success: false,
        error: "\u06A9\u062F \u06F6 \u0631\u0642\u0645\u06CC \u0646\u0631\u0645\u200C\u0627\u0641\u0632\u0627\u0631 Authenticator \u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u06A9\u062F \u062C\u062F\u06CC\u062F \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0634\u062F\u0647 \u062F\u0631 \u0627\u067E\u0644\u06CC\u06A9\u06CC\u0634\u0646 \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F."
      });
    }
    if (requireSetup) {
      await saveTotpSecret(tempSecret, true);
    }
    adminSecurityState.failedPasswordCount = 0;
    const token = generateAdminToken(adminEmail);
    adminSecurityState.activeSessions.set(token, {
      token,
      email: adminEmail,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1e3
      // 7 Days session
    });
    adminSecurityState.loginLogs.unshift({
      id: "LOG-" + Date.now(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      faTime: (/* @__PURE__ */ new Date()).toLocaleTimeString("fa-IR"),
      faDate: (/* @__PURE__ */ new Date()).toLocaleDateString("fa-IR"),
      ip: clientIp,
      status: "SUCCESS",
      email: adminEmail,
      userAgent: req.headers["user-agent"]
    });
    return res.json({
      success: true,
      token,
      admin: { email: adminEmail },
      message: requireSetup ? "\u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A \u062F\u0648 \u0639\u0627\u0645\u0644\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u0648 \u0648\u0627\u0631\u062F \u0634\u062F\u06CC\u062F." : "\u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0646\u062C\u0627\u0645 \u0634\u062F."
    });
  } catch (err) {
    console.error("Verify TOTP error:", err);
    return res.status(500).json({ success: false, error: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0631\u0633\u06CC \u06A9\u062F \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A \u062F\u0648 \u0639\u0627\u0645\u0644\u06CC" });
  }
};
app.post("/api/admin/verify-totp", handleVerifyTotpHandler);
app.post("/api/admin/verify-otp", handleVerifyTotpHandler);
app.post("/api/admin/reset-totp", requireAdminAuth, async (req, res) => {
  try {
    await saveTotpSecret("", false);
    return res.json({
      success: true,
      message: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A \u062F\u0648 \u0639\u0627\u0645\u0644\u06CC (TOTP) \u0628\u0627\u0632\u0646\u0634\u0627\u0646\u06CC \u06AF\u0631\u062F\u06CC\u062F. \u062F\u0631 \u0648\u0631\u0648\u062F \u0628\u0639\u062F\u06CC \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F QR \u06A9\u062F \u062C\u062F\u06CC\u062F\u06CC \u0631\u0627 \u0627\u0633\u06A9\u0646 \u06A9\u0646\u06CC\u062F."
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0627\u0632\u0646\u0634\u0627\u0646\u06CC \u062A\u0646\u0638\u06CC\u0645\u0627\u062A 2FA" });
  }
});
app.get("/api/admin/verify-session", requireAdminAuth, (req, res) => {
  const session = req.adminSession;
  res.json({ success: true, valid: true, admin: { email: session.email } });
});
app.post("/api/admin/logout", requireAdminAuth, (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) adminSecurityState.activeSessions.delete(token);
  res.json({ success: true, message: "\u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0632 \u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A \u062E\u0627\u0631\u062C \u0634\u062F\u06CC\u062F." });
});
app.get("/api/admin/logs", requireAdminAuth, (req, res) => {
  res.json({ success: true, logs: adminSecurityState.loginLogs });
});
app.get("/api/admin/settings", requireAdminAuth, (req, res) => {
  const { adminEmail } = getAdminConfig();
  const activeAdminEmail = runtimeResendConfig.adminEmail || adminEmail;
  const isResendConfigured = Boolean(runtimeResendConfig.apiKey || process.env.RESEND_API_KEY);
  const fromEmail = runtimeResendConfig.fromEmail || process.env.RESEND_FROM_EMAIL || "\u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 <onboarding@resend.dev>";
  res.json({
    success: true,
    settings: {
      adminEmail: activeAdminEmail,
      emailService: "resend",
      resendConfigured: isResendConfigured,
      resendApiKeyMasked: isResendConfigured ? "re_\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "\u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647",
      resendFromEmail: fromEmail,
      // Backward compatibility fields
      smtpConfigured: isResendConfigured,
      smtpUser: fromEmail,
      activeSessionsCount: adminSecurityState.activeSessions.size,
      totalLogins: adminSecurityState.loginLogs.length
    }
  });
});
var handleUpdateEmailConfig = async (req, res) => {
  try {
    const { resendApiKey, apiKey, resendFromEmail, fromEmail, adminEmail, gmailUser, gmailPass } = req.body;
    const newApiKey = (resendApiKey || apiKey || (gmailPass && gmailPass.startsWith("re_") ? gmailPass : "") || "").trim();
    const newFromEmail = (resendFromEmail || fromEmail || (gmailUser && !gmailUser.includes("@gmail.com") ? gmailUser : "") || "").trim();
    const newAdminEmail = (adminEmail || "").trim();
    if (newApiKey) runtimeResendConfig.apiKey = newApiKey;
    if (newFromEmail) runtimeResendConfig.fromEmail = newFromEmail;
    if (newAdminEmail) runtimeResendConfig.adminEmail = newAdminEmail;
    const isResendConfigured = Boolean(runtimeResendConfig.apiKey || process.env.RESEND_API_KEY);
    if (getSupabaseClient()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          await client.from("site_settings").upsert({
            id: "email_config",
            value: {
              apiKey: runtimeResendConfig.apiKey,
              fromEmail: runtimeResendConfig.fromEmail,
              adminEmail: runtimeResendConfig.adminEmail,
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          });
        }
      } catch (dbErr) {
        console.warn("Could not persist Resend config to Supabase:", dbErr);
      }
    }
    return res.json({
      success: true,
      message: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0627\u0631\u0633\u0627\u0644 \u0627\u06CC\u0645\u06CC\u0644 (Resend API) \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062F\u0631 \u0633\u0631\u0648\u0631 \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F.",
      resendConfigured: isResendConfigured,
      fromEmail: runtimeResendConfig.fromEmail,
      adminEmail: runtimeResendConfig.adminEmail,
      // Backward-compat
      smtpConfigured: isResendConfigured,
      smtpUser: runtimeResendConfig.fromEmail
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "\u062E\u0637\u0627 \u062F\u0631 \u0630\u062E\u06CC\u0631\u0647 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0627\u06CC\u0645\u06CC\u0644" });
  }
};
app.post("/api/admin/email-config", requireAdminAuth, handleUpdateEmailConfig);
app.post("/api/admin/smtp-config", requireAdminAuth, handleUpdateEmailConfig);
var handleContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "\u0646\u0627\u0645\u060C \u0627\u06CC\u0645\u06CC\u0644 \u0648 \u0645\u062A\u0646 \u067E\u06CC\u0627\u0645 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A." });
    }
    const newMessage = {
      id: "MSG-" + Date.now(),
      name: name.trim(),
      email: email.trim(),
      subject: subject || "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC",
      message: message.trim(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      faDate: (/* @__PURE__ */ new Date()).toLocaleDateString("fa-IR"),
      faTime: (/* @__PURE__ */ new Date()).toLocaleTimeString("fa-IR"),
      read: false
    };
    contactMessages.unshift(newMessage);
    const siteEmail = process.env.ADMIN_EMAIL || "40gates.main@gmail.com";
    await sendMailSafely({
      to: siteEmail,
      subject: `\u{1F4AC} \u067E\u06CC\u0627\u0645 \u062C\u062F\u06CC\u062F \u0627\u0632 \u0641\u0631\u0645 \u062A\u0645\u0627\u0633: ${name.trim()} (${newMessage.id})`,
      html: `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 25px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #4338ca; margin-top: 0; border-bottom: 2px solid #e0e7ff; pb: 10px;">\u{1F4AC} \u067E\u06CC\u0627\u0645 \u062C\u062F\u06CC\u062F \u062F\u0631 \u0628\u062E\u0634 \u062A\u0645\u0627\u0633 \u0628\u0627 \u0641\u0631\u0634\u0627\u062F \u0645\u06CC\u0631\u0634\u06A9\u0627\u0631\u06CC</h2>
            
            <div style="margin: 20px 0; font-size: 14px; line-height: 1.8;">
              <p><strong>\u06A9\u062F \u062A\u06CC\u06A9\u062A:</strong> <span style="font-family: monospace; color: #4338ca;">${newMessage.id}</span></p>
              <p><strong>\u0646\u0627\u0645 \u0641\u0631\u0633\u062A\u0646\u062F\u0647:</strong> ${name.trim()}</p>
              <p><strong>\u0627\u06CC\u0645\u06CC\u0644 \u0641\u0631\u0633\u062A\u0646\u062F\u0647:</strong> <a href="mailto:${email.trim()}" style="color: #2563eb;">${email.trim()}</a></p>
              <p><strong>\u0645\u0648\u0636\u0648\u0639 \u067E\u06CC\u0627\u0645:</strong> ${subject || "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC"}</p>
              <p><strong>\u062A\u0627\u0631\u06CC\u062E \u0648 \u0632\u0645\u0627\u0646:</strong> ${newMessage.faDate} - \u0633\u0627\u0639\u062A ${newMessage.faTime}</p>
            </div>

            <div style="background-color: #f1f5f9; border-right: 4px solid #6366f1; padding: 18px; border-radius: 8px; font-size: 13px; line-height: 1.8; color: #0f172a;">
              <strong>\u0645\u062A\u0646 \u067E\u06CC\u0627\u0645:</strong><br/>
              ${message.trim().replace(/\n/g, "<br/>")}
            </div>

            <p style="font-size: 11px; color: #64748b; margin-top: 25px; border-top: 1px solid #f1f5f9; pt: 15px;">
              \u0627\u06CC\u0646 \u067E\u06CC\u0627\u0645 \u0627\u0632 \u0641\u0631\u0645 \u062A\u0645\u0627\u0633 \u0628\u0627 \u0641\u0631\u0634\u0627\u062F \u0645\u06CC\u0631\u0634\u06A9\u0627\u0631\u06CC \u0648\u0628\u200C\u0633\u0627\u06CC\u062A \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 \u0627\u0631\u0633\u0627\u0644 \u06AF\u0631\u062F\u06CC\u062F\u0647 \u0627\u0633\u062A.
            </p>
          </div>
        </div>
      `
    }, "contact-admin-notify");
    const userHtml = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 25px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #4338ca; margin: 0 0 8px 0;">\u2728 \u067E\u06CC\u0627\u0645 \u0634\u0645\u0627 \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0;">\u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 | \u0641\u0631\u0634\u0627\u062F \u0645\u06CC\u0631\u0634\u06A9\u0627\u0631\u06CC</p>
          </div>

          <p style="font-size: 14px; line-height: 1.8; color: #334155;">
            \u062C\u0646\u0627\u0628 \u0622\u0642\u0627\u06CC / \u0633\u0631\u06A9\u0627\u0631 \u062E\u0627\u0646\u0645 <strong>${name.trim()}</strong> \u0639\u0632\u06CC\u0632\u060C \u0628\u0627 \u0633\u0644\u0627\u0645 \u0648 \u0627\u062D\u062A\u0631\u0627\u0645\u061B
          </p>

          <p style="font-size: 13px; line-height: 1.8; color: #475569;">
            \u067E\u06CC\u0627\u0645 \u0634\u0645\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062F\u0631 \u0633\u06CC\u0633\u062A\u0645 \u062A\u06CC\u06A9\u062A\u06CC\u0646\u06AF \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 \u062B\u0628\u062A \u06AF\u0631\u062F\u06CC\u062F. \u067E\u06CC\u0627\u0645 \u0634\u0645\u0627 \u062A\u0648\u0633\u0637 \u0641\u0631\u0634\u0627\u062F \u0645\u06CC\u0631\u0634\u06A9\u0627\u0631\u06CC \u0648 \u062A\u06CC\u0645 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0628\u0631\u0631\u0633\u06CC \u0634\u062F\u0647 \u0648 \u062F\u0631 \u06A9\u0645\u062A\u0631 \u0627\u0632 \u06F2\u06F4 \u0633\u0627\u0639\u062A \u0622\u06CC\u0646\u062F\u0647\u060C \u067E\u0627\u0633\u062E \u0622\u0646 \u0628\u0647 \u0647\u0645\u06CC\u0646 \u0622\u062F\u0631\u0633 \u0627\u06CC\u0645\u06CC\u0644 \u0627\u0631\u0633\u0627\u0644 \u062E\u0648\u0627\u0647\u062F \u0634\u062F.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; font-size: 13px; line-height: 1.8;">
            <h4 style="color: #312e81; margin-top: 0; margin-bottom: 12px; font-size: 14px;">\u{1F4CB} \u062E\u0644\u0627\u0635\u0647 \u067E\u06CC\u0627\u0645 \u062B\u0628\u062A \u0634\u062F\u0647 \u0634\u0645\u0627:</h4>
            <p style="margin: 4px 0;"><strong>\u06A9\u062F \u067E\u06CC\u06AF\u06CC\u0631\u06CC:</strong> <span style="font-family: monospace; color: #4338ca;">${newMessage.id}</span></p>
            <p style="margin: 4px 0;"><strong>\u0645\u0648\u0636\u0648\u0639:</strong> ${subject || "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC"}</p>
            <p style="margin: 4px 0;"><strong>\u062A\u0627\u0631\u06CC\u062E \u062B\u0628\u062A:</strong> ${newMessage.faDate} - \u0633\u0627\u0639\u062A ${newMessage.faTime}</p>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1; color: #334155;">
              <strong>\u0645\u062A\u0646 \u067E\u06CC\u0627\u0645:</strong><br/>
              ${message.trim().replace(/\n/g, "<br/>")}
            </div>
          </div>

          <div style="background-color: #eff6ff; border-radius: 10px; padding: 15px; font-size: 12px; color: #1e40af; line-height: 1.6;">
            \u{1F4A1} <strong>\u0646\u06A9\u062A\u0647:</strong> \u0627\u06AF\u0631 \u0646\u06CC\u0627\u0632 \u0628\u0647 \u0627\u0631\u0633\u0627\u0644 \u0641\u0627\u06CC\u0644 \u06CC\u0627 \u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u062A\u06A9\u0645\u06CC\u0644\u06CC \u062F\u0627\u0631\u06CC\u062F\u060C \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0645\u0633\u062A\u0642\u06CC\u0645\u0627\u064B \u0628\u0647 \u0647\u0645\u06CC\u0646 \u0627\u06CC\u0645\u06CC\u0644 (40gates.main@gmail.com) \u06CC\u0627 \u0627\u06A9\u0627\u0646\u062A \u062A\u0644\u06AF\u0631\u0627\u0645 <a href="https://t.me/Farshad_God" style="color: #2563eb; font-weight: bold;">t.me/Farshad_God</a> \u067E\u06CC\u0627\u0645 \u062F\u0647\u06CC\u062F.
          </div>

          <div style="text-align: center; margin-top: 30px; pt: 20px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 11px;">
            \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 \u2014 \u0645\u0631\u062C\u0639 \u062A\u062E\u0635\u0635\u06CC \u0631\u0648\u06CC\u0627\u0628\u06CC\u0646\u06CC \u0622\u06AF\u0627\u0647\u0627\u0646\u0647<br/>
            \u0627\u06CC\u0645\u06CC\u0644 \u0631\u0633\u0645\u06CC: <a href="mailto:40gates.main@gmail.com" style="color: #6366f1;">40gates.main@gmail.com</a>
          </div>

        </div>
      </div>
    `;
    await sendMailSafely({
      to: email.trim(),
      subject: `\u2728 \u062F\u0631\u06CC\u0627\u0641\u062A \u067E\u06CC\u0627\u0645 \u0634\u0645\u0627 \u062F\u0631 \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 (\u06A9\u062F \u062A\u06CC\u06A9\u062A: ${newMessage.id})`,
      html: userHtml
    }, "contact-user-autoreply");
    return res.json({
      success: true,
      message: "\u067E\u06CC\u0627\u0645 \u0634\u0645\u0627 \u062B\u0628\u062A \u0634\u062F. \u06CC\u06A9 \u0627\u06CC\u0645\u06CC\u0644 \u062A\u0627\u06CC\u06CC\u062F\u06CC\u0647 \u062F\u0631\u06CC\u0627\u0641\u062A \u067E\u06CC\u0627\u0645 \u0628\u0647 \u0622\u062F\u0631\u0633 \u0627\u06CC\u0645\u06CC\u0644 \u0634\u0645\u0627 \u0627\u0631\u0633\u0627\u0644 \u06AF\u0631\u062F\u06CC\u062F.",
      ticketId: newMessage.id
    });
  } catch (err) {
    console.error("Contact endpoint error:", err);
    return res.status(500).json({ success: false, error: "\u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u067E\u06CC\u0627\u0645" });
  }
};
app.post("/api/contact", handleContactMessage);
app.post("/api/email/contact", handleContactMessage);
app.get("/api/admin/contact-messages", requireAdminAuth, (req, res) => {
  res.json({ success: true, messages: contactMessages });
});
app.get("/api/supabase/status", async (req, res) => {
  const url = (runtimeSupabaseConfig.url || process.env.VITE_SUPABASE_URL || "").trim();
  const anonKey = (runtimeSupabaseConfig.anonKey || process.env.VITE_SUPABASE_ANON_KEY || "").trim();
  const serviceKey = (runtimeSupabaseConfig.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const isConfigured = Boolean(url && (anonKey || serviceKey));
  if (!isConfigured) {
    return res.json({
      connected: false,
      configured: false,
      url: url || null,
      hasAnonKey: Boolean(anonKey),
      hasServiceKey: Boolean(serviceKey),
      message: "\u06A9\u0644\u06CC\u062F\u0647\u0627\u06CC \u0627\u062A\u0635\u0627\u0644 VITE_SUPABASE_URL \u0648 VITE_SUPABASE_ANON_KEY \u0647\u0646\u0648\u0632 \u0645\u0642\u062F\u0627\u0631\u062F\u0647\u06CC \u0646\u0634\u062F\u0647\u200C\u0627\u0646\u062F."
    });
  }
  try {
    const checkUrl = `${url.replace(/\/$/, "")}/rest/v1/`;
    const response = await fetch(checkUrl, {
      method: "GET",
      headers: {
        "apikey": anonKey || serviceKey,
        "Authorization": `Bearer ${anonKey || serviceKey}`
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
        message: "\u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 Supabase \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0642\u0631\u0627\u0631 \u0627\u0633\u062A."
      });
    } else {
      return res.json({
        connected: false,
        configured: true,
        url,
        hasAnonKey: Boolean(anonKey),
        hasServiceKey: Boolean(serviceKey),
        httpStatus: response.status,
        message: `\u067E\u0627\u0633\u062E \u0646\u0627\u062E\u0648\u0627\u0633\u062A\u0647 \u0627\u0632 Supabase (\u06A9\u062F ${response.status}). \u0635\u062D\u062A \u06A9\u0644\u06CC\u062F\u0647\u0627 \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u06CC\u062F.`
      });
    }
  } catch (err) {
    return res.json({
      connected: false,
      configured: true,
      url,
      hasAnonKey: Boolean(anonKey),
      hasServiceKey: Boolean(serviceKey),
      error: err?.message || String(err),
      message: "\u062E\u0637\u0627 \u062F\u0631 \u0634\u0628\u06A9\u0647 \u0647\u0646\u06AF\u0627\u0645 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 Supabase. URL \u067E\u0631\u0648\u0698\u0647 \u0631\u0627 \u0686\u06A9 \u06A9\u0646\u06CC\u062F."
    });
  }
});
app.post("/api/supabase/config", (req, res) => {
  const { url, anonKey, serviceKey } = req.body;
  if (url !== void 0) runtimeSupabaseConfig.url = String(url).trim();
  if (anonKey !== void 0) runtimeSupabaseConfig.anonKey = String(anonKey).trim();
  if (serviceKey !== void 0) runtimeSupabaseConfig.serviceKey = String(serviceKey).trim();
  return res.json({
    success: true,
    message: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u06A9\u0644\u06CC\u062F\u0647\u0627\u06CC Supabase \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u06AF\u0631\u062F\u06CC\u062F.",
    config: {
      url: runtimeSupabaseConfig.url,
      hasAnonKey: Boolean(runtimeSupabaseConfig.anonKey),
      hasServiceKey: Boolean(runtimeSupabaseConfig.serviceKey)
    }
  });
});
app.patch("/api/admin/contact-messages/:id", requireAdminAuth, (req, res) => {
  const msg = contactMessages.find((m) => m.id === req.params.id);
  if (msg) {
    msg.read = true;
    return res.json({ success: true, message: "\u0648\u0636\u0639\u06CC\u062A \u067E\u06CC\u0627\u0645 \u0628\u0647 \u062E\u0648\u0627\u0646\u062F\u0647 \u0634\u062F\u0647 \u062A\u063A\u06CC\u06CC\u0631 \u06CC\u0627\u0641\u062A." });
  }
  return res.status(404).json({ success: false, error: "\u067E\u06CC\u0627\u0645 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
});
app.get("/api/email/logs", (req, res) => {
  res.json({ success: true, logs: emailLogs });
});
var handleTestEmail = async (req, res) => {
  try {
    const { testEmail, to } = req.body;
    const target = (testEmail || to || runtimeResendConfig.adminEmail || process.env.ADMIN_EMAIL || "40gates.main@gmail.com").trim();
    const isConfigured = Boolean(runtimeResendConfig.apiKey || process.env.RESEND_API_KEY);
    const result = await sendMailSafely({
      to: target,
      subject: "\u{1F9EA} \u0627\u06CC\u0645\u06CC\u0644 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 - \u062A\u0633\u062A \u0633\u0631\u0648\u06CC\u0633 Resend API",
      html: `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 25px; background: #0f172a; color: #fff; border-radius: 12px;">
          <h2 style="color: #38bdf8; margin-top: 0;">\u2705 \u062A\u0633\u062A \u0627\u0631\u0633\u0627\u0644 \u0627\u06CC\u0645\u06CC\u0644 Resend API \u0645\u0648\u0641\u0642\u06CC\u062A\u200C\u0622\u0645\u06CC\u0632 \u0628\u0648\u062F!</h2>
          <p>\u0627\u06CC\u0646 \u0627\u06CC\u0645\u06CC\u0644 \u062C\u0647\u062A \u062A\u0633\u062A \u0633\u0631\u0648\u06CC\u0633 \u0627\u0631\u0633\u0627\u0644 \u0627\u06CC\u0645\u06CC\u0644 \u0645\u062F\u0631\u0646 \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 \u0627\u0632 \u0637\u0631\u06CC\u0642 <strong>Resend API</strong> \u0627\u0631\u0633\u0627\u0644 \u06AF\u0631\u062F\u06CC\u062F\u0647 \u0627\u0633\u062A.</p>
          <div style="background: #1e293b; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 13px;">
            <p style="margin: 4px 0;"><strong>\u0641\u0631\u0633\u062A\u0646\u062F\u0647:</strong> ${runtimeResendConfig.fromEmail || process.env.RESEND_FROM_EMAIL || "\u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 <onboarding@resend.dev>"}</p>
            <p style="margin: 4px 0;"><strong>\u06AF\u06CC\u0631\u0646\u062F\u0647:</strong> ${target}</p>
            <p style="margin: 4px 0;"><strong>\u0632\u0645\u0627\u0646 \u0627\u0631\u0633\u0627\u0644:</strong> ${(/* @__PURE__ */ new Date()).toLocaleString("fa-IR")}</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">\u0633\u06CC\u0633\u062A\u0645 \u0627\u0631\u0633\u0627\u0644 \u0627\u06CC\u0645\u06CC\u0644 \u0628\u0647 Resend \u0645\u062A\u0635\u0644 \u0627\u0633\u062A \u0648 \u0639\u0645\u0644\u06CC\u0627\u062A \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F.</p>
        </div>
      `
    }, "test-email");
    return res.json({
      success: result.success,
      status: result.status,
      configured: isConfigured,
      message: result.status === "sent" ? `\u0627\u06CC\u0645\u06CC\u0644 \u062A\u0633\u062A \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0632 \u0637\u0631\u06CC\u0642 Resend API \u0628\u0647 ${target} \u0627\u0631\u0633\u0627\u0644 \u0634\u062F.` : result.status === "simulated" ? `\u06A9\u0644\u06CC\u062F RESEND_API_KEY \u062F\u0631 \u0645\u062A\u063A\u06CC\u0631\u0647\u0627\u06CC \u0645\u062D\u06CC\u0637\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F. \u0627\u0631\u0633\u0627\u0644 \u0634\u0628\u06CC\u0647\u200C\u0633\u0627\u0632\u06CC \u0634\u062F (\u0645\u062D\u06CC\u0637 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC).` : `\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u0627\u06CC\u0645\u06CC\u0644 \u0627\u0632 \u0637\u0631\u06CC\u0642 Resend API: ${result.error}`,
      details: result
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err?.message || "\u062E\u0637\u0627 \u062F\u0631 \u062A\u0633\u062A \u0627\u06CC\u0645\u06CC\u0644" });
  }
};
app.post("/api/admin/test-email", requireAdminAuth, handleTestEmail);
app.post("/api/email/test", handleTestEmail);
app.post("/api/email/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "\u0622\u062F\u0631\u0633 \u0627\u06CC\u0645\u06CC\u0644 \u0645\u0639\u062A\u0628\u0631 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A." });
    }
    const cleanEmail = email.trim().toLowerCase();
    const adminEmail = runtimeResendConfig.adminEmail || process.env.ADMIN_EMAIL || "40gates.main@gmail.com";
    const userResetHtml = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 25px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #4338ca; margin: 0 0 8px 0;">\u{1F511} \u0628\u0627\u0632\u06CC\u0627\u0628\u06CC \u06A9\u0644\u0645\u0647 \u0639\u0628\u0648\u0631 - \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0;">\u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u062A\u0646\u0638\u06CC\u0645 \u0645\u062C\u062F\u062F \u06AF\u0630\u0631\u0648\u0627\u0698\u0647 \u062D\u0633\u0627\u0628 \u06A9\u0627\u0631\u0628\u0631\u06CC</p>
          </div>

          <p style="font-size: 14px; line-height: 1.8; color: #334155;">
            \u0633\u0644\u0627\u0645 \u062F\u0648\u0633\u062A \u06AF\u0631\u0627\u0645\u06CC\u061B<br/>
            \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0628\u0627\u0632\u06CC\u0627\u0628\u06CC \u06A9\u0644\u0645\u0647 \u0639\u0628\u0648\u0631 \u0628\u0631\u0627\u06CC \u062D\u0633\u0627\u0628 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0645\u062A\u0635\u0644 \u0628\u0647 \u0627\u06CC\u0645\u06CC\u0644 <strong>${cleanEmail}</strong> \u062B\u0628\u062A \u0634\u062F\u0647 \u0627\u0633\u062A.
          </p>

          <div style="background-color: #f1f5f9; border-right: 4px solid #6366f1; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px; line-height: 1.8;">
            \u062C\u0647\u062A \u062A\u0633\u0631\u06CC\u0639 \u062F\u0631 \u0628\u0627\u0632\u06CC\u0627\u0628\u06CC \u06A9\u0644\u0645\u0647 \u0639\u0628\u0648\u0631 \u0648 \u062D\u0641\u0638 \u0627\u0645\u0646\u06CC\u062A \u062D\u0633\u0627\u0628\u060C \u0644\u0637\u0641\u0627\u064B \u0628\u0627 \u0627\u06CC\u0645\u06CC\u0644 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0628\u0647 \u0622\u062F\u0631\u0633 <a href="mailto:${adminEmail}" style="color: #2563eb; font-weight: bold;">${adminEmail}</a> \u06CC\u0627 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u062A\u0644\u06AF\u0631\u0627\u0645 <a href="https://t.me/Farshad_God" style="color: #2563eb; font-weight: bold;">t.me/Farshad_God</a> \u062F\u0631 \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627\u0634\u06CC\u062F.
          </div>

          <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 20px;">
            \u0627\u06AF\u0631 \u0627\u06CC\u0646 \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u062A\u0648\u0633\u0637 \u0634\u0645\u0627 \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A\u060C \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0627\u06CC\u0646 \u0627\u06CC\u0645\u06CC\u0644 \u0631\u0627 \u0646\u0627\u062F\u06CC\u062F\u0647 \u0628\u06AF\u06CC\u0631\u06CC\u062F.
          </p>
        </div>
      </div>
    `;
    const userEmailResult = await sendMailSafely({
      to: cleanEmail,
      subject: "\u{1F511} \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0628\u0627\u0632\u06CC\u0627\u0628\u06CC \u06A9\u0644\u0645\u0647 \u0639\u0628\u0648\u0631 \u062F\u0631 \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647",
      html: userResetHtml
    }, "forgot-password");
    try {
      await sendMailSafely({
        to: adminEmail,
        subject: `\u{1F511} \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0628\u0627\u0632\u06CC\u0627\u0628\u06CC \u06A9\u0644\u0645\u0647 \u0639\u0628\u0648\u0631: ${cleanEmail}`,
        html: `
          <div dir="rtl" style="font-family: Tahoma, sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
            <h3 style="color: #fbbf24;">\u{1F511} \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0628\u0627\u0632\u06CC\u0627\u0628\u06CC \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062C\u062F\u06CC\u062F \u062B\u0628\u062A \u0634\u062F</h3>
            <p><strong>\u0627\u06CC\u0645\u06CC\u0644 \u06A9\u0627\u0631\u0628\u0631:</strong> ${cleanEmail}</p>
            <p><strong>\u062A\u0627\u0631\u06CC\u062E \u0648 \u0632\u0645\u0627\u0646:</strong> ${(/* @__PURE__ */ new Date()).toLocaleDateString("fa-IR")} - \u0633\u0627\u0639\u062A ${(/* @__PURE__ */ new Date()).toLocaleTimeString("fa-IR")}</p>
          </div>
        `
      }, "forgot-password-admin-notify");
    } catch (e) {
      console.warn("Admin password reset notify err:", e);
    }
    return res.json({
      success: true,
      message: "\u062F\u0633\u062A\u0648\u0631\u0627\u0644\u0639\u0645\u0644 \u0628\u0627\u0632\u06CC\u0627\u0628\u06CC \u06A9\u0644\u0645\u0647 \u0639\u0628\u0648\u0631 \u0628\u0647 \u0627\u06CC\u0645\u06CC\u0644 \u0634\u0645\u0627 \u0627\u0631\u0633\u0627\u0644 \u0634\u062F.",
      status: userEmailResult.status
    });
  } catch (err) {
    console.error("Forgot password endpoint error:", err);
    return res.status(500).json({ success: false, error: "\u062E\u0637\u0627 \u062F\u0631 \u0641\u0631\u0622\u06CC\u0646\u062F \u0628\u0627\u0632\u06CC\u0627\u0628\u06CC \u06A9\u0644\u0645\u0647 \u0639\u0628\u0648\u0631" });
  }
});
app.post("/api/email/welcome", async (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "\u0622\u062F\u0631\u0633 \u0627\u06CC\u0645\u06CC\u0644 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A" });
    }
    const gmailUser = process.env.GMAIL_USER;
    const htmlContent = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 25px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95); padding: 30px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; color: #fbbf24;">\u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647</h1>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #e0e7ff;">\u0634\u0627\u0647\u06A9\u0644\u06CC\u062F \u06CC\u0627\u062F\u06AF\u06CC\u0631\u06CC \u0639\u0645\u06CC\u0642 \u062F\u0631 \u0642\u0644\u0645\u0631\u0648 \u0631\u0648\u06CC\u0627\u0647\u0627</p>
          </div>

          <!-- Content -->
          <div style="padding: 25px; line-height: 1.8; font-size: 14px;">
            <h2 style="color: #312e81; font-size: 18px; margin-top: 0;">\u0633\u0644\u0627\u0645 ${fullName || "\u0633\u0627\u0644\u06A9 \u06AF\u0631\u0627\u0645\u06CC"} \u0639\u0632\u06CC\u0632\u060C \u062E\u0648\u0634 \u0622\u0645\u062F\u06CC\u062F! \u{1F338}</h2>
            <p>\u0639\u0636\u0648\u06CC\u062A \u0634\u0645\u0627 \u062F\u0631 \u0648\u0628\u0633\u0627\u06CC\u062A \u0631\u0633\u0645\u06CC \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062B\u0628\u062A \u06AF\u0631\u062F\u06CC\u062F.</p>
            
            <div style="background-color: #f1f5f9; border-right: 4px solid #6366f1; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #1e1b4b;">\xAB\u0634\u0645\u0627 \u0647\u0631 \u0634\u0628 \u0645\u0648\u0642\u0639 \u062E\u0648\u0627\u0628 \u0628\u0647 \u062F\u0646\u06CC\u0627\u06CC \u0634\u062E\u0635\u06CC \u062E\u0648\u06CC\u0634 \u0642\u062F\u0645 \u0645\u06CC\u200C\u06AF\u0630\u0627\u0631\u06CC\u062F\u061B \u0648 \u0627\u0632 \u0627\u06CC\u0646 \u062D\u0642 \u0627\u0646\u062A\u062E\u0627\u0628 \u0628\u0631\u062E\u0648\u0631\u062F\u0627\u0631 \u0647\u0633\u062A\u06CC\u062F \u06A9\u0647 \u0628\u0647 \u0634\u06A9\u0644 \u0622\u062F\u0645\u06CC \u0645\u0639\u0645\u0648\u0644\u06CC \u06CC\u0627 \u062F\u0631 \u0642\u0627\u0645\u062A \u067E\u0627\u062F\u0634\u0627\u0647\u06CC \u0628\u06CC\u200C\u0647\u0645\u062A\u0627 \u0638\u0627\u0647\u0631 \u0634\u0648\u06CC\u062F. \u0622\u0631\u06CC\u061B \u0627\u0646\u062A\u062E\u0627\u0628 \u0628\u0627 \u062E\u0648\u062F \u0634\u0645\u0627\u0633\u062A. \u0627\u0644\u0628\u062A\u0647 \u0628\u0647 \u0627\u06CC\u0646 \u0634\u0631\u0637 \u06A9\u0647 \u0635\u0627\u062D\u0628 \u06AF\u0648\u0647\u0631 \u062E\u0648\u062F\u0622\u06AF\u0627\u0647\u06CC \u0628\u0627\u0634\u06CC\u062F.\xBB</p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #4338ca; font-style: italic;">\u2014 \u0641\u0631\u0634\u0627\u062F \u0645\u06CC\u0631\u0634\u06A9\u0627\u0631\u06CC</p>
            </div>

            <p>\u0627\u06A9\u0646\u0648\u0646 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0627\u0632 \u067E\u0646\u0644 \u06A9\u0627\u0631\u0628\u0631\u06CC \u062E\u0648\u062F \u0628\u0647 \u062A\u0645\u0627\u0645\u06CC \u062F\u0648\u0631\u0647\u200C\u0647\u0627\u06CC \u062B\u0628\u062A\u200C\u0646\u0627\u0645\u06CC\u060C \u06A9\u062A\u0627\u0628\u200C\u0647\u0627\u06CC \u062F\u06CC\u062C\u06CC\u062A\u0627\u0644 \u0648 \u0641\u0627\u06CC\u0644\u200C\u0647\u0627\u06CC \u0635\u0648\u062A\u06CC \u062F\u0633\u062A\u0631\u0633\u06CC \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u06CC\u062F.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL || "https://40gates.ir"}/#dashboard" style="background: linear-gradient(to right, #4f46e5, #7c3aed); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: bold; display: inline-block;">\u0648\u0631\u0648\u062F \u0628\u0647 \u062D\u0633\u0627\u0628 \u06A9\u0627\u0631\u0628\u0631\u06CC</a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />

            <div style="font-size: 12px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0;"><strong>\u0631\u0627\u0647 \u0627\u0631\u062A\u0628\u0627\u0637 \u0645\u0633\u062A\u0642\u06CC\u0645 \u0628\u0627 \u0641\u0631\u0634\u0627\u062F \u0645\u06CC\u0631\u0634\u06A9\u0627\u0631\u06CC:</strong></p>
              <p style="margin: 4px 0;">\u{1F4F7} \u0627\u06CC\u0646\u0633\u062A\u0627\u06AF\u0631\u0627\u0645: <a href="https://www.instagram.com/farshad_g.o.d" style="color: #4f46e5;">instagram.com/farshad_g.o.d</a></p>
              <p style="margin: 4px 0;">\u2708\uFE0F \u062A\u0644\u06AF\u0631\u0627\u0645: <a href="https://t.me/Farshad_God" style="color: #0284c7;">t.me/Farshad_God</a></p>
              ${gmailUser ? `<p style="margin: 4px 0;">\u2709\uFE0F \u0627\u06CC\u0645\u06CC\u0644 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC: <a href="mailto:${gmailUser}" style="color: #4f46e5;">${gmailUser}</a></p>` : ""}
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            \xA9 \u062A\u0645\u0627\u0645\u06CC \u062D\u0642\u0648\u0642 \u0628\u0631\u0627\u06CC \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 \u0648 \u0641\u0631\u0634\u0627\u062F \u0645\u06CC\u0631\u0634\u06A9\u0627\u0631\u06CC \u0645\u062D\u0641\u0648\u0638 \u0627\u0633\u062A.
          </div>
        </div>
      </div>
    `;
    if (email) {
      const existingUser = registeredUsersStore.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!existingUser) {
        registeredUsersStore.unshift({
          id: "USR-" + Date.now(),
          fullName: fullName || "\u0647\u0646\u0631\u062C\u0648\u06CC \u0631\u0648\u06CC\u0627\u0628\u06CC\u0646\u06CC \u0634\u0641\u0627\u0641",
          email: email.trim(),
          phone: "",
          registeredAt: (/* @__PURE__ */ new Date()).toISOString(),
          faDate: (/* @__PURE__ */ new Date()).toLocaleDateString("fa-IR")
        });
      }
    }
    const welcomeResult = await sendMailSafely({
      to: email.trim(),
      subject: "\u062E\u0648\u0634 \u0622\u0645\u062F\u06CC\u062F \u0628\u0647 \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 | \u0628\u06CC\u062F\u0627\u0631\u06CC \u062F\u0631 \u0642\u0644\u0645\u0631\u0648 \u0631\u0648\u06CC\u0627\u0647\u0627",
      html: htmlContent
    }, "welcome");
    return res.json({
      success: true,
      message: welcomeResult.status === "sent" ? "\u0627\u06CC\u0645\u06CC\u0644 \u062E\u0648\u0634\u200C\u0622\u0645\u062F\u06AF\u0648\u06CC\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0631\u0633\u0627\u0644 \u0634\u062F." : welcomeResult.status === "simulated" ? "\u062B\u0628\u062A\u200C\u0646\u0627\u0645 \u0627\u0646\u062C\u0627\u0645 \u0634\u062F (\u0627\u06CC\u0645\u06CC\u0644 \u062F\u0631 \u0645\u062D\u06CC\u0637 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0634\u0628\u06CC\u0647\u200C\u0633\u0627\u0632\u06CC \u06AF\u0631\u062F\u06CC\u062F)." : `\u062B\u0628\u062A\u200C\u0646\u0627\u0645 \u0627\u0646\u062C\u0627\u0645 \u0634\u062F (${welcomeResult.error})`,
      status: welcomeResult.status
    });
  } catch (err) {
    console.error("Welcome Email error:", err);
    return res.status(500).json({ success: false, error: err?.message || "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u0627\u06CC\u0645\u06CC\u0644" });
  }
});
app.post("/api/email/order-created", async (req, res) => {
  try {
    const { order, customerEmail, customerName } = req.body;
    if (!order || !customerEmail) {
      return res.status(400).json({ success: false, error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0633\u0641\u0627\u0631\u0634 \u0648 \u0627\u06CC\u0645\u06CC\u0644 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
    }
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || "40gates.main@gmail.com";
    const items = order.items || [];
    const subtotal = order.subtotal || 0;
    const shippingFee = order.shippingFee || 0;
    const totalAmount = order.totalAmount || 0;
    const itemsHtml = items.map((item) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px; font-size: 13px;">${item.title || "\u0645\u062D\u0635\u0648\u0644"} (${item.quantity || 1} \u0639\u062F\u062F)</td>
        <td style="padding: 10px; font-size: 13px; text-align: left; font-weight: bold; color: #4338ca;">
          ${((item.price || 0) * (item.quantity || 1)).toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646
        </td>
      </tr>
    `).join("");
    const customerHtml = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 25px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95); padding: 25px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; color: #fbbf24;">\u062A\u0627\u06CC\u06CC\u062F \u062B\u0628\u062A \u0633\u0641\u0627\u0631\u0634 - \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647</h1>
            <p style="margin: 6px 0 0 0; font-size: 12px; color: #e0e7ff;">\u0634\u0645\u0627\u0631\u0647 \u0633\u0641\u0627\u0631\u0634: ${order.id}</p>
          </div>

          <!-- Content -->
          <div style="padding: 25px; font-size: 13px; line-height: 1.8;">
            <p>\u0633\u0644\u0627\u0645 <strong>${customerName || "\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC"}</strong> \u0639\u0632\u06CC\u0632\u060C</p>
            <p>\u0633\u0641\u0627\u0631\u0634 \u0634\u0645\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062F\u0631 \u0633\u06CC\u0633\u062A\u0645 \u062B\u0628\u062A \u06AF\u0631\u062F\u06CC\u062F \u0648 \u0647\u0645\u200C\u0627\u06A9\u0646\u0648\u0646 \u062F\u0631 \u0645\u0631\u062D\u0644\u0647 <strong>\u062A\u0627\u06CC\u06CC\u062F \u0648 \u067E\u0631\u062F\u0627\u0632\u0634 \u0627\u0648\u0644\u06CC\u0647</strong> \u0642\u0631\u0627\u0631 \u062F\u0627\u0631\u062F.</p>

            <h3 style="color: #312e81; font-size: 15px; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; margin-top: 20px;">\u0627\u0642\u0644\u0627\u0645 \u0633\u0641\u0627\u0631\u0634:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                  <th style="padding: 8px; text-align: right; font-size: 12px; color: #64748b;">\u0645\u062D\u0635\u0648\u0644</th>
                  <th style="padding: 8px; text-align: left; font-size: 12px; color: #64748b;">\u0645\u0628\u0644\u063A</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="background-color: #f8fafc; border-radius: 12px; padding: 15px; margin: 15px 0;">
              <p style="margin: 4px 0; display: flex; justify-content: space-between;">
                <span>\u062C\u0645\u0639 \u06A9\u0644 \u0627\u0642\u0644\u0627\u0645:</span> <strong>${subtotal.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646</strong>
              </p>
              ${shippingFee > 0 ? `
              <p style="margin: 4px 0; display: flex; justify-content: space-between;">
                <span>\u0647\u0632\u06CC\u0646\u0647 \u0627\u0631\u0633\u0627\u0644 \u067E\u0633\u062A\u06CC:</span> <strong>${shippingFee.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646</strong>
              </p>` : ""}
              <p style="margin: 8px 0 0 0; font-size: 15px; font-weight: bold; color: #1e1b4b; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
                \u0645\u0628\u0644\u063A \u0646\u0647\u0627\u06CC\u06CC \u067E\u0631\u062F\u0627\u062E\u062A\u06CC: ${totalAmount.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646
              </p>
            </div>

            ${order.trackingCode ? `
            <div style="background-color: #e0e7ff; border-right: 4px solid #4f46e5; padding: 12px; border-radius: 8px; margin: 15px 0;">
              <span style="font-size: 12px; color: #312e81; display: block; font-weight: bold;">\u06A9\u062F \u0631\u0647\u06AF\u06CC\u0631\u06CC \u067E\u0633\u062A\u06CC \u0645\u0631\u0633\u0648\u0644\u0647:</span>
              <strong style="font-size: 16px; color: #1e1b4b; letter-spacing: 1px;">${order.trackingCode}</strong>
            </div>
            ` : ""}

            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
              \u0628\u0627 \u0633\u067E\u0627\u0633 \u0627\u0632 \u0627\u0639\u062A\u0645\u0627\u062F \u0634\u0645\u0627 \u0628\u0647 \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647. \u0647\u0631\u06AF\u0648\u0646\u0647 \u062A\u063A\u06CC\u06CC\u0631 \u062F\u0631 \u0648\u0636\u0639\u06CC\u062A \u0633\u0641\u0627\u0631\u0634 \u0645\u062C\u062F\u062F\u0627\u064B \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0647\u0645\u06CC\u0646 \u0627\u06CC\u0645\u06CC\u0644 \u0627\u0637\u0644\u0627\u0639\u200C\u0631\u0633\u0627\u0646\u06CC \u062E\u0648\u0627\u0647\u062F \u0634\u062F.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647
          </div>
        </div>
      </div>
    `;
    const customerResult = await sendMailSafely({
      to: customerEmail.trim(),
      subject: `\u062A\u0627\u06CC\u06CC\u062F \u0633\u0641\u0627\u0631\u0634 #${order.id} - \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647`,
      html: customerHtml
    }, "order-customer");
    const ownerHtml = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 20px; color: #0f172a;">
        <h2 style="color: #047857;">\u{1F514} \u0633\u0641\u0627\u0631\u0634 \u062C\u062F\u06CC\u062F \u062F\u0631 \u0648\u0628\u0633\u0627\u06CC\u062A \u062B\u0628\u062A \u0634\u062F!</h2>
        <p><strong>\u0634\u0645\u0627\u0631\u0647 \u0633\u0641\u0627\u0631\u0634:</strong> ${order.id}</p>
        <p><strong>\u0646\u0627\u0645 \u0645\u0634\u062A\u0631\u06CC:</strong> ${customerName || order.shippingAddress?.fullName || "\u062B\u0628\u062A \u0634\u062F\u0647"}</p>
        <p><strong>\u0627\u06CC\u0645\u06CC\u0644 \u0645\u0634\u062A\u0631\u06CC:</strong> ${customerEmail}</p>
        <p><strong>\u062A\u0644\u0641\u0646 \u0645\u0634\u062A\u0631\u06CC:</strong> ${order.shippingAddress?.phone || "-"}</p>
        <p><strong>\u0645\u0628\u0644\u063A \u06A9\u0644:</strong> ${totalAmount.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646</p>
        <p><strong>\u0631\u0648\u0634 \u067E\u0631\u062F\u0627\u062E\u062A:</strong> ${order.paymentGateway || "\u06A9\u0627\u0631\u062A \u0628\u0647 \u06A9\u0627\u0631\u062A"}</p>
        <p><strong>\u0622\u062F\u0631\u0633 \u0627\u0631\u0633\u0627\u0644:</strong> ${order.shippingAddress?.address || "\u0627\u0631\u0633\u0627\u0644 \u062F\u06CC\u062C\u06CC\u062A\u0627\u0644/\u0622\u0646\u0644\u0627\u06CC\u0646"}</p>
        <hr/>
        <h4>\u0627\u0642\u0644\u0627\u0645 \u0633\u0641\u0627\u0631\u0634:</h4>
        <ul>
          ${items.map((i) => `<li>${i.title || "\u0645\u062D\u0635\u0648\u0644"} - ${i.quantity || 1} \u0639\u062F\u062F (${(i.price || 0).toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646)</li>`).join("")}
        </ul>
      </div>
    `;
    const adminResult = await sendMailSafely({
      to: adminEmail.trim(),
      subject: `\u{1F514} \u0633\u0641\u0627\u0631\u0634 \u062C\u062F\u06CC\u062F \u062B\u0628\u062A \u0634\u062F #${order.id} - ${totalAmount.toLocaleString("fa-IR")} \u062A\u0648\u0645\u0627\u0646`,
      html: ownerHtml
    }, "order-admin");
    if (order && order.id) {
      const existingIdx = serverOrdersStore.findIndex((o) => o.id === order.id);
      if (existingIdx >= 0) {
        serverOrdersStore[existingIdx] = { ...serverOrdersStore[existingIdx], ...order };
      } else {
        serverOrdersStore.unshift(order);
      }
    }
    return res.json({
      success: true,
      message: "\u0633\u0641\u0627\u0631\u0634 \u062B\u0628\u062A \u0648 \u067E\u0631\u062F\u0627\u0632\u0634 \u06AF\u0631\u062F\u06CC\u062F.",
      customerStatus: customerResult.status,
      adminStatus: adminResult.status
    });
  } catch (err) {
    console.error("Order email error:", err);
    return res.status(500).json({ success: false, error: err?.message || "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u0627\u06CC\u0645\u06CC\u0644 \u0633\u0641\u0627\u0631\u0634" });
  }
});
app.post("/api/email/order-status", async (req, res) => {
  try {
    const { orderId, newStatus, trackingCode, customerEmail, customerName } = req.body;
    if (!orderId || !customerEmail) {
      return res.status(400).json({ success: false, error: "\u067E\u0627\u0631\u0627\u0645\u062A\u0631\u0647\u0627\u06CC \u062A\u063A\u06CC\u06CC\u0631 \u0648\u0636\u0639\u06CC\u062A \u0633\u0641\u0627\u0631\u0634 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
    }
    const targetOrder = serverOrdersStore.find((o) => o.id === orderId);
    if (targetOrder) {
      if (newStatus) targetOrder.status = newStatus;
      if (trackingCode) targetOrder.trackingCode = trackingCode;
    }
    const statusLabels = {
      pending: "\u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u067E\u0631\u062F\u0627\u062E\u062A \u0648 \u062A\u0627\u06CC\u06CC\u062F \u0627\u0648\u0644\u06CC\u0647",
      processing: "\u062A\u0627\u06CC\u06CC\u062F \u0633\u0641\u0627\u0631\u0634 \u0648 \u062F\u0631 \u062D\u0627\u0644 \u0622\u0645\u0627\u062F\u0647\u200C\u0633\u0627\u0632\u06CC",
      shipped: "\u0627\u0631\u0633\u0627\u0644 \u0634\u062F\u0647 \u0628\u0627 \u067E\u0633\u062A \u067E\u06CC\u0634\u062A\u0627\u0632",
      completed: "\u062A\u06A9\u0645\u06CC\u0644 \u0634\u062F\u0647 \u0648 \u062A\u062D\u0648\u06CC\u0644 \u062F\u0627\u062F\u0647 \u0634\u062F\u0647",
      cancelled: "\u0644\u063A\u0648 \u0634\u062F\u0647"
    };
    const label = statusLabels[newStatus] || newStatus;
    const htmlContent = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #f8fafc; padding: 25px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #1e1b4b, #312e81); padding: 25px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; color: #fbbf24;">\u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0648\u0636\u0639\u06CC\u062A \u0633\u0641\u0627\u0631\u0634 #${orderId}</h2>
            <p style="margin: 6px 0 0 0; font-size: 13px;">\u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647 - \u0641\u0631\u0634\u0627\u062F \u0645\u06CC\u0631\u0634\u06A9\u0627\u0631\u06CC</p>
          </div>

          <div style="padding: 25px; font-size: 13px; line-height: 1.8;">
            <p>\u0633\u0644\u0627\u0645 <strong>${customerName || "\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC"}</strong> \u0639\u0632\u06CC\u0632\u060C</p>
            <p>\u0648\u0636\u0639\u06CC\u062A \u0633\u0641\u0627\u0631\u0634 \u0634\u0645\u0627 \u0634\u0645\u0627\u0631\u0647 <strong>#${orderId}</strong> \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F:</p>

            <div style="background-color: #f1f5f9; border-right: 4px solid #4f46e5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 12px; color: #64748b; display: block;">\u0648\u0636\u0639\u06CC\u062A \u062C\u062F\u06CC\u062F \u0633\u0641\u0627\u0631\u0634:</span>
              <strong style="font-size: 16px; color: #1e1b4b;">${label}</strong>
            </div>

            ${trackingCode ? `
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 12px; margin: 20px 0;">
              <h4 style="margin: 0 0 6px 0; color: #047857; font-size: 14px;">\u06A9\u062F \u0631\u0647\u06AF\u06CC\u0631\u06CC \u0645\u0631\u0633\u0648\u0644\u0647 \u067E\u0633\u062A\u06CC:</h4>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #065f46; letter-spacing: 1px;">${trackingCode}</p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #047857;">\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0645\u0631\u0633\u0648\u0644\u0647 \u062E\u0648\u062F \u0631\u0627 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0633\u0627\u0645\u0627\u0646\u0647 epost.post.ir \u067E\u06CC\u06AF\u06CC\u0631\u06CC \u0646\u0645\u0627\u06CC\u06CC\u062F.</p>
            </div>
            ` : ""}

            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.APP_URL || "https://40gates.ir"}/#track/${orderId}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 10px; font-weight: bold; display: inline-block;">\u067E\u06CC\u06AF\u06CC\u0631\u06CC \u0645\u0633\u062A\u0642\u06CC\u0645 \u0633\u0641\u0627\u0631\u0634</a>
            </div>
          </div>

          <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            \u0628\u0627 \u062A\u0634\u06A9\u0631 - \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647
          </div>
        </div>
      </div>
    `;
    const statusEmailResult = await sendMailSafely({
      to: customerEmail.trim(),
      subject: `\u062A\u063A\u06CC\u06CC\u0631 \u0648\u0636\u0639\u06CC\u062A \u0633\u0641\u0627\u0631\u0634 #${orderId}: ${label} - \u0622\u06A9\u0627\u062F\u0645\u06CC \u06F4\u06F0 \u062F\u0631\u0648\u0627\u0632\u0647`,
      html: htmlContent
    }, "order-status");
    return res.json({
      success: true,
      message: "\u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0648\u0636\u0639\u06CC\u062A \u0633\u0641\u0627\u0631\u0634 \u067E\u0631\u062F\u0627\u0632\u0634 \u0634\u062F.",
      status: statusEmailResult.status
    });
  } catch (err) {
    console.error("Status email error:", err);
    return res.status(500).json({ success: false, error: err?.message || "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0648\u0636\u0639\u06CC\u062A" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  startServer();
}
var server_default = app;
export {
  server_default as default,
  sanitizeErrorLog,
  sendMailSafely
};
