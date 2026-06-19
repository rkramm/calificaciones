# Estado Actual del Sistema

Última actualización: 2026-06-19

## Cambios recientes
- Se implementó el módulo de calificaciones históricas.
- Se añadió el check "HISTORICO" con selector de año dinámico en la asignación rápida.
- Se creó el tab "Históricos" en el panel de administración.
- Se agregó la store 'historicos' en IndexedDB con registro por ítem.
- Se implementó guardar/cargar histórico local y sincronización masiva a Google Sheets en formato de fila ancha.
- Se actualizó Code.gs para manejar encabezados fijos de la pestaña 'historicos'.

## Enfoque actual
- Verificar estabilidad del nuevo módulo histórico.
- Validar sincronización incremental segura con Google Sheets (sin borrar datos manuales).
- Validar botón 'Descargar desde Nube' para traer históricos y asignaciones históricas.
- Validar que al abrir el sistema se puedan visualizar los históricos descargados.
- Validar respaldo automático en Sheets y JSON local antes de sincronizar.
- Validar botón Cancelar durante la sincronización.
