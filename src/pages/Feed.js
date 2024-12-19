import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client"; // Import Socket.IO client
import "./Feed.css";
import Logout from "./Logout";
import { useLocation, useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000"); // Connect to the backend server

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ caption: "", image: null, imageName: "", imageSize: null, imageType: null,});
  const [newComment, setNewComment] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const username = location?.state?.username;

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/v1/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const response = await axios.get(
        `http://localhost:5000/api/v1/comments/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if token is not present
      return;
    }

    fetchPosts();

    // Listen for new posts via Socket.IO
    socket.on("newPost", (post) => {
      setPosts((prevPosts) => [post, ...prevPosts]);
    });

    // Listen for new comments via Socket.IO
    socket.on("newComment", ({ postId, comment }) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...(post.comments || []), comment] }
            : post
        )
      );
    });

    // Cleanup the socket connection when component unmounts
    return () => {
      socket.off("newPost");
      socket.off("newComment");
    };
  }, [navigate]);

  const handleFileUpload = async() => {
    try{
      // Step 1: Get the pre-signed URL from the backend
      const response = await axios.post("http://localhost:5000/api/v1/posts/upload-s3-presign", {
        fileName: newPost.imageName,
        fileType: newPost.imageType,
      });

      const { url, key } = response.data;  // Destructure the pre-signed URL and key

      // Step 2: Upload the file to S3 using the pre-signed URL
      const uploadResponse = await axios.put(url, newPost.image, {
        headers: {
          "Content-Type": newPost.imageType, // The content type should match the file type
        },
      });

      // File uploaded successfully, you can now use the file URL (or key) to store in your database
      console.log("File uploaded successfully:", uploadResponse);

      return key;  // The key of the file uploaded to S3 (you can store this in your database)
    }
    catch (err) {
      throw new Error("File upload failed");
    }
  }

  const handlePostCreation = async (e) => {
    e.preventDefault();
    // const formData = new FormData();
    // formData.append("caption", newPost.caption);
    // if (newPost.image) formData.append("image", newPost.image);
    // for (let [key, value] of formData.entries()) {
    //         console.log(key, value);  // Log each entry in the FormData
    //     }
    // const postData = {
    //   caption: newPost.caption ? newPost.caption : null,
    //   imageUrl: newPost.image ? newPost.image : null,
    // };
    // console.log("----------------", postData)

    try {

      const imageKey = await handleFileUpload();
      const postData = {
        caption: newPost.caption,
        imageKey
      };

      const token = localStorage.getItem("token");
      axios
        .post("http://localhost:5000/api/v1/posts", postData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setNewPost({ caption: "", image: null, imageName: "", imageSize: null, imageType: null});
          fetchPosts(); // Refresh posts
        })
        .catch((err) => console.error("Post Error:", err.response || err));
    } catch (error) {
      console.error("Error creating post:", error);
    }
    e.target.reset();
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
      fetchComments(postId); // Refresh comments for that post
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <div className="feed-container">
      <h1>ADD POST</h1>

      {/* Display logged in username at the top-right corner */}
      <div className="username-display">
        Logged in as: <strong>{username}</strong>
      </div>
      <div className="logout">
        <Logout />
      </div>

      {/* Post Creation Form */}
      <form onSubmit={handlePostCreation} className="create-post-form">
        <input
          type="text"
          placeholder="Enter caption"
          value={newPost.caption}
          onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
        />
        <input
          type="file"
          defaultValue=""
          onChange={(e) =>{
            const file = e.target.files[0];
            if (file) {
              const validFileTypes = ["image/jpeg", "image/png"];
              const maxFileSize = 5 * 1024 * 1024; // 5MB

              if (!validFileTypes.includes(file.type)) {
                alert("Invalid file type! Please upload an image file.");
                e.target.value = ""; // Reset the file input field
                setNewPost({ ...newPost, image: null, imageName: "", imageSize: null, imageType: null });
                return;
              }

              else if (file.size > maxFileSize) {
                alert("File size must be less than 5MB.");
                e.target.value = ""; // Reset the file input field
                setNewPost({ ...newPost, image: null, imageName: "", imageSize: null, imageType: null });
                return;
              }

              else{
                setNewPost({ ...newPost, image: file, imageName: file.name, imageSize: file.size, imageType: file.type });
              }  
            }
          }
          }
        />
        <button type="submit">Create Post</button>
      </form>

      <h1>FEED</h1>
      {/* Display Posts */}
      <div>
        {posts.map((post) => (
          <div key={post._id} className="post-card">
            <h1 className="post-user-info">By: {post.user.username}</h1>
            {post.imageKey.replace(`uploads/`, '') !=="" && (
              <img src={post.imageUrl} alt="Post" className="post-image" />
            )}
            <p>{post.caption}</p>

            {/* Display Comments and Comment Input */}
            <div className="comment-section">
              <h4>Comments</h4>
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment._id} className="comment-item">
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
                className="comment-input"
                placeholder="Add a comment..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // Prevent default form submission
                    handleCommentSubmit(post._id);
                  }
                }}
              />
              <button
                className="comment-button"
                onClick={() => handleCommentSubmit(post._id)}
              >
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
