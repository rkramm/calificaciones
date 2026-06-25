# 🔐 Documentación de Seguridad

## Cambios de Seguridad Implementados - FASE 1

### 1. ✅ URL de Google Apps Script Extraída a Archivo de Configuración
**Problema:** URL hardcodeada exponía el endpoint público  
**Solución:** 
- Creado `config.js` (NO VERSIONADO en .gitignore)
- GOOGLE_SCRIPT_URL ahora viene de `CONFIG.GOOGLE_SCRIPT_URL`
- Archivos afectados: `index.html`, `app.js`

```javascript
// ANTES (exposición de secreto):
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw2...";

// DESPUÉS (seguro):
const GOOGLE_SCRIPT_URL = CONFIG?.GOOGLE_SCRIPT_URL ?? "default";
// Definido en config.js NO VERSIONADO
```

**Cómo verificar:**
1. Abre `config.js` - contiene la URL real
2. Abre `.gitignore` - `config.js` está listado
3. Commit - `config.js` NO debería verse en cambios

---

### 2. ✅ Rate Limiting Implementado
**Problema:** Sin protección contra fuerza bruta en login  
**Solución:**
- Máximo 5 intentos fallidos consecutivos
- Bloqueo de 15 minutos después de 5 fallos
- Sistema rastreador: `loginAttempts` global

```javascript
const SECURITY_CONFIG = {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MS: 900000, // 15 minutos
    PASSWORD_MIN_LENGTH: 6
};
```

**Comportamiento:**
- Intento 1-4 fallido: Muestra "4 intentos restantes"
- Intento 5 fallido: Cuenta bloqueada 15 minutos
- Intento con cuenta bloqueada: "Bloqueado (15m)"
- Intento exitoso: Limpia contador automáticamente

**Cómo probar:**
1. Abre `TEST_SECURITY.html` en navegador
2. Consola muestra: "Rate Limiting implementado"
3. En app principal, prueba 5 contraseñas incorrectas - se bloquea

---

### 3. ✅ Funciones de Seguridad para XSS
**Problema:** 70+ usos de `innerHTML` sin sanitización  
**Solución:** Funciones helper seguras creadas

```javascript
// Escapar texto antes de usar en HTML
function escapeHTML(text) {
    const map = {
        '&': '&amp;', '<': '&lt;', '>': '&gt;', 
        '"': '&quot;', "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, c => map[c]);
}

// Crear elementos seguros (text content, no HTML)
function createSafeElement(tag, text, className = '') {
    const el = document.createElement(tag);
    el.textContent = text; // ✅ Seguro contra XSS
    if (className) el.className = className;
    return el;
}
```

**Uso:**
```javascript
// ❌ INSEGURO (XSS):
element.innerHTML = `<div>${userInput}</div>`;

// ✅ SEGURO:
element.textContent = userInput;
// O usar helper:
const el = createSafeElement('div', userInput);
```

**Cómo probar:**
- Abre TEST_SECURITY.html
- Verifica que escapeHTML sanitiza: `<script>alert(1)</script>` → `&lt;script&gt;...`

---

### 4. ✅ bcryptjs Integrado
**Problema:** Contraseñas en texto plano  
**Solución:**
- Agregada librería bcryptjs del CDN con SRI
- Google Apps Script DEBE usar bcrypt (próximo paso)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/bcryptjs/2.4.3/bcrypt.min.js" 
    integrity="sha512-5ShaYPRVmBl1GaHXxsHT0NW/..." 
    crossorigin="anonymous"></script>
```

**ACCIÓN REQUERIDA EN GOOGLE APPS SCRIPT:**
```javascript
// En Google Apps Script:
1. Agregar librería: MWASUMVf7KeTIZ4bu2xAXQ_11SVRPZGN93UE7j2Ro8KoRm8h5IhIHqN3I
2. Al guardar contraseña admin:
   var hash = Bcrypt.hashPassword(plaintext);
   // Guardar hash en configuración

3. Al validar en handleLogin():
   // Recibir hash del servidor, comparar con:
   bcrypt.compareSync(plainPassword, serverHash);
```

---

### 5. ✅ Integridad de CDN con SRI
**Antes:** Sin verificación de integridad
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
```

**Después:** Con hash SRI
```html
<script src="..." integrity="sha512-y+5DJXfPI3jc...==" crossorigin="anonymous"></script>
```

---

## Archivos Creados/Modificados

| Archivo | Cambio | Motivo |
|---------|--------|--------|
| `config.js` | ✨ CREADO | Almacenar URLs y secrets (NO versionado) |
| `index.html` | 📝 MODIFICADO | Cargar config.js, bcryptjs con SRI |
| `app.js` | 📝 MODIFICADO | Usar CONFIG, rate limiting, helpers |
| `.gitignore` | ✨ CREADO | Excluir config.js de git |
| `tests.security.js` | ✨ CREADO | Pruebas automatizadas en consola |
| `TEST_SECURITY.html` | ✨ CREADO | Interfaz visual de pruebas |
| `SECURITY.md` | ✨ CREADO | Esta documentación |

---

## Cómo Probar

### Opción 1: Pruebas Visuales (Recomendado)
```
1. Abre: http://localhost:8000/Calificaciones/TEST_SECURITY.html
2. Verifica que todos los tests pasen ✅
```

### Opción 2: Pruebas en Consola
```javascript
// En la consola del navegador (F12):
runSecurityTests()

// Debe mostrar:
✅ CONFIG.js cargado correctamente
✅ GOOGLE_SCRIPT_URL usando CONFIG
✅ Funciones de seguridad existen
✅ escapeHTML sanitiza tags HTML
✅ Rate limiting inicializado
... etc
```

### Opción 3: Prueba Manual de Rate Limiting
```
1. Abre http://localhost:8000/Calificaciones/
2. Intenta login con RUT falso y contraseña incorrecta
3. Repite 5 veces
4. En intento 6: "Bloqueado (15m)"
5. Espera 15 minutos o limpia loginAttempts en consola: delete loginAttempts['rut']
```

---

## Próximos Pasos (FASE 2)

- [ ] Implementar bcrypt en Google Apps Script para admin
- [ ] Implementar bcrypt para contraseñas de evaluadores
- [ ] Reemplazar `innerHTML` con `textContent` en renderizaciones de datos
- [ ] Agregar CSRF tokens para POST a Google Sheets
- [ ] Limpiar event listeners para eliminar memory leaks
- [ ] Implementar validación de RUT con dígito verificador

---

## Contacto y Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad:
1. NO la publiques en GitHub
2. Contacta privadamente al administrador
3. Proporciona: descripción, pasos para reproducir, impacto potencial

