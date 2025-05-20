import React, { useState } from "react";
import "./JobCandidateQuestionnaire.css";
import PersonalityResults from "./PersonalityResults";
import { saveTestResults } from "./api";

const JobCandidateQuestionnaire = () => {
  const [responses, setResponses] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (section, questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [questionId]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const eqScore = calculateEQScore(answers);
    const iqScore = calculateIQScore(answers);
    setScores({ eq: eqScore, iq: iqScore });
    
    try {
      await saveTestResults({
        candidate_id: localStorage.getItem('userId'),
        eq_score: eqScore,
        iq_score: iqScore
      });
      setTestCompleted(true);
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  };

  const handleBackToQuestionnaire = () => {
    setShowResults(false);
  };

  const nextTab = () => {
    if (activeTab < 6) setActiveTab(activeTab + 1);
  };

  const prevTab = () => {
    if (activeTab > 0) setActiveTab(activeTab - 1);
  };

  const completion = {
    personality: Math.min(100, Math.round((Object.keys(responses.personality || {}).length / 75) * 100)),
    eq:          Math.min(100, Math.round((Object.keys(responses.eq           || {}).length / 20) * 100)),
    iq:          Math.min(100, Math.round((Object.keys(responses.iq           || {}).length / 15) * 100)),
    situational: Math.min(100, Math.round((Object.keys(responses.situational || {}).length / 15) * 100)),
  };

  const totalCompletion = Math.round(
    (Object.keys(responses.personality || {}).length +
    Object.keys(responses.eq || {}).length +
    Object.keys(responses.iq || {}).length +
    Object.keys(responses.situational || {}).length) / 125 * 100
  );

  const personalityQuestions = {
    openness: [
      { id: 1, question: "I have a vivid imagination and enjoy daydreaming.", options: [1, 2, 3, 4, 5] },
      { id: 2, question: "I prefer variety over routine in my daily life.", options: [1, 2, 3, 4, 5] },
      { id: 3, question: "I enjoy philosophical discussions and abstract thinking.", options: [1, 2, 3, 4, 5] },
      { id: 4, question: "I appreciate art, poetry, and music deeply.", options: [1, 2, 3, 4, 5] },
      { id: 5, question: "I seek out new cultural experiences like foreign films or ethnic foods.", options: [1, 2, 3, 4, 5] },
      { id: 6, question: "I enjoy brainstorming and coming up with creative solutions.", options: [1, 2, 3, 4, 5] },
      { id: 7, question: "I like to challenge conventional ways of thinking.", options: [1, 2, 3, 4, 5] },
      { id: 8, question: "I'm fascinated by theoretical concepts and ideas.", options: [1, 2, 3, 4, 5] },
      { id: 9, question: "I enjoy exploring unfamiliar places without a set itinerary.", options: [1, 2, 3, 4, 5] },
      { id: 10, question: "I often think about the meaning and purpose of life.", options: [1, 2, 3, 4, 5] },
      { id: 11, question: "I enjoy learning about different cultures and traditions.", options: [1, 2, 3, 4, 5] },
      { id: 12, question: "I frequently come up with unconventional ideas.", options: [1, 2, 3, 4, 5] },
      { id: 13, question: "I enjoy experimenting with different ways of doing things.", options: [1, 2, 3, 4, 5] },
      { id: 14, question: "I often think about how things could be improved or changed.", options: [1, 2, 3, 4, 5] },
      { id: 15, question: "I enjoy discussing hypothetical scenarios and possibilities.", options: [1, 2, 3, 4, 5] }
    ],
    conscientiousness: [
      { id: 1, question: "I make detailed plans before starting any important task.", options: [1, 2, 3, 4, 5] },
      { id: 2, question: "I keep my living and working spaces neat and organized.", options: [1, 2, 3, 4, 5] },
      { id: 3, question: "I follow through on my commitments without needing reminders.", options: [1, 2, 3, 4, 5] },
      { id: 4, question: "I pay close attention to details in my work.", options: [1, 2, 3, 4, 5] },
      { id: 5, question: "I prioritize tasks effectively to meet deadlines.", options: [1, 2, 3, 4, 5] },
      { id: 6, question: "I maintain a regular schedule for work and personal activities.", options: [1, 2, 3, 4, 5] },
      { id: 7, question: "I think carefully before making important decisions.", options: [1, 2, 3, 4, 5] },
      { id: 8, question: "I set clear goals and work systematically toward them.", options: [1, 2, 3, 4, 5] },
      { id: 9, question: "I double-check my work to ensure accuracy.", options: [1, 2, 3, 4, 5] },
      { id: 10, question: "I complete tasks thoroughly before moving on to new ones.", options: [1, 2, 3, 4, 5] },
      { id: 11, question: "I prepare in advance for important meetings or events.", options: [1, 2, 3, 4, 5] },
      { id: 12, question: "I keep track of important dates and deadlines.", options: [1, 2, 3, 4, 5] },
      { id: 13, question: "I follow established procedures and guidelines.", options: [1, 2, 3, 4, 5] },
      { id: 14, question: "I take my responsibilities very seriously.", options: [1, 2, 3, 4, 5] },
      { id: 15, question: "I persist with challenging tasks until they're completed.", options: [1, 2, 3, 4, 5] }
    ],
    extraversion: [
      { id: 1, question: "I enjoy being in large social gatherings.", options: [1, 2, 3, 4, 5] },
      { id: 2, question: "I often take the lead in group situations.", options: [1, 2, 3, 4, 5] },
      { id: 3, question: "I feel energized after spending time with people.", options: [1, 2, 3, 4, 5] },
      { id: 4, question: "I enjoy being the center of attention at social events.", options: [1, 2, 3, 4, 5] },
      { id: 5, question: "I make new friends easily in unfamiliar settings.", options: [1, 2, 3, 4, 5] },
      { id: 6, question: "I enjoy lively conversations with many participants.", options: [1, 2, 3, 4, 5] },
      { id: 7, question: "I often initiate social activities with friends.", options: [1, 2, 3, 4, 5] },
      { id: 8, question: "I feel comfortable speaking in front of groups.", options: [1, 2, 3, 4, 5] },
      { id: 9, question: "I enjoy networking and meeting new people professionally.", options: [1, 2, 3, 4, 5] },
      { id: 10, question: "I prefer working in teams rather than alone.", options: [1, 2, 3, 4, 5] },
      { id: 11, question: "I express my thoughts and feelings openly.", options: [1, 2, 3, 4, 5] },
      { id: 12, question: "I enjoy fast-paced, stimulating environments.", options: [1, 2, 3, 4, 5] },
      { id: 13, question: "I often seek out social interactions when possible.", options: [1, 2, 3, 4, 5] },
      { id: 14, question: "I feel comfortable approaching strangers.", options: [1, 2, 3, 4, 5] },
      { id: 15, question: "I enjoy participating in group activities and events.", options: [1, 2, 3, 4, 5] }
    ],
    agreeableness: [
      { id: 1, question: "I often put others' needs before my own.", options: [1, 2, 3, 4, 5] },
      { id: 2, question: "I believe people are generally trustworthy.", options: [1, 2, 3, 4, 5] },
      { id: 3, question: "I avoid arguments and confrontations.", options: [1, 2, 3, 4, 5] },
      { id: 4, question: "I feel sympathy for those who are less fortunate.", options: [1, 2, 3, 4, 5] },
      { id: 5, question: "I enjoy helping others solve their problems.", options: [1, 2, 3, 4, 5] },
      { id: 6, question: "I give people the benefit of the doubt.", options: [1, 2, 3, 4, 5] },
      { id: 7, question: "I try to be polite and considerate in my interactions.", options: [1, 2, 3, 4, 5] },
      { id: 8, question: "I value cooperation over competition.", options: [1, 2, 3, 4, 5] },
      { id: 9, question: "I often compromise to maintain harmony.", options: [1, 2, 3, 4, 5] },
      { id: 10, question: "I enjoy volunteering for charitable causes.", options: [1, 2, 3, 4, 5] },
      { id: 11, question: "I avoid criticizing others even when warranted.", options: [1, 2, 3, 4, 5] },
      { id: 12, question: "I believe in giving second chances.", options: [1, 2, 3, 4, 5] },
      { id: 13, question: "I try to understand others' perspectives.", options: [1, 2, 3, 4, 5] },
      { id: 14, question: "I feel distressed when others are suffering.", options: [1, 2, 3, 4, 5] },
      { id: 15, question: "I go out of my way to make others feel comfortable.", options: [1, 2, 3, 4, 5] }
    ],
    neuroticism: [
      { id: 1, question: "I often feel tense or on edge.", options: [1, 2, 3, 4, 5] },
      { id: 2, question: "I worry about things more than most people.", options: [1, 2, 3, 4, 5] },
      { id: 3, question: "I frequently feel overwhelmed by my emotions.", options: [1, 2, 3, 4, 5] },
      { id: 4, question: "I take criticism very personally.", options: [1, 2, 3, 4, 5] },
      { id: 5, question: "I often feel inadequate compared to others.", options: [1, 2, 3, 4, 5] },
      { id: 6, question: "I struggle to let go of negative experiences.", options: [1, 2, 3, 4, 5] },
      { id: 7, question: "I frequently feel self-conscious in social situations.", options: [1, 2, 3, 4, 5] },
      { id: 8, question: "I experience mood swings throughout the day.", options: [1, 2, 3, 4, 5] },
      { id: 9, question: "I often feel like things are going wrong.", options: [1, 2, 3, 4, 5] },
      { id: 10, question: "I have trouble controlling my worries.", options: [1, 2, 3, 4, 5] },
      { id: 11, question: "I frequently feel nervous without clear reason.", options: [1, 2, 3, 4, 5] },
      { id: 12, question: "I tend to dwell on my mistakes.", options: [1, 2, 3, 4, 5] },
      { id: 13, question: "I often feel vulnerable or insecure.", options: [1, 2, 3, 4, 5] },
      { id: 14, question: "I get easily frustrated when things don't go my way.", options: [1, 2, 3, 4, 5] },
      { id: 15, question: "I frequently feel emotionally drained.", options: [1, 2, 3, 4, 5] }
    ]
  };

  // Expanded EQ Questions (Emotional Intelligence)
  const eqQuestions = [
    { id: 1, question: "I can accurately identify my emotions as I experience them.", options: [1, 2, 3, 4, 5] },
    { id: 2, question: "I recognize how my emotions affect my thoughts and behavior.", options: [1, 2, 3, 4, 5] },
    { id: 3, question: "I can remain calm under pressure without becoming overwhelmed.", options: [1, 2, 3, 4, 5] },
    { id: 4, question: "I can motivate myself to complete tasks even when I don't feel like it.", options: [1, 2, 3, 4, 5] },
    { id: 5, question: "I can sense the emotional atmosphere in a room when I enter.", options: [1, 2, 3, 4, 5] },
    { id: 6, question: "I can tell when someone is masking their true emotions.", options: [1, 2, 3, 4, 5] },
    { id: 7, question: "I adjust my communication style based on who I'm speaking with.", options: [1, 2, 3, 4, 5] },
    { id: 8, question: "I can de-escalate tense situations effectively.", options: [1, 2, 3, 4, 5] },
    { id: 9, question: "I can recover quickly from emotional setbacks or disappointments.", options: [1, 2, 3, 4, 5] },
    { id: 10, question: "I can accurately interpret nonverbal cues from others.", options: [1, 2, 3, 4, 5] },
    { id: 11, question: "I can separate my emotional reactions from logical decision-making.", options: [1, 2, 3, 4, 5] },
    { id: 12, question: "I can help others identify and articulate their emotions.", options: [1, 2, 3, 4, 5] },
    { id: 13, question: "I can maintain positive relationships even during conflicts.", options: [1, 2, 3, 4, 5] },
    { id: 14, question: "I can anticipate how my actions will affect others emotionally.", options: [1, 2, 3, 4, 5] },
    { id: 15, question: "I can balance emotional expression with professional appropriateness.", options: [1, 2, 3, 4, 5] },
    { id: 16, question: "I can recognize when I'm becoming emotionally overwhelmed.", options: [1, 2, 3, 4, 5] },
    { id: 17, question: "I can adapt my emotional responses to different situations.", options: [1, 2, 3, 4, 5] },
    { id: 18, question: "I can maintain emotional stability during times of change.", options: [1, 2, 3, 4, 5] },
    { id: 19, question: "I can express my emotions clearly and appropriately.", options: [1, 2, 3, 4, 5] },
    { id: 20, question: "I can use emotional understanding to motivate and inspire others.", options: [1, 2, 3, 4, 5] }
  ];

  // Expanded IQ Questions
  const iqQuestions = [
    { id: 1, question: "What is the next number in the sequence: 3, 6, 9, 12, ...", options: [15, 18, 21, 24] },
    { id: 2, question: "If all roses are flowers and some flowers fade quickly, then:", options: ["Some roses fade quickly", "No roses fade quickly", "All roses fade quickly", "None of the above"] },
    { id: 3, question: "Which word doesn't belong: apple, banana, carrot, orange", options: ["apple", "banana", "carrot", "orange"] },
    { id: 4, question: "If a shirt costs $20 after a 20% discount, what was its original price?", options: ["$22", "$24", "$25", "$28"] },
    { id: 5, question: "Which shape is most different: circle, square, triangle, sphere", options: ["circle", "square", "triangle", "sphere"] },
    { id: 6, question: "If today is Monday, what day will it be in 15 days?", options: ["Tuesday", "Wednesday", "Thursday", "Friday"] },
    { id: 7, question: "Which number is the odd one out: 10, 25, 36, 49, 64", options: [10, 25, 36, 49] },
    { id: 8, question: "If all Bloops are Razzies and all Razzies are Lazzies, then:", options: ["All Bloops are Lazzies", "All Lazzies are Bloops", "Some Bloops are not Lazzies", "None of the above"] },
    { id: 9, question: "What is 40% of 250?", options: [80, 90, 100, 110] },
    { id: 10, question: "Which word is the opposite of 'generous'?", options: ["Kind", "Stingy", "Friendly", "Polite"] },
    { id: 11, question: "If the first two statements are true, is the third statement true? All birds can fly. Penguins are birds. Penguins can fly.", options: ["Yes", "No", "Maybe", "Not enough information"] },
    { id: 12, question: "What is the missing number: 8, 16, 32, 64, ?", options: [96, 112, 128, 144] },
    { id: 13, question: "Which word is spelled correctly?", options: ["Accomodate", "Acommodate", "Accommodate", "Acomodate"] },
    { id: 14, question: "If 5 workers can complete a task in 10 hours, how long would 10 workers take?", options: [2, 5, 7, 10] },
    { id: 15, question: "Which of these is not a prime number?", options: [17, 23, 31, 39] }
  ];

  // Expanded Situational Questions
  const situationalQuestions = [
    { id: 1, question: "If you noticed a coworker consistently taking credit for your ideas in meetings, how would you handle it?", options: ["Confront them privately about the behavior", "Start documenting your ideas before sharing them", "Bring it up with your manager", "Ignore it to avoid conflict"] },
    { id: 2, question: "You're working on a tight deadline when a colleague asks for urgent help with their project. What do you do?", options: ["Politely explain your deadline and offer to help later", "Drop your work to assist them immediately", "Suggest they ask someone else", "Work overtime to help them after completing your tasks"] },
    { id: 3, question: "Your manager gives you negative feedback that you believe is unfair. How do you respond?", options: ["Ask for specific examples to understand their perspective", "Defend yourself by explaining why they're wrong", "Accept the feedback without comment", "Discuss it with coworkers to get their opinion"] },
    { id: 4, question: "You discover a serious mistake in a project that was completed weeks ago. What's your course of action?", options: ["Immediately inform your supervisor and propose solutions", "Try to fix it quietly without telling anyone", "Blame the team member responsible for that part", "Wait to see if anyone notices before taking action"] },
    { id: 5, question: "During a team brainstorming session, your idea is repeatedly dismissed. How do you proceed?", options: ["Politely but firmly restate your idea with supporting arguments", "Withdraw from the discussion and stay quiet", "Get visibly frustrated and argue your point", "Wait until after the meeting to share your idea privately"] },
    { id: 6, question: "You're assigned to work with someone who has very different working styles. How do you adapt?", options: ["Find common ground and establish mutual expectations", "Insist they adapt to your preferred working style", "Complain to your manager about the mismatch", "Work separately as much as possible"] },
    { id: 7, question: "A client makes unreasonable demands that would require working weekends. What do you do?", options: ["Negotiate priorities and set realistic expectations", "Agree to meet all demands to keep the client happy", "Flatly refuse the additional work", "Say yes but then miss the deadlines"] },
    { id: 8, question: "You notice a senior colleague breaking company policy. How do you respond?", options: ["Document the incident and report it through proper channels", "Confront the colleague directly about their behavior", "Ignore it since they're senior to you", "Discuss it with other coworkers first"] },
    { id: 9, question: "Your workload has become unmanageable. What's your approach?", options: ["Prioritize tasks and discuss options with your manager", "Work longer hours to try to complete everything", "Let quality slip on less important tasks", "Complain to coworkers about being overworked"] },
    { id: 10, question: "You strongly disagree with a company policy change. How do you handle this?", options: ["Express your concerns professionally through appropriate channels", "Publicly criticize the change to colleagues", "Quietly resist implementing the change", "Look for another job immediately"] },
    { id: 11, question: "A team member isn't pulling their weight on a group project. What do you do?", options: ["Have a private conversation to understand and offer help", "Do their share of the work to ensure success", "Report them to management immediately", "Call them out in a team meeting"] },
    { id: 12, question: "You're asked to complete a task you've never done before with no training. How do you proceed?", options: ["Research how to do it and ask targeted questions", "Pretend you know how and figure it out as you go", "Refuse the task due to lack of experience", "Ask someone else to do it for you"] },
    { id: 13, question: "Your manager praises you for work a colleague actually did. What's your response?", options: ["Correct the record and give proper credit", "Accept the praise but tell your colleague privately", "Say nothing and enjoy the recognition", "Make sure your colleague knows you got credit"] },
    { id: 14, question: "You're given responsibility for a failing project. What's your first step?", options: ["Analyze what's wrong and develop a recovery plan", "Blame previous leadership for the problems", "Make drastic changes immediately", "Distance yourself from potential failure"] },
    { id: 15, question: "A coworker shares confidential information with you. How do you respond?", options: ["Remind them of confidentiality policies", "Listen but don't share the information further", "Use the information to your advantage", "Spread the information to other colleagues"] }
  ];

  const tabLabels = ['Welcome', 'Personality', 'EQ', 'IQ', 'Situational', 'Review', 'Submit'];

  if (showResults) {
    return (
      <div className="results-page-container">
        <PersonalityResults responses={responses} />
        <button 
          onClick={handleBackToQuestionnaire}
          className="back-to-questionnaire-btn"
        >
          Back to Questionnaire
        </button>
      </div>
    );
  }

  return (
    <div className="questionnaire-container">
      {/* Sidebar */}
      <div className="questionnaire-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Personality Assessment</h2>
          <p className="sidebar-subtitle">Complete all sections</p>
        </div>

        <div className="sidebar-progress">
          <h3 className="progress-title">Your Progress</h3>
          <div className="progress-item">
            <div className="progress-label">
              <span>Overall Completion</span>
              <span>{totalCompletion}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${totalCompletion}%` }}></div>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-label">
              <span>Emotional IQ</span>
              <span>{completion.eq}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completion.eq}%` }}></div>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-label">
              <span>Cognitive IQ</span>
              <span>{completion.iq}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completion.iq}%` }}></div>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-label">
              <span>Situational</span>
              <span>{completion.situational}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completion.situational}%` }}></div>
            </div>
          </div>
        </div>

        <div className="sidebar-instructions">
          <h4>Quick Guide</h4>
          <p>Rate statements from 1 (Strongly Disagree) to 5 (Strongly Agree).</p>
          <p>For IQ questions, select the single correct answer.</p>
          <p>Choose how you'd likely respond in situational scenarios.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="questionnaire-main">
        <h1 className="questionnaire-title">Job Candidate Assessment</h1>
        <p className="questionnaire-subtitle">Complete all sections to finish your application</p>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          {tabLabels.map((label, index) => (
            <div 
              key={index}
              className={`progress-step ${activeTab === index ? 'active' : ''} ${index < activeTab ? 'completed' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-label">{label}</div>
            </div>
          ))}
        </div>

        <form className="questionnaire-form" onSubmit={handleSubmit}>
          {/* Welcome Tab */}
          {activeTab === 0 && (
            <div className="tab-content welcome-tab">
              <h2>Welcome to Your Assessment</h2>
              <div className="instructions">
                <p>This comprehensive assessment helps us understand your:</p>
                <ul>
                  <li>Personality Traits across 5 key dimensions</li>
                  <li>Emotional Intelligence (EQ) capabilities</li>
                  <li>Cognitive Abilities (IQ)</li>
                  <li>Behavioral Responses to workplace situations</li>
                </ul>
                
                <h3>How to Respond:</h3>
                <div className="rating-scale">
                  <div className="scale-item">
                    <span className="scale-number">1</span>
                    <span className="scale-label">Strongly Disagree / Most Unlikely</span>
                  </div>
                  <div className="scale-item">
                    <span className="scale-number">2</span>
                    <span className="scale-label">Disagree / Unlikely</span>
                  </div>
                  <div className="scale-item">
                    <span className="scale-number">3</span>
                    <span className="scale-label">Neutral / Occasionally</span>
                  </div>
                  <div className="scale-item">
                    <span className="scale-number">4</span>
                    <span className="scale-label">Agree / Likely</span>
                  </div>
                  <div className="scale-item">
                    <span className="scale-number">5</span>
                    <span className="scale-label">Strongly Agree / Most Likely</span>
                  </div>
                </div>
                
                <div className="time-estimate">
                  <p>⏱️ Estimated completion time: 20-30 minutes</p>
                </div>
              </div>
            </div>
          )}

          {/* Personality Tab */}
          {activeTab === 1 && (
            <div className="tab-content">
              <h2>Personality Assessment</h2>
              <p>Rate how accurately each statement describes you:</p>
              
              {Object.keys(personalityQuestions).map((section) => (
                <div key={section} className={`questionnaire-section ${section}`}>
                  <h3>{section.charAt(0).toUpperCase() + section.slice(1)}</h3>
                  {personalityQuestions[section].map((question) => (
                    <div key={question.id} className="question-item">
                      <p className="question-text">{question.question}</p>
                      <div className="options-container">
                        {question.options.map((option) => (
                          <label key={option} className="question-option">
                            <input
                              type="radio"
                              name={`${section}-${question.id}`}
                              value={option}
                              checked={responses.personality?.[`${section}-${question.id}`] === option}
                              onChange={() => handleInputChange("personality", `${section}-${question.id}`, option)}
                              className="radio-input"
                              required={activeTab === 1}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* EQ Tab */}
          {activeTab === 2 && (
            <div className="tab-content">
              <h2>Emotional Intelligence (EQ)</h2>
              <p>Rate how accurately each statement describes you:</p>
              
              {eqQuestions.map((question) => (
                <div key={question.id} className="question-item">
                  <p className="question-text">{question.question}</p>
                  <div className="options-container">
                    {question.options.map((option) => (
                      <label key={option} className="question-option">
                        <input
                          type="radio"
                          name={`eq-${question.id}`}
                          value={option}
                          checked={responses.eq?.[question.id] === option}
                          onChange={() => handleInputChange("eq", question.id, option)}
                          className="radio-input"
                          required={activeTab === 2}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* IQ Tab */}
          {activeTab === 3 && (
            <div className="tab-content">
              <h2>Cognitive Ability (IQ)</h2>
              <p>Select the correct answer for each question:</p>
              
              {iqQuestions.map((question) => (
                <div key={question.id} className="question-item">
                  <p className="question-text">{question.question}</p>
                  <div className="options-container">
                    {question.options.map((option) => (
                      <label key={option} className="question-option">
                        <input
                          type="radio"
                          name={`iq-${question.id}`}
                          value={option}
                          checked={responses.iq?.[question.id] === option}
                          onChange={() => handleInputChange("iq", question.id, option)}
                          className="radio-input"
                          required={activeTab === 3}
                        />
                        {typeof option === 'number' ? option : option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Situational Tab */}
          {activeTab === 4 && (
            <div className="tab-content">
              <h2>Situational Judgment</h2>
              <p>Select how you would most likely respond in each scenario:</p>
              
              {situationalQuestions.map((question) => (
                <div key={question.id} className="question-item">
                  <p className="question-text">{question.question}</p>
                  <div className="options-container">
                    {question.options.map((option) => (
                      <label key={option} className="question-option">
                        <input
                          type="radio"
                          name={`situational-${question.id}`}
                          value={option}
                          checked={responses.situational?.[question.id] === option}
                          onChange={() => handleInputChange("situational", question.id, option)}
                          className="radio-input"
                          required={activeTab === 4}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Review Tab */}
          {activeTab === 5 && (
            <div className="tab-content review-tab">
              <h2>Review Your Responses</h2>
              <p>Please review your answers before submitting:</p>
              
              <div className="response-summary">
                <h3>Personality Questions Answered:</h3>
                <p>{Object.keys(responses.personality || {}).length} / 75</p>
                
                <h3>EQ Questions Answered:</h3>
                <p>{Object.keys(responses.eq || {}).length} / 20</p>
                
                <h3>IQ Questions Answered:</h3>
                <p>{Object.keys(responses.iq || {}).length} / 15</p>
                
                <h3>Situational Questions Answered:</h3>
                <p>{Object.keys(responses.situational || {}).length} / 15</p>
              </div>
              
              <div className="completion-notice">
                {totalCompletion === 100 ? (
                  <p className="complete">✔️ All questions answered - ready to submit!</p>
                ) : (
                  <p className="incomplete">⚠️ You have unanswered questions - please complete all sections</p>
                )}
              </div>
            </div>
          )}

          {/* Submit Tab */}
          {activeTab === 6 && (
            <div className="tab-content submit-tab">
              <h2>Submit Your Assessment</h2>
              <div className="submission-instructions">
                <p>By submitting your assessment:</p>
                <ul>
                  <li>Your responses will be finalized</li>
                  <li>Our team will review your results</li>
                  <li>We'll contact you within 3-5 business days</li>
                </ul>
                
                <div className="confirmation-checkbox">
                  <label>
                    <input type="checkbox" required />
                    I confirm these responses accurately represent me
                  </label>
                </div>
              </div>
            </div>
          )}

           {/* Navigation Buttons */}
           <div className="navigation-buttons">
            {activeTab > 0 && (
              <button type="button" className="nav-button prev-button" onClick={prevTab}>
                Previous
              </button>
            )}
            
            {activeTab < 6 ? (
              <button type="button" className="nav-button next-button" onClick={nextTab}>
                {activeTab === 0 ? 'Begin Assessment' : 'Next Section'}
              </button>
            ) : (
              <button 
                type="submit" 
                className="nav-button submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Footer */}
      <footer className="questionnaire-footer">
        <div className="questionnaire-footer-content">
          <p>© 2024-2025 JobQuest by Safia Bakhtawar, Yusra Bakhtawar, & Muskan Iqbal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default JobCandidateQuestionnaire;