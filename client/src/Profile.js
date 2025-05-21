import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Profile.css";
import logo from "./logo.png";
import "@fortawesome/fontawesome-free/css/all.min.css";

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState(null);
  const [personalityAssessment, setPersonalityAssessment] = useState(null);
  const [technicalTests, setTechnicalTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        setError("No authentication token or user ID found");
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        // Fetch user profile data
        const profileResponse = await axios.get(`${API_BASE}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        const { user, profile } = profileResponse.data;

        // Fetch candidate data
        let candidateData = {};
        let candidateId = null;
        try {
          const candidateResponse = await axios.get(`${API_BASE}/api/candidates/${user._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });
          candidateData = candidateResponse.data;
          candidateId = candidateData.id;
        } catch (candidateError) {
          if (candidateError.response?.status === 404) {
            console.warn("No candidate data found for user");
            candidateData = {
              skills: [],
              experience: [],
              education: [],
              eq_score: null,
              iq_score: null,
              detected_profession: "Not assessed",
              suggested_career_paths: [],
              contact_number: "Not specified",
            };
          } else {
            throw candidateError;
          }
        }

        setProfileData({
          name: user.fullName,
          email: user.email,
          location: profile?.location || "Not specified",
          phone: candidateData.contact_number || "Not specified",
          experience: candidateData.experience?.length > 0 ? candidateData.experience.join(", ") : "Not specified",
          education: candidateData.education?.length > 0 ? candidateData.education.join(", ") : "Not specified",
          skills: candidateData.skills || [],
          bio: profile?.bio || "Not specified",
        });

        setPersonalityAssessment({
          personality: candidateData.detected_profession || "Not assessed",
          eq: candidateData.eq_score ? `Score: ${candidateData.eq_score}/100` : "Not assessed",
          iq: candidateData.iq_score ? `Score: ${candidateData.iq_score}/100` : "Not assessed",
          situationalAwareness: "Not assessed", // Placeholder, as not in backend
          description: candidateData.suggested_career_paths?.length > 0 ? candidateData.suggested_career_paths.join(", ") : "No description available",
        });

        // Fetch technical tests
        if (candidateId) {
          try {
            const testsResponse = await axios.get(`${API_BASE}/api/tests/${candidateId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            });
            setTechnicalTests(testsResponse.data.tests || []);
          } catch (testError) {
            console.error("Error fetching technical tests:", testError);
            setTechnicalTests([]);
          }
        } else {
          setTechnicalTests([]);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch profile data");
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return <div className="profile-page-loading">Loading...</div>;
  }

  if (error) {
    return <div className="profile-page-error">{error}</div>;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-page-main-wrapper">
        <div className="profile-page-main-content">
          <div className="profile-page-header">
            <div className="profile-page-logo">
              <img src={logo} alt="JobQuest Logo" className="logo-image" />
            </div>
            <h1>Your Profile</h1>
            <p className="subtitle">Manage your personal information, assessment results, and technical tests.</p>
          </div>

          <div className="profile-page-tabs">
            <button
              className={`profile-page-tab-button ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              Profile Data
            </button>
            <button
              className={`profile-page-tab-button ${activeTab === "assessment" ? "active" : ""}`}
              onClick={() => setActiveTab("assessment")}
            >
              Personality Assessment
            </button>
            <button
              className={`profile-page-tab-button ${activeTab === "tests" ? "active" : ""}`}
              onClick={() => setActiveTab("tests")}
            >
              Technical Tests
            </button>
          </div>

          <div className="profile-page-content">
            {activeTab === "profile" && profileData && (
              <div className="profile-page-card">
                <h2 className="profile-page-card-title">Profile Information</h2>
                <div className="profile-details">
                  <div className="profile-field">
                    <i className="fas fa-user"></i>
                    <span><strong>Name:</strong> {profileData.name}</span>
                  </div>
                  <div className="profile-field">
                    <i className="fas fa-envelope"></i>
                    <span><strong>Email:</strong> {profileData.email}</span>
                  </div>
                  <div className="profile-field">
                    <i className="fas fa-map-marker-alt"></i>
                    <span><strong>Location:</strong> {profileData.location}</span>
                  </div>
                  <div className="profile-field">
                    <i className="fas fa-phone"></i>
                    <span><strong>Phone:</strong> {profileData.phone}</span>
                  </div>
                  <div className="profile-field">
                    <i className="fas fa-briefcase"></i>
                    <span><strong>Experience:</strong> {profileData.experience}</span>
                  </div>
                  <div className="profile-field">
                    <i className="fas fa-graduation-cap"></i>
                    <span><strong>Education:</strong> {profileData.education}</span>
                  </div>
                  <div className="profile-field">
                    <i className="fas fa-tools"></i>
                    <span><strong>Skills:</strong> {profileData.skills.join(", ")}</span>
                  </div>
                  <div className="profile-field">
                    <i className="fas fa-info-circle"></i>
                    <span><strong>Bio:</strong> {profileData.bio}</span>
                  </div>
                </div>
                <button className="profile-page-btn">Edit Profile</button>
              </div>
            )}

            {activeTab === "assessment" && personalityAssessment && (
              <div className="profile-page-card">
                <h2 className="profile-page-card-title">Personality Assessment Results</h2>
                <div className="profile-details">
                  <div className="profile-field">
                    <i className="fas fa-brain"></i>
                    <span><strong>Personality Type:</strong> {personalityAssessment.personality}</span>
                  </div>
                  <div className="profile-field">
                    <i className="fas fa-heart"></i>
                    <span><strong>Emotional Intelligence:</strong> {personalityAssessment.eq}</span>
                  </div>
                  <div className="profile-field">
                    <i className="fas fa-lightbulb"></i>
                    <span><strong>IQ:</strong> {personalityAssessment.iq}</span>
                  </div>
                  <div className="profile-field">
                    <i className="fas fa-eye"></i>
                    <span><strong>Situational Awareness:</strong> {personalityAssessment.situationalAwareness}</span>
                  </div>
                  <div className="profile-field">
                    <i className="fas fa-info-circle"></i>
                    <span><strong>Description:</strong> {personalityAssessment.description}</span>
                  </div>
                </div>
                <button className="profile-page-btn">
                  <i className="fas fa-redo"></i> Retake Assessment
                </button>
              </div>
            )}

            {activeTab === "tests" && (
              <div className="profile-page-card">
                <h2 className="profile-page-card-title">Technical Test Results</h2>
                <div className="test-results-list">
                  {technicalTests.length > 0 ? (
                    technicalTests.map((test) => (
                      <div key={test.id} className="test-result-item">
                        <h3>{test.title}</h3>
                        <div className="test-details">
                          <p><strong>Score:</strong> {test.score}</p>
                          <p><strong>Date:</strong> {test.date}</p>
                          <p><strong>Skills Tested:</strong> {test.skillsTested.join(", ")}</p>
                          <p><strong>Feedback:</strong> {test.feedback}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No technical test results available.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="profile-footer">
          <div className="profile-footer-content">
            <p>© 2024-2025 JobQuest by Safia Bakhtawar, Yusra Bakhtawar, & Muskan Iqbal. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Profile;