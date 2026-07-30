/* ================= DATA EXPORT - AISLADO DEL SISTEMA PRODUCTIVO ================= */
/*
 * Script dedicado SOLO a la exportación de datos para análisis y dashboard
 * NO modifica datos, SOLO lectura
 * Puede deployarse independientemente sin afectar el sistema de calificaciones
 */

const SPREADSHEET_ID = '1apPfP7Y3ancW166QGEvh07kESYjuV8sP-Wd14cnQjjo';

/**
 * Endpoint público: Devuelve datos de 'scores' para dashboard
 * URL: https://script.google.com/macros/s/[ID]/usercoderun?action=getScores
 */
function doGet(e) {
  const action = e.parameter.action || 'getScores';

  if (action === 'getScores') {
    return getScoresData();
  } else if (action === 'getSummary') {
    return getSummaryData();
  } else {
    return createResponse({ error: 'Action no reconocida' }, 400);
  }
}

/**
 * Obtiene todos los datos del sheet 'scores'
 */
function getScoresData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const scoresSheet = spreadsheet.getSheetByName('scores');

    if (!scoresSheet) {
      return createResponse({
        success: false,
        error: 'Sheet "scores" no encontrada'
      }, 404);
    }

    const range = scoresSheet.getDataRange();
    const values = range.getValues();
    const headers = values[0];
    const data = [];

    // Convertir filas a objetos
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      data.push(obj);
    }

    return createResponse({
      success: true,
      totalRecords: data.length,
      data: data,
      lastUpdate: new Date().toISOString()
    });

  } catch (error) {
    return createResponse({
      success: false,
      error: error.message
    }, 500);
  }
}

/**
 * Obtiene resumen consolidado de datos (sin detalles)
 */
function getSummaryData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const scoresSheet = spreadsheet.getSheetByName('scores');

    if (!scoresSheet) {
      return createResponse({
        success: false,
        error: 'Sheet "scores" no encontrada'
      }, 404);
    }

    const range = scoresSheet.getDataRange();
    const values = range.getValues();
    const headers = values[0];
    const data = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      data.push(obj);
    }

    // Análisis
    const provincias = [...new Set(data.map(r => r.provincia).filter(p => p))];
    const entidades = [...new Set(data.map(r => r.entidad).filter(e => e))];
    const programas = [...new Set(data.map(r => r.programa).filter(p => p))];
    const evaluadores = [...new Set(data.map(r => r.nombreEvaluador).filter(e => e))];

    // Promedio general
    const scores = data.map(r => parseInt(r.score) || 0).filter(s => s > 0);
    const promedioGeneral = scores.length > 0 ? (scores.reduce((a, b) => a + b) / scores.length).toFixed(2) : 0;

    // Calificaciones por provincia
    const calPorProvincia = {};
    provincias.forEach(prov => {
      const pScores = data.filter(r => r.provincia === prov && r.score).map(r => parseInt(r.score) || 0).filter(s => s > 0);
      if (pScores.length > 0) {
        calPorProvincia[prov] = (pScores.reduce((a, b) => a + b) / pScores.length).toFixed(2);
      }
    });

    // Calificaciones por entidad
    const calPorEntidad = {};
    entidades.forEach(ent => {
      const eScores = data.filter(r => r.entidad === ent && r.score).map(r => parseInt(r.score) || 0).filter(s => s > 0);
      if (eScores.length > 0) {
        calPorEntidad[ent] = {
          promedio: (eScores.reduce((a, b) => a + b) / eScores.length).toFixed(2),
          cantidad: eScores.length
        };
      }
    });

    return createResponse({
      success: true,
      summary: {
        totalRecords: data.length,
        totalProvincias: provincias.length,
        totalEntidades: entidades.length,
        totalProgramas: programas.length,
        totalEvaluadores: evaluadores.length,
        promedioGeneral: promedioGeneral
      },
      calificacionesPorProvincia: calPorProvincia,
      calificacionesPorEntidad: calPorEntidad,
      lastUpdate: new Date().toISOString()
    });

  } catch (error) {
    return createResponse({
      success: false,
      error: error.message
    }, 500);
  }
}

/**
 * Helper: crear respuesta JSON estándar
 */
function createResponse(data, statusCode = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
