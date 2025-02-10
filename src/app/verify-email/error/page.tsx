'use client';

import React from 'react';
import Link from 'next/link';

export default function VerifyEmailErrorPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifizierungslink ungültig
            </h2>
            <p className="text-gray-600 mb-6">
              Der Verifizierungslink ist abgelaufen oder wurde bereits verwendet. 
              Bitte fordern Sie einen neuen Link an.
            </p>
            <div className="space-y-3">
              <Link
                href="/verify-email"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
              >
                Neuen Verifizierungslink anfordern
              </Link>
              <Link
                href="/login"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
              >
                Zurück zum Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 