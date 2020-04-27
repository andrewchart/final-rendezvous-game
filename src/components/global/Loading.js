import React from 'react';

export default function Loading() {
  return (
    <div className="loading-area">
      <span className="loading-area-title">{process.env.REACT_APP_NAME_EN}</span>
      <div className="spinner"></div>
      <span>Loading...</span>
    </div>
  );
}
