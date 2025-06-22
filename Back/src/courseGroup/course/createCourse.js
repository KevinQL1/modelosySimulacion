const CourseService = require('../../common/services/CourseService')
const httpResponse = require('../../../utils/httpResponse')
const logger = require('../../../utils/logger')

const createCourse = async (event) => {
    try {
        const courseService = new CourseService()
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