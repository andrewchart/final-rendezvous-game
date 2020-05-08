/* Server Error Responses */

function notFound(res) {
  res.status(404).send('404 Not Found')
}

function badRequest(res) {
  res.status(400).send('Invalid Request')
}

module.exports = {
  notFound,
  badRequest
}
