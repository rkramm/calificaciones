/* ================= CONFIGURACIÓN DE ENTORNO WEB (GITHUB + GOOGLE SCRIPTS) ================= */
const CLOUD_MODE_ENABLED = true; // ¡Activado para conectar con Google Sheets!
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw2jf_6QkYzdbCDNfm-C8F0rzzJG_lZQbMA4VwV2s5hZQQ7_TjsLLIlWTi9ztckOnmnVQ/exec";

const PROGRAMAS_BASE = ["DS10", "DS27", "DS49"];

const DEFAULT_ITEMS = [
    // ETAPA 1
    { id: "1.1", stage: 1, text: "Calidad en la gestión y desarrollo del(los) servicio (s) de asistencia técnica" },
    { id: "1.2", stage: 1, text: "Preparación y desarrollo de diagnósticos técnicos y sociales pertinentes." },
    { id: "1.3", stage: 1, text: "Entrega oportuna de información del proyecto a las familias." },
    { id: "1.4", stage: 1, text: "Participación activa de las familias en la aprobación del proyecto." },
    { id: "1.5", stage: 1, text: "Calidad y disponibilidad de información y/o antecedentes solicitados por el organismo de revisión." },
    { id: "1.6", stage: 1, text: "Organización adecuada del trabajo en terreno." },
    { id: "1.7", stage: 1, text: "Disposición para atender a las familias en dependencias adecuadas y bien equipadas." },
    { id: "1.8", stage: 1, text: "Efectiva coordinación con la contraparte técnica de revisión." },
    // ETAPA 2
    { id: "2.1", stage: 2, text: "Adecuada evaluación técnica y/o legal de bienes inmuebles" },
    { id: "2.2", stage: 2, text: "Calidad del (los) proyecto (s) presentado (s)" },
    { id: "2.3", stage: 2, text: "Resolución oportuna de observaciones al (los) proyecto (s) formuladas." },
    { id: "2.4", stage: 2, text: "Calidad de la gestión externa con empresas de servicios constructores y otras entidades públicas y privadas relacionadas con la formulación del proyecto." },
    { id: "2.5", stage: 2, text: "Evaluación técnica y/o legal adecuada de terrenos y otros bienes inmuebles." },
    { id: "2.6", stage: 2, text: "Adecuado desarrollo del proceso de elección y selección de la Empresa Constructora." },
    { id: "2.7", stage: 2, text: "Calidad y disponibilidad de información y/o antecedentes solicitados." },
    { id: "2.8", stage: 2, text: "Disposición y organización adecuada del trabajo de terreno." },
    { id: "2.9", stage: 2, text: "Efectiva coordinación con la contraparte técnica." },
    // ETAPA 3
    { id: "3.1", stage: 3, text: "Calidad en la gestión y desarrollo del (los) servicio (s) de asistencia técnica" },
    { id: "3.2", stage: 3, text: "Coordinación con actores externos CBR, DOM y otras entidades públicas y privadas vinculadas al desarrollo del proyecto." },
    { id: "3.3", stage: 3, text: "Gestión legal and administrativa adecuada para la compra o el traspaso y/o compra de otros bienes inmuebles." },
    { id: "3.4", stage: 3, text: "Cumplimiento de plazos asociados a este servicio (traspasos recepciones, inscripciones.. etc.)" },
    { id: "3.5", stage: 3, text: "Calidad de la atención legal a usuarios/beneficiarios" },
    { id: "3.6", stage: 3, text: "Calidad y disponibilidad de información y/o antecedentes solicitados por otros organismos públicos y privados" },
    { id: "3.7", stage: 3, text: "Efectiva coordinación técnica general." },
    // ETAPA 4
    { id: "4.1", stage: 4, text: "Calidad en la gestión y desarrollo del (los) servicio (s) de asistencia técnica" },
    { id: "4.2", stage: 4, text: "Calidad de la atención a usuarios/beneficiarios" },
    { id: "4.3", stage: 4, text: "Adecuada relación y coordinación con proveedores y otras entidades públicas y privadas relacionadas con el desarrollo material del proyecto." },
    { id: "4.4", stage: 4, text: "Resolución oportuna de observaciones al (los) proyecto (s) y a problemas técnicos, financieros ,sociales o administrativos durante su ejecución." },
    { id: "4.5", stage: 4, text: "Verificación oportuna del cumplimiento de las obligaciones contractuales y laborales de la empresa Constructora." },
    { id: "4.6", stage: 4, text: "Realización oportuna de las modificaciones del proyecto cuando corresponda." },
    { id: "4.7", stage: 4, text: "Calidad y disponibilidad de información y/o antecedentes del proyecto solicitados oportunamente." },
    { id: "4.8", stage: 4, text: "Coordinación adecuada con otros organismos para verificar el término del proyecto y con la empresa constructora para aprobar el proceso de post venta." },
    { id: "4.9", stage: 4, text: "Gestión técnica y administrativa oportuna respecto de temas relacionados con subsidios (prórrogas, reemplazos, etc)" },
    { id: "4.10", stage: 4, text: "Efectiva coordinación institucional." },
    // ETAPA 5
    { id: "5.1", stage: 5, text: "Calidad en la gestión y desarrollo del (los) servicio (s) de asistencia técnica" },
    { id: "5.2", stage: 5, text: "Calidad del acompañamiento social a usuarios/beneficiarios" },
    { id: "5.3", stage: 5, text: "Desarrollo adecuado y oportuno de talleres y/o jornadas de capacitación a las familias sobre temas vinculados a derechos y deberes como propietarios." },
    { id: "5.4", stage: 5, text: "Entrega oportuna sobre información del avance del proyecto a las familias y/o modificaciones a éste durante su desarrollo." },
    { id: "5.5", stage: 5, text: "Capacidad de resolver conflictos entre las familias y/o entre las familias y la Empresa Construcción." },
    { id: "5.6", stage: 5, text: "Presencia activa de profesionales del área social en las actividades en terreno." },
    { id: "5.7", stage: 5, text: "Efectiva coordinación técnica del área social." },
    // ETAPA 6
    { id: "6.1", stage: 6, text: "Calidad en la gestión y desarrollo del (los) servicio (s) de asistencia técnica" },
    { id: "6.2", stage: 6, text: "Calidad de la atención a usuarios/beneficiarios durante el proceso de instalación de las familias en sus viviendas y barrios cuando corresponda." },
    { id: "6.3", stage: 6, text: "Cumplimiento de plazos en el desarrollo de los servicios asociados a la post entrega." },
    { id: "6.4", stage: 6, text: "Desarrollo oportuno de talleres y/o capacitaciones sobre el uso y cuidado de la vivienda a las familias." },
    { id: "6.5", stage: 6, text: "Entrega de información pertinente y oportuna a las familias sobre la existencia y funcionamiento de servicios y organismos locales." },
    { id: "6.6", stage: 6, text: "Entrega de información confiable sobre ocupación de las viviendas." },
    { id: "6.7", stage: 6, text: "Calidad y disponibilidad de información y/o antecedentes solicitados." },
    { id: "6.8", stage: 6, text: "Desarrollo oportuno de talleres de capacitación a las familias acerca del proceso de vida en comunidad y ley de copropiedad inmobiliaria cuando corresponda" },
    { id: "6.9", stage: 6, text: "Efectiva coordinación de cierre final." }
];

const STAGES_METADATA = {
    1: { title: "ETAPA 1. ORGANIZACIÓN DE LA DEMANDA / DIAGNÓSTICO TÉCNICO Y/O SOCIAL", desc: "Comprende: diagnóstico del estado de la situación de las familias y/o su necesidad habitacional,..." },
    2: { title: "ETAPA 2. ELABORACIÓN Y PRESENTACIÓN DE PROYECTOS", desc: "Comprende: desarrollo integral de los diseños arquitectónicos, de loteos, de especialidades técnicas e ingeniería estructural; cubicaciones, presupuestos detallados y especificaciones técnicas normativas..." },
    3: { title: "ETAPA 3. GESTIÓN LEGAL", desc: "Comprende: apoyo jurídico para el desarrollo y ejecución del proyecto, asesoría legal para la regularización de inmuebles, asesoría para la recepción de las obras y la elaboración..." },
    4: { title: "ETAPA 4. GESTIÓN TÉCNICA Y ADMINISTRATIVA DE PROYECTOS", desc: "Comprende: realización de actividades de seguimiento del proyecto en todas sus etapas, relación y coordinación con entidades públicas y privadas..." },
    5: { title: "ETAPA 5. ACOMPAÑAMIENTO SOCIAL DURANTE LA EJECUCIÓN DEL PROYECTO", desc: "Comprende: Entrega de información a las familias sobre avance y desarrollo del proyecto durante su ejecución, coordinar visitas programadas de las familias a las obras..." },
    6: { title: "ETAPA 6. ASESORÍA TÉCNICA Y SOCIAL PARA LA POST ENTREGA", desc: "Comprende: realización de reuniones o talleres de capacitación para abordar el uso y cuidado de las viviendas, información y vinculación con redes comunitarias..." }
};

let currentUser = null, currentRole = null, currentStage = 1, currentCoverage = "", deadlineExpired = false;
let dbInstance = null, dbItems = [], dbScores = {}, allMemoryScores = [], allAsignacionesMapped = [];

// Estado del módulo histórico
let historicoConfig = null;
let historicoStage = 1;
let historicoScores = {};
let historicoMemory = [];

let adminSelectedProvincia = "";
let adminTemporaryLogisticaMap = {}; 
let adminTemporaryEntidades = [];
let pendingAsignacionesStaging = []; 
let currentScreenStaging = null;
let countdownInterval = null;
let savedDeadlineISO = "";

let currentSortCol = -1;
let currentSortAsc = true;
let monitoringData = [];

// Estado para sincronización selectiva
let pendingSyncChanges = null;
let selectedSyncChanges = null;

let currentEditingEntidadId = null;
let currentEditingEvaluadorRut = null;

let entidadesSortCol = -1;
let entidadesSortAsc = true;
let evaluadoresSortCol = -1;
let evaluadoresSortAsc = true;
let adminTemporaryEvaluadores = [];
let reportesSortCol = -1;
let reportesSortAsc = true;
let hasUnsavedEvaluatorChanges = false;

/* ================= FUNCIONES AUXILIARES (REDUCCIÓN DE CÓDIGO) ================= */
function formatDDMMYYYY(dateObj) {
    const d = dateObj.getDate().toString().padStart(2, '0');
    const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}-${m}-${y}`;
}

function formatDateTime(dateObj) {
    return formatDDMMYYYY(dateObj) + " " + dateObj.toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'});
}

function parseAnyDate(dateStr) {
    if (!dateStr) return 0;
    let ts = new Date(dateStr).getTime();
    if (!isNaN(ts)) return ts;
    let parts = dateStr.split(' ');
    if (parts.length === 2) {
        let dP = parts[0].split('-'), tP = parts[1].split(':');
        if (dP.length === 3 && tP.length >= 2) {
            return new Date(dP[2], dP[1]-1, dP[0], tP[0], tP[1]).getTime();
        }
    }
    return 0;
}

function closeModal() {
    toggleElement('audit-modal', false);
}

function toggleElement(id, show) {
    const el = document.getElementById(id);
    if (!el) return;
    if (show) el.classList.remove('hidden'); else el.classList.add('hidden');
}

function clearFormInputs(ids) {
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function dbGetAll(storeName, callback, forceCloud = false) {
    if (CLOUD_MODE_ENABLED && forceCloud) {
        showProgressBar(`Conectando al servidor: ${storeName}...`);
        cloudGet(storeName).then(data => {
            if (data !== null && Array.isArray(data)) {
                const tx = dbInstance.transaction([storeName], 'readwrite');
                // NO borrar datos locales, solo actualizar/agregar registros del servidor
                data.forEach(item => tx.objectStore(storeName).put(item));
                tx.oncomplete = () => {
                    hideProgressBar();
                    callback(data);
                };
            } else {
                hideProgressBar();
                dbInstance.transaction([storeName], 'readonly').objectStore(storeName).getAll().onsuccess = (e) => callback(e.target.result);
            }
        });
    } else {
        dbInstance.transaction([storeName], 'readonly').objectStore(storeName).getAll().onsuccess = (e) => callback(e.target.result);
    }
}

function getMultipleStores(storeNames, callback, forceCloud = false) {
    // Verificar que todas las tablas existan antes de proceder
    const missingStores = storeNames.filter(name => !dbInstance.objectStoreNames.contains(name));
    if (missingStores.length > 0) {
        console.error('Tablas faltantes en IndexedDB:', missingStores);
        alert('Error: La base de datos local está desactualizada.\n\nPor favor, recargue la página o sincronice desde la nube.');
        callback(storeNames.map(() => []));
        return;
    }
    
    if (CLOUD_MODE_ENABLED && forceCloud) {
        console.log('🔄 Iniciando sincronización forzada desde la nube...');
        showProgressBar(`Sincronizando base de datos...`);
        updateProgressBar(0);
        
        // Sincronizar cada tabla individualmente con manejo de errores robusto
        const results = new Array(storeNames.length);
        const settled = new Array(storeNames.length).fill(false); // previene doble conteo entre timeout y cloudGet
        let completed = 0;
        let hasErrors = false;

        // Inicializar resultados con arrays vacíos para evitar undefined
        storeNames.forEach((_, i) => { results[i] = []; });
        
        const finalize = () => {
            console.log('📊 Resultados de sincronización:', storeNames.map((s, i) => `${s}: ${results[i].length} registros`).join(', '));
            
            // IMPORTANTE: No borrar datos locales, solo actualizar/agregar registros del servidor
            const tx = dbInstance.transaction(storeNames, 'readwrite');
            let writeCompleted = 0;
            let writeTotal = 0;
            
            storeNames.forEach((storeName, idx) => {
                if (results[idx] !== undefined && Array.isArray(results[idx]) && results[idx].length > 0) {
                    writeTotal++;
                    const storeObj = tx.objectStore(storeName);
                    results[idx].forEach(item => {
                        storeObj.put(item);
                    });
                }
            });
            
            console.log(`💾 Escribiendo ${writeTotal} tablas en IndexedDB...`);
            
            if (writeTotal === 0) {
                // No hay datos para escribir, leer directamente
                hideProgressBar();
                const readTx = dbInstance.transaction(storeNames, 'readonly');
                const finalResults = new Array(storeNames.length);
                let readCompleted = 0;
                storeNames.forEach((storeName, idx) => {
                    readTx.objectStore(storeName).getAll().onsuccess = (e) => {
                        finalResults[idx] = e.target.result;
                        readCompleted++;
                        if (readCompleted === storeNames.length) {
                            console.log('✅ Datos finales leídos de IndexedDB:', finalResults.map(r => r.length).join(', '));
                            callback(finalResults);
                        }
                    };
                });
                return;
            }
            
            tx.oncomplete = () => {
                hideProgressBar();
                console.log('✅ Datos escritos en IndexedDB correctamente');
                if (hasErrors) {
                    alert('⚠️ Algunas tablas no se pudieron sincronizar completamente. Se utilizaron datos locales o parciales del servidor.');
                }
                // Leer datos finales de IndexedDB
                const readTx = dbInstance.transaction(storeNames, 'readonly');
                const finalResults = new Array(storeNames.length);
                let readCompleted = 0;
                storeNames.forEach((storeName, idx) => {
                    readTx.objectStore(storeName).getAll().onsuccess = (e) => {
                        finalResults[idx] = e.target.result;
                        readCompleted++;
                        if (readCompleted === storeNames.length) {
                            console.log('✅ Datos finales leídos de IndexedDB:', finalResults.map(r => r.length).join(', '));
                            callback(finalResults);
                        }
                    };
                });
            };
        };
        
        // markDone: registra el resultado de un store exactamente una vez (evita doble conteo)
        const markDone = (i, data) => {
            if (settled[i]) return;
            settled[i] = true;
            results[i] = data;
            completed++;
            updateProgressBar((completed / storeNames.length) * 100);
            if (completed === storeNames.length) finalize();
        };

        // readLocalFallback: lee IndexedDB local y llama markDone cuando termina (evita timing bug async)
        const readLocalFallback = (store, i, label) => {
            hasErrors = true;
            const localTx = dbInstance.transaction([store], 'readonly');
            const req = localTx.objectStore(store).getAll();
            req.onsuccess = (e) => {
                console.log(`📂 ${label} ${store}: ${e.target.result.length} registros`);
                markDone(i, e.target.result);
            };
            req.onerror = () => {
                console.error(`❌ Error leyendo datos locales de ${store}`);
                markDone(i, []);
            };
        };

        storeNames.forEach((store, i) => {
            updateProgressBar((i / storeNames.length) * 100);
            document.getElementById('progress-title').textContent = `Sincronizando ${store}... (${i + 1}/${storeNames.length})`;
            console.log(`📡 Solicitando ${store} desde el servidor...`);

            // Timeout de 10 segundos: si cloudGet no respondió, usa datos locales
            setTimeout(() => {
                if (!settled[i]) {
                    console.warn(`⏱️ Timeout sincronizando ${store} (10s)`);
                    readLocalFallback(store, i, 'Timeout - datos locales de');
                }
            }, 10000);

            cloudGet(store).then(data => {
                if (data !== null && Array.isArray(data)) {
                    console.log(`✅ ${store} recibido desde servidor: ${data.length} registros`);
                    markDone(i, data);
                } else {
                    console.warn(`⚠️ Servidor devolvió respuesta inválida para ${store}. Usando datos locales.`);
                    readLocalFallback(store, i, 'Respuesta inválida - datos locales de');
                }
            }).catch(err => {
                console.error(`❌ Error de red al sincronizar ${store}:`, err);
                readLocalFallback(store, i, 'Error de red - datos locales de');
            });
        });
    } else {
        console.log('📂 Leyendo datos locales (sin sincronización forzada)');
        const tx = dbInstance.transaction(storeNames, 'readonly');
        const results = new Array(storeNames.length);
        let completed = 0;
        let hasError = false;
        
        storeNames.forEach((store, i) => {
            tx.objectStore(store).getAll().onsuccess = (e) => {
                results[i] = e.target.result;
                completed++;
                if (completed === storeNames.length) {
                    console.log('✅ Datos locales leídos:', results.map(r => r.length).join(', '));
                    callback(results);
                }
            };
            tx.objectStore(store).getAll().onerror = (e) => {
                console.error(`Error leyendo tabla ${store}:`, e.target.error);
                hasError = true;
                results[i] = [];
                completed++;
                if (completed === storeNames.length) {
                    if (hasError) {
                        alert('⚠️ Error al leer datos locales. Se recomienda sincronizar desde la nube.');
                    }
                    callback(results);
                }
            };
        });
    }
}

/* ================= MOTOR DE NUBE (GOOGLE APPS SCRIPT) ================= */
// Mapa de versiones del servidor por tabla. Se actualiza con cada lectura/escritura.
const serverVersions = {};

async function cloudGet(table) {
    try {
        // Agregamos &t=Date.now() para forzar al navegador a ignorar el caché y obtener la info fresca real
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?table=${table}&t=${Date.now()}`);
        if (!response.ok) return null;
        const payload = await response.json();
        if (payload && typeof payload.serverVersion === 'number') {
            serverVersions[table] = payload.serverVersion;
        }
        return Array.isArray(payload) ? payload : (payload.data || []);
    } catch (error) {
        console.error(`Error leyendo tabla ${table} desde el servidor:`, error);
        return null;
    }
}

/**
 * Obtiene los proyectos filtrados por programa y entidad desde las pestañas 49_py o 27_py.
 * @param {string} programa - DS49, DS27 o DS10.
 * @param {string} entidad - Nombre de la entidad (opcional).
 * @returns {Promise<Array>} Lista de proyectos.
 */
async function cloudGetProjects(programa, entidad = '') {
    try {
        const url = `${GOOGLE_SCRIPT_URL}?action=getProjects&programa=${encodeURIComponent(programa)}&entidad=${encodeURIComponent(entidad)}&t=${Date.now()}`;
        console.log('📤 Buscando proyectos:', { programa, entidad, url });
        const response = await fetch(url);
        if (!response.ok) {
            console.error('❌ Error HTTP:', response.status);
            return [];
        }
        const payload = await response.json();
        console.log('📥 Respuesta de proyectos:', payload);
        const result = Array.isArray(payload) ? payload : (payload.data || []);
        console.log('✅ Proyectos procesados:', result.length, 'encontrados');
        return result;
    } catch (error) {
        console.error('❌ Error leyendo proyectos desde el servidor:', error);
        return [];
    }
}

