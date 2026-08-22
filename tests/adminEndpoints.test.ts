import {
  getAdminTotpSecret,
  persistTotpSecret,
  createTempTotpToken,
  verifyTempTotpToken,
  generateAdminTotpCode,
  verifyAdminTotpCode,
  createNewTotpSecret,
  _resetMemoryCacheForTesting
} from '../src/lib/adminTotp.ts';

async function testEndpointWorkflows() {
  console.log('--- Testing Admin Endpoint Logic End-to-End ---');
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

  const ADMIN_SECRET = 'e40e6fe2369680327f3df48074d0e51307b27816bb1cf26ad7c1a89c933b934b';
  const ADMIN_EMAIL = '40gates.main@gmail.com';
  const ADMIN_PASSWORD = '40gates1403';
  const FIXED_TOTP_SECRET = 'NBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP';

  // Scenario 1: Server with ADMIN_TOTP_SECRET set in environment
  _resetMemoryCacheForTesting();
  const totp1 = await getAdminTotpSecret(FIXED_TOTP_SECRET);
  assert(totp1.secret === FIXED_TOTP_SECRET, 'Login step 1 reads FIXED_TOTP_SECRET from env');
  assert(totp1.isSetup === true, 'No setup needed when env secret is configured');

  const token1 = createTempTotpToken(ADMIN_EMAIL, false, ADMIN_SECRET);
  const verify1 = verifyTempTotpToken(token1, ADMIN_SECRET);
  assert(verify1.valid && verify1.payload?.requireSetup === false, 'Temp token payload is correct');

  // Verify TOTP code
  const code1 = generateAdminTotpCode(FIXED_TOTP_SECRET);
  assert(verifyAdminTotpCode(code1, totp1.secret), 'Verify TOTP code succeeds on login #1');

  // Login #2 (Next session or page refresh)
  const totp2 = await getAdminTotpSecret(FIXED_TOTP_SECRET);
  assert(totp2.secret === FIXED_TOTP_SECRET, 'Login step 1 on login #2 yields exact same secret');
  const code2 = generateAdminTotpCode(FIXED_TOTP_SECRET);
  assert(verifyAdminTotpCode(code2, totp2.secret), 'Verify TOTP code succeeds on login #2 with same Authenticator');

  console.log(`\nEndpoint integration tests: ${passed} PASSED, ${failed} FAILED`);
  if (failed > 0) process.exit(1);
}

testEndpointWorkflows().catch(err => {
  console.error(err);
  process.exit(1);
});
