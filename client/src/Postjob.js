import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Postjob.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faMapMarkerAlt,
  faBriefcase,
  faCalendarAlt,
  faHome,
  faBell,
  faUser,
  faFileAlt,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import logo from './logo.png';

const Postjob = () => {
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput)) {
      setSkills([...skills, skillInput]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Job posted!");
  };

  return (
    <div className="postjob-container">
      {/* Sidebar */}
      <div className="postjob-sidebar">
        <div className="postjob-logo">
          <img src={logo} alt="JobQuest Logo" />
        </div>
        <nav className="postjob-menu">
          <Link to="#" className="postjob-menu-item">
            <FontAwesomeIcon icon={faHome} className="postjob-icon" />
            <span>Dashboard</span>
          </Link>
          <Link to="#" className="postjob-menu-item">
            <FontAwesomeIcon icon={faBell} className="postjob-icon" />
            <span>Notifications</span>
          </Link>
          <Link to="#" className="postjob-menu-item">
            <FontAwesomeIcon icon={faUser} className="postjob-icon" />
            <span>Profile</span>
          </Link>
          <Link to="#" className="postjob-menu-item">
            <FontAwesomeIcon icon={faFileAlt} className="postjob-icon" />
            <span>Documents</span>
          </Link>
        </nav>
        <div className="postjob-logout-container">
          <button className="postjob-logout">
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/*  Content */}
      <div className="postjob--content">
        <div className="postjob-header">
          <h1>Post a New Job</h1>
          <p>Fill in the details to create your job listing</p>
        </div>

        <form className="postjob-form" onSubmit={handleSubmit}>
          {/* Job Title */}
          <div className="postjob-form-group">
            <label htmlFor="jobTitle">Job Title</label>
            <input 
              type="text" 
              id="jobTitle" 
              placeholder="Enter job title" 
              className="postjob-form-input"
              required
            />
          </div>

          {/* Company */}
          <div className="postjob-form-group">
            <label htmlFor="company">
              <FontAwesomeIcon icon={faBuilding} className="postjob-input-icon" />
              Company
            </label>
            <input 
              type="text" 
              id="company" 
              placeholder="Enter company name" 
              className="postjob-form-input"
              required
            />
          </div>

          {/* Workplace Type */}
          <div className="postjob-form-group">
            <label>Workplace Type</label>
            <div className="postjob-radio-group">
              <label className="postjob-radio-option">
                <input 
                  type="radio" 
                  name="workplaceType" 
                  value="remote" 
                  required 
                />
                <span>Remote</span>
              </label>
              <label className="postjob-radio-option">
                <input type="radio" name="workplaceType" value="hybrid" />
                <span>Hybrid</span>
              </label>
              <label className="postjob-radio-option">
                <input type="radio" name="workplaceType" value="onsite" />
                <span>On-site</span>
              </label>
            </div>
          </div>

          {/* Job Location */}
          <div className="postjob-form-group">
            <label htmlFor="jobLocation">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="postjob-input-icon" />
              Job Location
            </label>
            <input 
              type="text" 
              id="jobLocation" 
              placeholder="Enter job location" 
              className="postjob-form-input"
              required
            />
          </div>

          {/* Job Type */}
          <div className="postjob-form-group">
            <label htmlFor="jobType">
              <FontAwesomeIcon icon={faBriefcase} className="postjob-input-icon" />
              Job Type
            </label>
            <select id="jobType" className="postjob-form-input" required>
              <option value="">Select job type</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>

          {/* Description & Responsibilities */}
          <div className="postjob-form-group">
            <label htmlFor="description">Description & Responsibilities</label>
            <textarea 
              id="description" 
              placeholder="Enter job description and responsibilities" 
              className="postjob-form-textarea"
              rows="5"
              required
            ></textarea>
          </div>

          {/* Qualifications */}
          <div className="postjob-form-group">
            <label htmlFor="qualifications">Qualifications</label>
            <textarea 
              id="qualifications" 
              placeholder="Enter required qualifications" 
              className="postjob-form-textarea"
              rows="3"
              required
            ></textarea>
          </div>

          {/* Skills */}
          <div className="postjob-form-group">
            <label htmlFor="skills">Skills</label>
            <div className="postjob-skills-container">
              <input 
                type="text" 
                id="skills" 
                placeholder="Add required skills (e.g., JavaScript, Python)" 
                className="postjob-form-input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <button 
                type="button" 
                className="postjob-add-skill-btn"
                onClick={handleAddSkill}
              >
                Add Skill
              </button>
            </div>
            <div className="postjob-skills-tags">
              {skills.map((skill, index) => (
                <div key={index} className="postjob-skill-tag">
                  {skill}
                  <button 
                    type="button" 
                    className="postjob-remove-skill"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Last Date */}
          <div className="postjob-form-group">
            <label htmlFor="lastDate">
              <FontAwesomeIcon icon={faCalendarAlt} className="postjob-input-icon" />
              Application Deadline
            </label>
            <input 
              type="date" 
              id="lastDate" 
              className="postjob-form-input"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="postjob-form-submit">
            <button type="submit" className="postjob-submit-btn">
              Post Now
            </button>
          </div>
        </form>
        <footer className="postjob-footer">
          <div className="postjob-footer-content">
            <p>© 2024-2025 JobQuest by Safia Bakhtawar, Yusra Bakhtawar, & Muskan Iqbal. All rights reserved.</p>
            </div>
            </footer>
      </div>
    </div>
  );
};

export default Postjob;