import React, {Fragment} from 'react';

import {Provider} from 'react-redux';

import GameHost from '../controllers/Game/GameHost.js';
import GameController from '../controllers/Game/GameController.js';

import Loading from '../ui_components/global/Loading.js';

import {
  AddPlayer,
  StartGame
} from '../ui_components/Game/PreGame.js';

import Error from '../views/Error.js';


/**
 * The Game view starts the rendering of a game UI by loading game data and state
 */
export default class Game extends React.Component {

  constructor(props) {
    super(props);

    // Create a game host using the ID from the url. The host manages the game.
    // We pass the host this view so the host can manage the view's state
    this.host = new GameHost(this.props.match.params.gameId, this);

    // Create a game controller and pass it the view.
    // The game controller manages the in-play functions
    this.controller = new GameController(this);

    // The UI has different states depending on whether this is a valid gameId
    // and whether the game has started or not.
    this.state = {
      gameData: null,
      loading: true,
      gameIsValid: false,
      gameCanStart: false, //TODO: Has the gamedata loaded yet?
      gameHasStarted: false
    }

  }

  /**
   * React component lifecycle method
   */
  componentDidMount() {

    // Now the component has mounted we can ask the host to create and load a new
    // game with a unique ID or, if this is an existing game, load the gameData
    // using the ID provided in the URL.
    this.host.resolveGameId().then(() => {

      // Then, establish a means of receiving live updates to the GameData and
      // attach this to our Game View.
      this.websocket = this.host.subscribeToGameUpdates(this.host.gameId);

    });

  }



  getPreGameComponents() {
    return (
      <Fragment>
        <p>Pregame {this.host.gameId}</p>

        <form>
          <label htmlFor="player-name">
            Name:
            <input type="text" id="player-name" value="" />
          </label>
          <AddPlayer onClick={this.host.addPlayer} />
          <StartGame onClick={this.host.startGame} />
        </form>
      </Fragment>
    );

  }

  getInGameComponents() {
    return <div>In Game View <br /><br /></div>
  }

  render() {

    // Show the loading icon whilst performing work
    if(this.state.loading)
      return <Loading />;

    // If the gameId is invalid...
    if(!this.state.gameIsValid)
      return <Error type="invalid_game" />;

    // Otherwise, we can create the game UI
    // If the game hasn't started, show the pre-game view (capture players)
    // If the game has started, show the in-game view
    return (
      <Provider store={this.state.gameData}>
        <main className="game">
        {this.state.gameHasStarted ? this.getInGameComponents() : this.getPreGameComponents() }
        </main>
      </Provider>
    );

  }
}
