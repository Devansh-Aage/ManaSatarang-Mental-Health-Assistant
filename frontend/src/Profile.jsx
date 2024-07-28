import React, { useState, useEffect } from "react";
import PointsSidebar from "./components/PointsSidebar";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./config/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./config/firebase-config"; // Ensure you have this import

function Profile() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState(null);

  const getUserFromDB = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.log("No such document!");
        }
      } catch (err) {
        console.error("Error getting document:", err);
      }
    }
  };

  useEffect(() => {
    if (!loading) {
      getUserFromDB();
    }
  }, [user, loading]);

  // Debugging logs
  useEffect(() => {
    if (user) {
      console.log("User Data:", user);
      console.log("Photo URL:", user.photoURL);
    }
  }, [user]);

  return (
    <div className="flex flex-col items-center w-[1120px] h-[513px] mx-auto px-3 py-2 backdrop-blur-sm bg-white/30 rounded-xl">
      <div className="flex flex-row items-center justify-between gap-4 bg-slate-200/30 border rounded-lg p-4 border-purple-400 w-full h-full">
        <div className="flex flex-col ml-40">
          <h1 className="text-xl font-bold text-indigo-950 mb-1">Name</h1>
          <h2 className="text-lg text-indigo-950 mb-1">
            {user.displayName || "Rahul Dhanak"}
          </h2>
          <div className="h-[40px]"></div>
          <h2 className="text-xl font-bold text-indigo-950 mb-1">Email</h2>
          <p className="text-lg text-gray-600">
            {user.email || "rahuldhanak11@gmail.com"}
          </p>
          <div className="h-[40px]"></div>
          <h2 className="text-xl font-bold text-indigo-950 mb-1">Points</h2>
          <p className="text-lg text-gray-600">{userData?.points || "0"}</p>
        </div>
        <div className="flex flex-col items-center mb-8 mr-40">
          <div className="relative w-[170px] h-[170px] mb-4 ">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 rounded-full text-gray-600">
                No Photo
              </div>
            )}
          </div>
          <PointsSidebar />
        </div>
      </div>
    </div>
  );
}

export default Profile;
