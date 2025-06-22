const CourseService = require('../../common/services/CourseService')
const tokenVerification = require('../../../utils/tokenVerification');
const httpResponse = require('../../../utils/httpResponse');
const logger = require('../../../utils/logger');

const deleteCourse = async (event) => {
    const { curso } = event.queryStringParameters;
    logger.info('Curso obtenida', curso);
    try {
        const courseService = new CourseService()

        const user = tokenVerification(event);
        if (!user || user.scope !== 'administrador') {
            logger.error('Usuario no autorizado para borrar cursos');
            return httpResponse.unauthorized(new Error('No tienes permiso para borrar cursos'))(event.requestContext.path);
        }

        const res = await courseService.deleteEntity(curso);

        logger.info('curso eliminado correctamente', res);
        return httpResponse.ok({ message: 'Curso eliminado correctamente' })
    } catch (error) {
        logger.error('Error eliminando curso', error);
        return httpResponse.badRequest(new Error('Error al eliminar curso: ' + error.message))(event.requestContext.path);
    }
}

module.exports.handler = deleteCourse
