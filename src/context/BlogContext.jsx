import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

const BlogContext = createContext();

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load blog posts from Firebase
  useEffect(() => {
    const postsRef = ref(realtimeDb, 'blogPosts');
    
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsArray = Object.entries(data).map(([id, post]) => ({
          id,
          ...post
        })).sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first
        setPosts(postsArray);
      } else {
        setPosts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Add new blog post
  const addPost = async (postData) => {
    try {
      const postsRef = ref(realtimeDb, 'blogPosts');
      await push(postsRef, {
        ...postData,
        createdAt: Date.now(),
        views: 0,
        published: true
      });
      return true;
    } catch (error) {
      console.error('Error adding post:', error);
      return false;
    }
  };

  // Update blog post
  const updatePost = async (postId, updates) => {
    try {
      const postRef = ref(realtimeDb, `blogPosts/${postId}`);
      const currentPost = posts.find(p => p.id === postId);
      await set(postRef, {
        ...currentPost,
        ...updates,
        updatedAt: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      return false;
    }
  };

  // Delete blog post
  const deletePost = async (postId) => {
    try {
      const postRef = ref(realtimeDb, `blogPosts/${postId}`);
      await remove(postRef);
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  };

  // Toggle post visibility
  const togglePostVisibility = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      return updatePost(postId, { published: !post.published });
    }
    return false;
  };

  // Increment view count
  const incrementViews = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      return updatePost(postId, { views: (post.views || 0) + 1 });
    }
    return false;
  };

  const value = {
    posts,
    loading,
    addPost,
    updatePost,
    deletePost,
    togglePostVisibility,
    incrementViews
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};