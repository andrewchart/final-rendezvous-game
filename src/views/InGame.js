import React from 'react';

import {connect} from 'react-redux';

import WorldMap from '../ui_components/InGame/WorldMap.js';

class InGame extends React.Component {


  render() {
    return (
      <section className="inGame">
        <WorldMap />
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
