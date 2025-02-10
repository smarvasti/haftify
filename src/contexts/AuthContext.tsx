'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  getIdToken,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  getDocs,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import Cookies from 'js-cookie';

interface Progress {
  questionId: string;
  isCorrect: boolean;
  selectedAnswers: string[];
  attemptedAt: Timestamp;
}

interface CatalogProgress {
  [questionId: string]: Progress;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: any;
  lastLoginAt: any;
  catalogs?: {
    [catalogId: string]: {
      lastAttemptedAt: Timestamp;
      totalQuestions: number;
      correctAnswers: number;
    };
  };
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  saveProgress: (catalogId: string, progress: Progress) => Promise<void>;
  loadCatalogProgress: (catalogId: string) => Promise<CatalogProgress>;
  deleteAccount: (password: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Funktion zum Laden des Benutzerprofils
  async function loadUserProfile(user: User) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      setUserProfile(userSnap.data() as UserProfile);
    }
  }

  // Funktion zum Speichern eines Lernfortschritts
  async function saveProgress(catalogId: string, progress: Progress) {
    if (!user) return;

    const progressRef = doc(
      collection(db, 'users', user.uid, 'catalogs', catalogId, 'progress'),
      progress.questionId
    );

    await setDoc(progressRef, {
      ...progress,
      attemptedAt: serverTimestamp()
    });

    // Aktualisiere die Katalog-Statistiken im Benutzerprofil
    const userRef = doc(db, 'users', user.uid);
    const catalogProgressQuery = query(
      collection(db, 'users', user.uid, 'catalogs', catalogId, 'progress')
    );
    const progressSnapshot = await getDocs(catalogProgressQuery);
    
    const totalQuestions = progressSnapshot.size;
    const correctAnswers = progressSnapshot.docs.filter(
      doc => doc.data().isCorrect
    ).length;

    await setDoc(userRef, {
      catalogs: {
        [catalogId]: {
          lastAttemptedAt: serverTimestamp(),
          totalQuestions,
          correctAnswers
        }
      }
    }, { merge: true });

    // Aktualisiere das lokale Benutzerprofil
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        catalogs: {
          ...userProfile.catalogs,
          [catalogId]: {
            lastAttemptedAt: Timestamp.now(),
            totalQuestions,
            correctAnswers
          }
        }
      });
    }
  }

  // Funktion zum Laden der Fortschritte eines Katalogs
  async function loadCatalogProgress(catalogId: string): Promise<CatalogProgress> {
    if (!user) return {};

    const progressQuery = query(
      collection(db, 'users', user.uid, 'catalogs', catalogId, 'progress')
    );
    const progressSnapshot = await getDocs(progressQuery);
    
    const progress: CatalogProgress = {};
    progressSnapshot.forEach(doc => {
      progress[doc.id] = doc.data() as Progress;
    });

    return progress;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Hole den ID Token und setze ihn als Cookie
        const token = await getIdToken(user);
        Cookies.set('session', token, { 
          expires: 14,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        // Lade das Benutzerprofil
        await loadUserProfile(user);
      } else {
        // Lösche den Cookie und das Profil bei Logout
        Cookies.remove('session');
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signUp(email: string, password: string, name: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await updateProfile(result.user, {
          displayName: name
        });
        
        // Sende Verifizierungs-E-Mail mit den gleichen Settings
        const actionCodeSettings = {
          url: process.env.NODE_ENV === 'production'
            ? 'https://haftify.de/verify-email'
            : 'http://localhost:3000/verify-email',
          handleCodeInApp: false
        };
        
        await sendEmailVerification(result.user, actionCodeSettings);
        
        // Erstelle das Benutzerprofil in Firestore
        const userProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: name,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          catalogs: {},
          emailVerified: false
        };
        
        await setDoc(doc(db, 'users', result.user.uid), userProfile);
        setUserProfile(userProfile);

        // Setze den Token-Cookie
        const token = await getIdToken(result.user);
        Cookies.set('session', token, { 
          expires: 14,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });

        // Logge den Benutzer direkt nach der Registrierung aus
        await signOut(auth);
        Cookies.remove('session');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      if (!result.user.emailVerified) {
        // Wenn die E-Mail nicht verifiziert ist, logge den Benutzer aus
        await signOut(auth);
        Cookies.remove('session');
        setUserProfile(null);
        throw new Error('email-not-verified');
      }

      // Aktualisiere den letzten Login-Zeitpunkt
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        emailVerified: result.user.emailVerified
      }, { merge: true });

      const token = await getIdToken(result.user);
      Cookies.set('session', token, { 
        expires: 14,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      Cookies.remove('session');
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async function deleteAccount(password: string) {
    if (!user || !user.email) throw new Error('Kein Benutzer angemeldet');

    try {
      // Reauth before deletion
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Lösche alle Daten des Benutzers aus Firestore
      const batch = writeBatch(db);

      // Lösche das Hauptprofil
      const userRef = doc(db, 'users', user.uid);
      batch.delete(userRef);

      // Lösche alle Katalog-Fortschritte
      const catalogsRef = collection(db, 'users', user.uid, 'catalogs');
      const catalogsSnapshot = await getDocs(catalogsRef);
      
      for (const catalogDoc of catalogsSnapshot.docs) {
        // Lösche alle Fortschritte in jedem Katalog
        const progressRef = collection(catalogDoc.ref, 'progress');
        const progressSnapshot = await getDocs(progressRef);
        progressSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        // Lösche den Katalog selbst
        batch.delete(catalogDoc.ref);
      }

      // Führe alle Löschoperationen aus
      await batch.commit();

      // Lösche den Benutzer aus Firebase Auth
      await deleteUser(user);
      
      // Lösche den Session-Cookie
      Cookies.remove('session');
      setUserProfile(null);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  async function resendVerificationEmail() {
    if (!user) throw new Error('Kein Benutzer angemeldet');
    
    const actionCodeSettings = {
      url: process.env.NODE_ENV === 'production'
        ? 'https://haftify.de/verify-email'
        : 'http://localhost:3000/verify-email',
      handleCodeInApp: false
    };
    
    await sendEmailVerification(user, actionCodeSettings);
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    saveProgress,
    loadCatalogProgress,
    deleteAccount,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 