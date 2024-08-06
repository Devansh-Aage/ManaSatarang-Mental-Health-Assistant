import React, { useEffect, useState, useRef } from "react";
import { ClipboardList, Loader2, Save, Mic, MicOff } from "lucide-react";
import { auth, db } from "../config/firebase-config";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { Smile } from "lucide-react";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import { Collapse } from "antd";
import axios from "axios";
const { Panel } = Collapse;
import EmojiPicker from "emoji-picker-react";

function Journal({ user }) {
  const [formState, setformState] = useState({
    title: "",
    desc: "",
  });
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "journals"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (qSnapShot) => {
      const posts = [];
      qSnapShot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      setEntries(posts);
      console.log(posts);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setformState((prev) => ({
          ...prev,
          desc: prev.desc + finalTranscript,
        }));
      };

      recognitionRef.current.onerror = (event) => {
        console.error(event.error);
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
  }, []);

  const clearForm = () => {
    setformState({
      title: "",
      desc: "",
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:8080/classify-emotion",
        {
          text: formState.desc,
        }
      );

      const emotion = data.emotion;

      await addDoc(collection(db, "journals"), {
        uid: user.uid,
        title: formState.title,
        body: formState.desc,
        emotion: emotion,
        timestamp: new Date(),
      });

      toast.success("Journal entry saved!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to save journal entry.");
    } finally {
      setLoading(false);
      clearForm();
    }
  };

  const onChange = (e) => {
    setformState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setListening(!listening);
  };

  const emotionColors = {
    Happy: "bg-green-200 text-green-800",
    Sad: "bg-blue-200 text-blue-800",
    Angry: "bg-red-200 text-red-800",
    Fearful: "bg-yellow-200 text-yellow-800",
    // Add more emotions and corresponding colors here
  };

  const handleEmojiClick = (emojiObject) => {
    setformState((prevState) => {
      const newValue = prevState[activeInput] + emojiObject.emoji;
      return { ...prevState, [activeInput]: newValue };
    });
  };

  const handleInputFocus = (inputName) => {
    setActiveInput(inputName);
  };

  return (
    <div className="flex justify-between mt-10 items-start p-4 max-w-1200 mx-auto">
      <div className="flex-1 mr-4 p-4 rounded-lg shadow-md bg-white/20 backdrop-blur">
        <div className="flex items-center">
          <ClipboardList size={20} className="text-purple-600 mt-1 ml-3" />
          <div className="font-semibold text-2xl ml-4">Journal</div>
        </div>
        <div className="mt-4 relative">
          <form onSubmit={handleSave}>
            <input
              type="text"
              value={formState.title}
              onChange={onChange}
              onFocus={() => handleInputFocus("title")}
              placeholder="Title of your entry..."
              className="w-full px-4 py-2 text-lg font-bold border rounded-lg mb-4"
              required
              name="title"
              minLength={3}
            />
            <textarea
              value={formState.desc}
              onChange={onChange}
              onFocus={() => handleInputFocus("desc")}
              placeholder="Write your thoughts here..."
              rows={10}
              name="desc"
              className="w-full px-4 py-2 text-base border rounded-lg mb-4"
              required
              minLength={6}
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleListening}
                className={`flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer ${
                  listening
                    ? "bg-red-600 text-white"
                    : "bg-purple-600 text-white"
                }`}
              >
                {listening ? (
                  <>
                    <MicOff size={16} className="mr-1" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic size={16} className="mr-1" />
                    <span>Start Recording</span>
                  </>
                )}
              </button>
              <button
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white border rounded-lg cursor-pointer"
                type="submit"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save size={16} className="mr-1" />
                    <span>Save Entry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="flex-1 max-w-500 p-4 bg-purple-100 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Previous Logs</h2>
        {entries.length > 0 ? (
          <Collapse>
            {entries.map((entry) => (
              <Panel
                className="bg-white text-base font-bold"
                header={entry.title || "Untitled"}
                key={entry.id}
                extra={
                  entry.emotion && (
                    <span
                      className={`px-2 py-1 rounded-lg ${
                        emotionColors[entry.emotion] ||
                        "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {entry.emotion}
                    </span>
                  )
                }
              >
                <p className="text-base">{entry.body}</p>
                <small className="text-gray-700 text-sm">
                  {new Date(entry.timestamp.toDate()).toDateString()}
                </small>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <div>No Logs Present in Journal</div>
        )}
      </div>
    </div>
  );
}

export default Journal;
