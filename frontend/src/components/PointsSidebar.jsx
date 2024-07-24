import { BarChart2, TicketPercent } from 'lucide-react';
import React from 'react'
import { Link, Route, Routes } from "react-router-dom";



const PointsSidebar = () => {
  return (
    <div className='mt-6'>
      <div className="flex w-full justify-evenly items-center">
      <div>
        <Link to="/points/coupon">
          <div className=" flex text-base gap-2 max-w-xs mb-3 bg-purple-700 hover:bg-purple-600 rounded-lg text-white px-4 py-2 font-semibold">
            <TicketPercent size={25} className='text-white'/>
            Coupon
          </div>
        </Link>

        <Link to="/points/leaderboard">
          <div className="flex gap-2 text-base max-w-xs mb-3 bg-purple-700 hover:bg-purple-600 rounded-lg text-white px-4 py-2 font-semibold">
          <BarChart2 size={25} className='text-white'/>
           Leaderboard
          </div>
        </Link>
      </div>
    </div>
    </div>
  )
}

export default PointsSidebar
