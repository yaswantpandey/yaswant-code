import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleAuthProvider } from '../lib/firebase';
import { tokenStorage } from './api';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'admin';
  title?: string;
  avatar?: string;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Safe Firestore operation with timeout to prevent blocking auth flows
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 2500): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs))
  ]);
}

/**
 * Sign up a new user using Firebase Email/Password Authentication
 * and immediately creates their user record in Firestore.
 */
export async function signUpWithEmail(
  email: string, 
  password: string, 
  displayName: string
): Promise<{ user: FirebaseUser; profile: UserProfile }> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  // Update Auth Profile
  if (displayName) {
    try {
      await updateProfile(user, { displayName });
    } catch (e) {
      console.warn('Profile update warning:', e);
    }
  }

  // Sync to Firestore users collection
  const defaultProfile: UserProfile = {
    uid: user.uid,
    email: user.email || email,
    displayName: displayName || email.split('@')[0],
    role: 'student',
    title: 'Software Engineering Student',
    avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || email)}&background=6366f1&color=fff`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const userDocRef = doc(db, 'users', user.uid);
    await withTimeout(setDoc(userDocRef, {
      ...defaultProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true }), 2500);
  } catch (err) {
    console.warn('Firestore user profile sync warning (offline/cached):', err);
  }

  // Keep tokenStorage updated for local UI state
  try {
    const token = await user.getIdToken();
    tokenStorage.set(token);
  } catch (_) {}

  tokenStorage.setUser({
    id: user.uid,
    name: defaultProfile.displayName,
    email: defaultProfile.email,
    role: defaultProfile.role,
    avatar: defaultProfile.avatar
  });

  return { user, profile: defaultProfile };
}

/**
 * Sign in existing user with Email/Password
 */
export async function signInWithEmail(
  email: string, 
  password: string
): Promise<{ user: FirebaseUser; profile: UserProfile }> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  let profile: UserProfile = {
    uid: user.uid,
    email: user.email || email,
    displayName: user.displayName || email.split('@')[0],
    role: 'student',
    title: 'Software Engineering Student',
    avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || email)}&background=6366f1&color=fff`
  };

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await withTimeout(getDoc(userDocRef), 2000);
    if (snap && snap.exists()) {
      profile = { ...profile, ...snap.data() } as UserProfile;
    } else {
      await withTimeout(setDoc(userDocRef, {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }), 2000);
    }
  } catch (err) {
    console.warn('Firestore user profile load warning:', err);
  }

  // Set token and user in storage
  try {
    const token = await user.getIdToken();
    tokenStorage.set(token);
  } catch (_) {}

  tokenStorage.setUser({
    id: user.uid,
    name: profile.displayName,
    email: profile.email,
    role: profile.role,
    avatar: profile.avatar
  });

  return { user, profile };
}

/**
 * Sign in with Google (Popup)
 */
export async function signInWithGoogle(): Promise<{ user: FirebaseUser; profile: UserProfile }> {
  const credential = await signInWithPopup(auth, googleAuthProvider);
  const user = credential.user;

  let profile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'Learner',
    role: 'student',
    title: 'Software Engineering Student',
    avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=6366f1&color=fff`
  };

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await withTimeout(getDoc(userDocRef), 2000);
    if (snap && snap.exists()) {
      profile = { ...profile, ...snap.data() } as UserProfile;
    } else {
      await withTimeout(setDoc(userDocRef, {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }), 2000);
    }
  } catch (err) {
    console.warn('Firestore Google sign-in profile sync warning:', err);
  }

  try {
    const token = await user.getIdToken();
    tokenStorage.set(token);
  } catch (_) {}

  tokenStorage.setUser({
    id: user.uid,
    name: profile.displayName,
    email: profile.email,
    role: profile.role,
    avatar: profile.avatar
  });

  return { user, profile };
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out warning:', e);
  }
  tokenStorage.remove();
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Subscribe to Firebase Auth state updates
 */
export function onAuthUpdate(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        tokenStorage.set(token);
      } catch (_) {}
    } else {
      tokenStorage.remove();
    }
    callback(user);
  });
}

/**
 * Persist course enrollment to Firestore
 */
export async function syncCourseEnrollment(courseId: string, courseTitle: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  try {
    const enrollmentRef = doc(db, 'users', currentUser.uid, 'enrollments', courseId);
    await withTimeout(setDoc(enrollmentRef, {
      courseId,
      courseTitle,
      enrolledAt: serverTimestamp(),
      progress: 5,
      completed: false
    }, { merge: true }), 2500);
  } catch (err) {
    console.warn('Enrollment sync warning:', err);
  }
}

/**
 * Persist lesson progress to Firestore
 */
export async function syncLessonProgress(courseId: string, progressPercent: number) {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  try {
    const enrollmentRef = doc(db, 'users', currentUser.uid, 'enrollments', courseId);
    await withTimeout(updateDoc(enrollmentRef, {
      progress: progressPercent,
      lastActive: serverTimestamp(),
      completed: progressPercent >= 100
    }), 2500);
  } catch (err) {
    console.warn('Progress sync warning:', err);
  }
}
