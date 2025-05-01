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
  const [activeJob, setActiveJob] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const jobsSectionRef = useRef(null);
  const searchBarRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("applicant-page-body");
    return () => {
      document.body.classList.remove("applicant-page-body");
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleBrowseClick = () => {
    jobsSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearchClick = () => {
    searchBarRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const toggleJobDetails = (index) => {
    setActiveJob(activeJob === index ? null : index);
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleNotificationsClick = () => {
    // Notification functionality here
    console.log("Notifications clicked");
  };

  if (isLoading) {
    return <Preloader1 />;
  }

  const jobData = [
    { 
      title: "Content Writer", 
      description: "Faika, Content Writer from Karachi applied recently.",
      details: "We're looking for a creative content writer with 2+ years experience in blog writing and SEO optimization."
    },
    { 
      title: "Front-End Developer", 
      description: "Shaista, Senior Front-End Developer from Gilgit applied.",
      details: "Senior position requiring 5+ years experience with React, TypeScript, and modern CSS frameworks."
    },
    { 
      title: "Python Expert", 
      description: "Laiba, a Python Expert from Lahore, applied.",
      details: "Python developer needed for backend services. Django/Flask experience preferred."
    },
    { 
      title: "UX Designer", 
      description: "Adnan, a UX Designer from Islamabad applied.",
      details: "Join our design team to create beautiful, user-centered interfaces. Portfolio required."
    },
    { 
      title: "Java Developer", 
      description: "Ahsan, a Java Developer from Karachi applied.",
      details: "Spring Boot developers needed for enterprise application development."
    },
    { 
      title: "Mechanical Engineer", 
      description: "Ali, a Mechanical Engineer from Lahore applied.",
      details: "Design and analysis position in our automotive division. CAD proficiency required."
    },
    { 
      title: "Project Manager", 
      description: "Sara, a Project Manager from Peshawar applied.",
      details: "PMP certified project manager needed to lead our software development teams."
    },
    { 
      title: "Data Scientist", 
      description: "Hassan, a Data Scientist from Faisalabad applied.",
      details: "Machine learning expert with Python and TensorFlow experience. PhD preferred."
    },
    { 
      title: "Cybersecurity Analyst", 
      description: "Tariq, a Cybersecurity Analyst from Rawalpindi applied.",
      details: "Security operations center position. CISSP certification is a plus."
    },
    { 
      title: "Digital Marketing Specialist", 
      description: "Zara, a Digital Marketer from Karachi applied.",
      details: "Manage our social media presence and digital ad campaigns. Analytics experience required."
    },
  ];

  const filteredJobs = jobData.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedJobs = filteredJobs.slice(
    currentTab === "tab1" ? 0 : 5,
    currentTab === "tab1" ? 5 : 10
  );

  return (
    <div className="applicant-page-container">
      {/* Sidebar */}
      <div className={`applicant-page-sidebar ${isSidebarExpanded ? "expanded" : ""}`}>
        <div className="applicant-page-logo">
          <img src={logo} alt="JobQuest Logo" />
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className={`fas fa-${isSidebarExpanded ? "angle-left" : "angle-right"}`}></i>
          </button>
        </div>
        <nav className="applicant-page-menu">
          <Link to="/view-profile" className="applicant-page-menu-item">
            <i className="fas fa-file applicant-page-fonticon"></i>
            {isSidebarExpanded && <span>Upload CV</span>}
          </Link>
          <Link to="/" className="applicant-page-menu-item">
            <i className="fas fa-house applicant-page-fonticon"></i>
            {isSidebarExpanded && <span>Home</span>}
          </Link>
          <button className="applicant-page-menu-item" onClick={handleNotificationsClick}>
            <i className="fas fa-bell applicant-page-fonticon"></i>
            {isSidebarExpanded && <span>Notifications</span>}
          </button>
          <Link to="/profile" className="applicant-page-menu-item">
            <i className="fas fa-user applicant-page-fonticon"></i>
            {isSidebarExpanded && <span>Profile</span>}
          </Link>
        </nav>
        <div className="applicant-logout-container">
          <button className="applicant-menu-item applicant-main-logout">
            <i className="fas fa-sign-out-alt"></i>
            {isSidebarExpanded && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="applicant-page-main-wrapper">
        {/* Main Content */}
        <div className="applicant-page-main-content">
          <div className="applicant-page-header">
            <h1>Welcome, Applicant!</h1>
            <p className="subtitle">Your dream job is waiting. Let's find it together.</p>
          </div>
          
          <div className="applicant-page-content">
            <div className="applicant-page-card">
              <div className="applicant-page-icon">
                <img src={Browse} alt="Browse Jobs" />
              </div>
              <h2 className="applicant-page-card-title">Browse Jobs</h2>
              <p className="applicant-page-card-description">
                Explore thousands of job opportunities across multiple industries to discover your perfect match.
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
                Find jobs that perfectly match your skills, experience, and preferences with our advanced filters.
              </p>
              <button className="applicant-page-btn" onClick={handleSearchClick}>
                Search Now
              </button>
            </div>
            
            <div className="applicant-page-card">
              <div className="applicant-page-icon">
                <img src={PAT1} alt="Personality Analysis" />
              </div>
              <h2 className="applicant-page-card-title">Career Match</h2>
              <p className="applicant-page-card-description">
                Take our personality analysis test to discover jobs that align with your strengths and personality.
              </p>
              <Link to="/JobCandidateQuestionnaire">
                <button className="applicant-page-btn">Take Assessment</button>
              </Link>
            </div>
          </div>

          {/* Jobs Section with Search Bar */}
          <div className="applicant-page-jobs-section" ref={jobsSectionRef}>
            <div className="section-header">
              <h2>Available Jobs</h2>
              <div className="applicant-page-search-bar" ref={searchBarRef}>
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs, locations, companies..."
                  className="applicant-page-search-input"
                />
                {searchQuery && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchQuery("")}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
            
            <div className="applicant-page-job-list">
              {paginatedJobs.map((job, index) => (
                <div 
                  key={index} 
                  className={`applicant-page-job-item ${activeJob === index ? 'expanded' : ''}`}
                  onClick={() => toggleJobDetails(index)}
                >
                  <div className="job-avatar-container">
                    <div className="applicant-page-job-avatar">
                      {job.title.charAt(0)}
                    </div>
                    {isSidebarExpanded && (
                      <div className="job-meta">
                        <span className="job-location">
                          <i className="fas fa-map-marker-alt"></i> {job.description.split('from ')[1].replace(' applied', '').replace(' applied recently', '')}
                        </span>
                        <span className="job-applicants">
                          <i className="fas fa-users"></i> {Math.floor(Math.random() * 50) + 1} applicants
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="applicant-page-job-content">
                    <h3>{job.title}</h3>
                    <p className="job-description">{job.description}</p>
                    {activeJob === index && (
                      <div className="job-details">
                        <p>{job.details}</p>
                        <div className="job-actions">
                          <button className="applicant-page-btn apply-btn">
                            Apply Now
                          </button>
                          <button className="applicant-page-btn save-btn">
                            Save for Later
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="applicant-page-job-favorite">
                    <i className="far fa-star"></i>
                  </div>
                </div>
              ))}
            </div>

            {filteredJobs.length > 5 && (
              <div className="applicant-page-tabs">
                <button
                  className={`applicant-page-tab-button ${currentTab === "tab1" ? "active" : ""}`}
                  onClick={() => setCurrentTab("tab1")}
                  disabled={currentTab === "tab1"}
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
                <button
                  className={`applicant-page-tab-button ${currentTab === "tab2" ? "active" : ""}`}
                  onClick={() => setCurrentTab("tab2")}
                  disabled={currentTab === "tab2"}
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
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