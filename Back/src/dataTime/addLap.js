const DataTimeService = require('../common/services/dataTimeService')
const { httpResponse } = require('../../utils/httpResponse')
const tokenVerification = require('../../utils/tokenVerification')

module.exports.handler = async (event) => {
    try {
        // Validar token
        const user = tokenVerification(event)
        
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
        const { activityId, StartTime, EndTime, DiffTime } = body
        
        if (!activityId || !StartTime || !EndTime || !DiffTime) {
            return httpResponse(400, { message: 'activityId, StartTime, EndTime y DiffTime son requeridos' })
        }
        
        const dataTimeService = new DataTimeService()
        const activity = await dataTimeService.addLapToActivity({ activityId, StartTime, EndTime, DiffTime })
        
        return httpResponse(200, activity)
    } catch (error) {
        if (error.message.includes('Token')) {
            return httpResponse(401, { message: 'Error de autenticación', error: error.message })
        }
        return httpResponse(500, { message: error.message })
    }
} 