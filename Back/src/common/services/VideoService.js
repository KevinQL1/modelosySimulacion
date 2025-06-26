const { v4: uuidv4 } = require('uuid');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const VideoEntity = require('../entities/VideoEntity');
const DynamoDbAdapter = require('../../common/adapters/dynamoDbAdapter');

const TABLE_NAME = 'Videos';
const dynamoDb = new DynamoDbAdapter();

class VideoService {
  async createVideo({ idGroup, name, url }) {
    const video = new VideoEntity({
      id: uuidv4(),
      idGroup,
      name,
      url,
      createdAt: new Date().toISOString(),
    });
    await dynamoDb.createOrUpdateItem(TABLE_NAME, video);
    return video;
  }

  async getVideosByGroup(idGroup) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'idGroup-index',
      KeyConditionExpression: 'idGroup = :idGroup',
      ExpressionAttributeValues: {
        ':idGroup': { S: idGroup },
      },
    };
    const result = await dynamoDb.getItemBySecondIndex(params);
    return result.Items ? result.Items.map(item => unmarshall(item)) : [];
  }

  async updateVideo(id, { name, url }) {
    // Para actualizar, necesitamos obtener el video actual primero
    const currentVideo = await this.getVideoById(id);
    if (!currentVideo) {
      throw new Error('Video no encontrado');
    }
    
    // Crear un nuevo objeto con los datos actualizados
    const updatedVideo = {
      ...currentVideo,
      name,
      url,
      updatedAt: new Date().toISOString(),
    };
    
    await dynamoDb.createOrUpdateItem(TABLE_NAME, updatedVideo);
    return updatedVideo;
  }

  async getVideoById(id) {
    const result = await dynamoDb.getItemById(TABLE_NAME, { id });
    return result.Item ? unmarshall(result.Item) : null;
  }

  async deleteVideo(id) {
    await dynamoDb.deleteItem(TABLE_NAME, { id });
    return { id };
  }
}

module.exports = new VideoService(); 