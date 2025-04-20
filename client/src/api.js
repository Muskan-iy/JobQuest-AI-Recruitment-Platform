const API_BASE = process.env.REACT_APP_API_BASE;

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Request failed');
  }
  return await response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });
  return handleResponse(response);
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return handleResponse(response);
};

// Password Reset Functions
export const requestPasswordReset = async (email) => {
  const response = await fetch(`${API_BASE}/api/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleResponse(response);
};

export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_BASE}/api/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  return handleResponse(response);
};

// Health Check (optional)
export const checkHealth = async () => {
  const response = await fetch(`${API_BASE}/api/health`);
  return handleResponse(response);
};