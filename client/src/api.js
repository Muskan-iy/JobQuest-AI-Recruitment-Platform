import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const AI_BASE = process.env.REACT_APP_AI_BASE || 'http://localhost:5000';

const handleAxiosError = (error) => {
  const errorMessage = error.response?.data?.error || error.message || 'Request failed';
  console.error('API error:', errorMessage);
  throw new Error(errorMessage);
};

export const extractCV = async (file) => {
  const formData = new FormData();
  formData.append('cv', file);

  try {
    const response = await axios.post(`${AI_BASE}/extract_cv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });

    if (response.data.status !== 'success') {
      throw new Error('CV extraction failed');
    }

    console.log('Extracted CV data from AI:', response.data.data); // Debugging log

    return response.data.data; // Return the nested data object directly
  } catch (error) {
    console.error('API Error in extractCV:', error.response?.data || error);
    throw new Error(error.response?.data?.error || 'Failed to process CV');
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/login`,
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );
    console.log('Login response:', response.data);
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
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    console.log('Signup response:', response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Check backend health
export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/health`, {
      withCredentials: true,
    });
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
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
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
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
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
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Apply for job
export const applyJob = async (jobId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await axios.post(
      `${API_BASE}/api/apply`,
      { job_id: jobId },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get job applications
export const getJobApplications = async (jobId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await axios.get(`${API_BASE}/api/job_applications/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get candidate CV
export const getCandidateCV = async (candidateId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const response = await axios.get(`${API_BASE}/api/candidates/${candidateId}/cv`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Save test results
export const saveTestResults = async (testData) => {
  try {
    const response = await axios.post(`${API_BASE}/api/tests`, testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get job matches
export const getJobMatches = async (candidateId) => {
  try {
    const response = await axios.get(`${API_BASE}/api/matches/${candidateId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    return { message: 'No token found, cleared local storage' };
  }
  try {
    const response = await axios.post(
      `${API_BASE}/api/logout`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    console.log('Logout response:', response.data);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    handleAxiosError(error);
  }
};