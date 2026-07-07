/* ================= CONFIGURACIÓN DE ENTORNO WEB (GITHUB + GOOGLE SCRIPTS) ================= */
// Las URLs sensibles y secrets se cargan desde config.js (no versionado)
const CLOUD_MODE_ENABLED = CONFIG?.CLOUD_MODE_ENABLED ?? true;
const GOOGLE_SCRIPT_URL = CONFIG?.GOOGLE_SCRIPT_URL ?? "https://script.google.com/macros/s/AKfycbxt8ro_g6OEO-SuY2M9Q_FQ-ZcKnGBn6_sGI_bgK4-gLONF8gMxwlvvFwVD9ZBVvbIWFg/exec";

// Sistema de rate limiting para login
let loginAttempts = {};
const SECURITY_CONFIG = CONFIG?.SECURITY ?? {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MS: 900000,
    PASSWORD_MIN_LENGTH: 6
};

// Sistema de CSRF tokens
let csrfToken = null;
let csrfTokenTimestamp = null;
const CSRF_TOKEN_EXPIRY_MS = 3600000; // 1 hora

// Sistema de gestión de event listeners (prevenir memory leaks)
const managedListeners = [];

function addManagedListener(element, event, handler, options = false) {
    if (!element) return;
    element.addEventListener(event, handler, options);
    managedListeners.push({ element, event, handler, options });
}

function cleanupAllListeners() {
    managedListeners.forEach(({ element, event, handler, options }) => {
        if (element) {
            element.removeEventListener(event, handler, options);
        }
    });
    managedListeners.length = 0; // Limpiar array
}

// Resolver rutas correctamente en GitHub Pages subdirectorio
function getBasePath() {
    const href = document.querySelector('base')?.getAttribute('href') || '/';
    return href.endsWith('/') ? href : href + '/';
}

const BASE_PATH = getBasePath();

function generateCSRFToken() {
    // Generar token único usando timestamp + random
    const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString(36);
    csrfToken = btoa(`${timestamp}.${random}`).replace(/[+/=]/g, c => ({'+': '-', '/': '_', '=': ''}[c]));
    csrfTokenTimestamp = Date.now();
    return csrfToken;
}

function validateCSRFToken(token) {
    if (!csrfToken || !token) return false;
    if (token !== csrfToken) return false;
    // Verificar que no ha expirado
    if (Date.now() - csrfTokenTimestamp > CSRF_TOKEN_EXPIRY_MS) {
        csrfToken = null;
        return false;
    }
    return true;
}

function invalidateCSRFToken() {
    csrfToken = null;
    csrfTokenTimestamp = null;
}

// Helper seguro para renderizar texto sin riesgo de XSS
function escapeHTML(text) {
    const map = {
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, c => map[c]);
}

// Setter seguro de innerHTML con datos
function setSafeHTML(element, html) {
    if (!element) return;
    element.innerHTML = html;
}

// Crear elemento seguro con contenido de texto
function createSafeElement(tag, text, className = '') {
    const el = document.createElement(tag);
    el.textContent = text;
    if (className) el.className = className;
    return el;
}

// Renderizar HTML seguro (para strings seguros/constantes, no datos de usuario)
function renderSafeHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    return div.firstChild;
}

// Renderizar tabla segura con datos potencialmente peligrosos
function createTableRow(data, isHeader = false) {
    const tr = document.createElement('tr');
    if (isHeader) tr.style.backgroundColor = 'var(--primary-dark)';
    if (isHeader) tr.style.color = '#FFF';

    data.forEach(cellContent => {
        const cell = document.createElement(isHeader ? 'th' : 'td');
        cell.textContent = String(cellContent || ''); // textContent es seguro contra XSS
        tr.appendChild(cell);
    });
    return tr;
}

// Renderizar mensaje seguro en tabla
function createTableMessage(message, colspan = 6, isError = false) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.setAttribute('colspan', colspan);
    td.className = 'text-center';
    if (isError) td.style.color = '#d32f2f';
    td.textContent = message; // Seguro contra XSS
    tr.appendChild(td);
    return tr;
}

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
    1: {
        title: "Organización de la demanda y Diagnóstico Técnico y Social",
        short: "Etapa 1",
        desc: "Comprende: diagnóstico del estado de la situación de las familias y/o su necesidad habitacional, organización de la demanda, identificación de necesidades técnicas y sociales."
    },
    2: {
        title: "Elaboración y presentación del proyecto",
        short: "Etapa 2",
        desc: "Comprende: desarrollo integral de los diseños arquitectónicos, de loteos, de especialidades técnicas e ingeniería estructural; cubicaciones, presupuestos detallados y especificaciones técnicas normativas."
    },
    3: {
        title: "Gestión Legal",
        short: "Etapa 3",
        desc: "Comprende: apoyo jurídico para el desarrollo y ejecución del proyecto, asesoría legal para la regularización de inmuebles, trámites de inscripción y recepción de obras."
    },
    4: {
        title: "Gestión técnica y administrativa",
        short: "Etapa 4",
        desc: "Comprende: realización de actividades de seguimiento del proyecto en todas sus etapas, supervisión técnica, relación y coordinación con entidades públicas y privadas."
    },
    5: {
        title: "PHS",
        short: "Etapa 5",
        desc: "Acompañamiento Social: Entrega de información a las familias sobre avance y desarrollo del proyecto, coordinar visitas programadas, apoyo social durante ejecución."
    },
    6: {
        title: "Post Venta",
        short: "Etapa 6",
        desc: "Asesoría Técnica y Social: realización de reuniones o talleres de capacitación sobre uso y cuidado de viviendas, información y vinculación con redes comunitarias."
    }
};

let currentUser = null, currentRole = null, currentStage = 1, currentCoverage = "", deadlineExpired = false;
let dbInstance = null, dbItems = [], dbScores = {}, allMemoryScores = [], allAsignacionesMapped = [];
let DEADLINE = null; // Fecha límite cargada desde configuración
let sessionStartTime = null; // Hora de inicio de sesión
let sessionCountdownInterval = null; // Interval para el countdown de sesión
let currentEntityPage = 1; // Página actual de paginación de entidades
const ENTITIES_PER_PAGE = 4; // Máximo de entidades por página
const SESSION_DURATION_MS = 10 * 60 * 1000; // 10 minutos

// Control de sesiones simultáneas (máximo 6 usuarios)
const MAX_CONCURRENT_USERS = 6;
const ACTIVE_USER_SESSIONS = new Map(); // RUT → {loginTime, lastActivity, lastWrite}
const SESSION_TIMEOUT_MINUTES = 10;
const INACTIVITY_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000;

// Rastrear timeouts de inactividad por usuario
const userInactivityTimers = {};

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

// Sistema de notificaciones
const notificationSystem = {
    notifications: {},

    show(id, message, type = 'info', progress = null) {
        const panel = document.getElementById('notification-panel');
        const list = document.getElementById('notification-list');

        if (!panel || !list) return;

        panel.style.display = 'block';

        if (!this.notifications[id]) {
            const html = `
                <div id="notif-${id}" style="background: #F5F7FA; border-left: 4px solid #006BB9; padding: 12px; margin-bottom: 10px; border-radius: 4px; font-size: 0.85rem;">
                    <div style="font-weight: 600; color: var(--primary-dark); margin-bottom: 4px;">${message}</div>
                    <div id="notif-${id}-progress" style="margin-top: 8px;"></div>
                </div>
            `;
            list.insertAdjacentHTML('beforeend', html);
            this.notifications[id] = { message, type, progress };
        } else {
            const elem = document.getElementById(`notif-${id}`);
            if (elem) {
                elem.querySelector('div:first-of-type').textContent = message;
                this.notifications[id].message = message;
            }
        }

        if (progress !== null) {
            this.updateProgress(id, progress);
        }
    },

    updateProgress(id, progress) {
        const progressDiv = document.getElementById(`notif-${id}-progress`);
        if (!progressDiv) return;

        const percent = Math.min(100, Math.max(0, progress));
        const displayPercent = Math.round(percent * 1000) / 1000; // Máximo 3 decimales
        progressDiv.innerHTML = `
            <div style="background: #E8EAED; height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #006BB9, #28A745); height: 100%; width: ${percent}%; transition: width 0.3s ease;"></div>
            </div>
            <div style="font-size: 0.75rem; color: #666; margin-top: 4px; text-align: right;">${displayPercent.toLocaleString('es-CL', {maximumFractionDigits: 3})}%</div>
        `;
    },

    remove(id) {
        const elem = document.getElementById(`notif-${id}`);
        if (elem) {
            elem.style.opacity = '0';
            elem.style.transition = 'opacity 0.3s ease';
            setTimeout(() => elem.remove(), 300);
        }
        delete this.notifications[id];

        if (Object.keys(this.notifications).length === 0) {
            const panel = document.getElementById('notification-panel');
            if (panel) {
                setTimeout(() => { panel.style.display = 'none'; }, 1000);
            }
        }
    }
};

/* ================= FUNCIONES AUXILIARES (REDUCCIÓN DE CÓDIGO) ================= */
function formatDDMMYYYY(dateObj) {
    const d = dateObj.getDate().toString().padStart(2, '0');
    const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}-${m}-${y}`;
}

function formatFullDate(dateObj) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayName = days[dateObj.getDay()];
    const monthName = months[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${dayName}, ${day} de ${monthName} de ${year}`;
}

function formatDateTime(dateObj) {
    return formatDDMMYYYY(dateObj) + " " + dateObj.toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'});
}

