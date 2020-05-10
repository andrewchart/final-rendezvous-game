/* Server Error Responses */

function notFound(res) {
  res.status(404).send({ errors: [{ code: 404, message: 'Not Found' }] });
}

function badRequest(res) {
  res.status(400).send({ errors: [{ code: 400, message: 'Invalid Request' }] })
}

function serverError(res) {
  res.status(500).send({ errors: [{ code: 500, message: 'ServerError' }] })
}


module.exports = {
  notFound,
  badRequest,
  serverError
}
