# PVIRCE 2026-2040 — Visor + Generador PPT

Tablero web institucional SENER para consulta del **Programa Vinculante para la Instalación y Retiro de Centrales Eléctricas 2026-2040**, con generación de presentaciones por Entidad Federativa.

## Características

- Lectura en vivo de Google Sheets publicado (CSV)
- Filtro por Entidad Federativa
- 4 KPIs dinámicos: capacidad MW, total proyectos, % participación nacional, horizonte
- Narrativa generada con tecnología y estatus dominante + proyectos firmes
- Charts interactivos (Highcharts) con botón pantalla completa
- Tabla top 10 proyectos + agregado de restantes
- Tabla de capacidad por tecnología con % participación estatal
- Estilos institucionales SENER (paleta guinda/verde/dorado, Patria + Noto Sans)
- Exportación PDF horizontal 16:9 vía print (preserva estilos)

## Archivos

- `index.html` — visor + slide generador (entrypoint)
- `mockup_ppt.html` — mismo archivo (alias)
- `Estilos Institucionales/` — guía estilos web, fuentes, CSS
- `Fuentes/PVIRCE2026-2040.md` — fuente de datos local (fallback)
- `visor_pvirce_2026_2040.html` — visor original previo

## Despliegue

Static site. Compatible con Cloudflare Pages, GitHub Pages, Netlify, Vercel.

### Cloudflare Pages
1. Conecta el repo
2. Build command: *(vacío)*
3. Output: `/`

## Fuente de datos

Google Sheet publicado como CSV. Para cambiar:

```js
const CSV_URL = '...pub?...&output=csv';
const SHEET_EDIT_URL = '...';
```

Migración futura: backend SQL Server reemplaza fetch CSV.

## Stack

- Highcharts + módulos exporting + full-screen
- PapaParse (CSV)
- Vanilla JS
- Sin build step
