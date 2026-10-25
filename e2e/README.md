# Tes end-to-end

Tes ini membuka aplikasi di browser sungguhan (Playwright, Chromium) dan menjalankan alur penting dari awal sampai akhir:

| File | Yang diuji |
|---|---|
| `login.spec.ts` | password salah, pengguna tak dikenal, login dengan username dan dengan email, halaman tanpa sesi, riwayat login |
| `privacy.spec.ts` | halaman kebijakan publik dan tautannya di login, admin menerbitkan versi, pengguna diminta membaca sekali, unduh data sendiri (tanpa rahasia), permintaan hapus akun disetujui |
| `sessions.spec.ts` | admin mengeluarkan semua sesi sekaligus: pengguna lain harus login lagi, sesi admin sendiri tetap |
| `two-factor.spec.ts` | memasang 2FA (secret dibaca dari alamat manual, kode dihitung di tes), login dengan kode salah lalu benar |
| `users.spec.ts` | admin membuat pengguna, email aktivasi terkirim, tautan hanya berlaku sekali, pengguna memilih password lalu login; pengguna di sampah tidak bisa login dan bisa dipulihkan |

## Di CI

`.github/workflows/e2e.yml` menyiapkan semuanya di runner: PostgreSQL, Redis, MongoDB, RabbitMQ, backend (repo `saasno-backend`, branch utamanya),
frontend dari commit ini, dan penampung SMTP. Repo backend yang privat butuh secret `E2E_BACKEND_TOKEN` (token baca-saja ke repo itu).
Bila gagal, laporan dan log diunggah sebagai artifact `e2e-failure`.

## Dijalankan sendiri

Butuh stack yang sama berjalan, database dari `saasno-backend/docs/schema/base-schema.sql` lalu `e2e/seed.sql` (akun uji `e2e.admin`, `e2e.otp` dan `e2e.gone`, password `E2e-Admin-Pass-1`),
dengan alamat aplikasi `https://localhost:3443` (cookie CSRF hanya diterima browser lewat HTTPS):

```bash
node e2e/smtp-sink.mjs e2e/.mail 2525 &                              # menangkap email yang dikirim aplikasi
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 1 -subj /CN=localhost
SAASNO_FRONTEND_LOGIN_MAX_ATTEMPTS=1000 SAASNO_FRONTEND_ANONYMOUS_MAX_PER_MINUTE=10000 SAASNO_FRONTEND_ORIGIN_PROD=https://localhost:3443 npx next start -p 3100 &
node e2e/tls-proxy.mjs key.pem cert.pem 3443 3100 &                   # HTTPS di depan frontend
npx playwright install chromium                                       # sekali saja
npm run e2e
```

Backend uji harus memakai database buangan (tes membuat pengguna dan mengaktifkan 2FA pada `e2e.otp`), dan konfigurasi `MAIL_HOST`/`FRONTEND_URL`
sudah diatur oleh `seed.sql`. Database harus baru untuk setiap run: tes 2FA mengharapkan `e2e.otp` belum memakai 2FA.
