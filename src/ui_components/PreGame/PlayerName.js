import React from 'react';

export default function PlayerName(props) {

  const removePlayer = () => props.removePlayer(props.player._id);

  const thatsYou = props.thatsYou ? " (That's You!) " : null;
  const leave = props.thatsYou ? <button onClick={removePlayer}>Leave Game</button> : null;

  return (
    <li>
      {props.player.name}
      {thatsYou}
      {leave}
    </li>
  );
}
