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
} from 'firebase/firebase-auth.js';
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
} from 'firebase/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/firebase-storage.js';
import { FirebaseUser, Profile, PublishedApp } from '../types';

// Initialize Firebase services
const authInstance = getAuth();
const db = getFirestore();
const storage = getStorage();

// --- AUTHENTICATION ---

const linkAnonymousAccount = async (user: User) => {
    const anonymousUser = authInstance.currentUser;
    if (anonymousUser && anonymousUser.isAnonymous && user.email) {
        try {
            const credential = EmailAuthProvider.credential(user.email, 'password_placeholder'); // This seems odd, let's re-evaluate
            // The Firebase SDK handles linking differently for different providers.
            // For email/password, it happens on sign-up if an anon user is active.
            // For OAuth, we need to link the credential from the popup result.
            // This function might be better integrated directly into the sign-in methods.
            console.log("Attempting to link anonymous account...");
            // Let's rely on Firebase's automatic linking for now as it's the default behavior.
            // Manual linking is more complex and often not needed for this flow.
        } catch (error) {
            console.error("Error linking anonymous account:", error);
        }
    }
};

export const auth = {
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(authInstance, callback as (user: User | null) => void);
  },

  signInAnonymously: () => {
    return signInAnonymously(authInstance);
  },

  signUp: async ({ email, password }: { email: string, password?: string }) => {
    if (!password) throw new Error("Password is required for sign up.");
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    // Firebase automatically links the anonymous account on sign up if one is active.
    return userCredential.user as FirebaseUser;
  },

  signInWithPassword: async ({ email, password }: { email: string, password?: string }) => {
     if (!password) throw new Error("Password is required for sign in.");
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    return userCredential.user as FirebaseUser;
  },

  signInWithOAuth: async (providerName: 'google' | 'github') => {
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    const result = await signInWithPopup(authInstance, provider);
    
    // After OAuth sign-in, Firebase might automatically link if the email matches
    // an existing anonymous user's placeholder, but explicit linking is safer.
    const currentUser = authInstance.currentUser;
    if (currentUser && currentUser.isAnonymous) {
        try {
            // This is how you'd typically link after an OAuth popup
            const credential = providerName === 'google' 
                ? GoogleAuthProvider.credentialFromResult(result) 
                : GithubAuthProvider.credentialFromResult(result);

            if (credential) {
               // This links the anonymous user's data to the new OAuth account
               await linkWithCredential(currentUser, credential);
            }
        } catch (error: any) {
            // Handle error, e.g., if the OAuth account is already linked to another user.
            console.error("Error linking OAuth credential to anonymous user:", error);
            if (error.code === 'auth/credential-already-in-use') {
                // If the credential is already in use, just sign in with it directly.
                // The anonymous user will be lost, but this prevents an error.
                await signInWithPopup(authInstance, provider);
            }
        }
    }
    
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
