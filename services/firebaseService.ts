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
  linkWithCredential,
  EmailAuthProvider,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
  Timestamp,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { FirebaseUser, Profile, PublishedApp } from '../types';

// Initialize Firebase services
const authInstance = getAuth();
const db = getFirestore();
const storage = getStorage();

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


// --- FIRESTORE (PROFILES) ---

const profilesCollection = collection(db, 'profiles');

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const docRef = doc(profilesCollection, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Profile;
  } else {
    return null;
  }
};

export const createOrUpdateProfile = async (userId: string, data: Partial<Omit<Profile, 'id' | 'createdAt'>>): Promise<Profile> => {
  const docRef = doc(profilesCollection, userId);
  const existingProfile = await getProfile(userId);
  
  const profileData = {
    userId: userId,
    username: data.username || 'Anonymous',
    avatarUrl: data.avatarUrl || '',
    bannerUrl: data.bannerUrl || '',
    ...data,
  };

  if (existingProfile) {
    // Update existing profile
    await updateDoc(docRef, data);
    return { ...existingProfile, ...data };
  } else {
    // Create new profile
    const newProfile = {
      ...profileData,
      createdAt: serverTimestamp(),
    };
    await setDoc(docRef, newProfile);
    return { id: userId, createdAt: new Date().toISOString(), ...profileData } as Profile;
  }
};


// --- FIRESTORE (APPS) ---

const appsCollection = collection(db, 'published_apps');

export const publishApp = async (authorId: string, appData: { prompt: string; summary: string[]; htmlContent: string; previewHtml: string; }) => {
  const authorProfile = await getProfile(authorId);
  if (!authorProfile) {
    throw new Error("Author profile not found. Cannot publish app.");
  }

  const appToPublish = {
    ...appData,
    authorId,
    authorUsername: authorProfile.username,
    authorAvatarUrl: authorProfile.avatarUrl || '',
    createdAt: serverTimestamp(),
    likes: 0,
  };

  return await addDoc(appsCollection, appToPublish);
};

export const getMarketplaceApps = async (limit = 20): Promise<PublishedApp[]> => {
  const q = query(appsCollection, orderBy('likes', 'desc'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PublishedApp));
};

export const getUserApps = async (userId: string): Promise<PublishedApp[]> => {
  // Note: Firestore requires an index for queries on different fields.
  // The query below should be `where('authorId', '==', authorProfileId)`.
  // I'm assuming the `userId` passed here is the author's profile document ID.
  const q = query(appsCollection, where('authorId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PublishedApp));
};

// --- FIRESTORE (LIKES) ---

export const hasUserLikedApp = async (appId: string, userId: string): Promise<boolean> => {
    const likeDocRef = doc(db, `users/${userId}/likes`, appId);
    const docSnap = await getDoc(likeDocRef);
    return docSnap.exists();
};

export const toggleLike = async (appId: string, userId: string, hasLiked: boolean): Promise<number> => {
  const appRef = doc(db, 'published_apps', appId);
  const likeRef = doc(db, `users/${userId}/likes`, appId);
  
  try {
    const newLikesCount = await runTransaction(db, async (transaction) => {
      const appDoc = await transaction.get(appRef);
      if (!appDoc.exists()) {
        throw "App does not exist!";
      }

      const currentLikes = appDoc.data().likes || 0;
      let newCount;

      if (hasLiked) {
        // User is unliking
        transaction.delete(likeRef);
        newCount = currentLikes - 1;
      } else {
        // User is liking
        transaction.set(likeRef, { createdAt: serverTimestamp() });
        newCount = currentLikes + 1;
      }

      newCount = Math.max(0, newCount); // Ensure likes don't go below zero
      transaction.update(appRef, { likes: newCount });
      return newCount;
    });

    return newLikesCount;

  } catch (e) {
    console.error("Like transaction failed: ", e);
    throw e;
  }
};


// --- FIREBASE STORAGE ---

export const uploadProfileImage = async (file: File, userId: string, type: 'avatar' | 'banner'): Promise<string> => {
    const fileExtension = file.name.split('.').pop();
    const filePath = `profile_images/${userId}/${type}.${fileExtension}`;
    const storageRef = ref(storage, filePath);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
};