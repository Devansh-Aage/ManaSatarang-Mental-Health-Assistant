import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./config/firebase-config";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { BadgeCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import CommunitySidebar from "./components/CommunitySidebar";
import { translateText } from "./utils";
import Filter from "bad-words";
import { toast } from "react-toastify";
import EmojiPicker from "emoji-picker-react";
import {Smile } from "lucide-react";

const groupNames = [
  "Student Circle",
  "Chronic Illness Support Group",
  "Workplace Wellness",
];

const Workspace = ({ user, lang }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [staticText, setStaticText] = useState([
    "Community",
    "Student Circle",
    "Chronic Illness Support Group",
    "Corporate Group",
  ]);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const filter = new Filter();

  useEffect(() => {
    const q = query(collection(db, "workspace"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const translatedMessages = [];
      for (const doc of querySnapshot.docs) {
        const messageData = doc.data();
        const translatedText = await translateText(messageData.text, lang);
        const translatedMessage = {
          ...messageData,
          text: translatedText,
        };
        translatedMessages.push(translatedMessage);
      }
      setMessages(translatedMessages);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [lang]);

  const translatePage = async (text, targetLanguage) => {
    try {
      setLoadingTranslation(true);
      const translatedPageText = await Promise.all(
        staticText.map(async (t) => {
          const translatedStatic = await translateText(t, targetLanguage);
          return translatedStatic;
        })
      );
      setStaticText(translatedPageText);
    } catch (error) {
      console.error("Error translating static text: ", error);
    } finally {
      setLoadingTranslation(false);
    }
  };

  useEffect(() => {
    translatePage(staticText, lang);
  }, [lang]);

  useEffect(() => {
    if (!loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        if (filter.isProfane(newMessage)) {
          toast.error(
            "Your message contains inappropriate language and cannot be submitted."
          );
          setNewMessage("");
          return;
        }
        await addDoc(collection(db, "workspace"), {
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

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevInput) => prevInput + emojiObject.emoji);
  };

  return (
    <div className="flex h-[90vh] overflow-hidden items-end justify-end mx-10 mt-10">
      <div className="hidden  lg:block  min-h-[85vh] justify-self-center self-center lg:w-[25vw] flex-shrink-0">
        <div className="mt-14"></div>
        <CommunitySidebar staticText={staticText} />
      </div>
      <div className="flex flex-col justify-end h-[90vh] mt-[6rem] flex-grow px-2">
        <div className="flex-1 overflow-y-auto rounded-t-lg  backdrop-blur-sm bg-slate-200/30 border border-gray-300  p-3">
          <div className="mb-12"></div>
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
                    className={`flex py-2 ${
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
                      className={`max-w-[55%] p-3 rounded-lg break-words ${
                        msg.userId === user.uid
                          ? "bg-violet-300 text-right"
                          : "bg-white text-left"
                      }`}
                    >
                      <div
                        className={`flex ${
                          msg.userId === user.uid
                            ? "justify-end"
                            : "justify-start"
                        }  items-center mb-1`}
                      >
                        <span className="font-bold text-slate-600 text-sm mr-1">
                          {msg.name}
                        </span>
                      </div>
                      <div className="break-words">{msg.text}</div>
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
        <div className="flex items-center rounded-b-lg justify-end p-3 bg-purple-100 border-t border-gray-300 mt-auto relative">
          <button
            onClick={() => setIsEmojiPickerVisible(!isEmojiPickerVisible)}
            className="mr-2 p-2 bg-gray-300 font-semibold text-black rounded-lg hover:bg-gray-400"
          >
            <Smile />
          </button>
          {isEmojiPickerVisible && (
            <div className="absolute bottom-12 left-0 z-10">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
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
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 focus:ring-4 focus:ring-violet-400 rounded-md text-sm mr-2"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
