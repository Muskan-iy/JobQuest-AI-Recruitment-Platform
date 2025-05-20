import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Postjob.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faMapMarkerAlt,
  faBriefcase,
  faCalendarAlt,
  faFileAlt,
  faLightbulb,
  faCheckCircle,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import logo from './logo.png';
import { faUserTie } from '@fortawesome/free-solid-svg-icons';
import { postJob } from './api';

const Postjob = () => {
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [activeStep, setActiveStep] = useState(1);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput)) {
      setSkills([...skills, skillInput]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await postJob({
        ...formData,
        recruiter_id: localStorage.getItem('userId'),
        skills: formData.skills.split(',').map(skill => skill.trim())
      });
      alert('Job posted successfully!');
    } catch (error) {
      console.error('Error posting job:', error);
    }
  };

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="postjob-container">
      {/* Header with logo and navigation */}
      <header className="postjob-header-container">
        <div className="postjob-logo-nav">
          <img src={logo} alt="JobQuest Logo" className="postjob-logo" />
          <nav className="postjob-nav">
            <Link to="/recruiter" className="postjob-nav-link">
              <FontAwesomeIcon icon={faFileAlt} />
              <span>My Jobs</span>
            </Link>
            <Link to="/recruiter" className="postjob-nav-link">
              <FontAwesomeIcon icon={faLightbulb} />
              <span>Dashboard</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="postjob-content">
        {activeStep === 4 ? (
          <div className="postjob-success">
            <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
            <h2>Job Posted Successfully!</h2>
            <p>Your job listing is now live and visible to potential candidates.</p>
            <div className="success-actions">
              <Link to="/recruiter" className="postjob-btn primary">
                View Dashboard
              </Link>
              <button className="postjob-btn secondary" onClick={() => setActiveStep(1)}>
                Post Another Job
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="postjob-header">
              <h1>Post a New Job</h1>
              <p>Fill in the details to create your job listing and attract top talent</p>
              
              {/* Progress Steps */}
              <div className="postjob-progress">
                <div className={`progress-step ${activeStep >= 1 ? 'active' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-label">Job Details</div>
                </div>
                <div className={`progress-step ${activeStep >= 2 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-label">Requirements</div>
                </div>
                <div className={`progress-step ${activeStep >= 3 ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <div className="step-label">Finalize</div>
                </div>
              </div>
            </div>

            <div className="postjob-illustration">
            <FontAwesomeIcon icon={faUserTie} className="illustration-icon" />
          </div>

            <form className="postjob-form" onSubmit={handleSubmit}>
              {/* Step 1: Job Details */}
              {activeStep === 1 && (
                <div className="postjob-form-step">
                  <div className="postjob-form-group">
                    <label htmlFor="jobTitle">
                      <FontAwesomeIcon icon={faBriefcase} className="input-icon" />
                      Job Title
                    </label>
                    <input 
                      type="text" 
                      id="jobTitle" 
                      placeholder="e.g. Senior React Developer" 
                      className="postjob-input"
                      required
                    />
                  </div>

                  <div className="postjob-form-group">
                    <label htmlFor="company">
                      <FontAwesomeIcon icon={faBuilding} className="input-icon" />
                      Company
                    </label>
                    <input 
                      type="text" 
                      id="company" 
                      placeholder="Enter company name" 
                      className="postjob-input"
                      required
                    />
                  </div>

                  <div className="postjob-form-group">
                    <label>Workplace Type</label>
                    <div className="postjob-radio-group">
                      <label className="radio-option">
                        <input 
                          type="radio" 
                          name="workplaceType" 
                          value="remote" 
                          required 
                        />
                        <span>Remote</span>
                      </label>
                      <label className="radio-option">
                        <input type="radio" name="workplaceType" value="hybrid" />
                        <span>Hybrid</span>
                      </label>
                      <label className="radio-option">
                        <input type="radio" name="workplaceType" value="onsite" />
                        <span>On-site</span>
                      </label>
                    </div>
                  </div>

                  <div className="postjob-form-group">
                    <label htmlFor="jobLocation">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
                      Job Location
                    </label>
                    <input 
                      type="text" 
                      id="jobLocation" 
                      placeholder="e.g. New York, NY or 'Remote'" 
                      className="postjob-input"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Requirements */}
              {activeStep === 2 && (
                <div className="postjob-form-step">
                  <div className="postjob-form-group">
                    <label htmlFor="jobType">
                      <FontAwesomeIcon icon={faBriefcase} className="input-icon" />
                      Job Type
                    </label>
                    <select id="jobType" className="postjob-input" required>
                      <option value="">Select job type</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  </div>

                  <div className="postjob-form-group">
                    <label htmlFor="description">Description & Responsibilities</label>
                    <textarea 
                      id="description" 
                      placeholder="Describe the role and key responsibilities..." 
                      className="postjob-textarea"
                      rows="5"
                      required
                    ></textarea>
                  </div>

                  <div className="postjob-form-group">
                    <label htmlFor="qualifications">Qualifications</label>
                    <textarea 
                      id="qualifications" 
                      placeholder="List required qualifications and experience..." 
                      className="postjob-textarea"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Step 3: Final Details */}
              {activeStep === 3 && (
                <div className="postjob-form-step">
                  <div className="postjob-form-group">
                    <label htmlFor="skills">Skills</label>
                    <div className="skills-container">
                      <input 
                        type="text" 
                        id="skills" 
                        placeholder="Add required skills (e.g., JavaScript, Python)" 
                        className="postjob-input"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <button 
                        type="button" 
                        className="add-skill-btn"
                        onClick={handleAddSkill}
                      >
                        Add Skill
                      </button>
                    </div>
                    <div className="skills-tags">
                      {skills.map((skill, index) => (
                        <div key={index} className="skill-tag">
                          {skill}
                          <button 
                            type="button" 
                            className="remove-skill"
                            onClick={() => handleRemoveSkill(skill)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="postjob-form-group">
                    <label htmlFor="lastDate">
                      <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                      Application Deadline
                    </label>
                    <input 
                      type="date" 
                      id="lastDate" 
                      className="postjob-input"
                      required
                    />
                  </div>

                  <div className="postjob-tip">
                    <FontAwesomeIcon icon={faLightbulb} />
                    <p>Complete all fields accurately to attract the best candidates. Highlight unique benefits of working at your company.</p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="postjob-form-navigation">
                {activeStep > 1 && (
                  <button type="button" className="postjob-btn secondary" onClick={prevStep}>
                    Back
                  </button>
                )}
                {activeStep < 3 ? (
                  <button type="button" className="postjob-btn primary" onClick={nextStep}>
                    Continue
                  </button>
                ) : (
                  <button type="submit" className="postjob-btn primary with-icon">
                    <FontAwesomeIcon icon={faRocket} />
                    Post Job Now
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>

      <footer className="postjob-footer">
        <div className="footer-content">
          <p>© 2024-2025 JobQuest by Safia Bakhtawar, Yusra Bakhtawar, & Muskan Iqbal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Postjob;