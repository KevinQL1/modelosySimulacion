import { getActivities, createActivity, addLap, deleteLap, deleteActivity, updateActivity } from '../connectionBackend/apiConnection';

// Estructura principal para todas las actividades del usuario en el video actual
let actividades = [];
let actividadesAbiertas = []; // array de índices de actividades abiertas
let editandoActividad = null; // índice de la actividad en edición (null = ninguna)

// Referencias a elementos del DOM
const listaActividades = document.getElementById('lista-actividades');
const btnNuevaActividad = document.getElementById('btn-nueva-actividad');
const inputVideoId = document.getElementById('input-video-id');
const btnExportarExcel = document.getElementById('btn-exportar-excel');
const feedbackDiv = document.getElementById('feedback');

// YouTube Player API
let player;
let currentVideoId = ''; // Valor por defecto para pruebas
const idUser = localStorage.getItem('idUser');

// Funciones de conexión backend
// Asumimos que están importadas globalmente: getActivities, createActivity, addLap, deleteLap, deleteActivity, updateActivity

function mostrarFeedback(msg, tipo = 'info', tiempo = 2000) {
    if (!feedbackDiv) return;
    feedbackDiv.textContent = msg;
    feedbackDiv.className = 'feedback ' + tipo;
    feedbackDiv.style.display = 'block';
    if (tiempo > 0) {
        setTimeout(() => {
            feedbackDiv.style.display = 'none';
        }, tiempo);
    }
}
function mostrarSpinner(msg = 'Cargando...') {
    if (!feedbackDiv) return;
    feedbackDiv.textContent = msg;
    feedbackDiv.className = 'feedback spinner';
    feedbackDiv.style.display = 'block';
}
function ocultarFeedback() {
    if (!feedbackDiv) return;
    feedbackDiv.style.display = 'none';
}

function onYouTubeIframeAPIReady() {
    crearOActualizarPlayer(currentVideoId);
}

function crearOActualizarPlayer(videoId) {
    if (typeof YT === 'undefined' || typeof YT.Player !== 'function') {
        return;
    }
    if (player) {
        player.loadVideoById(videoId);
    } else {
        player = new YT.Player('youtube-player', {
            height: '360',
            width: '640',
            videoId: videoId,
            events: {
                'onReady': onPlayerReady
            }
        });
    }
    currentVideoId = videoId;
    cargarActividades();
}

function onPlayerReady(event) {
    // El reproductor está listo
}

async function cargarActividades() {
    actividades = [];
    actividadesAbiertas = [];
    editandoActividad = null;
    if (!idUser || !currentVideoId) return;
    mostrarSpinner('Cargando actividades...');
    try {
        const response = await getActivities(idUser, currentVideoId);
        actividades = (response.data || []).map(act => ({
            id: act.id,
            nombre: act.nameActivity,
            isRunning: false,
            lastLapTime: 0,
            laps: act.laps || [],
            videoId: act.videoId // Para depuración
        }));
        actividadesAbiertas = actividades.map((_, idx) => idx); // Abrir todas por defecto
        renderActividades();
        mostrarFeedback('Actividades cargadas', 'success');
    } catch (err) {
        renderActividades(); // Mostrar vacío si hay error
        mostrarFeedback('Error al cargar actividades del backend', 'error', 4000);
    }
}

