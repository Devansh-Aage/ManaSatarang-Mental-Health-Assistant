import React, { useEffect, useState } from "react";
import { auth, db } from "../../config/firebase-config";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Skeleton from "react-loading-skeleton";
import { Collapse } from "antd";
const { Panel } = Collapse;

function JournalDb() {
  const [user] = useAuthState(auth);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const emotionColors = {
    Happy: "bg-green-200 text-green-800",
    Sad: "bg-blue-200 text-blue-800",
    Angry: "bg-red-200 text-red-800",
    Fearful: "bg-yellow-200 text-yellow-800",
  };

  return (
    <div className="bg-white border rounded-xl p-2 flex flex-col items-center justify-center  4 row-span-3">

      {loading ? (
        <Skeleton count={5} />
      ) : entries.length > 0 ? (
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
                      emotionColors[entry.emotion] || "bg-gray-200 text-gray-800"
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
  );
}

export default JournalDb;
