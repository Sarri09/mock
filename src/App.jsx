import React, { useState, useEffect } from 'react';
import { useAssessment } from './useAssessment';
import questionsData from './questions.json'; 
import { BrainCircuit, Play, Clock, ChevronRight, ChevronLeft, CheckCircle2, XCircle, RotateCcw, Target } from 'lucide-react';

const MAX_QUESTIONS = 5; // Cambiar a 50 para el test real
const TIME_LIMIT = 120;  // Cambiar a 720 (12 minutos)

function App() {
  const {
    questions, currentQuestion, currentIndex, timeLeft, isActive,
    isFinished, answers, startTest, handleAnswer, nextQuestion,
    prevQuestion, finishTest
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

  // VISTA 1: INICIO
  if (!isActive && !isFinished) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-100 mb-8">
          <div className="bg-indigo-100 text-indigo-600 p-5 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-inner">
            <BrainCircuit size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Simulador Wonderlic</h1>
          <p className="text-slate-500 mb-8 text-lg">
            Prueba rápida de <span className="font-bold text-indigo-600">{MAX_QUESTIONS} preguntas</span>. Evalúa lógica, matemáticas y vocabulario bajo presión.
          </p>
          <button onClick={startTest} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl w-full transition-all shadow-lg hover:shadow-indigo-500/30 text-lg">
            <Play fill="currentColor" size={20} />
            Iniciar Simulacro
          </button>
        </div>

        {history.length > 0 && (
          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100 max-w-lg w-full">
            <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Target className="text-indigo-500" />
              Tu Progreso Reciente
            </h2>
            <div className="flex flex-col gap-3">
              {history.map((record) => (
                <div key={record.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                  <span className="text-sm text-slate-500 font-medium flex items-center gap-2">
                    <Clock size={14} /> {record.date}
                  </span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-4 py-1 rounded-full">{record.score} / {record.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // VISTA 2: RESULTADOS
  if (isFinished) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-indigo-600 p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-2">¡Test Finalizado!</h2>
            <div className="text-7xl font-extrabold my-6 drop-shadow-md">{percentage}%</div>
            <p className="text-indigo-100 text-xl font-medium flex items-center justify-center gap-2">
              <CheckCircle2 /> {score} de {questions.length} correctas
            </p>
          </div>
          
          <div className="p-8 max-h-[50vh] overflow-y-auto bg-slate-50">
            {questions.map((q, idx) => {
              const isCorrect = answers[q.id] === q.correct_answer;
              return (
                <div key={q.id} className={`mb-6 p-6 border-l-8 rounded-r-2xl bg-white shadow-sm ${isCorrect ? 'border-emerald-500' : 'border-rose-500'}`}>
                  <p className="font-bold text-slate-800 text-lg mb-4 flex items-start gap-2">
                    <span className="text-slate-400">{idx + 1}.</span> {q.question}
                  </p>
                  <p className={`text-md mb-3 font-semibold flex items-center gap-2 ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    Tu respuesta: {answers[q.id] !== undefined ? q.options[answers[q.id]] : 'Sin responder'}
                  </p>
                  {!isCorrect && (
                    <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-800 mb-2">
                        <span className="font-bold text-rose-600 uppercase text-xs tracking-wider">Correcta:</span> {q.options[q.correct_answer]}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">Explicación:</span> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="p-8 bg-white border-t flex justify-center">
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 font-bold py-3 px-8 rounded-xl transition-all shadow-sm text-lg w-full md:w-auto">
              <RotateCcw size={20} /> Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VISTA 3: EVALUACIÓN
  return (
    <div className="min-h-screen bg-slate-50 p-4 pt-8 md:pt-12 font-sans flex justify-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col">
        
        <div className="bg-white px-8 py-6 border-b border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-sm">Pregunta {currentIndex + 1} de {questions.length}</span>
            <span className={`font-mono text-2xl font-extrabold flex items-center gap-2 px-4 py-1 rounded-xl ${timeLeft < 30 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-700'}`}>
              <Clock size={20} className={timeLeft < 30 ? 'text-rose-500' : 'text-slate-400'} />
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div className="bg-indigo-600 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="p-8 md:p-12 flex-grow">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-10 leading-snug">{currentQuestion?.question}</h3>
          <div className="flex flex-col gap-4">
            {currentQuestion?.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQuestion.id, idx)}
                className={`w-full p-5 text-left border-2 rounded-2xl transition-all duration-200 text-lg font-medium flex items-center ${
                  answers[currentQuestion.id] === idx 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-md transform scale-[1.01]' 
                    : 'border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <span className={`inline-block w-10 h-10 rounded-xl text-center leading-10 mr-5 font-bold border-2 shrink-0 transition-colors ${answers[currentQuestion.id] === idx ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}>
                  {['A', 'B', 'C', 'D', 'E'][idx]}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <button 
            onClick={prevQuestion} 
            disabled={currentIndex === 0} 
            className="px-6 py-3 font-bold text-slate-500 disabled:opacity-30 hover:text-indigo-600 transition-colors flex items-center gap-2 bg-white border border-slate-200 rounded-xl hover:border-indigo-200"
          >
            <ChevronLeft size={20} /> Anterior
          </button>
          
          {currentIndex === questions.length - 1 ? (
             <button onClick={finishTest} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 text-lg flex items-center gap-2">
               Finalizar <CheckCircle2 size={20} />
             </button>
          ) : (
             <button onClick={nextQuestion} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 text-lg flex items-center gap-2">
               Siguiente <ChevronRight size={20} />
             </button>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default App;