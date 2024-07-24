import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { Menu, X } from "lucide-react";
import "./Navbar.css"; // Import your custom CSS file for Navbar styling

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="sticky top-12 border border-violet-200 shadow-md w-[50%] max-w-screen-lg mx-auto px-5 font-semibold text-lg  py-2.5 flex justify-around items-center rounded-lg bg-white">
      <Link to="/" className="justify-self-start logo">
        ManaSatarang
      </Link>
      <div className="links flex w-[50%] justify-evenly">
        <Link to="/" className="hover:text-violet-400">
          Home
        </Link>
        <Link to="/chatbot" className="hover:text-violet-400">
          Chatbot
        </Link>
        <Link to="/community/student" className="hover:text-violet-400">
          Community
        </Link>
        <Link to="/activitydetails" className=" hover:text-violet-400">
          Activity
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
