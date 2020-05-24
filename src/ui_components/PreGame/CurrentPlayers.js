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
            this.props.players.map((player) => {
              let thatsYou = (this.props.localPlayer === player._id);
              return <PlayerName key={player._id} name={player.name} thatsYou={thatsYou} />
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
