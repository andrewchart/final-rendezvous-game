import React, {Fragment} from 'react';

import {Redirect} from 'react-router-dom';

import ValidationError from '../global/ValidationError.js';

export default class GameStartForm extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      playerName: '',
      gameId: '',
      redirectLink: '',
      validationErrors: []
    }

    // Bind `this`
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.joinRoom = this.joinRoom.bind(this);
    this.newGame = this.newGame.bind(this);

    this.validateAll = this.validateAll.bind(this);
    this.validateName = this.validateName.bind(this);
  }

  /**
   * Monitors changes to the form, writing them to state.
   * @param  {SyntheticEvent} event React synthetic event.
   */
  onChange(event) {
    let name = event.target.name;
    let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.setState({ [name]: value });
  }

  /**
   * Handles standard submission of the form e.g. by pressing enter when a form
   * field is in focus.
   * @param  {SyntheticEvent} event React synthetic event.
   * @return {boolean} Returns true on success or false on failure.
   */
  onSubmit(event) {

    event.preventDefault();

    this.validateAll();

    // Follow the new game path if the user has not provided a room ID.
    // Otherwise attempt to join the room they have specified.
    if(!this.state.gameId) {
      return this.newGame();
    } else {
      return this.joinRoom();
    }

  }

  /**
   * Attempts to forward the user onto the room they have specified.
   * @return {Boolean} Returns true on success or false on failure.
   */
  joinRoom() {

    if(!this.validateAll()) return false;

    this.setState(state => ({
      redirectLink: "/game/" + this.state.gameId.toUpperCase()
    }));

    return true;

  }

  /**
   * Forwards the user to the game UI with no game ID set, which will initiate a
   * new game.
   * @return {Boolean} Returns true on success or false on failure.
   */
  newGame() {

    if(!this.validateAll()) return false;

    this.setState(state => ({
      redirectLink: "/game"
    }));

    return true;
  }

  /**
   * Parent function to validate all form fields and gather validation errors.
   * @return {Boolean} Returns true if there are no errors, false otherwise.
   */
  validateAll() {
    const errors = [];

    if(!this.validateName()) errors.push("Please provide a name for your player.");

    if(errors.length > 0) {
      this.setState({ validationErrors: errors });
      return false;
    }

    return true;
  }

  /**
   * Validates the player name field.
   * @return {Boolean} Returns true if the field contains a non-empty value.
   */
  validateName() {
    return (this.state.playerName.length > 0);
  }


  render() {

    // Handle the redirect to start the game
    if(this.state.redirectLink) {
      return (
        <Redirect push to={{
          pathname: this.state.redirectLink,
          state: { playerName: this.state.playerName }
        }} />
      );
    }

    // Prepare form validation error messages.
    const validationErrors = this.state.validationErrors.map((message, index) => {
      return <ValidationError message={message} key={index} />;
    });

    // Show the UI that allows users to join the game.
    return (
      <Fragment>

        <form name="gameStartForm" id="gameStartForm" onSubmit={this.onSubmit}>

          {validationErrors}

          <div>
            <label htmlFor="playerName">
              Your Name:
              <input type="text" name="playerName" id="playerName" onChange={this.onChange} value={this.state.playerName} />
            </label>
          </div>

          <div>
            <label htmlFor="gameId">
              Have a room code?
              <input type="text" name="gameId" id="gameId" onChange={this.onChange} value={this.state.gameId} />
            </label>

            <input type="submit" onClick={this.joinRoom} value="Join a room" />

          </div>

          <div>
            <p>Or...</p>
            <input type="button" onClick={this.newGame} value="Start A New Game" />
          </div>
        </form>

        <p>Click "Start A New Game" to get a unique room code which you can then
        share with your friends. They can then join your game room.</p>

      </Fragment>
    );
  }
}
