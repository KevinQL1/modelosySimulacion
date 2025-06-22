const jwt = require('jsonwebtoken');
const UserService = require('../common/services/UserService');
const httpResponse = require('../../utils/httpResponse');
const logger = require('../../utils/logger');

const JWT_SECRET = 'MODELOS_Y_SIMULACION_SECRET_KEY';

const loginUser = async (event) => {
    try {
        const { cedula } = JSON.parse(event.body);
        logger.info('Login iniciado para usuario',cedula);

        if (!cedula) {
            return httpResponse.badRequest(
                new Error('La cédula es requerida')
            )(event.requestContext.path);
        }

        const userService = new UserService();
        const user = await userService.getUserById(cedula);
        logger.info('Usuario obtenido', user);

        if (!user) {
            return httpResponse.notFound(
                new Error('Usuario no encontrado')
            )(event.requestContext.path);
        }

        const { scope, name, id } = user;

        if (!scope || (scope !== 'estudiante' && scope !== 'administrador')) {
            return httpResponse.badRequest(
                new Error('El usuario no tiene un scope válido')
            )(event.requestContext.path);
        }

        // Payload limpio
        const tokenPayload = {
            id: cedula,
            name,
            scope,
        };

        // Firmar el token
        const token = jwt.sign(tokenPayload, JWT_SECRET, {
            expiresIn: '2h',
        });

        logger.info('Login exitoso para usuario', { id, scope });

        return httpResponse.ok({
            mensaje: 'Login exitoso',
            token,
            user
        });

    } catch (error) {
        logger.error('Error durante el login', error);
        return httpResponse.badRequest(
            new Error('Error al iniciar sesión: ' + error.message)
        )(event.requestContext.path);
    }
};

module.exports.handler = loginUser;
