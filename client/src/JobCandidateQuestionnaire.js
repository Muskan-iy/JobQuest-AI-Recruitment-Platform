import React, { useState } from "react";
import "./JobCandidateQuestionnaire.css";
import { saveTestResults } from "./api";

// Define scoring functions (replace with your actual logic)
const calculateEQScore = (answers) => {
  // Example: Sum all EQ-related answers
  return Object.values(answers).reduce((sum, val) => sum + (val.eq || 0), 0);
};

const calculateIQScore = (answers) => {
  // Example: Sum all IQ-related answers
  return Object.values(answers).reduce((sum, val) => sum + (val.iq || 0), 0);
};

const JobCandidateQuestionnaire = () => {
  const [answers, setAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [scores, setScores] = useState({ eq: 0, iq: 0 });

  const handleInputChange = (section, questionId, value) => {
    setAnswers((prev) => ({
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

  // Personality Questions (Big Five Personality Traits)
  const personalityQuestions = {
    openness: [
      { id: 1, question: "I enjoy trying new things and seeking out new experiences.", options: [1, 2, 3, 4, 5] },
      { id: 2, question: "I avoid change and prefer familiar routines.", options: [1, 2, 3, 4, 5] },
      { id: 3, question: "I enjoy exploring new ideas and concepts.", options: [1, 2, 3, 4, 5] },
      { id: 4, question: "I am very creative and enjoy expressing myself in unique ways.", options: [1, 2, 3, 4, 5] },
      { id: 5, question: "I tend to avoid abstract thinking or imaginative activities.", options: [1, 2, 3, 4, 5] },
      { id: 6, question: "I am curious about the world and like learning about new things.", options: [1, 2, 3, 4, 5] },
      { id: 7, question: "I prefer routine over novelty.", options: [1, 2, 3, 4, 5] },
      { id: 8, question: "I find art and culture very inspiring.", options: [1, 2, 3, 4, 5] },
      { id: 9, question: "I enjoy participating in discussions on a variety of topics.", options: [1, 2, 3, 4, 5] },
      { id: 10, question: "I enjoy seeing the world from different perspectives.", options: [1, 2, 3, 4, 5] }
    ],
    conscientiousness: [
      { id: 1, question: "I prefer to plan things in advance rather than being spontaneous.", options: [1, 2, 3, 4, 5] },
      { id: 2, question: "I tend to leave things to the last minute.", options: [1, 2, 3, 4, 5] },
      { id: 3, question: "I am very organized and keep track of my tasks.", options: [1, 2, 3, 4, 5] },
      { id: 4, question: "I am often very disciplined and self-controlled.", options: [1, 2, 3, 4, 5] },
      { id: 5, question: "I prefer working on long-term projects that require focus and attention to detail.", options: [1, 2, 3, 4, 5] },
      { id: 6, question: "I regularly check and update my goals and progress.", options: [1, 2, 3, 4, 5] },
      { id: 7, question: "I tend to finish tasks as soon as possible.", options: [1, 2, 3, 4, 5] },
      { id: 8, question: "I prefer having clear instructions and guidelines for my work.", options: [1, 2, 3, 4, 5] },
      { id: 9, question: "I have a strong work ethic and take my responsibilities seriously.", options: [1, 2, 3, 4, 5] },
      { id: 10, question: "I stay focused on my tasks even when distractions arise.", options: [1, 2, 3, 4, 5] }
    ],
    extraversion: [
      { id: 1, question: "I enjoy being the center of attention.", options: [1, 2, 3, 4, 5] },
      { id: 2, question: "I prefer quiet and solitary environments.", options: [1, 2, 3, 4, 5] },
      { id: 3, question: "I am energized by socializing with others.", options: [1, 2, 3, 4, 5] },
      { id: 4, question: "I find it easy to strike up conversations with strangers.", options: [1, 2, 3, 4, 5] },
      { id: 5, question: "I get restless if I am alone for too long.", options: [1, 2, 3, 4, 5] },
      { id: 6, question: "I am outgoing and enjoy meeting new people.", options: [1, 2, 3, 4, 5] },
      { id: 7, question: "I feel drained after social gatherings.", options: [1, 2, 3, 4, 5] },
      { id: 8, question: "I like being around people, even in large crowds.", options: [1, 2, 3, 4, 5] },
      { id: 9, question: "I often initiate social events or activities.", options: [1, 2, 3, 4, 5] },
      { id: 10, question: "I enjoy working in teams and collaborating with others.", options: [1, 2, 3, 4, 5] }
    ],
    agreeableness: [
      { id: 1, question: "I try to avoid conflicts and prefer to keep the peace.", options: [1, 2, 3, 4, 5] },
      { id: 2, question: "I enjoy helping others and offering assistance.", options: [1, 2, 3, 4, 5] },
      { id: 3, question: "I am quick to forgive others when they make mistakes.", options: [1, 2, 3, 4, 5] },
      { id: 4, question: "I avoid confrontation and prefer to agree with others.", options: [1, 2, 3, 4, 5] },
      { id: 5, question: "I am compassionate and care deeply about others.", options: [1, 2, 3, 4, 5] },
      { id: 6, question: "I believe in helping people without expecting anything in return.", options: [1, 2, 3, 4, 5] },
      { id: 7, question: "I often feel empathy for others in difficult situations.", options: [1, 2, 3, 4, 5] },
      { id: 8, question: "I trust others and generally assume the best in people.", options: [1, 2, 3, 4, 5] },
      { id: 9, question: "I am cooperative and enjoy working as part of a team.", options: [1, 2, 3, 4, 5] },
      { id: 10, question: "I try to understand others' perspectives before reacting.", options: [1, 2, 3, 4, 5] }
    ],
    neuroticism: [
      { id: 1, question: "I often feel anxious or nervous.", options: [1, 2, 3, 4, 5] },
      { id: 2, question: "I tend to get upset easily or experience mood swings.", options: [1, 2, 3, 4, 5] },
      { id: 3, question: "I often feel down or depressed.", options: [1, 2, 3, 4, 5] },
      { id: 4, question: "I often worry about the future or about what might go wrong.", options: [1, 2, 3, 4, 5] },
      { id: 5, question: "I find it difficult to relax and unwind.", options: [1, 2, 3, 4, 5] },
      { id: 6, question: "I often feel overwhelmed by stress.", options: [1, 2, 3, 4, 5] },
      { id: 7, question: "I tend to feel insecure about myself and my abilities.", options: [1, 2, 3, 4, 5] },
      { id: 8, question: "I get easily frustrated or irritated.", options: [1, 2, 3, 4, 5] },
      { id: 9, question: "I frequently feel like things are out of control.", options: [1, 2, 3, 4, 5] },
      { id: 10, question: "I often feel like I'm not good enough.", options: [1, 2, 3, 4, 5] }
    ]
  };

  // EQ Questions (Emotional Intelligence)
  const eqQuestions = [
    { id: 1, question: "I am aware of my emotions as I experience them.", options: [1, 2, 3, 4, 5] },
    { id: 2, question: "I can easily express how I feel to others.", options: [1, 2, 3, 4, 5] },
    { id: 3, question: "I can stay calm and focused in stressful situations.", options: [1, 2, 3, 4, 5] },
    { id: 4, question: "I am able to motivate myself when I feel down.", options: [1, 2, 3, 4, 5] },
    { id: 5, question: "I can easily understand the emotions of others.", options: [1, 2, 3, 4, 5] },
    { id: 6, question: "I know how to handle conflicts with others effectively.", options: [1, 2, 3, 4, 5] },
    { id: 7, question: "I tend to stay positive even in difficult situations.", options: [1, 2, 3, 4, 5] },
    { id: 8, question: "I am good at reading people's moods and emotions.", options: [1, 2, 3, 4, 5] },
    { id: 9, question: "I am sensitive to how my behavior affects others.", options: [1, 2, 3, 4, 5] },
    { id: 10, question: "I can quickly recover from emotional setbacks.", options: [1, 2, 3, 4, 5] }
  ];

  // IQ Questions
  const iqQuestions = [
    { id: 1, question: "What is the next number in the sequence: 2, 4, 6, 8, ...", options: [10, 12, 14, 16] },
    { id: 2, question: "If all cats are animals and some animals are dogs, are all cats dogs?", options: ["Yes", "No"] },
    { id: 3, question: "Which of these is the odd one out? 3, 5, 7, 11, 13, 15", options: [3, 5, 7, 15] },
    { id: 4, question: "What is the sum of 100 + 150 + 200?", options: [400, 450, 500, 550] },
    { id: 5, question: "Which of these is a synonym for 'happy'? Joyful, Sad, Angry, Bored", options: ["Joyful", "Sad", "Angry", "Bored"] }
  ];

  // Situational Questions
  const situationalQuestions = [
    { id: 1, question: "What would you do if you were given a project with an unrealistic deadline?", options: ["Negotiate for more time", "Complete it as best as you can", "Ask for help from teammates", "Miss the deadline"] },
    { id: 2, question: "If you saw a coworker struggling with a task, what would you do?", options: ["Offer to help them", "Ignore it", "Report them to the manager", "Wait for them to ask for help"] },
    { id: 3, question: "How would you handle a situation where your team disagrees on the best approach to a problem?", options: ["Facilitate a meeting to resolve it", "Let the majority decide", "Agree with the loudest person", "Avoid taking sides"] },
    { id: 4, question: "If you were given constructive criticism, how would you react?", options: ["Accept it gracefully", "Become defensive", "Ignore it", "Ask for more details"] },
    { id: 5, question: "What would you do if you made a mistake in a high-pressure situation?", options: ["Own up to it and correct it", "Try to cover it up", "Blame others", "Panic and freeze"] }
  ];

  return (
    <div className="questionnaire-container">
      <h1 className="questionnaire-title">Job Candidate Questionnaire</h1>
      {testCompleted ? (
        <div className="results">
          <h2>Your Results</h2>
          <p>EQ Score: {scores.eq}</p>
          <p>IQ Score: {scores.iq}</p>
        </div>
      ) : (
        <form className="questionnaire-form" onSubmit={handleSubmit}>
          {/* Personality Questions */}
          <h2 className="questionnaire-section-title">Personality Questions</h2>
          {Object.keys(personalityQuestions).map((section) => (
            <div key={section} className={`questionnaire-section ${section}`}>
              <h3 className="questionnaire-subtitle">{section.charAt(0).toUpperCase() + section.slice(1)}</h3>
              {personalityQuestions[section].map((question) => (
                <div key={question.id} className="question-item">
                  <p className="question-text">{question.question}</p>
                  {question.options.map((option) => (
                    <label key={option} className="question-option">
                      <input
                        type="radio"
                        name={`${section}-${question.id}`}
                        value={option}
                        onChange={() => handleInputChange("personality", question.id, option)}
                        className="radio-input"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          ))}

          {/* EQ Questions */}
          <h2 className="questionnaire-section-title">Emotional Intelligence (EQ)</h2>
          {eqQuestions.map((question) => (
            <div key={question.id} className="question-item">
              <p className="question-text">{question.question}</p>
              {question.options.map((option) => (
                <label key={option} className="question-option">
                  <input
                    type="radio"
                    name={`eq-${question.id}`}
                    value={option}
                    onChange={() => handleInputChange("eq", question.id, option)}
                    className="radio-input"
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}

          {/* IQ Questions */}
          <h2 className="questionnaire-section-title">Intelligence Quotient (IQ)</h2>
          {iqQuestions.map((question) => (
            <div key={question.id} className="question-item">
              <p className="question-text">{question.question}</p>
              {question.options.map((option) => (
                <label key={option} className="question-option">
                  <input
                    type="radio"
                    name={`iq-${question.id}`}
                    value={option}
                    onChange={() => handleInputChange("iq", question.id, option)}
                    className="radio-input"
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}

          {/* Situational Questions */}
          <h2 className="questionnaire-section-title">Situational Questions</h2>
          {situationalQuestions.map((question) => (
            <div key={question.id} className="question-item">
              <p className="question-text">{question.question}</p>
              {question.options.map((option) => (
                <label key={option} className="question-option">
                  <input
                    type="radio"
                    name={`situational-${question.id}`}
                    value={option}
                    onChange={() => handleInputChange("situational", question.id, option)}
                    className="radio-input"
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}

          <button type="submit" className="submit-button">Submit</button>
        </form>
      )}
    </div>
  );
};

export default JobCandidateQuestionnaire;