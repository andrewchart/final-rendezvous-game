/**
 * This reducer manages changes to the state of the overall game shell to help
 * the host set up and end games.
 *
 * It defines what is shown in the UI of `/views/GameShell.js` and its actions
 * are supplied by `/controllers/GameHost.js`.
 *
 */
import {
  SET_GAME_CAN_START,
  SET_GAME_IS_VALID,
  SET_LOADING
} from '../actions';


// Initial State
const initialState = {
 gameCanStart: false,
 gameIsValid: false,
 loading: true
}

export default function gameShell(state = initialState, action) {

  switch(action.type) {

    case SET_GAME_CAN_START:
      return Object.assign({}, state, {
        gameCanStart: action.bool
      });

    case SET_GAME_IS_VALID:
      return Object.assign({}, state, {
        gameIsValid: action.bool
      });

    case SET_LOADING:
      return Object.assign({}, state, {
        loading: action.bool
      });

    default:
      return state;

  }

}
