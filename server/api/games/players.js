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
   * @return {Promise} Resolves by sending a server response with playerId once
   *                   it has been determined that the player has been successfully
   *                   added to the correct game. Responds withan error if the game
   *                   ID was invalid or it was not possible to add the player.
   */
  async create() {

    // Reject attempts to create a resource with a specific ID and requests
    // which do not include an appropriate payload in the body.
    if(this.req.params.propertyId || !this.req.body.data.name) {
      errors.badRequest(this.res);
      return;
    }

    //Check the game ID exists
    let gameId = this.req.params.entityId;
    let exists = await this.gameExists(gameId);
    if(!exists) {
      return errors.notFound(this.res, "Can't add player because game does not exist.");
    }

    //Check the game hasn't started already
    let started = await this.gameHasStarted(gameId);
    if(started) {
      return errors.conflict(this.res, "Can't add player because the game has already started.");
    }

    // Callbacks to successfully resolve or fail the create request
    const successCallback = () => {

      // Call the websockets server to tell all other clients to pull the updated data
      utils.sendMessageToWebsocketsServer({
        clientType: 'API_SERVER',
        messageType: 'UPDATE_GAME_DATA',
        data: {
          gameId: gameId,
          fields: ['players'],
          excludePlayers: [this.req.body.socketId] /* We don't need to update
                                                      the player who made the
                                                      create() call so pass
                                                      their websocket ID to the
                                                      WSS so it can be excluded
                                                      from the notice to other
                                                      players to pull server
                                                      data */
        }
      });

      // Server response
      return this.res.status(201).send({ _id: playerData._id });
    }

    const errorCallback = () => {
      return errors.serverError(this.res, "Could not create player in the database.");
    }

    // Get the current players array for the current game
    let players = (await this.db.findOne(
      { _id: gameId }, 'games',
      { _id: 0, players: 1 }
    )).players;

    // Create a playerId and ensure it is unique within the specific game
    let playerId, uniqueId;
    let i = 0;

    do {

      // Generate a player ID
      playerId = utils.randomIntBetween(100,999);

      // Check if the code is unique;
      uniqueId = await this.playerIdIsUnique(playerId, players);

      // Defend against infinite loops in the unlikely event that there are no
      // playerIds available.
      if(i > 100) {
        errorCallback();
        return;
      }

      i++;

    } while(!uniqueId);

    // Also check the player name is unqiue and append a number if not
    let playerName, uniqueName;
    let j = 0;

    do {

      //Set appendix string for non unique player names
      let append = (j === 0) ? "" : " (" + j + ")";

      // Var for player name
      playerName = this.req.body.data.name + append;

      uniqueName = await this.playerNameIsUnique(playerName, players);

      j++;

    } while(!uniqueName)

    // Add player to the gameData in the database
    let playerData = new PlayerData(playerId, playerName);

    return this.db.pushOne(
      'games', { _id: gameId },
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


  /**
   * Gets all current players in the database for a given game as an array of
   * objects.
   * @return {Promise} Resolves by sending a server response with an array of
   *                   PlayerData objects (which may be empty) on success, or
   *                   sending an error response on failure.
   */
  async read() {
    let gameId = this.req.params.entityId;

    // Check the game ID exists
    let exists = await this.gameExists(gameId);
    if(!exists) {
      return errors.notFound(
        this.res,
        "Can't retrieve players because game does not exist."
      );
    }

    // Retrieve players array from gameData
    return this.db.findOne(
      { _id: gameId }, 'games',
      { _id: 0, players: 1 }
    ).then(result => {
      if(!result.players) return errors.notFound(this.res);
      return this.res.send(result.players);
    }).catch(err => {
      return errors.serverError(
        this.res,
        "Error retrieving players from database."
      );
    });
  }


  /**
   * Deletes a player from the game using the specified game and player IDs.
   * @return {Promise} Resolves by sending a server response indicating a successful
   *                   delete on success, or by sending an error response on failure.
   */
  async delete() {

    let gameId = this.req.params.entityId;
    let playerId = parseInt(this.req.params.propertyId);

    // Reject attempts to delete a player without a specific gameId and playerId.
    if(!gameId || !playerId) {
      errors.badRequest(this.res);
      return;
    }

    // Check the game ID exists
    let gameExists = await this.gameExists(gameId);
    if(!gameExists) {
      return errors.notFound(
        this.res,
        "Can't delete player because game does not exist."
      );
    }

    //Check the game hasn't started already
    let started = await this.gameHasStarted(gameId);
    if(started) {
      return errors.conflict(
        this.res,
        "Can't remove player because the game has already started."
      );
    }

    // Attempt to remove the specified player from the GameData
    return this.db.pullOne(
      'games', { _id: gameId },
      'players', { _id: playerId }
    ).then(result => {

      if(result) {

        // Call the websockets server to tell all other clients to pull the updated data
        utils.sendMessageToWebsocketsServer({
          clientType: 'API_SERVER',
          messageType: 'UPDATE_GAME_DATA',
          data: {
            gameId: gameId,
            fields: ['players'],
            excludePlayers: [playerId] /* The delete call doesn't have a body but
                                          we know the websocket will have the
                                          player's ID attached so we can filter
                                          by this instead for the delete(). */
          }
        });

        return this.res.send({ deleted: result });
      } else {
        return errors.notFound(
          this.res,
          `Could not delete player ${playerId} from ${gameId}. The player could not be found.`
        );
      }

    }).catch(err => {
      return errors.serverError(this.res, err.message);
    });

  }


  /**
   * Maps request methods to functions which resolve the API request
   */
  resolve() {
    switch(this.req.method) {

      case 'DELETE':
        this.delete();
        break;

      case 'GET':
        this.read();
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
   * @return {Promise}        Resolves to true if the game exists, false otherwise.
   */
  gameExists(gameId) {
    return this.db.findOne({ _id: gameId }, 'games').then(result => {
      if(result) return true;
      return false;
    });
  }


  /**
   * Checks if the game has started yet or not
   * @param  {String} gameId  Unique identifier in the database for the game data.
   * @return {Promise}        Resolves to true if the game has started, false otherwise.
   */
  gameHasStarted(gameId) {
    return this.db.findOne({ _id: gameId }, 'games').then(result => {
      return result.hasStarted;
    });
  }


  /**
   * Checks if the player ID is unique amongst all players
   * @param  {Int}    id      The player ID to check
   * @param  {Array}  players Array of all PlayerData objects
   * @return {Boolean}        Returns true if the player ID is unique, false otherwise
   */
  playerIdIsUnique(id, players) {
    return players.filter(player => player._id === id).length > 0 ? false : true;
  }


  /**
   * Checks if the player name is unique amongst all players
   * @param  {String}  name    The player name to check
   * @param  {Array}   players Array of all PlayerData objects
   * @return {Boolean}         Returns true if the player name is unique, false otherwise
   */
  playerNameIsUnique(name, players) {
    return players.filter(player => player.name === name).length > 0 ? false : true;
  }

}

module.exports = PlayersAPI;
