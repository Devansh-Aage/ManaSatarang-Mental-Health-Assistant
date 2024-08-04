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
    <div className='bg-white border rounded-xl p-4 flex flex-col items-center justify-center row-span-2'>
      {user ? (
        <>
          <Link to="/profile">
      <img 
        src={user.photoURL}
        alt='Profile Icon' 
        width={60} 
        height={60} 
        className='mt-4 mb-4 rounded-full'
        
      />
      </Link>        
          <h2 className='text-base text-black'>{user.displayName}</h2>
          <p className='text-gray-500 text-xs mb-4'>{user.email}</p>
        </>
      ) : (
          <p className='text-gray-500 text-sm mb-4'>Loading...</p>
        )}
      <div className='mt-auto'>
        <p className='text-gray-500 text-sm'>Wellness Points: #</p>
      </div>
    </div>
  );
}

export default ProfileCard;
