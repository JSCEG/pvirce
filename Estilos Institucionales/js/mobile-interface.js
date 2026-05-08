/**
 * Mobile Interface Controller
 * Maneja la interfaz estilo Google Maps para dispositivos móviles
 */

class MobileInterface {
    constructor() {
        // Forzar interfaz móvil en todas las pantallas
        this.isMobile = true;
        this.bottomSheet = null;
        this.sideDrawer = null;
        this.searchModal = null;
        this.drawerOverlay = null;
        this.isBottomSheetExpanded = false;
        this.touchStartY = 0;
        this.currentBottomSheetY = 0;
        this.isAnalysisActive = false;

        this.init();
    }

    init() {
        this.createMobileElements();
        this.attachEventListeners();
        this.setupTouchHandlers();
    }

    attachEventListeners() {
        // Este método se puede usar para event listeners globales si es necesario
        // Por ahora, los event listeners se agregan en cada método create*

        const checkMap = setInterval(() => {
            if (window.map && window.map.on) {
                clearInterval(checkMap);
                window.map.on('click', () => {
                    if (this.isBottomSheetExpanded) {
                        this.collapseBottomSheet();
                    }
                });
            }
        }, 500);
    }

    createMobileElements() {






        // Crear botón de capas (bottom-left)
        this.createLayersButton();



        // Crear bottom sheet
        this.createBottomSheet();

        // Configurar manejadores de zoom
        this.setupZoomHandlers();




    }











