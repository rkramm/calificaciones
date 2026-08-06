/* ======================================================================
   informe.js — Informe de Resultados de Precalificación EP 2026
   Página completamente separada del calificador/admin (index.html + app.js):
   no comparte código ni estado con ellos, solo la misma API de Google Apps
   Script (Code.gs) y el mismo config.js/config.default.js para la URL.

   Lógica de datos (rebuildData, renderEntidades, renderHistorico, RUBRICA_ETAPAS,
   scoreBand/heatCls/scoreBadge) portada y adaptada desde Dashboard_Precalificaciones.html
   (ya construido y probado con datos reales de este mismo proyecto), cambiando
   la fuente de datos de JSON embebido (loadSheet) a lectura en vivo (cloudGet).
   ====================================================================== */

const GOOGLE_SCRIPT_URL = (typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_SCRIPT_URL) || '';

/* ======================================================================
   0. Utilidades generales (idénticas a Dashboard_Precalificaciones.html)
   ====================================================================== */
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
const fmt0 = n => n==null || isNaN(n) ? '—' : Math.round(n).toLocaleString('es-CL');
const mean = arr => arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : null;
const esc = s => (s==null?'':String(s)).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function normName(s){
  return (s||'').toString().trim().toUpperCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/\s+/g,' ');
}
function normHeader(s){
  return (s||'').toString().trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/\s+/g,' ');
}
function getByHeader(row, candidates){
  for (const cand of candidates) {
    const nc = normHeader(cand);
    const k = Object.keys(row).find(k => normHeader(k) === nc);
    if (k !== undefined) return row[k];
  }
  return undefined;
}
function titleCase(s){
  return (s||'').toString().trim().toLowerCase().replace(/(^|\s|-)([a-záéíóúñ])/g, (m,sep,c)=> sep + c.toUpperCase());
}
const PROVINCIA_DISPLAY = { 'OSORNO':'Osorno', 'LLANQUIHUE':'Llanquihue', 'CHILOE':'Chiloé', 'PALENA':'Palena' };
function provinciaDisplay(s){
  const k = normName(s).replace(/[^A-Z]/g,'');
  return PROVINCIA_DISPLAY[k] || titleCase(s);
}
const PROGRAMA_COLOR = { DS10: 'var(--series-1)', DS27: 'var(--series-2)', DS49: 'var(--series-3)' };
const PROGRAMA_ORDER = ['DS10','DS27','DS49'];
const PROVINCIA_ORDER = ['Osorno','Llanquihue','Chiloé','Palena'];

function scoreBand(score){
  if (score == null || isNaN(score)) return { cls:'', label:'Sin datos', color:'var(--text-muted)' };
  if (score >= 80) return { cls:'good', label:'Bueno', color:'var(--good)' };
  if (score >= 50) return { cls:'warning', label:'Aceptable', color:'var(--warning)' };
  return { cls:'critical', label:'Bajo', color:'var(--critical)' };
}
function heatCls(score){
  if (score == null || isNaN(score)) return '';
  return ' heat-' + scoreBand(score).cls;
}
function scoreBadge(score){
  const b = scoreBand(score);
  const val = score==null ? '—' : fmt0(score);
  if (!score && score!==0) return `<span class="badge"><span class="dot" style="background:var(--text-muted)"></span>${val}</span>`;
  return `<span class="badge ${b.cls}"><span class="dot" style="background:${b.color}"></span>${val} · ${b.label}</span>`;
}
function provColor(p){
  return { Osorno:'var(--series-4)', Llanquihue:'var(--series-5)', Chiloé:'var(--series-7)', Palena:'var(--series-8)' }[p] || 'var(--text-muted)';
}

/* ======================================================================
   1. Comunicación con Google Apps Script (mismo protocolo que app.js:
   POST con Content-Type text/plain para evitar preflight CORS, sin
   campo 'action' para lecturas/escrituras genéricas por tabla)
   ====================================================================== */
const serverVersions = {};

async function cloudGet(table){
  try {
    const controller = new AbortController();
    // 45s: este backend puede tardar bastante más de los 15s habituales bajo
    // ciertas condiciones (posible cold-start de Apps Script + spreadsheet grande).
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      signal: controller.signal,
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'getTable', table })
    });
    clearTimeout(timeoutId);
    if (!response.ok) { console.error(`Error HTTP al obtener ${table}:`, response.status); return null; }
    const payload = await response.json();
    if (payload && typeof payload.serverVersion === 'number') serverVersions[table] = payload.serverVersion;
    return Array.isArray(payload) ? payload : (payload.data || []);
  } catch (error) {
    console.error(`Error leyendo tabla ${table}:`, error);
    return null;
  }
}

async function cloudSave(table, dataArray, mode='incremental', options={}){
  try {
    const clientVersion = serverVersions[table] || 1;
    const body = { table, data: dataArray, mode, clientVersion };
    if (options.deleteKeys && options.deleteKeys.length > 0) {
      body.deleteKeys = options.deleteKeys;
    }
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    });
    const result = await response.json();
    if (result && result.success && typeof result.serverVersion === 'number') {
      serverVersions[table] = result.serverVersion;
    }
    return result || { success: false, error: 'Sin respuesta del servidor' };
  } catch (error) {
    console.error(`Error guardando en ${table}:`, error);
    return { success: false, error: error.message };
  }
}

async function verifyAdminPassword(password){
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'verifyAdminPassword', password })
    });
    const result = await response.json();
    return !!(result && result.success === true);
  } catch (error) {
    console.error('Error verificando contraseña:', error);
    return false;
  }
}

/* ======================================================================
   2. Login (página independiente, sin sesión compartida con index.html)
   ====================================================================== */
function initLogin(){
  const btn = $('#btn-login');
  const input = $('#login-password');
  const errEl = $('#login-error');

  async function attemptLogin(){
    const password = input.value;
    if (!password) { errEl.textContent = 'Ingrese la contraseña de administrador.'; return; }
    btn.disabled = true;
    errEl.textContent = '';
    const ok = await verifyAdminPassword(password);
    btn.disabled = false;
    if (!ok) { errEl.textContent = '❌ Contraseña incorrecta.'; input.value = ''; input.focus(); return; }
    $('#login-screen').classList.add('hidden');
    $('#app-root').classList.remove('hidden');
    boot();
  }
  btn.addEventListener('click', attemptLogin);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin(); });
  input.focus();
}

/* ======================================================================
   3. Carga de datos desde Google Sheets (reemplaza loadSheet())
   ====================================================================== */
let entidadesRows = [], asignacionesRows = [], scoresRows = [], historicoRows = [];
let py49Rows = [], py27Rows = [], py10Rows = [];