function formatTimeOnly(dateObj) {
    return dateObj.toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit', hour12: false});
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
    if (show) {
        el.classList.remove('hidden');
        el.style.display = '';  // Restaurar display original
    } else {
        el.classList.add('hidden');
        el.style.display = 'none';  // Forzar display none
    }
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
        // Timeout agresivo: 15 segundos (mucho más rápido que 30)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        // Agregamos &t=Date.now() para forzar al navegador a ignorar el caché y obtener la info fresca real
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?table=${table}&t=${Date.now()}`, {
            signal: controller.signal,
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`Error HTTP al obtener ${table}:`, response.status);
            return null;
        }

        const payload = await response.json();
        if (payload && typeof payload.serverVersion === 'number') {
            serverVersions[table] = payload.serverVersion;
        }
        return Array.isArray(payload) ? payload : (payload.data || []);
    } catch (error) {
        console.error(`Error leyendo tabla ${table} desde el servidor:`, error);
        if (error.name === 'AbortError') {
            console.error(`⏱️ Timeout: Google Sheets tardó más de 15 segundos para ${table}`);
        }
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

/**
 * SYNC ADAPTATIVO - Ajusta frecuencia según cantidad de datos pendientes
 * Optimizado para soportar múltiples usuarios sin sobrecargar Google Sheets
 */
const SYNC_MANAGER = {
    pendingByTable: {},
    syncTimeoutByTable: {},
    syncInProgressByTable: {},

    getAdaptiveInterval(pendingCount) {
        if (pendingCount < 10) return 30000;    // 30s - ahorro batería
        if (pendingCount < 50) return 5000;     // 5s - normal
        return 1000;                             // 1s - urgente
    },

    registerPending(table, count) {
        this.pendingByTable[table] = count;
        if (count > 0) this.scheduleSyncIfNeeded(table);
    },

    scheduleSyncIfNeeded(table) {
        if (this.syncInProgressByTable[table]) return;
        if (!this.pendingByTable[table] || this.pendingByTable[table] === 0) return;

        if (this.syncTimeoutByTable[table]) {
            clearTimeout(this.syncTimeoutByTable[table]);
        }

        const interval = this.getAdaptiveInterval(this.pendingByTable[table]);
        this.syncTimeoutByTable[table] = setTimeout(() => {
            this.pendingByTable[table] = 0; // Marcar como sincronizado
        }, interval);

        console.log(`⏰ Sync ${table} en ${interval}ms (${this.pendingByTable[table]} pendientes)`);
    }
};

/**
 * Actualizar etiqueta de estado de guardado
 * Muestra "PENDIENTE" si hay datos sin guardar, "GUARDADO" si todo está sincronizado
 */
function updateSaveStatus() {
    const badge = document.getElementById('save-status-badge');
    if (!badge) return;

    // Contar total de datos pendientes en todas las tablas
    const totalPending = Object.values(SYNC_MANAGER.pendingByTable).reduce((sum, count) => sum + (count || 0), 0);

    if (totalPending > 0) {
        badge.textContent = '⏳ PENDIENTE';
        badge.style.background = '#FF9800';
        badge.style.color = 'white';
        badge.style.display = 'inline-block';
    } else {
        badge.textContent = '✅ GUARDADO';
        badge.style.background = '#2E8B57';
        badge.style.color = 'white';
        badge.style.display = 'inline-block';
    }
}

/**
 * Iniciar monitoreo del estado de guardado
 * Actualiza cada 500ms
 */
function initSaveStatusMonitor() {
    // Actualizar inicial
    updateSaveStatus();

    // Monitorear cambios cada 500ms
    setInterval(updateSaveStatus, 500);

    console.log('💡 Monitor de estado de guardado iniciado');
}

/**
 * HELPER FUNCTIONS - Eliminan duplicación de código
 */

/**
 * Parsea y normaliza etapas de una asignación
 * @param {string|array} etapas - Etapas como string "1|2|3" o "1,2,3" (compatibilidad) o array [1,2,3]
 * @returns {array} Array de números [1,2,3] siempre válido, mínimo [1]
 */
function parseAsignacionEtapas(etapas) {
    let parsedEtapas = etapas;
    if (typeof parsedEtapas === 'string') {
        // Detectar separador: usar | (pipe) primero, luego , (coma) para compatibilidad
        const separator = parsedEtapas.includes('|') ? '|' : ',';
        parsedEtapas = parsedEtapas.split(separator)
            .map(n => {
                const num = parseInt(n.trim(), 10);
                // Si el número es > 100, probablemente sea "200X" (concatenación con año)
                // Esto puede ocurrir con datos antiguos guardados mal
                if (num > 100) {
                    // Intentar extraer la etapa (1-6) del número corrupto
                    const lastDigit = num % 10;
                    const secondLastDigit = Math.floor((num % 100) / 10);
                    // Si el último dígito es válido (1-6), usarlo
                    if (lastDigit >= 1 && lastDigit <= 6) {
                        console.warn(`⚠️ Etapa corrupta detectada: ${num} → corregida a ${lastDigit}`);
                        return lastDigit;
                    }
                    // Si el segundo-último dígito es válido (1-6), usarlo
                    if (secondLastDigit >= 1 && secondLastDigit <= 6) {
                        console.warn(`⚠️ Etapa corrupta detectada: ${num} → corregida a ${secondLastDigit}`);
                        return secondLastDigit;
                    }
                    // Si ninguno es válido, descartar
                    console.warn(`⚠️ Etapa corrupta descartada: ${num}`);
                    return NaN;
                }
                return num;
            })
            .filter(n => !isNaN(n) && n >= 1 && n <= 6);  // Solo valores válidos (1-6)
    } else if (!Array.isArray(parsedEtapas)) {
        parsedEtapas = [1];
    }
    if (!Array.isArray(parsedEtapas) || parsedEtapas.length === 0) {
        parsedEtapas = [1];
    }
    return parsedEtapas.sort((x, y) => x - y);
}

/**
 * Filtra asignaciones por RUT del usuario actual
 * @param {array} asignacionArray - Array de asignaciones
 * @returns {array} Asignaciones del usuario actual
 */
function getUserAsignaciones(asignacionArray) {
    if (!Array.isArray(asignacionArray)) return [];
    return asignacionArray.filter(a => a && a.rut === currentUser?.rut);
}

/**
 * Mapea asignaciones para mostrar en UI
 * @param {array} userAsignaciones - Array de asignaciones del usuario
 * @returns {array} Array mapeado con formato para UI
 */
function mapAsignacionesForDisplay(userAsignaciones) {
    if (!Array.isArray(userAsignaciones)) return [];

    return userAsignaciones.map(a => {
        const parsedEtapas = parseAsignacionEtapas(a.etapas);

        let entidadNombre = a.entidadNombre;
        if (!entidadNombre || entidadNombre === 'undefined' || (typeof entidadNombre === 'string' && entidadNombre.trim() === '')) {
            entidadNombre = 'Sin Entidad';
        }

        return {
            cobertura: `${a.programa} - ${a.provincia.toUpperCase()}`,
            etapas: parsedEtapas,
            programa: a.programa,
            provincia: a.provincia,
            entidadNombre: entidadNombre
        };
    }).sort((a, b) => a.cobertura.localeCompare(b.cobertura));
}

/**
 * Obtiene nombre de entidad con fallbacks
 * @param {object} entity - Objeto entidad
 * @returns {string} Nombre de entidad o "Sin Nombre"
 */
function getEntityName(entity) {
    if (!entity) return 'Sin Nombre';
    return entity.Nombre || entity.nombre || entity.name || entity.NOMBRE || 'Sin Nombre';
}

/**
 * Cargar configuración desde Google Sheets (pestaña: configuracion)
 * Busca fecha_limite en columna A y obtiene valor de columna B
 */
function loadConfigurationFromSheets() {
    return cloudGet('configuracion').then(config => {
        if (!config || !Array.isArray(config)) {
            console.warn('⚠️ Configuración vacía');
            return;
        }

        // Buscar entrada con clave 'fecha_limite'
        const deadlineEntry = config.find(entry => {
            const clave = entry.clave || entry.Clave || entry.CLAVE || '';
            return clave.toLowerCase().trim() === 'fecha_limite';
        });

        if (deadlineEntry) {
            const value = deadlineEntry.valor || deadlineEntry.Valor || deadlineEntry.VALOR || deadlineEntry.value;
            if (value) {
                DEADLINE = new Date(value);
                console.log(`📅 Deadline cargado: ${DEADLINE.toLocaleString('es-CL')}`);
                checkDeadlineStatus(); // Verificar si el deadline ya pasó
                updateDeadlineDisplay(); // Actualizar display en header
                loadDeadlineToInput(); // Cargar en el input de admin
                return DEADLINE;
            }
        } else {
            console.warn('⚠️ No se encontró fecha_limite en configuración');
        }
    }).catch(err => {
        console.warn('⚠️ Error cargando configuración:', err);
    });
}

/**
 * Verificar si el deadline ha pasado
 */
function checkDeadlineStatus() {
    if (!DEADLINE) return;

    const ahora = new Date();
    deadlineExpired = ahora > DEADLINE;

    if (deadlineExpired) {
        console.warn(`⏰ DEADLINE EXPIRADO: ${DEADLINE.toLocaleString('es-CL')}`);
        updateDeadlineDisplay();
    } else {
        const tiempoRestante = DEADLINE - ahora;
        const diasRestantes = Math.floor(tiempoRestante / (1000 * 60 * 60 * 24));
        const horasRestantes = Math.floor((tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        console.log(`✅ Tiempo restante: ${diasRestantes}d ${horasRestantes}h`);
        updateDeadlineDisplay();
    }
}

/**
 * Actualizar display del deadline en el header
 */
function updateDeadlineDisplay() {
    if (!DEADLINE) return;

    const display = document.getElementById('deadline-display');
    const container = document.getElementById('deadline-container');
    if (!display || !container) return;

    // Mostrar el contenedor
    container.style.display = 'block';

    const ahora = new Date();

    if (deadlineExpired) {
        display.textContent = `⛔ Plazo vencido (${DEADLINE.toLocaleDateString('es-CL')})`;
        display.style.color = '#FF6B6B';
    } else {
        const tiempoRestante = DEADLINE - ahora;
        const dias = Math.floor(tiempoRestante / (1000 * 60 * 60 * 24));
        const horas = Math.floor((tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));

        let color = 'rgba(255, 255, 255, 0.8)';
        if (dias === 0 && horas < 24) {
            color = '#FFD93D'; // Amarillo si queda menos de 1 día
        }
        if (dias === 0 && horas < 6) {
            color = '#FF6B6B'; // Rojo si queda menos de 6 horas
        }

        display.textContent = `Vence en: ${dias}d ${horas}h ${minutos}m`;
        display.style.color = color;
    }
}

/**
 * Actualizar deadline cada minuto
 */
setInterval(updateDeadlineDisplay, 60000);

/**
 * Cargar deadline actual en el input de configuración
 */
function loadDeadlineToInput() {
    const cfgInput = document.getElementById('cfg-deadline');
    if (!cfgInput) return;

    if (DEADLINE) {
        // Convertir a formato datetime-local (YYYY-MM-DDTHH:MM)
        const year = DEADLINE.getFullYear();
        const month = String(DEADLINE.getMonth() + 1).padStart(2, '0');
        const day = String(DEADLINE.getDate()).padStart(2, '0');
        const hours = String(DEADLINE.getHours()).padStart(2, '0');
        const minutes = String(DEADLINE.getMinutes()).padStart(2, '0');

        cfgInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
}

/**
 * Iniciar countdown de sesión de 10 minutos
 */
function startSessionCountdown() {
    if (!currentUser || currentRole === 'admin') return;

    sessionStartTime = Date.now();

    // Limpiar interval anterior si existe
    if (sessionCountdownInterval) {
        clearInterval(sessionCountdownInterval);
    }

    // Mostrar contenedor de countdown
    const container = document.getElementById('session-countdown-container');
    if (container) {
        container.style.display = 'block';
    }

    // Actualizar cada segundo
    sessionCountdownInterval = setInterval(() => {
        updateSessionCountdown();
    }, 1000);

    // Actualizar inmediatamente
    updateSessionCountdown();

    console.log(`⏱️ Session countdown iniciado. Cierre automático en ${SESSION_DURATION_MS / 1000}s`);
}

/**
 * Actualizar display del countdown de sesión
 */
function updateSessionCountdown() {
    if (!sessionStartTime) return;

    const display = document.getElementById('session-countdown');
    if (!display) return;

    const elapsed = Date.now() - sessionStartTime;
    const remaining = Math.max(0, SESSION_DURATION_MS - elapsed);

    // Convertir a minutos y segundos
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    display.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;

    // Cambiar color según urgencia
    if (remaining < 60000) {
        display.style.color = '#FF6B6B'; // Rojo si queda menos de 1 minuto
    } else if (remaining < 300000) {
        display.style.color = '#FFD93D'; // Amarillo si queda menos de 5 minutos
    } else {
        display.style.color = 'rgba(255, 255, 255, 0.8)';
    }

    // Si llegó a 00:00, cerrar sesión
    if (remaining <= 0) {
        stopSessionCountdown();
        closeSessionDueToTimeout();
    }
}

/**
 * Detener countdown de sesión
 */
function stopSessionCountdown() {
    if (sessionCountdownInterval) {
        clearInterval(sessionCountdownInterval);
        sessionCountdownInterval = null;
    }

    const container = document.getElementById('session-countdown-container');
    if (container) {
        container.style.display = 'none';
    }

    sessionStartTime = null;
}

/**
 * Cerrar sesión automáticamente por timeout
 */
function closeSessionDueToTimeout() {
    console.warn('⏱️ Sesión cerrada automáticamente por inactividad (10 minutos)');

    // Intentar guardar cambios pendientes
    if (currentRole === 'evaluador' && hasUnsavedEvaluatorChanges) {
        console.log('💾 Guardando cambios antes de cerrar...');
        saveEvaluatorScores(() => {
            performLogout();
            alert('⏱️ Su sesión ha expirado por timeout (10 minutos).\n\nSus cambios fueron guardados automáticamente.');
        });
    } else {
        performLogout();
        alert('⏱️ Su sesión ha expirado por timeout (10 minutos).');
    }
}

/**
 * Inicializa la UI del evaluador después de cargar asignaciones
 * Válido para usar si allAsignacionesMapped ya está poblado
 */
function initializeEvaluatorUI() {
    if (!allAsignacionesMapped || allAsignacionesMapped.length === 0) {
        console.warn('⚠️ No hay asignaciones disponibles');
        alert('No se encontraron asignaciones para este evaluador.');
        return false;
    }

    currentCoverage = allAsignacionesMapped[0].cobertura;
    const matchingConfig = allAsignacionesMapped.find(a => a.cobertura === currentCoverage);
    currentStage = (matchingConfig && matchingConfig.etapas && matchingConfig.etapas.length > 0) ? matchingConfig.etapas[0] : 1;

    restoreConnectionStatus();
    showPanel('Sistema de Precalificación Técnica');

    setTimeout(() => {
        renderCoverageTabs();
    }, 100);

    if (CLOUD_MODE_ENABLED) {
        setTimeout(() => {
            syncAsignacionesFromCloud();
        }, 500);
    }

    return true;
}

/**
 * Guarda datos con reintentos ligeros y sync adaptativo
 * Optimizado para múltiples usuarios simultáneos
 */
async function cloudSave(table, dataArray, mode = 'incremental', options = {}) {
    const MAX_REINTENTOS = 1; // Solo 1 reintento rápido
    const DELAY_INICIAL = 80; // ms mínimo

    for (let intento = 0; intento <= MAX_REINTENTOS; intento++) {
        try {
            const clientVersion = serverVersions[table] || 1;
            const body = {
                table,
                data: dataArray,
                mode,
                clientVersion,
                csrfToken: csrfToken,
                sessionId: currentUser?.rut || 'guest',
                userRut: currentUser?.rut // Para registrar actividad en backend
            };
            if (options.forceVersion) {
                body.forceVersion = true;
            }

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(body)
            });
            const result = await response.json();

            if (result?.success && typeof result.serverVersion === 'number') {
                serverVersions[table] = result.serverVersion;
                SYNC_MANAGER.registerPending(table, 0);
                updateLastWriteTime(); // Registrar escritura al servidor
                return result;
            }

            if (result?.versionConflict && intento < MAX_REINTENTOS) {
                console.warn(`⏳ Versión desactualizada. Reintentando...`);
                await new Promise(resolve => setTimeout(resolve, DELAY_INICIAL));
                continue;
            }

            if (result?.versionConflict) {
                SYNC_MANAGER.registerPending(table, 1);
            }
            return result || { success: false, error: 'Sin respuesta del servidor' };

        } catch (error) {
            if (intento < MAX_REINTENTOS) {
                await new Promise(resolve => setTimeout(resolve, DELAY_INICIAL));
                continue;
            }
            console.error(`Error guardando en ${table}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    return { success: false, error: 'No se pudo guardar' };
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
    notificationSystem.show('sync-cancel', '⚠️ Sincronización cancelada por el usuario', 'warning');
    setTimeout(() => notificationSystem.remove('sync-cancel'), 3000);
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

/**
 * Sincroniza datos en background después del login sin bloquear la UI
 */
function backgroundSyncAfterLogin() {
    if (!CLOUD_MODE_ENABLED) return;

    const storeNames = ['entidades', 'asignaciones', 'items'];
    let completed = 0;

    notificationSystem.show('bg-sync', '🔄 Iniciando sincronización de datos...', 'info');

    storeNames.forEach((storeName, index) => {
        setTimeout(() => {
            notificationSystem.show('bg-sync', `📥 Descargando ${storeName}...`, 'info', (index / storeNames.length) * 50);

            cloudGet(storeName).then(data => {
                if (data && Array.isArray(data) && data.length > 0) {
                    // Guardar en IndexedDB
                    const tx = dbInstance.transaction([storeName], 'readwrite');
                    const store = tx.objectStore(storeName);
                    data.forEach(item => store.put(item));

                    tx.oncomplete = () => {
                        completed++;
                        const progress = 50 + (completed / storeNames.length) * 50;
                        notificationSystem.show('bg-sync', `✅ ${storeName} actualizado (${data.length} registros)`, 'success', progress);

                        if (completed === storeNames.length) {
                            notificationSystem.show('bg-sync', '✅ Datos sincronizados correctamente', 'success', 100);
                            setTimeout(() => notificationSystem.remove('bg-sync'), 2000);
                        }
                    };

                    tx.onerror = () => {
                        notificationSystem.show('bg-sync', `⚠️ Error al guardar ${storeName}`, 'warning');
                    };
                } else {
                    completed++;
                    if (completed === storeNames.length) {
                        notificationSystem.show('bg-sync', '✅ Datos sincronizados correctamente', 'success', 100);
                        setTimeout(() => notificationSystem.remove('bg-sync'), 2000);
                    }
                }
            }).catch(err => {
                console.warn(`No se pudo sincronizar ${storeName}:`, err);
                completed++;
                if (completed === storeNames.length) {
                    notificationSystem.show('bg-sync', '⚠️ Sincronización parcial (algunos datos offline)', 'warning', 100);
                    setTimeout(() => notificationSystem.remove('bg-sync'), 3000);
                }
            });
        }, index * 1000); // Espaciar las solicitudes 1 segundo cada una
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
/**
 * Normaliza asignaciones descargadas desde Google Sheets
 * Asegura que etapas sea siempre un string, no un objeto Java
 */
function normalizeAsignaciones(asignaciones) {
    if (!asignaciones || !Array.isArray(asignaciones)) return asignaciones;

    return asignaciones.map(asig => {
        // Si etapas es un string y parece un objeto Java, intenta extraer números
        if (typeof asig.etapas === 'string' && asig.etapas.includes('[Ljava.lang.Object')) {
            // Fallback a etapas default
            console.warn('⚠️ Asignación con etapas inválidas:', asig.idAsig, asig.etapas);
            asig.etapas = '1|2|3|4|5|6';
        }
        // Si etapas es un array, convertir a string con separador |
        else if (Array.isArray(asig.etapas)) {
            asig.etapas = asig.etapas.join('|');
        }
        // Si no es string ni array, usar default
        else if (typeof asig.etapas !== 'string') {
            console.warn('⚠️ Etapas inválidas para:', asig.idAsig);
            asig.etapas = '1|2|3|4|5|6';
        }
        return asig;
    });
}

/**
 * Sincroniza DESDE Google Sheets - descarga datos actualizados
 */
function syncFromCloud() {
    if (!CLOUD_MODE_ENABLED) {
        alert('El modo nube está desactivado.');
        return;
    }

    showProgressBar('Descargando datos desde Google Sheets...');
    updateProgressBar(10);

    const storeNames = ['entidades', 'evaluadores', 'asignaciones'];
    let completed = 0;

    Promise.all(storeNames.map(store => cloudGet(store))).then(results => {
        updateProgressBar(50);
        document.getElementById('progress-title').textContent = 'Guardando datos localmente...';

        const tx = dbInstance.transaction(storeNames, 'readwrite');

        results.forEach((data, idx) => {
            const storeName = storeNames[idx];
            if (data && Array.isArray(data) && data.length > 0) {
                // Normalizar asignaciones
                if (storeName === 'asignaciones') {
                    data = normalizeAsignaciones(data);
                }
                const store = tx.objectStore(storeName);
                store.clear().onsuccess = () => {
                    data.forEach(item => store.put(item));
                };
            }
        });

        tx.oncomplete = () => {
            updateProgressBar(80);
            document.getElementById('progress-title').textContent = 'Actualizando panel...';

            // Recargar datos en el panel
            setTimeout(() => {
                populateAdminMatrix();
                renderMonitoringTable();
                hideProgressBar();
                alert('✅ Datos descargados y sincronizados correctamente desde Google Sheets.');
            }, 500);
        };

        tx.onerror = () => {
            hideProgressBar();
            alert('Error al guardar datos locales.');
        };
    }).catch(error => {
        hideProgressBar();
        console.error('Error descargando datos desde Google Sheets:', error);
        alert('Error de conexión al descargar datos desde Google Sheets.');
    });
}

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
        notificationSystem.show('backup-error', '❌ Error creando respaldo. Sincronización cancelada.', 'warning');
        setTimeout(() => notificationSystem.remove('backup-error'), 4000);
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

    notificationSystem.show('download-asig', '📥 Descargando asignaciones...', 'info', 10);
    console.log('🔗 Conectando a Google Sheets:', GOOGLE_SCRIPT_URL);

    const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
            console.warn('⏱️ Se alcanzó el timeout de 40 segundos');
            resolve(null);
        }, 40000);
    });

    Promise.race([cloudGet('asignaciones'), timeoutPromise]).then(asignaciones => {
        console.log('📥 Datos recibidos del servidor:', asignaciones);

        if (asignaciones === null) {
            console.warn('⏱️ Timeout o error descargando asignaciones');
            notificationSystem.show('download-asig', '⚠️ No se pudo conectar (usando caché local)', 'warning', 100);
            setTimeout(() => notificationSystem.remove('download-asig'), 3000);
            return;
        }

        if (!dbInstance.objectStoreNames.contains('asignaciones')) {
            notificationSystem.show('download-asig', '❌ Error en base de datos local', 'warning');
            setTimeout(() => notificationSystem.remove('download-asig'), 3000);
            return;
        }

        if (!asignaciones || asignaciones.length === 0) {
            const tx = dbInstance.transaction(['asignaciones'], 'readwrite');
            const asigStore = tx.objectStore('asignaciones');
            asigStore.clear();

            tx.oncomplete = () => {
                notificationSystem.show('download-asig', '⚠️ Sin asignaciones en el servidor', 'warning', 100);
                setTimeout(() => notificationSystem.remove('download-asig'), 3000);
                renderMonitoringTable();
                populateAdminMatrix();
            };

            tx.onerror = () => {
                notificationSystem.show('download-asig', '❌ Error al limpiar datos', 'warning');
                setTimeout(() => notificationSystem.remove('download-asig'), 3000);
            };
            return;
        }

        const tx = dbInstance.transaction(['asignaciones'], 'readwrite');
        const asigStore = tx.objectStore('asignaciones');
        let asigCount = 0;

        notificationSystem.updateProgress('download-asig', 50);
        notificationSystem.show('download-asig', `💾 Guardando ${asignaciones.length} registros...`, 'info', 60);

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
            console.log('✅ Transacción completada con', asigCount, 'registros');
            notificationSystem.show('download-asig', `✅ Asignaciones descargadas correctamente`, 'success', 100);
            setTimeout(() => notificationSystem.remove('download-asig'), 2000);
            renderMonitoringTable();
            populateAdminMatrix();
        };

        tx.onerror = (e) => {
            console.error('Error en transacción de IndexedDB:', e.target.error);
            notificationSystem.show('download-asig', '❌ Error al guardar datos', 'warning');
            setTimeout(() => notificationSystem.remove('download-asig'), 3000);
        };
    }).catch(err => {
        console.error('Error descargando asignaciones:', err);
        notificationSystem.show('download-asig', '❌ Error de conexión', 'warning');
        setTimeout(() => notificationSystem.remove('download-asig'), 3000);
    });
}
/* =============================================================================== */

function getStatusInfo(score) {
    // Malo: 0-49, Aceptable: 50-79, Bueno: 80-100
    if (score >= 80) return { text: "BUENO", bg: "var(--color-bueno)", color: "#000" };
    if (score >= 50) return { text: "ACEPTABLE", bg: "var(--color-aceptable)", color: "#000" };
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
    // Inicializar IndexedDB en background sin bloquear UI
    initIndexedDB(() => {
        setupEventListeners();
        setupAdminTabs();
        setupMatrixLogisticsDrivers();
        checkDeadlineStatus();
        initSaveStatusMonitor(); // Monitorear estado de guardado

        // Cargar configuración (incluyendo deadline) desde Google Sheets
        loadConfigurationFromSheets();
    });
});

// Sistema de tooltips visuales para etapas
function setupStageTooltips() {
    let currentTooltip = null;

    document.addEventListener('mouseover', (e) => {
        const btn = e.target.closest('.stage-with-tooltip');
        if (!btn) return;

        const tooltipText = btn.getAttribute('data-tooltip-text');
        if (!tooltipText) return;

        // Crear tooltip
        currentTooltip = document.createElement('div');
        currentTooltip.className = 'stage-tooltip-box';
        currentTooltip.textContent = tooltipText;
        document.body.appendChild(currentTooltip);

        // Posicionar tooltip debajo del botón
        const rect = btn.getBoundingClientRect();
        currentTooltip.style.left = (rect.left + rect.width / 2 - 150) + 'px';
        currentTooltip.style.top = (rect.bottom + 10) + 'px';
    });

    document.addEventListener('mouseout', (e) => {
        const btn = e.target.closest('.stage-with-tooltip');
        if (btn && currentTooltip) {
            currentTooltip.remove();
            currentTooltip = null;
        }
    });
}

// Agregar textos de ayuda (tooltips) a elementos interactivos
function setupHelpTexts() {
    // Textos para botones
    const helpTexts = {
        'btn-eval-pdf': 'Exportar calificaciones a PDF para respaldo. Se guardará automáticamente primero.',
        'btn-save-scores': 'Guardar todas las calificaciones en el servidor',
        'btn-sync-cloud': 'Sincronizar cambios con el servidor',
        'btn-download-cloud': 'Descargar datos del servidor',
        'btn-logout': 'Cerrar sesión y volver a login',
        'btn-save-items': 'Guardar cambios en items',
        'btn-open-asignacion-modal': 'Crear nueva asignación',
        'btn-export-reportes': 'Exportar reportes consolidados a Excel',
        'btn-export-backup': 'Descargar respaldo completo de datos',
        'btn-open-evaluador-modal': 'Agregar nuevo evaluador al sistema'
    };

    Object.entries(helpTexts).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = text;
            element.setAttribute('aria-label', text);
        }
    });

    // Textos para inputs
    const inputHelps = {
        'username': 'Ingrese su RUT sin puntos ni guión (ej: 123456789)',
        'password': 'Contraseña proporcionada por el administrador',
        'cfg-deadline': 'Fecha y hora máxima para realizar calificaciones',
        'ev-nombre': 'Nombre completo del evaluador',
        'ev-rut': 'RUT sin puntos ni guión',
        'ev-area': 'Área o departamento al que pertenece',
        'ev-clave': 'Contraseña para acceso al sistema'
    };

    Object.entries(inputHelps).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = text;
            element.placeholder = element.placeholder || text;
        }
    });

    // Inicializar tooltips de etapas
    setupStageTooltips();
}

