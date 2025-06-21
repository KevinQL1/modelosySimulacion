const { unmarshall } = require('@aws-sdk/util-dynamodb')
const DynamoDBAdapter = require('../adapters/dynamoDbAdapter')
const User = require('../entities/UserEntity')
module.exports = class UserService {
    constructor(dynamoDBAdapter) {
        this.dynamoDBAdapter = dynamoDBAdapter || new DynamoDBAdapter()
        this.tableName = 'ch-users'
    }

    async getUserById(userId) {
        const response = await this.dynamoDBAdapter.getItemById(this.tableName, { id: `${userId}` })
        if (!response.Item) {
            throw new Error('user not exists')
        }
        return new User(unmarshall(response.Item))
    }

    async createEntity(userObject) {
        let userEntity
        try {
            userEntity = await this.getUserById(userObject.id)
        } catch (error) {
            if (error.message === 'user not exists') {
                try {
                    userEntity = new User(userObject)
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
            id: { S: `${userId}` }
        })
    }

    async getAllItems() {
        const response = await this.dynamoDBAdapter.queryAllItems(this.tableName)
        return response.Items.map((item) => new User(unmarshall(item)))
    }
}
