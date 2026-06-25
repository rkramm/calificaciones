# 🔍 Detalles Menores - Revisión FASE 1-2

**Nota:** Estos son items que funcionan pero necesitan revisión/ajustes menores antes de producción.

---

## 1. ⚙️ Configuración de Rate Limiting

### Estado Actual
```javascript
MAX_LOGIN_ATTEMPTS: 5
LOCKOUT_DURATION_MS: 900000 (15 minutos)
PASSWORD_MIN_LENGTH: 6
```

### Preguntas de Revisión
- ¿Son 5 intentos demasiados o muy pocos?
- ¿15 minutos es razonable para el lockout?
- ¿6 caracteres es la longitud mínima correcta?

### Ubicación
`config.js` líneas 9-12

---

## 2. 🌐 URL de Google Apps Script

### Detalle
La URL está en `config.js` pero:
- ¿Necesitas copiarla a un segundo archivo? (ej. `.env.example` con instrucciones)
- ¿Existe documentación para nuevo dev sobre dónde pegar la URL?

### Archivo Relacionado
`config.js` - crear cuando usuario lo necesite

### Sugerencia
Crear `config.example.js`:
```javascript
const CONFIG = {
    CLOUD_MODE_ENABLED: true,
    GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/PASTE_HERE/exec",
};
```

---

## 3. 🧪 Pruebas - Navegadores Antiguos

### Detalle
bcryptjs y CSRF tokens están testeados en Chrome/Firefox modernos pero:
- ¿Necesitas soportar IE11 u otros navegadores antiguos?
- ¿Todos los usuarios tienen navegadores modernos?

### Archivos Afectados
- `index.html` - bcryptjs en línea 24
- `app.js` - localStorage, Promise, fetch

### Si necesitas compatibilidad
Documentar:
- Mínimo navegador requerido
- Polyfills necesarios
- Fallback para navegadores sin soporte

---

## 4. 💾 Memory Leaks - Alcance Completo

### Estado Actual
✅ Sistema `addManagedListener()` creado  
✅ `performLogout()` limpia listeners  
❓ `setupEventListeners()` AÚN usa `addEventListener()` directo

### Detalle
La función `setupEventListeners()` (línea 1394) tiene ~15 listeners sin usar `addManagedListener()`:

```javascript
// ACTUAL (línea 1394):
document.getElementById('btn-login').addEventListener('click', handleLogin);

// DEBERÍA SER:
addManagedListener(
    document.getElementById('btn-login'),
    'click',
    handleLogin
);
```

### Preguntas
- ¿Migrar TODOS los listeners a `addManagedListener()` ahora?
- ¿O dejar la migración para FASE 3?
- ¿Medir primero memory con DevTools?

### Estimación
- Tiempo: 30-45 min
- Riesgo: Bajo (cambio mecánico)
- Beneficio: 50% reducción en memory leaks

---

## 5. 🔐 CSRF Tokens - Lado Servidor Pendiente

### Estado Actual
✅ Cliente: Token generado, validado, enviado  
⏳ Servidor: Validación en Google Apps Script (PENDIENTE)

### Detalle
El POST incluye `csrfToken` pero Google Apps Script aún no lo valida.

```javascript
// app.js envía:
{
    table: "scores",
    csrfToken: "abc123...",  // ✅ Incluido
    data: [...]
}

// GAS debería validar:
if (!validateCSRFToken(request.csrfToken)) {
    return error(); // ⏳ AÚN NO IMPLEMENTADO
}
```

### Ubicación
`GAS_CSRF_SETUP.md` tiene instrucciones completas

### Preguntas
- ¿Proceder con implementación en GAS ahora?
- ¿O esperar a testing completo del cliente primero?

---

## 6. 🔑 bcrypt - Validación Pendiente

### Estado Actual
✅ Librería cargada en navegador (dcodeIO.bcrypt)  
⏳ Servidor: Hash/validación en GAS (PENDIENTE)

### Detalle
El navegador tiene bcrypt pero aún se compara contraseña en plaintext:

```javascript
// ACTUAL (línea 2103, aún inseguro):
if (passInput !== remoteClave.valor) {
    // plaintext vs plaintext ❌
}

// DEBERÍA SER (después de GAS update):
const isValid = await bcrypt.compare(passInput, remoteClave.valor);
if (!isValid) {
    // plaintext vs hash ✅
}
```

### Ubicación
`GAS_BCRYPT_SETUP.md` líneas 50-80

### Preguntas
- ¿Implementar en GAS ahora?
- ¿Necesitas help con setup?

---

## 7. 📊 innerHTML - Reemplazo Parcial

### Estado Actual
✅ Críticos reemplazados: loadProjectsTable(), renderProjectsTableAllPrograms()  
❓ Aún ~60+ innerHTML sin reemplazar

### Detalle
Búsqueda muestra 67 usos de innerHTML, pero muchos son seguros (HTML constante).

**Ejemplos SEGUROS (no necesitan cambio):**
```javascript
// Constante HTML, sin variables de usuario:
thead.innerHTML = `<tr style="..."><th>Nombre</th></tr>`;  // ✅ Seguro

// Ejemplos CRÍTICOS YA REEMPLAZADOS:
body.appendChild(createTableMessage(escapeHTML(entidadNombre)));  // ✅ Arreglado
```

