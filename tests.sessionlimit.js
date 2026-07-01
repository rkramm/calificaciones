/**
 * PRUEBA DE LÍMITE DE SESIONES
 * Verifica que máximo 6 usuarios pueden estar conectados simultáneamente
 */

const SESSION_LIMIT_TEST_CONFIG = {
    maxUsuarios: 6,
    intentoLoginExtra: 7 // Intento de 7mo usuario debe fallar
};

/**
 * Test de límite de sesiones
 * Simula múltiples usuarios intentando conectarse (FRONTEND LIMIT)
 */
function runSessionLimitTest() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║        PRUEBA DE LÍMITE DE SESIONES SIMULTÁNEAS (LOCAL)     ║');
    console.log('║        Verificar máximo ' + SESSION_LIMIT_TEST_CONFIG.maxUsuarios + ' usuarios conectados        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const resultados = {
        loginsExitosos: 0,
        loginsRechazados: 0,
        loginsIntentados: 0,
        detalles: []
    };

    // Intentar conectar 7 usuarios (6 deberían pasar, 1 debe ser rechazado)
    for (let u = 1; u <= SESSION_LIMIT_TEST_CONFIG.intentoLoginExtra; u++) {
        const userRut = `TEST-USER-${u}`;
        const tiempoInicio = Date.now();

        console.log(`\n🔑 [Usuario ${u}] Intentando login con RUT: ${userRut}`);
        console.log(`   Sesiones activas: ${ACTIVE_USER_SESSIONS.size}/${MAX_CONCURRENT_USERS}`);

        // Simular login (verificar límite local)
        if (ACTIVE_USER_SESSIONS.size >= MAX_CONCURRENT_USERS) {
            const tiempoRespuesta = Date.now() - tiempoInicio;
            resultados.loginsRechazados++;
            resultados.loginsIntentados++;

            console.log(`❌ [Usuario ${u}] LOGIN RECHAZADO`);
            console.log(`   • Razón: Sistema saturado (${ACTIVE_USER_SESSIONS.size}/${MAX_CONCURRENT_USERS} usuarios)`);
            console.log(`   • Tiempo: ${tiempoRespuesta}ms`);

            resultados.detalles.push({
                usuario: u,
                rut: userRut,
                exitoso: false,
                tiempoMs: tiempoRespuesta,
                mensaje: `Sistema saturado (${ACTIVE_USER_SESSIONS.size}/${MAX_CONCURRENT_USERS} usuarios)`
            });
        } else {
            // Agregar a sesiones activas
            ACTIVE_USER_SESSIONS.set(userRut, {
                loginTime: Date.now(),
                lastActivity: Date.now(),
                lastWrite: Date.now(),
                nombre: userRut
            });
            const tiempoRespuesta = Date.now() - tiempoInicio;
            resultados.loginsExitosos++;
            resultados.loginsIntentados++;

            console.log(`✅ [Usuario ${u}] LOGIN EXITOSO`);
            console.log(`   • Sesiones activas: ${ACTIVE_USER_SESSIONS.size}/${MAX_CONCURRENT_USERS}`);
            console.log(`   • Tiempo: ${tiempoRespuesta}ms`);

            resultados.detalles.push({
                usuario: u,
                rut: userRut,
                exitoso: true,
                tiempoMs: tiempoRespuesta,
                mensaje: `Login exitoso. ${ACTIVE_USER_SESSIONS.size}/${MAX_CONCURRENT_USERS} usuarios conectados`
            });
        }
    }

    // Limpiar sesiones después del test
    console.log('\n🧹 Limpiando sesiones de prueba...');
    ACTIVE_USER_SESSIONS.clear();
    console.log('✅ Sesiones limpias');

    // Resumen
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    RESUMEN DE RESULTADOS                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`📊 Estadísticas:`);
    console.log(`   • Intentos de login: ${resultados.loginsIntentados}`);
    console.log(`   • Logins exitosos: ${resultados.loginsExitosos}/${SESSION_LIMIT_TEST_CONFIG.maxUsuarios}`);
    console.log(`   • Logins rechazados: ${resultados.loginsRechazados}`);

    console.log(`\n📋 Validación de Límite:`);
    const limitOk = resultados.loginsExitosos === SESSION_LIMIT_TEST_CONFIG.maxUsuarios && resultados.loginsRechazados === 1;

    if (limitOk) {
        console.log(`   ✅ CORRECTO: ${SESSION_LIMIT_TEST_CONFIG.maxUsuarios} usuarios conectados, 7mo rechazado`);
    } else {
        console.log(`   ❌ ERROR: Límite no funcionó correctamente`);
        console.log(`      - Esperado: ${SESSION_LIMIT_TEST_CONFIG.maxUsuarios} exitosos, 1 rechazado`);
        console.log(`      - Obtenido: ${resultados.loginsExitosos} exitosos, ${resultados.loginsRechazados} rechazados`);
    }

    // Tabla de detalles
    console.log('\n📝 TABLA DE INTENTOS:\n');
    console.log('Usuario │ RUT          │ Estado   │ Tiempo │ Mensaje');
    console.log('────────┼──────────────┼──────────┼────────┼──────────────────────────────');

    resultados.detalles.forEach(d => {
        const usuario = `${d.usuario}`.padEnd(6, ' ');
        const rut = d.rut.padEnd(12, ' ');
        const estado = d.exitoso ? '✅ Exitoso' : '❌ Rechazado';
        const tiempo = `${d.tiempoMs}ms`.padEnd(6, ' ');
        const mensaje = d.mensaje.substring(0, 30);
        console.log(`${usuario} │ ${rut} │ ${estado} │ ${tiempo} │ ${mensaje}`);
    });

    console.log('\n✨ Prueba de límite completada\n');

    return resultados;
}

console.log('💡 Para ejecutar prueba de límite: runSessionLimitTest()');