async function loadAllData(){
  // Carga secuencial (no Promise.all): este backend de Apps Script puede tener
  // contención cuando recibe varias ejecuciones simultáneas contra el mismo
  // script/spreadsheet, lo que hacía que las 8 lecturas en paralelo se
  // demoraran más que el timeout individual. Uno por uno es más lento en
  // total, pero mucho más confiable - y esta página se carga una sola vez,
  // no repetidamente como el calificador.
  const tables = [
    ['entidades', 'Entidades'],
    ['asignaciones', 'Asignaciones'],
    ['scores', 'Calificaciones'],
    ['Califica_historico', 'Histórico'],
    ['49_py', 'Proyectos DS49'],
    ['27_py', 'Proyectos DS27'],
    ['10_py', 'Proyectos DS10'],
    ['Reunion_calificacion', 'Comentarios de consenso'],
  ];
  const results = {};
  const statusEl = document.getElementById('data-status');
  for (let i = 0; i < tables.length; i++) {
    const [key, label] = tables[i];
    if (statusEl) statusEl.textContent = `Cargando ${label}… (${i + 1}/${tables.length})`;
    results[key] = await cloudGet(key);
  }
  entidadesRows    = Array.isArray(results.entidades) ? results.entidades : [];
  asignacionesRows = Array.isArray(results.asignaciones) ? results.asignaciones : [];
  scoresRows       = Array.isArray(results.scores) ? results.scores.map(s => ({ ...s, stage: parseInt(s.stage,10), score: parseFloat(s.score) })) : [];
  historicoRows    = Array.isArray(results.Califica_historico) ? results.Califica_historico : [];
  py49Rows         = Array.isArray(results['49_py']) ? results['49_py'] : [];
  py27Rows         = Array.isArray(results['27_py']) ? results['27_py'] : [];
  py10Rows         = Array.isArray(results['10_py']) ? results['10_py'] : [];
  loadComentariosFromRows(Array.isArray(results.Reunion_calificacion) ? results.Reunion_calificacion : []);
}

/* ======================================================================
   4. Comentarios de consenso — SOLO por entidad (no por cobertura/programa),
   guardados en la hoja 'Reunion_calificacion' (clave primaria: rut).
   ====================================================================== */
let comentariosMap = new Map(); // rut -> { nombreEntidad, calificacion, comentario }
function loadComentariosFromRows(rows){
  comentariosMap = new Map();
  rows.forEach(r => {
    const rut = (r.rut || '').toString().trim();
    if (!rut) return;
    comentariosMap.set(rut, {
      nombreEntidad: r.nombreEntidad || '',
      calificacion: r.calificacion !== undefined && r.calificacion !== '' ? parseFloat(r.calificacion) : null,
      comentario: r.comentario || '',
    });
  });
}
function commentIconSvg(){
  return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 4.5h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8l-4 3v-3H3a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" stroke-linejoin="round" stroke-linecap="round"/></svg>';
}
function commentBtnHtml(rut, label){
  const has = comentariosMap.has(rut);
  return `<button type="button" class="comment-btn${has?' has-comment':''}" data-rut="${esc(rut)}" data-label="${esc(label)}" title="${has?'Editar comentario':'Agregar comentario'}">${commentIconSvg()}</button>`;
}
function commentNoteHtml(rut){
  const c = comentariosMap.get(rut);
  if (!c || !c.comentario) return '';
  const califTxt = c.calificacion != null ? ` <b>(Consenso: ${fmt0(c.calificacion)})</b>` : '';
  return `<div class="comment-note"><span class="comment-note-icon">${commentIconSvg()}</span><span class="comment-note-text">${esc(c.comentario)}${califTxt}</span></div>`;
}
let commentModalRut = null;
function openCommentModal(rut, label){
  commentModalRut = rut;
  const existing = comentariosMap.get(rut);
  $('#comment-modal-label').textContent = label;
  $('#comment-modal-textarea').value = existing ? existing.comentario : '';
  $('#comment-modal-calificacion').value = existing && existing.calificacion != null ? existing.calificacion : '';
  $('#comment-modal-delete').style.display = existing ? '' : 'none';
  $('#comment-modal-backdrop').classList.add('open');
  $('#comment-modal-textarea').focus();
}
function closeCommentModal(){
  $('#comment-modal-backdrop').classList.remove('open');
  commentModalRut = null;
}
function isCommentModalOpen(){ return $('#comment-modal-backdrop').classList.contains('open'); }
function refreshOpenCommentTargets(){
  if (selectedEntidadRut) openEntidadDetail(selectedEntidadRut);
}
async function saveComentario(rut, nombreEntidad, calificacion, comentario){
  const trimmed = (comentario||'').trim();
  const calif = calificacion !== '' && calificacion != null && !isNaN(calificacion) ? Math.round(calificacion) : '';
  if (!trimmed && calif === '') {
    comentariosMap.delete(rut);
  } else {
    comentariosMap.set(rut, { nombreEntidad, calificacion: calif === '' ? null : calif, comentario: trimmed });
  }
  const result = await cloudSave('Reunion_calificacion', [{
    rut, nombreEntidad, calificacion: calif, comentario: trimmed
  }], 'incremental');
  if (!result || !result.success) {
    alert('⚠️ No se pudo guardar el comentario en el servidor. Intente nuevamente.');
  }
}
async function deleteComentario(rut){
  comentariosMap.delete(rut);
  // Borrado real: la fila con este rut se elimina físicamente de Reunion_calificacion
  // (mismo mecanismo deleteKeys que usa el calificador para borrar notas de scores).
  const result = await cloudSave('Reunion_calificacion', [], 'incremental', { deleteKeys: [rut] });
  if (!result || !result.success) {
    alert('⚠️ No se pudo confirmar el borrado en el servidor.');
  }
}
function initCommentModal(){
  $('#comment-modal-close').addEventListener('click', closeCommentModal);
  $('#comment-modal-cancel').addEventListener('click', closeCommentModal);
  $('#comment-modal-backdrop').addEventListener('click', e => { if (e.target.id === 'comment-modal-backdrop') closeCommentModal(); });
  $('#comment-modal-save').addEventListener('click', async () => {
    if (!commentModalRut) return;
    // Capturar ANTES de closeCommentModal(), que pone commentModalRut = null.
    // Bug anterior: se leía commentModalRut después de cerrar el modal, por lo
    // que siempre se guardaba rut: null en Reunion_calificacion.
    const rut = commentModalRut;
    const e = entidadesList.find(x => x.rut === rut);
    const nombreEntidad = e ? e.nombre : (comentariosMap.get(rut)?.nombreEntidad || '');
    const califVal = $('#comment-modal-calificacion').value;
    const textoVal = $('#comment-modal-textarea').value;
    closeCommentModal();
    refreshOpenCommentTargets();
    await saveComentario(rut, nombreEntidad, califVal, textoVal);
    refreshOpenCommentTargets();
  });
  $('#comment-modal-delete').addEventListener('click', async () => {
    if (!commentModalRut) return;
    const rut = commentModalRut;
    closeCommentModal();
    refreshOpenCommentTargets();
    await deleteComentario(rut);
    refreshOpenCommentTargets();
  });
}
function wireCommentButtons(container){
  $$('.comment-btn', container).forEach(btn => {
    btn.addEventListener('click', ev => {
      ev.stopPropagation();
      openCommentModal(btn.dataset.rut, btn.dataset.label);
    });
  });
}

