/**
 * This reducer manages changes to the state of the key gameData.
 *
 * It defines what is shown in the UI of `/views/Pregame.js` and `/views/InGame.js`.
 * Its actions are supplied by `/controllers/GameHost.js` and `/controllers/GameController.js`.
 *
 */

import {
  SET_INITIAL_GAME_DATA
} from '../actions';

export default function gameData(state = null, action) {

  switch(action.type) {

    case SET_INITIAL_GAME_DATA:
      return Object.assign({}, state, action.gameData);

    default:
      return state;

  }

}
