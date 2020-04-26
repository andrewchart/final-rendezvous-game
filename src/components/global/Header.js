import React from 'react';

import {Link} from 'react-router-dom';

export default class Header extends React.Component {
  render() {
    return (
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/play">Play</Link>
        </nav>
      </header>
    );
  }
}
