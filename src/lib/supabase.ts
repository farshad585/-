import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing or empty.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Helper to check live Supabase connection status from client side
 */
export async function checkSupabaseHealth(): Promise<{
  configured: boolean;
  connected: boolean;
  message: string;
}> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      configured: false,
      connected: false,
      message: 'کلیدهای VITE_SUPABASE_URL یا VITE_SUPABASE_ANON_KEY در برنامه تنظیم نشده‌اند.'
    };
  }

  try {
    const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    if (res.ok || res.status === 200 || res.status === 401 || res.status === 404) {
      return {
        configured: true,
        connected: true,
        message: 'اتصال مستقیم مرورگر به Supabase برقرار و فعال است.'
      };
    } else {
      return {
        configured: true,
        connected: false,
        message: `پاسخ با کد ${res.status} دریافت شد. کلیدهای Supabase را چک کنید.`
      };
    }
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      message: `خطا در برقراری ارتباط شبکه با Supabase: ${err?.message || 'ارتباط برقرار نشد'}`
    };
  }
}

/**
 * Creates a Supabase client with the service role key for server-side operations.
 * Must only be invoked in server context where process.env is available.
 */
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.VITE_SUPABASE_URL || supabaseUrl;

  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL environment variables are required for admin access.');
  }

  return createClient(url, serviceRoleKey);
}
