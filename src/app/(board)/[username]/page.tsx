import Feed from "@/app/components/Feed";
import FollowButton from "@/app/components/FollowButton";
import ImageKit from "@/app/components/ImageKit";
import { prisma } from "@/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

const UserPage = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const { userId } = await auth();
  const ClerkUser = await currentUser();
  const user = await prisma.user.findUnique({
    where: { username: (await params).username },
    include: {
      _count: { select: { followers: true, followings: true } },
      followings: userId ? { where: { followerId: userId } } : undefined,
    },
  });

  if (!user) return notFound();
  return (
    <div>
      {/* profile title  */}
      <div className="flex items-center gap-8 sticky top-0 backdrop-blur-md p-4 z-10 bg-black bg-opacity-60">
        <Link href={"/"}>
          <ImageKit path="icons/icons/back.svg" alt="back" w={21} h={21} />
        </Link>
        <h1 className="font-bold text-md">{user?.displayName}</h1>
      </div>
      {/* info */}
      <div>
        {/* cover and avatar container */}
        <div className="relative w-full">
          {/* cover */}
          <div className="w-full aspect-[3/1] relative">
            <ImageKit
              path={user?.cover || "/general/general/cover.jpg"}
              alt="cover"
              w={600}
              h={200}
            />
          </div>
          {/* avatar */}
          <div className="w-1/6 aspect-square rounded-full overflow-hidden border-4 border-gray-400 bg-gray-300 absolute left-4 -translate-y-1/2 cursor-pointer">
            <ImageKit path={ClerkUser?.imageUrl} alt="cover" w={100} h={100} />
          </div>
        </div>
        <div className="flex w-full items-center justify-end gap-2 p-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-full border-[1px] border-gray-500 cursor-pointer">
            <ImageKit path="icons/icons/more.svg" alt="more" w={20} h={20} />
          </div>
          <div className="w-9 h-9 flex items-center justify-center rounded-full border-[1px] border-gray-500 cursor-pointer">
            <ImageKit path="icons/icons/explore.svg" alt="more" w={20} h={20} />
          </div>
          <div className="w-9 h-9 flex items-center justify-center rounded-full border-[1px] border-gray-500 cursor-pointer">
            <ImageKit path="icons/icons/message.svg" alt="more" w={20} h={20} />
          </div>
          {user?.id && (
            <FollowButton
              userId={user?.id}
              isFollowed={!!user?.followings?.length}
            />
          )}
        </div>
        {/* USER DETAILS */}
        <div className="p-4 flex flex-col gap-2">
          {/* USERNAME & HANDLE */}
          <div className="">
            <h1 className="text-2xl font-bold">{user?.username}</h1>
            <span className="text-textGray text-sm">{user?.email}</span>
          </div>
          {user?.bio && <p>{user?.bio}</p>}
          {/* JOB & LOCATION & DATE */}
          <div className="flex gap-4 text-textGray text-[15px]">
            <div className="flex items-center gap-2">
              <ImageKit
                path="icons/icons/userLocation.svg"
                alt="location"
                w={20}
                h={20}
              />
              {user?.location && <span>{user?.location}</span>}
            </div>
            <div className="flex items-center gap-2">
              <ImageKit path="icons/icons/date.svg" alt="date" w={20} h={20} />
              <span>
                {new Date(user?.createdAt.toString()).toLocaleDateString(
                  "en-Us",
                  { month: "long", year: "numeric" },
                )}
              </span>
            </div>
          </div>
          {/* FOLLOWINGS & FOLLOWERS */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold">{user?._count?.followers}</span>
              <span className="text-textGray text-[15px]">Followers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{user?._count?.followings}</span>
              <span className="text-textGray text-[15px]">Followings</span>
            </div>
          </div>
        </div>
      </div>
      {/* feed */}
      <Feed userProfileId={user?.id} />
    </div>
  );
};

export default UserPage;
