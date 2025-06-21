const CourseService = require('../../common/services/CourseService')
const httpResponse = require('../../../utils/httpResponse');
const logger = require('../../../utils/logger');

const deleteCourse = async (event) => {
    try {
        const courseService = new CourseService()
        
        const res = await courseService.deleteEntity(event.pathParameters.curso);

        logger.info('curso eliminado correctamente', res);
        return httpResponse.ok(res)
    } catch (error) {
        logger.error('Error eliminando curso', error);
        return httpResponse.badRequest(new Error('Error al eliminar curso: ' + error.message))(event.requestContext.path);
    }
}

module.exports.handler = deleteCourse
