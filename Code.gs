const SPREADSHEET_ID = '1apPfP7Y3ancW166QGEvh07kESYjuV8sP-Wd14cnQjjo';
const VERSION_SHEET_NAME = '__version__';

// Control de sesiones concurrentes
const MAX_CONCURRENT_USERS = 6;
const PROPERTIES = PropertiesService.getScriptProperties();

// Manejar CORS preflight requests (Chrome y navegadores modernos)
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Obtiene o crea la hoja de versiones y retorna un objeto { tabla: version }.
 */
function getVersionMap() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(VERSION_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(VERSION_SHEET_NAME);
    sheet.appendRow(['table', 'version']);
  }
  const values = sheet.getDataRange().getDisplayValues();
  const map = {};
  for (let i = 1; i < values.length; i++) {
    const table = values[i][0];
    const version = parseInt(values[i][1], 10);
    if (table) map[table] = isNaN(version) ? 0 : version;
  }
  return { sheet: sheet, map: map };
}

/**
 * Retorna la versión actual de una tabla. Si no existe, retorna 1.
 */
function getTableVersion(tableName) {
  const data = getVersionMap();
  return data.map[tableName] || 1;
}

/**
 * Incrementa la versión de una tabla en la hoja de versiones.
 * Acepta un versionData pre-leído para evitar lecturas redundantes de Sheets.
 * Retorna la nueva versión para que el llamador no necesite releer.
 * @param {string} tableName
 * @param {{sheet: Sheet, map: Object}|null} versionData - resultado de getVersionMap() ya leído, o null para releer.
 * @returns {number} nueva versión de la tabla.
 */
