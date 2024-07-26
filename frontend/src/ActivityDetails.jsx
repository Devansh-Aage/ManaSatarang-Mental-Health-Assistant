import React, { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import ActivityBlock from "./components/ActivityBlock";
import { db } from "./config/firebase-config";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ClipboardList } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ActivityDetails = ({ activities, user }) => {
  const [input, setInput] = useState("");
  const [geminiInput, setGeminiInput] = useState("");
  const [botResponse, setBotResponse] = useState("");
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [isDoneState, setIsDoneState] = useState(selectedActivity?.isDone);

  const sendMessage = async () => {
    if (selectedActivity) {
      if (!isDoneState) {
        try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            points: increment(5),
          });

          const taskRef = doc(db, "tasks", selectedActivity.id);
          await updateDoc(taskRef, {
            isDone: true,
          });
          setIsDoneState(true);
          toast.success("You got 5 points for completing the activity!");
        } catch (error) {
          console.error("Error updating task: ", error);
          toast.error("Failed to update task.");
        }
      }
      fetchGeminiResponse(); // Fetch Gemini response after submitting the message
    }
  };

  const fetchGeminiResponse = async () => {
    if (selectedActivity && input) {
      const combinedInput = `Activity: ${selectedActivity.title}\nSummary: ${input}`;
      console.log("Fetching Gemini Response for:", combinedInput); // Log the input to the console
      try {
        const response = await axios.post(
          "http://localhost:5000/evaluate_summary",
          {
            summary: combinedInput,
          }
        );
        console.log("Response received:", response); // Log the response
        if (response.status === 200) {
          const data = response.data;
          setBotResponse(data.response);
          setYoutubeVideos(data.youtube_videos || []);
        } else {
          console.error("Failed to evaluate summary");
        }
      } catch (error) {
        console.error("Error evaluating summary:", error);
      }
    }
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setInput(`Title: ${activity.title} \n`);
    setGeminiInput(`Title: ${activity.title} \n`);
  };

  return (
    <div className="w-full flex justify-center items-center p-4 mx-14">
      <div className="w-[40%] lg:w-[30%]">
        <div className="flex mb-3">
          <ClipboardList size={20} className="text-purple-600 mt-1 ml-3" />
          <div className="font-semibold text-2xl ml-4">Daily Activities</div>
        </div>
        {activities
          ? activities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                onClick={() => handleActivityClick(activity)}
              >
                <ActivityBlock
                  key={activity.id}
                  isDoneState={isDoneState}
                  {...activity}
                  user={user}
                />
              </div>
            ))
          : Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={50} />
            ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
          fetchGeminiResponse();
        }}
        className="lg:w-[60%] justify-self-end px-4 py-3"
      >
        <div className="font-semibold mb-4 text-2xl">
          <label htmlFor="">
            Describe Your Experience of Performing the Activity
          </label>
        </div>
        <div className="border border-violet-200 rounded-xl bg-white">
          <TextareaAutosize
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={4}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            placeholder={`Type ...`}
            className="block w-[95%] lg:min-h-[30vh] px-2 lg:w-full rounded-xl resize-none focus:ring-4 bg-transparent focus:ring-violet-400 text-gray-900 placeholder:text-gray-400 sm:py-1.5 sm:leading-6"
          />
        </div>
        <button
          type="submit"
          className="w-full h-[3rem] mt-3 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Submit
        </button>
      </form>
      {botResponse && (
        <div className="w-full p-4 border border-gray-300 rounded-md mt-4">
          <h2 className="text-xl font-semibold mb-2">Gemini Response:</h2>
          <p>{botResponse}</p>
          {youtubeVideos.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mt-4">
                Recommended Videos:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {youtubeVideos.map((video, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 rounded-md p-2"
                  >
                    <a
                      href={video.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="mb-2"
                      />
                      <p className="text-sm">{video.title}</p>
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityDetails;
