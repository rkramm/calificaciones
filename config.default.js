/* ================= CONFIGURACIÓN POR DEFECTO (VERSIONADA) ================= */
/* Este archivo es la configuración por defecto para GitHub Pages */
/* Para desarrollo local, crea config.js (que está en .gitignore) */
/* Usa var para permitir que config.js (si existe) lo sobrescriba sin error */

var CONFIG = {
    CLOUD_MODE_ENABLED: true,
    // URL de Google Apps Script (valor por defecto)
    GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzYCLJutiR_JyOgFFUJP4wXim_QXcPPpeYZI2AjXx7rgk0vUyR_doFAeu5W-9KFRbjK9w/exec",
    // Configuración de seguridad
    SECURITY: {
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION_MS: 900000, // 15 minutos
        PASSWORD_MIN_LENGTH: 6,
        REQUIRE_RUT_VALIDATION: true
    }
};
