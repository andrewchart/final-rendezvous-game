/**
 * This index contains all the Redux actions available to modify state within
 * the game. The constants are listed in alphabetical order and namespaced.
 *
 * The corresponding action creators - used by the front end controllers to
 * dispatch the actions - are listed in the same alphabetical order at the
 * bottom of the file.
 *
 * Namespacing hints towards the reducer that handles the action. Actions that
 * apply to multiple reducers are not namespaced.
 *
 */

// Action Types
export const ADD_PLAYER_TO_GAME_DATA = 'gameData/ADD_PLAYER_TO_GAME_DATA';
export const REMOVE_PLAYER_FROM_GAME_DATA = 'gameData/REMOVE_PLAYER_FROM_GAME_DATA';
export const SET_GAME_CAN_START = 'gameShell/SET_GAME_CAN_START';
export const SET_GAME_HAS_STARTED = 'gameShell/SET_GAME_HAS_STARTED';
export const SET_GAME_IS_VALID = 'gameShell/SET_GAME_IS_VALID';
export const SET_INITIAL_GAME_DATA = 'gameData/SET_INITIAL_GAME_DATA';
export const SET_LOADING = 'SET_LOADING';
export const SET_LOCAL_PLAYER_ID = 'localPlayer/SET_LOCAL_PLAYER_ID';


// Action Creators
export const addPlayerToGameData = makeActionCreator(ADD_PLAYER_TO_GAME_DATA, 'player');
export const removePlayerFromGameData = makeActionCreator(REMOVE_PLAYER_FROM_GAME_DATA, 'id')
export const setGameCanStart = makeActionCreator(SET_GAME_CAN_START, 'bool');
export const setGameHasStarted = makeActionCreator(SET_GAME_HAS_STARTED, 'bool');
export const setGameIsValid = makeActionCreator(SET_GAME_IS_VALID, 'bool');
export const setInitialGameData = makeActionCreator(SET_INITIAL_GAME_DATA, 'gameData')
export const setLoading = makeActionCreator(SET_LOADING, 'bool');
export const setLocalPlayerId = makeActionCreator(SET_LOCAL_PLAYER_ID, 'id');




/**
 * Action creator creator function!
 * @param  {String}  type     The type of action that will be communicated to the store.
 * @param  {Strings} argNames String parameters that specify the names of the properties
 *                            of the arbitrary data that is passed to the actions.
 * @return {Object}           Returns an action object that can be used by Redux.
 */
function makeActionCreator(type, ...argNames) {
  return function (...args) {
    const action = { type };
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index]
    });
    return action;
  }
}
