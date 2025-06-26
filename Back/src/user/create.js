const UserService = require('../common/services/UserService');
const tokenVerification = require('../../utils/tokenVerification');
const httpResponse = require('../../utils/httpResponse');
const logger = require('../../utils/logger');
const XLSX = require('xlsx');
const Busboy = require('busboy');
const multipart = require('lambda-multipart-parser');

const parseExcelBuffer = (buffer) => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    logger.info('Datos obtenidos del Excel', data);
    return data;
};

const parseCsvBuffer = (buffer) => {
    const workbook = XLSX.read(buffer, { type: 'buffer', raw: true, codepage: 65001 });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    logger.info('Datos obtenidos del CSV', data);
    return data;
};

const parseSheetFromEvent = async (event) => {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    logger.info('event parseSheetFromEvent', event);

    if (contentType.includes('multipart/form-data')) {
        const result = await multipart.parse(event);
        if (!result.files || result.files.length === 0) {
            throw new Error('No se recibió ningún archivo en el campo "file".');
        }
        const file = result.files[0];
        if (file.contentType.includes('spreadsheetml')) {
            return parseExcelBuffer(file.content);
        } else if (file.contentType.includes('csv')) {
            return parseCsvBuffer(file.content);
        } else {
            throw new Error('Tipo de archivo no soportado: ' + file.contentType);
        }
    }

    if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        const buffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
        return parseExcelBuffer(buffer);
    }

    if (contentType.includes('text/csv')) {
        const buffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
        return parseCsvBuffer(buffer);
    }

    throw new Error(`Unsupported content type: ${contentType}`);
};

const createUser = async (event) => {
    try {
        const userService = new UserService();

        const userToken = tokenVerification(event);
        if (!userToken || userToken.scope !== 'administrador') {
            logger.error('Usuario no autorizado para crear usuarios');
            return httpResponse.unauthorized(new Error('No tienes permiso para crear usuarios'))(event.requestContext.path);
        }

        const usersData = await parseSheetFromEvent(event);
        logger.info('Usuarios obtenidos', usersData);

        const results = [];
        const errores = [];

        for (const user of Object.values(usersData)) {
            const userObject = {
                id: user.cedula?.toString(),
                name: user.nombre,
                scope: 'estudiante'
            };
            logger.info('Usuarios a crear', userObject);
            try {
                const res = await userService.createEntity(userObject);
                results.push(res);
            } catch (err) {
                errores.push({ usuario: userObject, error: err.message });
            }
        }

        logger.info('Usuarios creados correctamente', results);
        return httpResponse.ok({ mensaje: 'Importación finalizada', exitosos: results, errores });

    } catch (error) {
        logger.error('Error creando usuarios desde archivo', error);
        return httpResponse.badRequest(new Error('Error al procesar el archivo: ' + error.message))(event.requestContext?.path || '');
    }
};

module.exports.handler = createUser;
