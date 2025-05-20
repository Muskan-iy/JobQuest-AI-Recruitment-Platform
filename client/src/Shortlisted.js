import React, { useState, useEffect } from "react";
import "./Shortlisted.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Shortlisted = () => {
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedApplicant, setExpandedApplicant] = useState(null);

  useEffect(() => {
    // Sample data
    const sampleJobs = [
      {
        id: 1,
        title: "Frontend Developer (React)",
        postedDate: "May 15, 2023",
        applicants: [
          {
            id: 101,
            name: "Safia Bakhtawar",
            avatar: "SB",
            experience: "4 years",
            status: "AI Recommended",
            shortlistedDate: "2 days ago",
            skills: ["React", "TypeScript", "Redux"],
            matchScore: 92,
            details: "Built 10+ production React applications. Strong expertise in state management.",
            cvUrl: "#"
          },
          {
            id: 102,
            name: "Yusra Bakhtawar",
            avatar: "YB",
            experience: "3 years",
            status: "Manually Shortlisted",
            shortlistedDate: "1 day ago",
            skills: ["CSS", "Accessibility", "Design Systems"],
            matchScore: 88,
            details: "UI specialist with excellent design sensibilities.",
            cvUrl: "#"
          }
        ],
        allApplicantsUrl: "#"
      },
      {
        id: 2,
        title: "Backend Node.js Engineer",
        postedDate: "May 10, 2023",
        applicants: [
          {
            id: 201,
            name: "Muskan Iqbal",
            avatar: "MI",
            experience: "5 years",
            status: "AI Recommended",
            shortlistedDate: "3 days ago",
            skills: ["Node.js", "Express", "MongoDB"],
            matchScore: 95,
            details: "Architected scalable backend systems for high-traffic applications.",
            cvUrl: "#"
          }
        ],
        allApplicantsUrl: "#"
      }
    ];
    setJobs(sampleJobs);
  }, []);

  const handleViewCV = (cvUrl) => {
    window.open(cvUrl, '_blank');
  };

  const handleRemoveApplicant = (jobId, applicantId) => {
    setJobs(jobs.map(job => 
      job.id === jobId 
        ? { ...job, applicants: job.applicants.filter(a => a.id !== applicantId) } 
        : job
    ).filter(job => job.applicants.length > 0));
  };

  const handleViewAllApplicants = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="shortlisted-container">
      <div className="content-wrapper">
        <header className="shortlisted-header">
          <h1>Shortlisted Candidates</h1>
          <p>Review candidates shortlisted by AI and your team</p>
        </header>

        <div className="job-tabs">
          {jobs.map((job, index) => (
            <button
              key={job.id}
              className={`job-tab ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {job.title}
              <span className="applicant-count">{job.applicants.length}</span>
            </button>
          ))}
        </div>

        {jobs.length > 0 && (
          <div className="job-details">
            <div className="job-info">
              <div>
                <h2>{jobs[activeTab].title}</h2>
                <span className="posted-date">Posted: {jobs[activeTab].postedDate}</span>
              </div>
              <button 
                className="view-all-btn"
                onClick={() => handleViewAllApplicants(jobs[activeTab].allApplicantsUrl)}
              >
                <i className="fas fa-users"></i> View All Applicants
              </button>
            </div>

            <div className="applicants-list">
              {jobs[activeTab].applicants.map(applicant => (
                <div 
                  key={applicant.id} 
                  className={`applicant-card ${expandedApplicant === applicant.id ? 'expanded' : ''}`}
                  onClick={() => setExpandedApplicant(expandedApplicant === applicant.id ? null : applicant.id)}
                >
                  <div className="applicant-summary">
                    <div className="applicant-avatar">
                      {applicant.avatar}
                    </div>
                    <div className="applicant-main-info">
                      <h3>{applicant.name}</h3>
                      <div className="applicant-meta">
                        <span className="experience">{applicant.experience} experience</span>
                        <span className={`status ${applicant.status.includes('AI') ? 'ai' : 'manual'}`}>
                          {applicant.status}
                        </span>
                        <span className="match-score">
                          <span className="score-bar" style={{ width: `${applicant.matchScore}%` }}></span>
                          {applicant.matchScore}% match
                        </span>
                      </div>
                    </div>
                    <div className="applicant-skills">
                      {applicant.skills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {expandedApplicant === applicant.id && (
                    <div className="applicant-details">
                      <p className="applicant-bio">{applicant.details}</p>
                      <div className="applicant-actions">
                        <button 
                          className="action-btn view-cv-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCV(applicant.cvUrl);
                          }}
                        >
                          <i className="fas fa-file-pdf"></i> View CV
                        </button>
                        <button 
                          className="action-btn save-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="fas fa-bookmark"></i> Save for Later
                        </button>
                        <button 
                          className="action-btn remove-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveApplicant(jobs[activeTab].id, applicant.id);
                          }}
                        >
                          <i className="fas fa-times"></i> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="shortlisted-footer">
        <div className="shortlisted-footer-content">
          <p>© 2024-2025 JobQuest by Safia Bakhtawar, Yusra Bakhtawar, & Muskan Iqbal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Shortlisted;