# 🛡️ PLAN DE ROLLBACK - Code.gs V1

## ⚠️ SI ALGO SALE MAL

### Opción A: Rollback en Git (Local)
```bash
# Ver historial
git log --oneline

# Si algo va mal, revertir al V2 simple
git checkout HEAD~1 Code.gs

# O específicamente restaurar el backup
git checkout backup_code_v2_simple.gs -b Code.gs
```

### Opción B: Rollback en Google Apps Script (Si ya fue deployd)
```
1. Ve a Google Apps Script: https://script.google.com
2. Abre el proyecto
3. Menú: Ver → Historial de revisiones
4. Selecciona una versión anterior a Code.gs V1
5. Restaura
```

### Opción C: Restaurar desde Google Sheets
```
1. Ve a https://docs.google.com/spreadsheets/d/1apPfP7Y3ancW166QGEvh07kESYjuV8sP-Wd14cnQjjo
2. Archivo → Historial de versiones
3. Selecciona un snapshot anterior (antes de restaurar V1)
4. Restaura
```

---

## 🧪 CÓMO PROBAR LOCALMENTE (SIN ARRIESGAR PRODUCTIVO)

### Test 1: Login/Logout (Sesiones)
```javascript
// En consola del navegador (F12)

// Test login
getActiveSessions();

// Debería retornar:
// {success: true, sessions: [], count: 0}
```

**Nota**: Solo funcionará si `doPost({action: 'login'})` se ejecuta desde app.js

### Test 2: Versionado (Detectar conflictos)
```javascript
// Simular 2 usuarios guardando simultaneously:
// User A: clientVersion = 1, serverVersion = 1
// User B: clientVersion = 1, serverVersion = 2 (A ganó primero)

// User B debería recibir:
// {success: false, versionConflict: true}
```

### Test 3: Protección de Etapas
```javascript
// Las etapas en Google Sheets siempre deben verse como:
// "1|2|3" (TEXTO)
// NO como:
// 1|2|3 (NÚMERO)

// Verificar en Google Sheets directamente
```

### Test 4: No pierde datos
```
Verificar en Google Sheets:
- asignaciones: SIGUEN siendo 1116 registros
- scores: SIGUEN intactos
- entidades: SIGUEN intactas
- evaluadores: SIGUEN intactos
```

---

## 📋 CHECKLIST PRE-COMMIT

- [ ] Backup de Google Sheets descargado (backup_productivo_2025-07-28.xlsx)
- [ ] Backup de V2 simple guardado (backup_code_v2_simple.gs)
- [ ] Code.gs V1 desplegado en Google Apps Script
- [ ] Login funciona (se registra sesión)
- [ ] Logout funciona (se elimina sesión)
- [ ] getActiveSessions() retorna usuarios correctos
- [ ] Calificaciones siguen siendo 1116 en asignaciones
- [ ] Scores no se borraron
- [ ] Entidades no se borraron
- [ ] Etapas se ven como TEXTO, no números
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en Google Apps Script (Ver → Registros)

---

## ✅ CUANDO TODO FUNCIONE

```bash
# Hacer commit
git add Code.gs backup_code_v2_simple.gs
git commit -m "feat: Restaurar Code.gs V1 con protecciones de concurrencia

- Sesiones: login/logout con contador de usuarios activos (máx 6)
- Versionado: detección de conflictos con versionado optimista
- Validación: protección de etapas y itemId como texto
- Backup: creación automática de backups en Google Sheets
- Fixes: arreglado bug de nombre en getSessions, optimizado lectura de headers

Cambios desde V2 simple:
+ Control de concurrencia (6 usuarios max)
+ Versionado para evitar race conditions
+ Protección contra interpretación numérica de etapas
+ Backup automático
+ Soporte para modo incremental (no pierde datos)

Rollback: git checkout backup_code_v2_simple.gs

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Push a GitHub
git push origin main
```

---

## 🚨 PUNTOS CRÍTICOS A VERIFICAR

1. **Nunca hacer POST a 'asignaciones' con mode='replace'**
   - Por defecto usa 'incremental' (seguro)
   - Si alguien fuerza 'replace' → borraría y reescribiría

2. **Las sesiones se guardan en PropertiesService (NO en Google Sheets)**
   - Si se reinicia el Apps Script → sesiones se olvidan
   - Es NORMAL

3. **El versionado se almacena en hoja '__version__'**
   - No borres esa hoja
   - Si la borras → se recrea automáticamente

4. **Los backups se crean como pestañas nuevas**
   - Ve a Google Sheets y verás: backup_20250728_143022
   - Puedes bajarlas o borrarlas sin problema

---

## 📞 SI ALGO FALLA

1. Lee el error en Google Apps Script (Ver → Registros)
2. Revisa que app.js esté enviando los datos correctos
3. Verifica que la tabla (asignaciones, scores, etc.) exista
4. Si todo falla: Usa Opción C de rollback
