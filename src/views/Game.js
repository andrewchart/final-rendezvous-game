import React, {Fragment} from 'react';

import GameHost from '../controllers/Game/GameHost.js';
import GameController from '../controllers/Game/GameController.js';

import GameData from '../models/Game/GameData.js';

import {
  AddPlayer,
  StartGame
} from '../ui_components/Game/PreGame.js';

import Error from '../views/Error.js';

/**
 * The Game view starts the rendering of a game UI by creating game data
 */
export default class Game extends React.Component {

  constructor(props) {
    super(props);

    /* The UI has different states depending on whether this is a valid gameId
    and whether the game has started or not. */
    this.state = {
      gameIsValid: false,
      gameHasStarted: false,
      gameData: new GameData() // Empty Game Data object
    }

    // Create a game host using the ID from the url. The host manages the game.
    // We pass the host this view so the host can manage the view's state
    this.host = new GameHost(this.props.match.params.gameId, this);

    // Create a game controller and pass it the view.
    // The game controller manages the in-play functions
    this.controller = new GameController(this);
  }


  /**
   * Once the component is available and has a Game Host, check that the gameId
   * is valid before rendering the UI.
   */
  componentDidMount() {

    // Check the Game ID is valid
    this.setState({ gameIsValid: this.host.gameIsValid() });

  }

  getPreGameComponents() {
    return (
      <Fragment>
        <p>Pregame</p>
        <AddPlayer onClick={this.host.addPlayer} />
        <StartGame onClick={this.host.startGame} />
      </Fragment>
    );

  }

  getInGameComponents() {
    return <div>In Game View <br /><br /> <pre>{JSON.stringify(this.state.gameData)}</pre></div>
  }

  render() {

    // If the gameId is invalid...
    if(!this.state.gameIsValid)
      return <Error type="invalid_game" />;

    // Create the game UI
    // If the game hasn't started, show the pre-game view (capture players)
    // If the game has started, show the in-game view
    return (
      <main className="game">
        {this.state.gameHasStarted ? this.getInGameComponents() : this.getPreGameComponents() }
      </main>
    );

  }
}
