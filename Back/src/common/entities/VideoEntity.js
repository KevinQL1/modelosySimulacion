class VideoEntity {
  constructor({ id, idGroup, name, url, createdAt = new Date().toISOString() }) {
    this.id = id;
    this.idGroup = idGroup;
    this.name = name;
    this.url = url;
    this.createdAt = createdAt;
    this.validate();
  }

  validate() {
    if (!this.id || this.id === '') {
      throw new Error('id is required');
    }
    if (!this.idGroup || this.idGroup === '') {
      throw new Error('idGroup is required');
    }
    if (!this.name || this.name === '') {
      throw new Error('name is required');
    }
    if (!this.url || this.url === '') {
      throw new Error('url is required');
    }
  }
}

module.exports = VideoEntity; 