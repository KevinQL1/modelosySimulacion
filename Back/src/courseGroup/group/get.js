const GroupService = require('../../common/services/GroupService')
const tokenVerification = require('../../../utils/tokenVerification');
const httpResponse = require('../../../utils/httpResponse');
const logger = require('../../../utils/logger');

const getGroup = async (event) => {
    try {
        const groupService = new GroupService()
        const queryParams = event.queryStringParameters || {};
        const { id, grupo } = queryParams;

        const user = tokenVerification(event);
        if (!user || user.scope !== 'administrador') {
            logger.error('Usuario no autorizado para obtener grupos');
            return httpResponse.unauthorized(new Error('No tienes permiso para obtener grupos'))(event.requestContext.path);
        }

        let res
        if (id) {
            logger.info('id', id);
            res = await groupService.getGroupById(id);
        } else if (grupo) {
            logger.info('grupo', grupo);
            res = await groupService.getItemByName(grupo);
        } else res = await groupService.getAllItems();


        logger.info('respuesta', res);
        return httpResponse.ok(res)
    } catch (error) {
        logger.error('Error obteniendo grupo', error);
        return httpResponse.badRequest(new Error('Error al obtener grupo: ' + error.message))(event.requestContext.path);
    }
}

module.exports.handler = getGroup
