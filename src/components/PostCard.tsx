import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

type Post = {
  DonationID: number | string;
  userID: number | string;
  title: string;
  description: string;
  // add any other fields you use in the card here
};

const PostCard = ({ post }: { post: Post }) => {
  const currentUserID = localStorage.getItem("userID"); // If you have an auth context, prefer using that

  const isOwner =
    currentUserID !== null &&
    String(post.userID).trim() === String(currentUserID).trim();

  return (
    <div className="post-card relative">
      <h3>{post.title}</h3>
      <p>{post.description}</p>
      {isOwner && (
        <Link
          to={`/edit-post/${post.DonationID}`}
          className="absolute bottom-3 right-3"
          aria-label="Edit this post"
        >
          <Button size="sm" variant="secondary" className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
      )}
    </div>
  );
};

export default PostCard;