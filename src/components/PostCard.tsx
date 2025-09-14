import React from "react";
import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  const currentUserID = localStorage.getItem("userID"); // Or use context/auth

  return (
    <div className="post-card">
      <h3>{post.title}</h3>
      <p>{post.description}</p>
      {/* ...other post details... */}
      {String(post.userID) === currentUserID && (
        <Link to={`/edit-post/${post.DonationID}`}>
          <button className="edit-btn">Edit</button>
        </Link>
      )}
    </div>
  );
};

export default PostCard;