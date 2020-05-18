const errors = require('../../errors.js');
const utils = require('../../utils.js');

const GameData = require('../../models/GameData.js');

class GamesAPI {

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
   * Creates a new game in the database with a unique ID.
   * @return {Promise} Resolves with gameId once the ID has been determined to
   *                   be unique within the database.
   */
  async create() {

    // Reject attempt to create a resource with a specific ID
    if(this.req.params.entityId) {
      errors.badRequest(this.res);
      return;
    }

    // Ensure the gameId is random and unique
    let gameId, unique;
    let i = 0;

    do {

      // Generate a game code
      gameId = this.createRandomGameCode(4);

      // Check if the code is unique;
      unique = await this.gameCodeIsUnique(gameId);

      // Defend against infinite loops in the unlikely event that there are no
      // gameIds available.
      if(i > 100) {
        errors.serverError(this.res, "No game IDs available. Contact the website owner.");
        return;
      }

      i++;

    } while(!unique);

    // Save to database
    let gameData = new GameData(gameId);
    this.db.insertOne(gameData, 'games').then(result => {
      return this.res.status(201).send({ _id: gameId });
    }).catch(err => {
      return errors.serverError(this.res, "Could not create new game in database");
    });

  }


  read() {

    // Cannot read from an empty ID
    if(!this.req.params.entityId) errors.badRequest(this.res);

    return this.db.findOne({ _id: this.req.params.entityId }, 'games').then(result => {
      if(!result) return errors.notFound(this.res);
      return this.res.send(result);
    });

  }

  update() {

  }

  /**
   * Maps request methods to functions which resolve the API request
   */
  resolve() {
    switch(this.req.method) {
      case 'GET':
        this.read();
        break;

      case 'PATCH':
        //TODO
        break;

      case 'POST':
        this.create()
        break;
    }
  }


  // UTILITIES

  /**
   * Creates a random string of capital letters between A and Z, without any
   * vowels. These codes are used as unique room identifiers (game IDs).
   * @param  {Int} len The length of the output string.
   * @return {String}  The random output string.
   */
  createRandomGameCode(len) {

    let str = '';
    let charRangeLow = 65;
    let charRangeHigh = 90;

    while(str.length < len) {
      let char = utils.randomIntBetween(charRangeLow, charRangeHigh);

      //Avoid vowels to avoid meaningful words (thanks Annika)
      if([65,69,73,79,85].indexOf(char) !== -1) continue;

      str += String.fromCharCode(char)
    }
    return str;

  }

  /**
   * Checks a game code is unique by querying the database for that code.
   * @param  {String} code The code to be checked.
   * @return {Boolean}     Returns true if the code is unique, false on empty code
   *                       or a code which is not unique.
   */
  gameCodeIsUnique(code) {

    if(!code) return false;

    return this.db.findOne({ _id: code }, 'games').then(result => {
      if(!result) return true;
      return false;
    }).then(unique => { return unique });

  }

}

module.exports = GamesAPI;
