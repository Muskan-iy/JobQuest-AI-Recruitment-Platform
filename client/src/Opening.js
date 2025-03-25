import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Opening.css';

const Opening = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showFeatureSection, setShowFeatureSection] = useState(false);

  const togglePopup = () => setShowPopup((prev) => !prev);

  // Function to handle scroll event
  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const featureSectionOffset = document.querySelector('.feature-section').offsetTop;

    // Show feature section when user scrolls down to its position
    if (scrollPosition >= featureSectionOffset - window.innerHeight / 2) {
      setShowFeatureSection(true);
    } else {
      setShowFeatureSection(false);
    }
  };

  // Add scroll event listener on component mount
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="opening-container">
      {/* Video Background */}
      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src="/assets/opening.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1>Welcome to JobQuest</h1>
        <p className="subheading">
          Recruiters, meet your ideal candidate. <br />
          Applicants, discover the role you’ve been waiting for.
        </p>
        <div className="cta-buttons">
          <Link to="/login" state={{ userType: 'applicant' }}>
            <button className="cta-button">I am an Applicant</button>
          </Link>
          <Link to="/login" state={{ userType: 'recruiter' }}>
            <button className="cta-button">I am a Recruiter</button>
          </Link>
        </div>
      </div>

      {/* Feature Section */}
      <div className={`feature-section ${showFeatureSection ? 'visible' : ''}`}>
        <h2>Why Choose JobQuest?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <i className="fas fa-search"></i>
            <h3>Advanced Search</h3>
            <p>Find the perfect job or candidate with our powerful search tools.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-bell"></i>
            <h3>Real-Time Notifications</h3>
            <p>Stay updated with instant alerts for applications and messages.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-shield-alt"></i>
            <h3>Secure & Reliable</h3>
            <p>Your data is safe with our advanced security measures.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2024-2025 JobQuest by Safia Bakhtawar, Yusra Bakhtawar, & Muskan Iqbal. All rights reserved.</p>
          <div className="social-links">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
          </div>
          <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <i className="fas fa-arrow-up"></i>
          </button>
        </div>
      </footer>

      {/* Chatbot Icon */}
      <div className="chatbot-icon" onClick={togglePopup}>
        <i className="fas fa-robot"></i>
      </div>

      {/* Pop-up Message */}
      {showPopup && (
        <div className="popup-message">
          <h3>Welcome to JobQuest!</h3>
          <p>
            <strong>Applicants:</strong> Discover and apply for jobs that match your skills and aspirations.
          </p>
          <p>
            <strong>Recruiters:</strong> Find and connect with the best candidates for your job openings.
          </p>
          <button onClick={togglePopup} className="popup-close-button">Close</button>
        </div>
      )}
    </div>
  );
};

export default Opening;