/**
 * The game Host handles initiation of a game including registering a new Game ID,
 * loading a previous game, adding & removing players from a game, starting the
 * game and stopping the game.
 *
 * The host communicates with the server to exchange the game data and uses the
 * DataExchange utility class static methods as helpers to facilitate this.
 *
 */
export default class Host {

  /**
   * Creates a new game Host.
   * @param {[String]} gameId [Unique identifier for this game]
   */
  constructor(gameId = '') {
    this._gameId = gameId.toUpperCase();
  }

  init() {
    console.log('gameisvalid');
  }

  gameIsValid() {

    // Empty gameId => Start a new game
    if(!this._gameId) {
      this._gameId = this.registerNewGame();
      return true;
    }

    // Otherwise, check validity of gameId
    if(this._gameId === "ABCD" || this._gameId === "WXYZ") return true;


    return false;
  }

  registerNewGame() {
    //TODO: create a new unique game ID
    this._gameId = "WXYZ";
    //TODO: change browser url to this without reloading
    return this._gameId;
  }

  loadGame(gameId) {

  }

  addPlayer(name) {

  }

  removePlayer() {

  }

  startGame() {

  }

  endGame() {

  }

  // Getters and Setters
  get gameId() {
    return this._gameId;
  }

  set gameId(gameId) {
    this._gameId = gameId;
  }

}
