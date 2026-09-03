# chambaverificada

Plataforma de confianza para búsqueda de empleo en Perú — pega el texto de una oferta y
revisa señales de riesgo (empresa no verificable, salario fuera de mercado, pedido de datos
bancarios por adelantado, lenguaje de urgencia/pirámide) antes de postular o compartir datos.

MVP1: un solo flujo — pegar oferta -> analizar -> ver riesgo (bajo/medio/alto) con razones.

## Stack

- Next.js 16.1.6 (App Router, `output: "export"` — sitio estático) + React 19.2.3 + TypeScript
- Tailwind CSS 4 (tokens de color en `src/app/globals.css`, paleta "Andino moderno": violeta + terracota)
- [Motion](https://motion.dev) para las micro-animaciones de los iconos de resultado (trazo tipo `pathLength`, sin rebote — deliberadamente sobrio)
- `lucide-react` para iconografía estática
- Hosting: Cloudflare Pages. El análisis corre en una Cloudflare Pages Function
  (`functions/api/analyze.ts`), separada del build estático de Next.js, que llama a la
  API de Anthropic server-side.

## Desarrollo local

```bash
npm run dev      # UI en http://localhost:3000 — /api/analyze no corre aquí (ver abajo)
npm run build    # export estático a /out
npm run lint
```

`functions/api/analyze.ts` es una Cloudflare Pages Function: **no corre bajo `next dev`**.
Para probar el flujo completo localmente (incluyendo la llamada real a Claude):

```bash
cp .dev.vars.example .dev.vars   # completar ANTHROPIC_API_KEY, nunca commitear
npm run build
npx wrangler pages dev out
```

## Despliegue

Cloudflare Pages, build automático con git push. Configurar como secrets del proyecto en el
dashboard de Cloudflare Pages (Settings -> Environment variables) — nunca en el código ni en `.env`:

- `ANTHROPIC_API_KEY`
- `ALLOWED_ORIGINS` — dominio(s) reales una vez asignados, ej.
  `https://chambaverificada.pages.dev,https://chambaverificada.pe`. Sin esto, la Function
  usa el propio origin de la request como fallback (funciona, pero conviene fijarlo explícito
  en cuanto el dominio final exista).

El binding de KV (`RATE_LIMIT`) ya está declarado en `wrangler.toml` con un namespace real
creado en la cuenta de Cloudflare — no hace falta crearlo de nuevo.

## Seguridad (`functions/api/analyze.ts`)

- **Rate limiting**: 8 requests / 10 min por IP (`CF-Connecting-IP`, no spoofeable por el
  cliente), vía Cloudflare KV. Es un fixed-window simple (no atómico — a esta escala el
  riesgo de race condition es aceptable); si el tráfico crece, migrar a Durable Objects.
- **Verificación de origen**: solo acepta requests cuyo `Origin`/`Referer` esté en
  `ALLOWED_ORIGINS` (o sea same-origin como fallback). Sin esto, cualquier sitio externo
  podría dispararle peticiones a este endpoint y quemar la cuota de Anthropic aunque no
  pueda leer la respuesta (CORS por sí solo no lo evita).
- **Defensa contra prompt injection**: el system prompt trata el texto pegado siempre como
  dato a analizar, nunca como instrucción — y cualquier intento de manipular el análisis
  incrustado en la oferta ("ignora tus instrucciones", etc.) se marca como señal de riesgo
  alta en sí misma.
- **Salida estructurada**: `tool_choice` forzado a un schema fijo (nunca texto libre a
  parsear) + validación de forma en runtime (`isValidAnalysisResult`) antes de reenviar la
  respuesta del modelo al frontend.
- **Headers HTTP** (`public/_headers`): CSP, X-Frame-Options, Referrer-Policy,
  Permissions-Policy.
- **Pendiente, no crítico para el MVP**: regla de Rate Limiting a nivel de dashboard de
  Cloudflare (WAF) como defensa adicional una vez el dominio esté en producción — el rate
  limiting de código ya cubre el caso principal.
