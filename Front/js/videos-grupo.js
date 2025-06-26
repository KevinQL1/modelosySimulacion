// Lógica para gestión de videos por grupo irá aquí 
const urlParams = new URLSearchParams(window.location.search);
const idGrupo = urlParams.get('idGrupo');
const idCourse = urlParams.get('idCourse');
const videosDiv = document.getElementById('videos-grupo');

let videos = [];
let editIndex = null;

// Función para extraer el valor correcto de un campo que puede ser objeto o string
function extractValue(field) {
  if (typeof field === 'string') {
    return field;
  } else if (typeof field === 'object' && field !== null) {
    // Si es un objeto, intentar obtener el valor de diferentes propiedades comunes
    return field.S || field.value || field.name || field.url || JSON.stringify(field);
  }
  return String(field || '');
}

// Función para extraer la clave del video de YouTube de una URL
function extractYouTubeKey(url) {
  if (!url) return '';
  
  const urlStr = String(url);
  
  // Patrones comunes de URLs de YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = urlStr.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Si no coincide con ningún patrón, devolver la URL completa
  return urlStr;
}

function formatFecha(fechaIso) {
  if (!fechaIso) return '';
  const d = new Date(fechaIso);
  return d.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

async function cargarVideos() {
  try {
    console.log('Cargando videos para grupo:', idGrupo);
    const res = await getVideosByGroup(idGrupo);
    console.log('Respuesta de getVideosByGroup:', res);
    videos = res.data || [];
    editIndex = null;
    renderVideos();
  } catch (err) {
    console.error('Error al cargar videos:', err);
    let errorMessage = 'Error al cargar videos';
    
    if (err.response) {
      if (err.response.status === 401) {
        errorMessage = 'No tienes permisos para ver estos videos. Inicia sesión nuevamente.';
      } else if (err.response.status === 400) {
        errorMessage = 'Error en la solicitud: ' + (err.response.data?.message || 'Datos inválidos');
      } else if (err.response.status === 500) {
        errorMessage = 'Error del servidor: ' + (err.response.data?.message || 'Error interno');
      } else {
        errorMessage = 'Error ' + err.response.status + ': ' + (err.response.data?.message || 'Error desconocido');
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    videosDiv.innerHTML = '<p style="color:red;">' + errorMessage + '</p>';
  }
}

function renderVideos() {
  let html = `
    <h3>Agregar nuevo video</h3>
    <form id="form-video">
      <input type="text" id="video-name" placeholder="Nombre del video" required />
      <input type="text" id="video-url" placeholder="URL de YouTube" required />
      <button type="submit">Agregar</button>
    </form>
    <h3>Lista de videos</h3>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>URL</th>
          <th>Fecha de creación</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;
  videos.forEach((video, idx) => {
    const videoName = extractValue(video.name);
    const videoUrl = extractValue(video.url);
    const videoKey = extractYouTubeKey(videoUrl);
    
    if (editIndex === idx) {
      html += `
        <tr>
          <td>${video.id}</td>
          <td><input type='text' value='${videoName}' id='edit-name'/></td>
          <td><input type='text' value='${videoUrl}' id='edit-url'/></td>
          <td>${formatFecha(video.createdAt)}</td>
          <td>
            <button onclick='guardarEdicionVideo(${idx})'>Guardar</button>
            <button onclick='cancelarEdicionVideo()'>Cancelar</button>
          </td>
        </tr>
      `;
    } else {
      html += `
        <tr class="video-row" data-video-id="${video.id}" data-video-key="${videoKey}">
          <td>${video.id}</td>
          <td>${videoName}</td>
          <td><a href="${videoUrl}" target="_blank">${videoUrl}</a></td>
          <td>${formatFecha(video.createdAt)}</td>
          <td>
            <button onclick='editarVideo(${idx})'>Editar</button>
            <button onclick='eliminarVideo("${video.id}")'>Eliminar</button>
          </td>
        </tr>
      `;
    }
  });
  html += '</tbody></table>';
  videosDiv.innerHTML = html;

  // Asignar evento al formulario
  const form = document.getElementById('form-video');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('video-name').value.trim();
      const url = document.getElementById('video-url').value.trim();
      if (!name || !url) return alert('Completa todos los campos');
      try {
        await createVideo({ idGroup: idGrupo, name, url });
        await cargarVideos();
        form.reset();
      } catch (err) {
        alert('Error al crear video: ' + (err.response?.data?.message || err.message));
      }
    };
  }

  // Redirección a video-cronometro.html al hacer clic en una fila de video
  document.querySelectorAll('.video-row').forEach(row => {
    row.addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
      const videoId = this.getAttribute('data-video-id');
      const videoKey = this.getAttribute('data-video-key');
      window.location.href = `video-cronometro.html?videoId=${videoId}&videoKey=${videoKey}&idGrupo=${idGrupo}`;
    });
  });
}

// Eliminar video
window.eliminarVideo = async function(id) {
  if (!confirm('¿Eliminar este video?')) return;
  try {
    await deleteVideo(id);
    await cargarVideos();
  } catch (err) {
    alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
  }
};

// Editar video
window.editarVideo = function(idx) {
  editIndex = idx;
  renderVideos();
};

// Guardar edición
window.guardarEdicionVideo = async function(idx) {
  const name = document.getElementById('edit-name').value.trim();
  const url = document.getElementById('edit-url').value.trim();
  if (!name || !url) return alert('Completa todos los campos');
  try {
    await updateVideo({ id: videos[idx].id, name, url });
    await cargarVideos();
  } catch (err) {
    alert('Error al editar: ' + (err.response?.data?.message || err.message));
  }
};

window.cancelarEdicionVideo = function() {
  editIndex = null;
  renderVideos();
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (window.renderHeaderDinamico) renderHeaderDinamico();
  cargarVideos();
}); 