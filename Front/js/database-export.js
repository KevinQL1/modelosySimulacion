// Funcionalidad de exportación completa de la base de datos
// Este archivo debe ser incluido en todas las páginas que tengan el botón "Exportar DB"

import { getUsers, getCourses, getGroups, getVideosByGroup, getActivities } from '../connectionBackend/apiConnection';

// Función para obtener todos los campos únicos de un array de objetos
function getAllKeys(arr) {
    const keys = new Set();
    arr.forEach(obj => {
        Object.keys(obj).forEach(k => keys.add(k));
    });
    return Array.from(keys);
}

// Función para normalizar los objetos a todos los campos posibles
function normalizeRows(arr, allKeys) {
    return arr.map(obj => {
        const row = {};
        allKeys.forEach(k => {
            row[k] = obj[k] !== undefined ? obj[k] : '';
        });
        return row;
    });
}

// Función para extraer el YouTube ID de una URL
function extractYouTubeId(url) {
    if (!url) return '';
    const match = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : '';
}

// Función principal para exportar toda la base de datos
async function exportarBaseDeDatos() {
    try {
        // Mostrar spinner de carga
        mostrarSpinnerExport('Exportando base de datos...');
        
        // Obtener todos los datos de todas las tablas en paralelo
        const [users, courses, groups, videos, activities] = await Promise.all([
            getUsers(),
            getCourses(),
            getGroups(),
            getAllVideos(),
            getAllActivities()
        ]);
        
        // Crear el archivo Excel con múltiples hojas
        const wb = XLSX.utils.book_new();
        
        // Hoja 1: Usuarios
        if (users.data && users.data.length > 0) {
            const allKeys = getAllKeys(users.data);
            const usersData = normalizeRows(users.data, allKeys);
            const wsUsers = XLSX.utils.json_to_sheet(usersData);
            XLSX.utils.book_append_sheet(wb, wsUsers, "Usuarios");
        }
        
        // Hoja 2: Cursos
        if (courses.data && courses.data.length > 0) {
            const allKeys = getAllKeys(courses.data);
            const coursesData = normalizeRows(courses.data, allKeys);
            const wsCourses = XLSX.utils.json_to_sheet(coursesData);
            XLSX.utils.book_append_sheet(wb, wsCourses, "Cursos");
        }
        
        // Hoja 3: Grupos
        if (groups.data && groups.data.length > 0) {
            const allKeys = getAllKeys(groups.data);
            const groupsData = normalizeRows(groups.data, allKeys);
            const wsGroups = XLSX.utils.json_to_sheet(groupsData);
            XLSX.utils.book_append_sheet(wb, wsGroups, "Grupos");
        }
        
        // Hoja 4: Videos
        if (videos.data && videos.data.length > 0) {
            const allKeys = getAllKeys(videos.data);
            const videosData = normalizeRows(videos.data, allKeys);
            const wsVideos = XLSX.utils.json_to_sheet(videosData);
            XLSX.utils.book_append_sheet(wb, wsVideos, "Videos");
        }
        
        // Hoja 5: Actividades y Laps (OPTIMIZADA)
        if (activities.data && activities.data.length > 0) {
            // Crear Maps para lookup ultra-rápido
            const usersMap = new Map((users.data || []).map(u => [u.id, u]));
            const groupsMap = new Map((groups.data || []).map(g => [g.id, g]));
            const coursesMap = new Map((courses.data || []).map(c => [c.id, c]));
            
            // Crear Map de videos por YouTube ID
            const videosByYouTubeId = new Map();
            (videos.data || []).forEach(v => {
                const ytId = extractYouTubeId(v.url);
                if (ytId) videosByYouTubeId.set(ytId, v);
            });

            // Procesar actividades de forma optimizada
            const activitiesData = [];
            
            for (const activity of activities.data) {
                const user = usersMap.get(activity.idUser) || {};
                const video = videosByYouTubeId.get(activity.videoId) || {};
                const group = video.idGroup ? (groupsMap.get(video.idGroup) || {}) : {};
                const course = group.idCourse ? (coursesMap.get(group.idCourse) || {}) : {};

                // Crear objeto base de la actividad
                const baseActivity = {
                    IDActividad: activity.id,
                    NombreActividad: activity.nameActivity,
                    IDUsuario: activity.idUser,
                    NombreUsuario: user.name || '',
                    IDVideo: activity.videoId,
                    NombreVideo: video.name || '',
                    IDGrupo: video.idGroup || '',
                    NombreGrupo: group.name || '',
                    IDCurso: group.idCourse || '',
                    NombreCurso: course.name || '',
                    FechaCreacionActividad: formatDate(activity.createdAt)
                };

                // Procesar laps si existen
                if (activity.laps && activity.laps.length > 0) {
                    for (const lap of activity.laps) {
                        activitiesData.push({
                            ...baseActivity,
                            StartTime: lap.StartTime,
                            EndTime: lap.EndTime,
                            DiffTime: lap.DiffTime,
                            FechaCreacionLap: lap.createdAt ? formatDate(lap.createdAt) : ''
                        });
                    }
                } else {
                    activitiesData.push({
                        ...baseActivity,
                        StartTime: '',
                        EndTime: '',
                        DiffTime: '',
                        FechaCreacionLap: ''
                    });
                }
            }
            
            const allKeys = getAllKeys(activitiesData);
            const normActivities = normalizeRows(activitiesData, allKeys);
            const wsActivities = XLSX.utils.json_to_sheet(normActivities);
            XLSX.utils.book_append_sheet(wb, wsActivities, "Actividades_Laps");
        }
        
        // Generar nombre del archivo con timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const fileName = `base_datos_completa_${timestamp}.xlsx`;
        
        // Descargar el archivo
        XLSX.writeFile(wb, fileName);
        
        mostrarFeedbackExport('Base de datos exportada exitosamente', 'success');
        
    } catch (error) {
        mostrarFeedbackExport('Error al exportar la base de datos: ' + error.message, 'error');
    }
}

