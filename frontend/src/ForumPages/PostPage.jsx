import React, { useRef, useState, useEffect } from "react";
import { Heart as HeartIcon, MessageCircle as CommentIcon } from "lucide-react";
import { db, auth } from "../config/firebase-config";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { useLocation, useParams } from "react-router-dom";
import { translateText } from "../utils";
import Skeleton from 'react-loading-skeleton';

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState({
    title: "",
    description: "",
    likes: 0,
    likedByUser: false,
    comments: [],
    author: "",
  });
  const [newComment, setNewComment] = useState("");
  const [translatedPost, setTranslatedPost] = useState({
    title: "",
    description: "",
    comments: [],
  });
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const commentsEndRef = useRef(null);

  const translatePost = async (postData) => {
    try {
      const translatedTitle = await translateText(postData.title, language);
      const translatedDescription = await translateText(
        postData.desc,
        language
      );
      const translatedComments = await Promise.all(
        postData.comments.map(async (comment) => {
          const translatedText = await translateText(comment.text, language);
          return { ...comment, text: translatedText };
        })
      );

      setTranslatedPost({
        title: translatedTitle,
        description: translatedDescription,
        comments: translatedComments,
      });
    } catch (error) {
      console.error("Error translating post: ", error);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const postRef = doc(db, "forumPosts", postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();
        setPost({
          title: postData.title || "",
          description: postData.desc || "",
          likes: postData.likes || 0,
          likedByUser: postData.likedByUser || false,
          comments: postData.comments || [],
          displayName: postData.displayName || "Unknown Author",
          imageURL: postData?.imageURL,
        });
        translatePost(postData);
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    };

    fetchPost();
  }, [postId, language]);

  const handleLike = async () => {
    const postRef = doc(db, "forumPosts", postId);

    try {
      await updateDoc(postRef, {
        likes: post.likedByUser ? increment(-1) : increment(1),
        likedByUser: !post.likedByUser,
      });

      setPost((prev) => ({
        ...prev,
        likes: prev.likedByUser ? prev.likes - 1 : prev.likes + 1,
        likedByUser: !prev.likedByUser,
      }));
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handlePostComment = async () => {
    if (newComment.trim()) {
      const postRef = doc(db, "forumPosts", postId);
      const user = auth.currentUser;

      if (user) {
        const newCommentObj = {
          id: Date.now(),
          username: user.displayName || "Anonymous",
          text: newComment,
        };

        try {
          await updateDoc(postRef, {
            comments: arrayUnion(newCommentObj),
          });

          setPost((prev) => ({
            ...prev,
            comments: prev.comments
              ? [...prev.comments, newCommentObj]
              : [newCommentObj],
          }));
          translatePost({
            ...post,
            comments: [...post.comments, newCommentObj],
          });
          setNewComment("");
        } catch (error) {
          console.error("Error updating document: ", error);
        }
      } else {
        console.log("User is not logged in");
      }
    }
  };

  return (
    <div className="w-full px-5 h-screen overflow-y-auto py-10">
      <div className="w-full bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md">
        {loading ? (
          <Skeleton height={50} width="80%" className="mb-4" />
        ) : (
          <h1 className="font-bold text-3xl text-indigo-950 mb-2">
            {translatedPost.title}
          </h1>
        )}

        <div className="bg-transparent rounded mb-6">
          <div className="w-[400px]">
            <img src={post?.imageURL} className="w-full" alt="" />
          </div>
          {loading ? (
            <Skeleton height={20} width="90%" className="mt-5" />
          ) : (
            <p className="text-gray-700 mt-5">{translatedPost.description}</p>
          )}
        </div>
        <p className="text-gray-600 mb-4">
          Posted by: <span className="font-semibold">{post.displayName}</span>
        </p>
        <button
          className={`px-4 py-2 rounded transition-colors duration-300 ${
            post.likedByUser
              ? "text-white bg-red-500"
              : "bg-indigo-950 text-white hover:bg-red-500"
          }`}
          onClick={handleLike}
        >
          <HeartIcon
            className={`w-5 h-5 inline-block mr-2 ${
              post.likedByUser ? "text-white" : "text-gray-700"
            }`}
          />
          {post.likedByUser ? "Liked" : "Like"} ({post.likes})
        </button>
      </div>

      <div className="mt-8">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded shadow-md">
          {loading ? (
            <Skeleton height={30} width="60%" className="mb-4" />
          ) : (
            <h2 className="font-semibold text-xl text-indigo-950 mb-4">
              Comments ({translatedPost.comments.length})
            </h2>
          )}
          <div className="max-h-[200px] overflow-y-auto space-y-4 mb-4 py-3 px-4">
            {loading ? (
              <Skeleton count={3} height={40} width="100%" />
            ) : (
              translatedPost.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white p-4 rounded shadow-sm"
                >
                  <p className="font-semibold text-gray-800">
                    {comment.username}:
                  </p>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex flex-col">
            <textarea
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Write a comment..."
              value={newComment}
              onChange={handleCommentChange}
              rows="1"
            />
            <button
              className="bg-indigo-950 text-white px-4 py-2 rounded hover:bg-purple-400 transition-colors duration-300"
              onClick={handlePostComment}
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostPage;