/* ======================================================================
   5. Modelo de datos (rebuildData) — portado de Dashboard_Precalificaciones.html,
   adaptado a los nombres reales de campo de las hojas de Google Sheets.
   ====================================================================== */
let coberturas, entidadesList;
const HIST_YEARS = [2021, 2022, 2023, 2024, 2025];

function rebuildData(){
  const entidadPorRut = new Map();
  const rutPorNombre  = new Map();

  entidadesRows.forEach(r => {
    const rut = (r.rut||'').toString().trim();
    const nombre = (r.Nombre||'').toString().trim();
    if (!rut || !nombre) return;
    if (!entidadPorRut.has(rut)) {
      entidadPorRut.set(rut, { rut, nombre, comunas:new Set(), programas:new Set(), provincias:new Set() });
    }
    const e = entidadPorRut.get(rut);
    const prov = provinciaDisplay(r.Provincia);
    if (r.Comuna) r.Comuna.toString().split(/[-,\/]/).map(s=>s.trim()).filter(Boolean).forEach(c => e.comunas.add(titleCase(c)));
    if (r.Programa) e.programas.add(r.Programa.toString().trim());
    if (prov && prov !== 'Titlecase') e.provincias.add(prov);
    rutPorNombre.set(normName(nombre), rut);
  });

  function findRutByName(nombre){
    const n = normName(nombre);
    if (rutPorNombre.has(n)) return rutPorNombre.get(n);
    for (const [k,v] of rutPorNombre.entries()){
      if (k.startsWith(n.slice(0,18)) || n.startsWith(k.slice(0,18))) return v;
    }
    return null;
  }

  coberturas = new Map();
  function coberturaKey(nombre, programa, provincia){
    return normName(nombre) + '|' + (programa||'').toString().trim() + '|' + normName(provincia);
  }
  function getCobertura(nombre, programa, provincia){
    const provD = provinciaDisplay(provincia);
    const key = coberturaKey(nombre, programa, provD);
    if (!coberturas.has(key)) {
      coberturas.set(key, {
        key, nombre: nombre.toString().trim(), programa: (programa||'').toString().trim(), provincia: provD,
        scores: [], evaluadores: new Set(), stageScores: {1:[],2:[],3:[],4:[],5:[],6:[]}, items: [],
      });
    }
    return coberturas.get(key);
  }

  scoresRows.forEach(r => {
    if (!r.entidad || (!r.score && r.score!==0)) return;
    const c = getCobertura(r.entidad, r.programa, r.provincia);
    const s = Number(r.score);
    if (!isNaN(s)) {
      c.scores.push(s);
      if (r.stage && c.stageScores[r.stage]) c.stageScores[r.stage].push(s);
      c.items.push({ itemId: r.itemId, stage: r.stage, score: s, evaluador: r.nombreEvaluador, hora: r.hora });
    }
    if (r.rutEvaluador) c.evaluadores.add(r.rutEvaluador);
  });

  asignacionesRows.forEach(r => {
    if (!r.entidadNombre) return;
    getCobertura(r.entidadNombre, r.programa, r.provincia);
  });

  coberturas.forEach(c => {
    c.avgScore = c.scores.length ? mean(c.scores) : null;
    c.stageAvg = {};
    for (let s=1; s<=6; s++) c.stageAvg[s] = c.stageScores[s].length ? mean(c.stageScores[s]) : null;
    c.rut = findRutByName(c.nombre);
  });

  // Histórico (hoja 'Califica_historico': columnas Entidad, Rut, 2025, 2024, 2023, 2022, 2021)
  const historicoPorRut = new Map();
  historicoRows.forEach(r => {
    const rut = String(getByHeader(r, ['RUT','Rut','rut']) || '').trim();
    if (!rut) return;
    const years = {};
    HIST_YEARS.forEach(y => {
      const raw = getByHeader(r, ['Año ' + y, 'Ano ' + y, String(y)]);
      const v = parseFloat(String(raw==null?'':raw).replace(',','.'));
      years[y] = (isNaN(v) || v === 0) ? null : v;
    });
    const nombre = getByHeader(r, ['Entidad','entidad']);
    historicoPorRut.set(rut, { nombre, years, y2024: years[2024], y2025: years[2025] });
  });

  // Proyectos ejecutados (49_py / 27_py / 10_py) por entidad
  const proyectosPorEntidad = new Map();
  function addProyecto(nombreRaw, programa, familias){
    if (!nombreRaw) return;
    const key = normName(nombreRaw);
    if (!proyectosPorEntidad.has(key)) proyectosPorEntidad.set(key, { count:0, familias:0 });
    const p = proyectosPorEntidad.get(key);
    p.count += 1;
    const f = Number(familias); if (!isNaN(f)) p.familias += f;
  }
  py49Rows.forEach(r => addProyecto(r.Entidad, 'DS49', r['Nº FAMILIAS']));
  py27Rows.forEach(r => addProyecto(r.Entidad, 'DS27', r.Nfamilias));
  py10Rows.forEach(r => addProyecto(r['Entidad Patrocinante'], 'DS10', r.Familias));
  function findProyectos(nombre){
    const n = normName(nombre);
    if (proyectosPorEntidad.has(n)) return proyectosPorEntidad.get(n);
    for (const [k,v] of proyectosPorEntidad.entries()){
      if (k.startsWith(n.slice(0,18)) || n.startsWith(k.slice(0,18))) return v;
    }
    return null;
  }

  entidadesList = Array.from(entidadPorRut.values()).map(e => {
    const cobs = Array.from(coberturas.values()).filter(c => c.rut === e.rut);
    const scored = cobs.filter(c => c.avgScore != null);
    const avgScoreGlobal = scored.length ? mean(scored.map(c=>c.avgScore)) : null;
    const hist = historicoPorRut.get(e.rut) || null;
    const proy = findProyectos(e.nombre);
    const evaluadoresSet = new Set();
    cobs.forEach(c => c.evaluadores.forEach(ev => evaluadoresSet.add(ev)));
    return {
      rut: e.rut, nombre: e.nombre,
      comunas: Array.from(e.comunas).sort(),
      programas: Array.from(e.programas).sort((a,b)=>PROGRAMA_ORDER.indexOf(a)-PROGRAMA_ORDER.indexOf(b)),
      provincias: Array.from(e.provincias).sort((a,b)=>PROVINCIA_ORDER.indexOf(a)-PROVINCIA_ORDER.indexOf(b)),
      coberturas: cobs,
      avgScoreGlobal, evaluadaCount: scored.length, pendienteCount: cobs.length - scored.length,
      histYears: hist ? hist.years : {},
      y2024: hist ? hist.y2024 : null, y2025: hist ? hist.y2025 : null,
      proyectos: proy ? proy.count : 0, familias: proy ? proy.familias : 0,
      numEvaluadores: evaluadoresSet.size,
    };
  });
}

