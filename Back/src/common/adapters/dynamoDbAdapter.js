const {
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand,
    QueryCommand
} = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const logger = require('../../../utils/logger');

class DynamoDbAdapter {
    constructor() {
        const region = process.env.REGION || 'sa-east-1';
        this.ddb = new DynamoDBClient({ region });
    }

    async createOrUpdateItem(tableName, item) {
        const marshalledEntity = marshall(item, {
            convertClassInstanceToMap: true,
            removeUndefinedValues: true
        })

        try {
            const command = new PutItemCommand({
                Item: marshalledEntity,
                TableName: tableName,
                ReturnValues: 'ALL_OLD'
            })

            const response = await this.ddb.send(command)

            logger.info('Item creado correctamente', { tableName, item });
            return response
        } catch (error) {
            logger.error('Error al crear el item', { error });
            throw error;
        }
    }

    async getItemById(tableName, key) {
        try {
            const command = new GetItemCommand({
                Key: marshall(key),
                TableName: tableName
            })
            const response = await this.ddb.send(command)

            logger.info('Item obtenido correctamente', { item: response.Item });
            return response
        } catch (error) {
            logger.error('Error al obtener el item', { error });
            throw new Error(`Failed to query DynamoDB item: ${JSON.stringify(error)}`)
        }
    }

    async getItemBySecondIndex(params) {
    try {
        const command = new QueryCommand(params);

        const response = await this.ddb.send(command);
        logger.info('Item obtenido correctamente', { item: response.Items });
        return response
    } catch (error) {
        logger.error('Error al obtener item', { error });
        throw new Error(`Failed to get item: ${error}`);
    }
}

    async deleteItem(tableName, key) {
        const params = {
            TableName: tableName,
            Key: marshall(key)
        };

        try {
            await this.ddb.send(new DeleteItemCommand(params));
            logger.info('Item eliminado correctamente', { key });
        } catch (error) {
            logger.error('Error al eliminar el item', { error });
            throw error;
        }
    }

    async queryAllItems(tableName) {
        const command = new ScanCommand({ TableName: tableName })
        const response = await this.ddb.send(command)
        return response
    }
}

module.exports = DynamoDbAdapter;