function setupEventListeners() {
    // TODOS los listeners registrados aquí se limpian automáticamente en logout

    // Agregar textos de ayuda
    setupHelpTexts();

    addManagedListener(document.getElementById('btn-login'), 'click', handleLogin);

    // Permitir login al presionar Enter en el campo de contraseña
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        addManagedListener(passwordInput, 'keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }

    // Detectar si el usuario es 'admin' y cambiar maxlength de contraseña dinámicamente
    const usernameInput = document.getElementById('username');
    if (usernameInput && passwordInput) {
        addManagedListener(usernameInput, 'input', () => {
            const username = usernameInput.value.trim().toLowerCase();
            if (username === 'admin') {
                // Admin puede usar contraseñas más largas (13+ caracteres)
                passwordInput.maxLength = 20;
            } else {
                // Usuarios normales limitados a 8 caracteres
                passwordInput.maxLength = 8;
            }
        });
    }

    const btnCloseNotif = document.getElementById('btn-close-notifications');
    if (btnCloseNotif) {
        addManagedListener(btnCloseNotif, 'click', () => {
            const panel = document.getElementById('notification-panel');
            if (panel) panel.style.display = 'none';
        });
    }

    addManagedListener(document.getElementById('btn-sync-cloud'), 'click', syncFromCloud);
    addManagedListener(document.getElementById('btn-download-cloud'), 'click', downloadHistoricosFromCloud);
    addManagedListener(document.getElementById('btn-logout'), 'click', handleLogout);
    addManagedListener(document.getElementById('btn-save-items'), 'click', saveAdminItems);
    addManagedListener(document.getElementById('btn-save-scores'), 'click', (e) => { e.preventDefault(); saveEvaluatorScores(null); });
    addManagedListener(document.getElementById('btn-eval-pdf'), 'click', exportEvaluatorPDF);
    addManagedListener(document.getElementById('btn-save-asignacion'), 'click', () => { processAsignacionStaging(false); });
    addManagedListener(document.getElementById('btn-save-partial'), 'click', () => { processAsignacionStaging(true); });
    addManagedListener(document.getElementById('btn-save-config'), 'click', saveConfigDeadline);
    addManagedListener(document.getElementById('btn-close-modal'), 'click', closeModal);
    addManagedListener(document.getElementById('chk-toggle-all-stages'), 'change', toggleAllStagesCheckboxes);
    addManagedListener(document.getElementById('btn-modal-cancel'), 'click', closeModal);
    addManagedListener(document.getElementById('btn-modal-confirm'), 'click', executeCommitAsignacion);

    const btnExport = document.getElementById('btn-export-reportes');
    if (btnExport) addManagedListener(btnExport, 'click', exportReportesExcel);

    const btnExportBackup = document.getElementById('btn-export-backup');
    if (btnExportBackup) addManagedListener(btnExportBackup, 'click', exportDatabaseToJSON);

    const btnOpenEv = document.getElementById('btn-open-evaluador-modal');
    if (btnOpenEv) addManagedListener(btnOpenEv, 'click', () => {
        currentEditingEvaluadorRut = null;
        clearFormInputs(['ev-nombre', 'ev-rut', 'ev-area', 'ev-clave']);
        document.getElementById('ev-rut').disabled = false;
        toggleElement('modal-evaluador', true);
    });

    const btnCloseEv = document.getElementById('btn-close-evaluador-modal');
    if (btnCloseEv) addManagedListener(btnCloseEv, 'click', () => toggleElement('modal-evaluador', false));

    const btnSaveEv = document.getElementById('btn-save-evaluador-modal');
    if (btnSaveEv) addManagedListener(btnSaveEv, 'click', createEvaluador);

    addManagedListener(document.getElementById('btn-open-entidad-modal'), 'click', () => {
        currentEditingEntidadId = null;
        clearFormInputs(['entidad-rut', 'entidad-nombre', 'entidad-comuna', 'entidad-programa', 'entidad-convenio', 'entidad-fecha']);
        toggleElement('modal-entidad', true);
    });

    addManagedListener(document.getElementById('btn-close-entidad-modal'), 'click', () => {
        currentEditingEntidadId = null;
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

    const btnToggleTopPanel = document.getElementById('btn-toggle-top-panel');
    if (btnToggleTopPanel) btnToggleTopPanel.addEventListener('click', toggleEvalTopPanel);
}

/**
 * Toggle para colapsar/expandir sidebar de entidades
 */
function toggleEvalTopPanel() {
    const topPanel = document.getElementById('eval-top-panel');
    const entityTabs = document.getElementById('eval-entity-tabs-container');
    const projectsSection = document.getElementById('eval-projects-section');
    const btn = document.getElementById('btn-toggle-top-panel');

    if (!topPanel || !entityTabs || !projectsSection || !btn) return;

    if (topPanel.classList.contains('eval-top-panel-expanded')) {
        topPanel.classList.remove('eval-top-panel-expanded');
        topPanel.classList.add('eval-top-panel-collapsed');
        entityTabs.style.display = 'none';
        projectsSection.style.display = 'none';
        btn.textContent = '▼';
    } else {
        topPanel.classList.remove('eval-top-panel-collapsed');
        topPanel.classList.add('eval-top-panel-expanded');
        entityTabs.style.display = 'flex';
        projectsSection.style.display = 'block';
        btn.textContent = '▲';
    }
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
            filteredEntidades = filteredEntidades.filter(e => {
                const rut = e.rut || e.RUT || '';
                const nombre = e.nombre || e.Nombre || '';
                const comuna = e.comuna || e.Comuna || '';
                const programa = e.programa || e.Programa || '';
                const convenio = e.convenio || e.Convenio || '';
                return (
                    rut.toString().toLowerCase().includes(searchTerm) ||
                    nombre.toString().toLowerCase().includes(searchTerm) ||
                    comuna.toString().toLowerCase().includes(searchTerm) ||
                    programa.toString().toLowerCase().includes(searchTerm) ||
                    convenio.toString().toLowerCase().includes(searchTerm)
                );
            });
        }

        let sortedEntidades = [...filteredEntidades];
        if (entidadesSortCol > -1) {
            const colsLower = ['rut', 'nombre', 'comuna', 'programa', 'convenio', 'fecha'];
            const colsUpper = ['RUT', 'Nombre', 'Comuna', 'Programa', 'Convenio', 'Fecha'];
            sortedEntidades.sort((a, b) => {
                let vA = (a[colsLower[entidadesSortCol]] || a[colsUpper[entidadesSortCol]] || '').toString().toLowerCase();
                let vB = (b[colsLower[entidadesSortCol]] || b[colsUpper[entidadesSortCol]] || '').toString().toLowerCase();
                return vA < vB ? (entidadesSortAsc ? -1 : 1) : vA > vB ? (entidadesSortAsc ? 1 : -1) : 0;
            });
        }

        if (sortedEntidades.length === 0) {
            tbodyTabla.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron entidades con esa búsqueda.</td></tr>';
        } else {
            tbodyTabla.innerHTML = sortedEntidades.map((e) => {
                const rut = e.rut || e.RUT || '';
                const nombre = e.nombre || e.Nombre || '';
                const comuna = e.comuna || e.Comuna || '';
                const programa = e.programa || e.Programa || '';
                const convenio = e.convenio || e.Convenio || '';
                const fecha = e.fecha || e.Fecha || '';
                const idEntidad = e.idEntidad || e.idEntidad || '';
                return `
                <tr>
                    <td>${rut}</td><td>${nombre}</td><td>${comuna}</td>
                    <td class="text-center"><strong>${programa}</strong></td>
                    <td>${convenio}</td><td class="text-center">${fecha}</td>
                    <td class="text-center">
                        <button class="btn btn-primary" style="padding:2px 8px; border-radius:3px; font-size:0.75rem; margin-right:4px;" onclick="editEntidad('${idEntidad}')" title="Editar Entidad">Editar</button>
                        <button class="btn btn-danger" style="padding:2px 8px; border-radius:3px; font-size:0.75rem;" onclick="removeEntidad('${idEntidad}')" title="Eliminar Entidad">X</button>
                    </td>
                </tr>
            `;
            }).join('');
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

window.deleteAsignacionWithOptions = function(rut, nombre, cobertura, stageNum, idAsig) {
    const message = `¿Qué desea eliminar?\n\nEntidad: ${nombre}\nCobertura: ${cobertura}\n\n1. Solo eliminar Etapa ${stageNum}\n2. Eliminar toda la asignación de esta entidad\n\nSeleccione una opción (1 o 2):`;
    const choice = prompt(message, '1');

    if (!choice) return;

    if (choice === '1') {
        // Eliminar solo la etapa
        dbGetAll('asignaciones', (asignaciones) => {
            const asig = asignaciones.find(a => a.idAsig === idAsig);
            if (!asig) {
                alert('No se encontró la asignación');
                return;
            }

            // Eliminar la etapa del array de etapas
            let etapasArray = asig.etapas;
            if (typeof etapasArray === 'string') {
                // Detectar separador: | (nuevo) o , (antiguo para compatibilidad)
                const separator = etapasArray.includes('|') ? '|' : ',';
                etapasArray = etapasArray.split(separator).map(Number);
            }

            if (Array.isArray(etapasArray)) {
                etapasArray = etapasArray.filter(e => e !== stageNum);
                asig.etapas = etapasArray.join('|'); // Guardar como string con separador |

                const tx = dbInstance.transaction(['asignaciones'], 'readwrite');
                tx.objectStore('asignaciones').put(asig);
                tx.oncomplete = () => {
                    alert(`✅ Etapa ${stageNum} eliminada de la asignación`);
                    syncAsignacionesToGoogleSheets(asig);
                    renderMonitoringTable();
                    populateAdminMatrix();
                };
            }
        });
    } else if (choice === '2') {
        // Eliminar toda la asignación
        if (!confirm(`¿Está seguro de eliminar TODA la asignación de ${nombre} en ${cobertura}?`)) return;

        dbGetAll('asignaciones', (asignaciones) => {
            const asig = asignaciones.find(a => a.idAsig === idAsig);
            if (!asig) {
                alert('No se encontró la asignación');
                return;
            }

            // Eliminar la asignación completa
            const tx = dbInstance.transaction(['asignaciones'], 'readwrite');
            tx.objectStore('asignaciones').delete(idAsig);
            tx.oncomplete = () => {
                console.log(`✅ Asignación ${idAsig} eliminada localmente`);
                alert(`✅ Asignación de ${nombre} eliminada completamente`);

                // Eliminar de Google Sheets de forma asincrónica (sin bloquear)
                deleteAsignacionFromGoogleSheets(rut, cobertura).catch(err => {
                    console.error('⚠️ Error al sincronizar con Google Sheets:', err);
                });

                renderMonitoringTable();
                populateAdminMatrix();
            };
        });
    } else {
        alert('Opción no válida');
    }
};

/**
 * Sincroniza asignaciones modificadas con Google Sheets
 */
async function syncAsignacionesToGoogleSheets(asignacion) {
    try {
        const result = await cloudSave('asignaciones', [asignacion], 'update');
        if (result.success) {
            console.log('✅ Asignaciones sincronizadas con Google Sheets');
        } else {
            console.error('Error al sincronizar:', result.error);
            alert('⚠️ Error al sincronizar con Google Sheets: ' + (result.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error en sincronización:', error);
        alert('⚠️ Error en sincronización: ' + error.message);
    }
}

/**
 * Elimina una asignación de Google Sheets (asincrónico, no bloquea)
 */
async function deleteAsignacionFromGoogleSheets(rut, cobertura) {
    try {
        console.log(`📤 Sincronizando eliminación con Google Sheets: RUT=${rut}, Cobertura=${cobertura}`);

        // Obtener todas las asignaciones actuales de Google Sheets
        const allAsignaciones = await cloudGet('asignaciones');
        if (!allAsignaciones) {
            console.warn('⚠️ No se pudo obtener asignaciones de Google Sheets');
            return;
        }

        // Filtrar: eliminar la asignación que no coincida con rut y cobertura
        const filteredAsignaciones = allAsignaciones.filter(a =>
            !(a.rut === rut && a.cobertura === cobertura)
        );

        console.log(`Asignaciones originales: ${allAsignaciones.length}, Después de filtro: ${filteredAsignaciones.length}`);

        // Guardar la lista filtrada nuevamente en Google Sheets
        if (filteredAsignaciones.length < allAsignaciones.length) {
            await cloudSave('asignaciones', filteredAsignaciones, 'overwrite');
            console.log('✅ Asignación eliminada de Google Sheets');
        }
    } catch (error) {
        console.error('⚠️ Error al sincronizar eliminación con Google Sheets:', error.message);
        // No lanzar error, solo registrarlo
    }
}

function setupAdminTabs() {
    const tabs = document.querySelectorAll('.admin-main-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-subpanel').forEach(p => p.classList.add('hidden'));
            e.target.classList.add('active');
            const targetId = e.target.getAttribute('data-target');
            toggleElement(targetId, true);
            if (targetId === 'panel-monitoreo') renderMonitoringTable();
            if (targetId === 'panel-reportes') renderReportes();
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
        if (todayLabel) todayLabel.textContent = formatFullDate(now);
        if (clock) clock.textContent = formatTimeOnly(now);
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
    if (!cfgInput || !cfgInput.value) {
        alert('❌ Por favor ingrese una fecha y hora válida');
        return;
    }

    const deadlineValue = cfgInput.value;

    // 1. Guardar en IndexedDB local
    const tx = dbInstance.transaction(['configuracion'], 'readwrite');
    tx.objectStore('configuracion').put({ clave: 'fecha_limite', valor: deadlineValue });

    tx.oncomplete = () => {
        console.log('✅ Deadline guardado en IndexedDB');

        // 2. Guardar en Google Sheets (configuracion sheet)
        cloudSave('configuracion', [{ clave: 'fecha_limite', valor: deadlineValue }], 'incremental').then(result => {
            if (result && result.success) {
                console.log('✅ Deadline guardado en Google Sheets');

                // 3. Actualizar variable DEADLINE
                DEADLINE = new Date(deadlineValue);
                checkDeadlineStatus();
                updateDeadlineDisplay();

                // 4. Mostrar feedback al usuario
                alert(`✅ Deadline guardado correctamente\n\n📅 Vence: ${DEADLINE.toLocaleString('es-CL')}`);
                console.log(`📅 Nuevo deadline: ${DEADLINE.toLocaleString('es-CL')}`);
            } else {
                console.warn('⚠️ Error al guardar en Google Sheets');
                alert('⚠️ Deadline guardado localmente pero hubo error al guardar en la nube');
            }
        }).catch(err => {
            console.error('❌ Error guardando en Google Sheets:', err);
            alert('⚠️ Deadline guardado localmente pero no se pudo guardar en la nube');
        });
    };

    tx.onerror = () => {
        alert('❌ Error al guardar deadline localmente');
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

function renderEvaluadoresColumnWithSearch(evaluadores, colEvaluadores) {
    if (evaluadores.length === 0) {
        colEvaluadores.innerHTML = '<span style="color:#999;font-size:0.8rem;">Sin evaluadores.</span>';
        return;
    }

    // Ordenar alfabéticamente por nombre
    const sortedEvaluadores = [...evaluadores].sort((a, b) => a.nombre.localeCompare(b.nombre));

    colEvaluadores.innerHTML = `
        <label style="display:flex; align-items:center; gap:6px; font-weight:bold; color:var(--primary-dark); cursor:pointer; font-size:0.75rem; margin-bottom:6px;">
            <input type="checkbox"> [ Seleccionar Evaluador ]
        </label>
        <input type="text" id="search-evaluadores-col" placeholder="Buscar..." style="width:100%; padding:6px 8px; margin-bottom:6px; border:1px solid #ccc; border-radius:3px; font-size:0.75rem;" oninput="filterEvaluadoresColumn()">
    ` +
    sortedEvaluadores.map(ev => `<div class="checkbox-block-item"><label><input type="checkbox" class="asig-evaluador-chk" value="${ev.rut}" data-name="${ev.nombre}"> ${ev.nombre}</label></div>`).join('');

    // Remover titileo cuando termina de cargar
    const header = document.querySelector('.matrix-col:has(#col-evaluadores) .matrix-header');
    if (header) header.classList.remove('loading-blink');
}

function filterEvaluadoresColumn() {
    const searchTerm = document.getElementById('search-evaluadores-col')?.value.toLowerCase() || '';
    const checkboxes = document.querySelectorAll('.asig-evaluador-chk');

    checkboxes.forEach(checkbox => {
        const label = checkbox.parentElement;
        const nombre = checkbox.getAttribute('data-name').toLowerCase();

        if (nombre.includes(searchTerm)) {
            label.parentElement.style.display = 'block';
        } else {
            label.parentElement.style.display = 'none';
        }
    });
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

    // Filtrar por programa Y provincia (campos con mayúscula inicial)
    const normalizadaProvincia = adminSelectedProvincia.toUpperCase();
    let filteredEntidades = adminTemporaryEntidades.filter(ent => {
        const matchPrograma = savedPrograms.includes(ent.Programa);
        const matchProvincia = ent.Provincia.toUpperCase() === normalizadaProvincia;
        return matchPrograma && matchProvincia;
    });

    // Deduplicar entidades por nombre - mostrar cada entidad solo una vez
    const uniqueEntidades = {};
    filteredEntidades.forEach(ent => {
        if (!uniqueEntidades[ent.Nombre]) {
            uniqueEntidades[ent.Nombre] = ent;
        }
    });
    filteredEntidades = Object.values(uniqueEntidades);

    if (filteredEntidades.length === 0) {
        col.innerHTML = `<span style="color:#999; font-size:0.8rem; padding:5px; text-align:center;">Sin entidades para los programas seleccionados</span>`;
        return;
    }

    // Agregar "Marcar todas" y lista de entidades con estilo normalizado
    col.innerHTML = `
        <label style="display:flex; align-items:center; gap:6px; font-weight:bold; color:var(--primary-dark); cursor:pointer; font-size:0.75rem; margin-bottom:6px;">
            <input type="checkbox" id="chk-marcar-todas-entidades" onchange="document.querySelectorAll('.asig-entidad-chk').forEach(c => c.checked = this.checked)"> [ Marcar Todas ]
        </label>
    ` +
        filteredEntidades.map(ent => {
            const entityName = getEntityName(ent);
            return `<div class="checkbox-block-item"><label><input type="checkbox" class="asig-entidad-chk" value="${ent.idEntidad}" data-name="${entityName}" data-id="${ent.idEntidad}"> ${entityName}</label></div>`;
        }).join('');
}

/* FIX CRÍTICO DE INGRESO: CONTROL DE EXCEPCIÓN CUANDO LA MUESTRA ESTÁ VACÍA V16 */
function handleLogin() {
    const userInput = document.getElementById('username').value.trim();
    const passInput = document.getElementById('password').value.trim();
    const dot = document.getElementById('conn-dot');
    const txt = document.getElementById('conn-text');

    // RATE LIMITING: Verificar si el usuario está bloqueado temporalmente
    const now = Date.now();
    if (loginAttempts[userInput]) {
        const { count, timestamp } = loginAttempts[userInput];
        const elapsed = now - timestamp;
        if (elapsed < SECURITY_CONFIG.LOCKOUT_DURATION_MS && count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
            const remainingMins = Math.ceil((SECURITY_CONFIG.LOCKOUT_DURATION_MS - elapsed) / 60000);
            alert(`⏳ Demasiados intentos fallidos.\n\nIntente de nuevo en ${remainingMins} minuto(s).`);
            if (dot && txt) {
                dot.style.backgroundColor = '#FF4444';
                txt.textContent = `Bloqueado (${remainingMins}m)`;
                txt.style.color = '#A51D24';
            }
            return;
        }
        if (elapsed >= SECURITY_CONFIG.LOCKOUT_DURATION_MS) {
            delete loginAttempts[userInput]; // Reset después del timeout
        }
    }

    // Actualizar indicador de conexión durante el login
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
            
            // Verificar contraseña - compatible con plaintext y bcrypt
            let passwordValid = false;

            // Si empieza con $2a$ o $2b$, es un hash bcrypt
            if (remoteClave.valor && (remoteClave.valor.startsWith('$2a$') || remoteClave.valor.startsWith('$2b$'))) {
                // Es un hash bcrypt, usar compareSync
                try {
                    passwordValid = dcodeIO.bcrypt.compareSync(passInput, remoteClave.valor);
                } catch (e) {
                    console.error('Error comparando bcrypt:', e);
                    passwordValid = false;
                }
            } else {
                // Es plaintext (transitorio hasta implementar bcrypt en GAS)
                passwordValid = passInput === remoteClave.valor;
            }

            if (!passwordValid) {
                // RATE LIMITING: Registrar intento fallido
                const now = Date.now();
                if (!loginAttempts[userInput]) {
                    loginAttempts[userInput] = { count: 0, timestamp: now };
                }
                loginAttempts[userInput].count++;
                const attemptsLeft = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - loginAttempts[userInput].count;

                if (attemptsLeft > 0) {
                    alert(`❌ Contraseña incorrecta.\n\nIntento ${loginAttempts[userInput].count}/${SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS}\n${attemptsLeft} intentos restantes`);
                } else {
                    loginAttempts[userInput].timestamp = now;
                    const lockoutMins = Math.ceil(SECURITY_CONFIG.LOCKOUT_DURATION_MS / 60000);
                    alert(`🔒 Máximo de intentos alcanzado.\n\nCuenta bloqueada por ${lockoutMins} minutos por seguridad.`);
                }

                if (dot && txt) {
                    dot.style.backgroundColor = '#FF4444';
                    txt.textContent = 'Contraseña incorrecta';
                    txt.style.color = '#A51D24';
                }
                return;
            }

            // Éxito: limpiar intentos fallidos
            delete loginAttempts[userInput];

            // Generar CSRF token para esta sesión
            generateCSRFToken();

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

async function attemptEvaluatorLogin(evaluadores, userInput, passInput) {
    const evResult = evaluadores.find(e => e.rut === userInput);
    if (!evResult) {
        alert('RUT de evaluador no registrado.\n\nVerifique que el RUT esté correctamente ingresado o contacte al administrador.');
        restoreConnectionStatus();
        return;
    }

    const validPass = evResult.clave || '123456';
    if (validPass !== passInput) {
        // RATE LIMITING: Registrar intento fallido
        const now = Date.now();
        if (!loginAttempts[userInput]) {
            loginAttempts[userInput] = { count: 0, timestamp: now };
        }
        loginAttempts[userInput].count++;
        const attemptsLeft = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - loginAttempts[userInput].count;

        if (attemptsLeft > 0) {
            alert(`❌ Contraseña incorrecta.\n\nIntento ${loginAttempts[userInput].count}/${SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS}\n${attemptsLeft} intentos restantes`);
        } else {
            loginAttempts[userInput].timestamp = now;
            const lockoutMins = Math.ceil(SECURITY_CONFIG.LOCKOUT_DURATION_MS / 60000);
            alert(`🔒 Máximo de intentos alcanzado.\n\nCuenta bloqueada por ${lockoutMins} minutos por seguridad.`);
        }

        restoreConnectionStatus();
        return;
    }

    // Éxito: limpiar intentos fallidos
    delete loginAttempts[userInput];

    // ⏳ VERIFICAR LÍMITE DE USUARIOS SIMULTÁNEOS (LOCAL)
    if (ACTIVE_USER_SESSIONS.size >= MAX_CONCURRENT_USERS) {
        alert(`⚠️ SISTEMA SATURADO\n\n❌ Se alcanzó el máximo de ${MAX_CONCURRENT_USERS} usuarios simultáneos.\n\n⏰ Por favor, intente de nuevo en 5 minutos.\n\nSi tiene problemas, contacte al administrador.\n\nUsuarios conectados: ${ACTIVE_USER_SESSIONS.size}/${MAX_CONCURRENT_USERS}`);
        restoreConnectionStatus();
        return;
    }

    // Agregar usuario a sesiones activas con metadata
    const ahora = Date.now();
    const userName = evResult.nombre || userInput;
    ACTIVE_USER_SESSIONS.set(userInput, {
        loginTime: ahora,
        lastActivity: ahora,
        lastWrite: ahora,
        nombre: userName
    });
    console.log(`✅ Usuario ${userInput} agregado. Sesiones activas: ${ACTIVE_USER_SESSIONS.size}/${MAX_CONCURRENT_USERS}`);

    // Registrar sesión en backend (Code.gs)
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
            action: 'login',
            userRut: userInput,
            userName: userName,
            csrfToken: csrfToken
        })
    }).catch(err => console.warn('⚠️ Error registrando sesión en backend:', err));

    // Configurar timeout de inactividad (10 minutos)
    if (userInactivityTimers[userInput]) {
        clearTimeout(userInactivityTimers[userInput]);
    }
    userInactivityTimers[userInput] = setTimeout(() => {
        if (currentUser && currentUser.rut === userInput) {
            console.warn(`⏰ Sesión expirada por inactividad: ${userInput}`);
            alert(`⏰ Su sesión ha expirado por inactividad.\n\nPor seguridad, las sesiones se cierran después de ${SESSION_TIMEOUT_MINUTES} minutos sin movimiento.`);
            handleLogout();
        }
    }, INACTIVITY_TIMEOUT_MS);

    // Generar CSRF token para esta sesión
    generateCSRFToken();

    currentUser = evResult;
    currentRole = 'evaluador';

    // Actualizar actividad cuando el usuario interactúa
    document.addEventListener('click', resetActivityTimer);
    document.addEventListener('keypress', resetActivityTimer);

    try {
        // 🔄 PRIORIDAD 1: Descargar asignaciones FRESCAS de Google Sheets
        cloudGet('asignaciones').then(cloudAsignaciones => {
            if (!cloudAsignaciones || cloudAsignaciones.length === 0) {
                // Si Google Sheets está vacío, intentar con datos locales
                dbGetAll('asignaciones', (dbAsignaciones) => {
                    const userAsignaciones = dbAsignaciones.filter(a => a.rut === currentUser.rut);
                    if (userAsignaciones.length === 0) {
                        alert('❌ No hay asignaciones en el sistema.');
                        restoreConnectionStatus();
                        return;
                    }
                    loadEvaluatorWithAsignaciones(userAsignaciones);
                });
                return;
            }

            // ✅ Guardar datos frescos en IndexedDB
            const tx = dbInstance.transaction(['asignaciones'], 'readwrite');
            cloudAsignaciones.forEach(a => tx.objectStore('asignaciones').put(a));

            tx.oncomplete = () => {
                // Filtrar asignaciones del evaluador actual
                const userAsignaciones = cloudAsignaciones.filter(a => a.rut === currentUser.rut);

                if (userAsignaciones.length === 0) {
                    alert('❌ No tiene precalificaciones asignadas.');
                    restoreConnectionStatus();
                    return;
                }

                // 🚀 Cargar con datos FRESCOS de Google Sheets
                loadEvaluatorWithAsignaciones(userAsignaciones);
            };
        }).catch(() => {
            // ⚠️ Si hay error de conexión, fallback a datos locales
            console.warn('⚠️ Error al conectar con Google Sheets, usando caché local');
            dbGetAll('asignaciones', (dbAsignaciones) => {
                const userAsignaciones = dbAsignaciones.filter(a => a.rut === currentUser.rut);
                if (userAsignaciones.length === 0) {
                    alert('❌ Error de conexión. No hay asignaciones locales.');
                    restoreConnectionStatus();
                    return;
                }
                console.log('✅ Usando asignaciones del caché local');
                loadEvaluatorWithAsignaciones(userAsignaciones);
            });
        });
    } catch (error) {
        alert('❌ Error al descargar asignaciones.');
        restoreConnectionStatus();
    }
}

/**
 * Carga rápido el panel del evaluador sin esperar proyectos
 */
function loadEvaluatorWithAsignaciones(userAsignaciones) {
    // Mapear asignaciones rápidamente usando función helper
    allAsignacionesMapped = mapAsignacionesForDisplay(userAsignaciones);

    // 🔄 PRIORIDAD 1: DESCARGAR SCORES DE GOOGLE SHEETS
    console.log(`📥 Intentando descargar scores para ${currentUser.rut} desde Google Sheets...`);

    cloudGet('scores').then(cloudScores => {
        // Filtrar scores del evaluador desde Google Sheets
        let userScoresFromCloud = [];
        if (cloudScores && Array.isArray(cloudScores)) {
            console.log(`📊 Total de scores en Google Sheets: ${cloudScores.length}`);
            console.log(`🔍 Buscando scores para rutEvaluador: "${currentUser.rut}"`);

            userScoresFromCloud = cloudScores.filter(s => s.rutEvaluador === currentUser.rut).map(s => ({
                ...s,
                itemId: s.itemId ? s.itemId.toString().replace(/,/g, '.') : s.itemId,  // Reemplazar comas con puntos (locale)
                stage: parseInt(s.stage, 10),  // Convertir stage a número
                score: parseInt(s.score, 10),   // Convertir score a número
                modificado: false  // Flag para rastrear cambios locales
            }));

            console.log(`✅ Descargados ${userScoresFromCloud.length} scores para ${currentUser.rut}`);
            if (userScoresFromCloud.length > 0) {
                console.log(`📋 Primeros 3 scores (CONVERTIDOS):`, userScoresFromCloud.slice(0, 3));
                console.log(`   📌 Ejemplo score[0]:`, {
                    cobertura: userScoresFromCloud[0].cobertura,
                    stage: userScoresFromCloud[0].stage,
                    stageType: typeof userScoresFromCloud[0].stage,
                    itemId: userScoresFromCloud[0].itemId,
                    score: userScoresFromCloud[0].score,
                    scoreType: typeof userScoresFromCloud[0].score
                });
            }
        }

        // Google Sheets es la ÚNICA fuente de datos
        // Si Google Sheets está vacío, allMemoryScores está vacío (no usar IndexedDB como fallback)
        allMemoryScores = userScoresFromCloud;
        continueLoadingEvaluator();

        function continueLoadingEvaluator() {
            currentCoverage = allAsignacionesMapped[0].cobertura;
            const matchingConfig = allAsignacionesMapped.find(a => a.cobertura === currentCoverage);
            currentStage = (matchingConfig && matchingConfig.etapas && matchingConfig.etapas.length > 0) ? matchingConfig.etapas[0] : 1;

            // 🚀 MOSTRAR LA UI CON SCORES CARGADOS
            initializeEvaluatorUI();
        }
    }).catch(err => {
        console.error('❌ Error descargando scores desde Google Sheets:', err);
        // Sin fallback a IndexedDB - Google Sheets es la única fuente
        allMemoryScores = [];

        // Inicializar UI con asignaciones disponibles
        initializeEvaluatorUI();
    });
}

/**
 * Descarga asignaciones desde Google Sheet y muestra progreso
 */
function syncAsignacionesFromCloud() {
    const modal = document.getElementById('download-asignaciones-modal');
    const progressBar = document.getElementById('download-progress-bar');
    const statusText = document.getElementById('download-status-text');

    if (!modal) return;

    // Mostrar modal
    modal.classList.remove('hidden');
    progressBar.style.width = '0%';
    statusText.textContent = 'Iniciando descarga...';

    // Simular progreso
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) progress = 90;
        progressBar.style.width = progress + '%';
    }, 200);

    // Timeout de seguridad: cerrar modal después de 20 segundos sin importar qué pase
    const safetyTimeout = setTimeout(() => {
        clearInterval(progressInterval);
        if (!modal.classList.contains('hidden')) {
            console.warn('⚠️ Timeout de seguridad en sincronización - cerrando modal');
            progressBar.style.width = '100%';
            statusText.textContent = '⚠️ Tiempo agotado (usando datos locales)';
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 1500);
        }
    }, 20000);

    // Descargar asignaciones del Google Sheet
    cloudGet('asignaciones').then(cloudAsignaciones => {
        clearTimeout(safetyTimeout);
        clearInterval(progressInterval);
        progress = 95;
        progressBar.style.width = progress + '%';

        // Guardar en IndexedDB SI hay datos
        if (cloudAsignaciones && Array.isArray(cloudAsignaciones) && cloudAsignaciones.length > 0) {
            statusText.textContent = 'Guardando datos localmente...';
            const tx = dbInstance.transaction(['asignaciones'], 'readwrite');
            const store = tx.objectStore('asignaciones');
            cloudAsignaciones.forEach(a => store.put(a));

            tx.oncomplete = () => {
                progress = 100;
                progressBar.style.width = progress + '%';
                statusText.textContent = '✅ Sincronización completa';

                // 🔄 ACTUALIZAR allAsignacionesMapped con datos frescos
                const userAsignaciones = getUserAsignaciones(cloudAsignaciones);
                if (userAsignaciones.length > 0) {
                    allAsignacionesMapped = mapAsignacionesForDisplay(userAsignaciones);
                    renderCoverageTabs();
                }

                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 1000);
            };
        } else {
            // Datos nulos o vacíos - usar caché local
            progress = 100;
            progressBar.style.width = progress + '%';
            statusText.textContent = '✅ Usando datos locales';
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 1000);
        }
    }).catch(error => {
        clearTimeout(safetyTimeout);
        clearInterval(progressInterval);
        progressBar.style.width = '100%';
        statusText.textContent = '⚠️ Conexión lenta (usando caché local)';

        // Cerrar modal después de 1.5 segundos
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 1500);
    });
}

