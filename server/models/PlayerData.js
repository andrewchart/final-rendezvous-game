//const utils = require('../utils.js');

/**
 * This class models the data foran individual playing the game. Players are
 * members of an Array on the GameData model.
 */
class PlayerData {

  constructor(playerId, playerName) {
    this._id = playerId;
    this.name = playerName;
    return this.newPlayerState();
  }

  newPlayerState() {
    return {
      _id: this._id,
      name: this.name
    }
  }

}

module.exports = PlayerData;
