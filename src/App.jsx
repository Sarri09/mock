import React, { useState, useEffect } from 'react';
import { useAssessment } from './useAssessment';
import questionsData from './questions.json'; 
import { BrainCircuit, Play, Clock, ChevronRight, ChevronLeft, CheckCircle2, XCircle, RotateCcw, Target, BarChart3, Home, Trophy, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MAX_QUESTIONS = 5; // Cambiar a 50 para el test real
const TIME_LIMIT = 120;  // Cambiar a 720 (12 minutos)

function App() {
  const {
    questions, currentQuestion, currentIndex, timeLeft, isActive,
    isFinished, answers, startTest, handleAnswer, nextQuestion,
    prevQuestion, finishTest
  } = useAssessment(questionsData, MAX_QUESTIONS, TIME_LIMIT);

  const [history, setHistory] = useState([]);
  const [currentView, setCurrentView] = useState('home'); // 'home' o 'dashboard'

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
      const timeSpentSeconds = TIME_LIMIT - timeLeft;
      
      const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        score: score,
        incorrect: questions.length - score,
        total: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        timeSpent: formatTime(timeSpentSeconds)
      };
      
      // Guardamos todo el historial (sin límite de 10) para el gráfico
      const updatedHistory = [newRecord, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('wonderlic_history', JSON.stringify(updatedHistory));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  // Cálculos para el Dashboard
  const bestScore = history.length > 0 ? Math.max(...history.map(h => h.percentage)) : 0;
  const avgScore = history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.percentage, 0) / history.length) : 0;
  const chartData = [...history].reverse().map((h, i) => ({
    name: `Test ${i + 1}`,
    Puntaje: h.percentage
  }));

  // VISTA 1: INICIO
  if (!isActive && !isFinished && currentView === 'home') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        
        {/* Navegación Superior */}
        <div className="absolute top-6 right-6 flex gap-4">
          <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:bg-indigo-50 transition-colors font-bold">
            <BarChart3 size={18} /> Métricas y Leaderboard
          </button>
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-100 mb-8 mt-12">
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
      </div>
    );
  }

  // VISTA 2: DASHBOARD Y METRICAS
  if (!isActive && !isFinished && currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
        <div className="max-w-5xl mx-auto">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <Activity className="text-indigo-600" size={32} /> Tu Evolución
            </h1>
            <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 bg-white text-slate-600 px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors font-bold">
              <Home size={18} /> Volver al Inicio
            </button>
          </div>

          {history.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-slate-100">
              <Target size={48} className="mx-auto text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-600">Aún no hay datos</h2>
              <p className="text-slate-400 mt-2">Completa tu primer simulacro para ver tus métricas aquí.</p>
            </div>
          ) : (
            <>
              {/* Tarjetas KPI */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="bg-blue-100 p-4 rounded-xl text-blue-600"><Target size={28} /></div>
                  <div>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Tests Completados</p>
                    <p className="text-3xl font-extrabold text-slate-800">{history.length}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600"><Trophy size={28} /></div>
                  <div>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Mejor Puntaje</p>
                    <p className="text-3xl font-extrabold text-slate-800">{bestScore}%</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="bg-indigo-100 p-4 rounded-xl text-indigo-600"><Activity size={28} /></div>
                  <div>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Promedio Global</p>
                    <p className="text-3xl font-extrabold text-slate-800">{avgScore}%</p>
                  </div>
                </div>
              </div>

              {/* Gráfico de Evolución */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 h-80">
                <h3 className="text-lg font-bold text-slate-700 mb-4 px-2">Tendencia de Aciertos (%)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="Puntaje" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Leaderboard Histórico */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-700">Leaderboard Personal</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold">Fecha y Hora</th>
                        <th className="p-4 font-semibold">Score</th>
                        <th className="p-4 font-semibold text-emerald-600">Correctas</th>
                        <th className="p-4 font-semibold text-rose-500">Incorrectas</th>
                        <th className="p-4 font-semibold">Tiempo Usado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((record, idx) => (
                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-slate-600 font-medium">
                            {record.date} <span className="text-slate-400 text-sm ml-2">{record.time}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${record.percentage >= 70 ? 'bg-emerald-100 text-emerald-700' : record.percentage >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                              {record.percentage}%
                            </span>
                          </td>
                          <td className="p-4 font-bold text-emerald-600">{record.score}</td>
                          <td className="p-4 font-bold text-rose-500">{record.incorrect}</td>
                          <td className="p-4 font-mono text-slate-600 flex items-center gap-2">
                            <Clock size={14} className="text-slate-400"/> {record.timeSpent}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // VISTA 3: RESULTADOS DEL TEST
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
                  
                  {/* --- NUEVO BLOQUE: Explicación siempre visible --- */}
                  <div className={`mt-4 p-4 rounded-xl border ${isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
                    {!isCorrect && (
                      <p className="text-sm text-slate-800 mb-2">
                        <span className="font-bold text-rose-600 uppercase text-xs tracking-wider">Correcta:</span> {q.options[q.correct_answer]}
                      </p>
                    )}
                    <p className="text-sm text-slate-700">
                      <span className={`font-bold uppercase text-xs tracking-wider mr-2 ${isCorrect ? 'text-emerald-600' : 'text-slate-500'}`}>
                        Explicación:
                      </span> 
                      {q.explanation}
                    </p>
                  </div>
                  {/* ----------------------------------------------- */}

                </div>
              )
            })}
          </div>

  // VISTA 4: EVALUACIÓN (EL TEST EN SÍ)
  // (Mantiene exactamente el mismo código visual hermoso que ya teníamos para responder)
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