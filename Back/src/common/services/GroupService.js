const { unmarshall } = require('@aws-sdk/util-dynamodb')
const DynamoDBAdapter = require('../adapters/dynamoDbAdapter')
const Group = require('../entities/GroupEntity')
const logger = require('../../../utils/logger')
module.exports = class GroupService {
    constructor(dynamoDBAdapter) {
        this.dynamoDBAdapter = dynamoDBAdapter || new DynamoDBAdapter()
        this.tableName = 'ch-groups'
    }

    async getGroupById(groupId) {
        const response = await this.dynamoDBAdapter.getItemById(this.tableName, {
            id: `${groupId}`
        })
        if (!response.Item) {
            logger.error('group not exists', { groupId })
            throw new Error('group not exists')
        }
        return new Group(unmarshall(response.Item))
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

    async createEntity(groupObject) {
        logger.info('groupObject', groupObject)
        let groupEntity
        try {
            groupEntity = await this.getGroupById(groupObject.id)
            logger.info('groupEntity', groupEntity)
        } catch (error) {
            logger.error(error.message)
            if (error.message === 'group not exists') {
                try {
                    groupEntity = new Group(groupObject)
                    logger.info('groupEntity', groupEntity)
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

    async deleteEntity(groupName) {
        const groupComplete = await this.getItemByName(groupName)
        logger.info('groupComplete', groupComplete)

        return this.dynamoDBAdapter.deleteItem(this.tableName, {
            id: `${groupComplete.id}`
        })
    }

    async getAllItems() {
        const response = await this.dynamoDBAdapter.queryAllItems(this.tableName)
        return response.Items.map((item) => new Group(unmarshall(item)))
    }
}
