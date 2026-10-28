/**
 * ==============================================================================
 * SISTEMAS OPERATIVOS II - UNJu - FACULTAD DE INGENIERÍA (2026)
 * APLICACIÓN WEB INTERACTIVA — TRABAJO PRÁCTICO N° 6
 * Tema: Sistema de Archivos Distribuido (DFS), RPC & Consenso de Gifford
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'UNJU_SO2_TP6_STATE_V2';
    const TOTAL_ACADEMIC_ITEMS = 30;

    // Estado Reactivo de la Aplicación (6 Secciones Académicas)
    const state = {
        estudiante: {
            nombre: '',
            legajo: '',
            github: ''
        },
        seccion1_conceptos: {
            q1_definicion_dfs: null,
            q2_rendimiento_dfs: null,
            q3_independencia_ubicacion: null,
            q4_modelo_remoto_vs_carga: null,
            q5_ubicacion_cache: null
        },
        seccion2_nombrado_transparencia: {
            nom1_host_local: null,
            nom2_montaje_nfs: null,
            nom3_arbol_global_afs: null,
            nom4_cadena_resolucion: null,
            nom5_migracion_archivos: null
        },
        seccion3_switches_politicas: {
            sw1_politica_escritura: null,
            sw2_volcado_diferido: null,
            sw3_semantica_coherencia: null,
            sw4_servidor_stateless: null,
            sw5_replica_retrasada: null,
            sw6_replica_grupo: null
        },
        seccion4_laboratorio_acceso: {
            sim_modelo_archivo_grande_pequeno_cambio: null,
            sim_modelo_cargas_intensivas_locales: null,
            sim_impacto_write_through: null,
            sim_tolerancia_fallos_stateless: null
        },
        seccion5_flujo_rpc: {
            orden_ciclo_rpc: [null, null, null, null, null, null]
        },
        seccion6_quorums_gifford: {
            q1_condicion_lectura_escritura: null,
            q2_condicion_escritura_escritura: null,
            q3_rowa_escritura_n5: null,
            q4_mayoria_n7: null
        }
    };

    let hasTriggeredConfetti = false;

    // Elementos DOM Principales
    const progressFill = document.getElementById('progress-fill');
    const progressLabel = document.getElementById('progress-label');
    const btnDownloadTop = document.getElementById('btn-download-json');
    const btnDownloadBottom = document.getElementById('btn-download-bottom');
    const downloadStatusMsg = document.getElementById('download-status-msg');
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    const btnImport = document.getElementById('btn-import-json');
    const fileImportInput = document.getElementById('file-import-input');
    const toastContainer = document.getElementById('toast-container');

    // --------------------------------------------------------------------------
    // 1. Tema Claro / Oscuro con Persistencia
    // --------------------------------------------------------------------------
    const currentTheme = localStorage.getItem('SO2_THEME') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

    btnThemeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('SO2_THEME', theme);
        showToast(`Tema cambiado a ${theme === 'dark' ? 'Oscuro' : 'Claro'}`, 'info');
    });

    // --------------------------------------------------------------------------
    // 2. Sistema de Notificaciones Toast
    // --------------------------------------------------------------------------
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '❌' };
        toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    // --------------------------------------------------------------------------
    // 3. Cálculo de Progreso Estrictamente Académico (30 Ítems)
    // --------------------------------------------------------------------------
    function countCompletedItems() {
        let count = 0;

        // Sección 1: 5 items
        for (const k in state.seccion1_conceptos) {
            if (state.seccion1_conceptos[k]) count++;
        }

        // Sección 2: 5 items (Nombrado)
        for (const k in state.seccion2_nombrado_transparencia) {
            if (state.seccion2_nombrado_transparencia[k]) count++;
        }

        // Sección 3: 6 switches
        for (const k in state.seccion3_switches_politicas) {
            if (state.seccion3_switches_politicas[k]) count++;
        }

        // Sección 4: 4 selects (Simulador de Acceso)
        for (const k in state.seccion4_laboratorio_acceso) {
            if (state.seccion4_laboratorio_acceso[k]) count++;
        }

        // Sección 5: 6 slots DnD (Ciclo RPC)
        const dnd = state.seccion5_flujo_rpc.orden_ciclo_rpc;
        for (let i = 0; i < 6; i++) {
            if (dnd[i]) count++;
        }

        // Sección 6: 4 selects (Quórum de Gifford)
        for (const k in state.seccion6_quorums_gifford) {
            if (state.seccion6_quorums_gifford[k]) count++;
        }

        return count;
    }

    function updateProgress() {
        const completed = countCompletedItems();
        const pct = Math.round((completed / TOTAL_ACADEMIC_ITEMS) * 100);

        progressFill.style.width = `${pct}%`;
        progressLabel.textContent = `${pct}% (${completed}/${TOTAL_ACADEMIC_ITEMS})`;

        const s = state.estudiante;
        const hasStudentData = Boolean(s.nombre && s.nombre.trim() && s.legajo && s.legajo.trim() && s.github && s.github.trim());
        const isAcademicReady = completed >= TOTAL_ACADEMIC_ITEMS;
        const canDownload = isAcademicReady && hasStudentData;

        btnDownloadTop.disabled = !canDownload;
        btnDownloadBottom.disabled = !canDownload;

        if (canDownload) {
            downloadStatusMsg.innerHTML = '<span style="color: #34d399; font-weight: 600;">✅ ¡Todo completo! Puede descargar respuestas_tp06.json y proceder con la entrega.</span>';
        } else if (!isAcademicReady) {
            downloadStatusMsg.textContent = `Progreso académico: ${completed}/${TOTAL_ACADEMIC_ITEMS} ítems completados. Complete todas las actividades para habilitar la descarga.`;
        } else {
            downloadStatusMsg.innerHTML = '<span style="color: #fbbf24; font-weight: 600;">⚠️ Por favor complete sus Datos de Estudiante (Nombre, Legajo y GitHub) en el primer formulario.</span>';
        }

        // Confetti al 100%
        if (completed === TOTAL_ACADEMIC_ITEMS && !hasTriggeredConfetti) {
            hasTriggeredConfetti = true;
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 130,
                    spread: 85,
                    origin: { y: 0.6 }
                });
            }
            showToast('¡Felicitaciones! Ha completado el 100% de los 30 ítems académicos 🎉', 'success');
        }

        saveToLocalStorage();
    }

    // --------------------------------------------------------------------------
    // 4. Persistencia LocalStorage
    // --------------------------------------------------------------------------
    function saveToLocalStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Error al guardar estado en localStorage', e);
        }
    }

    function loadFromLocalStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            Object.assign(state.estudiante, parsed.estudiante || {});
            Object.assign(state.seccion1_conceptos, parsed.seccion1_conceptos || {});
            Object.assign(state.seccion2_nombrado_transparencia, parsed.seccion2_nombrado_transparencia || {});
            Object.assign(state.seccion3_switches_politicas, parsed.seccion3_switches_politicas || {});
            Object.assign(state.seccion4_laboratorio_acceso, parsed.seccion4_laboratorio_acceso || {});
            if (parsed.seccion5_flujo_rpc && Array.isArray(parsed.seccion5_flujo_rpc.orden_ciclo_rpc)) {
                state.seccion5_flujo_rpc.orden_ciclo_rpc = parsed.seccion5_flujo_rpc.orden_ciclo_rpc;
            }
            Object.assign(state.seccion6_quorums_gifford, parsed.seccion6_quorums_gifford || {});
            syncUIToState();
        } catch (e) {
            console.error('Error al cargar estado de localStorage', e);
        }
    }

    // --------------------------------------------------------------------------
    // 5. Vinculación de Formularios e Inputs a State
    // --------------------------------------------------------------------------
    const inpNombre = document.getElementById('alumno-nombre');
    const inpLegajo = document.getElementById('alumno-legajo');
    const inpGithub = document.getElementById('alumno-github');

    [inpNombre, inpLegajo, inpGithub].forEach(input => {
        input.addEventListener('input', () => {
            state.estudiante.nombre = inpNombre.value.trim();
            state.estudiante.legajo = inpLegajo.value.trim();
            state.estudiante.github = inpGithub.value.trim();
            updateProgress();
        });
    });

    // Sección 1: Radios
    document.querySelectorAll('#seccion-1 .question-block').forEach(qBlock => {
        const qid = qBlock.getAttribute('data-qid');
        qBlock.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    state.seccion1_conceptos[qid] = radio.value;
                    updateProgress();
                }
            });
        });
    });

    // Sección 2: Selects de Nombrado
    document.querySelectorAll('#seccion-2 select[data-itemkey]').forEach(sel => {
        const itemKey = sel.getAttribute('data-itemkey');
        sel.addEventListener('change', () => {
            state.seccion2_nombrado_transparencia[itemKey] = sel.value || null;
            updateProgress();
        });
    });

    // Sección 3: Switches Segmentados
    document.querySelectorAll('#seccion-3 .switch-card').forEach(card => {
        const swid = card.getAttribute('data-swid');
        const buttons = card.querySelectorAll('.segment-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.seccion3_switches_politicas[swid] = btn.getAttribute('data-value');
                updateProgress();
            });
        });
    });

    // Sección 4: Selects Dropdown (Simulador de Acceso)
    document.querySelectorAll('#seccion-4 select[data-itemkey]').forEach(sel => {
        const itemKey = sel.getAttribute('data-itemkey');
        sel.addEventListener('change', () => {
            state.seccion4_laboratorio_acceso[itemKey] = sel.value || null;
            updateProgress();
        });
    });

    // Sección 6: Selects Dropdown (Quórum de Gifford)
    document.querySelectorAll('#seccion-6 select[data-itemkey]').forEach(sel => {
        const itemKey = sel.getAttribute('data-itemkey');
        sel.addEventListener('change', () => {
            state.seccion6_quorums_gifford[itemKey] = sel.value || null;
            updateProgress();
        });
    });

    // --------------------------------------------------------------------------
    // 6. Sincronizar UI desde State (para restaurar o importar)
    // --------------------------------------------------------------------------
    function syncUIToState() {
        inpNombre.value = state.estudiante.nombre || '';
        inpLegajo.value = state.estudiante.legajo || '';
        inpGithub.value = state.estudiante.github || '';

        // Sección 1
        for (const qid in state.seccion1_conceptos) {
            const val = state.seccion1_conceptos[qid];
            if (val) {
                const radio = document.querySelector(`input[name="${qid}"][value="${val}"]`);
                if (radio) radio.checked = true;
            }
        }

        // Sección 2
        for (const key in state.seccion2_nombrado_transparencia) {
            const val = state.seccion2_nombrado_transparencia[key];
            const sel = document.querySelector(`#seccion-2 select[data-itemkey="${key}"]`);
            if (sel) sel.value = val || '';
        }

        // Sección 3
        for (const swid in state.seccion3_switches_politicas) {
            const val = state.seccion3_switches_politicas[swid];
            if (val) {
                const card = document.querySelector(`.switch-card[data-swid="${swid}"]`);
                if (card) {
                    card.querySelectorAll('.segment-btn').forEach(btn => {
                        if (btn.getAttribute('data-value') === val) {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    });
                }
            }
        }

        // Sección 4
        for (const key in state.seccion4_laboratorio_acceso) {
            const val = state.seccion4_laboratorio_acceso[key];
            const sel = document.querySelector(`#seccion-4 select[data-itemkey="${key}"]`);
            if (sel) sel.value = val || '';
        }

        // Sección 5 (DnD)
        syncDnDUI();

        // Sección 6
        for (const key in state.seccion6_quorums_gifford) {
            const val = state.seccion6_quorums_gifford[key];
            const sel = document.querySelector(`#seccion-6 select[data-itemkey="${key}"]`);
            if (sel) sel.value = val || '';
        }

        updateProgress();
    }

    // --------------------------------------------------------------------------
    // 7. Drag and Drop: Flujo RPC con SortableJS y Fallback
    // --------------------------------------------------------------------------
    const sourceBank = document.getElementById('dnd-source-bank');
    const targetSlots = document.querySelectorAll('.slot-dropzone');
    const dndCounter = document.getElementById('dnd-counter');
    const btnResetDnd = document.getElementById('btn-reset-dnd');

    function syncDnDUI() {
        const order = state.seccion5_flujo_rpc.orden_ciclo_rpc;
        let placedCount = 0;

        // Mover tarjetas según el array de orden
        order.forEach((stepId, slotIdx) => {
            const zone = targetSlots[slotIdx];
            if (zone) {
                zone.innerHTML = '';
                if (stepId) {
                    const card = document.querySelector(`.dnd-card[data-step-id="${stepId}"]`);
                    if (card) {
                        zone.appendChild(card);
                        placedCount++;
                    }
                }
            }
        });

        // Asegurar que las tarjetas no asignadas vuelvan al banco de origen
        document.querySelectorAll('.dnd-card').forEach(card => {
            const stepId = card.getAttribute('data-step-id');
            if (!order.includes(stepId)) {
                sourceBank.appendChild(card);
            }
        });

        dndCounter.textContent = `${placedCount} / 6 asignadas`;
    }

    function initSortable() {
        if (typeof Sortable === 'undefined') {
            console.warn('SortableJS no disponible, habilitando modo interactivo por click');
            initClickDnDFallback();
            return;
        }

        Sortable.create(sourceBank, {
            group: 'rpc-dnd',
            animation: 180,
            ghostClass: 'dnd-ghost',
            onAdd: () => updateDnDState()
        });

        targetSlots.forEach((slot) => {
            Sortable.create(slot, {
                group: 'rpc-dnd',
                animation: 180,
                max: 1,
                onAdd: (evt) => {
                    if (slot.children.length > 1) {
                        const existing = evt.item === slot.children[0] ? slot.children[1] : slot.children[0];
                        sourceBank.appendChild(existing);
                    }
                    updateDnDState();
                },
                onRemove: () => updateDnDState()
            });
        });
    }

    function initClickDnDFallback() {
        document.querySelectorAll('.dnd-card').forEach(card => {
            card.addEventListener('click', () => {
                const parent = card.parentElement;
                if (parent === sourceBank) {
                    for (let i = 0; i < targetSlots.length; i++) {
                        if (targetSlots[i].children.length === 0) {
                            targetSlots[i].appendChild(card);
                            updateDnDState();
                            return;
                        }
                    }
                    showToast('Todas las ranuras están ocupadas. Remueva una primero.', 'warn');
                } else {
                    sourceBank.appendChild(card);
                    updateDnDState();
                }
            });
        });
    }

    function updateDnDState() {
        const newOrder = [null, null, null, null, null, null];
        let placedCount = 0;

        targetSlots.forEach((slot, idx) => {
            const card = slot.querySelector('.dnd-card');
            if (card) {
                const stepId = card.getAttribute('data-step-id');
                newOrder[idx] = stepId;
                placedCount++;
            }
        });

        state.seccion5_flujo_rpc.orden_ciclo_rpc = newOrder;
        dndCounter.textContent = `${placedCount} / 6 asignadas`;
        updateProgress();
    }

    btnResetDnd.addEventListener('click', () => {
        document.querySelectorAll('.dnd-card').forEach(card => {
            sourceBank.appendChild(card);
        });
        state.seccion5_flujo_rpc.orden_ciclo_rpc = [null, null, null, null, null, null];
        dndCounter.textContent = '0 / 6 asignadas';
        updateProgress();
        showToast('Etapas RPC restablecidas al banco de origen', 'info');
    });

    initSortable();

    // --------------------------------------------------------------------------
    // 8. SIMULADOR DE MODELOS DE ACCESO (RPC vs Carga/Descarga)
    // --------------------------------------------------------------------------
    const btnRunAccessSim = document.getElementById('btn-run-access-sim');
    const btnResetAccessSim = document.getElementById('btn-reset-access-sim');
    const selFileSize = document.getElementById('sim-file-size');
    const selWorkload = document.getElementById('sim-workload');
    const selLatency = document.getElementById('sim-latency');
    const selBandwidth = document.getElementById('sim-bandwidth');
    const accessLog = document.getElementById('access-sim-log');

    const clientStatus = document.getElementById('client-status');
    const serverStatus = document.getElementById('server-status');
    const channelStatus = document.getElementById('channel-status');
    const clientCacheDetail = document.getElementById('client-cache-detail');
    const serverFileDetail = document.getElementById('server-file-detail');

    const packetReq = document.getElementById('sim-packet-req');
    const packetRes = document.getElementById('sim-packet-res');

    const rpcInit = document.getElementById('rpc-init');
    const rpcExec = document.getElementById('rpc-exec');
    const rpcFinal = document.getElementById('rpc-final');
    const rpcTotal = document.getElementById('rpc-total');
    const rpcTraffic = document.getElementById('rpc-traffic');

    const udInit = document.getElementById('ud-init');
    const udExec = document.getElementById('ud-exec');
    const udFinal = document.getElementById('ud-final');
    const udTotal = document.getElementById('ud-total');
    const udTraffic = document.getElementById('ud-traffic');

    function logAccess(msg, type = 'system') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        accessLog.appendChild(entry);
        accessLog.scrollTop = accessLog.scrollHeight;
    }

    btnRunAccessSim.addEventListener('click', () => {
        const fileSizeMB = parseFloat(selFileSize.value);
        const workload = selWorkload.value;
        const rttMs = parseFloat(selLatency.value);
        const bwMbps = parseFloat(selBandwidth.value);

        logAccess(`Iniciando simulación: Archivo=${fileSizeMB}MB, RTT=${rttMs}ms, BW=${bwMbps}Mbps, Patrón=${workload}`);

        clientStatus.textContent = 'Enviando...';
        serverStatus.textContent = 'Procesando...';
        channelStatus.textContent = 'Tráfico en curso';

        packetReq.style.opacity = '1';
        packetReq.style.transform = 'translateX(220px)';

        setTimeout(() => {
            packetReq.style.opacity = '0';
            packetReq.style.transform = 'translateX(0)';

            packetRes.style.opacity = '1';
            packetRes.style.transform = 'translateX(-220px)';

            setTimeout(() => {
                packetRes.style.opacity = '0';
                packetRes.style.transform = 'translateX(0)';

                clientStatus.textContent = 'Completado';
                serverStatus.textContent = 'Listo';
                channelStatus.textContent = 'Enlace ocioso';
            }, 500);
        }, 500);

        // Cálculos de Modelos
        const transferTimeOneWayMs = (fileSizeMB * 8 / bwMbps) * 1000 + rttMs;
        let udInitMs = 0, udExecMs = 0, udFinalMs = 0, udTrafficKB = 0;
        let rpcInitMs = 0, rpcExecMs = 0, rpcFinalMs = 0, rpcTrafficKB = 0;

        if (workload === 'single_write') {
            udInitMs = Math.round(transferTimeOneWayMs);
            udExecMs = 1;
            udFinalMs = Math.round(transferTimeOneWayMs);
            udTrafficKB = Math.round(fileSizeMB * 1024 * 2);

            rpcInitMs = 0;
            rpcExecMs = Math.round(rttMs + (4 * 8 / (bwMbps * 1024)) * 1000 + 2);
            rpcFinalMs = 0;
            rpcTrafficKB = 8;

            logAccess(`[Single Write] RPC requirió solo ${rpcExecMs}ms frente a ${udInitMs + udFinalMs}ms de Carga/Descarga!`, 'success');
        } else if (workload === 'sequential_read') {
            const readSizeMB = fileSizeMB * 0.5;
            udInitMs = Math.round(transferTimeOneWayMs);
            udExecMs = Math.round(readSizeMB * 2);
            udFinalMs = 0;
            udTrafficKB = Math.round(fileSizeMB * 1024);

            rpcInitMs = 0;
            const numBlocks = (readSizeMB * 1024) / 64;
            rpcExecMs = Math.round(numBlocks * (rttMs * 0.2 + (64 * 8 / (bwMbps * 1024)) * 1000));
            rpcFinalMs = 0;
            rpcTrafficKB = Math.round(readSizeMB * 1024 * 1.05);

            logAccess(`[Sequential Read] Carga/Descarga transfirió todo el archivo (${fileSizeMB}MB) mientras RPC solo los bloques requeridos.`, 'warn');
        } else if (workload === 'intensive_local') {
            udInitMs = Math.round(transferTimeOneWayMs);
            udExecMs = 15;
            udFinalMs = Math.round(transferTimeOneWayMs);
            udTrafficKB = Math.round(fileSizeMB * 1024 * 2);

            rpcInitMs = 0;
            rpcExecMs = Math.round(150 * rttMs + 50);
            rpcFinalMs = 0;
            rpcTrafficKB = Math.round(150 * 16);

            logAccess(`[Intensive Cycle] Carga/Descarga es superior si RTT es alto (${udInitMs + udExecMs + udFinalMs}ms vs ${rpcExecMs}ms de RPC).`, 'warn');
        }

        const rpcTotalMs = rpcInitMs + rpcExecMs + rpcFinalMs;
        const udTotalMs = udInitMs + udExecMs + udFinalMs;

        rpcInit.textContent = `${rpcInitMs} ms`;
        rpcExec.textContent = `${rpcExecMs} ms`;
        rpcFinal.textContent = `${rpcFinalMs} ms`;
        rpcTotal.textContent = `${rpcTotalMs} ms`;
        rpcTraffic.textContent = `${rpcTrafficKB} KB`;

        udInit.textContent = `${udInitMs} ms`;
        udExec.textContent = `${udExecMs} ms`;
        udFinal.textContent = `${udFinalMs} ms`;
        udTotal.textContent = `${udTotalMs} ms`;
        udTraffic.textContent = `${udTrafficKB} KB`;

        clientCacheDetail.textContent = `Caché: ${workload === 'single_write' ? '4 KB' : fileSizeMB + ' MB'}`;
        serverFileDetail.textContent = `Maestro: ${fileSizeMB} MB`;
    });

    btnResetAccessSim.addEventListener('click', () => {
        selFileSize.value = '20';
        selWorkload.value = 'single_write';
        selLatency.value = '25';
        selBandwidth.value = '100';

        rpcInit.textContent = '0 ms';
        rpcExec.textContent = '0 ms';
        rpcFinal.textContent = '0 ms';
        rpcTotal.textContent = '0 ms';
        rpcTraffic.textContent = '0 KB';

        udInit.textContent = '0 ms';
        udExec.textContent = '0 ms';
        udFinal.textContent = '0 ms';
        udTotal.textContent = '0 ms';
        udTraffic.textContent = '0 KB';

        clientCacheDetail.textContent = 'Caché: 0 KB';
        serverFileDetail.textContent = 'Archivo Maestro';
        logAccess('Simulador restablecido a valores por defecto.');
    });

    // --------------------------------------------------------------------------
    // 9. SIMULADOR DE QUÓRUM DE GIFFORD (N = 7 Servidores)
    // --------------------------------------------------------------------------
    const N_SERVERS = 7;
    const clusterGrid = document.getElementById('cluster-nodes-grid');
    const quorumSimLog = document.getElementById('quorum-sim-log');

    const sliderNr = document.getElementById('quorum-nr-slider');
    const sliderNw = document.getElementById('quorum-nw-slider');
    const lblNr = document.getElementById('lbl-nr-val');
    const lblNw = document.getElementById('lbl-nw-val');

    const ruleRwMath = document.getElementById('rule-rw-math');
    const ruleRwBadge = document.getElementById('rule-rw-badge');
    const ruleWwMath = document.getElementById('rule-ww-math');
    const ruleWwBadge = document.getElementById('rule-ww-badge');

    const btnExecRead = document.getElementById('btn-exec-read');
    const btnExecWrite = document.getElementById('btn-exec-write');
    const btnHealNodes = document.getElementById('btn-heal-nodes');
    const btnPresetRowa = document.getElementById('btn-preset-rowa');
    const btnPresetMajority = document.getElementById('btn-preset-majority');
    const btnPresetInvalid = document.getElementById('btn-preset-invalid');

    const clusterNodes = Array.from({ length: N_SERVERS }, (_, i) => ({
        id: i + 1,
        name: `Servidor S${i + 1}`,
        online: true,
        version: 1,
        content: `Dato base v1`
    }));

    function logQuorum(msg, type = 'system') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        quorumSimLog.appendChild(entry);
        quorumSimLog.scrollTop = quorumSimLog.scrollHeight;
    }

    function renderCluster() {
        clusterGrid.innerHTML = '';
        clusterNodes.forEach(node => {
            const card = document.createElement('div');
            card.className = `replica-node-card ${node.online ? 'online' : 'offline'}`;
            card.setAttribute('data-node-id', node.id);

            card.innerHTML = `
                <div class="replica-icon">${node.online ? '🖧' : '⚠️'}</div>
                <div class="replica-name">${node.name}</div>
                <div class="replica-version">v${node.version}</div>
                <div class="replica-status ${node.online ? 'online' : 'offline'}">
                    ${node.online ? 'En Línea' : 'Caído (Offline)'}
                </div>
            `;

            card.addEventListener('click', () => {
                node.online = !node.online;
                renderCluster();
                logQuorum(`${node.name} ahora está ${node.online ? 'EN LÍNEA ✅' : 'CAÍDO (OFFLINE) ❌'}`, node.online ? 'success' : 'warn');
            });

            clusterGrid.appendChild(card);
        });
    }

    function updateGiffordRules() {
        const nr = parseInt(sliderNr.value);
        const nw = parseInt(sliderNw.value);

        lblNr.textContent = nr;
        lblNw.textContent = nw;

        const rwSum = nr + nw;
        const rwValid = rwSum > N_SERVERS;
        ruleRwMath.textContent = `Nr + Nw > N  →  ${nr} + ${nw} > ${N_SERVERS} (${rwSum} ${rwValid ? '>' : '≤'} ${N_SERVERS})`;
        if (rwValid) {
            ruleRwBadge.className = 'rule-badge badge-tag emerald';
            ruleRwBadge.textContent = '✅ Válido (Solapamiento asegurado)';
        } else {
            ruleRwBadge.className = 'rule-badge badge-tag rose';
            ruleRwBadge.textContent = '❌ Inseguro (Riesgo de leer versiones obsoletas)';
        }

        const wwValid = nw > (N_SERVERS / 2);
        ruleWwMath.textContent = `Nw > N/2  →  ${nw} > ${N_SERVERS / 2}`;
        if (wwValid) {
            ruleWwBadge.className = 'rule-badge badge-tag emerald';
            ruleWwBadge.textContent = '✅ Válido (Quórum único mayoritario)';
        } else {
            ruleWwBadge.className = 'rule-badge badge-tag rose';
            ruleWwBadge.textContent = '❌ Inseguro (Riesgo de escrituras conflictivas simultáneas)';
        }
    }

    sliderNr.addEventListener('input', updateGiffordRules);
    sliderNw.addEventListener('input', updateGiffordRules);

    btnPresetRowa.addEventListener('click', () => {
        sliderNr.value = 1;
        sliderNw.value = 7;
        updateGiffordRules();
        logQuorum('Preset ROWA aplicado: Nr=1 (Lectura instantánea), Nw=7 (Escritura en todos)', 'info');
    });

    btnPresetMajority.addEventListener('click', () => {
        sliderNr.value = 4;
        sliderNw.value = 4;
        updateGiffordRules();
        logQuorum('Preset Mayoría Simple aplicado: Nr=4, Nw=4 (Tolera hasta 3 nodos caídos)', 'info');
    });

    btnPresetInvalid.addEventListener('click', () => {
        sliderNr.value = 3;
        sliderNw.value = 3;
        updateGiffordRules();
        logQuorum('Preset Inseguro aplicado: Nr=3, Nw=3 (Viola ambas reglas de Gifford!)', 'error');
    });

    btnHealNodes.addEventListener('click', () => {
        clusterNodes.forEach(n => n.online = true);
        renderCluster();
        logQuorum('Todos los servidores del clúster han sido restaurados a EN LÍNEA.', 'success');
    });

    btnExecRead.addEventListener('click', () => {
        const nr = parseInt(sliderNr.value);
        const nw = parseInt(sliderNw.value);
        const activeNodes = clusterNodes.filter(n => n.online);

        document.querySelectorAll('.replica-node-card').forEach(c => {
            c.classList.remove('selected-read', 'selected-write');
        });

        if (activeNodes.length < nr) {
            logQuorum(`[ERROR] Quórum de Lectura fallido: Se requieren ${nr} servidores activos pero solo hay ${activeNodes.length} disponibles.`, 'error');
            showToast('Fallo de Quórum de Lectura: Servidores insuficientes', 'error');
            return;
        }

        const shuffled = [...activeNodes].sort(() => 0.5 - Math.random());
        const quorumGroup = shuffled.slice(0, nr);

        quorumGroup.forEach(node => {
            const el = document.querySelector(`.replica-node-card[data-node-id="${node.id}"]`);
            if (el) el.classList.add('selected-read');
        });

        let maxVer = -1;
        quorumGroup.forEach(n => {
            if (n.version > maxVer) {
                maxVer = n.version;
            }
        });

        const quorumStr = quorumGroup.map(n => `${n.name} (v${n.version})`).join(', ');
        const isSafe = (nr + nw) > N_SERVERS;

        if (isSafe) {
            logQuorum(`[LECTURA EXITOSA] Quórum de ${nr} servidores consultado: [${quorumStr}]. Se entrega la versión más reciente: v${maxVer} ✅`, 'success');
            showToast(`Lectura Exitosa: Versión obtenida v${maxVer}`, 'success');
        } else {
            logQuorum(`[ALERTA DE CONSISTENCIA] Quórum consultado: [${quorumStr}]. Versión leída v${maxVer}. ¡Atención: Al violar Nr + Nw > N no hay garantía de que sea la última versión global! ⚠️`, 'warn');
            showToast(`Lectura con Riesgo de Inconsistencia (v${maxVer})`, 'warn');
        }
    });

    btnExecWrite.addEventListener('click', () => {
        const nr = parseInt(sliderNr.value);
        const nw = parseInt(sliderNw.value);
        const activeNodes = clusterNodes.filter(n => n.online);

        document.querySelectorAll('.replica-node-card').forEach(c => {
            c.classList.remove('selected-read', 'selected-write');
        });

        if (activeNodes.length < nw) {
            logQuorum(`[ERROR] Quórum de Escritura fallido: Se requieren ${nw} servidores activos pero solo hay ${activeNodes.length} disponibles.`, 'error');
            showToast('Fallo de Quórum de Escritura: Servidores insuficientes', 'error');
            return;
        }

        const shuffled = [...activeNodes].sort(() => 0.5 - Math.random());
        const quorumGroup = shuffled.slice(0, nw);

        const currentGlobalMaxVer = Math.max(...clusterNodes.map(n => n.version));
        const newVer = currentGlobalMaxVer + 1;

        quorumGroup.forEach(node => {
            node.version = newVer;
            node.content = `Dato actualizado v${newVer}`;
        });

        renderCluster();

        quorumGroup.forEach(node => {
            const el = document.querySelector(`.replica-node-card[data-node-id="${node.id}"]`);
            if (el) el.classList.add('selected-write');
        });

        const quorumStr = quorumGroup.map(n => n.name).join(', ');
        logQuorum(`[ESCRITURA EXITOSA] Nueva versión v${newVer} escrita en el quórum de ${nw} servidores: [${quorumStr}].`, 'success');
        showToast(`Escritura Exitosa en ${nw} servidores (v${newVer})`, 'success');
    });

    renderCluster();
    updateGiffordRules();

    // --------------------------------------------------------------------------
    // 10. EXPORTACIÓN E IMPORTACIÓN DE ARCHIVO JSON
    // --------------------------------------------------------------------------
    function downloadJSON() {
        const completed = countCompletedItems();
        if (completed < TOTAL_ACADEMIC_ITEMS) {
            showToast(`Debe completar los ${TOTAL_ACADEMIC_ITEMS} ítems académicos antes de exportar`, 'warn');
            return;
        }
        if (!state.estudiante.nombre || !state.estudiante.legajo || !state.estudiante.github) {
            showToast('Debe ingresar Nombre, Legajo y GitHub para generar la entrega', 'error');
            return;
        }

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "respuestas_tp06.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        showToast('Archivo respuestas_tp06.json generado y descargado con éxito 📥', 'success');
    }

    btnDownloadTop.addEventListener('click', downloadJSON);
    btnDownloadBottom.addEventListener('click', downloadJSON);

    btnImport.addEventListener('click', () => {
        fileImportInput.value = '';
        fileImportInput.click();
    });

    fileImportInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const imported = JSON.parse(evt.target.result);
                if (imported.estudiante) Object.assign(state.estudiante, imported.estudiante);
                if (imported.seccion1_conceptos) Object.assign(state.seccion1_conceptos, imported.seccion1_conceptos);
                if (imported.seccion2_nombrado_transparencia) Object.assign(state.seccion2_nombrado_transparencia, imported.seccion2_nombrado_transparencia);
                if (imported.seccion3_switches_politicas) Object.assign(state.seccion3_switches_politicas, imported.seccion3_switches_politicas);
                if (imported.seccion4_laboratorio_acceso) Object.assign(state.seccion4_laboratorio_acceso, imported.seccion4_laboratorio_acceso);
                if (imported.seccion5_flujo_rpc && Array.isArray(imported.seccion5_flujo_rpc.orden_ciclo_rpc)) {
                    state.seccion5_flujo_rpc.orden_ciclo_rpc = imported.seccion5_flujo_rpc.orden_ciclo_rpc;
                }
                if (imported.seccion6_quorums_gifford) Object.assign(state.seccion6_quorums_gifford, imported.seccion6_quorums_gifford);

                syncUIToState();
                showToast('Archivo respuestas_tp06.json importado y restaurado exitosamente 📂', 'success');
            } catch (err) {
                console.error(err);
                showToast('Error al procesar el archivo JSON. Verifique el formato.', 'error');
            }
        };
        reader.readAsText(file);
    });

    loadFromLocalStorage();
    updateProgress();
});
