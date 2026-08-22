import Comments from "@/app/components/Comments";
import ImageKit from "@/app/components/ImageKit";
import Post from "@/app/components/Post";
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

const StatusPage = async ({
  params,
}: {
  params: Promise<{ username: string; postId: string }>;
}) => {
  const { userId } = await auth();
  const postId = (await params).postId;

  if (!userId) return;
  const post = await prisma.post.findFirst({
    where: { id: Number(postId) },
    include: {
      user: { select: { displayName: true, username: true, img: true } },
      _count: { select: { likes: true, rePosts: true, comments: true } },
      likes: { where: { userId: userId }, select: { id: true } },
      rePosts: { where: { userId: userId }, select: { id: true } },
      saves: { where: { userId: userId }, select: { id: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { displayName: true, username: true, img: true } },
          _count: { select: { likes: true, rePosts: true, comments: true } },
          likes: { where: { userId: userId }, select: { id: true } },
          rePosts: { where: { userId: userId }, select: { id: true } },
          saves: { where: { userId: userId }, select: { id: true } },
        },
      },
    },
  });

  if (!post) return notFound();

  return (
    <div>
      <div className="flex items-center gap-8 sticky top-0 backdrop-blur-md p-4 z-10 bg-black bg-opacity-60">
        <Link href={"/"}>
          <ImageKit path="icons/icons/back.svg" alt="back" w={21} h={21} />
        </Link>
        <h1 className="font-bold text-md">Post</h1>
      </div>
      <Post type="status" post={post} />
      <Comments
        comments={post.comments}
        postId={post.id}
        username={post.user.username}
      />
    </div>
  );
};

export default StatusPage;
