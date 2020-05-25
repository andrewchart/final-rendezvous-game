// Redux action creators
import {
  addPlayerToGameData,
  removePlayerFromGameData,
  setGameCanStart,
  setGameHasStarted,
  setGameIsValid,
  setInitialGameData,
  setLoading,
  setLocalPlayerId
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

    this.websocket = null;

    // Bind `this`
    this.addPlayer = this.addPlayer.bind(this);
    this.removePlayer = this.removePlayer.bind(this);
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

        // Check if the local player is already associated with this game and get
        // their playerId for this game if so.
        let localPlayerId = this.initPlayer(gameId, json.players);

        // Set the localPlayerID and gameData in the redux store and allow the
        // user to interact with the UI
        this.dispatch(setLocalPlayerId(localPlayerId));
        this.dispatch(setInitialGameData(json));
        this.dispatch(setGameIsValid(true));
        this.dispatch(setLoading(false));

        // Subscribe the local player to game updates by connecting them to the
        // websocket server
        this.websocket = this.subscribeToGameUpdates(localPlayerId);

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
   * Initates the correct state for a local player for the current game. If the
   * local player is new to the current game, the state of 'localPlayer' in the
   * Redux store will have no ID and therefore the player will be provided with
   * the `ui_components\PreGame\AddPlayer.js` form to be able to join the game
   * (as long as it hasn't started).
   *
   * However, if the player is coming back to the game having previously joined,
   * the Redux store `localPlayer` state will be filled in with the value found
   * in localStroage (set `addPlayer()`).
   *
   * Before returning, we check whether the ID in localStorage is still a member
   * of this game. If not, we return as if the player is new and needs to join
   * the game.
   * @param  {String} gameId  Unique identifier for the game to check in localStorage
   * @param  {Array}  players Array of player objects from the GameData
   * @return {Int | null}     Returns the player ID or null if they don't exist.
   */
  initPlayer(gameId, players) {

    // Try and find an entry in localStorage for this gameId
    let entry = localStorage.getItem(GAME_PREFIX + 'playerId_' + gameId);
    if (!entry) return null;

    // De-serialise the localStorage entry
    let json = JSON.parse(entry);

    // If an entry is found, check that that playerId is still a member of the game.
    // Remove the localStorage entry if not and return null
    if (players.filter(player => player._id === json._id).length === 0) {
      localStorage.removeItem(GAME_PREFIX + 'playerId_' + gameId);
      return null;
    }

    // Otherwise return the ID
    return '_id' in json ? json._id : null;
  }


  /**
   * Calls the Players API to add a player to the game
   * @param  {String}          name The nickname the player provided.
   * @return {Promise | Error}      Resolves to the created player's ID on success
   *                                or Error object on failure.
   */
  addPlayer(name) {

    // Add the player's chosen nickname to localStorage for recall for future games
    localStorage.setItem(GAME_PREFIX + 'playerName', name);

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

        // Create an association in localStorage between the local player and their
        // player ID for this game for future recall if the player leaves and rejoins.
        localStorage.setItem(GAME_PREFIX + 'playerId_' + this._gameId, JSON.stringify({
          _id: json._id,
          date: new Date()
        }));

        // Set local player ID in redux
        this.dispatch(setLocalPlayerId(json._id));

        // Immediately add a PlayerData Object to the local gameData for instant
        // feedback that this has been successful (this will get updated from the
        // server as other players join)
        this.dispatch(addPlayerToGameData({ _id: json._id, name: name }));

        // Update the websocket server to tell it that this socket now corresponds
        // to a specific player ID.
        this.updateSubscriptionToGameUpdates(json._id);


        return json;
      })

    }).catch(err => {
      // Return the error message.
      return err;
    });
  }

  removePlayer(playerId) {

    // Call API
    return fetch(PATH_TO_API + '/games/' + this._gameId + '/players/' + playerId, {
      method: 'delete',
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {

      // Throw error on bad response
      if(response.status !== 200) {
        throw(new Error("Could not delete player: " + playerId));
      }

      // Handle a successful deletion
      return response.json().then(json => {

        // Delete the localStorage association between the local player and this gameId
        localStorage.removeItem(GAME_PREFIX + 'playerId_' + this._gameId);

        // Unset local player ID in redux
        this.dispatch(setLocalPlayerId(null));

        // Immediately remove the PlayerData Object from the local gameData for
        // instant feedback that the delete has been successful (this will get
        // updated from the server as other players join).
        this.dispatch(removePlayerFromGameData(playerId));

        // Update the websocket server to tell it that this socket no longer
        // corresponds to a specific player ID.
        this.updateSubscriptionToGameUpdates(null);

        return json;
      })

    }).catch(err => {
      // Return the error message.
      return err;
    });
  }


  startGame() {
    this.dispatch(setGameHasStarted(true));
  }

  endGame() {

  }


   /**
    * Attempts to create a connection to the websocket server to subscribe to
    * GameData changes.
    *
    * When a person starts viewing a game url (`/game/GAMEID`) we create a
    * connection between this client and the websockets server. This means that
    * each client can start to see the PreGame data (primarily the list of
    * players) get updated in realtime, even though they haven't yet necessarily
    * joined the game.
    *
    * The connection persists whilst the browser is connected, and is killed at
    * the end of the session. The connection can be updated with a new playerId
    * or even gameId using `updateSubscriptionToGameUpdates()`.
    *
    * @param  {Int}    localPlayerId  Tells the websocket server what this client's
    *                                 localPlayerId is within this game.
    * @return {Websocket}             Websocket instance or null on failure.
    */
  subscribeToGameUpdates(localPlayerId) {

    try {

      const wsUrl = process.env.REACT_APP_WEBSOCKET_SERVER_CLIENT_URL + ":"
                  + process.env.REACT_APP_WEBSOCKET_SERVER_PORT;

      const ws = new WebSocket(wsUrl);

      // Send a message to subscribe the client to the server's updates
      ws.onopen = () => {
        ws.send(JSON.stringify({
          clientType: 'PLAYER',
          messageType: 'SUBSCRIBE',
          gameId: this._gameId,
          playerId: localPlayerId
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
   * Updates the existing websocket connection to have the most up to date gameId
   * and playerId so that the player's current client connection to the websocket
   * server is for the correct game and player.
   * @param  {Int}  localPlayerId   Tells the websocket server what this client's
   *                                localPlayerId is within this game.
   * @return {undefined}
   */
  updateSubscriptionToGameUpdates(localPlayerId) {

    if (!this.websocket) return;

    return this.websocket.send(JSON.stringify({
      clientType: 'PLAYER',
      messageType: 'UPDATE',
      gameId: this._gameId,
      playerId: localPlayerId
    }));

  }


  // Getters and Setters
  get gameId() {
    return this._gameId;
  }

  set gameId(gameId) {
    this._gameId = gameId;
  }

}