async function cloudSave(table, dataArray, mode = 'incremental', options = {}) {
    try {
        const clientVersion = serverVersions[table] || 1;
        const body = {
            table,
            data: dataArray,
            mode,
            clientVersion
        };
        if (options.forceVersion) {
            body.forceVersion = true;
        }
        // Enviar como texto plano (text/plain) evita que el navegador bloquee la solicitud por CORS
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(body)
        });
        const result = await response.json();
        if (result && typeof result.serverVersion === 'number') {
            serverVersions[table] = result.serverVersion;
        }
        return result;
    } catch (error) {
        console.error(`Error guardando en tabla ${table}:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Muestra doble advertencia antes de operaciones destructivas en el servidor.
 * @param {string} operationName - Nombre legible de la operación.
 * @param {string} detail - Detalle adicional a mostrar.
 * @returns {boolean} true si el usuario confirma ambas advertencias.
 */
function confirmDoubleWarning(operationName, detail = '') {
    const first = `⚠️ ADVERTENCIA 1/2\n\nEstá a punto de realizar: ${operationName}.\n${detail ? detail + '\n' : ''}\nEsta acción afectará los datos compartidos en el servidor y podría impactar a otros usuarios conectados.\n\n¿Desea continuar?`;
    if (!confirm(first)) return false;

    const second = `⚠️ ADVERTENCIA 2/2 - CONFIRMACIÓN FINAL\n\nPor favor, confirme nuevamente que desea ${operationName.toLowerCase()}.\n\nUna vez ejecutada, esta acción no se puede deshacer desde el sistema.\n\n¿Confirma definitivamente?`;
    return confirm(second);
}

/**
 * Maneja una respuesta de conflicto de versión del servidor.
 * Ofrece al usuario forzar la escritura con doble advertencia o cancelar.
 * @param {string} table - Nombre de la tabla.
 * @param {object} res - Respuesta del servidor.
 * @returns {Promise<boolean>} true si el usuario decide forzar.
 */
async function handleVersionConflict(table, res) {
    const detail = `La tabla "${table}" tiene una versión más reciente en el servidor (v${res.serverVersion}) que la copia local (v${res.clientVersion}).`;
    const force = confirmDoubleWarning(
        `FORZAR ESCRITURA EN SERVIDOR - ${table.toUpperCase()}`,
        `${detail}\n\nSi fuerza la escritura, podría sobrescribir cambios realizados por otro usuario.`
    );
    return force;
}

let syncCancelRequested = false;

function requestSyncCancel() {
    syncCancelRequested = true;
    hideProgressBar();
    alert('Sincronización cancelada por el usuario. No se perdieron datos locales.');
}

function downloadAutoBackupJSON() {
    const storeNames = ['configuracion', 'entidades', 'evaluadores', 'asignaciones', 'items', 'scores', 'historicos', 'asigna_historico'];
    const tx = dbInstance.transaction(storeNames, 'readonly');
    const backupData = {};
    let completed = 0;

    storeNames.forEach((storeName) => {
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = (e) => {
            backupData[storeName] = e.target.result;
            completed++;
            if (completed === storeNames.length) {
                try {
                    const jsonString = JSON.stringify(backupData, null, 2);
                    const blob = new Blob([jsonString], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Respaldo_Auto_${formatDDMMYYYY(new Date())}_${Date.now()}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (err) {
                    console.error('Error descargando respaldo JSON:', err);
                }
            }
        };
    });
}

function syncSingleStoreToCloud(storeName, callback, options = {}) {
    if (!CLOUD_MODE_ENABLED) {
        if (callback) callback(true);
        return;
    }

    // Doble advertencia antes de escribir en el servidor
    if (!options.skipWarning) {
        const confirmed = confirmDoubleWarning(
            `SINCRONIZAR ${storeName.toUpperCase()} CON LA NUBE`,
            `Se enviarán los datos locales de "${storeName}" al servidor compartido.`
        );
        if (!confirmed) {
            if (callback) callback(false);
            return;
        }
    }

    showProgressBar(`Sincronizando ${storeName} con la Nube...`);

    const req = dbInstance.transaction([storeName], 'readonly').objectStore(storeName).getAll();
    req.onsuccess = (e) => {
        cloudSave(storeName, e.target.result, 'incremental', options).then(res => {
            hideProgressBar();
            if (res && res.success) {
                if (callback) callback(true);
            } else if (res && res.versionConflict) {
                handleVersionConflict(storeName, res).then(force => {
                    if (force) {
                        syncSingleStoreToCloud(storeName, callback, { ...options, forceVersion: true, skipWarning: true });
                    } else {
                        alert('Sincronización cancelada. Se mantienen los datos locales.');
                        if (callback) callback(false);
                    }
                });
            } else {
                alert(`Error al sincronizar con la Nube: ${res ? res.error : 'Respuesta inválida del servidor.'}`);
                if (callback) callback(false);
            }
        }).catch(err => {
            console.error(`Error de red al sincronizar ${storeName}:`, err);
            hideProgressBar();
            alert('Error de red al sincronizar. Verifique su conexión a internet.');
            if (callback) callback(false);
        });
    };
    req.onerror = (e) => {
        hideProgressBar();
        alert('Error al leer datos locales para sincronizar.');
        if (callback) callback(false);
    }
}

/* NUEVA FUNCIÓN DE SINCRONIZACIÓN MASIVA MANUAL */
function syncAllToCloud() {
    if (!CLOUD_MODE_ENABLED) {
        alert('El modo nube está desactivado.');
        return;
    }

    // Doble advertencia antes de sincronización masiva
    const confirmed = confirmDoubleWarning(
        'SINCRONIZACIÓN MASIVA A LA NUBE',
        'Se compararán todos los datos locales con el servidor y se enviarán los cambios seleccionados. Esto afecta a todos los usuarios conectados.'
    );
    if (!confirmed) return;

    syncCancelRequested = false;

    // 1. Descargar respaldo JSON local automáticamente
    downloadAutoBackupJSON();

    // 2. Obtener datos locales y remotos para comparar
    showProgressBar("Analizando cambios...");
    updateProgressBar(0);
    
    const storeNames = ['configuracion', 'entidades', 'evaluadores', 'asignaciones', 'items', 'scores', 'historicos', 'asigna_historico'];
    const localData = {};
    const remoteData = {};
    
    // Leer datos locales
    const localTx = dbInstance.transaction(storeNames, 'readonly');
    let localCompleted = 0;
    
    storeNames.forEach(storeName => {
        const req = localTx.objectStore(storeName).getAll();
        req.onsuccess = (e) => {
            localData[storeName] = e.target.result;
            localCompleted++;
            if (localCompleted === storeNames.length) {
                // Leer datos remotos
                updateProgressBar(50);
                document.getElementById('progress-title').textContent = 'Comparando con servidor...';
                
                Promise.all(storeNames.map(store => cloudGet(store))).then(remoteResults => {
                    updateProgressBar(80);
                    
                    remoteResults.forEach((data, idx) => {
                        remoteData[storeNames[idx]] = data || [];
                    });
                    
                    // Calcular diferencias
                    const changes = calculateChanges(localData, remoteData);
                    
                    if (changes.totalChanges === 0) {
                        hideProgressBar();
                        alert('✅ No hay cambios para sincronizar. Los datos locales y remotos están sincronizados.');
                        return;
                    }
                    
                    // Mostrar modal de confirmación
                    showSyncConfirmationModal(changes, storeNames);
                });
            }
        };
    });
}

function calculateChanges(localData, remoteData) {
    const changes = {
        totalChanges: 0,
        byStore: {},
        details: {}
    };
    
    const storeNames = Object.keys(localData);
    
    storeNames.forEach(storeName => {
        const local = localData[storeName] || [];
        const remote = remoteData[storeName] || [];
        
        const localMap = new Map(local.map(item => {
            const key = getItemKey(storeName, item);
            return [key, item];
        }));
        
        const remoteMap = new Map(remote.map(item => {
            const key = getItemKey(storeName, item);
            return [key, item];
        }));
        
        const added = [];
        const modified = [];
        
        // Detectar agregados y modificados locales
        local.forEach(localItem => {
            const key = getItemKey(storeName, localItem);
            const remoteItem = remoteMap.get(key);
            
            if (!remoteItem) {
                added.push({ key, local: localItem, remote: null });
            } else if (JSON.stringify(localItem) !== JSON.stringify(remoteItem)) {
                modified.push({ key, local: localItem, remote: remoteItem });
            }
        });
        
        const changeCount = added.length + modified.length;
        changes.totalChanges += changeCount;
        changes.byStore[storeName] = changeCount;
        changes.details[storeName] = { added, modified };
    });
    
    return changes;
}

function getItemKey(storeName, item) {
    switch(storeName) {
        case 'items': return item.id;
        case 'scores': return item.idTx;
        case 'evaluadores': return item.rut;
        case 'asignaciones': return item.idAsig;
        case 'configuracion': return item.clave;
        case 'entidades': return item.idEntidad;
        case 'historicos': return item.idHist;
        case 'asigna_historico': return item.idAsig;
        default: return JSON.stringify(item);
    }
}

function showSyncConfirmationModal(changes, storeNames) {
    const modal = document.getElementById('audit-modal');
    document.getElementById('modal-title').textContent = 'Confirmar Sincronización con la Nube';
    toggleElement('modal-table-container', false);
    toggleElement('modal-overwrite-question', false);
    toggleElement('modal-action-footer', true);
    
    // Guardar cambios pendientes para selección
    pendingSyncChanges = changes;
    selectedSyncChanges = null;
    
    let html = `
        <div style="background:#FFF3CD; border-left:4px solid #856404; padding:10px; border-radius:4px; margin-bottom:10px; font-size:0.85rem;">
            <strong>Resumen de cambios:</strong> Se detectaron <strong>${changes.totalChanges}</strong> registros diferentes entre local y servidor.
        </div>
        <div style="max-height:400px; overflow-y:auto; margin-bottom:10px;">
    `;
    
    storeNames.forEach(storeName => {
        const count = changes.byStore[storeName];
        if (count === 0) return;
        
        const details = changes.details[storeName];
        html += `<div style="margin-bottom:10px;"><strong>${storeName.toUpperCase()}</strong> (${count} cambios)</div>`;
        
        details.added.forEach((item, idx) => {
            html += `
                <div style="background:#D4EDDA; padding:8px; border-left:3px solid #28A745; margin-bottom:4px; font-size:0.82rem; display:flex; align-items:center; gap:8px;">
                    <input type="checkbox" class="sync-change-check" data-store="${storeName}" data-type="added" data-key="${item.key}" data-idx="${idx}" checked>
                    <div style="flex:1;">
                        <strong>[AGREGADO]</strong> ${item.key}
                    </div>
                </div>
            `;
        });
        
        details.modified.forEach((item, idx) => {
            html += `
                <div style="background:#FFF3CD; padding:8px; border-left:3px solid #FFC107; margin-bottom:4px; font-size:0.82rem; display:flex; align-items:center; gap:8px;">
                    <input type="checkbox" class="sync-change-check" data-store="${storeName}" data-type="modified" data-key="${item.key}" data-idx="${idx}" checked>
                    <div style="flex:1;">
                        <strong>[MODIFICADO]</strong> ${item.key}
                    </div>
                </div>
            `;
        });
    });
    
    html += `
        </div>
        <div style="background:#F8F9FA; padding:10px; border-radius:4px; font-size:0.85rem;">
            <strong>Opciones:</strong>
            <ul style="margin:5px 0 0 15px; padding:0;">
                <li><strong>Aceptar seleccionados:</strong> Sincroniza solo los cambios marcados</li>
                <li><strong>Aceptar todos:</strong> Sincroniza todos los cambios locales al servidor</li>
                <li><strong>Cancelar:</strong> No realiza cambios y mantiene datos locales</li>
            </ul>
        </div>
    `;
    
    document.getElementById('modal-custom-html-body').innerHTML = html;
    
    // Cambiar comportamiento del botón confirmar
    const confirmBtn = document.getElementById('btn-modal-confirm');
    confirmBtn.textContent = 'Aceptar Seleccionados';
    confirmBtn.onclick = () => {
        const selected = getSelectedChanges(changes, storeNames);
        if (selected.totalChanges === 0) {
            alert('No hay cambios seleccionados para sincronizar.');
            return;
        }
        closeModal();
        executeSyncAllToCloud(selected, storeNames);
    };
    
    // Agregar botón aceptar todos
    const cancelBtn = document.getElementById('btn-modal-cancel');
    cancelBtn.textContent = 'Aceptar Todos';
    cancelBtn.onclick = () => {
        closeModal();
        executeSyncAllToCloud(changes, storeNames);
    };
    
    toggleElement('audit-modal', true);
}

function getSelectedChanges(changes, storeNames) {
    const selected = {
        totalChanges: 0,
        byStore: {},
        details: {}
    };
    
    const checkboxes = document.querySelectorAll('.sync-change-check:checked');
    
    checkboxes.forEach(chk => {
        const storeName = chk.getAttribute('data-store');
        const type = chk.getAttribute('data-type');
        const key = chk.getAttribute('data-key');
        const idx = parseInt(chk.getAttribute('data-idx'));
        
        if (!selected.details[storeName]) {
            selected.details[storeName] = { added: [], modified: [] };
        }
        
        const originalItem = changes.details[storeName][type][idx];
        if (originalItem) {
            selected.details[storeName][type].push(originalItem);
            selected.totalChanges++;
            selected.byStore[storeName] = (selected.byStore[storeName] || 0) + 1;
        }
    });
    
    return selected;
}

function executeSyncAllToCloud(changes, storeNames) {
    // Doble advertencia final antes de escribir en el servidor
    const confirmed = confirmDoubleWarning(
        'CONFIRMAR ESCRITURA EN SERVIDOR',
        `Se enviarán cambios a ${Object.keys(changes.byStore).filter(s => changes.byStore[s] > 0).length} tabla(s) al servidor compartido.`
    );
    if (!confirmed) {
        hideProgressBar();
        alert('Sincronización cancelada. No se realizaron cambios en el servidor.');
        return;
    }

    showProgressBar("Sincronizando con la Nube...");
    updateProgressBar(0);

    // Crear respaldo en Google Sheets primero
    cloudSave('__backup__', [], 'backup').then(backupRes => {
        if (syncCancelRequested) return;
        
        let completed = 0;
        const storesToSync = [];
        
        // Determinar qué tablas necesitan sincronización
        if (changes && changes.totalChanges > 0) {
            // Sincronización selectiva: solo tablas con cambios
            Object.keys(changes.byStore).forEach(store => {
                if (changes.byStore[store] > 0) {
                    storesToSync.push(store);
                }
            });
        } else {
            // Sincronización completa: todas las tablas
            storesToSync.push(...storeNames);
        }
        
        const syncNext = (index) => {
            if (syncCancelRequested) return;
            
            if (index >= storesToSync.length) {
                updateProgressBar(100);
                setTimeout(() => {
                    hideProgressBar();
                    alert('✅ Sincronización completada con éxito. Los datos han sido enviados a Google Sheets.');
                }, 500);
                return;
            }
            
            const storeName = storesToSync[index];
            updateProgressBar((index / storesToSync.length) * 100);
            document.getElementById('progress-title').textContent = `Enviando ${storeName}... (${index + 1}/${storesToSync.length})`;
            
            const req = dbInstance.transaction([storeName], 'readonly').objectStore(storeName).getAll();
            req.onsuccess = (e) => {
                if (syncCancelRequested) return;
                let dataToSend = e.target.result;
                
                // Si hay cambios seleccionados, filtrar solo esos registros
                if (changes && changes.totalChanges > 0 && changes.details[storeName]) {
                    const storeChanges = changes.details[storeName];
                    const keysToSend = new Set();
                    
                    // Recopilar claves de registros modificados
                    storeChanges.modified.forEach(item => {
                        keysToSend.add(item.key);
                    });
                    
                    // Recopilar claves de registros agregados
                    storeChanges.added.forEach(item => {
                        keysToSend.add(item.key);
                    });
                    
                    // Filtrar datos locales para enviar solo los cambios
                    if (keysToSend.size > 0) {
                        dataToSend = dataToSend.filter(item => {
                            const key = getItemKey(storeName, item);
                            return keysToSend.has(key);
                        });
                    }
                }
                
                if (storeName === 'historicos') {
                    dataToSend = transformHistoricosToWideRows(dataToSend);
                }
                
                cloudSave(storeName, dataToSend, 'incremental').then(res => {
                    if (syncCancelRequested) return;
                    if (res && res.versionConflict) {
                        hideProgressBar();
                        handleVersionConflict(storeName, res).then(force => {
                            if (force) {
                                showProgressBar("Sincronizando con la Nube...");
                                cloudSave(storeName, dataToSend, 'incremental', { forceVersion: true }).then(() => {
                                    if (!syncCancelRequested) syncNext(index + 1);
                                }).catch(() => {
                                    if (!syncCancelRequested) syncNext(index + 1);
                                });
                            } else {
                                alert(`Sincronización de ${storeName} cancelada. Se continuará con las siguientes tablas.`);
                                syncNext(index + 1);
                            }
                        });
                        return;
                    }
                    syncNext(index + 1);
                }).catch(err => {
                    console.error(`Error de red al sincronizar ${storeName}:`, err);
                    if (!syncCancelRequested) syncNext(index + 1);
                });
            };
        };
        
        syncNext(0);
    }).catch(err => {
        hideProgressBar();
        console.error('Error creando respaldo en Google Sheets:', err);
        alert('No se pudo crear el respaldo en Google Sheets. La sincronización se ha cancelado para proteger los datos.');
    });
}

function handleRestoreBackupJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const backupData = JSON.parse(e.target.result);
            const storeNames = Object.keys(backupData);
            const tx = dbInstance.transaction(storeNames, 'readwrite');
            storeNames.forEach(storeName => {
                const store = tx.objectStore(storeName);
                store.clear().onsuccess = () => {
                    (backupData[storeName] || []).forEach(item => store.put(item));
                };
            });
            tx.oncomplete = () => {
                alert('Respaldo restaurado correctamente. Recargue la página para ver los cambios.');
            };
            tx.onerror = () => {
                alert('Error al restaurar el respaldo.');
            };
        } catch (err) {
            alert('El archivo seleccionado no es un respaldo válido.');
        }
    };
    reader.readAsText(file);
}

function downloadHistoricosFromCloud() {
    if (!CLOUD_MODE_ENABLED) {
        alert('El modo nube está desactivado.');
        return;
    }
    const confirmed = confirmDoubleWarning(
        'DESCARGAR ASIGNACIONES DESDE LA NUBE',
        'Esta acción descargará todas las asignaciones de evaluadores desde el servidor a la base de datos local.'
    );
    if (!confirmed) return;

    showProgressBar('Descargando asignaciones desde la Nube...');

    cloudGet('asignaciones').then(asignaciones => {
        console.log('📥 Datos recibidos del servidor:', asignaciones);

        // Validar que la tabla exista en IndexedDB
        if (!dbInstance.objectStoreNames.contains('asignaciones')) {
            hideProgressBar();
            alert('Error: La base de datos local no tiene la tabla de asignaciones.\n\nPor favor, recargue la página para inicializar la base de datos.');
            return;
        }

        if (!asignaciones || asignaciones.length === 0) {
            hideProgressBar();
            alert('⚠️ ADVERTENCIA: No se encontraron asignaciones en el servidor.\n\nVerifique que la tabla "asignaciones" tenga datos en el Google Sheet.');
            console.warn('Asignaciones vacías o null:', asignaciones);
            return;
        }

        const tx = dbInstance.transaction(['asignaciones'], 'readwrite');
        const asigStore = tx.objectStore('asignaciones');

        let asigCount = 0;

        // Limpiar y guardar asignaciones
        asigStore.clear().onsuccess = () => {
            if (Array.isArray(asignaciones)) {
                console.log('💾 Guardando', asignaciones.length, 'asignaciones en IndexedDB');
                asignaciones.forEach(a => {
                    try {
                        asigStore.put(a);
                        asigCount++;
                    } catch (e) {
                        console.error('Error guardando asignación:', a, e);
                    }
                });
            }
        };

        tx.oncomplete = () => {
            hideProgressBar();
            console.log('✅ Transacción completada con', asigCount, 'registros');
            alert(`Asignaciones descargadas correctamente.\n\nRegistros guardados: ${asigCount}`);
        };

        tx.onerror = (e) => {
            hideProgressBar();
            console.error('Error en transacción de IndexedDB:', e.target.error);
            alert('Error al guardar los datos descargados localmente.\n\nDetalle: ' + (e.target.error ? e.target.error.message : 'Error desconocido'));
        };
    }).catch(err => {
        hideProgressBar();
        console.error('Error descargando asignaciones:', err);
        alert('Error de red al descargar asignaciones.\n\nVerifique su conexión a internet e intente nuevamente.\n\nDetalle: ' + err.message);
    });
}
/* =============================================================================== */

function getStatusInfo(score) {
    if (score >= 80) return { text: "BUENO", bg: "var(--color-bueno)", color: "#000" };
    if (score >= 51) return { text: "ACEPTABLE", bg: "var(--color-aceptable)", color: "#000" };
    return { text: "MALO", bg: "var(--color-malo)", color: "#FFF" };
}

function buildCoberturaLabel(programa, provincia, entidadNombre) {
    return `${programa} - ${provincia.toUpperCase()}${entidadNombre && entidadNombre !== 'Sin Entidad' ? ` - ${entidadNombre}` : ''}`;
}

function showProgressBar(title) {
    document.getElementById('progress-title').textContent = title;
    updateProgressBar(0);
    toggleElement('progress-overlay', true);
}

function updateProgressBar(percent) {
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    const fill = document.getElementById('progress-bar-fill');
    const txt = document.getElementById('progress-text');
    if (fill) fill.style.width = p + '%';
    if (txt) txt.textContent = p + '%';
}

function hideProgressBar() { toggleElement('progress-overlay', false); }
/* =============================================================================== */


function parseSafeDate(isoString) {
    if (!isoString) return null;
    let clean = isoString.substring(0, 10);
    const parts = clean.split('-');
    if (parts.length !== 3) return null;
    let y = parts[0].length === 4 ? parts[0] : parts[2];
    let d = parts[0].length === 4 ? parts[2] : parts[0];
    let m = parts[1];
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10), 23, 59, 59);
}

// NUEVA VERSIÓN V22: MÓDULO DE ASIGNACIONES HISTÓRICAS PERSISTENTES
const DB_NAME = 'SistemaEvaluacionDB_v22';
const DB_VERSION = 9; // Incrementado para forzar limpieza completa de IndexedDB corrupto

document.addEventListener('DOMContentLoaded', () => {
    initIndexedDB(() => { setupEventListeners(); setupAdminTabs(); setupMatrixLogisticsDrivers(); checkDeadlineStatus(); });
});

function setupEventListeners() {
    document.getElementById('btn-login').addEventListener('click', handleLogin);
    document.getElementById('btn-sync-cloud').addEventListener('click', syncAllToCloud);
    document.getElementById('btn-download-cloud').addEventListener('click', downloadHistoricosFromCloud);
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    document.getElementById('btn-save-items').addEventListener('click', saveAdminItems);
    document.getElementById('btn-save-scores').addEventListener('click', (e) => { e.preventDefault(); saveEvaluatorScores(null); });
    document.getElementById('btn-eval-pdf').addEventListener('click', exportEvaluatorPDF);
    document.getElementById('btn-save-asignacion').addEventListener('click', () => { processAsignacionStaging(false); });
    document.getElementById('btn-save-partial').addEventListener('click', () => { processAsignacionStaging(true); });
    document.getElementById('btn-save-config').addEventListener('click', saveConfigDeadline);
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    document.getElementById('chk-toggle-all-stages').addEventListener('change', toggleAllStagesCheckboxes);
    document.getElementById('btn-modal-cancel').addEventListener('click', closeModal);
    document.getElementById('btn-modal-confirm').addEventListener('click', executeCommitAsignacion);

    const btnExport = document.getElementById('btn-export-reportes');
    if (btnExport) btnExport.addEventListener('click', exportReportesExcel);

    const btnExportBackup = document.getElementById('btn-export-backup');
    if (btnExportBackup) btnExportBackup.addEventListener('click', exportDatabaseToJSON);

    const btnOpenEv = document.getElementById('btn-open-evaluador-modal');
    if (btnOpenEv) btnOpenEv.addEventListener('click', () => {
        currentEditingEvaluadorRut = null;
        clearFormInputs(['ev-nombre', 'ev-rut', 'ev-area', 'ev-clave']);
        document.getElementById('ev-rut').disabled = false;
        toggleElement('modal-evaluador', true);
    });
    const btnCloseEv = document.getElementById('btn-close-evaluador-modal');
    if (btnCloseEv) btnCloseEv.addEventListener('click', () => toggleElement('modal-evaluador', false));
    const btnSaveEv = document.getElementById('btn-save-evaluador-modal');
    if (btnSaveEv) btnSaveEv.addEventListener('click', createEvaluador);

    document.getElementById('btn-open-entidad-modal').addEventListener('click', () => {
        currentEditingEntidadId = null; // Limpiamos la memoria de edición para forzar un registro nuevo
        clearFormInputs(['entidad-rut', 'entidad-nombre', 'entidad-comuna', 'entidad-programa', 'entidad-convenio', 'entidad-fecha']);
        toggleElement('modal-entidad', true);
    });

    document.getElementById('btn-close-entidad-modal').addEventListener('click', () => {
        currentEditingEntidadId = null; // Limpiamos en caso de que el usuario cancele la edición
        toggleElement('modal-entidad', false);
    });

    document.getElementById('btn-save-entidad-modal').addEventListener('click', () => {
        const rut = document.getElementById('entidad-rut').value.trim();
        const nom = document.getElementById('entidad-nombre').value.trim();
        const com = document.getElementById('entidad-comuna').value.trim();
        const prog = document.getElementById('entidad-programa').value;
        const conv = document.getElementById('entidad-convenio').value.trim();
        const fecha = document.getElementById('entidad-fecha').value;
        
        if (!rut || !nom) {
            alert('RUT y Nombre de la entidad son obligatorios.');
            return;
        }
        
        // Generar un ID único para permitir múltiples registros con el mismo RUT
        let idToSave = currentEditingEntidadId;
        if (!idToSave) {
            idToSave = 'ent_' + Date.now().toString() + '_' + Math.floor(Math.random() * 1000);
        }

        const tx = dbInstance.transaction(['entidades'], 'readwrite');
        tx.onerror = (e) => {
            alert('Error en base de datos al guardar: ' + (e.target.error ? e.target.error.message : 'Desconocido'));
            console.error('IndexedDB Error:', e.target.error);
        };
        tx.objectStore('entidades').put({ idEntidad: idToSave, rut, nombre: nom, comuna: com, programa: prog, convenio: conv, fecha });
        tx.oncomplete = () => {
            toggleElement('modal-entidad', false);
            currentEditingEntidadId = null;
            populateAdminMatrix(); 
        };
    });

    const searchEntidades = document.getElementById('search-entidades');
    if (searchEntidades) searchEntidades.addEventListener('input', renderEntidadesAgregadas);

    const searchEvaluadores = document.getElementById('search-evaluadores');
    if (searchEvaluadores) searchEvaluadores.addEventListener('input', drawEvaluadoresTable);

    const searchMonitoreo = document.getElementById('search-monitoreo');
    if (searchMonitoreo) searchMonitoreo.addEventListener('input', drawMonitoringTable);

    // Event listeners del módulo histórico
    const chkHistorico = document.getElementById('chk-modo-historico');
    if (chkHistorico) chkHistorico.addEventListener('change', toggleModoHistorico);

    const selAnioHistorico = document.getElementById('sel-anio-historico');
    if (selAnioHistorico) selAnioHistorico.addEventListener('change', () => {
        if (historicoConfig) historicoConfig.anio = selAnioHistorico.value;
    });

    const btnSaveAsigHist = document.getElementById('btn-save-asignacion-historica');
    if (btnSaveAsigHist) btnSaveAsigHist.addEventListener('click', saveAsignacionHistorica);

    const selHistoricoAnio = document.getElementById('sel-historico-anio');
    if (selHistoricoAnio) selHistoricoAnio.addEventListener('change', () => {
        if (historicoConfig) {
            historicoConfig.anio = selHistoricoAnio.value;
            historicoMemory = [];
            historicoScores = {};
            renderHistoricoView();
        }
    });

    const btnGuardarHistorico = document.getElementById('btn-guardar-historico');
    if (btnGuardarHistorico) btnGuardarHistorico.addEventListener('click', guardarHistorico);

    const btnCancelSync = document.getElementById('btn-cancel-sync');
    if (btnCancelSync) btnCancelSync.addEventListener('click', requestSyncCancel);

    const inputRestoreBackup = document.getElementById('input-restore-backup');
    if (inputRestoreBackup) inputRestoreBackup.addEventListener('change', handleRestoreBackupJSON);
}

let historicoEntidadesAsignadas = [];

function renderEntidadesAgregadas() {
    const tbodyTabla = document.getElementById('tabla-entidades-body');
    const searchInput = document.getElementById('search-entidades');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (adminTemporaryEntidades.length === 0) { 
        if (tbodyTabla) tbodyTabla.innerHTML = '<tr><td colspan="7" class="text-center">Sin entidades guardadas.</td></tr>';
        return; 
    }

    if (tbodyTabla) {
        let filteredEntidades = adminTemporaryEntidades;
        if (searchTerm) {
            filteredEntidades = filteredEntidades.filter(e => 
                (e.rut && e.rut.toLowerCase().includes(searchTerm)) ||
                (e.nombre && e.nombre.toLowerCase().includes(searchTerm)) ||
                (e.comuna && e.comuna.toLowerCase().includes(searchTerm)) ||
                (e.programa && e.programa.toLowerCase().includes(searchTerm)) ||
                (e.convenio && e.convenio.toLowerCase().includes(searchTerm))
            );
        }

        let sortedEntidades = [...filteredEntidades];
        if (entidadesSortCol > -1) {
            const cols = ['rut', 'nombre', 'comuna', 'programa', 'convenio', 'fecha'];
            sortedEntidades.sort((a, b) => {
                let vA = (a[cols[entidadesSortCol]] || '').toString().toLowerCase();
                let vB = (b[cols[entidadesSortCol]] || '').toString().toLowerCase();
                return vA < vB ? (entidadesSortAsc ? -1 : 1) : vA > vB ? (entidadesSortAsc ? 1 : -1) : 0;
            });
        }

        if (sortedEntidades.length === 0) {
            tbodyTabla.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron entidades con esa búsqueda.</td></tr>';
        } else {
            tbodyTabla.innerHTML = sortedEntidades.map((e) => `
                <tr>
                    <td>${e.rut}</td><td>${e.nombre}</td><td>${e.comuna}</td>
                    <td class="text-center"><strong>${e.programa}</strong></td>
                    <td>${e.convenio}</td><td class="text-center">${e.fecha}</td>
                    <td class="text-center">
                        <button class="btn btn-primary" style="padding:2px 8px; border-radius:3px; font-size:0.75rem; margin-right:4px;" onclick="editEntidad('${e.idEntidad}')" title="Editar Entidad">Editar</button>
                        <button class="btn btn-danger" style="padding:2px 8px; border-radius:3px; font-size:0.75rem;" onclick="removeEntidad('${e.idEntidad}')" title="Eliminar Entidad">X</button>
                    </td>
                </tr>
            `).join('');
        }

        setupEntidadesHeaders();
    }
}

function setupEntidadesHeaders() {
    const tbodyTabla = document.getElementById('tabla-entidades-body');
    if (!tbodyTabla) return;
    const thead = tbodyTabla.closest('table').querySelector('thead');
    if (thead && !thead.dataset.sortSetup) {
        thead.querySelectorAll('th').forEach((th, i) => {
            if (i < 6) { 
                th.style.cursor = 'pointer';
                th.title = 'Clic para ordenar por esta columna';
                th.onclick = () => {
                    entidadesSortAsc = (entidadesSortCol === i) ? !entidadesSortAsc : true;
                    entidadesSortCol = i;
                    renderEntidadesAgregadas();
                };
            }
        });
        thead.dataset.sortSetup = "true";
    }
}

window.editEntidad = function(idEntidad) {
    const e = adminTemporaryEntidades.find(x => x.idEntidad === idEntidad);
    if (!e) return;
    currentEditingEntidadId = e.idEntidad;
    document.getElementById('entidad-rut').value = e.rut;
    document.getElementById('entidad-nombre').value = e.nombre;
    document.getElementById('entidad-comuna').value = e.comuna;
    document.getElementById('entidad-programa').value = e.programa;
    document.getElementById('entidad-convenio').value = e.convenio;
    document.getElementById('entidad-fecha').value = e.fecha;
    toggleElement('modal-entidad', true);
};

window.removeEntidad = function(idEntidad) {
    const entidad = adminTemporaryEntidades.find(x => x.idEntidad === idEntidad);
    if (!entidad) return;
    const tx = dbInstance.transaction(['entidades'], 'readwrite');
    tx.objectStore('entidades').delete(entidad.idEntidad);
    tx.oncomplete = () => populateAdminMatrix();
};

window.deleteAsignacion = function(idAsig) {
    if(!confirm('¿Está seguro de eliminar esta asignación por completo?')) return;
    const tx = dbInstance.transaction(['asignaciones'], 'readwrite');
    tx.objectStore('asignaciones').delete(idAsig);
    tx.oncomplete = () => { renderMonitoringTable(); populateAdminMatrix(); };
};

function setupAdminTabs() {
    const tabs = document.querySelectorAll('.admin-main-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-subpanel').forEach(p => p.classList.add('hidden'));
            e.target.classList.add('active');
            const targetId = e.target.getAttribute('data-target');
            toggleElement(targetId, true);
            if (targetId === 'panel-monitoreo' || targetId === 'panel-reportes') renderMonitoringTable();
            if (targetId === 'panel-historicos') renderHistoricoView();
        });
    });
}

function initIndexedDB(callback) {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = (e) => { 
        dbInstance = e.target.result; 
        // Actualizar indicador de conexión INMEDIATAMENTE al abrir la DB
        const dot = document.getElementById('conn-dot');
        const txt = document.getElementById('conn-text');
        if (dot && txt) {
            dot.style.backgroundColor = '#92D050';
            txt.textContent = CLOUD_MODE_ENABLED ? 'Conectado a la Nube' : 'Modo Local';
            txt.style.color = '#25306B';
            txt.style.fontWeight = 'bold';
        }
        loadCoreData(callback); 
    };
    request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('items')) db.createObjectStore('items', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('scores')) db.createObjectStore('scores', { keyPath: 'idTx' });
        if (!db.objectStoreNames.contains('evaluadores')) db.createObjectStore('evaluadores', { keyPath: 'rut' });
        if (!db.objectStoreNames.contains('asignaciones')) db.createObjectStore('asignaciones', { keyPath: 'idAsig' });
        if (!db.objectStoreNames.contains('configuracion')) db.createObjectStore('configuracion', { keyPath: 'clave' });
        if (!db.objectStoreNames.contains('historicos')) db.createObjectStore('historicos', { keyPath: 'idHist' });
        if (!db.objectStoreNames.contains('asigna_historico')) db.createObjectStore('asigna_historico', { keyPath: 'idAsig' });
        
        // Forzar eliminación de la tabla antigua para destruir la llave primaria 'rut' que quedó guardada en el caché del navegador
        if (db.objectStoreNames.contains('entidades')) {
            db.deleteObjectStore('entidades');
        }
        db.createObjectStore('entidades', { keyPath: 'idEntidad' });
    };
    request.onerror = (e) => {
        console.error('Error al abrir IndexedDB:', e.target.error);
        const dot = document.getElementById('conn-dot');
        const txt = document.getElementById('conn-text');
        if (dot && txt) {
            dot.style.backgroundColor = '#FF4444';
            txt.textContent = 'Error de base de datos';
            txt.style.color = '#A51D24';
        }
        alert('Error al abrir la base de datos local. Intente recargar la página.');
        if (callback) callback([]);
    };
    request.onblocked = () => {
        const dot = document.getElementById('conn-dot');
        const txt = document.getElementById('conn-text');
        if (dot && txt) {
            dot.style.backgroundColor = '#FFA500';
            txt.textContent = 'Base de datos bloqueada';
            txt.style.color = '#856404';
        }
        alert('La base de datos local está bloqueada. Cierre otras pestañas del sistema y recargue.');
        if (callback) callback([]);
    };
}

function ensureStoreExists(storeName) {
    if (!dbInstance) return false;
    return dbInstance.objectStoreNames.contains(storeName);
}

function finishLocalLoad(results, callback, hasError) {
    if (hasError) {
        console.warn('Algunas tablas locales no están disponibles.');
    }

    // results[0] corresponde al store 'items' (ver array de stores en loadCoreData)
    // Normalizamos stage a número para que todos los filtros funcionen correctamente,
    // tanto si los ítems vienen de IndexedDB local como de Google Sheets (que los devuelve como strings).
    const localItems = results[0] || [];
    if (localItems.length >= DEFAULT_ITEMS.length) {
        dbItems = localItems.map(item => ({ ...item, stage: parseInt(item.stage, 10) || item.stage }));
    } else {
        dbItems = DEFAULT_ITEMS;
    }

    // Actualizar indicador de conexión al cargar datos locales
    const dot = document.getElementById('conn-dot');
    const txt = document.getElementById('conn-text');
    if (dot && txt) {
        dot.style.backgroundColor = '#92D050';
        txt.textContent = CLOUD_MODE_ENABLED ? 'Conectado a la Nube' : 'Modo Local';
        txt.style.color = '#25306B';
        txt.style.fontWeight = 'bold';
    }
    callback(results);
}

function loadCoreData(callback, forceCloud = false) {
    // Si no se fuerza sincronización, leer solo local
    if (!forceCloud) {
        const stores = ['items', 'configuracion', 'entidades', 'evaluadores', 'asignaciones', 'scores', 'historicos', 'asigna_historico'];
        const results = new Array(8);
        let completed = 0;
        let hasError = false;
        
        const tx = dbInstance.transaction(stores, 'readonly');
        
        stores.forEach((store, i) => {
            const storeObj = tx.objectStore(store);
            
            // Verificar si la tabla existe
            if (!dbInstance.objectStoreNames.contains(store)) {
                console.warn(`Tabla ${store} no existe, usando array vacío`);
                results[i] = [];
                completed++;
                hasError = true;
                if (completed === 8) {
                    finishLocalLoad(results, callback, hasError);
                }
                return;
            }
            
            const req = storeObj.getAll();
            req.onsuccess = (e) => {
                results[i] = e.target.result;
                completed++;
                if (completed === 8) {
                    finishLocalLoad(results, callback, hasError);
                }
            };
            req.onerror = (e) => {
                console.error(`Error leyendo tabla ${store}:`, e.target.error);
                results[i] = [];
                completed++;
                hasError = true;
                if (completed === 8) {
                    finishLocalLoad(results, callback, hasError);
                }
            };
        });
        
        // Timeout de seguridad: si no completa en 5 segundos, forzar finalización
        setTimeout(() => {
            if (completed < 8) {
                console.error('Timeout cargando datos locales. Forzando finalización...');
                for (let i = 0; i < 8; i++) {
                    if (!results[i]) results[i] = [];
                }
                finishLocalLoad(results, callback, true);
            }
        }, 5000);
        
        return;
    }
    
    // Si se fuerza sincronización, usar el método cloud
    getMultipleStores(['items', 'configuracion', 'entidades', 'evaluadores', 'asignaciones', 'scores', 'historicos', 'asigna_historico'], ([items, config, entidades, evaluadores, asignaciones, scores, historicos, asigna_historico]) => {
        const cfgReq = config ? config.find(c => c.clave === 'fecha_limite') : null;
        
        if (!items || items.length < DEFAULT_ITEMS.length) {
            dbItems = DEFAULT_ITEMS;
            if (!CLOUD_MODE_ENABLED) {
                const writeTx = dbInstance.transaction(['items'], 'readwrite');
                DEFAULT_ITEMS.forEach(i => writeTx.objectStore('items').put(i));
            }
        } else {
            // Normalizamos stage a número: Google Sheets devuelve todo como string
            dbItems = items.map(item => ({ ...item, stage: parseInt(item.stage, 10) || item.stage }));
        }
        
        if (cfgReq) {
            document.getElementById('cfg-deadline').value = cfgReq.valor;
            savedDeadlineISO = cfgReq.valor;
        }
        
        // Enciende el semáforo visual si se logró cargar la base de datos
        const dot = document.getElementById('conn-dot');
        const txt = document.getElementById('conn-text');
        if (dot && txt) {
            dot.style.backgroundColor = '#92D050'; // Forzamos el color hexadecimal
            txt.textContent = CLOUD_MODE_ENABLED ? 'Conectado a la Nube' : 'Desconectado';
            txt.style.color = '#25306B';
            txt.style.fontWeight = 'bold';
        }

        if (callback) callback();
    }, true);
}

function checkDeadlineStatus() {
    dbGetAll('configuracion', (config) => {
        const req = config.find(c => c.clave === 'fecha_limite');
        if (req && req.valor) {
            savedDeadlineISO = req.valor;
            const targetDate = parseSafeDate(savedDeadlineISO);
            deadlineExpired = targetDate ? (new Date() > targetDate) : false;
        } else {
            deadlineExpired = false;
        }
        const saveBtn = document.getElementById('btn-save-scores');
        if (deadlineExpired && currentRole === 'evaluador') {
            toggleElement('deadline-alert', true);
            if (saveBtn) saveBtn.disabled = true;
        } else {
            toggleElement('deadline-alert', false);
            if (saveBtn) saveBtn.disabled = false;
        }
    });
}

function startCountdownClock() {
    if (countdownInterval) clearInterval(countdownInterval);

    // Intentar usar elementos del header, si no existen usar los legacy
    let clock = document.getElementById('header-countdown') || document.getElementById('txt-countdown');
    let todayLabel = document.getElementById('header-date-today') || document.getElementById('txt-date-today');
    const deadlineLabel = document.getElementById('txt-date-deadline');

    const updateTime = () => {
        const now = new Date();
        if (todayLabel) todayLabel.textContent = formatDateTime(now);
    };
    updateTime();

    const targetDate = parseSafeDate(savedDeadlineISO);
    if(!targetDate) {
        if (deadlineLabel) deadlineLabel.textContent = "Sin Restricción";
        if (clock) clock.textContent = "Ilimitado";
        return;
    }

    if (deadlineLabel) deadlineLabel.textContent = formatDateTime(targetDate);

    countdownInterval = setInterval(() => {
        updateTime();
        const diff = targetDate - new Date();

        if (diff <= 0) {
            if (clock) clock.textContent = "00:00 - PERIODO EXPIRADO";
            clearInterval(countdownInterval);
            checkDeadlineStatus();
            window.changeStage(currentStage);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (clock) clock.textContent = `${days}D ${hours}H ${mins}M`;
    }, 1000);
}

function saveConfigDeadline() {
    const cfgInput = document.getElementById('cfg-deadline');
    if (!cfgInput) return;
    const tx = dbInstance.transaction(['configuracion'], 'readwrite');
    tx.objectStore('configuracion').put({ clave: 'fecha_limite', valor: cfgInput.value });
    tx.oncomplete = () => {
        savedDeadlineISO = cfgInput.value;
        checkDeadlineStatus();
    };
}

function toggleAllStagesCheckboxes(e) {
    document.querySelectorAll('.asig-etapa-chk').forEach(chk => chk.checked = e.target.checked);
}

function setupMatrixLogisticsDrivers() {
    const listbox = document.getElementById('asig-provincia-listbox');
    if(!listbox) return;
    listbox.addEventListener('change', (e) => {
        captureCurrentAdminProgramsState();
        adminSelectedProvincia = e.target.value;
        renderAdminProgramsColumn();
    });
}

function captureCurrentAdminProgramsState() {
    if (!adminSelectedProvincia) return;
    const activeSelectedPrograms = [];
    document.querySelectorAll('.asig-programa-dinamico-chk:checked').forEach(chk => activeSelectedPrograms.push(chk.value));
    adminTemporaryLogisticaMap[adminSelectedProvincia] = activeSelectedPrograms;
}

function renderAdminProgramsColumn() {
    const col = document.getElementById('col-programas-dinamicos');
    if (!adminSelectedProvincia) {
        col.innerHTML = `<span style="color:#999; font-size:0.8rem; padding:5px; text-align:center;">Seleccione provincia</span>`;
        return;
    }
    const savedPrograms = adminTemporaryLogisticaMap[adminSelectedProvincia] || [];
    col.innerHTML = `<div style="font-size:0.75rem; font-weight:bold; color:var(--primary-blue); margin-bottom:5px; text-transform:uppercase;">Programas en ${adminSelectedProvincia}:</div>` + 
        [...PROGRAMAS_BASE].sort().map(prog => `<div class="checkbox-block-item"><label><input type="checkbox" class="asig-programa-dinamico-chk" value="${prog}" ${savedPrograms.includes(prog) ? 'checked' : ''}> ${prog}</label></div>`).join('');
        
    document.querySelectorAll('.asig-programa-dinamico-chk').forEach(chk => {
        chk.addEventListener('change', () => {
            captureCurrentAdminProgramsState();
            renderAdminEntidadesColumn();
        });
    });
    
    renderAdminEntidadesColumn();
}

function renderAdminEntidadesColumn() {
    const col = document.getElementById('col-entidades-dinamicas');
    if (!col) return;
    if (adminTemporaryEntidades.length === 0) {
        col.innerHTML = `<span style="color:#999; font-size:0.8rem; padding:5px; text-align:center;">Sin entidades registradas</span>`;
        return;
    }

    const savedPrograms = adminSelectedProvincia ? (adminTemporaryLogisticaMap[adminSelectedProvincia] || []) : [];
    
    if (savedPrograms.length === 0) {
        col.innerHTML = `<span style="color:#999; font-size:0.8rem; padding:5px; text-align:center;">Seleccione un programa</span>`;
        return;
    }

    const filteredEntidades = adminTemporaryEntidades.filter(ent => savedPrograms.includes(ent.programa));

    if (filteredEntidades.length === 0) {
        col.innerHTML = `<span style="color:#999; font-size:0.8rem; padding:5px; text-align:center;">Sin entidades para los programas seleccionados</span>`;
        return;
    }

    col.innerHTML = `<div style="font-size:0.75rem; font-weight:bold; color:var(--primary-blue); margin-bottom:5px; text-transform:uppercase;">Seleccionar Entidad:</div>` + 
        filteredEntidades.map(ent => `<div class="checkbox-block-item"><label><input type="checkbox" class="asig-entidad-chk" value="${ent.idEntidad}" data-name="${ent.nombre}"> ${ent.nombre}</label></div>`).join('');
}

/* FIX CRÍTICO DE INGRESO: CONTROL DE EXCEPCIÓN CUANDO LA MUESTRA ESTÁ VACÍA V16 */
function handleLogin() {
    const userInput = document.getElementById('username').value.trim();
    const passInput = document.getElementById('password').value.trim();

    // Actualizar indicador de conexión durante el login
    const dot = document.getElementById('conn-dot');
    const txt = document.getElementById('conn-text');
    if (dot && txt) {
        dot.style.backgroundColor = '#FFA500';
        txt.textContent = 'Verificando credenciales...';
        txt.style.color = '#856404';
    }

    if (!userInput) {
        alert('Por favor, ingrese su RUT de usuario.');
        if (dot && txt) {
            dot.style.backgroundColor = '#FF4444';
            txt.textContent = 'RUT no ingresado';
            txt.style.color = '#A51D24';
        }
        return;
    }

    if (userInput.toLowerCase() === 'admin') {
        // SIEMPRE leer clave_admin desde el servidor (nunca desde local)
        if (!CLOUD_MODE_ENABLED) {
            alert('Error del sistema: El modo nube está desactivado.\n\nContacte al administrador del sistema.');
            if (dot && txt) {
                dot.style.backgroundColor = '#FF4444';
                txt.textContent = 'Error de configuración';
                txt.style.color = '#A51D24';
            }
            return;
        }
        
        showProgressBar('Verificando credenciales...');
        
        cloudGet('configuracion').then(remoteConfig => {
            hideProgressBar();
            
            if (!remoteConfig || !Array.isArray(remoteConfig)) {
                alert('Error de conexión. No se pudo verificar la configuración del servidor.');
                if (dot && txt) {
                    dot.style.backgroundColor = '#FF4444';
                    txt.textContent = 'Error de conexión';
                    txt.style.color = '#A51D24';
                }
                return;
            }
            
            const remoteClave = remoteConfig.find(c => c.clave === 'clave_admin');
            
            if (!remoteClave) {
                alert('Error del sistema: No se encontró la configuración de administrador en el servidor.\n\nContacte al administrador del sistema.');
                if (dot && txt) {
                    dot.style.backgroundColor = '#FF4444';
                    txt.textContent = 'Error de configuración';
                    txt.style.color = '#A51D24';
                }
                return;
            }
            
            // Verificar contraseña con datos del servidor
            if (passInput !== remoteClave.valor) {
                alert('Contraseña de administrador incorrecta.');
                if (dot && txt) {
                    dot.style.backgroundColor = '#92D050';
                    txt.textContent = 'Conectado a la Nube';
                    txt.style.color = '#25306B';
                }
                return;
            }
            
            currentUser = { nombre: "Administrador", rut: "admin" };
            currentRole = 'admin';
            restoreConnectionStatus();
            showPanel('Panel de Administración General');
        }).catch(err => {
            hideProgressBar();
            console.error('Error sincronizando configuración:', err);
            alert('Error de conexión. No se pudo verificar las credenciales.');
            if (dot && txt) {
                dot.style.backgroundColor = '#FF4444';
                txt.textContent = 'Error de conexión';
                txt.style.color = '#A51D24';
            }
        });
    } else {
        // Leer evaluadores locales primero
        dbGetAll('evaluadores', (evaluadores) => {
            if (evaluadores.length > 0) {
                // Hay datos locales, intentar login directamente
                attemptEvaluatorLogin(evaluadores, userInput, passInput);
            } else if (CLOUD_MODE_ENABLED) {
                // No hay evaluadores locales, sincronizar desde el servidor (solo evaluadores)
                console.log('Sincronizando evaluadores desde el servidor...');
                showProgressBar('Conectando al servidor...');
                
                // Timeout de 8 segundos
                const timeoutPromise = new Promise((resolve) => {
                    setTimeout(() => {
                        hideProgressBar();
                        resolve({ timeout: true });
                    }, 8000);
                });
                
                const syncPromise = cloudGet('evaluadores').then(remoteEvaluadores => {
                    return { timeout: false, data: remoteEvaluadores };
                }).catch(err => {
                    return { timeout: false, error: err };
                });
                
                Promise.race([syncPromise, timeoutPromise]).then(result => {
                    hideProgressBar();
                    
                    if (result.timeout) {
                        alert('Tiempo de espera agotado.\n\nNo se pudo conectar al servidor. Verifique su conexión a internet.');
                        if (dot && txt) {
                            dot.style.backgroundColor = '#FF4444';
                            txt.textContent = 'Error de conexión';
                            txt.style.color = '#A51D24';
                        }
                        return;
                    }
                    
                    if (result.error) {
                        console.error('Error sincronizando evaluadores:', result.error);
                        alert('Error de conexión. No se pudieron cargar los usuarios desde el servidor.');
                        if (dot && txt) {
                            dot.style.backgroundColor = '#FF4444';
                            txt.textContent = 'Error de conexión';
                            txt.style.color = '#A51D24';
                        }
                        return;
                    }
                    
                    const remoteEvaluadores = result.data;
                    if (!remoteEvaluadores || !Array.isArray(remoteEvaluadores) || remoteEvaluadores.length === 0) {
                        alert('No se encontraron evaluadores registrados en el servidor.\n\nVerifique su conexión o contacte al administrador.');
                        if (dot && txt) {
                            dot.style.backgroundColor = '#92D050';
                            txt.textContent = CLOUD_MODE_ENABLED ? 'Conectado a la Nube' : 'Modo Local';
                            txt.style.color = '#25306B';
                        }
                        return;
                    }
                    
                    // Guardar evaluadores en IndexedDB para futuros logins
                    const tx = dbInstance.transaction(['evaluadores'], 'readwrite');
                    const store = tx.objectStore('evaluadores');
                    remoteEvaluadores.forEach(ev => store.put(ev));
                    tx.oncomplete = () => {
                        // Intentar login con datos del servidor
                        attemptEvaluatorLogin(remoteEvaluadores, userInput, passInput);
                    };
                });
            } else {
                alert('No hay evaluadores registrados en el sistema.\n\nContacte al administrador para que cree su cuenta.');
                if (dot && txt) {
                    dot.style.backgroundColor = '#FF4444';
                    txt.textContent = 'Sin evaluadores';
                    txt.style.color = '#A51D24';
                }
            }
        });
    }
}

function attemptEvaluatorLogin(evaluadores, userInput, passInput) {
    const evResult = evaluadores.find(e => e.rut === userInput);
    if (!evResult) { 
        alert('RUT de evaluador no registrado.\n\nVerifique que el RUT esté correctamente ingresado o contacte al administrador.');
        restoreConnectionStatus();
        return; 
    }
    
    const validPass = evResult.clave || '123456';
    if (validPass !== passInput) { 
        alert('Contraseña incorrecta.'); 
        restoreConnectionStatus();
        return; 
    }
    
    currentUser = evResult;
    currentRole = 'evaluador';

    // Cargar asignaciones y scores del evaluador en paralelo
    getMultipleStores(['asignaciones', 'scores'], ([asignaciones, scores]) => {
        console.log('📊 Todas las asignaciones en DB:', asignaciones.length);
        console.log('👤 RUT del usuario actual:', currentUser.rut);
        console.log('📋 Asignaciones totales:', asignaciones);

        const userAsignaciones = asignaciones.filter(a => a.rut === currentUser.rut);
        console.log('✅ Asignaciones filtradas por RUT:', userAsignaciones.length);
        console.log('📌 Asignaciones del usuario:', userAsignaciones);

        if(userAsignaciones.length === 0) {
            console.error('❌ Asignaciones vacías para RUT:', currentUser.rut);
            console.error('Total asignaciones en IndexedDB:', asignaciones?.length || 0);
            alert('❌ No tiene precalificaciones asignadas en este momento.\n\nContacte al administrador para que le asigne coberturas de evaluación.\n\n(Verifique que: 1) La tabla "asignaciones" tenga datos en el Google Sheet, 2) Su RUT esté incluido)');
            restoreConnectionStatus();
            return;
        }

        allAsignacionesMapped = userAsignaciones.map(a => {
            let parsedEtapas = a.etapas;
            if (typeof parsedEtapas === 'string') {
                parsedEtapas = parsedEtapas.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
            } else if (!Array.isArray(parsedEtapas)) {
                parsedEtapas = [1];
            }
            return {
                cobertura: `${a.programa} - ${a.provincia.toUpperCase()}`,
                etapas: parsedEtapas.sort((x, y) => x - y),
                programa: a.programa,
                provincia: a.provincia,
                entidadNombre: a.entidadNombre
            };
        }).sort((a, b) => a.cobertura.localeCompare(b.cobertura));

        allMemoryScores = scores.filter(r => r.rutEvaluador === currentUser.rut);
        currentCoverage = allAsignacionesMapped[0].cobertura;
        const matchingConfig = allAsignacionesMapped.find(a => a.cobertura === currentCoverage);
        currentStage = matchingConfig ? matchingConfig.etapas[0] : 1;

        // Detectar discrepancia: si hay asignaciones pero pocas entidades, sincronizar desde nube
        if (allAsignacionesMapped.length > 1 && CLOUD_MODE_ENABLED) {
            console.log('⚠️ Detectada posible desincronización - forzando sync desde nube');
            cloudGet('asignaciones').then(cloudData => {
                if (cloudData && cloudData.length > asignaciones.length) {
                    console.log('🔄 Sincronizando asignaciones desde nube...');
                    cloudSave('asignaciones', cloudData, 'replace');
                }
            });
        }

        restoreConnectionStatus();
        showPanel('Sistema de Precalificación Técnica');
        startCountdownClock();
        
        // Sincronizar en segundo plano para evaluadores (sin bloquear)
        if (CLOUD_MODE_ENABLED) {
            backgroundSyncForEvaluator();
        }
    }, false);
}

function backgroundSyncForEvaluator() {
    // Sincronizar solo scores del evaluador actual en segundo plano
    const syncStore = (storeName, localData) => {
        return cloudGet(storeName).then(remoteData => {
            if (!remoteData || !Array.isArray(remoteData)) return localData;
            
            // Para scores, filtrar solo los del evaluador actual
            if (storeName === 'scores') {
                const myScores = remoteData.filter(r => r.rutEvaluador === currentUser.rut);
                // Combinar con datos locales que no estén en el servidor
                const remoteIds = new Set(myScores.map(s => s.idTx));
                const localOnly = localData.filter(s => !remoteIds.has(s.idTx));
                return [...myScores, ...localOnly];
            }
            return remoteData;
        });
    };

    // Sincronizar scores en segundo plano sin mostrar barra de progreso
    dbGetAll('scores', (localScores) => {
        syncStore('scores', localScores).then(updatedScores => {
            if (updatedScores.length !== localScores.length) {
                // Actualizar IndexedDB con datos del servidor
                const tx = dbInstance.transaction(['scores'], 'readwrite');
                const store = tx.objectStore('scores');
                updatedScores.forEach(s => store.put(s));
                
                // Actualizar memoria
                allMemoryScores = updatedScores.filter(r => r.rutEvaluador === currentUser.rut);
                loadScoresFromActiveContext();
                renderEvaluatorView();
            }
        }).catch(err => {
            console.log('Sincronización en segundo plano falló, usando datos locales:', err);
        });
    });
}

function restoreConnectionStatus() {
    const dot = document.getElementById('conn-dot');
    const txt = document.getElementById('conn-text');
    if (dot && txt) {
        dot.style.backgroundColor = '#92D050';
        txt.textContent = CLOUD_MODE_ENABLED ? 'Conectado a la Nube' : 'Modo Local';
        txt.style.color = '#25306B';
        txt.style.fontWeight = 'bold';
    }
}

function handleLogout() {
    if (currentRole === 'evaluador' && hasUnsavedEvaluatorChanges) {
        if (confirm('⚠️ ¡ATENCIÓN! Tiene calificaciones sin guardar que se perderán al salir.\n\n¿Desea GUARDAR sus calificaciones ahora antes de cerrar la sesión?')) {
            saveEvaluatorScores(() => { performLogout(); });
            return;
        }
    } else if (currentRole === 'admin') {
        if (!confirm('¿Ha recordado sincronizar sus cambios con la Nube?\n\nSi no lo ha hecho, presione Cancelar y utilice el botón "Sincronizar a la Nube" antes de salir.\n\n¿Desea cerrar sesión de todas formas?')) {
            return;
        }
    } else {
        if (!confirm('¿Desea cerrar sesión y volver a la pantalla de inicio?')) return;
    }
    performLogout();
}

function performLogout() {
    currentUser = null; currentRole = null;
    hasUnsavedEvaluatorChanges = false;
    toggleElement('main-screen', false);
    toggleElement('login-container', true);
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    if (countdownInterval) clearInterval(countdownInterval);
}

function showPanel(titleText) {
    toggleElement('login-container', false);
    toggleElement('main-screen', true);
    document.getElementById('app-title').textContent = titleText;
    document.getElementById('user-profile').textContent = `Calificador(a): ${currentUser.nombre}`;

    if (currentRole === 'admin') {
        toggleElement('admin-view', true);
        toggleElement('evaluador-view', false);
        toggleElement('btn-sync-cloud', true);
        toggleElement('btn-save-scores', false);
        toggleElement('btn-eval-pdf', false);
        if (countdownInterval) clearInterval(countdownInterval);
        populateAdminMatrix();
        window.changeStage(1);
        checkAsignacionesHistoricasConflict();
    } else {
        toggleElement('admin-view', false);
        toggleElement('evaluador-view', true);
        toggleElement('btn-sync-cloud', false);
        toggleElement('btn-save-scores', true);
        toggleElement('btn-eval-pdf', true);
        checkDeadlineStatus();
        startCountdownClock();
        renderCoverageTabs();
    }
}

function renderCoverageTabs() {
    const container = document.getElementById('evaluador-coverage-tabs');
    container.innerHTML = '';
    // Obtener coberturas ÚNICAS (no duplicadas)
    const uniqueCoberturas = [...new Set(allAsignacionesMapped.map(a => a.cobertura))];
    uniqueCoberturas.forEach(cobertura => {
        const btn = document.createElement('button');
        btn.className = `tab-button ${currentCoverage === cobertura ? 'active' : ''}`;
        btn.textContent = cobertura;
        btn.onclick = () => {
            currentCoverage = cobertura;
            const conf = allAsignacionesMapped.find(a => a.cobertura === currentCoverage);
            currentStage = conf ? conf.etapas[0] : 1;
            renderCoverageTabs();
        };
        container.appendChild(btn);
    });
    renderEvaluatorHeaderInfo();
    window.changeStage(currentStage);
}

/**
 * Renderiza las pestañas de entidades, detalles y proyectos asociados a la cobertura activa del evaluador.
 */
function renderEvaluatorHeaderInfo() {
    const allCoverageAsigs = allAsignacionesMapped.filter(a => a.cobertura === currentCoverage);
    if (!allCoverageAsigs || allCoverageAsigs.length === 0) {
        const tabsEl = document.getElementById('eval-entity-tabs-container');
        const detailsEl = document.getElementById('eval-entity-details');
        const projectsEl = document.getElementById('eval-projects-body');
        const stagesEl = document.getElementById('eval-stages-container');

        if (tabsEl) tabsEl.innerHTML = '';
        if (detailsEl) detailsEl.innerHTML = '<div style="padding: 16px; color: #999; text-align: center;">Seleccione una cobertura para ver la entidad.</div>';
        if (projectsEl) projectsEl.innerHTML = '<tr><td colspan="5" class="text-center">Seleccione una cobertura para ver los proyectos.</td></tr>';
        if (stagesEl) stagesEl.innerHTML = '';
        return;
    }

    // Crear pestañas de entidades basadas en cobertura actual
    // Si hay múltiples entidades en la cobertura, cada una tendrá una pestaña
    const uniqueEntities = [...new Set(allCoverageAsigs.map(a => a.entidadNombre))];

    // Si no hay entidad seleccionada, usar la primera
    if (!window.currentSelectedEntity) {
        window.currentSelectedEntity = allCoverageAsigs[0].entidadNombre;
    }

    // Renderizar pestañas de entidades
    const tabsContainer = document.getElementById('eval-entity-tabs-container');
    tabsContainer.innerHTML = '';
    uniqueEntities.forEach(entidadNombre => {
        const btn = document.createElement('button');
        btn.className = `tab-button ${window.currentSelectedEntity === entidadNombre ? 'active' : ''}`;
        btn.textContent = entidadNombre;
        btn.style.fontSize = '0.8rem';
        btn.style.padding = '6px 10px';
        btn.onclick = () => {
            window.currentSelectedEntity = entidadNombre;
            renderEvaluatorHeaderInfo();
        };
        tabsContainer.appendChild(btn);
    });

    // Buscar datos de la entidad en IndexedDB
    dbGetAll('entidades', (entidades) => {
        // Buscar la asignación que corresponde a la entidad seleccionada
        const selectedAsig = allAsignacionesMapped.find(a =>
            a.cobertura === currentCoverage &&
            a.entidadNombre === window.currentSelectedEntity
        );

        if (!selectedAsig) {
            console.warn('No se encontró asignación para:', {currentCoverage, entidad: window.currentSelectedEntity});
            return;
        }

        const normalize = (str) => str.toString().trim().toLowerCase().replace(/\s+/g, ' ').replace(/\.+$/g, '').replace(/\s*ltda\.?\s*$/g, ' ltda').replace(/\s*spa\.?\s*$/g, ' spa');
        const target = normalize(window.currentSelectedEntity);

        let entidad = entidades.find(e => {
            const nombre = e.nombre ? normalize(e.nombre) : '';
            return nombre === target || nombre.includes(target) || target.includes(nombre);
        });
        entidad = entidad || {};

        const getField = (obj, possibleKeys) => {
            for (const key of possibleKeys) {
                if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
                    return obj[key];
                }
            }
            return '';
        };

        const convenio = getField(entidad, ['convenio', 'Convenio', 'CONVENIO', 'N° Convenio Marco Seremi', 'N°ConvenioMarcoSeremi', 'convenio_marco', 'n_convenio']);
        const fecha = getField(entidad, ['fecha', 'Fecha', 'FECHA', 'Fecha Convenio Marco', 'FechaConvenioMarco', 'fecha_convenio']);

        // Mostrar detalles de la entidad
        const nameEl = document.getElementById('eval-entity-name');
        const rutEl = document.getElementById('eval-entity-rut');
        const convenioEl = document.getElementById('eval-entity-convenio');
        const fechaEl = document.getElementById('eval-entity-fecha');
        const programaEl = document.getElementById('eval-entity-programa');

        if (nameEl) nameEl.textContent = entidad.nombre || window.currentSelectedEntity || 'Sin Entidad';
        if (rutEl) rutEl.textContent = entidad.rut || '---';
        if (convenioEl) convenioEl.textContent = convenio || '---';
        if (fechaEl) fechaEl.textContent = fecha || '---';
        if (programaEl) programaEl.textContent = selectedAsig.programa || '---';

        // Renderizar tabla de proyectos según programa (dentro del callback para asegurar datos listos)
        renderProjectsTable(selectedAsig.programa, window.currentSelectedEntity);

        // Renderizar etapas a calificar
        renderStagesForEvaluator(selectedAsig);
    });
}

/**
 * Renderiza las etapas a calificar para el evaluador
 */
function renderStagesForEvaluator(activeAsig) {
    const container = document.getElementById('eval-stages-container');
    if (!activeAsig) {
        container.innerHTML = '<div style="color: #999; font-size: 0.85rem;">No hay etapas asignadas.</div>';
        return;
    }

    const etapas = activeAsig.etapas && Array.isArray(activeAsig.etapas) ? activeAsig.etapas : [1];
    container.innerHTML = '';

    etapas.sort((a, b) => a - b).forEach(stageNum => {
        const badge = document.createElement('div');
        badge.style.cssText = `
            background: var(--bg-stage-${stageNum});
            border: 1px solid var(--primary-dark);
            padding: 4px 8px;
            border-radius: 3px;
            font-weight: 600;
            font-size: 0.7rem;
            color: var(--primary-dark);
            cursor: pointer;
            transition: all 0.2s;
            display: inline-block;
            white-space: nowrap;
        `;
        badge.textContent = `Etapa ${stageNum}`;
        badge.onmouseover = () => {
            badge.style.transform = 'translateY(-1px)';
            badge.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
        };
        badge.onmouseout = () => {
            badge.style.transform = 'translateY(0)';
            badge.style.boxShadow = 'none';
        };
        badge.onclick = () => {
            currentStage = stageNum;
            window.changeStage(stageNum);
        };
        container.appendChild(badge);
    });
}

/**
 * Renderiza la tabla de proyectos desde las pestañas 49_py o 27_py del Google Sheet.
 * @param {string} programa - DS49, DS27 o DS10.
 * @param {string} entidadNombre - Nombre de la entidad para filtrar.
 */
function renderProjectsTable(programa, entidadNombre) {
    const head = document.getElementById('eval-projects-head');
    const body = document.getElementById('eval-projects-body');
    const progressBar = document.getElementById('eval-progress-bar');

    if (!programa) {
        body.innerHTML = '<tr><td colspan="5" class="text-center">No hay programa definido para la cobertura actual.</td></tr>';
        if (progressBar) progressBar.classList.add('hidden');
        return;
    }

    // Mostrar barra de progreso
    if (progressBar) progressBar.classList.remove('hidden');

    // DS49 requiere columna Código Proyecto adicional
    if (programa === 'DS49') {
        head.innerHTML = `
            <tr style="background-color: var(--primary-dark); color:#FFF;">
                <th>Código Proyecto</th>
                <th>Nombre Proyecto</th>
                <th>Comuna</th>
                <th>Modalidad</th>
                <th>N° Familias</th>
                <th>Año</th>
            </tr>
        `;
    } else {
        head.innerHTML = `
            <tr style="background-color: var(--primary-dark); color:#FFF;">
                <th>Nombre Proyecto</th>
                <th>Comuna</th>
                <th>Modalidad</th>
                <th>Familias</th>
                <th>Año</th>
            </tr>
        `;
    }

    body.innerHTML = `<tr><td colspan="6" class="text-center">Cargando proyectos para: ${entidadNombre} (${programa})...</td></tr>`;

    cloudGetProjects(programa, entidadNombre).then(proyectos => {
        // Ocultar barra de progreso
        if (progressBar) progressBar.classList.add('hidden');

        if (!Array.isArray(proyectos) || proyectos.length === 0) {
            const cols = programa === 'DS49' ? '6' : '5';
            body.innerHTML = `<tr><td colspan="${cols}" class="text-center">No se encontraron proyectos para "${entidadNombre}" en ${programa}.</td></tr>`;
            return;
        }
        if (programa === 'DS49') {
            body.innerHTML = proyectos.map(p => `
                <tr>
                    <td>${p['Codigo proyecto'] || p.codigo_proyecto || p.Codigo || ''}</td>
                    <td>${p['Nombre Proyecto'] || p.nombre_proyecto || p.Nombre || ''}</td>
                    <td>${p.Comuna || p.comuna || ''}</td>
                    <td>${p.Modalidad || p.modalidad || ''}</td>
                    <td>${p['N°familias'] || p.Nfamilias || p.familias || ''}</td>
                    <td>${p.Año || p.ano || p.anio || ''}</td>
                </tr>
            `).join('');
        } else {
            body.innerHTML = proyectos.map(p => `
                <tr>
                    <td>${p['Nombre Proyecto'] || p.nombre_proyecto || p.Nombre || ''}</td>
                    <td>${p.Comuna || p.comuna || ''}</td>
                    <td>${p.Modalidad || p.modalidad || ''}</td>
                    <td>${p.Familias || p.familias || ''}</td>
                    <td>${p.Año || p.ano || p.anio || ''}</td>
                </tr>
            `).join('');
        }
    }).catch(err => {
        console.error('Error cargando proyectos:', err);
        // Ocultar barra de progreso
        if (progressBar) progressBar.classList.add('hidden');
        const cols = programa === 'DS49' ? '6' : '5';
        body.innerHTML = `<tr><td colspan="${cols}" class="text-center">Error al cargar proyectos. Intente nuevamente.</td></tr>`;
    });
}

window.changeStage = function(stageNum) {
    currentStage = stageNum;
    const containerId = (currentRole === 'admin') ? 'admin-tabs' : 'evaluador-tabs';
    const container = document.getElementById(containerId);

    // Si el contenedor no existe, no continuar
    if (!container) {
        console.warn(`Contenedor de tabs no encontrado: ${containerId}`);
        return;
    }

    container.innerHTML = '';
    
    let etapasDisponibles = [1,2,3,4,5,6]; 
    if (currentRole === 'evaluador') {
        const match = allAsignacionesMapped.find(a => a.cobertura === currentCoverage);
        etapasDisponibles = match ? match.etapas.sort((a, b) => a - b) : [1];
    }

    etapasDisponibles.forEach(i => {
        const btn = document.createElement('button');
        btn.className = `tab-button ${currentStage === i ? 'active' : ''}`;
        btn.textContent = `Etapa ${i}`;
        if (currentStage === i) {
            btn.style.backgroundColor = `var(--bg-stage-${i})`;
            btn.style.color = '#000';
            btn.style.border = '1px solid var(--primary-dark)';
        }
        btn.onclick = () => window.changeStage(i);
        container.appendChild(btn);
    });

    if (currentRole === 'admin') {
        renderAdminView();
    } else {
        const tableCard = document.getElementById('table-card-container');
        if (tableCard) tableCard.style.backgroundColor = `var(--bg-stage-${currentStage})`;
        
        // Actualizar scores desde el servidor en segundo plano (rápido y no bloquea)
        if (CLOUD_MODE_ENABLED && currentUser) {
            refreshScoresFromServer();
        }
        
        loadScoresFromActiveContext();
        renderEvaluatorView();
    }
};

function refreshScoresFromServer() {
    // Actualizar scores desde el servidor sin bloquear la UI
    cloudGet('scores').then(remoteScores => {
        if (!remoteScores || !Array.isArray(remoteScores)) return;
        
        // Filtrar solo los scores del evaluador actual
        const myRemoteScores = remoteScores.filter(r => r.rutEvaluador === currentUser.rut);
        
        // Combinar con datos locales que no estén en el servidor
        const remoteIds = new Set(myRemoteScores.map(s => s.idTx));
        const localOnly = allMemoryScores.filter(s => !remoteIds.has(s.idTx));
        const updatedScores = [...myRemoteScores, ...localOnly];
        
        // Actualizar IndexedDB
        const tx = dbInstance.transaction(['scores'], 'readwrite');
        const store = tx.objectStore('scores');
        updatedScores.forEach(s => store.put(s));
        
        // Actualizar memoria
        allMemoryScores = updatedScores;
        loadScoresFromActiveContext();
        renderEvaluatorView();
    }).catch(err => {
        // Silenciar errores en segundo plano
        console.log('Actualización en segundo plano falló, usando datos locales:', err);
    });
}

function processAsignacionStaging(isPartialSave) {
    captureCurrentAdminProgramsState();

    const selectedEvaluatorsRuts = [];
    const selectedEvaluatorsNames = [];
    document.querySelectorAll('.asig-evaluador-chk:checked').forEach(c => {
        selectedEvaluatorsRuts.push(c.value);
        selectedEvaluatorsNames.push(c.getAttribute('data-name'));
    });

    const etapas = [];
    document.querySelectorAll('.asig-etapa-chk:checked').forEach(c => etapas.push(parseInt(c.value, 10)));
    etapas.sort((a, b) => a - b);

    let totalCoveragesList = [];
    for (const [provincia, programas] of Object.entries(adminTemporaryLogisticaMap)) {
        programas.forEach(prog => totalCoveragesList.push({ provincia: provincia, programa: prog }));
    }

    const selectedEntidades = [];
    document.querySelectorAll('.asig-entidad-chk:checked').forEach(c => {
        selectedEntidades.push({ id: c.value, name: c.getAttribute('data-name') });
    });

    const combinedCoverages = [];
    totalCoveragesList.forEach(t => {
        if (selectedEntidades.length > 0) {
            let matched = false;
            selectedEntidades.forEach(ent => {
                const entityData = adminTemporaryEntidades.find(e => e.idEntidad === ent.id);
                // Asegurar que la entidad que se asigna pertenece al programa de este ciclo
                if (entityData && entityData.programa === t.programa) {
                    combinedCoverages.push({ provincia: t.provincia, programa: t.programa, entidadId: ent.id, entidadNombre: ent.name });
                    matched = true;
                }
            });
            if (!matched) combinedCoverages.push({ provincia: t.provincia, programa: t.programa, entidadId: null, entidadNombre: 'Sin Entidad' });
        } else {
            combinedCoverages.push({ provincia: t.provincia, programa: t.programa, entidadId: null, entidadNombre: 'Sin Entidad' });
        }
    });

    currentScreenStaging = null;

    if (selectedEvaluatorsRuts.length === 0 || etapas.length === 0 || combinedCoverages.length === 0) {
        if (pendingAsignacionesStaging.length === 0) {
            alert('Para realizar una asignación debe seleccionar al menos: 1 Evaluador, 1 Programa y 1 Etapa.');
            return;
        }
    } else {
        if (isPartialSave) {
            pendingAsignacionesStaging.push({ ruts: selectedEvaluatorsRuts, names: selectedEvaluatorsNames, etapas, coberturas: combinedCoverages });
            document.querySelectorAll('.asig-programa-dinamico-chk').forEach(c => c.checked = false);
            document.querySelectorAll('.asig-entidad-chk').forEach(c => c.checked = false);
            adminTemporaryLogisticaMap = {};
            return;
        } else {
            currentScreenStaging = { ruts: selectedEvaluatorsRuts, names: selectedEvaluatorsNames, etapas, coberturas: combinedCoverages };
        }
    }

    const allToSave = [...pendingAsignacionesStaging];
    if (currentScreenStaging) allToSave.push(currentScreenStaging);

    dbGetAll('asignaciones', (asignaciones) => {
        const allRuts = allToSave.flatMap(p => p.ruts);
        const tienePrevios = asignaciones.some(a => allRuts.includes(a.rut));
        
        const modal = document.getElementById('audit-modal');
        document.getElementById('modal-title').textContent = "Confirmación de Cambios de Privilegios";
        toggleElement('modal-table-container', false);
        toggleElement('modal-overwrite-question', tienePrevios);

        document.getElementById('modal-custom-html-body').innerHTML = '<p>¿Desea consolidar las asignaciones en memoria?</p>' + allToSave.map((payload, i) => `
            <div style="background:#F8F9FA; padding:10px; border-left:4px solid var(--primary-blue); margin-bottom:8px; font-size:0.85rem;">
                <p><strong>Evaluadores:</strong> ${payload.names.join(', ')}</p>
                <p><strong>Etapas:</strong> ${payload.etapas.join(', ')}</p>
        <ul>${payload.coberturas.map(c => `<li><strong>${c.programa}</strong> - ${c.provincia}${c.entidadNombre !== 'Sin Entidad' ? ` - ${c.entidadNombre}` : ''}</li>`).join('')}</ul>
            </div>
        `).join('');

        toggleElement('modal-action-footer', true);
        toggleElement('audit-modal', true);
    });
}

function executeCommitAsignacion() {
    const allToSave = [...pendingAsignacionesStaging];
    if (currentScreenStaging) allToSave.push(currentScreenStaging);

    if(allToSave.length === 0) return;
    const owElem = document.querySelector('input[name="overwrite_mode"]:checked');
    const mode = owElem ? owElem.value : 'merge';
    const tx = dbInstance.transaction(['asignaciones'], 'readwrite');
    const store = tx.objectStore('asignaciones');

    const writeOps = () => {
        allToSave.forEach(p => {
            p.ruts.forEach(rut => {
                p.coberturas.forEach(c => {
                    store.put({ idAsig: `${rut}_${c.programa}_${c.provincia.replace(/\s+/g, '')}_${c.entidadId || 'none'}`, rut, programa: c.programa, provincia: c.provincia, entidadId: c.entidadId, entidadNombre: c.entidadNombre, etapas: p.etapas });
                });
            });
        });
    };

    if (mode === 'replace') {
        store.getAll().onsuccess = (e) => {
            const allRuts = allToSave.flatMap(p => p.ruts);
            e.target.result.forEach(item => { if (allRuts.includes(item.rut)) store.delete(item.idAsig); });
            writeOps();
        };
    } else { writeOps(); }

    tx.oncomplete = () => { 
        closeModal(); pendingAsignacionesStaging = []; currentScreenStaging = null;
        // Sincronizar asignaciones con la nube sin bloquear la UI
        if (CLOUD_MODE_ENABLED) {
            syncSingleStoreToCloud('asignaciones', () => { populateAdminMatrix(); });
        } else {
            populateAdminMatrix();
        }
    };

    tx.onerror = () => {
        closeModal();
        alert('Error al guardar la asignación localmente.');
    };
}

function renderMonitoringTable() {
    getMultipleStores(['asignaciones', 'evaluadores', 'scores'], ([asignaciones, evaluadores, scores]) => {
        const tbody = document.getElementById('admin-monitoring-rows');
        if (asignaciones.length === 0) { 
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center">No hay registros.</td></tr>`; 
            return; 
        }

        const evMap = {}; evaluadores.forEach(e => evMap[e.rut] = e.nombre);
        const scoresMap = {}; scores.forEach(s => { const k = `${s.rutEvaluador}_${s.cobertura}_${s.stage}`; if (!scoresMap[k]) scoresMap[k] = []; scoresMap[k].push(s); });

        monitoringData = [];

        asignaciones.forEach(asig => {
            const nom = evMap[asig.rut] || asig.rut;
            const cobLabel = buildCoberturaLabel(asig.programa, asig.provincia, asig.entidadNombre);
            
            let parsedEtapas = asig.etapas;
            if (typeof parsedEtapas === 'string') {
                parsedEtapas = parsedEtapas.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
            } else if (!Array.isArray(parsedEtapas)) {
                parsedEtapas = [1];
            }

            parsedEtapas.forEach(stg => {
                const currentScores = scoresMap[`${asig.rut}_${cobLabel}_${stg}`] || [];
                let sum = 0, count = 0, maxTs = 0, lastDateStr = "";
                currentScores.forEach(s => { 
                    sum += (parseInt(s.score, 10) || 0); count++; 
                    let ts = parseAnyDate(s.hora);
                    if (ts > maxTs) { maxTs = ts; lastDateStr = s.hora; }
                    else if (lastDateStr === "" && s.hora) lastDateStr = s.hora;
                });
                const avg = count > 0 ? Math.round(sum / count) : 0;
                monitoringData.push({ idAsig: asig.idAsig, rut: asig.rut, nombre: nom, evaluadorLabel: `${nom} (${asig.rut})`, programa: asig.programa, provincia: asig.provincia, entidadNombre: asig.entidadNombre, coberturaLabel: cobLabel, stageNum: parseInt(stg, 10), haEvaluado: (count > 0), average: avg, lastDate: lastDateStr, maxTs: maxTs });
            });
        });
        setupMonitoringHeaders(); drawMonitoringTable(); renderMonitoringCharts(); renderReportes();
    });
}

