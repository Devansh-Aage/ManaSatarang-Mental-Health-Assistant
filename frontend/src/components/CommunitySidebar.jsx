import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';

const CommunitySidebar = () => {
  const { pathname } = useLocation();

  const getBorderColor = (linkPath) => {
    return pathname.includes(linkPath) ? 'border-orange-400' : 'border-gray-400';
  };

  const getBgColor = (linkPath) => {
    return pathname.includes(linkPath) ? 'bg-orange-400' : '';
  };

  const getTextColor = (linkPath) => {
    return pathname.includes(linkPath) ? 'text-white' : '';
  };


  return (
    <div>
      <div className="flex items-center gap-2 mb-10">
        <Users size={20} className="text-purple-600 mb-2" />
        <div className="text-2xl mb-3 font-semibold leading-6">Communities</div>
      </div>

      <div className="grid grid-cols-1 gap-0">
        <Link to="/community/student">
          <div className={`p-4 text-black border ${getTextColor('/community/student')} ${getBorderColor('/community/student')} ${getBgColor('/community/student')} rounded-t-md flex items-center justify-between`}>
            <div className="text-base font-semibold">Student Circle</div>
            <ArrowRight size={16} className={`text-black ${getTextColor('/community/student')}`}/>
          </div>
        </Link>

        <Link to="/community/chronic">
          <div className={`p-4 text-black border ${getTextColor('/community/chronic')} ${getBorderColor('/community/chronic')} ${getBgColor('/community/chronic')}  flex items-center justify-between`}>
            <div className="text-base font-semibold">Chronic Illness Support Group</div>
            <ArrowRight size={16} className={`text-black ${getTextColor('/community/chronic')}`} />
          </div>
        </Link>

        <Link to="/community/workspace">
          <div className={`p-4 text-black border ${getTextColor('/community/workspace')} ${getBorderColor('/community/workspace')} ${getBgColor('/community/workspace')}  rounded-b-md flex items-center justify-between`}>
            <div className="text-base font-semibold">Workplace Wellness</div>
            <ArrowRight size={16} className={`text-black ${getTextColor('/community/workspace')}`} />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CommunitySidebar;
