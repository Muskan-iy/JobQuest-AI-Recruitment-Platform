const API_BASE = 'http://localhost:5001';
const AI_BASE = 'http://localhost:5000';

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: `Request failed with status ${response.status}` };
    }
    throw new Error(errorData.error || 'Request failed');
  }
  return await response.json();
};

export const extractCV = async (cvFile) => {
  // Validate file
  if (!cvFile) {
    throw new Error('No file provided');
  }

  if (cvFile.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('File size exceeds 5MB limit');
  }

  if (cvFile.type !== 'application/pdf') {
    throw new Error('Only PDF files are accepted');
  }

  const formData = new FormData();
  formData.append('cv', cvFile);

  try {
    const response = await fetch(`${AI_BASE}/extract_cv`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let the browser set it with boundary
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error in extractCV:', error);
    throw new Error(error.message || 'Failed to process CV. Please try again.');
  }
};

// Auth functions remain the same
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });
  return handleResponse(response);
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE}/api/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
  return handleResponse(response);
};

export const checkHealth = async () => {
  const response = await fetch(`${API_BASE}/api/health`);
  return handleResponse(response);
};

// New function to save profile to backend
export const saveProfile = async (profileData, token) => {
  const response = await fetch(`${API_BASE}/api/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  return handleResponse(response);
};