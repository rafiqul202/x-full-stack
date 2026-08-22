import React from "react";
import ImageKit from "./ImageKit";
import Post from "./Post";
import { Post as PostType } from "@prisma/client";

type CommentWithDetails = PostType & {
  user: { displayName: string | null; username: string; img: string | null };
  _count: { likes: number; rePosts: number; comments: number };
  likes: { id: number }[];
  rePosts: { id: number }[];
  saves: { id: number }[];
};

const Comments = ({ comments, postId, username }: {
  comments: CommentWithDetails[],
  postId: number;
  username: string;
}) => {
  return (
    <div>
      <form className="flex items-center justify-between gap-4 p-4 ">
        <div className="relative w-9 h-9 rounded-full overflow-hidden">
          <ImageKit
            path="/general/general/avatar.png"
            alt="avatar"
            w={100}
            h={100}
          />
        </div>
        <input
          type="text"
          className="flex-1 bg-transparent outline-none p-2 text-xl"
          placeholder="Post your reply"
        />
        <button className="py-2 px-4 font-bold bg-white text-black rounded-full">
          Reply
        </button>
      </form>
      {
        comments?.map((comment) => (
          <div key={comment.id}>
            <Post type="comment" post={comment} />

          </div>
        ))
      }
    </div>
  );
};

export default Comments;
