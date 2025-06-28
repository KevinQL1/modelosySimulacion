// IMPORTACIONES
import { getActivities, createActivity, addLap, deleteLap, deleteActivity, updateActivity } from '../connectionBackend/apiConnection';

// VARIABLES GLOBALES
let actividades = [], actividadesAbiertas = [], editandoActividad = null;
const listaActividades = document.getElementById('lista-actividades');
const btnNuevaActividad = document.getElementById('btn-nueva-actividad');
const btnExportarExcel = document.getElementById('btn-exportar-excel');
const feedbackDiv = document.getElementById('feedback');
const idUser = localStorage.getItem('idUser');
let player, currentVideoId = '';

// FEEDBACK UI
function mostrarFeedback(msg, tipo = 'info', tiempo = 2000) {
    if (!feedbackDiv) return;
    feedbackDiv.textContent = msg;
    feedbackDiv.className = 'feedback ' + tipo;
    feedbackDiv.style.display = 'block';
    if (tiempo > 0) setTimeout(() => feedbackDiv.style.display = 'none', tiempo);
}
function mostrarSpinner(msg = 'Cargando...') { mostrarFeedback(msg, 'spinner', 0); }
function ocultarFeedback() { if (feedbackDiv) feedbackDiv.style.display = 'none'; }

// CARGA API YOUTUBE DE FORMA SEGURA
function cargarAPIDeYouTube(callback) {
    if (window.YT && typeof YT.Player === 'function') {
        callback();
    } else {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady = callback;
    }
}

// PLAYER YOUTUBE
function crearOActualizarPlayer(videoId) {
    if (!window.YT || typeof YT.Player !== 'function') return;
    if (player) player.loadVideoById(videoId);
    else player = new YT.Player('youtube-player', { height: '360', width: '640', videoId, events: { onReady: cargarActividades } });
    currentVideoId = videoId;
}

// ACTIVIDADES
async function cargarActividades() {
    actividades = [], actividadesAbiertas = [], editandoActividad = null;
    if (!idUser || !currentVideoId) return;
    mostrarSpinner('Cargando actividades...');
    try {
        const response = await getActivities(idUser, currentVideoId);
        actividades = (response.data || []).map(act => ({ id: act.id, nombre: act.nameActivity, isRunning: false, lastLapTime: 0, laps: act.laps || [] }));
        actividadesAbiertas = actividades.map((_, idx) => idx);
        renderActividades();
        mostrarFeedback('Actividades cargadas', 'success');
    } catch {
        renderActividades();
        mostrarFeedback('Error al cargar actividades', 'error', 4000);
    }
}

function renderActividades() {
    listaActividades.innerHTML = '';
    actividades.forEach((actividad, idx) => {
        const card = document.createElement('div');
        card.className = 'actividad-card' + (actividadesAbiertas.includes(idx) ? ' open' : '');
        card.innerHTML = `
            <div class="actividad-header">
                <span class="actividad-flecha" style="display:inline-block;transition:transform 0.3s;${actividadesAbiertas.includes(idx) ? 'transform:rotate(90deg);' : ''}">&#9654;</span>
                <span class="actividad-nombre">
                    ${editandoActividad === idx ? `<input type='text' id='input-edit-actividad-${idx}' value="${actividad.nombre}" class="input-edit-actividad" />` : actividad.nombre}
                </span>
                <div class="actividad-actions">
                    ${editandoActividad === idx ? `<button class="guardar-btn">Guardar</button><button class="cancelar-btn">Cancelar</button>` : `<button class="editar-btn">Editar</button><button class="eliminar-btn">Eliminar</button>`}
                </div>
            </div>
            <div class="actividad-content">
                <div class="laps-container">
                    ${actividad.laps.map((lap, lapIdx) => `<div class="lap-item"><span>${lap.StartTime} - ${lap.EndTime} (${lap.DiffTime})</span><button class="eliminar-lap" data-idx="${idx}" data-lapidx="${lapIdx}">Borrar</button></div>`).join('')}
                </div>
                ${editandoActividad !== idx ? `<div class="actividad-cronometro"><button class="iniciar-btn" ${actividad.isRunning ? 'disabled' : ''}>Iniciar</button><button class="lap-btn" ${!actividad.isRunning ? 'disabled' : ''}>Registrar Lap</button><button class="parar-btn" ${!actividad.isRunning ? 'disabled' : ''}>Parar</button></div>` : ''}
            </div>`;

        listaActividades.appendChild(card);

        card.querySelector('.actividad-header').addEventListener('click', () => abrirActividad(idx));
        card.querySelector('.actividad-actions').addEventListener('click', e => e.stopPropagation());
        card.querySelector('.editar-btn')?.addEventListener('click', () => editarActividad(idx));
        card.querySelector('.eliminar-btn')?.addEventListener('click', () => eliminarActividad(idx));
        card.querySelector('.guardar-btn')?.addEventListener('click', () => guardarEdicionActividad(idx));
        card.querySelector('.cancelar-btn')?.addEventListener('click', () => cancelarEdicionActividad(idx));

        card.querySelectorAll('.eliminar-lap').forEach(btn => btn.addEventListener('click', e => eliminarLap(+e.target.dataset.idx, +e.target.dataset.lapidx)));
        card.querySelector('.iniciar-btn')?.addEventListener('click', () => iniciarCronometro(idx));
        card.querySelector('.lap-btn')?.addEventListener('click', () => registrarLap(idx));
        card.querySelector('.parar-btn')?.addEventListener('click', () => pararCronometro(idx));

        if (editandoActividad === idx) setTimeout(() => document.getElementById(`input-edit-actividad-${idx}`)?.focus(), 0);
    });
}

