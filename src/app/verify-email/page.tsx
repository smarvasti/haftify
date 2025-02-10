'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  const { user, resendVerificationEmail } = useAuth();

  // Überprüfe den Verifizierungsstatus beim Laden der Seite
  useEffect(() => {
    if (user?.emailVerified) {
      setIsVerified(true);
      // Automatische Weiterleitung nach 3 Sekunden
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  async function handleResendVerification() {
    try {
      setLoading(true);
      setError('');
      await resendVerificationEmail();
      setSuccess(true);
    } catch (error) {
      setError('Fehler beim Senden der Verifizierungs-E-Mail');
    } finally {
      setLoading(false);
    }
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                E-Mail erfolgreich verifiziert!
              </h2>
              <p className="text-gray-600 mb-4">
                Sie werden in wenigen Sekunden zum Login weitergeleitet...
              </p>
              <Link
                href="/login"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Direkt zum Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            E-Mail-Adresse bestätigen
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Bitte bestätigen Sie Ihre E-Mail-Adresse, um fortzufahren
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-gray-700">
                Wir haben eine Bestätigungs-E-Mail an <strong>{user?.email}</strong> gesendet.
                Bitte klicken Sie auf den Link in der E-Mail, um Ihre E-Mail-Adresse zu bestätigen.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">
                Verifizierungs-E-Mail wurde erneut gesendet
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? 'Wird gesendet...' : 'Verifizierungs-E-Mail erneut senden'}
            </button>

            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Zurück zum Login
            </Link>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>
              Nachdem Sie Ihre E-Mail-Adresse bestätigt haben, melden Sie sich bitte erneut an.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 