function setupMonitoringHeaders() {
    document.querySelectorAll('#admin-monitoring-rows').forEach(tbody => {
        const table = tbody.closest('table');
        if (table) table.querySelectorAll('th').forEach((th, i) => { if(i < 5) { th.style.cursor = 'pointer'; th.onclick = () => { currentSortAsc = (currentSortCol === i) ? !currentSortAsc : true; currentSortCol = i; drawMonitoringTable(); }; } });
    });
}

function exportDatabaseToJSON() {
    showProgressBar("Generando respaldo del sistema...");
    updateProgressBar(10);

    const storeNames = ['items', 'scores', 'evaluadores', 'asignaciones', 'configuracion', 'entidades', 'historicos', 'asigna_historico'];
    const tx = dbInstance.transaction(storeNames, 'readonly');
    const backupData = {};
    let completed = 0;

    storeNames.forEach((storeName) => {
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = (e) => {
            backupData[storeName] = e.target.result;
            completed++;
            updateProgressBar(10 + (completed / storeNames.length) * 80);
        };
    });

    tx.oncomplete = () => {
        try {
            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `Respaldo_Completo_Sistema_Precalificaciones_${formatDDMMYYYY(new Date())}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            updateProgressBar(100);
            setTimeout(() => { hideProgressBar(); }, 300);
        } catch (err) {
            hideProgressBar();
            alert('Error al generar el archivo JSON de respaldo.');
            console.error(err);
        }
    };
}

/* ================= FUNCIONES DE REPORTES Y EXCEL ================= */
function getReportesGroupedData(callback) {
    dbGetAll('scores', (scores) => {
        const dataByEntidad = {};
        scores.forEach(s => {
            let ent = (s.entidad && s.entidad !== 'Sin Entidad') ? s.entidad : 'Sin Entidad Asociada';
            let prog = s.programa || 'Sin Programa';
            let nombreEv = s.nombreEvaluador || 'Sin Evaluador';
            let subKey = `Programa: ${prog} - Evaluador: ${nombreEv}`;
            
            if (!dataByEntidad[ent]) dataByEntidad[ent] = { stages: {}, programs: {}, maxTs: 0, lastDate: "" };
            
            let val = parseInt(s.score, 10) || 0;
            let stageNum = parseInt(s.stage, 10);
            
            if (!dataByEntidad[ent].stages[stageNum]) dataByEntidad[ent].stages[stageNum] = [];
            dataByEntidad[ent].stages[stageNum].push(val);
            
            let dTs = parseAnyDate(s.hora);
            
            if (dTs > dataByEntidad[ent].maxTs) {
                dataByEntidad[ent].maxTs = dTs;
                dataByEntidad[ent].lastDate = s.hora;
            } else if (dataByEntidad[ent].lastDate === "" && s.hora) {
                dataByEntidad[ent].lastDate = s.hora;
            }

            if (!dataByEntidad[ent].programs[subKey]) dataByEntidad[ent].programs[subKey] = { stages: {}, maxTs: 0, lastDate: "" };
            if (!dataByEntidad[ent].programs[subKey].stages[stageNum]) dataByEntidad[ent].programs[subKey].stages[stageNum] = [];
            dataByEntidad[ent].programs[subKey].stages[stageNum].push(val);
            
            if (dTs > dataByEntidad[ent].programs[subKey].maxTs) {
                dataByEntidad[ent].programs[subKey].maxTs = dTs;
                dataByEntidad[ent].programs[subKey].lastDate = s.hora;
            } else if (dataByEntidad[ent].programs[subKey].lastDate === "" && s.hora) {
                dataByEntidad[ent].programs[subKey].lastDate = s.hora;
            }
        });
        callback(dataByEntidad);
    });
}

function calculateAveragesForReport(nodeData) {
    let s = {}, sumAll = 0, countAll = 0;
    const stagesData = nodeData.stages;
    for (let i = 1; i <= 6; i++) {
        if (stagesData[i] && stagesData[i].length > 0) {
            let sum = stagesData[i].reduce((a,b) => a+b, 0);
            let avg = Math.round(sum / stagesData[i].length);
            s[i] = avg; sumAll += avg; countAll++;
        } else {
            s[i] = '-';
        }
    }
    let finalAvg = countAll > 0 ? Math.round(sumAll / countAll) : 0;
    let status = getStatusInfo(finalAvg);
    let badge = `<span style="background:${status.bg}; color:${status.color}; padding:3px 8px; border-radius:4px; font-weight:bold;">${status.text}</span>`;
    return { s, finalAvg, statusText: status.text, badge, lastDate: nodeData.lastDate || '---' };
}

function buildReportRowHtml(title, data, safeId, isSubRow) {
    const trClass = isSubRow ? `class="hidden detail-${safeId}" style="background-color:#FFF; transition: all 0.2s;"` : `style="cursor:pointer; background-color:#F8F9FA;" onclick="toggleEntityDetails('${safeId}')" title="Clic para ver detalle por programa"`;
    const titleCell = isSubRow ? `<td style="padding-left: 25px; font-size:0.85rem; color:#555;">└ <b style="color:var(--primary-blue);">${title}</b></td>` : `<td><b style="color:var(--primary-dark); font-size:0.9rem;"><span id="icon-${safeId}">➕</span> ${title}</b></td>`;
    const fw = isSubRow ? 'bold' : 'bold; font-size:1.15rem;';
    return `<tr ${trClass}>
        ${titleCell}
        <td class="text-center">${data.s[1]}</td><td class="text-center">${data.s[2]}</td>
        <td class="text-center">${data.s[3]}</td><td class="text-center">${data.s[4]}</td>
        <td class="text-center">${data.s[5]}</td><td class="text-center">${data.s[6]}</td>
        <td class="text-center" style="${fw}">${data.finalAvg}</td>
        <td class="text-center">${data.badge}</td>
        <td class="text-center" style="font-size:0.85rem; color:#555; font-weight:bold;">${data.lastDate}</td>
    </tr>`;
}

function renderReportes() {
    const tbody = document.getElementById('reportes-entidad-body');
    if (!tbody) return;

    getReportesGroupedData((dataByEntidad) => {
        const rows = [];

        let entitiesArray = Object.keys(dataByEntidad).map((ent, idx) => {
            const entData = dataByEntidad[ent];
            const eRow = calculateAveragesForReport(entData);
            return { ent, entData, eRow, safeId: 'ent_grp_' + idx };
        });

        if (reportesSortCol > -1) {
            entitiesArray.sort((a, b) => {
                let vA, vB;
                if (reportesSortCol === 0) {
                    vA = a.ent.toLowerCase(); vB = b.ent.toLowerCase();
                } else if (reportesSortCol >= 1 && reportesSortCol <= 6) {
                    vA = a.eRow.s[reportesSortCol] === '-' ? -1 : a.eRow.s[reportesSortCol];
                    vB = b.eRow.s[reportesSortCol] === '-' ? -1 : b.eRow.s[reportesSortCol];
                } else if (reportesSortCol === 7) {
                    vA = a.eRow.finalAvg; vB = b.eRow.finalAvg;
                } else if (reportesSortCol === 8) {
                    vA = a.eRow.statusText; vB = b.eRow.statusText;
                } else {
                    vA = a.entData.maxTs || 0; vB = b.entData.maxTs || 0;
                }
                return vA < vB ? (reportesSortAsc ? -1 : 1) : vA > vB ? (reportesSortAsc ? 1 : -1) : 0;
            });
        } else {
            entitiesArray.sort((a, b) => a.ent.localeCompare(b.ent)); 
        }

        entitiesArray.forEach(({ent, entData, eRow, safeId}) => {
            rows.push(buildReportRowHtml(ent, eRow, safeId, false));
            Object.keys(entData.programs).sort().forEach(prog => {
                const pRow = calculateAveragesForReport(entData.programs[prog]);
                rows.push(buildReportRowHtml(prog, pRow, safeId, true));
            });
        });

        if (rows.length === 0) tbody.innerHTML = `<tr><td colspan="10" class="text-center">No hay precalificaciones realizadas aún.</td></tr>`;
        else tbody.innerHTML = rows.join('');
        
        setupReportesHeaders();
    });
}

function setupReportesHeaders() {
    const tbodyTabla = document.getElementById('reportes-entidad-body');
    if (!tbodyTabla) return;
    const thead = tbodyTabla.closest('table').querySelector('thead');
    if (thead && !thead.dataset.sortSetup) {
        thead.querySelectorAll('th').forEach((th, i) => {
            th.style.cursor = 'pointer';
            th.title = 'Clic para ordenar por esta columna';
            th.onclick = () => {
                reportesSortAsc = (reportesSortCol === i) ? !reportesSortAsc : true;
                reportesSortCol = i;
                renderReportes();
            };
        });
        thead.dataset.sortSetup = "true";
    }
}

window.toggleEntityDetails = function(groupId) {
    const rows = document.querySelectorAll(`.detail-${groupId}`);
    const icon = document.getElementById(`icon-${groupId}`);
    let isHidden = false;
    rows.forEach(r => {
        if (r.classList.contains('hidden')) { r.classList.remove('hidden'); isHidden = true; } 
        else { r.classList.add('hidden'); }
    });
    if(icon) icon.textContent = isHidden ? "➖" : "➕";
};

function exportReportesExcel() {
    getReportesGroupedData((groupedData) => {
        if (Object.keys(groupedData).length === 0) { alert('No hay datos para exportar.'); return; }

        showProgressBar("Generando Excel...");
        let progress = 0;
        const interval = setInterval(() => { progress += 15; if (progress > 85) progress = 85; updateProgressBar(progress); }, 50);

        setTimeout(() => {
            let csvContent = "\uFEFF"; 
            csvContent += "Nombre Entidad / Detalle (Programa y Evaluador);Etapa 1;Etapa 2;Etapa 3;Etapa 4;Etapa 5;Etapa 6;Promedio Final;Estado;Fecha Calificación\n";

            const getCsvRow = (title, data, isSub) => {
                const prefix = isSub ? `"  └ ${title}"` : `"${title}"`;
                return `${prefix};"${data.s[1]}";"${data.s[2]}";"${data.s[3]}";"${data.s[4]}";"${data.s[5]}";"${data.s[6]}";"${data.finalAvg}";"${data.statusText}";"${data.lastDate}"\n`;
            };

            Object.keys(groupedData).sort().forEach(ent => {
                const entData = groupedData[ent];
                csvContent += getCsvRow(ent, calculateAveragesForReport(entData), false);

                Object.keys(entData.programs).sort().forEach(prog => {
                    csvContent += getCsvRow(prog, calculateAveragesForReport(entData.programs[prog]), true);
                });
            });

            clearInterval(interval);
            updateProgressBar(100);

            setTimeout(() => {
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                link.setAttribute("href", URL.createObjectURL(blob));
                link.setAttribute("download", `Consolidado_Precalificaciones_${formatDDMMYYYY(new Date())}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                hideProgressBar();
            }, 400);
        }, 200);
    });
}

