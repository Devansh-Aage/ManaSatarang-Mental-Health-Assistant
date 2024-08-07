import React from "react";
import ProfileCard from "./DBoardComponents/ProfileCard";
import JournalDb from "./DBoardComponents/JournalDb";
import CurrentTherapist from "./DBoardComponents/CurrentTherapist";
import ActivityDb from "./DBoardComponents/ActivityDb";
import CouponsDb from "./DBoardComponents/CouponsDb";
import AppointmentsDb from "./DBoardComponents/AppointmentsDb";
import { useNavigate } from "react-router-dom";

function Dashboard({ user, activities, userData,lang }) {
  const router=useNavigate()
  return (
    <div className="w-full h-full mt-10">
      <div className="grid lg:grid-cols-3 auto-rows-[120px] gap-2 lg:mx-6 lg:my-3 my-6 mx-12 h-full">
        <ProfileCard user={user} userData={userData} lang={lang} />
        <JournalDb lang={lang} />
        <AppointmentsDb user={user} lang={lang} />
        <ActivityDb user={user} activities={activities} />
        <CurrentTherapist user={user} lang={lang} />
      </div>
    </div>
  );
}

export default Dashboard;
