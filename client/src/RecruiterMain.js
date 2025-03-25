import React, { useState, useEffect } from "react";
import "./RecruiterMain.css" // Import unique styles for Recruiter page
import Preloader from "./Preloader"; // Import preloader
import logo from "./logo.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Applicants from "./Applicants.png";
import Post from "./Post.png";
import Shortlist from "./Shortlist.png";

const RecruiterMain = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 6 seconds (similar to the Applicant page)
    const timer = setTimeout(() => setIsLoading(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <div className="recruiter-main-page">
      {/* Sidebar */}
      <div className="recruiter-main-sidebar">
        <div className="recruiter-main-logo">
          <img src={logo} alt="JobQuest Logo" className="recruiter-main-logo-img" />
        </div>
        <nav className="recruiter-main-menu">
          <button className="recruiter-main-menu-item">
            <i className="fas fa-user recruiter-main-fonticon"></i>
          </button>
          <button className="recruiter-main-menu-item">
            <i className="fas fa-house recruiter-main-fonticon"></i>
          </button>
          <button className="recruiter-main-menu-item">
            <i className="fas fa-bell recruiter-main-fonticon"></i>
          </button>
          <button className="recruiter-main-menu-item">
            <i className="fas fa-file recruiter-main-fonticon"></i>
          </button>
        </nav>
        <div className="recruiter-main-logout-container">
          <button className="recruiter-main-menu-item recruiter-main-logout">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="recruiter-main-content">
        <div className="recruiter-main-header">
          <h1>RECRUITER</h1>
          <p>Streamline your recruitment process</p>
        </div>
        <div className="recruiter-main-cards">
          <div className="recruiter-main-card">
            <div className="recruiter-main-icon">
              <img src={Post} alt="Post" className="recruiter-main-post-img" />
            </div>
            <h2>Post Jobs</h2>
            <p>
              Easily create and publish job listings to attract top talent
              for your organization.
            </p>
            <button className="recruiter-main-btn">Post Now</button>
          </div>
          <div className="recruiter-main-card">
            <div className="recruiter-main-icon">
              <img src={Shortlist} alt="Shortlist" className="recruiter-main-shortlist-img" />
            </div>
            <h2>Shortlisted Candidates</h2>
            <p>
              Efficiently manage and evaluate applicants to find the best
              fit for your team.
            </p>
            <button className="recruiter-main-btn">View Now</button>
          </div>
          <div className="recruiter-main-card">
            <div className="recruiter-main-icon">
              <img src={Applicants} alt="Applicants" className="recruiter-main-applicants-img" />
            </div>
            <h2>Applicants</h2>
            <p>
              Effortlessly explore the full list of talented applicants for
              this position.
            </p>
            <button className="recruiter-main-btn">View Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterMain;