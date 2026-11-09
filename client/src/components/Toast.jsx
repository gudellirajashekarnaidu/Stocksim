import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = type === 'success' ? '✅' : '❌';

  return (
    <div className={`toast toast-${type}`}>
      <span>{icon}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: 'auto', fontSize: '1rem' }}
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
