import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import { Mic, MicOff } from "lucide-react"; // Add microphone icons
import { useSpeechSynthesis } from "react-speech-kit"; // Import from react-speech-kit
import "react-loading-skeleton/dist/skeleton.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceIndex, setVoiceIndex] = useState(0); // State for selected voice
  const [pitch, setPitch] = useState(1); // State for pitch
  const [rate, setRate] = useState(1.5); // State for rate
  const [volume, setVolume] = useState(1); // State for volume
  const [selectedVoice, setSelectedVoice] = useState(null); // State for selected voice object
  const [videoMessages, setVideoMessages] = useState([]);
  const { speak, speaking, cancel, supported, voices } = useSpeechSynthesis(); // Hook from react-speech-kit

  const recognition = useRef(null);
  const [readingEnabled, setReadingEnabled] = useState(true); // State for toggle reading

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

  // Function to handle voice selection
  const handleVoiceChange = (event) => {
    const index = parseInt(event.target.value, 10);
    setSelectedVoice(voices[index]);
    setVoiceIndex(index);
  };

  // Function to handle pitch change
  const handlePitchChange = (event) => {
    setPitch(parseFloat(event.target.value));
  };

  // Function to handle rate change
  const handleRateChange = (event) => {
    setRate(parseFloat(event.target.value));
  };

  // Function to handle volume change
  const handleVolumeChange = (event) => {
    setVolume(parseFloat(event.target.value));
  };

  // Function to start or stop listening
  const toggleListening = () => {
    if (isListening) {
      recognition.current.stop();
    } else {
      recognition.current.start();
    }
  };

  // Function to scroll to the bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (userInput.trim() === "") return;

    const newMessage = { sender: "user", text: userInput };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setLoading(true);
    setUserInput("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/chat",
        { user_input: userInput },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const chatbotResponse = { sender: "bot", text: response.data.response };
      const videoMessages = response.data.youtube_videos.map(
        (video, index) => ({
          sender: "bot",
          text: (
            <div key={index} className="flex flex-col items-center">
              <a
                href={video.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full max-w-xs rounded-lg mb-2"
                />
                <p className="text-sm text-gray-600">{video.title}</p>
              </a>
            </div>
          ),
        })
      );

      setMessages((prevMessages) => [...prevMessages, chatbotResponse]);
      setVideoMessages(videoMessages);
      speakResponse(response.data.response);
    } catch (error) {
      console.error("Error sending message to chatbot:", error);
    }

    setLoading(false);
  };

  // Function to trigger speech synthesis
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

  // Function to stop reading
  const stopReading = () => {
    cancel();
  };

  // Function to toggle reading
  const toggleReading = () => {
    setReadingEnabled((prev) => !prev);
  };

  return (
    <div className="flex flex-col lg:w-[65vw] max-h-[80vh] overflow-hidden mx-auto px-3 py-2 backdrop-blur-sm bg-white/30 rounded-lg shadow-lg">
      <div className="flex-1 min-h-[40vh] overflow-y-auto backdrop-blur-sm bg-slate-200/30 border rounded-lg p-3">
        <div className="flex flex-col gap-2">
          {loading && <Skeleton height={50} count={1} className="mb-2" />}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-2 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-xl p-3 max-w-xs ${
                  msg.sender === "user"
                    ? "bg-violet-300 text-right"
                    : "bg-white text-left"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex mt-4">
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
          placeholder="Type a message..."
          className="flex-1 p-3 border focus:ring-2 focus:ring-violet-400 border-gray-300 rounded-l-lg focus:outline-none"
        />
        <button
          onClick={handleSendMessage}
          className="p-3 bg-violet-500 mr-1 font-semibold text-white rounded-r-lg hover:bg-violet-600"
        >
          Send
        </button>
        <button
          onClick={toggleListening}
          className="p-3 bg-gray-300 mr-1 font-semibold text-black rounded-lg hover:bg-gray-400"
        >
          {isListening ? <Mic /> : <MicOff />}
        </button>
        <button
          onClick={stopReading}
          className="p-3 bg-pink-800 mr-1  font-semibold text-white rounded-lg hover:bg-pink-700"
        >
          Stop Reading
        </button>
        <button
          onClick={toggleReading}
          className={`p-3 mr-1  ml-2 ${
            readingEnabled ? "bg-purple-800" : "bg-gray-400"
          } font-semibold text-white rounded-lg hover:bg-purple-600`}
        >
          {readingEnabled ? "Reading Enabled" : "Reading Disabled"}
        </button>
      </div>

      {readingEnabled && (
        <>
          <div className="mt-4 flex flex-col gap-4">
            {videoMessages.map((msg, index) => (
              <div key={index}>{msg.text}</div>
            ))}
          </div>

          <div className="mt-0">
            <label className="block text-gray-700">Select Voice:</label>
            <select
              value={voiceIndex}
              onChange={handleVoiceChange}
              className="mt-1 block w-full p-2 border focus:ring-2 focus:ring-violet-400 border-gray-300 rounded-lg focus:outline-none"
            >
              {supported &&
                voices.map((voice, index) => (
                  <option key={index} value={index}>
                    {voice.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex mt-2 w-full items-center justify-around">
            <div className="flex gap-3">
              <label className="block text-gray-700">Pitch</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={pitch}
                onChange={handlePitchChange}
                className="mt-1 block w-full"
              />
            </div>

            <div className="flex gap-3">
              <label className="block text-gray-700">Rate</label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={rate}
                onChange={handleRateChange}
                className="mt-1 block w-full"
              />
            </div>

            <div className="flex gap-3">
              <label className="block text-gray-700">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="mt-1 block w-full"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
