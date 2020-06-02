import React, {Fragment} from 'react';

import {Link} from 'react-router-dom';

export default class Error extends React.Component {
  render() {

    let errorHeading, errorMessage, showTryAgain, showNewGame;

    switch(this.props.type) {

      case "404":
        errorHeading = "404 Not Found";
        errorMessage = "Sorry, we could not find that page.";
        break;

      case "invalid_game":
        errorHeading = "Invalid Game ID";
        errorMessage = "Sorry, we could not find that game ID. Games expire " +
                        process.env.REACT_APP_GAME_EXPIRES_AFTER_DAYS +
                       " days after they are created.";
        showNewGame = true;
        break;

      case "not_a_player":
        errorHeading = "Game In Progress";
        errorMessage = "Sorry, you cannot view or join this game as it is " +
                       "already in progress.";
        showNewGame = true;
        break;

      default:
        errorHeading = "An Error Has Occurred";
        errorMessage = "Sorry, an error occurred whilst loading this page.";
        showTryAgain = true;

    }

    return (
      <main className="error">
        <h2>{errorHeading}</h2>
        <p>
          {errorMessage}
          {showTryAgain &&
            <Fragment>
              {' '}Please <Link to={window.location}>click here</Link> to try again.
            </Fragment>
          }
          {showNewGame &&
            <Fragment>
              {' '}Please <a href="/game">click here</a> to start a new game
              or <Link to="/">return to the homepage</Link> to try a different code.
            </Fragment>
          }
        </p>
      </main>
    );
  }
}
