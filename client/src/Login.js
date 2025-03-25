import React, { useState } from 'react';
import styles from './Login.module.css'; 
import logo from './logo.png';
import discussion from './discussion.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate, useLocation } from 'react-router-dom'; 

const Login = () => {
  const navigate = useNavigate(); // Hook for navigating
  const location = useLocation(); // Hook for accessing location object
  const userType = location.state?.userType; // Extract userType from state

  console.log('User type:', userType);
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Predefined credentials for applicant and recruiter
  const predefinedCredentials = {
    applicant: { email: 'sidra@gmail.com', password: 'password123' },
    recruiter: { email: 'muskan@gmail.com', password: 'password456' },
  };

  // Switch between login and signup tabs
  const switchTab = (tab) => {
    setActiveTab(tab); 
  };

  // Handle login form submission
  const handleLogin = (e) => {
    e.preventDefault();

    // Trim the email and password to remove any extra spaces
    const trimmedEmail = email.trim().toLowerCase(); // Ensure case-insensitivity for email
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      alert('Please enter both email and password.');
      return;
    }

    console.log('Attempting login...');
    console.log('Email:', trimmedEmail);
    console.log('Password:', trimmedPassword);

    // Check for valid credentials based on user type
    if (
      userType === 'applicant' &&
      trimmedEmail === predefinedCredentials.applicant.email.toLowerCase() &&
      trimmedPassword === predefinedCredentials.applicant.password
    ) {
      console.log('Login successful as applicant');
      navigate('/applicant'); // Navigate to the applicant page
    } else if (
      userType === 'recruiter' &&
      trimmedEmail === predefinedCredentials.recruiter.email.toLowerCase() &&
      trimmedPassword === predefinedCredentials.recruiter.password
    ) {
      console.log('Login successful as recruiter');
      navigate('/recruiter'); // Navigate to the recruiter page
    } else {
      console.log('Invalid credentials');
      alert('Invalid credentials');
    }
  };

  // Handle signup form submission
  const handleSignup = (e) => {
    e.preventDefault();
    console.log('Signup form submitted');
  };

  return (
    <div className={styles['login-page']}>
      <div className={styles['login-main-container']}>
        {/* Back button */}
        <button
          type="button"
          className={styles['login-back']}
          onClick={() => navigate('/')} // Navigate to the opening page
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

          {/* Login form */}
          {activeTab === 'login' && (
            <form className={styles['login-login-form']} onSubmit={handleLogin}>
              <h2>Login</h2>
              <div className={styles['login-form-group']}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles['login-form-group']}>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <button type="submit" className={styles['login-btn']}>
                Login
              </button>
            </form>
          )}

          {/* Signup form */}
          {activeTab === 'signup' && (
            <form className={styles['login-signup-form']} onSubmit={handleSignup}>
              <h2>Sign up</h2>
              <div className={styles['login-form-group']}>
                <label>Full Name</label>
                <input type="text" placeholder="Enter your full name" required />
              </div>
              <div className={styles['login-form-group']}>
                <label>Phone Number</label>
                <input type="tel" placeholder="Enter your phone number" required />
              </div>
              <div className={styles['login-form-group']}>
                <label>Email</label>
                <input type="email" placeholder="Enter your email" required />
              </div>
              <div className={styles['login-form-group']}>
                <label>Password</label>
                <input type="password" placeholder="Create a password" required />
              </div>
              <div className={styles['login-form-group']}>
                <label>Confirm Password</label>
                <input type="password" placeholder="Confirm your password" required />
              </div>
              <button type="submit" className={styles['login-btn']}>
                Sign Up
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;