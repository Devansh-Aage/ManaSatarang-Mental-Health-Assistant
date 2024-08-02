import React, { useRef, useState, useEffect } from 'react';
import { Heart as HeartIcon, MessageCircle as CommentIcon } from 'lucide-react';
import { db, auth } from '../config/firebase-config';
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState({
    title: '',
    description: '',
    likes: 0,
    likedByUser: false,
    comments: [], // Ensure comments is always initialized as an array
    author: '' // New field for author's username
  });
  const [newComment, setNewComment] = useState('');
  const commentsEndRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(db, 'forumPosts', postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();
        setPost({
          title: postData.title || '',
          description: postData.desc || '',
          likes: postData.likes || 0,
          likedByUser: postData.likedByUser || false,
          comments: postData.comments || [], 
          displayName: postData.displayName || 'Unknown Author' // Set author information
        });
      } else {
        console.log('No such document!');
      }
    };

    fetchPost();
  }, [postId]);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [post.comments]);

  const handleLike = async () => {
    const postRef = doc(db, 'forumPosts', postId);

    try {
      await updateDoc(postRef, {
        likes: post.likedByUser ? increment(-1) : increment(1),
        likedByUser: !post.likedByUser,
      });

      setPost(prev => ({
        ...prev,
        likes: prev.likedByUser ? prev.likes - 1 : prev.likes + 1,
        likedByUser: !prev.likedByUser,
      }));
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handlePostComment = async () => {
    if (newComment.trim()) {
      const postRef = doc(db, 'forumPosts', postId);
      const user = auth.currentUser; // Get the currently logged-in user

      if (user) {
        const newCommentObj = {
          id: Date.now(),
          username: user.displayName || 'Anonymous', // Use the display name of the logged-in user
          text: newComment,
        };

        try {
          await updateDoc(postRef, {
            comments: arrayUnion(newCommentObj),
          });

          setPost(prev => ({
            ...prev,
            comments: prev.comments ? [...prev.comments, newCommentObj] : [newCommentObj],
          }));
          setNewComment('');
        } catch (error) {
          console.error('Error updating document: ', error);
        }
      } else {
        console.log('User is not logged in');
      }
    }
  };

  return (
    <div className='w-full px-5 h-screen overflow-y-auto py-10'>
      <div className='w-full bg-gray-100 p-6 rounded shadow-md'>
        <h1 className='font-bold text-3xl text-indigo-950 mb-2'>{post.title}</h1>
        
        {/* Posted by section */}
        <p className='text-gray-600 mb-4'>
          Posted by: <span className='font-semibold'>{post.displayName}</span>
        </p>
        
        {/* White container for post description */}
        <div className='bg-white p-6 rounded shadow-md mb-6'>
          <p className='text-gray-700'>{post.description}</p>
        </div>
        
        <button
          className={`px-4 py-2 rounded transition-colors duration-300 ${post.likedByUser ? 'text-white bg-red-500' : 'bg-indigo-950 text-white hover:bg-purple-400'}`}
          onClick={handleLike}
        >
          <HeartIcon className={`w-5 h-5 inline-block mr-2 ${post.likedByUser ? 'text-white' : 'text-gray-700'}`} />
          {post.likedByUser ? 'Liked' : 'Like'} ({post.likes})
        </button>
      </div>

      <div className='mt-8'>
        <div className='bg-gray-100 p-6 rounded shadow-md'>
          <h2 className='font-semibold text-xl text-indigo-950 mb-4'>
            Comments ({post.comments ? post.comments.length : 0})
          </h2>
          <div className='max-h-[200px] overflow-y-auto space-y-4 mb-4 h-[210px]'>
            {post.comments && post.comments.map(comment => (
              <div key={comment.id} className='bg-white p-4 rounded shadow-sm'>
                <p className='font-semibold text-gray-800'>{comment.username}:</p>
                <p className='text-gray-700'>{comment.text}</p>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>
          <div className='flex flex-col'>
            <textarea
              className='w-full p-2 border border-gray-300 rounded mb-2'
              placeholder='Write a comment...'
              value={newComment}
              onChange={handleCommentChange}
              rows='3'
            />
            <button
              className='bg-indigo-950 text-white px-4 py-2 rounded hover:bg-purple-400 transition-colors duration-300'
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