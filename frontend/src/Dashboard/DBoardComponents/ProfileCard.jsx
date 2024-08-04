import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';

function ProfileCard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  return (
    <div className='bg-white border-2 rounded-xl p-4 flex flex-col items-center justify-center col-span-2 row-span-2'>
        <Link to="/profile">
      <img 
        // src={user.photoURL} 
        alt='Profile Icon' 
        width={60} 
        height={60} 
        className='mt-4 mb-4 rounded-full'
        
      />
      </Link>
      {user ? (
        <>
          <h2 className='text-xl text-black mb-1'>{user.displayName}</h2>
          <p className='text-gray-500 text-sm mb-4'>{user.email}</p>
        </>
      ) : (
          <p className='text-gray-500 text-sm mb-4'>Loading...</p>
        )}
      <div className='mt-auto'>
        <p className='text-gray-500 text-sm'>Wellness Points: 1797</p>
      </div>
    </div>
  );
}

export default ProfileCard;
