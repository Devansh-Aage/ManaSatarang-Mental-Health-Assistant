import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BadgeCheck, Users,ClipboardList } from 'lucide-react';

const CommunitySidebar = () => {
  const { pathname } = useLocation();

  const getBgColor = (linkPath) => {
    return pathname.includes(linkPath) ? 'bg-blue-800' : 'bg-purple-700';
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <Users size={20} className="text-purple-600 mb-2" />
        <div className="text-2xl mb-3 font-semibold leading-6">Communities</div>
      </div>

      <Link to="/community/student">
        <div className={`max-w-xs mb-3 hover:bg-purple-600 ${getBgColor('/community/student')} rounded-lg text-white px-4 py-2`}>
          <div className="text-base font-semibold">Student Circle</div>
        </div>
      </Link>

      <Link to="/community/chronic">
        <div className={`max-w-xs mb-3 hover:bg-purple-600 ${getBgColor('/community/chronic')} rounded-lg text-white px-4 py-2`}>
          <div className="text-base font-semibold">Chronic Illness Support Group</div>
        </div>
      </Link>

      <Link to="/community/workspace">
        <div className={`max-w-xs mb-3 hover:bg-purple-600 ${getBgColor('/community/workspace')} rounded-lg text-white px-4 py-2`}>
          <div className="text-base font-semibold">Workplace Wellness</div>
        </div>
      </Link>
    </div>
  );
};

export default CommunitySidebar;
