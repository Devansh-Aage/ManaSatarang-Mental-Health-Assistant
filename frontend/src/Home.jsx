import React, { useState, useEffect } from "react";
import axios from "axios";
import Activity from "./Activity";
import Loader from "./components/Loader";
import "./css/home.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Tabs } from 'antd';
const onChange = (key) => {
  console.log(key);
};
const items = [
  {
    key: '1',
    label: 'Tab 1',
    children: 'Content of Tab Pane 1',
  },
  {
    key: '2',
    label: 'Tab 2',
    children: 'Content of Tab Pane 2',
  },
  {
    key: '3',
    label: 'Tab 3',
    children: 'Content of Tab Pane 3',
  },
];
const Home = ({ activities, userData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState({
    youtube_videos: [],
    articles: [],
  });

  useEffect(() => {
    // fetchRecommendations();
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
    <div className="home-container">
      <div className="activity-column max-w-sm lg:block">
        <Activity activities={activities} user={userData} />
      </div>
      <div className="search-column">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Google for articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div className="search-results overflow-y-scroll">
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
        <div className="recommendations">
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
          <h2>Recommended Videos</h2>

          {loadingRecommendations ? (
            <div className="flex">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="mr-3 mb-3"
                  height={200}
                  width={200}
                />
              ))}
            </div>
          ) : (
            <div className="video-grid">
              {recommendations.youtube_videos.length > 0 ? (
                recommendations.youtube_videos.map((video, index) => (
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
                ))
              ) : (
                <p>No recommended videos</p>
              )}
            </div>
          )}
          <h2>Recommended Articles</h2>
          {loadingRecommendations ? (
            <div className="flex">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="mr-3 mb-3"
                  height={150}
                  width={200}
                />
              ))}
            </div>
          ) : recommendations.articles.length > 0 ? (
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
          ) : (
            <p>No recommended articles</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
