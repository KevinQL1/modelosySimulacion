const UserService = require('../common/services/UserService');
const tokenVerification = require('../../utils/tokenVerification');
const httpResponse = require('../../utils/httpResponse');
const logger = require('../../utils/logger');
const XLSX = require('xlsx');

const parseExcelBuffer = (event) => {
    const buffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    logger.info('Datos obtenidos del Excel', data);
    return data;
};

const parseCsvBuffer = (event) => {
    const buffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
    const workbook = XLSX.read(buffer, { type: 'buffer', raw: true, codepage: 65001 });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    logger.info('Datos obtenidos del CSV', data);
    return data;
};

const parseSheetFromEvent = (event) => {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    logger.info('event parseSheetFromEvent', event);

    if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        return parseExcelBuffer(event);
    }

    if (contentType.includes('text/csv')) {
        return parseCsvBuffer(event);
    }

    throw new Error(`Unsupported content type: ${contentType}`);
};

const createUser = async (event) => {
    try {
        const userService = new UserService();

        const user = tokenVerification(event);
        if (!user || user.scope !== 'administrador') {
            logger.error('Usuario no autorizado para crear usuarios');
            return httpResponse.unauthorized(new Error('No tienes permiso para crear usuarios'))(event.requestContext.path);
        }

        const usersData = parseSheetFromEvent(event);
        logger.info('Usuarios obtenidos', usersData);

        const results = [];

        for (const user of Object.values(usersData)) {
            const userObject = {
                id: user.cedula?.toString(),
                name: user.nombre,
                scope: user.rol
            };
            logger.info('Usuarios a crear', userObject);

            const res = await userService.createEntity(userObject);
            results.push(res);
        }

        logger.info('Usuarios creados correctamente', results);
        return httpResponse.ok({ mensaje: 'Usuarios creados correctamente', resultados: results });

    } catch (error) {
        logger.error('Error creando usuarios desde archivo', error);
        return httpResponse.badRequest(new Error('Error al procesar el archivo: ' + error.message))(event.requestContext?.path || '');
    }
};

module.exports.handler = createUser