/* COMPORTAMIENTO REPARADO DE EVALUADORES: ACCIÓN CRUD DIRECTA */
function createEvaluador() {
    const nombre = document.getElementById('ev-nombre').value.trim();
    const rut = document.getElementById('ev-rut').value.trim();
    const area = document.getElementById('ev-area').value.trim();
    const clave = document.getElementById('ev-clave').value.trim() || '123456';
    if (!nombre || !rut) {
        alert('RUT y Nombre del evaluador son obligatorios.');
        return; 
    }
    
    const tx = dbInstance.transaction(['evaluadores'], 'readwrite');
    tx.objectStore('evaluadores').put({ rut, nombre, area, clave });
    tx.oncomplete = () => { 
        clearFormInputs(['ev-nombre', 'ev-rut', 'ev-area', 'ev-clave']);
        document.getElementById('ev-rut').disabled = false;
        currentEditingEvaluadorRut = null;
        toggleElement('modal-evaluador', false);
        populateAdminMatrix(); 
    };
}

function renderEvaluadoresTable(evaluadores) {
    adminTemporaryEvaluadores = evaluadores;
    drawEvaluadoresTable();
}

function drawEvaluadoresTable() {
    const tbody = document.getElementById('tabla-evaluadores-body');
    if (!tbody) return;
    const searchInput = document.getElementById('search-evaluadores');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    if (adminTemporaryEvaluadores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Sin evaluadores guardados.</td></tr>';
        return;
    }

    let filtered = adminTemporaryEvaluadores;
    if (searchTerm) {
        filtered = filtered.filter(ev => 
            (ev.rut && ev.rut.toLowerCase().includes(searchTerm)) ||
            (ev.nombre && ev.nombre.toLowerCase().includes(searchTerm)) ||
            (ev.area && ev.area.toLowerCase().includes(searchTerm))
        );
    }

    if (evaluadoresSortCol > -1) {
        const cols = ['rut', 'nombre', 'area'];
        filtered.sort((a, b) => {
            let vA = (a[cols[evaluadoresSortCol]] || '').toString().toLowerCase();
            let vB = (b[cols[evaluadoresSortCol]] || '').toString().toLowerCase();
            return vA < vB ? (evaluadoresSortAsc ? -1 : 1) : vA > vB ? (evaluadoresSortAsc ? 1 : -1) : 0;
        });
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No se encontraron evaluadores con esa búsqueda.</td></tr>';
    } else {
        tbody.innerHTML = filtered.map(ev => `
        <tr>
            <td>${ev.rut}</td>
            <td>${ev.nombre}</td>
            <td>${ev.area || ''}</td>
            <td class="text-center">
                <button class="btn btn-primary" style="padding:2px 8px; border-radius:3px; font-size:0.75rem; margin-right:4px;" onclick="editEvaluador('${ev.rut}')" title="Editar Evaluador">Editar</button>
                <button class="btn btn-danger" style="padding:2px 8px; border-radius:3px; font-size:0.75rem;" onclick="removeEvaluador('${ev.rut}')" title="Eliminar Evaluador">X</button>
            </td>
        </tr>
    `).join('');
    }
    setupEvaluadoresHeaders();
}

