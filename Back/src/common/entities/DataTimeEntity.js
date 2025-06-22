module.exports = class DataTimeEntity {
    constructor({
        id,
        idUser,
        nameActivity,
        /*AGREGA LAS PROPIEDADES DE LA TABLA QUE HAGAN FALTA*/
        createdAt = new Date().toISOString(),
    }) {
        this.id = id
        this.idUser = idUser
        this.nameActivity = nameActivity
        /*AGREGA LAS PROPIEDADES DE LA TABLA QUE HAGAN FALTA*/
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

        /*AGREGA LAS VALIDACIONES DE LAS PROPIEDADES QUE HAGAN FALTA*/
    }
}
