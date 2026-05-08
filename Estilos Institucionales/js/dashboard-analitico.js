// Constants and API Configuration
const API_URL = 'https://script.google.com/macros/s/AKfycbw3heMgQJWmvUW3prcamUEQn07sldIBGZTH5WVG8Pu2t-a0mwdmfSyD27jR4fj9Ws-0yg/exec';

// Global Data Store
const DataStore = {
    generacion: [],
    transmision: [],
    gcrs: new Set(),
    activeGCR: 'ALL',
    geoJSON: null // Para almacenar el GeoJSON de gerencias
};

// Chart Instances
let chartInstances = {
    techDonut: null,
    stateBar: null,
    stageBar: null,
    typePie: null
};

// Map Instance
let miniMap = null;
let mapMarkersLayer = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Setup event listeners
    document.getElementById('btn-refresh').addEventListener('click', loadDashboardData);
    document.getElementById('gcr-select').addEventListener('change', (e) => {
        DataStore.activeGCR = e.target.value;
        updateDashboardView();
    });

    // Initial Data Load
    await loadDashboardData();
});

/**
 * Fetch Data from Google Apps Script API
 */
async function loadDashboardData() {
    const preloader = document.getElementById('dashboard-preloader');
    preloader.style.display = 'flex';
    preloader.style.opacity = '1';

    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (result.status === 'success' && result.data) {
            DataStore.generacion = parseRawData(result.data['BBDD.GEN']);
            DataStore.transmision = parseRawData(result.data['BBDD.TRA']);

            // Fetch GeoJSON de Gerencias
            try {
                const geoResponse = await fetch('https://cdn.sassoapps.com/Mapas/Electricidad/gerenciasdecontrol.geojson');
                DataStore.geoJSON = await geoResponse.json();
            } catch (geoErr) {
                console.error("Error cargando GeoJSON:", geoErr);
            }

            // Extract Unique GCRs from GeoJSON primarily
            if (DataStore.geoJSON && DataStore.geoJSON.features) {
                DataStore.geoJSON.features.forEach(f => {
                    if (f.properties && f.properties.name) {
                        DataStore.gcrs.add(f.properties.name.trim());
                    }
                });
            } else {
                // Fallback a los datos del excel si falla el GeoJSON
                [...DataStore.generacion, ...DataStore.transmision].forEach(item => {
                    const gcr = item['Gerencia de Control Regional ( GCR)'] || item['GCR'] || item['Gerencia de Control Regional (GCR)'];
                    if (gcr && gcr.trim() !== '') {
                        DataStore.gcrs.add(gcr.trim());
                    }
                });
            }

            populateGCRSelect();
            updateDashboardView();

            // Update timestamp
            const now = new Date();
            const dateString = now.toLocaleDateString('es-MX', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            document.getElementById('last-updated-date').textContent = dateString;

        } else {
            console.error('Error in API response structure:', result);
            alert('Hubo un error al procesar los datos de origen.');
        }
    } catch (e) {
        console.error('Fetch Error:', e);
        alert('Error de red al intentar descargar datos del Dashboard.');
    } finally {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = 'none', 300);
    }
}

/**
 * Helper to convert sheet raw array to array of objects
 */
function parseRawData(rawData) {
    if (!rawData || rawData.length < 2) return [];

    const headerMapping = rawData[0];
    const headers = {};

    // Map column IDs to Header names
    for (let key in headerMapping) {
        if (key.startsWith('Columna_')) {
            headers[key] = headerMapping[key].toString().trim();
        }
    }

    return rawData.slice(1).map(row => {
        let obj = {};
        for (let key in row) {
            if (headers[key]) {
                obj[headers[key]] = row[key] || '';
            }
        }
        return obj;
    }).filter(obj => Object.keys(obj).length > 0);
}

/**
 * Populate GCR Combobox
 */
function populateGCRSelect() {
    const select = document.getElementById('gcr-select');
    const currentValue = select.value;

    // Reset defaults
    select.innerHTML = '<option value="ALL">Todo México (Nacional)</option>';

    // Sort alphabetically
    const sortedGCRs = Array.from(DataStore.gcrs).sort();

    sortedGCRs.forEach(gcr => {
        const option = document.createElement('option');
        option.value = gcr;
        option.textContent = gcr;
        select.appendChild(option);
    });

    if (DataStore.gcrs.has(currentValue)) {
        select.value = currentValue;
    }
}

