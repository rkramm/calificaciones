/**
 * ================= CÓDIGO PARA GOOGLE APPS SCRIPT =================
 *
 * INSTRUCCIONES:
 * 1. Abre tu Google Apps Script: script.google.com
 * 2. Ve a Libraries (icono de libros)
 * 3. Agreg ID: MWASUMVf7KeTIZ4bu2xAXQ_11SVRPZGN93UE7j2Ro8KoRm8h5IhIHqN3I
 * 4. Alias: Bcrypt
 * 5. Copia TODO el código debajo a tu Code.gs
 * 6. Adapta según tu estructura actual
 *
 * SECCIONES:
 * A) Funciones BCRYPT (nuevas)
 * B) Funciones CSRF (nuevas)
 * C) doPost() actualizado (MODIFICAR EXISTENTE)
 *
 * ===================================================================
 */

// ========== A) FUNCIONES BCRYPT ==========

/**
 * NUEVA: Hashear contraseña al guardar admin
 * Llamar UNA sola vez: setAdminPasswordBcrypt('tu_contraseña')
 */
function setAdminPasswordBcrypt(plainPassword) {
    if (!plainPassword || plainPassword.length < 6) {
        throw new Error("Contraseña mínimo 6 caracteres");
    }

    const hash = Bcrypt.hashPassword(plainPassword);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('configuracion');

    if (!sheet) {
        sheet = ss.insertSheet('configuracion');
    }

    // Limpiar y escribir hash
    const range = sheet.getRange('A1:C2');
    range.clearContent();
    range.setValues([
        ['clave', 'valor', 'timestamp'],
        ['clave_admin', hash, new Date().toISOString()]
    ]);

    console.log('✅ Admin password hasheado y guardado');
    return { success: true, message: 'Contraseña guardada con bcrypt' };
}

/**
 * NUEVA: Validar contraseña contra hash
 */
function validateAdminPasswordBcrypt(plainPassword, storedHash) {
    try {
        return Bcrypt.comparePassword(plainPassword, storedHash);
    } catch (e) {
        console.error('Error validando:', e);
        return false;
    }
}

/**
 * NUEVA: Obtener configuración (incluye hash, no plaintext)
 */
function getConfigBcrypt() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('configuracion');

    if (!sheet) {
        return [];
    }

    const data = sheet.getDataRange().getValues();
    return data.slice(1).map(row => ({
        clave: row[0],
        valor: row[1],
        timestamp: row[2]
    }));
}

// ========== B) FUNCIONES CSRF ==========

const csrfTokenStore = {};
const CSRF_TOKEN_EXPIRY_MS = 3600000; // 1 hora

/**
 * NUEVA: Generar token CSRF único
 */
function generateServerCSRFToken(sessionId) {
    const random = Utilities.getUuid();
    const timestamp = Date.now().toString();
    const token = Utilities.base64Encode(random + timestamp);

    csrfTokenStore[sessionId] = {
        token: token,
        timestamp: Date.now()
    };

    return token;
}

/**
 * NUEVA: Validar token CSRF
 */
function validateCSRFToken(token, sessionId) {
    if (!token || !sessionId) return false;

    const stored = csrfTokenStore[sessionId];
    if (!stored) return false;

    // Token debe coincidir
    if (token !== stored.token) return false;

    // No expirado
    if (Date.now() - stored.timestamp > CSRF_TOKEN_EXPIRY_MS) {
        delete csrfTokenStore[sessionId];
        return false;
    }

    return true;
}

/**
 * NUEVA: Limpiar tokens expirados
 */
function cleanExpiredCSRFTokens() {
    const now = Date.now();
    Object.keys(csrfTokenStore).forEach(sessionId => {
        const stored = csrfTokenStore[sessionId];
        if (now - stored.timestamp > CSRF_TOKEN_EXPIRY_MS) {
            delete csrfTokenStore[sessionId];
        }
    });
}

// ========== C) doPost() - MODIFICAR EXISTENTE ==========

/**
 * MODIFICAR tu función doPost() existente:
 *
 * EJEMPLO DE ANTES:
 * function doPost(e) {
 *     const body = JSON.parse(e.postData.contents);
 *     const { table, data } = body;
 *     // ... procesar datos
 * }
 *
 * CAMBIAR A:
 */
