import React from 'react';
// import dashboardData, { data } from './SampleData';
import ProfileCard from './DBoardComponents/ProfileCard';
import JournalDb from './DBoardComponents/JournalDb';
import CurrentTherapist from './DBoardComponents/CurrentTherapist';
import ActivityDb from './DBoardComponents/ActivityDb';
import CouponsDb from './DBoardComponents/CouponsDb';
import AppointmentsDb from './DBoardComponents/AppointmentsDb';

function Dashboard() {
    return (
        <div className='grid grid-cols-9 auto-cols-[125px] auto-rows-[125px] gap-3 my-6 mx-10 '>
            <ProfileCard />
            <JournalDb />
            <AppointmentsDb />
            <ActivityDb />
            <CurrentTherapist />
            <CouponsDb />
            
        </div>
    );
}

export default Dashboard;
