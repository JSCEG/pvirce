# Seguimiento operativo GAT-Mixto

## Objetivo

Agregar seguimiento histórico a `GAT-MIXTO-DGMESNIE.html` sin alterar la base maestra de proyectos. La base GAT sigue leyendo la pestaña publicada existente; el seguimiento se guarda en una pestaña adicional llamada `Seguimiento_Mixtos`.

## Archivos

- `GAT-MIXTO-DGMESNIE.html`: incluye botones `Seguimiento` y `Reporte seg.`.
- `seguimiento-mixtos-apps-script.gs`: Apps Script para crear/leer la pestaña `Seguimiento_Mixtos`.
- `REVISION_GAT_MIXTO_PDFS_2026-06-24.md`: cruce de los PDFs contra el Sheet GAT actual.

## Configuración en Google Sheets

1. Abre el Google Sheets maestro que usa `GAT-MIXTO-DGMESNIE.html`.
2. Ve a `Extensiones -> Apps Script`.
3. Pega el contenido de `seguimiento-mixtos-apps-script.gs`.
4. Guarda el proyecto.
5. Implementa como aplicación web:
   - Ejecutar como: `Yo`.
   - Quién tiene acceso: `Cualquier usuario`.
6. Copia la URL terminada en `/exec`.
7. En `GAT-MIXTO-DGMESNIE.html`, antes del script principal o al inicio del bloque script, define:

```html
<script>
  window.SEGUIMIENTO_WEBAPP_URL = 'https://script.google.com/macros/s/XXXXX/exec';
</script>
```

Si la URL queda vacía, el módulo funciona en modo local y permite exportar TSV, pero no sincroniza al Sheet.

## Columnas de Seguimiento_Mixtos

`timestamp · folio · proyecto · empresa · estado · tecnologia · mw · fuente · fecha_reunion · estatus_general · semaforo · ruta_critica · mia_dtu · etj · misse_evis · inah · pemex · conagua · dgac · contrato_interconexion · licencia_construccion · mano_obra · proximo_hito · responsable · observaciones · capturado_por`

## Uso

1. Carga el HTML.
2. Selecciona un proyecto desde el mapa o desde la ficha.
3. Pulsa `Seguimiento`.
4. Captura ruta crítica, permisos, próximo hito y semáforo.
5. Pulsa `Guardar seguimiento`.
6. Revisa el consolidado en `Reporte seg.`.

El estado vigente es la última fila por `folio`; las filas anteriores quedan como historial.

## Pendientes del cruce contra PDFs

- Confirmar si `Concepción Mendizábal Mendoza / Las Conchitas` debe agregarse al Sheet maestro o si está con otro nombre.
- Revisar diferencias de capacidad detectadas en `Delaro`, `El Palmar`, `Tikinimul`, `Ranchos La Crisis y La Noria`, `El Chorro` y `Global Solar 3 Campeche`.
