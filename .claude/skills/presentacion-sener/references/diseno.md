# Diseño institucional SENER

## Paleta (ya definida en `:root` de la plantilla)

| Variable | Hex | Uso |
|---|---|---|
| `--color-guinda` | #9B2247 | Color primario: headers de tabla, títulos de panel, KPI principal, banda |
| `--color-guinda-light` | #B24C6C | Acentos secundarios |
| `--color-verde` | #1E5B4F | Segunda serie de gráficas, banda tricolor |
| `--color-dorado` | #A57F2C | Acentos, separadores `·`, subrayado de títulos de panel |
| `--color-dorado-light` | #D6B46A | Labels sobre fondo guinda |
| `--color-bg-dark` | #1E1E1E | Fondo del escenario (fuera del lienzo 16:9) |
| `--color-bg-light` | #F4F6F8 | Fondo de kpi-box |

Cifra destacada sobre fondo guinda: `#F2CB67` (ya aplicado en `.val-main`).

## Tipografía

- **Patria** (títulos): se carga por `@font-face` desde `Estilos Institucionales/tipografias/`. Fallback automático a Outfit si no existe la carpeta.
- **Outfit** (UI) y **Montserrat** (tablas y gráficas): Google Fonts, ya enlazadas.

## Lienzo y layout

- Lienzo virtual fijo **1333×750 px** (16:9); `fitSlides()` lo escala. Diseña en píxeles absolutos dentro de ese lienzo, no con media queries.
- Padding interior del slide: 35px vertical, 45px horizontal. Header y footer lo compensan con márgenes negativos (ya resuelto).
- Grid de contenido: usa `.content-grid` con `grid-template-columns` explícito por slide, p. ej. `style="grid-template-columns: 290px 1fr 400px"` (columna angosta de KPIs, centro ancho, derecha media).

## Componentes disponibles en la plantilla

- `.kpi-card-main` — tarjeta hero guinda con `.lbl`, `.val-main`, `.val-sub`.
- `.kpi-box` — caja secundaria con `.s-lbl`, `.s-val`, `.s-sub`.
- `.panel-card` — panel blanco con `h3` (subrayado dorado) y `.chart-host` para gráficas.
- `.report-table` — tabla institucional: thead guinda, zebra, `.num` para alineación derecha, `tfoot` para totales.
- Portada completa con `top-band` (logos), `eyebrow`, `h1`, jerarquía de unidades, `meta` y `bottom-band` tricolor.

## Slides de tabla paginados

~12-15 filas por slide. Título del header con paginación: `DETALLE DE PROYECTOS — 2/4`. Repite totales solo en el último slide o en todos los pies según pida el usuario.

## Reglas de marca

- Encabezado de cada slide de contenido: marca a la izquierda, título centrado en mayúsculas con `·` dorados (los agrega el CSS), logo SENER a la derecha.
- Footer tricolor en TODO slide de contenido (`<div class="slide-footer"></div>` al final del container).
- No introducir colores fuera de la paleta; para semáforos usa verde #2E7D32 / dorado / guinda.
