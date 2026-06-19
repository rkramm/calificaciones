const SPREADSHEET_ID = '1apPfP7Y3ancW166QGEvh07kESYjuV8sP-Wd14cnQjjo';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const tableName = payload.table;
    const dataArray = payload.data;
    const mode = payload.mode || 'replace'; // 'replace' o 'incremental'
    
    // Si es solicitud de backup, crear hoja de respaldo y retornar
    if (tableName === '__backup__') {
      const backupName = createBackupSheet();
      return ContentService.createTextOutput(JSON.stringify({ success: true, backupName: backupName })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(tableName);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(tableName);
    }
    
    // Definir headers según tabla
    let headers;
    if (tableName === 'historicos') {
      headers = ['PROVINCIA','PROGRAMA','ENTIDAD','CALIFICADOR','AÑO','1.1','1.2','1.3','1.4','1.5','1.6','1.7','1.8','1.9','2.1','2.2','2.3','2.4','2.5','2.6','2.7','2.8','2.9','3.1','3.2','3.3','3.4','3.5','3.6','3.7','4.1','4.2','4.3','4.4','4.5','4.6','4.7','4.8','4.9','4.10','5.1','5.2','5.3','5.4','5.5','5.6','5.7','6.1','6.2','6.3','6.4','6.5','6.6','6.7','6.8','6.9'];
    } else if (tableName === 'asigna_historico') {
      headers = ['idAsig','rut','programa','provincia','entidadId','entidadNombre','etapas'];
    } else if (dataArray && dataArray.length > 0) {
      headers = Object.keys(dataArray[0]);
    }
    
    if (mode === 'replace') {
      // Modo antiguo: reemplazar todo (solo para compatibilidad manual)
      sheet.clearContents();
      if (headers && dataArray && dataArray.length > 0) {
        const rows = dataArray.map(obj => headers.map(h => obj[h] !== undefined ? obj[h] : ""));
        sheet.appendRow(headers);
        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }
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
          const rowData = refreshedHeaders.map(h => obj[h] !== undefined ? obj[h] : "");
          if (rowMap[keyValue] !== undefined) {
            // Actualizar fila existente
            sheet.getRange(rowMap[keyValue] + 1, 1, 1, rowData.length).setValues([rowData]);
          } else {
            // Agregar nueva fila al final
            sheet.appendRow(rowData);
          }
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    
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

function doGet(e) {
  try {
    const tableName = e.parameter.table;
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(tableName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }
    
    // getDisplayValues trae el texto tal cual se ve en el Excel, previniendo errores de zonas horarias
    const values = sheet.getDataRange().getDisplayValues(); 
    if (values.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = values[0];
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = values[i][j];
      }
      data.push(obj);
    }
    
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}