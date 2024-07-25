import React from "react";
import { useLocation } from "react-router-dom";
import PointsSidebar from "./components/PointsSidebar";
import Leaderboard from "./Leaderboard";
import Coupons from "./Coupons";

const PointsPage = () => {
  const { pathname } = useLocation();

  return (
    <div className="flex w-full h-full justify-evenly items-start">
      <PointsSidebar />
      {pathname === "/profile/coupons" && <Coupons />}
      {pathname === "/profile/leaderboard" && <Leaderboard />}
    </div>
  );
};

export default PointsPage;
