import React from 'react';

export default class Home extends React.Component {
  render() {
    return (
      <main className="home">
        <h1>{process.env.REACT_APP_NAME_EN}</h1>
      </main>
    );
  }
}
