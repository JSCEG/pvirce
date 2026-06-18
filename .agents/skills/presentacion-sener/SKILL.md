---
name: presentacion-sener
description: Genera una presentación HTML institucional SENER (full screen, 16:9, modo presentación) a partir de una liga publicada de Google Sheets (CSV/TSV). Incluye portada con logos Gobierno de México/SENER/DGMESNIE, slides con KPIs, gráficas Highcharts, tablas, animaciones anime.js, navegación por teclado, pantalla completa y exportación a PDF. Úsala SIEMPRE que el usuario pida crear una presentación, reporte ejecutivo, deck o "PPT en HTML" institucional, mencione una liga de Google Sheets/Excel en línea para presentar datos, o pida algo "como el reporte de la convocatoria". También cuando diga "presentación SENER", "modo presentación" o pase una URL docs.google.com/spreadsheets/.../pub.
---

# Presentación institucional SENER desde Google Sheets

Genera un archivo HTML autocontenido en modo presentación con la identidad SENER, alimentado en vivo desde una hoja de Google Sheets publicada.

**Referente visual obligado:** `REPORTE-SEGUNDA-CONVOCATORIA-PARTICULARES.html` (raíz de este proyecto). Es el estándar de calidad: portada, headers, tablas, gráficas y animaciones de la plantilla salen de ahí. Ante cualquier duda de diseño o de un componente que la plantilla no cubra, consulta ese archivo y replica su patrón.

## Entradas

Del mensaje del usuario obtén:

1. **Liga de datos** (obligatoria): URL publicada de Google Sheets. Formatos válidos:
   - `https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv` (o `output=tsv`)
   - Si el usuario da la URL de edición (`/d/<id>/edit`), pídele que publique la hoja (Archivo → Compartir → Publicar en la web → CSV/TSV) o construye `https://docs.google.com/spreadsheets/d/<id>/export?format=csv`.
2. **Título y tema** (opcional): si no lo da, derívalo de los encabezados de los datos y propónlo.
3. **Nombre del archivo** (opcional): kebab-case o MAYÚSCULAS-CON-GUIONES `.html`, en la raíz del proyecto.

## Flujo de trabajo

### 1. Inspecciona los datos ANTES de generar

Descarga la liga (PowerShell `Invoke-WebRequest` o `curl`) y revisa:
- Encabezados: nombres y cuántas columnas.
- Tipos: cuáles son numéricas (KPIs/gráficas), categóricas (agrupaciones), fechas, texto largo.
- Número de filas (decide cuántos slides de tabla: ~12-15 filas por slide).

NO inventes columnas. Diseña los slides con lo que realmente existe.

### 2. Diseña la narrativa de slides

Estructura típica (ajústala al dataset):
- **Slide 0 — Portada**: ya viene en la plantilla; solo rellena placeholders.
- **Slide 1 — Numeralia/Dashboard**: KPI principal (conteo total, suma de la métrica clave) + 2-4 `kpi-box` + 1-2 gráficas.
- **Slides de gráficas**: barras por categoría, dona de distribución, línea/columnas si hay serie temporal. 1-2 gráficas grandes por slide.
- **Slides de tabla**: detalle paginado con `report-table`, totales en `tfoot`.

### 3. Genera el HTML

Copia `assets/plantilla.html` (de este directorio de skill) al archivo destino y sustituye:

| Placeholder | Contenido |
|---|---|
| `{{TITULO}}` | Título principal (portada + `<title>`) |
| `{{SUBTITULO}}` | Periodo o tema, ej. "Periodo: 2026" |
| `{{EYEBROW}}` | Texto corto sobre el título, ej. "Seguimiento de Proyectos" |
| `{{UNIDAD_CORTA}}` | ej. "DGMESNIE · Subsecretaría de Planeación" |
| `{{VERSION}}` | "1.0" salvo indicación |
| `{{FUENTE}}` | ej. "SNIE — DGMESNIE" |
| `{{DATA_URL}}` | La liga del usuario |
| `{{ARCHIVO_PDF}}` | Nombre del PDF exportado (sin extensión) |

Después implementa las dos secciones marcadas:
- `<!-- {{SLIDES}} -->`: slides estáticos de contenido (estructura documentada ahí mismo). Los slides cuyo contenido depende de datos se construyen en JS.
- `// {{RENDER}}`: implementa `buildSlides(rows)` y `renderChartsForSlide(index)`. `rows` es la matriz cruda `[fila][columna]` (las hojas reales traen filas de título/notas antes del encabezado); localiza la fila de encabezado y usa el helper `objectsFrom(i)` si conviene. Las gráficas se crean la primera vez que su slide se muestra — Highcharts mide mal en `display:none`; usa un `Set` de índices ya renderizados.

La plantilla ya resuelve: carga con proxies CORS de respaldo, autodetección CSV/TSV, navegación, teclado, fullscreen, escalado 16:9, animaciones, export PDF, tema Highcharts institucional y el fix `foreignObject body` (no lo quites: sin él los labels HTML de Highcharts 12 se vuelven invisibles).

Detalles de diseño (colores, tipografía, variantes de gráficas): lee `references/diseno.md` y `references/graficas.md` según necesites.

### 4. Logos

La plantilla referencia `Estilos Institucionales/img/` (logo_gob.png, logo_sener.png, portada_ppt.png) con `onerror` que los oculta si faltan. Si el archivo destino NO está en la raíz de este proyecto, copia esa carpeta junto al HTML o ajusta las rutas. No uses logos de otra dependencia.

### 5. Revisión ortográfica (SIEMPRE, español de México)

Antes de entregar, revisa TODOS los textos visibles de la presentación: títulos, eyebrows, labels de KPIs, encabezados de tabla, títulos de gráficas, notas. Reglas:
- Español de México: acentos correctos (Generación, Pronóstico, Energía, Período/Periodo — usa "Periodo"), mayúsculas institucionales correctas.
- El usuario suele teclear rápido y con typos: NO copies sus textos literal; corrige ortografía y acentos al usarlos como títulos (p. ej. "energoa" → "Energía", "demesnie" → "DGMESNIE").
- Los datos del sheet se respetan tal cual (nombres propios, claves); solo se corrigen los textos que tú redactas.

### 6. Verifica antes de entregar

Sirve por HTTP (`python -m http.server`) — `fetch` falla con `file://`. Abre y revisa:
- Datos cargan (preloader desaparece, KPIs ≠ 0).
- Cada slide renderiza al navegar; gráficas con labels visibles.
- Consola sin errores.
- Suma de totales de la tabla coincide con el KPI principal.

## Ejemplo de invocación

Usuario: "crea una presentación con esta liga https://docs.google.com/spreadsheets/d/e/2PACX-xxx/pub?output=tsv, tema Energía Limpia"

→ Inspecciona el TSV, propone narrativa ("portada + numeralia + 2 gráficas + 3 slides de tabla"), genera `ENERGIA-LIMPIA.html`, verifica en servidor local y entrega con resumen de slides creados.
