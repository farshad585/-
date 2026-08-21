import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeErrorLog, sendMailSafely } from '../server.ts';

test('Email Utility - sanitizeErrorLog redacts secrets and Resend API keys', () => {
  const secretKey = 're_123456789_abcdefSecretKey';
  const rawLog = `Resend API Request failed with Authorization: Bearer ${secretKey} and raw key re_123456789_abcdefSecretKey`;

  const sanitized = sanitizeErrorLog(rawLog, [secretKey]);

  assert.equal(sanitized.includes('re_123456789_abcdefSecretKey'), false, 'Log should not contain raw API key');
  assert.equal(sanitized.includes('***REDACTED***'), true, 'Log should contain redacted placeholder');
});

test('Email Utility - sendMailSafely returns simulated status when RESEND_API_KEY is empty', async () => {
  // Backup process.env
  const originalKey = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  const result = await sendMailSafely({
    to: 'test@example.com',
    subject: 'Test Subject',
    html: '<p>Test Message</p>'
  }, 'unit-test');

  assert.equal(result.success, false);
  assert.equal(result.status, 'simulated');
  assert.ok(result.error?.includes('RESEND_API_KEY') || result.error?.includes('فعال نیست'));

  // Restore env
  if (originalKey) process.env.RESEND_API_KEY = originalKey;
});

test('Email Utility - sendMailSafely handles invalid Resend API key gracefully without leaking secrets', async () => {
  const fakeKey = 're_test_fake_api_key_for_testing_purposes_999';
  process.env.RESEND_API_KEY = fakeKey;

  const result = await sendMailSafely({
    to: 'recipient@example.com',
    subject: 'Resend Auth Failure Test',
    html: '<p>Testing Error Handling with Resend</p>'
  }, 'unit-test');

  assert.equal(result.success, false);
  assert.equal(result.status, 'failed');
  assert.ok(result.error);
  // Confirm sensitive secret is not leaked in the error output
  assert.equal(result.error.includes(fakeKey), false, 'Error message must not contain raw API key');

  // Also test sanitizeErrorLog directly with explicit string containing secret
  const logWithSecret = `Failed to send email with authorization Bearer ${fakeKey}`;
  const sanitizedLog = sanitizeErrorLog(logWithSecret, [fakeKey]);
  assert.equal(sanitizedLog.includes('***REDACTED***'), true, 'Explicit secret in log should be redacted');
  assert.equal(sanitizedLog.includes(fakeKey), false);
});
