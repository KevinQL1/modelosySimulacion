module.exports = class UserEntity {
    constructor({
        id,
        name,
        scope,
        groupId = null,
        createdAt = new Date().toISOString(),
    }) {
        this.id = id
        this.name = name
        this.scope = scope
        this.groupId = groupId
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

        if (this.scope === '' || this.scope === undefined) {
            throw new Error('scope is required')
        }
    }
}
