import React from 'react';

import Error from '../../views/Error.js';

export default class ErrorBoundary extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    //TODO: sendToGa(error.name, error.message);
    return;
  }

  render() {

    if(this.state.hasError) {
      return(
        <Error />
      );
    }

    return this.props.children;

  }
}
