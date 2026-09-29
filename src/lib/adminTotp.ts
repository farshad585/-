// @ts-nocheck
// Admin TOTP
// src/lib/adminTotp.ts
import crypto from "crypto";
import { generateSecret, generateURI, generateSync, verifySync } from "otplib";
import QRCode from "qrcode";
var memoryTotpSecret = "";
var memoryTotpIsSetup = false;
export async function getAdminTotpSecret(envSecret, supabaseClient) {
  const envVal = (envSecret ?? process.env.ADMIN_TOTP_SECRET ?? "").trim();
  if (envVal) {
    memoryTotpSecret = envVal;
    memoryTotpIsSetup = true;
    return {
      secret: envVal,
      isSetup: true,
      source: "env"
    };
  }
  if (memoryTotpSecret && memoryTotpIsSetup) {
    return {
      secret: memoryTotpSecret,
      isSetup: true,
      source: "memory"
    };
  }
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("site_settings").select("value").eq("id", "admin_totp_config").single();
      if (!error && data && data.value && data.value.secret) {
        memoryTotpSecret = String(data.value.secret).trim();
        memoryTotpIsSetup = data.value.isSetup !== false;
        return {
          secret: memoryTotpSecret,
          isSetup: memoryTotpIsSetup,
          source: "database"
        };
      }
    } catch (e) {
      console.warn("Could not read admin_totp_config from Supabase:", e);
    }
  }
  return {
    secret: memoryTotpSecret || "",
    isSetup: memoryTotpIsSetup,
    source: memoryTotpSecret ? "memory" : "none"
  };
}
export async function persistTotpSecret(secret, isSetup = true, envSecret, supabaseClient) {
  const envVal = (envSecret ?? process.env.ADMIN_TOTP_SECRET ?? "").trim();
  if (envVal) {
    memoryTotpSecret = envVal;
    memoryTotpIsSetup = true;
    return;
  }
  memoryTotpSecret = secret.trim();
  memoryTotpIsSetup = isSetup;
  if (supabaseClient && memoryTotpSecret) {
    try {
      await supabaseClient.from("site_settings").upsert({
        id: "admin_totp_config",
        value: {
          secret: memoryTotpSecret,
          isSetup,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    } catch (e) {
      console.warn("Could not save admin_totp_config to Supabase:", e);
    }
  }
}
export async function resetAdminTotpSecret(envSecret, supabaseClient) {
  const envVal = (envSecret ?? process.env.ADMIN_TOTP_SECRET ?? "").trim();
  if (envVal) {
    return {
      success: false,
      isEnvLocked: true,
      message: "\u06A9\u0644\u06CC\u062F \u06F2FA \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0645\u062A\u063A\u06CC\u0631 \u0645\u062D\u06CC\u0637\u06CC ADMIN_TOTP_SECRET \u062A\u0639\u0631\u06CC\u0641 \u0634\u062F\u0647 \u0627\u0633\u062A \u0648 \u0627\u0632 \u067E\u0646\u0644 \u0648\u0628 \u0642\u0627\u0628\u0644 \u062A\u063A\u06CC\u06CC\u0631 \u06CC\u0627 \u062D\u0630\u0641 \u0646\u06CC\u0633\u062A."
    };
  }
  memoryTotpSecret = "";
  memoryTotpIsSetup = false;
  if (supabaseClient) {
    try {
      await supabaseClient.from("site_settings").delete().eq("id", "admin_totp_config");
    } catch (e) {
      console.warn("Could not delete admin_totp_config from Supabase:", e);
    }
  }
  return {
    success: true,
    isEnvLocked: false,
    message: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A \u062F\u0648 \u0639\u0627\u0645\u0644\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0627\u0632\u0646\u0634\u0627\u0646\u06CC \u0634\u062F. \u062F\u0631 \u0648\u0631\u0648\u062F \u0628\u0639\u062F\u06CC\u060C QR \u06A9\u062F \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u062C\u062F\u06CC\u062F \u0627\u06CC\u062C\u0627\u062F \u062E\u0648\u0627\u0647\u062F \u0634\u062F."
  };
}
export async function generateTotpQrCodeDataUrl(adminEmail, secret) {
  const otpUri = generateURI({
    issuer: "Academy 40 Gates",
    label: adminEmail || "admin@40gates.ir",
    secret: secret.trim()
  });
  const qrCodeDataUrl = await QRCode.toDataURL(otpUri, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 250
  });
  return { otpUri, qrCodeDataUrl };
}
export function createTempTotpToken(email, requireSetup, secretKey) {
  const expiresAt = Date.now() + 10 * 60 * 1e3;
  const nonce = crypto.randomBytes(8).toString("hex");
  const payloadStr = JSON.stringify({ email, requireSetup, expiresAt, nonce });
  const b64Payload = Buffer.from(payloadStr).toString("base64url");
  const hmac = crypto.createHmac("sha256", secretKey).update(b64Payload).digest("hex");
  return `tmp_${b64Payload}_${hmac}`;
}
export function verifyTempTotpToken(token, secretKey) {
  if (!token || typeof token !== "string" || !token.startsWith("tmp_")) {
    return { valid: false };
  }
  try {
    const parts = token.split("_");
    if (parts.length !== 3) return { valid: false };
    const b64Payload = parts[1];
    const signature = parts[2];
    const expectedHmac = crypto.createHmac("sha256", secretKey).update(b64Payload).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
      return { valid: false };
    }
    const payloadStr = Buffer.from(b64Payload, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadStr);
    if (Date.now() > payload.expiresAt) {
      return { valid: false };
    }
    return { valid: true, payload };
  } catch (e) {
    return { valid: false };
  }
}
export function verifyAdminTotpCode(inputCode, secret) {
  if (!inputCode || !secret) return false;
  const cleanCode = inputCode.toString().trim().replace(/\s+/g, "");
  if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) return false;
  try {
    const result = verifySync({ token: cleanCode, secret: secret.trim(), epochTolerance: 30 });
    return Boolean(result && result.valid === true);
  } catch (e) {
    return false;
  }
}

export function createNewTotpSecret() {
  return generateSecret();
}
