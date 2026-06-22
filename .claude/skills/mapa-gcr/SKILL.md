---
name: mapa-gcr
description: Genera un deck HTML institucional SENER de mapas de México por Gerencias de Control Regional (GCR/CENACE), a partir de datos de capacidad por región (MW) y su desglose por tecnología. Produce 5 láminas (coropleto por capacidad, tecnología dominante, donas por GCR, tarjetas de datos por GCR y mapa grande con íconos de tecnología), con la paleta SENER, colores por GCR, íconos SVG propios por tecnología y exportación a PNG. Úsala SIEMPRE que el usuario pida un "mapa de GCR", "mapa por gerencias de control regional", "adiciones/capacidad por GCR o por región de control", "mapa por regiones del CENACE", o pida "otro mapa como el de capacidad por gerencias" — basta con que dé los datos por región.
---

# Mapa de adiciones/capacidad por Gerencia de Control Regional (GCR)

Genera un archivo HTML autocontenido (16:9, navegable, exportable a PNG) con mapas de México por las **10 Gerencias de Control Regional del CENACE**, alimentado por un único objeto de datos.

**Plantilla base (obligatoria):** `assets/plantilla-mapa-gcr.html` (en esta misma skill). Contiene la geometría del mapa, los estilos SENER, los íconos SVG por tecnología, la navegación y las 5 láminas ya armadas. **Nunca redibujes el mapa ni los íconos a mano:** copia la plantilla y sólo cambia los datos.

## Qué produce (5 láminas)

1. **Capacidad total por GCR** — coropleto + KPIs + barras ranking + tabla con %.
2. **Tecnología dominante por GCR** + mezcla nacional por tecnología (con íconos).
3. **Donas por GCR** — cada anillo es la mezcla tecnológica de la región (color por GCR, total en la etiqueta).
4. **Tarjetas de datos por GCR** — "popup" fijo por gerencia (sin empalmes), con barra apilada y desglose por tecnología; el mapa muestra nombre + total.
5. **Mapa grande con íconos de tecnología** por región (sin cifras salvo el total), íconos SVG propios.

## Entrada: SÓLO los datos

Las 10 GCR son fijas. El usuario sólo aporta, por región:
- `mw`: capacidad total de la región (número).
- `tec`: desglose por tecnología `{ CLAVE: MW, ... }`.
- `estados` (opcional): `[{ n:'Estado', mw:000 }, ...]` para tooltips/tarjetas. Usa `(Sin estado asignado)` para huecos.
- `totalOficial` (global): cifra nacional publicada; `null` = autosumar las regiones.

**IDs de región (no cambian):** `noreste, peninsular, oriental, central, occidental, bcalifornia, noroeste, norte, bcsur, mulege`.

**Claves de tecnología válidas (no cambian):** `FV` (solar fotovoltaica), `CC` (ciclo combinado), `EO` (eólica), `CC/COG_EF` (cogeneración eficiente), `GEO` (geotermia), `HID` (hidroeléctrica), `CSP` (termosolar), `CI` (combustión interna), `BIO` (bioenergía), `H2` (hidrógeno). Cada una ya tiene su color e ícono SVG en la plantilla.

Si el usuario da los datos en otro formato (tabla pegada, Excel/imagen, pivote por estado), **decodifícalos primero** a esta estructura y **valida que la suma por tecnología y por región cuadre con los totales** antes de generar.

Ver `assets/datos-ejemplo.json` para el formato exacto.

## Flujo de trabajo

1. **Copia la plantilla** a la raíz del proyecto con el nombre que pida el usuario (kebab-case o `MAYÚSCULAS-CON-GUIONES.html`). Si no especifica, usa algo descriptivo (p. ej. `MAPA-GCR-<TEMA>.html`).
2. **Edita un solo bloque:** dentro del archivo, el `<script>` con el comentario `FUENTE ÚNICA DE DATOS` define `window.GCR_DATA`. Sustituye `regiones` y `totalOficial` por los datos del usuario. **No toques nada más** (geometría, íconos, colores, lógica de las láminas leen todo de aquí).
3. **Ajusta título/encabezados** si el tema no es "adiciones de capacidad" (los `<h1>` y el `<title>`). Mantén el estilo institucional.
4. **Verifica** antes de entregar:
   - Que la suma de `tec` de cada región ≈ su `mw`, y que los totales por tecnología cuadren con la fuente.
   - Renderiza y revisa las 5 láminas (ver "Verificación").
5. **Reporta** la liga local del archivo y, si aplica el flujo del repo, haz commit/push.

## Verificación (render headless con Playwright)

Playwright está disponible global (`NODE_PATH=/opt/node22/lib/node_modules`). Para capturar las 5 láminas:

```js
// /tmp/shot.js  — uso: node /tmp/shot.js <ruta-absoluta-html>
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport:{width:1366,height:800}, deviceScaleFactor:2 });
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.goto('file://'+process.argv[2], { waitUntil:'load', timeout:60000 });
  await page.waitForTimeout(1800);
  for (let i=1;i<=5;i++){
    await (await page.$('.slide-container.active')).screenshot({ path:'/tmp/s'+i+'.png' });
    if (i<5){ await page.click('#navNext'); await page.waitForTimeout(450); }
  }
  await b.close(); console.log('pageerrors:', errs.length?errs:'none');
})();
```

`NODE_PATH=/opt/node22/lib/node_modules node /tmp/shot.js <abs-path>`

Nota: en headless el CDN de fuentes/iconos de Bootstrap suele estar bloqueado (los íconos SVG **propios** sí se ven; los `bi-*` de Bootstrap pueden salir vacíos). En el navegador del usuario cargan todos. Los errores `ERR_CERT_AUTHORITY_INVALID` por CDN son inofensivos; lo que importa es que no haya `pageerror` de JS.

## Reglas de diseño (no romper)

- **Identidad SENER:** guinda `#9B2247`, verde `#1E5B4F`, dorado `#A57F2C`; tipografías Patria/Outfit/Noto Sans; logo `Estilos Institucionales/img/logo_sener.png`.
- **Colores por GCR** (forma del mapa) y **colores + íconos por tecnología**: ya definidos en la plantilla (paleta de `EXPANSION-RENOVABLES.html`). No inventes nuevos salvo que el usuario lo pida.
- **Cifras:** `totalOficial` permite mostrar la cifra publicada aunque la suma redondeada difiera por 1–2 MW (nota al pie ya lo aclara).
- Mantén las láminas **data-driven**: todo sale de `window.GCR_DATA`; no escribas números "a mano" en las láminas.

## Personalizaciones frecuentes que puede pedir el usuario

- Cambiar el **título/tema** de las láminas (editar `<h1>`/`<title>`).
- **Quitar/duplicar** una lámina (cada `<section class="slide-container">` es independiente; la navegación cuenta `slides.length` sola).
- Tamaño de textos/íconos (CSS de `.s5cluster`, etiquetas del mapa, etc.).
- Ícono o color de una tecnología (objeto `TECHS` / `ICONSVG` en la plantilla — son constantes, no datos).
