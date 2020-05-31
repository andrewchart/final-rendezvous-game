import React from 'react';

import {connect} from 'react-redux';

import GameHost from '../controllers/Game/GameHost.js';
import GameController from '../controllers/Game/GameController.js';

import Loading from '../ui_components/global/Loading.js';
import PreGame from '../views/PreGame.js';

import Error from '../views/Error.js';


/**
 * The GameShell view is the parent view for a game from start to finish. It
 * handles rendering of the game views including the PreGame view and the InGame
 * views. Visually, this is a shell, but it carries controller classes to set up
 * the game (GameHost) and to play the game (GameController) and handles the
 * rendering of the game stages dependent on its own state.
 */
class GameShell extends React.Component {

  constructor(props) {
    super(props);

    // Create a game host using the ID from the url. The host manages the game.
    // We pass the host this view itself to enable it to read the view component's
    // data directly.
    this.host = new GameHost(this);

    // Create a game controller and pass it the view.
    // The game controller manages the in-play functions
    this.controller = new GameController(this);

  }

  /**
   * React component lifecycle method
   */
  componentDidMount() {

    // Now the component has mounted we can ask the host to create and load a new
    // game with a unique ID or, if this is an existing game, load the gameData
    // using the ID provided in the URL.
    this.host.resolveGameId();

  }

  componentWillUnmount() {
    // Kill the websocket connection when the user leaves '/game/GAMEID'
    try {
      this.host.websocket.close();
    } catch(err) {
      // Do nothing. It's ok for the websocket not to be set
    }
  }

  getPreGameView() {
    return <PreGame host={this.host} />;
  }

  getInGameView() {
    return <div>In Game View <br /><br /></div>
  }

  render() {

    // Show the loading icon whilst performing work
    if(this.props.loading)
      return <Loading />;

    // If the gameId is invalid...
    if(!this.props.gameIsValid)
      return <Error type="invalid_game" />;

    // Otherwise, we can create the game UI
    // If the game hasn't started, show the pre-game view (capture players)
    // If the game has started, show the in-game view
    return (
      <main className="game">
        {
          this.props.gameData && this.props.gameData.hasStarted ?
          this.getInGameView() : this.getPreGameView()
        }
      </main>
    );

  }
}

// Redux Store Data
const mapStateToProps = (state) => {
  return {
    gameData: state.gameData,
    gameIsValid: state.gameShell.gameIsValid,
    loading: state.gameShell.loading
  }
}

export default connect(
  mapStateToProps
)(GameShell);
