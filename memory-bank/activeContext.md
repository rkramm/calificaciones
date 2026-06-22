# Estado del Sistema - Control de Versiones y Doble Advertencia Implementados

## Cambios Implementados

### 1. Control de Versiones Optimista por Tabla
- **Backend (Code.gs)**:
  - Nueva hoja `__version__` que almacena la versión actual de cada tabla.
  - Funciones `getVersionMap`, `getTableVersion` y `bumpTableVersion`.
  - `doGet` devuelve `{ data, serverVersion }`.
  - `doPost` exige `clientVersion`; si es menor que `serverVersion`, rechaza con `versionConflict`.
  - Soporte para `forceVersion` que permite forzar la escritura tras doble advertencia.
- **Frontend (app.js)**:
  - Mapa global `serverVersions` que se actualiza con cada lectura/escritura.
  - `cloudGet` extrae y guarda `serverVersion`.
  - `cloudSave` envía siempre `clientVersion`.
  - `handleVersionConflict` permite forzar la escritura con doble advertencia.

### 2. Doble Advertencia en Operaciones Críticas
Se implementó `confirmDoubleWarning(operationName, detail)` y se aplicó en:
- `syncSingleStoreToCloud`
- `syncAllToCloud`
- `executeSyncAllToCloud`
- `downloadHistoricosFromCloud`
- `saveEvaluatorScores`
- `saveAsignacionHistorica`
- `guardarHistorico`
- `applyConflictResolution`

Cada advertencia consta de dos diálogos `confirm` consecutivos que el usuario debe aceptar.

### 3. Manejo de Conflictos de Versión
- Si el servidor detecta versión desactualizada, responde con:
  ```json
  { success: false, versionConflict: true, serverVersion: N, clientVersion: M }
  ```
- El frontend muestra doble advertencia y ofrece forzar la escritura.
- Si el usuario cancela, se mantienen los datos locales y no se escribe en el servidor.

### 4. Sincronización Selectiva Previa
- Sigue activa la funcionalidad de sincronización selectiva con checkboxes.
- Ahora integrada con el control de versiones: solo se envían cambios seleccionados y con versión válida.

## Flujo de Escritura en Servidor

1. Usuario inicia una operación que escribe en el servidor.
2. Se muestran dos advertencias consecutivas (`confirmDoubleWarning`).
3. Se envía `clientVersion` junto con los datos.
4. Servidor compara `clientVersion` con `serverVersion`.
5. Si `clientVersion >= serverVersion`, se escribe y se incrementa la versión del servidor.
6. Si `clientVersion < serverVersion`, se rechaza y se ofrece forzar con otra doble advertencia.

## Beneficios

- **Prevención de sobrescrituras accidentales**: Cada cliente conoce la versión del servidor.
- **Concurrencia controlada**: Hasta 10 usuarios pueden trabajar; el sistema detecta versiones obsoletas.
- **Seguridad para el usuario**: Doble confirmación antes de cualquier escritura/borrado en servidor.
- **Transparencia**: Se informa claramente la versión local y del servidor en caso de conflicto.

## Nuevos Cambios - Vista del Evaluador

### 5. Encabezado Oficial de Precalificación
- Título principal: **"PRECALIFICACIÓN DE ENTIDADES DE ASISTENCIA TÉCNICA"**.
- Subtítulo: **"PERIODO 2do. SEMESTRE 2025 – 1er. SEMESTRE 2026"**.
- Fecha larga del día actual en formato local `es-CL`.

### 6. Tabla Identificatoria de la Entidad
- Campos: **Entidad, RUT Entidad, N° Convenio Marco Seremi, Fecha Convenio Marco, Categoría**.
- Se llena con los datos de la entidad asociada a la cobertura activa.
- Búsqueda flexible: primero por `idEntidad`, luego por coincidencia normalizada de nombre o RUT, para soportar casos donde la asignación no tenga el `idEntidad` correcto.

### 7. Tabla de Proyectos a Considerar
- Título: **"IDENTIFICACIÓN DE LOS PROYECTOS A CONSIDERAR PARA PRE-CALIFICACIÓN"**.
- Para **DS49**: columnas Código Proyecto, Nombre Proyecto, Comuna, Modalidad, N° Familias, Año. Lee desde pestaña `49_py`.
- Para **DS27**: columnas Nombre Proyecto, Comuna, Modalidad, Familias, Año. Lee desde pestaña `27_py`.
- Para **DS10**: columnas Nombre Proyecto, Comuna, Modalidad, Familias, Año. Lee desde pestaña `10_py`.
- Endpoint `doGet?action=getProjects&programa=...&entidad=...` en `Code.gs`.
- Función `cloudGetProjects` en `app.js`.
- Filtro por nombre de entidad en la columna correspondiente (`entidad`, `nombre entidad`, `entidad nombre`, `razón social`, `razon social` o cualquier encabezado que contenga `nombre`).
- Coincidencia exacta o parcial, normalizando espacios, mayúsculas/minúsculas y puntos finales.
- Normalización especial para "LTDA." / "LTDA", "SPA." / "SPA" y "S.A." / "S.A" para evitar que el punto final impida la coincidencia.
- Normalización del programa: acepta `DS49`, `DS 49`, `ds49`, `DS-49`, `49`, etc.
- Debug detallado en la respuesta: programa normalizado, pestaña usada, filas evaluadas, coincidencias y entidad buscada.
- Si no se encuentra la columna de entidad, el endpoint devuelve debug indicando el problema.
- Campos vacíos se muestran vacíos sin generar errores.

