/**
 * Configuración de mapas para el instrumento SEGUIMIENTO DE PROYECTOS
 */

// Paleta de colores institucionales / distintivos para Gerencias
const GERENCIA_COLORS = {
    'central': '#8B0000',      // Rojo oscuro
    'oriental': '#FF8C00',      // Naranja oscuro
    'occidental': '#4682B4',   // Azul acero
    'noroeste': '#556B2F',     // Verde oliva oscuro
    'norte': '#00008B',        // Azul oscuro
    'noreste': '#800080',      // Púrpura
    'baja california': '#2E8B57', // Verde mar
    'baja california sur': '#DAA520', // Vara de oro
    'peninsular': '#D2691E',    // Chocolate
    'default': '#999999'        // Gris (fallback)
};

/**
 * Helper para crear popups estandarizados y "bonitos"
 * @param {Object} options - Configuración del popup
 * @param {string} options.title - Título principal (nombre)
 * @param {string} options.subtitle - Subtítulo (tipo, estado, etc.)
 * @param {Array<{label: string, value: string}>} options.details - Lista de detalles
 * @param {string} options.icon - Clase del icono Bootstrap (bi-...)
 * @param {string} options.color - Color principal para el icono y título
 */
function createStandardPopup(options) {
    const { title, subtitle, details, icon, color } = options;
    const safeTitle = title || 'Sin Nombre';
    const safeSubtitle = subtitle || '';
    const safeColor = color || '#333';

    // Generar HTML de detalles
    const detailsHtml = (details || []).map(d => `
        <div style="margin-top: 4px; font-size: 12px;">
            <strong>${d.label}:</strong> ${d.value}
        </div>
    `).join('');

    return `
        <div style="font-family: 'Noto Sans', sans-serif; max-width: 280px; line-height: 1.4;">
            <div style="font-size: 15px; font-weight: 700; color: ${safeColor}; border-bottom: 2px solid ${safeColor}20; padding-bottom: 8px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <i class="bi ${icon || 'bi-geo-alt-fill'}" style="font-size: 18px;"></i>
                <span>${safeTitle}</span>
            </div>
            ${safeSubtitle ? `<div style="font-size: 13px; color: #666; margin-bottom: 8px; font-style: italic;">${safeSubtitle}</div>` : ''}
            <div style="color: #444;">
                ${detailsHtml}
            </div>
        </div>
    `;
}

window.createStandardPopup = createStandardPopup;

