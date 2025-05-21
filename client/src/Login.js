import React, { useState } from 'react';
import styles from './Login.module.css';
import logo from './logo.png';
import discussion from './discussion.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser } from './api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Default to 'dashboard' if userType is not provided
  const userType = location.state?.userType || 'dashboard';
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { email, password } = formData;
      const response = await loginUser(email.trim(), password.trim());

      console.log('Login successful:', response);

      // Store token and userId in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user._id);

      // Navigate based on userType
      if (userType === 'applicant') {
        navigate('/applicant');
      } else if (userType === 'recruiter') {
        navigate('/recruiter');
      } else {
        navigate('/dashboard'); // Fallback route
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        email: formData.email.trim(),
        password: formData.password.trim(),
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      };

      const response = await registerUser(userData);
      console.log('Registration successful:', response);

      // Store token and userId in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user._id);

      // After successful registration, navigate based on userType
      if (userType === 'applicant') {
        navigate('/applicant');
      } else if (userType === 'recruiter') {
        navigate('/recruiter');
      } else {
        navigate('/dashboard'); // Fallback route
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['login-page']}>
      <div className={styles['login-main-container']}>
        {/* Back button */}
        <button
          type="button"
          className={styles['login-back']}
          onClick={() => navigate('/')}
        >
          <i className="fas fa-arrow-left"></i>
        </button>

        {/* Sidebar */}
        <div className={styles['login-sidebar']}>
          <img src={logo} alt="JobQuest Logo" className={styles['login-logo']} />
          <div className={styles['login-description']}>
            <p>Find - Approve - Onboard</p>
            <img src={discussion} alt="discussion" className={styles['login-discussion']} />
          </div>
        </div>

        {/* Form container */}
        <div className={styles['login-form-container']}>
          <div className={styles['login-tab-switch']}>
            <button
              className={activeTab === 'login' ? styles['login-active'] : ''}
              onClick={() => switchTab('login')}
            >
              Login
            </button>
            <button
              className={activeTab === 'signup' ? styles['login-active'] : ''}
              onClick={() => switchTab('signup')}
            >
              Signup
            </button>
          </div>

          {error && <div className={styles['login-error']}>{error}</div>}

          {/* Login form */}
          {activeTab === 'login' && (
            <form className={styles['login-login-form']} onSubmit={handleLogin}>
              <h2>Login</h2>
              <div className={styles['login-form-group']}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles['login-form-group']}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles['login-additional-links']}>
                <button
                  type="button"
                  className={styles['login-forgot-password']}
                  onClick={() => alert('Forgot password clicked')}
                >
                  Forgot Password?
                </button>
              </div>
              <button
                type="submit"
                className={styles['login-btn']}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {/* Signup form */}
          {activeTab === 'signup' && (
            <form className={styles['login-signup-form']} onSubmit={handleSignup}>
              <h2>Sign up</h2>
              <div className={styles['login-form-group']}>
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles['login-form-group']}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles['login-form-group']}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles['login-form-group']}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles['login-form-group']}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className={styles['login-btn']}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Sign Up'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;