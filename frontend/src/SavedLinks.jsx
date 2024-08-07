import React, { useEffect, useState } from "react";
import { db } from "./config/firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Tabs, Card, Skeleton } from "antd";

const { TabPane } = Tabs;

const SavedLinks = ({ user, userData, lang }) => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const q = query(
          collection(db, "savedPosts"),
          where("uid", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map((doc) => doc.data());
        setSavedPosts(posts);
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user.uid]);

  const renderPosts = (type) => {
    const filteredPosts = savedPosts.filter((post) => post.type === type);

    if (filteredPosts.length === 0) {
      return <p className="text-gray-500">No saved {type === "video" ? "videos" : "articles"}</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPosts.map((post, index) => (
          <Card
            key={index}
            hoverable
            cover={
              type === "video" ? (
                <img src={post.content.thumbnail} alt={post.content.title} />
              ) : null
            }
          >
            <Card.Meta
              title={post.content.title}
              description={
                <a href={post.content.link} target="_blank" rel="noopener noreferrer">
                  View {type === "video" ? "Video" : "Article"}
                </a>
              }
            />
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col mx-4 my-6 md:mx-10 md:my-8 lg:mx-40 lg:my-10">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-indigo-950 mb-6">
        Your Saved Posts
      </h2>
      {loading ? (
        <Skeleton active />
      ) : (
        <Tabs defaultActiveKey="1">
          <TabPane tab="Saved Videos" key="1">
            {renderPosts("video")}
          </TabPane>
          <TabPane tab="Saved Articles" key="2">
            {renderPosts("article")}
          </TabPane>
        </Tabs>
      )}
    </div>
  );
};

export default SavedLinks;
