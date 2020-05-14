import React from 'react';

import GameStartForm from '../ui_components/Home/GameStartForm.js';

export default class Home extends React.Component {

  //constructor() {
    // Set player name and ID from localstorage if it's available
  //}

  render() {
    return (
      <main className="home">
        <p>Final Rendezvous is a online espionage game for 2-8 players.
        Can you be the first to find the codeword and rendezvous with Agent X?
        Play here now!</p>

        <GameStartForm />

      </main>
    );
  }
}
