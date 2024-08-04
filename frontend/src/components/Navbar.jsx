import React, { useState } from "react";
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

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router("/");
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  if (location.pathname === "/scan") {
    return null;
  }

  return (
    <div
      className={`relative z-50 lg:flex lg:flex-col lg:top-0 lg:left-0 lg:h-screen lg:bg-white transition-all duration-300 ${
        isOpen ? "lg:w-[250px]" : "lg:w-[60px]"
      } z-50`}
    >
      {/* Sidebar */}
      <div
        className={`fixed flex flex-col h-screen bg-white transition-transform transform border border-t-0 ${
          isOpen
            ? "translate-x-0 w-[250px] shadow-lg rounded-2xl"
            : "-translate-x-0 w-[60px] border-r items-center border-gray-200"
        }`}
      >
        {/* Toggle Button */}
        <div className={`flex items-center p-3 border-y-0`}>
          <button
            onClick={handleToggle}
            className="text-gray-700 hover:bg-gray-200 rounded transition-colors duration-200"
          >
            {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className={`flex flex-col flex-1 p-4 ${isOpen ? "block" : "hidden"}`}>
          <nav className="flex flex-col space-y-10">
            {user && (
              <Link
                to="/"
                className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
              >
                <LayoutDashboard size={20} />
                <span className={`${isOpen ? "block" : "hidden"}`}>
                  Dashboard
                </span>
              </Link>
            )}
            <Link
              to="/search"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <TextSearch size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>Wellness Library</span>
            </Link>
            <Link
              to="/chatbot"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <MessageCircle size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>SerenaAI</span>
            </Link>
            <Link
              to="/community/student"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <Users size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>Community</span>
            </Link>
            <Link
              to="/forum"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <BookOpen size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>Forum</span>
            </Link>
            <Link
              to="/therapists"
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <User size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>Our Therapists</span>
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
          className={`flex flex-col justify-between flex-1 p-4 ${isOpen ? "hidden" : "block"}`}
        >
          <div className="flex flex-col items-center space-y-10">
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
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center space-x-3 transition-colors duration-200 hover:text-purple-400 text-left"
            >
              <LogIn size={20} />
            </button>
          )}
        </div>

        {/* Profile Section */}
        {user && (
          <div
            className={`p-4 bg-white shadow-md border-t border-gray-300 ${isOpen ? "block" : "hidden"}`}
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
