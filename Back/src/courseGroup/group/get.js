const GroupService = require('../../common/services/GroupService')
const httpResponse = require('../../../utils/httpResponse');
const logger = require('../../../utils/logger');

const getGroup = async (event) => {
    try {
        const groupService = new GroupService()
        const queryParams = event.queryStringParameters || {};
        const { grupo } = queryParams;

        let res
        if (grupo) {
           res = await groupService.getGroup(grupo);
        } else res = await groupService.getAllItems();
        

        logger.info('grupo', res);
        return httpResponse.ok(res)
    } catch (error) {
        logger.error('Error obteniendo grupo', error);
        return httpResponse.badRequest(new Error('Error al obtener grupo: ' + error.message))(event.requestContext.path);
    }
}

module.exports.handler = getGroup
