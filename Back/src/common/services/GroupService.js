const { unmarshall } = require('@aws-sdk/util-dynamodb')
const DynamoDBAdapter = require('../adapters/dynamoDbAdapter')
const Group = require('../entities/GroupEntity')

module.exports = class GroupService {
    constructor(dynamoDBAdapter) {
        this.dynamoDBAdapter = dynamoDBAdapter || new DynamoDBAdapter()
        this.tableName = 'ch-groups'
    }

    async getGroup(groupId) {
        const response = await this.dynamoDBAdapter.getItemById(this.tableName, { id: `${groupId}` })
        if (!response.Item) {
            throw new Error('group not exists')
        }
        return new Group(unmarshall(response.Item))
    }

    async createEntity(groupObject) {
        let groupEntity
        try {
            groupEntity = await this.getGroup(groupObject.id)
        } catch (error) {
            if (error.message === 'group not exists') {
                try {
                    groupEntity = new Group(groupObject)
                    await this.dynamoDBAdapter.createOrUpdateItem(this.tableName, groupEntity)
                    return groupEntity
                } catch (validationError) {
                    throw new Error(validationError.message)
                }
            }
        }
        if (groupEntity) {
            throw new Error('the group already exists')
        }
        return groupEntity
    }

    async updateEntity(groupObject) {
        const groupEntity = new Group(groupObject)
        await this.dynamoDBAdapter.createOrUpdateItem(this.tableName, groupEntity)
        return groupEntity
    }

    async deleteEntity(groupId) {
        return this.dynamoDBAdapter.deleteItem(this.tableName, {
            name: { S: `${groupId}` }
        })
    }

        async getAllItems() {
        const response = await this.dynamoDBAdapter.queryAllItems(this.tableName)
        return response.Items.map((item) => new Group(unmarshall(item)))
    }
}
