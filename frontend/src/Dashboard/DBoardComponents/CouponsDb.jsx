import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

function CouponsDb() {
  // Sample data for the coupons
  const coupons = [
    {
      id: 1,
      image: './macd.png',
      points: '1800 WP',
    },
    {
      id: 2,
      image: './subway.jpeg',
      points: '1800 WP',
    },
    {
      id: 3,
      image: './subway.jpeg',
      points: '1800 WP',
    }
  ];

  return (
    <div className='bg-white border-2 rounded-xl p-5 flex flex-col col-span-4 row-span-2'>
      <div className='flex flex-row justify-center items-center mx-16 hover:underline'>
      <Link className='text-gray-600 mb-4' to="/profile/coupon">
      <h2 className='text-xl text-gray-600'>Available Coupons</h2>
      </Link>
      </div>
      <div className='flex flex-row gap-4 justify-center'>
        {coupons.map((coupon) => (
          <div 
            key={coupon.id} 
            className='bg-gray-100 border-2 rounded-xl p-4 flex flex-col items-center justify-between w-1/4'
          >
            <img 
              src={coupon.image} 
              alt={`Franchise ${coupon.id}`} 
              width={120} 
              height={120} 
              className='mb-2'
            />
            <p className='text-gray-600'>{coupon.points}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CouponsDb;
