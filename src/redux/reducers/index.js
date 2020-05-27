import { combineReducers } from 'redux'

// Import individual reducers
import gameData from './gameData.js';
import gameShell from './gameShell.js';
import localPlayer from './localPlayer.js';
import lastUpdateFromServer from './lastUpdateFromServer.js';

/**
 * The root reducer defines the initial state of the application and passes on
 * actions to the individual reducers controlling aspects of the overall game
 * and in-game play.
 */
export default combineReducers({
  gameData,
  gameShell,
  localPlayer,
  lastUpdateFromServer
});
