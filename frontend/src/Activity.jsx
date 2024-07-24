import { React, useState } from "react";
import ActivityBlock from "./components/ActivityBlock";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./css/activity.css";
import { ClipboardList } from "lucide-react";

const Activity = ({ activities, user }) => {
  console.log(activities);
  const [input, setInput] = useState("");
  const sendMessage = async () => {};
  return (
    <>
      <div className="flex ">
        <ClipboardList size={20} className="text-purple-600 mt-1 ml-3" />
        <div className="font-semibold text-2xl ml-4">Daily Activities</div>
      </div>
      <div className="w-full p-4">
        {activities
          ? activities
              .slice(0, 5)
              .map((activity) => (
                <ActivityBlock key={activity.id} {...activity} user={user} />
              ))
          : Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={50} />
            ))}
      </div>
    </>
  );
};

export default Activity;
