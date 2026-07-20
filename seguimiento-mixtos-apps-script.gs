/**
 * SEGUIMIENTO GAT-MIXTO — Web App de Google Apps Script.
 *
 * Guarda un historial append-only de avances operativos por proyecto en la
 * pestaña "Seguimiento_Mixtos" del Google Sheets maestro de GAT-Mixto.
 *
 * - doPost: agrega una fila por actualización de seguimiento.
 * - doGet: devuelve todas las filas como JSON para reconstruir el estado vigente.
 */

var SHEET_NAME = 'Seguimiento_Mixtos';

var COLUMNS = [
  'timestamp',
  'folio',
  'proyecto',
  'empresa',
  'estado',
  'tecnologia',
  'mw',
  'fuente',
  'fecha_reunion',
  'estatus_general',
  'semaforo',
  'ruta_critica',
  'mia_dtu',
  'etj',
  'misse_evis',
  'inah',
  'pemex',
  'conagua',
  'dgac',
  'contrato_interconexion',
  'licencia_construccion',
  'mano_obra',
  'proximo_hito',
  'responsable',
  'observaciones',
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
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUMNS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sh = getSheet_();
    var row = COLUMNS.map(function (c) { return data[c] != null ? data[c] : ''; });
    sh.appendRow(row);
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
        if (values[i][0] === 'timestamp' || String(values[i][1] || '') === 'folio') continue;
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
