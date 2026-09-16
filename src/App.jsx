import React, { useState, useEffect } from 'react';
import { useAssessment } from './useAssessment';
import questionsData from './questions.json'; 
import { BrainCircuit, Play, Clock, ChevronRight, ChevronLeft, CheckCircle2, XCircle, RotateCcw, Target, BarChart3, Home, Trophy, Activity, Eye, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const {
    questions, currentQuestion, currentIndex, timeLeft, totalTimeLimit, isActive,
    isFinished, answers, startTest, handleAnswer, nextQuestion,
    prevQuestion, finishTest
  } = useAssessment(questionsData);

  const [history, setHistory] = useState([]);
  const [currentView, setCurrentView] = useState('home'); // 'home' o 'dashboard'
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // NUEVO: Estado para saber si estamos en práctica o simulacro real
  const [testMode, setTestMode] = useState('practice'); 

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
      const timeSpentSeconds = totalTimeLimit - timeLeft;
      
      const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        score: score,
        incorrect: questions.length - score,
        total: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        timeSpent: formatTime(timeSpentSeconds),
        mode: testMode, // Guardamos el modo del test (practice o real)
        testQuestions: questions,
        userAnswers: answers
      };
      
      const updatedHistory = [newRecord, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('wonderlic_history', JSON.stringify(updatedHistory));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  // VISTA 1: INICIO
  if (!isActive && !isFinished && currentView === 'home') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
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
            Selecciona tu modo de entrenamiento. Evalúa lógica, matemáticas y vocabulario bajo presión.
          </p>
          
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => { setTestMode('practice'); startTest(5, 120); }} 
              className="flex items-center justify-center gap-2 bg-white border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold py-4 px-8 rounded-xl w-full transition-all text-lg shadow-sm"
            >
              <Play fill="currentColor" size={20} />
              Práctica (5 Pregs / 2 Min)
            </button>

            <button 
              onClick={() => { setTestMode('real'); startTest(50, 720); }} 
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl w-full transition-all shadow-lg hover:shadow-indigo-500/30 text-lg"
            >
              <Target size={20} />
              Simulacro Oficial (50 Pregs / 12 Min)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VISTA 2: DASHBOARD Y METRICAS DIVIDIDAS
  if (!isActive && !isFinished && currentView === 'dashboard') {
    
    // Separar los datos para las gráficas
    const practiceHistory = history.filter(h => h.mode === 'practice');
    const realHistory = history.filter(h => h.mode === 'real');

    // Función auxiliar para formatear datos de Recharts
    const formatChartData = (data) => {
      return [...data].reverse().map((h, i) => ({
        name: `T${i + 1}`,
        Puntaje: h.percentage
      }));
    };

    const MetricsPanel = ({ title, data, colorClass, isReal }) => {
      const avg = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.percentage, 0) / data.length) : 0;
      const best = data.length > 0 ? Math.max(...data.map(h => h.percentage)) : 0;
      const chartData = formatChartData(data);

      return (
        <div className={`bg-white p-6 rounded-3xl shadow-sm border-2 ${isReal ? 'border-rose-100' : 'border-indigo-100'} flex flex-col gap-6`}>
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className={`text-xl font-bold ${colorClass}`}>{title}</h3>
            <span className="text-slate-400 text-sm font-bold bg-slate-100 px-3 py-1 rounded-full">{data.length} intentos</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Promedio</p>
              <p className="text-2xl font-black text-slate-700">{avg}%</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mejor</p>
              <p className="text-2xl font-black text-slate-700">{best}%</p>
            </div>
          </div>

          <div className="h-48 w-full mt-2">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="Puntaje" stroke={isReal ? '#f43f5e' : '#6366f1'} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 font-medium">Sin datos suficientes</div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans relative">
        
        {/* MODAL DE DETALLES (Permanece igual) */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Target className="text-indigo-600" />
                    Detalle de Evaluación
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Realizado el {selectedRecord.date} a las {selectedRecord.time} • Puntuación: {selectedRecord.score}/{selectedRecord.total}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedRecord(null)} 
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700"
                >
                  <X size={28} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-grow bg-slate-50">
                {selectedRecord.testQuestions?.map((q, idx) => {
                  const isCorrect = selectedRecord.userAnswers[q.id] === q.correct_answer;
                  return (
                    <div key={q.id} className={`mb-6 p-6 border-l-8 rounded-r-2xl bg-white shadow-sm ${isCorrect ? 'border-emerald-500' : 'border-rose-500'}`}>
                      <p className="font-bold text-slate-800 text-lg mb-4 flex items-start gap-2">
                        <span className="text-slate-400">{idx + 1}.</span> {q.question}
                      </p>
                      <p className={`text-md mb-3 font-semibold flex items-center gap-2 ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        Tu respuesta: {selectedRecord.userAnswers[q.id] !== undefined ? q.options[selectedRecord.userAnswers[q.id]] : 'Sin responder'}
                      </p>
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
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <Activity className="text-indigo-600" size={32} /> Tu Evolución
            </h1>
            <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 bg-white text-slate-600 px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors font-bold">
              <Home size={18} /> Volver
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
              {/* PANALES DIVIDIDOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <MetricsPanel 
                  title="Modo Práctica (5 Qs)" 
                  data={practiceHistory} 
                  colorClass="text-indigo-600" 
                  isReal={false} 
                />
                <MetricsPanel 
                  title="Test Real (50 Qs)" 
                  data={realHistory} 
                  colorClass="text-rose-600" 
                  isReal={true} 
                />
              </div>

              {/* TABLA HISTÓRICA */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-700">Historial Completo</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold">Fecha</th>
                        <th className="p-4 font-semibold">Modo</th>
                        <th className="p-4 font-semibold">Score</th>
                        <th className="p-4 font-semibold text-emerald-600">✓</th>
                        <th className="p-4 font-semibold text-rose-500">✗</th>
                        <th className="p-4 font-semibold">Tiempo</th>
                        <th className="p-4 font-semibold text-center">Detalle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-slate-600 font-medium">
                            {record.date} <span className="text-slate-400 text-sm ml-1">{record.time}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.mode === 'real' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                              {record.mode === 'real' ? 'REAL' : 'PRÁCTICA'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${record.percentage >= 70 ? 'bg-emerald-100 text-emerald-700' : record.percentage >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                              {record.percentage}%
                            </span>
                          </td>
                          <td className="p-4 font-bold text-emerald-600">{record.score}</td>
                          <td className="p-4 font-bold text-rose-500">{record.incorrect}</td>
                          <td className="p-4 font-mono text-slate-600 flex items-center gap-1">
                            <Clock size={14} className="text-slate-400"/> {record.timeSpent}
                          </td>
                          <td className="p-4 text-center">
                            {record.testQuestions ? (
                              <button 
                                onClick={() => setSelectedRecord(record)}
                                className="p-2 bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors inline-flex"
                              >
                                <Eye size={18} />
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 italic">-</span>
                            )}
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

  // VISTA 3: RESULTADOS DEL TEST (Permanece igual)
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
                </div>
              )
            })}
          </div>

          <div className="p-8 bg-white border-t flex justify-center gap-4 flex-col md:flex-row">
            <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 font-bold py-3 px-8 rounded-xl transition-all shadow-sm text-lg w-full md:w-auto">
              <RotateCcw size={20} /> Reintentar
            </button>
            <button onClick={() => { startTest(); finishTest(); setCurrentView('dashboard'); window.location.reload() }} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-sm text-lg w-full md:w-auto">
              <BarChart3 size={20} /> Ver Métricas
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VISTA 4: EVALUACIÓN (Permanece igual)
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