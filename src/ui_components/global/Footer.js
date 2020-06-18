import React from 'react';

export default class Footer extends React.Component {
  render() {
    return (
      <footer>
        <p>
          Created by <a href="https://twitter.com/@andrewchart" target="_blank"
          rel="noopener noreferrer">@AndrewChart</a>.

          Licensed under a <a href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank" rel="noopener noreferrer license">Creative Commons
          Attribution 4.0 International License</a>.
        </p>
        <nav>
          <a href="https://www.andrewchart.co.uk/" target="_blank" rel="noopener noreferrer">Blog</a>
          <a href="https://github.com/andrewchart/final-rendezvous-game" target="_blank" rel="noopener noreferrer">Github</a>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer">Developers</a>
        </nav>
      </footer>
    );
  }
}
