import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../config/firebase-config";
import {
  Home,
  MessageCircle,
  Users,
  Activity,
  User,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  TextSearch,
  LayoutDashboard,
  LogOut,
  LogIn,
} from "lucide-react";
import { Select, Spin } from "antd";
import axios from "axios";
import { translateText } from "../utils";
const { Option } = Select;

const Navbar = ({ user, setAppLanguage }) => {
  const navlinks = [
    "Dashboard",
    "Wellness Library",
    "SerenaAI",
    "Community",
    "Forum",
    // "Activity",
    "Our Therapists",
    // "Appointments",
    // "Personal Journal",
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [Links, setLinks] = useState(navlinks);
  const [translatedLinks, setTranslatedLinks] = useState(navlinks);
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const router = useNavigate();
  const location = useLocation();

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleProfileClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleProfile = () => {
    router("/profile");
  };

  const handleLogout = async () => {
    await signOut(auth);
    router("/login");
    setIsOpen(false);
    setDropdownOpen(false);
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
    setAppLanguage(value);
    translateLinks(navlinks, value);
  };

  const translateLinks = async (navlinks, targetLanguage) => {
    try {
      setLoadingTranslations(true);
      const translatedLinksArray = await Promise.all(
        navlinks.map((link) => translateText(link, targetLanguage))
      );
      setTranslatedLinks(translatedLinksArray);
    } catch (error) {
      console.error("Error translating links: ", error);
    } finally {
      setLoadingTranslations(false);
    }
  };
  useEffect(() => {
    translateLinks(navlinks, language);
  }, [language]);

  const handleLogin = async () => {
    try {
      router("/login");
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  if (location.pathname === "/scan") {
    return null;
  }

  return (
    <div
      className={`relative z-50 lg:flex lg:flex-col lg:top-0 lg:left-0 lg:h-screen transition-all duration-300 ${
        isOpen ? "lg:w-[250px]" : "lg:w-[60px]"
      } z-50`}
    >
      {/* Sidebar */}
      <div
        className={`fixed flex flex-col h-screen transition-transform transform ${
          isOpen
            ? "translate-x-0 lg:w-[250px] w-full shadow-lg lg:rounded-r-3xl lg:bg-transparent bg-white"
            : "-translate-x-0 w-[60px] items-center border-gray-200 lg:bg-transparent"
        }`}
      >
        {/* Toggle Button */}
        <div className={`flex items-center justify-between p-3 border-y-0`}>
          <button
            onClick={handleToggle}
            className="text-gray-700 hover:bg-gray-200 rounded transition-colors duration-200"
          >
            {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
          <Select
            value={language}
            onChange={handleLanguageChange}
            style={{ width: 120 }}
            className={`${isOpen ? "flex" : "hidden"}`}
          >
            <Option value="en">English</Option>
            <Option value="hi">Hindi</Option>
            <Option value="mr">Marathi</Option>
            <Option value="or">Odia</Option>
            <Option value="ur">Urdu</Option>
            <Option value="es">Spanish</Option>
            <Option value="fr">French</Option>
            <Option value="de">German</Option>
          </Select>
        </div>
        <div
          className={`flex flex-col flex-1 p-4 ${isOpen ? "block" : "hidden"}`}
        >
          <nav className="flex flex-col space-y-10">
            {user && (
              <Link
                to="/"
                className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
              >
                <LayoutDashboard size={20} />
                <span className={`${isOpen ? "block" : "hidden"}`}>
                  {translatedLinks[0]}
                </span>
              </Link>
            )}
            <Link
              to="/search"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <TextSearch size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>
                {translatedLinks[1]}
              </span>
            </Link>
            <Link
              to="/chatbot"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <MessageCircle size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>
                {translatedLinks[2]}
              </span>
            </Link>
            <Link
              to="/community/student"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <Users size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>
                {translatedLinks[3]}
              </span>
            </Link>
            <Link
              to="/forum"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <BookOpen size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>
                {translatedLinks[4]}
              </span>
            </Link>
            <Link
              to="/therapists"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <User size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>
                {translatedLinks[5]}
              </span>
            </Link>

            {!user && (
              <Link
                to="/login"
                className="text-center bg-purple-900 text-white text-base px-3 py-2 rounded-lg"
              >
                Login
              </Link>
            )}
          </nav>
        </div>

        {/* Icon Container in Closed View */}
        <div
          className={`flex flex-col justify-between flex-1 p-4 ${
            isOpen ? "hidden" : "block"
          }`}
        >
          <div className="lg:flex hidden flex-col items-center space-y-10">
            {user && (
              <Link
                to="/"
                className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
              >
                <LayoutDashboard size={20} />
              </Link>
            )}
            <Link
              to="/search"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <TextSearch size={20} />
            </Link>
            <Link
              to="/chatbot"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <MessageCircle size={20} />
            </Link>
            <Link
              to="/community/student"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <Users size={20} />
            </Link>
            <Link
              to="/forum"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <BookOpen size={20} />
            </Link>
            <Link
              to="/therapists"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <User size={20} />
            </Link>
          </div>
          {user ? (
            <button
              onClick={handleLogout}
              className="lg:flex hidden items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="lg:flex hidden items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <LogIn size={20} />
            </button>
          )}
        </div>

        {/* Profile Section */}
        {user && (
          <div
            className={`p-4 bg-white shadow-md border-t border-gray-300 ${
              isOpen ? "block " : "hidden"
            }`}
          >
            <div className="flex items-center space-x-3">
              <img
                src={user.photoURL || "/default-profile.png"}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer"
                onClick={handleProfileClick}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {user.displayName || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user.email || "user@example.com"}
                </p>
                {dropdownOpen && (
                  <div className="absolute bottom-20 right-12 bg-white shadow-lg rounded-lg border border-gray-300 mt-2 w-48">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-left text-gray-800 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/saved-links"
                      className="block px-4 py-2 text-left text-gray-800 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Saved Links
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
