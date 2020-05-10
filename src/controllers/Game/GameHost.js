import {createStore} from 'redux';

// Allow the Game Host to manipulate history API
import { createBrowserHistory } from 'history';
const history = createBrowserHistory();

const PATH_TO_API = process.env.REACT_APP_PATH_TO_API;

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
   * @param {String} gameId [Unique identifier for this game]
   * @param {Object} view   [The React view which is displaying the game]
   */
  constructor(gameId = '', view) {
    this._gameId = gameId.toUpperCase();
    this._view = view;

    // Bind `this`
    this.addPlayer = this.addPlayer.bind(this);
    this.startGame = this.startGame.bind(this);
  }


  /**
   * Creates a new game on the server with a unique gameId.
   * @return {Promise} Returns gameId or false on failure
   */
  registerNewGame() {

    // Call API
    return fetch(PATH_TO_API + '/games', { method: 'post' }).then(response => {

      // Throw error on bad response
      if(response.status !== 200) {
        throw(new Error("Could not create new game"));
      }

      //Parse response object
      return response.json().then(json => {

        this._gameId = json.gameId;

        // Change the url in the url bar and the history without refreshing the page
        history.replace("/game/" + this._gameId, "newGameIdRegistered");

      });

    // Handle all errors
    }).catch(err => {

      this._view.setState({
        gameIsValid: false,
        loading: false
      });

    });

  }

  /**
   * Loads an existing game's game data using its gameId.
   * @param  {String} gameId  A unique gameId
   * @return {Promise} TODO
   */
  loadGame(gameId) {

    // Call API
    return fetch(PATH_TO_API + '/games/' + gameId).then(response => {

      // Throw error on bad response
      if(response.status !== 200) {
        throw(new Error("Could not get game ID: " + gameId));
      }

      // Parse response object
      return response.json().then(json => {

        let store = createStore(
          () => { return json },
          window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
        );

        this._view.setState({
          gameIsValid: true,
          gameData: store,
          gameCanStart: true,
          loading: false
        });

      });

    // Handle all errors
    }).catch(err => {

      this._view.setState({
        gameIsValid: false,
        loading: false
      });

    });



  }


  addPlayer(e) {
    this._view.state.gameData.dispatch({ type: "ADD_PLAYER", name: 'rand' });
    e.preventDefault();
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
