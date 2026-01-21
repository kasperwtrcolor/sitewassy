// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase config from environment variables (add these to Vercel)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB2jES77tCuIZsqYdFJU7AoI4qwe186-0M",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wassypay.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wassypay",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wassypay.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "201330965184",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:201330965184:web:c7308c78bf600bb1804b25"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
