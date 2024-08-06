import React from 'react';
import ActivityBlock from '../../components/ActivityBlock';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';

function ActivityDb({ activities, user }) {
 const navigate= useNavigate();
  
  return (
    <div className='bg-white border rounded-xl p-4 flex flex-col row-span-3 py-3'>
      <h2 className='text-xl text-gray-500 mb-4'>Activities</h2>
      <div className='flex flex-col gap-4' onClick={()=>navigate('/activityDetails')}>
        {activities.length>0
          ? activities.slice(0, 3).map((activity) => (
              <ActivityBlock key={activity.id} {...activity} user={user} />
            ))
          : Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} height={42} />
            ))}
      </div>
    </div>
  );
}

export default ActivityDb;
