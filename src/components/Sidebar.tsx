import React, { useState } from 'react';
import { Catalog, QuestionProgress } from '@/types/questions';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProfileModal from './ProfileModal';

interface SidebarProps {
  catalogs: Catalog[];
  currentCatalogId: string;
  currentModuleId: string;
  currentCategoryId: string;
  currentQuestionId: string;
  progress: QuestionProgress[];
  onSelectCatalog: (catalogId: string) => void;
  onSelectModule: (moduleId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectQuestion: (questionId: string) => void;
}

export default function Sidebar({
  catalogs,
  currentCatalogId,
  currentModuleId,
  currentCategoryId,
  currentQuestionId,
  progress,
  onSelectCatalog,
  onSelectModule,
  onSelectCategory,
  onSelectQuestion,
}: SidebarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { userProfile, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Fehler beim Ausloggen:', error);
    }
  };

  const getQuestionStatus = (questionId: string) => {
    const questionProgress = progress.find(p => p.questionId === questionId);
    if (!questionProgress) return 'not-attempted';
    return questionProgress.isCorrect ? 'correct' : 'incorrect';
  };

  const getCategoryProgress = (categoryId: string, questions: { id: string }[]) => {
    const categoryQuestions = questions.map(q => progress.find(p => p.questionId === q.id));
    const attempted = categoryQuestions.filter(q => q).length;
    const correct = categoryQuestions.filter(q => q?.isCorrect).length;
    return { attempted, correct, total: questions.length };
  };

  return (
    <>
      <div className="w-80 bg-white h-screen shadow-lg overflow-y-auto flex flex-col">
        {/* Benutzer-Profil */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              {/* Profilbild mit den Initialen des Benutzers */}
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-lg font-medium">
                  {userProfile?.displayName
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase() || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-medium text-gray-900 truncate">
                  {userProfile?.displayName || 'Unbekannter Benutzer'}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {userProfile?.email || 'Keine E-Mail'}
                </p>
              </div>
              {/* Dropdown-Pfeil */}
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  isUserMenuOpen ? 'transform rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Benutzermenü Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profil bearbeiten
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Ausloggen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <h2 className="text-lg font-semibold mb-4">Prüfungskataloge</h2>
          
          <div className="space-y-4">
            {catalogs.map((catalog) => (
              <div key={catalog.id} className="space-y-2 border-b border-gray-100 pb-4 last:border-b-0">
                <div className="space-y-2">
                  <button
                    onClick={() => onSelectCatalog(catalog.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      currentCatalogId === catalog.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Katalog-Icon mit dynamischer Farbe */}
                      <svg 
                        className={`w-5 h-5 ${
                          currentCatalogId === catalog.id
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                      </svg>
                      <span className="flex-1">
                        {catalog.title} ({catalog.year})
                      </span>
                    </div>
                  </button>
                  
                  {/* Fortschrittsbalken für den Katalog */}
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden ml-10">
                    {(() => {
                      const catalogQuestions = catalog.modules.flatMap(m => 
                        m.categories.flatMap(c => c.questions)
                      );
                      const answered = catalogQuestions.filter(q => 
                        progress.some(p => p.questionId === q.id)
                      ).length;
                      const correct = catalogQuestions.filter(q => 
                        progress.some(p => p.questionId === q.id && p.isCorrect)
                      ).length;
                      const total = catalogQuestions.length;
                      
                      return (
                        <>
                          <div 
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ 
                              width: `${(correct / total) * 100}%`,
                              float: 'left'
                            }}
                          />
                          <div 
                            className="h-full bg-red-500 transition-all duration-300"
                            style={{ 
                              width: `${((answered - correct) / total) * 100}%`,
                              float: 'left'
                            }}
                          />
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* Fortschrittsinfo */}
                  <div className="text-xs text-gray-500 flex justify-between px-1 ml-10">
                    {(() => {
                      const catalogQuestions = catalog.modules.flatMap(m => 
                        m.categories.flatMap(c => c.questions)
                      );
                      const correct = catalogQuestions.filter(q => 
                        progress.some(p => p.questionId === q.id && p.isCorrect)
                      ).length;
                      const incorrect = catalogQuestions.filter(q => 
                        progress.some(p => p.questionId === q.id && !p.isCorrect)
                      ).length;
                      const total = catalogQuestions.length;
                      
                      return (
                        <>
                          <span>{correct} richtig</span>
                          <span>{incorrect} falsch</span>
                          <span>{total - correct - incorrect} offen</span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {currentCatalogId === catalog.id && (
                  <div className="ml-10 space-y-2">
                    {catalog.modules.map((module) => (
                      <div key={module.id} className="space-y-2">
                        <button
                          onClick={() => onSelectModule(module.id)}
                          className={`w-full text-left p-2 rounded-lg transition-colors ${
                            currentModuleId === module.id
                              ? 'bg-blue-50 text-blue-600'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {module.title}
                        </button>

                        {currentModuleId === module.id && (
                          <div className="ml-6 space-y-1">
                            {module.categories.map((category) => (
                              <div key={category.id} className="space-y-1">
                                <button
                                  onClick={() => onSelectCategory(category.id)}
                                  className={`w-full text-left p-2 text-sm rounded-lg transition-colors ${
                                    currentCategoryId === category.id
                                      ? 'bg-gray-100 text-blue-600'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span>{category.title}</span>
                                    <span className="text-xs text-gray-500">
                                      {(() => {
                                        const { attempted, correct, total } = getCategoryProgress(category.id, category.questions);
                                        return `${correct}/${total}`;
                                      })()}
                                    </span>
                                  </div>
                                </button>

                                {currentCategoryId === category.id && (
                                  <div className="ml-6 space-y-1">
                                    {category.questions.map((question) => (
                                      <button
                                        key={question.id}
                                        onClick={() => onSelectQuestion(question.id)}
                                        className={`w-full text-left p-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                                          currentQuestionId === question.id
                                            ? 'bg-gray-50 text-blue-600'
                                            : 'hover:bg-gray-50'
                                        }`}
                                      >
                                        {/* Status-Indikator */}
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                          getQuestionStatus(question.id) === 'correct'
                                            ? 'bg-green-500'
                                            : getQuestionStatus(question.id) === 'incorrect'
                                            ? 'bg-red-500'
                                            : 'bg-gray-300'
                                        }`} />
                                        
                                        <span className="truncate">
                                          Frage {question.id} ({question.points} {question.points === 1 ? 'Punkt' : 'Punkte'})
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setIsUserMenuOpen(false);
        }}
      />
    </>
  );
} 