// Función para obtener todos los videos (OPTIMIZADA)
async function getAllVideos() {
    try {
        // Obtener todos los grupos primero
        const groups = await getGroups();
        const allVideos = [];
        
        // Crear todas las promesas de videos en paralelo
        const videoPromises = groups.data.map(async (group) => {
            try {
                const videos = await getVideosByGroup(group.id);
                return videos.data || [];
            } catch (err) {
                return [];
            }
        });
        
        // Esperar todas las promesas
        const videoArrays = await Promise.all(videoPromises);
        
        // Combinar todos los arrays
        videoArrays.forEach(videos => allVideos.push(...videos));
        
        return { data: allVideos };
    } catch (error) {
        return { data: [] };
    }
}

// Función para obtener todas las actividades (OPTIMIZADA)
async function getAllActivities() {
    try {
        const users = await getUsers();
        const videos = await getAllVideos();
        const allActivities = [];
        
        // Filtrar solo estudiantes
        const estudiantes = users.data.filter(user => user.scope === 'estudiante');
        
        // Crear todas las promesas de actividades en paralelo
        const activityPromises = [];
        
        for (const user of estudiantes) {
            for (const video of videos.data) {
                activityPromises.push(
                    getActivities(user.id, video.id)
                        .then(activities => activities.data || [])
                        .catch(() => {
                            return [];
                        })
                );
            }
        }
        
        // Esperar todas las promesas
        const activityArrays = await Promise.all(activityPromises);
        
        // Combinar todos los arrays
        activityArrays.forEach(activities => allActivities.push(...activities));
        
        return { data: allActivities };
    } catch (error) {
        return { data: [] };
    }
}

// Función para formatear fechas (OPTIMIZADA)
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// Función para mostrar spinner durante la exportación
function mostrarSpinnerExport(msg = 'Exportando...') {
    // Crear o usar un elemento de feedback existente
    let feedbackElement = document.getElementById('feedback-export');
    if (!feedbackElement) {
        feedbackElement = document.createElement('div');
        feedbackElement.id = 'feedback-export';
        feedbackElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
        `;
        document.body.appendChild(feedbackElement);
    }
    
    feedbackElement.innerHTML = `
        <div style="margin-bottom: 10px;">${msg}</div>
        <div style="width: 20px; height: 20px; border: 2px solid #003d99; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
    `;
    feedbackElement.style.display = 'block';
}

// Función para mostrar feedback de la exportación
function mostrarFeedbackExport(msg, tipo = 'info') {
    const feedbackElement = document.getElementById('feedback-export');
    if (feedbackElement) {
        feedbackElement.innerHTML = `
            <div style="color: ${tipo === 'error' ? 'red' : tipo === 'success' ? 'green' : 'blue'};">
                ${msg}
            </div>
        `;
        
        setTimeout(() => {
            feedbackElement.style.display = 'none';
        }, 3000);
    }
}

// Agregar estilos CSS para la animación del spinner
if (!document.getElementById('export-styles')) {
    const style = document.createElement('style');
    style.id = 'export-styles';
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Exportar la función principal para uso global
window.exportarBaseDeDatos = exportarBaseDeDatos; 