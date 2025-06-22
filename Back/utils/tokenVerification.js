const jwt = require('jsonwebtoken');

// O usa un secreto fijo si estás validando tokens creados con clave fija
const JWT_SECRET = 'MODELOS_Y_SIMULACION_SECRET_KEY';

const tokenVerification = (event) => {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Token no proporcionado o mal formado');
    }


    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (err) {
        throw new Error('Token inválido o expirado', err);
    }
};

module.exports = tokenVerification;