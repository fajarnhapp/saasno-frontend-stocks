#!/bin/sh
# Pembungkus entrypoint (seperti docker-entrypoint.sh di image resmi Postgres/Redis): menjalankan perintah container.
# 'exec' membuat aplikasi menjadi proses utama container, sehingga sinyal docker stop langsung sampai ke aplikasi.
exec "$@"
