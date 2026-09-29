import crypto from 'crypto';
import { generateSecret, generateURI, generateSync, verifySync } from 'otplib';
import QRCode from 'qrcode';

export interface AdminTotpInfo {
  secret: string;
  isSetup: boolean;
  source: 'env' | 'database' | 'memory' | 'none';
}

export interface TempTotpPayload {
  email: string;
  requireSetup: boolean;
  expiresAt: number;
  nonce: string;
}

// In-memory cache for fast lookup and runtime persistence
let memoryTotpSecret: string = '';
let memoryTotpIsSetup: boolean = false;

/**
 * Resolves the single authoritative Admin TOTP secret.
 * Priority:
 * 1. Environment Variable ADMIN_TOTP_SECRET (Immutable, highest priority)
 * 2. In-Memory Cache (if already loaded/setup)
 * 3. Supabase Persistent Database (site_settings table, id: 'admin_totp_config')
 */
export async function getAdminTotpSecret(
  envSecret?: string,
  supabaseClient?: any
): Promise<AdminTotpInfo> {
  // 1. Priority 1: Environment Variable
  const envVal = (envSecret ?? process.env.ADMIN_TOTP_SECRET ?? '').trim();
  if (envVal) {
    memoryTotpSecret = envVal;
    memoryTotpIsSetup = true;
    return {
      secret: envVal,
      isSetup: true,
      source: 'env'
    };
  }

  // 2. Priority 2: Memory cache
  if (memoryTotpSecret && memoryTotpIsSetup) {
    return {
      secret: memoryTotpSecret,
      isSetup: true,
      source: 'memory'
    };
  }

  // 3. Priority 3: Supabase Persistent Database
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('site_settings')
        .select('value')
        .eq('id', 'admin_totp_config')
        .single();

      if (!error && data && data.value && data.value.secret) {
        memoryTotpSecret = String(data.value.secret).trim();
        memoryTotpIsSetup = data.value.isSetup !== false;
        return {
          secret: memoryTotpSecret,
          isSetup: memoryTotpIsSetup,
          source: 'database'
        };
      }
    } catch (e) {
      console.warn('Could not read admin_totp_config from Supabase:', e);
    }
  }

  return {
    secret: memoryTotpSecret || '',
    isSetup: memoryTotpIsSetup,
    source: memoryTotpSecret ? 'memory' : 'none'
  };
}

/**
 * Persists the TOTP secret to memory and database.
 * If ADMIN_TOTP_SECRET is configured in environment variables, persistence is bypassed.
 */
