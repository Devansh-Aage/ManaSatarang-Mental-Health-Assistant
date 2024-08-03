import React from "react";
import CameraCapture from "./components/CameraCapture";
import { useLocation } from "react-router-dom";

const ScanFace = ({ userData }) => {
  const location = useLocation();

  const uid = location.state?.userUID;
  const username = location.state?.username;
  console.log(uid);
  
  return (
    <div className="min-h-[80vh] w-full px-32 mt-20 overflow-hiden">
      Scan the Face To access the website
      <CameraCapture userData={userData} userId={uid} username={username} />
    </div>
  );
};

export default ScanFace;
