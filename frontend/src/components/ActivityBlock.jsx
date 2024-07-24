import React, { useState } from "react";
import "react-toastify/dist/ReactToastify.css";

const ActivityBlock = ({ date, isDone, id, uid, title, user ,}) => {
  const [isDoneState, setIsDoneState] = useState(isDone);



  return (
    <div
      className={`flex items-center mb-3 p-3 bg-gradient-to-r from-violet-700 to-purple-500 text-white rounded-lg cursor-pointer transition duration-300 ${
        isDoneState ? "bg-purple-700" : ""
      }`}      
    >
      <div
        className={`w-6 h-6 border-2 border-white rounded-full flex justify-center items-center mr-3 ${
          isDoneState ? "bg-white" : ""
        }`}
      >
        {isDoneState && <span className="text-purple-600">&#10003;</span>}
      </div>
      <span
        className={`flex-1 text-base ${
          isDoneState ? "line-through" : ""
        }`}
      >
        {title}
      </span>
      
    </div>
  );
};

export default ActivityBlock;
