const utils = require('../utils.js');

/**
 * This class models all the data for playing a live game as a Redux store. It
 * exists once a game has been started by a Host and the gameId has been
 * confirmed as valid.
 */
class GameData {

  constructor(gameId) {
    this.gameId = gameId;
    return this.newGameState();
  }

  newGameState() {
    return {
      _id: this.gameId,
      dateCreated: new Date(),
      players: [],
      doubleAgents: this.initDoubleAgents(8),
      xCityId: this.initXCity(),
      xCodeWord: this.initXCodeword(),
      deck: this.initDeck(),
      currentPlayer: null,
      turnActionsRemaining: 3
    }
  }

  initXCity() {
    // let numCities = Count unique cities minus 1
    let numCities = 40; //TODO REMOVE
    return utils.randomIntBetween(0, numCities);
  }

  initXCodeword() {
    //TODO count db entries, select rand entry, return it
    let codewords = ['APPLE', 'BANANA', 'MANGO', 'PASSIONFRUIT', 'STRAWBERRY']
    let rand = utils.randomIntBetween(0, codewords.length-1);
    return codewords[rand];
  }

  initDeck() {
    return [1,2,3];
  }

  initDoubleAgents(num) {
    return [4,5,6];
  }


}

module.exports = GameData;
