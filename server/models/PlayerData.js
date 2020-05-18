//const utils = require('../utils.js');

/**
 * This class models the data foran individual playing the game. Players are
 * members of an Array on the GameData model.
 */
class PlayerData {

  constructor(name) {
    this.name = name;
    return this.newPlayerState();
  }

  newPlayerState() {
    return {
      _id: 1,
      name: this.name
    }
  }

  // initXCity() {
  //   // let numCities = Count unique cities minus 1
  //   let numCities = 40; //TODO REMOVE
  //   return utils.randomIntBetween(0, numCities);
  // }


}

module.exports = PlayerData;
