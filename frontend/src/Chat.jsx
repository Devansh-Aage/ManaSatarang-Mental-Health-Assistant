import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import Skeleton from "react-loading-skeleton";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./config/firebase-config";
import axios from "axios";
import { translateText } from "./utils";

const Chat = ({ lang }) => {
  const [user] = useAuthState(auth);
  const params = useParams();
  const router = useNavigate();
  const { chatId } = params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Ensure correct chat participants
  const [userId1, userId2] = chatId.split("--");
  useEffect(() => {
    if (userId1 !== user.uid && userId2 !== user.uid) {
      console.log("error in user IDs");
      router("/");
    }
  }, [user.uid, userId1, userId2, router]);

  // Use therapistId as the collection name
  const therapistId = "oQyoMJNC6oZ3gh2Xxv8LIZTgfuw2";
  const patientId = therapistId === userId1 ? userId2 : userId1;

  useEffect(() => {
    const q = query(collection(db, patientId), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push(doc.data());
      });
      translateMessages(messages);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [patientId, lang]);

  const translateMessages = async (messages) => {
    const translatedMessages = await Promise.all(
      messages.map(async (msg) => {
        if (lang !== "en") {
          const translatedText = await translateText(msg.text, lang);
          return { ...msg, translatedText };
        }
        return msg;
      })
    );
    setMessages(translatedMessages);
  };



  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await addDoc(collection(db, patientId), {
          userId: user.uid,
          text: newMessage,
          timestamp: new Date(),
          name: user.displayName,
          photo: user.photoURL,
        });
        setNewMessage("");
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  };

  useEffect(() => {
    if (!loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  return (
    <div className="flex flex-col lg:w-[65vw] max-h-[80vh] overflow-hidden mx-auto px-3 py-2 backdrop-blur-sm bg-white/30 rounded-lg">
      <div className="flex-1 min-h-[40vh] overflow-y-auto backdrop-blur-sm bg-slate-200/30 border rounded-lg p-3 border-purple-400">
        <div className="flex flex-col gap-2">
          {loading
            ? Array.from({ length: 10 }).map((_, index) => (
                <Skeleton
                  key={index}
                  height={50}
                  className="message-skeleton"
                />
              ))
            : messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex mb-2 ${
                    msg.userId === user.uid ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.userId !== user.uid && (
                    <img
                      src={msg.photo}
                      className="w-8 h-8 rounded-full mx-2"
                      alt="User Profile"
                    />
                  )}
                  <div
                    className={`rounded-xl p-3 max-w-xs ${
                      msg.userId === user.uid
                        ? "bg-purple-300 text-right"
                        : "bg-white text-left"
                    }`}
                  >
                    <div className="flex justify-end items-center mb-1">
                      <span className="font-bold text-slate-600  mr-1">
                        {msg.name}
                      </span>
                    </div>
                    <div className="break-words">
                      {msg.translatedText || msg.text}
                    </div>
                  </div>
                  {msg.userId === user.uid && (
                    <img
                      src={msg.photo}
                      className="w-8 h-8 rounded-full mx-2"
                      alt="User Profile"
                    />
                  )}
                </div>
              ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex mt-4 items-center relative">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Enter your message here..."
          className="flex-1 p-3 border focus:ring-2 focus:border-transparent focus:ring-purple-400 border-gray-300 rounded-lg focus:outline-none pr-12"
        />
        <button
          onClick={handleSendMessage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-600 mr-28"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