/**
 * Core View Update Function
 */
function updateDashboardView() {
    const isAll = DataStore.activeGCR === 'ALL';

    // Update Title
    const titleEl = document.getElementById('region-title');
    titleEl.textContent = isAll ? 'Panorama Nacional' : `GCR: ${DataStore.activeGCR}`;

    // Get selected polygon from GeoJSON
    let selectedPolygon = null;
    if (!isAll && DataStore.geoJSON) {
        selectedPolygon = DataStore.geoJSON.features.find(f =>
            f.properties.name.trim().toLowerCase() === DataStore.activeGCR.trim().toLowerCase()
        );
    }

    // Helper to check if point is inside polygon using Turf.js
    const isPointInside = (item) => {
        if (!selectedPolygon) return true; // Fallback interactivo
        let latRaw = item['Latitud'] || item['Lat'] || '';
        let lngRaw = item['Longitud'] || item['Lon'] || item['Lng'] || '';
        let lat = parseFloat(latRaw.toString().replace(/°/g, '').trim());
        let lng = parseFloat(lngRaw.toString().replace(/°/g, '').trim());

        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            try {
                // Turf espera [longitud, latitud]
                const pt = turf.point([lng, lat]);
                return turf.booleanPointInPolygon(pt, selectedPolygon);
            } catch (e) {
                return false;
            }
        }
        return false;
    };

    // Filter Data by GCR (Spatial intersection via Turf)
    const dGen = isAll ? DataStore.generacion : DataStore.generacion.filter(i => isPointInside(i));
    const dTra = isAll ? DataStore.transmision : DataStore.transmision.filter(i => isPointInside(i));

    // 1. Calculate KPIs
    let totalCapacidad = 0;
    let capLimpia = 0;

    dGen.forEach(item => {
        const cap = parseFloat(item['Capacidad']) || 0;
        totalCapacidad += cap;

        // Determinar si es limpia (Lógica básica)
        const tech = (item['Tecnología'] || '').toLowerCase();
        if (tech.includes('solar') || tech.includes('fotovoltaica') || tech.includes('eólica') ||
            tech.includes('hidro') || tech.includes('geotérmica') || tech.includes('nuclear') || tech.includes('batería')) {
            capLimpia += cap;
        }
    });

    const totalProyectos = dGen.length + dTra.length;
    const promedioMW = dGen.length > 0 ? (totalCapacidad / dGen.length) : 0;
    const porcentajeLimpia = totalCapacidad > 0 ? (capLimpia / totalCapacidad) * 100 : 0;

    // Update KPI DOM
    animateValue('kpi-capacidad', totalCapacidad, isDecimal = false);
    animateValue('kpi-proyectos', totalProyectos, isDecimal = false);
    animateValue('kpi-limpia', porcentajeLimpia, isDecimal = true);
    animateValue('kpi-promedio', promedioMW, isDecimal = true);

    // 2. Render Charts
    renderTechDonut(dGen);
    renderStateBar(dGen, dTra);
    renderStageBar(dGen, dTra);
    renderTypePie(dGen.length, dTra.length);

    // 3. Render Map
    renderMiniMap(dGen, dTra);

    // 4. Render Table
    renderTopProjectsTable(dGen);
}

/**
 * Animate Numbers in KPIs
 */
function animateValue(id, end, isDecimal) {
    const obj = document.getElementById(id);
    if (!obj) return;

    const start = 0;
    const duration = 1000;
    let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        // Easing out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = (easeProgress * (end - start) + start);

        if (isDecimal) {
            obj.innerHTML = currentVal.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        } else {
            obj.innerHTML = Math.round(currentVal).toLocaleString('es-MX');
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };

    window.requestAnimationFrame(step);
}

// Chart Global Configuration
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#64748b';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(16, 56, 42, 0.9)'; // Verde Profundo
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.titleFont = { size: 14, weight: 'bold', family: "'Montserrat', sans-serif" };
Chart.defaults.plugins.tooltip.bodyFont = { size: 13, family: "'Montserrat', sans-serif" };

