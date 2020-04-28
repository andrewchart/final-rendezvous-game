import React from 'react';

import Host from '../components/Game/Host.js';

import Error from '../views/Error.js';

/**
 * The Game view starts the rendering of a game UI by creating game data
 */
export default class Game extends React.Component {

  constructor(props) {
    super(props);

    // We need to ensure the game ID is valid before rendering the UI
    this.state = {
      gameIsValid: false
    }

    // Create a game host
    this.host = new Host(this.props.match.params.gameId);
  }


  /**
   * Once the component is available and has a Game Host, fetch game data for
   * the user interface.
   */
  componentDidMount() {

    /**
     * Checks the Game ID is valid then starts the game via the host, using the
     * setState callback function.
     */
    this.setState(
      { gameIsValid: this.host.gameIsValid() },
      () => {
        if(this.state.gameIsValid) this.host.init();
      }
    );

  }


  render() {

    // If the gameId is invalid...
    if(!this.state.gameIsValid)
      return <Error type="invalid_game" />;

    // Create the game UI
    return (
      <main className="game">


        Game ID: {this.host.gameId}
      </main>
    );

  }
}
