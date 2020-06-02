/* SERVER ERROR RESPONSES */
// Used in server middleware to resolve requests to generic client and server errors
// The error message can be overridden to be more specific if required

function notFound(res, msg="Not Found") {
  res.status(404).send({ errors: [{ code: 404, message: msg }] });
}

function badRequest(res, msg="Invalid Request") {
  res.status(400).send({ errors: [{ code: 400, message: msg }] });
}

function conflict(res, msg="Conflict") {
  res.status(409).send({ errors: [{ code: 409, message: msg }] });
}

function serverError(res, msg="Server Error") {
  res.status(500).send({ errors: [{ code: 500, message: msg }] });
}


module.exports = {
  notFound,
  badRequest,
  conflict,
  serverError
}
