#!/usr/bin/env bash
# Downloads SUNAT's padrón reducido del RUC (updated daily by SUNAT itself,
# no captcha — this is their open-data export, not the interactive
# e-consultaruc.sunat.gob.pe search which does require one), rebuilds the
# fixed-width binary-search index, and uploads it to R2.
#
# Run by .github/workflows/sync-padron.yml on a daily cron. Can also be run
# locally for testing (needs the AWS CLI configured with R2 credentials, or
# just stop before the upload step to inspect padron.bin).
set -euo pipefail

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

echo "== Downloading padrón reducido RUC =="
curl -sL -o "$WORKDIR/padron.zip" "http://www2.sunat.gob.pe/padron_reducido_ruc.zip"
ls -la "$WORKDIR/padron.zip"

echo "== Extracting + converting encoding (Latin-1 -> UTF-8) =="
unzip -p "$WORKDIR/padron.zip" padron_reducido_ruc.txt \
  | iconv -f ISO-8859-1 -t UTF-8//IGNORE \
  | tail -n +2 \
  > "$WORKDIR/padron_utf8.txt"

echo "== Sorting by RUC (LC_ALL=C — fixed-width numeric strings, lexicographic == numeric) =="
LC_ALL=C sort -t'|' -k1,1 "$WORKDIR/padron_utf8.txt" -o "$WORKDIR/padron_sorted.txt"

echo "== Building fixed-width index =="
node "$(dirname "$0")/build-padron-index.mjs" "$WORKDIR/padron_sorted.txt" "$WORKDIR/padron.bin"

echo "== Uploading to R2 =="
: "${R2_BUCKET:?R2_BUCKET env var required}"
: "${R2_ENDPOINT:?R2_ENDPOINT env var required}"
aws s3 cp "$WORKDIR/padron.bin" "s3://${R2_BUCKET}/padron.bin" \
  --endpoint-url "$R2_ENDPOINT" \
  --checksum-algorithm CRC32

echo "== Done =="
