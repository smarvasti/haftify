import React, { useState, useEffect } from 'react';
import { QuestionProgress } from '@/types/questions';

interface RightSidebarProps {
  progress: QuestionProgress[];
  questions: { id: string; points: number }[];
  settings: {
    showOnlyWrongAnswers: boolean;
    progressBarType: 'catalog' | 'module' | 'category';
  };
  onUpdateSettings: (settings: { 
    showOnlyWrongAnswers: boolean;
    progressBarType: 'catalog' | 'module' | 'category';
  }) => void;
  onResetProgress: () => void;
  time: number;
  onTimeUpdate: (time: number) => void;
  isTimerRunning: boolean;
  onTimerRunningChange: (isRunning: boolean) => void;
  onSelectQuestion: (questionId: string) => void;
}

export default function RightSidebar({ 
  progress, 
  questions = [],
  settings = {
    showOnlyWrongAnswers: false,
    progressBarType: 'catalog'
  },
  onUpdateSettings,
  onResetProgress,
  time,
  onTimeUpdate,
  isTimerRunning,
  onTimerRunningChange,
  onSelectQuestion
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'statistics' | 'settings'>('statistics');
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const startTimer = () => {
    if (!isTimerRunning) {
      const id = setInterval(() => {
        onTimeUpdate(time + 1);
      }, 1000);
      setIntervalId(id);
      onTimerRunningChange(true);
    }
  };

  const pauseTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    onTimerRunningChange(false);
  };

  const resetTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    onTimerRunningChange(false);
    onTimeUpdate(0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Berechne die Statistiken
  const calculateStatistics = () => {
    const totalQuestions = questions.length;
    const attemptedQuestions = progress.length;
    const correctAnswers = progress.filter(p => p.isCorrect).length;
    const incorrectAnswers = progress.filter(p => !p.isCorrect).length;
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = progress.reduce((sum, p) => {
      const question = questions.find(q => q.id === p.questionId);
      return sum + (p.isCorrect && question ? question.points : 0);
    }, 0);

    return {
      totalProgress: Math.round((attemptedQuestions / totalQuestions) * 100),
      correctAnswers,
      incorrectAnswers,
      totalQuestions,
      earnedPoints,
      totalPoints,
      attemptedQuestions
    };
  };

  const stats = calculateStatistics();
  const circumference = 2 * Math.PI * 45;
  
  // Berechne die Offsets für die Kreissegmente
  const correctOffset = circumference - (stats.correctAnswers / stats.totalQuestions) * circumference;
  const incorrectOffset = circumference - ((stats.correctAnswers + stats.incorrectAnswers) / stats.totalQuestions) * circumference;
  const unansweredOffset = 0; // Wird als erstes gezeichnet und braucht keinen Offset

  const handleResetProgress = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    onResetProgress();
    setShowResetConfirm(false);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const handleSettingsChange = (newSettings: typeof settings) => {
    onUpdateSettings(newSettings);
    
    // Wenn der Filter für falsche Antworten aktiviert wird
    if (newSettings.showOnlyWrongAnswers) {
      // Finde die erste falsch beantwortete Frage
      const firstWrongQuestion = questions.find(question => {
        const questionProgress = progress.find(p => p.questionId === question.id);
        return questionProgress && !questionProgress.isCorrect;
      });

      if (firstWrongQuestion) {
        // Setze den Index auf die erste falsche Frage
        const wrongQuestions = questions.filter(question => {
          const questionProgress = progress.find(p => p.questionId === question.id);
          return questionProgress && !questionProgress.isCorrect;
        });
        const questionIndex = wrongQuestions.findIndex(q => q.id === firstWrongQuestion.id);
        // Setze den Index über die Props
        onSelectQuestion(firstWrongQuestion.id);
      }
    }
  };

  return (
    <div className="w-80 bg-white h-screen shadow-lg flex flex-col">
      {/* Tabs - Fixiert */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="flex">
          <button
            className={`flex-1 py-4 text-sm font-medium transition-colors
              ${activeTab === 'statistics' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('statistics')}
          >
            Statistiken
          </button>
          <button
            className={`flex-1 py-4 text-sm font-medium transition-colors
              ${activeTab === 'settings' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('settings')}
          >
            Einstellungen
          </button>
        </div>
      </div>

      {/* Scrollbarer Bereich */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'statistics' ? (
          <div className="space-y-6">
            {/* Fortschritts-Card */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Gesamtfortschritt</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                {/* Kreisdiagramm */}
                <div className="relative w-[120px] h-[120px] mx-auto">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Basis-Kreis */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className="stroke-gray-200"
                      fill="none"
                      strokeWidth="10"
                    />
                    
                    {/* Offene Fragen (grau) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className="stroke-gray-300"
                      fill="none"
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={unansweredOffset}
                      style={{
                        transition: 'stroke-dashoffset 0.5s ease-in-out',
                      }}
                    />
                    
                    {/* Falsche Antworten (rot) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className="stroke-red-500"
                      fill="none"
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={incorrectOffset}
                      style={{
                        transition: 'stroke-dashoffset 0.5s ease-in-out',
                      }}
                    />
                    
                    {/* Richtige Antworten (grün) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className="stroke-green-500"
                      fill="none"
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={correctOffset}
                      style={{
                        transition: 'stroke-dashoffset 0.5s ease-in-out',
                      }}
                    />
                  </svg>
                  
                  {/* Prozentanzeige */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-700">
                      {stats.totalProgress}%
                    </span>
                  </div>
                </div>

                {/* Legende */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Richtig</span>
                    </div>
                    <span>{stats.correctAnswers} <span className="text-gray-500">({Math.round((stats.correctAnswers / stats.totalQuestions) * 100)}%)</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Falsch</span>
                    </div>
                    <span>{stats.incorrectAnswers} <span className="text-gray-500">({Math.round((stats.incorrectAnswers / stats.totalQuestions) * 100)}%)</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span>Offen</span>
                    </div>
                    <span>{stats.totalQuestions - stats.attemptedQuestions} <span className="text-gray-500">({Math.round(((stats.totalQuestions - stats.attemptedQuestions) / stats.totalQuestions) * 100)}%)</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Prüfungstimer</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold text-gray-700 font-mono">
                    {formatTime(time)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={isTimerRunning ? pauseTimer : startTimer}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium text-white ${
                      isTimerRunning 
                        ? 'bg-yellow-500 hover:bg-yellow-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    } transition-colors`}
                  >
                    {isTimerRunning ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Punkteübersicht */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Punkteübersicht</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Erreichte Punkte:</span>
                  <span className="font-medium text-green-600">{stats.earnedPoints}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Gesamtpunkte:</span>
                  <span className="font-medium">{stats.totalPoints}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>Erreichte Punktzahl:</span>
                    <span>{Math.round((stats.earnedPoints / stats.totalPoints) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reset Progress Button */}
            <div className="mt-6">
              <button
                onClick={handleResetProgress}
                className="w-full py-2 px-4 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Fortschritte zurücksetzen
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Einstellungen</h3>
            
            <div className="space-y-4">
              {/* Toggle für falsch beantwortete Fragen */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Nur falsch beantwortete Fragen anzeigen
                </span>
                <button
                  onClick={() => handleSettingsChange({ 
                    ...settings, 
                    showOnlyWrongAnswers: !settings.showOnlyWrongAnswers 
                  })}
                  className={`${
                    settings.showOnlyWrongAnswers ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
                >
                  <span
                    className={`${
                      settings.showOnlyWrongAnswers ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                  />
                </button>
              </div>
              
              {/* Fortschrittsbalken-Einstellung */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fortschrittsbalken zeigt an:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={settings.progressBarType === 'catalog'}
                      onChange={() => onUpdateSettings({
                        ...settings,
                        progressBarType: 'catalog'
                      })}
                      className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Gesamtfortschritt im Katalog</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={settings.progressBarType === 'module'}
                      onChange={() => onUpdateSettings({
                        ...settings,
                        progressBarType: 'module'
                      })}
                      className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Fortschritt im aktuellen Modul</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={settings.progressBarType === 'category'}
                      onChange={() => onUpdateSettings({
                        ...settings,
                        progressBarType: 'category'
                      })}
                      className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Fortschritt in der aktuellen Kategorie</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Fortschritte zurücksetzen?
            </h4>
            <p className="text-sm text-gray-600 mb-6">
              Sind Sie sicher, dass Sie alle Fortschritte für diesen Katalog zurücksetzen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmReset}
                className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Ja, zurücksetzen
              </button>
              <button
                onClick={cancelReset}
                className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 