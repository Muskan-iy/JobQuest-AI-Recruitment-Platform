import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TechnicalTestMain.css';

const TechnicalTestMain = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [fullScreen, setFullScreen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enhanced test questions database
  const testDatabase = {
    1: [ // Content Writer Test
      {
        id: 1,
        type: 'essay',
        question: "Write a 300-word article about the impact of AI on modern content creation",
        wordLimit: 300
      },
      {
        id: 2,
        type: 'editing',
        question: "Improve this sentence: 'Our product is very good and helps businesses to grow more better'",
        originalText: "Our product is very good and helps businesses to grow more better"
      }
    ],
    2: [ // Frontend Developer Test
      {
        id: 1,
        type: 'coding',
        question: "Create a responsive navbar using React with the following requirements:\n- Mobile hamburger menu\n- 5 navigation items\n- Active state styling",
        language: 'javascript'
      },
      {
        id: 2,
        type: 'debugging',
        question: "Identify and fix the bugs in this React component",
        code: `function Counter() {
  const [count, setCount] = useState(0);
  
  function increment() {
    count++;
  }
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}`
      },
      {
        id: 3,
        type: 'short-answer',
        question: "Explain the Virtual DOM in React and its performance benefits"
      }
    ],
    3: [ // Data Scientist Test
      {
        id: 1,
        type: 'coding',
        question: "Write a Python function to clean a dataset by:\n1. Handling missing values\n2. Removing outliers\n3. Normalizing numerical columns",
        language: 'python'
      },
      {
        id: 2,
        type: 'theory',
        question: "Explain the bias-variance tradeoff in machine learning"
      }
    ],
    5: [ // DevOps Engineer Test
      {
        id: 1,
        type: 'scenario',
        question: "Describe how you would set up a CI/CD pipeline for a microservices architecture",
      },
      {
        id: 2,
        type: 'diagram',
        question: "Draw the architecture of a highly available system on AWS"
      }
    ],
    7: [ // Backend Developer Test
      {
        id: 1,
        type: 'coding',
        question: "Create a REST API endpoint in Node.js that:\n1. Accepts JSON data\n2. Validates input\n3. Connects to MongoDB\n4. Implements error handling",
        language: 'javascript'
      },
      {
        id: 2,
        type: 'security',
        question: "What security measures would you implement for this API?"
      }
    ],
    9: [ // Mobile Developer Test
      {
        id: 1,
        type: 'architecture',
        question: "Design the state management for a Flutter e-commerce app"
      },
      {
        id: 2,
        type: 'coding',
        question: "Implement a user profile screen in Flutter",
        language: 'dart'
      }
    ]
  };

  // Declare currentTest and currentQuestion at the top after state declarations
  const currentTest = testDatabase[jobId] || [];
  const currentQuestion = currentTest[currentQuestionIndex];

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || testSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, testSubmitted]);

  // Fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullScreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Screen lock warning
  useEffect(() => {
    if (fullScreen) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount(prev => prev + 1);
        alert(`Warning ${warningCount + 1}/3: Please stay in fullscreen mode during the test`);
        
        if (warningCount >= 2) {
          handleSubmit(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fullScreen, warningCount]);

  // Enter fullscreen automatically
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error('Fullscreen error:', err);
      }
    };
    
    enterFullscreen();
  }, []);

  const handleAnswerChange = (value) => {
    if (!currentQuestion) return;
    setAnswers({
      ...answers,
      [currentQuestion.id]: value
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = async (forced = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Prepare submission data
      const submissionData = {
        jobId,
        applicantId: localStorage.getItem('userId'), // or from your auth context
        answers,
        timeStarted: new Date(Date.now() - (1800 - timeLeft) * 1000).toISOString(),
        timeCompleted: new Date().toISOString(),
        timeSpent: 1800 - timeLeft,
        warningCount,
        fullScreenViolations: warningCount,
        forcedSubmission: forced,
        testVersion: '1.0' // useful for tracking changes
      };

      // In a real app, you would send this to your backend:
      const response = await submitTestResults(submissionData);
      
      // For demo purposes, we'll also store in localStorage
      localStorage.setItem(`testResults_${jobId}`, JSON.stringify({
        ...submissionData,
        localCopy: true // Mark that this is a local copy
      }));

      // Navigate to results page with state
      navigate(`/test-results/${jobId}`, {
        state: {
          submissionData: response || submissionData,
          success: true
        }
      });

    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock API submission function
  const submitTestResults = async (data) => {
    // In a real application, this would be an actual API call
    console.log('Submitting test results:', data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock response
    return {
      ...data,
      submissionId: `sub_${Date.now()}`,
      evaluated: false, // Would be true if auto-graded
      score: null // Would contain score if auto-graded
    };
  };

  if (currentTest.length === 0) {
    return (
      <div className="technical-test-wrapper">
        <div className="no-test">
          <h2>No Technical Test Available</h2>
          <p>This position doesn't require a technical test.</p>
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            Back to Job
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="technical-test-wrapper">
      <div className="test-header">
        <div className="test-info">
          <h2>Technical Assessment</h2>
          <div className="job-id">Job ID: {jobId}</div>
        </div>
        <div className="timer">
          <i className="fas fa-clock"></i> Time Remaining: {formatTime(timeLeft)}
        </div>
      </div>

      <div className="test-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentQuestionIndex + 1) / currentTest.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="question">
          <div className="question-header">
            <span className="question-number">Question {currentQuestionIndex + 1}/{currentTest.length}</span>
            {currentQuestion.type && (
              <span className="question-type">{currentQuestion.type.replace('-', ' ')}</span>
            )}
          </div>
          
          <h3>{currentQuestion.question}</h3>
          
          {currentQuestion.type === 'essay' && (
            <div className="essay-container">
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={`Write your answer here (${currentQuestion.wordLimit} words max)`}
              />
              <div className="word-count">
                Words: {answers[currentQuestion.id] ? answers[currentQuestion.id].split(/\s+/).filter(Boolean).length : 0}/{currentQuestion.wordLimit}
              </div>
            </div>
          )}

          {currentQuestion.type === 'editing' && (
            <div className="editing-container">
              <div className="original-text">
                <h4>Original Text:</h4>
                <p>{currentQuestion.originalText}</p>
              </div>
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Write your improved version here"
              />
            </div>
          )}

          {currentQuestion.type === 'coding' && (
            <div className="code-editor">
              <select defaultValue={currentQuestion.language}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="dart">Dart</option>
              </select>
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Write your code here..."
              />
            </div>
          )}

          {currentQuestion.type === 'debugging' && (
            <div className="debugging-container">
              <div className="code-sample">
                <pre>{currentQuestion.code}</pre>
              </div>
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Explain the bugs and how to fix them..."
              />
            </div>
          )}

          {currentQuestion.type === 'short-answer' && (
            <input
              type="text"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Your answer..."
            />
          )}

          {currentQuestion.type === 'diagram' && (
            <div className="diagram-container">
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Describe your architecture diagram here..."
              />
              <p className="hint">Use text to describe components and their relationships</p>
            </div>
          )}
        </div>

        <div className="navigation">
          {currentQuestionIndex > 0 && (
            <button 
              className="nav-button previous"
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            >
              <i className="fas fa-arrow-left"></i> Previous
            </button>
          )}
          
          {currentQuestionIndex < currentTest.length - 1 ? (
            <button 
              className="nav-button next"
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            >
              Next <i className="fas fa-arrow-right"></i>
            </button>
          ) : (
            <button 
              className="submit-button"
              onClick={() => handleSubmit()}
            >
              <i className="fas fa-paper-plane"></i> Submit Test
            </button>
          )}
        </div>
      </div>

      <div className="test-warnings">
        {warningCount > 0 && (
          <div className="warning-message">
            <i className="fas fa-exclamation-triangle"></i> 
            Warnings: {warningCount}/3 (Test will auto-submit at 3 warnings)
          </div>
        )}
      </div>

      <footer className="technical-test-footer">
        <div className="footer-content">
          <p>© 2024-2025 JobQuest by Safia Bakhtawar, Yusra Bakhtawar, & Muskan Iqbal. All rights reserved.</p>
          <div className="test-security">
            <i className="fas fa-lock"></i> Secure Test Environment
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TechnicalTestMain;