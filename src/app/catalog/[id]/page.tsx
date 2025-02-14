'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questionCatalogs } from '@/data/questions';
import { QuestionProgress } from '@/types/questions';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, Timestamp, deleteDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/config/firebase';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';

export default function CatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const catalog = questionCatalogs.find(c => c.id === resolvedParams.id);

  if (!catalog) {
    router.push('/');
    return null;
  }

  const [currentModuleId, setCurrentModuleId] = useState(catalog.modules[0].id);
  const [currentCategoryId, setCurrentCategoryId] = useState(catalog.modules[0].categories[0].id);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [progress, setProgress] = useState<QuestionProgress[]>([]);
  const [settings, setSettings] = useState({
    showOnlyWrongAnswers: false,
    progressBarType: 'catalog' as 'catalog' | 'module' | 'category'
  });
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    moduleTitle: string;
    totalQuestions: number;
    wrongAnswers: number;
  }>({
    show: false,
    moduleTitle: '',
    totalQuestions: 0,
    wrongAnswers: 0
  });

  const [catalogCompletion, setCatalogCompletion] = useState<{
    isVisible: boolean;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    earnedPoints: number;
    totalPoints: number;
    completionTime: number;
  } | null>(null);

  const [repeatOptions, setRepeatOptions] = useState<{
    isVisible: boolean;
    mode?: 'reset' | 'restart' | 'wrongOnly';
  } | null>(null);

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { userProfile, saveProgress, loadCatalogProgress } = useAuth();

  const currentModule = catalog.modules.find(m => m.id === currentModuleId)!;
  const currentCategory = currentModule.categories.find(c => c.id === currentCategoryId)!;

  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Funktion zum Finden der nächsten unbeantworteten Frage
  const findNextUnansweredQuestion = (progress: QuestionProgress[]) => {
    for (const module of catalog.modules) {
      for (const category of module.categories) {
        for (const question of category.questions) {
          const questionProgress = progress.find(p => p.questionId === question.id);
          if (!questionProgress) {
            return {
              moduleId: module.id,
              categoryId: category.id,
              questionIndex: category.questions.findIndex(q => q.id === question.id)
            };
          }
        }
      }
    }
    return null;
  };

  useEffect(() => {
    async function loadProgress() {
      const catalogProgress = await loadCatalogProgress(resolvedParams.id);
      const formattedProgress: QuestionProgress[] = Object.values(catalogProgress).map(p => ({
        questionId: p.questionId,
        isCorrect: p.isCorrect,
        selectedAnswers: p.selectedAnswers
      }));
      setProgress(formattedProgress);

      // Prüfe, ob wir vom Dashboard kommen und es der erste Load ist
      const hasNoParams = window.location.search === '';
      if (hasNoParams && isInitialLoad) {
        const nextQuestion = findNextUnansweredQuestion(formattedProgress);
        if (nextQuestion) {
          setCurrentModuleId(nextQuestion.moduleId);
          setCurrentCategoryId(nextQuestion.categoryId);
          setCurrentQuestionIndex(nextQuestion.questionIndex);
        }
        setIsInitialLoad(false);
      }
    }

    if (userProfile) {
      loadProgress();
    }
  }, [resolvedParams.id, userProfile, loadCatalogProgress, isInitialLoad]);

  useEffect(() => {
    if (userProfile && !userProfile.catalogs?.[resolvedParams.id]) {
      // Initialisiere die Katalogstatistiken, wenn sie noch nicht existieren
      const userRef = doc(db, 'users', userProfile.uid);
      updateDoc(userRef, {
        [`catalogs.${resolvedParams.id}`]: {
          earnedPoints: 0,
          totalPoints: 0,
          correctAnswers: 0,
          totalQuestions: 0,
          lastAttemptedAt: Timestamp.now()
        }
      });
    }
  }, [userProfile, resolvedParams.id]);

  const handleSelectModule = (moduleId: string) => {
    const module = catalog.modules.find(m => m.id === moduleId)!;
    setCurrentModuleId(moduleId);
    setCurrentCategoryId(module.categories[0].id);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setIsAnswered(false);
  };

  const handleSelectCategory = (categoryId: string) => {
    setCurrentCategoryId(categoryId);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setIsAnswered(false);
  };

  const handleSelectQuestion = (questionId: string) => {
    // Suche zuerst das richtige Modul und die richtige Kategorie
    for (const module of catalog.modules) {
      for (const category of module.categories) {
        const questionIndex = category.questions.findIndex(q => q.id === questionId);
        if (questionIndex !== -1) {
          setCurrentModuleId(module.id);
          setCurrentCategoryId(category.id);
          setCurrentQuestionIndex(questionIndex);
          setSelectedAnswers([]);
          setIsAnswered(false);
          return;
        }
      }
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    
    if (selectedAnswers.includes(answer)) {
      setSelectedAnswers(selectedAnswers.filter(a => a !== answer));
    } else {
      setSelectedAnswers([...selectedAnswers, answer]);
    }
  };

  const checkAnswers = async () => {
    if (!currentQuestion || !userProfile) return;

    const isCorrect = selectedAnswers.length === currentQuestion.answers.filter(a => a.isCorrect).length &&
      selectedAnswers.every(selected => 
        currentQuestion.answers.find(a => a.text === selected)?.isCorrect
      );

    const newProgress = {
      questionId: currentQuestion.id,
      isCorrect,
      selectedAnswers,
      attemptedAt: Timestamp.now()
    };

    try {
      await saveProgress(resolvedParams.id, newProgress);
      
      // Berechne die Gesamtpunktzahl für den Katalog
      const allQuestions = catalog.modules.flatMap(m => 
        m.categories.flatMap(c => c.questions)
      );
      const catalogProgress = await loadCatalogProgress(resolvedParams.id);
      const earnedPoints = allQuestions.reduce((sum, q) => {
        const questionProgress = catalogProgress[q.id];
        return sum + (questionProgress?.isCorrect ? q.points : 0);
      }, 0);
      const totalPoints = allQuestions.reduce((sum, q) => sum + q.points, 0);

      // Aktualisiere die Statistiken in der Datenbank
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, {
        [`catalogs.${resolvedParams.id}.earnedPoints`]: earnedPoints,
        [`catalogs.${resolvedParams.id}.totalPoints`]: totalPoints,
        [`catalogs.${resolvedParams.id}.correctAnswers`]: progress.filter(p => p.isCorrect).length + (isCorrect ? 1 : 0),
        [`catalogs.${resolvedParams.id}.totalQuestions`]: progress.length + 1,
        [`catalogs.${resolvedParams.id}.lastAttemptedAt`]: Timestamp.now()
      });

      setProgress(prev => [...prev.filter(p => p.questionId !== currentQuestion.id), {
        questionId: currentQuestion.id,
        isCorrect,
        selectedAnswers
      }]);
      setIsAnswered(true);

      // Aktualisiere den Fortschritt und prüfe auf Katalog-Abschluss
      handleProgressUpdate(currentQuestion.id, isCorrect);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswers([]);
    setIsAnswered(false);

    // Wenn der Filter für falsche Antworten aktiv ist
    if (settings.showOnlyWrongAnswers) {
      // Hole alle falsch beantworteten Fragen der aktuellen Kategorie
      const wrongQuestions = currentCategory.questions.filter(question => {
        const questionProgress = progress.find(p => p.questionId === question.id);
        return questionProgress && !questionProgress.isCorrect;
      });

      // Finde den Index der aktuellen Frage in den gefilterten Fragen
      const currentWrongIndex = wrongQuestions.findIndex(q => q.id === currentQuestion?.id);

      // Wenn es eine nächste falsche Frage in der aktuellen Kategorie gibt
      if (currentWrongIndex < wrongQuestions.length - 1) {
        const nextWrongQuestion = wrongQuestions[currentWrongIndex + 1];
        const nextIndex = currentCategory.questions.findIndex(q => q.id === nextWrongQuestion.id);
        setCurrentQuestionIndex(nextIndex);
        return;
      }

      // Suche in den nächsten Kategorien des aktuellen Moduls
      const currentCategoryIndex = currentModule.categories.findIndex(c => c.id === currentCategoryId);
      for (let i = currentCategoryIndex + 1; i < currentModule.categories.length; i++) {
        const category = currentModule.categories[i];
        const firstWrongQuestion = category.questions.find(question => {
          const questionProgress = progress.find(p => p.questionId === question.id);
          return questionProgress && !questionProgress.isCorrect;
        });
        
        if (firstWrongQuestion) {
          setCurrentCategoryId(category.id);
          const questionIndex = category.questions.findIndex(q => q.id === firstWrongQuestion.id);
          setCurrentQuestionIndex(questionIndex);
          return;
        }
      }

      // Suche in den nächsten Modulen
      const currentModuleIndex = catalog.modules.findIndex(m => m.id === currentModuleId);
      for (let i = currentModuleIndex + 1; i < catalog.modules.length; i++) {
        const module = catalog.modules[i];
        for (const category of module.categories) {
          const firstWrongQuestion = category.questions.find(question => {
            const questionProgress = progress.find(p => p.questionId === question.id);
            return questionProgress && !questionProgress.isCorrect;
          });
          
          if (firstWrongQuestion) {
            setCurrentModuleId(module.id);
            setCurrentCategoryId(category.id);
            const questionIndex = category.questions.findIndex(q => q.id === firstWrongQuestion.id);
            setCurrentQuestionIndex(questionIndex);
            return;
          }
        }
      }

      // Wenn keine weiteren falschen Fragen gefunden wurden, starte von vorne
      for (const module of catalog.modules) {
        for (const category of module.categories) {
          const firstWrongQuestion = category.questions.find(question => {
            const questionProgress = progress.find(p => p.questionId === question.id);
            return questionProgress && !questionProgress.isCorrect;
          });
          
          if (firstWrongQuestion) {
            setCurrentModuleId(module.id);
            setCurrentCategoryId(category.id);
            const questionIndex = category.questions.findIndex(q => q.id === firstWrongQuestion.id);
            setCurrentQuestionIndex(questionIndex);
            return;
          }
        }
      }

      return; // Keine falschen Fragen mehr gefunden
    }

    // Normale Navigation wenn der Filter nicht aktiv ist
    // Prüfe, ob der gesamte Katalog abgeschlossen ist
    const isLastQuestionInCategory = currentQuestionIndex + 1 >= currentCategory.questions.length;
    const isLastCategoryInModule = currentCategoryId === currentModule.categories[currentModule.categories.length - 1].id;
    const isLastModule = currentModuleId === catalog.modules[catalog.modules.length - 1].id;
    const isLastQuestion = isLastQuestionInCategory && isLastCategoryInModule && isLastModule;

    // Prüfe, ob alle Fragen beantwortet wurden
    const allQuestionsAnswered = allQuestions.every(q => 
      progress.some(p => p.questionId === q.id)
    );

    if (isLastQuestion) {
      if (allQuestionsAnswered) {
        // Berechne die Gesamtstatistik für den Katalog
        const totalQuestions = allQuestions.length;
        const correctAnswers = progress.filter(p => p.isCorrect).length;
        const wrongAnswers = progress.filter(p => !p.isCorrect).length;
        const earnedPoints = allQuestions.reduce((sum, q) => {
          const questionProgress = progress.find(p => p.questionId === q.id);
          return sum + (questionProgress?.isCorrect ? q.points : 0);
        }, 0);
        const totalPoints = allQuestions.reduce((sum, q) => sum + q.points, 0);

        // Stoppe den Timer, falls er läuft
        if (isRightSidebarOpen) {
          const rightSidebar = document.querySelector('[data-testid="right-sidebar"]') as HTMLElement;
          if (rightSidebar) {
            const pauseButton = rightSidebar.querySelector('[data-testid="pause-timer"]') as HTMLElement;
            if (pauseButton) {
              pauseButton.click();
            }
          }
        }

        // Zeige das Abschluss-Overlay
        setCatalogCompletion({
          isVisible: true,
          totalQuestions,
          correctAnswers,
          wrongAnswers,
          earnedPoints,
          totalPoints,
          completionTime: time
        });
        return;
      } else {
        // Suche die erste unbeantwortete Frage
        const nextUnanswered = findNextUnansweredQuestion(progress);
        if (nextUnanswered) {
          setCurrentModuleId(nextUnanswered.moduleId);
          setCurrentCategoryId(nextUnanswered.categoryId);
          setCurrentQuestionIndex(nextUnanswered.questionIndex);
          return;
        }
      }
    }

    // Prüfe, ob das aktuelle Modul abgeschlossen ist
    if (isLastQuestionInCategory && isLastCategoryInModule) {
      // Berechne die Statistiken für das aktuelle Modul
      const moduleQuestions = currentModule.categories.flatMap(c => c.questions);
      const moduleProgress = progress.filter(p => 
        moduleQuestions.some(q => q.id === p.questionId)
      );
      const wrongAnswers = moduleProgress.filter(p => !p.isCorrect).length;

      // Zeige die Notification und bleibe beim aktuellen Modul
      setNotification({
        show: true,
        moduleTitle: currentModule.title,
        totalQuestions: moduleQuestions.length,
        wrongAnswers
      });
      return;
    }

    // Normale Navigation zur nächsten Frage innerhalb des Moduls
    if (currentQuestionIndex + 1 < currentCategory.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (!isLastCategoryInModule) {
      const nextCategoryIndex = currentModule.categories.findIndex(c => c.id === currentCategoryId) + 1;
      setCurrentCategoryId(currentModule.categories[nextCategoryIndex].id);
      setCurrentQuestionIndex(0);
    }
  };

  const getAnswerStyle = (answer: string) => {
    if (!isAnswered) {
      return selectedAnswers.includes(answer) 
        ? 'bg-blue-100 border-blue-500' 
        : 'bg-white hover:bg-gray-100';
    }

    const isCorrectAnswer = currentQuestion.answers.find(a => a.text === answer)?.isCorrect;
    const wasSelected = selectedAnswers.includes(answer);

    if (isCorrectAnswer && wasSelected) return 'bg-green-100 border-green-500';
    if (isCorrectAnswer && !wasSelected) return 'bg-green-50 border-green-500 border-dashed';
    if (wasSelected && !isCorrectAnswer) return 'bg-red-100 border-red-500';
    return 'bg-white';
  };

  const getIncorrectAnswerExplanations = () => {
    if (!isAnswered) return [];
    
    const incorrectSelections = currentQuestion.answers
      .filter(answer => selectedAnswers.includes(answer.text) && !answer.isCorrect)
      .map(answer => ({
        text: answer.text,
        explanation: answer.explanation,
        wasSelected: true
      }));

    const missedCorrectAnswers = currentQuestion.answers
      .filter(answer => !selectedAnswers.includes(answer.text) && answer.isCorrect)
      .map(answer => answer.text);

    return [
      ...incorrectSelections,
      ...(missedCorrectAnswers.length > 0 ? [{
        text: missedCorrectAnswers.join('" und "'),
        explanation: '',
        wasSelected: false
      }] : [])
    ];
  };

  const getFilteredQuestions = () => {
    if (!settings.showOnlyWrongAnswers) {
      return currentCategory.questions;
    }
    
    const currentQuestionId = currentCategory.questions[currentQuestionIndex]?.id;
    return currentCategory.questions.filter(question => {
      const questionProgress = progress.find(p => p.questionId === question.id);
      return question.id === currentQuestionId || (questionProgress && !questionProgress.isCorrect);
    });
  };

  const filteredQuestions = getFilteredQuestions();
  const currentQuestion = filteredQuestions[currentQuestionIndex];

  // Sammle alle Fragen des aktuellen Katalogs
  const allQuestions = catalog.modules.flatMap(m => 
    m.categories.flatMap(c => c.questions)
  );

  const handleResetProgress = async () => {
    try {
      // Setze den lokalen Fortschritt zurück
      setProgress([]);
      
      if (userProfile) {
        // Lösche alle Dokumente in der progress-Collection
        const progressCollectionRef = collection(db, 'users', userProfile.uid, 'catalogs', catalog.id, 'progress');
        const progressQuery = query(progressCollectionRef);
        const progressSnapshot = await getDocs(progressQuery);
        
        // Lösche jedes Dokument in der Collection
        const deletePromises = progressSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Aktualisiere die Katalog-Statistiken
        const userRef = doc(db, 'users', userProfile.uid);
        await updateDoc(userRef, {
          [`catalogs.${catalog.id}`]: {
            lastAttemptedAt: Timestamp.now(),
            totalQuestions: 0,
            correctAnswers: 0,
            earnedPoints: 0,
            totalPoints: 0
          }
        });
      }
    } catch (error) {
      console.error('Fehler beim Zurücksetzen des Fortschritts:', error);
    }
  };

  const handleRepeatCatalog = () => {
    if (catalogCompletion) {
      setCatalogCompletion({
        ...catalogCompletion,
        isVisible: false
      });
    }
    setRepeatOptions({ isVisible: true });
  };

  const handleRepeatOptionSelect = async (mode: 'reset' | 'restart' | 'wrongOnly') => {
    setRepeatOptions(null);
    setSelectedAnswers([]);
    setIsAnswered(false);

    if (mode === 'reset') {
        await handleResetProgress();
        // Deaktiviere den Filter für falsche Antworten
        setSettings({
            ...settings,
            showOnlyWrongAnswers: false
        });
        setCurrentModuleId(catalog.modules[0].id);
        setCurrentCategoryId(catalog.modules[0].categories[0].id);
        setCurrentQuestionIndex(0);
    } else if (mode === 'restart') {
        setCurrentModuleId(catalog.modules[0].id);
        setCurrentCategoryId(catalog.modules[0].categories[0].id);
        setCurrentQuestionIndex(0);
    } else if (mode === 'wrongOnly') {
        // Aktiviere den Filter für falsche Antworten
        setSettings({
            ...settings,
            showOnlyWrongAnswers: true
        });

        // Finde die erste falsch beantwortete Frage
        for (const module of catalog.modules) {
            let foundWrong = false;
            for (const category of module.categories) {
                for (let i = 0; i < category.questions.length; i++) {
                    const questionProgress = progress.find(p => p.questionId === category.questions[i].id);
                    if (questionProgress && !questionProgress.isCorrect) {
                        setCurrentModuleId(module.id);
                        setCurrentCategoryId(category.id);
                        // Finde den korrekten Index in den gefilterten Fragen
                        const wrongQuestionsInCategory = category.questions.filter((q, index) => {
                            const qProgress = progress.find(p => p.questionId === q.id);
                            return qProgress && !qProgress.isCorrect;
                        });
                        const questionIndex = wrongQuestionsInCategory.findIndex(q => q.id === category.questions[i].id);
                        setCurrentQuestionIndex(questionIndex);
                        foundWrong = true;
                        break;
                    }
                }
                if (foundWrong) break;
            }
            if (foundWrong) break;
        }
    }
  };

  // Neue Funktion zum Wechseln zum nächsten Modul
  const handleNextModule = () => {
    const currentModuleIndex = catalog.modules.findIndex(m => m.id === currentModuleId);
    if (currentModuleIndex < catalog.modules.length - 1) {
      const nextModule = catalog.modules[currentModuleIndex + 1];
      setCurrentModuleId(nextModule.id);
      setCurrentCategoryId(nextModule.categories[0].id);
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setIsAnswered(false);
      setNotification({ show: false, moduleTitle: '', totalQuestions: 0, wrongAnswers: 0 });
    }
  };

  // Neue Funktion zur Berechnung des Fortschritts
  const calculateProgress = () => {
    switch (settings.progressBarType) {
      case 'catalog':
        // Berechne den Gesamtfortschritt im Katalog
        const allCatalogQuestions = catalog.modules.flatMap(m => 
          m.categories.flatMap(c => c.questions)
        );
        const currentCatalogQuestionIndex = allCatalogQuestions.findIndex(q => q.id === currentQuestion?.id);
        return ((currentCatalogQuestionIndex + 1) / allCatalogQuestions.length) * 100;

      case 'module':
        // Berechne den Fortschritt im aktuellen Modul
        const allModuleQuestions = currentModule.categories.flatMap(c => c.questions);
        const currentModuleQuestionIndex = allModuleQuestions.findIndex(q => q.id === currentQuestion?.id);
        return ((currentModuleQuestionIndex + 1) / allModuleQuestions.length) * 100;

      case 'category':
      default:
        // Berechne den Fortschritt in der aktuellen Kategorie (bisheriges Verhalten)
        return ((currentQuestionIndex + 1) / filteredQuestions.length) * 100;
    }
  };

  const handleProgressUpdate = async (questionId: string, isCorrect: boolean) => {
    if (!currentQuestion) return;

    // Speichere den Fortschritt
    const newProgress = {
      questionId,
      isCorrect,
      selectedAnswers,
      attemptedAt: Timestamp.now()
    };

    await saveProgress(resolvedParams.id, newProgress);

    // Aktualisiere den lokalen Fortschritt
    const updatedProgress = [...progress, newProgress];
    setProgress(updatedProgress);

    // Berechne die Statistiken
    const totalQuestions = allQuestions.length;
    const answeredQuestions = updatedProgress.length;
    const correctAnswers = updatedProgress.filter(p => p.isCorrect).length;
    const isFirstCompletion = answeredQuestions === totalQuestions && progress.length < totalQuestions;
    const allQuestionsCorrect = correctAnswers === totalQuestions;
    const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;

    // Zeige den Abschluss-Dialog in folgenden Fällen:
    // 1. Erstes Mal 100% Beantwortung
    // 2. Letzte Frage beantwortet
    // 3. Alle Fragen richtig beantwortet
    if (isFirstCompletion || isLastQuestion || allQuestionsCorrect) {
      const earnedPoints = updatedProgress
        .filter(p => p.isCorrect)
        .reduce((sum, p) => {
          const question = allQuestions.find(q => q.id === p.questionId);
          return sum + (question?.points || 0);
        }, 0);

      const totalPoints = allQuestions.reduce((sum, q) => sum + q.points, 0);

      setCatalogCompletion({
        isVisible: true,
        totalQuestions,
        correctAnswers,
        wrongAnswers: answeredQuestions - correctAnswers,
        earnedPoints,
        totalPoints,
        completionTime: time
      });

      // Stoppe den Timer
      if (isTimerRunning) {
        setIsTimerRunning(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
          catalogs={[catalog]}
          currentCatalogId={catalog.id}
          currentModuleId={currentModuleId}
          currentCategoryId={currentCategoryId}
          currentQuestionId={currentQuestion?.id || ''}
          progress={progress}
          settings={settings}
          onSelectCatalog={() => {}}
          onSelectModule={handleSelectModule}
          onSelectCategory={handleSelectCategory}
          onSelectQuestion={(id) => {
            handleSelectQuestion(id);
            setIsLeftSidebarOpen(false);
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
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>

              {/* Question Card */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-sm text-gray-600">{catalog.title}</h2>
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
                            <>
                              <span className="font-medium">Ihre Auswahl "{item.text}" ist nicht korrekt:</span>
                              {item.explanation && (
                                <p className="mt-1 text-sm">{item.explanation}</p>
                              )}
                            </>
                          ) : (
                            <span className="font-medium">
                              {`Antwort "${item.text}" wäre${item.text.includes('" und "') ? 'n' : ''} ebenfalls korrekt gewesen.`}
                            </span>
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

              {/* Bullet Point Pagination */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-4">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-center gap-4">
                    {currentModule.categories.map(category => {
                      // Filtere die Fragen basierend auf den Einstellungen
                      const categoryQuestions = settings.showOnlyWrongAnswers
                        ? category.questions.filter(question => {
                            const questionProgress = progress.find(p => p.questionId === question.id);
                            return questionProgress && !questionProgress.isCorrect;
                          })
                        : category.questions;

                      // Überspringe die Kategorie, wenn sie keine Fragen enthält
                      if (categoryQuestions.length === 0) return null;

                      return (
                        <div key={category.id} className="flex items-center gap-3">
                          {categoryQuestions.map((question, index) => {
                            const questionProgress = progress.find(p => p.questionId === question.id);
                            let bulletClass = 'w-2.5 h-2.5 rounded-full transition-colors';
                            
                            const isCurrentQuestion = currentCategoryId === category.id && 
                              currentQuestion?.id === question.id;
                            
                            if (isCurrentQuestion) {
                              bulletClass += ' bg-blue-600 ring-2 ring-blue-300 ring-offset-2';
                            } else if (questionProgress?.isCorrect) {
                              bulletClass += ' bg-green-500';
                            } else if (questionProgress && !questionProgress.isCorrect) {
                              bulletClass += ' bg-red-500';
                            } else {
                              bulletClass += ' bg-gray-300';
                            }
                            
                            return (
                              <button
                                key={question.id}
                                onClick={() => {
                                  setCurrentCategoryId(category.id);
                                  const newIndex = categoryQuestions.findIndex(q => q.id === question.id);
                                  setCurrentQuestionIndex(newIndex);
                                  setSelectedAnswers([]);
                                  setIsAnswered(false);
                                }}
                                className={bulletClass}
                                title={`Frage ${index + 1} von ${categoryQuestions.length} ${
                                  questionProgress
                                    ? questionProgress.isCorrect
                                      ? '(Richtig beantwortet)'
                                      : '(Falsch beantwortet)'
                                    : '(Noch nicht beantwortet)'
                                }`}
                              />
                            );
                          })}
                          {category.id !== currentModule.categories[currentModule.categories.length - 1].id && (
                            <div className="w-px h-4 bg-gray-300 mx-4" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
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
          questions={allQuestions}
          settings={settings}
          onUpdateSettings={setSettings}
          onResetProgress={handleResetProgress}
          time={time}
          onTimeUpdate={setTime}
          isTimerRunning={isTimerRunning}
          onTimerRunningChange={setIsTimerRunning}
          onSelectQuestion={handleSelectQuestion}
        />
      </div>

      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                notification.wrongAnswers === 0 ? 'bg-green-100' : 'bg-amber-100'
              } mb-4`}>
                {notification.wrongAnswers === 0 ? (
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Modul abgeschlossen!
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {notification.wrongAnswers === 0 ? (
                  `Perfekt! Sie haben alle ${notification.totalQuestions} Fragen in "${notification.moduleTitle}" richtig beantwortet.`
                ) : (
                  `Sie haben ${notification.totalQuestions - notification.wrongAnswers} von ${notification.totalQuestions} Fragen in "${notification.moduleTitle}" richtig beantwortet.`
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRepeatCatalog}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Modul wiederholen
                </button>
                {currentModuleId !== catalog.modules[catalog.modules.length - 1].id ? (
                  <button
                    onClick={handleNextModule}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Weiter zum nächsten Modul
                  </button>
                ) : (
                  <button
                    onClick={() => setNotification({ show: false, moduleTitle: '', totalQuestions: 0, wrongAnswers: 0 })}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Schließen
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Katalog-Abschluss-Overlay */}
      {catalogCompletion && catalogCompletion.isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="text-center mb-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Herzlichen Glückwunsch!
              </h2>
              <p className="text-lg text-gray-600">
                Sie haben den Katalog "{catalog.title}" erfolgreich abgeschlossen.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Statistiken */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Ihre Ergebnisse</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Richtige Antworten:</span>
                    <span className="font-medium">{catalogCompletion.correctAnswers} von {catalogCompletion.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Falsche Antworten:</span>
                    <span className="font-medium">{catalogCompletion.wrongAnswers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Erreichte Punkte:</span>
                    <span className="font-medium">{catalogCompletion.earnedPoints} von {catalogCompletion.totalPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Erfolgsquote:</span>
                    <span className="font-medium">
                      {Math.round((catalogCompletion.correctAnswers / catalogCompletion.totalQuestions) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Zeit und Empfehlungen */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Zeit und Empfehlungen</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Benötigte Zeit:</span>
                    <span className="font-medium">{formatTime(catalogCompletion.completionTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ø Zeit pro Frage:</span>
                    <span className="font-medium">
                      {formatTime(Math.round(catalogCompletion.completionTime / catalogCompletion.totalQuestions))}
                    </span>
                  </div>
                </div>

                {catalogCompletion.wrongAnswers > 0 && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-amber-800 text-sm">
                      Tipp: Sie haben {catalogCompletion.wrongAnswers} Fragen falsch beantwortet. 
                      Nutzen Sie den Filter für falsche Antworten, um diese gezielt zu wiederholen.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (catalogCompletion) {
                    setCatalogCompletion({
                      ...catalogCompletion,
                      isVisible: false
                    });
                  }
                  router.push('/');
                }}
                className="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Zurück zur Übersicht
              </button>
              <button
                onClick={handleRepeatCatalog}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Katalog wiederholen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wiederholungsoptionen Modal */}
      {repeatOptions?.isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6">Wie möchten Sie fortfahren?</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => handleRepeatOptionSelect('restart')}
                className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Von vorne starten</h3>
                    <p className="text-sm text-gray-500">Behalten Sie Ihren Fortschritt und starten Sie von der ersten Frage</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRepeatOptionSelect('wrongOnly')}
                className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-amber-100 text-amber-600 group-hover:bg-amber-200">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Falsche Antworten wiederholen</h3>
                    <p className="text-sm text-gray-500">Üben Sie nur die Fragen, die Sie falsch beantwortet haben</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRepeatOptionSelect('reset')}
                className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-red-100 text-red-600 group-hover:bg-red-200">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Fortschritt zurücksetzen</h3>
                    <p className="text-sm text-gray-500">Löschen Sie Ihren Fortschritt und starten Sie komplett neu</p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setRepeatOptions(null)}
              className="mt-6 w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 