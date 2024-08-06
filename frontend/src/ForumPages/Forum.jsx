import React, { useState, useEffect } from "react";
import { Tabs, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db, storage } from "../config/firebase-config";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { translateText } from "../utils";
import Filter from "bad-words";
import { toast } from "react-toastify";

const { TabPane } = Tabs;

function Forum({ lang }) {
  const [user, loading, error] = useAuthState(auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", description: "" });
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [downloadURL, setDownloadURL] = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [staticText, setStaticText] = useState([
    "Public Forum",
    "Join the conversation to connect with the community!",
    "Create a new Discussion",
  ]);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  const navigate = useNavigate();
  const filter = new Filter();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleUpload = async (file) => {
    const storageRef = ref(storage, `images/${file.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setDownloadURL(url);
      setUploadError(null);
      return url;
    } catch (error) {
      setUploadError(error.message);
      return null;
    }
  };

  const addForumPostToDB = async (imageURL) => {
    try {
      await addDoc(collection(db, "forumPosts"), {
        uid: user.uid,
        displayName: user.displayName || "Anonymous",
        title: newPost.title,
        desc: newPost.description,
        imageURL: imageURL || "",
        likes: 0,
        comments: [],
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const translatePosts = async (posts, targetLanguage) => {
    try {
      const translatedPosts = await Promise.all(
        posts.map(async (post) => {
          const translatedTitle = await translateText(post.title, targetLanguage);
          const translatedDesc = await translateText(post.desc, targetLanguage);
          return { ...post, title: translatedTitle, desc: translatedDesc };
        })
      );
      return translatedPosts;
    } catch (error) {
      console.error("Error translating posts: ", error);
      return posts;
    }
  };

  const translatePage = async (targetLanguage) => {
    try {
      setLoadingTranslation(true);
      const translatedPageText = await Promise.all(
        staticText.map(async (t) => {
          const translatedStatic = await translateText(t, targetLanguage);
          return translatedStatic;
        })
      );
      setStaticText(translatedPageText);

      const translatedPosts = await translatePosts(posts, targetLanguage);
      setPosts(translatedPosts);
    } catch (error) {
      console.error("Error translating static text: ", error);
    } finally {
      setLoadingTranslation(false);
    }
  };

  useEffect(() => {
    translatePage(lang);
  }, [lang]);

  const handleSavePost = async (type) => {
    if (!newPost.title || !newPost.description) {
      message.error("Title and Description are required!");
      return;
    }
    if (filter.isProfane(newPost.title) || filter.isProfane(newPost.description)) {
      toast.error("Title or Description contains inappropriate language and cannot be submitted.");
      handleCloseModal();
      setNewPost({ title: "", description: "" });
      return;
    }

    if (type === "postWithPicture" && imgFile) {
      const url = await handleUpload(imgFile);
      if (!url) {
        message.error("Image upload failed. Please try again.");
        return;
      }
      await addForumPostToDB(url);
    } else {
      await addForumPostToDB();
    }

    handleCloseModal();
    setNewPost({ title: "", description: "" });
    setImgFile(null);
    setDownloadURL(null);
  };

  useEffect(() => {
    const q = query(collection(db, "forumPosts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, async (qSnapShot) => {
      const posts = [];
      qSnapShot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });

      const translatedPosts = await translatePosts(posts, lang);
      setPosts(translatedPosts);
    });
    return () => unsubscribe();
  }, [lang]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewPost((prev) => ({ ...prev, [id]: value }));
  };

  const handlePostClick = (postId) => {
    navigate(`/forum/post/${postId}`, { state: { lang: lang } });
  };

  const handleDropdownToggle = (postId) => {
    setDropdownOpen(dropdownOpen === postId ? null : postId);
  };

  const uploadProps = {
    beforeUpload: (file) => {
      setImgFile(file);
      return false;
    },
    onRemove: () => {
      setDownloadURL(null);
      setUploadError(null);
      setImgFile(null);
    },
  };

  return (
    <div className="relative pt-10 pb-32 h-screen overflow-y-auto">
      <div className="flex flex-col items-center mb-10">
        <h2 className="font-extrabold text-3xl text-indigo-950 mb-3">{staticText[0]}</h2>
        <h2 className="font-semibold text-lg text-purple-400 mb-10">{staticText[1]}</h2>
      </div>
      <div className={`flex flex-col justify-center items-center ${isModalOpen ? "blur-sm" : ""}`}>
        <div className="w-1/4 pr-6">
          <button
            className="w-full bg-indigo-950 text-white px-4 py-2 rounded mb-6 hover:bg-purple-400 transition-colors duration-300"
            onClick={handleOpenModal}
          >
            {staticText[2]}
          </button>
        </div>

        <div className="w-11/12">
          <div className="space-y-8">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="w-full backdrop-blur-md py-10 rounded-lg relative cursor-pointer"
                  onClick={() => handlePostClick(post.id)}
                >
                  <div className="flex ml-10">
                  
                    <div className="flex-1 flex flex-col items-start bg-white shadow-md rounded-lg">
                      {post?.imageURL && (
                        <img src={post?.imageURL} className="w-full mb-2 rounded-lg" alt="" />
                      )}
                      <p className="text-gray-800 p-2 font-semibold">{post.displayName}</p>
                      <p className="text-gray-800 mb-4 px-2 text-sm font-normal">{post.desc}</p>
                    </div>
          
                    {post?.imageURL && (
                      <div className="flex-1 flex flex-col items-end mx-10">
                        <div className="w-full flex flex-col space-y-4">
                          <div className="max-h-72 overflow-y-auto">
                            {post.comments.map((comment) => (
                              <div key={comment.id} className="bg-white p-2 rounded shadow-sm mb-2">
                                <p className="font-semibold text-sm text-gray-800">{comment.username}</p>
                                <p className="text-gray-700 text-xs">{comment.text}</p>
                              </div>
                            ))}
                          </div>
                          <textarea
                            className="w-full border border-gray-300 rounded mb-2"
                            placeholder="Write a comment..."
                            rows="1"
                            onChange={handleChange}
                          />
                          <button
                            className="bg-indigo-950 text-white px-4 py-2 rounded hover:bg-purple-400 transition-colors duration-300"
                            onClick={handleSavePost}
                          >
                            Post Comment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div>No posts</div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white w-2/5 p-8 rounded shadow-lg">
            <Tabs defaultActiveKey="1">
              <TabPane tab="Post" key="1">
                <h2 className="text-xl font-bold mb-6">Create a new Post</h2>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-gray-700 font-bold">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={newPost.title}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-gray-700 font-bold">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="w-full p-2 border border-gray-300 rounded"
                    rows="4"
                    value={newPost.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Upload Image</Button>
                  </Upload>
                </div>
                <div className="flex justify-end">
                  <button
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-indigo-950 text-white px-4 py-2 rounded hover:bg-purple-400 transition-colors duration-300"
                    onClick={() => handleSavePost("postWithPicture")}
                  >
                    Save
                  </button>
                </div>
              </TabPane>
              <TabPane tab="Discussion" key="2">
                <h2 className="text-xl font-bold mb-6">Create a new Discussion</h2>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-gray-700 font-bold">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={newPost.title}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-gray-700 font-bold">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="w-full p-2 border border-gray-300 rounded"
                    rows="4"
                    value={newPost.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-indigo-950 text-white px-4 py-2 rounded hover:bg-purple-400 transition-colors duration-300"
                    onClick={() => handleSavePost("discussionWithText")}
                  >
                    Save
                  </button>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}

export default Forum;