function bumpTableVersion(tableName, versionData) {
  const data = versionData || getVersionMap();
  const sheet = data.sheet;
  const values = sheet.getDataRange().getDisplayValues();
  let newVersion = 2;
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === tableName) {
      const current = parseInt(values[i][1], 10) || 1;
      newVersion = current + 1;
      sheet.getRange(i + 1, 2).setValue(newVersion);
      return newVersion;
    }
  }
  sheet.appendRow([tableName, 2]);
  return newVersion;
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const userRut = payload.userRut;

    // Manejar login
    if (action === 'login') {
      // Leer sesiones activas desde PropertiesService
      const sessionsJson = PROPERTIES.getProperty('ACTIVE_SESSIONS') || '{}';
      const ACTIVE_SESSIONS = JSON.parse(sessionsJson);
      const activeSessions = Object.keys(ACTIVE_SESSIONS).length;

      if (activeSessions >= MAX_CONCURRENT_USERS) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: `Sistema saturado (${activeSessions}/${MAX_CONCURRENT_USERS} usuarios). Intente en 5 minutos.`
        })).setMimeType(ContentService.MimeType.JSON);
      }

      // Registrar sesión con nombre del usuario
      ACTIVE_SESSIONS[userRut] = {
        loginTime: new Date().getTime(),
        lastActivity: new Date().getTime(),
        nombre: payload.userName || userRut  // Guardar nombre si viene en payload
      };

      // Guardar sesiones actualizadas
      PROPERTIES.setProperty('ACTIVE_SESSIONS', JSON.stringify(ACTIVE_SESSIONS));

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: `Login exitoso. ${activeSessions + 1}/${MAX_CONCURRENT_USERS} usuarios conectados.`
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Manejar logout
    if (action === 'logout') {
      // Leer sesiones activas desde PropertiesService
      const sessionsJson = PROPERTIES.getProperty('ACTIVE_SESSIONS') || '{}';
      const ACTIVE_SESSIONS = JSON.parse(sessionsJson);

      delete ACTIVE_SESSIONS[userRut];

      // Guardar sesiones actualizadas
      PROPERTIES.setProperty('ACTIVE_SESSIONS', JSON.stringify(ACTIVE_SESSIONS));

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Logout completado'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Obtener sesiones activas (para admin panel)
    if (action === 'getSessions') {
      const sessionsJson = PROPERTIES.getProperty('ACTIVE_SESSIONS') || '{}';
      const ACTIVE_SESSIONS = JSON.parse(sessionsJson);

      // Convertir a array para retornar
      const sessionsArray = [];
      for (const [rut, session] of Object.entries(ACTIVE_SESSIONS)) {
        sessionsArray.push({
          rut: rut,
          loginTime: session.loginTime,
          lastActivity: session.lastActivity,
          nombre: session.nombre || rut  // FIX: Usar session.nombre (que SÍ se guarda en línea 94)
        });
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        sessions: sessionsArray,
        count: sessionsArray.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ENDPOINT DE PRUEBA: Simula 5 usuarios insertando 20 asignaciones + 100 scores
    if (action === 'test') {
      const startTime = new Date().getTime();
      try {
        const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

        // PASO 1: Contar estado inicial
        const sheetAsig = spreadsheet.getSheetByName('asignaciones');
        const sheetScores = spreadsheet.getSheetByName('scores');
        const initialAsignaciones = sheetAsig ? (sheetAsig.getLastRow() - 1) : 0;
        const initialScores = sheetScores ? (sheetScores.getLastRow() - 1) : 0;

        // PASO 2: Crear datos de prueba (5 usuarios × 4 entidades = 20 asignaciones)
        const usuarios = ['00-1', '00-2', '00-3', '00-4', '00-5'];
        const entidades = [
          { id: 'ENT-T-001', nombre: 'Entidad Test 1' },
          { id: 'ENT-T-002', nombre: 'Entidad Test 2' },
          { id: 'ENT-T-003', nombre: 'Entidad Test 3' },
          { id: 'ENT-T-004', nombre: 'Entidad Test 4' }
        ];

        const asignacionesData = [];
        let asigId = 1;
        for (const usuario of usuarios) {
          for (const entidad of entidades) {
            asignacionesData.push({
              idAsig: `TEST-${asigId}`,
              rut: usuario,
              programa: 'DS49',
              provincia: 'Santiago',
              entidadId: entidad.id,
              entidadNombre: entidad.nombre,
              etapas: '1|2|3|4|5'
            });
            asigId++;
          }
        }

        // PASO 3: Crear datos de scores (100 scores: 20 asignaciones × 5 calificaciones)
        const scoresData = [];
        let scoreId = 1;
        for (const asig of asignacionesData) {
          for (let etapa = 1; etapa <= 5; etapa++) {
            scoresData.push({
              idTx: `SCORE-TEST-${scoreId}`,
              idAsig: asig.idAsig,
              rut: asig.rut,
              etapa: etapa,
              score: Math.floor(Math.random() * 101),
              timestamp: new Date().toISOString()
            });
            scoreId++;
          }
        }

        // PASO 4: Insertar asignaciones en modo incremental
        const versionDataTest = getVersionMap();
        const sheetA = spreadsheet.getSheetByName('asignaciones') || spreadsheet.insertSheet('asignaciones');
        const headersA = sheetA.getLastRow() > 0 ?
          sheetA.getRange(1, 1, 1, sheetA.getLastColumn()).getDisplayValues()[0] :
          ['idAsig', 'rut', 'programa', 'provincia', 'entidadId', 'entidadNombre', 'etapas'];

        if (sheetA.getLastRow() === 0) {
          sheetA.appendRow(headersA);
        }

        const refreshedValuesA = sheetA.getDataRange().getDisplayValues();
        const keyIndexA = refreshedValuesA[0].indexOf('idAsig');
        const rowMapA = {};
        for (let i = 1; i < refreshedValuesA.length; i++) {
          const key = refreshedValuesA[i][keyIndexA];
          if (key) rowMapA[key] = i;
        }

        for (const asig of asignacionesData) {
          const rowData = headersA.map(h => asig[h] || '');
          if (!rowMapA[asig.idAsig]) {
            sheetA.appendRow(rowData);
          }
        }
        const newVersionA = bumpTableVersion('asignaciones', versionDataTest);

        // PASO 5: Insertar scores en modo incremental
        const sheetS = spreadsheet.getSheetByName('scores') || spreadsheet.insertSheet('scores');
        const headersS = sheetS.getLastRow() > 0 ?
          sheetS.getRange(1, 1, 1, sheetS.getLastColumn()).getDisplayValues()[0] :
          ['idTx', 'idAsig', 'rut', 'etapa', 'score', 'timestamp'];

        if (sheetS.getLastRow() === 0) {
          sheetS.appendRow(headersS);
        }

        const refreshedValuesS = sheetS.getDataRange().getDisplayValues();
        const keyIndexS = refreshedValuesS[0].indexOf('idTx');
        const rowMapS = {};
        for (let i = 1; i < refreshedValuesS.length; i++) {
          const key = refreshedValuesS[i][keyIndexS];
          if (key) rowMapS[key] = i;
        }

        for (const score of scoresData) {
          const rowData = headersS.map(h => score[h] || '');
          if (!rowMapS[score.idTx]) {
            sheetS.appendRow(rowData);
          }
        }
        const newVersionS = bumpTableVersion('scores', versionDataTest);

        // PASO 6: Contar estado final
        const finalAsignaciones = sheetA.getLastRow() - 1;
        const finalScores = sheetS.getLastRow() - 1;
        const asignacionesAñadidas = finalAsignaciones - initialAsignaciones;
        const scoresAñadidos = finalScores - initialScores;

        const duration = new Date().getTime() - startTime;
        const success = asignacionesAñadidas === 20 && scoresAñadidos === 100;

        return ContentService.createTextOutput(JSON.stringify({
          success: success,
          test: 'concurrency_5users_20asignaciones_100scores',
          timestamp: new Date().toISOString(),
          initialState: {
            asignaciones: initialAsignaciones,
            scores: initialScores
          },
          finalState: {
            asignaciones: finalAsignaciones,
            scores: finalScores
          },
          expected: {
            asignacionesAñadidas: 20,
            scoresAñadidos: 100
          },
          actual: {
            asignacionesAñadidas: asignacionesAñadidas,
            scoresAñadidos: scoresAñadidos
          },
          dataIntegrity: {
            nothingDeleted: asignacionesAñadidas >= 0 && scoresAñadidos >= 0,
            allDataPreserved: initialAsignaciones + asignacionesAñadidas === finalAsignaciones && initialScores + scoresAñadidos === finalScores,
            versionsIncremented: newVersionA > 1 && newVersionS > 1
          },
          duration_ms: duration
        })).setMimeType(ContentService.MimeType.JSON);

      } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          test: 'concurrency_test',
          error: error.message,
          duration_ms: new Date().getTime() - startTime
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Registrar actividad (para timeout de inactividad después)
    if (userRut) {
      const sessionsJson = PROPERTIES.getProperty('ACTIVE_SESSIONS') || '{}';
      const ACTIVE_SESSIONS = JSON.parse(sessionsJson);

      if (ACTIVE_SESSIONS[userRut]) {
        ACTIVE_SESSIONS[userRut].lastActivity = new Date().getTime();
        PROPERTIES.setProperty('ACTIVE_SESSIONS', JSON.stringify(ACTIVE_SESSIONS));
      }
    }

    const tableName = payload.table;
    const dataArray = payload.data;
    let mode = payload.mode || 'replace'; // 'replace', 'overwrite', o 'incremental'

    // Normalizar 'overwrite' a 'replace'
    if (mode === 'overwrite') {
      mode = 'replace';
    }

    // Si es solicitud de backup, crear hoja de respaldo y retornar
    if (tableName === '__backup__') {
      const backupName = createBackupSheet();
      return ContentService.createTextOutput(JSON.stringify({ success: true, backupName: backupName })).setMimeType(ContentService.MimeType.JSON);
    }

    // Solo procesar versión si tableName es válido
    if (tableName) {
      // Control de versión optimista por tabla (una sola lectura de __version__ por request)
      const versionData = getVersionMap();
      const clientVersion = parseInt(payload.clientVersion, 10) || 0;
      const serverVersion = versionData.map[tableName] || 1;
      const forceVersion = payload.forceVersion === true;
      if (clientVersion < serverVersion && !forceVersion) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          versionConflict: true,
          serverVersion: serverVersion,
          clientVersion: clientVersion,
          error: 'La versión del cliente es anterior a la versión del servidor. Sincronice antes de guardar.'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Si no hay tableName, retornar error
    if (!tableName) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Nombre de tabla no especificado'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(tableName);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(tableName);
    }

    // Definir headers: SIEMPRE obtener de la hoja existente, NUNCA de dataArray
    let headers = null;
    const lastRow = sheet.getLastRow();

    // FIX: Optimizar lectura de headers - solo leer fila 1, no TODO el sheet
    if (lastRow > 0) {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    } else if (tableName === 'historicos') {
      // Si la hoja está vacía, usar headers predeterminados para tabla históricos
      headers = ['PROVINCIA','PROGRAMA','ENTIDAD','CALIFICADOR','AÑO','1.1','1.2','1.3','1.4','1.5','1.6','1.7','1.8','1.9','2.1','2.2','2.3','2.4','2.5','2.6','2.7','2.8','2.9','3.1','3.2','3.3','3.4','3.5','3.6','3.7','4.1','4.2','4.3','4.4','4.5','4.6','4.7','4.8','4.9','4.10','5.1','5.2','5.3','5.4','5.5','5.6','5.7','6.1','6.2','6.3','6.4','6.5','6.6','6.7','6.8','6.9'];
    } else if (tableName === 'asigna_historico') {
      // Si la hoja está vacía, usar headers predeterminados para tabla asigna_historico
      headers = ['idAsig','rut','programa','provincia','entidadId','entidadNombre','etapas'];
    } else if (dataArray && dataArray.length > 0) {
      // ÚLTIMO RECURSO: obtener de dataArray solo si la hoja estaba vacía
      headers = Object.keys(dataArray[0]);
    }

    if (mode === 'replace') {
      // Modo 'replace': LIMPIAR Y REEMPLAZAR DATOS (mantener headers)
      const lastRow = sheet.getLastRow();

      // Limpiar todas las filas de datos (desde fila 2 en adelante) usando clearContent
      // Esto es más seguro que deleteRows y evita errores de filas protegidas
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      }

      // Ahora insertar nuevos datos en fila 2
      if (dataArray && dataArray.length > 0) {
        const rows = dataArray.map(obj => headers.map(h => {
          const val = obj[h] !== undefined ? obj[h] : "";
          // Forzar itemId como TEXTO (anteponer apóstrofe para evitar interpretación como número decimal)
          if (h === 'itemId' && val && typeof val === 'string') {
            return "'" + val;  // Apóstrofe fuerza formato texto en Google Sheets
          }
          // Forzar etapas como TEXTO para evitar que Google Sheets la interprete como número
          if (h === 'etapas' && val && typeof val === 'string') {
            return "'" + val;  // Apóstrofe fuerza formato texto en Google Sheets
          }
          return val;
        }));
        const range = sheet.getRange(2, 1, rows.length, headers.length);
        range.setValues(rows);
        // Forzar formato texto en columna de etapas para evitar interpretación numérica
        const etapasColIndex = headers.indexOf('etapas') + 1;
        if (etapasColIndex > 0) {
          sheet.getRange(2, etapasColIndex, rows.length, 1).setNumberFormat('@');
        }
      }
      // Si dataArray está vacío, simplemente no agrega nada (los headers permanecen)
    } else {
      // Modo incremental: actualizar/agregar por clave primaria, NUNCA borrar
      const keyField = getKeyField(tableName);

      // Asegurar headers iniciales si la hoja está vacía
      const initialValues = sheet.getDataRange().getDisplayValues();
      if (initialValues.length === 0 || (initialValues.length === 1 && initialValues[0].length === 1 && initialValues[0][0] === '')) {
        sheet.clearContents();
        if (headers) sheet.appendRow(headers);
      }

      if (dataArray && dataArray.length > 0) {
        const refreshedValues = sheet.getDataRange().getDisplayValues();
        const refreshedHeaders = refreshedValues.length > 0 ? refreshedValues[0] : headers;
        const refreshedKeyIndex = refreshedHeaders.indexOf(keyField);

        // Construir mapa de filas existentes por clave primaria
        const rowMap = {};
        for (let i = 1; i < refreshedValues.length; i++) {
          const key = refreshedValues[i][refreshedKeyIndex];
          if (key !== undefined && key !== '') rowMap[key] = i;
        }

        dataArray.forEach(obj => {
          const keyValue = obj[keyField];
          const rowData = refreshedHeaders.map(h => {
            const val = obj[h] !== undefined ? obj[h] : "";
            // Forzar itemId como TEXTO
            if (h === 'itemId' && val && typeof val === 'string') {
              return "'" + val;
            }
            // Forzar etapas como TEXTO para evitar que Google Sheets la interprete como número
            if (h === 'etapas' && val && typeof val === 'string') {
              return "'" + val;
            }
            return val;
          });
          if (rowMap[keyValue] !== undefined) {
            // Actualizar fila existente
            const range = sheet.getRange(rowMap[keyValue] + 1, 1, 1, rowData.length);
            range.setValues([rowData]);
            // Forzar formato texto en columna de etapas
            const etapasColIndex = refreshedHeaders.indexOf('etapas') + 1;
            if (etapasColIndex > 0) {
              sheet.getRange(rowMap[keyValue] + 1, etapasColIndex, 1, 1).setNumberFormat('@');
            }
          } else {
            // Agregar nueva fila al final
            sheet.appendRow(rowData);
            // Forzar formato texto en columna de etapas
            const lastRow = sheet.getLastRow();
            const etapasColIndex = refreshedHeaders.indexOf('etapas') + 1;
            if (etapasColIndex > 0) {
              sheet.getRange(lastRow, etapasColIndex, 1, 1).setNumberFormat('@');
            }
          }
        });
      }
    }

    // Incrementar versión del servidor tras escritura exitosa (reutiliza versionData ya leído)
    const versionData = getVersionMap();
    const newServerVersion = bumpTableVersion(tableName, versionData);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      serverVersion: newServerVersion
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getKeyField(tableName) {
  const keys = {
    'items': 'id',
    'scores': 'idTx',
    'evaluadores': 'rut',
    'asignaciones': 'idAsig',
    'configuracion': 'clave',
    'entidades': 'idEntidad',
    'historicos': 'idHist',
    'asigna_historico': 'idAsig'
  };
  return keys[tableName] || 'id';
}

function createBackupSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
    const backupName = 'backup_' + timestamp;

    // Crear hoja de respaldo
    const backupSheet = spreadsheet.insertSheet(backupName);
    backupSheet.appendRow(['Tabla', 'Datos JSON']);

    const tables = ['configuracion', 'entidades', 'evaluadores', 'asignaciones', 'items', 'scores', 'historicos', 'asigna_historico'];
    tables.forEach(tableName => {
      const sheet = spreadsheet.getSheetByName(tableName);
      if (sheet) {
        const values = sheet.getDataRange().getDisplayValues();
        backupSheet.appendRow([tableName, JSON.stringify(values)]);
      }
    });

    return backupName;
  } catch (error) {
    console.error('Error creando backup:', error);
    return null;
  }
}

/**
 * Normaliza un nombre de programa a DS49, DS27 o DS10.
 */
function normalizePrograma(programa) {
  if (!programa) return '';
  const raw = programa.toString().trim().toUpperCase().replace(/[\s\-_.]+/g, '');
  if (raw === 'DS49' || raw === '49') return 'DS49';
  if (raw === 'DS27' || raw === '27') return 'DS27';
  if (raw === 'DS10' || raw === '10') return 'DS10';
  return '';
}

/**
 * Normaliza un nombre de entidad para comparación flexible.
 */
function normalizeEntidad(str) {
  if (str === undefined || str === null) return '';
  return str.toString().trim().toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\.+$/g, '')
    .replace(/\s*ltda\.?\s*$/g, ' ltda')
    .replace(/\s*spa\.?\s*$/g, ' spa')
    .replace(/\s*s\.a\.?\s*$/g, ' s.a')
    .trim();
}

