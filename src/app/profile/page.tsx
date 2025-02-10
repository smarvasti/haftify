'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');

      // Update Firebase Auth Profile
      await updateProfile(user, {
        displayName: displayName
      });

      // Update Firestore Profile
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayName
      });

      setSuccessMessage('Profil erfolgreich aktualisiert');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Fehler beim Aktualisieren des Profils');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg
                className="w-6 h-6"
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
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Profil bearbeiten</h1>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={userProfile?.email || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Die E-Mail-Adresse kann nicht geändert werden.
              </p>
            </div>

            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? 'Wird gespeichert...' : 'Änderungen speichern'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 