const videoService = require('../../common/services/VideoService');
const tokenVerification = require('../../../utils/tokenVerification');
const httpResponse = require('../../../utils/httpResponse');
const logger = require('../../../utils/logger');

const getVideosByGroup = async (event) => {
  try {
    const idGroup = event.queryStringParameters?.idGroup;
    logger.info(`ID de grupo obtenido ${JSON.stringify(idGroup)}`);

    if (!idGroup) {
      return httpResponse.badRequest(new Error('idGroup es requerido'))(event.requestContext.path);
    }

    const user = tokenVerification(event);
    if (!user) {
      logger.error('Usuario no autorizado para obtener videos');
      return httpResponse.unauthorized(new Error('No tienes permiso para obtener videos'))(event.requestContext.path);
    }

    const videos = await videoService.getVideosByGroup(idGroup);

    logger.info(`IVideos obtenidos correctamente ${JSON.stringify(videos)}`);
    return httpResponse.ok(videos);
  } catch (err) {
    logger.error('Error obteniendo videos', err);
    return httpResponse.badRequest(new Error('Error al obtener videos: ' + err.message))(event.requestContext.path);
  }
};

module.exports.handler = getVideosByGroup; 