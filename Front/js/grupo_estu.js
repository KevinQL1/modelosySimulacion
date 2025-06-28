import { getUsers, getGroups, getCourses, getVideosByGroup } from '../connectionBackend/apiConnection';

// Lógica para gestión de videos del estudiante
let videos = [];
let editIndex = null;
let userInfo = null;
let userGroup = null;
let userCourse = null;

const videosDiv = document.getElementById('videos-grupo');

// Función para extraer el valor correcto de un campo que puede ser objeto o string
function extractValue(field) {
  if (typeof field === 'string') {
    return field;
  } else if (typeof field === 'object' && field !== null) {
    // Si es un objeto, intentar obtener el valor de diferentes propiedades comunes
    return field.S || field.value || field.name || field.url || JSON.stringify(field);
  }
  return String(field);
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

// Verificar que el usuario es estudiante
async function verificarEstudiante() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No hay sesión activa. Por favor, inicia sesión.');
      window.location.href = 'index.html';
      return false;
    }

    const scope = localStorage.getItem('scope');
    if (scope !== 'estudiante') {
      alert('Acceso denegado. Solo estudiantes pueden acceder a esta página.');
      window.location.href = 'index.html';
      return false;
    }

    // Crear objeto user con la información disponible
    userInfo = {
      id: localStorage.getItem('idUser'),
      name: localStorage.getItem('idUser') // Para estudiantes, el nombre es el ID
    };
    return true;
  } catch (error) {
    console.error('Error verificando usuario:', error);
    window.location.href = 'index.html';
    return false;
  }
}

// Obtener el grupo del estudiante
async function obtenerGrupoEstudiante() {
  try {
    const userId = localStorage.getItem('idUser');
    console.log('Buscando grupo para estudiante:', userId);
    
    // Primero obtener la información del usuario para ver su groupId
    const users = await getUsers();
    console.log('Usuarios obtenidos:', users);
    
    const currentUser = users.data.find(user => user.id === userId);
    console.log('Usuario actual:', currentUser);
    
    if (!currentUser) {
      throw new Error('No se encontró información del usuario');
    }
    
    if (!currentUser.groupId) {
      throw new Error('Este estudiante no tiene un grupo asignado');
    }
    
    // Ahora obtener todos los grupos y encontrar el grupo específico
    const groups = await getGroups();
    console.log('Grupos obtenidos:', groups);
    
    const foundGroup = groups.data.find(group => group.id === currentUser.groupId);
    console.log('Grupo encontrado:', foundGroup);
    
    if (!foundGroup) {
      throw new Error('No se encontró el grupo asignado para este estudiante');
    }
    
    // Asignar al variable global
    userGroup = foundGroup;
    return foundGroup;
  } catch (error) {
    console.error('Error obteniendo grupo del estudiante:', error);
    throw error;
  }
}

// Obtener la asignatura del grupo
async function obtenerAsignaturaGrupo() {
  try {
    if (!userGroup || !userGroup.idCourse) {
      throw new Error('No se pudo obtener la información del curso');
    }

    const courses = await getCourses();
    userCourse = courses.data.find(course => course.id === userGroup.idCourse);
    
    if (!userCourse) {
      throw new Error('No se encontró la asignatura del grupo');
    }

    return userCourse;
  } catch (error) {
    console.error('Error obteniendo asignatura del grupo:', error);
    throw error;
  }
}

// Actualizar el header con información del estudiante
function actualizarHeader() {
  const userInfoDiv = document.getElementById('user-info');
  if (userInfoDiv && userCourse && userGroup) {
    userInfoDiv.innerHTML = `
      <div class="user-info">
        <span class="user-name">${userInfo.name}</span>
        <span class="user-role">Estudiante</span>
        <div class="course-group-info">
          <span class="course-name">${extractValue(userCourse.name)}</span>
          <span class="group-name">${extractValue(userGroup.name)}</span>
        </div>
      </div>
    `;
  }
}

// Actualizar breadcrumb
function actualizarBreadcrumb() {
  const breadcrumbDiv = document.getElementById('breadcrumb');
  if (breadcrumbDiv && userCourse && userGroup) {
    breadcrumbDiv.innerHTML = `
      <span class="breadcrumb-item">Inicio</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item">${extractValue(userCourse.name)}</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item">${extractValue(userGroup.name)}</span>
    `;
  }
}

async function cargarVideos() {
  try {
    if (!userGroup) {
      throw new Error('No se pudo obtener la información del grupo');
    }

    console.log('Cargando videos para grupo:', userGroup.id);
    const res = await getVideosByGroup(userGroup.id);
    console.log('Respuesta de getVideosByGroup:', res);
    videos = res.data || [];
    console.log('Videos cargados:', videos);
    editIndex = null;
    renderVideos();
  } catch (err) {
    console.error('Error al cargar videos:', err);
    console.error('Error response:', err.response);
    videosDiv.innerHTML = '<p style="color:red;">Error al cargar videos: ' + (err.message || 'Error desconocido') + '</p>';
  }
}

function renderVideos() {
  let html = `
    <h3>Videos de mi grupo</h3>
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
  
  if (videos.length === 0) {
    html += `
      <tr>
        <td colspan="5" style="text-align: center; padding: 20px;">
          No hay videos disponibles en tu grupo
        </td>
      </tr>
    `;
  } else {
    videos.forEach((video, idx) => {
      const videoName = extractValue(video.name);
      const videoUrl = extractValue(video.url);
      const videoKey = extractYouTubeKey(videoUrl);
      
      html += `
        <tr class="video-row" data-video-id="${video.id}" data-video-key="${videoKey}">
          <td>${video.id}</td>
          <td>${videoName}</td>
          <td><a href="${videoUrl}" target="_blank">${videoUrl}</a></td>
          <td>${formatFecha(video.createdAt)}</td>
          <td>
            <button onclick='verVideo("${video.id}", "${videoKey}")'>Ver Video</button>
          </td>
        </tr>
      `;
    });
  }
  
  html += '</tbody></table>';
  videosDiv.innerHTML = html;

  // Redirección a video-cronometro.html al hacer clic en una fila de video
  document.querySelectorAll('.video-row').forEach(row => {
    row.addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
      const videoId = this.getAttribute('data-video-id');
      const videoKey = this.getAttribute('data-video-key');
      window.location.href = `video-cronometro.html?videoId=${videoId}&videoKey=${videoKey}&idGrupo=${userGroup.id}`;
    });
  });
}

// Ver video
window.verVideo = function(videoId, videoKey) {
  window.location.href = `video-cronometro.html?videoId=${videoId}&videoKey=${videoKey}&idGrupo=${userGroup.id}`;
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Verificar que el usuario es estudiante
    const esEstudiante = await verificarEstudiante();
    if (!esEstudiante) return;

    // Obtener información del grupo y asignatura
    await obtenerGrupoEstudiante();
    await obtenerAsignaturaGrupo();

    // Actualizar header y breadcrumb
    actualizarHeader();
    actualizarBreadcrumb();

    // Renderizar header dinámico
    if (window.renderHeaderDinamico) renderHeaderDinamico();

    // Cargar videos
    await cargarVideos();
  } catch (error) {
    console.error('Error inicializando página:', error);
    alert('Error al cargar la página: ' + error.message);
  }
}); 