/* ======================================================================
   6. Filtros globales
   ====================================================================== */
const state = { programa:'', provincia:'', search:'', view:'entidades' };
function filteredCoberturas(){
  if (!coberturas) return []; // Datos aún no cargados (rebuildData no ha corrido todavía)
  return Array.from(coberturas.values()).filter(c => {
    if (state.programa && c.programa !== state.programa) return false;
    if (state.provincia && c.provincia !== state.provincia) return false;
    if (state.search && !normName(c.nombre).includes(normName(state.search))) return false;
    return true;
  });
}
function filteredEntidades(){
  if (!entidadesList) return []; // Datos aún no cargados
  const covKeys = new Set(filteredCoberturas().map(c=>c.key));
  return entidadesList.filter(e => {
    if (state.search && !normName(e.nombre).includes(normName(state.search))) return false;
    if (!state.programa && !state.provincia) return true;
    return e.coberturas.some(c => covKeys.has(c.key));
  });
}

/* ======================================================================
   7. Mini librería de gráficos SVG + tooltip (portado, sin cambios)
   ====================================================================== */
function svgEl(w,h){ return `<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%" height="${h}">`; }
function barList(container, items, opts={}){
  const max = Math.max(...items.map(i=>i.value||0), opts.max||0, 0.0001);
  container.innerHTML = `<div class="barlist">` + items.map(it => {
    const pct = Math.max(2, (it.value||0)/max*100);
    const color = it.color || 'var(--series-1)';
    return `<div class="row" style="display:grid;grid-template-columns:140px 1fr 54px;align-items:center;gap:10px" data-tt="${esc(it.label+': '+(opts.fmt?opts.fmt(it.value):fmt0(it.value)))}">
      <div class="name" style="font-size:12.5px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(it.label)}">${esc(it.label)}</div>
      <div style="position:relative;height:20px;background:var(--surface-2);border-radius:4px;overflow:hidden"><div style="position:absolute;top:0;left:0;height:100%;border-radius:4px;width:${pct}%;background:${color}"></div></div>
      <div style="font-size:12.5px;font-weight:600;text-align:right;font-variant-numeric:tabular-nums">${opts.fmt ? opts.fmt(it.value) : fmt0(it.value)}</div>
    </div>`;
  }).join('') + `</div>`;
  attachBarTooltips(container);
}
function attachBarTooltips(container){
  $$('.row[data-tt]', container).forEach(row => {
    row.addEventListener('mousemove', e => showTooltip(e, row.dataset.tt));
    row.addEventListener('mouseleave', hideTooltip);
  });
}
function lineChart(container, series, opts={}){
  const W = opts.w || 560, H = opts.h || 200, pad = {l:34,r:16,t:14,b:26};
  const xs = series[0].points.map(p=>p.x);
  const allY = series.flatMap(s=>s.points.map(p=>p.y)).filter(v=>v!=null);
  const yMax = opts.yMax || Math.max(...allY, 10) * 1.12;
  const yMin = opts.yMin != null ? opts.yMin : 0;
  const xN = xs.length;
  const xPos = i => pad.l + (i/(xN-1||1)) * (W-pad.l-pad.r);
  const yPos = v => H-pad.b - ((v-yMin)/(yMax-yMin||1)) * (H-pad.t-pad.b);
  let grid = '';
  for (let i=0;i<=4;i++){
    const v = yMin + (yMax-yMin)*i/4;
    const y = yPos(v);
    grid += `<line class="grid-line" x1="${pad.l}" y1="${y}" x2="${W-pad.r}" y2="${y}"/>`;
    grid += `<text x="${pad.l-8}" y="${y+3}" text-anchor="end">${fmt0(v)}</text>`;
  }
  let xlabels = xs.map((x,i)=>`<text x="${xPos(i)}" y="${H-8}" text-anchor="middle">${esc(x)}</text>`).join('');
  let paths = '';
  series.forEach(s => {
    const pts = s.points.filter(p=>p.y!=null).map(p=> `${xPos(xs.indexOf(p.x))},${yPos(p.y)}`);
    if (pts.length){
      paths += `<polyline fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="${pts.join(' ')}"/>`;
      s.points.forEach(p => { if (p.y==null) return;
        const cx=xPos(xs.indexOf(p.x)), cy=yPos(p.y);
        paths += `<circle cx="${cx}" cy="${cy}" r="4.5" fill="${s.color}" stroke="var(--surface-1)" stroke-width="2" data-tt="${esc(s.label)} · ${esc(p.x)}: ${fmt0(p.y)}" class="line-dot"/>`;
      });
    }
  });
  container.innerHTML = `${svgEl(W,H)}${grid}${paths}${xlabels}</svg>`;
  $$('.line-dot', container).forEach(d => {
    d.addEventListener('mousemove', e => showTooltip(e, d.dataset.tt));
    d.addEventListener('mouseleave', hideTooltip);
  });
}
function showTooltip(e, html){
  const tt = $('#tooltip');
  tt.innerHTML = html;
  tt.classList.add('show');
  tt.style.left = Math.min(e.clientX+14, window.innerWidth-260) + 'px';
  tt.style.top = Math.max(e.clientY-10, 10) + 'px';
}
function hideTooltip(){ $('#tooltip').classList.remove('show'); }

/* ======================================================================
   8. Rúbrica por ítem — pauta oficial. Solo la etapa 2 tiene nombre y
   descripción confirmados con la fuente oficial; el resto muestra
   únicamente el código del ítem, sin inventar categorías.
   ====================================================================== */
