const BASE_URL = 'https://8lbs9ozhwh.execute-api.sa-east-1.amazonaws.com';

const getToken = () => localStorage.getItem('token');

// Login - No requiere token
const login = (cedula) => {
    return axios.post(`${BASE_URL}/login`, { cedula });
};

// Usuarios
const createUser = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${BASE_URL}/user/create`, formData, {
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            // 'Content-Type' se gestiona automáticamente por el navegador para FormData
        }
    });
};

const getUsers = (cedula, nombre) => {
    const params = {};
    if (cedula) params.cedula = cedula;
    if (nombre) params.nombre = nombre;
    return axios.get(`${BASE_URL}/user/obtain`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
        params
    });
};

const deleteUser = (cedula) => {
    return axios.delete(`${BASE_URL}/user/delete`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
        params: { cedula }
    });
};

// Grupos
const createGroup = (groupData) => {
    return axios.post(`${BASE_URL}/group/create`, groupData, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
};

const getGroups = async () => {
        const params = {}; 

        const response = await axios.get(`${BASE_URL}/group/all`, { 
            headers: { 'Authorization': `Bearer ${getToken()}` },
            params
        });

        return response;
};

const deleteGroup = (grupo) => {
    return axios.delete(`${BASE_URL}/group/delete`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
        params: { grupo }
    });
};

// Cursos
const createCourse = (courseData) => {
    return axios.post(`${BASE_URL}/course/create`, courseData, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
};

const getCourses = (id, curso) => {
    const params = {};
    if (id) params.id = id;
    if (curso) params.curso = curso;
    return axios.get(`${BASE_URL}/course/obtain`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
        params
    });
};

const deleteCourse = (curso) => {
    return axios.delete(`${BASE_URL}/course/delete`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
        params: { curso }
    });
};

// Actividades (data-time)
const createActivity = (activityData) => {
    return axios.post(`${BASE_URL}/data-time/activity`, activityData, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
};

const updateActivity = (activityData) => {
    return axios.put(`${BASE_URL}/data-time/activity`, activityData, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
};

const getActivities = (idUser, videoId) => {
    const params = {};
    if (idUser) params.idUser = idUser;
    if (videoId) params.videoId = videoId;
    return axios.get(`${BASE_URL}/data-time/activities`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
        params
    });
};

const addLap = (lapData) => {
    return axios.post(`${BASE_URL}/data-time/lap`, lapData, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
};

const deleteLap = (activityId, lapIndex) => {
    return axios.delete(`${BASE_URL}/data-time/lap`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
        data: { activityId, lapIndex }
    });
};

const deleteActivity = (activityId) => {
    return axios.delete(`${BASE_URL}/data-time/activity`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
        params: { id: activityId }
    });
};

const updateUserGroup = (userId, groupId) => {
    return axios.put(`${BASE_URL}/user/update`, { userId, groupId }, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
};

// Videos
const createVideo = (videoData) => {
    return axios.post(`${BASE_URL}/video/create`, videoData, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
};

const getVideosByGroup = (idGroup) => {
    return axios.get(`${BASE_URL}/video/group`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
        params: { idGroup }
    });
};

const updateVideo = (videoData) => {
    return axios.put(`${BASE_URL}/video/update`, videoData, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
};

const deleteVideo = (id) => {
    return axios.delete(`${BASE_URL}/video/delete`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
        params: { id }
    });
};
