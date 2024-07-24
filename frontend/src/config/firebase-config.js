// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGgDcQQDKG-iH2c0Zz-AqBkcRkXOI2ltU",
  authDomain: "hackathon-8127b.firebaseapp.com",
  projectId: "hackathon-8127b",
  storageBucket: "hackathon-8127b.appspot.com",
  messagingSenderId: "179895391523",
  appId: "1:179895391523:web:83d88a7ace49569dfaa896"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };