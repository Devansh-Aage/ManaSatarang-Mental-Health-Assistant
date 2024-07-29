import React from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, provider, db } from "./config/firebase-config";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { redirect, useNavigate } from "react-router-dom";

const Login = ({ userProp }) => {
  const navigate=useNavigate();
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User signed in:", user);

      // Check if user exists in Firestore
      const userRef = collection(db, "users");
      const userQuery = query(userRef, where("uid", "==", user.uid));
      console.log("User query:", userQuery);

      const userSnapshot = await getDocs(userQuery);
      console.log("User snapshot:", userSnapshot.docs);

      if (userSnapshot.docs.length > 0) {
        // User exists, fetch existing data
        const userData = userSnapshot.docs[0].data();
        
        if(userData.hasBiometric){
          navigate('/scan')
        }
        else{
          navigate('/')
          toast.success(`Welcome back, ${userData.name}!`);
        }
      } else {
        // User does not exist, create new entry
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastLogin: new Date(),
          verified: false,
          points: 0,
          isTherapist:false,
          hasBiometric:false
        });
        navigate('/');
        toast.success(`Welcome, ${user.displayName}!`);
        console.log("New user created.");
        // Here you can set states or update context with new user data
      }
     
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData?.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error("Error:", errorCode, errorMessage, email, credential);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] ">
      <h1 className="text-3xl font-bold mb-6">Welcome to ManaSatarang</h1>
      <button
        onClick={handleSignIn}
        className="flex items-center px-4 py-2   bg-purple-900 text-white rounded-lg hover:bg-purple-800 transition duration-300"
      >
        <svg
          className="w-6 h-6 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
        >
          <path
            fill="#4285F4"
            d="M24 9.5c3.3 0 6 1.2 8.2 3.2l6.1-6.1C34.7 2.5 29.6 0 24 0 14.6 0 6.6 5.8 3.3 14.2l7.3 5.7C12.4 13.5 17.7 9.5 24 9.5z"
          />
          <path
            fill="#34A853"
            d="M48 24c0-1.6-.2-3.2-.5-4.7H24v9h13.7c-.6 3-2.2 5.6-4.5 7.3l7.3 5.7C44.7 36.2 48 30.5 48 24z"
          />
          <path
            fill="#FBBC05"
            d="M7.3 28.8c-1-3-1-6.2 0-9.2l-7.3-5.7c-2.8 5.6-2.8 12.1 0 17.7l7.3-5.8z"
          />
          <path
            fill="#EA4335"
            d="M24 48c6.1 0 11.4-2.1 15.2-5.7l-7.3-5.7c-2.1 1.5-4.8 2.4-7.9 2.4-6.3 0-11.6-4.3-13.5-10.1l-7.3 5.7C6.6 42.2 14.6 48 24 48z"
          />
          <path fill="none" d="M0 0h48v48H0z" />
        </svg>
        Login with Google
      </button>
    </div>
  );
};

export default Login;
