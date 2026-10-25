import path from 'node:path';

// Where the SMTP sink (e2e/smtp-sink.mjs) writes the emails the app sends.
export const MAIL_DIR: string = process.env.E2E_MAIL_DIR ?? path.resolve('e2e/.mail');

// Accounts created by e2e/seed.sql.
export const PASSWORD = 'E2e-Admin-Pass-1';
export const ADMIN = { username: 'e2e.admin', email: 'e2e.admin@example.com', password: PASSWORD };
export const GONE_USER = { username: 'e2e.gone', email: 'e2e.gone@example.com', password: PASSWORD };
export const OTP_USER = { username: 'e2e.otp', email: 'e2e.otp@example.com', password: PASSWORD };
