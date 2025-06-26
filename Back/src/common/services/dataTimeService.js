const { unmarshall } = require('@aws-sdk/util-dynamodb')
const DynamoDBAdapter = require('../adapters/dynamoDbAdapter')
const DataTime = require('../entities/DataTimeEntity')
const logger = require('../../../utils/logger')
const { v4: uuidv4 } = require('uuid')

module.exports = class DataTimeService {
    constructor(dynamoDBAdapter) {
        this.dynamoDBAdapter = dynamoDBAdapter || new DynamoDBAdapter()
        this.tableName = 'ch-data-time'
    }

    async getDataTimeById(dataTimeId) {
        const response = await this.dynamoDBAdapter.getItemById(this.tableName, {
            id: `${dataTimeId}`
        })
        if (!response.Item) {
            logger.error('dataTime not exists', { dataTimeId })
            throw new Error('dataTime not exists')
        }
        return new DataTime(unmarshall(response.Item))
    }

    async getItemByName(name) {
        try {
            const params = {
                TableName: this.tableName,
                IndexName: 'name-index',
                KeyConditionExpression: '#name = :name',
                ExpressionAttributeNames: {
                    '#name': 'name'
                },
                ExpressionAttributeValues: {
                    ':name': { S: name },
                },
                Limit: 1
            }

            const response = await this.dynamoDBAdapter.getItemBySecondIndex(params)
            const item = response.Items?.[0];
            logger.info('Item obtenido por NAME correctamente', { item });
            return item ? unmarshall(item) : null;
        } catch (error) {
            logger.error('Error al obtener item por NAME', { error });
            throw new Error(`Failed to get item by NAME: ${error}`);
        }
    }

    async createEntity(dataTimeObject) {
        logger.info('dataTimeObject', dataTimeObject)
        let dataTimeEntity
        try {
            dataTimeEntity = await this.getDataTimeById(dataTimeObject.id)
            logger.info('dataTimeEntity', dataTimeEntity)
        } catch (error) {
            logger.error(error.message)
            if (error.message === 'dataTime not exists') {
                try {
                    dataTimeEntity = new DataTime(dataTimeObject)
                    logger.info('dataTimeEntity', dataTimeEntity)
                    await this.dynamoDBAdapter.createOrUpdateItem(this.tableName, dataTimeEntity)
                    return dataTimeEntity
                } catch (validationError) {
                    throw new Error(validationError.message)
                }
            }
        }
        if (dataTimeEntity) {
            throw new Error('the dataTime already exists')
        }
        return dataTimeEntity
    }

    async updateEntity(dataTimeObject) {
        const dataTimeEntity = new DataTime(dataTimeObject)
        await this.dynamoDBAdapter.createOrUpdateItem(this.tableName, dataTimeEntity)
        return dataTimeEntity
    }

    async deleteEntity(dataTimeId) {
        return this.dynamoDBAdapter.deleteItem(this.tableName, {
            id: `${dataTimeId}`
        })
    }

    async getAllItems() {
        const response = await this.dynamoDBAdapter.queryAllItems(this.tableName)
        return response.Items.map((item) => new DataTime(unmarshall(item)))
    }

    // Actualizar actividad existente
    async updateActivity({ id, nameActivity }) {
        try {
            logger.info('updateActivity iniciado', { id, nameActivity })
            
            // Validaciones adicionales
            if (!id || typeof id !== 'string') {
                throw new Error('id debe ser una cadena no vacía')
            }
            if (!nameActivity || typeof nameActivity !== 'string' || nameActivity.trim() === '') {
                throw new Error('nameActivity debe ser una cadena no vacía')
            }
            
            // Obtener la actividad existente
            const response = await this.dynamoDBAdapter.getItemById(this.tableName, { id })
            if (!response.Item) {
                throw new Error('Actividad no encontrada')
            }
            
            const existingActivity = unmarshall(response.Item)
            logger.info('Actividad existente encontrada', { existingActivity })
            
            // Actualizar solo el nombre
            const updatedActivity = {
                ...existingActivity,
                nameActivity: nameActivity.trim()
            }
            
            logger.info('Actividad actualizada', { updatedActivity })
            
            // Guardar en DynamoDB
            await this.dynamoDBAdapter.createOrUpdateItem(this.tableName, updatedActivity)
            
            logger.info('Actividad guardada en DynamoDB exitosamente', { id })
            return updatedActivity
            
        } catch (error) {
            logger.error('Error en updateActivity', { 
                error: error.message, 
                stack: error.stack,
                params: { id, nameActivity }
            })
            throw error
        }
    }

    // Crear nueva actividad para un usuario y video
    async createActivity({ idUser, videoId, nameActivity }) {
        try {
            logger.info('createActivity iniciado', { idUser, videoId, nameActivity })
            
            // Validaciones adicionales
            if (!idUser || typeof idUser !== 'string') {
                throw new Error('idUser debe ser una cadena no vacía')
            }
            if (!videoId || typeof videoId !== 'string') {
                throw new Error('videoId debe ser una cadena no vacía')
            }
            if (!nameActivity || typeof nameActivity !== 'string' || nameActivity.trim() === '') {
                throw new Error('nameActivity debe ser una cadena no vacía')
            }
            
            // Generar UUID
            const id = uuidv4()
            logger.info('UUID generado', { id })
            
            const activity = {
                id,
                idUser: idUser.trim(),
                videoId: videoId.trim(),
                nameActivity: nameActivity.trim(),
                laps: [],
                createdAt: new Date().toISOString()
            }
            
            logger.info('Objeto actividad creado', { activity })
            
            // Intentar crear en DynamoDB
            await this.dynamoDBAdapter.createOrUpdateItem(this.tableName, activity)
            
            logger.info('Actividad guardada en DynamoDB exitosamente', { id })
            return activity
            
        } catch (error) {
            logger.error('Error en createActivity', { 
                error: error.message, 
                stack: error.stack,
                params: { idUser, videoId, nameActivity }
            })
            throw error
        }
    }

    // Obtener todas las actividades de un usuario para un video
    async getActivitiesByUserAndVideo(idUser, videoId) {
        const logger = require('../../../utils/logger');
        logger.info('getActivitiesByUserAndVideo params', { idUser, videoId });
        const params = {
            TableName: this.tableName,
            FilterExpression: '#idUser = :idUser',
            ExpressionAttributeNames: {
                '#idUser': 'idUser'
            },
            ExpressionAttributeValues: {
                ':idUser': { S: idUser }
            }
        }
        logger.info('DynamoDB scan params', params);
        try {
            const response = await this.dynamoDBAdapter.scanItems(params)
            logger.info('DynamoDB scan response', { items: response.Items?.length });
            // Unmarshall actividades y laps
            return response.Items.map(item => {
                const unmarshalled = unmarshall(item);
                if (Array.isArray(unmarshalled.laps)) {
                    unmarshalled.laps = unmarshalled.laps.map(lap => {
                        if (lap && typeof lap === 'object' && (lap.M || lap.S)) {
                            return unmarshall(lap);
                        }
                        return lap;
                    });
                }
                return unmarshalled;
            });
        } catch (error) {
            logger.error('Error en scanItems DynamoDB', { error });
            throw error;
        }
    }

    // Agregar un lap a una actividad
    async addLapToActivity({ activityId, StartTime, EndTime, DiffTime }) {
        // Obtener la actividad
        const response = await this.dynamoDBAdapter.getItemById(this.tableName, { id: activityId })
        if (!response.Item) {
            throw new Error('Actividad no encontrada')
        }
        const activity = unmarshall(response.Item)
        activity.laps = activity.laps || []
        activity.laps.push({ StartTime, EndTime, DiffTime })
        await this.dynamoDBAdapter.createOrUpdateItem(this.tableName, activity)
        logger.info('Lap agregado', { activityId, StartTime, EndTime, DiffTime })
        return activity
    }

    // Borrar un lap de una actividad por índice
    async deleteLapFromActivity({ activityId, lapIndex }) {
        const response = await this.dynamoDBAdapter.getItemById(this.tableName, { id: activityId })
        if (!response.Item) {
            throw new Error('Actividad no encontrada')
        }
        const activity = unmarshall(response.Item)
        if (!activity.laps || activity.laps.length <= lapIndex) {
            throw new Error('Lap no encontrado')
        }
        activity.laps.splice(lapIndex, 1)
        await this.dynamoDBAdapter.createOrUpdateItem(this.tableName, activity)
        logger.info('Lap borrado', { activityId, lapIndex })
        return activity
    }
}
