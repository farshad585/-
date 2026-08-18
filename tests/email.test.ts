import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeErrorLog, sendMailSafely } from '../server.ts';

test('Email Utility - sanitizeErrorLog redacts secrets and credentials', () => {
  const secret = 'mySecretAppPassword123';
  const rawLog = `SMTP Error connecting to server with password=${secret} and auth token mySecretAppPassword123`;

  const sanitized = sanitizeErrorLog(rawLog, [secret]);

  assert.equal(sanitized.includes('mySecretAppPassword123'), false, 'Log should not contain raw secret');
  assert.equal(sanitized.includes('***REDACTED***'), true, 'Log should contain redacted placeholder');
});

test('Email Utility - sendMailSafely returns simulated status when credentials are empty', async () => {
  // Backup process.env
  const originalUser = process.env.GMAIL_USER;
  const originalPass = process.env.GMAIL_APP_PASSWORD;

  delete process.env.GMAIL_USER;
  delete process.env.GMAIL_APP_PASSWORD;

  const result = await sendMailSafely({
    to: 'test@example.com',
    subject: 'Test Subject',
    html: '<p>Test Message</p>'
  }, 'unit-test');

  assert.equal(result.success, false);
  assert.equal(result.status, 'simulated');
  assert.ok(result.error?.includes('فعال نیست') || result.error?.includes('GMAIL_USER'));

  // Restore env
  if (originalUser) process.env.GMAIL_USER = originalUser;
  if (originalPass) process.env.GMAIL_APP_PASSWORD = originalPass;
});

test('Email Utility - sendMailSafely handles invalid SMTP auth without leaking passwords', async () => {
  process.env.GMAIL_USER = 'invalid_user_test@gmail.com';
  process.env.GMAIL_APP_PASSWORD = 'super_secret_fake_password_1234';

  const result = await sendMailSafely({
    to: 'recipient@example.com',
    subject: 'Auth Failure Test',
    html: '<p>Testing Error Handling</p>'
  }, 'unit-test');

  assert.equal(result.success, false);
  assert.equal(result.status, 'failed');
  assert.ok(result.error);
  // Confirm sensitive secret is absent
  assert.equal(result.error.includes('super_secret_fake_password_1234'), false, 'Error message must not contain raw password');

  // Also test sanitizeErrorLog directly with explicit string containing secret
  const logWithSecret = 'Auth failed for pass=super_secret_fake_password_1234';
  const sanitizedLog = sanitizeErrorLog(logWithSecret, ['super_secret_fake_password_1234']);
  assert.equal(sanitizedLog.includes('***REDACTED***'), true, 'Explicit secret in log should be redacted');
});
