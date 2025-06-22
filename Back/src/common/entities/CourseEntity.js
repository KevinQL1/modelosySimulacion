module.exports = class CourseEntity {
    constructor({
        id,
        name,
        nameGroup,
        teacher,
        schedule,
        createdAt = new Date().toISOString(),
    }) {
        this.id = id
        this.name = name
        this.nameGroup = nameGroup
        this.teacher = teacher
        this.schedule = schedule
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

        if (this.nameGroup === '' || this.nameGroup === undefined) {
            throw new Error('nameGroup is required')
        }

        if (this.teacher === '' || this.teacher === undefined) {
            throw new Error('teacher is required')
        }

        if (this.schedule === '' || this.schedule === undefined) {
            throw new Error('schedule is required')
        }
    }
}
