import React, { useState, useEffect } from 'react';
import { useAssessment } from './useAssessment';
import questionsData from './questions.json'; 

function App() {
  const {
    questions,
    currentQuestion,
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
  } = useAssessment(questionsData, 5, 120); // Mantenemos 5 preguntas / 2 min para probar rápido

  // 1. Nuevo estado para el historial
  const [history, setHistory] = useState([]);

  // 2. Cargar el historial al iniciar la app
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('wonderlic_history')) || [];
    setHistory(savedHistory);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++;
    });
    return correct;
  };

  // 3. Efecto para guardar el score automáticamente cuando el test termina
  useEffect(() => {
    if (isFinished) {
      const score = calculateScore();
      const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        score: score,
        total: questions.length
      };
      
      // Guardamos el nuevo registro y mantenemos solo los últimos 10 para no saturar
      const updatedHistory = [newRecord, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('wonderlic_history', JSON.stringify(updatedHistory));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]); // Solo se ejecuta cuando isFinished cambia a true

  if (!isActive && !isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border-t-4 border-blue-600 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Simulador Wonderlic</h1>
          <p className="text-gray-600 mb-6">Prueba de {questions.length} preguntas. Evalúa lógica, matemáticas y vocabulario bajo presión.</p>
          <button onClick={startTest} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full transition-colors shadow-sm">
            Iniciar Simulacro
          </button>
        </div>

        {/* 4. Nueva sección visual: Historial de Intentos */}
        {history.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Tu Progreso (Últimos 10)</h2>
            <div className="flex flex-col gap-3">
              {history.map((record) => (
                <div key={record.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                  <span className="text-sm text-gray-500">{record.date}</span>
                  <span className="font-bold text-blue-600">{record.score} / {record.total} aciertos</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isFinished) {
    const score = calculateScore();
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Test Finalizado!</h2>
          <p className="text-xl text-gray-600 mb-6">Tu puntuación: <span className="font-bold text-blue-600">{score} de {questions.length}</span></p>
          
          <div className="text-left mb-6 max-h-[50vh] overflow-y-auto pr-2">
            {questions.map((q, idx) => (
              <div key={q.id} className="mb-4 p-4 border rounded bg-gray-50">
                <p className="font-semibold">{idx + 1}. {q.question}</p>
                <p className={`text-sm mt-2 ${answers[q.id] === q.correct_answer ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}>
                  Tu respuesta: {answers[q.id] !== undefined ? q.options[answers[q.id]] : 'Sin responder'}
                </p>
                {answers[q.id] !== q.correct_answer && (
                  <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded border"><span className="font-semibold text-gray-900">Explicación:</span> <br/><span className="italic">{q.explanation}</span></p>
                )}
              </div>
            ))}
          </div>

          <button onClick={() => window.location.reload()} className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2 px-6 rounded transition-colors w-full sm:w-auto">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-10">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border p-6 md:p-10">
        
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <span className="font-semibold text-gray-500">Pregunta {currentIndex + 1} de {questions.length}</span>
          <span className={`font-mono text-xl font-bold ${timeLeft < 30 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
            ⏱ {formatTime(timeLeft)}
          </span>
        </div>

        <div className="mb-8 min-h-[200px]">
          <h3 className="text-xl md:text-2xl font-medium text-gray-800 mb-6">{currentQuestion?.question}</h3>
          <div className="flex flex-col gap-3">
            {currentQuestion?.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQuestion.id, idx)}
                className={`p-4 text-left border rounded-lg transition-all ${
                  answers[currentQuestion.id] === idx 
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200 font-medium' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t mt-auto">
          <button 
            onClick={prevQuestion} 
            disabled={currentIndex === 0} 
            className="px-6 py-2 border rounded text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            Anterior
          </button>
          
          {currentIndex === questions.length - 1 ? (
             <button onClick={finishTest} className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition-colors shadow-sm">
               Finalizar
             </button>
          ) : (
             <button onClick={nextQuestion} className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors shadow-sm">
               Siguiente
             </button>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default App;