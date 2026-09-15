/**
 * Firestore Database Service
 * Provides durable cloud persistence for Notes, Project Submissions, and User Profiles
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface FirebaseNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  updatedAt: string;
}

export interface FirebaseProjectSubmission {
  id: string;
  userId: string;
  projectId: string;
  githubUrl: string;
  liveUrl?: string;
  notes?: string;
  submittedAt: string;
}

export const firebaseDb = {
  /**
   * Save or update a personal study note in Firestore
   */
  async saveUserNote(userId: string, note: FirebaseNote): Promise<void> {
    try {
      const noteRef = doc(db, 'users', userId, 'notes', note.id);
      await setDoc(noteRef, {
        id: note.id,
        userId: note.userId,
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags || [],
        updatedAt: note.updatedAt || new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.warn('Firestore saveUserNote notice (operating in local fallback if unauthenticated):', error);
    }
  },

  /**
   * Load notes from Firestore
   */
  async getUserNotes(userId: string): Promise<FirebaseNote[]> {
    try {
      const notesCol = collection(db, 'users', userId, 'notes');
      const snap = await getDocs(notesCol);
      return snap.docs.map(d => d.data() as FirebaseNote);
    } catch (error) {
      console.warn('Firestore getUserNotes notice:', error);
      return [];
    }
  },

  /**
   * Submit a Capstone Project to Firestore
   */
  async submitCapstoneProject(submission: FirebaseProjectSubmission): Promise<void> {
    try {
      const subRef = doc(db, 'projectSubmissions', submission.id);
      await setDoc(subRef, {
        id: submission.id,
        userId: submission.userId,
        projectId: submission.projectId,
        githubUrl: submission.githubUrl,
        liveUrl: submission.liveUrl || '',
        notes: submission.notes || '',
        submittedAt: submission.submittedAt || new Date().toISOString()
      });
    } catch (error) {
      console.warn('Firestore submitCapstoneProject notice:', error);
    }
  },

  /**
   * Listen to real-time project submissions
   */
  subscribeToProjectSubmissions(callback: (submissions: FirebaseProjectSubmission[]) => void) {
    try {
      const colRef = collection(db, 'projectSubmissions');
      return onSnapshot(colRef, (snapshot) => {
        const data = snapshot.docs.map(d => d.data() as FirebaseProjectSubmission);
        callback(data);
      }, (err) => {
        console.warn('Firestore snapshot notice:', err);
      });
    } catch {
      return () => {};
    }
  }
};

export default firebaseDb;
