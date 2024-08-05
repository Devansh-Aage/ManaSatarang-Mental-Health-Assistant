import React from "react";
import { useNavigate } from "react-router-dom";

const TherapistCard = ({
  name,
  email,
  bio,
  specialization,
  profile,
  fees,
  location,
}) => {
  const navigate = useNavigate();

  const toDetails = () => {
    navigate("/therapists/therapistDetails", {
      state: {
        name: name,
        email: email,
        bio: bio,
        specialization: specialization,
        profile: profile ?? "",
        fees: fees,
        offLocation: location,
      },
    });
  };

  return (
    <div className="border-0 rounded-lg flex flex-col bg-white items-center gap-2 mb-10 mt-10 shadow-md hover:shadow-lg transition-shadow w-[240px] h-[320px]">
      <img
        src="https://images.pexels.com/photos/4307869/pexels-photo-4307869.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        alt={name}
        className="w-[100%] h-[150px] aspect-square rounded-t-lg"
      />
      <div className="font-bold text-lg text-center">{name}</div>
      <div className="font-normal text-base text-center">{specialization}</div>
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