// Renderizar actividades
function renderActividades() {
    listaActividades.innerHTML = '';
    actividades.forEach((actividad, idx) => {
        const card = document.createElement('div');
        card.className = 'actividad-card' + (actividadesAbiertas.includes(idx) ? ' open' : '');
        // Header clickable para expandir/colapsar
        card.innerHTML = `
            <div class="actividad-header" onclick="abrirActividad(${idx})">
                <span class="actividad-flecha" style="display:inline-block;transition:transform 0.3s;${actividadesAbiertas.includes(idx) ? 'transform:rotate(90deg);' : ''}">&#9654;</span>
                <span class="actividad-nombre">
                    ${editandoActividad === idx ? `
                        <input type='text' id='input-edit-actividad-${idx}' value="${actividad.nombre}" class="input-edit-actividad" onkeydown="if(event.key==='Enter'){guardarEdicionActividad(${idx})}" />
                    ` : actividad.nombre}
                </span>
                <div class="actividad-actions" onclick="event.stopPropagation()">
                    ${editandoActividad === idx ? `
                        <button onclick="guardarEdicionActividad(${idx})">Guardar</button>
                        <button onclick="cancelarEdicionActividad(${idx})">Cancelar</button>
                    ` : `
                        <button onclick="editarActividad(${idx}); event.stopPropagation();">Editar</button>
                        <button onclick="eliminarActividad(${idx}); event.stopPropagation();">Eliminar</button>
                    `}
                </div>
            </div>
            <div class="actividad-content">
                <div class="laps-container">
                    ${actividad.laps.map((lap, lapIdx) => `
                        <div class="lap-item">
                            <span>${lap.StartTime} - ${lap.EndTime} (${lap.DiffTime})</span>
                            <button onclick="eliminarLap(${idx}, ${lapIdx})">Borrar</button>
                        </div>
                    `).join('')}
                </div>
                ${editandoActividad !== idx ? `
                    <!-- Mostrar botones de cronómetro solo cuando no está en edición -->
                    <div class="actividad-cronometro">
                        <button onclick="iniciarCronometro(${idx})" ${actividad.isRunning ? 'disabled' : ''}>Iniciar</button>
                        <button onclick="registrarLap(${idx})" ${!actividad.isRunning ? 'disabled' : ''}>Registrar Lap</button>
                        <button onclick="pararCronometro(${idx})" ${!actividad.isRunning ? 'disabled' : ''}>Parar</button>
                    </div>
                ` : ''}
            </div>
        `;
        listaActividades.appendChild(card);
        // Mostrar/ocultar contenido según si está abierta
        const content = card.querySelector('.actividad-content');
        if (actividadesAbiertas.includes(idx)) {
            content.style.maxHeight = content.scrollHeight + 'px';
        } else {
            content.style.maxHeight = null;
        }
        // Enfocar input si está editando
        if (editandoActividad === idx) {
            setTimeout(() => {
                const input = document.getElementById(`input-edit-actividad-${idx}`);
                if (input) input.focus();
            }, 0);
        }
    });
}

// Crear nueva actividad
btnNuevaActividad.addEventListener('click', () => {
    const nuevaActividad = {
        id: null,
        nombre: '',
        isRunning: false,
        lastLapTime: 0,
        laps: [],
        videoId: currentVideoId // Para depuración
    };
    actividades.push(nuevaActividad);
    editandoActividad = actividades.length - 1;
    actividadesAbiertas.push(editandoActividad);
    renderActividades();
});

// Editar actividad
window.editarActividad = function(idx) {
    editandoActividad = idx;
    renderActividades();
}

// Guardar edición de actividad
window.guardarEdicionActividad = async function(idx) {
    const input = document.getElementById(`input-edit-actividad-${idx}`);
    if (input && input.value.trim()) {
        const nombre = input.value.trim();
        if (!actividades[idx].id) {
            // Crear nueva actividad
            mostrarSpinner('Creando actividad...');
            try {
                const res = await createActivity({
                    idUser,
                    videoId: currentVideoId,
                    nameActivity: nombre
                });
                
                actividades[idx].id = res.data.id;
                actividades[idx].nombre = res.data.nameActivity;
                actividades[idx].laps = res.data.laps || [];
                mostrarFeedback('Actividad creada', 'success');
            } catch (err) {
                let errorMsg = 'Error al crear la actividad en el servidor.';
                if (err.response && err.response.data) {
                    if (err.response.data.message) {
                        errorMsg = err.response.data.message;
                    }
                    if (err.response.data.error) {
                        errorMsg += ` (${err.response.data.error})`;
                    }
                }
                
                mostrarFeedback(errorMsg, 'error', 5000);
                return;
            } finally {
                ocultarFeedback();
            }
        } else {
            // Actualizar actividad existente
            mostrarSpinner('Actualizando actividad...');
            try {
                const res = await updateActivity({
                    id: actividades[idx].id,
                    nameActivity: nombre
                });
                
                actividades[idx].nombre = res.data.nameActivity;
                mostrarFeedback('Actividad actualizada', 'success');
            } catch (err) {
                let errorMsg = 'Error al actualizar la actividad en el servidor.';
                if (err.response && err.response.data) {
                    if (err.response.data.message) {
                        errorMsg = err.response.data.message;
                    }
                    if (err.response.data.error) {
                        errorMsg += ` (${err.response.data.error})`;
                    }
                }
                
                mostrarFeedback(errorMsg, 'error', 5000);
                return;
            } finally {
                ocultarFeedback();
            }
        }
        editandoActividad = null;
        renderActividades();
    }
}

