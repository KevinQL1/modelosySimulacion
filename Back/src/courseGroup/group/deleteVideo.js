const videoService = require('../../common/services/VideoService');
const tokenVerification = require('../../../utils/tokenVerification');
const httpResponse = require('../../../utils/httpResponse');
const logger = require('../../../utils/logger');

const deleteVideo = async (event) => {
  try {
    const id = event.queryStringParameters?.id;
    logger.info('Video ID obtenido', id);
    
    if (!id) {
      return httpResponse.badRequest(new Error('id es requerido'))(event.requestContext.path);
    }

    const user = tokenVerification(event);
    if (!user || user.scope !== 'administrador') {
      logger.error('Usuario no autorizado para eliminar videos');
      return httpResponse.unauthorized(new Error('No tienes permiso para eliminar videos'))(event.requestContext.path);
    }

    await videoService.deleteVideo(id);
    
    logger.info('Video eliminado correctamente', { id });
    return httpResponse.ok({ message: 'Video eliminado correctamente' });
  } catch (err) {
    logger.error('Error eliminando video', err);
    return httpResponse.badRequest(new Error('Error al eliminar video: ' + err.message))(event.requestContext.path);
  }
};

module.exports.handler = deleteVideo; 