const RUBRICA_ETAPAS = {
  1: {
    items: {
      '1.1': 'Calidad en la gestión y desarrollo del(los) servicio (s) de asistencia técnica',
      '1.2': 'Preparación y desarrollo de diagnósticos técnicos y sociales pertinentes.',
      '1.3': 'Entrega oportuna de información del proyecto a las familias.',
      '1.4': 'Participación activa de las familias en la aprobación del proyecto.',
      '1.5': 'Calidad y disponibilidad de información y/o antecedentes solicitados por el organismo de revisión.',
      '1.6': 'Organización adecuada del trabajo en terreno.',
      '1.7': 'Disposición para atender a las familias en dependencias adecuadas y bien equipadas.',
      '1.8': 'Efectiva coordinación con la contraparte técnica de revisión.',
    },
  },
  2: {
    nombre: 'Elaboración y presentación del proyecto',
    descripcion: 'desarrollo integral de los diseños arquitectónicos, de loteos, de especialidades técnicas e ingeniería estructural; cubicaciones, presupuestos detallados y especificaciones técnicas normativas.',
    items: {
      '2.1': 'Adecuada evaluación técnica y/o legal de bienes inmuebles',
      '2.2': 'Calidad del (los) proyecto (s) presentado (s)',
      '2.3': 'Resolución oportuna de observaciones al (los) proyecto (s) formuladas.',
      '2.4': 'Calidad de la gestión externa con empresas de servicios constructores y otras entidades públicas y privadas relacionadas con la formulación del proyecto.',
      '2.5': 'Evaluación técnica y/o legal adecuada de terrenos y otros bienes inmuebles.',
      '2.6': 'Adecuado desarrollo del proceso de elección y selección de la Empresa Constructora.',
      '2.7': 'Calidad y disponibilidad de información y/o antecedentes solicitados.',
      '2.8': 'Disposición y organización adecuada del trabajo de terreno.',
      '2.9': 'Efectiva coordinación con la contraparte técnica.',
    },
  },
  3: {
    items: {
      '3.1': 'Calidad en la gestión y desarrollo del (los) servicio (s) de asistencia técnica',
      '3.2': 'Coordinación con actores externos CBR, DOM y otras entidades públicas y privadas vinculadas al desarrollo del proyecto.',
      '3.3': 'Gestión legal y administrativa adecuada para la compra o el traspaso y/o compra de otros bienes inmuebles.',
      '3.4': 'Cumplimiento de plazos asociados a este servicio (traspasos recepciones, inscripciones.. etc.)',
      '3.5': 'Calidad de la atención legal a usuarios/beneficiarios',
      '3.6': 'Calidad y disponibilidad de información y/o antecedentes solicitados por otros organismos públicos y privados',
      '3.7': 'Efectiva coordinación técnica general.',
    },
  },
  4: {
    items: {
      '4.1': 'Calidad en la gestión y desarrollo del (los) servicio (s) de asistencia técnica',
      '4.2': 'Calidad de la atención a usuarios/beneficiarios',
      '4.3': 'Adecuada relación y coordinación con proveedores y otras entidades públicas y privadas relacionadas con el desarrollo material del proyecto.',
      '4.4': 'Resolución oportuna de observaciones al (los) proyecto (s) y a problemas técnicos, financieros, sociales o administrativos durante su ejecución.',
      '4.5': 'Verificación oportuna del cumplimiento de las obligaciones contractuales y laborales de la empresa Constructora.',
      '4.6': 'Realización oportuna de las modificaciones del proyecto cuando corresponda.',
      '4.7': 'Calidad y disponibilidad de información y/o antecedentes del proyecto solicitados oportunamente.',
      '4.8': 'Coordinación adecuada con otros organismos para verificar el término del proyecto y con la empresa constructora para aprobar el proceso de post venta.',
      '4.9': 'Gestión técnica y administrativa oportuna respecto de temas relacionados con subsidios (prórrogas, reemplazos, etc)',
      '4.10': 'Efectiva coordinación institucional.',
    },
  },
  5: {
    items: {
      '5.1': 'Calidad en la gestión y desarrollo del (los) servicio (s) de asistencia técnica',
      '5.2': 'Calidad del acompañamiento social a usuarios/beneficiarios',
      '5.3': 'Desarrollo adecuado y oportuno de talleres y/o jornadas de capacitación a las familias sobre temas vinculados a derechos y deberes como propietarios.',
      '5.4': 'Entrega oportuna sobre información del avance del proyecto a las familias y/o modificaciones a éste durante su desarrollo.',
      '5.5': 'Capacidad de resolver conflictos entre las familias y/o entre las familias y la Empresa Construcción.',
      '5.6': 'Presencia activa de profesionales del área social en las actividades en terreno.',
      '5.7': 'Efectiva coordinación técnica del área social.',
    },
  },
  6: {
    items: {
      '6.1': 'Calidad en la gestión y desarrollo del (los) servicio (s) de asistencia técnica',
      '6.2': 'Calidad de la atención a usuarios/beneficiarios durante el proceso de instalación de las familias en sus viviendas y barrios cuando corresponda.',
      '6.3': 'Cumplimiento de plazos en el desarrollo de los servicios asociados a la post entrega.',
      '6.4': 'Desarrollo oportuno de talleres y/o capacitaciones sobre el uso y cuidado de la vivienda a las familias.',
      '6.5': 'Entrega de información pertinente y oportuna a las familias sobre la existencia y funcionamiento de servicios y organismos locales.',
      '6.6': 'Entrega de información confiable sobre ocupación de las viviendas.',
      '6.7': 'Calidad y disponibilidad de información y/o antecedentes solicitados.',
      '6.8': 'Desarrollo oportuno de talleres de capacitación a las familias acerca del proceso de vida en comunidad y ley de copropiedad inmobiliaria cuando corresponda',
      '6.9': 'Efectiva coordinación de cierre final.',
    },
  },
};
function rubricScoreStyle(score){
  const band = scoreBand(score);
  const textColor = band.cls === 'warning' ? '#5c4400' : '#fff';
  return `background:${band.color}; color:${textColor}`;
}

/* ======================================================================
   9. Vista: Entidades
   ====================================================================== */
let selectedEntidadRut = null;
const entSort = { key: 'avgScoreGlobal', dir: -1 };