function backgroundSyncForEvaluator() {
    // Cargar scores del usuario desde Google Sheets en segundo plano
    console.log(`📥 Descargando scores para ${currentUser.rut}...`);

    // Timeout agresivo: si tarda más de 12 segundos, usar datos locales
    const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
            console.warn('⏱️ Timeout descargando scores, usando caché local');
            resolve(null);
        }, 12000);
    });

    Promise.race([cloudGet('scores'), timeoutPromise]).then(cloudScores => {
        if (cloudScores && Array.isArray(cloudScores)) {
            // Filtrar scores del usuario actual desde Google Sheets
            const serverScores = cloudScores.filter(s => s.rutEvaluador === currentUser.rut);
            console.log(`✅ Se encontraron ${serverScores.length} scores en Google Sheets para ${currentUser.rut}`);

            if (serverScores.length > 0) {
                // Obtener scores locales actuales (ya cargados en allMemoryScores)
                const localScores = allMemoryScores || [];

                // Combinar: primero los del servidor, luego los locales que no están en el servidor
                const serverIds = new Set(serverScores.map(s => s.idTx));
                const localOnlyScores = localScores.filter(s => !serverIds.has(s.idTx));
                // 🔧 CRÍTICO: Convertir stage y score a números (Google Sheets retorna strings)
                const convertedServerScores = serverScores.map(s => ({
                    ...s,
                    itemId: s.itemId ? s.itemId.toString().replace(/,/g, '.') : s.itemId,  // Reemplazar comas con puntos (locale)
                    stage: parseInt(s.stage, 10),
                    score: parseInt(s.score, 10)
                }));
                const combinedScores = [...convertedServerScores, ...localOnlyScores];

                // Guardar combinación en IndexedDB
                const tx = dbInstance.transaction(['scores'], 'readwrite');
                const store = tx.objectStore('scores');
                combinedScores.forEach(s => store.put(s));

                tx.oncomplete = () => {
                    allMemoryScores = combinedScores;
                    loadScoresFromActiveContext();
                    renderEvaluatorView();
                    console.log(`✅ Scores sincronizados: ${combinedScores.length} registros totales`);
                    showToast('✅ Puntuaciones sincronizadas', 'success');
                };
            } else {
                console.log(`⚠️ No hay scores en Google Sheets para ${currentUser.rut}`);
                loadScoresFromActiveContext();
                renderEvaluatorView();
            }
        } else {
            console.log(`⚠️ No hay scores disponibles, usando caché local`);
            // Ya tenemos scores en allMemoryScores desde loadEvaluatorWithAsignaciones
            loadScoresFromActiveContext();
            renderEvaluatorView();
        }
    }).catch(err => {
        console.error('❌ Error descargando scores:', err);
        // Fallback: usar datos locales que ya están en allMemoryScores
        loadScoresFromActiveContext();
        renderEvaluatorView();
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

/**
 * Resetea el timer de inactividad cuando hay movimiento
 */
function resetActivityTimer() {
    if (!currentUser || !currentUser.rut) return;

    const userRut = currentUser.rut;

    // Actualizar último movimiento
    if (ACTIVE_USER_SESSIONS.has(userRut)) {
        const session = ACTIVE_USER_SESSIONS.get(userRut);
        session.lastActivity = Date.now();
        ACTIVE_USER_SESSIONS.set(userRut, session);
    }

    // Resetear timer de inactividad
    if (userInactivityTimers[userRut]) {
        clearTimeout(userInactivityTimers[userRut]);
    }

    userInactivityTimers[userRut] = setTimeout(() => {
        if (currentUser && currentUser.rut === userRut) {
            console.warn(`⏰ Sesión expirada por inactividad: ${userRut}`);
            alert(`⏰ Su sesión ha expirado por inactividad.\n\nPor seguridad, las sesiones se cierran después de ${SESSION_TIMEOUT_MINUTES} minutos sin movimiento.`);
            handleLogout();
        }
    }, INACTIVITY_TIMEOUT_MS);
}

/**
 * Actualiza cuando hay escritura en servidor
 */
function updateLastWriteTime() {
    if (!currentUser || !currentUser.rut) return;

    if (ACTIVE_USER_SESSIONS.has(currentUser.rut)) {
        const session = ACTIVE_USER_SESSIONS.get(currentUser.rut);
        session.lastWrite = Date.now();
        ACTIVE_USER_SESSIONS.set(currentUser.rut, session);
    }
}

function performLogout() {
    // Remover usuario de sesiones activas
    if (currentUser && currentUser.rut) {
        const userRut = currentUser.rut;
        ACTIVE_USER_SESSIONS.delete(userRut);

        // Limpiar timer de inactividad
        if (userInactivityTimers[userRut]) {
            clearTimeout(userInactivityTimers[userRut]);
            delete userInactivityTimers[userRut];
        }

        console.log(`❌ Usuario ${userRut} removido. Sesiones activas: ${ACTIVE_USER_SESSIONS.size}/${MAX_CONCURRENT_USERS}`);

        // Registrar logout en backend
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'logout',
                userRut: userRut,
                csrfToken: csrfToken
            })
        }).catch(err => console.warn('⚠️ Error al logout en backend:', err));
    }

    // Detener countdown de sesión
    stopSessionCountdown();

    currentUser = null;
    currentRole = null;
    hasUnsavedEvaluatorChanges = false;

    // Limpiar estado de evaluador
    window.currentSelectedEntity = null;
    currentCoverage = "";
    currentStage = 1;
    allAsignacionesMapped = [];
    allMemoryScores = [];
    currentEntityPage = 1;

    // Invalidar CSRF token al logout
    invalidateCSRFToken();

    // Limpiar todos los event listeners para prevenir memory leaks
    cleanupAllListeners();

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
        toggleElement('btn-download-cloud', true);
        toggleElement('btn-save-scores', false);
        toggleElement('btn-eval-pdf', false);
        if (countdownInterval) clearInterval(countdownInterval);
        populateAdminMatrix().then(() => {
            window.changeStage(1);
            checkAsignacionesHistoricasConflict();
        });
    } else {
        toggleElement('admin-view', false);
        toggleElement('evaluador-view', true);
        toggleElement('btn-sync-cloud', false);
        toggleElement('btn-download-cloud', false);
        toggleElement('btn-save-scores', true);
        toggleElement('btn-eval-pdf', true);
        checkDeadlineStatus();
        startCountdownClock();
        startSessionCountdown(); // Iniciar countdown de 10 minutos para cerrar sesión
        renderCoverageTabs();

        // Sincronizar datos en background sin bloquear UI
        setTimeout(() => backgroundSyncAfterLogin(), 500);
    }
}

