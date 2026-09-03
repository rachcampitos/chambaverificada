// Shared helpers for Cloudflare Pages Functions under functions/api/.
// Files under _lib/ are never routed (Cloudflare skips anything starting
// with "_"), so this is safe to import without becoming its own endpoint.

export interface SecurityEnv {
  RATE_LIMIT: KVNamespace;
  ALLOWED_ORIGINS?: string;
}

// Minimal shape of the Cloudflare KV binding — avoids pulling in the full
// @cloudflare/workers-types package for one interface.
export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export function jsonResponse(body: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders },
  });
}

/** Cloudflare's own edge sets this — unlike X-Forwarded-For, the client can't spoof it. */
export function getClientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}

/**
 * Same-origin only. Without this, anyone can build a page elsewhere that
 * fires POSTs at these endpoints — the browser's default CORS policy stops
 * *them* from reading the JSON back, but it does NOT stop the request from
 * being sent and billed against our Anthropic key. Origin/Referer are the
 * actual guard; a missing header (e.g. a direct curl/script call) is also
 * rejected rather than trusted by default.
 */
export function isAllowedOrigin(request: Request, env: SecurityEnv): boolean {
  const allowed = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  // Same-origin (whatever domain actually reached this Function — the real
  // pages.dev URL, a per-branch preview subdomain, or a custom domain, they
  // all resolve correctly here) is ALWAYS allowed on top of ALLOWED_ORIGINS,
  // not replaced by it. ALLOWED_ORIGINS only adds origins that are NOT this
  // deployment's own domain (e.g. a separate app calling this API). Treating
  // it as the sole list broke local `wrangler pages dev` testing entirely,
  // once ALLOWED_ORIGINS held only the production URL.
  const requestOrigin = new URL(request.url).origin;
  const candidates = [requestOrigin, ...allowed];

  const origin = request.headers.get("Origin");
  if (origin) return candidates.includes(origin);

  const referer = request.headers.get("Referer");
  if (referer) {
    try {
      return candidates.includes(new URL(referer).origin);
    } catch {
      return false;
    }
  }

  return false;
}

/** Fixed-window rate limit via KV. `scope` namespaces the counter per-endpoint
 * (e.g. "analyze", "chat") so one endpoint's traffic doesn't eat another's budget. */
export async function checkRateLimit(
  env: SecurityEnv,
  scope: string,
  ip: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const key = `ratelimit:${scope}:${ip}`;
  const current = await env.RATE_LIMIT.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= maxRequests) return false;

  await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: windowSeconds });
  return true;
}
