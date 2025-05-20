import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const AI_BASE = process.env.REACT_APP_AI_BASE || 'http://localhost:5000';

// Helper function to handle axios responses and errors
const handleAxiosError = (error) => {
  const errorMessage = error.response?.data?.error || error.message || 'Request failed';
  console.error('API error:', errorMessage);
  throw new Error(errorMessage);
};

// Extract CV (calls a separate AI service)
export const extractCV = async (cvFile) => {
  if (!cvFile) {
    throw new Error('No file provided');
  }

  if (cvFile.size > 5 * 1024 * 1024) {
    throw new Error('File size exceeds 5MB limit');
  }

  if (cvFile.type !== 'application/pdf') {
    throw new Error('Only PDF files are accepted');
  }

  const formData = new FormData();
  formData.append('cv', cvFile);

  try {
    const response = await axios.post(`${AI_BASE}/extract_cv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE}/api/login`, { email, password }, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE}/api/signup`, userData, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Check backend health
export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/health`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Save profile
export const saveProfile = async (profileData, token) => {
  if (!token) {
    throw new Error('No authentication token provided');
  }
  try {
    const response = await axios.post(`${API_BASE}/api/profile`, profileData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Post job
export const postJob = async (jobData) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await axios.post(`${API_BASE}/api/jobs`, jobData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Upload CV
export const uploadCV = async (formData) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await axios.post(`${API_BASE}/api/candidates`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Save test results
export const saveTestResults = async (testData) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await axios.post(`${API_BASE}/api/tests`, testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get job matches
export const getJobMatches = async (candidateId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await axios.get(`${API_BASE}/api/matches/${candidateId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Logout user
export const logoutUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await axios.post(`${API_BASE}/api/logout`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};