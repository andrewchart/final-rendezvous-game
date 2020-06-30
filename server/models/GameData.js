const Database = require('../database.js');

// Set up a database connection
const dbUrl = process.env.REACT_APP_MONGO_DB_URL;
const dbOpts = { useUnifiedTopology: true };
const dbName = process.env.REACT_APP_MONGO_DB_NAME;

var db = new Database(dbUrl, dbOpts, dbName);

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

  /**
   * Creates a new instance based upon the data model for a GameData object.
   * @return {GameData} New Instance of the GameData class.
   */
  newGameState() {

    return Promise.all([
      this.initXCity(),
      this.initXCodeword()
    ]).then(values => {

      return {
        _id: this.gameId,
        dateCreated: new Date(),
        hasStarted: false,
        players: [],
        doubleAgents: this.initDoubleAgents(8),
        xCityId: values[0],
        xCodeWord: values[1],
        deck: this.initDeck(),
        currentPlayer: null,
        turnActionsRemaining: 3
      }

    });

  }


  /**
   * Selects a random city ID from the database
   * @return {Int} An ID referring to the city ID in the database
   */
  initXCity() {
    return db.findOneRandom('cities', { _id: 1 }).then(city => {
      if(!city) throw new Error('Could not retrieve random city from database');
      return city._id;
    });
  }


  /**
   * Selects a random codeword from the database
   * @return {Object} An object representation of the codeword from the database
   */
  initXCodeword() {
    return db.findOneRandom('codewords').then(codeword => {
      if(!codeword) throw new Error('Could not retrieve random codeword from database');
      return codeword;
    });
  }

  initDeck() {
    return [1,2,3];
  }

  initDoubleAgents(num) {
    return [4,5,6];
  }


}

module.exports = GameData;
