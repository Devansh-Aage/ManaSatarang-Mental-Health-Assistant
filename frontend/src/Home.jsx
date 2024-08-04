import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/home.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Search } from "lucide-react";
import { Tabs } from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design styles

const { TabPane } = Tabs;

const Home = ({ activities, userData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [recommendations, setRecommendations] = useState({
    youtube_videos: [],
    articles: [],
  });

  useEffect(() => {
    fetchRecommendations();
  }, []);

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

  return (
    <div className="home-container flex flex-col mx-40 my-7">
      <div className="flex flex-col items-center mb-10">
        <h2 className="font-extrabold text-3xl text-indigo-950 mb-3">Lift Your Spirit!</h2>
        <h2 className="font-semibold text-lg text-purple-400">Explore Fun Ways to Brighten Your Mind.</h2>
      </div>
      <div className="search-column">
        <div className="search-bar relative">
          <input
            type="text"
            placeholder="Search Google for articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
            onClick={handleSearch}
          />
        </div>
        {searchQuery && (
          <div className="search-results overflow-y-auto mt-4">
            {loadingSearch ? (
              <Skeleton height={50} />
            ) : searchResults.length > 0 ? (
              <ul>
                {searchResults.map((article, index) => (
                  <li key={index}>
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {article.title}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No search results</p>
            )}
          </div>
        )}
        <div className="recommendations mt-4">
          <Tabs defaultActiveKey="1"
          >
            <TabPane className="text-purple-400" tab="Recommended Videos" key="1">
              {loadingRecommendations ? (
                <div className="flex">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="mr-3 mb-3" height={200} width={200} />
                  ))}
                </div>
              ) : (
                <div className="video-grid">
                  {recommendations.youtube_videos.map((video, index) => (
                    <div className="video-item" key={index}>
                      <a
                        href={video.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img src={video.thumbnail} alt={video.title} />
                        <p>{video.title}</p>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </TabPane>
            <TabPane tab="Recommended Articles" key="2">
              {loadingRecommendations ? (
                <div className="flex">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="mr-3 mb-3" height={150} width={200} />
                  ))}
                </div>
              ) : (
                <ul className="article-list">
                  {recommendations.articles.map((article, index) => (
                    <li key={index}>
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
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
  );
};

export default Home;
