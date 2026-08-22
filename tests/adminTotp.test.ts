import {
  getAdminTotpSecret,
  persistTotpSecret,
  resetAdminTotpSecret,
  generateTotpQrCodeDataUrl,
  createTempTotpToken,
  verifyTempTotpToken,
  generateAdminTotpCode,
  verifyAdminTotpCode,
  createNewTotpSecret,
  _resetMemoryCacheForTesting
} from '../src/lib/adminTotp.ts';

async function runTests() {
  console.log('--- Starting Admin TOTP 2FA Verification Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  const SECRET_KEY = 'test_admin_hmac_secret_12345';
  const FIXED_ENV_SECRET = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP'; // Standard Base32 secret (160-bit)

  // TEST 1: Fixed Environment Variable Priority
  _resetMemoryCacheForTesting();
  const envResult1 = await getAdminTotpSecret(FIXED_ENV_SECRET);
  assert(envResult1.secret === FIXED_ENV_SECRET, 'Returns exact fixed ADMIN_TOTP_SECRET from env');
  assert(envResult1.isSetup === true, 'ENV secret is immediately marked as isSetup = true');
  assert(envResult1.source === 'env', 'Source is properly identified as "env"');

  // TEST 2: Stability across multiple logins/calls with fixed secret
  const envResult2 = await getAdminTotpSecret(FIXED_ENV_SECRET);
  assert(envResult2.secret === envResult1.secret, 'Secret remains 100% identical on subsequent logins');

  // TEST 3: TOTP Code Generation & Verification
  const validCode = generateAdminTotpCode(FIXED_ENV_SECRET);
  assert(validCode.length === 6, `Generated 6-digit TOTP code (${validCode})`);
  assert(verifyAdminTotpCode(validCode, FIXED_ENV_SECRET), 'Valid TOTP code is accepted');
  assert(!verifyAdminTotpCode('000000', FIXED_ENV_SECRET), 'Invalid TOTP code "000000" is rejected');
  assert(!verifyAdminTotpCode('12345', FIXED_ENV_SECRET), 'Short TOTP code is rejected');
  assert(!verifyAdminTotpCode('abcdef', FIXED_ENV_SECRET), 'Non-numeric TOTP code is rejected');

  // TEST 4: Zero Secret Leakage in tempToken
  const tempToken = createTempTotpToken('admin@40gates.ir', false, SECRET_KEY);
  assert(!tempToken.includes(FIXED_ENV_SECRET), 'tempToken does NOT leak the TOTP secret string');
  
  const verified = verifyTempTotpToken(tempToken, SECRET_KEY);
  assert(verified.valid === true, 'tempToken validates correctly with matching server HMAC key');
  assert(verified.payload?.email === 'admin@40gates.ir', 'tempToken contains correct email');
  assert(verified.payload?.requireSetup === false, 'tempToken contains correct requireSetup flag');
  
  const tamperedToken = tempToken.slice(0, -4) + 'abcd';
  assert(!verifyTempTotpToken(tamperedToken, SECRET_KEY).valid, 'Tampered tempToken signature fails validation');

  // TEST 5: QR Code Data URL generation
  const { otpUri, qrCodeDataUrl } = await generateTotpQrCodeDataUrl('admin@40gates.ir', FIXED_ENV_SECRET);
  assert(otpUri.includes('otpauth://totp/'), 'OTP URI is valid standard RFC 6238 format');
  assert(otpUri.includes(FIXED_ENV_SECRET), 'OTP URI contains the fixed secret');
  assert(qrCodeDataUrl.startsWith('data:image/png;base64,'), 'QR Code is a valid PNG Data URL');

  // TEST 6: Environment Variable Lock Prevention on Reset
  const resetEnvAttempt = await resetAdminTotpSecret(FIXED_ENV_SECRET);
  assert(resetEnvAttempt.success === false, 'Reset fails safely when ADMIN_TOTP_SECRET is set in environment');
  assert(resetEnvAttempt.isEnvLocked === true, 'isEnvLocked flag is returned as true');

  // TEST 7: Fallback Database / Memory Persistence Workflow
  _resetMemoryCacheForTesting();
  const mockDbStorage: { [key: string]: any } = {};
  const mockSupabaseClient = {
    from: (table: string) => ({
      select: () => ({
        eq: (col: string, val: string) => ({
          single: async () => ({
            data: mockDbStorage[val] ? { value: mockDbStorage[val] } : null,
            error: mockDbStorage[val] ? null : { message: 'Not found' }
          })
        })
      }),
      upsert: async (item: any) => {
        mockDbStorage[item.id] = item.value;
        return { data: item, error: null };
      },
      delete: () => ({
        eq: (col: string, val: string) => {
          delete mockDbStorage[val];
          return { error: null };
        }
      })
    })
  };

  // Step 7a: Initial load with empty DB
  const initialDbCheck = await getAdminTotpSecret('', mockSupabaseClient);
  assert(initialDbCheck.secret === '', 'Initial check returns empty when no secret exists in DB');

  // Step 7b: Generate and persist for setup
  const generatedSecret = createNewTotpSecret();
  await persistTotpSecret(generatedSecret, false, '', mockSupabaseClient);

  // Clear memory to simulate server restart or next request
  _resetMemoryCacheForTesting();
  const step7c = await getAdminTotpSecret('', mockSupabaseClient);
  assert(step7c.secret === generatedSecret, 'Secret restored identically from persistent DB');
  assert(step7c.isSetup === false, 'Initial state isSetup = false before first verification');

  // Step 7d: Verify and mark as setup
  const firstCode = generateAdminTotpCode(generatedSecret);
  assert(verifyAdminTotpCode(firstCode, step7c.secret), 'First OTP code verification succeeds');
  await persistTotpSecret(step7c.secret, true, '', mockSupabaseClient);

  // Clear memory again to simulate subsequent logins
  _resetMemoryCacheForTesting();
  const subsequentLoginCheck = await getAdminTotpSecret('', mockSupabaseClient);
  assert(subsequentLoginCheck.secret === generatedSecret, 'Secret on subsequent login is STILL identical (no new secret generated)');
  assert(subsequentLoginCheck.isSetup === true, 'Subsequent login has isSetup = true (no QR code needed)');

  // Step 7e: Reset in database mode
  const dbReset = await resetAdminTotpSecret('', mockSupabaseClient);
  assert(dbReset.success === true, 'Reset in DB mode succeeds');
  assert(dbReset.isEnvLocked === false, 'isEnvLocked is false in DB mode');
  
  _resetMemoryCacheForTesting();
  const afterResetCheck = await getAdminTotpSecret('', mockSupabaseClient);
  assert(afterResetCheck.secret === '', 'Secret is cleanly wiped after reset in DB mode');

  console.log(`\n========================================`);
  console.log(`Tests finished: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
