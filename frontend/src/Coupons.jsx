import React from "react";
import macd from "../src/assets/macd.png";
import subway from "../src/assets/subway.jpeg";
import star from "../src/assets/star.png";
import PointsSidebar from "./components/PointsSidebar";

const Coupons = () => {
  return (
    <div className="flex justify-around items-center h-full">
      <PointsSidebar />
      <div className="flex justify-center  items-center">
        <div className="bg-white shadow-lg mr-7 rounded-lg overflow-hidden w-60">
          <img className="w-full h-[220px] p-2" src={macd} alt="McDonald's" />
          <div className="p-4 cursor-pointer hover:bg-purple-100 bg-slate-200">
            <p className="text-purple-800 font-semibold text-center">
              100 Points to Unlock
            </p>
          </div>
        </div>
        <div className="bg-white shadow-lg mr-7 rounded-lg overflow-hidden w-60">
          <img className="w-full h-[220px] p-2" src={subway} alt="McDonald's" />
          <div className="p-4 cursor-pointer hover:bg-purple-100 bg-slate-200">
            <p className="text-purple-800  font-semibold text-center">
              150 Points to Unlock
            </p>
          </div>
        </div>
        <div className="bg-white shadow-lg mr-7 rounded-lg overflow-hidden w-60">
          <img className="w-full h-[220px] p-2" src={star} alt="McDonald's" />
          <div className="p-4 cursor-pointer hover:bg-purple-100 bg-slate-200">
            <p className="text-purple-800 font-semibold text-center">
              200 Points to Unlock
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coupons;