const SEGUIMIENTO_PROYECTOS_MAPS = [
    {
        name: 'Infraestructura Eléctrica',
        description: 'Visualización de Centrales, Gerencias, Líneas y Subestaciones',
        sheetUrl: null, // Sin hoja de datos
        baseMap: 'esri-worldimagery', // Mapa base satelital ESRI
        geojsonUrl: null,
        geojsonUrlType: null,

        additionalLayers: [
            {
                url: 'https://cdn.sassoapps.com/geojson/Centrales_El%C3%A9ctricas_privadas_y_de_CFE.geojson',
                type: 'centrales',
                name: 'Centrales Eléctricas',
                category: 'domain',
                pointToLayer: function (feature, latlng) {
                    const icon = L.divIcon({
                        className: 'electricity-marker-icon',
                        html: '<img src="https://cdn.sassoapps.com/iconos/central_electrica.png" style="width: 28px; height: 28px;">',
                        iconSize: [28, 28],
                        iconAnchor: [14, 14],
                        popupAnchor: [0, -14]
                    });
                    return L.marker(latlng, { icon: icon });
                },
                popup: (properties) => {
                    const content = createStandardPopup({
                        title: properties.Razón_social || properties.EmpresaLíder || 'Central Eléctrica',
                        subtitle: properties.Tecnología || properties.Clasifica_Menú || 'Tecnología no especificada',
                        icon: 'bi-lightning-charge-fill',
                        color: '#FF8F00',
                        details: [
                            { label: 'Capacidad', value: `${(properties.Capacidad_operacion_MW || properties.Capacidad_autorizada_MW || 0).toLocaleString('es-MX')} MW` },
                            { label: 'Generación Anual', value: `${(properties.Generación_estimada_anual || 0).toLocaleString('es-MX')} GWh` },
                            { label: 'Ubicación', value: properties.Ubicación || properties.Estado || 'N/D' },
                            { label: 'Municipio', value: properties.MPO_ID || properties.Municipio || 'N/D' },
                            { label: 'Estatus', value: properties.Estatus_instalacion || properties.Estatus || 'N/D' },
                            { label: 'Combustible', value: properties.Combustible_autorizado_1 || properties.Energetico_primario || 'N/D' },
                            { label: 'Inicio Operaciones', value: properties.Fecha_de_Entrada_en_Operación || properties.Inicio_operaciones || 'N/D' },
                            { label: 'Modalidad', value: properties.Modalidad || 'N/D' },
                            { label: 'Permiso', value: properties.NumeroPermiso || 'N/D' }
                        ]
                    });

                    const id = properties.NumeroPermiso || properties.Razón_social;
                    console.log('🔗 [SeguimientoProyectos] Generando enlace para central:', id); // Debug Log
                    const btnHtml = `
                        <div style="margin-top: 12px; text-align: center; border-top: 1px solid #eee; padding-top: 8px;">
                            <button onclick="window.open('detalle-central.html?permiso=${encodeURIComponent(id)}', '_blank')"
                               style="display: inline-flex; align-items: center; gap: 6px; border: none; padding: 8px 16px; background-color: #FF8F00; color: white; text-decoration: none; border-radius: 20px; font-size: 13px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer;">
                                <i class="bi bi-eye-fill"></i> Ver Detalle Completo
                            </button>
                        </div>
                    `;

                    // Inyectar botón al final
                    return content + btnHtml;
                }
            },
            {
                url: 'https://cdn.sassoapps.com/Mapas/Electricidad/gerenciasdecontrol.geojson',
                type: 'gerencias',
                name: 'Gerencias de Control',
                category: 'domain',
                style: (feature) => {
                    const props = feature.properties || {};
                    const name = (props.Name || props.name || props.NOMBRE || 'Default').toLowerCase();

                    let color = GERENCIA_COLORS['default'];
                    const keys = Object.keys(GERENCIA_COLORS);

                    for (const key of keys) {
                        if (name.includes(key)) {
                            color = GERENCIA_COLORS[key];
                            break;
                        }
                    }

                    return {
                        fillColor: color,
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.4,
                        pane: 'gerenciasPane'
                    };
                },
                popup: (properties) => createStandardPopup({
                    title: properties.Name || properties.name || properties.NOMBRE || 'Gerencia Regional',
                    subtitle: 'Gerencia de Control Regional',
                    icon: 'bi-buildings-fill',
                    color: '#1565C0', // Blue 800
                    details: [
                        { label: 'Código', value: properties.GCR || properties.id || 'N/A' }
                    ]
                })
            },
            {
                url: 'https://cdn.sassoapps.com/geojson/L%C3%ADneas_de_Transmisi%C3%B3n.geojson',
                type: 'lineas',
                name: 'Líneas de Transmisión',
                category: 'domain',
                style: {
                    color: '#424242', // Grey 800
                    weight: 2.5,
                    opacity: 0.85,
                    pane: 'municipalitiesPane'
                },
                popup: (properties) => createStandardPopup({
                    title: properties.nombre_lt || 'Línea de Transmisión',
                    subtitle: `${properties.tension_kv || '?'} kV`,
                    icon: 'bi-bezier2',
                    color: '#424242',
                    details: [
                        { label: 'Longitud', value: `${properties.longi_km || 'N/A'} km` },
                        { label: 'Características', value: properties.caracteri || 'N/A' }
                    ]
                })
            },
            {
                url: 'https://cdn.sassoapps.com/geojson/Subestaciones_El%C3%A9ctricas.geojson',
                type: 'subestaciones',
                name: 'Subestaciones',
                category: 'domain',
                style: {
                    radius: 4,
                    fillColor: '#78909C', // Blue Grey 400
                    color: '#263238', // Blue Grey 900
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.85,
                    pane: 'electricityMarkersPane' // Z-Index 650
                },
                popup: (properties) => createStandardPopup({
                    title: properties.nom_geo !== 'N/D' ? properties.nom_geo : 'Subestación Eléctrica',
                    subtitle: properties.condicion || 'Condición no especificada',
                    icon: 'bi-grid-fill',
                    color: '#455A64', // Blue Grey 700
                    details: [
                        { label: 'Código', value: properties.codigo || 'N/A' },
                        { label: 'Clase', value: properties.clase_geo || 'N/A' },
                        { label: 'Nombre Objeto', value: properties.nom_obj || 'N/A' }
                    ]
                })
            },
            {
                url: 'https://cdn.sassoapps.com/Gabvy/ramsar.geojson',
                type: 'ramsar',
                name: 'Sitios Ramsar',
                category: 'analysis',
                style: {
                    fillColor: '#00ACC1', // Cyan 600
                    color: '#006064',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.5
                },
                popup: (properties) => createStandardPopup({
                    title: properties.NOMBRE || properties.Name || 'Sitio Ramsar',
                    subtitle: 'Humedal de Importancia Internacional',
                    icon: 'bi-water',
                    color: '#00838F',
                    details: [
                        { label: 'Estado', value: properties.ESTADO || properties.estado || 'N/A' },
                        { label: 'Municipios', value: properties.MUNICIPIOS || 'N/A' }
                    ]
                })
            },
            {
                url: 'https://cdn.sassoapps.com/Mapas/ANP2025.geojson',
                type: 'anp',
                name: 'Áreas Naturales Protegidas',
                category: 'analysis',
                style: {
                    fillColor: '#66BB6A', // Green 400
                    color: '#1B5E20',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.5
                },
                popup: (properties) => createStandardPopup({
                    title: properties.NOMBRE || properties.Name || 'ANP',
                    subtitle: properties.CAT_DEC || properties.categoria || 'Categoría N/D',
                    icon: 'bi-tree-fill',
                    color: '#2E7D32',
                    details: [
                        { label: 'Estado', value: properties.ESTADOS || properties.estados || 'N/A' },
                        { label: 'Superficie', value: properties.SUPERFICIE ? `${Number(properties.SUPERFICIE).toLocaleString()} ha` : 'N/A' }
                    ]
                })
            },
            {
                url: 'https://cdn.sassoapps.com/Mapas/areas_destinadas_voluntariamentea_la_conservaci%C3%B3n.geojson',
                type: 'advc',
                name: 'ADVC',
                category: 'analysis',
                style: {
                    fillColor: '#9CCC65', // Light Green 400
                    color: '#33691E',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.5
                },
                popup: (properties) => createStandardPopup({
                    title: properties.NOMBRE || properties.Name || 'ADVC',
                    subtitle: 'Área Destinada Voluntariamente a la Conservación',
                    icon: 'bi-flower1',
                    color: '#558B2F',
                    details: [
                        { label: 'Estado', value: properties.ESTADO || 'N/A' },
                        { label: 'Municipio', value: properties.MUNICIPIO || 'N/A' }
                    ]
                })
            },
            {
                type: 'nuevos_proyectos',
                name: 'Seguimiento de Nuevos Proyectos (Google Sheets)',
                category: 'domain', // domain para que se cargue de inmediato al seleccionar el mapa
                customLoader: async function (layerOptions) {
                    console.log("Iniciando customLoader para Seguimiento de Nuevos Proyectos...");
                    const API_URL = 'https://script.google.com/macros/s/AKfycbw3heMgQJWmvUW3prcamUEQn07sldIBGZTH5WVG8Pu2t-a0mwdmfSyD27jR4fj9Ws-0yg/exec';

                    let clusterGroup = L.markerClusterGroup({
                        maxClusterRadius: 40,
                        spiderfyOnMaxZoom: true,
                        showCoverageOnHover: false,
                        zoomToBoundsOnClick: true,
                        clusterPane: 'electricityMarkersPane',
                        iconCreateFunction: function (cluster) {
                            return L.divIcon({
                                html: `<div style="background-color: #0D47A1; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);">${cluster.getChildCount()}</div>`,
                                className: 'custom-cluster-icon',
                                iconSize: L.point(30, 30)
                            });
                        }
                    });

                    try {
                        const response = await fetch(API_URL);
                        const result = await response.json();

                        if (result.status !== 'success' || !result.data) {
                            throw new Error('Respuesta del servidor indicó fallo o data nula.');
                        }

                        let marcadores = [];

                        // Cargar Generacion
                        if (result.data['BBDD.GEN'] && result.data['BBDD.GEN'].length > 1) {
                            const rawData = result.data['BBDD.GEN'];
                            const headerMapping = rawData[0];
                            const filasDatos = rawData.slice(1);

                            filasDatos.forEach(row => {
                                let obj = {};
                                for (let key in row) {
                                    if (key.startsWith('Columna_') && headerMapping[key] !== undefined) {
                                        obj[headerMapping[key].toString().trim()] = row[key];
                                    }
                                }

                                if (obj.Latitud && obj.Longitud) {
                                    let lat = parseFloat(obj.Latitud.toString().replace(/°/g, '').trim());
                                    let lng = parseFloat(obj.Longitud.toString().replace(/°/g, '').trim());

                                    if (!isNaN(lat) && !isNaN(lng)) {
                                        const uniqueIdGen = obj['Nombre del proyecto'] || obj['Nombre de la obra'] || '';
                                        const btnHtmlGen = uniqueIdGen ? `
                                            <div style="margin-top: 12px; text-align: center; border-top: 1px solid #eee; padding-top: 8px;">
                                                <button onclick="window.open('detalle-nuevo-proyecto.html?permiso=${encodeURIComponent(uniqueIdGen)}', '_blank')"
                                                   style="display: inline-flex; align-items: center; gap: 6px; border: none; padding: 8px 16px; background-color: #FF8F00; color: white; text-decoration: none; border-radius: 20px; font-size: 13px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer;">
                                                    <i class="bi bi-eye-fill"></i> Ver Detalle Completo
                                                </button>
                                            </div>` : '';

                                        const popupContent = window.createStandardPopup({
                                            title: obj['Nombre del proyecto'] || 'Generación',
                                            subtitle: obj['Tecnología'] || 'N/D',
                                            icon: 'bi-lightning-fill',
                                            color: '#0D47A1',
                                            details: [
                                                { label: 'Capacidad', value: `${obj['Capacidad'] || '?'} MW` },
                                                { label: 'Empresa', value: `${obj['Empresa'] || 'N/D'}` }
                                            ]
                                        });

                                        const m = L.circleMarker([lat, lng], { radius: 8, color: '#0D47A1', fillColor: '#2196F3', fillOpacity: 0.9, weight: 2, pane: 'electricityMarkersPane' })
                                            .bindPopup(popupContent + btnHtmlGen);
                                        marcadores.push(m);
                                    }
                                }
                            });
                        }

                        // Cargar Transmision
                        if (result.data['BBDD.TRA'] && result.data['BBDD.TRA'].length > 1) {
                            const rawData = result.data['BBDD.TRA'];
                            const headerMapping = rawData[0];
                            const filasDatos = rawData.slice(1);

                            filasDatos.forEach(row => {
                                let obj = {};
                                for (let key in row) {
                                    if (key.startsWith('Columna_') && headerMapping[key] !== undefined) {
                                        obj[headerMapping[key].toString().trim()] = row[key];
                                    }
                                }

                                if (obj.Latitud && obj.Longitud && obj.Latitud.toString().trim() !== '' && obj.Longitud.toString().trim() !== '') {
                                    let lat = parseFloat(obj.Latitud.toString().replace(/°/g, '').trim());
                                    let lng = parseFloat(obj.Longitud.toString().replace(/°/g, '').trim());

                                    if (!isNaN(lat) && !isNaN(lng)) {
                                        const customIcon = L.divIcon({
                                            className: 'custom-tx-marker',
                                            html: '<div style="background-color: #7B1FA2; width: 14px; height: 14px; border: 2px solid #fff; border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.5);"></div>',
                                            iconSize: [18, 18],
                                            iconAnchor: [9, 9]
                                        });

                                        const uniqueIdTx = obj['Nombre del proyecto'] || obj['Nombre de la obra'] || '';
                                        const btnHtmlTx = uniqueIdTx ? `
                                            <div style="margin-top: 12px; text-align: center; border-top: 1px solid #eee; padding-top: 8px;">
                                                <button onclick="window.open('detalle-nuevo-proyecto.html?permiso=${encodeURIComponent(uniqueIdTx)}', '_blank')"
                                                   style="display: inline-flex; align-items: center; gap: 6px; border: none; padding: 8px 16px; background-color: #FF8F00; color: white; text-decoration: none; border-radius: 20px; font-size: 13px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer;">
                                                    <i class="bi bi-eye-fill"></i> Ver Detalle Completo
                                                </button>
                                            </div>` : '';

                                        const popupContentTx = window.createStandardPopup({
                                            title: obj['Nombre del proyecto'] || 'Transmisión',
                                            subtitle: `Tensión: ${obj['Tensión ( kV)'] || '?'} kV`,
                                            icon: 'bi-bezier',
                                            color: '#7B1FA2',
                                            details: []
                                        });

                                        const m = L.marker([lat, lng], { icon: customIcon, pane: 'electricityMarkersPane' })
                                            .bindPopup(popupContentTx + btnHtmlTx);
                                        marcadores.push(m);
                                    }
                                }
                            });
                        }

                        clusterGroup.addLayers(marcadores);

                        // Guardar la referencia global en mapa para luego (para limpieza, etc)
                        if (window.map) {
                            window.map._nuevosProyectosCluster = clusterGroup;
                        }

                        // Mostrar el Tablero Sidebar (está mapeado al ID de Iframe en main map)
                        const toggleBtn = document.getElementById('sidebar-toggle-btn');
                        const iframe = document.getElementById('proyectos-sidebar-iframe');
                        if (toggleBtn) {
                            toggleBtn.classList.add('visible');
                            if (iframe) iframe.classList.remove('hidden-sidebar');
                        }

                        return clusterGroup; // Retornamos para que AddOverlay lo reciba e inyecte
                    } catch (e) {
                        console.error("Error cargando Google Sheets:", e);
                        throw e;
                    }
                }
            }
        ],
        center: [23.6345, -102.5528], // Centro de México
        zoom: 5,
        minZoom: 4,
        maxZoom: 18
    }
];

