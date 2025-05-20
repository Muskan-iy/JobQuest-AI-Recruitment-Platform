import React from 'react';
import './PersonalityResults.css';

const PersonalityResults = ({ responses }) => {
  // Calculate personality trait scores
  const calculatePersonalityTraits = () => {
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const traitScores = {};
    
    traits.forEach(trait => {
      const traitQuestions = responses.personality 
        ? Object.entries(responses.personality)
            .filter(([key]) => key.startsWith(trait))
            .map(([_, value]) => parseInt(value))
        : [];
      
      traitScores[trait] = traitQuestions.length > 0 
        ? Math.round((traitQuestions.reduce((sum, val) => sum + val, 0) / (traitQuestions.length * 5) * 100))
        : 0;
    });
    
    return traitScores;
  };

  // Calculate section percentages
  const calculateSectionPercentage = (section, totalQuestions) => {
    const answeredQuestions = responses[section] ? Object.keys(responses[section]).length : 0;
    return Math.min(100, Math.round((answeredQuestions / totalQuestions) * 100));
  };

  // Calculate overall scores
  const personalityTraits = calculatePersonalityTraits();
  const personalityPercentage = calculateSectionPercentage('personality', 75);
  const eqPercentage = calculateSectionPercentage('eq', 20);
  const iqPercentage = calculateSectionPercentage('iq', 15);
  const situationalPercentage = calculateSectionPercentage('situational', 15);

  // Calculate overall completion
  const totalCompletion = Math.round(
    (Object.keys(responses.personality || {}).length +
    Object.keys(responses.eq || {}).length +
    Object.keys(responses.iq || {}).length +
    Object.keys(responses.situational || {}).length) / 125 * 100
  );

  const calculateIQScore = () => {
    if (!responses.iq) return 0;
    
    const correctAnswers = {
      1: 15,     
      2: "Some roses fade quickly",
      3: "carrot",
      4: 25,
      5: "sphere",
      6: "Tuesday",
      7: 10,
      8: "All Bloops are Lazzies",
      9: 100,
      10: "Stingy",
      11: "No",
      12: 128,
      13: "Accommodate",
      14: 5,
      15: 39
    };
    
    let correctCount = 0;
    Object.entries(responses.iq).forEach(([questionId, answer]) => {
      if (correctAnswers[questionId] === answer) {
        correctCount++;
      }
    });
    
    return Math.round((correctCount / 15) * 100);
  };

  const iqScore = calculateIQScore();

  return (
    <div className="results-calculation-container">
      <h2 className="results-calculation-title">Your Assessment Results</h2>
      <p className="results-calculation-subtitle">Detailed breakdown of your assessment scores</p>
      
      <div className="results-calculation-overview">
        <div className="results-calculation-overview-item">
          <h3>Overall Completion</h3>
          <div className="results-calculation-progress">
            <div 
              className="results-calculation-progress-bar"
              style={{ width: `${totalCompletion}%` }}
            ></div>
          </div>
          <span>{totalCompletion}%</span>
        </div>
      </div>
      
      <div className="results-calculation-sections">
        {/* Personality Section */}
        <div className="results-calculation-section personality-section">
          <h3>Personality Traits</h3>
          <p className="results-calculation-completion">
            Questions answered: {Object.keys(responses.personality || {}).length}/75 ({personalityPercentage}%)
          </p>
          
          <div className="results-calculation-traits">
            {Object.entries(personalityTraits).map(([trait, score]) => (
              <div key={trait} className="results-calculation-trait">
                <h4>{trait.charAt(0).toUpperCase() + trait.slice(1)}</h4>
                <div className="results-calculation-progress">
                  <div 
                    className="results-calculation-progress-bar"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                <span>{score}%</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* EQ Section */}
        <div className="results-calculation-section eq-section">
          <h3>Emotional Intelligence (EQ)</h3>
          <p className="results-calculation-completion">
            Questions answered: {Object.keys(responses.eq || {}).length}/20 ({eqPercentage}%)
          </p>
          
          <div className="results-calculation-score">
            <div className="results-calculation-progress-circle">
              <svg viewBox="0 0 36 36" className="results-calculation-circular-chart">
                <path
                  className="results-calculation-circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="results-calculation-circle"
                  strokeDasharray={`${eqPercentage}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="results-calculation-circle-text">
                  {eqPercentage}%
                </text>
              </svg>
            </div>
            <p className="results-calculation-feedback">
              {eqPercentage >= 80 
                ? "Excellent emotional awareness and regulation skills"
                : eqPercentage >= 60
                ? "Good emotional intelligence with room for growth"
                : "Consider developing emotional intelligence skills further"}
            </p>
          </div>
        </div>
        
        {/* IQ Section */}
        <div className="results-calculation-section iq-section">
          <h3>Cognitive Ability (IQ)</h3>
          <p className="results-calculation-completion">
            Questions answered: {Object.keys(responses.iq || {}).length}/15 ({iqPercentage}%)
          </p>
          <p className="results-calculation-accuracy">
            Accuracy: {iqScore}%
          </p>
          
          <div className="results-calculation-iq-score">
            <div className="results-calculation-iq-meter">
              <div 
                className="results-calculation-iq-indicator"
                style={{ left: `${iqScore}%` }}
              ></div>
              <div className="results-calculation-iq-labels">
                <span>Low</span>
                <span>Average</span>
                <span>High</span>
                <span>Very High</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Situational Section */}
        <div className="results-calculation-section situational-section">
          <h3>Situational Judgment</h3>
          <p className="results-calculation-completion">
            Questions answered: {Object.keys(responses.situational || {}).length}/15 ({situationalPercentage}%)
          </p>
          
          <div className="results-calculation-situation-feedback">
            <h4>Response Patterns:</h4>
            <ul>
              <li>
                <strong>Collaboration:</strong> {
                  countResponsePattern(responses.situational, ['Confront them privately', 'Have a private conversation', 'Express your concerns professionally'])
                } instances
              </li>
              <li>
                <strong>Assertiveness:</strong> {
                  countResponsePattern(responses.situational, ['Bring it up with your manager', 'Report it through proper channels', 'Insist they adapt'])
                } instances
              </li>
              <li>
                <strong>Avoidance:</strong> {
                  countResponsePattern(responses.situational, ['Ignore it to avoid conflict', 'Withdraw from the discussion', 'Say nothing'])
                } instances
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to count specific response patterns
const countResponsePattern = (responses, patterns) => {
  if (!responses) return 0;
  return Object.values(responses).filter(response => 
    patterns.some(pattern => response.includes(pattern))
  ).length;
};

export default PersonalityResults;