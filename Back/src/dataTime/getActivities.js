const DataTimeService = require('../common/services/dataTimeService')
const { httpResponse } = require('../../utils/httpResponse')
const tokenVerification = require('../../utils/tokenVerification')
const logger = require('../../utils/logger')

module.exports.handler = async (event) => {
    try {
        // Validar token
        const user = tokenVerification(event)
        
        const params = event.queryStringParameters || {}
        logger.info('Query params recibidos en getActivities', params)
        const { idUser, videoId } = params
        if (!idUser || !videoId) {
            logger.error('Faltan parámetros idUser o videoId', { idUser, videoId })
            return httpResponse(400, { message: 'idUser y videoId son requeridos' })
        }
        const dataTimeService = new DataTimeService()
        logger.info('Llamando a getActivitiesByUserAndVideo', { idUser, videoId })
        const activities = await dataTimeService.getActivitiesByUserAndVideo(idUser, videoId)
        logger.info('Actividades obtenidas', { count: activities.length })
        return httpResponse(200, activities)
    } catch (error) {
        if (error.message.includes('Token')) {
            return httpResponse(401, { message: 'Error de autenticación', error: error.message })
        }
        logger.error('Error en getActivities', { error })
        return httpResponse(500, { message: error.message })
    }
} 