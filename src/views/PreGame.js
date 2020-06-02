import React from 'react';

import {connect} from 'react-redux';

import AddPlayer from '../ui_components/PreGame/AddPlayer.js';
import CurrentPlayers from '../ui_components/PreGame/CurrentPlayers.js';
import ValidationError from '../ui_components/global/ValidationError.js';

class PreGame extends React.Component {

  getAddPlayerForm() {
    if(!this.props.localPlayer && this.props.players.length < 8) {
      return <AddPlayer host={this.props.host} />;
    }

    return null;
  }

  render() {

    return (
      <section className="preGame">
        <h3>Room ID: {this.props.gameId}</h3>
        <p>Share this room ID with your friends so they can join the game.</p>

        { this.getAddPlayerForm() }

        <CurrentPlayers
          players={this.props.players}
          localPlayer={this.props.localPlayer}
          host={this.props.host} />


        {
          !this.props.localPlayer &&
          <ValidationError message="Only players who have joined are allowed to start this game." />
        }


        <label htmlFor="startGameButton">
            Once all players have joined the game, click "Start Game" to start playing.
        </label>
        <button
          id="startGameButton"
          disabled={(!this.props.gameCanStart)}
          onClick={this.props.host.startGame}>Start Game</button>

      </section>
    );
  }
}

// Redux Store Data
const mapStateToProps = (state) => {
  return {
    gameCanStart: state.gameShell.gameCanStart,
    gameId: state.gameData._id,
    localPlayer: state.localPlayer._id,
    players: state.gameData.players
  }
}

export default connect(
  mapStateToProps
)(PreGame);
