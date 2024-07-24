import React from "react";
import { users } from "./utils";
import PointsSidebar from "./components/PointsSidebar";

const Leaderboard = () => {
  return (
    <div className=" w-full flex items-center justify-around gap-4 ">
      {/* <PointsSidebar /> */}
      <div className="w-[50vw] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">Leaderboard</h1>
        <ul className="bg-white shadow-lg rounded-lg w-full max-w-md">
          {users.map((user, index) => (
            <li
              key={index}
              className={`flex justify-between p-4 border-b ${
                index % 2 === 0 ? "bg-purple-50" : "bg-purple-100"
              }`}
            >
              <span className="text-purple-900 font-semibold">{user.name}</span>
              <span className="text-purple-700">{user.points} points</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;
