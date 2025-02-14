import React, { useState } from 'react';
import { Catalog, QuestionProgress } from '@/types/questions';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SidebarProps {
  catalogs: Catalog[];
  currentCatalogId: string;
  currentModuleId: string;
  currentCategoryId: string;
  currentQuestionId: string;
  progress: QuestionProgress[];
  settings: {
    showOnlyWrongAnswers: boolean;
    progressBarType: 'catalog' | 'module' | 'category';
  };
  onSelectCatalog: (catalogId: string) => void;
  onSelectModule: (moduleId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectQuestion: (questionId: string) => void;
}

interface Question {
  id: string;
  points: number;
}

interface Category {
  id: string;
  title: string;
  questions: Question[];
}

interface Module {
  id: string;
  title: string;
  categories: Category[];
}

export default function Sidebar({
  catalogs,
  currentCatalogId,
  currentModuleId,
  currentCategoryId,
  currentQuestionId,
  progress,
  settings,
  onSelectCatalog,
  onSelectModule,
  onSelectCategory,
  onSelectQuestion,
}: SidebarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const { userProfile, logout } = useAuth();

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

  const getModuleProgress = (module: { categories: { id: string, questions: { id: string }[] }[] }) => {
    let totalQuestions = 0;
    let answeredQuestions = 0;

    module.categories.forEach(category => {
      const categoryQuestions = category.questions.map(q => progress.find(p => p.questionId === q.id));
      totalQuestions += category.questions.length;
      answeredQuestions += categoryQuestions.filter(q => q).length;
    });

    const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
    return `${percentage}%`;
  };

  const getModuleDetailedProgress = (module: { categories: { id: string, questions: { id: string }[] }[] }) => {
    let totalQuestions = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;

    module.categories.forEach(category => {
      const categoryQuestions = category.questions.map(q => progress.find(p => p.questionId === q.id));
      totalQuestions += category.questions.length;
      correctAnswers += categoryQuestions.filter(q => q?.isCorrect).length;
      incorrectAnswers += categoryQuestions.filter(q => q && !q.isCorrect).length;
    });

    const unanswered = totalQuestions - correctAnswers - incorrectAnswers;
    
    return {
      total: totalQuestions,
      correct: correctAnswers,
      incorrect: incorrectAnswers,
      unanswered: unanswered,
      correctPercent: (correctAnswers / totalQuestions) * 100,
      incorrectPercent: (incorrectAnswers / totalQuestions) * 100,
      unansweredPercent: (unanswered / totalQuestions) * 100
    };
  };

  // Neue Filterfunktionen
  const hasIncorrectAnswers = (questionIds: string[]) => {
    return questionIds.some(id => {
      const questionProgress = progress.find(p => p.questionId === id);
      return questionProgress && !questionProgress.isCorrect;
    });
  };

  const filterQuestions = (questions: Question[]) => {
    if (!settings.showOnlyWrongAnswers) return questions;
    return questions.filter(question => {
      const questionProgress = progress.find(p => p.questionId === question.id);
      return questionProgress && !questionProgress.isCorrect;
    });
  };

  const filterCategories = (categories: Category[]) => {
    if (!settings.showOnlyWrongAnswers) return categories;
    return categories.filter(category => hasIncorrectAnswers(category.questions.map(q => q.id)));
  };

  const filterModules = (modules: Module[]) => {
    if (!settings.showOnlyWrongAnswers) return modules;
    return modules.filter(module => 
      module.categories.some(category => hasIncorrectAnswers(category.questions.map(q => q.id)))
    );
  };

  const getHiddenQuestionsCount = () => {
    if (!settings.showOnlyWrongAnswers) return 0;
    
    let hiddenCount = 0;
    catalogs.forEach(catalog => {
      if (catalog.id === currentCatalogId) {
        catalog.modules.forEach(module => {
          module.categories.forEach(category => {
            category.questions.forEach(question => {
              const questionProgress = progress.find(p => p.questionId === question.id);
              if (!questionProgress || questionProgress.isCorrect) {
                hiddenCount++;
              }
            });
          });
        });
      }
    });
    return hiddenCount;
  };

  return (
    <>
      <div className="w-80 bg-white h-screen shadow-lg flex flex-col">
        {/* Benutzer-Profil - Fixiert */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
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
                <Link
                  href="/profile"
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => setIsUserMenuOpen(false)}
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
                </Link>
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

        {/* Scrollbarer Bereich */}
        <div className="flex-1 overflow-y-auto">
          {/* Filter-Hinweis */}
          {settings.showOnlyWrongAnswers && (
            <div className="px-4 py-2 bg-yellow-50 border-y border-yellow-100">
              <p className="text-sm text-yellow-800">
                Es werden nur falsch beantwortete Fragen angezeigt - {getHiddenQuestionsCount()} unbeantwortete und korrekte Fragen ausgeblendet
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Link
                href="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="ml-1">Zurück zur Übersicht</span>
              </Link>
            </div>
            <h2 className="text-lg font-semibold mb-4">
              {catalogs.find(c => c.id === currentCatalogId)?.title || 'Prüfungskatalog'}
            </h2>
            
            <div className="space-y-4">
              {catalogs.map((catalog) => (
                catalog.id === currentCatalogId && (
                  <div key={catalog.id} className="space-y-2">
                    <div className="space-y-2 relative">
                      {filterModules(catalog.modules).map((module) => (
                        <div key={module.id} className="space-y-2 border-b border-gray-200 last:border-b-0 pb-4 mb-4 last:pb-0 last:mb-0">
                          <button
                            onClick={() => onSelectModule(module.id)}
                            className={`w-full text-left p-2 rounded-lg transition-colors ${
                              currentModuleId === module.id
                                ? 'bg-blue-50 text-blue-600'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span>{module.title}</span>
                              <span className="text-xs text-gray-500">
                                {getModuleProgress(module)}
                              </span>
                            </div>
                            <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden relative group">
                              {(() => {
                                const progress = getModuleDetailedProgress(module);
                                return (
                                  <>
                                    <div className="h-full flex">
                                      <div 
                                        className="h-full bg-green-500 transition-all duration-300 relative hover:opacity-80"
                                        style={{ width: `${progress.correctPercent}%` }}
                                      >
                                        {progress.correct > 0 && (
                                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block">
                                            <div className="bg-green-100 text-green-800 text-xs rounded-md py-1 px-2 whitespace-nowrap">
                                              {progress.correct} richtig beantwortet
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <div 
                                        className="h-full bg-red-500 transition-all duration-300 relative hover:opacity-80"
                                        style={{ width: `${progress.incorrectPercent}%` }}
                                      >
                                        {progress.incorrect > 0 && (
                                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block">
                                            <div className="bg-red-100 text-red-800 text-xs rounded-md py-1 px-2 whitespace-nowrap">
                                              {progress.incorrect} falsch beantwortet
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <div 
                                        className="h-full bg-gray-300 transition-all duration-300 relative hover:opacity-80"
                                        style={{ width: `${progress.unansweredPercent}%` }}
                                      >
                                        {progress.unanswered > 0 && (
                                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block">
                                            <div className="bg-gray-100 text-gray-800 text-xs rounded-md py-1 px-2 whitespace-nowrap">
                                              {progress.unanswered} unbeantwortet
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </button>

                          {currentModuleId === module.id && (
                            <div className="ml-4 space-y-1">
                              {filterCategories(module.categories).map((category) => (
                                <div key={category.id} className="space-y-1">
                                  <button
                                    onClick={() => onSelectCategory(category.id)}
                                    className={`w-full text-left p-2 text-sm rounded-lg transition-colors ${
                                      currentCategoryId === category.id
                                        ? 'bg-gray-100 text-blue-600'
                                        : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className="space-y-1">
                                      <div className="flex justify-between items-center">
                                        <span>{category.title}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-400">
                                          {category.questions.length} {category.questions.length === 1 ? 'Frage' : 'Fragen'}
                                        </span>
                                        {(() => {
                                          const { attempted, correct, total } = getCategoryProgress(category.id, category.questions);
                                          const incorrect = attempted - correct;
                                          if (correct === total && total > 0) {
                                            return (
                                              <span className="text-green-500">
                                                Alle korrekt beantwortet
                                              </span>
                                            );
                                          }
                                          if (incorrect > 0) {
                                            return (
                                              <span className="text-red-400">
                                                {incorrect} falsch beantwortet
                                              </span>
                                            );
                                          }
                                          return null;
                                        })()}
                                      </div>
                                    </div>
                                  </button>

                                  {currentCategoryId === category.id && (
                                    <div className="ml-4 space-y-1">
                                      {filterQuestions(category.questions).map((question) => (
                                        <div key={question.id}>
                                          <button
                                            onClick={() => onSelectQuestion(question.id)}
                                            className={`w-full text-left p-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                                              currentQuestionId === question.id
                                                ? 'bg-gray-50 text-blue-600'
                                                : 'hover:bg-gray-50'
                                            }`}
                                          >
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
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 