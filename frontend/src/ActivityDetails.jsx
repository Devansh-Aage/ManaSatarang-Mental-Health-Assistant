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
import { translateText } from "./utils";
import { useEffect } from "react";
// import { ReactMic } from "react-mic";

const ActivityDetails = ({ activities, user, lang }) => {
  const [input, setInput] = useState("");
  const [geminiInput, setGeminiInput] = useState("");
  const [botResponse, setBotResponse] = useState("");
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isDoneState, setIsDoneState] = useState(selectedActivity?.isDone);
  const [imageFile, setImageFile] = useState(null);
  const [record, setRecord] = useState(false);
  const [emotion, setEmotion] = useState("");
  const [staticText, setstaticText] = useState([
    "Daily Activities",
    "Activity Details",
    "Summary",
    "Upload Image",
    "Submit",
  ]);
  const [translatedactivity, setTranslatedactivity] = useState(activities);

  const [loadingTranslation, setloadingTranslation] = useState(false);
  // const startRecording = () => {
  //   setRecord(true);
  // };

  // const stopRecording = () => {
  //   setRecord(false);
  // };

  // const onData = (recordedBlob) => {
  //   console.log("Recording:", recordedBlob);
  // };

  // const onStop = async (recordedBlob) => {
  //   console.log("Recorded Blob:", recordedBlob);
  //   const formData = new FormData();
  //   formData.append(
  //     "audio",
  //     recordedBlob.blob,
  //     recordedBlob.startTime + ".webm"
  //   );

  //   try {
  //     const response = await axios.post(
  //       "http://localhost:3036/predict",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     if (response.status === 200) {
  //       console.log(response.data);
  //       const { emotion } = response.data;
  //       setEmotion(emotion);
  //       toast.success(`Detected Emotion: ${emotion}`);
  //     } else {
  //       toast.error("Failed to detect emotion.");
  //     }
  //   } catch (error) {
  //     console.error("Error detecting emotion:", error);
  //     toast.error("Error detecting emotion.");
  //   }
  // };

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
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const verifyActivity = async () => {
    if (!selectedActivity || !imageFile) {
      toast.error("Please select an activity and upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("activity", selectedActivity.title);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8080/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        const result = response.data.result;
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
      setloadingTranslation(true);
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
      setstaticText(translatedPage);
      setTranslatedactivity(translatedActivities);
      console.log(translatedActivities);
      
    } catch (error) {
      console.error("Error translating static text: ", error);
    } finally {
      setloadingTranslation(false);
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
        {translatedactivity.length > 0
          ? translatedactivity.slice(0, 5).map((a) => (
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
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
            onChange={handleFileChange}
          />
        </div>
        {/* <div className="mb-3">
          <ReactMic
            record={record}
            className="sound-wave"
            onStop={onStop}
            onData={onData}
            strokeColor="#000000"
            backgroundColor="#FF4081"
          />
          <button
            type="button"
            onClick={startRecording}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
          >
            Start Recording
          </button>
          <button
            type="button"
            onClick={stopRecording}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
          >
            Stop Recording
          </button>
        </div> */}
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {staticText[4]}
        </button>
        <button
          type="button"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
          onClick={verifyActivity}
        >
          Verify Activity
        </button>
        {/* {emotion && (
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold">Detected Emotion: {emotion}</p>
          </div>
        )} */}
      </form>
    </div>
  );
};

export default ActivityDetails;
