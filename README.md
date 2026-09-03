# chambaverificada

Plataforma de confianza para búsqueda de empleo en Perú — pega el texto de una oferta y
revisa señales de riesgo (empresa no verificable, salario fuera de mercado, pedido de datos
bancarios por adelantado, lenguaje de urgencia/pirámide) antes de postular o compartir datos.

MVP1: un solo flujo — pegar oferta -> analizar -> ver riesgo (bajo/medio/alto) con razones.
Incluye verificación factual de la empresa contra el RUC (ver "Verificación de RUC/SUNAT" abajo)
y un chat de seguimiento para preguntar sobre el resultado.

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

## Verificación de RUC/SUNAT

En vez de pagar una API de terceros (decolecta, apis.net.pe, etc.), indexamos nosotros mismos
el **padrón reducido del RUC** que SUNAT publica como dato abierto y actualiza a diario —
mismo espíritu que la validación de CEP en `histora-back` (llamar la fuente real en vez de un
intermediario pago), pero a otra escala: **18.4 millones de registros**.

**Por qué no se reverse-engineerea la consulta oficial de SUNAT como el CEP**: el portal
interactivo (`e-consultaruc.sunat.gob.pe`) exige captcha en cada búsqueda — no hay forma de
replicar ese flujo sin evadirlo, así que se usa la fuente de datos abierta en su lugar
(`padron_reducido_ruc.zip`, sin captcha, actualizada por SUNAT mismo).

**Arquitectura** (sin base de datos — Cloudflare KV/D1 no soportan escribir 18M+ filas en el
tier gratuito):

1. `scripts/sync-padron.sh` + `scripts/build-padron-index.mjs`: descarga el zip de SUNAT,
   convierte de Latin-1 a UTF-8, ordena por RUC (`sort`, ~10s para 18M líneas), y construye un
   **archivo de ancho fijo** (172 bytes/registro: RUC 11 + razón social 110 + estado 25 +
   condición 25 + salto de línea) — cada registro ocupa siempre el mismo tamaño en bytes, así
   se puede calcular matemáticamente en qué offset está cualquier RUC sin leer el archivo
   entero.
2. El archivo (~3.16 GB) se sube a **Cloudflare R2** (`chambaverificada-padron`, bucket
   `padron.bin`) — R2 no tiene límite de "filas escritas" como KV/D1, es una sola subida de
   objeto.
3. `functions/_lib/padron.ts`: búsqueda binaria sobre el objeto en R2 vía `Range` requests —
   ~24 lecturas para encontrar cualquiera de los 18.4M RUCs (log₂ 18.4M ≈ 24.1). Probado
   localmente contra el archivo real: RUC 20615496074 (Code Media) y 20601030013 (ejemplo de
   la doc de decolecta) resuelven correctamente en 21-24 lecturas.
4. `.github/workflows/sync-padron.yml`: corre el pipeline completo todos los días (SUNAT
   actualiza el padrón a diario) y sube el resultado a R2 vía el API S3-compatible.
5. `functions/api/analyze.ts` ahora también le pide al modelo que extraiga el RUC del texto de
   la oferta (mismo `tool_choice` forzado) y, si aparece uno, lo busca en el padrón — el
   resultado (`company`) es un dato separado del razonamiento de la IA, se muestra en su propia
   tarjeta (`CompanyBadge`) arriba del resultado, con un ícono distinto (edificio, no el escudo
   de riesgo) para no confundir "empresa real" con "oferta segura".

**Setup pendiente (una vez, manual)**:
1. Habilitar R2 en el dashboard de Cloudflare (Workers & Pages -> R2 -> aceptar términos;
   históricamente pide una tarjeta cargada aunque el uso quede dentro del tier gratis de 10GB)
2. `npx wrangler r2 bucket create chambaverificada-padron`
3. Generar un R2 API Token (dashboard -> R2 -> Manage R2 API Tokens) y configurarlo como
   GitHub Secrets del repo: `R2_BUCKET`, `R2_ENDPOINT` (`https://<account_id>.r2.cloudflarestorage.com`),
   `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
4. Disparar el workflow una vez manualmente (`gh workflow run sync-padron.yml` o desde la
   pestaña Actions) para la primera carga — después corre solo, todos los días

**Degradación**: si el índice todavía no se sincronizó o R2 tiene un problema puntual,
`lookupCompany` devuelve `"unavailable"` y `company` queda en `null` — el análisis de riesgo
sigue funcionando normalmente, solo no se muestra la tarjeta de verificación. Nunca bloquea el
flujo principal.
