"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import z from "zod";
import { revalidatePath } from "next/cache";

export const likePost = async (postId: number) => {
  // console.log("hello like Post !");
  const { userId } = await auth();
  if (!userId) return;

  const existingLike = await prisma.like.findFirst({
    where: {
      userId: userId,
      postId: postId,
    },
  });
  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
  } else {
    await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });
  }
};

export const rePost = async (postId: number) => {
  const { userId } = await auth();
  if (!userId) return;

  const existingRePost = await prisma.post.findFirst({
    where: {
      userId: userId,
      rePostId: postId,
    },
  });

  if (existingRePost) {
    await prisma.post.delete({ where: { id: existingRePost.id } });
  } else {
    await prisma.post.create({
      data: {
        userId,
        rePostId: postId,
      },
    });
  }
};
export const savePost = async (postId: number) => {
  const { userId } = await auth();

  if (!userId) return;

  const existingSavedPost = await prisma.savedPosts.findFirst({
    where: {
      userId: userId,
      postId: postId,
    },
  });

  if (existingSavedPost) {
    await prisma.savedPosts.delete({
      where: { id: existingSavedPost.id },
    });
  } else {
    await prisma.savedPosts.create({
      data: { userId, postId },
    });
  }
};

export const addComment = async (
  prevState: { success: boolean; error: boolean },
  formData: FormData,
) => {
  const { userId } = await auth();
  if (!userId) return { success: false, error: true };

  const postId = formData.get("postId");
  const username = formData.get("username");
  const desc = formData.get("desc");
  const comment = z.object({
    parentPostId: z.number(),
    desc: z.string().max(150),
  });

  const validatedFields = comment.safeParse({
    parentPostId: Number(postId),
    desc,
  });

  if (!validatedFields.success) {
    // console.log(validatedFields.error.flatten().fieldErrors);
    return { success: false, error: true };
  }
  try {
    await prisma.post.create({
      data: {
        ...validatedFields.data,
        userId,
      },
    });
    revalidatePath(`/${username}/status/${postId}`);
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

export const followUser = async (targetUserId: string) => {
  const { userId } = await auth();
  if (!userId) return;

  const existingFollow = await prisma.follow.findFirst({ where: { followerId: userId, followingId: targetUserId } });

  if (existingFollow) {
    await prisma.follow.delete({where:{id:existingFollow.id}})
  } else {
    await prisma.follow.create({
      data: {
        followerId: userId,
        followingId:targetUserId
    }})
  }

}

