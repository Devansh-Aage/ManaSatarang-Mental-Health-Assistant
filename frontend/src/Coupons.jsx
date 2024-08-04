import React from "react";
import PointsSidebar from "./components/PointsSidebar";

const Coupons = () => {
  return (
    <div className="flex justify-around items-center h-full my-14">
      {/* <PointsSidebar /> */}
      <div className="flex justify-center  items-center">
        <div className="bg-white shadow-lg mr-7 rounded-lg overflow-hidden w-60">
          <img className="w-full h-[220px] p-2" src='/subway.jpeg' alt="McDonald's" />
          <div className="p-4 cursor-pointer hover:bg-purple-100 bg-slate-200">
            <p className="text-purple-800 font-semibold text-center">
              100 Points to Unlock
            </p>
          </div>
        </div>
        <div className="bg-white shadow-lg mr-7 rounded-lg overflow-hidden w-60">
          <img className="w-full h-[220px] p-2" src='/macd.png' alt="McDonald's" />
          <div className="p-4 cursor-pointer hover:bg-purple-100 bg-slate-200">
            <p className="text-purple-800  font-semibold text-center">
              150 Points to Unlock
            </p>
          </div>
        </div>
        <div className="bg-white shadow-lg mr-7 rounded-lg overflow-hidden w-60">
          <img className="w-full h-[220px] p-2" src='/star.png' alt="McDonald's" />
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
