const { unmarshall } = require('@aws-sdk/util-dynamodb')
const DynamoDBAdapter = require('../adapters/dynamoDbAdapter')
const Course = require('../entities/CourseEntity')

module.exports = class CourseService {
    constructor(dynamoDBAdapter) {
        this.dynamoDBAdapter = dynamoDBAdapter || new DynamoDBAdapter()
        this.tableName = 'ch-courses'
    }

    async getCourse(courseId) {
        const response = await this.dynamoDBAdapter.getItemById(this.tableName, { id: `${courseId}` })
        if (!response.Item) {
            throw new Error('course not exists')
        }
        return new Course(unmarshall(response.Item))
    }

    async createEntity(courseObject) {
        let courseEntity
        try {
            courseEntity = await this.getCourse(courseObject.id)
        } catch (error) {
            if (error.message === 'course not exists') {
                try {
                    courseEntity = new Course(courseObject)
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

    async deleteEntity(courseId) {
        return this.dynamoDBAdapter.deleteItem(this.tableName, {
            name: { S: `${courseId}` }
        })
    }

    async getAllItems() {
        const response = await this.dynamoDBAdapter.queryAllItems(this.tableName)
        return response.Items.map((item) => new Course(unmarshall(item)))
    }
}
