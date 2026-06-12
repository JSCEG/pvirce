# Gráficas Highcharts — patrones institucionales

El tema global (colores, fuente, sin créditos, accesibilidad off) ya está en la plantilla vía `Highcharts.setOptions`.

Versión: la plantilla carga `https://code.highcharts.com/highcharts.js` (siempre la última, hoy v12.x) — igual que el proyecto referente `REPORTE-SEGUNDA-CONVOCATORIA-PARTICULARES.html`. No fijes versiones viejas; los patrones de este documento asumen v12+.

Textos de las gráficas (títulos, ejes, tooltips, dataLabels) en español de México con acentos correctos: "Capacidad (MW)", "Generación (GWh)", "proyectos", "Periodo".

## Fullscreen por gráfica (ya en la plantilla)

Cada panel con gráfica lleva botón que la abre a pantalla completa en un shell 16:9 del tamaño del viewport (mismas proporciones que la presentación):

```html
<div class="panel-card">
  <div class="panel-head">
    <h3>Título</h3>
    <button class="chart-fs-btn" onclick="openChartFullscreen('idDelHost','Título')"
      title="Ver gráfica en pantalla completa"><i class="bi bi-arrows-fullscreen"></i></button>
  </div>
  <div class="chart-host" id="idDelHost"></div>
</div>
```

`openChartFullscreen` reusa el `userOptions` del chart ya renderizado — no requiere reconstruir la configuración. Esc o clic fuera cierran.

## Export PDF: nunca capturar el contenedor escalado

`exportPDF` de la plantilla clona cada slide a un escenario fijo de 1333×750 sin `transform` antes de capturarlo con html2canvas (patrón de `REPORTE-SEGUNDA-CONVOCATORIA-PARTICULARES.html` y `PRODUCCION-ENERGETICA-SENER.html`). Capturar el `.slide-container` con su `transform: scale()` aplicado produce PDFs cortados. No simplifiques esa función.

## Regla de oro: renderiza cuando el slide sea visible

Highcharts mide mal dentro de `display:none`. La plantilla llama `renderChartsForSlide(index)` cada vez que se muestra un slide. Implementa así:

```js
const chartsRendered = new Set();
function renderChartsForSlide(index) {
  if (chartsRendered.has(index)) return;
  chartsRendered.add(index);
  if (index === 1) renderChartTecnologias();
  // ... un caso por slide con gráficas
}
```

Si un slide cambia de tamaño después (p. ej. resize), `chart.reflow()`.

## NO eliminar el fix de labels

La regla CSS `foreignObject body { display:block; ... }` de la plantilla es obligatoria: Highcharts 12 renderiza labels `useHTML:true` dentro de `<foreignObject><body>` y ese body hereda el `display:flex` global del documento, lo que desplaza el contenido fuera del área visible (labels invisibles).

## Barras horizontales por categoría (patrón principal)

```js
Highcharts.chart('chartCategorias', {
  chart: { type: 'bar', marginRight: 110 },
  xAxis: {
    categories: datos.map(d => d.nombre),
    labels: { style: { fontSize: '10px', color: '#333', fontWeight: '500' } },
    lineColor: '#CBD5E0'
  },
  yAxis: {
    title: { text: 'Capacidad (MW)', style: { fontSize: '10px' } },
    labels: { formatter() { return formatInt(this.value); } },
    gridLineColor: '#EDF2F7'
  },
  legend: { enabled: false },
  plotOptions: {
    series: {
      color: '#9B2247',
      borderRadius: 3,
      dataLabels: {
        enabled: true,
        formatter() { return `${formatInt(this.point.extra)} reg. · ${formatInt(this.y)}`; },
        crop: false, overflow: 'allow',
        style: { fontSize: '9px', fontWeight: 'bold' }
      }
    }
  },
  series: [{ data: datos.map(d => ({ name: d.nombre, y: d.valor, extra: d.conteo })) }]
});
```

Labels ≥9px (8px es ilegible proyectado). Top 10-12 categorías máximo; agrupa el resto en "Otros".

## Dona de distribución

```js
Highcharts.chart('chartDona', {
  chart: { type: 'pie' },
  plotOptions: {
    pie: {
      innerSize: '62%',
      dataLabels: {
        enabled: true,
        format: '{point.name}: {point.y}',
        style: { fontSize: '10px', fontWeight: '600', textOutline: 'none' }
      }
    }
  },
  series: [{ data: pares }]   // [{name, y}, ...]
});
```

Slices <2% del total: agrúpalos en "Otros" para que los labels no se encimen.

## Columnas / línea temporal

Si hay columna de fecha o año, agrega serie temporal (`type: 'column'` o `'line'`) con años en `xAxis.categories` y la métrica sumada por año. Útil para entrada en operación, inversión anual, etc.

## Banderas de país (opcional)

Si los datos traen país de origen, agrega `flag-icons` al `<head>`:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/css/flag-icons.min.css" />
```
y usa labels `useHTML:true` con `<span class="fi fi-mx"></span>` (códigos ISO-3166 alfa-2 en minúsculas). El fix `foreignObject body` ya lo soporta.

## D3.js

Solo si el usuario lo pide explícitamente o requiere una visual que Highcharts no cubre (sankey custom, mapas de árbol jerárquicos a medida). En ese caso agrega `<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>` y respeta la paleta institucional.
