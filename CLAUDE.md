# Instrucciones para Claude Code - chambaverificada

## GitHub

- **Repositorio:** github.com/rachcampitos/chambaverificada (privado)
- **Usuario GitHub:** rachcampitos (NO raul-campos-wbd, esa es la cuenta del cliente)
- **Branch principal:** main
- **Antes de cualquier `gh`/`git push`:** correr `unset GITHUB_TOKEN GH_TOKEN` en el mismo
  comando — el entorno trae `GITHUB_TOKEN` seteado globalmente apuntando a raul-campos-wbd,
  que pisa el `gh auth switch --user rachcampitos` si no se limpia antes.
- **Identidad git local:** este repo tiene `user.email` local en `raulo_974@hotmail.com`
  (no el global, que es el email de trabajo `wbdcontractor.com`) — cualquier repo personal
  nuevo necesita este override local, no lo hereda solo.
- **NO agregar Co-Authored-By de Claude ni referencias a IA/Claude Code en commits** — los
  commits no deben incluir coautoria de Claude.
- **Commits en español**, estilo conventional commits (`feat:`, `fix:`, etc.)

## Despliegue

- **Hosting:** Cloudflare Pages (cuenta raulo_974@hotmail.com, misma de otros proyectos)
- **KV namespace `RATE_LIMIT`:** ya creado, declarado en `wrangler.toml`
- **Secrets a configurar en el dashboard de Cloudflare Pages** (nunca en el repo):
  `ANTHROPIC_API_KEY`, `ALLOWED_ORIGINS`
- Ver README.md para detalle de arquitectura y seguridad.

## Producto

Plataforma de confianza para búsqueda de empleo en Perú. MVP1: pegar el texto de una oferta
de trabajo, analizar señales de fraude via IA (Anthropic API, server-side en Cloudflare
Pages Function), mostrar riesgo bajo/medio/alto con razones concretas.
