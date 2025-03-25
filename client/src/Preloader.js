import React, { useState, useEffect } from "react";
import "./Preloader.css";
import discuss10Img from "./assets/discuss10.jpg"; // Import static image

const Preloader = ({ onLoadComplete }) => {
  const [showContent, setShowContent] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show content after 2 seconds
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 2000);

    // Remove preloader after 6 seconds
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
      if (onLoadComplete) {
        onLoadComplete(); // Notify parent component
      }
    }, 6000);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(fadeOutTimer);
    };
  }, [onLoadComplete]);

  return (
    <div className={`preloader1 ${fadeOut ? "fade-out" : ""}`}>
      <div
        className="background-overlay"
        style={{ backgroundImage: `url(${discuss10Img})` }}
      ></div>
      {showContent && (
        <div className="content">
          <h1>Welcome to JobQuest Recruiter</h1>
          <p>Streamlining Recruitment, One Click at a Time</p>
        </div>
      )}
    </div>
  );
};

export default Preloader;
