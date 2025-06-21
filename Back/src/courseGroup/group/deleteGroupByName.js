const GroupService = require('../../common/services/GroupService')
const httpResponse = require('../../../utils/httpResponse');
const logger = require('../../../utils/logger');

const deleteGroup = async (event) => {
    try {
        const groupService = new GroupService()
        const res = await groupService.deleteEntity(event.pathParameters.grupo);

        logger.info('grupo eliminado correctamente', res);
        return httpResponse.ok(res)
    } catch (error) {
        logger.error('Error eliminando grupo', error);
        return httpResponse.badRequest(new Error('Error al eliminar grupo: ' + error.message))(event.requestContext.path);
    }
}

module.exports.handler = deleteGroup
