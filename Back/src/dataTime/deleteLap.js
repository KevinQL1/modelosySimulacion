const DataTimeService = require('../common/services/dataTimeService')
const { httpResponse } = require('../../utils/httpResponse')
const tokenVerification = require('../../utils/tokenVerification')

module.exports.handler = async (event) => {
    try {
        // Validar token
        const user = tokenVerification(event)
        
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
        const { activityId, lapIndex } = body
        
        if (!activityId || lapIndex === undefined) {
            return httpResponse(400, { message: 'activityId y lapIndex son requeridos' })
        }
        
        const dataTimeService = new DataTimeService()
        const activity = await dataTimeService.deleteLapFromActivity({ activityId, lapIndex })
        
        return httpResponse(200, activity)
    } catch (error) {
        if (error.message.includes('Token')) {
            return httpResponse(401, { message: 'Error de autenticación', error: error.message })
        }
        return httpResponse(500, { message: error.message })
    }
} 