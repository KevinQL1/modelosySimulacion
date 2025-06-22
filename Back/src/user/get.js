const UserService = require('../common/services/UserService')
const httpResponse = require('../../utils/httpResponse');
const logger = require('../../utils/logger');

const getUsers = async (event) => {
  try {
    const userService = new UserService();
    const queryParams = event.queryStringParameters || {};
    const { cedula, nombre } = queryParams;

    let res;
    if (cedula) {
      logger.info('Cedula obtenida', cedula);
      res = await userService.getUserById(cedula);
    } else if (nombre) {
      logger.info('Nombre obtenido', nombre);
      res = await userService.getItemByName(nombre);
    } else {
      logger.info('Obteniendo todos los usuarios');
      res = await userService.getAllItems();
    }

    logger.info('Usuarios obtenidos', res);
    return httpResponse.ok(res)
  } catch (error) {
    logger.error('Error obteniendo usuarios', error);
    return httpResponse.badRequest(new Error('Error al obtener usuarios: ' + error.message))(event.requestContext.path);
  }
}

module.exports.handler = getUsers
