const UserService = require('../common/services/UserService');
const httpResponse = require('../../utils/httpResponse');
const logger = require('../../utils/logger');

const loginUser = async (event) => {
    try {
        const { cedula } = JSON.parse(event.body);

        if (!cedula) {
            return httpResponse.badRequest(
                new Error('La cédula es requerida')
            )(event.requestContext.path);
        }

        const userService = new UserService();
        const user = await userService.getUserById(cedula.toString());

        if (!user) {
            return httpResponse.notFound(
                new Error('Usuario no encontrado')
            )(event.requestContext.path);
        }

        logger.info('Login exitoso para usuario', { id: user.id });

        return httpResponse.ok({
            mensaje: 'Login exitoso',
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
