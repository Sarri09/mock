import { useState, useEffect, useCallback } from 'react';

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useAssessment = (allQuestions, questionsPerTest = 50, initialTime = 720) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime); 
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState({});

  const startTest = useCallback(() => {
    // Para probar, si tenemos menos preguntas en el JSON que el máximo, usamos las que hay
    const limit = Math.min(allQuestions.length, questionsPerTest);
    const selectedQuestions = shuffleArray(allQuestions).slice(0, limit);
    
    setQuestions(selectedQuestions);
    setCurrentIndex(0);
    setTimeLeft(initialTime);
    setAnswers({});
    setIsActive(true);
    setIsFinished(false);
  }, [allQuestions, questionsPerTest, initialTime]);

  useEffect(() => {
    let timer = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const prevQuestion = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const finishTest = () => {
    setIsActive(false);
    setIsFinished(true);
  };

  return {
    questions,
    currentQuestion: questions[currentIndex],
    currentIndex,
    timeLeft,
    isActive,
    isFinished,
    answers,
    startTest,
    handleAnswer,
    nextQuestion,
    prevQuestion,
    finishTest
  };
};