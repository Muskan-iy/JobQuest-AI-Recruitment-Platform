import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractCV, uploadCV } from './api';
import './ViewProfile.css';

const ViewProfile = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileData, setProfileData] = useState({
    experience: [],
    education: [],
    skills: [],
    projects: [],
    suggested_career_paths: [],
    detected_profession: "",
    email: "",
    contact_number: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [candidateId, setCandidateId] = useState(null);
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
    if (!userName) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Extract CV data from AI module
      const extractedData = await extractCV(selectedFile);
      console.log("Extracted data from AI:", extractedData); // Debugging log
      if (!extractedData) {
        throw new Error("No data extracted from CV");
      }

      setProfileData({
        experience: extractedData.experience || [],
        education: extractedData.education || [],
        skills: extractedData.skills || [],
        projects: extractedData.projects || [],
        suggested_career_paths: extractedData.suggested_career_paths || [],
        detected_profession: extractedData.detected_profession || "Not specified",
        email: extractedData.email || "Not found",
        contact_number: extractedData.contact_number || "Not found"
      });

      // Step 2: Upload CV to backend
      const formData = new FormData();
      formData.append('cv', selectedFile);
      formData.append('name', userName);
      formData.append('cv_data', JSON.stringify(extractedData));
      const response = await uploadCV(formData);
      setCandidateId(response.candidate_id);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to process CV');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewJobs = () => {
    if (candidateId) {
      navigate('/jobs');
    } else {
      setError("Please upload a CV first");
    }
  };

  return (
    <div className="viewProfilePageContainer">
      <button onClick={() => navigate(-1)} className="viewProfileBackButton">
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
            <button 
              className="viewProfileViewJobsButton"
              onClick={handleViewJobs}
              disabled={!candidateId}
            >
              View Jobs
            </button>
          </div>

          <div className="viewProfileDetails">
            <div className="viewProfileDetailSection">
              <h3 className="viewProfileSectionTitle">Experience</h3>
              <ul className="viewProfileExperienceList">
                {profileData.experience?.map((exp, index) => (
                  <li key={index} className="viewProfileExperienceItem">
                    {exp}
                  </li>
                ))}
              </ul>
            </div>

            <div className="viewProfileDetailSection">
              <h3 className="viewProfileSectionTitle">Education</h3>
              <ul className="viewProfileEducationList">
                {profileData.education?.map((edu, index) => (
                  <li key={index} className="viewProfileEducationItem">
                    {edu}
                  </li>
                ))}
              </ul>
            </div>

            <div className="viewProfileDetailSection">
              <h3 className="viewProfileSectionTitle">Skills</h3>
              <ul className="viewProfileSkillsList">
                {profileData.skills?.map((skill, index) => (
                  <li key={index} className="viewProfileSkillItem">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>

            <div className="viewProfileDetailSection">
              <h3 className="viewProfileSectionTitle">Projects</h3>
              <ul className="viewProfileProjectsList">
                {profileData.projects?.map((project, index) => (
                  <li key={index} className="viewProfileProjectItem">
                    {project}
                  </li>
                ))}
              </ul>
            </div>

            <div className="viewProfileDetailSection">
              <h3 className="viewProfileSectionTitle">Suggested Career Paths</h3>
              <ul className="viewProfileCareerList">
                {profileData.suggested_career_paths?.map((path, index) => (
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