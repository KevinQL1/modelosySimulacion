const UserService = require('../common/services/UserService')
const httpResponse = require('../../utils/httpResponse');
const logger = require('../../utils/logger');

const deleteUser = async (event) => {
    try {
        const userService = new UserService()
        const res = await userService.deleteEntity(event.pathParameters.cedula);

        logger.info('Usuario eliminado correctamente', res);
        return httpResponse.ok(res)
    } catch (error) {
        logger.error('Error eliminando usuario', error);
        return httpResponse.badRequest(new Error('Error al eliminar usuario: ' + error.message))(event.requestContext.path);
    }
}

module.exports.handler = deleteUser
