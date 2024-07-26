import React, { useState } from 'react';
import { Heart as HeartIcon, MessageCircle as CommentIcon } from 'lucide-react';

function PostPage() {
  const [post, setPost] = useState({
    title: 'Post Title',
    description: 'This is a detailed description of the post content. It provides a comprehensive view of the discussion topic.',
    likes: 12,
    likedByUser: false, // Track if the post is liked by the user
    comments: [
      { id: 1, username: 'User1', text: 'Great post!' },
      { id: 2, username: 'User2', text: 'Very informative, thanks!' },
      // Add more comments here to test scrolling
    ],
  });
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    setPost(prev => ({
      ...prev,
      likes: prev.likedByUser ? prev.likes - 1 : prev.likes + 1,
      likedByUser: !prev.likedByUser,
    }));
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handlePostComment = () => {
    if (newComment.trim()) {
      setPost(prev => ({
        ...prev,
        comments: [...prev.comments, { id: Date.now(), username: 'CurrentUser', text: newComment }]
      }));
      setNewComment('');
    }
  };

  return (
    <div className='mx-14 my-10 pb-10'>
      <div className='w-full bg-gray-100 p-6 rounded shadow-md'>
        <h1 className='font-bold text-3xl text-indigo-950 mb-4'>{post.title}</h1>
        <p className='text-gray-700 mb-6'>{post.description}</p>
        <button
          className={`px-4 py-2 rounded transition-colors duration-300 ${post.likedByUser ? 'text-white bg-red-500' : 'bg-indigo-950 text-white hover:bg-orange-400'}`}
          onClick={handleLike}
        >
          <HeartIcon className={`w-5 h-5 inline-block mr-2 ${post.likedByUser ? 'text-white' : 'text-gray-700'}`} />
          {post.likedByUser ? 'Liked' : 'Like'} ({post.likes})
        </button>
      </div>

      <div className='mt-8'>
        <div className='bg-gray-100 p-6 rounded shadow-md'>
          <h2 className='font-semibold text-xl text-indigo-950 mb-4'>
            Comments ({post.comments.length})
          </h2>
          <div className='max-h-[300px] overflow-y-auto space-y-4 mb-4'>
            {post.comments.map(comment => (
              <div key={comment.id} className='bg-white p-4 rounded shadow-sm'>
                <p className='font-semibold text-gray-800'>{comment.username}:</p>
                <p className='text-gray-700'>{comment.text}</p>
              </div>
            ))}
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
              className='bg-indigo-950 text-white px-4 py-2 rounded hover:bg-orange-400 transition-colors duration-300'
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
