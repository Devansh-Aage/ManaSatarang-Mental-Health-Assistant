import axios from "axios";
import { doc, setDoc } from "firebase/firestore";
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../config/firebase-config";

const CameraCapture = ({ userData, userId, username }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [stream, setStream] = useState(null);
  const [loading, setloading] = useState(false)
  const { pathname } = useLocation();
  console.log(pathname);

  const isRegister = pathname === "/profile" ? true : false;

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing the camera", err);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStream(null);
      console.log("CLose camera");
    }
  };

  const takePhoto = async () => {
    setloading(true)
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    const context = canvasRef.current.getContext("2d");

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    context.drawImage(videoRef.current, 0, 0, width, height);

    const dataUrl = canvasRef.current.toDataURL("image/jpg");
    setPhoto(dataUrl);
    console.log(userData);
    const registerFormData = new FormData();
    registerFormData.append("uid", userData.uid);
    registerFormData.append("image", dataUrl);
    const loginFormData = new FormData();
    loginFormData.append("uid", userId);
    loginFormData.append("image", dataUrl);

    if (isRegister) {
      const res = await axios.post(
        `https://akki3110.pythonanywhere.com/register`,
        registerFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      closeCamera();
      if (res.data.message) {
        const userDocRef = doc(db, "users", userData.uid);
        await setDoc(
          userDocRef,
          { isBiometricRegistered: true },
          { merge: true }
        );
        navigate(0);
        toast.success(`Biometric Profile Registered!`);
      } else {
        toast.error("Biometric registeration failed.");
      }
    } else {
      const res = await axios.post(
        `https://akki3110.pythonanywhere.com/login`,
        loginFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      closeCamera();
      setloading(false);
      if (res.data.success) {
        navigate("/");
        toast.success(`Welcome back, ${username}!`);
      } else {
        toast.error("Biometric authentication failed.");
      }
    }

    // const res = await axios.post(
    //   isRegister
    //     ? `https://akki3110.pythonanywhere.com/register`
    //     : `https://akki3110.pythonanywhere.com/login`,
    //   isRegister ? registerFormData : loginFormData,
    //   {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //     },
    //   }
    // );
    // closeCamera();
    // if (res.data.success) {
    //   navigate("/");
    //   //   toast.success(`Welcome back, ${userData.name}!`);
    // } else {
    //   toast.error("Biometric authentication failed.");
    // }
  };

  return (
    <div>
      <div>
        <video ref={videoRef} autoPlay style={{ width: "50%" }} />
        <div className="flex w-full  gap-6 items-center ">
          <button
          disabled={loading}
            className={`bg-purple-900 text-white px-4 py-2 rounded-md mt-4 ${loading&& 'bg-slate-500'}`}
            onClick={openCamera}
          >
            Open Camera
          </button>
          <button
          disabled={loading}
            className={`bg-purple-900 text-white px-4 py-2 rounded-md mt-4  ${loading&& 'bg-slate-500'}`}
            onClick={takePhoto}
          >
            Take Photo
          </button>
          <button
            className={`bg-purple-900 text-white px-4 py-2 rounded-md mt-4  ${loading&& 'bg-slate-500'}`}
            onClick={closeCamera}
          >
            Close Camera
          </button>
        </div>
      </div>
      <div>
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
      {/* {photo && (
        <div>
          <h3>Captured Photo</h3>
          <img src={photo} alt="Captured" style={{ width: "50%" }} />
        </div>
      )} */}
    </div>
  );
};

export default CameraCapture;
