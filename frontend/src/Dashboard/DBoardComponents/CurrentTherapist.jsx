import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';

function CurrentTherapist() {
  const [therapist, setTherapist] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Assuming therapist data is stored in user metadata or you may need to fetch it from your database
      setTherapist(currentUser); // Replace this with actual therapist data fetching if needed
    }
  }, []);

  return (
    <div className='bg-white border-2 rounded-xl p-4 flex flex-col items-center justify-center col-span-2 row-span-3'>
      {therapist ? (
        <>
        <h2 className='text-lg text-black mb-7'>Current Therapist</h2>
          <img 
            src={therapist.photoURL || 'default_therapist_icon.png'} 
            alt='Therapist Icon' 
            width={90} 
            height={90} 
            className='mb-4 rounded-full'
          />
          <p className='text-gray-700 text-md'>{therapist.displayName}</p>
          <p className='text-gray-400 text-sm'>{therapist.email}</p>
        </>
      ) : (
        <p className='text-gray-500 text-sm mb-4'>Loading...</p>
      )}
    </div>
  );
}

export default CurrentTherapist;
