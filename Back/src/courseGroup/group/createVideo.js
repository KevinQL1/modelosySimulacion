const videoService = require('../../common/services/VideoService');
const tokenVerification = require('../../../utils/tokenVerification');
const httpResponse = require('../../../utils/httpResponse');
const logger = require('../../../utils/logger');

const createVideo = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { idGroup, name, url } = body;
    
    logger.info('Datos de creación recibidos', { idGroup, name, url });
    
    if (!idGroup || !name || !url) {
      return httpResponse.badRequest(new Error('idGroup, name y url son requeridos'))(event.requestContext.path);
    }

    const user = tokenVerification(event);
    if (!user || user.scope !== 'administrador') {
      logger.error('Usuario no autorizado para crear videos');
      return httpResponse.unauthorized(new Error('No tienes permiso para crear videos'))(event.requestContext.path);
    }

    const video = await videoService.createVideo({ idGroup, name, url });
    
    logger.info('Video creado correctamente', video);
    return httpResponse.ok(video);
  } catch (err) {
    logger.error('Error creando video', err);
    return httpResponse.badRequest(new Error('Error al crear video: ' + err.message))(event.requestContext.path);
  }
};

module.exports.handler = createVideo; 