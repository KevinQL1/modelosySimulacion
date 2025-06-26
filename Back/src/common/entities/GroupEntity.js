module.exports = class GroupEntity {
    constructor({
        id,
        name,
        idCourse,
        createdAt = new Date().toISOString(),
    }) {
        this.id = id
        this.name = name
        this.idCourse = idCourse
        this.createdAt = createdAt || createdAt.toISOString()
        this.validate()
    }

    validate() {
        if (this.id === '' || this.id === undefined) {
            throw new Error('id is required')
        }

        if (this.name === '' || this.name === undefined) {
            throw new Error('name is required')
        }

        if (this.idCourse === '' || this.idCourse === undefined) {
            throw new Error('idCourse is required')
        }
    }
}
