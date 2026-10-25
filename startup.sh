#!/bin/bash

# Hentikan eksekusi jika ada error
set -e

# Cleanup function for error handling
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo "❌ Error occurred (exit code: $exit_code). Cleaning up..."
        rm -f .env
    fi
    exit $exit_code
}
trap cleanup EXIT

# Buat network jika belum ada
docker network create saasno-frontend || true
# Jaringan bersama Alloy (monitoring), dipakai /api/faro untuk meneruskan telemetri browser; kosong bila monitoring tidak dipasang.
docker network create fajarnhapp-loki || true
docker network create fajarnhapp-prometheus || true

# Pindah ke direktori aplikasi
cd /home/application/data/apps/saasno-frontend

# Buat file .env temporer untuk dibaca oleh docker-compose. Nilai di sini adalah default
# saat ini — override lewat environment variable saat memanggil script ini kalau perlu
# (mis. SAASNO_FRONTEND_BACKEND_URL=... ./startup.sh). Kalau script ini tidak dijalankan sama
# sekali (misal `npm run dev` lokal), endpointUtils.ts punya fallback sendiri jadi tetap jalan.
cat << EOF > .env
# ── Backend ───────────────────────────────────────────────────────────────────
SAASNO_FRONTEND_BACKEND_URL=${SAASNO_FRONTEND_BACKEND_URL:-http://localhost}

# ── CSRF ──────────────────────────────────────────────────────────────────────
# Kalau tidak di-override, generate secret baru tiap deploy (bukan literal statis
# yang ikut ke-commit ke source) — aman karena token CSRF selalu di-rotate tiap
# response, jadi tidak ada sesi yang bergantung pada key lama tetap sama.
SAASNO_FRONTEND_KEY_CSRF=${SAASNO_FRONTEND_KEY_CSRF:-$(openssl rand -hex 32)}
EOF

# Jalankan docker compose dengan flag --build untuk membuat image baru yang ringan
# Gunakan juga flag --remove-orphans untuk membersihkan container lama
docker compose up -d --build --remove-orphans

# Hapus file .env setelah up demi keamanan (explicit, not needed with trap)
rm -f .env

# Opsional: Bersihkan build cache Docker yang sudah tidak terpakai agar disk VPS hemat
docker image prune -f

echo "✅ Deployment completed successfully!"
