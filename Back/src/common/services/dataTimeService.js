const { unmarshall } = require('@aws-sdk/util-dynamodb')
const DynamoDBAdapter = require('../adapters/dynamoDbAdapter')
const DataTime = require('../entities/DataTimeEntity')
const logger = require('../../../utils/logger')

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
}
