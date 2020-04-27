import React from 'react';

export default class Game extends React.Component {

  render() {
    return <main className="game">Game {this.props.match.params.id}</main>;
  }
}
