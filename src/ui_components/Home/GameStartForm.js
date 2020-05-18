import React, {Fragment} from 'react';

import {Redirect} from 'react-router-dom';

import ValidationError from '../global/ValidationError.js';

import {
  onChange,
  validateNotEmpty
} from '../../utils.js';

export default class GameStartForm extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      gameId: '',
      redirectLink: '',
      validationErrors: []
    }

    // Bind `this`
    this.joinGame = this.joinGame.bind(this);
    this.newGame = this.newGame.bind(this);

    this.onChange = onChange.bind(this);

    this.validateAll = this.validateAll.bind(this);
    this.validateGameId = this.validateGameId.bind(this);
  }


  /**
   * Allows the user to join an existing game using its game ID.
   * @param  {SyntheticEvent} event React synthetic event.
   * @return {Boolean}              Returns true on success or false on failure.
   */
  joinGame(event) {

    event.preventDefault();

    if(!this.validateAll()) return false;

    this.setState(state => ({
      redirectLink: "/game/" + this.state.gameId.toUpperCase()
    }));

    return true;

  }

  /**
   * Parent function to validate all form fields and gather validation errors.
   * @return {Boolean} Returns true if there are no errors, false otherwise.
   */
  validateAll() {
    const errors = [];

    if(!this.validateGameId()) errors.push(
      "Please provide a room ID if you wish to join a room, or start a new game."
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
  validateGameId() {
    return validateNotEmpty(this.state.gameId);
  }

  /**
   * Forwards the user to the game UI with no game ID set, which will initiate a
   * new game.
   * @return {Boolean} Returns true on success.
   */
  newGame() {

    this.setState(state => ({
      redirectLink: "/game"
    }));

    return true;

  }


  render() {

    // Handle the redirect to start the game
    if(this.state.redirectLink) {
      return (
        <Redirect push to={this.state.redirectLink} />
      );
    }

    // Prepare form validation error messages.
    const validationErrors = this.state.validationErrors.map((message, index) => {
      return <ValidationError message={message} key={index} />;
    });

    // Show the UI that allows users to join the game.
    return (
      <Fragment>

        <form name="joinGameForm" id="joinGameForm" onSubmit={this.joinGame}>

          {validationErrors}

          <div>
            <label htmlFor="gameId">
              Have a room code?
              <input type="text" name="gameId" id="gameId" onChange={this.onChange} value={this.state.gameId} />
            </label>

            <input type="submit" onClick={this.joinGame} value="Join a room" />

          </div>

        </form>

        <div>
          <p>Or...</p>
          <button onClick={this.newGame}>Start A New Game</button>
        </div>

        <p>Click "Start A New Game" to get a unique room code which you can then
        share with your friends. They can then join your game room.</p>

      </Fragment>
    );
  }
}
