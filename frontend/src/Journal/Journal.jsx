import React, { useEffect, useState } from "react";
import { ClipboardList, Loader2, Save } from "lucide-react";
import { auth, db } from "../config/firebase-config";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import { Collapse } from "antd";
const { Panel } = Collapse;

function Journal({user}) {
  const [formState, setformState] = useState({
    title: "",
    desc: "",
  });
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);

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
      await addDoc(collection(db, "journals"), {
        uid: user.uid,
        title: formState.title,
        body: formState.desc,
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

  return (
    <div className="flex justify-between items-start p-4 max-w-1200 mx-auto">
      <div className="flex-1 mr-4 p-4 rounded-lg shadow-md bg-white/20 backdrop-blur">
        <div className="flex items-center">
          <ClipboardList size={20} className="text-purple-600 mt-1 ml-3" />
          <div className="font-semibold text-2xl ml-4">Journal</div>
        </div>
        <div className="mt-4">
          <form onSubmit={handleSave}>
            <input
              type="text"
              value={formState.title}
              onChange={onChange}
              placeholder="Title of your entry..."
              className="w-full px-4 py-2 text-lg font-bold border rounded-lg mb-4"
              required
              name="title"
              minLength={3}
            />
            <textarea
              value={formState.desc}
              onChange={onChange}
              placeholder="Write your thoughts here..."
              rows={10}
              name="desc"
              className="w-full px-4 py-2 text-base border rounded-lg mb-4"
              required
              minLength={6}
            />
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
