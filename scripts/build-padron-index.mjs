#!/usr/bin/env node
// Streams a sorted, pipe-delimited SUNAT padrón file (RUC|RAZON_SOCIAL|ESTADO|
// CONDICION|...) into a fixed-width flat file for O(log n) binary-search
// lookups by RUC via R2 Range requests — no database needed.
//
// Fixed record layout (ASCII, one record per line):
//   RUC (11) + RAZON_SOCIAL (110) + ESTADO (25) + CONDICION (25) + "\n"
//   = 172 bytes/record, space-padded, right-trimmed on read.
//
// Widths were sized against the real file (2026-09-03 padrón, 18,378,020
// well-formed rows): max razón social = 109 chars, max estado/condición
// (SUNAT truncates its own fields at ~21 chars) comfortably under 25.
//
// Usage: node build-padron-index.mjs <sorted-input.txt> <output.bin>

import { createReadStream, createWriteStream } from "node:fs";
import { createInterface } from "node:readline";

const RUC_WIDTH = 11;
const RAZON_WIDTH = 110;
const ESTADO_WIDTH = 25;
const CONDICION_WIDTH = 25;
export const RECORD_WIDTH = RUC_WIDTH + RAZON_WIDTH + ESTADO_WIDTH + CONDICION_WIDTH + 1;

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error("Usage: node build-padron-index.mjs <sorted-input.txt> <output.bin>");
  process.exit(1);
}

// Strip diacritics so 1 char = 1 byte (ASCII) — record widths are byte widths,
// and this keeps the whole pipeline (build here, binary-search read in the
// Worker) free of any multi-byte-UTF-8-vs-character-count bookkeeping.
function toAsciiUpper(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase();
}

function padField(value, width) {
  const ascii = toAsciiUpper(value ?? "").replace(/[^\x20-\x7e]/g, "?"); // any leftover non-ASCII -> '?'
  const truncated = ascii.slice(0, width);
  return truncated.padEnd(width, " ");
}

async function main() {
  const rl = createInterface({ input: createReadStream(inputPath, { encoding: "utf8" }), crlfDelay: Infinity });
  const out = createWriteStream(outputPath);

  let total = 0;
  let written = 0;
  let skipped = 0;

  for await (const line of rl) {
    total++;
    if (!line) continue;
    const fields = line.split("|");
    // Real file has a trailing "|" -> 16 fields, not 15 (RUC..KILOMETRO + empty tail).
    if (fields.length < 4) {
      skipped++;
      continue;
    }
    const ruc = fields[0];
    if (!/^\d{11}$/.test(ruc)) {
      skipped++; // the one known non-numeric row ("AAAAAAAAAAA") and any similar oddities
      continue;
    }
    const record = ruc + padField(fields[1], RAZON_WIDTH) + padField(fields[2], ESTADO_WIDTH) + padField(fields[3], CONDICION_WIDTH) + "\n";
    if (Buffer.byteLength(record, "ascii") !== RECORD_WIDTH) {
      // Should be unreachable given the padding above, but a silent width
      // drift would corrupt every offset after it — fail loudly instead.
      throw new Error(`Record width mismatch for RUC ${ruc}: ${Buffer.byteLength(record, "ascii")} != ${RECORD_WIDTH}`);
    }
    out.write(record, "ascii");
    written++;
    if (written % 1_000_000 === 0) console.error(`...${written.toLocaleString()} records written`);
  }

  await new Promise((resolve, reject) => out.end((err) => (err ? reject(err) : resolve())));

  console.error(`Done. total lines=${total} written=${written} skipped=${skipped} record_width=${RECORD_WIDTH}B`);
  console.error(`Output size should be ${(written * RECORD_WIDTH / 1e9).toFixed(2)} GB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
