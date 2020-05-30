/**
 * This reducer manages changes to the state of the key gameData.
 *
 * It defines what is shown in the UI of `/views/Pregame.js` and `/views/InGame.js`.
 * Its actions are supplied by `/controllers/GameHost.js` and `/controllers/GameController.js`.
 *
 */

import {
  ADD_PLAYER_TO_GAME_DATA,
  REMOVE_PLAYER_FROM_GAME_DATA,
  SET_INITIAL_GAME_DATA,
  UPDATE_GAME_DATA
} from '../actions';

export default function gameData(state = null, action) {

  switch(action.type) {

    case ADD_PLAYER_TO_GAME_DATA:
      return Object.assign({}, state, {
        players: [
          ...state.players,
          action.player
        ]
      });

    case REMOVE_PLAYER_FROM_GAME_DATA:
      return Object.assign({}, state, {
        players: state.players.filter(player => {
          return player._id !== action.id;
        })
      });

    case SET_INITIAL_GAME_DATA:
    case UPDATE_GAME_DATA:
      return Object.assign({}, state, action.gameData);

    default:
      return state;

  }

}
