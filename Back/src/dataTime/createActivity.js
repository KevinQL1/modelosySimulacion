const DataTimeService = require('../common/services/dataTimeService')
const DataTimeEntity = require('../common/entities/DataTimeEntity')
const { httpResponse } = require('../../utils/httpResponse')
const logger = require('../../utils/logger')
const tokenVerification = require('../../utils/tokenVerification')

module.exports.handler = async (event) => {
    try {
        console.log('=== CREATE ACTIVITY HANDLER START ===')
        console.log('Event:', JSON.stringify(event, null, 2))
        
        // Verificar que event existe
        if (!event) {
            console.error('Event es null o undefined')
            return httpResponse(500, { message: 'Event es null o undefined' })
        }
        
        // Validar token
        console.log('Validando token...')
        const user = tokenVerification(event)
        console.log('Token validado para usuario:', user)
        
        // Verificar que event.body existe
        if (!event.body) {
            console.error('Event.body es null o undefined')
            return httpResponse(400, { message: 'Body es requerido' })
        }
        
        let body
        try {
            body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
            console.log('Body parseado correctamente:', JSON.stringify(body, null, 2))
        } catch (parseError) {
            console.error('Error al parsear body:', parseError)
            return httpResponse(400, { message: 'Body JSON inválido', error: parseError.message })
        }
        
        const { idUser, videoId, nameActivity } = body
        
        // Validación de parámetros
        if (!idUser || !videoId || !nameActivity) {
            console.error('Parámetros faltantes:', { idUser, videoId, nameActivity })
            return httpResponse(400, { 
                message: 'idUser, videoId y nameActivity son requeridos',
                received: { idUser, videoId, nameActivity }
            })
        }
        
        console.log('Parámetros validados correctamente:', { idUser, videoId, nameActivity })
        
        // Crear servicio
        console.log('Creando DataTimeService...')
        const dataTimeService = new DataTimeService()
        console.log('DataTimeService creado exitosamente')
        
        // Crear actividad
        console.log('Llamando a createActivity...')
        const activity = await dataTimeService.createActivity({ idUser, videoId, nameActivity })
        console.log('Actividad creada exitosamente:', JSON.stringify(activity, null, 2))
        
        // Retornar respuesta
        console.log('Retornando respuesta exitosa...')
        const response = httpResponse(201, activity)
        console.log('Respuesta creada:', JSON.stringify(response, null, 2))
        return response
        
    } catch (error) {
        console.error('=== ERROR EN CREATE ACTIVITY HANDLER ===')
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        console.error('Error name:', error.name)
        console.error('Full error object:', JSON.stringify(error, null, 2))
        
        // Manejar errores específicos de autenticación
        if (error.message.includes('Token')) {
            return httpResponse(401, { 
                message: 'Error de autenticación',
                error: error.message
            })
        }
        
        // Respuesta más detallada para debugging
        return httpResponse(500, { 
            message: 'Error interno del servidor',
            error: error.message,
            errorName: error.name,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
} 