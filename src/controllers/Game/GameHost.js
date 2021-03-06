// Redux action creators
import {
  addPlayerToGameData,
  removePlayerFromGameData,
  setGameCanStart,
  setHasStarted,
  setGameIsValid,
  setInitialGameData,
  setLoading,
  setLocalPlayerId,
  updateGameData
} from '../../redux/actions';

// Allow the Game Host to manipulate history API
import { createBrowserHistory } from 'history';
const history = createBrowserHistory();

// Game Data API
const PATH_TO_API = "//" + process.env.REACT_APP_DOMAIN + "/api";

// Game Prefix
const GAME_PREFIX = process.env.REACT_APP_PREFIX;

/**
 * TODO REWRITE
 * The Game Host manages the Game instance at a high level including creating a
 * new gameId, adding and removing players from a game, starting, ending and
 * deleting the game, and retrieving in-progress game data.
 *
 * This class largely exists to decouple pre-game logic from the GameShell view
 */
export default class GameHost {

  /**
   * Creates a new game Host class to control entry into a game.
   * @param {React.Component} view The React Component which is controlled by this host
   */
  constructor(view) {

    // Allow the host to read and write from the view
    this._view = view;

    this.gameId = (
      view.props.match.params.gameId ?
      view.props.match.params.gameId.toUpperCase() : null
    );

    this.websocket = null;

    // Bind `this`
    this.addPlayer = this.addPlayer.bind(this);
    this.gameCanStart = this.gameCanStart.bind(this);
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
    return fetch(PATH_TO_API + '/games', { method: 'POST' }).then(response => {

      // Throw error on bad response
      if(response.status !== 201) {
        throw(new Error("Could not create new game"));
      }

      //Parse response object
      return response.json().then(json => {

        this.gameId = json._id;

        // Change the url in the url bar and the history without refreshing the page
        history.replace("/game/" + this.gameId, "newGameIdRegistered");

        return json;

      }).then(json => {return json});

    // Handle all errors
    }).catch(err => {

      this._view.props.dispatch(setGameIsValid(false));
      this._view.props.dispatch(setLoading(false));

      return err;

    });

  }


