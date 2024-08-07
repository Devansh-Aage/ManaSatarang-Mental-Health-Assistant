import React from "react";
import ProfileCard from "./DBoardComponents/ProfileCard";
import JournalDb from "./DBoardComponents/JournalDb";
import CurrentTherapist from "./DBoardComponents/CurrentTherapist";
import ActivityDb from "./DBoardComponents/ActivityDb";
import CouponsDb from "./DBoardComponents/CouponsDb";
import AppointmentsDb from "./DBoardComponents/AppointmentsDb";
import { useNavigate } from "react-router-dom";

function Dashboard({ user, activities }) {
  const router=useNavigate()
  console.log(activities);
  if(!user){
router('/login')
  }
  return (
    <div>
      <div className="grid lg:grid-cols-3 auto-rows-[120px] gap-2 lg:mx-6 lg:my-3 my-6 mx-12 h-full">
        <ProfileCard user={user} />
        <JournalDb />
        <AppointmentsDb user={user} />
        <ActivityDb user={user} activities={activities} />
        <CurrentTherapist user={user} />
      </div>
    </div>
  );
}

export default Dashboard;
