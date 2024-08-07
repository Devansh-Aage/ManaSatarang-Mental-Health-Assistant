import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./css/home.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Search } from "lucide-react";
import { Tabs } from "antd";
import { db } from "./config/firebase-config";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "antd/dist/reset.css"; // Import Ant Design styles
import { translateText } from "./utils";

const { TabPane } = Tabs;



const Home = ({ activities, userData, user, lang }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [staticText, setstaticText] = useState(['Lift Your Spirit!', 'Explore Fun Ways to Brighten Your Mind.','Search Google for articles...','Recommended Videos','Recommended Articles'])
  const [recommendations, setRecommendations] = useState(null);
  const [loadingTranslation, setloadingTranslation] = useState(false)

  useEffect(() => {
    if (!recommendations) {
      fetchRecommendations();
    }
  }, [recommendations]);

  const fetchRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      const response = await axios.get("http://127.0.0.1:5000/recommendations");
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoadingSearch(true);
      const response = await axios.get(`http://127.0.0.1:5000/search`, {
        params: {
          query: searchQuery,
        },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSavePost = async (type, post) => {
    try {
      const savedPost = {
        uid: user.uid,
        type,
        content: post,
      };

      await addDoc(collection(db, "savedPosts"), savedPost);
      toast.success("Post saved successfully!");
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Error saving post");
    }
  };


  useEffect(() => {
    const translateStaticText = async () => {
      const translatedTextArray = await Promise.all(
        staticText.map((text) => translateText(text, lang))
      );
      setstaticText(translatedTextArray);
    };

    translateStaticText();
  }, [lang]);


  // Cache recommendations using useMemo
  const cachedRecommendations = useMemo(() => {
    return recommendations || { youtube_videos: [], articles: [] };
  }, [recommendations]);

  return (
    <div className="flex flex-col mx-4 my-6 md:mx-10 md:my-8 lg:mx-40 lg:my-10">
      <div className="flex flex-col items-center mb-6 md:mb-8 lg:mb-10">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-indigo-950 mb-2 md:mb-3">
          {staticText[0]}
        </h2>
        <h2 className="text-sm md:text-lg lg:text-xl font-semibold text-purple-400">
        {staticText[1]}
        </h2>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 md:w-2/3">
          <div className="relative flex items-center mb-4">
            <input
              type="text"
              placeholder={staticText[2]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
            />
            <Search
              className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={handleSearch}
            />
          </div>
          {searchQuery && (
            <div className="mt-4 bg-gray-100 p-4 border border-gray-300 rounded-md overflow-y-auto">
              {loadingSearch ? (
                <Skeleton height={50} />
              ) : searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((article, index) => (
                    <li key={index} className="mb-2">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {article.title}
                      </a>
                      <button
                        onClick={() => handleSavePost("article", article)}
                        className="ml-2 text-sm text-green-600 hover:underline"
                      >
                        Save
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No search results</p>
              )}
            </div>
          )}
          <div className="mt-4">
            <Tabs
              defaultActiveKey="1"
              className="w-full justify-center items-center"
            >
              <TabPane tab={staticText[3]} key="1">
                {loadingRecommendations ? (
                  <div className="flex gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} height={200} width={200} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cachedRecommendations.youtube_videos.map((video, index) => (
                      <div
                        className="border border-gray-300 rounded-md overflow-hidden bg-white shadow-md relative"
                        key={index}
                      >
                        <a
                          href={video.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-auto"
                          />
                         
                        </a>
                        <p className="p-2 text-sm font-bold text-gray-800 text-center">
                          {video.title}
                        </p>
                        <button
                            onClick={() => handleSavePost("video", video)}
                            className="px-2 py-2 text-base font-semibold rounded-lg bg-white text-purple-600 hover:underline absolute right-2 top-2"
                          >
                            Save
                          </button>
                      </div>
                    ))}
                  </div>
                )}
              </TabPane>
              <TabPane tab={staticText[4]} key="2">
                {loadingRecommendations ? (
                  <div className="flex gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} height={150} width={200} />
                    ))}
                  </div>
                ) : (
                  <ul className="list-none p-0">
                    {cachedRecommendations.articles.map((article, index) => (
                      <li key={index} className="mb-5 w-full">
                          <button
                          onClick={() => handleSavePost("article", article)}
                          className="ml-2 text-sm text-purple-600 hover:underline"
                        >
                          Save
                        </button>
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black w-full  bg-slate-100 py-2 px-4 hover:underline"
                        >
                          {article.title}
                        </a>
                      
                      </li>
                    ))}
                  </ul>
                )}
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
