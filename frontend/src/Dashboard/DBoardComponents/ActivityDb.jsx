import React from 'react';
import ActivityBlock from '../../components/ActivityBlock';
import Skeleton from 'react-loading-skeleton';

function ActivityDb({ activities, user }) {
  return (
    <div className='bg-white border rounded-xl p-4 flex flex-col row-span-3 py-3'>
      <h2 className='text-xl text-gray-500 mb-4'>Activities</h2>
      <div className='flex flex-col gap-4'>
        {activities
          ? activities.slice(0, 5).map((activity) => (
              <ActivityBlock key={activity.id} {...activity} user={user} />
            ))
          : Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={42} />
            ))}
      </div>
    </div>
  );
}

export default ActivityDb;
