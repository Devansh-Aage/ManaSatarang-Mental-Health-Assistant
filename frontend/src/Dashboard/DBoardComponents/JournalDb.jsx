import React, { useEffect, useState } from "react";
import { auth, db } from "../../config/firebase-config";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Skeleton from "react-loading-skeleton";
import { Collapse } from "antd";
import { useNavigate } from "react-router-dom";
const { Panel } = Collapse;
import { SquarePlus } from "lucide-react";  
import { translateText } from "../../utils";

function JournalDb({lang}) {
  const [user] = useAuthState(auth);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [loadingTranslation, setloadingTranslation] = useState(false);
  const [translatedEntries, setTranslatedEntries] = useState([]);
  const [staticText, setstaticText] = useState('Create Journal')

  console.log(lang);
  
  useEffect(() => {
    if (user) {
      const q = query(collection(db, "journals"), where("uid", "==", user.uid), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (qSnapShot) => {
        const posts = [];
        qSnapShot.forEach((doc) => {
          posts.push({ id: doc.id, ...doc.data() });
        });
        setEntries(posts);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const translatePosts = async () => {
      try {
        setloadingTranslation(true);
        const translatedPosts = await Promise.all(
          entries.map(async (entry) => {
            const translatedTitle = await translateText(entry.title, lang);
            const translatedBody = await translateText(entry.body, lang);
            const translatedEmotion = await translateText(entry.emotion, lang);
            const translatedStatic= await translateText(staticText,lang)
            setstaticText(translatedStatic);
            return {
              ...entry,
              translatedTitle,
              translatedBody,
              translatedEmotion,
            };
          })
        );
        setTranslatedEntries(translatedPosts);
      } catch (error) {
        console.error("Error translating posts: ", error);
      } finally {
        setloadingTranslation(false);
      }
    };

    if (entries.length > 0) {
      translatePosts();
    }
  }, [entries, lang]);
  console.log(translatedEntries);
  

  const emotionColors = {
    Happy: "bg-green-200 text-green-800",
    Sad: "bg-blue-200 text-blue-800",
    Angry: "bg-red-200 text-red-800",
    Fearful: "bg-yellow-200 text-yellow-800",
  };

  return (
    <div className="bg-white border rounded-xl p-2 flex flex-col items-center py-10 row-span-5 overflow-y-auto ">
    <div className="mb-10">
      <button
        className="px-4 py-2 bg-purple-900 text-white rounded-md flex items-center hover:bg-purple-800 transition-colors duration-200"
        onClick={() => navigate("/journal")}
      >
        <SquarePlus className="mr-2" />
      {staticText}
      </button>
      </div>
      {loading ? (
        <Skeleton count={5} />
      ) : translatedEntries.length > 0 ? (
        <Collapse className="w-full">
          {translatedEntries.map((entry) => (
            <Panel
              className="bg-white borde text-base font-bold"
              header={entry.translatedTitle || "Untitled"}
              key={entry.id}
              extra={
                entry.translatedEmotion && (
                  <span
                    className={`px-2 py-1 rounded-md ${
                      emotionColors[entry.emotion] || "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {entry.translatedEmotion}
                  </span>
                )
              }
            >
              <p className="text-base">{entry.translatedBody}</p>
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
  );
}

export default JournalDb;
