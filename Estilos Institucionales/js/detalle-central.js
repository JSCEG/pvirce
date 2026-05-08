const DATA_SOURCES = {
    centrales: [
        'https://cdn.sassoapps.com/geojson/Centrales_El%C3%A9ctricas_privadas_y_de_CFE.geojson'
    ],
    lineas: [
        'https://cdn.sassoapps.com/Mapas/Electricidad/lineasdetransmision.geojson',
        'https://cdn.sassoapps.com/geojson/L%C3%ADneas_de_Transmisi%C3%B3n.geojson'
    ],
    subestaciones: [
        'https://cdn.sassoapps.com/Mapas/Electricidad/subestaciones.geojson',
        'https://cdn.sassoapps.com/geojson/Subestaciones_El%C3%A9ctricas.geojson'
    ],
    ramsar: [
        'https://cdn.sassoapps.com/Gabvy/ramsar.geojson'
    ],
    anp: [
        'https://cdn.sassoapps.com/Mapas/ANP2025.geojson'
    ],
    advc: [
        'https://cdn.sassoapps.com/Mapas/areas_destinadas_voluntariamentea_la_conservaci%C3%B3n.geojson'
    ]
};

const state = {
    selectedFeature: null,
    datasets: {},
    map: null,
    chart: null,
    layers: {},
    currentRadiusKm: 20,
    focusLatLng: null,
    legendControl: null
};

const MAP_COLORS = {
    buffer: '#9B2247',
    centrales: '#D32F2F',
    lineas: '#0D47A1',
    subestaciones: '#388E3C',
    ramsarFill: '#8D6E63',
    ramsarStroke: '#5D4037',
    anpFill: '#66BB6A',
    anpStroke: '#388E3C',
    advcFill: '#AB47BC',
    advcStroke: '#7B1FA2'
};

document.addEventListener('DOMContentLoaded', initializeDetailView);

async function initializeDetailView() {
    const urlParams = new URLSearchParams(window.location.search);
    const permisoId = urlParams.get('permiso');

    if (!permisoId) {
        alert('No se especificó ninguna central eléctrica.');
        window.location.href = 'index.html';
        return;
    }

    try {
        const centrales = await fetchGeoJSONWithFallback(DATA_SOURCES.centrales, {
            layerName: 'centrales',
            required: true
        });

        const [lineas, subestaciones, ramsar, anp, advc] = await Promise.all([
            fetchGeoJSONWithFallback(DATA_SOURCES.lineas, { layerName: 'lineas', required: false }),
            fetchGeoJSONWithFallback(DATA_SOURCES.subestaciones, { layerName: 'subestaciones', required: false }),
            fetchGeoJSONWithFallback(DATA_SOURCES.ramsar, { layerName: 'ramsar', required: false }),
            fetchGeoJSONWithFallback(DATA_SOURCES.anp, { layerName: 'anp', required: false }),
            fetchGeoJSONWithFallback(DATA_SOURCES.advc, { layerName: 'advc', required: false })
        ]);

        state.datasets = { centrales, lineas, subestaciones, ramsar, anp, advc };

        const selected = findCentralByPermisoOrName(centrales.features || [], permisoId);

        if (!selected) {
            alert('No se encontró la central eléctrica especificada.');
            return;
        }

        state.selectedFeature = selected;
        renderGeneralInfo(selected);
        initializeMap(selected);
        initializeExternalViews(selected);
        setupAnalysisEvents();
        runSpatialAnalysis();
    } catch (error) {
        console.error('Error inicializando vista detalle:', error);
        alert('Error al cargar los datos para la vista de detalle.');
    }
}

function getEmptyFeatureCollection() {
    return { type: 'FeatureCollection', features: [] };
}

