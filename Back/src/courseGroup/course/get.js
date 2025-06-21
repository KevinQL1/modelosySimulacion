const CourseService = require('../../common/services/CourseService')
const httpResponse = require('../../../utils/httpResponse');
const logger = require('../../../utils/logger');

const getCourse = async (event) => {
    try {
        const courseService = new CourseService()
        const queryParams = event.queryStringParameters || {};
        const { curso } = queryParams;

        let res
        if (curso) {
           res = await courseService.getCourse(curso);
        } else res = await courseService.getAllItems();
        

        logger.info('curso', res);
        return httpResponse.ok(res)
    } catch (error) {
        logger.error('Error obteniendo curso', error);
        return httpResponse.badRequest(new Error('Error al obtener curso: ' + error.message))(event.requestContext.path);
    }
}

module.exports.handler = getCourse
