# INGEA — Plataforma de cursos de especialización ambiental

Web pública + panel administrativo con generación de certificados con QR de trazabilidad.

## Ejecutar

```
cd D:\ingea
node server.js
```

Abre `http://localhost:4173` (puerto configurable con la variable `PORT`).

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Web pública: hero, 8 cursos, metodología, testimonios, CTA |
| `/curso/<slug>` | Detalle de curso: plan de estudios, docente, precios, inscripción por WhatsApp y **brochure PDF** |
| `/verificar` y `/verificar/<código>` | Verificación pública de certificados (destino del QR) |
| `/admin` | Panel administrativo (login) |
| `/certificado/<código>` | Certificado imprimible A4 horizontal (Imprimir → Guardar como PDF) |

## Acceso administrador

- Usuario: `admin` — Clave: `ingea2026`
- Cambiar en producción con variables de entorno `INGEA_ADMIN_USER` / `INGEA_ADMIN_PASS`.

El panel permite: generar certificados (código único `INGEA-AAAA-XXXXXX` + QR), buscar, anular/reactivar, abrir el certificado imprimible y la verificación pública.

## Personalización

- **`data/cursos.js`** — catálogo de cursos, precios, fechas, docentes **y la configuración institucional** (número de WhatsApp, correo, dirección). El número actual `51987654321` es un placeholder: cámbialo por el real.
- **`data/certificados.json`** — registro persistente de certificados emitidos (no editar a mano salvo necesidad).
- **`public/css/styles.css`** — paleta y estilos (hueso `#F4F1E8`, pino `#1C3A26`, hoja `#5F9E4E`, ámbar `#EFAF3C`).
- **`public/img/`** — fotografías (descargadas de Unsplash, licencia libre). Reemplázalas por fotos propias manteniendo los nombres, o cambia las rutas `imagen` en `data/cursos.js`.
- Los brochures PDF se generan al vuelo con `pdfkit` desde el catálogo; no hay archivos que mantener.

## Arquitectura

Node.js + Express (sin build). Frontend estático en `public/`, API REST en `server.js`, persistencia en JSON. Dependencias: `express`, `qrcode`, `pdfkit`.
