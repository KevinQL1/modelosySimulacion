const UserService = require('../common/services/UserService');
const httpResponse = require('../../utils/httpResponse');
const logger = require('../../utils/logger');
const Busboy = require('busboy');
const XLSX = require('xlsx');

const parseExcelFromEvent = (event) => {
    return new Promise((resolve, reject) => {
        const busboy = Busboy({
            headers: event.headers
        });

        const chunks = [];

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            file.on('data', (data) => chunks.push(data));
            file.on('end', () => logger.info(`Archivo recibido: ${filename}`));
        });

        busboy.on('finish', () => {
            try {
                const buffer = Buffer.concat(chunks);
                const workbook = XLSX.read(buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

                resolve(data);
            } catch (err) {
                reject(err);
            }
        });

        busboy.on('error', (err) => reject(err));

        // Simula stream desde el cuerpo base64
        const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
        busboy.end(bodyBuffer);
    });
};

const createUser = async (event) => {
    try {
        const usersData = await parseExcelFromEvent(event);
        const userService = new UserService();
        const results = [];

        for (const user of usersData) {
            const userObject = {
                id: user.cedula?.toString(),
                name: user.nombre
            };
            const res = await userService.createEntity(userObject);
            results.push(res);
        }

        logger.info('Usuarios creados', results);
        return httpResponse.ok({ mensaje: 'Usuarios creados correctamente', resultados: results });

    } catch (error) {
        logger.error('Error creando usuarios desde Excel', error);
        return httpResponse.badRequest(new Error('Error al procesar el Excel: ' + error.message))(event.requestContext.path);
    }
};

module.exports.handler = createUser;
