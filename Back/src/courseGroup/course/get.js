const CourseService = require('../../common/services/CourseService')
const tokenVerification = require('../../../utils/tokenVerification');
const httpResponse = require('../../../utils/httpResponse');
const logger = require('../../../utils/logger');

const getCourse = async (event) => {
    try {
        const courseService = new CourseService()
        const queryParams = event.queryStringParameters || {};
        const { id, curso } = queryParams;

        const user = tokenVerification(event);

        let res
        if (id) {
            logger.info('id', id);
            res = await courseService.getCourseById(id);
        } else if (curso) {
            logger.info('curso', curso);
            res = await courseService.getCourse(curso);
        } else if (user.scope === 'administrador' || user.scope === 'estudiante') {
            res = await courseService.getAllItems();
        } else {
            return httpResponse.unauthorized(new Error('No tienes permiso para obtener cursos'))(event.requestContext.path);
        }

        logger.info('respuesta', res);
        return httpResponse.ok(res)
    } catch (error) {
        logger.error('Error obteniendo curso', error);
        return httpResponse.badRequest(new Error('Error al obtener curso: ' + error.message))(event.requestContext.path);
    }
}

module.exports.handler = getCourse