async function fetchGeoJSONWithFallback(urls, options = {}) {
    const { layerName = 'capa', required = false } = options;
    let lastError = null;

    for (const url of urls) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`No se pudo cargar ${url} (${response.status})`);
            }
            return await response.json();
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ Falló carga de ${layerName} en ${url}:`, error.message || error);
        }
    }

    if (required) {
        throw lastError || new Error(`No se pudo cargar la capa requerida: ${layerName}`);
    }

    console.warn(`⚠️ Continuando sin capa ${layerName}; no se pudo cargar ninguna URL.`);
    return getEmptyFeatureCollection();
}

function normalizeText(text) {
    return (text || '')
        .toString()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim();
}

function findCentralByPermisoOrName(features, permisoId) {
    const normalizedTarget = normalizeText(permisoId);
    return features.find((feature) => {
        const properties = feature.properties || {};
        const byPermiso = normalizeText(properties.NumeroPermiso) === normalizedTarget;
        const byName = normalizeText(properties.Razón_social || properties.EmpresaLíder) === normalizedTarget;
        return byPermiso || byName;
    });
}

function renderGeneralInfo(feature) {
    const properties = feature.properties || {};
    const [lng, lat] = feature.geometry.coordinates;

    document.getElementById('plant-name').textContent = properties.Razón_social || properties.EmpresaLíder || 'Central Eléctrica';
    document.getElementById('plant-type').textContent = properties.Tecnología || properties.Clasifica_Menú || 'Tecnología no especificada';
    document.getElementById('coordinates-tag').textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    const infoFields = [
        { label: 'Permiso', value: properties.NumeroPermiso },
        { label: 'Razón social', value: properties.Razón_social || properties.EmpresaLíder },
        { label: 'Tecnología', value: properties.Tecnología || properties.Clasifica_Menú },
        { label: 'Capacidad', value: formatNumber(properties.Capacidad_operacion_MW || properties.Capacidad_autorizada_MW, 'MW') },
        { label: 'Generación Anual', value: formatNumber(properties.Generación_estimada_anual, 'GWh') },
        { label: 'Ubicación', value: properties.Ubicación || properties.Estado },
        { label: 'Municipio', value: properties.Municipio || properties.MPO_ID },
        { label: 'Estatus', value: properties.Estatus_instalacion || properties.Estatus },
        { label: 'Combustible', value: properties.Combustible_autorizado_1 || properties.Energetico_primario },
        { label: 'Inicio de operación', value: properties.Fecha_de_Entrada_en_Operación || properties.Inicio_operaciones },
        { label: 'Modalidad', value: properties.Modalidad }
    ];

    const infoList = document.getElementById('info-list');
    infoList.innerHTML = infoFields.map((item) => `
        <li class="info-item">
            <span class="info-label">${item.label}</span>
            <span class="info-value">${item.value || 'N/D'}</span>
        </li>
    `).join('');
}

function formatNumber(value, unit) {
    if (value === null || value === undefined || value === '') return 'N/D';
    const number = Number(value);
    if (Number.isNaN(number)) return value;
    return `${number.toLocaleString('es-MX', { maximumFractionDigits: 2 })} ${unit}`;
}

function initializeMap(feature) {
    const [lng, lat] = feature.geometry.coordinates;
    state.focusLatLng = [lat, lng];
    state.map = L.map('detail-map').setView([lat, lng], 10);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(state.map);

    state.layers = {
        focus: L.layerGroup().addTo(state.map),
        buffer: L.layerGroup().addTo(state.map),
        centrales: L.layerGroup().addTo(state.map),
        lineas: L.layerGroup().addTo(state.map),
        subestaciones: L.layerGroup().addTo(state.map),
        conservacion: L.layerGroup().addTo(state.map)
    };

    const icon = L.divIcon({
        className: 'electricity-marker-icon',
        html: '<img src="https://cdn.sassoapps.com/iconos/central_electrica.png" style="width: 40px; height: 40px;">',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -18]
    });

    L.marker([lat, lng], { icon })
        .addTo(state.layers.focus)
        .bindPopup(`<strong>${escapeHtml(feature.properties.Razón_social || 'Central')}</strong><br>${escapeHtml(feature.properties.Tecnología || 'Tecnología N/D')}`)
        .openPopup();

    ensureMiniMapLegend();

    const syncMapSize = () => {
        if (!state.map) return;
        state.map.invalidateSize({ animate: false });
    };

    window.addEventListener('resize', syncMapSize);
    setTimeout(syncMapSize, 50);
    setTimeout(syncMapSize, 250);
}

function ensureMiniMapLegend() {
    if (!state.map || state.legendControl) return;

    state.legendControl = L.control({ position: 'bottomleft' });
    state.legendControl.onAdd = function () {
        const div = L.DomUtil.create('div', 'detail-map-legend');
        div.style.background = 'rgba(255,255,255,0.95)';
        div.style.padding = '8px 10px';
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0 1px 6px rgba(0,0,0,0.2)';
        div.style.fontSize = '11px';
        div.style.lineHeight = '1.35';
        div.style.maxWidth = '220px';

        div.innerHTML = `
            <div style="font-weight:700; margin-bottom:6px; color:#333; border-bottom:1px solid #eee; padding-bottom:4px;">Simbología Activa</div>
            <div style="display:flex; align-items:center; margin-bottom:4px;"><span style="width:14px;height:14px;border-radius:50%;background:${MAP_COLORS.centrales};display:inline-block;margin-right:6px;"></span>Centrales</div>
            <div style="display:flex; align-items:center; margin-bottom:4px;"><span style="width:14px;height:3px;background:${MAP_COLORS.lineas};display:inline-block;margin-right:6px;"></span>Líneas de transmisión</div>
            <div style="display:flex; align-items:center; margin-bottom:4px;"><span style="width:14px;height:14px;border-radius:50%;background:${MAP_COLORS.subestaciones};display:inline-block;margin-right:6px;"></span>Subestaciones</div>
            <div style="display:flex; align-items:center; margin-bottom:4px;"><span style="width:14px;height:10px;background:${MAP_COLORS.ramsarFill};border:1px solid ${MAP_COLORS.ramsarStroke};display:inline-block;margin-right:6px;"></span>Sitios Ramsar</div>
            <div style="display:flex; align-items:center; margin-bottom:4px;"><span style="width:14px;height:10px;background:${MAP_COLORS.anpFill};border:1px solid ${MAP_COLORS.anpStroke};display:inline-block;margin-right:6px;"></span>ANP</div>
            <div style="display:flex; align-items:center; margin-bottom:4px;"><span style="width:14px;height:10px;background:${MAP_COLORS.advcFill};border:1px solid ${MAP_COLORS.advcStroke};display:inline-block;margin-right:6px;"></span>ADVC</div>
            <div style="display:flex; align-items:center;"><span style="width:14px;height:10px;background:${MAP_COLORS.buffer};opacity:.2;border:1px solid ${MAP_COLORS.buffer};display:inline-block;margin-right:6px;"></span>Buffer de análisis</div>
        `;

        L.DomEvent.disableClickPropagation(div);
        return div;
    };

    state.legendControl.addTo(state.map);
}

function setupAnalysisEvents() {
    document.getElementById('analysis-refresh-btn')?.addEventListener('click', runSpatialAnalysis);
    document.getElementById('buffer-select')?.addEventListener('change', runSpatialAnalysis);
}

function runSpatialAnalysis() {
    const radiusSelect = document.getElementById('buffer-select');
    const radiusKm = Number(radiusSelect?.value || 20);
    state.currentRadiusKm = radiusKm;

    const centerPoint = getSelectedCenterPoint();
    const bufferFeature = turf.buffer(centerPoint, radiusKm, { units: 'kilometers' });

    const nearbyCentrales = analyzeCentrales(centerPoint, radiusKm);
    const nearbyLineas = analyzeLines(centerPoint, radiusKm);
    const nearbySubestaciones = analyzeSubestaciones(centerPoint, radiusKm);
    const nearbyRamsar = analyzePolygons(state.datasets.ramsar.features || [], centerPoint, bufferFeature, radiusKm, extractRamsarName);
    const nearbyAnp = analyzePolygons(state.datasets.anp.features || [], centerPoint, bufferFeature, radiusKm, extractAnpName);
    const nearbyAdvc = analyzePolygons(state.datasets.advc.features || [], centerPoint, bufferFeature, radiusKm, extractAdvcName);

    updateKpis({
        nearbyCentrales,
        nearbySubestaciones,
        nearbyLineas,
        nearbyRamsar,
        nearbyAnp,
        nearbyAdvc
    });

    renderAnalysisLists({
        nearbyCentrales,
        nearbyLineas,
        nearbySubestaciones,
        nearbyRamsar,
        nearbyAnp,
        nearbyAdvc
    });

    renderAnalysisChart({
        centrales: nearbyCentrales.length,
        lineas: nearbyLineas.length,
        subestaciones: nearbySubestaciones.length,
        ramsar: nearbyRamsar.length,
        anp: nearbyAnp.length,
        advc: nearbyAdvc.length
    });

    renderAnalysisMap({
        bufferFeature,
        nearbyCentrales,
        nearbyLineas,
        nearbySubestaciones,
        nearbyRamsar,
        nearbyAnp,
        nearbyAdvc
    });
}

function getSelectedCenterPoint() {
    const [lng, lat] = state.selectedFeature.geometry.coordinates;
    return turf.point([lng, lat]);
}

function analyzeCentrales(centerPoint, radiusKm) {
    const selectedPermit = normalizeText(state.selectedFeature?.properties?.NumeroPermiso);
    const selectedName = normalizeText(state.selectedFeature?.properties?.Razón_social || state.selectedFeature?.properties?.EmpresaLíder);

    return (state.datasets.centrales.features || [])
        .filter((feature) => feature.geometry?.type === 'Point')
        .map((feature) => {
            const [lng, lat] = feature.geometry.coordinates;
            const distanceKm = turf.distance(centerPoint, turf.point([lng, lat]), { units: 'kilometers' });
            return {
                feature,
                name: extractCentralName(feature.properties || {}),
                permit: feature.properties?.NumeroPermiso || 'N/D',
                distanceKm
            };
        })
        .filter((item) => {
            const itemPermit = normalizeText(item.feature.properties?.NumeroPermiso);
            const itemName = normalizeText(item.feature.properties?.Razón_social || item.feature.properties?.EmpresaLíder);
            const sameCentral = (selectedPermit && itemPermit === selectedPermit) || (selectedName && itemName === selectedName);
            return !sameCentral && item.distanceKm <= radiusKm;
        })
        .sort((a, b) => a.distanceKm - b.distanceKm);
}

function analyzeSubestaciones(centerPoint, radiusKm) {
    return (state.datasets.subestaciones.features || [])
        .map((feature) => {
            const point = getRepresentativePoint(feature);
            const distanceKm = turf.distance(centerPoint, point, { units: 'kilometers' });
            return {
                feature,
                name: extractSubestacionName(feature.properties || {}),
                distanceKm
            };
        })
        .filter((item) => item.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
}

function analyzeLines(centerPoint, radiusKm) {
    return (state.datasets.lineas.features || [])
        .map((feature) => {
            const distanceKm = distancePointToLineKm(centerPoint, feature);
            return {
                feature,
                name: extractLineaName(feature.properties || {}),
                distanceKm
            };
        })
        .filter((item) => Number.isFinite(item.distanceKm) && item.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
}

function analyzePolygons(features, centerPoint, bufferFeature, radiusKm, nameExtractor) {
    return features
        .filter((feature) => {
            const type = feature.geometry?.type;
            return type === 'Polygon' || type === 'MultiPolygon';
        })
        .map((feature) => {
            const intersects = turf.booleanIntersects(bufferFeature, feature);
            const distanceKm = intersects ? 0 : distancePointToPolygonKm(centerPoint, feature);
            return {
                feature,
                name: nameExtractor(feature.properties || {}),
                distanceKm,
                intersects
            };
        })
        .filter((item) => item.intersects || item.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
}

function distancePointToLineKm(pointFeature, lineFeature) {
    try {
        const geometry = lineFeature?.geometry;
        const geomType = geometry?.type;

        if (!geometry || !geomType) {
            return Number.POSITIVE_INFINITY;
        }

        if (geomType === 'LineString') {
            return turf.pointToLineDistance(pointFeature, lineFeature, { units: 'kilometers' });
        }

        if (geomType === 'MultiLineString') {
            let minDistance = Number.POSITIVE_INFINITY;

            (geometry.coordinates || []).forEach((segmentCoords) => {
                if (!Array.isArray(segmentCoords) || segmentCoords.length < 2) return;
                const segment = turf.lineString(segmentCoords);
                const distance = turf.pointToLineDistance(pointFeature, segment, { units: 'kilometers' });
                if (Number.isFinite(distance) && distance < minDistance) {
                    minDistance = distance;
                }
            });

            return minDistance;
        }

        if (geomType === 'GeometryCollection') {
            let minDistance = Number.POSITIVE_INFINITY;

            (geometry.geometries || []).forEach((g) => {
                if (!g || (g.type !== 'LineString' && g.type !== 'MultiLineString')) return;
                const feature = turf.feature(g);
                const distance = distancePointToLineKm(pointFeature, feature);
                if (Number.isFinite(distance) && distance < minDistance) {
                    minDistance = distance;
                }
            });

            return minDistance;
        }

        const representativePoint = getRepresentativePoint(lineFeature);
        return turf.distance(pointFeature, representativePoint, { units: 'kilometers' });
    } catch (error) {
        return Number.POSITIVE_INFINITY;
    }
}

function distancePointToPolygonKm(pointFeature, polygonFeature) {
    try {
        if (turf.booleanPointInPolygon(pointFeature, polygonFeature)) return 0;

        const asLine = turf.polygonToLine(polygonFeature);
        if (asLine.type === 'FeatureCollection') {
            let minDistance = Number.POSITIVE_INFINITY;
            (asLine.features || []).forEach((linePart) => {
                const distance = turf.pointToLineDistance(pointFeature, linePart, { units: 'kilometers' });
                if (distance < minDistance) minDistance = distance;
            });
            return minDistance;
        }

        return turf.pointToLineDistance(pointFeature, asLine, { units: 'kilometers' });
    } catch (error) {
        return Number.POSITIVE_INFINITY;
    }
}

function getRepresentativePoint(feature) {
    const type = feature.geometry?.type;

    if (type === 'Point') {
        const [lng, lat] = feature.geometry.coordinates;
        return turf.point([lng, lat]);
    }

    if (type === 'MultiPoint') {
        const [lng, lat] = feature.geometry.coordinates?.[0] || [0, 0];
        return turf.point([lng, lat]);
    }

    try {
        return turf.centroid(feature);
    } catch (error) {
        return turf.point([0, 0]);
    }
}

function renderAnalysisMap(result) {
    clearAnalysisLayers();

    const bufferLayer = L.geoJSON(result.bufferFeature, {
        noClip: true,
        style: {
            color: MAP_COLORS.buffer,
            weight: 2,
            fillColor: MAP_COLORS.buffer,
            fillOpacity: 0.08
        }
    }).addTo(state.layers.buffer);

    result.nearbyLineas.forEach((item) => {
        L.geoJSON(item.feature, {
            noClip: true,
            style: {
                color: MAP_COLORS.lineas,
                weight: 2,
                opacity: 0.7
            }
        })
            .bindPopup(`<strong>${escapeHtml(item.name)}</strong><br>Distancia: ${item.distanceKm.toFixed(2)} km`)
            .addTo(state.layers.lineas);
    });

    result.nearbySubestaciones.forEach((item) => {
        const point = getRepresentativePoint(item.feature);
        const [lng, lat] = point.geometry.coordinates;
        L.circleMarker([lat, lng], {
            radius: 6,
            color: MAP_COLORS.subestaciones,
            fillColor: MAP_COLORS.subestaciones,
            fillOpacity: 0.8,
            weight: 1
        })
            .bindPopup(`<strong>${escapeHtml(item.name)}</strong><br>Distancia: ${item.distanceKm.toFixed(2)} km`)
            .addTo(state.layers.subestaciones);
    });

    result.nearbyCentrales.forEach((item) => {
        const [lng, lat] = item.feature.geometry.coordinates;
        L.circleMarker([lat, lng], {
            radius: 6,
            color: MAP_COLORS.centrales,
            fillColor: MAP_COLORS.centrales,
            fillOpacity: 0.8,
            weight: 1
        })
            .bindPopup(`<strong>${escapeHtml(item.name)}</strong><br>Permiso: ${escapeHtml(item.permit)}<br>Distancia: ${item.distanceKm.toFixed(2)} km`)
            .addTo(state.layers.centrales);
    });

    drawConservationFeatures(result.nearbyRamsar, MAP_COLORS.ramsarFill, MAP_COLORS.ramsarStroke);
    drawConservationFeatures(result.nearbyAnp, MAP_COLORS.anpFill, MAP_COLORS.anpStroke);
    drawConservationFeatures(result.nearbyAdvc, MAP_COLORS.advcFill, MAP_COLORS.advcStroke);

    const combinedBounds = L.latLngBounds([]);

    Object.keys(state.layers).forEach((key) => {
        const layerGroup = state.layers[key];
        if (!layerGroup || !layerGroup.getLayers) return;

        layerGroup.getLayers().forEach((layer) => {
            if (layer.getBounds && typeof layer.getBounds === 'function') {
                const b = layer.getBounds();
                if (b && b.isValid()) combinedBounds.extend(b);
            } else if (layer.getLatLng && typeof layer.getLatLng === 'function') {
                combinedBounds.extend(layer.getLatLng());
            }
        });
    });

    if (state.focusLatLng) {
        combinedBounds.extend(state.focusLatLng);
    }

    if (combinedBounds.isValid()) {
        state.map.invalidateSize({ animate: false });
        state.map.fitBounds(combinedBounds.pad(0.08), { maxZoom: 12, animate: false });
    } else {
        state.map.setView(state.focusLatLng || [19.4326, -99.1332], 10, { animate: false });
    }
}

function drawConservationFeatures(items, fillColor, strokeColor) {
    items.forEach((item) => {
        L.geoJSON(item.feature, {
            noClip: true,
            style: {
                color: strokeColor,
                weight: 1.5,
                fillColor,
                fillOpacity: 0.16
            }
        })
            .bindPopup(`<strong>${escapeHtml(item.name)}</strong><br>${item.intersects ? 'Dentro del buffer' : `Distancia: ${item.distanceKm.toFixed(2)} km`}`)
            .addTo(state.layers.conservacion);
    });
}

function clearAnalysisLayers() {
    if (!state.layers) return;
    Object.keys(state.layers).forEach((key) => {
        if (key !== 'focus') {
            state.layers[key].clearLayers();
        }
    });
}

function updateKpis(result) {
    setText('kpi-nearby-centrales', result.nearbyCentrales.length);
    setText('kpi-nearby-subestaciones', result.nearbySubestaciones.length);
    setText('kpi-nearby-lineas', result.nearbyLineas.length);
    setText('kpi-ramsar', result.nearbyRamsar.length);
    setText('kpi-anp', result.nearbyAnp.length);
    setText('kpi-advc', result.nearbyAdvc.length);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
}

function renderAnalysisLists(result) {
    renderList('nearby-centrales-list', result.nearbyCentrales, 'No hay centrales en este buffer.', (item) => ({
        title: item.name,
        meta: `Permiso: ${item.permit} · ${item.distanceKm.toFixed(2)} km`
    }));

    renderList('nearby-lineas-list', result.nearbyLineas, 'No hay líneas de transmisión en este buffer.', (item) => ({
        title: item.name,
        meta: `Distancia mínima: ${item.distanceKm.toFixed(2)} km`
    }));

    renderList('nearby-subestaciones-list', result.nearbySubestaciones, 'No hay subestaciones en este buffer.', (item) => ({
        title: item.name,
        meta: `Distancia: ${item.distanceKm.toFixed(2)} km`
    }));

    renderList('nearby-ramsar-list', result.nearbyRamsar, 'No hay sitios Ramsar en este buffer.', (item) => ({
        title: item.name,
        meta: item.intersects ? 'Dentro del buffer' : `A ${item.distanceKm.toFixed(2)} km`
    }));

    renderList('nearby-anp-list', result.nearbyAnp, 'No hay ANP en este buffer.', (item) => ({
        title: item.name,
        meta: item.intersects ? 'Dentro del buffer' : `A ${item.distanceKm.toFixed(2)} km`
    }));

    renderList('nearby-advc-list', result.nearbyAdvc, 'No hay ADVC en este buffer.', (item) => ({
        title: item.name,
        meta: item.intersects ? 'Dentro del buffer' : `A ${item.distanceKm.toFixed(2)} km`
    }));
}

function renderList(listId, items, emptyMessage, mapper) {
    const list = document.getElementById(listId);
    if (!list) return;

    if (!items.length) {
        list.innerHTML = `<li><span class="meta">${emptyMessage}</span></li>`;
        return;
    }

    list.innerHTML = items.slice(0, 80).map((item) => {
        const mapped = mapper(item);
        return `
            <li>
                <span class="name">${escapeHtml(mapped.title)}</span>
                <span class="meta">${escapeHtml(mapped.meta)}</span>
            </li>
        `;
    }).join('');
}

function renderAnalysisChart(counts) {
    const canvas = document.getElementById('analysis-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const data = [
        counts.centrales,
        counts.lineas,
        counts.subestaciones,
        counts.ramsar,
        counts.anp,
        counts.advc
    ];

    if (!state.chart) {
        state.chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Centrales', 'Líneas', 'Subestaciones', 'Ramsar', 'ANP', 'ADVC'],
                datasets: [
                    {
                        label: `Conteo en buffer (${state.currentRadiusKm} km)`,
                        data,
                        backgroundColor: ['#9B2247', '#1E5B4F', '#A57F2C', '#8D6E63', '#66BB6A', '#AB47BC']
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    } else {
        state.chart.data.datasets[0].label = `Conteo en buffer (${state.currentRadiusKm} km)`;
        state.chart.data.datasets[0].data = data;
        state.chart.update();
    }
}

function initializeExternalViews(feature) {
    const [lng, lat] = feature.geometry.coordinates;

    const svContainer = document.getElementById('street-view');
    if (svContainer) {
        const streetViewUrl = `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}&cbp=12,0,0,0,0&output=svembed`;
        const openMapsUrl = `https://www.google.com/maps?q&layer=c&cbll=${lat},${lng}`;

        svContainer.innerHTML = `
            <div id="street-view-embed-wrap" style="position:relative;width:100%;height:100%;background:#f3f4f6;">
                <iframe
                    id="street-view-iframe"
                    src="${streetViewUrl}"
                    title="Google Street View"
                    width="100%"
                    height="100%"
                    style="border:0;display:block;"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    allowfullscreen>
                </iframe>

                <div id="street-view-fallback" style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;flex-direction:column;gap:12px;padding:16px;text-align:center;background:#f3f4f6;">
                    <i class="bi bi-signpost-split" style="font-size:42px;color:var(--color-gobmx-guinda);"></i>
                    <p style="margin:0;color:var(--color-text-secondary);">No hay vista disponible en mapas para esta coordenada.</p>
                    <a href="${openMapsUrl}" target="_blank" rel="noopener noreferrer" style="background:var(--color-gobmx-guinda);color:#fff;padding:10px 16px;border-radius:4px;text-decoration:none;font-weight:700;display:inline-block;text-shadow:none !important;filter:none !important;">
                        <i class="bi bi-box-arrow-up-right"></i> Abrir en Google Maps
                    </a>
                </div>
            </div>
        `;

        const streetViewIframe = document.getElementById('street-view-iframe');
        const streetViewFallback = document.getElementById('street-view-fallback');

        let iframeLoaded = false;

        const showFallback = () => {
            if (!streetViewFallback || !streetViewIframe) return;
            streetViewIframe.style.display = 'none';
            streetViewFallback.style.display = 'flex';
        };

        if (streetViewIframe) {
            streetViewIframe.addEventListener('load', () => {
                iframeLoaded = true;
            });

            streetViewIframe.addEventListener('error', () => {
                showFallback();
            });
        }

        window.setTimeout(() => {
            if (!iframeLoaded) {
                showFallback();
            }
        }, 7000);
    }

    const timelineContainer = document.getElementById('timeline-view');
    if (timelineContainer) {
        const timelinePresets = [
            { value: '0.05', label: '1984-1990' },
            { value: '0.25', label: '1990-2000' },
            { value: '0.45', label: '2000-2010' },
            { value: '0.65', label: '2010-2016' },
            { value: '0.82', label: '2016-2020' },
            { value: '0.95', label: '2020-2023' },
            { value: '1.50', label: 'Vista completa', selected: true }
        ];

        const buildTimelineEmbedUrl = (tValue, autoplay = false) => {
            const autoplayPart = autoplay ? '&autoplay=1&loop=1' : '';
            return `https://earthengine.google.com/iframes/timelapse_player_embed.html#v=${lat},${lng},11,latLng&t=${tValue}${autoplayPart}`;
        };
        const buildTimelineExternalUrl = (tValue) => `https://earthengine.google.com/timelapse/#v=${lat},${lng},11,latLng&t=${tValue}`;

        const defaultT = timelinePresets.find((item) => item.selected)?.value || '1.50';
        const timelapseUrl = buildTimelineEmbedUrl(defaultT);
        const openTimelineUrl = buildTimelineExternalUrl(defaultT);
        const optionsHtml = timelinePresets
            .map((item) => `<option value="${item.value}" ${item.selected ? 'selected' : ''}>${item.label}</option>`)
            .join('');

        timelineContainer.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid #e5e5e5;background:#fff;">
                <label for="timeline-period-select" style="font-size:12px;color:#666;font-weight:600;white-space:nowrap;">Periodo:</label>
                <select id="timeline-period-select" style="height:30px;border:1px solid #ccc;border-radius:4px;padding:0 8px;font-size:12px;flex:1;min-width:120px;">
                    ${optionsHtml}
                </select>
                <button id="timeline-play-btn" type="button" style="background:#1E5B4F;color:#fff;padding:6px 10px;border:0;border-radius:4px;font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer;">
                    <i class="bi bi-play-fill"></i> Play
                </button>
                <button id="timeline-fullscreen-btn" type="button" style="background:#444;color:#fff;padding:6px 10px;border:0;border-radius:4px;font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer;">
                    <i class="bi bi-arrows-fullscreen"></i> Maximizar
                </button>
                <a id="timeline-open-external" href="${openTimelineUrl}" target="_blank" rel="noopener noreferrer" style="background:var(--color-gobmx-guinda);color:#fff;padding:6px 10px;border-radius:4px;text-decoration:none;font-size:12px;font-weight:700;white-space:nowrap;text-shadow:none !important;filter:none !important;">
                    <i class="bi bi-box-arrow-up-right"></i> Abrir
                </a>
            </div>

            <div id="timeline-embed-wrap" style="position:relative;width:100%;height:calc(100% - 47px);background:#f3f4f6;">
                <iframe
                    id="timeline-iframe"
                    src="${timelapseUrl}"
                    width="100%"
                    height="100%"
                    frameborder="0"
                    style="border:0;display:block;"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    allowfullscreen>
                </iframe>

                <div id="timeline-fallback" style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;flex-direction:column;gap:12px;padding:16px;text-align:center;background:#f3f4f6;">
                    <i class="bi bi-clock-history" style="font-size:42px;color:var(--color-gobmx-guinda);"></i>
                    <p style="margin:0;color:var(--color-text-secondary);">No hay línea de tiempo disponible en mapas para esta coordenada.</p>
                    <a id="timeline-fallback-open" href="${openTimelineUrl}" target="_blank" rel="noopener noreferrer" style="background:var(--color-gobmx-guinda);color:#fff;padding:10px 16px;border-radius:4px;text-decoration:none;font-weight:700;display:inline-block;text-shadow:none !important;filter:none !important;">
                        <i class="bi bi-box-arrow-up-right"></i> Abrir línea de tiempo
                    </a>
                </div>
            </div>
        `;

        const timelineIframe = document.getElementById('timeline-iframe');
        const timelineFallback = document.getElementById('timeline-fallback');
        const timelineSelect = document.getElementById('timeline-period-select');
        const timelinePlayBtn = document.getElementById('timeline-play-btn');
        const timelineFullscreenBtn = document.getElementById('timeline-fullscreen-btn');
        const timelineOpenExternal = document.getElementById('timeline-open-external');
        const timelineFallbackOpen = document.getElementById('timeline-fallback-open');
        const timelineEmbedWrap = document.getElementById('timeline-embed-wrap');

        let timelineLoaded = false;

        const updateTimelineUrls = (autoplay = false) => {
            const selectedT = timelineSelect?.value || defaultT;
            const embedUrl = buildTimelineEmbedUrl(selectedT, autoplay);
            const externalUrl = buildTimelineExternalUrl(selectedT);

            if (timelineIframe) {
                timelineLoaded = false;
                timelineIframe.style.display = 'block';
                timelineIframe.src = autoplay ? `${embedUrl}&_ts=${Date.now()}` : embedUrl;
            }

            if (timelineFallback) {
                timelineFallback.style.display = 'none';
            }

            if (timelineOpenExternal) {
                timelineOpenExternal.href = externalUrl;
            }

            if (timelineFallbackOpen) {
                timelineFallbackOpen.href = externalUrl;
            }
        };

        const showTimelineFallback = () => {
            if (!timelineFallback || !timelineIframe) return;
            timelineIframe.style.display = 'none';
            timelineFallback.style.display = 'flex';
        };

        if (timelineIframe) {
            timelineIframe.addEventListener('load', () => {
                timelineLoaded = true;
            });

            timelineIframe.addEventListener('error', () => {
                showTimelineFallback();
            });
        }

        if (timelineSelect) {
            timelineSelect.addEventListener('change', () => updateTimelineUrls(false));
        }

        if (timelinePlayBtn) {
            timelinePlayBtn.addEventListener('click', () => updateTimelineUrls(true));
        }

        if (timelineFullscreenBtn && timelineEmbedWrap) {
            timelineFullscreenBtn.addEventListener('click', async () => {
                try {
                    if (document.fullscreenElement) {
                        await document.exitFullscreen();
                        return;
                    }
                    if (timelineEmbedWrap.requestFullscreen) {
                        await timelineEmbedWrap.requestFullscreen();
                    }
                } catch (e) {
                    console.warn('No se pudo maximizar la línea de tiempo:', e);
                }
            });
        }

        window.setTimeout(() => {
            if (!timelineLoaded) {
                showTimelineFallback();
            }
        }, 8000);
    }
}

function extractCentralName(properties) {
    return properties.Razón_social || properties.EmpresaLíder || properties.NumeroPermiso || 'Central sin nombre';
}

function extractSubestacionName(properties) {
    return properties.Nombre || properties.nombre || properties.NOMBRE || properties.Subestacion || 'Subestación sin nombre';
}

function extractLineaName(properties) {
    return properties.nombre_lt || properties.Nombre || properties.NOMBRE || properties.LT || 'Línea de transmisión';
}

function extractRamsarName(properties) {
    return properties.RAMSAR || properties.NOMBRE || properties.nombre || 'Sitio Ramsar';
}

function extractAnpName(properties) {
    return properties.NOMBRE || properties.nombre || properties.name || 'Área Natural Protegida';
}

function extractAdvcName(properties) {
    return properties.ADVC || properties.NOMBRE || properties.nombre || 'ADVC';
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
