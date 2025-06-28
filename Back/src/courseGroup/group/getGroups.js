const GroupService = require('../../common/services/GroupService')
const tokenVerification = require('../../../utils/tokenVerification')
const httpResponse = require('../../../utils/httpResponse')
const logger = require('../../../utils/logger')

const getGroups = async (event) => {
    try {
        const groupService = new GroupService()

        const user = tokenVerification(event);
        if (!user || (user.scope !== 'administrador' && user.scope !== 'estudiante')) {
            logger.error('Usuario no autenticado para obtener grupos');
            return httpResponse.unauthorized(new Error('No tienes permiso para ver los grupos'))(event.requestContext.path);
        }

        const res = await groupService.getAllItems();
        logger.info(`Grupos obtenidos de la DB: ${JSON.stringify(res)}`);

        return httpResponse.ok(res)
    } catch (error) {
        logger.error('Error obtain group', error)
        return httpResponse.badRequest(
            new Error('Error obtain group: ' + error.message)
        )(event.requestContext.path)
    }
}

module.exports.handler = getGroups