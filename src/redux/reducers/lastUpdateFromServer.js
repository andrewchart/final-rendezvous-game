/**
 * This reducer monitors for all actions which updated the Redux store based
 * upon data sent from the api server. Any such action will cause this reducer
 * to update the store with the date of the last server update so we can react
 * if the player has not received up-to-date data for some time.
 *
 * Such actions are identified in `/redux/actions/index.js` with the prefix `$`
 * and are assumed to be the result of a *successful* call to the API that
 * resulted in the Redux store being modified.
 *
 */
export default function lastUpdateFromServer(state = null, action) {
  // if action is prefixed with $....
  if(action.type.substr(0,1) === "$") {
    return Object.assign({}, state, {
      timestamp: new Date()
    })
  }
  return state;
}