function renderCoverageTabs() {
    const container = document.getElementById('evaluador-coverage-tabs');
    if (!container) return;

    container.innerHTML = '';
    const uniqueCoberturas = [...new Set(allAsignacionesMapped.map(a => a.cobertura))];

    uniqueCoberturas.forEach(cobertura => {
        const btn = document.createElement('button');
        btn.className = `tab-button ${currentCoverage === cobertura ? 'active' : ''}`;
        btn.textContent = cobertura;
        btn.onclick = () => {
            currentCoverage = cobertura;
            const badgeEl = document.getElementById('eval-programa-badge');
            if (badgeEl) {
                const programa = cobertura ? cobertura.split(' - ')[0] : 'DS10';
                badgeEl.textContent = programa;
            }
            // Resetear entidad seleccionada y página de paginación
            window.currentSelectedEntity = null;
            currentEntityPage = 1;
            const conf = allAsignacionesMapped.find(a => a.cobertura === currentCoverage);
            currentStage = (conf && conf.etapas && conf.etapas.length > 0) ? conf.etapas[0] : 1;
            renderCoverageTabs();
        };
        container.appendChild(btn);
    });
    renderEvaluatorHeaderInfo();
    window.changeStage(currentStage);
}

/**
 * Calcula el avance de calificación de una entidad en la cobertura actual:
 * cuántos ítems (de todas sus etapas asignadas) ya tienen score > 0.
 * Es de solo lectura: no modifica allMemoryScores ni dbScores.
 * @param {string} entidadNombre
 * @returns {{completed: number, total: number, state: 'complete'|'partial'|'pending'}}
 */
function getEntityCompletionStatus(entidadNombre) {
    const normalize = (str) => (str || '').trim();
    const targetEntity = normalize(entidadNombre);

    const asigsForEntity = allAsignacionesMapped.filter(a =>
        a.cobertura === currentCoverage && normalize(a.entidadNombre) === targetEntity
    );
    if (asigsForEntity.length === 0) {
        return { completed: 0, total: 0, state: 'pending' };
    }

    // Unión de todas las etapas asignadas a esta entidad en esta cobertura
    const stagesSet = new Set();
    asigsForEntity.forEach(a => (a.etapas || []).forEach(e => stagesSet.add(parseInt(e, 10))));

    const itemsToUse = (dbItems && dbItems.length > 0) ? dbItems : DEFAULT_ITEMS;

    let total = 0, completed = 0;
    stagesSet.forEach(stage => {
        const stageItems = itemsToUse.filter(i => parseInt(i.stage, 10) === stage);
        total += stageItems.length;
        stageItems.forEach(item => {
            const hasScore = allMemoryScores.some(r =>
                r.cobertura === currentCoverage &&
                normalize(r.entidad) === targetEntity &&
                parseInt(r.stage, 10) === stage &&
                r.itemId === item.id &&
                r.score > 0
            );
            if (hasScore) completed++;
        });
    });

    let state = 'pending';
    if (total > 0 && completed === total) state = 'complete';
    else if (completed > 0) state = 'partial';

    return { completed, total, state };
}

/**
 * Recalcula y actualiza SOLO el estado visual (color + badge) de las pestañas
 * de entidad ya existentes en el DOM, sin recrearlas ni tocar sus listeners.
 * Se llama cada vez que cambia un score (calculateLiveScore) para mantener
 * el avance visible actualizado mientras el evaluador califica.
 */
function refreshEntityTabsBadges() {
    const tabsContainer = document.getElementById('eval-entity-tabs-container');
    if (!tabsContainer) return;

    tabsContainer.querySelectorAll('.tab-button[data-entidad]').forEach(btn => {
        const entidadNombre = btn.dataset.entidad;
        const { completed, total, state } = getEntityCompletionStatus(entidadNombre);

        btn.classList.remove('state-complete', 'state-partial', 'state-pending');
        btn.classList.add(`state-${state}`);

        const badge = btn.querySelector('.entity-badge');
        if (badge) {
            badge.textContent = state === 'complete' ? '✓' : `${completed}/${total}`;
        }
    });
}

/**
 * Renderiza las pestañas de entidades, detalles y proyectos asociados a la cobertura activa del evaluador.
 * Las ENTIDADES siempre se muestran (vienen de asignaciones)
 * Los PROYECTOS se cargan en segundo plano (son opcionales)
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
        if (projectsEl) projectsEl.innerHTML = '<tr><td colspan="6" class="text-center">Seleccione una cobertura para ver los proyectos.</td></tr>';
        if (stagesEl) stagesEl.innerHTML = '';
        return;
    }

    // Crear pestañas de entidades basadas en cobertura actual
    // Las ENTIDADES son PRIMARIAS: siempre se muestran
    const uniqueEntities = [...new Set(allCoverageAsigs.map(a => a.entidadNombre))];

    // Si no hay entidad seleccionada, usar la primera
    if (!window.currentSelectedEntity) {
        // Asegurar que entidadNombre no esté vacío
        let entityName = allCoverageAsigs[0].entidadNombre;
        if (!entityName || entityName === 'undefined' || entityName.trim() === '') {
            entityName = 'Sin Entidad';
        }
        window.currentSelectedEntity = entityName;
    }

    // Renderizar pestañas de entidades CON PAGINACIÓN
    const tabsContainer = document.getElementById('eval-entity-tabs-container');
    const paginationEl = document.getElementById('eval-entity-pagination');
    const paginationInfoEl = document.getElementById('pagination-info');

    if (tabsContainer) {
        tabsContainer.innerHTML = '';

        // Calcular paginación
        const totalPages = Math.ceil(uniqueEntities.length / ENTITIES_PER_PAGE);

        // Validar página actual
        if (currentEntityPage > totalPages) {
            currentEntityPage = totalPages || 1;
        }
        if (currentEntityPage < 1) {
            currentEntityPage = 1;
        }

        // Obtener entidades para la página actual
        const startIdx = (currentEntityPage - 1) * ENTITIES_PER_PAGE;
        const endIdx = startIdx + ENTITIES_PER_PAGE;
        const pageEntities = uniqueEntities.slice(startIdx, endIdx);

        // Renderizar botones de entidades de la página actual
        pageEntities.forEach(entidadNombre => {
            const { completed, total, state } = getEntityCompletionStatus(entidadNombre);

            const btn = document.createElement('button');
            btn.className = `tab-button state-${state} ${window.currentSelectedEntity === entidadNombre ? 'active' : ''}`;
            btn.dataset.entidad = entidadNombre;
            btn.style.fontSize = '0.8rem';
            btn.style.padding = '6px 10px';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'entity-name';
            nameSpan.textContent = entidadNombre;

            const badgeSpan = document.createElement('span');
            badgeSpan.className = 'entity-badge';
            badgeSpan.textContent = state === 'complete' ? '✓' : `${completed}/${total}`;

            btn.appendChild(nameSpan);
            btn.appendChild(badgeSpan);

            btn.onclick = () => {
                window.currentSelectedEntity = entidadNombre;
                console.log('🔄 Cambiando a entidad:', entidadNombre);

                // Actualizar destaque visual del botón (usa data-entidad, no textContent,
                // ya que el botón ahora incluye el badge de avance dentro de su texto)
                document.querySelectorAll('.tab-button[data-entidad]').forEach(b => {
                    b.classList.remove('active');
                    if (b.dataset.entidad === entidadNombre) {
                        b.classList.add('active');
                    }
                });

                // Actualizar detalles de la entidad (nombre, RUT, proyectos)
                updateEntityDetails(entidadNombre);

                // Cargar y renderizar los scores de la nueva entidad
                loadScoresFromActiveContext();
                renderEvaluatorView();
            };
            tabsContainer.appendChild(btn);
        });

        // Mostrar/ocultar paginación
        if (paginationEl) {
            if (uniqueEntities.length > ENTITIES_PER_PAGE) {
                paginationEl.style.display = 'block';
                if (paginationInfoEl) {
                    paginationInfoEl.textContent = `${currentEntityPage}/${totalPages}`;
                }

                // Configurar botones de navegación
                const btnPrev = document.getElementById('btn-prev-entity');
                const btnNext = document.getElementById('btn-next-entity');

                if (btnPrev) {
                    btnPrev.disabled = currentEntityPage === 1;
                    btnPrev.style.opacity = currentEntityPage === 1 ? '0.5' : '1';
                    btnPrev.style.cursor = currentEntityPage === 1 ? 'not-allowed' : 'pointer';
                    btnPrev.onclick = () => {
                        if (currentEntityPage > 1) {
                            currentEntityPage--;
                            renderEvaluatorHeaderInfo();
                        }
                    };
                }

                if (btnNext) {
                    btnNext.disabled = currentEntityPage === totalPages;
                    btnNext.style.opacity = currentEntityPage === totalPages ? '0.5' : '1';
                    btnNext.style.cursor = currentEntityPage === totalPages ? 'not-allowed' : 'pointer';
                    btnNext.onclick = () => {
                        if (currentEntityPage < totalPages) {
                            currentEntityPage++;
                            renderEvaluatorHeaderInfo();
                        }
                    };
                }
            } else {
                paginationEl.style.display = 'none';
            }
        }
    }

    // Buscar asignaciones para la entidad seleccionada EN LA COBERTURA ACTUAL (no todas las coberturas)
    const asignsForEntity = allCoverageAsigs.filter(a =>
        a.entidadNombre === window.currentSelectedEntity
    );

    if (!asignsForEntity || asignsForEntity.length === 0) {
        console.warn('No se encontró asignación para:', {entidad: window.currentSelectedEntity});
        return;
    }


    // Usar la primera para mostrar datos básicos
    const selectedAsig = asignsForEntity[0];

    // Mostrar detalles de la entidad DIRECTAMENTE (desde asignaciones)
    const nameEl = document.getElementById('eval-entity-name');
    const rutEl = document.getElementById('eval-entity-rut');
    const convenioEl = document.getElementById('eval-entity-convenio');
    const fechaEl = document.getElementById('eval-entity-fecha');
    const programaEl = document.getElementById('eval-entity-programa');

    if (nameEl) nameEl.textContent = window.currentSelectedEntity || 'Sin Entidad';
    if (programaEl) {
        const programas = asignsForEntity.map(a => a.programa).join(', ');
        programaEl.textContent = programas || '---';
    }

    // Actualizar badge de cobertura (solo mostrar código, no provincia)
    const badgeEl = document.getElementById('eval-programa-badge');
    if (badgeEl) {
        const programa = currentCoverage ? currentCoverage.split(' - ')[0] : 'DS10';
        badgeEl.textContent = programa;
    }

    // Intentar buscar datos adicionales en IndexedDB EN SEGUNDO PLANO (sin bloquear)
    if (rutEl || convenioEl || fechaEl) {
        dbGetAll('entidades', (entidades) => {
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

            if (rutEl) rutEl.textContent = entidad.rut || '---';
            if (convenioEl) convenioEl.textContent = convenio || '---';
            if (fechaEl) fechaEl.textContent = fecha || '---';
        });
    }

    // Renderizar tabla de proyectos EN SEGUNDO PLANO (son opcionales)
    renderProjectsTableAllPrograms(asignsForEntity, window.currentSelectedEntity);

    // Renderizar etapas a calificar (TODAS las asignadas para esta entidad)
    renderStagesForEvaluator(asignsForEntity);

    // 🔄 CARGAR SCORES PARA LA ETAPA ACTUAL (IMPORTANTE: se hace después de cambiar entidad)
    // IMPORTANTE: Filtrar solo scores de la entidad seleccionada (no cargar datos viejos de Google Sheets)
    loadScoresFromActiveContext();
    renderEvaluatorView();
}

/**
 * Renderiza las etapas a calificar para el evaluador
 */
/**
 * Actualiza solo los detalles de la entidad seleccionada (nombre, RUT, proyectos, etapas)
 * SIN limpiar los datos ingresados en los inputs
 */
function updateEntityDetails(entidadNombre) {
    const allCoverageAsigs = allAsignacionesMapped.filter(a => a.cobertura === currentCoverage);
    const asignsForEntity = allCoverageAsigs.filter(a => a.entidadNombre === entidadNombre);

    if (!asignsForEntity || asignsForEntity.length === 0) {
        console.warn('No se encontró asignación para:', {entidad: entidadNombre});
        return;
    }

    const selectedAsig = asignsForEntity[0];

    // Actualizar detalles de la entidad
    const nameEl = document.getElementById('eval-entity-name');
    const rutEl = document.getElementById('eval-entity-rut');
    const convenioEl = document.getElementById('eval-entity-convenio');
    const fechaEl = document.getElementById('eval-entity-fecha');
    const programaEl = document.getElementById('eval-entity-programa');

    if (nameEl) nameEl.textContent = entidadNombre || 'Sin Entidad';
    if (programaEl) {
        const programas = asignsForEntity.map(a => a.programa).join(', ');
        programaEl.textContent = programas || '---';
    }

    // Buscar datos adicionales en IndexedDB EN SEGUNDO PLANO
    if (rutEl || convenioEl || fechaEl) {
        dbGetAll('entidades', (entidades) => {
            const normalize = (str) => str.toString().trim().toLowerCase().replace(/\s+/g, ' ').replace(/\.+$/g, '').replace(/\s*ltda\.?\s*$/g, ' ltda').replace(/\s*spa\.?\s*$/g, ' spa');
            const target = normalize(entidadNombre);

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

            if (rutEl) rutEl.textContent = entidad.rut || '---';
            if (convenioEl) convenioEl.textContent = convenio || '---';
            if (fechaEl) fechaEl.textContent = fecha || '---';
        });
    }

    // Renderizar tabla de proyectos y etapas
    renderProjectsTableAllPrograms(asignsForEntity, entidadNombre);
    renderStagesForEvaluator(asignsForEntity);
}

