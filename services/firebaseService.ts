import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { FirebaseUser } from '../types';

// Initialize Firebase services
const authInstance = getAuth();

// --- AUTHENTICATION ---

export const auth = {
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(authInstance, callback as (user: User | null) => void);
  },

  signInAnonymously: () => {
    return signInAnonymously(authInstance);
  },

  signUp: async ({ email, password }: { email: string, password?: string }) => {
    if (!password) throw new Error("Password is required for sign up.");
    // If an anonymous user is currently signed in, this call will upgrade the anonymous
    // account to a permanent email/password account, preserving the UID.
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    return userCredential.user as FirebaseUser;
  },

  signInWithPassword: async ({ email, password }: { email: string, password?: string }) => {
     if (!password) throw new Error("Password is required for sign in.");
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    return userCredential.user as FirebaseUser;
  },

  signInWithOAuth: async (providerName: 'google' | 'github') => {
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    // When an anonymous user signs in with a permanent credential like OAuth,
    // Firebase automatically links the accounts. The original anonymous UID is preserved.
    // No manual linking logic is required for this common flow.
    const result = await signInWithPopup(authInstance, provider);
    return result.user as FirebaseUser;
  },

  signOut: () => {
    return signOut(authInstance);
  },
  
  currentUser: authInstance.currentUser as FirebaseUser | null,
};


export const getUserId = (): string | null => {
  return authInstance.currentUser?.uid || null;
};