function doPost(e) {
    try {
        const body = JSON.parse(e.postData.contents);
        const { table, data, mode, clientVersion, csrfToken, sessionId } = body;

        // ===== VALIDACIÓN CSRF =====
        // Rechazar si CSRF token no es válido
        if (!csrfToken || !validateCSRFToken(csrfToken, sessionId)) {
            return ContentService.createTextOutput(
                JSON.stringify({
                    success: false,
                    error: 'CSRF token inválido o expirado'
                })
            ).setMimeType(ContentService.MimeType.JSON);
        }

        // ===== RESTO DE TU LÓGICA AQUÍ =====
        // Tu código existente de guardado, sincronización, etc.

        // Ejemplo básico:
        if (!table || !data) {
            return ContentService.createTextOutput(
                JSON.stringify({
                    success: false,
                    error: 'Parámetros faltantes'
                })
            ).setMimeType(ContentService.MimeType.JSON);
        }

        // TODO: Agregar tu lógica de guardado aquí
        // ...

        return ContentService.createTextOutput(
            JSON.stringify({
                success: true,
                message: 'Datos guardados correctamente'
            })
        ).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        console.error('Error en doPost:', error);
        return ContentService.createTextOutput(
            JSON.stringify({
                success: false,
                error: error.message
            })
        ).setMimeType(ContentService.MimeType.JSON);
    }
}

// ========== D) doGet() - MODIFICAR EXISTENTE ==========

/**
 * MODIFICAR tu función doGet() existente:
 * Agregar ANTES de tu lógica existente:
 */
function doGet(e) {
    try {
        const action = e.parameter.action;
        const sessionId = e.parameter.sessionId;

        // ===== NUEVO: Obtener CSRF token =====
        if (action === 'getCSRFToken') {
            if (!sessionId) {
                return ContentService.createTextOutput(
                    JSON.stringify({ error: 'sessionId requerido' })
                ).setMimeType(ContentService.MimeType.JSON);
            }

            const csrfToken = generateServerCSRFToken(sessionId);
            return ContentService.createTextOutput(
                JSON.stringify({ csrfToken: csrfToken })
            ).setMimeType(ContentService.MimeType.JSON);
        }

        // ===== NUEVO: Obtener configuración (incluye hash bcrypt) =====
        if (action === 'configuracion' || action === 'getConfig') {
            const config = getConfigBcrypt();
            return ContentService.createTextOutput(
                JSON.stringify(config)
            ).setMimeType(ContentService.MimeType.JSON);
        }

        // ===== RESTO DE TU LÓGICA AQUÍ =====
        // Tu código existente de getProjects, getAsignaciones, etc.
        // ...

        return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);

    } catch (error) {
        console.error('Error en doGet:', error);
        return ContentService.createTextOutput(
            JSON.stringify({ error: error.message })
        ).setMimeType(ContentService.MimeType.JSON);
    }
}

// ========== E) FUNCIONES INICIALES (ejecutar UNA VEZ) ==========

/**
 * EJECUTAR ESTA FUNCIÓN UNA SOLA VEZ:
 *
 * 1. Ve a Apps Script
 * 2. Copia esta función al final
 * 3. Click en "Run" > setupBcryptInitial
 * 4. Autoriza permisos si pide
 * 5. Revisa Log > ✅ "Setup completado"
 */
function setupBcryptInitial() {
    // ⚠️ CAMBIAR ESTO A TU CONTRASEÑA REAL
    const adminPassword = "tu_contraseña_super_segura_aqui";

    try {
        setAdminPasswordBcrypt(adminPassword);
        console.log('✅ Setup completado - Admin password hasheado');
        console.log('⚠️ Borra esta contraseña del log');
    } catch (e) {
        console.error('❌ Error en setup:', e.message);
    }
}

// ========== F) LIMPIAR CACHE DE SESIÓN (ejecutar manualmente) ==========

/**
 * Ejecutar ocasionalmente para limpiar tokens expirados:
 * Run > cleanupSessions
 */
function cleanupSessions() {
    cleanExpiredCSRFTokens();
    console.log('✅ Tokens CSRF expirados limpiados');
}

/**
 * ===================================================================
 * RESUMEN DE CAMBIOS NECESARIOS:
 *
 * 1. ✅ Agregar librería Bcrypt (MWASUMVf7...)
 * 2. ✅ Copiar TODO este código a Code.gs
 * 3. ✅ Ejecutar: setupBcryptInitial() (UNA SOLA VEZ)
 * 4. ✅ Modificar doPost() existente: agregar validación CSRF
 * 5. ✅ Modificar doGet() existente: agregar getCSRFToken y getConfig
 * 6. ✅ Test: Login debe funcionar con bcrypt
 *
 * VERIFICACIÓN:
 * - Log debe mostrar: "✅ Setup completado"
 * - Login en navegador: Debe funcionar normalmente
 * - Rate limiting: Debe seguir funcionando
 * - CSRF token: Debe incluirse en POST
 *
 * ===================================================================
 */