const brandColors = {
    // Fósil
    'CICLO COMBINADO': '#8B4513',
    'TURBOGAS': '#D2691E',
    'COGENERACIÓN': '#FF8C00',
    'COMBUSTIÓN INTERNA': '#A0522D',
    // Renovable / Limpia
    'FOTOVOLTAICA': '#9D2449', // Guinda
    'SOLAR': '#9D2449',
    'EÓLICA': '#B38E5D', // Dorado
    'HIDROELÉCTRICA': '#1E90FF',
    'BATERÍAS': '#B38E5D', // Dorado
    'GEOTÉRMICA': '#10382A', // Verde profundo
    'NUCLEAR': '#10382A' // Verde profundo
};

function getTechColor(tech) {
    const t = tech.toUpperCase().trim();
    return brandColors[t] || '#94a3b8'; // default slate-400
}

/**
 * Render Tech Donut Chart
 */
function renderTechDonut(dGen) {
    const ctx = document.getElementById('techDonutChart');
    if (chartInstances.techDonut) {
        chartInstances.techDonut.destroy();
    }

    if (dGen.length === 0) {
        chartInstances.techDonut = new Chart(ctx, { type: 'doughnut', data: { labels: ['Sin Datos'], datasets: [{ data: [1], backgroundColor: ['#e2e8f0'] }] } });
        return;
    }

    const techAgg = {};
    dGen.forEach(item => {
        const tech = item['Tecnología'] || 'N/D';
        const cap = parseFloat(item['Capacidad']) || 0;
        if (!techAgg[tech]) techAgg[tech] = 0;
        techAgg[tech] += cap;
    });

    const labels = Object.keys(techAgg).sort((a, b) => techAgg[b] - techAgg[a]);
    const data = labels.map(l => Math.round(techAgg[l]));
    const bgColors = labels.map(getTechColor);

    chartInstances.techDonut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: { usePointStyle: true, boxWidth: 8, padding: 15, font: { size: 11 } }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return ` ${context.label}: ${context.raw.toLocaleString('es-MX')} MW`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render State Bar Chart
 */
function renderStateBar(dGen, dTra) {
    const ctx = document.getElementById('stateBarChart');
    if (chartInstances.stateBar) {
        chartInstances.stateBar.destroy();
    }

    const stateAgg = {};

    // Add Gen Data
    dGen.forEach(item => {
        const state = item['Estado'] || 'N/D';
        const cap = parseFloat(item['Capacidad']) || 0;
        if (!stateAgg[state]) stateAgg[state] = { gen: 0, proyGen: 0, proyTra: 0 };
        stateAgg[state].gen += cap;
        stateAgg[state].proyGen += 1;
    });

    // Add Tra Data (Counts only for this view, or we can use custom logic)
    dTra.forEach(item => {
        const state = item['Estado'] || item['Subestación 1']?.split(',')[1]?.trim() || 'N/D';
        if (!stateAgg[state]) stateAgg[state] = { gen: 0, proyGen: 0, proyTra: 0 };
        stateAgg[state].proyTra += 1;
    });

    const labels = Object.keys(stateAgg).filter(s => s !== 'N/D').sort((a, b) => stateAgg[b].gen - stateAgg[a].gen).slice(0, 10); // Top 10

    if (labels.length === 0) {
        chartInstances.stateBar = new Chart(ctx, { type: 'bar', data: { labels: ['Sin Datos'], datasets: [{ data: [0] }] } });
        return;
    }

    const dataGenMW = labels.map(l => Math.round(stateAgg[l].gen));

    chartInstances.stateBar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Capacidad Agregada (MW)',
                    data: dataGenMW,
                    backgroundColor: '#10382A', // Verde Profundo Institucional
                    borderRadius: 6,
                    barPercentage: 0.6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f5f9', drawBorder: false },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { maxRotation: 45, minRotation: 0 }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return ` ${context.raw.toLocaleString('es-MX')} MW`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render Stage Bar Chart
 */
function renderStageBar(dGen, dTra) {
    const ctx = document.getElementById('stageBarChart');
    if (chartInstances.stageBar) {
        chartInstances.stageBar.destroy();
    }

    const stageAgg = {};
    [...dGen, ...dTra].forEach(item => {
        const stage = item['Etapa del proyecto'] || 'No definido';
        if (!stageAgg[stage]) stageAgg[stage] = 0;
        stageAgg[stage]++;
    });

    const labels = Object.keys(stageAgg).sort((a, b) => stageAgg[b] - stageAgg[a]);
    const data = labels.map(l => stageAgg[l]);

    chartInstances.stageBar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad de Proyectos',
                data: data,
                backgroundColor: '#B38E5D', // Dorado Institucional
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } },
                y: { grid: { display: false }, border: { display: false } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

/**
 * Render Type Pie Chart
 */
function renderTypePie(countGen, countTra) {
    const ctx = document.getElementById('typePieChart');
    if (chartInstances.typePie) {
        chartInstances.typePie.destroy();
    }

    chartInstances.typePie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Generación', 'Transmisión'],
            datasets: [{
                data: [countGen, countTra],
                backgroundColor: ['#9D2449', '#10382A'], // Guinda y Verde
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
            }
        }
    });
}

