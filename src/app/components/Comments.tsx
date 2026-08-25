"use client";
import { useUser } from "@clerk/nextjs";
import ImageKit from "./ImageKit";
import Post from "./Post";
import { Post as PostType } from "@prisma/client";
import { useActionState, useEffect } from "react";
import { addComment } from "@/action";
import { socket } from "@/socket";

type CommentWithDetails = PostType & {
  user: { displayName: string | null; username: string; img: string | null };
  _count: { likes: number; rePosts: number; comments: number };
  likes: { id: number }[];
  rePosts: { id: number }[];
  saves: { id: number }[];
};

const Comments = ({
  comments,
  postId,
  username,
}: {
  comments: CommentWithDetails[];
  postId: number;
  username: string;
}) => {
  const { isLoaded, isSignedIn, user } = useUser();

  const [state, formAction, isPending] = useActionState(addComment, {
    success: false,
    error: false,
  });

  useEffect(() => {
    if (state.success) {
      socket.emit("sendNotification", {
        receiverUsername: username,
        data: {
          senderUsername: user?.firstName,
          type: "comment",
          link: `/${username}/status/${postId}`,
        },
      });
    }
  }, [state.success, username, user?.firstName, postId]);

  return (
    <div>
      <form
        className="flex items-center justify-between gap-4 p-4 "
        action={formAction}
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden">
          <ImageKit
            path={user?.imageUrl ?? "/general/general/avatar.png"}
            alt="avatar"
            w={100}
            h={100}
          />
        </div>
        <input type="number" name="postId" hidden readOnly value={postId} />
        <input type="string" name="username" hidden readOnly value={username} />
        <input
          type="text"
          name="desc"
          className="flex-1 bg-transparent outline-none p-2 text-xl"
          placeholder="Post your reply"
        />
        <button
          disabled={isPending}
          className="py-2 px-4 font-bold bg-white text-black rounded-full disabled:cursor-not-allowed disabled:bg-opacity-45"
        >
          {isPending ? "Replying" : "Reply"}
        </button>
      </form>
      {state.error && (
        <span className="text-red-500 p-4">Something want Wrong!</span>
      )}
      {comments?.map((comment) => (
        <div key={comment.id}>
          <Post type="comment" post={comment} />
        </div>
      ))}
    </div>
  );
};

export default Comments;
