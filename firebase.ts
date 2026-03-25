import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp, updateDoc, collection, query, orderBy, addDoc } from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const saveToHistory = async (userId: string, data: { imageUrl: string; type: string; prompt?: string }) => {
    try {
        await addDoc(collection(db, `users/${userId}/history`), {
            ...data,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving to history:", error);
    }
};

export { signInWithPopup, signOut, onAuthStateChanged, doc, getDoc, setDoc, onSnapshot, serverTimestamp, updateDoc, collection, query, orderBy, addDoc };
