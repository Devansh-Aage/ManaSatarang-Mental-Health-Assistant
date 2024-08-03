import axios from "axios";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CameraCapture = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [stream, setStream] = useState(null);

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
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    const context = canvasRef.current.getContext("2d");

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    context.drawImage(videoRef.current, 0, 0, width, height);

    const dataUrl = canvasRef.current.toDataURL("image/jpg");
    setPhoto(dataUrl);
    console.log(dataUrl);
    const formData = new FormData();
    formData.append("image", dataUrl);
    const res = await axios.post(
      "https://akki3110.pythonanywhere.com/login",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    closeCamera();
    if (res.data.success) {
      navigate("/");
    //   toast.success(`Welcome back, ${userData.name}!`);
    } else {
      toast.error("Biometric authentication failed.");
    }
  };

  return (
    <div>
      <div>
        <video ref={videoRef} autoPlay style={{ width: "50%" }} />
        <button
          className="bg-purple-900 text-white px-4 py-2 rounded-md mt-4"
          onClick={openCamera}
        >
          Open Camera
        </button>
        <button
          className="bg-purple-900 text-white px-4 py-2 rounded-md mt-4"
          onClick={takePhoto}
        >
          Take Photo
        </button>
        <button
          className="bg-purple-900 text-white px-4 py-2 rounded-md mt-4"
          onClick={closeCamera}
        >
          Close Camera
        </button>
      </div>
      <div>
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
      {photo && (
        <div>
          <h3>Captured Photo</h3>
          <img src={photo} alt="Captured" style={{ width: "50%" }} />
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