    createLayersButton() {
        // Botón de menú principal
        const btn = document.createElement('button');
        btn.className = 'mobile-menu-toggle-btn';
        btn.innerHTML = `
            <i class="bi bi-list"></i>
            <span>Menú</span>
        `;
        btn.setAttribute('aria-label', 'Menú principal');
        document.body.appendChild(btn);

        // Crear menú flotante
        const menu = document.createElement('div');
        menu.className = 'mobile-floating-menu';
        menu.innerHTML = `
            <button class="mobile-floating-menu-item" data-action="tablero">
                <i class="bi bi-layout-sidebar-reverse"></i>
                <span>Tablero</span>
            </button>
            <button class="mobile-floating-menu-item" data-tab="layers">
                <i class="bi bi-layers"></i>
                <span>Capas</span>
            </button>
            <button class="mobile-floating-menu-item" data-tab="info">
                <i class="bi bi-info-circle"></i>
                <span>Información</span>
            </button>
            <div style="height: 1px; background: #eee; margin: 0.5rem 0;"></div>
            <button class="mobile-floating-menu-item" data-action="search">
                <i class="bi bi-search"></i>
                <span>Buscar</span>
            </button>
            <button class="mobile-floating-menu-item" data-action="refresh">
                <i class="bi bi-arrow-clockwise"></i>
                <span>Actualizar datos</span>
            </button>
            <button class="mobile-floating-menu-item" data-action="export-word">
                <i class="bi bi-file-word"></i>
                <span>Exportar Word</span>
            </button>
            <button class="mobile-floating-menu-item" data-action="export-png">
                <i class="bi bi-download"></i>
                <span>Exportar PNG</span>
            </button>
            <div style="height: 1px; background: #eee; margin: 0.5rem 0;"></div>
            <button class="mobile-floating-menu-item" data-tab="proyectos">
                <i class="bi bi-bar-chart-fill"></i>
                <span>Estadísticas</span>
            </button>
            <button class="mobile-floating-menu-item" data-tab="about">
                <i class="bi bi-info-square"></i>
                <span>Acerca de</span>
            </button>
        `;
        document.body.appendChild(menu);

        const layersFab = document.createElement('button');
        layersFab.className = 'mobile-layers-fab';
        layersFab.innerHTML = `<i class="bi bi-layers"></i>`;
        layersFab.setAttribute('aria-label', 'Capas del mapa');
        document.body.appendChild(layersFab);

        const layersPanel = document.createElement('div');
        layersPanel.className = 'mobile-layers-panel hidden';
        layersPanel.innerHTML = `
            <div class="mobile-layers-panel-header">
                <div class="mobile-layers-panel-title">
                    <i class="bi bi-layers" style="margin-right: 8px;"></i> Capas
                </div>
                <button class="mobile-layers-panel-close"><i class="bi bi-x"></i></button>
            </div>
            <div id="mobile-floating-layers-panel-content" class="mobile-layers-panel-content">
                <p style="color:#666; padding: 0.5rem 0;">No hay capas disponibles.</p>
            </div>
        `;
        document.body.appendChild(layersPanel);

        const closeLayersPanel = () => {
            layersPanel.classList.add('hidden');
        };
        const toggleLayersPanel = () => {
            layersPanel.classList.toggle('hidden');
        };

        layersFab.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLayersPanel();
        });
        layersPanel.querySelector('.mobile-layers-panel-close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeLayersPanel();
        });
        document.addEventListener('click', (e) => {
            if (!layersPanel.classList.contains('hidden')) {
                if (!layersPanel.contains(e.target) && !layersFab.contains(e.target)) {
                    closeLayersPanel();
                }
            }
        });

        // Toggle menú flotante
        btn.addEventListener('click', () => {
            const isMenuActive = menu.classList.contains('active');
            if (isMenuActive) {
                menu.classList.remove('active');
            } else {
                menu.classList.add('active');
            }
        });

        // Manejar selección de opciones del menú
        menu.querySelectorAll('.mobile-floating-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const tabName = item.getAttribute('data-tab');
                const action = item.getAttribute('data-action');

                // Ocultar menú
                menu.classList.remove('active');

                if (tabName) {
                    // Expandir bottom sheet y cambiar al tab seleccionado
                    this.bottomSheet.classList.add('active');
                    this.expandBottomSheet();
                    this.switchBottomSheetTab(tabName);
                } else if (action) {
                    this.handleMenuAction(action);
                }
            });
        });
    }



    createBottomSheet() {
        const sheet = document.createElement('div');
        sheet.className = 'mobile-bottom-sheet collapsed';
        sheet.innerHTML = `
            <div class="bottom-sheet-handle"></div>
            <div class="bottom-sheet-header">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 class="bottom-sheet-title">Controles del Mapa</h3>
                        <p class="bottom-sheet-subtitle">Desliza para ver más opciones</p>
                    </div>
                    <button class="bottom-sheet-close-btn" style="background: none; border: none; font-size: 24px; color: #666; cursor: pointer; padding: 0.5rem;">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>
            <div class="bottom-sheet-tabs">
                <button class="bottom-sheet-tab active" data-tab="proyectos">Proyectos</button>
                <button class="bottom-sheet-tab" data-tab="layers">Capas</button>
                <button class="bottom-sheet-tab" data-tab="info">Información</button>
                <button class="bottom-sheet-tab" data-tab="about">Acerca de</button>
            </div>
            <div class="bottom-sheet-content">
                <!-- Tab: Proyectos -->
                <div class="bottom-sheet-tab-content" data-content="proyectos">
                    <div id="mobile-proyectos-stats" style="padding: 1rem;">
                        <div style="text-align: center; color: #999; padding: 2rem 1rem;">
                            <i class="bi bi-hourglass-split" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;"></i>
                            <span style="font-size: 0.9rem;">Cargando estadísticas...</span>
                        </div>
                    </div>
                    <div style="padding: 0 1rem 1.25rem;">
                        <button onclick="document.getElementById('sidebar-toggle-btn')?.click(); window.mobileInterface?.collapseBottomSheet();"
                                style="width: 100%; padding: 0.75rem; background: var(--color-gobmx-guinda); color: white; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            <i class="bi bi-layout-sidebar-reverse"></i> Ver Tablero de Proyectos
                        </button>
                    </div>
                </div>
                
                <!-- Tab: Capas -->
                <div class="bottom-sheet-tab-content" data-content="layers" style="display: none;">
                    <div id="mobile-layers-container">
                        <p style="color: #666; padding: 1rem;">Selecciona un mapa para ver las capas disponibles.</p>
                    </div>
                </div>
                
                <!-- Tab: Información -->
                <div class="bottom-sheet-tab-content" data-content="info" style="display: none;">
                    <div id="mobile-map-info">
                        <div id="mobile-map-description" style="padding: 1rem;">
                            <h4 id="mobile-map-description-title" style="margin: 0 0 0.5rem 0; color: var(--color-gobmx-verde);"></h4>
                            <p id="mobile-map-description-content" style="margin: 0; color: #666; line-height: 1.6;"></p>
                        </div>
                        <div id="mobile-analysis-data" style="padding: 1rem; border-top: 1px solid #eee; display: none;">
                            <h4 style="margin: 0 0 1rem 0; color: var(--color-gobmx-verde);">Datos de Análisis</h4>
                            <div id="mobile-analysis-content"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Tab: Acerca de -->
                <div class="bottom-sheet-tab-content" data-content="about" style="display: none;">
                    <div style="padding: 1.5rem; text-align: center;">
                        <div style="display: flex; justify-content: center; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                            <img src="img/logo_sener.png" alt="SENER" style="height: 60px;">
                            <img src="img/snien.png" alt="SNIEn" style="height: 50px;">
                        </div>
                        <h3 style="margin: 0 0 0.5rem 0; color: var(--color-gobmx-verde); font-size: 1.1rem;">Seguimiento de Nuevos Proyectos de Energía</h3>
                        <p style="margin: 0 0 1rem 0; color: #666; font-size: 0.9rem;">Subsecretaría de Planeación y Transición Energética · SNIEn</p>
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem; text-align: left;">
                            <p style="margin: 0 0 0.5rem 0; font-size: 0.85rem; color: #666;">
                                <strong>Capas disponibles:</strong><br>
                                Centrales Eléctricas · Gerencias de Control · Líneas de Transmisión · Subestaciones · ANP · Ramsar · ADVC
                            </p>
                        </div>
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 0.75rem; text-align: left;">
                            <p style="margin: 0; font-size: 0.85rem; color: #666;">
                                <strong>Fuente de datos:</strong><br>
                                Google Sheets institucional (BBDD.GEN y BBDD.TRA) · Capas GeoJSON institucionales
                            </p>
                        </div>
                        <div id="mobile-last-updated" style="margin-top: 1rem; padding: 0.75rem; background: #e8f5e9; border-radius: 8px;">
                            <p style="margin: 0; font-size: 0.85rem; color: #2e7d32;">
                                <i class="bi bi-clock"></i> <strong>Última actualización:</strong> <span id="mobile-update-time">--</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(sheet);
        this.bottomSheet = sheet;

        // Cargar estadísticas del tab Proyectos
        this.loadProyectosStats();

        // Sincronizar información del mapa
        this.syncMapInfo();

        // Sincronizar capas
        this.syncLayers();
    }





    setupTouchHandlers() {
        if (!this.bottomSheet) return;

        const handle = this.bottomSheet.querySelector('.bottom-sheet-handle');
        const header = this.bottomSheet.querySelector('.bottom-sheet-header');
        const closeBtn = this.bottomSheet.querySelector('.bottom-sheet-close-btn');

        // Event listener para el botón de cerrar
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.collapseBottomSheet();
            });
        }

        [handle, header].forEach(element => {
            element.addEventListener('touchstart', (e) => {
                this.touchStartY = e.touches[0].clientY;
                this.currentBottomSheetY = this.bottomSheet.getBoundingClientRect().top;
            });

            element.addEventListener('touchmove', (e) => {
                const touchY = e.touches[0].clientY;
                const deltaY = touchY - this.touchStartY;

                // Solo permitir arrastrar hacia abajo si está expandido
                // o hacia arriba si está colapsado
                if ((this.isBottomSheetExpanded && deltaY > 0) ||
                    (!this.isBottomSheetExpanded && deltaY < 0)) {
                    const newY = this.currentBottomSheetY + deltaY;
                    this.bottomSheet.style.transform = `translateY(${newY}px)`;
                }
            });

            element.addEventListener('touchend', (e) => {
                const touchY = e.changedTouches[0].clientY;
                const deltaY = touchY - this.touchStartY;

                // Si se arrastró más de 50px, cambiar estado
                if (Math.abs(deltaY) > 50) {
                    if (deltaY > 0) {
                        this.collapseBottomSheet();
                    } else {
                        this.expandBottomSheet();
                    }
                } else {
                    // Volver al estado anterior
                    if (this.isBottomSheetExpanded) {
                        this.expandBottomSheet();
                    } else {
                        this.collapseBottomSheet();
                    }
                }

                this.bottomSheet.style.transform = '';
            });
        });

        // Tabs del bottom sheet
        this.bottomSheet.querySelectorAll('.bottom-sheet-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchBottomSheetTab(tabName);
            });
        });
    }

    loadProyectosStats() {
        const statsContainer = document.getElementById('mobile-proyectos-stats');
        if (!statsContainer) return;

        const GAS_URL = 'https://script.google.com/macros/s/AKfycbw3heMgQJWmvUW3prcamUEQn07sldIBGZTH5WVG8Pu2t-a0mwdmfSyD27jR4fj9Ws-0yg/exec';

        fetch(GAS_URL)
            .then(r => r.json())
            .then(result => {
                if (result.status !== 'success' || !result.data) throw new Error('API error');

                const parseSheet = (rawData) => {
                    if (!rawData || rawData.length < 2) return [];
                    const headerMapping = rawData[0];
                    return rawData.slice(1).map(row => {
                        let obj = {};
                        for (let key in row) {
                            if (key.startsWith('Columna_') && headerMapping[key]) {
                                obj[headerMapping[key].toString().trim()] = row[key] || '';
                            }
                        }
                        return obj;
                    });
                };

                const genData = parseSheet(result.data['BBDD.GEN']);
                const traData = parseSheet(result.data['BBDD.TRA']);

                const countByStatus = (data) => {
                    const counts = {};
                    data.forEach(item => {
                        const s = (item['Etapa del proyecto'] || item['Estado'] || 'Sin estado').trim();
                        counts[s] = (counts[s] || 0) + 1;
                    });
                    return counts;
                };

                const renderStats = (stats, color) => {
                    const entries = Object.entries(stats).sort((a, b) => b[1] - a[1]);
                    if (entries.length === 0) return '<p style="color:#999; font-size:0.85rem;">Sin datos</p>';
                    return entries.map(([label, count]) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.45rem 0; border-bottom: 1px solid #f0f0f0;">
                            <span style="font-size: 0.8rem; color: #555; flex: 1; padding-right: 0.5rem;">${label}</span>
                            <span style="font-size: 0.82rem; font-weight: 700; color: ${color}; background: ${color}18; padding: 0.15rem 0.55rem; border-radius: 12px; white-space: nowrap;">${count}</span>
                        </div>
                    `).join('');
                };

                statsContainer.innerHTML = `
                    <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem;">
                        <div style="flex: 1; background: #0D47A112; border: 2px solid #0D47A1; border-radius: 10px; padding: 0.85rem; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 800; color: #0D47A1; line-height: 1;">${genData.length}</div>
                            <div style="font-size: 0.7rem; color: #0D47A1; font-weight: 700; margin-top: 0.3rem; text-transform: uppercase; letter-spacing: 0.05em;">Generación</div>
                        </div>
                        <div style="flex: 1; background: #7B1FA212; border: 2px solid #7B1FA2; border-radius: 10px; padding: 0.85rem; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 800; color: #7B1FA2; line-height: 1;">${traData.length}</div>
                            <div style="font-size: 0.7rem; color: #7B1FA2; font-weight: 700; margin-top: 0.3rem; text-transform: uppercase; letter-spacing: 0.05em;">Transmisión</div>
                        </div>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <div style="font-size: 0.75rem; font-weight: 700; color: #0D47A1; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: 0.35rem;">
                            <i class="bi bi-lightning-fill"></i> Generación por etapa
                        </div>
                        ${renderStats(countByStatus(genData), '#0D47A1')}
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; font-weight: 700; color: #7B1FA2; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: 0.35rem;">
                            <i class="bi bi-bezier2"></i> Transmisión por etapa
                        </div>
                        ${renderStats(countByStatus(traData), '#7B1FA2')}
                    </div>
                `;
            })
            .catch(() => {
                statsContainer.innerHTML = `
                    <div style="text-align: center; color: #999; padding: 2rem 1rem;">
                        <i class="bi bi-wifi-off" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;"></i>
                        <span style="font-size: 0.9rem;">No se pudieron cargar las estadísticas</span>
                    </div>
                `;
            });
    }

    _reloadNuevosProyectos() {
        const map = window.map;
        if (!map) return;

        // Eliminar cluster existente del mapa
        if (map._nuevosProyectosCluster) {
            map.removeLayer(map._nuevosProyectosCluster);
            map._nuevosProyectosCluster = null;
        }

        // Relanzar el customLoader de la capa nuevos_proyectos
        const mapConfig = window.SEGUIMIENTO_PROYECTOS_MAPS && window.SEGUIMIENTO_PROYECTOS_MAPS[0];
        if (!mapConfig) { console.warn('SEGUIMIENTO_PROYECTOS_MAPS no disponible'); return; }

        const layerDef = mapConfig.additionalLayers && mapConfig.additionalLayers.find(l => l.type === 'nuevos_proyectos');
        if (!layerDef || !layerDef.customLoader) { console.warn('customLoader no encontrado'); return; }

        layerDef.customLoader({}).then(clusterGroup => {
            if (clusterGroup) {
                map.addLayer(clusterGroup);
                map._nuevosProyectosCluster = clusterGroup;
            }
            // Recargar también las estadísticas del tab
            this.loadProyectosStats();
        }).catch(err => {
            console.error('Error recargando capa de nuevos proyectos:', err);
        });
    }

    searchProyecto(term) {
        // Reenviar búsqueda al tablero sidebar via postMessage
        const iframe = document.getElementById('proyectos-sidebar-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ action: 'focusSearch', term: term || '' }, '*');
        }
        // Mostrar tablero si está oculto
        const toggleBtn = document.getElementById('sidebar-toggle-btn');
        const iframeEl = document.getElementById('proyectos-sidebar-iframe');
        if (iframeEl && iframeEl.classList.contains('hidden-sidebar') && toggleBtn) {
            toggleBtn.click();
        }
        this.collapseBottomSheet();
    }

    _legacySearchPresaById(id) {
        // Método legado - ya no se usa en este proyecto
        if (window.presasDataLayers) {
            let found = false;
            window.presasDataLayers.eachLayer(layer => {
                if (found) return;
                if (layer.feature && layer.feature.properties) {
                    const props = layer.feature.properties;
                    if (props.id == id || props.no == id || props.NO == id) {
                        window.map.setView(layer.getLatLng(), 14);
                        layer.fire('click');
                        found = true;
                        document.activeElement.blur();
                        this.collapseBottomSheet();
                    }
                }
            });

            if (!found) {
                console.log('Presa con ID ' + id + ' no encontrada en las capas cargadas.');
            }
        }
    }

    expandBottomSheet() {
        this.bottomSheet.classList.remove('collapsed');
        this.bottomSheet.classList.add('expanded');
        this.bottomSheet.classList.add('active'); // Necesario para que sea visible según CSS
        this.isBottomSheetExpanded = true;

        // Ocultar botón de menú
        const menuBtn = document.querySelector('.mobile-menu-toggle-btn');
        if (menuBtn) menuBtn.classList.add('hidden');
    }

    collapseBottomSheet() {
        this.bottomSheet.classList.remove('expanded');
        this.bottomSheet.classList.remove('active'); // Ocultar completamente
        this.bottomSheet.classList.add('collapsed');
        this.isBottomSheetExpanded = false;

        // Mostrar botón de menú
        const menuBtn = document.querySelector('.mobile-menu-toggle-btn');
        if (menuBtn) menuBtn.classList.remove('hidden');
    }

    toggleBottomSheet() {
        if (this.isBottomSheetExpanded) {
            this.collapseBottomSheet();
        } else {
            this.expandBottomSheet();
        }
    }

    switchBottomSheetTab(tabName) {
        // Expandir el Bottom Sheet si está colapsado
        if (!this.isBottomSheetExpanded) {
            this.expandBottomSheet();
        }

        // Actualizar tabs activos
        this.bottomSheet.querySelectorAll('.bottom-sheet-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Mostrar contenido correspondiente
        this.bottomSheet.querySelectorAll('.bottom-sheet-tab-content').forEach(content => {
            content.style.display = content.dataset.content === tabName ? 'block' : 'none';
        });
    }

    toggleSideDrawer() {
        this.sideDrawer.classList.toggle('open');
        this.drawerOverlay.classList.toggle('active');
    }

    closeSideDrawer() {
        this.sideDrawer.classList.remove('open');
        this.drawerOverlay.classList.remove('active');
    }



    handleSearch(query) {
        const resultsContainer = this.searchModal.querySelector('#mobile-search-results');

        if (query.length < 2) {
            resultsContainer.innerHTML = `
                <p style="text-align: center; color: #999; padding: 2rem;">
                    Escribe al menos 2 caracteres...
                </p>
            `;
            return;
        }

        // Aquí se integraría con la búsqueda existente
        // Por ahora, mostrar mensaje
        resultsContainer.innerHTML = `
            <p style="text-align: center; color: #999; padding: 2rem;">
                Buscando "${query}"...
            </p>
        `;

        // Trigger búsqueda en el sistema principal
        const mainSearchInput = document.getElementById('permit-search');
        if (mainSearchInput) {
            mainSearchInput.value = query;
            mainSearchInput.dispatchEvent(new Event('input'));
        }
    }

    handleDrawerAction(action) {
        this.closeSideDrawer();

        switch (action) {
            case 'refresh':
                document.getElementById('refresh-data')?.click();
                break;
            case 'export-png':
                document.getElementById('export-map-btn')?.click();
                break;
            case 'export-word':
                document.getElementById('export-word-btn')?.click();
                break;
            case 'fullscreen':
                document.getElementById('fullscreen-btn')?.click();
                break;
            case 'about':
                alert('Mapas Dinámicos de Presas\nSubsecretaría de Planeación y Transición Energética - SENER');
                break;
        }
    }

    toggleLayers() {
        // Simular click en el control de capas de Leaflet
        const layersControl = document.querySelector('.leaflet-control-layers-toggle');
        if (layersControl) {
            layersControl.click();
        }
    }

    addLegendToLayersTab(legendHtml) {
        // 1. Agregar al Bottom Sheet (Tab Capas)
        const layersContainer = this.bottomSheet.querySelector('#mobile-layers-container');
        if (layersContainer) {
            // Buscar si ya existe una leyenda y removerla
            const existingLegend = layersContainer.querySelector('.mobile-legend-container');
            if (existingLegend) {
                existingLegend.remove();
            }

            // Crear contenedor para la leyenda
            const legendContainer = document.createElement('div');
            legendContainer.className = 'mobile-legend-container';
            legendContainer.style.marginTop = '1rem';
            legendContainer.style.padding = '1rem';
            legendContainer.style.background = '#f8f9fa';
            legendContainer.style.borderRadius = '8px';
            legendContainer.style.border = '1px solid #eee';

            // Limpiar estilos inline que puedan venir del control original y ajustar para móvil
            let cleanHtml = legendHtml.replace(/width: 22px;/g, 'width: 18px;'); // Iconos más pequeños
            cleanHtml = cleanHtml.replace(/font-size: 13px;/g, 'font-size: 14px;'); // Títulos más legibles

            legendContainer.innerHTML = cleanHtml;

            // Agregar al contenedor de capas
            layersContainer.appendChild(legendContainer);
        }


    }

    exportMap() {
        document.getElementById('export-map-btn')?.click();
    }

    centerOnLocation() {
        // Aquí se implementaría la geolocalización
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                // Centrar mapa en la ubicación del usuario
                if (window.map) {
                    window.map.setView([position.coords.latitude, position.coords.longitude], 13);
                }
            }, (error) => {
                alert('No se pudo obtener tu ubicación');
            });
        } else {
            alert('Tu navegador no soporta geolocalización');
        }
    }

    syncMapInfo() {
        // Sincronizar información del mapa desde el desktop
        const observer = new MutationObserver(() => {
            // Si estamos mostrando análisis personalizado, no sincronizar para evitar sobrescribir
            if (this.isAnalysisActive) return;

            const desktopTitle = document.getElementById('map-description-title');
            const desktopContent = document.getElementById('map-description-content');
            const mobileTitle = document.getElementById('mobile-map-description-title');
            const mobileContent = document.getElementById('mobile-map-description-content');

            if (desktopTitle && mobileTitle) {
                mobileTitle.innerHTML = desktopTitle.innerHTML;
            }
            if (desktopContent && mobileContent) {
                // Usar innerHTML para preservar el formato HTML
                mobileContent.innerHTML = desktopContent.innerHTML;
            }
        });

        const mapDescription = document.getElementById('map-description');
        if (mapDescription) {
            observer.observe(mapDescription, { childList: true, subtree: true, characterData: true });
        }

        // Sincronizar última actualización
        const lastUpdated = document.getElementById('last-updated');
        const mobileUpdateTime = document.getElementById('mobile-update-time');
        if (lastUpdated && mobileUpdateTime) {
            const updateObserver = new MutationObserver(() => {
                mobileUpdateTime.textContent = lastUpdated.textContent;
            });
            updateObserver.observe(lastUpdated, { childList: true, characterData: true, subtree: true });
            mobileUpdateTime.textContent = lastUpdated.textContent;
        }
    }

    syncLayers() {
        // Sincronizar control de capas de Leaflet con el bottom sheet
        const checkLayers = () => {
            if (!window.map) {
                setTimeout(checkLayers, 500);
                return;
            }

            const layersContainer = document.getElementById('mobile-layers-container');
            if (!layersContainer) return;

            // Observar cambios en el control de capas de Leaflet
            const layersControl = document.querySelector('.leaflet-control-layers');
            if (layersControl) {
                const updateMobileLayers = () => {
                    const baseLayers = Array.from(layersControl.querySelectorAll('.leaflet-control-layers-base label'));
                    const overlays = Array.from(layersControl.querySelectorAll('.leaflet-control-layers-overlays label'));

                    const normalize = (s) => (s || '').toLowerCase().trim();
                    const inventory = (window.getLayerInventory && window.getLayerInventory()) || { basemaps: [], context: [], domain: [], analysis: [] };
                    const domainNames = new Set(inventory.domain.map(i => i.name));
                    const analysisNames = new Set(inventory.analysis.map(i => i.name));
                    const knownDomain = new Set(['centrales eléctricas', 'centrales electricas', 'gerencias de control', 'líneas de transmisión', 'lineas de transmisión', 'líneas de transmision', 'lineas de transmision', 'subestaciones']);
                    const knownAnalysis = new Set(['sitios ramsar', 'áreas naturales protegidas', 'areas naturales protegidas', 'advc']);

                    const overlayToHtml = (label) => {
                        const input = label.querySelector('input');
                        const text = label.querySelector('span').textContent.trim();
                        const checked = input.checked ? 'checked' : '';
                        const safeText = text.replace(/'/g, "\\'");
                        return `
                            <label style="display: flex; align-items: center; padding: 0.75rem 1rem; cursor: pointer; transition: background 0.2s;"
                                   onmouseover="this.style.background='#f5f5f5'" 
                                   onmouseout="this.style.background='transparent'">
                                <input type="checkbox" ${checked} 
                                       style="margin-right: 0.75rem; width: 18px; height: 18px; cursor: pointer;"
                                       onchange="window.toggleOverlayByName && window.toggleOverlayByName('${safeText}', this.checked)">
                                <span style="flex: 1; font-size: 0.9rem; color: #333;">${text}</span>
                            </label>
                        `;
                    };

                    let html = '';

                    if (baseLayers.length > 0) {
                        html += '<div style="margin-bottom: 1.5rem;"><h4 style="margin: 0 0 0.75rem 0; padding: 0 1rem; color: var(--color-gobmx-verde); font-size: 0.9rem;">Mapas Base</h4>';
                        baseLayers.forEach(label => {
                            const input = label.querySelector('input');
                            const text = label.querySelector('span').textContent.trim();
                            const checked = input.checked ? 'checked' : '';
                            html += `
                                <label style="display: flex; align-items: center; padding: 0.75rem 1rem; cursor: pointer; transition: background 0.2s;" 
                                       onmouseover="this.style.background='#f5f5f5'" 
                                       onmouseout="this.style.background='transparent'">
                                    <input type="radio" name="mobile-base-layer" value="${text}" ${checked} 
                                           style="margin-right: 0.75rem; width: 18px; height: 18px; cursor: pointer;"
                                           onchange="window.setBaseMapByName && window.setBaseMapByName('${text.replace(/'/g, "\\'")}')">
                                    <span style="flex: 1; font-size: 0.9rem; color: #333;">${text}</span>
                                </label>
                            `;
                        });
                        html += '</div>';
                    }

                    if (overlays.length) {
                        const domainHtml = overlays
                            .filter(label => {
                                const name = label.querySelector('span').textContent.trim();
                                const n = normalize(name);
                                return domainNames.has(name) || knownDomain.has(n);
                            })
                            .map(overlayToHtml)
                            .join('');
                        const analysisHtml = overlays
                            .filter(label => {
                                const name = label.querySelector('span').textContent.trim();
                                const n = normalize(name);
                                return analysisNames.has(name) || knownAnalysis.has(n);
                            })
                            .map(overlayToHtml)
                            .join('');
                        const othersHtml = overlays
                            .filter(label => {
                                const name = label.querySelector('span').textContent.trim();
                                const n = normalize(name);
                                const isDom = domainNames.has(name) || knownDomain.has(n);
                                const isAna = analysisNames.has(name) || knownAnalysis.has(n);
                                return !(isDom || isAna);
                            })
                            .map(overlayToHtml)
                            .join('');

                        if (domainHtml) {
                            html += '<div><h4 style="margin: 0 0 0.75rem 0; padding: 0 1rem; color: var(--color-gobmx-verde); font-size: 0.9rem;">Sistema Eléctrico Nacional</h4>';
                            html += domainHtml;
                            html += '</div>';
                        }
                        if (analysisHtml) {
                            html += '<div style="margin-top: 0.75rem;"><h4 style="margin: 0 0 0.75rem 0; padding: 0 1rem; color: var(--color-gobmx-verde); font-size: 0.9rem;">Impacto social</h4>';
                            html += analysisHtml;
                            html += '</div>';
                        }
                        if (othersHtml) {
                            html += '<div style="margin-top: 0.75rem;"><h4 style="margin: 0 0 0.75rem 0; padding: 0 1rem; color: var(--color-gobmx-verde); font-size: 0.9rem;">Otras capas</h4>';
                            html += othersHtml;
                            html += '</div>';
                        }
                    }

                    if (html === '') {
                        html = '<p style="color: #666; padding: 1rem;">No hay capas disponibles.</p>';
                    }

                    layersContainer.innerHTML = html;

                    const floatContainer = document.getElementById('mobile-floating-layers-panel-content');
                    if (floatContainer) {
                        floatContainer.innerHTML = html;
                    }
                };

                // Actualizar inicialmente
                updateMobileLayers();

                // Observar cambios
                const observer = new MutationObserver(updateMobileLayers);
                observer.observe(layersControl, { childList: true, subtree: true, attributes: true });
            }
        };

        checkLayers();
    }

    resetAnalysis() {
        this.isAnalysisActive = false;
    }

    showAnalysisInBottomSheet(analysisData) {
        const infoTab = document.querySelector('.bottom-sheet-tab-content[data-content="info"]');
        if (!infoTab) return;

        const { presaNombre, radioKm, totalLocalidades, poblacionTotal, hogaresIndigenas,
            poblacionAfro, sitiosRamsar, distanciaRioUsumacinta } = analysisData;

        let html = '<div style="padding: 0; font-family: Montserrat, sans-serif;">';
        html += '<div style="background: linear-gradient(135deg, #601623 0%, #8B1E3F 100%); padding: 15px; margin: 0 0 15px 0;">';
        html += '<h3 style="margin: 0; color: white; font-size: 14px; font-weight: 700;"><i class="bi bi-graph-up"></i> Análisis Espacial</h3>';
        html += '<p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.9); font-size: 12px;">' + presaNombre + ' • Radio: ' + radioKm + ' km</p>';
        html += '</div><div style="padding: 0 15px 15px 15px;">';

        if (totalLocalidades > 0) {
            html += '<div style="margin-bottom: 15px;"><h4 style="margin: 0 0 10px 0; color: #FFA726; font-size: 13px; font-weight: 700; border-bottom: 2px solid #FFA726; padding-bottom: 5px;"><i class="bi bi-people-fill"></i> Localidades Indígenas</h4>';
            html += '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
            html += '<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; color: #666;">Total Localidades:</td><td style="padding: 8px 0; text-align: right; font-weight: 700; color: #FFA726;">' + totalLocalidades + '</td></tr>';
            html += '<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; color: #666;">Población Total:</td><td style="padding: 8px 0; text-align: right; font-weight: 700; color: #FFA726;">' + poblacionTotal.toLocaleString('es-MX') + '</td></tr>';
            html += '<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; color: #666;">Hogares Indígenas:</td><td style="padding: 8px 0; text-align: right; font-weight: 700; color: #FFA726;">' + hogaresIndigenas.toLocaleString('es-MX') + '</td></tr>';
            if (poblacionAfro > 0) {
                html += '<tr><td style="padding: 8px 0; color: #666;">Población Afro:</td><td style="padding: 8px 0; text-align: right; font-weight: 700; color: #6A1B9A;">' + poblacionAfro.toLocaleString('es-MX') + '</td></tr>';
            }
            html += '</table></div>';
        }

        if (sitiosRamsar && sitiosRamsar.length > 0) {
            html += '<div style="margin-bottom: 15px;"><h4 style="margin: 0 0 10px 0; color: #4CAF50; font-size: 13px; font-weight: 700; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;"><i class="bi bi-tree-fill"></i> Sitios Ramsar (' + sitiosRamsar.length + ')</h4>';
            sitiosRamsar.forEach(ramsar => {
                const borderColor = ramsar.intersecta ? '#4CAF50' : '#FFA726';
                const distColor = ramsar.intersecta ? '#4CAF50' : '#FFA726';
                const distText = ramsar.intersecta ? 'DENTRO del sitio' : (ramsar.distancia / 1000).toFixed(2) + ' km';
                html += '<div style="background: #f5f5f5; padding: 10px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid ' + borderColor + ';">';
                html += '<div style="font-weight: 600; color: #333; font-size: 12px; margin-bottom: 4px;">' + ramsar.nombre + '</div>';
                html += '<table style="width: 100%; font-size: 11px;">';
                html += '<tr><td style="padding: 2px 0; color: #666;">Ubicación:</td><td style="padding: 2px 0; text-align: right; color: #333;">' + ramsar.estado + '</td></tr>';
                html += '<tr><td style="padding: 2px 0; color: #666;">Municipios:</td><td style="padding: 2px 0; text-align: right; color: #333;">' + ramsar.municipios + '</td></tr>';
                html += '<tr><td style="padding: 2px 0; color: #666;">Distancia:</td><td style="padding: 2px 0; text-align: right; font-weight: 600; color: ' + distColor + ';">' + distText + '</td></tr>';
                html += '</table></div>';
            });
            html += '</div>';
        }

        if (distanciaRioUsumacinta !== null) {
            html += '<div style="margin-bottom: 15px;"><h4 style="margin: 0 0 10px 0; color: #0288D1; font-size: 13px; font-weight: 700; border-bottom: 2px solid #0288D1; padding-bottom: 5px;"><i class="bi bi-water"></i> Río Usumacinta</h4>';
            html += '<table style="width: 100%; border-collapse: collapse; font-size: 12px;"><tr><td style="padding: 8px 0; color: #666;">Distancia al río:</td><td style="padding: 8px 0; text-align: right; font-weight: 700; color: #0288D1; font-size: 16px;">' + (distanciaRioUsumacinta / 1000).toFixed(2) + ' km</td></tr></table></div>';
        }

        if (totalLocalidades === 0 && (!sitiosRamsar || sitiosRamsar.length === 0) && distanciaRioUsumacinta === null) {
            html += '<div style="text-align: center; padding: 40px 20px; color: #999;"><i class="bi bi-info-circle" style="font-size: 48px; display: block; margin-bottom: 15px; opacity: 0.5;"></i><p style="margin: 0; font-size: 13px;">No se encontraron recursos en el radio de búsqueda</p></div>';
        }

        html += '</div></div>';
        infoTab.innerHTML = html;
        this.expandBottomSheet();
        this.switchBottomSheetTab('info');
    }

    handleMenuAction(action) {
        switch (action) {
            case 'tablero': {
                // Toggle sidebar iframe de proyectos
                const toggleBtn = document.getElementById('sidebar-toggle-btn');
                if (toggleBtn) toggleBtn.click();
                break;
            }
            case 'search': {
                // Mostrar tablero y enfocar su buscador
                this.searchProyecto('');
                break;
            }
            case 'refresh': {
                // Recargar proyectos de Google Sheets
                this._reloadNuevosProyectos();
                // Recargar capas CDN (Centrales, Líneas, Subestaciones, Gerencias) + tiles basemap
                if (typeof window.reloadDomainLayers === 'function') {
                    window.reloadDomainLayers().then(() => {
                        if (typeof showNotification === 'function') {
                            showNotification('Datos actualizados', 'Capas y proyectos recargados correctamente.', 'success');
                        }
                    }).catch(err => {
                        console.error('Error en reloadDomainLayers:', err);
                    });
                }
                break;
            }
            case 'export-png': {
                this.exportMap();
                break;
            }
            case 'export-word': {
                document.getElementById('export-word-btn')?.click();
                break;
            }
        }
    }

    setupZoomHandlers() {
        const checkMap = setInterval(() => {
            if (window.map) {
                clearInterval(checkMap);

                // Función para actualizar clases de zoom
                const updateZoomClasses = () => {
                    const zoom = window.map.getZoom();
                    const mapContainer = window.map.getContainer();

                    // Remover clases de zoom anteriores
                    mapContainer.classList.forEach(cls => {
                        if (cls.startsWith('zoom-level-')) {
                            mapContainer.classList.remove(cls);
                        }
                    });

                    // Agregar clase actual
                    mapContainer.classList.add(`zoom-level-${Math.floor(zoom)}`);
                };

                if (window.map && window.map.on) {
                    window.map.on('zoomend', updateZoomClasses);
                    updateZoomClasses(); // Inicializar
                }
            }
        }, 500);
    }

    removeMobileElements() {
        document.querySelectorAll('.mobile-menu-btn, .mobile-search-btn, .mobile-action-buttons, .mobile-layers-btn, .mobile-location-btn, .mobile-bottom-sheet, .mobile-side-drawer, .mobile-drawer-overlay, .mobile-search-modal, .mobile-map-legend').forEach(el => {
            el.remove();
        });
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileInterface = new MobileInterface();
    });
} else {
    window.mobileInterface = new MobileInterface();
}
