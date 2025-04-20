import React, { useState } from 'react';
import styles from './Login.module.css'; 
import logo from './logo.png';
import discussion from './discussion.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser, requestPasswordReset, resetPassword } from './api'; 

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.state?.userType;
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    confirmPassword: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Extract token from URL if present
  React.useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');
    if (token) {
      setResetToken(token);
      setShowResetPassword(true);
    }
  }, []);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setResetSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetSuccess('');

    try {
      const { email, password } = formData;
      const response = await loginUser(email.trim(), password.trim());
      
      console.log('Login successful:', response);
      
      if (userType === 'applicant') {
        navigate('/applicant');
      } else if (userType === 'recruiter') {
        navigate('/recruiter');
      } else {
        navigate('/dashboard');
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
    setResetSuccess('');

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
        phoneNumber: formData.phoneNumber.trim()
      };

      const response = await registerUser(userData);
      console.log('Registration successful:', response);
      switchTab('login');
      setResetSuccess('Registration successful! Please login.');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetSuccess('');

    try {
      await requestPasswordReset(formData.email.trim());
      setResetSuccess('Password reset link sent to your email!');
      setShowForgotPassword(false);
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetSuccess('');

    try {
      await resetPassword(resetToken, formData.newPassword.trim());
      setResetSuccess('Password reset successfully! You can now login with your new password.');
      setShowResetPassword(false);
      setFormData(prev => ({ ...prev, newPassword: '' }));
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['login-page']}>
      <div className={styles['login-main-container']}>
        <button
          type="button"
          className={styles['login-back']}
          onClick={() => navigate('/')}
        >
          <i className="fas fa-arrow-left"></i>
        </button>

        <div className={styles['login-sidebar']}>
          <img src={logo} alt="JobQuest Logo" className={styles['login-logo']} />
          <div className={styles['login-description']}>
            <p>Find - Approve - Onboard</p>
            <img src={discussion} alt="discussion" className={styles['login-discussion']} />
          </div>
        </div>

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
          {resetSuccess && <div className={styles['login-success']}>{resetSuccess}</div>}

          {showResetPassword ? (
            <form className={styles['login-reset-form']} onSubmit={handlePasswordReset}>
              <h2>Reset Password</h2>
              <div className={styles['login-form-group']}>
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <button 
                type="submit" 
                className={styles['login-btn']}
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                type="button"
                className={styles['login-cancel-btn']}
                onClick={() => {
                  setShowResetPassword(false);
                  setResetToken('');
                }}
              >
                Cancel
              </button>
            </form>
          ) : showForgotPassword ? (
            <form className={styles['login-forgot-form']} onSubmit={handleForgotPassword}>
              <h2>Forgot Password</h2>
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
              <button 
                type="submit" 
                className={styles['login-btn']}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                className={styles['login-cancel-btn']}
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </button>
            </form>
          ) : activeTab === 'login' ? (
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
                  onClick={() => setShowForgotPassword(true)}
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
          ) : (
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