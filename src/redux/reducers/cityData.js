/**
 * This reducer manages changes to the state of the city data within the
 * current game. It doesn't change much...
 *
 * It defines what is shown in the UI of `/ui_components/InGame/CityList.js` and
 * `/ui_components/InGame/WorldMap.js`.
 *
 */
import {
  SET_CITY_DATA
} from '../actions';


// Initial State
const initialState = [];

export default function cityData(state = initialState, action) {

  switch(action.type) {

    case SET_CITY_DATA:
      return [...state, ...action.cityData];

    default:
      return state;

  }

}
