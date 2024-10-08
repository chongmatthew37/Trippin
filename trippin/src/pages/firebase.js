// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkNpPguMtzBQR9k1YxJEJsBGJBsr8p_Ac",
  authDomain: "trippin-c43de.firebaseapp.com",
  projectId: "trippin-c43de",
  storageBucket: "trippin-c43de.appspot.com",
  messagingSenderId: "12160373799",
  appId: "1:12160373799:web:a59dfed8baa5bad7cc6a02",
  measurementId: "G-3DF72T0J2V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Google Auth Provider
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { db, auth, provider, signInWithPopup, signOut };