function setupEvaluadoresHeaders() {
    const tbodyTabla = document.getElementById('tabla-evaluadores-body');
    if (!tbodyTabla) return;
    const thead = tbodyTabla.closest('table').querySelector('thead');
    if (thead && !thead.dataset.sortSetup) {
        thead.querySelectorAll('th').forEach((th, i) => {
            if (i < 3) { 
                th.style.cursor = 'pointer';
                th.title = 'Clic para ordenar por esta columna';
                th.onclick = () => {
                    evaluadoresSortAsc = (evaluadoresSortCol === i) ? !evaluadoresSortAsc : true;
                    evaluadoresSortCol = i;
                    drawEvaluadoresTable();
                };
            }
        });
        thead.dataset.sortSetup = "true";
    }
}

window.editEvaluador = function(rut) {
    dbGetAll('evaluadores', (evaluadores) => {
        const ev = evaluadores.find(x => x.rut === rut);
        if (!ev) return;
        currentEditingEvaluadorRut = ev.rut;
        document.getElementById('ev-rut').value = ev.rut;
        document.getElementById('ev-rut').disabled = true;
        document.getElementById('ev-nombre').value = ev.nombre;
        if (document.getElementById('ev-area')) document.getElementById('ev-area').value = ev.area || '';
        if (document.getElementById('ev-clave')) document.getElementById('ev-clave').value = ev.clave || '123456';
        toggleElement('modal-evaluador', true);
    });
};

