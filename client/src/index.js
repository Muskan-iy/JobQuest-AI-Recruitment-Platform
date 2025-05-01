import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Opening from './Opening';
import Login from './Login';
import Applicant from './Applicant';
import RecruiterMain from './RecruiterMain';
import Postjob from './Postjob';
import JobCandidateQuestionnaire from './JobCandidateQuestionnaire';
import ViewProfile from './ViewProfile';
import './index.css';

// ThemeProvider Component
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // Default theme is dark

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Toggle between dark and light themes
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <>
      {/* Theme Toggle Button */}
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '🌞' : '🌙'}
      </button>
      {children}
    </>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Opening />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Applicant" element={<Applicant />} />
          <Route path="/Recruiter" element={<RecruiterMain />} />
          <Route path="/Postjob" element={<Postjob />} />
          <Route path="/JobCandidateQuestionnaire" element={<JobCandidateQuestionnaire />} />
          <Route path="/view-profile" element={<ViewProfile />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);