import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { Menu, X } from "lucide-react";

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleProfileClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsOpen(false);
    setDropdownOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-[250px] bg-white border-r border-gray-200 shadow-lg z-50">
      {/* Sidebar */}
      <div
        className={`h-screen bg-white border border-y-0 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:relative lg:w-[250px] lg:h-full lg:shadow-none`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <Link to="/" className="flex items-center">
            <img src="/manasataranglogo.svg" alt="ManaSatarang" className="h-16" />
          </Link>
          {user && (
            <div className="relative flex items-center">
              <img
                src={user.photoURL || "/default-profile.png"}
                alt="Profile"
                className="w-12 h-12 rounded-full border border-gray-300 cursor-pointer"
                onClick={handleProfileClick}
              />
              {dropdownOpen && (
                <div className="absolute top-0 right-0 bg-white shadow-lg rounded-lg border border-gray-300 mt-12 w-48">
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
          )}
        </div>
        <div className="flex-1 p-4 flex flex-col">
          <nav className="flex flex-col space-y-6 ml-3">
            <Link to="/" className="transition-colors duration-200 hover:text-orange-400 text-left">
              Home
            </Link>
            <Link to="/chatbot" className="transition-colors duration-200 hover:text-orange-400 text-left">
              SerenaAI
            </Link>
            <Link to="/community/student" className="transition-colors duration-200 hover:text-orange-400 text-left">
              Community
            </Link>
            <Link to="/forum" className="transition-colors duration-200 hover:text-orange-400 text-left">
              Forum
            </Link>
            <Link to="/activitydetails" className="transition-colors duration-200 hover:text-orange-400 text-left">
              Activity
            </Link>
            <Link to="/therapists" className="transition-colors duration-200 hover:text-orange-400 text-left">
              Our Therapists
            </Link>
            {!user && (
              <Link to="/login" className="text-center bg-purple-900 text-white text-base px-3 py-2 rounded-lg">
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
