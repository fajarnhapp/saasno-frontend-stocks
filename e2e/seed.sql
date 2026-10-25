-- Akun untuk tes end-to-end (HANYA untuk database uji CI/lokal yang dibuang sesudahnya; jangan dijalankan di lingkungan nyata).
-- Kata sandi ketiganya: E2e-Admin-Pass-1  (di browser di-hash SHA-256 dulu, lalu di server di-hash Argon2).
-- Dijalankan sesudah docs/schema/base-schema.sql dari repo backend.
BEGIN;

INSERT INTO public.person (id, full_name, registered, modificated) VALUES
  ('e2e00000000000000000000000000001', 'E2E Admin', now(), now()),
  ('e2e00000000000000000000000000002', 'E2E Otp', now(), now()),
  ('e2e00000000000000000000000000003', 'E2E Gone', now(), now());

INSERT INTO public.contact (id, person_id, type, value, label, is_primary, verified_at, registered, modificated) VALUES
  ('e2e000000000000000000000000000a1', 'e2e00000000000000000000000000001', 'EMAIL', 'e2e.admin@example.com', 'WORK', true, now(), now(), now()),
  ('e2e000000000000000000000000000a2', 'e2e00000000000000000000000000002', 'EMAIL', 'e2e.otp@example.com', 'WORK', true, now(), now(), now()),
  ('e2e000000000000000000000000000a3', 'e2e00000000000000000000000000003', 'EMAIL', 'e2e.gone@example.com', 'WORK', true, now(), now(), now());

INSERT INTO public."user" (id, username, password, status, secure, two_factor_auth, password_must_change, person_id, registered, modificated) VALUES
  ('e2e00000000000000000000000000b1', 'e2e.admin', '$argon2id$v=19$m=65536,t=3,p=1$CYV7xvEU5NRhEeucxPrW4Q$BgdaoRmKyO/auz356f2hhfhgLuUU/dyzV5acUrtNgKo', 'ACTIVED', true, false, false, 'e2e00000000000000000000000000001', now(), now()),
  ('e2e00000000000000000000000000b2', 'e2e.otp',   '$argon2id$v=19$m=65536,t=3,p=1$CYV7xvEU5NRhEeucxPrW4Q$BgdaoRmKyO/auz356f2hhfhgLuUU/dyzV5acUrtNgKo', 'ACTIVED', true, false, false, 'e2e00000000000000000000000000002', now(), now()),
  ('e2e00000000000000000000000000b3', 'e2e.gone',  '$argon2id$v=19$m=65536,t=3,p=1$CYV7xvEU5NRhEeucxPrW4Q$BgdaoRmKyO/auz356f2hhfhgLuUU/dyzV5acUrtNgKo', 'ACTIVED', true, false, false, 'e2e00000000000000000000000000003', now(), now());

INSERT INTO public.user_role (user_id, role_id) VALUES
  ('e2e00000000000000000000000000b1', 'SUPER'),
  ('e2e00000000000000000000000000b2', 'SUPER'),
  ('e2e00000000000000000000000000b3', 'SUPER');

-- Email lewat penampung SMTP lokal (e2e/smtp-sink.mjs), dan alamat aplikasi untuk tautan di email.
UPDATE public.configuration SET value = '127.0.0.1' WHERE id = 'MAIL_HOST';
UPDATE public.configuration SET value = '2525' WHERE id = 'MAIL_PORT';
UPDATE public.configuration SET value = 'https://localhost:3443' WHERE id = 'FRONTEND_URL';
UPDATE public.configuration SET value = 'https://localhost:3443' WHERE id = 'ALLOWED_ORIGINS';

COMMIT;
