import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const userProfileId = searchParams.get("user");
  const page = searchParams.get("cursor");
  const LIMIT = 3;

  const { userId } = await auth();

  if (!userId) return;

  const whereCondition =
    userProfileId !== "undefined"
      ? { parentPostId: null, userId: userProfileId as string }
      : {
          parentPostId: null,
          userId: {
            in: [
              userId,
              ...(
                await prisma.follow.findMany({
                  where: { followerId: userId },
                  select: { followingId: true },
                })
              ).map((follow) => follow.followingId),
            ],
          },
        };

  const postIncludeQuery = {
    user: { select: { displayName: true, username: true, img: true } },
    _count: { select: { likes: true, rePosts: true, comments: true } },
    likes: { where: { userId: userId }, select: { id: true } },
    rePosts: { where: { userId: userId }, select: { id: true } },
    saves: { where: { userId: userId }, select: { id: true } },
  };

  const posts = await prisma.post.findMany({
    where: whereCondition,

    include: {
      rePost: {
        include: postIncludeQuery,
      },
      ...postIncludeQuery,
    },
    take: LIMIT,
    skip: (Number(page) - 1) * LIMIT,
    orderBy: { createdAt: "desc" },
  });

  const totalPosts = await prisma.post.count({ where: whereCondition });

  const hasMore = Number(page) * LIMIT < totalPosts;

  // testing infinite scroll latency

  // await new Promise((resolve) => setTimeout(resolve, 3000));

  return Response.json({ posts, hasMore });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Process your data here (e.g., save to a database)
    console.log("Received data:", body);

    try {
      const upload = body.uploadResponse ?? body;
      let img: string | undefined;
      let imgHeight: number | undefined;
      let video: string | undefined;
      if (upload.fileType === "image") {
        img = upload.filePath ?? upload.url;
        imgHeight = upload.height;
      } else if (upload.fileType === "video") {
        video = upload.filePath ?? upload.url;
      }
      await prisma.post.create({
        data: {
          desc: body.desc,
          userId: String(body.userId),
          isSensitive: body.isSensitive,
          img,
          imgHeight,
          video,
        },
      });
 
    } catch (error) {
      console.log(error);
    }

    return NextResponse.json(
      { message: "Success", data: body },
      { status: 201 },
    );
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