// CRUD BASICO
btnNuevaActividad.addEventListener('click', () => {
    actividades.push({ id: null, nombre: '', isRunning: false, lastLapTime: 0, laps: [] });
    editandoActividad = actividades.length - 1;
    actividadesAbiertas.push(editandoActividad);
    renderActividades();
});

function editarActividad(idx) { editandoActividad = idx; renderActividades(); }

async function guardarEdicionActividad(idx) {
    const input = document.getElementById(`input-edit-actividad-${idx}`);
    if (!input?.value.trim()) return;
    const nombre = input.value.trim();
    mostrarSpinner(actividades[idx].id ? 'Actualizando...' : 'Creando...');
    try {
        if (!actividades[idx].id) {
            const res = await createActivity({ idUser, videoId: currentVideoId, nameActivity: nombre });
            Object.assign(actividades[idx], { id: res.data.id, nombre: res.data.nameActivity, laps: res.data.laps || [] });
        } else {
            const res = await updateActivity({ id: actividades[idx].id, nameActivity: nombre });
            actividades[idx].nombre = res.data.nameActivity;
        }
        mostrarFeedback('Guardado', 'success');
    } catch { mostrarFeedback('Error al guardar', 'error', 4000); }
    finally { ocultarFeedback(); editandoActividad = null; renderActividades(); }
}

function cancelarEdicionActividad(idx) {
    if (!actividades[idx].id && !actividades[idx].laps.length) actividades.splice(idx, 1);
    editandoActividad = null;
    renderActividades();
}

async function eliminarActividad(idx) {
    if (!confirm('¿Eliminar actividad?')) return;
    if (actividades[idx].id) await deleteActivity(actividades[idx].id);
    actividades.splice(idx, 1);
    editandoActividad = null;
    actividadesAbiertas = actividadesAbiertas.filter(i => i !== idx).map(i => i > idx ? i - 1 : i);
    renderActividades();
}

async function eliminarLap(idx, lapIdx) {
    if (actividades[idx].id) {
        mostrarSpinner('Eliminando lap...');
        const res = await deleteLap(actividades[idx].id, lapIdx);
        actividades[idx].laps = res.data.laps;
    } else actividades[idx].laps.splice(lapIdx, 1);
    ocultarFeedback();
    renderActividades();
}

// CRONOMETRO
function iniciarCronometro(idx) {
    if (!player) return alert('Reproductor no listo');
    actividades[idx].isRunning = true;
    actividades[idx].lastLapTime = player.getCurrentTime();
    renderActividades();
}

async function registrarLap(idx) {
    if (!player || !actividades[idx].isRunning) return;
    const end = player.getCurrentTime(), start = actividades[idx].lastLapTime, diff = end - start;
    const lap = { StartTime: segundosAMMSS(start), EndTime: segundosAMMSS(end), DiffTime: segundosAMMSS(diff) };
    if (actividades[idx].id) {
        mostrarSpinner('Agregando lap...');
        const res = await addLap({ activityId: actividades[idx].id, ...lap });
        actividades[idx].laps = res.data.laps;
    } else actividades[idx].laps.push(lap);
    actividades[idx].lastLapTime = end;
    renderActividades();
}

function pararCronometro(idx) { actividades[idx].isRunning = false; renderActividades(); }
function abrirActividad(idx) { actividadesAbiertas.includes(idx) ? actividadesAbiertas = actividadesAbiertas.filter(i => i !== idx) : actividadesAbiertas.push(idx); renderActividades(); }
function segundosAMMSS(segundos) { const min = Math.floor(segundos / 60), sec = Math.floor(segundos % 60); return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`; }

// EXPORTAR EXCEL
btnExportarExcel?.addEventListener('click', () => {
    const rows = actividades.flatMap(act => act.laps.map(lap => ({ Actividad: act.nombre, ...lap })));
    if (!rows.length) return alert('No hay laps para exportar.');
    const ws = XLSX.utils.json_to_sheet(rows), wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tiempos');
    XLSX.writeFile(wb, 'tiempos_actividades.xlsx');
});

// INICIALIZAR
const urlParams = new URLSearchParams(window.location.search);
const videoKeyFromUrl = urlParams.get('videoKey');
window.addEventListener('DOMContentLoaded', () => {
    if (window.renderHeaderDinamico) window.renderHeaderDinamico();
    if (videoKeyFromUrl) {
        currentVideoId = videoKeyFromUrl;
        document.getElementById('input-video-id').value = videoKeyFromUrl;
        cargarAPIDeYouTube(() => crearOActualizarPlayer(videoKeyFromUrl));
    }
});
