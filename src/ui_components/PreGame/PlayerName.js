import React from 'react';

export default function PlayerName(props) {

  const thatsYou = props.thatsYou ? " (That's You!) " : null;
  const leave = props.thatsYou ? <button>Leave Game</button> : null;

  return (
    <li>
      {props.name}
      {thatsYou}
      {leave}
    </li>);
}
