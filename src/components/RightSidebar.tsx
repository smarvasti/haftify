import React, { useState } from 'react';
import { QuestionProgress } from '@/types/questions';

interface RightSidebarProps {
  progress: QuestionProgress[];
  settings: {
    showOnlyWrongAnswers: boolean;
  };
  onUpdateSettings: (settings: { showOnlyWrongAnswers: boolean }) => void;
}

export default function RightSidebar({ 
  progress, 
  settings,
  onUpdateSettings 
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'statistics' | 'settings'>('statistics');

  // Berechne die Statistiken
  const calculateStatistics = () => {
    const total = progress.length;
    const correct = progress.filter(p => p.isCorrect).length;
    const incorrect = total - correct;
    const percentageComplete = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      correct,
      incorrect,
      total,
      percentageComplete
    };
  };

  const stats = calculateStatistics();
  const circumference = 2 * Math.PI * 45;
  const correctOffset = (stats.correct / (stats.total || 1)) * circumference;
  const incorrectOffset = (stats.incorrect / (stats.total || 1)) * circumference;

  return (
    <div className="w-80 bg-white h-screen shadow-lg overflow-y-auto flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
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

      {/* Tab Inhalte */}
      <div className="flex-1 p-6">
        {activeTab === 'statistics' ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Gesamtfortschritt</h3>
            
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
                
                {/* Falsche Antworten */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-red-500"
                  fill="none"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - incorrectOffset}
                  style={{
                    transition: 'stroke-dashoffset 0.5s ease-in-out',
                  }}
                />
                
                {/* Richtige Antworten */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-green-500"
                  fill="none"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - correctOffset}
                  style={{
                    transition: 'stroke-dashoffset 0.5s ease-in-out',
                  }}
                />
              </svg>
              
              {/* Prozentanzeige */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-700">
                  {stats.percentageComplete}%
                </span>
              </div>
            </div>

            {/* Legende */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Richtig</span>
                </div>
                <span>{stats.correct} Fragen</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Falsch</span>
                </div>
                <span>{stats.incorrect} Fragen</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Einstellungen</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">
                  Nur falsch beantwortete Fragen anzeigen
                </label>
                <button
                  onClick={() => onUpdateSettings({ 
                    ...settings, 
                    showOnlyWrongAnswers: !settings.showOnlyWrongAnswers 
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.showOnlyWrongAnswers ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.showOnlyWrongAnswers ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
              
              {/* Platz für weitere Einstellungen */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 