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
import { auth, db } from "../config/firebase-config";
import { useAuthState } from "react-firebase-hooks/auth";

function Forum() {
  const [user, loading, error] = useAuthState(auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", description: "" });
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const navigate = useNavigate();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const addForumPostToDB = async () => {
    try {
      await addDoc(collection(db, "forumPosts"), {
        uid: user.uid,
        title: newPost.title,
        desc: newPost.description,
        likes: 0,
        comments: [],
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleSavePost = () => {
    if (newPost.title && newPost.description) {
      addForumPostToDB();
      handleCloseModal();
      setNewPost({ title: "", description: "" });
    }
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

  return (
    <div className="relative mb-24 pb-32   overflow-y-auto h-screen">
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
        {/* Sidebar */}
        <div className="w-1/4 pr-6">
          <button
            className="w-full bg-indigo-950 text-white px-4 py-2 rounded mb-6 hover:bg-purple-400 transition-colors duration-300"
            onClick={handleOpenModal}
          >
            Create a New Discussion
          </button>
          {/* Sidebar options can be uncommented if needed */}
          {/* <div className='space-y-4'>
            <div className='flex items-center cursor-pointer hover:text-purple-400 transition-colors duration-300'>
              <List className='w-5 h-5 mr-5 text-red-500' />
              <h3 className='font-semibold'>All Discussions</h3>
            </div>
            <div className='flex items-center cursor-pointer hover:text-purple-400 transition-colors duration-300'>
              <Backpack className='w-5 h-5 mr-5 text-yellow-600' />
              <h3 className='font-semibold text-base'>Student Circle</h3>
            </div>
            <div className='flex items-center cursor-pointer hover:text-purple-400 transition-colors duration-300'>
              <Heart className='w-5 h-5 mr-5 text-green-600' />
              <h3 className='font-semibold text-base'>Chronic Illness Support Group</h3>
            </div>
            <div className='flex items-center cursor-pointer hover:text-purple-400 transition-colors duration-300'>
              <Briefcase className='w-5 h-5 mr-5 text-purple-800' />
              <h3 className='font-semibold text-base'>Workplace Wellness</h3>
            </div>
          </div> */}
        </div>

        {/* Main Content */}
        <div className="w-3/4">
          <div className="space-y-8">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="w-full bg-gray-100 p-6 rounded shadow-md relative cursor-pointer"
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
                  <p className="text-gray-700 mb-4">{post.desc}</p>
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

      {/* Modal */}
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
