const errors = require('../../errors.js');
const utils = require('../../utils.js');

const PlayerData = require('../../models/PlayerData.js');

class PlayersAPI {

  /**
   * Creates a class to handle requests to /api/games/[gameId]/players.
   * @param {Object} req Express Server Request Object.
   * @param {Object} res Express Server Response Object.
   */
  constructor(req, res, db) {
    this.req = req;
    this.res = res;
    this.db  = db;
  }

  /**
   * Creates a new player for the game specified
   * @return {Promise} Resolves with playerId once it has been determined that
   *                   the player has been successfully added to the correct
   *                   game. Otherwise resolves to an error if the game ID was
   *                   invalid or it was not possible to add the player.
   */
  async create() {

    // Reject attempts to create a resource with a specific ID and requests
    // which do not include an appropriate payload in the body.
    if(this.req.params.propertyId || !this.req.body.name) {
      errors.badRequest(this.res);
      return;
    }

    //Check the game ID exists
    let exists = await this.gameExists(this.req.params.entityId);
    if(!exists) {
      errors.notFound(this.res, "Can't add player because game does not exist.");
      return;
    }

    // Ensure the playerId is unique within the specific game
    //
    // Also check the player name is unqiue and append a number if not
    //
    // let gameId, unique;
    // let i = 0;
    //
    // do {
    //
    //   // Generate a game code
    //   gameId = this.createRandomGameCode(4);
    //
    //   // Check if the code is unique;
    //   unique = await this.gameCodeIsUnique(gameId);
    //
    //   // Defend against infinite loops in the unlikely event that there are no
    //   // gameIds available.
    //   if(i > 100) {
    //     errors.serverError(this.res);
    //     return;
    //   }
    //
    //   i++;
    //
    // } while(!unique);


    // Add player to the gameData in the database
    let successCallback = () => {
      //TODO: Call the websockets server
      return this.res.status(201).send({ _id: playerData._id });
    }

    let errorCallback = () => {
      return errors.serverError(this.res, "Could not create player in the database.");
    }

    let playerData = new PlayerData(this.req.body.name);

    return this.db.pushOne(
      'games', { _id: this.req.params.entityId },
      'players', playerData
    ).then(result => {

      if(result) {
        return successCallback();
      } else {
        return errorCallback();
      }

    }).catch(err => {
      return errorCallback();
    });

  }


  read() {

    return;

    return this.db.findOne({ _id: gameId }, 'games').then(result => {
      if(!result) return errors.notFound(this.res);
      return this.res.send(result);
    });
  }

  update() {

  }

  delete() {

  }


  /**
   * Maps request methods to functions which resolve the API request
   */
  resolve() {
    switch(this.req.method) {

      case 'DELETE':
        //TODO
        break;

      case 'GET':
        this.read();
        break;

      case 'PATCH':
        //TODO
        break;

      case 'POST':
        this.create()
        break;

      default:
        errors.badRequest(this.res);
    }
  }


  // UTILITIES

  /**
   * Checks if the Game ID currently exists by querying the database for it.
   * @param  {String} gameId  Unique identifier in the database for the game data.
   * @return {Boolean}        Returns true if the game exists, false otherwise.
   */
  gameExists(gameId) {
    return this.db.findOne({ _id: gameId }, 'games').then(result => {
      if(result) return true;
      return false;
    });
  }


  //
  // /**
  //  * Creates a random string of capital letters between A and Z, without any
  //  * vowels. These codes are used as unique room identifiers (game IDs).
  //  * @param  {Int} len The length of the output string.
  //  * @return {String}  The random output string.
  //  */
  // createRandomGameCode(len) {
  //
  //   let str = '';
  //   let charRangeLow = 65;
  //   let charRangeHigh = 90;
  //
  //   while(str.length < len) {
  //     let char = utils.randomIntBetween(charRangeLow, charRangeHigh);
  //
  //     //Avoid vowels to avoid meaningful words (thanks Annika)
  //     if([65,69,73,79,85].indexOf(char) !== -1) continue;
  //
  //     str += String.fromCharCode(char)
  //   }
  //   return str;
  //
  // }
  //
  // /**
  //  * Checks a game code is unique by querying the database for that code.
  //  * @param  {String} code The code to be checked.
  //  * @return {Boolean}     Returns true if the code is unique, false on empty code
  //  *                       or a code which is not unique.
  //  */
  // gameCodeIsUnique(code) {
  //
  //   if(!code) return false;
  //
  //   return this.db.findOne({ _id: code }, 'games').then(result => {
  //     if(!result) return true;
  //     return false;
  //   }).then(unique => { return unique });
  //
  // }

}

module.exports = PlayersAPI;
