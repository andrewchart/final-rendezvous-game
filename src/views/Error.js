import React, {Fragment} from 'react';

export default class Error extends React.Component {
  render() {

    let errorHeading, errorMessage, showTryAgain;

    switch(this.props.type) {

      case "404":
        errorHeading = "404 Not Found";
        errorMessage = "Sorry, we could not find that page.";
        showTryAgain = false;
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
              {' '}Please <a href={window.location}>click here</a> to try again.
            </Fragment>
          }
        </p>
      </main>
    );
  }
}
