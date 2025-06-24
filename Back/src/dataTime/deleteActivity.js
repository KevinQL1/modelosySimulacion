const DataTimeService = require('../common/services/dataTimeService')
const { httpResponse } = require('../../utils/httpResponse')
const tokenVerification = require('../../utils/tokenVerification')

module.exports.handler = async (event) => {
    try {
        // Validar token
        const user = tokenVerification(event)
        
        const { id } = event.queryStringParameters || {}
        
        if (!id) {
            return httpResponse(400, { message: 'id de la actividad es requerido' });
        }
        
        const dataTimeService = new DataTimeService()
        await dataTimeService.deleteEntity(id)
        
        return httpResponse(200, { message: 'Actividad eliminada correctamente' });
    } catch (error) {
        if (error.message.includes('Token')) {
            return httpResponse(401, { message: 'Error de autenticación', error: error.message })
        }
        return httpResponse(500, { message: error.message });
    }
} 