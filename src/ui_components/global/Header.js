import React from 'react';

import {Link} from 'react-router-dom';

export default class Header extends React.Component {
  render() {
    return (
      <header>
        <h1><Link to="/">Final Rendezvous</Link></h1>
        <nav>
          <Link to="/game">New Game</Link>
          <Link to="/how-to-play">How To Play</Link>
          <Link to="/about">About The Game</Link>
        </nav>
      </header>
    );
  }
}
