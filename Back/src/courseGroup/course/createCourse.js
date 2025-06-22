const CourseService = require('../../common/services/CourseService')
const tokenVerification = require('../../../utils/tokenVerification')
const httpResponse = require('../../../utils/httpResponse')
const logger = require('../../../utils/logger')

const createCourse = async (event) => {
    try {
        const courseService = new CourseService()

        const user = tokenVerification(event);
        if (!user || user.scope !== 'administrador') {
            logger.error('Usuario no autorizado para crear cursos');
            return httpResponse.unauthorized(new Error('No tienes permiso para crear cursos'))(event.requestContext.path);
        }

        const res = await courseService.createEntity(JSON.parse(event.body))
        logger.info('Response', res)

        return httpResponse.ok(res)
    } catch (error) {
        logger.error('Error creating course', error)
        return httpResponse.badRequest(
            new Error('Error creating course: ' + error.message)
        )(event.requestContext.path)
    }
}

module.exports.handler = createCourse