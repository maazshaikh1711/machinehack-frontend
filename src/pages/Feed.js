import React, { useState, useEffect } from "react";
import axios from "axios";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ caption: "", image: null });
  const [newComment, setNewComment] = useState({});

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/v1/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("=====>", response.data)
      const postsData = response.data;

      // Fetch comments for each post after fetching posts
      const postsWithComments = await Promise.all(
        postsData.map(async (post) => {
          const commentsResponse = await axios.get(
            `http://localhost:5000/api/v1/comments/${post._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          return { ...post, comments: commentsResponse.data };
        })
      );

      setPosts(postsWithComments);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/v1/comments/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, comments: response.data } : post
        )
      );
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreation = async (e) => {
    
    e.preventDefault();
    // const formData = new FormData();
    // formData.append("caption", newPost.caption);
    // if (newPost.image) formData.append("image", newPost.image);
    // for (let [key, value] of formData.entries()) {
        //     console.log(key, value);  // Log each entry in the FormData
        // }
        
        // const caption = formData?.entries()?.['caption']; // Text input
        // const file = document.getElementById('file')?.files[0]; // File input
        
        const postData = {
            caption: newPost.caption?newPost.caption:null,
            file: newPost.image?newPost.image:null
        };
        console.log("---------", postData);
    
    try {
        const token = localStorage.getItem("token");
        axios.post(
            'http://localhost:5000/api/v1/posts',
            postData,
            { headers: { Authorization: `Bearer ${token}` } } // Headers
        )
        .then(res => {console.log('Post Success:', res)
            setNewPost({ caption: "", image: null });
            fetchPosts(); // Refresh posts
        })
        .catch(err => console.error('Post Error:', err.response || err));
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const content = newComment[postId];
    if (!content) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/v1/comments/${postId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment({ ...newComment, [postId]: "" });
    //   fetchComments(postId); // Refresh comments for that post
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <div>
      <h1>Feed</h1>
      {/* Post Creation Form */}
      <form onSubmit={handlePostCreation}>
        <input
          type="text"
          placeholder="Enter caption"
          value={newPost.caption}
          onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
        />
        <input
          type="file"
          onChange={(e) =>
            setNewPost({ ...newPost, image: e.target.files[0] })
          }
        />
        <button type="submit">Create Post</button>
      </form>

      {/* Display Posts */}
      <div>
        {posts.map((post) => (
          <div key={post._id} style={{ border: "1px solid #ccc", margin: "10px" }}>
            <h3>{post.caption}</h3>
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                style={{ width: "200px", height: "auto" }}
              />
            )}
            <p>By: {post.user.username}</p>

            {/* Display Comments and Comments */}
            <div>
              <h4>Comments</h4>
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment._id}>
                    <strong>{comment.user.username}:</strong> {comment.content}
                  </div>
                ))
              ) : (
                <p>No comments yet.</p>
              )}

              {/* Comment Input */}
              <input
                type="text"
                value={newComment[post._id] || ""}
                onChange={(e) =>
                  setNewComment({ ...newComment, [post._id]: e.target.value })
                }
                placeholder="Add a comment..."
              />
              <button onClick={() => handleCommentSubmit(post._id)}>
                Post Comment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
