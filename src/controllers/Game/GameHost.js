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
   * Creates a new game Host class to control entry into a game.
   * @param {String} gameId Unique identifier for this game
   * @param {Object} view   The React view which is displaying the game
   */
  constructor(gameId = '', view) {
    this._gameId = gameId.toUpperCase();
    this._view = view;

    // Bind `this`
    this.addPlayer = this.addPlayer.bind(this);
    this.resolveGameId = this.resolveGameId.bind(this);
    this.startGame = this.startGame.bind(this);
    this.subscribeToGameUpdates = this.subscribeToGameUpdates.bind(this);
  }


  /**
   * If the host does not have an ID, create a new game and load it once created.
   * Otherwise attempt to load the existing game by its ID.
   * @return {Promise} Resolves to an instance of the GameData model or false
   *                   on failure
   */
  resolveGameId() {

    if(!this.gameId) {
      return this.registerNewGame().then(() => {
        return this.loadGame(this.gameId);
      });
    } else {
      return this.loadGame(this.gameId);
    }

  }

  /**
   * Creates a new game on the server with a unique gameId.
   * @return {Promise} Resolves to gameId object or false on failure
   */
  registerNewGame() {

    // Call API
    return fetch(PATH_TO_API + '/games', { method: 'post' }).then(response => {

      // Throw error on bad response
      if(response.status !== 201) {
        throw(new Error("Could not create new game"));
      }

      //Parse response object
      return response.json().then(json => {

        this._gameId = json._id;

        // Change the url in the url bar and the history without refreshing the page
        history.replace("/game/" + this._gameId, "newGameIdRegistered");

        return json;

      }).then(json => {return json});

    // Handle all errors
    }).catch(err => {

      this._view.setState({
        gameIsValid: false,
        loading: false
      });

      return false;

    });

  }

  /**
   * Loads an existing game's game data using its gameId.
   * @param  {String}  gameId  A unique gameId
   * @return {Promise | false} Resolves to an instance of the GameData model or
   *                           false on failure
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

        // Create a Redux store to handle game data
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

        return json;

      }).then(json => {return json});

    // Handle all errors
    }).catch(err => {

      this._view.setState({
        gameIsValid: false,
        loading: false
      });

      return false;

    });

  }


  /**
   * Attempts to create a connection to the websocket server to subscribe to
   * GameData changes.
   * @return {Websocket} Websocket instance or null on failure
   */
  subscribeToGameUpdates(gameId) {

    try {

      const wsUrl = process.env.REACT_APP_WEBSOCKET_SERVER_CLIENT_URL + ":"
                  + process.env.REACT_APP_WEBSOCKET_SERVER_PORT;

      const ws = new WebSocket(wsUrl);

      // Send an initial message
      ws.onopen = () => {
        ws.send(JSON.stringify({
          messageType: 'SUBSCRIBE',
          entity: 'games',
          _id: gameId
        }));
      }

      return ws;

    } catch(err) {

      console.log(err);
      alert('Could not create a websocket connection!'); //TODO: Remove this and replace with polling mechanism over http
      return null;

    }
  }


  /**
   * [addPlayer description]
   * @param {String} name [description]
   * @return {Player} Returns true on success or false on failure.
   */
  addPlayer(name) {

    // Call API
    return fetch(PATH_TO_API + '/games/' + this._gameId + '/players', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: '{ "name": "' + name + '" }'
    }).then(response => {
      
    }).catch(err => {

      // this._view.setState({
      //   gameIsValid: false,
      //   loading: false
      // });

      return false;

    });
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
