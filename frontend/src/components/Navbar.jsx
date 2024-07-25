import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { Menu, X } from "lucide-react";

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="sticky w-[100%] max-w-screen-lg  px-5 font-semibold text-lg  py-2.5 flex justify-around items-center rounded-lg bg-white">
      <Link to="/" className="justify-self-start logo">
        <img src="/manasataranglogo.svg" alt="ManaSatarang" className="h-20"/>
      </Link>
      <div className="links flex w-[50%] justify-evenly">
        <Link to="/" className="transition-colors duration-200 hover:text-orange-400 mr-20">
          Home
        </Link>
        <Link to="/chatbot" className="transition-colors duration-200 hover:text-orange-400 mr-20">
          SerenaAI
        </Link>
        <Link to="/community/student" className="transition-colors duration-200 hover:text-orange-400 mr-20">
          Community
        </Link>
        <Link to="/forum" className="transition-colors duration-200 hover:text-orange-400 mr-20">
          Forum
        </Link>
        <Link to="/activitydetails" className="transition-colors duration-200 hover:text-orange-400 mr-20">
          Activity
        </Link>
        <Link to="/therapists" className="transition-colors duration-200 hover:text-orange-400 mr-20">
          Therapists
        </Link>
        
      </div>
      <div className="lg:hidden" onClick={handleToggle}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </div>

      {isOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white rounded-b-xl shadow-md py-2 px-4 flex flex-col space-y-4 md:hidden">
          <Link
            to="/"
            className="hover:text-violet-400"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/chatbot"
            className="hover:text-violet-400"
            onClick={() => setIsOpen(false)}
          >
            Chatbot
          </Link>
          <Link
            to="/community/student"
            className="hover:text-violet-400"
            onClick={() => setIsOpen(false)}
          >
            Community
          </Link>
          <Link
            to="/forum"
            className="hover:text-violet-400"
            onClick={() => setIsOpen(false)}
          >
            Forum
          </Link>
          <Link
            to="/activitydetails"
            className="hover:text-violet-400"
            onClick={() => setIsOpen(false)}
          >
            Activity
          </Link>
          
          {user && (
            <Link
              to="/profile"
              className="hover:text-violet-400"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
          )}
          {!user && (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
            >
              <div className="bg-purple-900 text-white text-base px-3 py-2">Login</div>
            </Link>
          )}
          {user && (
            <button
              onClick={async () => {
                await signOut(auth);
                setIsOpen(false); // Close the menu on logout
              }}
              className="logout-button"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
