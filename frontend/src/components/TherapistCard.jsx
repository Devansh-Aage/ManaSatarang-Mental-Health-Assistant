import React from "react";
import { Link, useNavigate } from "react-router-dom";

const TherapistCard = ({ name, degree, experience, specialty, imgPath,fees, }) => {
  const navigate=useNavigate();
  const toDetails=()=>{
    navigate('/therapistDetails',{state:{
      name:name,
      degree:degree,
      experience:experience,
      specialty:specialty,
      imgPath:imgPath,
      fees:fees,
      // uid:uid?? ""
    }})
  }
  return (
    <div className=" border rounded-lg flex w-[400px] h-[350px] flex-col items-center gap-2">
        <img src={imgPath} alt="" className="w-[80%] h-[50%] aspect-square" />
        <div>{name}</div>
        <div>{degree}</div>
        <div>{experience}</div>
        <div>{specialty}</div>
        <button onClick={()=>toDetails()} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Book a Session</button>
      
    </div>
  )
};

export default TherapistCard;
