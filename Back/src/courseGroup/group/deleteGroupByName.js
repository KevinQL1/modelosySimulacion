const GroupService = require('../../common/services/GroupService')
const httpResponse = require('../../../utils/httpResponse');
const logger = require('../../../utils/logger');

const deleteGroup = async (event) => {
    const { grupo } = event.queryStringParameters;
    logger.info('Grupo obtenida', grupo);
    try {
        const groupService = new GroupService()
        const res = await groupService.deleteEntity(grupo);

        logger.info('grupo eliminado correctamente', res);
        return httpResponse.ok({message: 'Grupo eliminado correctamente'})
    } catch (error) {
        logger.error('Error eliminando grupo', error);
        return httpResponse.badRequest(new Error('Error al eliminar grupo: ' + error.message))(event.requestContext.path);
    }
}

module.exports.handler = deleteGroup
