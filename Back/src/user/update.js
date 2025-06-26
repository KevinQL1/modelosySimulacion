const UserService = require('../common/services/UserService');
const httpResponse = require('../../utils/httpResponse');
const tokenVerification = require('../../utils/tokenVerification');

const updateUserGroup = async (event) => {
    try {
        const user = tokenVerification(event);
        if (!user || user.scope !== 'administrador') {
            return httpResponse.unauthorized(new Error('No tienes permiso para actualizar usuarios'))(event.requestContext.path);
        }
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const { userId, groupId } = body;
        if (!userId) {
            return httpResponse.badRequest(new Error('userId es requerido'))(event.requestContext.path);
        }
        const userService = new UserService();
        const updatedUser = await userService.updateGroupId(userId, groupId || null);
        return httpResponse.ok(updatedUser);
    } catch (error) {
        return httpResponse.badRequest(new Error('Error al actualizar usuario: ' + error.message))(event.requestContext.path);
    }
};

module.exports.handler = updateUserGroup; 