'use client'

import React, { useState, useEffect } from 'react'
import { questionCatalogs } from '@/data/questions'
import Sidebar from '@/components/Sidebar'
import RightSidebar from '@/components/RightSidebar'
import { QuestionProgress } from '@/types/questions'
import { useAuth } from '@/contexts/AuthContext'
import { Timestamp } from 'firebase/firestore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { userProfile, logout } = useAuth();
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Fehler beim Ausloggen:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Haftify Lernplattform
            </h1>

            {/* Benutzer-Profil */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                {/* Profilbild mit den Initialen des Benutzers */}
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm font-medium">
                    {userProfile?.displayName
                      ?.split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase() || '?'}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    {userProfile?.displayName || 'Unbekannter Benutzer'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {userProfile?.email || 'Keine E-Mail'}
                  </span>
                </div>
                {/* Dropdown-Pfeil */}
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isProfileMenuOpen ? 'transform rotate-180' : ''
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
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => setIsProfileMenuOpen(false)}
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
        </div>
      </header>

      {/* Hauptinhalt */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {questionCatalogs.map((catalog) => (
              <Link 
                key={catalog.id} 
                href={`/catalog/${catalog.id}`}
                className="block group"
              >
                <div className="bg-white overflow-hidden shadow rounded-lg transition-all duration-200 hover:shadow-lg border border-gray-200 hover:border-blue-500">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                        <svg 
                          className="h-6 w-6 text-blue-600" 
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
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {catalog.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Prüfungskatalog {catalog.year}
                        </p>
                      </div>
                    </div>

                    {/* Katalog Details */}
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="text-sm">
                          <dt className="text-gray-500">Module</dt>
                          <dd className="mt-1 font-medium text-gray-900">
                            {catalog.modules.length}
                          </dd>
                        </div>
                        <div className="text-sm">
                          <dt className="text-gray-500">Fragen</dt>
                          <dd className="mt-1 font-medium text-gray-900">
                            {catalog.modules.reduce((total, module) => 
                              total + module.categories.reduce((catTotal, category) => 
                                catTotal + category.questions.length, 0
                              ), 0
                            )}
                          </dd>
                        </div>
                      </dl>

                      {/* Fortschrittsbalken */}
                      {userProfile?.catalogs?.[catalog.id] && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Fortschritt</span>
                            <span>
                              {Math.round((userProfile.catalogs[catalog.id].totalQuestions / catalog.modules.reduce((total, module) => 
                                total + module.categories.reduce((catTotal, category) => 
                                  catTotal + category.questions.length, 0
                                ), 0
                              )) * 100)}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{
                                width: `${(userProfile.catalogs[catalog.id].totalQuestions / catalog.modules.reduce((total, module) => 
                                  total + module.categories.reduce((catTotal, category) => 
                                    catTotal + category.questions.length, 0
                                  ), 0
                                )) * 100}%`
                              }}
                            />
                          </div>
                          <div className="mt-1 flex justify-between text-xs text-gray-500">
                            <span>{userProfile.catalogs[catalog.id].correctAnswers} von {catalog.modules.reduce((total, module) => 
                              total + module.categories.reduce((catTotal, category) => 
                                catTotal + category.questions.length, 0
                              ), 0
                            )} Fragen richtig</span>
                            <span>
                              Zuletzt bearbeitet: {userProfile.catalogs[catalog.id].lastAttemptedAt.toDate().toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm flex justify-between items-center">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Zum Katalog
                      </span>
                      <svg 
                        className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7" 
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
} 