window.removeEvaluador = function(rut) {
    dbGetAll('asignaciones', (asignaciones) => {
        const isAssigned = asignaciones.some(a => a.rut === rut);
        if (isAssigned) {
            alert('No se puede eliminar este evaluador porque tiene asignaciones activas.');
            return;
        }
        if (!confirm('¿Está seguro de eliminar este evaluador?')) return;
        const tx = dbInstance.transaction(['evaluadores'], 'readwrite');
        tx.objectStore('evaluadores').delete(rut);
        tx.oncomplete = () => populateAdminMatrix();
    });
};

function drawMonitoringTable() {
    const tbody = document.getElementById('admin-monitoring-rows');
    if (!tbody) return;

    const searchInput = document.getElementById('search-monitoreo');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    let filtered = monitoringData;
    if (searchTerm) {
        filtered = filtered.filter(item => 
            (item.evaluadorLabel && item.evaluadorLabel.toLowerCase().includes(searchTerm)) ||
            (item.programa && item.programa.toLowerCase().includes(searchTerm)) ||
            (item.stageNum && item.stageNum.toString().includes(searchTerm))
        );
    }

    if (currentSortCol > -1) {
        filtered.sort((a, b) => {
            const props = ['evaluadorLabel', 'coberturaLabel', 'stageNum', 'haEvaluado', 'average'];
            let vA = a[props[currentSortCol]], vB = b[props[currentSortCol]];
            if (currentSortCol === 3) { vA = vA ? 1 : 0; vB = vB ? 1 : 0; }
            return vA < vB ? (currentSortAsc ? -1 : 1) : vA > vB ? (currentSortAsc ? 1 : -1) : 0;
        });
    }
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron registros.</td></tr>';
    } else {
        tbody.innerHTML = filtered.map(item => `<tr><td><b>${item.evaluadorLabel}</b></td><td style="color:var(--primary-blue); font-weight:600;">${item.coberturaLabel}</td><td class="text-center">Etapa ${item.stageNum}</td><td class="text-center">${item.haEvaluado ? '<span class="badge-evaluado" style="background-color:var(--color-bueno);color:white;padding:2px 6px;border-radius:4px;font-size:0.8rem;">EVALUADO</span>' : '<span class="badge-no-evaluado" style="background-color:var(--color-malo);color:white;padding:2px 6px;border-radius:4px;font-size:0.8rem;">NO EVALUADO</span>'}</td><td class="text-center"><b>${item.average}</b></td><td class="text-center"><button class="btn btn-primary" style="padding:3px 6px; font-size:0.78rem;" onclick="openAuditModal('${item.rut}','${item.nombre}','${item.coberturaLabel}',${item.stageNum})">Ver Detalle</button><button class="btn btn-danger" style="padding:3px 6px; font-size:0.78rem; margin-left:4px;" onclick="deleteAsignacion('${item.idAsig}')">Borrar</button></td></tr>`).join('');
    }
}

function renderMonitoringCharts() {
    let container = document.getElementById('charts-container');
    if (!container) { container = document.createElement('div'); container.id = 'charts-container'; const panel = document.getElementById('panel-monitoreo'); if(panel) panel.insertBefore(container, document.getElementById('admin-monitoring-rows').closest('.card')); }
    const bProg = {}, bProv = {}; let ev = 0, tot = 0;
    monitoringData.forEach(d => { if(!bProg[d.programa]) bProg[d.programa] = { total: 0, eval: 0 }; if(!bProv[d.provincia]) bProv[d.provincia] = { total: 0, eval: 0 }; bProg[d.programa].total++; bProv[d.provincia].total++; tot++; if (d.haEvaluado) { bProg[d.programa].eval++; bProv[d.provincia].eval++; ev++; } });
    const rBar = (l, e, t) => { const p = t === 0 ? 0 : Math.round((e / t) * 100); return `<div style="margin-bottom:8px;"><div style="display:flex; justify-content:space-between; font-size:0.8rem;"><span>${l}</span><span>${e}/${t} (${p}%)</span></div><div style="width:100%; background:#e0e0e0; height:12px; overflow:hidden; border-radius:4px;"><div style="width:${p}%; background:var(--primary-blue); height:100%;"></div></div></div>`; };
    container.innerHTML = `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:15px;"><div class="card compact-card"><h4>Avance por Programa</h4>${Object.keys(bProg).map(p => rBar(p, bProg[p].eval, bProg[p].total)).join('')}</div><div class="card compact-card"><h4>Avance por Provincia</h4>${Object.keys(bProv).map(p => rBar(p.toUpperCase(), bProv[p].eval, bProv[p].total)).join('')}</div><div class="card compact-card"><h4>Estado Global</h4>${rBar('Completadas', ev, tot)}${rBar('Pendientes', tot - ev, tot)}</div></div>`;
}

