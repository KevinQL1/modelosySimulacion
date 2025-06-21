const UserService = require('../common/services/UserService')
const httpResponse = require('../../utils/httpResponse');
const logger = require('../../utils/logger');

const getUsers = async (event) => {
  try {
    const channelService = new UserService();
    const queryParams = event.queryStringParameters || {};
    const { cedula } = queryParams;

    let res;
    if (cedula) {
      res = await channelService.getUserById(cedula);
    } else res = await channelService.getAllItems();

    logger.info('Usuarios obtenidos', res);
    return httpResponse.ok(res)
  } catch (error) {
    logger.error('Error obteniendo usuarios', error);
    return httpResponse.badRequest(new Error('Error al obtener usuarios: ' + error.message))(event.requestContext.path);
  }
}

module.exports.handler = getUsers
