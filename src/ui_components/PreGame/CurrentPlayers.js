import React, {Fragment} from 'react';

import PlayerName from './PlayerName.js';
import ValidationError from '../global/ValidationError.js';

export default class CurrentPlayers extends React.Component {

  render() {
    return (
        <Fragment>
          <h3>Current Players</h3>
          <ol>
          {
            this.props.players.map(player => {
              return (
                  <PlayerName
                    key={player._id}
                    player={player}
                    thatsYou={this.props.localPlayer === player._id}
                    removePlayer={this.props.host.removePlayer} />
              );
            })
          }
          </ol>

          {
            this.props.players.length < 2 &&
            <ValidationError message="You need at least 2 players to start the game." />
          }

          {
            this.props.players.length >= 8 &&
            <ValidationError message="Games can have a maximum of 8 players." />
          }

        </Fragment>
    );
  }

}