export async function persistTotpSecret(
  secret: string,
  isSetup: boolean = true,
  envSecret?: string,
  supabaseClient?: any
): Promise<void> {
  const envVal = (envSecret ?? process.env.ADMIN_TOTP_SECRET ?? '').trim();
  if (envVal) {
    // Environment variable is supreme and immutable
    memoryTotpSecret = envVal;
    memoryTotpIsSetup = true;
    return;
  }

  memoryTotpSecret = secret.trim();
  memoryTotpIsSetup = isSetup;

  if (supabaseClient && memoryTotpSecret) {
    try {
      await supabaseClient.from('site_settings').upsert({
        id: 'admin_totp_config',
        value: {
          secret: memoryTotpSecret,
          isSetup,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (e) {
      console.warn('Could not save admin_totp_config to Supabase:', e);
    }
  }
}

/**
 * Resets the 2FA secret.
 * Returns error if ADMIN_TOTP_SECRET is defined in environment variables.
 */
export async function resetAdminTotpSecret(
  envSecret?: string,
  supabaseClient?: any
): Promise<{ success: boolean; isEnvLocked: boolean; message: string }> {
  const envVal = (envSecret ?? process.env.ADMIN_TOTP_SECRET ?? '').trim();
  if (envVal) {
    return {
      success: false,
      isEnvLocked: true,
      message: 'کلید ۲FA از طریق متغیر محیطی ADMIN_TOTP_SECRET تعریف شده است و از پنل وب قابل تغییر یا حذف نیست.'
    };
  }

  memoryTotpSecret = '';
  memoryTotpIsSetup = false;

  if (supabaseClient) {
    try {
      await supabaseClient.from('site_settings').delete().eq('id', 'admin_totp_config');
    } catch (e) {
      console.warn('Could not delete admin_totp_config from Supabase:', e);
    }
  }

  return {
    success: true,
    isEnvLocked: false,
    message: 'تنظیمات احراز هویت دو عاملی با موفقیت بازنشانی شد. در ورود بعدی، QR کد راه‌اندازی جدید ایجاد خواهد شد.'
  };
}

/**
 * Generates an OTP Auth URI and a QR Code Data URL for initial setup.
 */
export async function generateTotpQrCodeDataUrl(
  adminEmail: string,
  secret: string
): Promise<{ otpUri: string; qrCodeDataUrl: string }> {
  const otpUri = generateURI({
    issuer: 'Academy 40 Gates',
    label: adminEmail || 'admin@40gates.ir',
    secret: secret.trim()
  });

  const qrCodeDataUrl = await QRCode.toDataURL(otpUri, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 250
  });

  return { otpUri, qrCodeDataUrl };
}

/**
 * Generates a signed, tamper-proof temporary token for Step 2 TOTP submission.
 * IMPORTANT: The raw TOTP secret is NEVER placed inside the token payload!
 */
export function createTempTotpToken(
  email: string,
  requireSetup: boolean,
  secretKey: string
): string {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  const nonce = crypto.randomBytes(8).toString('hex');
  const payloadStr = JSON.stringify({ email, requireSetup, expiresAt, nonce });
  const b64Payload = Buffer.from(payloadStr).toString('base64url');
  const hmac = crypto.createHmac('sha256', secretKey).update(b64Payload).digest('hex');
  return `tmp_${b64Payload}_${hmac}`;
}

/**
 * Verifies a temporary TOTP token signature and expiration.
 */
export function verifyTempTotpToken(
  token: string,
  secretKey: string
): { valid: boolean; payload?: TempTotpPayload } {
  if (!token || typeof token !== 'string' || !token.startsWith('tmp_')) {
    return { valid: false };
  }
  try {
    const parts = token.split('_');
    if (parts.length !== 3) return { valid: false };
    const b64Payload = parts[1];
    const signature = parts[2];
    const expectedHmac = crypto.createHmac('sha256', secretKey).update(b64Payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
      return { valid: false };
    }
    const payloadStr = Buffer.from(b64Payload, 'base64url').toString('utf-8');
    const payload: TempTotpPayload = JSON.parse(payloadStr);
    if (Date.now() > payload.expiresAt) {
      return { valid: false };
    }
    return { valid: true, payload };
  } catch (e) {
    return { valid: false };
  }
}

/**
 * Generates the current 6-digit TOTP code for a given secret (used in tests or server verification).
 */
export function generateAdminTotpCode(secret: string): string {
  if (!secret) return '';
  return generateSync({ secret: secret.trim() });
}

/**
 * Verifies a 6-digit TOTP code against a given Base32 secret.
 * Allows standard ±1 epoch step tolerance (30 seconds window) for clock drift.
 */
export function verifyAdminTotpCode(inputCode: string, secret: string): boolean {
  if (!inputCode || !secret) return false;
  const cleanCode = inputCode.toString().trim().replace(/\s+/g, '');
  if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) return false;
  try {
    const result = verifySync({ token: cleanCode, secret: secret.trim(), epochTolerance: 30 });
    return Boolean(result && result.valid === true);
  } catch (e) {
    return false;
  }
}

/**
 * Helper to generate a new strong Base32 secret for initial setup.
 */
export function createNewTotpSecret(): string {
  return generateSecret();
}

/**
 * Internal testing helper to reset the module in-memory cache
 */
export function _resetMemoryCacheForTesting(): void {
  memoryTotpSecret = '';
  memoryTotpIsSetup = false;
}
