import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
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
import { activityList, translateText } from "./utils";
import ActivityDetails from "./ActivityDetails";
import Workspace from "./Workspace";
import Chronic from "./Chronic";
import Leaderboard from "./Leaderboard";
import Coupons from "./Coupons";
import Forum from "./ForumPages/Forum";
import Profile from "./Profile";
import Therapists from "./Therapists";
import TherapistDetails from "./components/TherapistDetails";
import PaymentSuccess from "./PaymentSuccess";
import PostPage from "./ForumPages/PostPage";
import Success from "./Success";
import Appointments from "./Appointments";
import Chat from "./Chat";
import "./App.css";
import Journal from "./Journal/Journal";
import ScanFace from "./ScanFace";
import { Select } from "antd";
const { Option } = Select;
import Helpline from "./Helpline";

import Dashboard from "./Dashboard/Dashboard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SavedLinks from "./SavedLinks";

const getRandomActivities = (list, count) => {
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const App = () => {
  const [activities, setActivities] = useState([]);
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [lastUpdateDate, setLastUpdateDate] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [navbarWidth, setNavbarWidth] = useState("w-[250px]"); // default width for open
  const [appLanguage, setAppLanguage] = useState("en");

  const location = useLocation();
  const navigate = useNavigate();

  const redirectToHomeIfAuth = () => {
    if (location.pathname === "/login") {
      if (user) {
        navigate("/");
      } else {
        navigate("/login");
      }
    }
  };

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
        console.log("inside");
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const offset = 1 * 60 * 60 * 1000; // 5.5 hours in milliseconds
        const startOfDayUTC530 = new Date(today.getTime() + offset);
        const endOfDayUTC530 = new Date(
          startOfDayUTC530.getTime() + 24 * 60 * 60 * 1000
        );
        console.log(startOfDayUTC530);
        console.log(endOfDayUTC530);
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
        console.log(tasksData);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    }
  };

  useEffect(() => {
    getUserFromDB();
    fetchTaskData();
    // redirectToHomeIfAuth();
  }, [user]);

  useEffect(() => {
    const translate = async () => {
      const translatedActivities = await Promise.all(
        activities.map(async (a) => {
          const translatedActivity = await translateText(a.title, appLanguage);
          return { ...a, translatedTitle: translatedActivity };
        })
      );

      setActivities(translatedActivities);
    };
    translate();
  }, [appLanguage]);

  const fetchTaskData = async () => {
    // const storedLastUpdateDate = localStorage.getItem("lastUpdateDate");
    const storedLastUpdateDate = "06/06/2024";
    const today = new Date().toLocaleDateString("en-GB");
    console.log(today);
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

  const handleLangChange = (lang) => {
    setAppLanguage(lang);
  };

  return (
    <div className="flex absolute inset-0 h-full w-full bg-purple-50 ">
      <Navbar
        user={user}
        onNavbarToggle={(isOpen) =>
          setNavbarWidth(isOpen ? "w-[250px]" : "w-[60px]")
        }
        setAppLanguage={handleLangChange}
      />
      <div
        className={`flex-1 h-screen overflow-auto ml-[${navbarWidth}] transition-all duration-300`}
      >
        <ToastContainer />
        <div className="overflow-hidden ">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  lang={appLanguage}
                  activities={activities}
                  user={user}
                  userData={userData}
                />
              }
            />
            <Route
              path="/login"
              element={<Login user={user} lang={appLanguage} />}
            />
            <Route
              path="/search"
              element={
                <Home
                  activities={activities}
                  userData={userData}
                  user={user}
                  lang={appLanguage}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <Profile lang={appLanguage} user={user} userData={userData} />
              }
            />
            <Route
              path="/profile/leaderboard"
              element={<Leaderboard lang={appLanguage} />}
            />
            <Route
              path="/profile/coupon"
              element={<Coupons lang={appLanguage} />}
            />
            <Route
              path="/activity"
              element={
                user ? (
                  <Activity
                    activities={activities}
                    lang={appLanguage}
                    user={userData}
                  />
                ) : (
                  <Login lang={appLanguage} />
                )
              }
            />
            <Route
              path="/activitydetails"
              element={
                user ? (
                  <ActivityDetails
                    activities={activities}
                    lang={appLanguage}
                    user={userData}
                  />
                ) : (
                  <Login lang={appLanguage} />
                )
              }
            />
            <Route
              path="/forum"
              element={
                user ? (
                  <Forum lang={appLanguage} />
                ) : (
                  <Login lang={appLanguage} />
                )
              }
            />
            <Route
              path="/appointments"
              element={
                user ? (
                  <Appointments user={user} lang={appLanguage} />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/forum/post/:postId"
              element={<PostPage lang={appLanguage} />}
            />
            <Route
              path="/chatbot"
              element={<Chatbot lang={appLanguage} user={user} />}
            />
            <Route
              path="/community/student"
              element={
                user ? (
                  <Community
                    user={user}
                    userData={userData}
                    lang={appLanguage}
                  />
                ) : (
                  <Login lang={appLanguage} />
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
                    lang={appLanguage}
                  />
                ) : (
                  <Login lang={appLanguage} />
                )
              }
            />
            <Route
              path="/community/chronic"
              element={
                user ? (
                  <Chronic user={user} userData={userData} lang={appLanguage} />
                ) : (
                  <Login lang={appLanguage} />
                )
              }
            />
            <Route
              path="/therapists"
              element={
                user ? (
                  <Therapists
                    lang={appLanguage}
                    user={user}
                    userData={userData}
                  />
                ) : (
                  <Login lang={appLanguage} />
                )
              }
            />
            <Route
              path="/therapists/therapistDetails"
              element={<TherapistDetails lang={appLanguage} />}
            />
            <Route
              path="/chat/:chatId"
              element={<Chat user={user} lang={appLanguage} />}
            />
            <Route
              path="/journal"
              element={
                user ? (
                  <Journal user={user} lang={appLanguage} />
                ) : (
                  <Login lang={appLanguage} />
                )
              }
            />
            <Route
              path="/scan"
              element={<ScanFace userData={userData} lang={appLanguage} />}
            />
            <Route
              path="/saved-links"
              element={
                <SavedLinks
                  user={user}
                  userData={userData}
                  lang={appLanguage}
                />
              }
            />
            <Route path="/helpline" element={<Helpline lang={appLanguage} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
