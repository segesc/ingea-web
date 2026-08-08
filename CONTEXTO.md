# INGEA — contexto completo del proyecto

## Qué es
Plataforma web para un instituto ficticio/real de cursos de especialización en
gestión ambiental (Perú). Web pública de cursos + panel admin para emitir
certificados con QR verificable.

## URLs vivas
- **Producción**: https://ingea-3z2m.onrender.com (Render, plan Free)
- **Demo estática** (sin servidor, para compartir sin depender de Render):
  https://claude.ai/code/artifact/cd6379ed-41da-4cca-81ba-5c1652b75bb2
  (privada; publícala desde el menú de compartir del propio artifact)
- **Repo código**: https://github.com/segesc/ingea-web (público)
- **Repo datos** (certificados emitidos): https://github.com/segesc/ingea-datos
  (privado — contiene nombres y DNI reales)

## Cuentas usadas
- GitHub: **segesc** (no `Segcd`, cuenta distinta usada en sesiones anteriores
  cuyos repos fueron eliminados el 2026-08-08; se recreó todo bajo `segesc`).
- Render: workspace **Segesp's workspace** (no "Victor's workspace", también
  cuenta/sesión distinta de la que creó el servicio original).
- `gh` CLI en esta máquina ya está autenticado como `segesc` con scopes
  `repo, workflow, read:org` — úsalo para todo lo que sea git/GitHub en vez de
  reautenticar por browser.

## Arquitectura
- Node.js + Express, sin build de frontend (HTML/CSS/JS estático servido
  directo). Sin base de datos: el catálogo de cursos vive en código
  (`data/cursos.js`) y los certificados se persisten como **commits a un
  repo de GitHub** (`data/almacen.js`), no en disco (Render Free es efímero).
- `data/almacen.js`: si `GITHUB_TOKEN`/`GITHUB_DATA_REPO` no están seteados,
  o el repo remoto no es alcanzable al iniciar, degrada solo a
  `data/certificados.json` local (no tumba el servidor — bug real corregido
  el 2026-08-08, antes hacía `process.exit(1)`).
- `server.js`: toda la API + rutas de página. `app.set('trust proxy', 1)`
  es necesario porque Render está detrás de proxy (si no, los QR generan
  URLs `http://` en vez de `https://`).
- Certificados: código único `INGEA-AAAA-XXXXXX`, QR apunta a
  `/verificar/<codigo>`, PDF/HTML imprimible en `/certificado/<codigo>`.

## Variables de entorno en Render (servicio `ingea`)
| Variable | Qué es |
|---|---|
| `GITHUB_TOKEN` | Token OAuth de `gh` CLI (`gho_...`), scope `repo` completo sobre la cuenta `segesc`. Más amplio de lo ideal (no gh un fine-grained PAT solo a `ingea-datos`) — pendiente reducir el alcance si se quiere. |
| `GITHUB_DATA_REPO` | `segesc/ingea-datos` |
| `INGEA_ADMIN_USER` / `INGEA_ADMIN_PASS` | Credenciales del panel `/admin`, las puso el usuario, no las conozco. Si no están seteadas, cae a `admin`/`ingea2026` (ese default está expuesto en el README público — cambiarlo siempre). |

## Build/deploy
- Build command: `npm install --omit=dev && node tools/fetch-img.js`
  (el segundo comando descarga las fotos de Unsplash al desplegar, porque
  `public/img/*.jpg` está en `.gitignore` para no pesar el repo).
- Start command: `node server.js`
- Auto-deploy activo: cada `git push` a `main` en `segesc/ingea-web`
  redespliega solo (~30s).
- Plan Free: se duerme tras 15 min sin tráfico. Mitigado con un
  GitHub Action (`.github/workflows/keep-alive.yml`) que hace ping cada
  12 min — necesita el repo **público** para minutos ilimitados de Actions.

## Datos reales cargados (certificados de prueba, no ficticios en el sentido de que sí existen)
3 certificados emitidos y verificables ahora mismo:
`INGEA-2026-76CCC4`, `INGEA-2026-38E65A`, `INGEA-2026-713D05`.

## Decisiones de contenido tomadas
- Sin mención al Colegio de Ingenieros del Perú (no hay convenio real).
- Datos de contacto "de ejemplo pero verosímiles": RUC 20609431287,
  dirección Av. Javier Prado Este 476 San Isidro, WhatsApp real
  +51 921 588 178.
- Nunca usar el guion largo "—" (regla del usuario, en código, contenido
  y en las respuestas de chat).
- Firmantes del certificado (inventados): Mg. Ing. Ricardo A. Salazar Peña
  (Gerente General), Dra. Mariel Antúnez Rojas (Directora Académica).

## Incidente 2026-08-08
Los repos originales `Segcd/ingea-web` y `Segcd/ingea-datos` desaparecieron
de GitHub (causa desconocida — no fue una acción mía ni until ese momento
reportada por el usuario). Se recreó todo desde el git local (que tenía
el historial completo) bajo la cuenta `segesc`, se restauraron los 3
certificados desde el propio endpoint público `/api/verificar` + el archivo
de respaldo local, y se creó un servicio Render nuevo (el original quedó
inaccesible por estar en otro workspace). Lección aplicada: la persistencia
en GitHub ahora sobrevive a que el server se caiga, pero **no** protege
contra que el repo mismo se borre — no hay backup adicional fuera de GitHub.

## Pendientes / mejoras no aplicadas (deliberado, YAGNI)
- OG image específica por curso (usa una genérica de todo el sitio).
- Reducir el alcance del `GITHUB_TOKEN` a un fine-grained PAT solo sobre
  `ingea-datos` en vez del scope `repo` completo actual.
- Backup del repo de datos fuera de GitHub (por si se repite el incidente).
- Upgrade a Render Starter (~USD 7/mes) para eliminar el spin-down y poder
  usar disco persistente en vez de depender 100% de GitHub como "base de
  datos".