// Hacer disponible globalmente
window.SEGUIMIENTO_PROYECTOS_MAPS = SEGUIMIENTO_PROYECTOS_MAPS;

// Lógica de Toggle y Recepción de Mensajes (iframe)
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const iframe = document.getElementById('proyectos-sidebar-iframe');

    if (toggleBtn && iframe) {
        // Toggle Manual
        toggleBtn.addEventListener('click', () => {
            iframe.classList.toggle('hidden-sidebar');
        });

        // Ocultar botón por defecto si cambia el Select de Mapa Principal (por si se agrega otro en el futuro)
        document.getElementById('map-select')?.addEventListener('change', (e) => {
            const val = e.target.options[e.target.selectedIndex].text;
            if (!val.includes('Infraestructura Eléctrica')) {
                toggleBtn.classList.remove('visible');
                iframe.classList.add('hidden-sidebar');

                // Limpiar CustomLayers si cambian el instrumento
                if (window.map && window.map._nuevosProyectosCluster) {
                    window.map.removeLayer(window.map._nuevosProyectosCluster);
                    window.map._nuevosProyectosCluster = null;
                }
            } else {
                toggleBtn.classList.add('visible');
                iframe.classList.remove('hidden-sidebar');
            }
        });
    }

    // Escuchar mensajes desde el Iframe
    window.addEventListener('message', function (event) {
        if (event.data) {
            if (event.data.action === 'flyToProject' && window.map) {
                const lat = parseFloat(event.data.lat);
                const lng = parseFloat(event.data.lng);
                if (!isNaN(lat) && !isNaN(lng)) {
                    // Volar al punto en el mapa princpal
                    window.map.flyTo([lat, lng], 14, {
                        animate: true,
                        duration: 1.5
                    });

                    // En móviles, cerramos el sidebar para que dejen ver el mapa (responsive hack)
                    if (window.innerWidth < 768 && iframe) {
                        iframe.classList.add('hidden-sidebar');
                    }
                }
            } else if (event.data.action === 'closeSidebar' && iframe) {
                iframe.classList.add('hidden-sidebar');
            }
        }
    });
});
