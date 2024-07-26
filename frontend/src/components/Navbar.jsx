import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { Home, MessageCircle, Users, Activity, User, BookOpen, SquareChevronRight, SquareChevronLeft } from "lucide-react";

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev); 
  };

  const handleProfileClick = () => {
    setDropdownOpen((prev) => !prev); 
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsOpen(false); 
    setDropdownOpen(false); 
  };

  return (
    <div className={`relative lg:flex lg:flex-col lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:bg-white transition-all duration-300 ${isOpen ? "lg:w-[250px]" : "lg:w-[60px]"} z-50`}>
    

      {/* Sidebar */}
      <div className={`h-screen bg-white transition-transform transform border border-t-0 ${isOpen ? "translate-x-0 w-[250px] shadow-lg rounded-2xl" : "-translate-x-0 w-[60px] border-r border-gray-200"}`}>
      <div className={`flex items-center justify-between p-3 border-y-0 `}>
      <button onClick={handleToggle} className="text-gray-700 hover:bg-gray-200 rounded transition-colors duration-200">
        {isOpen ?  <SquareChevronLeft size={28}/> : <SquareChevronRight size={28}/>}
      </button>
    </div>
        <div className={`flex flex-col p-4 ${isOpen ? "block" : "hidden"}`}>
          {/* Navigation Links */}
          <nav className="flex flex-col space-y-6">
            <Link to="/" className="flex items-center space-x-3 transition-colors duration-200 hover:text-orange-400 text-left">
              <Home size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>Home</span>
            </Link>
            <Link to="/chatbot" className="flex items-center space-x-3 transition-colors duration-200 hover:text-orange-400 text-left">
              <MessageCircle size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>SerenaAI</span>
            </Link>
            <Link to="/community/student" className="flex items-center space-x-3 transition-colors duration-200 hover:text-orange-400 text-left">
              <Users size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>Community</span>
            </Link>
            <Link to="/forum" className="flex items-center space-x-3 transition-colors duration-200 hover:text-orange-400 text-left">
              <BookOpen size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>Forum</span>
            </Link>
            <Link to="/activitydetails" className="flex items-center space-x-3 transition-colors duration-200 hover:text-orange-400 text-left">
              <Activity size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>Activity</span>
            </Link>
            <Link to="/therapists" className="flex items-center space-x-3 transition-colors duration-200 hover:text-orange-400 text-left">
              <User size={20} />
              <span className={`${isOpen ? "block" : "hidden"}`}>Our Therapists</span>
            </Link>
            {!user && (
              <Link to="/login" className="text-center bg-purple-900 text-white text-base px-3 py-2 rounded-lg">
                Login
              </Link>
            )}
          </nav>
        </div>

        {/* Icon Container in Closed View */}
        <div className={`flex flex-col items-center space-y-6 p-4 ${isOpen ? "hidden" : "block"}`}>
          <Link to="/" className="flex items-center space-x-3 transition-colors duration-200 hover:text-orange-400 text-left">
            <Home size={20} />
          </Link>
          <Link to="/chatbot" className="flex items-center space-x-3 transition-colors duration-200 hover:text-orange-400 text-left">
            <MessageCircle size={20} />
          </Link>
          <Link to="/community/student" className="flex items-center space-x-3 transition-colors duration-200 hover:text-orange-400 text-left">
            <Users size={20} />
          </Link>
          <Link to="/forum" className="flex items-center space-x-3 transition-colors duration-200 hover:text-orange-400 text-left">
            <BookOpen size={20} />
          </Link>
          <Link to="/activitydetails" className="flex items-center space-x-3 transition-colors duration-200 hover:text-orange-400 text-left">
            <Activity size={20} />
          </Link>
          <Link to="/therapists" className="flex items-center space-x-3 transition-colors duration-200 hover:text-orange-400 text-left">
            <User size={20} />
          </Link>
        </div>

        {/* Profile Section */}
        {user && (
          <div className={`p-4 mt-60 bg-white shadow-md rounded-t-lg border-t border-gray-300 ${isOpen ? "block" : "hidden"}`}>
            <div className="flex items-center space-x-3">
              <img
                src={user.photoURL || "/default-profile.png"}
                alt="Profile"
                className="w-12 h-12 rounded-full border border-gray-300 cursor-pointer"
                onClick={handleProfileClick}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">{user.displayName || "User"}</p>
                <p className="text-xs text-gray-500">{user.email || "user@example.com"}</p>
                {dropdownOpen && (
                  <div className="absolute bottom-36 right-10 bg-white shadow-lg rounded-lg border border-gray-300 mt-2 w-48">
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
