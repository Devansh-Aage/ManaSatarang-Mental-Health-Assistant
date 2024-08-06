import React from 'react';
import ProfileCard from './DBoardComponents/ProfileCard';
import JournalDb from './DBoardComponents/JournalDb';
import CurrentTherapist from './DBoardComponents/CurrentTherapist';
import ActivityDb from './DBoardComponents/ActivityDb';
import CouponsDb from './DBoardComponents/CouponsDb';
import AppointmentsDb from './DBoardComponents/AppointmentsDb';

function Dashboard({user}) {
    return (
       <div>
            <div className='grid lg:grid-cols-3 auto-rows-[120px] gap-2 lg:mx-6 lg:my-3 my-6 mx-12'>
                <ProfileCard  />
                <JournalDb />
                <AppointmentsDb  />
                <ActivityDb />
                <CurrentTherapist />
                {/* <CouponsDb /> */}
            </div>
        </div>
    );
}

export default Dashboard;
