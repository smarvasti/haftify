import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useRouter } from 'next/navigation';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, userProfile, deleteAccount } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'delete'>('profile');

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
    }
  }, [userProfile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');

      await updateProfile(user, {
        displayName: displayName
      });

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayName
      });

      setSuccessMessage('Profil erfolgreich aktualisiert');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Fehler beim Aktualisieren des Profils');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (newPassword !== confirmNewPassword) {
      setError('Die neuen Passwörter stimmen nicht überein');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');

      // Reauth before password change
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);

      setSuccessMessage('Passwort erfolgreich geändert');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => onClose(), 1500);
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        setError('Das aktuelle Passwort ist falsch');
      } else {
        setError('Fehler beim Ändern des Passworts');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deleteConfirmation !== userProfile?.email) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse zur Bestätigung ein');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');

      await deleteAccount(deletePassword);
      router.push('/login');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/wrong-password') {
        setError('Das eingegebene Passwort ist falsch');
      } else {
        setError('Fehler beim Löschen des Kontos');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Profil</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <button
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profil bearbeiten
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'password'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('password')}
            >
              Passwort ändern
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'delete'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('delete')}
            >
              Konto löschen
            </button>
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

          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
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
          ) : activeTab === 'password' ? (
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Aktuelles Passwort
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Neues Passwort
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Neues Passwort bestätigen
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isLoading ? 'Wird geändert...' : 'Passwort ändern'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAccountDeletion} className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Warnung: Konto unwiderruflich löschen
                </h3>
                <p className="text-sm text-red-600">
                  Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten, 
                  einschließlich Ihres Profils und Lernfortschritts, werden permanent gelöscht.
                </p>
              </div>

              <div>
                <label
                  htmlFor="deletePassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Aktuelles Passwort
                </label>
                <input
                  type="password"
                  id="deletePassword"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="deleteConfirmation"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bestätigen Sie die Löschung
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Geben Sie Ihre E-Mail-Adresse ({userProfile?.email}) ein, um fortzufahren
                </p>
                <input
                  type="email"
                  id="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
              >
                {isLoading ? 'Wird gelöscht...' : 'Konto unwiderruflich löschen'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 