  /**
   * Loads an existing game's game data using its gameId and primes the UI state.
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

        // Set the localPlayerID and gameData in the redux store
        this._view.props.dispatch(setLocalPlayerId(localPlayerId));
        this._view.props.dispatch(setInitialGameData(json));

        // Confirm to the UI that the game ID is valid
        this._view.props.dispatch(setGameIsValid(true));

        // Check if the game can start and update the UI if it can
        this._view.props.dispatch(setGameCanStart(this.gameCanStart()));

        // Remove the loading screen
        this._view.props.dispatch(setLoading(false));

        // Subscribe the local player to game updates by connecting them to the
        // websocket server
        this.websocket = this.subscribeToGameUpdates(localPlayerId);

        return json;

      }).then(json => {return json});

    // Handle all errors
    }).catch(err => {

      this._view.props.dispatch(setGameIsValid(false));
      this._view.props.dispatch(setLoading(false));

      return err;

    });

  }


  /**
   * Retrieves game data from the server based on an instruction from the
   * websocket server. The WSS tells the host which fields to retrieve and
   * update, minimising the payloads that each client has to pull from the API.
   * @param  {Object}          message Message from websocket server, parsed as JSON
   * @return {Promise | Error}         Resolves to the gamedata field/s requested
   *                                   or an Error object on failure.
   */
  updateGameData(message) {

    // Create an empty string ready to take a `fields` query parameter
    let fields = "";

    // If the message contains a fields array, construct a query string out of it.
    if (
      Array.isArray(message.data.fields) &&
      message.data.fields.length > 0 &&
      !message.data.all
    ) {
      fields = "?fields=" + message.data.fields.toString();
    }

    // Call API to get desired data.
    return fetch(PATH_TO_API + '/games/' + this.gameId + fields).then(response => {

      // Throw error on bad response
      if(response.status !== 200) {
        throw(new Error("Could not get game ID: " + this.gameId));
      }

      // Parse response object
      return response.json().then(json => {

        // Update the redux store with the new gameData
        this._view.props.dispatch(updateGameData(json));

        // Check if the game can start and update the UI if it can
        this._view.props.dispatch(setGameCanStart(this.gameCanStart()));

        return json;
      });

    // Handle errors quietly
    }).catch(err => {
      return err;
    });

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

      const wsProtocol = (window.location.protocol === 'https:' ? "wss" : "ws");
      const wsUrl = wsProtocol + "://" + process.env.REACT_APP_WEBSOCKET_SERVER_URL;

      const ws = new WebSocket(wsUrl);

      // Send a message to the WSS to subscribe the client to the server's updates
      ws.onopen = () => {

        // Attach a UUID to the socket on the client side
        const { v4: uuidv4 } = require('uuid');
        const uuid = uuidv4();
        ws.socketId = uuid;

        ws.send(JSON.stringify({
          clientType: 'PLAYER',
          messageType: 'SUBSCRIBE',
          gameId: this.gameId,
          playerId: localPlayerId,
          socketId: uuid // Send the same UUID to the server side
        }));
      }

      // Create a message handler for inbound messages from the WSS
      ws.onmessage = (event) => {
        let message = JSON.parse(event.data);
        switch(message.messageType) {
          case 'UPDATE_GAME_DATA':
            return this.updateGameData(message);

          default:
            return;
        }
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
      messageType: 'UPDATE_SUBSCRIPTION',
      gameId: this.gameId,
      playerId: localPlayerId
    }));

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

    // Prepare the body data
    let body = {
      data: {
        name: name
      },
      socketId: this.websocket.socketId
    }

    // Call API
    return fetch(PATH_TO_API + '/games/' + this.gameId + '/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(response => {

      // Throw error on bad response
      if(response.status !== 201) {
        throw(new Error("Could not create player: " + name));
      }

      // Return the response
      return response.json().then(json => {

        // Create an association in localStorage between the local player and their
        // player ID for this game for future recall if the player leaves and rejoins.
        localStorage.setItem(GAME_PREFIX + 'playerId_' + this.gameId, JSON.stringify({
          _id: json._id,
          date: new Date()
        }));

        // Set local player ID in redux
        this._view.props.dispatch(setLocalPlayerId(json._id));

        // Immediately add a PlayerData Object to the local gameData for instant
        // feedback that this has been successful (this will get updated from the
        // server as other players join)
        this._view.props.dispatch(addPlayerToGameData({ _id: json._id, name: name }));

        // Check if the game can start and update the UI if it can
        this._view.props.dispatch(setGameCanStart(this.gameCanStart()));

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


  /**
   * Calls the players API to remove the local player from the game
   * @param  {Int} playerId     The identifier for the player within this game.
   * @return {Promise | Error}  Resolves to a json message confirming deletion on
   *                            success or Error object on failure.
   */
  removePlayer(playerId) {

    // Call API
    return fetch(PATH_TO_API + '/games/' + this.gameId + '/players/' + playerId, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {

      // Throw error on bad response
      if(response.status !== 200) {
        throw(new Error("Could not delete player: " + playerId));
      }

      // Handle a successful deletion
      return response.json().then(json => {

        // Delete the localStorage association between the local player and this gameId
        localStorage.removeItem(GAME_PREFIX + 'playerId_' + this.gameId);

        // Unset local player ID in redux
        this._view.props.dispatch(setLocalPlayerId(null));

        // Immediately remove the PlayerData Object from the local gameData for
        // instant feedback that the delete has been successful (this will get
        // updated from the server as other players join).
        this._view.props.dispatch(removePlayerFromGameData(playerId));

        // Check if the game can start and update the UI if it can
        this._view.props.dispatch(setGameCanStart(this.gameCanStart()));

        // Update the websocket server to tell it that this socket no longer
        // corresponds to a specific player ID.
        this.updateSubscriptionToGameUpdates(null);

        return json;
      });

    }).catch(err => {
      // Return the error message.
      return err;
    });
  }


  /**
   * Checks the current gameData state to assess whether the game can be started
   * or not. TODO: factor in local player is part of game.
   * @return {Boolean} Returns true if it is ok for the game to start.
   */
  gameCanStart() {
    return(
      this._view.props.gameData.players.length >= 2 &&
      this._view.props.gameData.players.length <= 8
    );
  }


  /**
   * Irreversibly starts a game once all players have joined. Updates the game
   * data on the server and initiates the call to the websocket server to notify
   * all players.
   * @return {Promise} Resolves to a json message confirming whether the update
   *                   has been made to the game data. Describes error on failure.
   */
  startGame() {

    // Prepare the body data
    let body = {
      data: {
        hasStarted: true
      },
      socketId: this.websocket.socketId
    }

    // Call API
    return fetch(PATH_TO_API + '/games/' + this.gameId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(response => {

      // Throw error on bad response
      if(response.status !== 200) {
        throw(new Error("Could not start game."));
      }

      // Handle a successful deletion
      return response.json().then(json => {

        // Go to the in game view
        this._view.props.dispatch(setHasStarted(true));

        return json;

      });

    }).catch(err => {
      // Return the error message.
      return err;
    });

  }


  endGame() {

  }

}
