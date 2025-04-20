import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Applicant.css";
import logo from "./logo.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import PAT1 from "./PAT1.png";
import Browse from "./Browse.png";
import SF from "./SF.png";
import Preloader1 from "./Preloader1";

const Applicant = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("tab1");
  const [searchQuery, setSearchQuery] = useState("");

  const jobsSectionRef = useRef(null);
  const searchBarRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("applicant-page-body");
    return () => {
      document.body.classList.remove("applicant-page-body");
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleBrowseClick = () => {
    jobsSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearchClick = () => {
    searchBarRef.current.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return <Preloader1 />;
  }

  return (
    <div className="applicant-page-container">
      {/* Sidebar */}
      <div className="applicant-page-sidebar">
        <div className="applicant-page-logo">
          <img src={logo} alt="JobQuest Logo" />
        </div>
        <nav className="applicant-page-menu">
          <Link to="#" className="applicant-page-menu-item">
            <i className="fas fa-user applicant-page-fonticon"></i>
            <span>Profile</span>
          </Link>
          <Link to="/" className="applicant-page-menu-item">
            <i className="fas fa-house applicant-page-fonticon"></i>
            <span>Home</span>
          </Link>
          <Link to="#" className="applicant-page-menu-item">
            <i className="fas fa-bell applicant-page-fonticon"></i>
            <span>Notifications</span>
          </Link>
          <Link to="#" className="applicant-page-menu-item">
            <i className="fas fa-file applicant-page-fonticon"></i>
            <span>Documents</span>
          </Link>
        </nav>
        <div className="applicant-logout-container">
          <button className="applicant-menu-item recruiter-main-logout">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="applicant-page-main-wrapper">
        {/* Main Content */}
        <div className="applicant-page-main-content">
          <div className="applicant-page-header">
            <h1>Applicant, your journey begins here.</h1>
            <p>Let's make it memorable.</p>
          </div>
          <div className="applicant-page-content">
            <div className="applicant-page-card">
              <div className="applicant-page-icon">
                <img src={Browse} alt="Browse Jobs" />
              </div>
              <h2 className="applicant-page-card-title">Browse Jobs</h2>
              <p className="applicant-page-card-description">
                Explore job opportunities in multiple industries to discover your dream job.
              </p>
              <button className="applicant-page-btn" onClick={handleBrowseClick}>
                Start Browsing
              </button>
            </div>
            <div className="applicant-page-card">
              <div className="applicant-page-icon">
                <img src={SF} alt="Search and Filter" />
              </div>
              <h2 className="applicant-page-card-title">Search and Filter</h2>
              <p className="applicant-page-card-description">
                Find jobs that match your skills and qualifications using our advanced filters.
              </p>
              <button className="applicant-page-btn" onClick={handleSearchClick}>
                Search Now
              </button>
            </div>
            <div className="applicant-page-card">
              <div className="applicant-page-icon">
                <img src={PAT1} alt="Personality Analysis" />
              </div>
              <h2 className="applicant-page-card-title">Personality Analysis</h2>
              <p className="applicant-page-card-description">
                Take our personality analysis test to match your traits.
              </p>
              <Link to="/JobCandidateQuestionnaire">
                <button className="applicant-page-btn">Take Now</button>
              </Link>
            </div>
          </div>

          {/* Jobs Section with Search Bar */}
          <div className="applicant-page-jobs-section" ref={jobsSectionRef}>
            <h2>Available Jobs</h2>
            <div className="applicant-page-search-bar" ref={searchBarRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a job..."
                className="applicant-page-search-input"
              />
            </div>
            <div className="applicant-page-job-list">
              {[
                { title: "Content Writer", description: "Faika, Content Writer from Karachi applied recently." },
                { title: "Front-End Developer", description: "Shaista, Senior Front-End Developer from Gilgit applied." },
                { title: "Python Expert", description: "Laiba, a Python Expert from Lahore, applied." },
                { title: "UX Designer", description: "Adnan, a UX Designer from Islamabad applied." },
                { title: "Java Developer", description: "Ahsan, a Java Developer from Karachi applied." },
                { title: "Mechanical Engineer", description: "Ali, a Mechanical Engineer from Lahore applied." },
                { title: "Project Manager", description: "Sara, a Project Manager from Peshawar applied." },
                { title: "Data Scientist", description: "Hassan, a Data Scientist from Faisalabad applied." },
                { title: "Cybersecurity Analyst", description: "Tariq, a Cybersecurity Analyst from Rawalpindi applied." },
                { title: "Digital Marketing Specialist", description: "Zara, a Digital Marketer from Karachi applied." },
              ]
                .filter((job) =>
                  job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  job.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .slice(currentTab === "tab1" ? 0 : 5, currentTab === "tab1" ? 5 : 10)
                .map((job, index) => (
                  <div key={index} className="applicant-page-job-item">
                    <div className="applicant-page-job-avatar">📋</div>
                    <div className="applicant-page-job-content">
                      <h3>{job.title}</h3>
                      <p>{job.description}</p>
                      <button className="applicant-page-btn applicant-page-learn-more">Learn More</button>
                    </div>
                    <div className="applicant-page-job-favorite">⭐</div>
                  </div>
                ))}
            </div>

            {/* Tab Buttons */}
            <div className="applicant-page-tabs">
              <button
                className={`applicant-page-tab-button ${currentTab === "tab1" ? "active" : ""}`}
                onClick={() => setCurrentTab("tab1")}
              >
                Page 1
              </button>
              <button
                className={`applicant-page-tab-button ${currentTab === "tab2" ? "active" : ""}`}
                onClick={() => setCurrentTab("tab2")}
              >
                Page 2
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="applicant-footer">
          <div className="applicant-footer-content">
            <p>© 2024-2025 JobQuest by Safia Bakhtawar, Yusra Bakhtawar, & Muskan Iqbal. All rights reserved.</p>
                </div>
                </footer>
      </div>
    </div>
  );
};

export default Applicant;