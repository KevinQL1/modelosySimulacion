const BASE_URL = 'https://8lbs9ozhwh.execute-api.sa-east-1.amazonaws.com';

const getToken = () => localStorage.getItem('token');

// Login - No requiere token
const login = (cedula) => {
    return axios.post(`${BASE_URL}/login`, { cedula });
};

// Usuarios
const createUser = (userData) => {
    return axios.post(`${BASE_URL}/user/create`, userData, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
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

const getGroups = (id, grupo) => {
    const params = {};
    if (id) params.id = id;
    if (grupo) params.grupo = grupo;
    return axios.get(`${BASE_URL}/group/obtain`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
        params
    });
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