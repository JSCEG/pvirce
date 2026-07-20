/**
 * MINUTA — Web App de Google Apps Script para la votación por GCR
 * de la Segunda Convocatoria a Particulares.
 *
 * Sincroniza los votos capturados en REPORTE-SEGUNDA-CONVOCATORIA-PARTICULARES.html
 * hacia una pestaña "Minutas" del mismo Google Sheet.
 *
 * - doPost: agrega UNA fila por voto (append; nunca sobrescribe → conserva historial).
 * - doGet:  devuelve todas las filas como JSON (para repintar estatus al cargar el HTML).
 *
 * Ver MINUTA-SETUP.md para los pasos de instalación.
 */

// Nombre de la pestaña donde se guardan los votos.
var SHEET_NAME = 'Minutas';

// Orden EXACTO de columnas (debe coincidir con el encabezado de la pestaña
// y con el objeto que envía el HTML).
var COLUMNS = [
  'timestamp',
  'fecha_reunion',
  'gcr',
  'reunion_id',
  'reunion_nombre',
  'folio',
  'proyecto_id',
  'fila_sheet',
  'proyecto',
  'empresa_gie',
  'mw',
  'asistentes',
  'comentarios',
  'decision',
  'motivo_no_continua',
  'capturado_por'
];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(COLUMNS);
    sh.setFrozenRows(1);
  }
  // Si la pestaña existe pero está vacía, escribe el encabezado.
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUMNS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function appendRowObject_(sh, data) {
  var row = COLUMNS.map(function (c) { return data[c] != null ? data[c] : ''; });
  sh.appendRow(row);
}

function appendRows_(sh, rows) {
  for (var i = 0; i < rows.length; i++) {
    appendRowObject_(sh, rows[i] || {});
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sh = getSheet_();
    if (data && Array.isArray(data.rows)) {
      appendRows_(sh, data.rows);
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, inserted: data.rows.length, mode: 'batch' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    appendRowObject_(sh, data || {});
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  try {
    var sh = getSheet_();
    var values = sh.getDataRange().getValues();
    var out = [];
    if (values.length > 1) {
      var header = values[0];
      for (var i = 1; i < values.length; i++) {
        // Salta filas-eco del encabezado (títulos duplicados) y filas vacías.
        if (values[i][0] === 'timestamp' || String(values[i][5] || '') === 'folio') continue;
        if (values[i].join('') === '') continue;
        var obj = {};
        for (var j = 0; j < header.length; j++) {
          obj[header[j]] = values[i][j];
        }
        out.push(obj);
      }
    }
    return ContentService
      .createTextOutput(JSON.stringify(out))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
