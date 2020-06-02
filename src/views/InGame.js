import React from 'react';

import {connect} from 'react-redux';

class InGame extends React.Component {





  render() {
    return (
      <section className="preGame">
        <h3>In the game</h3>
      </section>
    );
  }


}

// Redux Store Data
const mapStateToProps = (state) => {
  return {
    gameData: state.gameData,
    loading: state.gameShell.loading,
    localPlayer: state.localPlayer,
    lastUpdateFromServer: state.lastUpdateFromServer
  }
}

export default connect(
  mapStateToProps
)(InGame);
