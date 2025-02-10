'use client'

import React, { useState, useEffect } from 'react'
import { questionCatalogs } from '@/data/questions'
import Sidebar from '@/components/Sidebar'
import RightSidebar from '@/components/RightSidebar'
import { QuestionProgress } from '@/types/questions'
import { useAuth } from '@/contexts/AuthContext'
import { Timestamp } from 'firebase/firestore'

export default function Home() {
  const [currentCatalogId, setCurrentCatalogId] = useState(questionCatalogs[0].id)
  const [currentModuleId, setCurrentModuleId] = useState(questionCatalogs[0].modules[0].id)
  const [currentCategoryId, setCurrentCategoryId] = useState(questionCatalogs[0].modules[0].categories[0].id)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [isAnswered, setIsAnswered] = useState(false)
  const [progress, setProgress] = useState<QuestionProgress[]>([])
  const [settings, setSettings] = useState({
    showOnlyWrongAnswers: false
  })
  // Neue State-Variablen für mobile Navigation
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)

  const { userProfile, saveProgress, loadCatalogProgress } = useAuth()

  const currentCatalog = questionCatalogs.find(c => c.id === currentCatalogId)!
  const currentModule = currentCatalog.modules.find(m => m.id === currentModuleId)!
  const currentCategory = currentModule.categories.find(c => c.id === currentCategoryId)!

  // Lade den Fortschritt aus Firebase beim Start
  useEffect(() => {
    async function loadProgress() {
      const catalogProgress = await loadCatalogProgress(currentCatalogId)
      const formattedProgress: QuestionProgress[] = Object.values(catalogProgress).map(p => ({
        questionId: p.questionId,
        isCorrect: p.isCorrect,
        selectedAnswers: p.selectedAnswers
      }))
      setProgress(formattedProgress)
    }

    if (userProfile) {
      loadProgress()
    }
  }, [currentCatalogId, userProfile, loadCatalogProgress])

  const handleSelectCatalog = async (catalogId: string) => {
    const catalog = questionCatalogs.find(c => c.id === catalogId)!
    setCurrentCatalogId(catalogId)
    setCurrentModuleId(catalog.modules[0].id)
    setCurrentCategoryId(catalog.modules[0].categories[0].id)
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setIsAnswered(false)

    // Lade den Fortschritt für den neuen Katalog
    const catalogProgress = await loadCatalogProgress(catalogId)
    const formattedProgress: QuestionProgress[] = Object.values(catalogProgress).map(p => ({
      questionId: p.questionId,
      isCorrect: p.isCorrect,
      selectedAnswers: p.selectedAnswers
    }))
    setProgress(formattedProgress)
  }

  const handleSelectModule = (moduleId: string) => {
    const module = currentCatalog.modules.find(m => m.id === moduleId)!
    setCurrentModuleId(moduleId)
    setCurrentCategoryId(module.categories[0].id)
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setIsAnswered(false)
  }

  const handleSelectCategory = (categoryId: string) => {
    setCurrentCategoryId(categoryId)
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setIsAnswered(false)
  }

  const handleSelectQuestion = (questionId: string) => {
    const category = currentModule.categories.find(c => 
      c.questions.some(q => q.id === questionId)
    )!
    const questionIndex = category.questions.findIndex(q => q.id === questionId)
    
    setCurrentCategoryId(category.id)
    setCurrentQuestionIndex(questionIndex)
    setSelectedAnswers([])
    setIsAnswered(false)
  }

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return
    
    if (selectedAnswers.includes(answer)) {
      setSelectedAnswers(selectedAnswers.filter(a => a !== answer))
    } else {
      setSelectedAnswers([...selectedAnswers, answer])
    }
  }

  const checkAnswers = async () => {
    const correctAnswers = currentQuestion.answers
      .filter(a => a.isCorrect)
      .map(a => a.text)

    const isCorrect = 
      selectedAnswers.length === correctAnswers.length &&
      selectedAnswers.every(a => correctAnswers.includes(a))

    // Speichere den Fortschritt in Firebase
    await saveProgress(currentCatalogId, {
      questionId: currentQuestion.id,
      isCorrect,
      selectedAnswers,
      attemptedAt: Timestamp.now()
    })

    // Aktualisiere den lokalen Fortschritt
    setProgress(prev => {
      const existingProgress = prev.find(p => p.questionId === currentQuestion.id)
      if (existingProgress) {
        return prev.map(p => 
          p.questionId === currentQuestion.id
            ? { ...p, isCorrect, selectedAnswers }
            : p
        )
      }
      return [...prev, { questionId: currentQuestion.id, isCorrect, selectedAnswers }]
    })

    setIsAnswered(true)
  }

  const nextQuestion = () => {
    setSelectedAnswers([])
    setIsAnswered(false)

    if (currentQuestionIndex + 1 < currentCategory.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (currentCategoryId !== currentModule.categories[currentModule.categories.length - 1].id) {
      const nextCategoryIndex = currentModule.categories.findIndex(c => c.id === currentCategoryId) + 1
      setCurrentCategoryId(currentModule.categories[nextCategoryIndex].id)
      setCurrentQuestionIndex(0)
    } else if (currentModuleId !== currentCatalog.modules[currentCatalog.modules.length - 1].id) {
      const nextModuleIndex = currentCatalog.modules.findIndex(m => m.id === currentModuleId) + 1
      setCurrentModuleId(currentCatalog.modules[nextModuleIndex].id)
      setCurrentCategoryId(currentCatalog.modules[nextModuleIndex].categories[0].id)
      setCurrentQuestionIndex(0)
    }
  }

  const getAnswerStyle = (answer: string) => {
    if (!isAnswered) {
      return selectedAnswers.includes(answer) 
        ? 'bg-blue-100 border-blue-500' 
        : 'bg-white hover:bg-gray-100'
    }

    const isCorrectAnswer = currentQuestion.answers.find(a => a.text === answer)?.isCorrect
    const wasSelected = selectedAnswers.includes(answer)

    if (isCorrectAnswer) return 'bg-green-100 border-green-500'
    if (wasSelected && !isCorrectAnswer) return 'bg-red-100 border-red-500'
    return 'bg-white'
  }

  const getIncorrectAnswerExplanations = () => {
    if (!isAnswered) return [];
    
    return currentQuestion.answers
      .filter(answer => {
        const wasSelected = selectedAnswers.includes(answer.text);
        return (wasSelected && !answer.isCorrect) || (!wasSelected && answer.isCorrect);
      })
      .map(answer => ({
        text: answer.text,
        explanation: answer.explanation,
        wasSelected: selectedAnswers.includes(answer.text)
      }))
      .filter(item => item.explanation || item.wasSelected);
  };

  // Filtere die Fragen basierend auf den Einstellungen
  const getFilteredQuestions = () => {
    if (!settings.showOnlyWrongAnswers) {
      return currentCategory.questions;
    }
    
    return currentCategory.questions.filter(question => {
      const questionProgress = progress.find(p => p.questionId === question.id);
      return questionProgress && !questionProgress.isCorrect;
    });
  };

  const filteredQuestions = getFilteredQuestions();
  const currentQuestion = filteredQuestions[currentQuestionIndex];

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-30 flex justify-between items-center px-4">
        <button
          onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Haftify</h1>
        <button
          onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Left Sidebar */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden ${
          isLeftSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsLeftSidebarOpen(false)}
      />
      <div
        className={`fixed lg:static inset-y-0 left-0 w-80 bg-white transform transition-transform duration-300 ease-in-out z-50 lg:transform-none ${
          isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <Sidebar
          catalogs={questionCatalogs}
          currentCatalogId={currentCatalogId}
          currentModuleId={currentModuleId}
          currentCategoryId={currentCategoryId}
          currentQuestionId={currentQuestion?.id || ''}
          progress={progress}
          onSelectCatalog={handleSelectCatalog}
          onSelectModule={handleSelectModule}
          onSelectCategory={handleSelectCategory}
          onSelectQuestion={(id) => {
            handleSelectQuestion(id)
            setIsLeftSidebarOpen(false)
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 lg:pt-0">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {filteredQuestions.length > 0 ? (
            <>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Card */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-sm text-gray-600">{currentCatalog.title}</h2>
                    <h3 className="text-sm text-gray-600">{currentModule.title}</h3>
                    <h4 className="text-sm text-gray-600">{currentCategory.title}</h4>
                  </div>
                  <span className="text-sm text-gray-600">
                    Frage {currentQuestionIndex + 1} von {filteredQuestions.length}
                  </span>
                </div>

                <h1 className="text-2xl font-bold mb-2 text-gray-800">
                  {currentQuestion.text}
                </h1>
                <div className="flex items-center gap-4 mb-6">
                  <p className="text-gray-600">
                    {currentQuestion.points} {currentQuestion.points === 1 ? 'Punkt' : 'Punkte'}
                  </p>
                  {currentQuestion.isMultipleChoice && (
                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Mehrfachauswahl möglich
                    </span>
                  )}
                </div>
                
                <div className="space-y-3">
                  {currentQuestion.answers.map((answer) => (
                    <button
                      key={answer.text}
                      onClick={() => handleAnswerSelect(answer.text)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-colors
                        ${getAnswerStyle(answer.text)}`}
                      disabled={isAnswered}
                    >
                      {answer.text}
                    </button>
                  ))}
                </div>

                {/* Erklärungen für falsche Antworten */}
                {isAnswered && getIncorrectAnswerExplanations().length > 0 && (
                  <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-orange-800 mb-2">Hinweise zu Ihren Antworten:</h3>
                    <ul className="space-y-2">
                      {getIncorrectAnswerExplanations().map((item, index) => (
                        <li key={index} className="text-orange-700">
                          {item.wasSelected ? (
                            <span className="font-medium">Ihre Auswahl "{item.text}" ist nicht korrekt:</span>
                          ) : (
                            <span className="font-medium">Sie haben die korrekte Antwort "{item.text}" nicht ausgewählt.</span>
                          )}
                          {item.explanation && (
                            <p className="mt-1 text-sm">{item.explanation}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!isAnswered ? (
                  <button
                    onClick={checkAnswers}
                    className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Antworten überprüfen
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="mt-6 w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Nächste Frage
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Keine Fragen verfügbar
              </h2>
              <p className="text-gray-600">
                {settings.showOnlyWrongAnswers 
                  ? 'Es gibt keine falsch beantworteten Fragen in dieser Kategorie.'
                  : 'Es sind keine Fragen in dieser Kategorie verfügbar.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden ${
          isRightSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsRightSidebarOpen(false)}
      />
      <div
        className={`fixed lg:static inset-y-0 right-0 w-80 bg-white transform transition-transform duration-300 ease-in-out z-50 lg:transform-none ${
          isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
        <RightSidebar
          progress={progress}
          settings={settings}
          onUpdateSettings={setSettings}
        />
      </div>
    </div>
  )
} 