function renderStagesForEvaluator(asignaciones) {
    const container = document.getElementById('eval-stages-container');
    if (!asignaciones || (Array.isArray(asignaciones) && asignaciones.length === 0)) {
        container.innerHTML = '<div style="color: #999; font-size: 0.85rem;">No hay etapas asignadas.</div>';
        return;
    }

    // Combinar TODAS las etapas únicas de TODAS las asignaciones
    const etapasSet = new Set();
    if (Array.isArray(asignaciones)) {
        asignaciones.forEach(asig => {
            if (asig.etapas && Array.isArray(asig.etapas)) {
                asig.etapas.forEach(e => etapasSet.add(e));
            }
        });
    }

    const etapas = Array.from(etapasSet).sort((a, b) => a - b);
    if (etapas.length === 0) {
        container.innerHTML = '<div style="color: #999; font-size: 0.85rem;">No hay etapas asignadas.</div>';
        return;
    }

    container.innerHTML = '';

    etapas.forEach(stageNum => {
        const badge = document.createElement('div');
        const isActive = currentStage === stageNum;

        const baseStyle = `
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-block;
            white-space: nowrap;
        `;

        const activeStyle = `
            background: var(--primary-dark);
            color: #FFF;
            border: 2px solid var(--primary-blue);
            box-shadow: 0 4px 12px rgba(0, 107, 185, 0.3);
            transform: scale(1.05);
        `;

        const inactiveStyle = `
            background: var(--bg-stage-${stageNum});
            color: var(--primary-dark);
            border: 2px solid #E8EAED;
        `;

        badge.style.cssText = baseStyle + (isActive ? activeStyle : inactiveStyle);
        badge.textContent = `Etapa ${stageNum}`;

        badge.onmouseover = () => {
            if (!isActive) {
                badge.style.transform = 'translateY(-2px)';
                badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                badge.style.borderColor = '#CCC';
            }
        };
        badge.onmouseout = () => {
            if (!isActive) {
                badge.style.transform = 'translateY(0)';
                badge.style.boxShadow = 'none';
                badge.style.borderColor = '#E8EAED';
            }
        };
        badge.onclick = () => {
            currentStage = stageNum;
            window.changeStage(stageNum);
        };
        container.appendChild(badge);
    });

    // Agregar promedio entidad dentro del contenedor
    const avgWrapper = document.createElement('div');
    avgWrapper.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        margin-left: auto;
        padding-left: 12px;
        white-space: nowrap;
    `;
    const avgLabel = document.createElement('span');
    avgLabel.style.cssText = `
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--primary-dark);
    `;
    avgLabel.textContent = 'Promedio:';
    const avgBox = document.createElement('div');
    avgBox.id = 'entity-average-box';
    avgBox.style.cssText = `
        background-color: #F5F7FA;
        border: 1px solid #E8EAED;
        border-radius: 4px;
        padding: 4px 10px;
        font-weight: 600;
        color: var(--primary-dark);
        font-size: 0.85rem;
        min-width: 40px;
        text-align: center;
    `;
    avgBox.textContent = '0';
    avgWrapper.appendChild(avgLabel);
    avgWrapper.appendChild(avgBox);
    container.appendChild(avgWrapper);
}

/**
 * Renderiza proyectos para TODOS los programas asignados a una entidad
 */
function renderProjectsTableAllPrograms(asignaciones, entidadNombre) {
    const body = document.getElementById('eval-projects-body');
    const progressBar = document.getElementById('eval-progress-bar');

    if (!body) return;

    if (!asignaciones || asignaciones.length === 0) {
        body.innerHTML = '';
        body.appendChild(createTableMessage('No hay programas asignados.', 6));
        return;
    }

    body.innerHTML = '';
    body.appendChild(createTableMessage('Cargando proyectos...', 6));
    if (progressBar) progressBar.classList.remove('hidden');

    // Cargar proyectos para todos los programas de la entidad
    let todosLosProyectos = [];
    let cargasCompletadas = 0;

    asignaciones.forEach(asig => {
        cloudGetProjects(asig.programa, entidadNombre)
            .then(proyectos => {
                cargasCompletadas++;
                if (proyectos && proyectos.length > 0) {
                    todosLosProyectos = todosLosProyectos.concat(
                        proyectos.map(p => ({ ...p, _programa: asig.programa }))
                    );
                }
            })
            .catch(error => {
                cargasCompletadas++;
            })
            .finally(() => {
                // Cuando se completen todas las cargas (con éxito o error)
                if (cargasCompletadas === asignaciones.length) {
                    if (progressBar) progressBar.classList.add('hidden');

                    if (todosLosProyectos.length === 0) {
                        body.innerHTML = '';
                        body.appendChild(createTableMessage(`Sin proyectos asignados para "${escapeHTML(entidadNombre)}".`, 6));
                        return;
                    }

                    // Detectar tipo de programa
                    const soloDS10 = todosLosProyectos.every(p => p._programa === 'DS10');
                    const soloDS27 = todosLosProyectos.every(p => p._programa === 'DS27');
                    const soloDS49 = todosLosProyectos.every(p => p._programa === 'DS49');
                    const thead = document.getElementById('eval-projects-head');

                    if (soloDS10) {
                        // Para DS10: 4 columnas (Comuna, Modal., Familias, Año)
                        if (thead) {
                            thead.innerHTML = `
                                <tr style="background-color: #F5F7FA; color:var(--primary-dark); font-weight: 600; border-bottom: 1px solid #E8EAED;">
                                    <th style="padding: 4px 12px !important; text-align: left; border: none; border-right: 1px solid #E8EAED; white-space: nowrap; font-size: 11px !important; width: 30%;">📍 Comuna</th>
                                    <th style="padding: 4px 12px !important; text-align: center; border: none; border-right: 1px solid #E8EAED; white-space: nowrap; font-size: 11px !important; width: 20%;">🏘️ Modal.</th>
                                    <th style="padding: 4px 12px !important; text-align: center; border: none; border-right: 1px solid #E8EAED; white-space: nowrap; font-size: 11px !important; width: 25%;">👥 Fam.</th>
                                    <th style="padding: 4px 12px !important; text-align: center; border: none; white-space: nowrap; font-size: 11px !important; width: 25%;">📅 Año</th>
                                </tr>
                            `;
                        }

                        body.innerHTML = todosLosProyectos.map(p => `
                            <tr>
                                <td>${p.Comuna || p.comuna || ''}</td>
                                <td>${p['Modal.'] || p.Modalidad || p.modalidad || ''}</td>
                                <td>${p.Familias || p['N°familias'] || p.Nfamilias || p.familias || ''}</td>
                                <td>${p.Año || p.ano || p.anio || ''}</td>
                            </tr>
                        `).join('');
                    } else if (soloDS27) {
                        // Para DS27: 5 columnas (Código, Nombre proyecto, Comuna, Familias, Año - SIN Modal.)
                        if (thead) {
                            thead.innerHTML = `
                                <tr style="background-color: #F5F7FA; color:var(--primary-dark); font-weight: 600; border-bottom: 1px solid #E8EAED;">
                                    <th style="padding: 4px 12px !important; text-align: left; border: none; border-right: 1px solid #E8EAED; white-space: nowrap; font-size: 11px !important; width: 10%;">📋 Código</th>
                                    <th style="padding: 4px 12px !important; text-align: left; border: none; border-right: 1px solid #E8EAED; font-size: 11px !important; width: 45%;">🏢 Nombre</th>
                                    <th style="padding: 4px 12px !important; text-align: left; border: none; border-right: 1px solid #E8EAED; white-space: nowrap; font-size: 11px !important; width: 20%;">📍 Comuna</th>
                                    <th style="padding: 4px 12px !important; text-align: center; border: none; border-right: 1px solid #E8EAED; white-space: nowrap; font-size: 11px !important; width: 12%;">👥 Fam.</th>
                                    <th style="padding: 4px 12px !important; text-align: center; border: none; white-space: nowrap; font-size: 11px !important; width: 13%;">📅 Año</th>
                                </tr>
                            `;
                        }

                        body.innerHTML = todosLosProyectos.map(p => `
                            <tr>
                                <td>${p.Código || p.codigo || p.Codigo || ''}</td>
                                <td>${p['Nombre proyecto'] || p['Nombre del proy'] || p['Nombre Proyecto'] || p.nombre_proyecto || p.Nombre || ''}</td>
                                <td>${p.Comuna || p.comuna || ''}</td>
                                <td>${p.Familias || p['N°familias'] || p.Nfamilias || p.familias || ''}</td>
                                <td>${p.Año || p.ano || p.anio || ''}</td>
                            </tr>
                        `).join('');
                    } else if (soloDS49) {
                        // Para DS49: 6 columnas (Codigo Proyecto, Nombre, Comuna, Tipología, N°Familias, Año)
                        if (thead) {
                            thead.innerHTML = `
                                <tr style="background-color: #F5F7FA; color:var(--primary-dark); font-weight: 600; border-bottom: 1px solid #E8EAED;">
                                    <th style="padding: 4px 12px !important; text-align: left; border: none; border-right: 1px solid #E8EAED; white-space: nowrap; font-size: 11px !important; width: 8%;">📋 Código</th>
                                    <th style="padding: 4px 12px !important; text-align: left; border: none; border-right: 1px solid #E8EAED; font-size: 11px !important; width: 35%;">🏢 Nombre</th>
                                    <th style="padding: 4px 12px !important; text-align: left; border: none; border-right: 1px solid #E8EAED; white-space: nowrap; font-size: 11px !important; width: 15%;">📍 Comuna</th>
                                    <th style="padding: 4px 12px !important; text-align: center; border: none; border-right: 1px solid #E8EAED; white-space: nowrap; font-size: 11px !important; width: 15%;">🏘️ Tipología</th>
                                    <th style="padding: 4px 12px !important; text-align: center; border: none; border-right: 1px solid #E8EAED; white-space: nowrap; font-size: 11px !important; width: 12%;">👥 Fam.</th>
                                    <th style="padding: 4px 12px !important; text-align: center; border: none; white-space: nowrap; font-size: 11px !important; width: 15%;">📅 Año</th>
                                </tr>
                            `;
                        }

                        body.innerHTML = todosLosProyectos.map(p => {
                            let familias = '';
                            const keysWithFam = Object.keys(p).find(k => k.toLowerCase().includes('familia') || k.toLowerCase().includes('fam') || k.includes('°'));
                            if (keysWithFam) {
                                familias = p[keysWithFam];
                            } else {
                                familias = p['N°Familias'] || p['N° Familias'] || p['N°familias'] || p['Familias'] || p['familias'] || p.Nfamilias || p.familias || '';
                            }
                            return `
                            <tr>
                                <td>${p['Codigo Proyecto'] || p.codigo || p.Codigo || ''}</td>
                                <td>${p['NOMBRE PROYECTO'] || p['Nombre Proyecto'] || p['Nombre del proy'] || p.nombre_proyecto || p.Nombre || p.nombre || ''}</td>
                                <td>${p.COMUNA || p.Comuna || p.comuna || ''}</td>
                                <td>${p.Tipología || p.tipologia || p.Tipologia || ''}</td>
                                <td>${familias}</td>
                                <td>${p.año || p.Año || p.ano || p.anio || ''}</td>
                            </tr>
                        `;
                        }).join('');
                    } else {
                        // Para mezcla: 6 columnas (Código, Nombre, Comuna, Modal., Familias, Año)
                        if (thead) {
                            thead.innerHTML = `
                                <tr style="background-color: #F5F7FA; color:var(--primary-dark); font-weight: 600; border-bottom: 1px solid #E8EAED;">
                                    <th style="padding: 4px 12px !important; text-align: left; border: none; border-right: 1px solid #E8EAED; white-space: nowrap; font-size: 11px !important; width: 8%;">📋 Código</th>
                                    <th style="padding: 4px 12px !important; text-align: left; border: none; border-right: 1px solid #E8EAED; font-size: 11px !important; width: 35%;">🏢 Nombre</th>
                                    <th style="padding: 4px 12px !important; text-align: left; border: none; border-right: 1px solid #E8EAED; white-space: nowrap; font-size: 11px !important; width: 15%;">📍 Comuna</th>
                                    <th style="padding: 4px 12px !important; text-align: center; border: none; border-right: 1px solid #E8EAED; white-space: nowrap; font-size: 11px !important; width: 12%;">🏘️ Modal.</th>
                                    <th style="padding: 4px 12px !important; text-align: center; border: none; border-right: 1px solid #E8EAED; white-space: nowrap; font-size: 11px !important; width: 12%;">👥 Fam.</th>
                                    <th style="padding: 4px 12px !important; text-align: center; border: none; white-space: nowrap; font-size: 11px !important; width: 18%;">📅 Año</th>
                                </tr>
                            `;
                        }

                        body.innerHTML = todosLosProyectos.map(p => `
                            <tr>
                                <td>${p.Código || p.codigo || p.Codigo || ''}</td>
                                <td>${p['Nombre del proy'] || p['Nombre Proyecto'] || p.nombre_proyecto || p.Nombre || ''}</td>
                                <td>${p.Comuna || p.comuna || ''}</td>
                                <td>${p['Modal.'] || p.Modalidad || p.modalidad || ''}</td>
                                <td>${p.Familias || p['N°familias'] || p.Nfamilias || p.familias || ''}</td>
                                <td>${p.Año || p.ano || p.anio || ''}</td>
                            </tr>
                        `).join('');
                    }
                }
            });
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

    body.innerHTML = ''; // Limpiar
    body.appendChild(createTableMessage(`Cargando proyectos para: ${escapeHTML(entidadNombre)} (${escapeHTML(programa)})...`, 6));

    cloudGetProjects(programa, entidadNombre).then(proyectos => {
        // Ocultar barra de progreso
        if (progressBar) progressBar.classList.add('hidden');

        if (!Array.isArray(proyectos) || proyectos.length === 0) {
            const cols = programa === 'DS49' ? '6' : '5';
            body.innerHTML = '';
            body.appendChild(createTableMessage(`No se encontraron proyectos para "${escapeHTML(entidadNombre)}" en ${escapeHTML(programa)}.`, cols));
            return;
        }
        // Para todos los programas: Código, Nombre, Comuna, Modalidad, Familias, Año
        body.innerHTML = '';
        proyectos.forEach(p => {
            const row = createTableRow([
                p.Código || p.codigo || p.Codigo || p['Codigo proyecto'] || p.codigo_proyecto || '',
                p['Nombre Proyecto'] || p.nombre_proyecto || p.Nombre || '',
                p.Comuna || p.comuna || '',
                p.Modalidad || p.modalidad || '',
                p['N°familias'] || p.Nfamilias || p.familias || p.Familias || '',
                p.Año || p.ano || p.anio || ''
            ]);
            body.appendChild(row);
        });
    }).catch(err => {
        console.error('Error cargando proyectos:', err);
        // Ocultar barra de progreso
        if (progressBar) progressBar.classList.add('hidden');
        const cols = programa === 'DS49' ? '6' : '5';
        body.innerHTML = '';
        body.appendChild(createTableMessage('Error al cargar proyectos. Intente nuevamente.', cols, true));
    });
}

window.changeStage = function(stageNum) {
    currentStage = stageNum;

    // Limpiar listeners de tabla anterior para evitar conflictos
    const oldTbody = document.getElementById('evaluation-rows');
    if (oldTbody) {
        oldTbody.querySelectorAll('.score-input').forEach(input => {
            // Remover listeners registrados en managedListeners
            const found = managedListeners.findIndex(l => l.element === input && l.event === 'input');
            if (found >= 0) {
                input.removeEventListener(managedListeners[found].event, managedListeners[found].handler);
                managedListeners.splice(found, 1);
            }
        });
    }

    if (currentRole === 'admin') {
        const container = document.getElementById('admin-tabs');
        if (!container) {
            console.warn('Contenedor admin-tabs no encontrado');
            return;
        }
        container.innerHTML = '';

        let etapasDisponibles = [1,2,3,4,5,6];
        etapasDisponibles.forEach(i => {
            const btn = document.createElement('button');
            btn.className = `tab-button stage-with-tooltip ${currentStage === i ? 'active' : ''}`;

            // Agregar tooltip con descripción de la etapa
            const stageInfo = STAGES_METADATA[i];
            if (stageInfo) {
                // Mostrar nombre de etapa en botón
                btn.textContent = `${stageInfo.short}`;
                // Usar solo el título de STAGES_METADATA para el tooltip
                btn.setAttribute('data-tooltip-text', stageInfo.title);
                btn.style.position = 'relative';
            } else {
                btn.textContent = `Etapa ${i}`;
            }

            if (currentStage === i) {
                btn.style.backgroundColor = `var(--bg-stage-${i})`;
                btn.style.color = '#000';
                btn.style.border = '1px solid var(--primary-dark)';
            }
            btn.onclick = () => window.changeStage(i);
            container.appendChild(btn);
        });

        renderAdminView();
    } else {
        const tableCard = document.getElementById('table-card-container');
        if (tableCard) tableCard.style.backgroundColor = `var(--bg-stage-${currentStage})`;

        // NO actualizar desde servidor en cada cambio de etapa (ya se cargó en el login)
        // Esto evita que la tabla se renderice vacía y luego se recargue

        loadScoresFromActiveContext();

        // Volver a renderizar los badges de etapas para actualizar cuál está activo
        // IMPORTANTE: Filtrar por COBERTURA ACTUAL y ENTIDAD ACTUAL (no mostrar etapas de otras entidades)
        const asignsForCurrentCoveragAndEntity = allAsignacionesMapped.filter(a =>
            a.cobertura === currentCoverage && a.entidadNombre === window.currentSelectedEntity
        );
        if (asignsForCurrentCoveragAndEntity.length > 0) {
            renderStagesForEvaluator(asignsForCurrentCoveragAndEntity);
        }

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
        // 🔧 CRÍTICO: Convertir stage y score a números (Google Sheets retorna strings)
        const convertedRemoteScores = myRemoteScores.map(s => ({
            ...s,
            stage: parseInt(s.stage, 10),
            score: parseInt(s.score, 10)
        }));
        const updatedScores = [...convertedRemoteScores, ...localOnly];
        
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
                // No validar programa, permitir asignación directa por entidad seleccionada
                combinedCoverages.push({ provincia: t.provincia, programa: t.programa, entidadId: ent.id, entidadNombre: ent.name });
                matched = true;
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
                    // Convertir etapas a string usando | como separador (más seguro que comas)
                    const etapasStr = Array.isArray(p.etapas) ? p.etapas.join('|') : p.etapas;
                    store.put({ idAsig: `${rut}_${c.programa}_${c.provincia.replace(/\s+/g, '')}_${c.entidadId || 'none'}`, rut, programa: c.programa, provincia: c.provincia, entidadId: c.entidadId, entidadNombre: c.entidadNombre, etapas: etapasStr });
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
    // SIEMPRE sincronizar desde Google Sheets - la nube es la fuente de verdad
    Promise.all([
        cloudGet('asignaciones'),
        cloudGet('evaluadores'),
        cloudGet('scores')
    ]).then(([asignaciones, evaluadores, scores]) => {
        asignaciones = asignaciones || [];
        evaluadores = evaluadores || [];
        scores = scores || [];
        _renderMonitoringTableData(asignaciones, evaluadores, scores);
    }).catch(err => {
        console.warn('Error descargando desde Google Sheets, usando caché local:', err);
        getMultipleStores(['asignaciones', 'evaluadores', 'scores'], ([asignaciones, evaluadores, scores]) => {
            _renderMonitoringTableData(asignaciones, evaluadores, scores);
        });
    });
}

function _renderMonitoringTableData(asignaciones, evaluadores, scores) {
        const tbody = document.getElementById('admin-monitoring-rows');
        if (asignaciones.length === 0) { 
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center">No hay registros.</td></tr>`; 
            return; 
        }

        const evMap = {}; evaluadores.forEach(e => evMap[e.rut] = e.nombre);
        const scoresMap = {}; scores.forEach(s => {
            // Crear dos claves: una con entidad (nuevos scores) y una sin entidad (compatibilidad con antiguos)
            const kWithEntity = `${s.rutEvaluador}_${s.programa}_${s.provincia}_${s.entidad || ''}_${s.stage}`;
            const kWithoutEntity = `${s.rutEvaluador}_${s.programa}_${s.provincia}_${s.stage}`;

            if (!scoresMap[kWithEntity]) scoresMap[kWithEntity] = [];
            scoresMap[kWithEntity].push(s);

            // También guardar con clave sin entidad para compatibilidad hacia atrás
            if (!scoresMap[kWithoutEntity]) scoresMap[kWithoutEntity] = [];
            scoresMap[kWithoutEntity].push(s);
        });

        monitoringData = [];

        asignaciones.forEach(asig => {
            const nom = evMap[asig.rut] || asig.rut;
            const cobLabel = buildCoberturaLabel(asig.programa, asig.provincia, asig.entidadNombre);

            // Usar la función mejorada parseAsignacionEtapas que detecta valores corruptos
            const parsedEtapas = parseAsignacionEtapas(asig.etapas);

            parsedEtapas.forEach(stg => {
                // Buscar primero con entidad (nuevos scores), luego sin entidad (compatibilidad)
                const currentScores = scoresMap[`${asig.rut}_${asig.programa}_${asig.provincia}_${asig.entidadNombre}_${stg}`] ||
                                    scoresMap[`${asig.rut}_${asig.programa}_${asig.provincia}_${stg}`] || [];
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
    // Descargar SIEMPRE desde Google Sheets - la nube es la fuente de verdad
    cloudGet('scores').then(scores => {
        scores = scores || [];
        _processReportesData(callback, scores);
    }).catch(err => {
        console.warn('Error descargando scores desde Google Sheets, usando caché local:', err);
        getMultipleStores(['scores'], ([scores]) => {
            _processReportesData(callback, scores);
        });
    });
}

function _processReportesData(callback, scores) {
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
    // Sincronizar desde Google Sheets para verificar asignaciones actuales
    getMultipleStores(['asignaciones'], ([asignaciones]) => {
        const isAssigned = asignaciones.some(a => a.rut === rut);
        if (isAssigned) {
            alert('No se puede eliminar este evaluador porque tiene asignaciones activas.');
            return;
        }
        if (!confirm('¿Está seguro de eliminar este evaluador?')) return;
        const tx = dbInstance.transaction(['evaluadores'], 'readwrite');
        tx.objectStore('evaluadores').delete(rut);
        tx.oncomplete = () => populateAdminMatrix();
    }, true);
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
        tbody.innerHTML = filtered.map(item => `<tr><td><b>${item.evaluadorLabel}</b></td><td style="color:var(--primary-blue); font-weight:600;">${item.coberturaLabel}</td><td class="text-center">Etapa ${item.stageNum}</td><td class="text-center">${item.haEvaluado ? '<span class="badge-evaluado" style="background-color:var(--color-bueno);color:white;padding:2px 6px;border-radius:4px;font-size:0.8rem;">EVALUADO</span>' : '<span class="badge-no-evaluado" style="background-color:var(--color-malo);color:white;padding:2px 6px;border-radius:4px;font-size:0.8rem;">NO EVALUADO</span>'}</td><td class="text-center"><b>${item.average}</b></td><td class="text-center"><button class="btn btn-primary" style="padding:3px 6px; font-size:0.78rem;" onclick="openAuditModal('${item.rut}','${item.nombre}','${item.coberturaLabel}',${item.stageNum})">Ver Detalle</button><button class="btn btn-danger" style="padding:3px 6px; font-size:0.78rem; margin-left:4px;" onclick="deleteAsignacionWithOptions('${item.rut}','${item.nombre}','${item.coberturaLabel}',${item.stageNum},'${item.idAsig}')">Borrar</button></td></tr>`).join('');
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

async function populateAdminMatrix() {
    pendingAsignacionesStaging = []; adminTemporaryEntidades = [];

    // Agregar titileo mientras carga evaluadores
    const headerEvaluadores = document.querySelector('.matrix-col:has(#col-evaluadores) .matrix-header');
    if (headerEvaluadores) headerEvaluadores.classList.add('loading-blink');

    return new Promise((resolve) => {
        try {
            // IMPORTANTE: Descargar datos directamente del Google Sheet para asegurar datos actuales
            console.log('📥 Descargando datos desde Google Sheet...');
            Promise.all([
                cloudGet('asignaciones'),
                cloudGet('evaluadores'),
                cloudGet('entidades') // Nota: entidades se descargan completas aquí para la tabla directorio
            ]).then(([cloudAsignaciones, cloudEvaluadores, cloudEntidades]) => {
                console.log('✅ Datos desde cloud:', {
                    asignaciones: cloudAsignaciones?.length || 0,
                    evaluadores: cloudEvaluadores?.length || 0,
                    entidades: cloudEntidades?.length || 0
                });

                // Guardar en IndexedDB para caché local
                const tx = dbInstance.transaction(['asignaciones', 'evaluadores', 'entidades'], 'readwrite');

                if (cloudAsignaciones && cloudAsignaciones.length > 0) {
                    // Normalizar asignaciones antes de guardar
                    const normalizedAsignaciones = normalizeAsignaciones(cloudAsignaciones);
                    const aStore = tx.objectStore('asignaciones');
                    aStore.clear();
                    normalizedAsignaciones.forEach(a => aStore.put(a));
                    console.log('💾 Asignaciones guardadas en IndexedDB');
                }

                if (cloudEvaluadores && cloudEvaluadores.length > 0) {
                    const eStore = tx.objectStore('evaluadores');
                    eStore.clear();
                    cloudEvaluadores.forEach(e => eStore.put(e));
                    console.log('💾 Evaluadores guardados en IndexedDB');
                }

                if (cloudEntidades && cloudEntidades.length > 0) {
                    const entStore = tx.objectStore('entidades');
                    entStore.clear();
                    cloudEntidades.forEach(ent => entStore.put(ent));
                    console.log('💾 Entidades guardadas en IndexedDB');
                }

                tx.oncomplete = () => {
                    console.log('✅ Transacción IndexedDB completada');
                    // Cargar evaluadores y entidades desde IndexedDB (ya actualizados)
                    getMultipleStores(['evaluadores', 'entidades'], ([evaluadores, entidades]) => {
                        const colEvaluadores = document.getElementById('col-evaluadores');
                        if (colEvaluadores) {
                            renderEvaluadoresColumnWithSearch(evaluadores, colEvaluadores);
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

                        // Ahora renderizar tabla de monitoreo con datos sincronizados
                        renderMonitoringTable();

                        resolve();
                    });
                };

                tx.onerror = () => {
                    console.error('❌ Error en transacción IndexedDB:', tx.error);
                    resolve();
                };
            }).catch(error => {
                console.warn('⚠️ Error descargando datos desde cloud, usando caché local:', error);
                // Cargar desde caché local si falla la nube
                getMultipleStores(['evaluadores', 'entidades'], ([evaluadores, entidades]) => {
                    const colEvaluadores = document.getElementById('col-evaluadores');
                    if (colEvaluadores) {
                        renderEvaluadoresColumnWithSearch(evaluadores, colEvaluadores);
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

                    renderMonitoringTable();
                    resolve();
                });
            });
        } catch (error) {
            console.warn('⚠️ Error general:', error);
            resolve();
        }
    });
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

/**
 * Intenta leer la tabla 'scores' desde Google Sheets con un reintento automático.
 * Devuelve null SOLO si ambos intentos fallan, para que el llamador pueda abortar
 * un guardado en modo 'replace' en lugar de tratarlo como "tabla vacía".
 */
async function _fetchScoresWithRetry() {
    let result = await cloudGet('scores');
    if (result === null) {
        console.warn('⚠️ Primer intento de leer scores falló. Reintentando en 1.5s...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        result = await cloudGet('scores');
    }
    return result;
}

function saveEvaluatorScores(callback, options = {}) {
    const { silent = false } = options;

    // Verificar fecha límite actualizada (por si fue modificada después del login)
    dbGetAll('configuracion', (config) => {
        const req = config.find(c => c.clave === 'fecha_limite');
        if (req && req.valor) {
            const targetDate = parseSafeDate(req.valor);
            if (targetDate && new Date() > targetDate) {
                showToast('El plazo para evaluar ha expirado.', 'error');
                if (callback) callback(false);
                return;
            }
        }

        // Continuar con el guardado si la fecha es válida
        _continueWithSave();
    });

    function _continueWithSave() {
        if (deadlineExpired) {
            showToast('El plazo para evaluar ha expirado.', 'error');
            if (callback) callback(false);
            return;
        }

        if (!silent) {
            showToast('Guardando...', 'info');
        }

        // SINCRONIZAR: ejecutar calculateLiveScore() para que los inputs vacíos se reflejen en allMemoryScores
        calculateLiveScore();

        // Google Sheets es la ÚNICA fuente de datos
        // Filtrar: solo guardar scores con valor > 0 (scores con 0 = no evaluado)
        const horaEnvio = formatDateTime(new Date());
        console.log(`🔍 ANTES DE FILTRAR: allMemoryScores tiene ${allMemoryScores.length} registros totales`);
        console.log(`   - Usuario actual: ${currentUser.rut}`);
        console.log(`   - currentCoverage: "${currentCoverage}"`);
        console.log(`   - Registros de DS27 en allMemoryScores:`, allMemoryScores.filter(r => r.cobertura && r.cobertura.includes('DS27')).length);

        const ds27Records = allMemoryScores.filter(r => r.cobertura && r.cobertura.includes('DS27'));
        if (ds27Records.length > 0) {
            console.log(`   📌 Primer registro DS27:`, {
                cobertura: ds27Records[0].cobertura,
                entidad: ds27Records[0].entidad,
                programa: ds27Records[0].programa,
                provincia: ds27Records[0].provincia,
                itemId: ds27Records[0].itemId,
                score: ds27Records[0].score
            });
        }

        // Obtener valores ACTUALES de los inputs (lo que realmente está visible en la pantalla)
        const currentInputValues = {};
        const visibleItemIds = []; // NUEVO: rastrear TODOS los itemIds visibles, incluso con valor 0
        document.querySelectorAll('.score-input').forEach(input => {
            const id = input.getAttribute('data-id');
            visibleItemIds.push(id); // Guardar el itemId aunque esté vacío
            const val = parseInt(input.value, 10);
            if (!isNaN(val) && val > 0) {
                currentInputValues[id] = val;
            }
        });

        // CRÍTICO: Determinar la entidad a guardar basándose EN LOS DATOS VISIBLES, no en window.currentSelectedEntity
        // Si hay inputs visibles, determinar su entidad analizando qué está en pantalla
        let actualEntityToSave = window.currentSelectedEntity;
        console.log('DEBUG: window.currentSelectedEntity =', actualEntityToSave);

        if (visibleItemIds.length > 0) {
            // Hay inputs visibles. Buscar la entidad del primer input visible
            const firstVisibleItemId = visibleItemIds[0];
            console.log('DEBUG: firstVisibleItemId =', firstVisibleItemId);
            console.log('DEBUG: allMemoryScores.length =', allMemoryScores.length);

            const recordsWithVisibleItem = allMemoryScores.filter(r => {
                const match = r.itemId == firstVisibleItemId && // usar == para comparar número con string
                    r.rutEvaluador === currentUser.rut &&
                    r.cobertura === currentCoverage;
                if (match) {
                    console.log('DEBUG: Found matching record:', r.itemId, '==', firstVisibleItemId, ', entidad=', r.entidad);
                }
                return match;
            });

            if (recordsWithVisibleItem.length > 0) {
                actualEntityToSave = recordsWithVisibleItem[0].entidad;
                console.log('✅ Entidad determinada desde datos visibles:', actualEntityToSave);
            } else {
                console.log('⚠️ No se encontraron records. Usando window.currentSelectedEntity:', actualEntityToSave);
            }
        }

        // IMPORTANTE: Guardar TODOS los registros modificados del usuario actual en la cobertura actual
        // SIN limitar por una sola entidad, ya que el usuario pudo haber calificado múltiples entidades
        const recordsToSave = allMemoryScores
            .filter(r => {
                // Incluir si:
                // 1. Es del usuario actual
                // 2. Es de la cobertura actual
                // 3. Tiene un valor > 0 (ya guardado en allMemoryScores)
                // 4. Fue modificado desde la última sincronización (OPTIMIZACIÓN)
                // NOTA: NO filtramos por entidad para permitir guardar múltiples entidades
                const passes = r.rutEvaluador === currentUser.rut &&
                               r.cobertura === currentCoverage &&
                               r.score > 0 &&
                               r.modificado === true;

                if (passes) {
                    console.log(`📌 Record a guardar: entidad=${r.entidad}, itemId=${r.itemId}, score=${r.score}`);
                }
                return passes;
            });
            // NOTA: NO se re-sincroniza con currentInputValues aquí porque ese objeto está
            // indexado SOLO por itemId (sin entidad), lo que sobrescribía el score de TODOS
            // los registros con ese itemId sin importar la entidad. calculateLiveScore() ya
            // mantiene allMemoryScores actualizado en tiempo real por cada input, así que
            // memScore.score ya tiene el valor correcto para su propia entidad.

        console.log('ITEMS A GUARDAR (recordsToSave):');
        recordsToSave.forEach(r => console.log('  ', r.itemId, '= score:', r.score));

        const recordsToSaveWithDetails = recordsToSave.map(memScore => {
                console.log(`✅ Guardando: ${memScore.cobertura} - ${memScore.entidad} - ${memScore.itemId} = ${memScore.score}`);

                const activeAsig = allAsignacionesMapped.find(a =>
                    a.cobertura === memScore.cobertura && a.entidadNombre === memScore.entidad
                ) || allAsignacionesMapped.find(a => a.cobertura === memScore.cobertura) || {};

                // Si el registro ya existía (no es "pending_"), mantener idTx y timestampId originales
                // Si es nuevo ("pending_"), generar idTx definitivo pero mantener otros campos
                const isNewRecord = !memScore.idTx || memScore.idTx.startsWith('pending_');
                const newIdTx = isNewRecord ?
                    `${currentUser.rut}_${memScore.cobertura.replace(/[\s-]+/g, '')}_${memScore.entidad.replace(/[\s-]+/g, '')}_${memScore.stage}_${memScore.itemId}` :
                    memScore.idTx;
                const newTimestampId = isNewRecord ? Date.now().toString() : memScore.timestampId;

                return {
                    idTx: newIdTx,
                    timestampId: newTimestampId,
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
                };
            });

        console.log(`📊 recordsToSave tiene ${recordsToSave.length} registros para guardar`);

        // Guardar DIRECTAMENTE en Google Sheets - Usar currentCoverage como clave maestra
        // Primero descargar todos los scores actuales de Google Sheets
        _fetchScoresWithRetry().then(allGoogleScores => {
            // 🛑 CRÍTICO: Si cloudGet falló incluso tras reintentar (retorna null por timeout/error de red/HTTP),
            // NUNCA proceder con modo 'replace', ya que eso borraría TODA la tabla en Sheets
            // y la reemplazaría solo con los registros de esta sesión, destruyendo el resto.
            if (allGoogleScores === null) {
                console.error('❌ CRÍTICO: No se pudo leer scores desde Google Sheets tras reintentar. Abortando guardado para evitar pérdida de datos.');
                hideProgressBar();
                if (!silent) {
                    alert('❌ Error de conexión al guardar.\n\nNo se pudieron leer los datos actuales del servidor, por lo que el guardado fue CANCELADO para proteger la información existente.\n\nPor favor, verifique su conexión e intente guardar nuevamente.');
                }
                if (callback) callback(false);
                return;
            }

            // 1. Mantener scores de OTROS evaluadores
            const otherUsersScores = (allGoogleScores || []).filter(s => s.rutEvaluador !== currentUser.rut);

            // 2. Mantener scores del MISMO usuario pero de OTRAS COBERTURAS
            const otherCoverageScores = (allGoogleScores || []).filter(s => {
                return s.rutEvaluador === currentUser.rut && s.cobertura !== currentCoverage;
            });

            // 3. IMPORTANTE: Mantener scores del MISMO usuario, MISMA cobertura, pero que NO fueron modificados en esta sesión
            // Esto previene sobrescritura cuando el evaluador guarda en múltiples sesiones
            const existingScoresInCobertura = (allGoogleScores || []).filter(s => {
                if (s.rutEvaluador !== currentUser.rut || s.cobertura !== currentCoverage) {
                    return false;
                }
                // Verificar si este score ya existe en recordsToSave (por combinación de entidad + stage + itemId)
                const isBeingUpdated = recordsToSave.some(r =>
                    r.entidad === s.entidad &&
                    r.stage === parseInt(s.stage, 10) &&
                    r.itemId === s.itemId
                );
                // Si NO está siendo actualizado, mantenerlo
                return !isBeingUpdated;
            });

            console.log('ANTES DE GUARDAR');
            console.log('Cobertura:', currentCoverage);
            console.log('allGoogleScores TOTAL:', allGoogleScores ? allGoogleScores.length : 0);
            const ds27InGoogle = allGoogleScores ? allGoogleScores.filter(s => s.programa === 'DS27').length : 0;
            console.log('DS27 en Google Sheets AHORA:', ds27InGoogle);
            console.log('recordsToSave cantidad:', recordsToSave.length);
            console.log('existingScoresInCobertura cantidad (NO serán sobrescritos):', existingScoresInCobertura.length);

            // 4. Combinar: otros usuarios + otras coberturas + scores existentes no modificados + nuevos scores
            const finalScores = [...otherUsersScores, ...otherCoverageScores, ...existingScoresInCobertura, ...recordsToSave];
            const ds27InFinal = finalScores.filter(s => s.programa === 'DS27').length;
            console.log('DS27 en finalScores QUE SE GUARDARA:', ds27InFinal);
            console.log('finalScores TOTAL:', finalScores.length);

            // Guardar todo en Google Sheets (usar overwrite para reemplazar completamente)
            cloudSave('scores', finalScores, 'replace').then((success) => {
                console.log('cloudSave completado. Success:', success);
                hasUnsavedEvaluatorChanges = false;

                // Marcar registros como sincronizados (no modificados) después de guardar exitosamente
                if (success) {
                    recordsToSave.forEach(saved => {
                        const idx = allMemoryScores.findIndex(r =>
                            r.rutEvaluador === saved.rutEvaluador &&
                            r.cobertura === saved.cobertura &&
                            r.entidad === saved.entidad &&
                            r.itemId === saved.itemId &&
                            r.stage === saved.stage
                        );
                        if (idx >= 0) {
                            allMemoryScores[idx].modificado = false;
                        }
                    });
                }

                if (!silent) {
                    if (success) {
                        showToast('Guardado en Google Sheets', 'success');
                    } else {
                        showToast('Error en cloudSave', 'error');
                    }
                }

                // VERIFICAR que se guardó correctamente
                cloudGet('scores').then(verifyScores => {
                    const verifyCount = (verifyScores || []).length;
                    const finalCount = finalScores.length;
                    console.log('VERIF: finalScores=' + finalCount + ', GoogleSheets=' + verifyCount);

                    if (verifyCount !== finalCount && finalCount === 0) {
                        console.warn('ADVERTENCIA: Google Sheets NO se limpió, reintentando...');
                        cloudSave('scores', finalScores, 'replace');
                    }

                    loadScoresFromActiveContext();
                    renderEvaluatorView();
                    if (callback) callback(success);
                }).catch(() => {
                    loadScoresFromActiveContext();
                    renderEvaluatorView();
                    if (callback) callback(success);
                });
            });
        }).catch(err => {
            console.error('Error descargando scores:', err);
            showToast('❌ Error de conexión', 'error');
            if (callback) callback(false);
        });
    }
}

/**
 * Muestra un toast/notificación sin bloquear la interfaz
 */
function showToast(message, type = 'info') {
    // Crear elemento toast si no existe
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; font-family: "Segoe UI", sans-serif;';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const colors = {
        success: { bg: '#D4EDDA', border: '#28A745', text: '#155724' },
        error: { bg: '#F8D7DA', border: '#DC3545', text: '#721C24' },
        warning: { bg: '#FFF3CD', border: '#FFC107', text: '#856404' },
        info: { bg: '#D1ECF1', border: '#17A2B8', text: '#0C5460' }
    };

    const color = colors[type] || colors.info;
    toast.style.cssText = `
        background: ${color.bg};
        border-left: 4px solid ${color.border};
        color: ${color.text};
        padding: 12px 16px;
        border-radius: 4px;
        margin-bottom: 10px;
        animation: slideIn 0.3s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        max-width: 300px;
        word-wrap: break-word;
    `;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Agregar estilos de animación
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

function loadScoresFromActiveContext() {
    dbScores = {};
    // CRÍTICO: Normalizar entidad para comparación exacta (elimina espacios extras)
    const normalizeEntity = (str) => (str || '').trim();
    const currentEntity = normalizeEntity(window.currentSelectedEntity);

    const filteredScores = allMemoryScores.filter(r => {
        const rEntity = normalizeEntity(r.entidad);
        return r.cobertura === currentCoverage &&
               r.stage === currentStage &&
               rEntity === currentEntity;
    });

    console.log(`🔍 loadScoresFromActiveContext:`);
    console.log(`   - Cobertura actual: "${currentCoverage}"`);
    console.log(`   - Entidad actual: "${window.currentSelectedEntity}"`);
    console.log(`   - Etapa actual: ${currentStage} (tipo: ${typeof currentStage})`);
    console.log(`   - Total scores en memoria: ${allMemoryScores.length}`);

    // Debug: mostrar qué coberturas y etapas existen
    const uniqueCoberturasStages = new Set(allMemoryScores.map(r => `${r.cobertura}|stage:${r.stage}`));
    console.log(`   - Combinaciones cobertura+stage en memoria:`, Array.from(uniqueCoberturasStages).slice(0, 5));

    console.log(`   - Scores filtrados: ${filteredScores.length}`);

    filteredScores.forEach(r => {
        dbScores[r.itemId] = r.score;
        console.log(`   📌 itemId: "${r.itemId}" = score: ${r.score}`);
    });

    if (filteredScores.length === 0 && allMemoryScores.length > 0) {
        console.warn(`   ⚠️ NO hay scores que coincidan con cobertura="${currentCoverage}" + stage=${currentStage}`);
        console.log(`   📋 Primeros 5 scores en memoria:`, allMemoryScores.slice(0, 5).map(r => ({ cobertura: r.cobertura, stage: r.stage, itemId: r.itemId })));
    }

    console.log(`   📊 dbScores final:`, dbScores);
}

function renderEvaluatorView() {
    console.log(`📋 renderEvaluatorView() iniciando - Etapa: ${currentStage}, Cobertura: ${currentCoverage}`);
    console.log(`   - dbScores:`, dbScores);

    const titleLabel = document.getElementById('table-stage-title');
    const descLabel = document.getElementById('table-stage-desc');

    if (STAGES_METADATA[currentStage]) {
        titleLabel.textContent = STAGES_METADATA[currentStage].title;
        descLabel.textContent = STAGES_METADATA[currentStage].desc;
    }

    document.getElementById('table-stage-footer-label').textContent = `PRECALIFICACIÓN ETAPA ${currentStage}`;

    const tbody = document.getElementById('evaluation-rows');
    if (!tbody) {
        console.error('❌ tbody evaluation-rows no encontrado');
        return;
    }
    console.log(`   - tbody encontrado, renderizando...`);

    // Limpiar tabla anterior para evitar inputs fantasma de etapas previas
    tbody.innerHTML = '';

    // Usar DEFAULT_ITEMS si no hay ítems cargados desde la BD
    const itemsToUse = (dbItems && dbItems.length > 0) ? dbItems : DEFAULT_ITEMS;

    // Obtener todos los ítems de la etapa actual, ordenados por id
    const stageItems = itemsToUse
        .filter(i => parseInt(i.stage, 10) === parseInt(currentStage, 10))
        .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

    if (stageItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">No hay ítems configurados para la Etapa ${currentStage}.</td></tr>`;
        return;
    }

    const rowsHtml = stageItems.map((item, idx) => {
        const score = dbScores[item.id] !== undefined ? dbScores[item.id] : "";
        if (idx < 3) {
            console.log(`📋 Item: "${item.id}" (tipo: ${typeof item.id}) → score: ${score} (de dbScores: ${dbScores[item.id]})`);
        }
        return `
            <tr style="height: 30px !important; padding: 0 !important; margin: 0 !important;">
                <td class="cell-index bold-text" style="padding: 1px 12px !important; margin: 0 !important; line-height: 1 !important; height: 30px !important; font-size: 0.95rem !important;">${item.id}</td>
                <td class="cell-desc" style="padding: 1px 12px !important; margin: 0 !important; line-height: 1 !important; height: 30px !important; font-size: 0.9rem !important;">${item.text}</td>
                <td colspan="3" class="cell-score-input" style="padding: 1px 12px !important; margin: 0 !important; line-height: 1 !important; height: 30px !important;">
                    <input type="number" class="score-input" data-id="${item.id}" min="0" max="100" step="1" value="${score}" ${deadlineExpired ? 'disabled' : ''} placeholder="0" inputmode="numeric" style="height: 28px !important; padding: 2px !important; font-size: 0.9rem !important;">
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = rowsHtml.join('');

    document.querySelectorAll('.score-input').forEach(input => {
        addManagedListener(input, 'input', () => { hasUnsavedEvaluatorChanges = true; calculateLiveScore(); });
        // Resaltar la fila completa mientras se está calificando ese ítem
        addManagedListener(input, 'focus', () => {
            const row = input.closest('tr');
            if (row) row.classList.add('row-active');
        });
        addManagedListener(input, 'blur', () => {
            const row = input.closest('tr');
            if (row) row.classList.remove('row-active');
        });
    });

    calculateLiveScore();
    initializeDeadlineTimer();
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

    // CRÍTICO: Normalizar entidad para comparación exacta
    const normalizeEntity = (str) => (str || '').trim();
    const currentEntity = normalizeEntity(window.currentSelectedEntity);

    inputs.forEach(input => {
        let val = parseInt(input.value, 10);

        // Solo se admiten números enteros (0-100): si se escribió un decimal
        // (ej. "1.2" o "99.7"), sincronizar el campo visible con el entero
        // truncado para que lo mostrado coincida siempre con lo guardado.
        if (!isNaN(val) && input.value !== String(val)) {
            input.value = val;
        }

        const id = input.getAttribute('data-id');
        const existingIdx = allMemoryScores.findIndex(r => {
            const rEntity = normalizeEntity(r.entidad);
            return r.cobertura === currentCoverage &&
                   r.itemId === id &&
                   parseInt(r.stage,10) === currentStage &&
                   rEntity === currentEntity;
        });

        // Si está vacío o es NaN, eliminar del registro (para que se borre en Google Sheets)
        if (isNaN(val)) {
            delete dbScores[id];
            if (existingIdx >= 0) allMemoryScores.splice(existingIdx, 1);
            return;
        }

        // Si es 0, también eliminar (usuario lo borró)
        if (val === 0) {
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
            allMemoryScores[existingIdx].modificado = true;  // Marcar como cambiado
        } else {
            const activeAsig = allAsignacionesMapped.find(a =>
                a.cobertura === currentCoverage && a.entidadNombre === window.currentSelectedEntity
            ) || {};
            const entidadName = activeAsig.entidadNombre || window.currentSelectedEntity || '';
            allMemoryScores.push({
                // CRÍTICO: Incluir entidad en el idTx para diferenciar scores de diferentes entidades
                idTx: `pending_${currentUser.rut}_${currentCoverage.replace(/[\s-]+/g, '')}_${entidadName.replace(/[\s-]+/g, '')}_${id}`,
                timestampId: Date.now().toString(),
                rutEvaluador: currentUser.rut,
                nombreEvaluador: currentUser.nombre,
                programa: activeAsig.programa || '',
                provincia: activeAsig.provincia || '',
                entidad: entidadName,
                cobertura: currentCoverage,
                stage: currentStage,
                itemId: id,
                score: val,
                hora: formatDateTime(new Date()),
                modificado: true  // Nuevos registros siempre marcados como cambiados
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

    updateEntityAverage();
    refreshEntityTabsBadges();
}

function updateEntityAverage() {
    const avgBox = document.getElementById('entity-average-box');
    if (!avgBox) return;

    // Calcular promedio de cada etapa asignada
    const stageAverages = {};
    allMemoryScores
        .filter(r => r.cobertura === currentCoverage && r.entidad === window.currentSelectedEntity)
        .forEach(r => {
            if (!stageAverages[r.stage]) {
                stageAverages[r.stage] = { total: 0, count: 0 };
            }
            stageAverages[r.stage].total += r.score;
            stageAverages[r.stage].count++;
        });

    // Calcular promedio de los promedios de etapas
    const stageValues = Object.values(stageAverages);
    if (stageValues.length === 0) {
        avgBox.textContent = '0';
        return;
    }

    const stageAverageValues = stageValues.map(s => Math.round(s.total / s.count));
    const entityAverage = Math.round(stageAverageValues.reduce((a, b) => a + b, 0) / stageAverageValues.length);
    avgBox.textContent = entityAverage;
}

let deadlineTimerInterval = null;

function initializeDeadlineTimer() {
    // Limpiar intervalo previo si existe
    if (deadlineTimerInterval) {
        clearInterval(deadlineTimerInterval);
        deadlineTimerInterval = null;
    }

    if (!savedDeadlineISO) {
        console.log('⏱️ No hay deadline configurado');
        const timerElement = document.getElementById('deadline-timer');
        if (timerElement) timerElement.style.display = 'none';
        return;
    }

    const timerElement = document.getElementById('deadline-timer');
    if (!timerElement) {
        console.error('❌ Elemento deadline-timer no encontrado');
        return;
    }

    // Mostrar el cronómetro
    timerElement.style.display = 'block';

    // Actualizar inmediatamente
    updateDeadlineDisplay();

    // Actualizar cada segundo
    deadlineTimerInterval = setInterval(updateDeadlineDisplay, 1000);
}

function updateDeadlineDisplay() {
    const targetDate = parseSafeDate(savedDeadlineISO);
    if (!targetDate) {
        console.warn('⏱️ Deadline inválido:', savedDeadlineISO);
        return;
    }

    const now = new Date();
    const diff = targetDate - now;

    const timerDisplay = document.getElementById('timer-display');
    const timerElement = document.getElementById('deadline-timer');

    if (diff <= 0) {
        // Deadline expirado
        if (!deadlineExpired) {
            deadlineExpired = true;
            console.warn('⏰ DEADLINE EXPIRADO - Congelando inputs');
            freezeAllInputs();
        }
        if (timerDisplay) timerDisplay.textContent = '00-00:00';
        if (timerElement) timerElement.style.color = '#D32F2F'; // Rojo
        return;
    }

    // Calcular DD-HH:MM
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const display = `${String(days).padStart(2, '0')}-${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    if (timerDisplay) timerDisplay.textContent = display;

    // Cambiar color según tiempo restante
    if (timerElement) {
        if (diff < 3600000) { // Menos de 1 hora
            timerElement.style.color = '#F57C00'; // Naranja
        } else if (diff < 86400000) { // Menos de 1 día
            timerElement.style.color = '#FBC02D'; // Amarillo
        } else {
            timerElement.style.color = 'var(--primary-dark)'; // Normal
        }
    }
}

function freezeAllInputs() {
    // Deshabilitar todos los inputs de calificación
    document.querySelectorAll('.score-input').forEach(input => {
        input.disabled = true;
        input.style.opacity = '0.6';
        input.style.cursor = 'not-allowed';
    });

    // Mostrar mensaje de alerta
    showToast('⏰ Tiempo de evaluación agotado - Formulario congelado', 'warning');
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
        etapas: etapas.join('|')
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
                    <input type="number" class="historico-score-input" data-id="${item.id}" min="0" max="100" step="1" value="${score}" placeholder="0">
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

        // Solo se admiten números enteros (0-100): sincronizar el campo visible
        // con el entero truncado si se escribió un decimal (ej. "1.2" -> "1").
        if (!isNaN(val) && input.value !== String(val)) {
            input.value = val;
        }

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
    // Guardar automáticamente sin mostrar notificaciones (será silencioso)
    saveEvaluatorScores(() => {
        continuarExportPDF();
    }, { silent: true });
}

function continuarExportPDF() {
    const exportDate = formatDateTime(new Date());
    const printContainer = document.createElement('div');
    printContainer.id = 'pdf-print-container';

    let contentHtml = `
        <div style="text-align: center; margin-bottom: 10px; font-weight: bold; font-size: 0.9rem;">
            RESPALDO DE PRECALIFICACIONES POR ETAPA
        </div>
    `;

    // Agrupar asignaciones por entidad
    const entidadesMap = {};
    allAsignacionesMapped.forEach(asig => {
        const entidad = asig.entidadNombre || "Sin especificar";
        if (!entidadesMap[entidad]) {
            entidadesMap[entidad] = [];
        }
        entidadesMap[entidad].push(asig);
    });

    // Procesar cada entidad
    Object.keys(entidadesMap).forEach((nombreEntidad, entidadIdx) => {
        const entidadAsignaciones = entidadesMap[nombreEntidad];

        // Encabezado de entidad separado y destacado
        contentHtml += `
            <div style="page-break-inside: avoid; margin-top: 20px; margin-bottom: 10px; padding: 10px; background: linear-gradient(135deg, #25306B 0%, #006BB9 100%); color: white; border-radius: 4px; border-left: 8px solid #FFC107;">
                <div style="font-size: 1rem; font-weight: bold; margin-bottom: 4px;">🏢 ENTIDAD: ${nombreEntidad}</div>
                <div style="font-size: 0.8rem;">Evaluador: ${currentUser.nombre} | Fecha: ${exportDate}</div>
            </div>
        `;

        // Procesar todas las etapas de esta entidad
        entidadAsignaciones.forEach(asig => {
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
            const stageItems = dbItems.filter(i => parseInt(i.stage, 10) === parseInt(stg, 10));
            let totalScore = 0, countScore = 0;

            const rowsHtml = stageItems.map((item, idx) => {
                const rec = stageRecords.find(r => r.itemId === item.id);
                const val = rec && rec.score !== undefined ? rec.score : "-";
                if (val !== "-") { totalScore += parseInt(val, 10); countScore++; }

                let cellColor = "#FFF";
                if (val !== "-") {
                    if (val >= 80) cellColor = "#D4EDDA"; // Verde BUENO
                    else if (val >= 50) cellColor = "#FFF3CD"; // Amarillo ACEPTABLE
                    else cellColor = "#F8D7DA"; // Rojo MALO
                }

                return `
                    <tr>
                        <td style="padding: 4px; border: 1px solid #000; width: 5%; text-align: center; font-size: 0.75rem; font-weight: bold;">${item.id}</td>
                        <td style="padding: 4px; border: 1px solid #000; width: 85%; font-size: 0.75rem;">${item.text}</td>
                        <td style="padding: 4px; border: 1px solid #000; width: 10%; text-align: center; font-weight: bold; background-color: ${cellColor}; font-size: 0.75rem;">${val}</td>
                    </tr>
                `;
            }).join('');

            const finalAvg = countScore > 0 ? Math.round(totalScore / countScore) : 0;
            const status = getStatusInfo(finalAvg);
            const statusText = countScore > 0 ? status.text : "---";
            let headerBgColor = "#D4EDDA";
            if (statusText === "ACEPTABLE") headerBgColor = "#FFF3CD";
            else if (statusText === "MALO") headerBgColor = "#F8D7DA";

            const [programa, provincia] = asig.cobertura.split(' - ');
            const entidad = asig.entidadNombre || "No especificada";

            contentHtml += `
                <table style="width: 100%; margin-bottom: 15px; border-collapse: collapse; page-break-inside: avoid; font-size: 0.75rem;">
                    <thead>
                        <tr style="background-color: #25306B; color: white;">
                            <th colspan="3" style="padding: 6px; border: 1px solid #000; text-align: left; font-weight: bold;">
                                ETAPA ${stg}. ${meta.title}
                            </th>
                        </tr>
                        <tr style="background-color: #F0F0F0;">
                            <td style="padding: 4px; border: 1px solid #000; width: 25%;"><strong>Entidad:</strong> ${entidad}</td>
                            <td style="padding: 4px; border: 1px solid #000; width: 35%;"><strong>Programa:</strong> ${programa || "Sin asignar"}</td>
                            <td style="padding: 4px; border: 1px solid #000; width: 40%;"><strong>Provincia:</strong> ${provincia || "Sin asignar"}</td>
                        </tr>
                        <tr style="background-color: #F5F7FA;">
                            <th style="padding: 4px; border: 1px solid #000; width: 5%; text-align: center;">Ítem</th>
                            <th style="padding: 4px; border: 1px solid #000; width: 85%; text-align: left;">Criterio de Evaluación</th>
                            <th style="padding: 4px; border: 1px solid #000; width: 10%; text-align: center;">Nota</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                    <tfoot>
                        <tr style="background-color: ${headerBgColor}; font-weight: bold;">
                            <td colspan="2" style="padding: 6px; border: 1px solid #000; text-align: right;">PRECALIFICACIÓN ETAPA ${stg}:</td>
                            <td style="padding: 6px; border: 1px solid #000; text-align: center;">${countScore > 0 ? finalAvg : '-'}</td>
                        </tr>
                        <tr style="background-color: ${headerBgColor}; font-weight: bold;">
                            <td colspan="3" style="padding: 6px; border: 1px solid #000; text-align: center;">ESTADO: ${statusText}</td>
                        </tr>
                    </tfoot>
                </table>
            `;
            });
        });
    });

    printContainer.innerHTML = contentHtml;
    document.body.appendChild(printContainer);

    // Configurar opciones de html2pdf
    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `Respaldo_Precalificaciones_${currentUser.rut}_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Mostrar barra de progreso
    showProgressBar('Generando PDF...');

    // Generar PDF con progreso
    html2pdf()
        .set(opt)
        .from(printContainer)
        .toPdf()
        .get('pdf')
        .save();

    // Ocultar progreso después de guardar
    setTimeout(() => {
        hideProgressBar();
        notificationSystem.show('pdf-export', '✅ PDF exportado correctamente', 'success');

        // Auto-ocultar mensaje después de 2 segundos
        setTimeout(() => {
            notificationSystem.remove('pdf-export');
        }, 2000);
    }, 500);

    document.body.removeChild(printContainer);
}
