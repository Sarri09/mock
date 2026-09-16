import React, { useState, useEffect } from 'react';
import { useAssessment } from './useAssessment';
import questionsData from './questions.json'; 

// Configuración rápida (Cambia a 50 y 720 cuando estés listo para el test real)
const MAX_QUESTIONS = 5;
const TIME_LIMIT = 120;

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
  } = useAssessment(questionsData, MAX_QUESTIONS, TIME_LIMIT);

  const [history, setHistory] = useState([]);

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

  useEffect(() => {
    if (isFinished) {
      const score = calculateScore();
      const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        score: score,
        total: questions.length
      };
      
      const updatedHistory = [newRecord, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('wonderlic_history', JSON.stringify(updatedHistory));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  if (!isActive && !isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-8 border-indigo-600 mb-8 transform transition-all">
          <div className="bg-indigo-100 text-indigo-700 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Simulador Wonderlic</h1>
          <p className="text-slate-600 mb-8 text-lg">Prueba rápida de <span className="font-bold text-indigo-600">{MAX_QUESTIONS} preguntas</span>. Evalúa lógica, matemáticas y vocabulario bajo presión.</p>
          <button onClick={startTest} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl w-full transition-all shadow-lg hover:shadow-indigo-500/30 text-lg">
            Iniciar Simulacro
          </button>
        </div>

        {history.length > 0 && (
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              Tu Progreso Reciente
            </h2>
            <div className="flex flex-col gap-3">
              {history.map((record) => (
                <div key={record.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                  <span className="text-sm text-slate-500 font-medium">{record.date}</span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{record.score} / {record.total} aciertos</span>
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
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 p-10 text-center text-white">
            <h2 className="text-3xl font-bold mb-2">¡Test Finalizado!</h2>
            <div className="text-7xl font-extrabold my-6">{percentage}%</div>
            <p className="text-indigo-100 text-xl font-medium">Puntuación: {score} de {questions.length} correctas</p>
          </div>
          
          <div className="p-8 max-h-[50vh] overflow-y-auto">
            {questions.map((q, idx) => {
              const isCorrect = answers[q.id] === q.correct_answer;
              return (
                <div key={q.id} className={`mb-6 p-6 border-l-8 rounded-r-xl bg-slate-50 shadow-sm ${isCorrect ? 'border-emerald-500' : 'border-rose-500'}`}>
                  <p className="font-bold text-slate-800 text-lg mb-4">{idx + 1}. {q.question}</p>
                  <p className={`text-md mb-3 font-semibold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Tu respuesta: {answers[q.id] !== undefined ? q.options[answers[q.id]] : 'Sin responder'}
                  </p>
                  {!isCorrect && (
                    <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-800 mb-2"><span className="font-bold text-rose-600 uppercase text-xs tracking-wider">Respuesta Correcta:</span> <br/>{q.options[q.correct_answer]}</p>
                      <p className="text-sm text-slate-600"><span className="font-bold uppercase text-xs tracking-wider">Explicación:</span> <br/>{q.explanation}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="p-6 bg-slate-50 border-t flex justify-center">
            <button onClick={() => window.location.reload()} className="bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-8 rounded-xl transition-colors shadow-sm text-lg w-full md:w-auto">
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 pt-8 md:pt-12 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header con barra de progreso */}
        <div className="bg-white px-8 py-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-sm">Pregunta {currentIndex + 1} de {questions.length}</span>
            <span className={`font-mono text-2xl font-extrabold px-4 py-1 rounded-lg ${timeLeft < 30 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-800'}`}>
              ⏱ {formatTime(timeLeft)}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
          </div>
        </div>

        {/* Body de la Pregunta */}
        <div className="p-8 md:p-10 min-h-[350px]">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 leading-snug">{currentQuestion?.question}</h3>
          <div className="flex flex-col gap-4">
            {currentQuestion?.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQuestion.id, idx)}
                className={`w-full p-5 text-left border-2 rounded-xl transition-all duration-200 text-lg font-medium shadow-sm flex items-center ${
                  answers[currentQuestion.id] === idx 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-4 ring-indigo-500/10 transform scale-[1.01]' 
                    : 'border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50 hover:shadow'
                }`}
              >
                <span className={`inline-block w-8 h-8 rounded-full text-center leading-8 mr-4 font-bold border shrink-0 ${answers[currentQuestion.id] === idx ? 'bg-indigo-200 text-indigo-700 border-indigo-300' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {['A', 'B', 'C', 'D', 'E'][idx]}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Footer de Navegación */}
        <div className="px-8 py-6 bg-slate-50 border-t flex justify-between items-center">
          <button 
            onClick={prevQuestion} 
            disabled={currentIndex === 0} 
            className="px-6 py-3 font-bold text-slate-600 disabled:opacity-30 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Anterior
          </button>
          
          {currentIndex === questions.length - 1 ? (
             <button onClick={finishTest} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/40 text-lg">
               Finalizar Test
             </button>
          ) : (
             <button onClick={nextQuestion} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/40 text-lg flex items-center gap-2">
               Siguiente
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
             </button>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default App;