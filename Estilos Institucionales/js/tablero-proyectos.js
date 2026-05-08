const API_URL = 'https://script.google.com/macros/s/AKfycbw3heMgQJWmvUW3prcamUEQn07sldIBGZTH5WVG8Pu2t-a0mwdmfSyD27jR4fj9Ws-0yg/exec';

let currentTab = 'BBDD.GEN';
let centralElectricasGeoJSON = null;

let sheetDataOriginal = { 'BBDD.GEN': [], 'BBDD.TRA': [] };
let sheetHeaders = { 'BBDD.GEN': [], 'BBDD.TRA': [] };

// DOM Ready
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            renderData();
        });
    }

    // Dynamic listener for Turf computation
    document.addEventListener('input', function (e) {
        if (e.target && (e.target.id === 'Latitud' || e.target.id === 'Longitud')) {
            const lat = parseFloat(document.getElementById('Latitud').value);
            const lng = parseFloat(document.getElementById('Longitud').value);
            if (!isNaN(lat) && !isNaN(lng)) {
                analizarEntornoGeoespacial(lat, lng);
            }
        }
    });

    loadData().then(() => {
        fetchCentralesParaAnalisis();
    });
});

async function loadData() {
    const preloader = document.getElementById('tablero-preloader');
    if (preloader) preloader.classList.remove('hidden');

    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (result.status === 'success' && result.data) {
            parseData('BBDD.GEN', result.data['BBDD.GEN']);
            parseData('BBDD.TRA', result.data['BBDD.TRA']);
            renderData();
        } else {
            console.error('Error lógico en la data: ', result);
            alert('Error leyendo los datos del origen.');
        }
    } catch (e) {
        console.error('API Error:', e);
    } finally {
        if (preloader) preloader.classList.add('hidden');
    }
}

function parseData(sheetName, rawData) {
    if (!rawData || rawData.length < 2) return;
    const headerMapping = rawData[0];
    sheetHeaders[sheetName] = [];

    for (let key in headerMapping) {
        if (key.startsWith('Columna_')) {
            const h = headerMapping[key].toString().trim();
            if (h !== '') sheetHeaders[sheetName].push(h);
        }
    }

    const actualData = rawData.slice(1).map(row => {
        let newObj = { _rowNumber: row._rowNumber };
        for (let key in row) {
            if (key.startsWith('Columna_') && headerMapping[key] !== undefined && headerMapping[key] !== '') {
                newObj[headerMapping[key].toString().trim()] = row[key] || '';
            }
        }
        return newObj;
    });

    sheetDataOriginal[sheetName] = actualData;
}

function switchTab(tabId, btnElement) {
    currentTab = tabId;

    const buttons = document.querySelectorAll('#tab-buttons button');
    buttons.forEach(btn => {
        btn.className = "flex-1 pb-3 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-primary/60 transition-colors";
    });
    btnElement.className = "flex-1 pb-3 text-sm font-bold border-b-2 border-primary text-primary transition-colors";

    renderData();
}

