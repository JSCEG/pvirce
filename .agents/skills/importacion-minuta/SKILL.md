---
name: importacion-minuta
description: Automatiza la importación masiva de proyectos seleccionados desde un archivo Excel de conciliación a la pestaña "Minutas" del Google Sheet institucional, marcando el universo completo (votos de "Continúa" y "No continúa"). Se activa si el usuario pide actualizar las minutas de la Segunda Convocatoria con un libro de Excel (ej. "actualiza con mi libro en ruta tal la segunda convocatoria minuta").
---

# Habilidad: Importación de Selección y Minuta desde Excel

Esta habilidad automatiza el cruce entre un archivo de Excel con proyectos preseleccionados (típicamente llamados "los 70") y el universo completo de la convocatoria (`tmp_sheet_current.csv`), generando e importando los votos correspondientes directamente a la pestaña **"Minutas"** en Google Sheets a través de una API (Google Apps Script).

---

## Flujo de Trabajo para el Agente

Cuando el usuario pida importar o actualizar la selección con un archivo Excel (por ejemplo: *"actualiza la minuta de la segunda convocatoria con el excel en la ruta X y la hoja Y"*):

### Paso 1: Localizar los Insumos y Configurar
- **Archivo Excel de origen:** Debe tener una columna con los folios de los proyectos seleccionados (ej. `VUPE-C2-XXXX-2026`). El script por defecto busca en `Insumos/Actualizaciones 2Convoctaoria/Actualizacion17072026.xlsx` y la hoja `70Py`.
- **Archivo base del Universo:** `tmp_sheet_current.csv` (contiene los 227 proyectos).
- **URL del Web App de Google Sheets:** Por defecto, el script usa la URL configurada en `MINUTAS-SEGUNDA-CONVOCATORIA-PARTICULARES.html` (variable `window.MINUTA_WEBAPP_URL` o fallback).

### Paso 2: Ejecutar el Generador de Lote
Ejecuta el script `tools_build_minuta_70py.py` pasando las rutas correspondientes:
```bash
python tools_build_minuta_70py.py --excel "Ruta/Al/Archivo.xlsx" --sheet "NombreDeHoja"
```
**Parámetros útiles del generador:**
* `--excel`: Ruta al archivo Excel recibido.
* `--sheet`: Nombre de la hoja que contiene los folios (por defecto `70Py`).
* `--reunion-id`: Identificador único de la sesión (por defecto hoy).
* `--reunion-nombre`: Nombre legible de la reunión.
* `--capturado-por`: Iniciales o área de captura (por defecto `DGMESNIE`).

Este script creará:
* `output/minuta_70py_payload.json` (el lote completo con 227 votos estructurados).
* `output/minuta_70py_rows.csv` (la versión CSV del lote).

### Paso 3: Subir los Votos al Google Sheet
Ejecuta el script de sincronización `tools_post_minuta.py` para subir los registros:
```bash
python tools_post_minuta.py --batch-size 1
```
**Parámetros de sincronización:**
* `--batch-size`: Por defecto `1` (sube los registros uno a uno). Esto es altamente recomendado y seguro para evitar el límite de tiempo de ejecución (timeout) de Google Apps Script. Si el Apps Script fue actualizado para soportar escrituras masivas (`setValues`), se puede subir a `40` o `50`.
* `--url`: Si la URL de la Web App cambió, se puede proveer aquí.
* `--json-file`: Ruta al payload generado (por defecto `output/minuta_70py_payload.json`).

### Paso 4: Confirmar la Carga
Ejecuta una consulta para comprobar que los registros totales de hoy en la API sumen los 227 proyectos del universo:
```bash
python -c "import urllib.request, json, time; print(len(json.loads(urllib.request.urlopen('https://script.google.com/macros/s/AKfycbw6PMnP56Ybn0849PzSDXvmNowhivMmUHfr5Joxntt8C2gEuZbX3uA1B2kHoGTRQvy0kA/exec?cb=' + str(time.time())).read().decode('utf-8'))))"
```

---

## Ejemplo de uso

Si el usuario te dice:
> *"Actualiza con mi libro en ruta Insumos/Actualizaciones/ActualizacionNueva.xlsx hoja Seleccionados la minuta de segunda convocatoria"*

Debes ejecutar:
1. `python tools_build_minuta_70py.py --excel "Insumos/Actualizaciones/ActualizacionNueva.xlsx" --sheet "Seleccionados"`
2. `python tools_post_minuta.py --batch-size 1`
