// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGrFD99Xm16qePL_3kcwecDaEdXvuCh20",
  authDomain: "e-read-hub.firebaseapp.com",
  projectId: "e-read-hub",
  storageBucket: "e-read-hub.firebasestorage.app",
  messagingSenderId: "794094086936",
  appId: "1:794094086936:web:6a35ac03c87ce93aaa8c6d",
  measurementId: "G-LDFD780BKN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// --- INISIALISASI FITUR LOGIN ---
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- EXPORT VARIABEL PENTING ---
// Kita export 'auth' dan 'googleProvider' agar bisa dipanggil di Login.jsx
export { app, analytics, auth, googleProvider };
