const GroupService = require('../../common/services/GroupService')
const httpResponse = require('../../../utils/httpResponse')
const logger = require('../../../utils/logger')

const createGroup = async (event) => {
    try {
        const groupService = new GroupService()
        const res = await groupService.createEntity(JSON.parse(event.body))
        logger.info('Response', res)

        return httpResponse.ok(res)
    } catch (error) {
        logger.error('Error creating group', error)
        return httpResponse.badRequest(
            new Error('Error creating group: ' + error.message)
        )(event.requestContext.path)
    }
}

module.exports.handler = createGroup