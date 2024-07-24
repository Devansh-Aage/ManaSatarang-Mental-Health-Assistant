import React, { useEffect, useState } from "react";
import { Link, redirect, Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./config/firebase-config";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  Timestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Activity from "./Activity";
import Home from "./Home";
import Chatbot from "./Chatbot";
import Login from "./Login";
import Community from "./Community";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { activityList } from "./utils";
import ActivityDetails from "./ActivityDetails";
import Workspace from "./Workspace";
import Chronic from "./Chronic";
import PointsPage from "./PointsPage";
import Leaderboard from "./Leaderboard";
import Coupons from "./Coupons";
import Forum from "./Forum";
import { Bell } from "lucide-react";
import Profile from "./Profile";

const getRandomActivities = (list, count) => {
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const App = () => {
  const [activities, setActivities] = useState([]);
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [lastUpdateDate, setLastUpdateDate] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

const navigate=useNavigate()
  const redirectToHomeIfAuth=()=>{
    if(user){
      navigate("/");
    }
    else{
      navigate('/login');
    }
  }

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

  const getTasksFromDB = async () => {
    if (user) {
      try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const offset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
        const startOfDayUTC530 = new Date(today.getTime() + offset);
        const endOfDayUTC530 = new Date(
          startOfDayUTC530.getTime() + 24 * 60 * 60 * 1000
        );
        console.log("start", startOfDayUTC530);
        console.log("end", endOfDayUTC530);
        const tasksRef = collection(db, "tasks");
        const q = query(
          tasksRef,
          where("uid", "==", user.uid),
          where("date", ">=", startOfDayUTC530),
          where("date", "<", endOfDayUTC530)
        );

        const querySnapshot = await getDocs(q);
        const tasksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setActivities(tasksData);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    }
  };

  useEffect(() => {
    getUserFromDB();
    fetchTaskData();
    redirectToHomeIfAuth();
  }, [user]);

  const fetchTaskData = async () => {
    const storedLastUpdateDate = localStorage.getItem("lastUpdateDate");

    const today = new Date().toLocaleDateString("en-GB");
    console.log(storedLastUpdateDate);
    if (storedLastUpdateDate === today) {
      await getTasksFromDB();
      setLastUpdateDate(storedLastUpdateDate);
    } else {
      const todayActivities = getRandomActivities(activityList, 5);
      localStorage.setItem("lastUpdateDate", today);

      if (user) {
        todayActivities.forEach(async (activity) => {
          try {
            const docRef = await addDoc(collection(db, "tasks"), {
              uid: user.uid,
              title: activity,
              date: Timestamp.now(),
              isDone: false,
            });
            console.log("Document written with ID: ", docRef.id);
            getTasksFromDB();
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        });
      }
    }
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNotificationsToggle = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.info("Logged out successfully.");
  };

  return (
    <div className="absolute inset-0 overflow-y-auto -z-10 h-screen w-full bg-white">
      <ToastContainer />
      <div className="w-full flex justify-between items-center p-4 sticky top-0 z-50">
        <Navbar user={user} />
        {user ? (
          <div className="flex items-center relative">
            <div className="mr-4">
            <Bell className="cursor-pointer"/>
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg">
                  <div className="p-4 text-gray-700">No new notifications.</div>
                </div>
              )}
            </div>
            <div className="relative">
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-8 h-8 rounded-full cursor-pointer"
                onClick={handleDropdownToggle}
              />
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/saved-links"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Saved Links
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <Link to="/login" className="">
              <div className="bg-purple-900 text-white font-semibold rounded-lg text-base px-3 py-2">Login</div>
            </Link>
          </div>
        )}
      </div>
      <div className="lg:h-[86vh] p-4">
        <Routes>
          <Route path="/login" element={<Login user={user} />} />
          <Route
            path="/"
            element={<Home activities={activities} userData={userData} />}
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/leaderboard" element={<Leaderboard />} />
          <Route path="/profile/coupon" element={<Coupons />} />
          <Route
            path="/activity"
            element={<Activity activities={activities} user={userData} />}
          />
          <Route
            path="/activitydetails"
            element={
              <ActivityDetails activities={activities} user={userData} />
            }
          />
          <Route
            path="/forum"
            element={
              <Forum />
            }
          />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route
            path="/community/student"
            element={
              user ? (
                <Community
                  user={user}
                  userData={userData}
                  activities={activities}
                />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/community/workspace"
            element={
              user ? (
                <Workspace
                  user={user}
                  userData={userData}
                  activities={activities}
                />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/community/chronic"
            element={
              user ? (
                <Chronic
                  user={user}
                  userData={userData}
                  activities={activities}
                />
              ) : (
                <Login />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
