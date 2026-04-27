import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCL54dpuG_BEDdb44elMbDovt8lfcnwjQM",
  authDomain: "brand-b69fb.firebaseapp.com",
  databaseURL: "https://brand-b69fb-default-rtdb.firebaseio.com",
  projectId: "brand-b69fb",
  storageBucket: "brand-b69fb.firebasestorage.app",
  messagingSenderId: "435782528441",
  appId: "1:435782528441:web:0d581c6ece646e27d85a68"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const database = getDatabase(app);
export const db = getFirestore(app); // Firestore for user data
export const realtimeDb = database; // Realtime Database for existing features
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;