function openAuditModal(rut, nombre, cobertura, stageNum) {
    toggleElement('modal-action-footer', false);
    toggleElement('modal-overwrite-question', false);
    document.getElementById('modal-custom-html-body').innerHTML = '';
    document.getElementById('modal-title').textContent = `${nombre} - ${cobertura} (Etapa ${stageNum})`;

    dbGetAll('scores', (scores) => {
        const relevantScores = scores.filter(r => r.rutEvaluador === rut && r.cobertura === cobertura && parseInt(r.stage, 10) === stageNum);
            
            let maxTs = 0, lastDate = "---";
            relevantScores.forEach(s => {
                let ts = parseAnyDate(s.hora);
                if (ts > maxTs) { maxTs = ts; lastDate = s.hora; }
                else if (lastDate === "---" && s.hora) lastDate = s.hora;
            });

            document.getElementById('modal-custom-html-body').innerHTML = `
                <div style="margin-bottom: 10px; font-size: 0.9rem; background: #F8F9FA; padding: 8px; border-radius: 4px; border-left: 3px solid var(--primary-blue);">
                    <strong>Fecha de Calificación:</strong> <span style="color:var(--primary-dark); font-weight:bold;">${lastDate}</span>
                </div>
            `;

            document.getElementById('modal-table-rows').innerHTML = dbItems.filter(i => i.stage === stageNum).map(item => {
            const recs = relevantScores.filter(r => r.itemId === item.id);
            recs.sort((a,b) => a.idTx.localeCompare(b.idTx));
            return `<tr><td class="text-center" style="font-weight:bold;">${item.id}</td><td>${item.text}</td><td class="text-center" style="font-weight:bold; color:var(--primary-blue);">${recs.length > 0 ? recs[recs.length - 1].score : "---"}</td></tr>`;
        }).join('');
        toggleElement('modal-table-container', true);
        toggleElement('audit-modal', true);
    });
}

function populateAdminMatrix() {
    pendingAsignacionesStaging = []; adminTemporaryEntidades = [];
    // Forzar sincronización desde la nube para el admin
    getMultipleStores(['evaluadores', 'entidades'], ([evaluadores, entidades]) => {
        const colEvaluadores = document.getElementById('col-evaluadores');
        if (colEvaluadores) {
            colEvaluadores.innerHTML = evaluadores.length === 0 ? '<span style="color:#999;font-size:0.8rem;">Sin evaluadores.</span>' : evaluadores.map(ev => `<div class="checkbox-block-item"><label><input type="checkbox" class="asig-evaluador-chk" value="${ev.rut}" data-name="${ev.nombre}"> ${ev.nombre}</label></div>`).join('');
        }
        
        renderEvaluadoresTable(evaluadores);
        adminTemporaryEntidades = entidades;
        renderEntidadesAgregadas();
        document.getElementById('chk-toggle-all-stages').checked = false;
        document.querySelectorAll('.asig-etapa-chk').forEach(c => c.checked = false);
        adminSelectedProvincia = ""; adminTemporaryLogisticaMap = {};
        const lb = document.getElementById('asig-provincia-listbox'); if(lb) lb.selectedIndex = -1;
        renderAdminProgramsColumn();
        fillAnioSelectors();
        
        // Mostrar mensaje de éxito
        console.log(`✅ Admin Matrix cargado: ${evaluadores.length} evaluadores, ${entidades.length} entidades`);
    }, CLOUD_MODE_ENABLED);
}

function fillAnioSelectors() {
    const currentYear = new Date().getFullYear();
    const options = [currentYear - 2, currentYear - 1, currentYear].map(y => `<option value="${y}">${y}</option>`).join('');
    const defaultYear = (currentYear - 1).toString();
    const sel1 = document.getElementById('sel-anio-historico');
    const sel2 = document.getElementById('sel-historico-anio');
    if (sel1) { sel1.innerHTML = options; sel1.value = defaultYear; }
    if (sel2) { sel2.innerHTML = options; sel2.value = defaultYear; }
}

function renderAdminView() {
    document.getElementById('admin-items-container').innerHTML = `<h4>Criterios Editables de la Etapa ${currentStage}</h4><br>` + dbItems.filter(i => i.stage === currentStage).map(item => `<div class="form-group"><label class="bold-text">Ítem ${item.id}</label><input type="text" class="admin-input" data-id="${item.id}" value="${item.text}"></div>`).join('');
}

function saveAdminItems() {
    const tx = dbInstance.transaction(['items'], 'readwrite');
    document.querySelectorAll('.admin-input').forEach(input => {
        const id = input.getAttribute('data-id'); const match = dbItems.find(i => i.id === id);
        if (match) { match.text = input.value.trim(); tx.objectStore('items').put(match); }
    });
    tx.oncomplete = () => { alert("Textos guardados localmente. Recuerde Sincronizar a la Nube."); };
}

function saveEvaluatorScores(callback) {
    if (deadlineExpired) {
        alert('El plazo para evaluar ha expirado. No se pueden guardar cambios.');
        if (callback) callback(false);
        return;
    }

    // Doble advertencia antes de enviar calificaciones al servidor
    const confirmed = confirmDoubleWarning(
        'GUARDAR CALIFICACIONES EN EL SERVIDOR',
        `Se enviarán las calificaciones del evaluador ${currentUser.nombre} (${currentUser.rut}) al servidor compartido.`
    );
    if (!confirmed) {
        if (callback) callback(false);
        return;
    }

    dbGetAll('scores', (allDbScores) => {
        const tx = dbInstance.transaction(['scores'], 'readwrite');
        const store = tx.objectStore('scores');
        const horaEnvio = formatDateTime(new Date());

        // 1. Borramos todas las calificaciones anteriores de TODAS las coberturas para el evaluador actual
        const oldRecords = allDbScores.filter(r => r.rutEvaluador === currentUser.rut);
        oldRecords.forEach(r => store.delete(r.idTx));

        // 2. Insertamos la foto actualizada en memoria, que YA contiene las modificaciones de TODAS las etapas y coberturas
        const memoryRecordsToSave = allMemoryScores.filter(r => r.rutEvaluador === currentUser.rut);
        
        memoryRecordsToSave.forEach(memScore => {
            const stableId = `${currentUser.rut}_${memScore.cobertura.replace(/[\s-]+/g, '')}_${memScore.itemId}`;
            const activeAsig = allAsignacionesMapped.find(a => a.cobertura === memScore.cobertura) || {};
            
            store.put({
                idTx: stableId,
                timestampId: Date.now().toString(),
                rutEvaluador: currentUser.rut,
                nombreEvaluador: memScore.nombreEvaluador || currentUser.nombre,
                programa: memScore.programa || activeAsig.programa || '',
                provincia: memScore.provincia || activeAsig.provincia || '',
                entidad: memScore.entidad || activeAsig.entidadNombre || '',
                cobertura: memScore.cobertura,
                stage: memScore.stage,
                itemId: memScore.itemId,
                score: memScore.score,
                hora: horaEnvio
            });
        });

        tx.oncomplete = () => {
            hasUnsavedEvaluatorChanges = false; // Restablecer la bandera de cambios sin guardar
            // Una vez guardado localmente, sincronizar solo la tabla de scores.
            syncSingleStoreToCloud('scores', (success) => {
                dbGetAll('scores', (scores) => {
                    allMemoryScores = scores.filter(r => r.rutEvaluador === currentUser.rut);
                    loadScoresFromActiveContext(); 
                    renderEvaluatorView();
                    
                    const btn = document.getElementById('btn-save-scores');
                    if (btn) {
                        const originalText = btn.textContent;
                        if (success) {
                            btn.textContent = "¡Guardado y Sincronizado!";
                            btn.style.backgroundColor = "var(--color-bueno)";
                            btn.style.color = "#000";
                        } else {
                            btn.textContent = "Guardado Local (Fallo Sincronización)";
                            btn.style.backgroundColor = "var(--color-aceptable)";
                            btn.style.color = "#000";
                        }
                        setTimeout(() => {
                            btn.textContent = originalText;
                            btn.style.backgroundColor = "";
                            btn.style.color = "";
                        }, 3000);
                    }
                    if (callback) callback(success);
                });
            });
        };
    });
}

function loadScoresFromActiveContext() {
    dbScores = {};
    allMemoryScores.filter(r => r.cobertura === currentCoverage && r.stage === currentStage).forEach(r => {
        dbScores[r.itemId] = r.score;
    });
}

function renderEvaluatorView() {
    const titleLabel = document.getElementById('table-stage-title');
    const descLabel = document.getElementById('table-stage-desc');

    if (STAGES_METADATA[currentStage]) {
        titleLabel.textContent = STAGES_METADATA[currentStage].title;
        descLabel.textContent = STAGES_METADATA[currentStage].desc;
    }

    document.getElementById('table-stage-footer-label').textContent = `PRECALIFICACIÓN ETAPA ${currentStage}`;

    const tbody = document.getElementById('evaluation-rows');

    // Obtener todos los ítems de la etapa actual, ordenados por id
    const stageItems = dbItems
        .filter(i => parseInt(i.stage, 10) === parseInt(currentStage, 10))
        .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

    if (stageItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">No hay ítems configurados para la Etapa ${currentStage}.</td></tr>`;
        return;
    }

    const rowsHtml = stageItems.map(item => {
        const score = dbScores[item.id] !== undefined ? dbScores[item.id] : "";
        return `
            <tr>
                <td class="cell-index bold-text">${item.id}</td>
                <td class="cell-desc">${item.text}</td>
                <td colspan="3" class="cell-score-input">
                    <input type="number" class="score-input" data-id="${item.id}" min="0" max="100" value="${score}" ${deadlineExpired ? 'disabled' : ''} placeholder="0">
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = rowsHtml.join('');

    document.querySelectorAll('.score-input').forEach(input => {
        input.addEventListener('input', () => { hasUnsavedEvaluatorChanges = true; calculateLiveScore(); });
    });

    calculateLiveScore();
}

function setEvaluationStatus(cell, score) {
    if (!cell) return;
    const status = getStatusInfo(score);
    cell.textContent = status.text;
    cell.style.backgroundColor = status.bg;
    cell.style.color = status.color;
}

function calculateLiveScore() {
    const inputs = document.querySelectorAll('.score-input');
    let totalStage = 0, countStage = 0;

    inputs.forEach(input => {
        let val = parseInt(input.value, 10);
        const id = input.getAttribute('data-id');
        const existingIdx = allMemoryScores.findIndex(r => r.cobertura === currentCoverage && r.itemId === id && parseInt(r.stage,10) === currentStage);
        
        if (isNaN(val)) { 
            delete dbScores[id]; 
            if (existingIdx >= 0) allMemoryScores.splice(existingIdx, 1);
            return; 
        }
        if (val < 0) { input.value = 0; val = 0; }
        if (val > 100) { input.value = 100; val = 100; }
        dbScores[id] = val;
        totalStage += val; countStage++;

        if (existingIdx >= 0) {
            allMemoryScores[existingIdx].score = val;
        } else {
            const activeAsig = allAsignacionesMapped.find(a => a.cobertura === currentCoverage) || {};
            allMemoryScores.push({
                idTx: `pending_${currentUser.rut}_${currentCoverage.replace(/[\s-]+/g, '')}_${id}`,
                timestampId: 'pending',
                rutEvaluador: currentUser.rut,
                nombreEvaluador: currentUser.nombre,
                programa: activeAsig.programa || '',
                provincia: activeAsig.provincia || '',
                entidad: activeAsig.entidadNombre || '',
                cobertura: currentCoverage,
                stage: currentStage,
                itemId: id,
                score: val,
                hora: formatDateTime(new Date())
            });
        }
    });

    const finalScoreCell = document.getElementById('cell-final-score');
    const statusTextCell = document.getElementById('cell-status-text');

    if (countStage > 0) {
        const stageAverage = Math.round(totalStage / countStage);
        if (finalScoreCell) finalScoreCell.textContent = stageAverage;
        setEvaluationStatus(statusTextCell, stageAverage);
    } else {
        if (finalScoreCell) finalScoreCell.textContent = "0"; 
        if (statusTextCell) { statusTextCell.textContent = "---"; statusTextCell.style.backgroundColor = "transparent"; }
    }
}

/* ================= MÓDULO DE CALIFICACIONES HISTÓRICAS ================= */
function toggleModoHistorico() {
    const chk = document.getElementById('chk-modo-historico');
    const selAnio = document.getElementById('sel-anio-historico');
    const btnPartial = document.getElementById('btn-save-partial');
    const btnNormal = document.getElementById('btn-save-asignacion');
    const btnHistorico = document.getElementById('btn-save-asignacion-historica');
    const activo = chk && chk.checked;

    if (selAnio) toggleElement('sel-anio-historico', activo);
    if (btnPartial) toggleElement('btn-save-partial', !activo);
    if (btnNormal) toggleElement('btn-save-asignacion', !activo);
    if (btnHistorico) toggleElement('btn-save-asignacion-historica', activo);
}

function saveAsignacionHistorica() {
    // Doble advertencia antes de guardar asignación histórica en servidor
    const confirmed = confirmDoubleWarning(
        'GUARDAR ASIGNACIÓN HISTÓRICA EN EL SERVIDOR',
        'Se enviará una nueva asignación histórica al servidor compartido.'
    );
    if (!confirmed) return;

    captureCurrentAdminProgramsState();

    const selectedEvaluatorsRuts = [];
    const selectedEvaluatorsNames = [];
    document.querySelectorAll('.asig-evaluador-chk:checked').forEach(c => {
        selectedEvaluatorsRuts.push(c.value);
        selectedEvaluatorsNames.push(c.getAttribute('data-name'));
    });

    const etapas = [];
    document.querySelectorAll('.asig-etapa-chk:checked').forEach(c => etapas.push(parseInt(c.value, 10)));
    etapas.sort((a, b) => a - b);

    let totalCoveragesList = [];
    for (const [provincia, programas] of Object.entries(adminTemporaryLogisticaMap)) {
        programas.forEach(prog => totalCoveragesList.push({ provincia: provincia, programa: prog }));
    }

    const selectedEntidades = [];
    document.querySelectorAll('.asig-entidad-chk:checked').forEach(c => {
        selectedEntidades.push({ id: c.value, name: c.getAttribute('data-name') });
    });

    const combinedCoverages = [];
    totalCoveragesList.forEach(t => {
        if (selectedEntidades.length > 0) {
            let matched = false;
            selectedEntidades.forEach(ent => {
                const entityData = adminTemporaryEntidades.find(e => e.idEntidad === ent.id);
                if (entityData && entityData.programa === t.programa) {
                    combinedCoverages.push({ provincia: t.provincia, programa: t.programa, entidadId: ent.id, entidadNombre: ent.name });
                    matched = true;
                }
            });
            if (!matched) combinedCoverages.push({ provincia: t.provincia, programa: t.programa, entidadId: null, entidadNombre: 'Sin Entidad' });
        } else {
            combinedCoverages.push({ provincia: t.provincia, programa: t.programa, entidadId: null, entidadNombre: 'Sin Entidad' });
        }
    });

    if (selectedEvaluatorsRuts.length === 0 || etapas.length === 0 || combinedCoverages.length === 0) {
        alert('Para una asignación histórica debe seleccionar al menos: 1 Evaluador, 1 Programa y 1 Etapa.');
        return;
    }

    const anio = document.getElementById('sel-anio-historico').value;

    // Generar asignaciones históricas con idAsig compuesto
    const asignacionesHistoricas = combinedCoverages.map((c, idx) => ({
        idAsig: `${anio}_${c.programa}_${idx + 1}`,
        rut: selectedEvaluatorsRuts[0],
        programa: c.programa,
        provincia: c.provincia,
        entidadId: c.entidadId || '',
        entidadNombre: c.entidadNombre,
        etapas: etapas.join(',')
    }));

    // Guardar localmente en IndexedDB
    const tx = dbInstance.transaction(['asigna_historico'], 'readwrite');
    const store = tx.objectStore('asigna_historico');
    asignacionesHistoricas.forEach(a => store.put(a));
    tx.oncomplete = () => {
        // Sincronizar con la nube
        syncSingleStoreToCloud('asigna_historico', () => {
            // Continuar con la vista histórica
            continuarAAsignacionHistorica(combinedCoverages, selectedEvaluatorsRuts, selectedEvaluatorsNames, etapas, anio);
        });
    };
}

function continuarAAsignacionHistorica(combinedCoverages, selectedEvaluatorsRuts, selectedEvaluatorsNames, etapas, anio) {
    // Guardar todas las entidades asignadas para el selector superior del tab histórico
    historicoEntidadesAsignadas = combinedCoverages.map(c => ({
        entidadId: c.entidadId,
        entidadNombre: c.entidadNombre,
        provincia: c.provincia,
        programa: c.programa
    }));

    historicoConfig = {
        evaluadorRut: selectedEvaluatorsRuts[0],
        evaluadorNombre: selectedEvaluatorsNames[0],
        provincia: combinedCoverages[0].provincia,
        programa: combinedCoverages[0].programa,
        entidadId: combinedCoverages[0].entidadId,
        entidadNombre: combinedCoverages[0].entidadNombre,
        etapas: etapas,
        anio: anio
    };

    historicoStage = etapas[0];
    historicoScores = {};
    historicoMemory = [];

    // Cambiar al tab histórico
    document.querySelectorAll('.admin-main-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-subpanel').forEach(p => p.classList.add('hidden'));
    const tabHist = document.querySelector('.admin-main-tab[data-target="panel-historicos"]');
    if (tabHist) tabHist.classList.add('active');
    toggleElement('panel-historicos', true);

    document.getElementById('sel-historico-anio').value = anio;
    renderHistoricoView();
}

function renderHistoricoView() {
    if (!historicoConfig) {
        document.getElementById('historico-resumen-texto').textContent = 'Sin asignación histórica seleccionada.';
        return;
    }

    const cfg = historicoConfig;
    document.getElementById('historico-resumen-texto').innerHTML = `
        <strong>Evaluador:</strong> ${cfg.evaluadorNombre} (${cfg.evaluadorRut}) |
        <strong>Provincia:</strong> ${cfg.provincia} |
        <strong>Programa:</strong> ${cfg.programa} |
        <strong>Entidad:</strong> ${cfg.entidadNombre} |
        <strong>Etapa:</strong> ${historicoStage} |
        <strong>Año:</strong> ${cfg.anio}
    `;

    // Renderizar tabs de entidades asignadas en la parte superior
    const entidadesContainer = document.getElementById('historico-entidades-tabs');
    entidadesContainer.innerHTML = '';
    if (historicoEntidadesAsignadas.length > 0) {
        historicoEntidadesAsignadas.forEach(ent => {
            const btn = document.createElement('button');
            const isActive = cfg.entidadId === ent.entidadId;
            btn.className = `tab-button ${isActive ? 'active' : ''}`;
            btn.textContent = ent.entidadNombre;
            btn.onclick = () => { cambiarEntidadHistorica(ent); };
            entidadesContainer.appendChild(btn);
        });
    }

    const container = document.getElementById('historico-tabs');
    container.innerHTML = '';
    cfg.etapas.sort((a, b) => a - b).forEach(i => {
        const btn = document.createElement('button');
        btn.className = `tab-button ${historicoStage === i ? 'active' : ''}`;
        btn.textContent = `Etapa ${i}`;
        if (historicoStage === i) {
            btn.style.backgroundColor = `var(--bg-stage-${i})`;
            btn.style.color = '#000';
            btn.style.border = '1px solid var(--primary-dark)';
        }
        btn.onclick = () => { saveHistoricoMemoryFromInputs(); historicoStage = i; renderHistoricoView(); };
        container.appendChild(btn);
    });

    const titleLabel = document.getElementById('historico-stage-title');
    const descLabel = document.getElementById('historico-stage-desc');
    if (STAGES_METADATA[historicoStage]) {
        titleLabel.textContent = STAGES_METADATA[historicoStage].title;
        descLabel.textContent = STAGES_METADATA[historicoStage].desc;
    }
    document.getElementById('historico-stage-footer-label').textContent = `PRECALIFICACIÓN ETAPA ${historicoStage}`;

    const tableCard = document.getElementById('historico-table-card');
    if (tableCard) tableCard.style.backgroundColor = `var(--bg-stage-${historicoStage})`;

    loadHistoricoScoresFromMemory();
    renderHistoricoTable();
}

function loadHistoricoScoresFromMemory() {
    historicoScores = {};
    historicoMemory.filter(r => r.stage === historicoStage).forEach(r => {
        historicoScores[r.itemId] = r.score;
    });
}

function renderHistoricoTable() {
    const tbody = document.getElementById('historico-rows');
    const rowsHtml = dbItems.filter(i => i.stage === historicoStage).map(item => {
        const score = historicoScores[item.id] !== undefined ? historicoScores[item.id] : "";
        return `
            <tr>
                <td class="cell-index bold-text">${item.id}</td>
                <td class="cell-desc">${item.text}</td>
                <td colspan="3" class="cell-score-input">
                    <input type="number" class="historico-score-input" data-id="${item.id}" min="0" max="100" value="${score}" placeholder="0">
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = rowsHtml.join('');

    document.querySelectorAll('.historico-score-input').forEach(input => {
        input.addEventListener('input', calculateHistoricoLiveScore);
    });

    calculateHistoricoLiveScore();
}

function calculateHistoricoLiveScore() {
    const inputs = document.querySelectorAll('.historico-score-input');
    let totalStage = 0, countStage = 0;

    inputs.forEach(input => {
        let val = parseInt(input.value, 10);
        const id = input.getAttribute('data-id');
        const existingIdx = historicoMemory.findIndex(r => r.stage === historicoStage && r.itemId === id);

        if (isNaN(val)) {
            delete historicoScores[id];
            if (existingIdx >= 0) historicoMemory.splice(existingIdx, 1);
            return;
        }
        if (val < 0) { input.value = 0; val = 0; }
        if (val > 100) { input.value = 100; val = 100; }
        historicoScores[id] = val;
        totalStage += val; countStage++;

        if (existingIdx >= 0) {
            historicoMemory[existingIdx].score = val;
        } else {
            historicoMemory.push({
                idHist: `hist_${Date.now().toString()}_${id}`,
                anio: historicoConfig.anio,
                calificador: historicoConfig.evaluadorNombre,
                calificadorRut: historicoConfig.evaluadorRut,
                provincia: historicoConfig.provincia,
                programa: historicoConfig.programa,
                entidad: historicoConfig.entidadNombre,
                entidadId: historicoConfig.entidadId,
                stage: historicoStage,
                itemId: id,
                score: val,
                fecha: formatDateTime(new Date())
            });
        }
    });

    const finalScoreCell = document.getElementById('historico-final-score');
    const statusTextCell = document.getElementById('historico-status-text');

    if (countStage > 0) {
        const stageAverage = Math.round(totalStage / countStage);
        if (finalScoreCell) finalScoreCell.textContent = stageAverage;
        setEvaluationStatus(statusTextCell, stageAverage);
    } else {
        if (finalScoreCell) finalScoreCell.textContent = "0";
        if (statusTextCell) { statusTextCell.textContent = "---"; statusTextCell.style.backgroundColor = "transparent"; }
    }
}

function saveHistoricoMemoryFromInputs() {
    calculateHistoricoLiveScore();
}

function cambiarEntidadHistorica(ent) {
    if (!historicoConfig) return;
    saveHistoricoMemoryFromInputs();
    historicoConfig.entidadId = ent.entidadId;
    historicoConfig.entidadNombre = ent.entidadNombre;
    historicoConfig.provincia = ent.provincia;
    historicoConfig.programa = ent.programa;
    historicoStage = historicoConfig.etapas[0];
    historicoScores = {};
    historicoMemory = [];
    renderHistoricoView();
}

function autoCargarHistorico() {
    if (!historicoConfig) return;
    const anio = document.getElementById('sel-historico-anio').value;
    historicoConfig.anio = anio;

    // Leer siempre desde el servidor
    showProgressBar('Cargando calificaciones históricas desde el servidor...');
    cloudGet('historicos').then(registros => {
        hideProgressBar();
        if (!registros || !Array.isArray(registros)) {
            alert('No se pudieron cargar los datos históricos desde el servidor.');
            return;
        }

        const filtrados = registros.filter(r =>
            r.calificadorRut === historicoConfig.evaluadorRut &&
            r.provincia === historicoConfig.provincia &&
            r.programa === historicoConfig.programa &&
            r.entidadId === historicoConfig.entidadId &&
            r.anio === anio
        );

        historicoMemory = historicoMemory.filter(r => !(r.calificadorRut === historicoConfig.evaluadorRut && r.provincia === historicoConfig.provincia && r.programa === historicoConfig.programa && r.entidadId === historicoConfig.entidadId && r.anio === anio));
        filtrados.forEach(r => historicoMemory.push(r));
        loadHistoricoScoresFromMemory();
        renderHistoricoTable();
    }).catch(err => {
        hideProgressBar();
        console.error('Error al cargar históricos desde el servidor:', err);
        alert('Error de conexión. No se pudieron cargar los datos históricos.');
    });
}

function cargarHistorico() {
    if (!historicoConfig) {
        alert('No hay una asignación histórica configurada. Use el check HISTORICO en Asignación Rápida.');
        return;
    }

    const anio = document.getElementById('sel-historico-anio').value;
    historicoConfig.anio = anio;

    // Leer siempre desde el servidor
    showProgressBar('Cargando calificaciones históricas desde el servidor...');
    cloudGet('historicos').then(registros => {
        hideProgressBar();
        if (!registros || !Array.isArray(registros)) {
            alert('No se pudieron cargar los datos históricos desde el servidor.');
            return;
        }

        const filtrados = registros.filter(r =>
            r.calificadorRut === historicoConfig.evaluadorRut &&
            r.provincia === historicoConfig.provincia &&
            r.programa === historicoConfig.programa &&
            r.entidadId === historicoConfig.entidadId &&
            r.anio === anio
        );

        if (filtrados.length === 0) {
            alert('No se encontraron calificaciones históricas para esta combinación.');
            historicoMemory = historicoMemory.filter(r => !(r.calificadorRut === historicoConfig.evaluadorRut && r.provincia === historicoConfig.provincia && r.programa === historicoConfig.programa && r.entidadId === historicoConfig.entidadId && r.anio === anio));
            loadHistoricoScoresFromMemory();
            renderHistoricoTable();
            return;
        }

        // Reemplazar en memoria los registros de esta combinación
        historicoMemory = historicoMemory.filter(r => !(r.calificadorRut === historicoConfig.evaluadorRut && r.provincia === historicoConfig.provincia && r.programa === historicoConfig.programa && r.entidadId === historicoConfig.entidadId && r.anio === anio));
        filtrados.forEach(r => historicoMemory.push(r));
        loadHistoricoScoresFromMemory();
        renderHistoricoTable();
    }).catch(err => {
        hideProgressBar();
        console.error('Error al cargar históricos desde el servidor:', err);
        alert('Error de conexión. No se pudieron cargar los datos históricos.');
    });
}

function guardarHistorico() {
    if (!historicoConfig) {
        alert('No hay una asignación histórica configurada.');
        return;
    }

    // Doble advertencia antes de guardar calificación histórica en servidor
    const confirmed = confirmDoubleWarning(
        'GUARDAR CALIFICACIÓN HISTÓRICA EN EL SERVIDOR',
        `Se enviará la calificación histórica de ${historicoConfig.evaluadorNombre} al servidor compartido.`
    );
    if (!confirmed) return;

    if (!ensureStoreExists('historicos')) {
        alert('La base de datos local no está lista. Recargue la página para recrear la estructura.');
        return;
    }

    saveHistoricoMemoryFromInputs();

    const anio = document.getElementById('sel-historico-anio').value;
    historicoConfig.anio = anio;

    // Actualizar año en todos los registros en memoria de esta combinación
    historicoMemory.forEach(r => {
        if (r.calificadorRut === historicoConfig.evaluadorRut && r.provincia === historicoConfig.provincia && r.programa === historicoConfig.programa && r.entidadId === historicoConfig.entidadId) {
            r.anio = anio;
        }
    });

    showProgressBar('Guardando calificación histórica...');
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 10;
        if (progress > 90) progress = 90;
        updateProgressBar(progress);
    }, 150);

    dbGetAll('historicos', (registros) => {
        const tx = dbInstance.transaction(['historicos'], 'readwrite');
        const store = tx.objectStore('historicos');

        // Borrar registros previos de esta combinación
        registros.filter(r =>
            r.calificadorRut === historicoConfig.evaluadorRut &&
            r.provincia === historicoConfig.provincia &&
            r.programa === historicoConfig.programa &&
            r.entidadId === historicoConfig.entidadId &&
            r.anio === anio
        ).forEach(r => store.delete(r.idHist));

        // Insertar registros actuales de esta combinación
        const registrosActuales = historicoMemory.filter(r =>
            r.calificadorRut === historicoConfig.evaluadorRut &&
            r.provincia === historicoConfig.provincia &&
            r.programa === historicoConfig.programa &&
            r.entidadId === historicoConfig.entidadId &&
            r.anio === anio
        );

        registrosActuales.forEach(r => store.put(r));

        tx.oncomplete = () => {
            clearInterval(progressInterval);
            updateProgressBar(100);
            
            // Sincronizar automáticamente con la nube
            syncSingleStoreToCloud('historicos', (success) => {
                hideProgressBar();
                if (success) {
                    alert('✅ Calificación histórica guardada y sincronizada con el servidor.');
                } else {
                    alert('⚠️ Calificación guardada localmente. Se sincronizará cuando tenga conexión.');
                }
            });
        };

        tx.onerror = () => {
            clearInterval(progressInterval);
            hideProgressBar();
            alert('Error al guardar la calificación histórica.');
        };
    });
}

