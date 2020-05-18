import React from 'react';

export default function ValidationError(props) {
  return <p className="error validationError">{props.message}</p>;
}
