const apiErrors = require('../errors.js');

class CitiesAPI {

  /**
   * Creates a class to handle requests to /api/games.
   * @param {Object} req Express Server Request Object.
   * @param {Object} res Express Server Response Object.
   */
  constructor(req, res, db) {
    this.req = req;
    this.res = res;
    this.db  = db;
  }


  /**
   * Read game cities data from the server
   * @return {undefined} Finishes by sending the json response to the client
   */
  read() {

    // Retrieve the result
    return this.db.findAll({}, 'cities', null).then(result => {
      if(!result) return apiErrors.notFound(this.res);
      return this.res.send(result);
    });

  }


  /**
   * Maps request methods to functions which resolve the API request
   */
  resolve() {
    switch(this.req.method) {
      case 'GET':
        this.read();
        break;
    }
  }

}

module.exports = CitiesAPI;
