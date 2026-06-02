# Google Sheets — 2DA CONVOCATORIA PARTICULARES

## URL del CSV
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vR9QhQpXdFeh9ZkNh2WqA28v61ySMz4pISGX0hbZl5QAEU8LTypjCprVndMnkWPok1JdgjujmTV9p9i/pub?output=csv
```

## Estructura de filas

| Row | Contenido |
|-----|-----------|
| 1-7 | Filas vacías / títulos institucionales |
| 8 | "Reporte de Proyectos y Trámites" (título) |
| 9 | Sub-headers: categorías tecnológicas (BIOMASA, HIDRÁULICA, SOLAR, EÓLICA, REBOMBEO) |
| 10 | **HEADER ROW** — `ID, Pre Folio, Folio Proyecto, RFC, Nombre, Proyecto...` |
| 11+ | **DATOS** — filas de proyectos |

**Importante:** El código debe buscar la fila donde `"Folio Proyecto"` aparece como nombre de columna (índice 2). Esa es la header row. Los datos empiezan en la fila siguiente.

## Sistema de mapeo — POR NOMBRE DE COLUMNA (NO posicional)

Google Sheets puede reordernar columnas. **Siempre usar mapeo por nombre de columna**, no por índice posicional.

```javascript
// Cómo funciona:
const headerRow = allRows[headerRowIdx].map((h, i) => String(h || '').trim());
const colIndex = {};
headerRow.forEach((name, idx) => {
  if (name && !colIndex[name]) colIndex[name] = idx;
});
// Luego: col('Nombre columna')
```

## Todas las columnas (índice → nombre)

### IDENTIFICACIÓN (0-8)
```
0:  ID
1:  Pre Folio
2:  Folio Proyecto
3:  RFC
4:  Nombre  (empresa desarrolladora)
5:  Proyecto  (nombre del proyecto)
6:  Descripción Proyecto
7:  Es configuración Hibrida
8:  (vacío en datos reales)
```

### SUBESTACIÓN / CONEXIÓN (15-20)
```
15: Subestación Eléctrica de Interconexión
16: Gerencia Regional  ← Agrupación GCR
17: Entidad Federativa  ← Ubicación
18: Punto Interconexión
19: Nivel de tensión (kV):
20: Grupo de Interés (GIE)
```

### CONTACTO (21-28)
```
21: Representante
22: Oir
23: Capturista
24: Email
25: Teléfono
26: Persona Escuchar
27: Domicilio Fiscal
28: Domicilio Notificaciones
```

### CAPACIDADES MW (59-65)
```
59: Capacidad Generación (MW)
60: Capacidad Instalada (MW)
61: Capacidad Instalada Neta (MW)
62: Capacidad Contratada (MW)
63: Generación Anual Estimada (GWh)
64: Número Equipos
65: Monto de inversión total del proyecto:
```

### UBICACIÓN GEOGRÁFICA (66-69)
```
66: Entidad Federativa
67: Municipio/Alcaldía
68: Domicilio
69: Número de vértices:
```

### VÉRTICES PROYECTO (70-134)
```
70:  Vértice A
71:  Vértice B
72:  Vértice C
...
134: Vértice AD
```
Coordenadas formato: `"18.71106900, -90.90993100"` (lat, lng)

### KMZ LÍNEA TRANSMISIÓN (460-491)
```
460: Archivo KMZ (línea transmisión)
461: Número de vértices: (línea)
462: Vértice A
463: Vértice B
...
491: Vértice AD
```

### SAEE — ALMACENAMIENTO (493-520)
```
493: El proyecto ya cuenta con respaldo; indicar si se desea incorporar SAEE:
494: ¿El SAEE inyectará energía eléctrica a la RNT o a las RGD?
495: Tecnología que utiliza el SAEE:
496: Capacidad de Almacenamiento (MW):
497: Indicar Potencia del SAEE (MW):
498: Tiempo de respuesta (seg)
499: Velocidad de carga (MW/min)
500: Velocidad de descarga (MW/min)
501: Profundidad de Descarga (DOD):
502: Perfil de potencia horario del SAEE:
503: Indicar corriente de falla que soporta el SAEE:
504: Seleccionar el(los) modo(s) de operación para elaboración de estudios:
505: Indicar método de carga del SAEE:
506: Información detallada de la composición de las baterías:
507: Eficiencia de las baterías y capacidad de carga/descarga:
508: Tiempo de carga de las baterías:
509: Tiempo de desagregación de las baterías:
510: Número óptimo de ciclos de carga y descarga anuales:
511: La capacidad mínima del SAEE es determinada por el CENACE:
512: Número de estudios de almacenamiento:
513: Documento de los estudios de instalación de SAEE:
514: ¿El SAEE está ubicado dentro del predio del Proyecto de autoconsumo?
515: En caso de que no, indicar las coordenadas del polígono del SAEE:
516: Vértice A (SAEE)
517: Vértice B (SAEE)
518: Vértice C (SAEE)
519: (vacío)
520: Plano georreferenciado de la ubicación del SAEE en formato KML:
```

### TRÁMITES / ESTATUS (521-540)
```
521: Fabricante(s) de los inversores
522: Modelo(s) de los inversores
523: Capacidad del inversor en kW
524: Estatus EVIS  ← misse
525: Folio EVIS
526: Porcentaje Implementación
527: Monto de inversión social destinado al proyecto
528: ¿Tiene MIA?
529: Estatus MIA  ← mia
530: Folio MIA
531: ¿Tiene estudios de interconexión?  ← cenace
532: Capacidad Generación Permiso
533: Anexo 4
534: Estatus Indicativo
535: Estatus Impacto
536: Estatus Instalaciones
537: Definición Terreno  ← tierras
538: Restricción
539: Fecha Inicio Registro
540: Fecha Firma Proyecto
```

### REGISTRO Y VALIDACIÓN (541-558)
```
541: Registro
542: El registro cumple con lo requerido
543: Fecha de emisión de prevención
544: Fecha límite de atender prevención
545: Fecha de desahogo
546: Desahogo de manera correcta
547: Estatus Validación CENACE
548: Estatus no Cumple Observaciones
549: Solicitud de Pago Estudios a realizar (1/2)
550: Solicitud de Pago Monto del Pago (MXN)
551: Solicitud de Pago Línea de Captura
552: No Cumple/Solicitud de Pago/Revalidación Documento (Oficio)
553: Estatus de Pago
554: Fecha de carga de comprobante de pago
555: Documento de pago
556: Estatus de Validación CENACE
557: Fecha de validación de pago
558: Motivos de rechazo
```

### PERMISOS CRE/CENACE (559-582)
```
559: Folio OPE
560: Estatus de la solicitud de permiso (Sin información / Presentada)
561: Fecha de recepción de la solicitud
562: Solicitud de permiso (documento)
563: Estatus de la solicitud de permiso (Sin información / Con prevención)
564: Oficio de prevención (documento)
565: Fecha de emisión de la prevención
566: Desahogo s de la prevención (Sin información / Atendida / Cumple / Desechada)
567: Fecha de recepción del desahogo
568: Resolución de la prevención (Documento)
569: Fecha de resolución
570: Resultados de los estudios (Sin información / Terminados)
571: Número de oficio de notificación de resultados de estudios
572: Monto de obras de refuerzos y las obras de interconexión (Sin información)
573: Carta de aceptación de las obras de refuerzo (Sin información)
574: Carta de Aceptación
575: Tipo de garantía
576: Nombre del fideicomiso
577: Número de cuenta bancaria
578: Monto de la garantía
579: Fecha de la sesion del comite
580: Numero de resolucion del comite
581: Sentido de la resolución
582: Acuerdos de la sesión (Documento)
```

### CONTRATO Y CIERRE (583-602)
```
583: Estatus del desistimiento
584: Fecha de recepción de Desistimiento
585: Formato de Desistimiento (Documento)
586: Fecha de presentación de garantia
587: Fecha de respuesta del CENACE
588: Estatus
589: Fecha de solicitud
590: Cumple la instruccion
591: Fecha de prevención
592: Fecha maxima atender prevencion
593: Desahogo la prevención
594: Fecha de respuesta CENACE
595: Envio a CFE para instrucion
596: Cumple la instruccion
597: Fecha de prevención
598: Fecha maxima atender prevencion
599: Desahogo la prevención
600: Fecha de respuesta CFE
601: Fecha de firma de contrato
602: Contrato de interconexion
```

## Agrupación por vista

### VISTA NUMERALIA (slide 2)

#### Trazabilidad exacta (campo visible -> origen en Sheet)

| Widget / Campo visible | Cálculo en código | Campo intermedio (`DATA`) | Columna(s) Google Sheets origen |
|---|---|---|---|
| Registros finalizados (`kpiTotalCount`) | `DATA.length` | N/A | Conteo de filas de datos (después de la fila header con `Folio Proyecto`) |
| Total proyectos (`techTotalProjects`) | `formatInt(DATA.length)` | N/A | Mismo origen que arriba |
| Total MW generación (línea 1 en `kpiTotalMw`) | `sum(getContractedMw(p))` sobre no-almacenamiento | `capacidadContratada` con fallback a `mw` | `Capacidad Contratada`; fallback `Capacidad Instalada` -> `Capacidad Generación` -> `Capacidad Instalada Neta` |
| Total MW almacenamiento (línea 2 en `kpiTotalMw`) | `sum(getContractedMw(p))` sobre almacenamiento | `capacidadContratada` con fallback a `mw` | `Capacidad Contratada`; fallback `Capacidad Instalada` -> `Capacidad Generación` -> `Capacidad Instalada Neta` |
| Total de inversión (`kpiTotalInversion`) | `sum(p.inversion)` + `formatMdd` | `inversion` | `Monto de inversión total del proyecto:` (parseado con `parseInversionToMdd`) |
| Lista por tecnología (`techList`) - conteo | `count` por `getTechGroup(p)` | `tecnologia`, `techBase`, `nombre` | `Subtecnología`, `Tipo Tecnología`, `Proyecto` |
| Lista por tecnología (`techList`) - MW | `sum(p.mw)` por `getTechGroup(p)` | `mw` | `Capacidad Instalada` (fallback `Capacidad Generación`, `Capacidad Instalada Neta`) |
| Tabla GCR - Proyectos | `count` por `p.gerencia` en no-almacenamiento | `gerencia` | `Gerencia Regional` (ajustada con `Entidad Federativa` + `Municipio/Alcaldía` para casos BC/BCS) |
| Tabla GCR - MW | `sum(p.mw)` por `p.gerencia` en no-almacenamiento | `mw` | `Capacidad Instalada` (fallback `Capacidad Generación`, `Capacidad Instalada Neta`) |
| Tabla GCR - % | `mw_gcr / totalMw_generacion` | N/A | Derivado de los dos renglones anteriores |
| MIA en trámite (`sMiaCount`, `sMiaMw`) | `classifyStatus(p.mia) === 'TRAMITE'` | `mia` + `mw` | `Estatus MIA` o `¿Tiene MIA?`; MW desde capacidades (fallback) |
| EVIS/MISSE aprobada (`sEvisCount`, `sEvisMw`) | `classifyStatus(p.misse) === 'SI'` | `misse` + `mw` | `Estatus EVIS` (o alias EVIS/MISSE); MW desde capacidades (fallback) |
| Tierras resueltas (`sTierrasCount`, `sTierrasMw`) | `classifyStatus(p.tierras) === 'SI'` | `tierras` + `mw` | `Definición Terreno` (preferir última ocurrencia duplicada) |
| Estudios CENACE (`sCenaceCount`, `sCenaceMw`) | `classifyStatus(p.cenace) === 'SI'` | `cenace` + `mw` | `¿Tiene estudios de interconexión?` (o alias `Estudios CENACE` / `Estatus Estudios CENACE`) |
| Gráfica Grupo Económico (`chartGrupo`) | `sum(p.mw)` por `p.gie` (top 12) | `gie` + `mw` | `Grupo de Interés`; fallback a `Nombre`; MW desde capacidades (fallback) |

#### Reglas de fallback críticas (afectan totales)

1. `mw` por proyecto:
  - `Capacidad Instalada`
  - si vale 0 -> `Capacidad Generación`
  - si vale 0 -> `Capacidad Instalada Neta`

2. `getContractedMw(p)` para tarjeta principal MW:
  - usa `Capacidad Contratada` si existe y es > 0
  - si no, usa `mw` (regla anterior)

3. Clasificación tecnológica (`getTechGroup`):
  - texto combinado de `Proyecto` + `Subtecnología` + `Tipo Tecnología`
  - detecta `Almacenamiento`, `Fotovoltaica`, `Eólica`, `Hidroeléctrica`

4. Gerencia (`p.gerencia`) para GCR:
  - base: `Gerencia Regional`
  - ajuste geográfico: `Entidad Federativa` + `Municipio/Alcaldía` para separar Baja California / Baja California Sur

### VISTA TABLAS POR GCR (slides 3+)
Agrupar por `Gerencia Regional`. Orden de GCRs:
```
NORESTE, OCCIDENTE, NORTE, ORIENTAL, PENINSULAR, CENTRAL,
BAJA CALIFORNIA SUR, BAJA CALIFORNIA
```

Columnas de tabla:
```
# | Proyecto | GIE | Origen | MW | Tecnología | Ubicación | Inversión | FEOC | Tierras | MISSE | MIA | Cenace
```

### FICHA MODAL (2 páginas)

**Página 1 — Generales:**
- KPIs: Cap. Instalada, Cap. Generación, Cap. Neta, Cap. Contratada, FEOC, Inversión
- Identificación: Folio, Pre-Folio, RFC, Empresa, GIE, Representante, Email, Tel, OIR, Capturista, Persona escuchar, Status, Dom fiscal, Dom notificaciones
- Tecnología: Tipo, Subtipo, Híbrida, Otra, N° equipos, Cap gen permiso, Gen anual, Inversión, Inversión social
- Clima: Energía bruta mensual, Irradiación solar, Temp ambiente, Velocidad viento, Densidad viento, Cuencas hídricas, Respaldo intermitente
- Ubicación: Entidad, Municipio, Gerencia, Domicilio, N° vértices, Coordenadas, KMZ proyecto

**Página 2 — Regulación y SAEE:**
- KPIs: SAEE Potencia, SAEE Almacenamiento, Prof. descarga, % Impl, Estatus indicativo, Inversión social
- Regulación: Status registro, % Impl, Indicativo, Anexo 4, MIA (tiene/estatus/folio), EVIS (estatus/folio), Impacto social, Instalaciones, Estudios interc., Terreno, Restricción, Inicio registro, Firma proyecto
- SAEE: ¿Incorpora?, Inyecta a, Tech, Potencia, Almacenamiento, DOD, Tiempo respuesta, Vel carga/descarga, Corriente falla, Modos operación, Método carga, Composición, Eficiencia, Tiempos carga/desag, Ciclos, Cap mín CENACE, N° estudios, Dentro del predio, KML SAEE
- Inversores: Fabricante, Modelo, Capacidad kW
- Conectividad: Subestación, Punto interconexión, Nivel tensión, Gerencia CENACE, Distancia SE, Respaldo intermitente
- Fases finales: Validación CENACE, Pago status, Folio OPE, CRE status, Fecha resolución CRE, Resultados estudios, Monto obras refuerzo, Tipo garantía, Monto garantía, Fecha respuesta CENACE, Status contrato, Fecha firma contrato, Contrato doc

## Notas sobre parsing

### Inversión a MDD
```javascript
function parseInversionToMdd(val) {
  if (!val || val === 'SIN INFORMACIÓN') return 0;
  const cleanStr = String(val).toUpperCase().replace(/[\$,]/g, '');
  const match = cleanStr.match(/([\d\.]+)/);
  if (!match) return 0;
  const amount = parseFloat(match[1]);
  if (isNaN(amount)) return 0;
  // Si tiene MXN o es número grande → dividir entre 18 y 1M
  if (cleanStr.includes('MXN') || cleanStr.includes('PESOS') || amount > 50000000) {
    return amount / 18 / 1000000;
  }
  // Si ya está en dólares (DOLARES) y es grande → dividir entre 1M
  if (amount > 1000000) {
    return amount / 1000000;
  }
  return amount;
}
```

### Coordenadas
Formato: `"18.71106900, -90.90993100"` → `[lat, lng]`
Forzar lng negativo (México = oeste).

### Badges de status
```javascript
const norm = normText(val);
if (norm === 'SI' || norm.includes('RESUELTA') || norm.includes('APROBADA') || norm.includes('AUTORIZADA'))
  → badge-si (verde)
if (norm === 'NO' || norm.includes('SIN SOLICITUD'))
  → badge-no (rojo)
if (norm.includes('TRAMITE') || norm.includes('PROCESO') || norm.includes('PREVENCION'))
  → badge-tramite (amarillo)
```

## GCRs válidas
```
NORESTE, OCCIDENTE, NORTE, ORIENTAL, PENINSULAR, CENTRAL,
BAJA CALIFORNIA SUR, BAJA CALIFORNIA
```

Lógica especial para Baja California (Mulegé →区分 BCS vs BC por municipio).

## Flags de tecnología
```javascript
if (/ALMACENA/i.test(name) || /BATERI/i.test(tech)) return 'Almacenamiento';
if (/FOTOVOL/i.test(tech) || /SOLAR/i.test(tech)) return 'Fotovoltaica';
if (/EOL/i.test(tech)) return 'Eólica';
if (/HIDR/i.test(tech)) return 'Hidroeléctrica';
return 'Otro';
```