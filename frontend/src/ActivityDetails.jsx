import React, { useState, useEffect } from "react";
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
import { translateText } from "./utils";

const ActivityDetails = ({ activities, user, lang }) => {
  const [input, setInput] = useState("");
  const [geminiInput, setGeminiInput] = useState("");
  const [botResponse, setBotResponse] = useState("");
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isDoneState, setIsDoneState] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [emotion, setEmotion] = useState("");
  const [staticText, setStaticText] = useState([
    "Daily Activities",
    "Activity Details",
    "Summary",
    "Upload Image",
    "Verify Activity",
    "Submit",
  ]);
  const [translatedActivities, setTranslatedActivities] = useState(activities);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const activityFormatMap = {
    "Read a book": "read_a_book",
    "Ride a bicycle": "ride_a_bicycle",
    "Go to a dog park": "go_to_a_dog_park",
    "Watch a sunrise": "watch_a_sunrise_or_sunset",
    "Listen to music": "listen_to_music",
  };

  const keywords = Object.keys(activityFormatMap);

  const getFormattedActivity = (title) => {
    for (const keyword of keywords) {
      if (title.includes(keyword)) {
        return activityFormatMap[keyword];
      }
    }
    return title.toLowerCase().replace(/ /g, "-");
  };

  const sendMessage = async () => {
    if (selectedActivity) {
      if (!isDoneState && isVerified) {
        try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            points: increment(10),
          });

          const taskRef = doc(db, "tasks", selectedActivity.id);
          await updateDoc(taskRef, {
            isDone: true,
          });
          setIsDoneState(true);
          toast.success("You got 10 points for completing the activity!");
        } catch (error) {
          console.error("Error updating task: ", error);
          toast.error("Failed to update task.");
        }
      } else if (!isVerified) {
        toast.error("Please verify the activity before submitting.");
      }
    }
  };

  const fetchGeminiResponse = async () => {
    if (selectedActivity && input) {
      const combinedInput = `Activity: ${selectedActivity.title}\nSummary: ${input}`;
      console.log("Fetching Gemini Response for:", combinedInput);
      try {
        const response = await axios.post(
          "http://localhost:5000/evaluate_summary",
          {
            summary: combinedInput,
          }
        );
        console.log("Response received:", response);
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
    setInput(`Title: ${activity.translatedTitle} \n`);
    setGeminiInput(`Title: ${activity.title} \n`);
    setIsVerified(false); // Reset verification status when a new activity is selected
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const verifyActivity = async () => {
    if (!selectedActivity || !imageFile) {
      toast.error("Please select an activity and upload an image.");
      return;
    }

    const formattedActivity = getFormattedActivity(selectedActivity.title);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("activity", formattedActivity);

    try {
      const response = await axios.post(
        "http://localhost:5050/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        const result = response.data.result;
        setIsVerified(true); // Set the verification status to true
        toast.success(`Activity verification result: ${result}`);
      } else {
        toast.error("Failed to verify activity.");
      }
    } catch (error) {
      console.error("Error verifying activity:", error);
      toast.error("Error verifying activity.");
    }
  };

  const translatePage = async () => {
    try {
      setLoadingTranslation(true);
      const translatedPage = await Promise.all(
        staticText.map(async (t) => {
          const translatedMsg = await translateText(t, lang);
          return translatedMsg;
        })
      );
      const translatedActivities = await Promise.all(
        activities.map(async (a) => {
          const translatedActivity = await translateText(a.title, lang);
          return { ...a, translatedTitle: translatedActivity };
        })
      );
      setStaticText(translatedPage);
      setTranslatedActivities(translatedActivities);
      console.log(translatedActivities);
    } catch (error) {
      console.error("Error translating static text: ", error);
    } finally {
      setLoadingTranslation(false);
    }
  };

  useEffect(() => {
    translatePage();
  }, [lang, activities]);

  return (
    <div className="w-full flex justify-center items-center p-4 mx-2 overscroll-none">
      <div className="w-[40%] lg:w-[30%]">
        <div className="flex mb-3">
          <ClipboardList size={20} className="text-purple-600 mt-1 ml-3" />
          <div className="font-semibold text-2xl ml-4">{staticText[0]}</div>
        </div>
        {translatedActivities.length > 0
          ? translatedActivities.slice(0, 5).map((a) => (
              <div key={a.id} onClick={() => handleActivityClick(a)}>
                <ActivityBlock
                  key={a.id}
                  isDoneState={isDoneState}
                  {...a}
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
        }}
        className="lg:w-[60%] justify-self-end px-4 py-3"
      >
        <div className="font-semibold mb-4 text-2xl">
          <label
            htmlFor="activityTitle"
            className="block text-lg font-medium text-gray-700"
          >
            {staticText[1]}
          </label>
        </div>
        <div className="mb-3">
          <label
            htmlFor="summary"
            className="block text-sm font-medium text-gray-700"
          >
            {staticText[2]}
          </label>
          <TextareaAutosize
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
            value={input}
            rows={8}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700"
          >
            {staticText[3]}
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-900 bg-gray-50 rounded-md border border-gray-300 cursor-pointer focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={verifyActivity}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {staticText[4]}
          </button>
          <button
            type="submit"
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isVerified
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!isVerified}
          >
            {staticText[5]}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityDetails;
