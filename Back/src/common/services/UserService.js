const { unmarshall } = require('@aws-sdk/util-dynamodb')
const DynamoDBAdapter = require('../adapters/dynamoDbAdapter')
const User = require('../entities/UserEntity')
const logger = require('../../../utils/logger')
module.exports = class UserService {
    constructor(dynamoDBAdapter) {
        this.dynamoDBAdapter = dynamoDBAdapter || new DynamoDBAdapter()
        this.tableName = 'ch-users'
    }

    async getUserById(userId) {
        const response = await this.dynamoDBAdapter.getItemById(this.tableName, {
            id: `${userId}`
        })
        if (!response.Item) {
            logger.error('user not exists', { userId })
            throw new Error('user not exists')
        }
        return new User(unmarshall(response.Item))
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

    async createEntity(userObject) {
        logger.info('userObject', userObject)
        let userEntity
        try {
            userEntity = await this.getUserById(userObject.id)
            logger.info('userEntity', userEntity)
        } catch (error) {
            logger.error(error.message)
            if (error.message === 'user not exists') {
                try {
                    userEntity = new User(userObject)
                    logger.info('userEntity', userEntity)
                    await this.dynamoDBAdapter.createOrUpdateItem(this.tableName, userEntity)
                    return userEntity
                } catch (validationError) {
                    throw new Error(validationError.message)
                }
            }
        }
        if (userEntity) {
            throw new Error('the user already exists')
        }
        return userEntity
    }

    async updateEntity(userObject) {
        const userEntity = new User(userObject)
        await this.dynamoDBAdapter.createOrUpdateItem(this.tableName, userEntity)
        return userEntity
    }

    async deleteEntity(userId) {
        return this.dynamoDBAdapter.deleteItem(this.tableName, {
            id: `${userId}`
        })
    }

    async getAllItems() {
        const response = await this.dynamoDBAdapter.queryAllItems(this.tableName)
        return response.Items.map((item) => new User(unmarshall(item)))
    }
}
