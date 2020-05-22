import React from 'react';

import {connect} from 'react-redux';

import AddPlayer from '../ui_components/PreGame/AddPlayer.js';
import PlayerName from '../ui_components/PreGame/PlayerName.js';
import ValidationError from '../ui_components/global/ValidationError.js';

class PreGame extends React.Component {

  render() {

    const playerNames = this.props.players.map((player) => {
      return <PlayerName key={player._id} name={player.name} />
    });

    const addPlayerForm = <AddPlayer host={this.props.host} />;

    return (
      <section className="preGame">
        <h3>Room ID: {this.props.gameId}</h3>
        <p>Share this room ID with your friends so they can join the game.</p>

        {
          this.props.players.length < 8 ? addPlayerForm :
          <ValidationError message="You can have a maximum of 8 players per game" />
        }

        <h3>Current Players</h3>
        <ul>{playerNames}</ul>

        {
          this.props.players.length < 2 &&
          <ValidationError message="You need a minimum of 2 players to start the game" />
        }

        <button disabled={(this.props.players.length < 2 || this.props.players.length > 8)}>Start Game</button>

      </section>
    );
  }
}

// Redux Store Data
const mapStateToProps = (state) => {
  return {
    gameId: state._id,
    players: state.players
  }
}

export default connect(
  mapStateToProps
)(PreGame);