function renderData() {
    const listContainer = document.getElementById('list-container');
    const term = (document.getElementById('global-search').value || '').toLowerCase();

    const data = sheetDataOriginal[currentTab] || [];

    // Filtro global simple
    const filtered = data.filter(item => {
        return Object.values(item).some(val =>
            val && val.toString().toLowerCase().includes(term)
        );
    });

    listContainer.innerHTML = '';

    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-slate-400">
                <span class="material-symbols-outlined text-4xl mb-2 opacity-50 font-light">search_off</span>
                <p class="text-sm font-medium">No se encontraron proyectos</p>
            </div>
        `;
    } else {
        filtered.forEach(item => {
            if (currentTab === 'BBDD.GEN') {
                listContainer.insertAdjacentHTML('beforeend', renderGeneracionCard(item));
            } else {
                listContainer.insertAdjacentHTML('beforeend', renderTransmisionCard(item));
            }
        });
    }

    document.getElementById('count-indicator').innerText = `Mostrando ${filtered.length} proyectos`;
}

function getStatusStyles(estatusText) {
    const e = (estatusText || '').toLowerCase();
    if (e.includes('operación') || e.includes('terminado')) {
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: e || 'Operación' };
    } else if (e.includes('constru') || e.includes('ejecución')) {
        return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: e || 'En Construcción' };
    } else if (e.includes('suspendido') || e.includes('cancelado')) {
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: e || 'Suspendido' };
    } else if (e.includes('reevaluación') || e.includes('evaluación')) {
        return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: e || 'En evaluación' };
    } else {
        return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: e || 'Por iniciar' };
    }
}

function renderGeneracionCard(item) {
    const st = getStatusStyles(item['Etapa del proyecto'] || item.Estado || '');
    const tech = item['Tecnología'] || 'N/D';
    const cap = item['Capacidad'] || '?';
    const emp = item['Empresa'] || '?';
    const name = item['Nombre del proyecto'] || 'Sin Nombre';
    const lat = item['Latitud'] ? parseFloat(item['Latitud'].toString().replace(/°/g, '').trim()) : null;
    const lng = item['Longitud'] ? parseFloat(item['Longitud'].toString().replace(/°/g, '').trim()) : null;
    const flyAction = (lat && lng && !isNaN(lat) && !isNaN(lng)) ? `onclick="flyToMap(${lat}, ${lng})"` : '';

    return `
    <div ${flyAction} class="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-primary/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer">
        <div class="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex justify-between items-start mb-3">
            <div class="pe-3">
                <h3 class="font-bold text-slate-900 dark:text-white text-base leading-tight">${name}</h3>
                <p class="text-xs font-semibold text-primary/80 mt-1 uppercase tracking-wider">${cap} MW • ${tech}</p>
            </div>
            <span class="px-3 py-1 ${st.bg} ${st.text} text-[9px] font-bold rounded-full uppercase shrink-0 text-center tracking-widest leading-tight w-28">${st.label}</span>
        </div>
        <div class="flex items-center justify-between mt-4">
            <div class="flex items-center gap-2 overflow-hidden bg-slate-50 dark:bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-zinc-800">
                <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-[14px] text-primary" style="font-variation-settings: 'FILL' 1;">corporate_fare</span>
                </div>
                <span class="text-xs text-slate-600 dark:text-slate-400 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">${emp}</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
                <button onclick="event.stopPropagation(); window.open('detalle-nuevo-proyecto.html?permiso=${encodeURIComponent(name)}', '_blank')" title="Ver Detalle" class="p-2 hover:bg-amber-50 rounded-lg transition-colors text-amber-500 hover:text-amber-600 z-10">
                    <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">open_in_new</span>
                </button>
                <button onclick="event.stopPropagation(); openCrudModal('update', '${item._rowNumber}')" title="Editar" class="p-2 hover:bg-primary/5 rounded-lg transition-colors text-primary/60 hover:text-primary z-10">
                    <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">edit_note</span>
                </button>
            </div>
        </div>
    </div>
    `;
}

function renderTransmisionCard(item) {
    const st = getStatusStyles(item['Etapa del proyecto'] || item.Estado || '');
    const t = item['Tensión ( kV)'] || '?';
    const sub1 = item['Subestación 1'] || '?';
    const sub2 = item['Subestación 2'] || '?';
    const name = item['Nombre del proyecto'] || 'Sin Nombre';
    const lat = item['Latitud'] ? parseFloat(item['Latitud'].toString().replace(/°/g, '').trim()) : null;
    const lng = item['Longitud'] ? parseFloat(item['Longitud'].toString().replace(/°/g, '').trim()) : null;
    const flyAction = (lat && lng && !isNaN(lat) && !isNaN(lng)) ? `onclick="flyToMap(${lat}, ${lng})"` : '';

    return `
    <div ${flyAction} class="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-primary/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer">
        <div class="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex justify-between items-start mb-3">
            <div class="pe-3">
                <h3 class="font-bold text-slate-900 dark:text-white text-base leading-tight">${name}</h3>
                <p class="text-xs font-semibold text-primary/80 mt-1 uppercase tracking-wider">${t} kV • Transmisión</p>
            </div>
            <span class="px-3 py-1 ${st.bg} ${st.text} text-[9px] font-bold rounded-full uppercase shrink-0 text-center tracking-widest leading-tight w-28">${st.label}</span>
        </div>
        
        <div class="flex items-center gap-2 mt-4 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-zinc-900/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-zinc-800 overflow-hidden font-medium">
            <span class="material-symbols-outlined text-[16px] shrink-0 text-primary">electric_bolt</span>
            <span class="whitespace-nowrap overflow-hidden text-ellipsis">${sub1} ➝ ${sub2}</span>
        </div>

        <div class="flex items-center justify-end mt-2 gap-1">
            <button onclick="event.stopPropagation(); window.open('detalle-nuevo-proyecto.html?permiso=${encodeURIComponent(name)}', '_blank')" title="Ver Detalle" class="p-2 hover:bg-amber-50 rounded-lg transition-colors text-amber-500 hover:text-amber-600 z-10">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">open_in_new</span>
            </button>
            <button onclick="event.stopPropagation(); openCrudModal('update', '${item._rowNumber}')" title="Editar" class="p-2 hover:bg-primary/5 rounded-lg transition-colors text-primary/60 hover:text-primary z-10">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">edit_note</span>
            </button>
        </div>
    </div>
    `;
}

// Envío de evento al Parent Iframe
function flyToMap(lat, lng) {
    if (window.parent) {
        window.parent.postMessage({
            action: 'flyToProject',
            lat: lat,
            lng: lng
        }, '*');
    }
}
// CRUD Modal Logic
function openCrudModal(action, rowNumber = null) {
    document.getElementById('crud-action').value = action;
    document.getElementById('crud-row').value = rowNumber || '';
    document.getElementById('crud-sheet').value = currentTab;

    const formContainer = document.getElementById('dynamic-form-fields');
    formContainer.innerHTML = '';

    document.getElementById('geo-analysis-card').classList.add('hidden');
    document.getElementById('geo-analysis-results').innerHTML = 'Llene Latitud y Longitud para ver qué hay cerca.';

    const headers = sheetHeaders[currentTab];
    let rowData = {};

    if (action === 'update' && rowNumber) {
        document.getElementById('crudModalLabel').innerText = 'Modificar Proyecto';
        rowData = sheetDataOriginal[currentTab].find(r => r._rowNumber.toString() === rowNumber.toString()) || {};
    } else {
        document.getElementById('crudModalLabel').innerText = 'Agregar Nuevo Proyecto';
    }

    headers.forEach(header => {
        const val = rowData[header] || '';
        let inptType = 'text';
        if (header.toLowerCase().includes('latitud') || header.toLowerCase().includes('longitud')) {
            inptType = 'number';
        }

        const markup = `
            <div>
                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">${header}</label>
                <input type="${inptType === 'number' ? 'text' : inptType}" 
                       class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/50 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none"
                       id="${header}" name="${header}" value="${val}"
                       ${header.toLowerCase().includes('fecha') ? 'placeholder="YYYY-MM-DD"' : ''}>
            </div>
        `;
        formContainer.insertAdjacentHTML('beforeend', markup);
    });

    document.getElementById('crudModal').classList.remove('hidden');
    document.body.style.overflow = "hidden"; // previne scroll debajo modal

    if (action === 'update' && rowData['Latitud'] && rowData['Longitud']) {
        analizarEntornoGeoespacial(parseFloat(rowData['Latitud']), parseFloat(rowData['Longitud']));
    }
}

function closeCrudModal() {
    document.getElementById('crudModal').classList.add('hidden');
    document.body.style.overflow = ""; // reset scroll
}

async function saveProyecto() {
    const form = document.getElementById('crudForm');
    const formData = new FormData(form);

    const payload = {
        action: formData.get('action'),
        sheetName: formData.get('sheetName'),
        rowNumber: formData.get('rowNumber') ? parseInt(formData.get('rowNumber')) : null,
        projectData: {}
    };

    sheetHeaders[payload.sheetName].forEach(h => {
        payload.projectData[h] = formData.get(h) || '';
    });

    const btnSave = document.getElementById('btn-save-crud');
    const originalText = btnSave.innerHTML;
    btnSave.innerHTML = '<span class="material-symbols-outlined animate-spin text-[16px]">autorenew</span> Guardando...';
    btnSave.disabled = true;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const resJson = await res.json();

        if (resJson.status === 'success') {
            closeCrudModal();
            let p = document.getElementById('tablero-preloader');
            if (p) {
                p.classList.remove('hidden');
                p.querySelector('h5').innerText = "Recargando datos...";
            }
            await loadData();
        } else {
            alert('Error al guardar: ' + resJson.message);
        }
    } catch (e) {
        console.error(e);
        alert('Error conectando a la API al guardar.');
    } finally {
        btnSave.innerHTML = originalText;
        btnSave.disabled = false;
    }
}

async function fetchCentralesParaAnalisis() {
    try {
        const resp = await fetch('https://cdn.sassoapps.com/geojson/Centrales_El%C3%A9ctricas_privadas_y_de_CFE.geojson');
        centralElectricasGeoJSON = await resp.json();
    } catch (e) { console.warn('No se pudo cargar central', e); }
}

function analizarEntornoGeoespacial(lat, lng) {
    const card = document.getElementById('geo-analysis-card');
    const results = document.getElementById('geo-analysis-results');

    if (!centralElectricasGeoJSON) {
        results.innerHTML = 'Capa de referencia no disponible.';
        card.classList.remove('hidden');
        return;
    }

    try {
        const centerPt = turf.point([lng, lat]);
        const radiusKm = 50;
        let centralesCerca = 0, totalMW = 0;

        turf.featureEach(centralElectricasGeoJSON, function (currentFeature) {
            if (currentFeature.geometry && currentFeature.geometry.type === "Point") {
                const pt = turf.point(currentFeature.geometry.coordinates);
                const distance = turf.distance(centerPt, pt, { units: 'kilometers' });
                if (distance <= radiusKm) {
                    centralesCerca++;
                    totalMW += (parseFloat(currentFeature.properties.Capacidad_operacion_MW) || 0) + (parseFloat(currentFeature.properties.Capacidad_autorizada_MW) || 0);
                }
            }
        });

        if (centralesCerca > 0) {
            results.innerHTML = `
                <div class="text-primary font-bold flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px]">info</span> Se encontraron ${centralesCerca} centrales a menos de 50km.</div>
                <div class="mt-1.5 pl-6 text-slate-800 dark:text-slate-300 font-medium">Capacidad existente: <strong>${totalMW.toLocaleString()} MW</strong></div>
            `;
        } else {
            results.innerHTML = `<div class="text-slate-500 font-medium flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px]">explore_off</span> No hay centrales interactuando cerca (Radio 50km).</div>`;
        }
    } catch (e) {
        console.error("Turf Error", e);
        results.innerHTML = 'Error calculando proximidad.';
    }
    card.classList.remove('hidden');
}