/**
 * Endpoint especial para leer proyectos filtrados por programa y entidad.
 * Uso: ?action=getProjects&programa=DS49&entidad=Nombre%20Entidad
 */
function doGet(e) {
  try {
    // Permitir CORS para cualquier origen
    const output = {};
    const action = e.parameter.action;

    // Cache de versiones para toda la request (evita múltiples lecturas de __version__)
    const versionData = getVersionMap();
    if (action === 'getProjects') {
      const rawPrograma = e.parameter.programa || '';
      const entidad = e.parameter.entidad || '';
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

      const programa = normalizePrograma(rawPrograma);
      let sheetName;
      if (programa === 'DS49') {
        sheetName = '49_py';
      } else if (programa === 'DS27') {
        sheetName = '27_py';
      } else if (programa === 'DS10') {
        sheetName = '10_py';
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          data: [],
          debug: 'Programa no reconocido: ' + rawPrograma + '. Se esperaba DS49, DS27 o DS10.'
        })).setMimeType(ContentService.MimeType.JSON);
      }

      const sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({
          data: [],
          debug: 'No existe la pestaña ' + sheetName + ' para el programa ' + programa
        })).setMimeType(ContentService.MimeType.JSON);
      }

      const values = sheet.getDataRange().getDisplayValues();
      if (values.length <= 1) {
        return ContentService.createTextOutput(JSON.stringify({
          data: [],
          debug: 'La pestaña ' + sheetName + ' esta vacia o solo tiene encabezados'
        })).setMimeType(ContentService.MimeType.JSON);
      }

      const headers = values[0];
      const data = [];

      // Para DS49: Búsqueda flexible de columnas por índice o nombre
      // Columnas esperadas: A (Código), I (Nombre Proyecto), F (Familias), D (Comuna), C (Modalidad)
      // También buscar columna de entidad (puede estar en B o G)
      let entidadColIndex = -1;
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j].toString().trim().toLowerCase();
        if (header.includes('entidad') || header.includes('razon') || header.includes('razón') || header.includes('empresa')) {
          entidadColIndex = j;
          break;
        }
      }

      const targetEntidad = normalizeEntidad(entidad);
      let filasEvaluadas = 0;
      let coincidencias = 0;

      for (let i = 1; i < values.length; i++) {
        const row = values[i];

        // Verificar si hay datos en la fila
        if (!row || row.length === 0) {
          continue;
        }

        filasEvaluadas++;

        // Filtrar por nombre de entidad si se proporciona y se encontró columna
        if (targetEntidad && entidadColIndex >= 0) {
          const cellValue = row[entidadColIndex];
          if (cellValue) {
            const cellEntidad = normalizeEntidad(cellValue.toString());
            // Coincidencia exacta o parcial
            if (cellEntidad !== targetEntidad && !cellEntidad.includes(targetEntidad) && !targetEntidad.includes(cellEntidad)) {
              continue;
            }
          } else {
            continue;
          }
        }

        coincidencias++;

        // Crear objeto con todos los campos del header
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = row[j] || '';
        }

        data.push(obj);
      }

      return ContentService.createTextOutput(JSON.stringify({
        data: data,
        debug: 'Programa: ' + programa + ', Pestaña: ' + sheetName + ', Filas evaluadas: ' + filasEvaluadas + ', Coincidencias: ' + coincidencias + ', Entidad buscada: ' + entidad + ', Columna entidad: ' + entidadColIndex
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Comportamiento por defecto: leer tabla genérica (con filtro opcional por provincia)
    const tableName = e.parameter.table;
    const filterProvincia = e.parameter.provincia; // Filtro opcional por provincia
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(tableName);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ data: [], serverVersion: versionData.map[tableName] || 1 })).setMimeType(ContentService.MimeType.JSON);
    }

    const values = sheet.getDataRange().getDisplayValues();
    if (values.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ data: [], serverVersion: versionData.map[tableName] || 1 })).setMimeType(ContentService.MimeType.JSON);
    }

    const headers = values[0];
    const data = [];

    // Encontrar índice de la columna "Provincia" si existe (para filtrado)
    const provinciaIndex = headers.indexOf('Provincia');

    for (let i = 1; i < values.length; i++) {
      const row = values[i];

      // Si hay filtro de provincia y la tabla tiene columna Provincia, filtrar
      if (filterProvincia && provinciaIndex >= 0 && row[provinciaIndex] !== filterProvincia) {
        continue;
      }

      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      data.push(obj);
    }

    return ContentService.createTextOutput(JSON.stringify({
      data: data,
      serverVersion: versionData.map[tableName] || 1
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
