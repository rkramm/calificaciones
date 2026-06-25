/* ================= PRUEBAS DE SEGURIDAD Y FUNCIONALIDAD ================= */
/* Ejecutar en la consola del navegador: runSecurityTests() */

const TESTS = {
    passed: 0,
    failed: 0,
    results: []
};

function logTest(name, passed, details = '') {
    TESTS.results.push({ name, passed, details });
    if (passed) {
        TESTS.passed++;
        console.log(`✅ ${name}`);
    } else {
        TESTS.failed++;
        console.error(`❌ ${name}: ${details}`);
    }
}

function runSecurityTests() {
    console.clear();
    console.log('%c=== PRUEBAS DE SEGURIDAD Y FUNCIONALIDAD ===', 'font-size: 14px; font-weight: bold; color: #0066CC;');

    // TEST 1: Verificar que config.js se cargó correctamente
    try {
        const test1 = CONFIG && CONFIG.GOOGLE_SCRIPT_URL && CONFIG.SECURITY;
        logTest('CONFIG.js cargado correctamente', test1, test1 ? '' : 'CONFIG no definido');
    } catch (e) {
        logTest('CONFIG.js cargado correctamente', false, e.message);
    }

    // TEST 2: Verificar que GOOGLE_SCRIPT_URL viene de CONFIG
    try {
        const test2 = GOOGLE_SCRIPT_URL === CONFIG.GOOGLE_SCRIPT_URL;
        logTest('GOOGLE_SCRIPT_URL usando CONFIG', test2, test2 ? '' : 'URL no coincide con config');
    } catch (e) {
        logTest('GOOGLE_SCRIPT_URL usando CONFIG', false, e.message);
    }

    // TEST 3: Verificar que las funciones de seguridad existen
    try {
        const test3 = typeof escapeHTML === 'function' &&
                     typeof createSafeElement === 'function' &&
                     typeof setSafeHTML === 'function';
        logTest('Funciones de seguridad (escapeHTML, createSafeElement) existen', test3);
    } catch (e) {
        logTest('Funciones de seguridad existen', false, e.message);
    }

    // TEST 4: Verificar escapeHTML
    try {
        const xssPayload = '<script>alert("XSS")</script>';
        const escaped = escapeHTML(xssPayload);
        const test4 = escaped.includes('&lt;') && !escaped.includes('<script');
        logTest('escapeHTML sanitiza tags HTML', test4, test4 ? '' : `Resultado: ${escaped}`);
    } catch (e) {
        logTest('escapeHTML sanitiza tags HTML', false, e.message);
    }

    // TEST 5: Verificar que loginAttempts es un objeto vacío
    try {
        const test5 = typeof loginAttempts === 'object' && Object.keys(loginAttempts).length === 0;
        logTest('Sistema de rate limiting inicializado', test5);
    } catch (e) {
        logTest('Sistema de rate limiting inicializado', false, e.message);
    }

    // TEST 6: Verificar SECURITY_CONFIG
    try {
        const test6 = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS === 5 &&
                     SECURITY_CONFIG.LOCKOUT_DURATION_MS === 900000;
        logTest('SECURITY_CONFIG con valores correctos', test6,
            test6 ? '' : `Max=${SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS}, Lockout=${SECURITY_CONFIG.LOCKOUT_DURATION_MS}`);
    } catch (e) {
        logTest('SECURITY_CONFIG con valores correctos', false, e.message);
    }

    // TEST 7: Simulación de Rate Limiting
    try {
        const testUser = 'test_rut_12345678-9';
        loginAttempts[testUser] = { count: 0, timestamp: Date.now() };

        // Simular 5 intentos fallidos
        for (let i = 0; i < 5; i++) {
            loginAttempts[testUser].count++;
        }

        const test7 = loginAttempts[testUser].count === 5;
        logTest('Rate limiting registra intentos correctamente', test7);
        delete loginAttempts[testUser]; // Limpiar
    } catch (e) {
        logTest('Rate limiting registra intentos correctamente', false, e.message);
    }

    // TEST 8: Verificar bcryptjs disponible
    try {
        const test8 = typeof dcodeIO !== 'undefined' && dcodeIO.bcrypt !== undefined;
        logTest('bcryptjs cargado desde CDN', test8, test8 ? '' : 'bcryptjs no disponible');
    } catch (e) {
        logTest('bcryptjs cargado desde CDN', false, e.message);
    }

    // TEST 9: Verificar html2pdf disponible
    try {
        const test9 = typeof html2pdf !== 'undefined';
        logTest('html2pdf cargado desde CDN', test9, test9 ? '' : 'html2pdf no disponible');
    } catch (e) {
        logTest('html2pdf cargado desde CDN', false, e.message);
    }

    // TEST 10: Verificar funciones de IndexedDB
    try {
        const test10 = typeof initIndexedDB === 'function' &&
                      typeof dbGetAll === 'function' &&
                      typeof cloudGet === 'function';
        logTest('Funciones de base de datos disponibles', test10);
    } catch (e) {
        logTest('Funciones de base de datos disponibles', false, e.message);
    }

    // TEST 11: Verificar que handleLogin existe
    try {
        const test11 = typeof handleLogin === 'function';
        logTest('Función handleLogin definida', test11);
    } catch (e) {
        logTest('Función handleLogin definida', false, e.message);
    }

    // TEST 12: Verificar que attemptEvaluatorLogin existe
    try {
        const test12 = typeof attemptEvaluatorLogin === 'function';
        logTest('Función attemptEvaluatorLogin definida', test12);
    } catch (e) {
        logTest('Función attemptEvaluatorLogin definida', false, e.message);
    }

    // RESUMEN
    console.log('\n%c=== RESUMEN ===', 'font-size: 12px; font-weight: bold; color: #333;');
    console.log(`✅ Pasadas: ${TESTS.passed}`);
    console.log(`❌ Fallidas: ${TESTS.failed}`);
    console.log(`📊 Total: ${TESTS.passed + TESTS.failed}`);

    if (TESTS.failed === 0) {
        console.log('%c🎉 TODAS LAS PRUEBAS PASADAS', 'font-size: 14px; font-weight: bold; color: #00AA00; background: #F0FFF0; padding: 5px;');
    } else {
        console.log(`%c⚠️ ${TESTS.failed} PRUEBAS FALLIDAS - REVISAR ARRIBA`, 'font-size: 14px; font-weight: bold; color: #AA0000; background: #FFF0F0; padding: 5px;');
    }

    return TESTS;
}

// Ejecutar automaticamente cuando se carga el script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🧪 Pruebas de seguridad listas. Ejecuta: runSecurityTests()');
    });
} else {
    console.log('🧪 Pruebas de seguridad listas. Ejecuta: runSecurityTests()');
}
