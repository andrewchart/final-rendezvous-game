const Database = require('../database.js');
const utils = require('../utils.js');

// Set up a database connection
const dbUrl = process.env.REACT_APP_MONGO_DB_URL;
const dbOpts = { useUnifiedTopology: true };
const dbName = process.env.REACT_APP_MONGO_DB_NAME;

var db = new Database();
(async () => {
  await db.connect(dbUrl, dbOpts, dbName);
})();

/**
 * This class models all the data for playing a live game as a Redux store. It
 * exists once a game has been started by a Host and the gameId has been
 * confirmed as valid.
 */
class GameData {

  constructor(gameId) {
    this._id = gameId;
    this.dateCreated = new Date();
    this.hasStarted = false;
    this.players = [];
    this.doubleAgents = [];
    this.xCityId = null;
    this.xCodeword = {};
    this.deck = null;
    this.currentPlayer = null;
    this.turnActionsRemaining = 3;
  }

  /**
   * Loads game data from the database onto the instance of the class.
   * @return {Promise} Resolves to modified instance of the class.
   */
  loadFromDatabase() {
    return db.findOne({ _id: this._id }, 'games').then(result => {

      if(!result) throw new Error('Could not load game from database');

      // Loop through the data and apply it to the class instance
      for(const property in result) {
        this[property] = result[property];
      }

      return this;
    });
  }

  /**
   * Once a player has started the game, and we know how many players are in the
   * game, the host can call the API to invoke this method which performs the
   * random generation of game data.
   * @return {Promise} Resolves to an object representation of the fields on the
   *                   instance that have been updated or false on error.
   */
  async initNewGame() {

    let promises = [

      // Generate the random city IDs for Agent X's location, plus the location
      // of all the double agents.
      this.getRandomCityIds(this.getNumDoubleAgents()),

      // Generate the random codeword
      this.getRandomCodeword()

    ];

    return Promise.all(promises).then(values => {

      let randomCities = values[0];
      let randomCodeword = values[1];

      // Assign the new values to the class instance and prepare an update object
      // for the database.
      this.xCityId = randomCities[0],
      this.doubleAgents = randomCities.splice(1),
      this.xCodeword = randomCodeword,
      this.hasStarted = true

      var update = {
        xCityId: this.xCityId,
        doubleAgents: this.doubleAgents,
        xCodeword: this.xCodeword,
        hasStarted: this.hasStarted
      }

      // Write to database
      return db.updateOne({ _id: this._id}, 'games', update) .then(result => {

        // If the data failed to update, return false
        if(!result) {
          return false;
        }

        return update;

      });

    }).catch(error => {
      console.log(error);
      return false;
    });

  }

  /**
   * Works out how many double agents there should be, including agent X, based
   * upon the number of players in the game.
   * @return {Int} Number of double agents to be instantiated.
   */
  getNumDoubleAgents() {
    return this.players.length + 4;
  }


  /**
   * The game requires random cities to be selected as locations for agent X and
   * the double agents. To make this a neat, singular process, we generate random
   * numbers for all of these cities, then return a randomly-ordered array. The
   * caller splices the array to divide the random locations between X and the DAs.
   * @param  {Int}    num The number of city IDs to return
   * @return {Promise}    Resolves to an array of random IDs which will match
   *                      city objects in the database.
   */
  getRandomCityIds(num) {
    return db.countCollection('cities').then(count => {

      // Use the rng util to generate an array of random numbers that fall within
      // the bounds of the collection.
      let randomCityIndexes = utils.randomIntsBetween(0, count-1, num);

      // Array to hold the promises that will resolve to result IDs
      let promises = [];

      // Use the database findOneByPosition method to get the documents at these
      // positions of the collection. Note: we're not relying on the ID of the
      // city to be the same as its position (index) in the collection.
      randomCityIndexes.forEach(index => {

        promises.push(

          db.findOneByPosition(index, 'cities', { _id: 1 }).then(city => {
            if(!city) throw new Error('Could not retrieve random cities from database');
            return city._id;
          })

        );

      });

      return Promise.all(promises).then(results => {
        return results;
      });

    });
  }


  /**
   * Selects a random codeword from the database
   * @return {Object} An object representation of the codeword from the database
   */
  getRandomCodeword() {

    return db.countCollection('codewords').then(count => {

      let rand = utils.randomIntBetween(0, count-1);

      return db.findOneByPosition(rand, 'codewords').then(codeword => {
        if(!codeword) throw new Error('Could not retrieve random codeword from database');
        return codeword;
      });

    });

  }


  initDeck() {
    return [1,2,3];
  }



}

module.exports = GameData;
