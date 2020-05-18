import React from 'react';

import PlayerName from './PlayerName.js';

import ValidationError from '../global/ValidationError.js';

import {
  onChange,
  validateNotEmpty
} from '../../utils.js';

export default class AddPlayer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      joined: false,
      playerName: '',
      validationErrors: [],
      apiError: ''
    }

    // Bind `this`
    this.joinGame = this.joinGame.bind(this);
    this.onChange = onChange.bind(this);

    this.validateAll = this.validateAll.bind(this);
    this.validatePlayerName = this.validatePlayerName.bind(this);

  }

  /**
   * Asks the game host to add this player to the game
   * @param  {SyntheticEvent} event React synthetic event.
   * @return {[type]}       [description]
   */
  joinGame(event) {

    // Don't submit the form
    event.preventDefault();

    // Check the player name is valid
    if(!this.validateAll()) return false;

    // Reset validation errors if validation checks pass
    this.setState({ validationErrors: [] });

    // Get a Player model object from the API
    let player = this.props.host.addPlayer(this.state.playerName);
    console.log("player", player);

    if(player.id) {
      // set this player id in localstorage and view?
      // get updated gamedata (players only)
      this.setState({ joined: true });
      return true;
    } else {
      this.setState({ apiError: 'set this to error message returned' });
      return false;
    }

  }

  /**
   * Parent function to validate all form fields and gather validation errors.
   * @return {Boolean} Returns true if there are no errors, false otherwise.
   */
  validateAll() {
    const errors = [];

    if(!this.validatePlayerName()) errors.push(
      "Please provide a name for your player."
    );

    if(errors.length > 0) {
      this.setState({ validationErrors: errors });
      return false;
    }

    return true;
  }

  /**
   * Validates the room ID field if the user is trying to join a room.
   * @return {Boolean} Returns true if the field contains a non-empty value.
   */
  validatePlayerName() {
    return validateNotEmpty(this.state.playerName);
  }

  render() {

    // Prepare form validation error messages.
    const validationErrors = this.state.validationErrors.map((message, index) => {
      return <ValidationError message={message} key={index} />;
    });

    if(!this.state.joined) {

      return (
        <form onSubmit={this.joinGame}>
          <h3>Join the game</h3>

          {validationErrors}

          { this.state.apiError.length > 0 ? (<p className="error apiError">{this.state.apiError}</p>) : null }

          <div>
            <label>
              Your player name:
              <input type="text" name="playerName" id="playerName" onChange={this.onChange} />
              <input type="submit" value="Join game" />
            </label>
          </div>

        </form>
      );

    } else {

      return(null);

    }
  }
}