function renderEntidades(){
  const el = $('#view-entidades');
  selectedEntidadRut = null;
  el.innerHTML = `
    <div class="entidades-split" id="entidades-split">
      <div class="entidades-list-pane">
        <div class="card">
          <div class="table-toolbar">
            <span class="count" id="ent-count"></span>
            <button class="import-btn" id="btn-export-entidades">Exportar a Excel</button>
          </div>
          <div class="card-scroll">
            <table class="data" id="tbl-entidades" style="table-layout:fixed; min-width:1040px">
              <colgroup>
                <col style="width:26%"><col style="width:12%"><col style="width:12%">
                <col style="width:9%"><col style="width:7%"><col style="width:8%">
                <col style="width:7%"><col style="width:19%">
              </colgroup>
              <thead><tr>
                <th data-k="nombre">Entidad</th>
                <th data-k="provincias">Provincia(s)</th>
                <th data-k="programas">Programa(s)</th>
                <th data-k="comunas" class="num-center">N° comunas</th>
                <th data-k="proyectos" class="num-center">Proyectos</th>
                <th data-k="familias" class="num-center">Familias</th>
                <th data-k="y2025" class="num-center">2025</th>
                <th data-k="avgScoreGlobal">2026 (actual)</th>
              </tr></thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>
      <aside class="entidad-detail-pane" id="entidad-detail-pane"></aside>
    </div>
  `;
  $$('#tbl-entidades th').forEach(th => th.addEventListener('click', () => {
    const k = th.dataset.k;
    entSort.dir = (entSort.key===k) ? -entSort.dir : -1;
    entSort.key = k;
    paintEntidadesTable();
  }));
  $('#btn-export-entidades').addEventListener('click', () => {
    const headers = ['Entidad','Provincia(s)','Programa(s)','N° comunas','Proyectos','Familias','2025','2026 (actual)'];
    const rows = getSortedEntidades().map(e => [
      e.nombre, e.provincias.join(', '), e.programas.join(', '), e.comunas.length,
      e.proyectos, e.familias, e.y2025 ?? '', e.avgScoreGlobal!=null ? Math.round(e.avgScoreGlobal) : '',
    ]);
    exportXlsx('Entidades_Precalificaciones.xlsx', 'Entidades', headers, rows);
  });
  paintEntidadesTable();
}
function getSortedEntidades(){
  const list = filteredEntidades().slice();
  list.sort((a,b) => {
    let va = a[entSort.key], vb = b[entSort.key];
    if (Array.isArray(va)) { va = va.length; vb = vb.length; }
    if (va == null) va = -Infinity; if (vb == null) vb = -Infinity;
    if (typeof va === 'string') return va.localeCompare(vb) * entSort.dir;
    return (va - vb) * entSort.dir;
  });
  return list;
}
function paintEntidadesTable(){
  const list = getSortedEntidades();
  $('#ent-count').textContent = `${list.length} entidades`;
  const tbody = $('#tbl-entidades tbody');
  tbody.innerHTML = list.map(e => `
    <tr data-rut="${esc(e.rut)}" class="${e.rut===selectedEntidadRut?'selected':''}">
      <td><div class="wrap-name">${esc(e.nombre)}</div></td>
      <td>${e.provincias.map(p=>`<span class="pill"><span class="dot" style="background:${provColor(p)}"></span>${esc(p)}</span>`).join(' ')}</td>
      <td>${e.programas.map(p=>`<span class="pill"><span class="dot" style="background:${PROGRAMA_COLOR[p]}"></span>${esc(p)}</span>`).join(' ')}</td>
      <td class="num-center">${fmt0(e.comunas.length)}</td>
      <td class="num-center">${fmt0(e.proyectos)}</td>
      <td class="num-center">${fmt0(e.familias)}</td>
      <td class="num-center">${e.y2025!=null?fmt0(e.y2025):'—'}</td>
      <td>${scoreBadge(e.avgScoreGlobal)}</td>
    </tr>
  `).join('') || `<tr><td colspan="8"><div class="empty-state">No hay entidades que coincidan con los filtros.</div></td></tr>`;
  $$('#tbl-entidades tbody tr').forEach(tr => tr.addEventListener('click', () => openEntidadDetail(tr.dataset.rut)));
}

function openEntidadDetail(rut){
  const e = entidadesList.find(x=>x.rut===rut);
  if (!e) return;
  selectedEntidadRut = rut;
  $$('#tbl-entidades tbody tr').forEach(tr => tr.classList.toggle('selected', tr.dataset.rut===rut));

  const pane = $('#entidad-detail-pane');
  const stageLabels = {2: '2 · ' + RUBRICA_ETAPAS[2].nombre};
  const stageAgg = {};
  for (let s=1;s<=6;s++){
    const vals = e.coberturas.flatMap(c=>c.stageScores[s]);
    stageAgg[s] = vals.length ? mean(vals) : null;
  }
  const stageItems = Object.entries(stageAgg).filter(([,v])=>v!=null).map(([k,v])=>({label:stageLabels[k]||('Etapa '+k), value:v}));

  pane.innerHTML = `
    <div class="entidad-detail-head">
      <button class="close" id="entidad-detail-close">Cerrar ✕</button>
      <h2>${esc(e.nombre)}</h2>
      <div class="meta">RUT ${esc(e.rut)} · ${e.provincias.join(', ')}</div>
    </div>
    <div class="entidad-detail-body">
      <div>
        <div class="kv-row"><span class="k">Puntaje promedio 2026</span><span class="v">${scoreBadge(e.avgScoreGlobal)}${commentBtnHtml(e.rut, 'Consenso de calificación · ' + e.nombre)}</span></div>
        ${comentariosMap.has(e.rut) ? `<div class="comment-note-block">${commentNoteHtml(e.rut)}</div>` : ''}
        <div class="kv-row"><span class="k">Puntaje 2025 (histórico)</span><span class="v">${e.y2025!=null?fmt0(e.y2025):'—'}</span></div>
        <div class="kv-row"><span class="k">Puntaje 2024 (histórico)</span><span class="v">${e.y2024!=null?fmt0(e.y2024):'—'}</span></div>
        <div class="kv-row"><span class="k">Coberturas evaluadas / pendientes</span><span class="v">${e.evaluadaCount} / ${e.pendienteCount}</span></div>
        <div class="kv-row"><span class="k">Evaluadores involucrados</span><span class="v">${e.numEvaluadores}</span></div>
        <div class="kv-row"><span class="k">Proyectos ejecutados</span><span class="v">${fmt0(e.proyectos)}</span></div>
        <div class="kv-row"><span class="k">Familias beneficiadas</span><span class="v">${fmt0(e.familias)}</span></div>
      </div>

      ${(HIST_YEARS.some(y=>e.histYears[y]!=null)||e.avgScoreGlobal!=null) ? `
      <div>
        <h3 style="margin:0 0 10px;font-size:13px">Evolución histórica</h3>
        <div id="detail-trend"></div>
      </div>` : ''}

      ${stageItems.length ? `
      <div>
        <h3 style="margin:0 0 10px;font-size:13px">Puntaje por categoría</h3>
        <div id="detail-stages"></div>
      </div>` : ''}

      <div>
        <h3 style="margin:0 0 2px;font-size:13px">Calificación por programa y provincia</h3>
        <div class="card-sub" style="margin-bottom:8px">Resumen; el detalle por ítem se muestra abajo, por cobertura</div>
        <table class="data" style="min-width:0; width:100%; table-layout:fixed">
          <colgroup><col style="width:22%"><col style="width:22%"><col style="width:14%"><col style="width:18%"><col style="width:24%"></colgroup>
          <thead><tr><th>Programa</th><th>Provincia</th><th>Ítems</th><th>Evaluad.</th><th>Puntaje</th></tr></thead>
        <tbody>${e.coberturas.map(c => `<tr>
            <td><span class="pill"><span class="dot" style="background:${PROGRAMA_COLOR[c.programa]}"></span>${esc(c.programa)}</span></td>
            <td>${esc(c.provincia)}</td>
            <td class="num">${fmt0(c.scores.length)}</td>
            <td class="num">${fmt0(c.evaluadores.size)}</td>
            <td><span class="v">${scoreBadge(c.avgScore)}</span></td>
          </tr>`).join('')}
        </tbody></table>
      </div>

      <div>
        <h3 style="margin:0 0 10px;font-size:13px">Detalle de calificaciones por ítem</h3>
        ${e.coberturas.map((c,i) => `
          <div style="margin-bottom:14px">
            <div class="cobertura-detail-heading">
              <span class="pill"><span class="dot" style="background:${PROGRAMA_COLOR[c.programa]}"></span>${esc(c.programa)}</span>
              <span class="pill">${esc(c.provincia)}</span>
            </div>
            <div class="cobertura-items" id="cobertura-items-${i}"></div>
          </div>
        `).join('')}
      </div>

      <div>
        <h3 style="margin:0 0 10px;font-size:13px">Comunas con cobertura (${e.comunas.length})</h3>
        <div class="taglist">${e.comunas.map(c=>`<span class="pill">${esc(c)}</span>`).join('') || '<span class="hint">Sin datos de comuna</span>'}</div>
      </div>
    </div>
  `;
  $('#entidad-detail-close').addEventListener('click', closeEntidadDetail);
  $('#entidades-split').classList.add('detail-open');
  wireCommentButtons(pane);

  if ($('#detail-trend')) {
    lineChart($('#detail-trend'), [{ label:e.nombre, color:'var(--series-1)', points:[
      ...HIST_YEARS.map(y => ({x:String(y), y:e.histYears[y]})),
      {x:'2026', y:e.avgScoreGlobal},
    ]}], {w:380, h:170, yMin:0, yMax:100});
  }
  if ($('#detail-stages')) {
    barList($('#detail-stages'), stageItems.map(s=>({...s, color:'var(--series-1)'})), {fmt:fmt0, max:100});
  }
  e.coberturas.forEach((c,i) => {
    const holder = $(`#cobertura-items-${i}`);
    if (holder) renderCoberturaItems(holder, c);
  });
}

