const { unmarshall } = require('@aws-sdk/util-dynamodb')
const DynamoDBAdapter = require('../adapters/dynamoDbAdapter')
const Course = require('../entities/CourseEntity')
const logger = require('../../../utils/logger')

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
        let courseEntity
        try {
            courseEntity = await this.getCourseById(courseObject.id)
            logger.info('courseEntity', courseEntity)
        } catch (error) {
            logger.error(error.message)
            if (error.message === 'course not exists') {
                try {
                    courseEntity = new Course(courseObject)
                    logger.info('courseEntity', courseEntity)
                    await this.dynamoDBAdapter.createOrUpdateItem(this.tableName, courseEntity)
                    return courseEntity
                } catch (validationError) {
                    throw new Error(validationError.message)
                }
            }
        }
        if (courseEntity) {
            throw new Error('the course already exists')
        }
        return courseEntity
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