### Preguntas
- ¿Revisar manualmente cada innerHTML para confirmar seguridad?
- ¿Crear regex para detectar innerHTML con variables de usuario?
- ¿O confiar en que los críticos están arreglados?

### Estimación
- Análisis: 30 min
- Reemplazo completo: 2-3 horas

---

## 8. 🧮 Validación de RUT

### Estado Actual
⏳ PENDIENTE - No se valida el dígito verificador

### Detalle
RUT chileno tiene formato: `12.345.678-K`
- K = dígito verificador (0-9 o K)
- Actualmente se aceptan RUTs inválidos

### Ubicación
`handleLogin()` línea 2041:
```javascript
if (!userInput) {
    alert('Por favor, ingrese su RUT de usuario.');
    return;
}
// No valida: RUT_INVALIDO-0 sería aceptado
```

### Preguntas
- ¿Implementar validación de RUT?
- ¿Formato esperado: "12345678-9" o "12.345.678-9"?
- ¿Validación es crítica o puede esperar?

### Función Necesaria
```javascript
function isValidRUT(rut) {
    // Lógica para validar dígito verificador
    return true/false;
}
```

---

## 9. 📱 Compatibilidad Mobile

### Estado Actual
✅ Página usa responsive design  
❓ ¿Todas las pruebas funcionan en móvil?

### Detalle
Rate limiting, CSRF tokens, etc. están testeados en desktop.

### Preguntas
- ¿Pruebas en iPhone/Android real?
- ¿Funciona login en móvil?
- ¿Teclado virtual afecta UX?

---

## 10. 🔄 Sincronización Concurrent

### Estado Actual
✅ Sistema handles múltiples usuarios  
❓ ¿Race conditions si 2 usuarios editan el MISMO proyecto?

### Detalle
Si usuario A y B editan proyecto X al mismo tiempo:
```javascript
// Usuario A: modifica score de 75
// Usuario B: modifica score de 80
// ¿Cuál se guarda? ¿O ambos?
```

### Ubicación
Sincronización en `cloudPost()` línea 570

### Preguntas
- ¿Versioning/merge de conflictos está implementado?
- ¿O último en guardar sobrescribe todo?
- ¿Es aceptable?

---

## 11. 🛑 Logout Limpieza Completa

### Detalle
`performLogout()` limpia:
- ✅ currentUser
- ✅ currentRole  
- ✅ CSRF token
- ✅ Event listeners
- ❓ IndexedDB local (¿se debe mantener para próximo usuario?)
- ❓ Cookies de sesión
- ❓ Cache del navegador

### Preguntas
- ¿Qué datos locales se deben MANTENER?
- ¿Qué se debe LIMPIAR?
- ¿Usuario siguiente ve datos del usuario anterior?

---

## 12. 📝 Documentación de Implementación

### Detalle
Se crearon 5+ documentos markdown pero:
- ¿Están en lugar fácil de acceder?
- ¿Usuario nuevo entiende dónde empezar?

### Archivo Sugerido
Crear `SECURITY_README.md` con índice:
```
1. Lee: RESUMEN_SEGURIDAD.md (5 min)
2. Si necesitas setup GAS: GAS_BCRYPT_SETUP.md + GAS_CSRF_SETUP.md
3. Si necesitas verificar: INSTRUCCIONES_PRUEBA.md
4. Si tienes memory issues: MEMORY_MANAGEMENT.md
5. Detalles técnicos: SECURITY.md
```

---

## 📋 CHECKLIST - ANTES DE FINALIZAR

```
SEGURIDAD:
☐ Rate limiting (5 intentos, 15 min) - ¿está bien?
☐ CSRF tokens funcionan en navegador - ¿Proceder a GAS?
☐ bcrypt funciona - ¿Proceder a GAS?
☐ XSS prevention - ¿Revisar otros innerHTML?
☐ Memory leaks - ¿Migrar todos los listeners ahora?

FUNCIONALIDAD:
☐ Login funciona normal - SIN slowdown
☐ Rate limiting no afecta usuarios legítimos
☐ PDF export sigue funcionando
☐ Sincronización cloud funciona
☐ Mobile compatibility

DETALLES:
☐ RUT validation - ¿Implementar ahora?
☐ Logout limpieza - ¿Completa?
☐ Documentación - ¿Es clara?
☐ config.js - ¿Usuario sabe dónde pegar URL?
```

---

## ⚡ PRIORIDAD RECOMENDADA

**CRÍTICO (Esta semana):**
1. Implementar bcrypt en Google Apps Script
2. Implementar CSRF validation en Google Apps Script
3. Test: Ambos funcionan con usuario real

**IMPORTANTE (Próxima semana):**
4. Migrar setupEventListeners() a addManagedListener()
5. Agregar debouncing a búsqueda
6. Test: Memory con DevTools antes/después

**NICE-TO-HAVE (Próximas 2 semanas):**
7. Validación de RUT
8. Data versioning para conflictos
9. Documentación en README principal

---

## 📞 CÓMO PROCEDER

1. **Lee este documento** - Entiende los detalles
2. **Marca lo que necesitas revisar** - Cuáles son críticos para ti
3. **Abre issues** - Uno por detalle
4. **Prioriza** - Según impacto para tu caso uso

**Siguiente sesión:** Implementar FASE 3 según prioridades definidas