function renderCoberturaItems(holder, cobertura){
  const byStage = {};
  cobertura.items.forEach(it => {
    const st = it.stage || '?';
    if (!byStage[st]) byStage[st] = [];
    byStage[st].push(it);
  });
  const stagesPresent = Object.keys(byStage).sort((a,b)=>a-b);
  if (!stagesPresent.length) {
    holder.innerHTML = `<div class="hint">Sin ítems calificados para esta cobertura.</div>`;
    return;
  }
  holder.innerHTML = `<div class="rubric-legend">
      <span class="rubric-legend-item"><span class="dot" style="background:var(--critical)"></span>0–49 Bajo</span>
      <span class="rubric-legend-item"><span class="dot" style="background:var(--warning)"></span>50–79 Aceptable</span>
      <span class="rubric-legend-item"><span class="dot" style="background:var(--good)"></span>80–100 Bueno</span>
    </div>` +
    stagesPresent.map(st => {
      const rubrica = RUBRICA_ETAPAS[st];
      const byItem = {};
      byStage[st].forEach(it => { const k = String(it.itemId); (byItem[k] = byItem[k] || []).push(it); });
      const itemIds = Object.keys(byItem).sort((a,b)=>a.localeCompare(b, undefined, {numeric:true}));
      const stageAvg = mean(byStage[st].map(it=>it.score));
      const rows = itemIds.map(id => {
        const entries = byItem[id];
        const avg = mean(entries.map(x=>x.score));
        const desc = rubrica && rubrica.items[id] ? rubrica.items[id] : '';
        const tt = entries.map(x => `${esc(x.evaluador||'—')} · ${fmt0(x.score)} pts · ${esc(x.hora||'—')}`).join('<br>');
        return `<div class="rubric-row" data-tt="Ítem ${esc(id)}<br>${tt}">
          <div class="rubric-item-text"><b>${esc(id)}</b>${desc ? ' ' + esc(desc) : ''}</div>
          <div class="rubric-score" style="${rubricScoreStyle(avg)}">${fmt0(avg)}</div>
        </div>`;
      }).join('');
      return `<div class="rubric-card">
        <div class="rubric-header"><div>${esc(rubrica && rubrica.nombre ? rubrica.nombre : ('Etapa ' + st))}</div></div>
        ${rubrica && rubrica.descripcion ? `<div class="rubric-desc">Comprende: ${esc(rubrica.descripcion)}</div>` : ''}
        <div class="rubric-rows">${rows}</div>
        <div class="rubric-footer">
          <div>PRECALIFICACIÓN ETAPA ${esc(st)}</div>
          <div class="rubric-score" style="${rubricScoreStyle(stageAvg)}">${fmt0(stageAvg)}</div>
        </div>
      </div>`;
    }).join('');
  $$('.rubric-row[data-tt]', holder).forEach(row => {
    row.addEventListener('mousemove', ev => showTooltip(ev, row.dataset.tt));
    row.addEventListener('mouseleave', hideTooltip);
  });
}
function closeEntidadDetail(){
  selectedEntidadRut = null;
  const split = $('#entidades-split');
  if (split) split.classList.remove('detail-open');
  $$('#tbl-entidades tbody tr').forEach(tr => tr.classList.remove('selected'));
}

/* ======================================================================
   10. Vista: Histórico
   ====================================================================== */
