module.exports = class DataTimeEntity {
    constructor({
        id,
        idUser,
        name,
        scope,
        createdAt = new Date().toISOString(),
    }) {
        this.id = id
        this.name = name
        this.scope = scope
        this.createdAt = createdAt || createdAt.toISOString()
        this.validate()
    }

    validate() {
        if (this.id === '' || this.id === undefined) {
            throw new Error('id is required')
        }

        if (this.name === '' || this.name === undefined) {
            throw new Error('idUser is required')
        }

        if (this.scope === '' || this.scope === undefined) {
            throw new Error('scope is required')
        }

        if (this.scope === '' || this.scope === undefined) {
            throw new Error('scope is required')
        }

        if (this.scope === '' || this.scope === undefined) {
            throw new Error('scope is required')
        }

        if (this.scope === '' || this.scope === undefined) {
            throw new Error('scope is required')
        }
    }
}
