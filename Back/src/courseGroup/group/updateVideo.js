const videoService = require('../../common/services/VideoService');
const tokenVerification = require('../../../utils/tokenVerification');
const httpResponse = require('../../../utils/httpResponse');
const logger = require('../../../utils/logger');

const updateVideo = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { id, name, url } = body;
    
    logger.info('Datos de actualización recibidos', { id, name, url });
    
    if (!id || !name || !url) {
      return httpResponse.badRequest(new Error('id, name y url son requeridos'))(event.requestContext.path);
    }

    const user = tokenVerification(event);
    if (!user || user.scope !== 'administrador') {
      logger.error('Usuario no autorizado para actualizar videos');
      return httpResponse.unauthorized(new Error('No tienes permiso para actualizar videos'))(event.requestContext.path);
    }

    const updated = await videoService.updateVideo(id, { name, url });
    
    logger.info('Video actualizado correctamente', updated);
    return httpResponse.ok(updated);
  } catch (err) {
    logger.error('Error actualizando video', err);
    return httpResponse.badRequest(new Error('Error al actualizar video: ' + err.message))(event.requestContext.path);
  }
};

module.exports.handler = updateVideo; 