function renderHistorico(){
  const el = $('#view-historico');
  const withHist = filteredEntidades().filter(e => HIST_YEARS.some(y=>e.histYears[y]!=null) || e.avgScoreGlobal!=null);
  const withDelta = withHist.filter(e=>e.y2025!=null && e.avgScoreGlobal!=null).map(e => ({...e, delta: e.avgScoreGlobal - e.y2025}));
  const mejoras = withDelta.slice().sort((a,b)=>b.delta-a.delta).slice(0,5);
  const bajas = withDelta.slice().sort((a,b)=>a.delta-b.delta).slice(0,5);
  const histSorted = withHist.slice().sort((a,b)=>(b.avgScoreGlobal||0)-(a.avgScoreGlobal||0));
  const rankRow = (e,i) => `<div class="rank-row" data-tt="${esc(e.nombre)}: ${e.delta>=0?'+':''}${fmt0(e.delta)} pts (2025 → 2026)">
    <div class="rank-num">${i+1}</div>
    <div class="rank-name">${esc(e.nombre)}</div>
    <div class="rank-delta ${e.delta>=0?'up':'down'}">${e.delta>=0?'+':''}${fmt0(e.delta)}</div>
  </div>`;

  el.innerHTML = `
    <div class="grid-2">
      <div class="card">
        <h3>Mayor mejora 2025 → 2026</h3>
        <div class="rank-list" id="rank-mejoras">${mejoras.map(rankRow).join('') || '<div class="hint">Sin datos suficientes.</div>'}</div>
      </div>
      <div class="card">
        <h3>Mayor caída 2025 → 2026</h3>
        <div class="rank-list" id="rank-bajas">${bajas.map(rankRow).join('') || '<div class="hint">Sin datos suficientes.</div>'}</div>
      </div>
    </div>
    <div class="card" style="margin-top:14px">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px">
        <div>
          <h3>Detalle histórico por entidad</h3>
          <div class="card-sub">2026 (actual) se muestra primero, destacado, seguido de los años anteriores</div>
        </div>
        <button class="import-btn" id="btn-export-historico">Exportar a Excel</button>
      </div>
      <div class="rubric-legend" style="margin:6px 0 10px">
        <span class="rubric-legend-item"><span class="dot" style="background:var(--critical)"></span>0–49 bajo</span>
        <span class="rubric-legend-item"><span class="dot" style="background:var(--warning)"></span>50–79 aceptable</span>
        <span class="rubric-legend-item"><span class="dot" style="background:var(--good)"></span>80–100 bueno</span>
      </div>
      <div class="card-scroll">
        <table class="data compact-cols" style="table-layout:fixed; min-width:900px">
          <colgroup>
            <col style="width:30%"><col style="width:10%"><col style="width:9%"><col style="width:9%">
            <col style="width:9%"><col style="width:9%"><col style="width:9%"><col style="width:15%">
          </colgroup>
          <thead><tr>
            <th>Entidad</th><th class="num-center year-current">2026</th><th class="num-center">2025</th>
            <th class="num-center">2024</th><th class="num-center">2023</th><th class="num-center">2022</th>
            <th class="num-center">2021</th><th class="num-center">Variación 25→26</th>
          </tr></thead>
          <tbody>${histSorted.map(e => {
            const d = (e.y2025!=null && e.avgScoreGlobal!=null) ? e.avgScoreGlobal - e.y2025 : null;
            const dCls = d==null ? '' : d>=0 ? 'up' : 'down';
            return `<tr>
              <td><div class="wrap-name">${esc(e.nombre)}</div></td>
              <td class="num-center year-current${heatCls(e.avgScoreGlobal)}">${e.avgScoreGlobal!=null?fmt0(e.avgScoreGlobal):'—'}</td>
              ${HIST_YEARS.slice().reverse().map(y => `<td class="num-center${heatCls(e.histYears[y])}">${e.histYears[y]!=null?fmt0(e.histYears[y]):'—'}</td>`).join('')}
              <td class="num-center delta ${dCls}">${d==null?'—':(d>=0?'+':'')+fmt0(d)}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>
    </div>
  `;
  attachBarTooltips($('#rank-mejoras'));
  attachBarTooltips($('#rank-bajas'));
  $('#btn-export-historico').addEventListener('click', () => {
    const headers = ['Entidad','2026', ...HIST_YEARS.slice().reverse().map(String), 'Variación 25→26'];
    const rows = histSorted.map(e => {
      const d = (e.y2025!=null && e.avgScoreGlobal!=null) ? e.avgScoreGlobal - e.y2025 : null;
      return [
        e.nombre,
        e.avgScoreGlobal!=null ? Math.round(e.avgScoreGlobal) : '',
        ...HIST_YEARS.slice().reverse().map(y => e.histYears[y] ?? ''),
        d==null ? '' : Math.round(d),
      ];
    });
    exportXlsx('Historico_Precalificaciones.xlsx', 'Historico', headers, rows);
  });
}

/* ======================================================================
   11. Exportar a Excel (SheetJS, ya cargado por CDN en informe.html —
   igual que app.js). Exportación de datos planos, sin formato de color
   por celda (esa parte del dashboard original usaba un escritor .xlsx
   manual que aquí se reemplaza por la librería ya disponible).
   ====================================================================== */
function exportXlsx(filename, sheetName, headers, rows){
  try {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename);
  } catch (err) {
    console.error('Error exportando a Excel:', err);
    alert('❌ Error al generar el archivo Excel.');
  }
}

/* ======================================================================
   12. Navegación / filtros / arranque
   ====================================================================== */
const RENDERERS = { entidades: renderEntidades, historico: renderHistorico };
const VIEW_TITLES = {
  entidades: ['Entidades', 'Detalle y ranking de Entidades Patrocinantes'],
  historico: ['Histórico', 'Evolución de puntajes 2021–2026'],
};
function setView(view){
  state.view = view;
  $$('.nav button').forEach(b => b.classList.toggle('active', b.dataset.view===view));
  $$('.view').forEach(v => v.classList.remove('active'));
  $(`#view-${view}`).classList.add('active');
  const [title, sub] = VIEW_TITLES[view];
  $('#view-title').textContent = title;
  $('#view-sub').textContent = sub;
  RENDERERS[view]();
}
function initFilters(){
  const progSel = $('#f-programa'), provSel = $('#f-provincia');
  PROGRAMA_ORDER.forEach(p => progSel.insertAdjacentHTML('beforeend', `<option value="${p}">${p}</option>`));
  PROVINCIA_ORDER.forEach(p => provSel.insertAdjacentHTML('beforeend', `<option value="${p}">${p}</option>`));
  progSel.addEventListener('change', () => { state.programa = progSel.value; RENDERERS[state.view](); });
  provSel.addEventListener('change', () => { state.provincia = provSel.value; RENDERERS[state.view](); });
  let searchT;
  $('#f-search').addEventListener('input', e => {
    clearTimeout(searchT);
    searchT = setTimeout(() => { state.search = e.target.value; RENDERERS[state.view](); }, 150);
  });
  $('#f-reset').addEventListener('click', () => {
    state.programa=''; state.provincia=''; state.search='';
    progSel.value=''; provSel.value=''; $('#f-search').value='';
    RENDERERS[state.view]();
  });
}
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (isCommentModalOpen()) { closeCommentModal(); return; }
  const split = $('#entidades-split');
  if (split && split.classList.contains('detail-open')) closeEntidadDetail();
});

let booted = false;
async function boot(){
  if (booted) return;
  booted = true;
  initCommentModal();
  initFilters();
  $('#nav').addEventListener('click', e => {
    const btn = e.target.closest('button[data-view]');
    if (btn) setView(btn.dataset.view);
  });
  $('#btn-refresh-data').addEventListener('click', async () => {
    $('#data-status').textContent = 'Recargando…';
    await loadAllData();
    rebuildData();
    $('#data-status').textContent = 'Datos actualizados';
    RENDERERS[state.view]();
  });

  $('#data-status').textContent = 'Cargando datos…';
  await loadAllData();
  rebuildData();
  $('#data-status').textContent = 'Datos cargados';
  setView('entidades');
}

document.addEventListener('DOMContentLoaded', initLogin);
