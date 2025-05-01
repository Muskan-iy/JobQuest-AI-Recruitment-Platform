import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractCV } from './api';
import './ViewProfile.css';

const ViewProfile = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Please select a PDF file");
      event.target.value = null;
    }
  };

  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await extractCV(selectedFile);
      setProfileData(data);
    } catch (err) {
      setError(`Failed to process CV: ${err.message}`);
    } finally {
      setIsLoading(false);
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="viewProfilePageContainer">
      <button 
        onClick={() => navigate(-1)} 
        className="viewProfileBackButton"
      >
        <i className="fas fa-arrow-left"></i> Back to Dashboard
      </button>

      <div className="viewProfileHeader">
        <h1 className="viewProfileMainTitle">Your Profile</h1>
        <p className="viewProfileSubtitle">Upload your CV to get started</p>
      </div>

      <div className="viewProfileNameInput">
        <label htmlFor="userName">Your Name:</label>
        <input
          type="text"
          id="userName"
          value={userName}
          onChange={handleNameChange}
          placeholder="Enter your full name"
          className="viewProfileNameField"
        />
      </div>

      <div className="viewProfileUploadSection">
        <label className="viewProfileUploadButton">
          <i className="fas fa-cloud-upload-alt"></i> Upload CV (PDF)
          <input 
            type="file" 
            accept=".pdf" 
            className="viewProfileFileInput" 
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </label>
        <button 
          className="viewProfileUploadButton"
          onClick={handleUpload}
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? 'Processing...' : 'Analyze CV'}
        </button>
        
        {selectedFile && (
          <div className="viewProfileFileInfo">
            <i className="fas fa-file-pdf"></i> 
            <span>{selectedFile.name}</span>
            <span className="viewProfileFileSize">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="viewProfileError">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {profileData && (
        <div className="viewProfileCard">
          <div className="viewProfilePersonalSection">
            <h2 className="viewProfileName">
              {userName || "Your Profile"}
            </h2>
            <p className="viewProfileTitle">Profession: {profileData.detected_profession}</p>
            <div className="viewProfileContactInfo">
              {profileData.email !== "Not found" && (
                <p><i className="fas fa-envelope"></i> {profileData.email}</p>
              )}
              {profileData.contact_number !== "Not found" && (
                <p><i className="fas fa-phone"></i> {profileData.contact_number}</p>
              )}
            </div>
          </div>

          <div className="viewProfileDetails">
            <div className="viewProfileDetailSection">
              <h3 className="viewProfileSectionTitle">Experience</h3>
              <ul className="viewProfileExperienceList">
                {profileData.experience.map((exp, index) => (
                  <li key={index} className="viewProfileExperienceItem">
                    {exp}
                  </li>
                ))}
              </ul>
            </div>

            <div className="viewProfileDetailSection">
              <h3 className="viewProfileSectionTitle">Education</h3>
              <ul className="viewProfileEducationList">
                {profileData.education.map((edu, index) => (
                  <li key={index} className="viewProfileEducationItem">
                    {edu}
                  </li>
                ))}
              </ul>
            </div>

            <div className="viewProfileDetailSection">
              <h3 className="viewProfileSectionTitle">Skills</h3>
              <ul className="viewProfileSkillsList">
                {profileData.skills.map((skill, index) => (
                  <li key={index} className="viewProfileSkillItem">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>

            <div className="viewProfileDetailSection">
              <h3 className="viewProfileSectionTitle">Projects</h3>
              <ul className="viewProfileProjectsList">
                {profileData.projects.map((project, index) => (
                  <li key={index} className="viewProfileProjectItem">
                    {project}
                  </li>
                ))}
              </ul>
            </div>

            <div className="viewProfileDetailSection">
              <h3 className="viewProfileSectionTitle">Suggested Career Paths</h3>
              <ul className="viewProfileCareerList">
                {profileData.suggested_career_paths.map((path, index) => (
                  <li key={index} className="viewProfileCareerItem">
                    {path}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProfile;