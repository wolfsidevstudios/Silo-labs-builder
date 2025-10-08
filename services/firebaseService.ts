// FIX: Add imports for Firestore and Storage
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  runTransaction,
  serverTimestamp,
  orderBy,
  Timestamp,
  increment,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
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
// FIX: Add Profile and PublishedApp to type imports
import { FirebaseUser, Profile, PublishedApp } from '../types';

// Initialize Firebase services
const authInstance = getAuth();
// FIX: Add placeholder initialization for db and storage to avoid runtime errors if Firebase isn't configured.
let db, storage;
try {
  db = getFirestore();
  storage = getStorage();
} catch (e) {
  console.error("Firebase not initialized. Firestore and Storage operations will fail.");
  db = null;
  storage = null;
}


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

// --- FIRESTORE & STORAGE ---

// FIX: Add getMarketplaceApps function
export async function getMarketplaceApps(): Promise<PublishedApp[]> {
  if (!db) return [];
  const appsRef = collection(db, 'publishedApps');
  const q = query(appsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PublishedApp));
}

// FIX: Add toggleLike function
export async function toggleLike(appId: string, userId: string, currentUserHasLiked: boolean): Promise<number> {
  if (!db) throw new Error("Database not available.");
  const appRef = doc(db, 'publishedApps', appId);
  const likeRef = doc(db, `publishedApps/${appId}/likes/${userId}`);

  return runTransaction(db, async (transaction) => {
    const appDoc = await transaction.get(appRef);
    if (!appDoc.exists()) {
      throw "App does not exist!";
    }
    
    let newLikesCount = appDoc.data().likes || 0;

    if (currentUserHasLiked) {
      // User is unliking
      transaction.delete(likeRef);
      transaction.update(appRef, { likes: increment(-1) });
      newLikesCount--;
    } else {
      // User is liking
      transaction.set(likeRef, { userId, createdAt: serverTimestamp() });
      transaction.update(appRef, { likes: increment(1) });
      newLikesCount++;
    }
    return Math.max(0, newLikesCount);
  });
}

// FIX: Add hasUserLikedApp function
export async function hasUserLikedApp(appId: string, userId: string): Promise<boolean> {
  if (!db) return false;
  const likeRef = doc(db, `publishedApps/${appId}/likes/${userId}`);
  const docSnap = await getDoc(likeRef);
  return docSnap.exists();
}

// FIX: Add getProfile function
export async function getProfile(userId: string): Promise<Profile | null> {
  if (!db) return null;
  const profileRef = doc(db, 'profiles', userId);
  const docSnap = await getDoc(profileRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Profile;
  }
  return null;
}

// FIX: Add createOrUpdateProfile function
export async function createOrUpdateProfile(userId: string, profileData: Partial<Omit<Profile, 'id'>>): Promise<Profile> {
  if (!db) throw new Error("Database not available.");
  const profileRef = doc(db, 'profiles', userId);
  
  const dataToSave: any = {
    username: profileData.username,
  };
  if ('avatarUrl' in profileData) dataToSave.avatarUrl = profileData.avatarUrl;
  if ('bannerUrl' in profileData) dataToSave.bannerUrl = profileData.bannerUrl;

  await setDoc(profileRef, dataToSave, { merge: true });
  
  const savedDoc = await getDoc(profileRef);
  return { id: userId, ...savedDoc.data() } as Profile;
}

// FIX: Add getUserApps function
export async function getUserApps(authorId: string): Promise<PublishedApp[]> {
  if (!db) return [];
  const appsRef = collection(db, 'publishedApps');
  const q = query(appsRef, where('authorId', '==', authorId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PublishedApp));
}

// FIX: Add uploadProfileImage function
export async function uploadProfileImage(file: File, userId: string, type: 'avatar' | 'banner'): Promise<string> {
    if (!storage) throw new Error("Storage not available.");
    const filePath = `profile-images/${userId}/${type}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}
