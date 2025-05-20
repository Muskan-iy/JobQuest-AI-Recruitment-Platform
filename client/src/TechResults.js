import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import './TechResults.css';

const TechResults = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        // First check if we have results in location state (from immediate submission)
        if (location.state?.submissionData) {
          setResults(location.state.submissionData);
          return;
        }

        // Otherwise try to load from localStorage (for demo purposes)
        const savedResults = localStorage.getItem(`testResults_${jobId}`);
        if (savedResults) {
          setResults(JSON.parse(savedResults));
          return;
        }

        // In a real app, you would fetch from your API here
        // const response = await fetch(`/api/test-results/${jobId}`);
        // const data = await response.json();
        // setResults(data);

        throw new Error('No results found');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [jobId, location.state]);

  if (loading) {
    return <div className="results-container">Loading results...</div>;
  }

  if (error) {
    return (
      <div className="results-container">
        <h2>Error Loading Results</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="results-container">
        <h2>No Results Available</h2>
        <p>Your test results could not be found.</p>
        <button onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  return (
    <div className="results-container">
      <header className="results-header">
        <h1>Test Results</h1>
        <p className="job-id">Job ID: {jobId}</p>
      </header>

      <div className="results-summary">
        <h2>Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <h3>Time Spent</h3>
            <p>{Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s</p>
          </div>
          <div className="summary-item">
            <h3>Questions Answered</h3>
            <p>{Object.keys(results.answers).length}/{results.totalQuestions || '?'}</p>
          </div>
          {results.warningCount > 0 && (
            <div className="summary-item warning">
              <h3>Warnings</h3>
              <p>{results.warningCount}</p>
            </div>
          )}
          {results.forcedSubmission && (
            <div className="summary-item alert">
              <h3>Note</h3>
              <p>Automatically submitted due to violations</p>
            </div>
          )}
        </div>
      </div>

      <div className="answers-section">
        <h2>Your Answers</h2>
        {Object.entries(results.answers).map(([questionId, answer]) => {
          const question = results.testData?.find(q => q.id === parseInt(questionId)) || {
            question: `Question ${questionId}`,
            type: 'unknown'
          };

          return (
            <div key={questionId} className="answer-card">
              <div className="question-header">
                <h3>Question {questionId}</h3>
                <span className="question-type">{question.type}</span>
              </div>
              <p className="question-text">{question.question}</p>
              
              <div className="answer-content">
                {question.type === 'coding' || question.type === 'debugging' ? (
                  <pre>{answer}</pre>
                ) : (
                  <p>{answer}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="results-footer">
        <button onClick={() => navigate('/Applicant')} className="btn-primary">
          Browse Other Jobs
        </button>
        {results.localCopy && (
          <p className="local-notice">These results are stored locally for demo purposes</p>
        )}
      </div>
    </div>
  );
};

export default TechResults;