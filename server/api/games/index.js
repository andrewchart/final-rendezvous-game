const errors = require('../../errors.js');

class GamesAPI {

  /**
   * Creates a class to handle requests to /api/games
   * @param {Object} req Express Server Request Object
   * @param {Object} res Express Server Response Object
   */
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  create() {
    return this.res.send('456');
  }

  read() {
    return this.res.send(this.req.params.id);
  }

  update() {

  }

  resolve() {

    switch(this.req.method) {

      case 'POST':
        if(!this.req.params.id) {
          this.createGame()
          break;
        }

      case 'PATCH':
        //TODO
        break;

      case 'GET':
        if(this.req.params.id) {
          this.loadGame(this.req.params.id);
          break;
        }

      default:
        errors.badRequest(this.res);
    }
  }

}

module.exports = GamesAPI;
