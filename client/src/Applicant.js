import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "./Applicant.css";
import logo from "./logo.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import PAT1 from "./PAT1.png";
import Browse from "./Browse.png";
import SF from "./SF.png";
import Preloader1 from "./Preloader1";
import { uploadCV } from "./api";

const Applicant = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("tab1");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeJob, setActiveJob] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [cvFile, setCvFile] = useState(null);

  const jobsSectionRef = useRef(null);
  const searchBarRef = useRef(null);
  const navigate = useNavigate();

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

  const toggleJobDetails = (index) => {
    setActiveJob(activeJob === index ? null : index);
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleNotificationsClick = () => {
    console.log("Notifications clicked");
  };

  const handleTakeTest = (jobId, e) => {
    e.stopPropagation();
    navigate(`/technical-test/${jobId}`);
  };

  const handleUpload = async () => {
    if (!cvFile) return;
    
    const formData = new FormData();
    formData.append('cv', cvFile);
    formData.append('name', localStorage.getItem('userName'));

    try {
      await uploadCV(formData);
      alert('CV uploaded successfully!');
    } catch (error) {
      console.error('Error uploading CV:', error);
    }
  };

  if (isLoading) {
    return <Preloader1 />;
  }

  const jobData = [
  { 
    id: 1,
    title: "Content Writer", 
    company: "Creative Content Solutions",
    workplaceType: "Remote",
    location: "Karachi, Pakistan",
    jobType: "Full-time",
    description: "We're looking for a creative content writer with 2+ years experience in blog writing and SEO optimization.",
    responsibilities: [
      "Create engaging content for blogs, websites, and social media",
      "Conduct research on industry-related topics",
      "Optimize content for search engines",
      "Proofread and edit content before publication"
    ],
    qualifications: [
      "Bachelor's degree in English, Journalism, or related field",
      "2+ years of professional writing experience",
      "Portfolio of published articles"
    ],
    skills: ["SEO writing", "Content management", "Research", "Grammar"],
    deadline: "2023-12-15",
    postedBy: "Faika",
    postedTime: "recently",
    hasTechnicalTest: true
  },
  { 
    id: 2,
    title: "Front-End Developer", 
    company: "Tech Innovations Inc.",
    workplaceType: "Hybrid",
    location: "Gilgit, Pakistan",
    jobType: "Full-time",
    description: "Senior position requiring 5+ years experience with React, TypeScript, and modern CSS frameworks.",
    responsibilities: [
      "Develop responsive user interfaces",
      "Implement state management solutions",
      "Collaborate with UX designers",
      "Optimize application performance"
    ],
    qualifications: [
      "5+ years of frontend development experience",
      "Proficiency in React and TypeScript",
      "Experience with CSS preprocessors"
    ],
    skills: ["React", "TypeScript", "CSS/SASS", "Redux"],
    deadline: "2023-11-30",
    postedBy: "Shaista",
    postedTime: "2 days ago",
    hasTechnicalTest: true
  },
  { 
    id: 3,
    title: "Data Scientist", 
    company: "Analytics Pro",
    workplaceType: "On-site",
    location: "Islamabad, Pakistan",
    jobType: "Full-time",
    description: "Looking for a data scientist to build predictive models and analyze large datasets to drive business decisions.",
    responsibilities: [
      "Develop machine learning models",
      "Clean and analyze large datasets",
      "Create data visualizations",
      "Collaborate with business teams"
    ],
    qualifications: [
      "Master's degree in Computer Science, Statistics, or related field",
      "3+ years experience in data science",
      "Proficiency in Python and SQL"
    ],
    skills: ["Python", "Machine Learning", "SQL", "Pandas", "TensorFlow"],
    deadline: "2023-12-10",
    postedBy: "Ali",
    postedTime: "1 week ago",
    hasTechnicalTest: true
  },
  { 
    id: 4,
    title: "UX/UI Designer", 
    company: "Digital Creations",
    workplaceType: "Remote",
    location: "Lahore, Pakistan",
    jobType: "Contract",
    description: "Seeking a talented UX/UI designer to create beautiful and functional interfaces for our clients.",
    responsibilities: [
      "Create wireframes and prototypes",
      "Conduct user research",
      "Design user interfaces",
      "Collaborate with developers"
    ],
    qualifications: [
      "Bachelor's degree in Design or related field",
      "2+ years of UX/UI experience",
      "Portfolio showcasing design work"
    ],
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
    deadline: "2023-12-05",
    postedBy: "Sana",
    postedTime: "3 days ago",
    hasTechnicalTest: false
  },
  { 
    id: 5,
    title: "DevOps Engineer", 
    company: "Cloud Systems",
    workplaceType: "Hybrid",
    location: "Karachi, Pakistan",
    jobType: "Full-time",
    description: "Looking for a DevOps engineer to automate and optimize our infrastructure and deployment pipelines.",
    responsibilities: [
      "Manage cloud infrastructure",
      "Automate deployment processes",
      "Monitor system performance",
      "Implement CI/CD pipelines"
    ],
    qualifications: [
      "3+ years of DevOps experience",
      "Experience with AWS or Azure",
      "Knowledge of containerization technologies"
    ],
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
    deadline: "2023-12-20",
    postedBy: "Ahmed",
    postedTime: "5 days ago",
    hasTechnicalTest: true
  },
  { 
    id: 6,
    title: "Marketing Manager", 
    company: "Growth Marketing Agency",
    workplaceType: "On-site",
    location: "Lahore, Pakistan",
    jobType: "Full-time",
    description: "Seeking an experienced marketing manager to lead our digital marketing campaigns and strategies.",
    responsibilities: [
      "Develop marketing strategies",
      "Manage social media campaigns",
      "Analyze campaign performance",
      "Lead marketing team"
    ],
    qualifications: [
      "Bachelor's degree in Marketing or related field",
      "5+ years marketing experience",
      "Proven track record of successful campaigns"
    ],
    skills: ["Digital Marketing", "Social Media", "SEO", "Analytics"],
    deadline: "2023-12-01",
    postedBy: "Fatima",
    postedTime: "1 day ago",
    hasTechnicalTest: false
  },
  { 
    id: 7,
    title: "Backend Developer (Node.js)", 
    company: "Web Solutions Ltd",
    workplaceType: "Remote",
    location: "Pakistan",
    jobType: "Full-time",
    description: "Looking for a skilled Node.js developer to build and maintain our backend services and APIs.",
    responsibilities: [
      "Develop and maintain APIs",
      "Optimize database queries",
      "Implement security best practices",
      "Write unit and integration tests"
    ],
    qualifications: [
      "3+ years Node.js experience",
      "Experience with databases (SQL/NoSQL)",
      "Understanding of RESTful APIs"
    ],
    skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "REST APIs"],
    deadline: "2023-12-25",
    postedBy: "Bilal",
    postedTime: "2 weeks ago",
    hasTechnicalTest: true
  },
  { 
    id: 8,
    title: "HR Specialist", 
    company: "People First Inc.",
    workplaceType: "Hybrid",
    location: "Islamabad, Pakistan",
    jobType: "Part-time",
    description: "Looking for an HR specialist to manage recruitment, employee relations, and HR operations.",
    responsibilities: [
      "Manage recruitment process",
      "Handle employee relations",
      "Administer benefits programs",
      "Maintain HR records"
    ],
    qualifications: [
      "Bachelor's degree in HR or related field",
      "2+ years HR experience",
      "Knowledge of labor laws"
    ],
    skills: ["Recruitment", "Employee Relations", "HR Policies", "Communication"],
    deadline: "2023-12-08",
    postedBy: "Zainab",
    postedTime: "4 days ago",
    hasTechnicalTest: false
  },
  { 
    id: 9,
    title: "Mobile App Developer (Flutter)", 
    company: "App Innovators",
    workplaceType: "Remote",
    location: "Pakistan",
    jobType: "Full-time",
    description: "Seeking a Flutter developer to build cross-platform mobile applications for our clients.",
    responsibilities: [
      "Develop mobile applications using Flutter",
      "Collaborate with designers",
      "Optimize app performance",
      "Fix bugs and issues"
    ],
    qualifications: [
      "2+ years Flutter development experience",
      "Portfolio of published apps",
      "Understanding of state management"
    ],
    skills: ["Flutter", "Dart", "Firebase", "State Management"],
    deadline: "2023-12-18",
    postedBy: "Usman",
    postedTime: "1 week ago",
    hasTechnicalTest: true
  },
  { 
    id: 10,
    title: "Customer Support Representative", 
    company: "Service Solutions",
    workplaceType: "On-site",
    location: "Karachi, Pakistan",
    jobType: "Full-time",
    description: "Looking for a customer support representative to assist our clients with product inquiries and issues.",
    responsibilities: [
      "Respond to customer inquiries",
      "Resolve customer issues",
      "Document customer interactions",
      "Escalate complex issues"
    ],
    qualifications: [
      "Excellent communication skills",
      "Customer service experience",
      "Patience and problem-solving skills"
    ],
    skills: ["Customer Service", "Communication", "Problem Solving", "Patience"],
    deadline: "2023-12-03",
    postedBy: "Ayesha",
    postedTime: "recently",
    hasTechnicalTest: false
  }
];

  const filteredJobs = jobData.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
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
        </div>
        <nav className="applicant-page-menu">
          <Link to="/profile" className="applicant-page-menu-item">
            <i className="fas fa-user applicant-page-fonticon"></i>
            <span>Profile</span>
          </Link>
          <Link to="/" className="applicant-page-menu-item">
            <i className="fas fa-house applicant-page-fonticon"></i>
            <span>Home</span>
          </Link>
          <Link to="/view-profile" className="applicant-page-menu-item">
            <i className="fas fa-file applicant-page-fonticon"></i>
            <span>Upload CV</span>
          </Link>
          <Link to="/notifications" className="applicant-page-menu-item" onClick={handleNotificationsClick}>
            <i className="fas fa-bell applicant-page-fonticon"></i>
            <span>Notifications</span>
          </Link>
        </nav>
        <div className="applicant-logout-container">
          <button className="applicant-menu-item applicant-main-logout">
            <i className="fas fa-sign-out-alt"></i>
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
              <h2 className="applicant-page-card-title">Personality Assessment</h2>
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
                  key={job.id} 
                  className={`applicant-page-job-item ${activeJob === index ? 'expanded' : ''}`}
                  onClick={() => toggleJobDetails(index)}
                >
                  <div className="job-avatar-container">
                    <div className="applicant-page-job-avatar">
                      {job.title.charAt(0)}
                    </div>
                    <div className="job-meta">
                      <span className="job-company">
                        <i className="fas fa-building"></i> {job.company}
                      </span>
                      <span className="job-location">
                        <i className="fas fa-map-marker-alt"></i> {job.location}
                      </span>
                    </div>
                  </div>
                  <div className="applicant-page-job-content">
                    <h3>{job.title}</h3>
                    <div className="job-tags">
                      <span className="job-type-tag">{job.jobType}</span>
                      <span className="workplace-tag">{job.workplaceType}</span>
                    </div>
                    <p className="job-posted-by">
                      Posted by {job.postedBy} {job.postedTime}
                    </p>
                    
                    {activeJob === index && (
                      <div className="job-details-expanded">
                        <div className="job-details-section">
                          <h4>Job Description</h4>
                          <p>{job.description}</p>
                        </div>
                        
                        <div className="job-details-section">
                          <h4>Responsibilities</h4>
                          <ul className="job-details-list">
                            {job.responsibilities.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="job-details-section">
                          <h4>Qualifications</h4>
                          <ul className="job-details-list">
                            {job.qualifications.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="job-details-section">
                          <h4>Required Skills</h4>
                          <div className="skills-container">
                            {job.skills.map((skill, i) => (
                              <span key={i} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="job-details-meta">
                          <div className="meta-item">
                            <i className="fas fa-clock"></i>
                            <span>Application Deadline: {job.deadline}</span>
                          </div>
                        </div>
                        
                        <div className="job-actions">
                          <button className="applicant-page-btn apply-btn">
                            <i className="fas fa-paper-plane"></i> Apply Now
                          </button>
                          <button className="applicant-page-btn save-btn">
                            <i className="fas fa-bookmark"></i> Save Job
                          </button>
                          {job.hasTechnicalTest && (<button className="applicant-page-btn test-btn"
                          onClick={(e) => handleTakeTest(job.id, e)} 
                          >    
                          <i className="fas fa-laptop-code"></i> Take Technical Test  </button>
                        )}
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
          <div className="cv-upload-section">
            <h3>Upload Your CV</h3>
            <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
            <button onClick={handleUpload}>Upload CV</button>
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