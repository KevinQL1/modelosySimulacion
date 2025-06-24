const allowOrigins = '*';

const httpResponse = (statusCode, body) => ({
  statusCode,
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigins,
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
})

const ok = (body) => ({
  statusCode: 200,
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigins,
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
})

const badRequest =
  (error) =>
    (path = '/') => ({
      statusCode: 400,
      body: JSON.stringify({
        type: 'urn:problem:bad-request',
        title: 'Bad Request',
        detail: error.message,
        status: 400,
        instance: path
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowOrigins,
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })

const notFound =
  (error) =>
    (path = '/') => ({
      statusCode: 404,
      body: JSON.stringify({
        type: 'urn:problem:not-found',
        title: 'Not Found',
        detail: error.message,
        status: 404,
        instance: path
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowOrigins,
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })

const unauthorized =
  (error) =>
    (path = '/') => ({
      statusCode: 401,
      body: JSON.stringify({
        type: 'urn:problem:unauthorized',
        title: 'Unauthorized',
        detail: error.message,
        status: 401,
        instance: path
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowOrigins,
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })

module.exports = {
  httpResponse,
  ok,
  badRequest,
  notFound,
  unauthorized,
}
