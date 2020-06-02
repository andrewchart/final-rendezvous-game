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
   * @return {Promise} Resolves by sending a server response indicating success
   *                   or failure.
   */
  async create() {

    // Reject attempt to create a resource with a specific ID
    if(this.req.params.entityId) {
      return errors.badRequest(this.res);
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
    return this.db.insertOne(gameData, 'games').then(result => {
      return this.res.status(201).send({ _id: gameId });
    }).catch(err => {
      return errors.serverError(this.res, "Could not create new game in database");
    });

  }

  /**
   * Read game data from the server. Supply a query string with the key `fields`
   * to read selected field/s only from the game data.
   * @return {undefined} Finishes by sending the json response to the client
   */
  read() {

    // Cannot read from an empty ID
    if(!this.req.params.entityId) {
      return errors.badRequest(this.res);
    }

    // Create an empty projection
    let projection = {};

    // If the request contains a fields query parameter with comma separated field
    // names, translate this into a projection object
    if(this.req.query.fields) {

      let fields = this.req.query.fields.split(",");
      let validFieldsCount = 0 // Keep track of how many fields in the query we're reading

      fields.forEach(field => {
        // Ignore unknown fields
        if (!this.isValidField(field)) return;

        validFieldsCount++;

        // Add the field to the projection object
        projection[field] = 1
      });

      // If none of the field names were valid, error now
      if(validFieldsCount === 0) {
        return errors.badRequest(this.res, "No fields of those names can be read.");
      }

    }

    // Retrieve the result
    return this.db.findOne({ _id: this.req.params.entityId }, 'games', projection).then(result => {
      if(!result) return errors.notFound(this.res);
      return this.res.send(result);
    });

  }

  /**
   * Updates the game data by resolving a patch request to the API
   * @return {undefined} Finishes by sending the json response to the client
   */
  update() {

    // Cannot update an empty ID or accept a patch request without a payload
    if(!this.req.params.entityId || !this.req.body) {
      return errors.badRequest(this.res);
    }

    let gameId = this.req.params.entityId;
    let body = this.req.body;

    // Remove invalid fields from the body. If the object is then empty, respond
    // with an error.
    for(let field in body.data) {
      if (!this.isValidField(field)) {
        delete body.data[field]
      }
    }

    if (Object.keys(body.data).length === 0) {
      return errors.badRequest(this.res);
    }

    // Make the update and respond with a simple status obhect
    return this.db.updateOne({ _id: gameId }, 'games', body.data).then(result => {

      // If no result, something has gone wrong
      if(!result) {
        return errors.serverError(this.res, "Could not update the game.")
      }

      // If no document was found, 404
      if(result.result.n === 0) {
        return errors.notFound(
          this.res,
          "Could not find game ID " + gameId + " to update it."
        );
      }

      // If no modifications have been made, 200, but tell the caller
      if(result.result.nModified === 0) {
        return this.res.send({ updated: false });
      }

      // Call the websockets server to tell all other clients to pull the updated data
      utils.sendMessageToWebsocketsServer({
        clientType: 'API_SERVER',
        messageType: 'UPDATE_GAME_DATA',
        data: {
          gameId: gameId,
          fields: Object.keys(body.data),
          excludePlayers: this.req.body.socketId
        }
      });

      // Otherwise, update was successful
      return this.res.send({ updated: true });
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

      case 'PATCH':
        this.update();
        break;

      case 'POST':
        this.create();
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


  /**
   * Uses the empty model and assesses whether the field name provided is in the
   * model.
   * @param  {String}  fieldName The name of the field to test
   * @return {Boolean}           Returns true if the field is in the model,
   *                             false otherwise
   */
  isValidField(fieldName) {
    let validFields = new GameData();
    return (fieldName in validFields)
  }

}

module.exports = GamesAPI;
