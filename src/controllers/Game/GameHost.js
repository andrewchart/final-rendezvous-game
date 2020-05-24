// Redux action creators
import {
  setGameCanStart,
  setGameHasStarted,
  setGameIsValid,
  setInitialGameData,
  setLoading
} from '../../redux/actions';

// Allow the Game Host to manipulate history API
import { createBrowserHistory } from 'history';
const history = createBrowserHistory();

// Game Data API
const PATH_TO_API = process.env.REACT_APP_PATH_TO_API;

// Game Prefix
const GAME_PREFIX = process.env.REACT_APP_PREFIX;

/**
 * TODO REWRITE
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
   * @param {String}   gameId       Unique identifier for this game
   * @param {Function} dispatchFunc Function used to dispatch actions to the Redux store
   */
  constructor(gameId = '', dispatchFunc) {
    this._gameId = gameId.toUpperCase();
    this.dispatch = dispatchFunc;

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

      this.dispatch(setGameIsValid(false));
      this.dispatch(setLoading(false));

      return err;

    });

  }

  /**
   * Loads an existing game's game data using its gameId.
   * @param  {String}  gameId  A unique gameId
   * @return {Promise | Error} Resolves to an instance of the GameData model or
   *                           Error object on failure.
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

        //check if the local player is already associated with this game

        this.dispatch(setInitialGameData(json));
        this.dispatch(setGameIsValid(true));
        this.dispatch(setLoading(false));

        return json;

      }).then(json => {return json});

    // Handle all errors
    }).catch(err => {

      this.dispatch(setGameIsValid(false));
      this.dispatch(setLoading(false));

      return err;

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
   * Calls the Players API to add a player to the game
   * @param  {String}          name The nickname the player provided.
   * @return {Promise | Error}      Resolves to the created player's ID on success
   *                                or Error object on failure.
   */
  addPlayer(name) {

    // Add the player's chosen nickname to localStorage for recall for future games
    localStorage.setItem(GAME_PREFIX + "playerName", name);

    // Call API
    return fetch(PATH_TO_API + '/games/' + this._gameId + '/players', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: '{ "name": "' + name + '" }'
    }).then(response => {

      // Throw error on bad response
      if(response.status !== 201) {
        throw(new Error("Could not create player: " + name));
      }

      // Return the response
      return response.json().then(json => {

        //Create an association in localStorage between the local player and their
        //player ID for this game.
        localStorage.setItem(GAME_PREFIX + 'playerId_' + this._gameId, JSON.stringify({
          _id: json._id,
          date: new Date()
        }));

        //Set local player in redux


        return json;
      })

    }).catch(err => {
      // Return the error message.
      return err;
    });
  }

  removePlayer() {

  }

  startGame() {
    this.dispatch(setGameHasStarted(true));
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