// Cancelar edición de actividad
window.cancelarEdicionActividad = function(idx) {
    if (actividades[idx].nombre === '' && actividades[idx].laps.length === 0 && !actividades[idx].id) {
        actividades.splice(idx, 1);
        actividadesAbiertas = actividadesAbiertas.filter(i => i !== idx).map(i => (i > idx ? i - 1 : i));
    }
    editandoActividad = null;
    renderActividades();
}

// Eliminar actividad
window.eliminarActividad = async function(idx) {
    if (confirm('¿Eliminar esta actividad?')) {
        const actividad = actividades[idx];
        if (actividad.id) {
            mostrarSpinner('Eliminando actividad...');
            await deleteActivity(actividad.id);
            mostrarFeedback('Actividad eliminada', 'success');
        }
        actividades.splice(idx, 1);
        actividadesAbiertas = actividadesAbiertas.filter(i => i !== idx).map(i => (i > idx ? i - 1 : i));
        if (editandoActividad === idx) editandoActividad = null;
        else if (editandoActividad > idx) editandoActividad--;
        renderActividades();
    }
}

// Eliminar lap
window.eliminarLap = async function(idx, lapIdx) {
    const actividad = actividades[idx];
    if (actividad.id) {
        mostrarSpinner('Eliminando lap...');
        const res = await deleteLap(actividad.id, lapIdx);
        actividades[idx].laps = res.data.laps;
        mostrarFeedback('Lap eliminado', 'success');
    } else {
        actividades[idx].laps.splice(lapIdx, 1);
    }
    renderActividades();
}

window.iniciarCronometro = function(idx) {
    if (!player) return alert('El reproductor no está listo');
    actividades[idx].isRunning = true;
    actividades[idx].lastLapTime = player.getCurrentTime();
    renderActividades();
}

window.registrarLap = async function(idx) {
    if (!player) return alert('El reproductor no está listo');
    if (!actividades[idx].isRunning) return;
    const end = player.getCurrentTime();
    const start = actividades[idx].lastLapTime;
    const diff = end - start;
    const lap = {
        StartTime: segundosAMMSS(start),
        EndTime: segundosAMMSS(end),
        DiffTime: segundosAMMSS(diff)
    };
    if (actividades[idx].id) {
        mostrarSpinner('Agregando lap...');
        const res = await addLap({
            activityId: actividades[idx].id,
            ...lap
        });
        actividades[idx].laps = res.data.laps;
        mostrarFeedback('Lap agregado', 'success');
    } else {
        actividades[idx].laps.push(lap);
    }
    actividades[idx].lastLapTime = end;
    renderActividades();
}

window.pararCronometro = function(idx) {
    actividades[idx].isRunning = false;
    renderActividades();
}

window.abrirActividad = function(idx) {
    if (actividadesAbiertas.includes(idx)) {
        actividadesAbiertas = actividadesAbiertas.filter(i => i !== idx);
    } else {
        actividadesAbiertas.push(idx);
    }
    renderActividades();
}

// Utilidad para convertir segundos a mm:ss
function segundosAMMSS(segundos) {
    const min = Math.floor(segundos / 60);
    const sec = Math.floor(segundos % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

// Inicializar
renderActividades();

if (btnExportarExcel) {
    btnExportarExcel.addEventListener('click', exportarTiemposAExcel);
}

function exportarTiemposAExcel() {
    // Construir los datos para la hoja
    let rows = [];
    actividades.forEach(act => {
        act.laps.forEach(lap => {
            rows.push({
                Actividad: act.nombre,
                StartTime: lap.StartTime,
                EndTime: lap.EndTime,
                DiffTime: lap.DiffTime
            });
        });
    });

    if (rows.length === 0) {
        alert('No hay laps para exportar.');
        return;
    }

    // Crear la hoja y el libro
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tiempos");

    // Descargar el archivo
    XLSX.writeFile(wb, "tiempos_actividades.xlsx");
}

// Cargar actividades al inicio
window.addEventListener('DOMContentLoaded', () => {
    if (window.renderHeaderDinamico) renderHeaderDinamico();
});

// Leer videoKey de la URL y cargarlo automáticamente
const urlParams = new URLSearchParams(window.location.search);
const videoKeyFromUrl = urlParams.get('videoKey');
if (videoKeyFromUrl) {
    currentVideoId = videoKeyFromUrl;
    window.addEventListener('DOMContentLoaded', () => {
        inputVideoId.value = videoKeyFromUrl;
        crearOActualizarPlayer(videoKeyFromUrl);
    });
}
