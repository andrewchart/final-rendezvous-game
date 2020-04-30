import { createStore } from 'redux';

/**
 * This class models all the data for playing a live game as a Redux store. It
 * exists once a game has been started by a Host and the gameId has been
 * confirmed as valid.
 */
export default class GameData {

  constructor(gameId) {

    this.gameId = gameId;

    this.store = createStore(
      this.emptyState.bind(this),
      window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );

  }

  emptyState() {
    return {
      gameId: this.gameId,
      players: [],
      doubleAgents: [],
      xCityId: 13,
      xCodeWord: 'BANANA',
      deck: [],
      currentPlayer: 0,
      turnActionsRemaining: 3
    }
  }

}
