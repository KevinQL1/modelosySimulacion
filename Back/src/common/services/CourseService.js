const { unmarshall } = require('@aws-sdk/util-dynamodb')
const DynamoDBAdapter = require('../adapters/dynamoDbAdapter')
const Course = require('../entities/CourseEntity')
const logger = require('../../../utils/logger')
const { v4: uuidv4 } = require('uuid');

module.exports = class CourseService {
    constructor(dynamoDBAdapter) {
        this.dynamoDBAdapter = dynamoDBAdapter || new DynamoDBAdapter()
        this.tableName = 'ch-courses'
    }

    async getCourseById(courseId) {
        const response = await this.dynamoDBAdapter.getItemById(this.tableName, {
            id: `${courseId}`
        })
        if (!response.Item) {
            logger.error('course not exists', { courseId })
            throw new Error('course not exists')
        }
        return new Course(unmarshall(response.Item))
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

    async createEntity(courseObject) {
        logger.info('courseObject', courseObject)
        // Solo requerimos el nombre, generamos el id automáticamente
        const name = courseObject.name;
        if (!name) throw new Error('name is required');
        // Verificar si ya existe una asignatura con ese nombre
        const existing = await this.getItemByName(name);
        if (existing) {
            throw new Error('the course already exists');
        }
        const id = uuidv4();
        const courseEntity = new Course({ id, name });
        logger.info('courseEntity', courseEntity)
        await this.dynamoDBAdapter.createOrUpdateItem(this.tableName, courseEntity)
        return courseEntity;
    }

    async updateEntity(courseObject) {
        const courseEntity = new Course(courseObject)
        await this.dynamoDBAdapter.createOrUpdateItem(this.tableName, courseEntity)
        return courseEntity
    }

    async deleteEntity(courseName) {
        const courseComplete = await this.getItemByName(courseName)
        logger.info('courseComplete', courseComplete)

        return this.dynamoDBAdapter.deleteItem(this.tableName, {
            id: `${courseComplete.id}`
        })
    }

    async getAllItems() {
        const response = await this.dynamoDBAdapter.queryAllItems(this.tableName)
        return response.Items.map((item) => new Course(unmarshall(item)))
    }
}
