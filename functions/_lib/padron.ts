// Binary search over the fixed-width SUNAT padrón index stored in R2 —
// see scripts/build-padron-index.mjs for the exact record layout this reads.
// ~24 R2 Range reads worst-case for 18M+ records, no database needed.

const RUC_WIDTH = 11;
const RAZON_WIDTH = 110;
const ESTADO_WIDTH = 25;
const CONDICION_WIDTH = 25;
const RECORD_WIDTH = RUC_WIDTH + RAZON_WIDTH + ESTADO_WIDTH + CONDICION_WIDTH + 1; // 172

export interface CompanyInfo {
  ruc: string;
  razonSocial: string;
  estado: string;
  condicion: string;
}

// Minimal R2 binding shape — avoids pulling in @cloudflare/workers-types.
export interface R2Bucket {
  head(key: string): Promise<{ size: number } | null>;
  get(key: string, options?: { range: { offset: number; length: number } }): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
}

function parseRecord(bytes: Uint8Array): { ruc: string; razonSocial: string; estado: string; condicion: string } {
  const text = new TextDecoder("ascii").decode(bytes);
  let i = 0;
  const ruc = text.slice(i, (i += RUC_WIDTH));
  const razonSocial = text.slice(i, (i += RAZON_WIDTH)).trimEnd();
  const estado = text.slice(i, (i += ESTADO_WIDTH)).trimEnd();
  const condicion = text.slice(i, (i += CONDICION_WIDTH)).trimEnd();
  return { ruc, razonSocial, estado, condicion };
}

/**
 * Looks up a RUC in the padrón index. Returns null if the RUC isn't an
 * 11-digit string, the index object doesn't exist yet (first sync hasn't
 * run), or the RUC isn't found in SUNAT's registry — the caller treats a
 * "not found" result as a real signal (see functions/api/analyze.ts), so
 * this only returns null for "we genuinely couldn't check", not "checked,
 * doesn't exist".
 */
export async function lookupCompany(bucket: R2Bucket, ruc: string): Promise<CompanyInfo | null | "unavailable"> {
  if (!/^\d{11}$/.test(ruc)) return null;

  const head = await bucket.head("padron.bin");
  if (!head || head.size < RECORD_WIDTH) return "unavailable";

  const totalRecords = Math.floor(head.size / RECORD_WIDTH);
  let lo = 0;
  let hi = totalRecords - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const offset = mid * RECORD_WIDTH;
    const obj = await bucket.get("padron.bin", { range: { offset, length: RECORD_WIDTH } });
    if (!obj) return "unavailable";

    const bytes = new Uint8Array(await obj.arrayBuffer());
    const record = parseRecord(bytes);

    if (record.ruc === ruc) {
      return { ruc: record.ruc, razonSocial: record.razonSocial, estado: record.estado, condicion: record.condicion };
    }
    if (record.ruc < ruc) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return null; // genuinely not in SUNAT's registry
}
