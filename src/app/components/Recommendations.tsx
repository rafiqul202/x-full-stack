import React from "react";
import ImageKit from "./ImageKit";
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";

const Recommendations = async () => {
  const { userId } = await auth();
  if (!userId) return;

  const followingId = await prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    select: { followerId: true },
  });
  const followedUserIds = followingId.map((f) => f.followerId);
  const friendRecommendations = await prisma.user.findMany({
    where: {
      id: { not: userId, notIn: followedUserIds },
      followings: { some: { followerId: { in: followedUserIds } } },
    },
    take: 4,
    select: { id: true, displayName: true, img: true, username: true },
  });
  // console.log("recommendations following data", friendRecommendations);
  return (
    <div className="p-4 rounded-2xl border-[1px] border-borderGray flex flex-col gap-4">
      {/* Image user card */}
      {friendRecommendations?.map((friend) => (
        <div className="flex items-center justify-between" key={friend.id}>
          {/* image and  user info */}
          <div className="flex items-center gap-2">
            <div className="relative rounded-full overflow-hidden w-10 h-10">
              <ImageKit
                path={friend?.img || "general/general/avatar.png"}
                alt={friend?.username }
                w={100}
                h={100}
              />
            </div>
            <div className="">
              <h1 className="text-md font-bold">{friend?.displayName ?? friend.username }</h1>
              <span className="text-textGray text-sm">@{friend?.username }</span>
            </div>
          </div>
          {/* button */}
          <button className="py-1 px-4 font-semibold bg-white text-black rounded-full">
            Follow
          </button>
        </div>
      ))}
    </div>
  );
};

export default Recommendations;
