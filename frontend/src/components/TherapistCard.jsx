import React from "react";
import { useNavigate } from "react-router-dom";

const TherapistCard = ({ name, degree, experience, specialty, imgPath, fees }) => {
  const navigate = useNavigate();

  const toDetails = () => {
    navigate('/therapists/therapistDetails', {
      state: {
        name: name,
        degree: degree,
        experience: experience,
        specialty: specialty,
        imgPath: imgPath,
        fees: fees,
        // uid: uid?? ""
      }
    });
  };

  return (
    <div className="border-0 rounded-lg flex flex-col items-center gap-2 mb-10 mt-10 shadow-md cursor-pointer hover:shadow-lg transition-shadow w-[240px] h-[320px]">
      <img 
        src={imgPath} 
        alt={name} 
        className="w-[100%] h-[150px] aspect-square rounded-lg" 
      />
      <div className="font-bold text-lg text-center">{name}</div>
      <div className="font-normal text-base text-center">{specialty}</div>
      <button 
        onClick={toDetails} 
        className="bg-indigo-950 text-white px-4 py-2 rounded-lg mt-auto hover:bg-blue-900 transition-colors mb-4"
      >
        Book an Appointment
      </button>
    </div>
  );
};

export default TherapistCard;
