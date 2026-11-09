import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="spinner-wrapper">
    <div className="spinner" />
    <p className="spinner-text">{text}</p>
  </div>
);

export default LoadingSpinner;
