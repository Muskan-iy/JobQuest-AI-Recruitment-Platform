import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./RecruiterMain.css";
import Preloader from "./Preloader";
import logo from "./logo.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Applicants from "./Applicants.png";
import Post from "./Post.png";
import Shortlist from "./Shortlist.png";
import axios from "axios";

const RecruiterMain = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [viewMode, setViewMode] = useState("all");
  const [expandedApplicant, setExpandedApplicant] = useState(null);
  const applicantsSectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 6000);
    
    const sampleApplicants = [
      {
        id: 1,
        name: "Safia Bakhtawar",
        position: "Frontend Developer",
        description: "3+ years experience with React and modern JavaScript",
        details: "Strong portfolio of responsive web applications. Proficient in React hooks, context API, and Redux.",
        status: "New",
        cvUrl: "#",
        appliedDate: "2 days ago",
        skills: ["React", "JavaScript", "HTML/CSS"],
        isShortlisted: false,
        isSaved: false,
      },
      {
        id: 2,
        name: "Yusra Bakhtawar",
        position: "Frontend Developer",
        description: "Specializes in responsive design",
        status: "Reviewed",
        details: "Expert in CSS animations",
        cvUrl: "#",
        appliedDate: "1 day ago",
        skills: ["CSS", "Accessibility"],
        isShortlisted: true,
        isSaved: false,
      },
      {
        id: 3,
        name: "Muskan Iqbal",
        position: "UX Designer",
        description: "User-centered design specialist",
        status: "Interview",
        details: "Designed award-winning interfaces",
        cvUrl: "#",
        appliedDate: "3 days ago",
        skills: ["Figma", "UI/UX"],
        isShortlisted: false,
        isSaved: true,
      },
    ];
    
    setApplicants(sampleApplicants);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
     
      navigate('/');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Logout response:', response.data); // Debug logging
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error.response?.data?.error || error.message);
      alert(`Failed to log out: ${error.response?.data?.error || 'Please try again.'}`);
    }
  };

  const handleViewApplicantsClick = () => {
    applicantsSectionRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setViewMode("all");
  };

  const handleViewShortlisted = () => {
    applicantsSectionRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setViewMode("shortlisted");
  };

  const handleViewCV = (cvUrl) => {
    window.open(cvUrl, '_blank');
  };

  const toggleShortlist = (applicantId) => {
    setApplicants(applicants.map(applicant =>
      applicant.id === applicantId
        ? { ...applicant, isShortlisted: !applicant.isShortlisted }
        : applicant
    ));
  };

  const toggleSaveForLater = (applicantId) => {
    setApplicants(applicants.map(applicant =>
      applicant.id === applicantId
        ? { ...applicant, isSaved: !applicant.isSaved }
        : applicant
    ));
  };

  const toggleApplicantExpansion = (applicantId) => {
    setExpandedApplicant(expandedApplicant === applicantId ? null : applicantId);
  };

  const getStatusClass = (status) => {
    const statusMap = {
      "New": "status-new",
      "Reviewed": "status-reviewed",
      "Interview": "status-interview",
      "Hired": "status-hired",
      "Rejected": "status-rejected",
    };
    return statusMap[status] || "";
  };

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         applicant.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         applicant.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (viewMode === "shortlisted") {
      return matchesSearch && applicant.isShortlisted;
    }
    return matchesSearch;
  });

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
          <Link to="/" className="recruiter-main-menu-item">
            <i className="fas fa-home recruiter-main-fonticon"></i>
            <span>Home</span>
          </Link>
          <button className="recruiter-main-menu-item">
            <i className="fas fa-user recruiter-main-fonticon"></i>
            <span>Profile</span>
          </button>
          <button className="recruiter-main-menu-item">
            <i className="fas fa-file-alt recruiter-main-fonticon"></i>
            <span>Jobs</span>
          </button>
        </nav>
        <div className="recruiter-main-logout-container">
          <button
            className="recruiter-main-menu-item recruiter-main-logout"
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="recruiter-main-content">
        <div className="recruiter-main-header">
          <h1>Welcome, Recruiter</h1>
          <p>Streamline your recruitment process</p>
        </div>
        
        {/* Cards Section */}
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
            <Link to="/Postjob">
              <button className="recruiter-main-btn">Post Now</button>
            </Link>
          </div>
          
          <div className="recruiter-main-card">
            <div className="recruiter-main-icon">
              <img src={Shortlist} alt="Shortlist" className="recruiter-main-shortlist-img" />
            </div>
            <h2>Shortlisted Candidates</h2>
            <p>
              View candidates selected by our AI for further consideration.
            </p>
            <Link to="/Shortlisted">
              <button className="recruiter-main-btn">View Shortlisted</button>
            </Link>
          </div>
          
          <div className="recruiter-main-card">
            <div className="recruiter-main-icon">
              <img src={Applicants} alt="Applicants" className="recruiter-main-applicants-img" />
            </div>
            <h2>Applicants</h2>
            <p>
              Browse all applicants across all positions.
            </p>
            <button
              className="recruiter-main-btn"
              onClick={handleViewApplicantsClick}
            >
              View Applicants
            </button>
          </div>
        </div>

        {/* Applicants Section */}
        <div className="recruiter-applicants-section" ref={applicantsSectionRef}>
          <div className="recruiter-section-header">
            <div className="applicant-header-row">
              <h2>Applicants</h2>
              <div className="recruiter-search-bar">
                <i className="fas fa-search recruiter-search-icon"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applicants..."
                  className="recruiter-search-input"
                />
              </div>
            </div>
            <div className="view-options-row">
              <button
                className={`view-option-btn ${viewMode === "all" ? "active" : ""}`}
                onClick={() => setViewMode("all")}
              >
                View All
              </button>
              <button
                className={`view-option-btn ${viewMode === "shortlisted" ? "active" : ""}`}
                onClick={() => setViewMode("shortlisted")}
              >
                View Shortlisted
              </button>
            </div>
          </div>

          <div className="recruiter-applicant-list-simple">
            {filteredApplicants.map((applicant) => (
              <div
                key={applicant.id}
                className={`recruiter-applicant-item-simple ${expandedApplicant === applicant.id ? 'expanded' : ''}`}
                onClick={() => toggleApplicantExpansion(applicant.id)}
              >
                <div className="applicant-info">
                  <h3>{applicant.name}</h3>
                  <p className="applicant-position">{applicant.position}</p>
                  <p className="applicant-description">{applicant.description}</p>
                  
                  {expandedApplicant === applicant.id && (
                    <div className="applicant-details">
                      <p>{applicant.details}</p>
                      {applicant.skills && (
                        <div className="applicant-skills">
                          {applicant.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      )}
                      <div className="applicant-actions">
                        <button
                          className={`action-btn save-btn ${applicant.isSaved ? 'saved' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveForLater(applicant.id);
                          }}
                        >
                          <i className={`fas ${applicant.isSaved ? 'fa-bookmark' : 'fa-bookmark'}`}></i>
                          {applicant.isSaved ? 'Saved' : 'Save for later'}
                        </button>
                        <button
                          className={`action-btn shortlist-btn ${applicant.isShortlisted ? 'shortlisted' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleShortlist(applicant.id);
                          }}
                        >
                          <i className={`fas ${applicant.isShortlisted ? 'fa-star' : 'fa-star'}`}></i>
                          {applicant.isShortlisted ? 'Shortlisted' : 'Add to shortlist'}
                        </button>
                        <button
                          className="action-btn view-cv-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCV(applicant.cvUrl);
                          }}
                        >
                          <i className="fas fa-file-pdf"></i> View CV
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="applicant-status-simple">
                  <span className={`status-badge ${getStatusClass(applicant.status)}`}>
                    {applicant.status}
                  </span>
                  <span className="application-date">
                    Applied {applicant.appliedDate}
                  </span>
                  {applicant.isShortlisted && (
                    <span className="shortlisted-badge">
                      <i className="fas fa-star"></i> Shortlisted
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="recruiter-footer">
          <div className="recruiter-footer-content">
            <p>© 2024-2025 JobQuest by Safia Bakhtawar, Yusra Bakhtawar, & Muskan Iqbal. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RecruiterMain;