module.exports = class CourseEntity {
    constructor({
        id,
        name,
        createdAt = new Date().toISOString(),
    }) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt || createdAt.toISOString();
        this.validate();
    }

    validate() {
        if (this.id === '' || this.id === undefined) {
            throw new Error('id is required');
        }
        if (this.name === '' || this.name === undefined) {
            throw new Error('name is required');
        }
    }
}
