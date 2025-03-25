import React from 'react';
import './Popup.css';

const Popup = ({ tipOfTheDay, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>Tip of the Day</h2>
        <p>{tipOfTheDay}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Popup;