/**
 * Populate Data Table
 */
function renderTopProjectsTable(dGen) {
    const tbody = document.getElementById('top-projects-table');

    // Sort descending by capacity, but show all (remove slice)
    const sorted = [...dGen].sort((a, b) => {
        const capA = parseFloat(a['Capacidad']) || 0;
        const capB = parseFloat(b['Capacidad']) || 0;
        return capB - capA;
    });

    if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-slate-400 font-medium">No se encontraron proyectos en esta región.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    sorted.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50/50 transition-colors group";

        let estatus = item['Etapa del proyecto'] || '-';
        let statusColor = "bg-slate-100 text-slate-600";
        if (estatus.toLowerCase().includes('operación')) statusColor = "bg-green-100 text-green-700";
        else if (estatus.toLowerCase().includes('construcción')) statusColor = "bg-emerald-100 text-emerald-700";
        else if (estatus.toLowerCase().includes('suspendido') || estatus.toLowerCase().includes('cancelado')) statusColor = "bg-red-100 text-red-700";

        const cap = parseFloat(item['Capacidad']) || 0;
        const nombre = item['Nombre del proyecto'] || 'Sin nombre';

        tr.innerHTML = `
            <td class="py-3 px-5 font-bold text-secondary group-hover:text-primary transition-colors">
                <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-400 font-normal">#${index + 1}</span>
                    ${nombre}
                </div>
            </td>
            <td class="py-3 px-5 text-slate-600">${item['Empresa'] || '-'}</td>
            <td class="py-3 px-5 text-slate-500 hidden md:table-cell">${item['Estado'] || '-'}</td>
            <td class="py-3 px-5 text-slate-600 font-medium">${item['Tecnología'] || '-'}</td>
            <td class="py-3 px-5 font-bold text-right tabular-nums">${cap.toLocaleString('es-MX')} MW</td>
            <td class="py-3 px-5 text-center">
                <span class="px-2.5 py-1 ${statusColor} text-[10px] font-bold rounded-full uppercase tracking-wider">${estatus}</span>
            </td>
            <td class="py-3 px-5 text-center">
                <a href="detalle-nuevo-proyecto.html?permiso=${encodeURIComponent(nombre)}" target="_blank" class="inline-flex items-center justify-center p-2 bg-slate-100 hover:bg-var-color-gobmx-guinda hover:text-white text-slate-500 rounded-lg transition-colors" title="Ver Detalle">
                    <i class="bi bi-box-arrow-up-right"></i>
                </a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Render Mini Map with Leaflet
 */
function renderMiniMap(dGen, dTra) {
    // 1. Initialize Map if not exist
    if (!miniMap) {
        miniMap = L.map('mini-map', {
            zoomControl: true,
            scrollWheelZoom: false
        }).setView([23.6345, -102.5528], 5); // Default Mexico center

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(miniMap);

        mapMarkersLayer = L.layerGroup().addTo(miniMap);

        // Fix for rendering when element is initially hidden or changes size
        setTimeout(() => miniMap.invalidateSize(), 500);
    }

    // 2. Clear Existing Markers & Layers
    mapMarkersLayer.clearLayers();
    if (window.gerenciasLayer) {
        miniMap.removeLayer(window.gerenciasLayer);
    }

    let bounds = L.latLngBounds();
    let hasValidPoints = false;
    let hasGeoJsonBounds = false;

    // 2.5 Draw GeoJSON
    if (DataStore.geoJSON) {
        let geoJsonToDraw = null;
        let styleToUse = {};

        if (DataStore.activeGCR !== 'ALL') {
            const selectedFeat = DataStore.geoJSON.features.find(f =>
                f.properties.name.trim().toLowerCase() === DataStore.activeGCR.trim().toLowerCase()
            );
            if (selectedFeat) {
                geoJsonToDraw = selectedFeat;
                styleToUse = { color: '#9D2449', weight: 2, opacity: 0.8, fillOpacity: 0.1 }; // Guinda emphasis
            }
        } else {
            geoJsonToDraw = DataStore.geoJSON;
            styleToUse = { color: '#10382A', weight: 1, opacity: 0.3, fillOpacity: 0.05 }; // Verde sutil para Todo Mexico
        }

        if (geoJsonToDraw) {
            window.gerenciasLayer = L.geoJSON(geoJsonToDraw, {
                style: styleToUse,
                interactive: false
            }).addTo(miniMap);
            bounds.extend(window.gerenciasLayer.getBounds());
            hasGeoJsonBounds = true;
            hasValidPoints = true;
        }
    }

    // Helper to add points
    const processPoint = (item, isGen) => {
        let latRaw = item['Latitud'] || item['Lat'] || '';
        let lngRaw = item['Longitud'] || item['Lon'] || item['Lng'] || '';
        if (!latRaw || !lngRaw) return;

        // Clean coordinate values (sometimes have "°" or spaces)
        let lat = parseFloat(latRaw.toString().replace(/°/g, '').trim());
        let lng = parseFloat(lngRaw.toString().replace(/°/g, '').trim());

        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            let tech = item['Tecnología'] || '';
            let color = isGen ? getTechColor(tech) : '#10382A'; // Verde profundo para Tx
            let name = item['Nombre del proyecto'] || item['Nombre de la obra'] || 'Sin nombre';

            let marker = L.circleMarker([lat, lng], {
                radius: isGen ? 6 : 5,
                fillColor: color,
                color: '#ffffff',
                weight: 1.5,
                opacity: 1,
                fillOpacity: 0.85
            });

            // Usamos un popup en lugar de tooltip suave para mayor interacción
            const popupContent = `
                <div style="min-width: 200px;">
                    <h4 style="margin: 0 0 5px 0; color: #9D2449; font-weight: 700; font-family: 'Merriweather', serif;">${name}</h4>
                    <p style="margin: 0 0 3px 0; font-size: 13px;"><strong>Tipo:</strong> ${isGen ? tech : 'Transmisión'}</p>
                    <p style="margin: 0 0 10px 0; font-size: 13px;"><strong>Capacidad:</strong> ${item['Capacidad'] || 0} MW</p>
                    <a href="detalle-nuevo-proyecto.html?permiso=${encodeURIComponent(name)}" target="_blank" 
                       style="display: inline-block; width: 100%; text-align: center; background: #9D2449; color: white; padding: 5px 0; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 600;">
                       Ver Detalle Completo
                    </a>
                </div>
            `;

            marker.bindPopup(popupContent, {
                className: 'custom-map-popup'
            });

            mapMarkersLayer.addLayer(marker);

            // Only extend bounds by points if we don't have a rigid GeoJSON constraint
            // otherwise the points dictate the zoom instead of the GCR polygon
            if (!hasGeoJsonBounds) {
                bounds.extend([lat, lng]);
            }
            hasValidPoints = true;
        }
    };

    // 3. Process Generation and Transmission Points
    dGen.forEach(item => processPoint(item, true));
    dTra.forEach(item => processPoint(item, false));

    // 4. Adjust View
    if (hasValidPoints) {
        miniMap.fitBounds(bounds, { padding: [30, 30] });
    } else {
        miniMap.setView([23.6345, -102.5528], 5);
    }
}
