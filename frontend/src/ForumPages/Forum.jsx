import React, { useState, useEffect } from "react";
import {
  List,
  Backpack,
  Heart,
  Briefcase,
  MoreHorizontal,
  Heart as HeartIcon,
  MessageCircle as CommentIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  doc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { auth, db, storage } from "../config/firebase-config";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';

function Forum() {
  const [user, loading, error] = useAuthState(auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", description: "" });
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [downloadURL, setDownloadURL] = useState(null);
  const [imgFile, setImgFile] = useState(null);

  const navigate = useNavigate();

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
        imageURL: imageURL || "", // Add image URL to the post if it exists
        likes: 0,
        comments: [],
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleSavePost = async () => {
    if (!newPost.title || !newPost.description) {
      message.error("Title and Description are required!");
      return;
    }

    if (imgFile) {
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
    const unsubscribe = onSnapshot(q, (qSnapShot) => {
      const posts = [];
      qSnapShot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      setPosts(posts);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewPost((prev) => ({ ...prev, [id]: value }));
  };

  const handlePostClick = (postId) => {
    navigate(`/forum/post/${postId}`);
  };

  const handleDropdownToggle = (postId) => {
    setDropdownOpen(dropdownOpen === postId ? null : postId);
  };

  const uploadProps = {
    beforeUpload: (file) => {
     setImgFile(file);
      return false; // Prevent automatic upload
    },
    onRemove: () => {
      setDownloadURL(null);
      setUploadError(null);
      setImgFile(null)
    },
  };

  return (
    <div className="relative pt-10 pb-32 h-screen overflow-y-auto">
      <div className="flex flex-col items-center mb-10">
        <h2 className="font-extrabold text-3xl text-indigo-950 mb-3">
          Public Forum
        </h2>
        <h2 className="font-semibold text-lg text-purple-400 mb-10">
          Join the conversation to connect with the community!
        </h2>
      </div>
      <div
        className={`flex flex-col justify-center items-center ${
          isModalOpen ? "blur-sm" : ""
        }`}
      >
        <div className="w-1/4 pr-6">
          <button
            className="w-full bg-indigo-950 text-white px-4 py-2 rounded mb-6 hover:bg-purple-400 transition-colors duration-300"
            onClick={handleOpenModal}
          >
            Create a New Discussion
          </button>
        </div>

        <div className="w-3/4">
          <div className="space-y-8">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="w-full bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md relative cursor-pointer"
                  onClick={() => handlePostClick(post.id)}
                >
                  <button
                    className="absolute top-2 right-2 p-2 text-gray-600 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropdownToggle(post.id);
                    }}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  {dropdownOpen === post.id && (
                    <div className="absolute top-10 right-2 bg-white border border-gray-300 shadow-lg rounded p-2 z-10">
                      <div className="flex items-center text-red-600">
                        <MoreHorizontal className="w-4 h-4 mr-2" />
                        <span>Report</span>
                      </div>
                    </div>
                  )}
                  <h2 className="font-bold text-xl text-indigo-950 mb-2">
                    {post.title}
                  </h2>
                  <div className="w-[400px]  ">
                    <img src={post?.imageURL} className="w-full" alt="" />
                  </div>
                  <p className="text-gray-800 mb-4 font-semibold">{post.desc}</p>
                  <div className="text-gray-600 mb-4">
                    <p className="text-sm font-medium text-slate-900">
                      Posted by: {post.displayName}
                    </p>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <HeartIcon className="w-4 h-4 mr-2 text-red-500" />
                    <span>{post.likes || 0}</span>
                    <CommentIcon className="w-4 h-4 ml-4 mr-2 text-blue-500" />
                    <span>{(post.comments || []).length}</span>
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
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-4">
              Create a New Discussion
            </h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter discussion title"
                value={newPost.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter discussion description"
                rows="4"
                value={newPost.description}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Image <small className="text-red-700">(Optional)</small></label>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
              {uploadError && (
                <p className="error text-red-800">{uploadError}</p>
              )}
              {/* {imgFile && (
                <Button
                  className="mt-2"
                  onClick={() => handleUpload(imgFile)}
                >
                  Upload
                </Button>
              )} */}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-300"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className="bg-indigo-950 text-white px-4 py-2 rounded hover:bg-purple-400 transition-colors duration-300"
                onClick={handleSavePost}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Forum;
