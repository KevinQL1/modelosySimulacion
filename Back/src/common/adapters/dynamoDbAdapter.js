const {
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const logger = require('./utils/logger');

class DynamoDbAdapter {
    constructor() {
        const region = process.env.REGION || 'us-east-1';
        this.ddb = new DynamoDBClient({ region });
    }

    async createOrUpdateItem(tableName, item) {
        const params = {
            TableName: tableName,
            Item: marshall(item)
        };

        try {
            await this.ddb.send(new PutItemCommand(params));
            logger.info('Item creado correctamente', { tableName, item });
        } catch (error) {
            logger.error('Error al crear el item', { error });
            throw error;
        }
    }

    async getItemById(tableName, key) {
        const params = {
            TableName: tableName,
            Key: marshall(key)
        };

        try {
            const { Item } = await this.ddb.send(new GetItemCommand(params));
            if (!Item) {
                logger.warn('Item no encontrado', { key });
                return null;
            }
            logger.info('Item obtenido correctamente', { item: Item });
            return unmarshall(Item);
        } catch (error) {
            logger.error('Error al obtener el item', { error });
            throw error;
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
