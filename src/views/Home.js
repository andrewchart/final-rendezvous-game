import React from 'react';

export default class Home extends React.Component {
  render() {
    return (
      <main className="home">
        <p>Final Rendezvous is a online espionage game for 2-8 players.
        Can you be the first to find the codeword and rendezvous with Agent X?
        Play here now!</p>

        <div>
          <label>
            Your Name:
            <input />
          </label>
        </div>

        <div>
          <label>
            Have a room code?
            <input type="text" />
          </label>

          <button>Join a room</button>

        </div>

        <div>
        <p>Or...</p>
          <button>Start A New Game</button>
        </div>

        <p>Click "Start A New Game" to get a unique room code which you can then
        share with your friends. They can then join the same room.</p>

      </main>
    );
  }
}
