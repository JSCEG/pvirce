# Graph Report - .  (2026-05-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 537 nodes · 913 edges · 39 communities (25 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3c5e58c5`
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

## God Nodes (most connected - your core abstractions)
1. `MobileInterface` - 30 edges
2. `CanvasCapture` - 21 edges
3. `SENER Project Tracking Dashboard` - 21 edges
4. `loadGeoJSON()` - 17 edges
5. `MapExporter` - 16 edges
6. `showStatesLayer()` - 14 edges
7. `SmartLabel` - 14 edges
8. `clearSearchBox()` - 13 edges
9. `ExportUI` - 12 edges
10. `runSpatialAnalysis()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `SENER Project Tracking Dashboard` --references--> `Analytical Dashboard JS`  [EXTRACTED]
  Estilos Institucionales/sener_test.html → js/dashboard-analitico.js
- `SENER Project Tracking Dashboard` --references--> `Map Configuration JS`  [EXTRACTED]
  Estilos Institucionales/sener_test.html → js/map-config.js
- `SENER Project Tracking Dashboard` --conceptually_related_to--> `PVIRCE 2026-2040 Energy Projects Program`  [INFERRED]
  Estilos Institucionales/sener_test.html → Fuentes/PVIRCE2026-2040.md
- `README` --references--> `SENER Identity System`  [INFERRED]
  README.md → memory/design-system.md
- `Copilot Instructions` --references--> `Graph JSON`  [EXTRACTED]
  .github/copilot-instructions.md → graphify-out/graph.json

## Import Cycles
- None detected.

## Communities (39 total, 14 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (40): applyPointColors(), applySeriesColors(), chartBase(), chartDataByMode(), chartOptionsById, chartsById, chartTableRows, currentEntities (+32 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (19): buildMapTilerUrl(), clearInsetLayers(), clearInsetLines(), clearInsetPolygons(), createGradientPattern(), createInsetMaps(), createInsetToggleButton(), createMapTilerLayer() (+11 more)

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
Cohesion: 0.15
Nodes (27): calculateGasNaturalStats(), calculatePetroliferosStats(), clearSearchBox(), createGasNaturalFilterCards(), createPetroliferosBrandChart(), createPetroliferosCharts(), createPetroliferosFilterCards(), displayStatesLayer() (+19 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (8): MapExporter, exportMapAsPNG(), exportMapForWord(), isMapTilerActive(), prepareLayoutForExport(), showMapTilerWarning(), updateAllProgressOverlays(), waitForTiles()

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (23): addCapacityLegend(), addConsumptionLegend(), addLegend(), addMunicipalitiesLegend(), addPIBLegend(), addTotalCapacityLegendTwoColumns(), analyzePresaResources(), createLabelToggleControl() (+15 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (24): Base Theme CSS, Bootstrap Icons, UI Components Documentation, D3.js Data Visualization, Analytical Dashboard JS, Dashboard Styles CSS, Dashboard Toolkit Documentation, Design System Documentation (+16 more)

### Community 11 - "Community 11"
Cohesion: 0.21
Nodes (14): animateValue(), brandColors, chartInstances, DataStore, loadDashboardData(), parseRawData(), populateGCRSelect(), renderMiniMap() (+6 more)

### Community 12 - "Community 12"
Cohesion: 0.19
Nodes (13): analizarEntornoGeoespacial(), closeCrudModal(), getStatusStyles(), loadData(), openCrudModal(), parseData(), renderData(), renderGeneracionCard() (+5 more)

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (9): applyAnchorForces(), applyRepulsionForces(), detectCollisions(), drawLeaderLines(), initializeSmartLabels(), repositionLabels(), SmartLabel, updatePositions() (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (14): Base Theme CSS, Shared Bottom Nav CSS, Shared Breadcrumbs CSS, Shared Header CSS, Mapa de Yacimientos de Litio, Auth Script, Login Script, Preloader Script (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.23
Nodes (13): calculateGasLPStats(), createGasLPCharts(), createGasLPFilterCards(), createGasLPStatesChart(), createGasLPTypeChart(), drawGasLPMarkersOnly(), drawGasLPPermits(), filterGasLPPermits() (+5 more)

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (9): assignPermitsToGCR(), calculateElectricityStats(), createElectricityCharts(), createFilterCards(), createMatrixView(), drawElectricityPermits(), filterElectricityPermitsByGCRAndTech(), updateElectricityStatesChart() (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.25
Nodes (9): clearData(), clearInsetMarkers(), drawRows(), getDisplaySheetUrl(), getNodeMarkerOptions(), hasValidSheetUrl(), loadAndRender(), removeLabelToggleControl() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.40
Nodes (5): createGasNaturalCharts(), createGasNaturalStatesChart(), createGasNaturalTypeChart(), updateGasNaturalStatesChart(), updateGasNaturalTypeChart()

### Community 27 - "Community 27"
Cohesion: 0.67
Nodes (3): Copilot Instructions, Graph JSON, Graph Report

## Knowledge Gaps
- **55 isolated node(s):** `version`, `configurations`, `allow`, `DataStore`, `chartInstances` (+50 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `loadGeoJSON()` connect `Community 8` to `Community 1`, `Community 7`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `loadTotalCapacityAdditionsMap()` connect `Community 8` to `Community 1`, `Community 7`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `SENER Project Tracking Dashboard` (e.g. with `PVIRCE 2026-2040 Energy Projects Program` and `SENER UI Kit Institutional Guide`) actually correct?**
  _`SENER Project Tracking Dashboard` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `loadGeoJSON()` (e.g. with `.showNotification()` and `createStandardPopup()`) actually correct?**
  _`loadGeoJSON()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `version`, `configurations`, `allow` to the rest of the system?**
  _55 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07180851063829788 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06387921022067364 - nodes in this community are weakly interconnected._