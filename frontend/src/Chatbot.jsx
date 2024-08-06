import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import { Mic, MicOff, Send, Smile, Volume2, VolumeX } from "lucide-react";
import { useSpeechSynthesis } from "react-speech-kit";
import "react-loading-skeleton/dist/skeleton.css";
import Filter from "bad-words";
import EmojiPicker from "emoji-picker-react";
import { toast } from "react-toastify";
import { db } from "./config/firebase-config"; // Import your Firestore config
import {
  collection,
  addDoc,
  Timestamp,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import { translateText } from "./utils";

const Chatbot = ({ user, lang }) => {
  const [messages, setMessages] = useState([]);
  const [staticText, setStaticText] = useState([
    "Meet Serena!",
    "Your Supportive Friend for a Happier You!",
    "Disable Reading",
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceIndex, setVoiceIndex] = useState(2);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1.5);
  const [volume, setVolume] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [videoMessages, setVideoMessages] = useState([]);
  const { speak, speaking, cancel, supported, voices } = useSpeechSynthesis();
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const filter = new Filter();

  const recognition = useRef(null);
  const [readingEnabled, setReadingEnabled] = useState(true);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Speech recognition not supported");
    } else {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = "en-US";

      recognition.current.onstart = () => setIsListening(true);
      recognition.current.onend = () => setIsListening(false);
      recognition.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setUserInput(speechResult);
      };
    }
  }, []);

  const handleVoiceChange = (event) => {
    const index = parseInt(event.target.value, 10);
    setSelectedVoice(voices[index]);
    setVoiceIndex(index);
  };

  const saveMessageToFirestore = async (sender, text) => {
    try {
      await addDoc(collection(db, "chatbot"), {
        uid: user?.uid,
        sender,
        text,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error saving message to Firestore:", error);
    }
  };

  const handlePitchChange = (event) => {
    setPitch(parseFloat(event.target.value));
  };

  const handleRateChange = (event) => {
    setRate(parseFloat(event.target.value));
  };

  const handleVolumeChange = (event) => {
    setVolume(parseFloat(event.target.value));
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.current.stop();
    } else {
      recognition.current.start();
    }
  };

  const toggleSpeaker = () => {
    if (speaking) {
      cancel();
    } else {
      const lastBotMessage = messages
        .slice()
        .reverse()
        .find((msg) => msg.sender === "bot");

      if (lastBotMessage) {
        speakResponse(lastBotMessage.text);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (userInput.trim() === "") return;
    if (filter.isProfane(userInput)) {
      toast.error(
        "Your message contains inappropriate language and cannot be submitted."
      );
      setUserInput("");
      return;
    }
    const newMessage = { sender: "user", text: userInput };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setLoading(true);
    setUserInput("");

    await saveMessageToFirestore("user", newMessage.text);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/chat",
        { user_input: userInput, uid: user?.uid },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const chatbotResponse = { sender: "bot", text: response.data.response };

      setMessages((prevMessages) => [...prevMessages, chatbotResponse]);
      await saveMessageToFirestore("bot", chatbotResponse.text);
      setVideoMessages(videoMessages);
      speakResponse(response.data.response);
    } catch (error) {
      console.error("Error sending message to chatbot:", error);
    }

    setLoading(false);
  };

  const speakResponse = (text) => {
    const cleanedText = text.replace(/[\u{1F600}-\u{1F64F}]/gu, "");
    speak({
      text: cleanedText,
      voice: selectedVoice,
      pitch,
      rate,
      volume,
    });
  };

  const toggleReading = () => {
    setReadingEnabled((prev) => !prev);
  };

  const handleEmojiClick = (emojiObject) => {
    setUserInput((prevInput) => prevInput + emojiObject.emoji);
  };

  useEffect(() => {
    const q = query(
      collection(db, "chatbot"),
      where("uid", "==", user?.uid), // Only retrieve messages with the matching UID
      orderBy("timestamp", "asc")
    );

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
    });

    translatePage(staticText, lang);

    return () => unsubscribe();
  }, [lang, user?.uid]);

  const translatePage = async (text, targetLanguage) => {
    try {
      const translatedPageText = await Promise.all(
        staticText.map(async (t) => {
          const translatedStatic = await translateText(t, targetLanguage);
          return translatedStatic;
        })
      );
      setStaticText(translatedPageText);
    } catch (error) {
      console.error("Error translating links: ", error);
    }
  };

  return (
    <div className="pt-10">
      <div className="flex flex-col items-center mb-10">
        <h2 className="font-extrabold text-3xl text-indigo-950 mb-3">
          {staticText[0]}
        </h2>
        <h2 className="font-semibold text-lg text-purple-400">
          {staticText[1]}
        </h2>
      </div>
      <div className="flex flex-col lg:w-[65vw] max-h-[80vh] overflow-hidden lg:mx-auto px-3 py-2 backdrop-blur-sm bg-white/30 rounded-lg">
        <div className="flex-1 min-h-[40vh] overflow-y-auto backdrop-blur-sm bg-slate-200/30 border rounded-lg p-3 border-purple-400">
          <div className="flex flex-col gap-2">
            {messages?.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex mb-2 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-xl p-3 max-w-xs ${
                      msg.sender === "user"
                        ? "bg-purple-300 text-right"
                        : "bg-white text-left"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div ref={messagesEndRef} />
                </div>
              ))
            ) : (
              <p>No messages yet</p>
            )}
          </div>
        </div>

        <div className="flex mt-4 items-center relative">
          <button
            onClick={toggleSpeaker}
            className="mr-2 p-2 bg-gray-300 font-semibold text-black rounded-lg hover:bg-gray-400"
          >
            {speaking ? <VolumeX /> : <Volume2 />}
          </button>
          <button
            onClick={toggleListening}
            className="mr-2 p-2 bg-gray-300 font-semibold text-black rounded-lg hover:bg-gray-400"
          >
            {isListening ? <Mic /> : <MicOff />}
          </button>

          <button
            onClick={() => setIsEmojiPickerVisible(!isEmojiPickerVisible)}
            className="mr-2 p-2 bg-gray-300 font-semibold text-black rounded-lg hover:bg-gray-400"
          >
            <Smile />
          </button>

          {isEmojiPickerVisible && (
            <div className="absolute bottom-12 left-0 z-10">
              <EmojiPicker onEmojiClick={handleEmojiClick} height={310} />
            </div>
          )}

          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Enter your prompt here..."
            className="flex-1 p-3 border focus:ring-2 focus:border-transparent focus:ring-purple-400 border-gray-300 rounded-lg focus:outline-none pr-12"
          />
          <button
            onClick={handleSendMessage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-600 mr-28"
          >
            <Send size={20} />
          </button>
          <div className="ml-4 flex items-center">
            <select
              value={rate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value))}
              className="ml-2 border focus:ring-2 focus:ring-purple-400 border-gray-300 rounded-lg bg-white"
            >
              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex mt-4 gap-2 items-center">
          {!readingEnabled && (
            <button
              onClick={toggleReading}
              className="p-3 sm:text-sm bg-purple-800 font-semibold text-white rounded-lg hover:bg-purple-600"
            >
              Enable Reading
            </button>
          )}
          {readingEnabled && (
            <>
              <button
                onClick={toggleReading}
                className={`p-3 ${
                  readingEnabled ? "bg-purple-400" : "bg-purple-800"
                } font-semibold text-white rounded-lg hover:bg-purple-600`}
              >
                {staticText[2] || "Disable Reading"}
              </button>
            </>
          )}
          <div className="flex-1">
            <select
              value={voiceIndex}
              onChange={handleVoiceChange}
              className="mt-1 block w-full p-2 border focus:ring-2 focus:ring-purple-400 border-gray-300 rounded-lg focus:outline-none"
            >
              {supported &&
                voices.map((voice, index) => (
                  <option key={index} value={index}>
                    {voice.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {readingEnabled && (
          <>
            <div className="mt-4 flex flex-col gap-4">
              {videoMessages.map((msg, index) => (
                <div key={index}>{msg.text}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