function transformHistoricosToWideRows(registros) {
    const itemIds = ['1.1','1.2','1.3','1.4','1.5','1.6','1.7','1.8','1.9','2.1','2.2','2.3','2.4','2.5','2.6','2.7','2.8','2.9','3.1','3.2','3.3','3.4','3.5','3.6','3.7','4.1','4.2','4.3','4.4','4.5','4.6','4.7','4.8','4.9','4.10','5.1','5.2','5.3','5.4','5.5','5.6','5.7','6.1','6.2','6.3','6.4','6.5','6.6','6.7','6.8','6.9'];
    const grouped = {};

    registros.forEach(r => {
        const key = `${r.provincia}|${r.programa}|${r.entidad}|${r.calificador}|${r.anio}`;
        if (!grouped[key]) {
            grouped[key] = {
                PROVINCIA: r.provincia,
                PROGRAMA: r.programa,
                ENTIDAD: r.entidad,
                CALIFICADOR: r.calificador,
                AÑO: r.anio
            };
            itemIds.forEach(id => grouped[key][id] = '');
        }
        if (itemIds.includes(r.itemId)) {
            grouped[key][r.itemId] = r.score;
        }
    });

    return Object.values(grouped);
}

/* ================= SINCRONIZACIÓN BIDIRECCIONAL DE ASIGNACIONES HISTÓRICAS ================= */
function checkAsignacionesHistoricasConflict() {
    if (!CLOUD_MODE_ENABLED) return;

    Promise.all([
        new Promise(resolve => dbGetAll('asigna_historico', resolve)),
        cloudGet('asigna_historico')
    ]).then(([local, remote]) => {
        if (!Array.isArray(remote)) return;

        const localMap = {};
        (local || []).forEach(a => { localMap[a.idAsig] = a; });
        const remoteMap = {};
        remote.forEach(a => { remoteMap[a.idAsig] = a; });

        const added = [];
        const removed = [];
        const modified = [];

        // Detectar agregados y modificados en remoto
        remote.forEach(r => {
            if (!localMap[r.idAsig]) {
                added.push({ idAsig: r.idAsig, data: r, source: 'remote' });
            } else {
                const l = localMap[r.idAsig];
                if (l.rut !== r.rut || l.programa !== r.programa || l.provincia !== r.provincia || l.entidadId !== r.entidadId || l.entidadNombre !== r.entidadNombre || l.etapas !== r.etapas) {
                    modified.push({ idAsig: r.idAsig, local: l, remote: r });
                }
            }
        });

        // Detectar eliminados en remoto (existen local pero no remoto)
        (local || []).forEach(l => {
            if (!remoteMap[l.idAsig]) {
                removed.push({ idAsig: l.idAsig, data: l });
            }
        });

        if (added.length === 0 && removed.length === 0 && modified.length === 0) return;

        showConflictModal(added, removed, modified, remote);
    }).catch(err => {
        console.error('Error al verificar conflictos de asignaciones históricas:', err);
    });
}

function showConflictModal(added, removed, modified, remoteData) {
    const modal = document.getElementById('audit-modal');
    document.getElementById('modal-title').textContent = 'Conflictos de Asignaciones Históricas';
    toggleElement('modal-table-container', false);
    toggleElement('modal-overwrite-question', false);
    toggleElement('modal-action-footer', true);

    let html = `
        <div style="background:#FFF3CD; border-left:4px solid #856404; padding:10px; border-radius:4px; margin-bottom:10px; font-size:0.85rem;">
            <strong>Resumen:</strong> Se detectaron diferencias entre las asignaciones históricas locales y las del servidor.
            <ul style="margin:5px 0 0 15px; padding:0;">
                <li><strong>Agregadas en servidor:</strong> ${added.length}</li>
                <li><strong>Eliminadas en servidor:</strong> ${removed.length}</li>
                <li><strong>Modificadas en servidor:</strong> ${modified.length}</li>
            </ul>
        </div>
        <p style="font-size:0.85rem; margin-bottom:10px;">Seleccione para cada asignación si desea <strong>Mantener local</strong> o <strong>Sincronizar servidor</strong>.</p>
    `;

    const renderItem = (item, type, idx) => {
        const d = item.data || item.remote || item.local;
        let detail = '';
        if (type === 'modified') {
            detail = `<br><span style="color:#006BB9;">Local:</span> ${item.local.rut} | ${item.local.programa} | ${item.local.provincia} | ${item.local.entidadNombre} | Etapas: ${item.local.etapas}<br>
                      <span style="color:#28A745;">Servidor:</span> ${item.remote.rut} | ${item.remote.programa} | ${item.remote.provincia} | ${item.remote.entidadNombre} | Etapas: ${item.remote.etapas}`;
        } else {
            detail = `${d.rut} | ${d.programa} | ${d.provincia} | ${d.entidadNombre} | Etapas: ${d.etapas}`;
        }
        return `
            <div style="background:#F8F9FA; padding:8px; border-left:3px solid var(--primary-blue); margin-bottom:6px; font-size:0.82rem;">
                <div style="margin-bottom:4px;"><strong>${item.idAsig}</strong> (${type === 'added' ? 'Agregada' : type === 'removed' ? 'Eliminada' : 'Modificada'})</div>
                <div style="margin-bottom:6px;">${detail}</div>
                <div style="display:flex; gap:8px;">
                    <label style="display:flex; align-items:center; gap:4px; cursor:pointer;"><input type="radio" name="conflict_${type}_${idx}" value="local" checked> Mantener local</label>
                    <label style="display:flex; align-items:center; gap:4px; cursor:pointer;"><input type="radio" name="conflict_${type}_${idx}" value="server"> Sincronizar servidor</label>
                </div>
            </div>
        `;
    };

    added.forEach((item, i) => { html += renderItem(item, 'added', i); });
    removed.forEach((item, i) => { html += renderItem(item, 'removed', i); });
    modified.forEach((item, i) => { html += renderItem(item, 'modified', i); });

    document.getElementById('modal-custom-html-body').innerHTML = html;

    const confirmBtn = document.getElementById('btn-modal-confirm');
    confirmBtn.onclick = () => {
        applyConflictResolution(added, removed, modified, remoteData);
        closeModal();
    };

    toggleElement('audit-modal', true);
}

function applyConflictResolution(added, removed, modified, remoteData) {
    // Doble advertencia antes de aplicar resolución de conflictos en servidor
    const confirmed = confirmDoubleWarning(
        'APLICAR RESOLUCIÓN DE CONFLICTOS EN EL SERVIDOR',
        'Se sincronizarán las asignaciones históricas resueltas con el servidor compartido.'
    );
    if (!confirmed) return;

    const tx = dbInstance.transaction(['asigna_historico'], 'readwrite');
    const store = tx.objectStore('asigna_historico');

    // Procesar agregadas
    added.forEach((item, i) => {
        const choice = document.querySelector(`input[name="conflict_added_${i}"]:checked`).value;
        if (choice === 'server') {
            store.put(item.data);
        }
    });

    // Procesar eliminadas
    removed.forEach((item, i) => {
        const choice = document.querySelector(`input[name="conflict_removed_${i}"]:checked`).value;
        if (choice === 'server') {
            store.delete(item.idAsig);
        }
    });

    // Procesar modificadas
    modified.forEach((item, i) => {
        const choice = document.querySelector(`input[name="conflict_modified_${i}"]:checked`).value;
        if (choice === 'server') {
            store.put(item.remote);
        }
    });

    tx.oncomplete = () => {
        alert('Resolución de conflictos aplicada. Se sincronizarán los cambios con el servidor.');
        syncSingleStoreToCloud('asigna_historico');
    };
}

/* ================= EXPORTACIÓN A PDF DEL EVALUADOR ================= */
function exportEvaluatorPDF() {
    const exportDate = formatDateTime(new Date());

    const printContainer = document.createElement('div');
    printContainer.id = 'pdf-print-container';
    
    let contentHtml = `
        <div style="text-align:center; margin-bottom: 20px;">
            <h2 style="color: var(--primary-dark); font-size: 1.5rem; margin-bottom: 5px;">Respaldo Integral de Precalificaciones</h2>
            <p style="font-size: 1rem; margin-bottom: 2px;"><strong>Evaluador:</strong> ${currentUser.nombre} (${currentUser.rut})</p>
            <p style="font-size: 1rem;"><strong>Fecha y Hora de Exportación:</strong> ${exportDate}</p>
        </div>
    `;
    
    allAsignacionesMapped.forEach(asig => {
        asig.etapas.forEach(stg => {
            const stageRecords = allMemoryScores.filter(r => r.cobertura === asig.cobertura && r.stage === stg);
            let lastEvalDate = "Sin registro";
            let maxTs = 0;
            stageRecords.forEach(r => {
                let ts = parseAnyDate(r.hora);
                if (ts > maxTs) { maxTs = ts; lastEvalDate = r.hora; }
                else if (lastEvalDate === "Sin registro" && r.hora) lastEvalDate = r.hora;
            });

            const meta = STAGES_METADATA[stg] || { title: `ETAPA ${stg}`, desc: "" };
            const stageItems = dbItems.filter(i => i.stage === stg);
            let totalScore = 0, countScore = 0;
            
            const rowsHtml = stageItems.map(item => {
                const rec = stageRecords.find(r => r.itemId === item.id);
                const val = rec && rec.score !== undefined ? rec.score : "-";
                if (val !== "-") { totalScore += parseInt(val, 10); countScore++; }
                return `
                    <tr>
                        <td style="border: 1px solid #000; padding: 6px; font-weight:bold; text-align:center; width:8%;">${item.id}</td>
                        <td style="border: 1px solid #000; padding: 6px; width:77%; font-size: 0.85rem;">${item.text}</td>
                        <td style="border: 1px solid #000; padding: 6px; text-align:center; font-weight:bold; width:15%;">${val}</td>
                    </tr>
                `;
            }).join('');

            const finalAvg = countScore > 0 ? Math.round(totalScore / countScore) : 0;
            const status = getStatusInfo(finalAvg);
            const statusText = countScore > 0 ? status.text : "---";

            contentHtml += `
                <div style="page-break-inside: avoid; margin-bottom: 30px;">
                    <table style="width:100%; border-collapse: collapse; margin-bottom: 8px; font-size: 0.9rem;">
                        <tr><td style="padding: 4px; border: 1px solid #000; background-color: #EEE; width: 25%;"><strong>Cobertura:</strong></td><td style="padding: 4px; border: 1px solid #000;">${asig.cobertura}</td></tr>
                        <tr><td style="padding: 4px; border: 1px solid #000; background-color: #EEE;"><strong>Fecha de Calificación:</strong></td><td style="padding: 4px; border: 1px solid #000;">${lastEvalDate}</td></tr>
                    </table>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                        <thead>
                            <tr style="background-color: var(--primary-dark); color: #FFF; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                                <th colspan="2" style="border: 1px solid #000; padding: 6px; text-align:left;">${meta.title}</th>
                                <th style="border: 1px solid #000; padding: 6px; text-align:center;">NOTA</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="border: 1px solid #000; padding: 6px; text-align:right; font-weight:bold; background-color: #F8F9FA;">ESTADO: <span style="color:${status.color === '#FFF' ? '#000' : status.color};">${statusText}</span> | PROMEDIO FINAL</td>
                                <td style="border: 1px solid #000; padding: 6px; text-align:center; font-weight:bold; font-size: 1.1rem; background-color: #F8F9FA;">${countScore > 0 ? finalAvg : '-'}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;
        });
    });

    printContainer.innerHTML = contentHtml;
    document.body.appendChild(printContainer);

    window.print();

    document.body.removeChild(printContainer);
}
