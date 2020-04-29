import React from 'react';

export function AddPlayer(props) {

  return(
    <button onClick={props.onClick}>Add Player</button>
  );

}

export function StartGame(props) {

  return(
    <button onClick={props.onClick}>Start Game</button>
  );

}
