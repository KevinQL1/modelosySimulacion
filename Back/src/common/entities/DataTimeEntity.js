module.exports = class DataTimeEntity {
    constructor({
        id,
        idUser,
        videoId,
        nameActivity,
        laps = [],
        createdAt = new Date().toISOString(),
    }) {
        this.id = id
        this.idUser = idUser
        this.videoId = videoId
        this.nameActivity = nameActivity
        this.laps = laps
        this.createdAt = createdAt || new Date().toISOString()
        this.validate()
    }

    validate() {
        if (!this.id) {
            throw new Error('id is required')
        }
        if (!this.idUser) {
            throw new Error('idUser is required')
        }
        if (!this.videoId) {
            throw new Error('videoId is required')
        }
        if (!this.nameActivity) {
            throw new Error('nameActivity is required')
        }
        if (!Array.isArray(this.laps)) {
            throw new Error('laps must be an array')
        }
        // Validar formato de laps
        this.laps.forEach(lap => {
            if (!lap.StartTime || !lap.EndTime || !lap.DiffTime) {
                throw new Error('Each lap must have StartTime, EndTime, and DiffTime')
            }
        })
    }
}
