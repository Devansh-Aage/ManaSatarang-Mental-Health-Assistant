import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { Gem, BarChartBig  } from "lucide-react";
import { translateText } from "../../utils";

function ProfileCard({ user,userData,lang }) {
  const [staticText, setstaticText] = useState(['Coupons','Leaderboard','Points'])

  const navigate = useNavigate();

  const translatePage=async()=>{
    const translatedPage = await Promise.all(
      staticText.map(async (t) => {
        const translatedMsg = await translateText(t, lang);
        return translatedMsg;
      })
    );
    setstaticText(translatedPage)
  }
  useEffect(() => {
   translatePage()
  }, [lang])
  



  return (
    <div className="bg-white border rounded-xl p-4 flex flex-col items-center  justify-center row-span-2">
      {user ? (
        <>
          <Link to="/profile">
            <img
              src={user.photoURL}
              alt="Profile Icon"
              width={60}
              height={60}
              className="mt-4 mb-4 rounded-full"
            />
          </Link>
          <h2 className="text-base text-black">{user.displayName}</h2>
          <p className="text-gray-500 text-xs mb-4">{user.email}</p>
          <p className="text-sm text-purple-800 font-bold mb-4">Points:   {userData?.points}</p>
        </>
      ) : (
        <p className="text-gray-500 text-sm mb-4">Loading...</p>
      )}
      <div className="mt-auto flex gap-3 justify-center mb-4 items-center">
        <button className="bg-purple-900 text-white p-2 rounded-lg text-sm flex flex-row items-center hover:bg-purple-800 transition-colors duration-200" onClick={() => navigate("/profile/coupon")}><Gem size={15} className="mr-2"/>{staticText[0]}</button>
        <button className="bg-purple-900 text-white p-2 rounded-lg text-sm flex flex-row items-center hover:bg-purple-800 transition-colors duration-200" onClick={() => navigate("/profile/leaderboard")}><BarChartBig size={15} className="mr-2"/>{staticText[1]}</button>
      </div>
    </div>
  );
}

export default ProfileCard;
