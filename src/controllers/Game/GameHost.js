// Allow the Game Host to manipulate history API
import { createBrowserHistory } from 'history';
const history = createBrowserHistory();

/**
 * The Game Host manages the Game instance at a high level including creating a
 * new gameId, adding and removing players from a game, starting, ending and
 * deleting the game, and retrieving in-progress game data.
 *
 * The host communicates with the server to exchange the game data using the
 * DataExchange utility class static methods as helpers to facilitate this.
 *
 */
export default class GameHost {

  /**
   * Creates a new game Host.
   * @param {[String]} gameId [Unique identifier for this game]
   * @param {[Object]} view   [The React view which is displaying the game]
   */
  constructor(gameId = '', view) {
    this._gameId = gameId.toUpperCase();
    this._view = view;

    // Bind `this`
    this.addPlayer = this.addPlayer.bind(this);
    this.startGame = this.startGame.bind(this);
  }


  /**
   * Checks whether the current host has a valid gameId. Creates a new gameId
   * if the host has an empty gameId currently.
   *
   * @return {[Boolean]} [True if the game has been successfully initiated on
   *                      the server. False otherwise.]
   */
  gameIsValid() {

    // Empty gameId => Start a new game
    if(!this._gameId) {

      const newGameId = this.registerNewGame();

      if(newGameId) {
        this._gameId = newGameId;
        return true;
      }

      else {
        return false;
      }

    }

    // TODO: Otherwise, check validity of gameId
    if(this._gameId) return true;


    return false;
  }

  /**
   * Creates a new game on the server with a unique gameId.
   * @return {[String] | false} [Returns gameId or false on failure]
   */
  registerNewGame() {
    // TODO: create a new unique game ID
    this._gameId = Math.floor(Math.random()*9999);

    // Change the url in the url bar and the history without refreshing the page
    history.replace("/game/" + this._gameId, "newGameIdRegistered");

    return this._gameId;
  }

  loadGameData(gameId) {
    //fetch
  }

  addPlayer() {
    let gameData = this._view.state.gameData;
    gameData.players.push("Joe");
    this._view.setState({ gameData: gameData });
  }

  removePlayer() {

  }

  startGame() {
    this._view.setState({gameHasStarted: true});
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
