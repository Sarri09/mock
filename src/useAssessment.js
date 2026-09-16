import { useState, useEffect, useCallback } from 'react';

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Quitamos los valores fijos de aquí
export const useAssessment = (allQuestions) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState({});
  const [totalTimeLimit, setTotalTimeLimit] = useState(0); // Para guardar el tiempo inicial

  // Ahora startTest recibe los parámetros de modo
  const startTest = useCallback((limit, time) => {
    const actualLimit = Math.min(allQuestions.length, limit);
    const selectedQuestions = shuffleArray(allQuestions).slice(0, actualLimit);
    
    setQuestions(selectedQuestions);
    setCurrentIndex(0);
    setTimeLeft(time);
    setTotalTimeLimit(time);
    setAnswers({});
    setIsActive(true);
    setIsFinished(false);
  }, [allQuestions]);

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
    totalTimeLimit, // Expuesto para calcular el sobrante
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