### 8. Corrección en Visualización de Ítems por Etapa
- `renderEvaluatorView` ahora filtra y ordena todos los ítems de `dbItems` cuyo `stage` coincida con la etapa actual.
- Se agregó mensaje informativo cuando no hay ítems configurados para una etapa.

### 9. Corrección de Sincronización Pegada en 0%
- `executeCommitAsignacion` ahora invoca `syncSingleStoreToCloud('asignaciones')` tras guardar localmente, evitando que la barra de progreso quede congelada.
- Se agregó manejo de error en la transacción (`tx.onerror`).

### 10. Corrección de Login "Verificando credenciales"
- `handleLogin` ahora valida que el campo de usuario no esté vacío antes de continuar.
- Se restaura el indicador de conexión si el usuario no ingresa RUT.
- `attemptEvaluatorLogin` restaura el indicador de conexión en todos los casos de error (RUT no registrado, contraseña incorrecta, sin asignaciones, error de carga).
- Se agregó la función `restoreConnectionStatus()` para centralizar la restauración del indicador a "Conectado a la Nube" / "Modo Local".

## Cambios Recientes - Limpieza de Interfaz Duplicada

### 11. Eliminación de Elementos Redundantes en Vista Evaluador
- **Problema**: Existían tabs y botones de etapas duplicados:
  - Contenedor `evaluador-coverage-tabs` (innecesario)
  - Contenedor `evaluador-tabs` (generaba botones grandes de etapas)
  - Resultaba en interfaz saturada con elementos repetitivos
  
- **Solución**:
  - Remover `coverage-container-ui` del HTML
  - Ocultar `evaluador-tabs` con clase `hidden` (se usa internamente para procesamiento)
  - Mantener solo `eval-stages-container` con badges interactivos pequeños
  
- **Layout Final Limpio**:
  ```
  Entidad Tabs
    ↓
  Detalles de Entidad (card con 5 campos)
    ↓
  Tabla de Proyectos a Evaluar
    ↓
  Etapas a Calificar (badges pequeños interactivos)
    ↓
  Tabla de Evaluación
  ```

- **Interactividad**: Los badges en `eval-stages-container` ejecutan `window.changeStage()` 
  cuando se hace clic, sin necesidad de tabs visibles.

## Próximos Pasos Sugeridos

1. Desplegar `Code.gs` actualizado en Google Apps Script.
2. Probar escenario con dos usuarios modificando la misma tabla.
3. Verificar que la hoja `__version__` se crea automáticamente.
4. Confirmar que las dobles advertencias aparecen en todas las operaciones críticas.
5. Verificar que las pestañas `49_py` y `27_py` existan en el Google Sheet con los nombres de columnas esperados.
6. **Verificar visualmente** que la interfaz del evaluador se muestra limpia sin elementos duplicados.
7. **Probar interactividad** de badges de etapas para confirmar que cambian correctamente entre etapas.

---

## Cambios Anteriores - Sincronización Selectiva (v23)

### Sistema de Sincronización Selectiva
- Modal de confirmación con checkboxes por cambio.
- Opciones "Aceptar Seleccionados" y "Aceptar Todos".
- Filtrado inteligente: solo registros seleccionados se envían al servidor.

### Logs de Diagnóstico
- Logs emoji en `getMultipleStores` para debugging en consola del navegador.

### Protección de Datos Locales
- Ninguna función de lectura/sincronización borra datos locales.
- Actualización incremental con `put()` en IndexedDB.
- Respaldo JSON automático antes de sincronización manual.

## Notas Técnicas

- **IndexedDB versión 7**: Incluye tabla 'asigna_historico' para persistencia.
- **Modo nube activado**: `CLOUD_MODE_ENABLED = true`.
- **URL Google Script**: Configurada para producción.
- **Timeouts**: 10s por tabla en sincronización forzada, 8s en login evaluador.
- **Respaldo JSON**: Automático antes de sincronización manual.
- **Nueva hoja en Google Sheets**: `__version__` para control de versiones por tabla.
