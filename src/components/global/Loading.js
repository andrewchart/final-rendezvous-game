import React from 'react';

export default function Loading() {
  return (
    <div className="loading-area">
      <span className="loading-area-title">Final Rendezvous</span>
      <div className="spinner"></div>
      <span>Loading...</span>
    </div>
  );
}
