import React from "react";
import { useNavigate } from "react-router-dom";

const TherapistCard = ({
  name,
  email,
  bio,
  specialization,
  imgPath,
  fees,
  location,
  userData,
  experience,
  lang
}) => {
  const navigate = useNavigate();
  console.log(lang);
  

  const toDetails = () => {
    navigate("/therapists/therapistDetails", {
      state: {
        name: name,
        email: email,
        bio: bio,
        specialization: specialization,
        profile: imgPath ?? "",
        fees: fees,
        offLocation: location,
        userData:userData,
        exp:experience,
        lang:lang
      }
    });
  };

  return (
    <div className="border-0 rounded-lg flex flex-col bg-white items-center gap-2 mb-10 mt-10 shadow-md hover:shadow-lg transition-shadow w-[240px] h-[320px]">
      <img
        src={imgPath}
        alt={name}
        className="w-[100%] h-[150px] aspect-square rounded-t-lg"
      />
      <div className="font-bold text-lg text-center">{name}</div>
      <div className="font-normal text-base px-2 text-center">{specialization}</div>
      <button
        onClick={toDetails}
        className="bg-indigo-950 text-white px-4 py-2 rounded-lg mt-auto hover:bg-blue-900 transition-colors mb-4"
      >
        Book an Session
      </button>
    </div>
  );
};

export default TherapistCard;
