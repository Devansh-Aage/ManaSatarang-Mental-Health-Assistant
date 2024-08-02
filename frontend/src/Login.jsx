import React, { useRef, useState, useCallback } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, provider, db } from './config/firebase-config';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user',
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      console.error('Error accessing the camera', err);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setStream(null);
    }
  };

  const takePhoto = () => {
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    const context = canvasRef.current.getContext('2d');
    
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    context.drawImage(videoRef.current, 0, 0, width, height);
    
    const dataUrl = canvasRef.current.toDataURL('image/jpeg'); // Convert to base64
    setPhoto(dataUrl); // Set the base64 image data
    closeCamera(); // Close the camera after taking the photo
  };

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User signed in:', user);

      // Check if user exists in Firestore
      const userRef = collection(db, 'users');
      const userQuery = query(userRef, where('uid', '==', user.uid));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.docs.length > 0) {
        // User exists, fetch existing data
        const userData = userSnapshot.docs[0].data();
        // console.log('inside if loop');
        // if (userData.hasBiometric) {
        // navigate('/scan')
          // console.log('inside biometric');
          // openCamera(); // Start the camera when biometric check is needed
          
          // // Wait for the camera to open and photo to be taken
          // setTimeout(async () => {
          //   takePhoto(); // Capture the photo
            
          //   if (photo) {
          //     const blob = await fetch(photo).then((res) => res.blob());
          //     const formData = new FormData();
          //     formData.append('image', blob);

          //     const res = await axios.post(
          //       'https://akki3110.pythonanywhere.com/login',
          //       formData,
          //       {
          //         headers: {
          //           'Content-Type': 'multipart/form-data',
          //         },
          //       }
          //     );
          //     if (res.data.success) {
          //       navigate('/');
                toast.success(`Welcome back, ${userData.name}!`);
          //     } else {
          //       toast.error('Biometric authentication failed.');
          //     }
          //   } else {
          //     toast.error('Failed to capture image from webcam.');
          //   }
          // }, 2000); // Adjust timeout as needed to ensure capture
        // } else {
        //   navigate('/');
        //   toast.success(`Welcome back, ${userData.name}!`);
        // }
      } else {
        // User does not exist, create new entry
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastLogin: new Date(),
          verified: false,
          points: 0,
          isTherapist: false,
          hasBiometric: false,
        });
        navigate('/');
        toast.success(`Welcome, ${user.displayName}!`);
        console.log('New user created.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred during sign in. Please try again.');
    }
  };

  return (
    <div className='flex flex-col items-center justify-center h-[80vh]'>
      <h1 className='text-3xl font-bold mb-6'>Welcome to ManaSatarang</h1>
      <button
        onClick={handleSignIn}
        className='flex items-center px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 transition duration-300'
      >
        <svg
          className='w-6 h-6 mr-2'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 48 48'
        >
          <path
            fill='#4285F4'
            d='M24 9.5c3.3 0 6 1.2 8.2 3.2l6.1-6.1C34.7 2.5 29.6 0 24 0 14.6 0 6.6 5.8 3.3 14.2l7.3 5.7C12.4 13.5 17.7 9.5 24 9.5z'
          />
          <path
            fill='#34A853'
            d='M48 24c0-1.6-.2-3.2-.5-4.7H24v9h13.7c-.6 3-2.2 5.6-4.5 7.3l7.3 5.7C44.7 36.2 48 30.5 48 24z'
          />
          <path
            fill='#FBBC05'
            d='M7.3 28.8c-1-3-1-6.2 0-9.2l-7.3-5.7c-2.8 5.6-2.8 12.1 0 17.7l7.3-5.8z'
          />
          <path
            fill='#EA4335'
            d='M24 48c6.1 0 11.4-2.1 15.2-5.7l-7.3-5.7c-2.1 1.5-4.8 2.4-7.9 2.4-6.3 0-11.6-4.3-13.5-10.1l-7.3 5.7C6.6 42.2 14.6 48 24 48z'
          />
          <path fill='none' d='M0 0h48v48H0z' />
        </svg>
        Login with Google
      </button>
      {/* <div>
        <video ref={videoRef} autoPlay style={{ width: '50%' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div> */}
    </div>
  );
};

export default Login;
