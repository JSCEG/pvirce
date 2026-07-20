# Minuta de votación por GCR — Guía de uso y configuración

Función integrada en **REPORTE-SEGUNDA-CONVOCATORIA-PARTICULARES.html** para capturar, durante las
sesiones, la votación de los 227 proyectos de la Segunda Convocatoria a Particulares: fecha, asistentes,
comentarios (atribuibles) y la decisión final (**Continúa / No continúa / Pendiente**), barriendo por
Gerencia de Control Regional (GCR), con reporte de minuta exportable y soporte para reevaluaciones.

---

## 1. Uso en la sesión (no requiere configurar nada para empezar)

La minuta funciona **100% local** desde el primer momento (guarda en el navegador). Sincronizar al Google
Sheet es opcional (sección 3) pero recomendado para tener el respaldo central y el reporte final.

Botones nuevos en la barra inferior (verdes):
- **📋 Minuta** — configura la **reunión activa**: GCR, fecha, nombre/número de sesión, quién captura y los
  **correos de asistentes** (se pegan separados por coma, `;` o salto de línea → se vuelven etiquetas).
- **📄 Reporte** — abre el **reporte de la sesión**: contadores (revisados / continúan / no continúan /
  pendientes / MW), tabla de proyectos votados, selector de reunión, y exportación a **PDF** y **TSV**.

Para votar cada proyecto:
1. En cualquier tabla por GCR, junto al botón **Ver** ahora hay un botón **Voto** (también dentro de la
   ficha del proyecto: "Voto / Minuta").
2. Se abre el formulario: escribe **comentarios** (clic en un asistente para anteponer `[Nombre]:` y dejar
   constancia de quién opina), elige **decisión** y, si es *No continúa*, captura el **motivo**.
3. **Guardar voto** → el proyecto muestra un punto de color en la tabla:
   🟢 Continúa · 🔴 No continúa · 🟡 Pendiente · ⚪ sin votar.

Flujo recomendado para las 4 reuniones de mañana: al iniciar cada una, **📋 Minuta** → elige el GCR y pega
los asistentes de ESA reunión. Vota proyecto por proyecto. Al terminar, **📄 Reporte** → exporta el PDF.

**Reevaluaciones:** votar de nuevo un proyecto en otra sesión agrega un registro nuevo (conserva historial);
el estatus vigente es siempre el último voto.

---

## 2. Persistencia y respaldo

- Todo se guarda al instante en `localStorage` del navegador (sobrevive recargas y caídas de wifi).
- **Usa siempre el mismo navegador/equipo** durante una sesión. El reporte permite **Exportar TSV** como
  respaldo en cualquier momento (se pega en el Sheet si no usas la sincronización automática).

---

## 3. Sincronización automática al Google Sheet (opcional, ~5 min)

Para que los votos lleguen solos a una pestaña **"Minutas"** del Sheet:

1. Abre el Google Sheet de la convocatoria → menú **Extensiones → Apps Script**.
2. Borra el contenido y **pega el código de [`minuta-apps-script.gs`](minuta-apps-script.gs)**. Guarda.
3. **Implementar → Nueva implementación →** tipo **Aplicación web**:
   - *Ejecutar como:* **Yo**.
   - *Quién tiene acceso:* **Cualquier usuario**.
   - **Implementar** y autoriza los permisos.
4. Copia la **URL de la app web** (termina en `/exec`).
5. En **REPORTE-SEGUNDA-CONVOCATORIA-PARTICULARES.html** puedes definir también la URL del CSV publicado si cambió el Sheet:
   ```html
   <script>
     window.MINUTA_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/XXXXX/pub?output=csv';
     window.MINUTA_WEBAPP_URL = 'https://script.google.com/macros/s/XXXXX/exec';
   </script>
   ```
   Si solo cambió el archivo fuente de Google Sheets, basta con actualizar `window.MINUTA_CSV_URL`.
6. Listo. Cada voto se agrega como fila en la pestaña **"Minutas"** (el script crea la pestaña y el
   encabezado la primera vez). Al cargar el HTML, lee esa pestaña y repinta el estatus vigente.

> Importante: la vista de **seleccionados** se construye desde la minuta vigente por folio; no hay una lista
> manual separada que debas mantener a mano. Si llega un nuevo Excel/Sheet, actualiza el CSV publicado o la
> hoja origen y la selección se recalcula al recargar.

> No hace falta crear la pestaña a mano: el script la genera. Si la creas tú, usa exactamente estos
> encabezados en la fila 1:

`timestamp · fecha_reunion · gcr · reunion_id · reunion_nombre · folio · proyecto_id · fila_sheet · proyecto · empresa_gie · mw · asistentes · comentarios · decision · motivo_no_continua · capturado_por`

Si la red falla al guardar, el voto queda local con marca *pendiente*; usa **Reportes → Reintentar sync**
cuando vuelva la conexión.

### Carga masiva desde el Excel local de 70

Si ya tienes la actualización local con la selección final de 70 proyectos, puedes generar un lote listo para
subir a la pestaña **Minutas** sin capturarlo a mano:

1. Ejecuta `tools_build_minuta_70py.py` desde la raíz del proyecto.
2. El script cruza `Insumos/Actualizaciones 2Convoctaoria/Actualizacion17072026.xlsx` (hoja `70Py`) contra
   `tmp_sheet_current.csv` y genera:
   - `output/minuta_70py_payload.json`
   - `output/minuta_70py_rows.csv`
3. Publica de nuevo la web app de Apps Script si todavía no está desplegada.
4. Envía el JSON generado al `doPost` de la web app como un lote con `rows`.

El importador agrega una fila por proyecto con `Continúa` para los 70 folios de la hoja `70Py` y
`No continúa` para el resto de proyectos con folio final en el snapshot local.

Si quieres ajustar el nombre o la fecha de la reunión antes de cargar el lote, el script acepta
`--reunion-id`, `--reunion-nombre`, `--fecha-reunion`, `--capturado-por` y `--asistentes`.

---

## 4. Columnas de la pestaña "Minutas"

| Columna | Contenido |
|---|---|
| `timestamp` | Fecha-hora del registro (ISO). |
| `fecha_reunion` | Fecha de la sesión. |
| `gcr` | Gerencia de Control Regional. |
| `reunion_id` | Id interno de la reunión (`fecha\|gcr\|nombre`). |
| `reunion_nombre` | Nombre/número de la sesión. |
| `folio` | Folio VUPE del proyecto (clave estable de unión). |
| `proyecto_id` | Id interno del proyecto en el reporte. |
| `fila_sheet` | Número de fila del proyecto en el Sheet origen. |
| `proyecto` | Nombre del proyecto. |
| `empresa_gie` | Grupo de interés / empresa. |
| `mw` | Capacidad considerada (MW). |
| `asistentes` | Correos de asistentes (separados por `;`). |
| `comentarios` | Comentarios; con `[Nombre]:` cuando se etiqueta a un asistente. |
| `decision` | Continúa / No continúa / Pendiente. |
| `motivo_no_continua` | Motivo cuando la decisión es *No continúa*. |
| `capturado_por` | Quién capturó la minuta. |

El **estatus vigente** de un proyecto es la fila más reciente por `folio`; las filas anteriores quedan como
historial para auditar reevaluaciones.
