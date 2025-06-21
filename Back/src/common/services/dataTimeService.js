const { unmarshall } = require('@aws-sdk/util-dynamodb')
const DynamoDBAdapter = require('../adapters/dynamoDbAdapter')
const DataTime = require('../entities/DataTimeEntity')
module.exports = class DataTimeService {
    constructor(dynamoDBAdapter) {
        this.dynamoDBAdapter = dynamoDBAdapter || new DynamoDBAdapter()
        this.tableName = 'ch-data-time'
    }

    async getDataTime(dataTimeId) {
        const response = await this.dynamoDBAdapter.getItemById(this.tableName, { id: `${dataTimeId}` })
        if (!response.Item) {
            throw new Error('data not exists')
        }
        return new DataTime(unmarshall(response.Item))
    }

    async createEntity(dataTimeObject) {
        let dataTimeEntity
        try {
            dataTimeEntity = await this.getDataTime(dataTimeObject.id)
        } catch (error) {
            if (error.message === 'data not exists') {
                try {
                    dataTimeEntity = new DataTime(dataTimeObject)
                    await this.dynamoDBAdapter.createOrUpdateItem(this.tableName, dataTimeEntity)
                    return dataTimeEntity
                } catch (validationError) {
                    throw new Error(validationError.message)
                }
            }
        }
        if (dataTimeEntity) {
            throw new Error('the data already exists')
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
            id: { S: `${dataTimeId}` }
        })
    }

        async getAllItems() {
        const response = await this.dynamoDBAdapter.queryAllItems(this.tableName)
        return response.Items.map((item) => new DataTime(unmarshall(item)))
    }
}
