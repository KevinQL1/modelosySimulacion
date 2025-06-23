const BASE_URL = 'https://htjs2tcinl.execute-api.sa-east-1.amazonaws.com';

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