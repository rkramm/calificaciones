/**
 * PANEL ADMIN - Gestión de Sesiones Activas
 * Permite al administrador ver usuarios logueados y terminar sesiones
 */

/**
 * Mostrar panel de sesiones activas
 */
function showActiveSessions() {
    const sessionsList = document.getElementById('admin-sessions-list');
    if (!sessionsList) {
        console.error('Elemento admin-sessions-list no encontrado');
        return;
    }

    sessionsList.innerHTML = '';

    if (ACTIVE_USER_SESSIONS.size === 0) {
        sessionsList.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #999;">
                <p>No hay usuarios conectados actualmente</p>
            </div>
        `;
        return;
    }

    // Crear tabla de sesiones
    let html = `
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
                <tr style="background: #25306B; color: white;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #25306B;">RUT</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #25306B;">Nombre</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #25306B;">Conectado hace</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #25306B;">Última Actividad</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #25306B;">Acción</th>
                </tr>
            </thead>
            <tbody>
    `;

    const ahora = Date.now();
    let indice = 1;

    ACTIVE_USER_SESSIONS.forEach((session, rut) => {
        const tiempoConectado = formatearTiempoTranscurrido(ahora - session.loginTime);
        const tiempoActividad = formatearTiempoTranscurrido(ahora - session.lastActivity);

        const esUsuarioActual = currentUser && currentUser.rut === rut;
        const filaEstilo = indice % 2 === 0 ? 'background: #f5f5f5;' : '';

        html += `
            <tr style="${filaEstilo}">
                <td style="padding: 12px; border-bottom: 1px solid #ddd;"><code>${rut}</code></td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd;">${session.nombre}</td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd;">${tiempoConectado}</td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd;">${tiempoActividad}</td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd;">
                    ${esUsuarioActual ?
                        '<span style="color: #666; font-style: italic;">Eres tú</span>' :
                        `<button onclick="adminTerminarSesion('${rut}')" class="btn btn-danger" style="background: #d32f2f; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Terminar</button>`
                    }
                </td>
            </tr>
        `;

        indice++;
    });

    html += `
            </tbody>
        </table>
        <div style="margin-top: 16px; padding: 12px; background: #e3f2fd; border-left: 4px solid #2196F3; border-radius: 4px; font-size: 0.9rem; color: #1565c0;">
            <strong>📋 Resumen:</strong> ${ACTIVE_USER_SESSIONS.size}/${MAX_CONCURRENT_USERS} usuarios conectados<br>
            <strong>⏰ Timeout:</strong> Las sesiones expiran automáticamente después de ${SESSION_TIMEOUT_MINUTES} minutos sin actividad
        </div>
    `;

    sessionsList.innerHTML = html;
}

/**
 * Terminar sesión de un usuario (solo admin)
 */
function adminTerminarSesion(rut) {
    if (!confirm(`¿Desea terminar la sesión de ${rut}?`)) {
        return;
    }

    ACTIVE_USER_SESSIONS.delete(rut);
    console.log(`✅ Admin terminó sesión de: ${rut}`);
    alert(`✅ Sesión de ${rut} ha sido terminada.`);

    // Actualizar panel
    showActiveSessions();
}

/**
 * Formatear tiempo transcurrido
 */
function formatearTiempoTranscurrido(ms) {
    if (ms < 1000) return 'Ahora';
    if (ms < 60000) return `Hace ${Math.floor(ms / 1000)}s`;
    if (ms < 3600000) return `Hace ${Math.floor(ms / 60000)}m`;
    return `Hace ${Math.floor(ms / 3600000)}h`;
}

/**
 * Actualizar panel cada 5 segundos
 */
function inicializarActualizadorSesiones() {
    if (!document.getElementById('admin-sessions-list')) {
        return; // No está en página admin
    }

    showActiveSessions(); // Mostrar inicial

    setInterval(() => {
        showActiveSessions(); // Actualizar cada 5 segundos
    }, 5000);
}

// Inicializar cuando se abre el panel admin
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco a que se cargue el admin
    setTimeout(inicializarActualizadorSesiones, 1000);
});

console.log('💡 Panel de Sesiones Activas cargado');
