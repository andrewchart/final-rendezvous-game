/**
 * This reducer manages changes to the state of the local player within the
 * current game.
 *
 * It defines what is shown in the UI of `/views/GameShell.js` and its actions
 * are supplied by `/controllers/GameHost.js`.
 *
 */
import {
  SET_LOCAL_PLAYER_ID
} from '../actions';


// Initial State
const initialState = {
  _id: null
}

export default function localPlayer(state = initialState, action) {

  switch(action.type) {

    case SET_LOCAL_PLAYER_ID:
      return Object.assign({}, state, {
        _id: action.id
      });

    default:
      return state;

  }

}
