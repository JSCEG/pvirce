# Graph Report - 71.-Automatización_PPT  (2026-06-01)

## Corpus Check
- 35 files · ~276,695 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 604 nodes · 1004 edges · 46 communities (28 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `58a97e7a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]

## God Nodes (most connected - your core abstractions)
1. `MobileInterface` - 31 edges
2. `CanvasCapture` - 22 edges
3. `SENER Project Tracking Dashboard` - 19 edges
4. `loadGeoJSON()` - 17 edges
5. `MapExporter` - 17 edges
6. `showStatesLayer()` - 15 edges
7. `SmartLabel` - 15 edges
8. `ExportUI` - 13 edges
9. `clearSearchBox()` - 13 edges
10. `Todas las columnas (índice → nombre)` - 13 edges

## Surprising Connections (you probably didn't know these)
- `SENER Project Tracking Dashboard` --conceptually_related_to--> `PVIRCE 2026-2040 Energy Projects Program`  [INFERRED]
  Estilos Institucionales/sener_test.html → Fuentes/PVIRCE2026-2040.md
- `README` --references--> `SENER Identity System`  [INFERRED]
  README.md → memory/design-system.md
- `loadGeoJSON()` --calls--> `createStandardPopup()`  [INFERRED]
  Estilos Institucionales/js/map-config.js → Estilos Institucionales/js/seguimiento-proyectos.js
- `PVIRCE README` --references--> `PVIRCE Main Dashboard`  [EXTRACTED]
  README.md → PVIRCE-DGMESNIE.html
- `SENER Project Tracking Dashboard` --references--> `Base Theme CSS`  [EXTRACTED]
  Estilos Institucionales/sener_test.html → css/base-theme.css

## Import Cycles
- None detected.

## Communities (46 total, 18 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (40): applyPointColors(), applySeriesColors(), chartBase(), chartDataByMode(), chartOptionsById, chartsById, chartTableRows, currentEntities (+32 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (22): buildMapTilerUrl(), clearInsetLayers(), clearInsetLines(), clearInsetPolygons(), createGradientPattern(), createInsetMaps(), createInsetToggleButton(), createMapTilerLayer() (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (33): analyzeCentrales(), analyzeLines(), analyzePolygons(), analyzeSubestaciones(), clearAnalysisLayers(), DATA_SOURCES, distancePointToLineKm(), drawConservationFeatures() (+25 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (31): analyzeCentrales(), analyzeLines(), analyzePolygons(), analyzeSubestaciones(), clearAnalysisLayers(), DATA_SOURCES, distancePointToLineKm(), drawConservationFeatures() (+23 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (33): DGMESNIE, Participant Registration Form, Project Tracking Index, GAT-Mixto Dashboard, GAT Mixtos, Google Sheets Column Mapping, Google Sheets Data Source, Web Style Guide (+25 more)

### Community 6 - "Community 6"
Cohesion: 0.26
Nodes (13): calculatePetroliferosStats(), createPetroliferosBrandChart(), createPetroliferosCharts(), createPetroliferosFilterCards(), createPetroliferosStatesChart(), drawPetroliferosMarkersOnly(), drawPetroliferosPermits(), filterPetroliferosPermits() (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (8): MapExporter, exportMapAsPNG(), exportMapForWord(), isMapTilerActive(), prepareLayoutForExport(), showMapTilerWarning(), updateAllProgressOverlays(), waitForTiles()

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (21): addCapacityLegend(), addConsumptionLegend(), addLegend(), addMunicipalitiesLegend(), addPIBLegend(), addTotalCapacityLegendTwoColumns(), analyzePresaResources(), createLabelToggleControl() (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (22): Base Theme CSS, Bootstrap Icons, UI Components Documentation, D3.js Data Visualization, Dashboard Styles CSS, Dashboard Toolkit Documentation, Design System Documentation, GobMX Design Tokens (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.21
Nodes (14): animateValue(), brandColors, chartInstances, DataStore, loadDashboardData(), parseRawData(), populateGCRSelect(), renderMiniMap() (+6 more)

### Community 12 - "Community 12"
Cohesion: 0.19
Nodes (13): analizarEntornoGeoespacial(), closeCrudModal(), getStatusStyles(), loadData(), openCrudModal(), parseData(), renderData(), renderGeneracionCard() (+5 more)

### Community 13 - "Community 13"
Cohesion: 0.28
Nodes (10): applyAnchorForces(), applyRepulsionForces(), cleanupSmartLabels(), detectCollisions(), drawLeaderLines(), initializeSmartLabels(), repositionLabels(), SmartLabel (+2 more)

### Community 14 - "Community 14"
Cohesion: 0.28
Nodes (9): Base Theme CSS, Shared Bottom Nav CSS, Shared Breadcrumbs CSS, Shared Header CSS, Mapa de Yacimientos de Litio, Leaflet.js Library, Login Page, SIIL System (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.23
Nodes (13): calculateGasLPStats(), createGasLPCharts(), createGasLPFilterCards(), createGasLPStatesChart(), createGasLPTypeChart(), drawGasLPMarkersOnly(), drawGasLPPermits(), filterGasLPPermits() (+5 more)

### Community 19 - "Community 19"
Cohesion: 0.21
Nodes (23): assignPermitsToGCR(), calculateElectricityStats(), clearSearchBox(), createElectricityCharts(), createElectricityStatesChart(), createElectricityTechChart(), createFilterCards(), createMatrixView() (+15 more)

### Community 20 - "Community 20"
Cohesion: 0.40
Nodes (6): clearData(), clearInsetMarkers(), drawRows(), getNodeMarkerOptions(), loadAndRender(), removeLabelToggleControl()

### Community 24 - "Community 24"
Cohesion: 0.23
Nodes (13): calculateGasNaturalStats(), createGasNaturalCharts(), createGasNaturalFilterCards(), createGasNaturalStatesChart(), createGasNaturalTypeChart(), drawGasNaturalMarkersOnly(), drawGasNaturalPermits(), filterGasNaturalPermits() (+5 more)

### Community 39 - "Community 39"
Cohesion: 0.07
Nodes (29): Agrupación por vista, Badges de status, CAPACIDADES MW (59-65), CONTACTO (21-28), CONTRATO Y CIERRE (583-602), Coordenadas, Estructura de filas, FICHA MODAL (2 páginas) (+21 more)

### Community 40 - "Community 40"
Cohesion: 0.17
Nodes (11): 1. Variables CSS (Design Tokens), 2. Tipografía, 3. Elementos UI, 4. Listas, 5. Imágenes y Figuras, 6. Layout General, Botones, Guía de Estilos Web - Plantilla Institucional SENER 2025 (+3 more)

### Community 41 - "Community 41"
Cohesion: 0.25
Nodes (7): Archivos, Características, Cloudflare Pages, Despliegue, Fuente de datos, PVIRCE 2026-2040 — Visor + Generador PPT, Stack

### Community 42 - "Community 42"
Cohesion: 0.50
Nodes (3): createStandardPopup(), GERENCIA_COLORS, SEGUIMIENTO_PROYECTOS_MAPS

## Knowledge Gaps
- **88 isolated node(s):** `version`, `configurations`, `allow`, `DataStore`, `chartInstances` (+83 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `loadGeoJSON()` connect `Community 8` to `Community 1`, `Community 42`, `Community 7`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `loadTotalCapacityAdditionsMap()` connect `Community 8` to `Community 1`, `Community 7`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `SENER Project Tracking Dashboard` (e.g. with `PVIRCE 2026-2040 Energy Projects Program` and `SENER UI Kit Institutional Guide`) actually correct?**
  _`SENER Project Tracking Dashboard` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `loadGeoJSON()` (e.g. with `.showNotification()` and `createStandardPopup()`) actually correct?**
  _`loadGeoJSON()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `version`, `configurations`, `allow` to the rest of the system?**
  _88 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07180851063829788 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._